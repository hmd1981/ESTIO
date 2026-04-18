# Migration paths (VM902 / VM901)

The runbooks use **`ESTIO_ROOT`** = directory containing `deploy/migration-exec-*.sh` (your git clone). It does **not** have to be `/opt/estio-platform`.

Examples:

| Layout | Repo | Dump (VM902) | Uploads tarball (VM901) |
|--------|------|----------------|-------------------------|
| Root-owned | `/opt/estio-platform` | `/root/estio-pre-migration.dump` | `/tmp/estio-uploads.tgz` |
| User `estiodb` | `/home/estiodb/estio-platform` | `/home/estiodb/backups/estio-pre-migration.dump` | `/home/estiodb/backups/estio-uploads.tgz` |

**VM902:** set `ESTIO_PG_DUMP` to wherever the `pg_dump -Fc` file lives (readable by the user running Docker).

**VM901:** set `ESTIO_UPLOADS_TGZ` similarly. If your tarball has a top-level folder (e.g. `_data/`), set `ESTIO_UPLOADS_TAR_STRIP_COMPONENTS=1` before running `migration-exec-vm901.sh`.

**Password:** `POSTGRES_PASSWORD` on VM902 (compose for `docker-compose.prod.postgres.yml`) must match the password embedded in **`DATABASE_URL`** on VM901.

See also `deploy/MIGRATION_TO_VM901.md`.
