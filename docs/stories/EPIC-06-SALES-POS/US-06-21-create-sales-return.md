# US-06-21: Create a Sales Return with Refund

| Field | Value |
|---|---|
| Story ID | US-06-21 |
| Epic | EPIC-06 |
| Priority | P0 |
| Complexity | L |
| Related Requirements | FR-06-046, FR-06-047, FR-06-048, FR-06-050, FR-06-053 |
| Related Business Rules | BR-G-12, BR-G-16, BR-G-24, BR-G-25, BR-06-019, BR-06-020, BR-06-021, BR-06-023, BR-06-024 |
| Dependencies | US-06-12, US-06-13, US-06-08 |

## User Story
As a cashier, I want to return some or all items of a past sale and refund the customer by the original payment method so that returns are exact, traceable to the original invoice, and cannot exceed what was sold.

## Business Value
Delivers CS-05; precise proportional refunds and over-return protection prevent money leakage; the default `PendingInspection` disposition protects stock quality (REG-11).

## Preconditions
- Sale X is `Completed` or `PartiallyReturned` in branch A; the user holds `sales.returns.create` and owns an `Open` session in branch A; the refund total is ≤ `ReturnApprovalThresholdAmount` and within `ReturnWindowDays` (otherwise see US-06-22).

## Acceptance Criteria
### US-06-21-AC1: Returnable preview
- **Given** sale X (§7.2) with line 1 = 2 packs (20 base units) total 147.93, paid Card 100.00 + Cash 161.59
- **When** the user calls `GET /branches/{A}/sales/{X}/returnable`
- **Then** the response lists per line and per allocation the remaining returnable base units (line 1: B1 12, B2 8), the refund preview for each, and the default refund allocation (cash first)

### US-06-21-AC2: Partial return then remaining (CS-05)
- **Given** sale X
- **When** the user returns 10 base units of line 1 (from allocation B2 8 and B1 2 per latest-expiry-first default) with reason "Customer changed mind", then later returns the remaining 10 units
- **Then** the first return is `Completed` with number `CAI01-RET-2026-000045`, refund 73.97 in Cash, lines with disposition `PendingInspection` and no stock movement, a `RefundCash` cash movement −73.97, audit entry, and X becomes `PartiallyReturned`; the second refund is 73.96 (remainder rule) and after all lines are fully returned X becomes `Returned`

### US-06-21-AC3: Over-return rejected (CS-05)
- **Given** 10 of 20 units of line 1 have been returned
- **When** a return of 11 units of line 1 is submitted
- **Then** the response is 422 `SALES.RETURN_QUANTITY_EXCEEDED` and nothing is persisted

### US-06-21-AC4: Concurrent returns cannot over-return (CS-05)
- **Given** 20 units remain returnable on line 1
- **When** two returns of 15 units each are submitted concurrently by two users
- **Then** exactly one completes; the other returns 422 `SALES.RETURN_QUANTITY_EXCEEDED` (sale row lock serializes them)

### US-06-21-AC5: Window, voided sale, and sessions
- **Given** a sale 15 business days old with `ReturnWindowDays` 14, a `Voided` sale, and a user without an open session
- **When** returns are submitted without approval
- **Then** the responses are 422 `SALES.RETURN_WINDOW_EXPIRED`, 409 `SALES.SALE_NOT_RETURNABLE`, and 409 `SALES.CASH_SESSION_NOT_OPEN` respectively

### US-06-21-AC6: Idempotent return (CS-11)
- **Given** a completed return created with Idempotency-Key K
- **When** the identical request is retried with K
- **Then** the stored response is replayed and no second return, refund, or cash movement exists

### US-06-21-AC7: Permission, cross-branch, cross-organization
- **Given** a user without `sales.returns.create`, a user assigned only to branch B returning sale X of branch A, and a sale id of another organization
- **When** each submits a return
- **Then** 403 `COMMON.FORBIDDEN`, 403 `COMMON.FORBIDDEN` (CS-07), and 404 `COMMON.NOT_FOUND` (CS-08)

## Validation Rules
- VR-06-030 to VR-06-035, VR-06-021.

## Authorization Rules
- `sales.returns.create` + branch assignment + own open session for refunds; returns only in the sale's branch.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Over-return | 422 `SALES.RETURN_QUANTITY_EXCEEDED` |
| Outside window without approval | 422 `SALES.RETURN_WINDOW_EXPIRED` |
| Sale voided / fully returned | 409 `SALES.SALE_NOT_RETURNABLE` |
| No open session | 409 `SALES.CASH_SESSION_NOT_OPEN` |
| Reason too short | 400 `COMMON.VALIDATION_FAILED` |
| No permission / other branch | 403 `COMMON.FORBIDDEN` |

## Edge Cases
- Return line quantity is chosen per allocation; the UI default assigns quantity to the latest-expiry allocation first.
- `PendingApproval` returns reserve their quantities against further returns.
- A zero-total sale line returns refund 0.00 (no refund row).
- Fault after refund insert → full rollback (CS-10 pattern).

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-06-122 | Integration | Returnable preview per allocation and default refund allocation | US-06-21-AC1 |
| TS-06-123 | Integration | CS-05: partial return then remaining; refunds 73.97 + 73.96; statuses PartiallyReturned → Returned; PendingInspection with no stock movement | US-06-21-AC2 |
| TS-06-124 | Integration | CS-05: over-return rejected | US-06-21-AC3 |
| TS-06-125 | Concurrency | CS-05: concurrent returns serialized, no over-return | US-06-21-AC4 |
| TS-06-126 | Integration | Window expired, voided sale, no session | US-06-21-AC5 |
| TS-06-127 | Integration | CS-11: return replay single effect | US-06-21-AC6 |
| TS-06-128 | Security | 403 permission; CS-07 cross-branch 403; CS-08 cross-org 404 | US-06-21-AC7 |
| TS-06-129 | Fault injection | CS-10: failure after refund insert → no return, refund, or cash movement remains | US-06-21-AC2 |
