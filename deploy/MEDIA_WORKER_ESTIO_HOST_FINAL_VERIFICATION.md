# Final Estio-host verification — Docker → tunnel port 9000

**Context:** Workstation is correct (`ESTIO_REMOTE_BIND=0.0.0.0`, **`-R 0.0.0.0:9000:127.0.0.1:8000`**, worker health OK). **API container** still cannot reach **`http://host.docker.internal:9000/health`** and **`GET /media/worker-health`** returns **504**.

**Scope:** Estio server only — effective **`sshd`**, real **listener** on **9000**, **firewall**, then **Docker** **`host.docker.internal`** path.

**Unchanged:** **`MEDIA_WORKER_URL=http://host.docker.internal:9000`**, no **`192.168.x.x`** in Docker API env, no Nest route / Prisma / tunnel architecture changes.

**Related:** [MEDIA_WORKER_DOCKER_TUNNEL_REPAIR.md](./MEDIA_WORKER_DOCKER_TUNNEL_REPAIR.md)

---

## 1. Diagnosis summary

| Symptom | Points to |
|---------|-----------|
| Container **`fetch`** → timeout / **AbortError** | No TCP+HTTP from container to **`<host-gateway>:9000`**. |
| **`/media/worker-health` → 504** | Same URL path via Nest Axios. |
| Workstation **`-R 0.0.0.0:9000`** already | If Estio **`ss`** still shows **`127.0.0.1:9000`**, **`sshd`** is ignoring client bind (**`GatewayPorts`**) or forward failed — fix **server** config and **restart tunnel**. |
| **`curl 127.0.0.1:9000` OK** but **`curl <host-primary-ip>:9000` FAIL** | **Firewall** or socket not truly on **`0.0.0.0`**. |
| Both curls **OK**, container still **FAIL** | **Docker** **`extra_hosts`**, **`host.docker.internal`** resolution, or custom network. |

---

## 2. Commands to run **in order** (on the Estio host)

Replace **`/path/to/estio-platform`** with your deploy directory (the directory that **contains** **`docker-compose.prod.yml`** — **not** `/root` unless the repo lives there). Always:

```bash
cd /path/to/estio-platform
```

before **`docker compose -f docker-compose.prod.yml …`**. Running compose from the wrong cwd causes **`open .../docker-compose.prod.yml: no such file or directory`**.

Run as a user with **`sudo`** where noted.

---

### Step 1 — `sshd` configuration syntax

```bash
sudo sshd -t
echo "exit code: $?"
```

| Pass | Fail |
|------|------|
| **No error output**, exit code **0** | Any error line → fix config files before reload. |

---

### Step 2 — **Effective** OpenSSH settings (not file guesswork)

```bash
sudo sshd -T | grep -iE '^(allowtcpforwarding|gatewayports)\s'
```

| Pass (examples) | Fail |
|-----------------|------|
| `allowtcpforwarding yes` | `allowtcpforwarding no` |
| `gatewayports clientspecified` **or** `gatewayports yes` | `gatewayports no` |

**Recommended production pairing** with workstation **`-R 0.0.0.0:…`:** **`GatewayPorts clientspecified`** + **`AllowTcpForwarding yes`**.

If Step 2 **fails**, apply the drop-in (then repeat Steps 1–2 after reload):

**File:** `/etc/ssh/sshd_config.d/99-estio-gateway-ports.conf`

```text
AllowTcpForwarding yes
GatewayPorts clientspecified
```

```bash
sudo systemctl reload ssh 2>/dev/null || sudo systemctl reload sshd
```

**Restart the autossh/SSH session from the workstation** after changing **`sshd`**, so the remote forward is re-negotiated.

---

### Step 3 — What is actually listening on **9000**

```bash
ss -tlnp | grep 9000 || true
```

| Pass | Fail |
|------|------|
| Line contains **`0.0.0.0:9000`** or **`*:9000`** or **`[::]:9000`** alongside **9000** | Only **`127.0.0.1:9000`** → Docker path will **not** work; see Step 2 + tunnel restart. |
| Process shows **`sshd`** (typical for `-R`) | No line → tunnel not up on this host or different port. |

---

### Step 4 — Loopback HTTP

```bash
curl -sS -w "\nHTTP_CODE:%{http_code}\n" --max-time 5 http://127.0.0.1:9000/health
```

| Pass | Fail |
|------|------|
| **HTTP_CODE:200** (or your worker’s success code) and body (e.g. JSON) | timeout, connection refused, wrong code → worker/tunnel not on loopback. |

---

### Step 5 — Non-loopback HTTP (same path Docker uses conceptually)

```bash
HOST_IP=$(hostname -I | awk '{print $1}')
echo "Using HOST_IP=$HOST_IP"
curl -sS -w "\nHTTP_CODE:%{http_code}\n" --max-time 5 "http://${HOST_IP}:9000/health"
```

| Pass | Fail |
|------|------|
| Same success as Step 4 | **Fails while Step 4 works** → suspect **host firewall** / **cloud SG** blocking **TCP 9000** for non-loopback; or **`HOST_IP`** wrong (multi-homed host — try the interface IP Docker uses). |

**Firewall hints (operator):** `sudo ufw status`, `sudo firewall-cmd --list-all`, or cloud provider SG inbound rules for **9000/tcp** from **self** / **private** / **Docker bridge subnet** as policy allows.

---

### Step 6 — API container: DNS + HTTP

```bash
cd /path/to/estio-platform
docker compose -f docker-compose.prod.yml exec api getent hosts host.docker.internal || true
docker compose -f docker-compose.prod.yml exec api printenv MEDIA_WORKER_URL
```

| Pass | Fail |
|------|------|
| **`getent`** returns an IP (often **`172.17.0.1`** or bridge gateway) | **no match** → missing **`extra_hosts`** on **`api`** service in compose. |
| **`MEDIA_WORKER_URL`** exactly **`http://host.docker.internal:9000`** (no trailing slash) | Empty or wrong URL. |

```bash
docker compose -f docker-compose.prod.yml exec api node -e "
const u=(process.env.MEDIA_WORKER_URL||'http://host.docker.internal:9000').replace(/\/$/,'')+'/health';
const ac=new AbortController();
setTimeout(()=>ac.abort(),8000);
fetch(u,{signal:ac.signal})
  .then(r=>r.text().then(t=>console.log('OK',r.status,t.slice(0,200))))
  .catch(e=>console.error('FAIL',e.name,e.message,'url='+u));
"
```

| Pass | Fail |
|------|------|
| **`OK 200`** and body snippet | **`FAIL AbortError`** → still no path from container to listener; if Steps 4–5 **pass**, inspect **Docker network** (custom bridges, **`iptables`**, **`nft`**), or try from another container on same network. |

---

### Step 7 — Nest aggregate health

```bash
curl -sS -w "\nHTTP_CODE:%{http_code}\n" --max-time 15 http://127.0.0.1:4000/media/worker-health
```

| Pass | Fail |
|------|------|
| **HTTP_CODE:200** and worker-shaped JSON | **504** → Nest still cannot reach worker within **`MEDIA_WORKER_HEALTH_TIMEOUT_MS`**. |

---

## 3. Files that may change (Estio server only, not Estio app repo)

| File | When |
|------|------|
| **`/etc/ssh/sshd_config.d/99-estio-gateway-ports.conf`** | Step 2 shows **`gatewayports no`** or **`allowtcpforwarding no`**. |
| **`/etc/ssh/sshd_config`** | Only if drop-ins are not used; prefer drop-in + **`Include`**. |
| **Firewall** (`ufw`, `firewalld`, cloud SG) | Step 5 fails while Step 4 passes. |

**Estio git repository:** this markdown file only (documentation). No API code changes required for this closure.

---

## 4. Final pass / fail checklist (Estio host repair)

| # | Check | Pass? |
|---|--------|-------|
| A | **`sudo sshd -t`** → exit **0**, no errors | ☐ |
| B | **`sshd -T`** → **`allowtcpforwarding yes`** | ☐ |
| C | **`sshd -T`** → **`gatewayports`** is **`clientspecified`** or **`yes`** (not **`no`**) | ☐ |
| D | **`ss -tlnp`** shows **9000** on **`0.0.0.0`** / **`*`** / **`[::]`**, not **only** **`127.0.0.1`** | ☐ |
| E | **`curl http://127.0.0.1:9000/health`** → **200** + body | ☐ |
| F | **`curl http://<host-primary-ip>:9000/health`** → same as E | ☐ |
| G | **`getent hosts host.docker.internal`** inside **`api` container** → IP | ☐ |
| H | **`printenv MEDIA_WORKER_URL`** → **`http://host.docker.internal:9000`** | ☐ |
| I | Container **Node `fetch`** → **`OK 200`** | ☐ |
| J | **`GET /media/worker-health`** → **200** (not **504**) | ☐ |

**Overall PASS:** A through J all pass.

**If A–E pass but F fails:** focus **firewall / bind / wrong HOST_IP**.

**If A–F pass but I fails:** focus **Docker networking** and **`extra_hosts`**.

**If D shows `127.0.0.1:9000` only:** **`sshd` effective config** or **tunnel not using `0.0.0.0` on the server** — re-check Step 2 and **re-establish** workstation session after **`sshd` reload**.
