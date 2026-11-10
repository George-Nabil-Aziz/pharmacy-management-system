# US-09-06: Returns and Refunds Report

| Field | Value |
|---|---|
| Story ID | US-09-06 |
| Epic | EPIC-09 |
| Priority | P1 |
| Complexity | S |
| Related Requirements | FR-09-018 |
| Related Business Rules | BR-G-12, BR-09-003, BR-09-005 |
| Dependencies | US-09-01, US-09-03, SPEC-06 (sales returns, refunds, dispositions) |

## User Story
As a branch manager, I want a list of completed sales returns with refund methods and dispositions, so that I can control refunds and follow up returned stock awaiting inspection.

## Business Value
Returns are a common leakage point; the report ties every refund to its original sale and to the stock outcome (REG-11 disposition).

## Preconditions
- SPEC-09 §6.3 reference dataset: return R1 (original sale dated 2026-11-08), 2 × Medicine A @ 50.00, refunded cash 100.00, disposition `Restocked`, approved by `M1`.
- `M1` holds `reports.sales.read` for `CAI01`.

## Acceptance Criteria
### US-09-06-AC1: Reference return listed with return rate
- **Given** the reference dataset
- **When** `M1` requests `GET /branches/{CAI01}/reports/sales/returns?from=2026-11-09&to=2026-11-09`
- **Then** R1 is listed with `originalSaleBusinessDate = 2026-11-08`, `quantity = 2`, `returnAmount = 100.00`, `taxReversed = 0.00`, refund `Cash 100.00`, disposition `Restocked`, `approvedBy = M1`; totals `salesReturns = 100.00`; `returnRatePct = 17.24` (100.00 ÷ 580.00 × 100)

### US-09-06-AC2: Disposition breakdown
- **Given** on 2026-11-12 return R2 has lines: 1 × A `PendingInspection` (50.00), 1 × A `Discarded` (50.00), 2 × B `Restocked` (50.00)
- **When** `M1` requests the report for 2026-11-12
- **Then** totals by disposition are `PendingInspection = 50.00`, `Discarded = 50.00`, `Restocked = 50.00`, and `salesReturns = 150.00`

### US-09-06-AC3: Only completed returns (negative)
- **Given** return R3 in `PendingApproval` and return R4 `Rejected` on 2026-11-09
- **When** the report for 2026-11-09 is requested
- **Then** neither R3 nor R4 appears and totals remain `salesReturns = 100.00`

### US-09-06-AC4: Permission denied
- **Given** user `INV1` lacks `reports.sales.read`
- **When** `INV1` requests the returns report
- **Then** the API returns 403 `COMMON.FORBIDDEN`

### US-09-06-AC5: Cross-branch and cross-organization
- **Given** `M1` is assigned only to `CAI01`
- **When** `M1` requests the report for `ALX01` and for other-organization branch `B9`
- **Then** the API returns 403 `COMMON.FORBIDDEN` and 404 `COMMON.NOT_FOUND`

## Validation Rules
- US-09-01 rules; optional filters `disposition` ∈ {`PendingInspection`, `Restocked`, `Discarded`} → else 400 `REPORTS.INVALID_GROUP_BY`.

## Authorization Rules
- `reports.sales.read` + branch access.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Invalid disposition filter | 400 `REPORTS.INVALID_GROUP_BY` |
| No permission / unassigned branch | 403 `COMMON.FORBIDDEN` |
| Other organization | 404 `COMMON.NOT_FOUND` |

## Edge Cases
- `returnRatePct` is `null` when gross sales − discounts = 0.00.
- Return of a sale from another month shows the original sale date for traceability.
- Refund split across two methods shows both.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-09-039 | Integration | Reference return row and return rate 17.24 | US-09-06-AC1 |
| TS-09-040 | Integration | Disposition totals for mixed return | US-09-06-AC2 |
| TS-09-041 | Integration | Pending/rejected returns excluded | US-09-06-AC3 |
| TS-09-042 | Security | Missing permission 403 | US-09-06-AC4 |
| TS-09-043 | Security | CS-07 403 and CS-08 404 | US-09-06-AC5 |
