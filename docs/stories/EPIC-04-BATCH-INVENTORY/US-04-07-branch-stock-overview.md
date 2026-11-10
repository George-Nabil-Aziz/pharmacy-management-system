# US-04-07: Branch stock overview

| Field | Value |
|---|---|
| Story ID | US-04-07 |
| Epic | EPIC-04 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-04-005, FR-04-029, FR-04-030, FR-04-054 |
| Related Business Rules | BR-G-02, BR-04-001, BR-04-020, BR-04-025, BR-04-026 |
| Dependencies | US-04-02 |

## User Story
As a branch manager, I want one screen listing every medicine's on-hand, reserved, sellable, near-expiry, expired, quarantined, and in-transit quantities so that I can manage branch stock at a glance.

## Business Value
Gives daily operational visibility (BRQ-04) and the entry point for adjustments, write-offs, and reorder decisions.

## Preconditions
- Batches, balances, reorder settings (optional), and transfers (optional) exist.

## Acceptance Criteria
### US-04-07-AC1: Per-medicine aggregates
- **Given** medicine M in branch A has batches: Active OnHand 40 Reserved 5 (expiry in 200 days), Active OnHand 10 (expiry in 60 days, near-expiry threshold 90), Expired OnHand 3, Quarantined OnHand 7
- **When** a user with `inventory.stock.read` calls `GET /api/v1/branches/A/inventory/stock?search=M`
- **Then** the row for M shows onHand 60, reserved 5, sellable 45, nearExpiry 10, expired 3, quarantined 7, and earliestSellableExpiry = the 60-day batch's expiry

### US-04-07-AC2: In-transit columns
- **Given** an `InTransit` transfer from A to C with 12 outstanding units of M
- **When** branch A and branch C overviews are requested
- **Then** A shows inTransitOutbound 12 and C shows inTransitInbound 12, and neither branch's onHand includes the 12 units

### US-04-07-AC3: Filters and pagination
- **Given** 300 medicines with stock in branch A, 12 of them Low against their ReorderSetting
- **When** the overview is requested with `lowStock=true&pageSize=10`
- **Then** 10 items are returned with `totalCount` 12; `pageSize=101` returns 400 `COMMON.VALIDATION_FAILED`

### US-04-07-AC4: Value fields gated
- **Given** a cashier with `inventory.stock.read` but without `reports.inventory.read`
- **When** the overview is requested
- **Then** no `value` or cost field is present; for an accountant with `reports.inventory.read` each row includes `onHandValue` = Σ(OnHand × UnitCost) rounded to 2 decimals

### US-04-07-AC5: Authorization
- **Given** a user without `inventory.stock.read`, a user not assigned to branch B, and a branch id of another organization
- **When** each calls the overview
- **Then** the responses are 403 `IDENTITY.PERMISSION_DENIED`, 403 `IDENTITY.BRANCH_ACCESS_DENIED`, and 404 `COMMON.NOT_FOUND`

## Validation Rules
- `pageSize` ≤ 100; `sort` ∈ {name, sellable, earliestSellableExpiry, onHandValue (requires cost permission)}.

## Authorization Rules
- `inventory.stock.read` + branch assignment; value columns and value sort require `reports.inventory.read`.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Missing permission | 403 `IDENTITY.PERMISSION_DENIED` |
| Unassigned branch | 403 `IDENTITY.BRANCH_ACCESS_DENIED` |
| Other-organization branch | 404 `COMMON.NOT_FOUND` |
| Sort by value without cost permission | 403 `IDENTITY.PERMISSION_DENIED` |

## Edge Cases
- Medicines with no batches appear only when `includeZero=true` and they have a ReorderSetting.
- Search matches Arabic and English names, generic name, and barcode (SPEC-03 search contract).

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-04-048 | Integration | Aggregates per bucket computed correctly for mixed batch statuses | US-04-07-AC1 |
| TS-04-049 | Integration | CS-06: in-transit outbound/inbound shown in both branches, excluded from onHand | US-04-07-AC2 |
| TS-04-050 | API | Low-stock filter, pagination, pageSize limit | US-04-07-AC3 |
| TS-04-051 | API | Value fields gated by reports.inventory.read; value rounding | US-04-07-AC4 |
| TS-04-052 | API | 403 permission, 403 branch (CS-07), 404 other org (CS-08) | US-04-07-AC5 |
| TS-04-053 | Performance | NFR-04-004: 10,000 medicines, page 25, p95 ≤ 500 ms | US-04-07-AC1, US-04-07-AC3 |
