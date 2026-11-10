# US-06-06: Line and Invoice Discounts within Role Limits

| Field | Value |
|---|---|
| Story ID | US-06-06 |
| Epic | EPIC-06 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-06-015, FR-06-016, FR-06-017 |
| Related Business Rules | BR-G-32, BR-06-007, BR-06-008, BR-06-009 |
| Dependencies | US-06-04 |

## User Story
As a cashier, I want to give a percentage or fixed-amount discount on a line or on the whole invoice within my role's limit so that I can serve customers flexibly without exceeding what management allows.

## Business Value
Controlled discounting protects margin while letting staff close sales; deterministic allocation keeps tax and returns exact.

## Preconditions
- User holds `sales.discounts.apply`; organization setting `RoleDiscountLimits` configured (defaults OWNER 100, MANAGER 20, PHARMACIST 10, CASHIER 5).

## Acceptance Criteria
### US-06-06-AC1: Line discount percent and amount
- **Given** a line with gross 171.00
- **When** the cashier applies 5% and, on another cart, 8.55 EGP
- **Then** line discount = 8.55 in both cases and net before invoice discount = 162.45

### US-06-06-AC2: Invoice discount pro-rata allocation
- **Given** lines with net before invoice discount 153.90, 42.00, 61.73 and an invoice discount of 10.00 EGP
- **When** the cart is quoted
- **Then** shares are 5.97, 1.63, 2.40 (sum 10.00), and for an invoice discount of 0.01 on two equal lines of 5.00 the full 0.01 is assigned to line 1 (largest, lowest line number)

### US-06-06-AC3: Within limit accepted
- **Given** a CASHIER (limit 5%) and a cart with gross 200.00
- **When** the cashier applies an invoice discount of 10.00 (5.00%) and completes the sale
- **Then** the sale is accepted without override

### US-06-06-AC4: Above limit rejected without override
- **Given** a CASHIER (limit 5%)
- **When** the cashier completes a sale with a 10% line discount and no override id
- **Then** the response is 422 `SALES.DISCOUNT_LIMIT_EXCEEDED`, nothing is persisted, and the POS offers "Request manager override"

### US-06-06-AC5: Multiple roles use maximum limit
- **Given** a user holding both CASHIER (5%) and PHARMACIST (10%) roles
- **When** the user applies an 8% invoice discount
- **Then** the sale is accepted without override

### US-06-06-AC6: Permission denied
- **Given** a user with `sales.pos.sell` but without `sales.discounts.apply`
- **When** the user completes a sale containing any discount > 0
- **Then** the response is 403 `COMMON.FORBIDDEN` and the POS hides discount controls for that user

## Validation Rules
- VR-06-009, VR-06-010, VR-06-011, VR-06-012.

## Authorization Rules
- `sales.discounts.apply` for any non-zero discount; limit per BR-06-009.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Discount percent 100.01 | 400 `COMMON.VALIDATION_FAILED` |
| Amount discount > line gross | 400 `COMMON.VALIDATION_FAILED` |
| Over limit without override | 422 `SALES.DISCOUNT_LIMIT_EXCEEDED` |
| No `sales.discounts.apply` | 403 `COMMON.FORBIDDEN` |

## Edge Cases
- Line and invoice discounts combined: both the line % and the effective sale % are checked.
- Invoice discount equal to Σ NB → total 0.00 (requires 100% limit or override).
- A line with net 0.00 receives share 0.00.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-06-028 | Unit | Line discount percent/amount computation | US-06-06-AC1 |
| TS-06-029 | Unit | Pro-rata allocation and remainder rule | US-06-06-AC2 |
| TS-06-030 | Integration | Within-limit discount accepted | US-06-06-AC3 |
| TS-06-031 | Integration | Over-limit rejected, nothing persisted | US-06-06-AC4 |
| TS-06-032 | Unit | Effective limit = max over roles; custom role default 0 | US-06-06-AC5 |
| TS-06-033 | Security | Discount without `sales.discounts.apply` → 403 | US-06-06-AC6 |
