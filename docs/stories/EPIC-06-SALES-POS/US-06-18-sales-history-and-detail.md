# US-06-18: Sales History Search and Sale Detail

| Field | Value |
|---|---|
| Story ID | US-06-18 |
| Epic | EPIC-06 |
| Priority | P1 |
| Complexity | M |
| Related Requirements | FR-06-041, FR-06-042 |
| Related Business Rules | BR-06-016, BR-06-029 |
| Dependencies | US-06-12 |

## User Story
As a branch manager, I want to search past sales and open a sale's full detail so that I can answer customer questions, process returns, and investigate discrepancies.

## Business Value
Sales lookup is required for returns, reprints, audits, and recall tracing (which customer received which batch).

## Preconditions
- Completed sales exist; user holds `sales.sales.read`.

## Acceptance Criteria
### US-06-18-AC1: Search with filters
- **Given** 1,000 sales in branch A over 3 months
- **When** the user calls `GET /branches/{A}/sales?from=2026-10-01&to=2026-10-31&paymentMethod=Card&status=Completed&page=1&pageSize=25`
- **Then** the response is 200 with `{ items, page, pageSize, totalCount }` containing only October card-paid completed sales sorted by completion time descending

### US-06-18-AC2: Search by invoice number, medicine, patient, cashier
- **Given** sale `CAI01-INV-2026-000123` contains Medicine A, patient P, cashier C
- **When** the user filters by `invoiceNumber`, `medicineId`, `patientId`, or `cashierUserId`
- **Then** each result set includes the sale

### US-06-18-AC3: Detail with allocations; costs hidden without permission
- **Given** the §7.2 sale
- **When** a cashier (no `sales.sales.read-cost`) and an accountant (with it) open the detail
- **Then** both see lines, allocations (batch number, expiry, quantity), payments, change, returns, voids, prints; only the accountant's response contains `unitCost`, `cogs`, and `grossProfit` fields (omitted, not null, for the cashier)

### US-06-18-AC4: Invalid range
- **Given** a search
- **When** the date range exceeds 366 days or `pageSize` is 101
- **Then** the response is 400 `COMMON.VALIDATION_FAILED`

### US-06-18-AC5: Permission and isolation
- **Given** a user without `sales.sales.read`, a user unassigned to branch A, and a sale id belonging to another organization
- **When** they search or open detail
- **Then** 403 `COMMON.FORBIDDEN`, 403 `COMMON.FORBIDDEN` (CS-07), and 404 `COMMON.NOT_FOUND` (CS-08) respectively

## Validation Rules
- VR-06-043; `sort` ∈ {completedAt, totalAmount, invoiceNumber} with optional `-`.

## Authorization Rules
- `sales.sales.read` + branch; cost fields require `sales.sales.read-cost`.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Range > 366 days | 400 `COMMON.VALIDATION_FAILED` |
| No permission / other branch | 403 `COMMON.FORBIDDEN` |
| Other organization's sale | 404 `COMMON.NOT_FOUND` |

## Edge Cases
- Sale id valid but in another branch of the same organization in the route → 404.
- Search by partial invoice number suffix (`000123`) supported.
- Patient filter does not expose patient medical data.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-06-104 | Integration | Date/method/status filters, pagination, default sort | US-06-18-AC1 |
| TS-06-105 | Integration | Invoice number, medicine, patient, cashier filters | US-06-18-AC2 |
| TS-06-106 | Security | Cost fields omitted without `sales.sales.read-cost` | US-06-18-AC3 |
| TS-06-107 | Unit | Range and page size validation | US-06-18-AC4 |
| TS-06-108 | Security | 403 permission, CS-07 cross-branch 403, CS-08 cross-org 404 | US-06-18-AC5 |
| TS-06-109 | Performance | Search p95 ≤ 500 ms over 500,000 sales / 1 year | US-06-18-AC1 |
