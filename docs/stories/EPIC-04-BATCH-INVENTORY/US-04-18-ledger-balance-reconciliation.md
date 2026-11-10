# US-04-18: Ledger ↔ balance reconciliation job

| Field | Value |
|---|---|
| Story ID | US-04-18 |
| Epic | EPIC-04 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-04-049, FR-04-050, FR-04-057 |
| Related Business Rules | BR-G-05, BR-G-25, BR-04-020, BR-04-028 |
| Dependencies | US-04-02 |

## User Story
As an owner, I want a nightly check that every batch balance matches its movement ledger and be alerted on any drift so that stock data errors are detected within a day.

## Business Value
Continuous verification of the core inventory invariant (ADR-003); also the test oracle for the whole epic.

## Preconditions
- Job `inventory.reconciliation` scheduled daily at 01:30 Africa/Cairo; `ReconciliationFinding` table; SPEC-05 facade returns open supplier-return reservations per batch.

## Acceptance Criteria
### US-04-18-AC1: Clean run
- **Given** a dataset produced only through the posting contracts (all movement types, transfers, stocktakes)
- **When** the job runs
- **Then** zero findings are recorded and the run is `Succeeded` with counts of batches and transfers checked

### US-04-18-AC2: On-hand drift detected and alerted
- **Given** a test fixture sets batch B's OnHand to 51 directly while Σ QuantityDelta = 50
- **When** the job runs
- **Then** findings `ON_HAND_SUM` (expected 50, actual 51) and `BALANCE_AFTER` are recorded for B, and `Inventory.ReconciliationDriftDetected.v1` (critical) is emitted, reaching OWNER users within 5 minutes

### US-04-18-AC3: Never auto-corrects
- **Given** findings exist
- **When** the job completes
- **Then** OnHand, Reserved, statuses, and movements are unchanged (verified by checksum before and after)

### US-04-18-AC4: Sequence and status checks
- **Given** batch C has BatchSequence values 1, 2, 4, and batch D is stored `Active` with expiry before the business date
- **When** the job runs
- **Then** findings `SEQUENCE_GAP` for C and `STATUS_DERIVATION` for D are recorded

### US-04-18-AC5: Reservation and transfer conservation checks
- **Given** batch R has Reserved 10 but open transfer reservations total 6 and supplier-return reservations 0, and transfer T has Σ TransferOut 20, Σ TransferIn 12, Σ TransferReturn 3, outstanding 4
- **When** the job runs
- **Then** findings `RESERVED_SUM` (expected 6, actual 10) for R and `TRANSFER_CONSERVATION` (gap 1) for T are recorded

### US-04-18-AC6: Idempotent findings and on-demand run
- **Given** B's drift persists across two days, and an owner with `inventory.reconciliation.read` triggers an on-demand run
- **When** the runs execute
- **Then** B's finding keeps its FirstDetectedRunId and no duplicate exists per (batch, check, run date); a second drift event is not emitted for an unchanged finding

### US-04-18-AC7: Authorization on findings API
- **Given** a manager without `inventory.reconciliation.read` and an owner of another organization
- **When** each calls `GET /api/v1/inventory/reconciliation-runs/{runId}/findings`
- **Then** the responses are 403 `IDENTITY.PERMISSION_DENIED` and 404 `COMMON.NOT_FOUND`

## Validation Rules
- On-demand runs: at most 1 concurrent run per organization (409 `INVENTORY.INVALID_STATE_TRANSITION` while one is running).

## Authorization Rules
- Job: system identity per organization tenant context; API: `inventory.reconciliation.read` with organization-wide scope.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Run already in progress | 409 `INVENTORY.INVALID_STATE_TRANSITION` |
| Missing permission | 403 `IDENTITY.PERMISSION_DENIED` |
| Other-organization run id | 404 `COMMON.NOT_FOUND` |
| Job crash | Run `Failed`, retried per ADR-007, ops alert |

## Edge Cases
- Runs inside a REPEATABLE READ read-only snapshot so in-flight sales do not create false findings (E-19).
- A finding is marked `Resolved` automatically when a later run no longer detects it (the finding row is kept).

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-04-124 | Integration | Clean dataset → zero findings (also run after every integration test class) | US-04-18-AC1 |
| TS-04-125 | Integration | Seeded on-hand drift → findings + critical event + notification ≤ 5 min | US-04-18-AC2 |
| TS-04-126 | Integration | Data checksum unchanged after a run with findings | US-04-18-AC3 |
| TS-04-127 | Integration | Sequence gap and status derivation findings | US-04-18-AC4 |
| TS-04-128 | Integration | Reserved sum and transfer conservation findings | US-04-18-AC5 |
| TS-04-129 | Integration | Persisting drift deduplicated; on-demand run; concurrent run → 409 | US-04-18-AC6 |
| TS-04-130 | API | 403 permission; CS-08 other-org run → 404 | US-04-18-AC7 |
| TS-04-131 | Performance | NFR-04-006: 500,000 batches / 20 million movements ≤ 30 min, sale p95 impact ≤ 10% | US-04-18-AC1 |
