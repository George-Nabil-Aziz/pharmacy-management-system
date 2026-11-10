# US-06-04: Price Resolution and Server Quote

| Field | Value |
|---|---|
| Story ID | US-06-04 |
| Epic | EPIC-06 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-06-011, FR-06-012 |
| Related Business Rules | BR-06-004, BR-06-006, BR-06-007 |
| Dependencies | US-06-03, US-03-07, US-03-08, US-04-04 |

## User Story
As a cashier, I want the POS to use the correct branch or organization price and to confirm totals with the server before payment so that the customer is charged the authoritative price.

## Business Value
Correct price resolution protects margins and customer trust; the quote endpoint lets the client detect price changes before completion and shares one pricing engine with completion.

## Preconditions
- SPEC-03 provides organization `MedicinePrice` and optional `BranchMedicinePrice`, `PackSize`, optional base-unit price.

## Acceptance Criteria
### US-06-04-AC1: Branch override wins
- **Given** Medicine A has organization price 90.0000 and an active branch override of 85.5000 in branch A, and no override in branch B
- **When** quotes are requested for 1 pack in branch A and in branch B
- **Then** the unit price is 85.5000 in branch A and 90.0000 in branch B

### US-06-04-AC2: Base-unit price derivation
- **Given** Medicine B has pack price 120.0000, PackSize 20, AllowSplitPack = true, and no base-unit price; Medicine D has pack price 10.0000, PackSize 3
- **When** base-unit quotes are requested
- **Then** B's base-unit price is 6.0000 and D's is 3.3333 (10 ÷ 3 rounded to 4 dp AwayFromZero)

### US-06-04-AC3: Quote returns full calculation without persistence
- **Given** the cart of SPEC-06 §7.2 (with a valid override id)
- **When** `POST /branches/{branchId}/pos/quote` is called
- **Then** the response is 200 with per-line gross, discounts, invoice-discount shares (5.97, 1.63, 2.40), tax, totals 261.59, and per-line sellable quantity; no sale, movement, or override consumption is persisted

### US-06-04-AC4: Price not configured
- **Given** Medicine E has no organization price and no branch override
- **When** it is quoted
- **Then** the line returns `SALES.PRICE_NOT_CONFIGURED` (422) and the POS prevents adding it

### US-06-04-AC5: Permission and isolation
- **Given** a user without `sales.pos.sell`, and separately a user assigned only to branch A
- **When** they call the quote endpoint for branch A and branch B respectively
- **Then** both receive 403 `COMMON.FORBIDDEN`; a medicine id of another organization in the cart yields 422 `SALES.MEDICINE_NOT_SELLABLE` without revealing it (CS-08)

## Validation Rules
- VR-06-003 to VR-06-011 apply to quote input; VR-06-007 price resolvable.

## Authorization Rules
- `sales.pos.sell` + branch assignment.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| No price | 422 `SALES.PRICE_NOT_CONFIGURED` |
| Inactive medicine | 422 `SALES.MEDICINE_NOT_SELLABLE` |
| Malformed cart | 400 `COMMON.VALIDATION_FAILED` |
| Missing permission / other branch | 403 `COMMON.FORBIDDEN` |

## Edge Cases
- Branch override with a future effective date is ignored until effective (SPEC-03 effective dating).
- Price change between quote and completion is caught by FR-06-029.
- Quote of a cart containing an expired override id returns totals and flags `SALES.OVERRIDE_INVALID` as a warning (not consumed).

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-06-018 | Integration | Branch override vs organization default | US-06-04-AC1 |
| TS-06-019 | Unit | Base-unit price derivation and rounding | US-06-04-AC2 |
| TS-06-020 | Integration | Quote equals §7.2 example; nothing persisted | US-06-04-AC3 |
| TS-06-021 | Integration | Missing price rejected | US-06-04-AC4 |
| TS-06-022 | Security | 403 permission / other branch; other-org medicine not revealed | US-06-04-AC5 |
| TS-06-023 | Performance | Quote p95 ≤ 300 ms for 50 lines | US-06-04-AC3 |
