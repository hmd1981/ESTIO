# ESTIO Control handoff — source baseline reconciliation

Date: 2026-08-31 UTC  
Host: fr-vmv2-medium  
Project: **estio** (NOT estio-tech)

## Authoritative repository state

| Field | Value |
|-------|-------|
| Repository path | `/root/estio-platform` |
| Remote | `git@github.com:hmd1981/ESTIO.git` |
| Branch | `main` |
| **NEW HEAD** | `e38e3d0` (Reconcile ESTIO production source baseline) |
| OLD HEAD | `6e629b7df4ac030aa719c67aa821d97e7b1c26c9` |
| Working tree | **CLEAN** (no unstaged/untracked source) |
| Push status | **Not pushed** (local commit only) |

## Prisma

| Check | Result |
|-------|--------|
| Host schema checksum | `f5a1ac940f27…` |
| Running API image schema | `f5a1ac940f27…` (match) |
| `prisma validate` | PASS |

## Migration

| Migration | Classification |
|-----------|----------------|
| `20260418210000_phase4_generation_ledger_reasons` | **SAFE_FORWARD_MIGRATION_REQUIRES_DEPLOY_APPROVAL** |

Contents: four `ALTER TYPE "CreditLedgerReason" ADD VALUE IF NOT EXISTS` only.  
**Do not run automatically.** Include in next approved deploy.

## Secret scan

| Check | Result |
|-------|--------|
| `deploy/scripts/scan-secrets.sh` | **PASS** |
| `.env.bak.before-phase2` | Quarantined to `/root/.cursor-quarantine/estio-secrets/` (not in Git) |
| `deploy/nginx/install-on-server.sh` | False positive resolved (removed PEM header literal from echo) |

**SECRET_ROTATION_REQUIRED:** NO (no new secret exposure in tracked baseline; historical `.env.bak` was never committed)

## Validation

| Step | Result |
|------|--------|
| API tests (35) | PASS |
| Lint | PASS (warnings only) |
| Monorepo build | PASS |
| Isolated API build | PASS → `sha256:5ca7dbdeed72477cf7e15d60daa9eab29c26875c1240c5b8106e151673d3cdd9` |
| Isolated web build | PASS → `sha256:f0ce4565440990850836985e13d44f985549bc350e7909c20abe0f29bb146ea6` |

Tag: `estio-platform-api:baseline-verify-20260831`, `estio-platform-web:baseline-verify-20260831`

## Production (unchanged)

| Service | Container ID | Image digest |
|---------|--------------|--------------|
| api | `02dd07bdeda6` | `sha256:9fbf9dd59a8bc94be5649a9c1bc632fa209eed2525103360018d67e2a8907179` |
| web | `125c67e6afa6` | `sha256:9a755b1db569c1ad6ad206ad1c2cf5721688804b8b7feb9e9d66f60cb579f4d7` |

Production restarted: **NO**

Public health:
- https://estio.org/ → 308 → /en → 200 ✓
- https://api.estio.org/ → 200 ✓

## Expected ESTIO Control state

```
SOURCE_BASELINE = AUTHORITATIVE
BUILD_REPRODUCIBLE = YES
SECRET_SCAN = PASS
ESTIO = READY_FOR_TARGET_BUILD
```

## Next safe step

Push `main` at `e38e3d0` to `git@github.com:hmd1981/ESTIO.git`, then run ESTIO Control **target build + canary** with migration approval for `20260418210000_phase4_generation_ledger_reasons`. Do **not** deploy from this handoff automatically.
