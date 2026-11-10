# US-06-03: POS Cart with Pack and Base-Unit Quantities

| Field | Value |
|---|---|
| Story ID | US-06-03 |
| Epic | EPIC-06 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-06-007, FR-06-008, FR-06-009, FR-06-010 |
| Related Business Rules | BR-06-001, BR-06-005, BR-06-007 |
| Dependencies | US-06-01 |

## User Story
As a cashier, I want a client-side cart where I can sell whole packs or, when allowed, individual tablets, and edit quantities freely, so that I can build the sale exactly as the customer requests.

## Business Value
Split-pack selling is common in Egyptian pharmacies; a client-only cart keeps the server free of abandoned drafts and keeps the POS responsive.

## Preconditions
- US-06-01 provides medicine data (PackSize, AllowSplitPack, price, sellable quantity).

## Acceptance Criteria
### US-06-03-AC1: Pack and base-unit lines
- **Given** Medicine B has PackSize 20 and AllowSplitPack = true, and Medicine A has PackSize 10 and AllowSplitPack = false
- **When** the cashier adds Medicine B with unit BaseUnit quantity 7 and Medicine A with unit Pack quantity 2
- **Then** the cart shows B: 7 base units (QuantityBaseUnits 7) and A: 2 packs (QuantityBaseUnits 20), and the BaseUnit option is not offered for Medicine A

### US-06-03-AC2: Quantity bounds
- **Given** a cart line
- **When** the cashier enters quantity 0, -1, 2.5, or 10000
- **Then** the value is rejected inline and the previous valid quantity is kept

### US-06-03-AC3: Sellable cap warning
- **Given** Medicine A has 25 sellable base units (2 packs + 5 units)
- **When** the cashier sets quantity 3 packs
- **Then** the cart caps the line at 2 packs, shows "Only 2 packs + 5 units available", and other lines are unaffected

### US-06-03-AC4: Cart persists across refresh and clears on logout/completion
- **Given** a cart with 3 lines for user U in branch A
- **When** the page is refreshed, then later the user logs out
- **Then** after refresh all 3 lines with quantities, units, and discounts are restored; after logout and login the cart is empty; a cart of user U in branch B is stored separately

### US-06-03-AC5: Totals recalculated after each edit
- **Given** the worked-example cart of SPEC-06 §7.2
- **When** the cashier changes line 3 from 5 to 4 packs and then removes line 2
- **Then** the displayed totals equal the values produced by the golden pricing engine for the resulting cart

## Validation Rules
- VR-06-004 integer quantity 1–9,999; VR-06-005 BaseUnit only with AllowSplitPack; maximum 200 lines (VR-06-003).

## Authorization Rules
- Client-only feature; the POS route requires `sales.pos.sell`. No server endpoint, therefore no 403 AC beyond US-06-01.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| 201st line added | Inline message; line not added (server would return 400 `COMMON.VALIDATION_FAILED`) |
| BaseUnit forced via tampered client | Server rejects at completion: 422 `SALES.SPLIT_PACK_NOT_ALLOWED` |
| Quantity above sellable forced via tampered client | Server rejects at completion: 409 `INVENTORY.INSUFFICIENT_STOCK` |

## Edge Cases
- Browser storage unavailable → in-memory cart with warning banner.
- Medicine deactivated after it was added → line flagged at quote/completion (`SALES.MEDICINE_NOT_SELLABLE`).
- Changing unit from Pack to BaseUnit converts quantity to base units (2 packs → 40 units) and back only when divisible by PackSize.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-06-013 | Unit | QuantityBaseUnits derivation; BaseUnit availability by AllowSplitPack | US-06-03-AC1 |
| TS-06-014 | Unit | Quantity bound validation | US-06-03-AC2 |
| TS-06-015 | Unit | Sellable cap warning per line | US-06-03-AC3 |
| TS-06-016 | E2E | Cart persistence on refresh; cleared on logout; per user+branch keys | US-06-03-AC4 |
| TS-06-017 | Unit | Recalculation vs golden vectors after edits | US-06-03-AC5 |
