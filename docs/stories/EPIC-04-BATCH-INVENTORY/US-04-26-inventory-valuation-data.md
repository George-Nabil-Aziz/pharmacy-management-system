# US-04-26: Inventory valuation snapshot and as-of valuation

| Field | Value |
|---|---|
| Story ID | US-04-26 |
| Epic | EPIC-04 |
| Priority | P1 |
| Complexity | M |
| Related Requirements | FR-04-062 |
| Related Business Rules | BR-G-18, BR-G-23, BR-04-020, BR-04-029, BR-04-031 |
| Dependencies | US-04-02 |

## User Story
As an accountant, I want daily inventory valuation data and the value of stock as of any past moment so that finance reports show inventory valuation correctly.

## Business Value
Supplies "Inventory valuation = Σ(on-hand × batch unit cost)" (conventions §2) to SPEC-09.

## Preconditions
- Job `inventory.valuation-snapshot` runs per branch at 00:30 branch local for the previous business date.

## Acceptance Criteria
### US-04-26-AC1: Nightly snapshot buckets
- **Given** at end of business date 2026-11-09, medicine M in branch A has sellable batch 40 × 12.5000, near-expiry batch 10 × 13.0000, expired batch 3 × 11.0000, quarantined batch 7 × 12.0000
- **When** the snapshot job runs at 00:30 on 2026-11-10
- **Then** one `InventoryValuationSnapshot` row (A, 2026-11-09, M) stores quantities 40/10/3/7 and values 500.00/130.00/33.00/84.00, computed from movements with BusinessDate ≤ 2026-11-09

### US-04-26-AC2: In-transit attributed to source
- **Given** 15 units × 12.5000 of M are in transit from A to C at end of day
- **When** the snapshot runs
- **Then** A's row has InTransitOutbound quantity 15 and value 187.50; C's row has no in-transit value

### US-04-26-AC3: As-of valuation equals ledger
- **Given** a user with `reports.inventory.read`
- **When** `GET …/inventory/valuation?asOf=2026-11-09T14:00:00+02:00` is called
- **Then** per medicine on-hand and value equal Σ QuantityDelta and Σ QuantityDelta × UnitCost of movements with OccurredAt ≤ asOf, and the branch total equals the sum of lines

### US-04-26-AC4: Idempotent rerun
- **Given** the snapshot for (A, 2026-11-09) exists
- **When** the job reruns for that date
- **Then** rows are upserted with identical values and no duplicates exist

### US-04-26-AC5: Authorization
- **Given** an inventory user without `reports.inventory.read`, an accountant not assigned to branch B without organization-wide scope, and a branch of another organization
- **When** each requests valuation
- **Then** the responses are 403 `IDENTITY.PERMISSION_DENIED`, 403 `IDENTITY.BRANCH_ACCESS_DENIED`, and 404 `COMMON.NOT_FOUND`

## Validation Rules
- `asOf` ≤ now and ≥ branch go-live date; otherwise 400 `COMMON.VALIDATION_FAILED`.

## Authorization Rules
- `reports.inventory.read` + branch assignment; organization-wide snapshot list requires organization-wide scope.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| asOf in the future | 400 `COMMON.VALIDATION_FAILED` |
| Missing permission | 403 `IDENTITY.PERMISSION_DENIED` |
| Unassigned branch | 403 `IDENTITY.BRANCH_ACCESS_DENIED` |
| Other-organization branch | 404 `COMMON.NOT_FOUND` |

## Edge Cases
- Status buckets in the snapshot use statuses as of the business date (expiry vs business date, quarantine audit timestamps), not current status.
- Values are rounded to 2 decimals per line (BR-G-18); totals are sums of rounded lines.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-04-181 | Integration | Snapshot buckets and values from ledger | US-04-26-AC1 |
| TS-04-182 | Integration | In-transit valued at source only | US-04-26-AC2 |
| TS-04-183 | Integration | As-of valuation equals ledger sums; NFR-04-012 p95 ≤ 5 s | US-04-26-AC3 |
| TS-04-184 | Integration | Rerun upserts without duplicates | US-04-26-AC4 |
| TS-04-185 | API | 403 permission, 403 branch (CS-07), 404 other org (CS-08) | US-04-26-AC5 |
