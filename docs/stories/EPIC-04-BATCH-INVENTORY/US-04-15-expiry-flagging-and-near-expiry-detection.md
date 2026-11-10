# US-04-15: Nightly expiry flagging and near-expiry detection

| Field | Value |
|---|---|
| Story ID | US-04-15 |
| Epic | EPIC-04 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-04-003, FR-04-023, FR-04-043, FR-04-044 |
| Related Business Rules | BR-G-07, BR-G-23, BR-G-27, BR-04-002, BR-04-026 |
| Dependencies | US-04-01 |

## User Story
As a branch manager, I want the system to flag expired batches every night and alert me about batches approaching expiry so that I can act before stock is lost and expired stock is clearly marked.

## Business Value
Reduces expiry losses (BRQ-11) and keeps statuses consistent for reports and write-off prefill.

## Preconditions
- Hangfire jobs `inventory.expiry-flagging` (00:05 branch local) and `inventory.near-expiry-scan` (06:00 branch local) registered per branch; `BackgroundJobRun` available.

## Acceptance Criteria
### US-04-15-AC1: Expired flagging
- **Given** branch A (Africa/Cairo) has batches E1 (expiry 2026-11-09, Active, OnHand 5) and E2 (expiry 2026-11-08, Depleted)
- **When** the flagging job runs at 2026-11-09 00:05 local
- **Then** E1 and E2 become `Expired`; one `Inventory.BatchExpired.v1` is emitted for E1 only (OnHand > 0); the run is recorded with key (job, A, 2026-11-09)

### US-04-15-AC2: Idempotent rerun
- **Given** the job already completed for (A, 2026-11-09)
- **When** it is triggered again for the same branch and business date
- **Then** no status changes and no events are produced

### US-04-15-AC3: Quarantined batches untouched
- **Given** batch Q is `Quarantined` with expiry 2026-11-01
- **When** the flagging job runs
- **Then** Q stays `Quarantined`; after release its derived status is `Expired`

### US-04-15-AC4: Near-expiry digest
- **Given** NearExpiryThresholdDays 90, business date 2026-11-09, batches N1 (expiry 2027-01-15, OnHand 10), N2 (2027-02-07, OnHand 4), N3 (2027-02-08, OnHand 9), N4 (2026-12-01, OnHand 0)
- **When** the near-expiry scan runs at 06:00 local
- **Then** one `Inventory.BatchNearExpiryDetected.v1` for branch A lists N1 and N2 (N3 is beyond 90 days, N4 has no stock), each with `newlyEntered` true on the first run

### US-04-15-AC5: Catch-up after a missed run
- **Given** the scan did not run on 2026-11-10 and runs on 2026-11-11
- **When** it executes
- **Then** batches that entered the window on 2026-11-10 or 2026-11-11 are flagged `newlyEntered` true; batches already reported are flagged false

### US-04-15-AC6: Eligibility independent of the job (CS-02)
- **Given** the flagging job failed and E1 (expiry = business date) still shows `Active`
- **When** a sale tries to allocate E1
- **Then** E1 is excluded by FEFO and an explicit selection returns 422 `INVENTORY.BATCH_NOT_SELLABLE` (reason `Expired`)

### US-04-15-AC7: Near-expiry list endpoint authorization
- **Given** a user without `inventory.stock.read`, a user not assigned to branch B, and a branch id of another organization
- **When** each calls `GET …/inventory/near-expiry`
- **Then** the responses are 403 `IDENTITY.PERMISSION_DENIED`, 403 `IDENTITY.BRANCH_ACCESS_DENIED`, and 404 `COMMON.NOT_FOUND`

## Validation Rules
- NearExpiryThresholdDays 0–730; DoNotSellWindowDays 0–365 (owned by SPEC-02 settings validation).

## Authorization Rules
- Jobs run under system identity with the branch's organization tenant context (RLS enforced from MVP); list endpoint `inventory.stock.read`.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Job failure | Run recorded `Failed`; retried by Hangfire per ADR-007; ops alert after final failure |
| Missing permission on list | 403 `IDENTITY.PERMISSION_DENIED` |
| Unassigned branch | 403 `IDENTITY.BRANCH_ACCESS_DENIED` |
| Other-organization branch | 404 `COMMON.NOT_FOUND` |

## Edge Cases
- Threshold changed from 90 to 120 days: the next run reports batches newly inside 120 days as `newlyEntered`.
- Inactive branches are skipped.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-04-102 | Integration | Flagging sets Expired for Active/Depleted, events only for OnHand > 0 | US-04-15-AC1 |
| TS-04-103 | Integration | Rerun same branch/date changes nothing | US-04-15-AC2 |
| TS-04-104 | Integration | Quarantined batch unchanged; release derives Expired | US-04-15-AC3 |
| TS-04-105 | Integration | Near-expiry digest boundaries (day 90 included, day 91 excluded, zero stock excluded) | US-04-15-AC4 |
| TS-04-106 | Integration | Catch-up after missed day flags newly entered batches | US-04-15-AC5 |
| TS-04-107 | Performance | NFR-04-007: flagging 100,000 batches ≤ 5 min | US-04-15-AC1 |
| TS-04-108 | API | Near-expiry list: 403 permission, 403 branch (CS-07), 404 other org (CS-08) | US-04-15-AC7 |
| TS-04-109 | Integration | CS-02: expired batch not sellable although stored status is still Active | US-04-15-AC6 |
