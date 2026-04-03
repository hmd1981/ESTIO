# Studio analytics — frozen surfaces

## Admin UI (`/admin/studio-analytics`)

- **Frozen v1**: grid, metric cards, and table columns are locked for comparability across weeks.
- Do not reorder primary KPI blocks or rename labels without a documented analytics version bump.

## Raw event schema

- **Version**: `STUDIO_RAW_EVENT_SCHEMA_VERSION` in `studio-analytics.constants.ts`
- **Machine-readable**: `schemas/studio-raw-batch.v1.schema.json`
- **HTTP**: optional `schemaVersion: 1` on ingest body; if present, must match.

## Rollups

- Table: `StudioAnalyticsRollupDay` (daily grain, UTC date).
- Rebuild: cron + `POST /studio-analytics/admin/rebuild-rollups` (auth).
