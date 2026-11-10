# US-04-16: Reorder settings and low-stock detection

| Field | Value |
|---|---|
| Story ID | US-04-16 |
| Epic | EPIC-04 |
| Priority | P1 |
| Complexity | M |
| Related Requirements | FR-04-045, FR-04-046 |
| Related Business Rules | BR-04-001, BR-04-025 |
| Dependencies | US-04-07 |

## User Story
As a branch manager, I want to set minimum and maximum stock per medicine and be alerted when sellable stock falls below the minimum so that I reorder before running out.

## Business Value
Prevents stock-outs (BRQ-11) and feeds purchase suggestions (SPEC-05).

## Preconditions
- Medicines exist; outbox and SPEC-10 notification consumers available; job `inventory.low-stock-scan` registered (every 30 min + debounced trigger).

## Acceptance Criteria
### US-04-16-AC1: Create and update a reorder setting
- **Given** a user with `inventory.reorder-settings.manage`
- **When** `PUT …/reorder-settings/M` is sent with min 30, max 120
- **Then** the setting is stored (state `Normal` until evaluated) and audited; min 50 with max 40 returns 422 `INVENTORY.REORDER_SETTING_INVALID`

### US-04-16-AC2: Transition to Low emits one event
- **Given** M has min 30, max 120, PackSize 30, sellable 35, in-transit inbound 0, state `Normal`
- **When** a sale reduces sellable to 18 and the debounced evaluation runs
- **Then** state becomes `Low`, LowStockSince is set, and exactly one `Inventory.StockLevelLowDetected.v1` is emitted with sellableQuantity 18, suggestedOrderQuantityBaseUnits 102, suggestedOrderPacks 4, within 60 s of the sale commit

### US-04-16-AC3: No repeated event while Low
- **Given** M is `Low`
- **When** further sales reduce sellable to 10 and the 30-min scan runs twice
- **Then** no additional `StockLevelLowDetected` event is emitted

### US-04-16-AC4: Restored to Normal
- **Given** M is `Low` with sellable 10
- **When** a receipt raises sellable to 40
- **Then** state becomes `Normal` and one `Inventory.StockLevelRestored.v1` is emitted

### US-04-16-AC5: Expiry-driven drop detected by the scan
- **Given** M has sellable 35 in one batch that enters the do-not-sell window at the business-date change without any movement
- **When** the 30-min scan runs after midnight
- **Then** sellable is 0, state becomes `Low`, and the event is emitted

### US-04-16-AC6: Low-stock list for purchasing
- **Given** 3 medicines are `Low` in branch A
- **When** a user with `inventory.stock.read` calls `GET …/inventory/low-stock`
- **Then** 3 rows are returned with sellable, min, max, in-transit inbound, suggested quantity (base units and packs), and LowStockSince

### US-04-16-AC7: Authorization
- **Given** a cashier without `inventory.reorder-settings.manage`, a manager not assigned to branch B, and a medicine of another organization
- **When** each upserts a setting
- **Then** the responses are 403 `IDENTITY.PERMISSION_DENIED`, 403 `IDENTITY.BRANCH_ACCESS_DENIED`, and 404 `COMMON.NOT_FOUND`

## Validation Rules
- VR-04-019; CSV import ≤ 5,000 rows with row errors as in US-04-10.

## Authorization Rules
- Upsert/deactivate/import: `inventory.reorder-settings.manage`; read and low-stock list: `inventory.stock.read`.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Min ≥ Max or negative | 422 `INVENTORY.REORDER_SETTING_INVALID` |
| Missing permission | 403 `IDENTITY.PERMISSION_DENIED` |
| Unassigned branch | 403 `IDENTITY.BRANCH_ACCESS_DENIED` |
| Stale ETag | 412 `COMMON.CONCURRENCY_CONFLICT` |

## Edge Cases
- Deactivating a setting while `Low` emits no event and resets state to `Normal`.
- State transitions use a conditional update (`WHERE LowStockState = …`) so concurrent evaluations emit at most one event.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-04-110 | API | Upsert setting; invalid min/max → 422 | US-04-16-AC1 |
| TS-04-111 | Integration | Normal→Low emits one event with correct suggestion and ≤ 60 s latency | US-04-16-AC2 |
| TS-04-112 | Integration | No repeated events while Low across scans; concurrent evaluations emit once | US-04-16-AC3 |
| TS-04-113 | Integration | Low→Normal emits StockLevelRestored | US-04-16-AC4 |
| TS-04-114 | Integration | Scan detects drop caused by do-not-sell window without movement | US-04-16-AC5 |
| TS-04-115 | API | Low-stock list fields | US-04-16-AC6 |
| TS-04-116 | API | 403 permission, 403 branch (CS-07), 404 other org (CS-08) | US-04-16-AC7 |
