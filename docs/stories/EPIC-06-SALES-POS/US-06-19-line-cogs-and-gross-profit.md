# US-06-19: Line COGS and Gross Profit

| Field | Value |
|---|---|
| Story ID | US-06-19 |
| Epic | EPIC-06 |
| Priority | P1 |
| Complexity | S |
| Related Requirements | FR-06-043 |
| Related Business Rules | BR-G-18, BR-G-20, BR-06-031, BR-06-032 |
| Dependencies | US-06-12, US-06-18 |

## User Story
As an accountant, I want each sale line's cost of goods sold and gross profit computed from the actual batches sold so that profit reports reflect real purchase costs.

## Business Value
Batch-level COGS distinguishes revenue from profit (BRQ-10) and feeds SPEC-09 reports.

## Preconditions
- Sale allocations store `UnitCost` snapshots.

## Acceptance Criteria
### US-06-19-AC1: COGS from allocations
- **Given** line 1 of §7.2 (net 147.93) allocated B1 = 12 × 6.2500 and B2 = 8 × 6.5000
- **When** the sale cost view is requested
- **Then** line COGS = 75.00 + 52.00 = 127.00 and gross profit = 20.93; sale COGS and profit are sums over lines

### US-06-19-AC2: Historical cost stability
- **Given** batch B1's unit cost is later corrected from 6.2500 to 6.4000 (SPEC-04)
- **When** the historical sale is viewed
- **Then** line COGS remains 127.00

### US-06-19-AC3: Returns adjust COGS by disposition
- **Given** 10 units of line 1 were returned from allocation B1 and `Restocked`, and 5 units from allocation B2 were returned and `Discarded`
- **When** the read contract for SPEC-09 is queried
- **Then** net COGS reverses only the restocked units at their allocation cost (10 × 6.2500 = 62.50, net line COGS 64.50) and the 5 discarded units (5 × 6.5000 = 32.50) are reported as return loss

### US-06-19-AC4: Permission denied
- **Given** a cashier without `sales.sales.read-cost`
- **When** the cashier requests `GET /sales/{id}` and `GET /sales/{id}?include=costs`
- **Then** the first returns the detail with cost fields omitted; the second returns 403 `COMMON.FORBIDDEN`

## Validation Rules
- Allocation `CostAmount = round(qty × UnitCost, 2)`.

## Authorization Rules
- `sales.sales.read-cost` + branch assignment.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| No cost permission | 403 `COMMON.FORBIDDEN` (or fields omitted on detail) |
| Other organization | 404 `COMMON.NOT_FOUND` |

## Edge Cases
- Zero-cost batch (e.g., free goods) → COGS 0.00, profit = net.
- Negative gross profit (sold below cost after discount) shown as negative, not clamped.
- Restocked return of a line split across batches uses the returned allocation's cost.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-06-110 | Unit | COGS and profit for §7.2 line 1 | US-06-19-AC1 |
| TS-06-111 | Integration | Batch cost change does not alter historical COGS | US-06-19-AC2 |
| TS-06-112 | Integration | Restocked vs discarded effect on COGS | US-06-19-AC3 |
| TS-06-113 | Security | Cost fields hidden / 403 without permission | US-06-19-AC4 |
