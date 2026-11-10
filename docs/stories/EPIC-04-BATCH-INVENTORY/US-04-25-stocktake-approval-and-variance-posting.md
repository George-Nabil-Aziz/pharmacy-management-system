# US-04-25: Stocktake review, recount, approval, and variance posting

| Field | Value |
|---|---|
| Story ID | US-04-25 |
| Epic | EPIC-04 |
| Priority | P1 |
| Complexity | L |
| Related Requirements | FR-04-061 |
| Related Business Rules | BR-G-19, BR-G-28, BR-04-007, BR-04-023, BR-04-024 |
| Dependencies | US-04-24 |

## User Story
As a branch manager, I want to review count variances, send doubtful lines for recount, and approve the stocktake so that stock is corrected exactly by the counted difference even though sales continued during the count.

## Business Value
Accurate stock after counts with control over large variances (BRQ-04, BR-G-28).

## Preconditions
- Stocktake `PendingApproval`.

## Acceptance Criteria
### US-04-25-AC1: Variance accounts for movements after snapshot
- **Given** line L: SnapshotOnHand 50 at sequence 10; after start, movements Sale −3 (seq 11, 08:30) and Sale −2 (seq 12, 09:30); CountedQuantity 44 with CountedAt 09:12
- **When** the approver opens the review
- **Then** Expected = 50 − 3 = 47, Variance = −3, VarianceValue = −3 × UnitCost, shown with totals of positive and negative variance values

### US-04-25-AC2: Approval posts variance movements
- **Given** lines with variances −3, 0, +2 and current OnHand 45, 20, 8 respectively
- **When** manager G (≠ submitter) with `inventory.stocktakes.approve` approves with an `Idempotency-Key`
- **Then** status becomes `Posted`; `StocktakeVariance` movements −3 and +2 are written (none for 0); resulting OnHand 42 and 10; an audit entry and `Inventory.StockMovementsPosted.v1` are written in the same transaction

### US-04-25-AC3: Return lines for recount
- **Given** a line with variance −30
- **When** G returns it for recount with reason "Variance above 20 units, recount shelf 3"
- **Then** status becomes `Counting`, only returned lines are editable, and resubmission follows US-04-24

### US-04-25-AC4: Self-approval blocked
- **Given** user K submitted the stocktake and holds `inventory.stocktakes.approve`
- **When** K approves
- **Then** the response is 403 `INVENTORY.SELF_APPROVAL_NOT_ALLOWED`

### US-04-25-AC5: Variance conflict
- **Given** line L counted 0 at 09:00, but 2 units were sold after 09:00 so current OnHand is 3 and variance is −5
- **When** G approves
- **Then** the response is 409 `INVENTORY.STOCKTAKE_VARIANCE_CONFLICT` listing L, nothing is posted, and G returns L for recount

### US-04-25-AC6: Found batch posting
- **Given** a found-stock line `Z5` with counted 6 and no existing batch
- **When** the stocktake is approved
- **Then** batch `Z5` is created via the inbound contract with a `StocktakeVariance` +6 movement

### US-04-25-AC7: Atomicity and retry (CS-10, CS-11)
- **Given** a 5,000-line stocktake
- **When** a failure is injected after 4,000 variance movements, then the approval is retried twice with the same key
- **Then** the failed attempt leaves no movements and status `PendingApproval`; the first retry posts all; the second replays the response

### US-04-25-AC8: Authorization
- **Given** an inventory user without `inventory.stocktakes.approve`, a manager not assigned to branch B, and a stocktake id of another organization
- **When** each approves
- **Then** the responses are 403 `IDENTITY.PERMISSION_DENIED`, 403 `IDENTITY.BRANCH_ACCESS_DENIED`, and 404 `COMMON.NOT_FOUND`

## Validation Rules
- VR-04-013 recount reason; VR-04-022 transitions; controlled-medicine lines follow BR-04-014 (always approval — inherent here).

## Authorization Rules
- `inventory.stocktakes.approve`, branch assignment, approver ≠ submitter.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Self-approval | 403 `INVENTORY.SELF_APPROVAL_NOT_ALLOWED` |
| Variance breaches OnHand ≥ Reserved ≥ 0 | 409 `INVENTORY.STOCKTAKE_VARIANCE_CONFLICT` |
| Not `PendingApproval` | 409 `INVENTORY.INVALID_STATE_TRANSITION` |
| Missing key | 400 `COMMON.IDEMPOTENCY_KEY_REQUIRED` |
| Lock timeout | 503 `COMMON.LOCK_TIMEOUT` |

## Edge Cases
- Movements in the same second as CountedAt are counted as before the count (OccurredAt ≤ CountedAt); residual risk documented in OD-04-06.
- Excluded lines post nothing and are reported in the stocktake summary.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-04-173 | Unit | Expected/variance formula with movements before and after CountedAt and sequence boundary | US-04-25-AC1 |
| TS-04-174 | Integration | Approval posts only non-zero variances against current balances | US-04-25-AC2 |
| TS-04-175 | API | Return for recount → Counting, only returned lines editable | US-04-25-AC3 |
| TS-04-176 | API | Self-approval → 403 | US-04-25-AC4 |
| TS-04-177 | Integration | Variance conflict → 409, nothing posted | US-04-25-AC5 |
| TS-04-178 | Integration | Found batch created with positive variance | US-04-25-AC6 |
| TS-04-179 | Integration | CS-10 failure after 4,000 movements → rollback; CS-11 retries → single posting; NFR-04-002 5,000 lines ≤ 15 s | US-04-25-AC7 |
| TS-04-180 | API | 403 permission, 403 branch (CS-07), 404 other org (CS-08) | US-04-25-AC8 |
