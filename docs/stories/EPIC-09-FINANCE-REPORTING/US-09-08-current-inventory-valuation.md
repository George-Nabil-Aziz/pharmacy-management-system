# US-09-08: Current Inventory Valuation (Stock on Hand)

| Field | Value |
|---|---|
| Story ID | US-09-08 |
| Epic | EPIC-09 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-09-023, FR-09-024 |
| Related Business Rules | BR-G-04, BR-G-07, BR-G-27, BR-09-008, BR-09-009 |
| Dependencies | US-09-01, SPEC-04 (`Batch`, `BatchBalance`) |

## User Story
As an owner, I want the current value of stock on hand per batch, medicine, and category, with expired, quarantined, and do-not-sell stock shown separately, so that I know how much money is tied up in sellable stock versus stock at risk.

## Business Value
Inventory is a pharmacy's largest asset; separating sellable value from expired/quarantined value quantifies risk.

## Preconditions
- Branch `CAI01`, business date 2026-11-09, do-not-sell window 30 days (BR-G-27 setting).
- Batches with on-hand > 0: `B1` Active, expiry 2027-06-30, on-hand 100, reserved 30, unit cost 35.0000; `B2` expiry 2026-11-05, on-hand 10, cost 12.5000; `B3` `Quarantined`, expiry 2027-02-01, on-hand 20, cost 8.2500; `B4` Active, expiry 2026-11-25, on-hand 4, cost 15.0000. Batch `B5` on-hand 0.
- `OWN1` holds `reports.inventory.read`.

## Acceptance Criteria
### US-09-08-AC1: Classes and values
- **Given** the batches above
- **When** `OWN1` requests `GET /branches/{CAI01}/reports/inventory/valuation`
- **Then** `B1` is `Sellable` value 3,500.00; `B2` is `Expired` value 125.00; `B3` is `Quarantined` value 165.00; `B4` is `DoNotSellWindow` value 60.00; class subtotals equal those values; grand total = 3,850.00; `B5` is not listed

### US-09-08-AC2: Reserved does not change value
- **Given** `B1` has on-hand 100 and reserved 30
- **When** the report is generated
- **Then** `B1` shows `onHand = 100`, `reserved = 30`, `value = 3500.00`

### US-09-08-AC3: Per-batch rounding and grand-total identity
- **Given** two additional Active batches each with on-hand 3 and unit cost 0.3333
- **When** the report is generated
- **Then** each shows `value = 1.00`, and the grand total equals Σ round₂(`BatchBalance.OnHand` × `Batch.UnitCost`) computed directly from the database with difference 0.00 (3,852.00)

### US-09-08-AC4: Aggregation by medicine and category
- **Given** `B1` and `B4` belong to Medicine A (category "Analgesics")
- **When** `OWN1` requests `groupBy=medicine`
- **Then** Medicine A shows `onHand = 104`, `value = 3560.00` with class breakdown `Sellable 3500.00`, `DoNotSellWindow 60.00`

### US-09-08-AC5: Permission denied
- **Given** user `C1` (`CASHIER`) lacks `reports.inventory.read`
- **When** `C1` requests the valuation
- **Then** the API returns 403 `COMMON.FORBIDDEN`

### US-09-08-AC6: Cross-branch and cross-organization
- **Given** `M1` assigned only to `CAI01` with `reports.inventory.read`
- **When** `M1` requests valuation for `ALX01` and for other-organization branch `B9`
- **Then** the API returns 403 `COMMON.FORBIDDEN` and 404 `COMMON.NOT_FOUND`

## Validation Rules
- `groupBy` ∈ `batch`, `medicine`, `category` (VR-09-006); `class` filter ∈ the four classes.

## Authorization Rules
- `reports.inventory.read` + branch access.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Invalid `groupBy` | 400 `REPORTS.INVALID_GROUP_BY` |
| No permission / unassigned branch | 403 `COMMON.FORBIDDEN` |
| Other organization | 404 `COMMON.NOT_FOUND` |

## Edge Cases
- Batch with unit cost 0.0000 listed with value 0.00.
- Batch expiring exactly on the business date is `Expired` (BR-G-07).
- Quarantined and expired batch → `Quarantined` (precedence BR-09-009).

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-09-052 | Integration | Four classes, values, subtotals, grand total 3,850.00 | US-09-08-AC1 |
| TS-09-053 | Unit | Class precedence including expiry = business date | US-09-08-AC1 |
| TS-09-054 | Integration | Reserved shown, value on on-hand | US-09-08-AC2 |
| TS-09-055 | Integration | Rounding per batch; grand total = direct DB computation (FR-09-024) | US-09-08-AC3 |
| TS-09-056 | Integration | Group by medicine with class breakdown | US-09-08-AC4 |
| TS-09-057 | Security | Cashier 403 | US-09-08-AC5 |
| TS-09-058 | Security | CS-07 403, CS-08 404 | US-09-08-AC6 |
