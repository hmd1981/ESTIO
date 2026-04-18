#!/usr/bin/env bash
# Fix Cloudflare: delete RFC1918 A record for media; create media.estio.org → public origin (Proxied).
# Requires: CLOUDFLARE_API_TOKEN (Zone.DNS.Edit, Zone.DNS.Read, Zone.Zone.Read)
#
#   export CLOUDFLARE_API_TOKEN='...'
#   export ESTIO_ORIGIN_IP='82.22.50.142'   # optional
#   bash deploy/cloudflare-dns-fix.sh
#
# ESTIO_FIX_ALL=1 — also upserts A for api.estio.org, admin.estio.org, estio.org (conflicts with tunnel-CNAME apex — use carefully)
#
set -euo pipefail
TOKEN="${CLOUDFLARE_API_TOKEN:?Set CLOUDFLARE_API_TOKEN}"
ORIGIN_IP="${ESTIO_ORIGIN_IP:-82.22.50.142}"
API="https://api.cloudflare.com/client/v4"

H=(-H "Authorization: Bearer ${TOKEN}" -H "Content-Type: application/json")

ZONE_JSON=$(curl -sS "${H[@]}" "${API}/zones?name=estio.org")
ZONE_ID=$(echo "$ZONE_JSON" | python3 -c "import sys,json; d=json.load(sys.stdin); r=d.get('result')or[]; print(r[0]['id'] if r else '')")
if [ -z "$ZONE_ID" ]; then
  echo "ERROR: zone lookup failed" >&2
  echo "$ZONE_JSON" | head -c 600 >&2
  exit 1
fi
echo "==> zone_id=$ZONE_ID"

REC_FILE=$(mktemp)
curl -sS "${H[@]}" "${API}/zones/${ZONE_ID}/dns_records?per_page=500" >"$REC_FILE"

export REC_FILE ZONE_ID ORIGIN_IP TOKEN
export ESTIO_FIX_ALL="${ESTIO_FIX_ALL:-0}"

python3 <<'PY'
import json, os, sys, urllib.request

api = "https://api.cloudflare.com/client/v4"
zone = os.environ["ZONE_ID"]
origin = os.environ["ORIGIN_IP"]
token = os.environ["TOKEN"]
fix_all = os.environ.get("ESTIO_FIX_ALL") == "1"

def req(method, url, data=None):
    h = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    body = None
    if data is not None:
        import json as J
        body = J.dumps(data).encode()
    r = urllib.request.Request(url, data=body, headers=h, method=method)
    with urllib.request.urlopen(r, timeout=90) as resp:
        return json.loads(resp.read().decode())

with open(os.environ["REC_FILE"]) as f:
    records = json.load(f)
if not records.get("success"):
    print("ERROR listing records:", records, file=sys.stderr)
    sys.exit(1)
rows = list(records.get("result") or [])

def is_private_ip(content: str) -> bool:
    parts = (content or "").split(".")
    if len(parts) != 4:
        return False
    try:
        a, b = int(parts[0]), int(parts[1])
    except ValueError:
        return False
    if a == 10:
        return True
    if a == 172 and 16 <= b <= 31:
        return True
    if a == 192 and b == 168:
        return True
    return False

for r in rows:
    if r.get("type") != "A":
        continue
    name = r.get("name", "")
    if name not in ("media.estio.org", "media"):
        continue
    if is_private_ip(r.get("content", "")):
        rid = r["id"]
        print(f"Deleting private media A record {rid} -> {r.get('content')}")
        out = req("DELETE", f"{api}/zones/{zone}/dns_records/{rid}")
        if not out.get("success"):
            print("WARN delete:", out, file=sys.stderr)

# reload
records = req("GET", f"{api}/zones/{zone}/dns_records?per_page=500")
rows = records.get("result") or []

def upsert_a(fqdn: str):
    rid = None
    for r in rows:
        if r.get("type") == "A" and r.get("name") == fqdn:
            rid = r["id"]
            break
    body = {"type": "A", "name": fqdn, "content": origin, "ttl": 1, "proxied": True}
    if rid:
        print(f"UPDATE A {fqdn} -> {origin} (proxied)")
        out = req("PUT", f"{api}/zones/{zone}/dns_records/{rid}", body)
    else:
        print(f"CREATE A {fqdn} -> {origin} (proxied)")
        out = req("POST", f"{api}/zones/{zone}/dns_records", body)
    if not out.get("success"):
        print(f"WARN {fqdn}:", out, file=sys.stderr)

upsert_a("media.estio.org")
if fix_all:
    for h in ("api.estio.org", "admin.estio.org", "estio.org"):
        upsert_a(h)
print("Done.")
PY

rm -f "$REC_FILE"
echo "==> Purge Cloudflare cache (dashboard) after verifying records."
