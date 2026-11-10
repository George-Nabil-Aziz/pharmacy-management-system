# US-03-15: Import medicines: idempotent commit

| Field | Value |
|---|---|
| Story ID | US-03-15 |
| Epic | EPIC-03 |
| Priority | P1 |
| Complexity | M |
| Related Requirements | FR-03-036, FR-03-037, FR-03-044, FR-03-045 |
| Related Business Rules | BR-03-018, BR-03-019, BR-03-023, BR-03-024, BR-G-16 |
| Dependencies | US-03-14, US-03-07, EPIC-01 idempotency |

## User Story
As a catalog administrator, I want to commit a validated medicine import as a background job with idempotent retries so that network retries cannot duplicate prices, audit entries, events, or medicine changes.

## Business Value
Atomic or explicitly partial imports provide reliable bulk maintenance with a recoverable report.

## Preconditions
- The dry-run and import job services are available.
- The caller has `catalog.medicines.import` and supplies an `Idempotency-Key` for every commit.

## Acceptance Criteria
### US-03-15-AC1: Accept a commit as an asynchronous job
- **Given** a validated import file and a supported `matchBy` and mode
- **When** the caller submits `dryRun = false` with an idempotency key
- **Then** the response is 202 with a job resource; matching occurs by barcode or code and reports remain available for 30 days.

### US-03-15-AC2: Enforce selected transaction mode
- **Given** an import with one or more row errors
- **When** it is committed in `AllOrNothing` or `SkipInvalid` mode
- **Then** AllOrNothing makes no catalog changes and fails with `CATALOG.IMPORT_HAS_ERRORS`; SkipInvalid commits valid rows and reports invalid rows.

### US-03-15-AC3: Replay commit safely
- **Given** an identical commit request using the same key
- **When** it is retried or two identical requests arrive concurrently
- **Then** the original 202 response and job id are replayed and only one import job and one set of side effects exist; re-importing identical data yields Unchanged rows.

### US-03-15-AC4: Reject key reuse and unauthorized or foreign jobs
- **Given** the same key with a different request hash, a caller without import permission, or a job from another Organization
- **When** they submit or query the request
- **Then** key reuse returns 422 `COMMON.IDEMPOTENCY_KEY_REUSED`, missing permission returns 403, and the foreign job returns 404 without disclosure.

## Validation Rules
- Import files and row constraints follow VR-03-026 and VR-03-027.
- Commit requires `Idempotency-Key`; `AllOrNothing` is the default mode.

## Authorization Rules
- Commit, status, and report require `catalog.medicines.import`; gated columns retain their respective permissions.
- The idempotency record and job are scoped to the token Organization; RLS is enabled and forced from MVP.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Missing `Idempotency-Key` | 400 `COMMON.IDEMPOTENCY_KEY_REQUIRED` |
| Same key with different request | 422 `COMMON.IDEMPOTENCY_KEY_REUSED` |
| Another import is queued or running | 409 `CATALOG.IMPORT_IN_PROGRESS` |
| AllOrNothing contains row errors | 422 `CATALOG.IMPORT_HAS_ERRORS` |
| Missing import permission | 403 `COMMON.FORBIDDEN` |
| Foreign Organization job | 404 `CATALOG.IMPORT_JOB_NOT_FOUND` |

## Edge Cases
- The key is scoped by Organization and user; replay returns the original job, not a second job.
- An identical re-import produces no new price-history, audit, or outbox rows for unchanged medicines.
- Import never creates stock or opening balances.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-03-082 | Integration | Valid commit returns 202 and job status/report remain available for 30 days | US-03-15-AC1 |
| TS-03-083 | Integration | AllOrNothing rollback and SkipInvalid valid-row commit behavior | US-03-15-AC2 |
| TS-03-084 | Concurrency | Same idempotency key/request replays one job; identical data causes no duplicate side effects (CS-11) | US-03-15-AC3 |
| TS-03-085 | Integration | Key hash conflict 422, missing permission 403, foreign job 404 | US-03-15-AC4 |
