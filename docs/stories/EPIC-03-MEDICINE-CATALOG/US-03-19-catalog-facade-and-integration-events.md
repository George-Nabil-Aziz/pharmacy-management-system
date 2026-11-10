# US-03-19: Catalog facade, effective sale info, and integration events

| Field | Value |
|---|---|
| Story ID | US-03-19 |
| Epic | EPIC-03 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-03-011, FR-03-023, FR-03-041, FR-03-042, FR-03-043, FR-03-045 |
| Related Business Rules | BR-03-001, BR-03-002, BR-03-008, BR-03-010, BR-03-016, BR-03-021, BR-03-023, BR-03-024, BR-G-16, BR-G-20 |
| Dependencies | US-03-04, US-03-07, US-03-08, US-03-09, EPIC-04 goods receipt events |

## User Story
As a consuming module, I want a stable catalog facade and branch-scoped effective medicine data so that inventory, procurement, POS, and dispensing use consistent catalog facts without direct catalog-table coupling.

## Business Value
The facade preserves module boundaries and ensures price, classification, tax, pack, and minimum-stock facts are resolved consistently.

## Preconditions
- The medicine belongs to the caller's Organization.
- Branch-level requests use an assigned Branch or organization-wide scope.

## Acceptance Criteria
### US-03-19-AC1: Resolve branch effective sale information
- **Given** a medicine identified by id or barcode and an accessible Branch
- **When** the caller reads the effective catalog model
- **Then** it returns status, class, pack/split-pack data, base-unit names, effective pack/base-unit price, tax category/rate, storage condition, and default minimum stock.

### US-03-19-AC2: Update last purchase cost idempotently
- **Given** a valid `GoodsReceiptPosted` event with event id and posting time
- **When** the facade consumer receives it
- **Then** `LastPurchaseCost` per base unit and timestamp update only for a later receipt; duplicate event ids are processed at most once and earlier events do not overwrite newer cost.

### US-03-19-AC3: Publish catalog changes transactionally
- **Given** medicine create/update/status/price/classification changes
- **When** each transaction commits
- **Then** the corresponding integration event is written to the transactional outbox in the same transaction and published without duplication by event id.

### US-03-19-AC4: Enforce branch, cost, and Organization boundaries
- **Given** a caller without cost permission, an unassigned Branch, or a medicine/Branch from another Organization
- **When** they request facade data
- **Then** cost fields are omitted, an unassigned Branch returns 403 `COMMON.FORBIDDEN` (CS-07), and foreign Organization resources return 404 with no data leakage.

## Validation Rules
- Medicine id and barcode resolution must be within the token Organization.
- `LastPurchaseCost` is `numeric(19,4)` per base unit; event timestamp ordering controls updates.

## Authorization Rules
- Read operations require `catalog.medicines.read` and Branch access for branch-specific data.
- `LastPurchaseCost` is exposed only with `catalog.costs.read`; cross-Organization lookups return 404. RLS is enabled and forced from MVP.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Missing catalog read permission or unassigned Branch | 403 `COMMON.FORBIDDEN` |
| Medicine id not found | 404 `CATALOG.MEDICINE_NOT_FOUND` |
| Barcode not found | 404 `CATALOG.BARCODE_NOT_FOUND` |
| Other-Organization resource | 404 matching the corresponding non-existent-resource code |

## Edge Cases
- Effective Branch price is override if present, organization default otherwise; change affects only subsequently completed transactions.
- `LastPurchaseCost` is informational and is never used for inventory valuation or COGS.
- Consuming modules call the facade rather than reading catalog tables directly.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-03-098 | Integration | Resolve by medicine id/barcode with all effective sale and reorder fields | US-03-19-AC1 |
| TS-03-099 | Integration | Later receipt updates cost, duplicate event is ignored, older event does not overwrite | US-03-19-AC2 |
| TS-03-100 | Integration | Create/update/status/price/classification events share transaction with outbox | US-03-19-AC3 |
| TS-03-101 | Integration | Cost omission, cross-Branch 403, and cross-Organization 404 (CS-07, CS-08) | US-03-19-AC4 |
