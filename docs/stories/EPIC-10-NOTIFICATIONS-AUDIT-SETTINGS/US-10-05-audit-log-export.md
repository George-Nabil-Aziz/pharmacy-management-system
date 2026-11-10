# US-10-05: Audit Log Export

| Field | Value |
|---|---|
| Story ID | US-10-05 |
| Epic | EPIC-10 |
| Priority | P1 |
| Complexity | S |
| Related Requirements | FR-10-014 |
| Related Business Rules | BR-10-001, BR-10-008 |
| Dependencies | US-10-04, US-10-08 |

## User Story
As an Owner, I want to export filtered audit entries to CSV or JSON Lines so that I can share evidence with external auditors or analyze it offline.

## Business Value
Supports external audits and investigations without granting auditors system access.

## Preconditions
- US-10-04 search filters exist; object storage (ADR-006) is available; `EXPORT_READY` notification type exists (US-10-08).

## Acceptance Criteria
### US-10-05-AC1: Asynchronous export
- **Given** an Owner with `audit.logs.export` and a filter matching 120,000 entries
- **When** they `POST /api/v1/audit/exports` with `{ "format": "csv", "filter": { "from": "2026-10-01", "to": "2026-10-31" } }`
- **Then** the API returns 202 with an export id, the file is produced as UTF-8 CSV with BOM containing 120,000 rows plus header, and `GET /api/v1/audit/exports/{id}` returns status `Completed` with a pre-signed URL that expires 24 h after generation

### US-10-05-AC2: Export is itself audited and notified
- **Given** the export in AC1
- **When** it is requested and completes
- **Then** an `AUDIT.LOGS_EXPORTED` entry with the filter and row count exists, and the requester receives one `EXPORT_READY` notification linking to the export page (not to the file URL)

### US-10-05-AC3: Export too large (negative)
- **Given** a filter estimated at 1,400,000 entries
- **When** the Owner requests an export
- **Then** the API returns 422 `AUDIT.EXPORT_TOO_LARGE` and no job is created

### US-10-05-AC4: Branch scoping applies
- **Given** a user with `audit.logs.export` assigned only to `CAI01` (custom role)
- **When** they export without a branch filter
- **Then** the file contains only `CAI01` entries, identical to their search results

### US-10-05-AC5: Permission denied and requester isolation
- **Given** a Branch Manager without `audit.logs.export`, and a second Owner in the same organization
- **When** the Manager posts an export, and the second Owner requests the first Owner's export id
- **Then** the Manager receives 403 `COMMON.FORBIDDEN` and the second Owner receives 404 `COMMON.NOT_FOUND`

## Validation Rules
- VR-10-005 (≤ 1,000,000 rows), VR-10-006 (`csv`/`jsonl`), and all search filter rules from US-10-04.

## Authorization Rules
- `audit.logs.export` plus branch scoping identical to search. Only the requester can read the export status and URL.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Too many rows | 422 `AUDIT.EXPORT_TOO_LARGE` |
| Invalid format | 400 `COMMON.VALIDATION_FAILED` |
| No permission | 403 `COMMON.FORBIDDEN` |
| Other user's export | 404 `COMMON.NOT_FOUND` |

## Edge Cases
- Zero matching rows → header-only file and `EXPORT_READY` still sent.
- Export job failure → status `Failed`, `EXPORT_READY` with failure flag, `BackgroundJobRun` records error.
- CSV cells beginning with `=`, `+`, `-`, `@` are prefixed with `'` to prevent formula injection.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-10-029 | Integration | 120k-row CSV export with BOM; URL expiry 24 h | US-10-05-AC1 |
| TS-10-030 | Integration | `AUDIT.LOGS_EXPORTED` written; one `EXPORT_READY` notification | US-10-05-AC2 |
| TS-10-031 | API | 1.4M estimate → 422 | US-10-05-AC3 |
| TS-10-032 | Security | Branch-scoped export equals scoped search | US-10-05-AC4 |
| TS-10-033 | API | Manager 403; other requester 404 | US-10-05-AC5 |
| TS-10-034 | Performance | 1M-row export ≤ 10 min (NFR-10-007) | US-10-05-AC1 |
