# Full migration to VM 901 (split architecture)

**Automated helpers (run on each host after placing the dump / uploads archive):**

- **VM902:** `bash deploy/migration-exec-vm902.sh` — env: `POSTGRES_PASSWORD`, `ESTIO_PG_DUMP` (any path, e.g. under `/home/estiodb/backups/`)
- **VM901:** `bash deploy/migration-exec-vm901.sh` — requires configured `.env`; optional `ESTIO_UPLOADS_TGZ`, `ESTIO_UPLOADS_TAR_STRIP_COMPONENTS`, `ESTIO_PROD_COMPOSE_REL`
- Paths: see **`deploy/MIGRATION_PATHS.md`** (repo need not live under `/opt`).

This runbook moves **all application state** from a **source** environment (typically `docker-compose.prod.yml` on one host: Postgres + Redis + API + web + admin) to the **split** layout:

| VM   | Role |
|------|------|
| **902** | PostgreSQL only (`docker-compose.prod.postgres.yml`) |
| **901** | App tier: Redis + api + web + admin (`docker-compose.prod.split.yml`) |
| **900** | GPU media worker (FastAPI); `MEDIA_WORKER_URL` from 901 → 900 |

**What must move for “full site state”**

| Asset | Where it lives | Action |
|-------|----------------|--------|
| CMS, CRM, pages, services, media **metadata**, Studio job rows | PostgreSQL | Logical dump → restore on **902** |
| Uploaded files (images/videos under `/uploads/…`) | Docker volume **`estio_uploads`** on source | Copy files into **`estio_uploads`** on **901** |
| Ephemeral queues / caches | Redis on source | Usually **omit** (start fresh queues); optional `redis-dump` only if you must preserve BullMQ state |
| Comfy/worker **output** not under API uploads | Worker/Comfy host | Out of scope unless you also clone worker storage; Studio URLs in DB must still resolve |

**What does *not* need to match byte-for-byte**

- Redis: safe to empty on 901; in-flight jobs may need to be re-submitted.
- Old `media_generation_jobs` rows with **playback** pointing at worker-only paths: after cutover, ensure **`MEDIA_WORKER_*`** and **`MEDIA_JOB_VIEW_*`** on 901 match how you serve Comfy previews (see `deploy/MEDIA_WORKER.md`).

---

## 0. Prerequisites

- Repo clone on **901** at a fixed path (e.g. `/opt/estio-platform`).
- **902** running Postgres (`docker-compose.prod.postgres.yml` or equivalent), firewall: **5432** only from **901**.
- **900** worker reachable from **901** (`curl http://<900>:9000/health` from **901** host or from inside `api` after deploy).
- **Source** access: SSH + Docker on the current server; **sudo** to read Docker volumes.
- **Maintenance window** for DNS or reverse-proxy cutover if URLs change.

### Secrets and URLs

Copy `JWT_SECRET`, `ADMIN_PASSWORD`, `PREVIEW_TOKEN`, `REVALIDATE_SECRET`, `DEEPSEEK_API_KEY`, and DB password from source **or** rotate them and plan admin re-login / preview link updates.

Set **`PUBLIC_FILE_BASE_URL`** and **`NEXT_PUBLIC_API_URL`** to the **final public API origin** browsers will use (e.g. `https://api.example.com`). If this differs from the source site, plan **URL rewrites** (see §7).

---

## 1. Freeze and back up the source (single-node)

On the **source** host (repo root, stack running):

```bash
# 1) Stop writes to the app (optional: maintenance mode at nginx / Cloudflare).
# 2) Postgres dump (password from source .env POSTGRES_PASSWORD or compose)
docker exec estio-platform-postgres-1 pg_dump -U estio -d estio -Fc -f /tmp/estio-pre-migration.dump

docker cp estio-platform-postgres-1:/tmp/estio-pre-migration.dump ./estio-pre-migration.dump

# 3) Note uploads volume mount path
docker volume inspect estio-platform_estio_uploads
# Mountpoint e.g. /var/lib/docker/volumes/estio-platform_estio_uploads/_data
```

Keep **`estio-pre-migration.dump`** and a **tar** of uploads (see §2) in a secure backup location (S3, off-box).

---

## 2. Copy the uploads volume (media files on disk)

**Option A — tar from source volume path**

```bash
# On SOURCE (replace MOUNTPOINT from docker volume inspect)
sudo tar -C /var/lib/docker/volumes/estio-platform_estio_uploads/_data -czf /tmp/estio-uploads.tgz .

scp /tmp/estio-uploads.tgz user@vm901:/tmp/
```

**Option B — docker run with volume mounted**

```bash
docker run --rm -v estio-platform_estio_uploads:/from:ro -v /tmp:/backup \
  alpine tar czf /backup/estio-uploads.tgz -C /from .
```

On **901**, **before** first `api` start with the target volume, or **stop** `api`, copy into the **new** volume’s `_data` directory (see §5), then start `api`.

---

## 3. Prepare VM 902 (Postgres)

1. Start Postgres on **902** per `docker-compose.prod.postgres.yml` (or your managed DB).
2. Create role/database **only if empty**; password must match what you will put in **`DATABASE_URL`** on 901.
3. **Do not** run the Estio app against 902 until after restore or migrations are aligned.

---

## 4. Restore database on 902

Transfer the dump to a machine that can reach **902:5432** (e.g. **901**).

```bash
# Restore into empty database (adjust host/user)
pg_restore -h <VM902_IP> -U estio -d estio --clean --if-exists --no-owner --verbose estio-pre-migration.dump
```

If `--clean` fails on first run (empty DB), omit `--clean` once:

```bash
pg_restore -h <VM902_IP> -U estio -d estio --no-owner --verbose estio-pre-migration.dump
```

Then apply schema updates if the repo is newer than the dump:

```bash
cd /opt/estio-platform
export DATABASE_URL='postgresql://estio:PASSWORD@<VM902_IP>:5432/estio?schema=public'
npm run db:migrate --workspace=api
# or: npx prisma migrate deploy (from apps/api with same DATABASE_URL)
```

---

## 5. Prepare VM 901 (app tier)

1. Clone repo, copy **`deploy/env.split.example`** → **`.env`**, set:
   - **`ESTIO_DEPLOY_MODE=split`**
   - **`DATABASE_URL`** → **902** (private IP/DNS; not `postgres` unless you use a custom route)
   - **`REDIS_URL=redis://redis:6379`**
   - **`MEDIA_WORKER_URL`** → **900** (or `http://host.docker.internal:9000` if tunnel on 901 host)
   - **`NEXT_PUBLIC_API_URL`**, **`PUBLIC_FILE_BASE_URL`**, **`NEXT_PUBLIC_WEB_URL`**, **`WEB_REVALIDATE_URL=http://web:3000`**, **`REVALIDATE_SECRET`**, preview tokens, DeepSeek, JWT, admin password — **match production intent**

2. **Populate uploads before serving traffic**

   - Create stack once to create the volume, or copy into named volume:

```bash
cd /opt/estio-platform
docker compose -f docker-compose.prod.split.yml up -d redis
# create volume only: 
docker compose -f docker-compose.prod.split.yml run --rm -v estio_uploads:/data alpine true
sudo tar xzf /tmp/estio-uploads.tgz -C /var/lib/docker/volumes/estio-platform_estio_uploads/_data
sudo chown -R root:root /var/lib/docker/volumes/estio-platform_estio_uploads/_data
```

   Adjust volume name if `COMPOSE_PROJECT_NAME` differs; use `docker volume ls | grep uploads`.

3. Build and start:

```bash
docker compose -f docker-compose.prod.split.yml up -d --build
```

4. **Prisma** inside API (if not done in §4):

```bash
docker compose -f docker-compose.prod.split.yml exec api npx prisma migrate deploy
```

---

## 6. Nginx / TLS on 901

Point **`deploy/nginx/estio.conf`** (or your host nginx) at **127.0.0.1:3000 / 3001 / 4000** on **901**. Reload nginx. See `deploy/SERVER_RUNBOOK.txt`.

---

## 7. If public URLs changed (domain / API host)

Rows in **`MediaAsset.publicUrl`** and JSON in CMS tables may contain absolute URLs (`https://old-api.example.com/uploads/...`).

If **`PUBLIC_FILE_BASE_URL`** on 901 differs from the source:

- **Preferred:** run a one-time SQL `UPDATE` to replace the old origin with the new one (test on a copy first), **or**
- Re-save affected assets in admin so URLs regenerate.

Example pattern (adjust domains):

```sql
UPDATE "MediaAsset"
SET "publicUrl" = replace("publicUrl", 'https://old-api.example.com', 'https://api.example.com')
WHERE "publicUrl" LIKE 'https://old-api.example.com%';
```

Repeat for any other tables/columns where you store full URLs (search dumps for `http`).

---

## 8. Verification (before DNS cutover)

On **901**:

```bash
bash deploy/verify-production.sh
bash deploy/diagnose-vm901.sh
```

From **901** host:

```bash
curl -sS http://127.0.0.1:4000/
curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:4000/uploads/<some-file-from-media-table>
```

In DB on **902**:

```sql
SELECT COUNT(*) FROM "MediaAsset";
SELECT COUNT(*) FROM media_generation_jobs;
SELECT COUNT(*) FROM "Page";
```

Log into **admin**, open **Media Library**, confirm thumbnails and file URLs load. Open **public site** locale routes (`/en`, `/ar`).

---

## 9. Cutover

1. Lower DNS TTL ahead of time.
2. Point **A/AAAA** or **CNAME** for web/API/admin hostnames to **901** (or Cloudflare origin).
3. Purge CDN cache if using Cloudflare.
4. Monitor API logs and nginx error logs.

---

## 10. Rollback

- Keep source dump and uploads tarball until smoke tests pass.
- If cutover fails: restore DNS to source; source stack should still be intact if you did not `docker compose down -v`.

---

## 11. Checklist summary

- [ ] `pg_dump` + off-site copy of dump  
- [ ] `tar` of `estio_uploads` + off-site copy  
- [ ] 902 Postgres running; restore + `prisma migrate deploy`  
- [ ] 901 `.env` with `DATABASE_URL` → 902, `ESTIO_DEPLOY_MODE=split`, public URLs + secrets  
- [ ] Uploads extracted into **901** `estio_uploads` volume  
- [ ] `docker compose -f docker-compose.prod.split.yml up -d --build`  
- [ ] 900 worker health from 901  
- [ ] URL rewrites if `PUBLIC_FILE_BASE_URL` changed  
- [ ] nginx / TLS on 901  
- [ ] Admin + public site smoke tests  
- [ ] DNS / CDN cutover  

For background on split vs single-node mistakes, see **`deploy/SPLIT_ARCHITECTURE.md`** (Troubleshooting) and **`deploy/SINGLE_NODE_VOLUME_NOTE.txt`**.
