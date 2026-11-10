# US-06-24: Return Disposition Inspection (Restock or Discard)

| Field | Value |
|---|---|
| Story ID | US-06-24 |
| Epic | EPIC-06 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-06-053, FR-06-054, FR-06-055 |
| Related Business Rules | BR-G-05, BR-G-07, BR-G-25, BR-06-024, BR-06-032 |
| Dependencies | US-06-21, US-04-03 |

## User Story
As a pharmacist, I want to inspect returned items and decide whether they go back to stock or are discarded so that only medicines fit for sale re-enter inventory.

## Business Value
Implements the default REG-11 behaviour: no automatic restocking of returned medicines; traceable, final decisions with correct COGS effects.

## Preconditions
- Return lines with disposition `PendingInspection` exist; user holds `sales.returns.inspect`.

## Acceptance Criteria
### US-06-24-AC1: Inspection queue
- **Given** 3 pending return lines in branch A, one 9 days old
- **When** the pharmacist calls `GET /branches/{A}/sales-returns/inspection-queue`
- **Then** each line shows return number, return date, medicine, batch number, expiry, quantity, and age; the 9-day-old line is highlighted (> 7 days)

### US-06-24-AC2: Restock into original batch
- **Given** a pending line of 10 base units from allocation batch B1 (not expired, `Active`, unit cost 6.2500)
- **When** the pharmacist sets disposition `Restocked` with an Idempotency-Key
- **Then** a `SalesReturn` stock movement +10 into B1 at unit cost 6.2500 is posted via `ReturnToBatch`, B1 OnHand increases by 10, the line records disposition user/time and movement id, and an audit entry is written

### US-06-24-AC3: Restock blocked for ineligible batch
- **Given** the original batch has expired, is within the do-not-sell window, or is `Quarantined`
- **When** `Restocked` is requested
- **Then** the response is 422 `SALES.RESTOCK_NOT_ALLOWED`; `Discarded` is accepted (no stock movement; return loss recorded)

### US-06-24-AC4: Disposition is final
- **Given** a line already `Discarded`
- **When** any disposition is requested again
- **Then** the response is 409 `SALES.DISPOSITION_ALREADY_SET`

### US-06-24-AC5: Direct restock at return time
- **Given** `AllowDirectRestockOnReturn` = true and a pharmacist holding `sales.returns.inspect`
- **When** the pharmacist creates a return with line disposition `Restocked`
- **Then** the `SalesReturn` movement is posted in the return transaction; with the setting false the request returns 400 `COMMON.VALIDATION_FAILED` and a cashier without `sales.returns.inspect` gets 403 `COMMON.FORBIDDEN`

### US-06-24-AC6: Permission and isolation
- **Given** a cashier without `sales.returns.inspect`, a pharmacist not assigned to branch A, and a return line of another organization
- **When** they call the queue or set a disposition
- **Then** 403 `COMMON.FORBIDDEN`, 403 `COMMON.FORBIDDEN` (CS-07), 404 `COMMON.NOT_FOUND` (CS-08)

## Validation Rules
- VR-06-037, VR-06-038, VR-06-021.

## Authorization Rules
- `sales.returns.inspect` + branch assignment.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Batch not eligible for restock | 422 `SALES.RESTOCK_NOT_ALLOWED` |
| Disposition already set | 409 `SALES.DISPOSITION_ALREADY_SET` |
| No permission / other branch | 403 `COMMON.FORBIDDEN` |
| Other organization | 404 `COMMON.NOT_FOUND` |

## Edge Cases
- Two pharmacists set dispositions concurrently → line row lock; second gets 409.
- Lines of a `PendingApproval` or `Rejected` return never appear in the queue.
- Controlled-medicine dispositions follow OD-06-10 / REG-02.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-06-143 | Integration | Queue fields and > 7-day highlighting | US-06-24-AC1 |
| TS-06-144 | Integration | Restock posts `SalesReturn` movement into original batch at original cost | US-06-24-AC2 |
| TS-06-145 | Integration | CS-02 related: restock blocked into expired / do-not-sell / quarantined batch; discard allowed | US-06-24-AC3 |
| TS-06-146 | Concurrency | Final disposition; concurrent attempts → one succeeds | US-06-24-AC4 |
| TS-06-147 | Integration | Direct restock setting on/off and permission | US-06-24-AC5 |
| TS-06-148 | Security | 403 permission; CS-07 cross-branch 403; CS-08 cross-org 404 | US-06-24-AC6 |
