# Repair: SSH reverse tunnel reachable from Docker API (`host.docker.internal`)

**Symptom:** On the Estio host, `curl http://127.0.0.1:9000/health` **succeeds**, but the **API container** with `MEDIA_WORKER_URL=http://host.docker.internal:9000` **times out** on `/health` and `generate-image`.

**Cause:** The reverse forward is listening only on **`127.0.0.1:9000`** on the host. Traffic from Docker uses the **host gateway** (bridge → host IP), which is **not** the same as connecting to **loopback** on the host. Only a listener on **`0.0.0.0:9000`** (or the host’s non-loopback addresses) is consistently reachable as `host.docker.internal:9000`.

**Unchanged:** `MEDIA_WORKER_URL` stays **`http://host.docker.internal:9000`**. No change to Nest routes, Prisma, or “SSH tunnel exists” architecture — only **where the forward binds** on the server and **`sshd`** policy that allows it.

**See also:** [MEDIA_WORKER.md](./MEDIA_WORKER.md) (full tunnel + `sshd` background), [MEDIA_WORKER_REACHABILITY_RUNBOOK.md](./MEDIA_WORKER_REACHABILITY_RUNBOOK.md). **Step-by-step Estio host verification with expected pass/fail:** [MEDIA_WORKER_ESTIO_HOST_FINAL_VERIFICATION.md](./MEDIA_WORKER_ESTIO_HOST_FINAL_VERIFICATION.md).

---

## 0. Exact failure mode you described (all consistent with one root issue)

| Observation | Meaning |
|-------------|---------|
| `GET /media/worker-health` → **504** | Nest cannot get HTTP from `MEDIA_WORKER_URL/health` within **`MEDIA_WORKER_HEALTH_TIMEOUT_MS`**. |
| Container `fetch(host.docker.internal:9000/health)` → **AbortError** (~8 s) | Same path: no TCP completion / no HTTP from the container’s view. |
| `POST /media/jobs/generate-image` → **202**, job stays **`running`**, `/result` → **409** | Bull processor is blocked on sync `POST …/generate-image` to the same unreachable URL (long Axios timeout). |

**No API route or Prisma bug is required to explain this** — the worker endpoint is not reachable **from the container** on the intended URL.

---

## 1. Docker → host reachability path (why the container times out)

1. In `docker-compose.prod.yml`, the `api` service has **`extra_hosts: host.docker.internal:host-gateway`**. Inside the container, **`host.docker.internal`** resolves to the host’s IP **as seen from the container network** (typically the **Docker bridge gateway**, e.g. `172.17.0.1` on default bridge setups — not `127.0.0.1`).
2. A TCP connect from the container goes to **`<that-host-IP>:9000`**, not to **`127.0.0.1`** on the host OS.
3. A socket listening only on **`127.0.0.1:9000`** on the host **does not accept** connections whose destination is the bridge IP — hence **timeout** (SYN may be black-holed or no listener).
4. A socket on **`0.0.0.0:9000`** accepts connections on all local addresses that route to that port, including the address Docker uses — hence **`host.docker.internal:9000` works**.

So: **127.0.0.1-only tunnel bind** is the classic explanation when **host loopback curl works** but **container + Nest fail**.

---

## 2. Host-side conditions (all must align)

| Layer | Requirement |
|-------|-------------|
| **`sshd`** | **`AllowTcpForwarding yes`**. **`GatewayPorts clientspecified`** (and SSH client uses **`-R 0.0.0.0:9000:…`**) **or** **`GatewayPorts yes`**. |
| **Remote listener** | On Estio host, port **9000** must show **`0.0.0.0:9000`** or **`*:9000`** in **`ss -tlnp`**, not only **`127.0.0.1:9000`**. |
| **Workstation `ssh -R`** | Must be **`-R 0.0.0.0:9000:127.0.0.1:<worker_port>`** (server side binds all interfaces). Plain **`-R 9000:…`** often binds **127.0.0.1** on server. |
| **Firewall** | Host firewall / cloud SG must **not** drop **TCP :9000** for the path **Docker → host IP :9000**. (Loopback-only rules do not help the container.) |
| **Docker** | **`extra_hosts`** for **`host.docker.internal:host-gateway`** present on **`api`** (already in Estio compose). |

---

## 3. Which failure? (use checks in §5 order)

| If | Most likely cause |
|----|-------------------|
| **`ss -tlnp` shows `127.0.0.1:9000`** only | Tunnel still **127.0.0.1-bound** — fix **`-R 0.0.0.0:9000:…`** on workstation; **`GatewayPorts`** must allow it. |
| **`GatewayPorts no`** in **`sshd -T`** | **`sshd` config not applied** or overridden — fix drop-in, **`sshd -t`**, **reload**. |
| **127.0.0.1 curl OK**, **primary-IP curl FAIL**, listener is `0.0.0.0:9000` | Suspect **firewall** blocking non-loopback access to **9000** — adjust **ufw/firewalld**/SG (see §4.3). |
| **Primary-IP curl OK**, container still **FAIL** | Rare: wrong **`MEDIA_WORKER_URL`**, missing **`extra_hosts`**, or Docker networking customisation — verify **`printenv`** + **`getent hosts host.docker.internal`** inside container. |

---

## 4. Exact file edits (Estio host + operator notes)

### 4.1 `sshd` — drop-in (recommended)

**File:** `/etc/ssh/sshd_config.d/99-estio-gateway-ports.conf`

```text
# Estio: reverse tunnel must bind for Docker (host.docker.internal → host gateway IP)
AllowTcpForwarding yes
GatewayPorts clientspecified
```

Ensure main config includes drop-ins, e.g. in `/etc/ssh/sshd_config`:

```text
Include /etc/ssh/sshd_config.d/*.conf
```

### 4.2 Workstation (not on Estio repo)

Tunnel must use explicit server bind:

```bash
ssh -N -R 0.0.0.0:9000:127.0.0.1:8000 user@estio-server
```

### 4.3 Firewall (operator note — examples only)

- **ufw:** if **9000** is denied for the interface Docker uses, allow from **Docker bridge** subnet (e.g. **`172.17.0.0/16`**) to port **9000**, or temporarily **`sudo ufw status numbered`** / test with brief allow for diagnosis.
- **firewalld:** ensure **9000/tcp** is allowed for the relevant zone, or a rich rule for source **`172.17.0.0/16`**.
- **Cloud:** security group must allow **Estio host** to accept **:9000** from **itself/Docker** if the path hits a public NIC (prefer binding **9000** only on internal/docker-facing path if your design allows).

**Do not** put **`192.168.x.x`** in **`MEDIA_WORKER_URL`** in Docker — keep **`http://host.docker.internal:9000`**.

---

## 5. Verification commands (**run in this order** on Estio host)

```bash
# 1) Effective sshd (after any config edit)
sudo sshd -t && echo "sshd -t OK"
sudo sshd -T | grep -iE '^(allowtcpforwarding|gatewayports)\s'

# 2) Listener on 9000 (critical)
ss -tlnp | grep 9000

# 3) Loopback
curl -sS --max-time 5 http://127.0.0.1:9000/health

# 4) Non-loopback (simulates container → host IP)
HOST_IP=$(hostname -I | awk '{print $1}')
curl -sS --max-time 5 "http://${HOST_IP}:9000/health"

# 5) API container (same URL as Nest; from repo root)
cd /path/to/estio-platform
docker compose -f docker-compose.prod.yml exec api node -e "
const u=(process.env.MEDIA_WORKER_URL||'http://host.docker.internal:9000').replace(/\/$/,'')+'/health';
const ac=new AbortController();
setTimeout(()=>ac.abort(),8000);
fetch(u,{signal:ac.signal})
  .then(r=>r.text().then(t=>console.log('OK',r.status,t.slice(0,200))))
  .catch(e=>console.error('FAIL',e.name,e.message,'url='+u));
"

# 6) Estio route
curl -sS --max-time 15 http://127.0.0.1:4000/media/worker-health
```

**Pass criteria:** (2) shows **`0.0.0.0:9000`** or **`*:9000`**; (3) and (4) return worker body; (5) prints **`OK 200`**; (6) returns **200** (or your worker’s success shape proxied by Nest).

After **`sshd`** edits:

```bash
sudo systemctl reload ssh 2>/dev/null || sudo systemctl reload sshd
```

---

## 6. Diagnosis summary (table)

| Check | `127.0.0.1`-only bind | Correct bind (`0.0.0.0:9000` + GatewayPorts) |
|-------|------------------------|-----------------------------------------------|
| Host: `curl http://127.0.0.1:9000/health` | Often **OK** | **OK** |
| Host: `ss -tlnp \| grep 9000` shows `127.0.0.1:9000` | **Yes** (bad for Docker) | Should show `0.0.0.0:9000` or `*:9000` |
| Container: `host.docker.internal:9000/health` | **Fails / timeout** | **OK** |
| `GET /media/worker-health` | **504** / timeout | **200** (worker permitting) |

---

## 7. Files changed (summary)

| Location | Action |
|----------|--------|
| **Estio server:** `/etc/ssh/sshd_config.d/99-estio-gateway-ports.conf` (recommended) **or** `/etc/ssh/sshd_config` | **`AllowTcpForwarding yes`** + **`GatewayPorts clientspecified`** (or **`yes`**). See **§4.1**. |
| **Workstation:** tunnel unit / script | **`ssh -N -R 0.0.0.0:9000:127.0.0.1:<worker_port>`**. See **§4.2**. |
| **Host firewall** | If **§5** step 4 fails while step 3 works, open **TCP 9000** for the Docker→host path — see **§4.3**. |
| **Estio git repo** | This document only — **no** API routes, Prisma, or `MEDIA_WORKER_URL` change. |

**Unchanged:** `docker-compose.prod.yml` **`extra_hosts`**, **`MEDIA_WORKER_URL=http://host.docker.internal:9000`**, Nest media routes, Prisma.

---

## 8. Final Estio repair checklist

| # | Item | Pass |
|---|------|------|
| 1 | **`sudo sshd -t`** succeeds | ☐ |
| 2 | Effective **`sshd`**: **`sshd -T`** output includes **`allowtcpforwarding yes`** and **`gatewayports`** is **`clientspecified`**, **`yes`**, or **`forced`** — not **`no`** (same check as §5 step 1) | ☐ |
| 3 | **`sshd` reloaded** (`systemctl reload ssh` or `systemctl reload sshd`) | ☐ |
| 4 | Workstation tunnel uses **`-R 0.0.0.0:9000:…`** and session **re-established** after **`sshd`** change | ☐ |
| 5 | **`ss -tlnp`** shows port **9000** on **`0.0.0.0`** or **`*`** — not **`127.0.0.1`** only (§5 step 2) | ☐ |
| 6 | **`curl http://127.0.0.1:9000/health`** OK | ☐ |
| 7 | **`curl http://<host-primary-ip>:9000/health`** OK — if **fail** while (6) **OK** → **firewall** | ☐ |
| 8 | **§5 step 5** (container `fetch`) → **`OK 200`** | ☐ |
| 9 | **`GET /media/worker-health`** succeeds within **`MEDIA_WORKER_HEALTH_TIMEOUT_MS`** | ☐ |
| 10 | **`MEDIA_WORKER_URL`** in container still **`http://host.docker.internal:9000`** (no **`192.168.x.x`** in Docker API runtime) | ☐ |

**Ordered verification commands:** **§5** (steps 1–6).
