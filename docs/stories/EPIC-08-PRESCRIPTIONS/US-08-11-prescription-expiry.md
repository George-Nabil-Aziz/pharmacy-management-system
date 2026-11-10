# US-08-11: Prescription Expiry

| Field | Value |
|---|---|
| Story ID | US-08-11 |
| Epic | EPIC-08 |
| Priority | P1 |
| Complexity | S |
| Related Requirements | FR-08-027, FR-08-028 |
| Related Business Rules | BR-08-003, BR-08-007, BR-08-022, BR-G-23 |
| Dependencies | US-08-03, ADR-007 (Hangfire), SPEC-10 `BackgroundJobRun` |

## User Story
As a Pharmacist, I want prescriptions past their validity to be marked Expired and blocked from dispensing so that out-of-date prescriptions are not filled.

## Business Value
Applies the organization's validity policy consistently (pending REG-01) without manual review.

## Preconditions
- Branch time zone configured (default `Africa/Cairo`).

## Acceptance Criteria
### US-08-11-AC1: Nightly job expires eligible prescriptions
- **Given** prescriptions with `ExpiresOn = 2026-11-08` in statuses Draft, PendingVerification, Verified, PartiallyDispensed, and FullyDispensed
- **When** the job runs at 00:30 `Africa/Cairo` on business date 2026-11-09
- **Then** the first four become `Expired` with history actor `System` and reason `Validity ended`, the FullyDispensed one is unchanged, and a `BackgroundJobRun` row records the count (4).

### US-08-11-AC2: Last valid day
- **Given** a Verified prescription with `ExpiresOn = 2026-11-09`
- **When** the job runs on business date 2026-11-09 and a sale links to it the same day
- **Then** the prescription is not expired and dispensing succeeds.

### US-08-11-AC3: Dispensing blocked before job runs
- **Given** a Verified prescription with `ExpiresOn = 2026-11-08`, business date 2026-11-09 00:10 (job not yet run)
- **When** a sale with a line linked to it is completed
- **Then** the sale is rejected with 422 `PRESCRIPTIONS.EXPIRED`, nothing is persisted, and status remains `Verified` until the job runs.

### US-08-11-AC4: Idempotent re-run
- **Given** the job already ran on 2026-11-09
- **When** it is triggered again for the same date
- **Then** no additional history rows are written and the `BackgroundJobRun` records 0 changes.

### US-08-11-AC5: No manual endpoint for expiring
- **Given** any user, including Owner
- **When** the user attempts to set status `Expired` via `PATCH .../prescriptions/{id}` with `{ "status": "Expired" }`
- **Then** the response is 422 `PRESCRIPTIONS.FIELD_READ_ONLY` with a field error on `status` and the status is unchanged.

## Validation Rules
- Job selects `ExpiresOn < businessDate(branch)` per branch time zone.

## Authorization Rules
- Job runs as system identity scoped per organization; no user-facing endpoint.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Dispense after ExpiresOn | 422 `PRESCRIPTIONS.EXPIRED` |
| Client sends `status` in PATCH | 422 `PRESCRIPTIONS.FIELD_READ_ONLY` |
| Job failure mid-batch | Batch transaction rolled back; next run retries; `BackgroundJobRun` status `Failed` |
| Missing permission / unassigned branch | 403 `COMMON.FORBIDDEN` |
| Prescription id in another organization | 404 `PRESCRIPTIONS.NOT_FOUND` |

## Edge Cases
- Prescription processed in batches of ≤ 1,000 rows per transaction; a row changed concurrently (RowVersion) is retried in the next batch.
- Branches in different time zones are processed according to their own business date.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-08-058 | Integration | Job expires 4 statuses, skips FullyDispensed, logs run | US-08-11-AC1 |
| TS-08-059 | Integration | ExpiresOn = business date is still dispensable | US-08-11-AC2 |
| TS-08-060 | Integration | Sale at 00:10 before job → PRESCRIPTIONS.EXPIRED | US-08-11-AC3 |
| TS-08-061 | Integration | Re-run produces no duplicate history | US-08-11-AC4 |
| TS-08-062 | Security | Status field read-only on PATCH; unassigned branch 403 (CS-07); other organization 404 (CS-08) | US-08-11-AC5 |
| TS-08-063 | Performance | 100,000 eligible prescriptions expired in ≤ 5 min | US-08-11-AC1 |
