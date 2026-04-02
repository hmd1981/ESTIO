#!/usr/bin/env bash
# One-shot production bring-up. Run from repo root: bash deploy/prod-up.sh
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
exec bash "$ROOT/deploy/stack-up.sh"
