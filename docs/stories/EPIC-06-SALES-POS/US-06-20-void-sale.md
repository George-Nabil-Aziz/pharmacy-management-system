# US-06-20: Void a Sale

| Field | Value |
|---|---|
| Story ID | US-06-20 |
| Epic | EPIC-06 |
| Priority | P1 |
| Complexity | M |
| Related Requirements | FR-06-044, FR-06-045 |
| Related Business Rules | BR-G-11, BR-G-16, BR-G-25, BR-06-016, BR-06-017, BR-06-018 |
| Dependencies | US-06-12, US-06-13, US-04-03, US-08-14 |

## User Story
As a branch manager, I want to void a sale entered by mistake on the same day while the cashier's session is still open so that stock and cash are restored completely and the correction is traceable.

## Business Value
Fixes same-day mistakes without leaving goods in `PendingInspection` (as returns do), under strict conditions that prevent abuse.

## Preconditions
- Sale X is `Completed` in branch A on today's business date; X's cash session S is `Open`; user holds `sales.sales.void`.

## Acceptance Criteria
### US-06-20-AC1: Successful void
- **Given** sale X (the §7.2 sale) with allocations B1 12, B2 8 for line 1, cash applied 161.59 and card 100.00
- **When** the manager posts `POST /branches/{A}/sales/{X}/void` with reason "Wrong customer cart scanned" and an Idempotency-Key
- **Then** in one transaction: X status `Voided` with void metadata; `SaleVoid` movements return 12 to B1 and 8 to B2 (and all other allocations) at original unit costs via `ReturnToBatch`; reversal payments −161.59 (Cash) and −100.00 (Card); a `SaleVoid` cash movement −161.59 in S; dispensing records reversed via SPEC-08; audit entry written; the invoice number is retained and never reused

### US-06-20-AC2: Different business date
- **Given** X was completed yesterday
- **When** void is requested
- **Then** the response is 409 `SALES.SALE_NOT_VOIDABLE` and nothing changes

### US-06-20-AC3: Session closed or returns exist
- **Given** X's session S is `Closed`, or X has a `Completed` or `PendingApproval` return
- **When** void is requested
- **Then** the response is 409 `SALES.SALE_NOT_VOIDABLE`

### US-06-20-AC4: Concurrent void and return
- **Given** a void and a return on X are submitted simultaneously
- **When** both execute
- **Then** exactly one succeeds; the other returns 409 (`SALES.SALE_NOT_VOIDABLE` or `SALES.SALE_NOT_RETURNABLE`); stock and money reflect only the successful operation

### US-06-20-AC5: Idempotent void (CS-11)
- **Given** a void with key K committed
- **When** the identical request with K is retried
- **Then** the stored response is replayed and no second set of reversals exists; a void with a new key returns 409 `SALES.SALE_NOT_VOIDABLE`

### US-06-20-AC6: Missing reason and permission
- **Given** a cashier without `sales.sales.void`, and a manager sending a 5-character reason
- **When** each requests void
- **Then** the cashier receives 403 `COMMON.FORBIDDEN`; the manager 400 `COMMON.VALIDATION_FAILED`

### US-06-20-AC7: Cross-branch and cross-organization
- **Given** a manager assigned only to branch B, and a sale id from another organization
- **When** they void X in branch A / the foreign sale
- **Then** 403 `COMMON.FORBIDDEN` (CS-07) and 404 `COMMON.NOT_FOUND` (CS-08)

## Validation Rules
- VR-06-029, VR-06-021.

## Authorization Rules
- `sales.sales.void` + branch assignment. Voider need not own S; the cash reversal is posted to S.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Conditions not met | 409 `SALES.SALE_NOT_VOIDABLE` |
| Reason too short | 400 `COMMON.VALIDATION_FAILED` |
| No permission / other branch | 403 `COMMON.FORBIDDEN` |
| Other organization | 404 `COMMON.NOT_FOUND` |
| Lock timeout | 503 `COMMON.LOCK_TIMEOUT` |

## Edge Cases
- Batch quarantined since the sale → `SaleVoid` still returns stock to it (BR-04-032); it remains non-sellable.
- Void of a zero-total sale → stock reversed, no money reversal.
- Controlled-medicine sale void → register reversal entry via SPEC-08 (US-08-14).
- Override consumed by the sale stays consumed.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-06-114 | Integration | Full void reversal: movements, payments, cash, dispensing, audit | US-06-20-AC1 |
| TS-06-115 | Integration | Different business date rejected | US-06-20-AC2 |
| TS-06-116 | Integration | Closed session / existing return rejected | US-06-20-AC3 |
| TS-06-117 | Concurrency | Void vs return race → one wins | US-06-20-AC4 |
| TS-06-118 | Integration | CS-11: idempotent void replay | US-06-20-AC5 |
| TS-06-119 | Security | 403 without `sales.sales.void`; reason validation | US-06-20-AC6 |
| TS-06-120 | Security | CS-07 cross-branch 403; CS-08 cross-org 404 | US-06-20-AC7 |
| TS-06-121 | Fault injection | CS-10: failure after `SaleVoid` movements → full rollback | US-06-20-AC1 |
