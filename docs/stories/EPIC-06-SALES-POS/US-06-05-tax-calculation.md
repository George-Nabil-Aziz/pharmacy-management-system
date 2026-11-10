# US-06-05: Tax Calculation per Tax Category

| Field | Value |
|---|---|
| Story ID | US-06-05 |
| Epic | EPIC-06 |
| Priority | P0 |
| Complexity | S |
| Related Requirements | FR-06-013, FR-06-014 |
| Related Business Rules | BR-G-18, BR-G-20, BR-06-007, BR-06-010 |
| Dependencies | US-06-04, US-03-03 |

## User Story
As an owner, I want each sale line taxed according to the medicine's configured tax category and our tax-inclusive or tax-exclusive pricing setting so that invoices and tax totals are computed consistently once our tax advisor confirms the rates (REG-06).

## Business Value
Deterministic, configurable tax calculation avoids hard-coding unconfirmed rates and gives SPEC-09 accurate tax totals.

## Preconditions
- `TaxCategory` with rates configured by the organization (SPEC-03); organization setting `PricesIncludeTax`.

## Acceptance Criteria
### US-06-05-AC1: Exclusive mode
- **Given** `PricesIncludeTax = false` and the §7.2 cart where lines 2 and 3 use a category configured at 14% (illustrative)
- **When** the cart is quoted
- **Then** line 2 tax = 5.65, line 3 tax = 8.31, line 1 tax = 0.00, total tax = 13.96, total = 261.59

### US-06-05-AC2: Inclusive mode
- **Given** `PricesIncludeTax = true` and a line with discounted amount 40.37 at 14%
- **When** it is quoted
- **Then** line total = 40.37, tax = 4.96, net = 35.41

### US-06-05-AC3: Rate snapshot
- **Given** a completed sale with line tax rate 14%
- **When** the tax category rate is later changed to 10%
- **Then** the stored sale line still shows rate 14.0000 and tax 8.31, and new quotes use 10%

### US-06-05-AC4: Missing tax category
- **Given** a medicine with no tax category
- **When** it is quoted or sold
- **Then** the response is 422 `SALES.TAX_CATEGORY_MISSING` and no sale is persisted

### US-06-05-AC5: Mode snapshot on sale
- **Given** a sale completed with `PricesIncludeTax = false`
- **When** the setting is switched to true
- **Then** the sale's stored `PricesIncludeTax` remains false and its receipt reprint shows identical amounts

## Validation Rules
- VR-06-008 tax category present; rate 0–1 with 4 dp (SPEC-03).

## Authorization Rules
- Computation inside quote/completion; endpoints protected per US-06-04 and US-06-12 (403 covered there).

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Medicine without tax category | 422 `SALES.TAX_CATEGORY_MISSING` |

## Edge Cases
- Rate 0% lines produce tax 0.00 and appear in the tax summary under 0%.
- Inclusive mode with 100% discount → total 0.00, tax 0.00.
- Midpoint tax (e.g., 0.125 → 0.13) rounds AwayFromZero.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-06-024 | Unit | Exclusive mode golden vectors incl. §7.2 | US-06-05-AC1 |
| TS-06-025 | Unit | Inclusive mode golden vectors incl. 40.37 → 4.96 | US-06-05-AC2 |
| TS-06-026 | Integration | Rate and mode snapshots unchanged after configuration change | US-06-05-AC3, US-06-05-AC5 |
| TS-06-027 | Integration | Missing tax category rejected | US-06-05-AC4 |
