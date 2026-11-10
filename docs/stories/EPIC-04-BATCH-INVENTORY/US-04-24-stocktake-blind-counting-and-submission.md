# US-04-24: Stocktake blind counting and submission

| Field | Value |
|---|---|
| Story ID | US-04-24 |
| Epic | EPIC-04 |
| Priority | P1 |
| Complexity | M |
| Related Requirements | FR-04-060 |
| Related Business Rules | BR-04-023, BR-04-024 |
| Dependencies | US-04-23 |

## User Story
As a counter, I want to enter counted quantities per batch without seeing the system quantity so that my count is unbiased, and submit the count when every line is done.

## Business Value
Blind counts produce honest variances; complete submission prevents silent omissions.

## Preconditions
- Stocktake `Counting`.

## Acceptance Criteria
### US-04-24-AC1: Blind lines for counters
- **Given** counter K has `inventory.stocktakes.manage` but not `inventory.stocktakes.approve`
- **When** K reads `GET …/stocktakes/S/lines`
- **Then** each line shows medicine, batch number, expiry, and counted fields only; `snapshotOnHand`, `expected`, and `variance` are absent

### US-04-24-AC2: Record a count
- **Given** line L (batch B) in stocktake S started at 08:00
- **When** K records counted 47 with CountedAt 09:12 (today)
- **Then** the line stores CountedQuantity 47, CountedAt 09:12, CountedBy K; re-entering a count overwrites it and keeps the previous value in the audit trail

### US-04-24-AC3: Invalid counts
- **Given** line L
- **When** K records counted −1, or CountedAt 07:59 (before start), or CountedAt 5 minutes in the future
- **Then** the responses are 422 `INVENTORY.INVALID_QUANTITY`, 422 `INVENTORY.COUNTED_AT_INVALID`, and 422 `INVENTORY.COUNTED_AT_INVALID`

### US-04-24-AC4: Add found batch
- **Given** K finds medicine M with batch `Z5` expiry 2027-06-30 not in the line list
- **When** K adds a line with batch number, expiry, counted 6 (unit cost defaults to the medicine's LastPurchaseCost, editable only by approvers)
- **Then** a line with BatchId null (or the matched existing batch outside scope, with SnapshotOnHand 0 and its current sequence) is added

### US-04-24-AC5: Submit requires completeness
- **Given** 118 of 120 lines are counted and none excluded
- **When** K submits
- **Then** the response is 422 `INVENTORY.STOCKTAKE_INCOMPLETE` listing the 2 uncounted lines; after excluding one with reason `NotAccessible` and counting the other, submit sets status `PendingApproval` and emits `Inventory.InventoryDocumentPendingApproval.v1`

### US-04-24-AC6: Counting after submission blocked
- **Given** S is `PendingApproval`
- **When** K edits a count on a line not returned for recount
- **Then** the response is 409 `INVENTORY.INVALID_STATE_TRANSITION`

### US-04-24-AC7: Authorization
- **Given** a cashier without `inventory.stocktakes.manage`, a counter not assigned to branch B, and a stocktake id of another organization
- **When** each reads lines or records counts
- **Then** the responses are 403 `IDENTITY.PERMISSION_DENIED`, 403 `IDENTITY.BRANCH_ACCESS_DENIED`, and 404 `COMMON.NOT_FOUND`

## Validation Rules
- VR-04-001 (0 allowed for counts), VR-04-018, found batch VR-04-002/003/006; exclusion reason code from SPEC-04 §8.4.

## Authorization Rules
- Count/submit: `inventory.stocktakes.manage`; non-blind view: `inventory.stocktakes.approve`.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Negative count | 422 `INVENTORY.INVALID_QUANTITY` |
| CountedAt out of range | 422 `INVENTORY.COUNTED_AT_INVALID` |
| Incomplete submit | 422 `INVENTORY.STOCKTAKE_INCOMPLETE` |
| Edit after submit | 409 `INVENTORY.INVALID_STATE_TRANSITION` |

## Edge Cases
- Count entry supports barcode scan to locate the medicine, then batch selection; keyboard-only entry meets NFR-04-010.
- Multiple counters can count different lines concurrently; the same line saved concurrently uses last-write-wins with audit of both values.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-04-166 | API | Blind response omits snapshot/expected/variance for counters | US-04-24-AC1 |
| TS-04-167 | API | Record and overwrite count with audit | US-04-24-AC2 |
| TS-04-168 | API | Negative count, CountedAt before start or in future → 422 | US-04-24-AC3 |
| TS-04-169 | Integration | Found batch line added | US-04-24-AC4 |
| TS-04-170 | API | Incomplete submit → 422; exclude + count → PendingApproval + event | US-04-24-AC5 |
| TS-04-171 | API | Edit after submit → 409 | US-04-24-AC6 |
| TS-04-172 | API | 403 permission, 403 branch (CS-07), 404 other org (CS-08) | US-04-24-AC7 |
