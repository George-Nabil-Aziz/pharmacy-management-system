# US-04-08: Stock card and movement history

| Field | Value |
|---|---|
| Story ID | US-04-08 |
| Epic | EPIC-04 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-04-030, FR-04-031 |
| Related Business Rules | BR-G-05, BR-G-25, BR-04-006 |
| Dependencies | US-04-02 |

## User Story
As an inventory staff member or accountant, I want a stock card per medicine and batch showing every movement with its running balance and source document so that I can explain any quantity.

## Business Value
Full traceability for investigations, disputes, and audits (BRQ-04, BRQ-12).

## Preconditions
- Movements exist; source document numbers are resolvable through module query facades.

## Acceptance Criteria
### US-04-08-AC1: Ordered stock card with running balance
- **Given** batch B of medicine M has movements OpeningBalance +100, Sale −3, SalesReturn +1, AdjustmentDecrease −2
- **When** a user with `inventory.movements.read` calls `GET /api/v1/branches/A/inventory/medicines/M/stock-card?batchId=B`
- **Then** rows are returned in BatchSequence order with balanceAfter 100, 97, 98, 96, each with type, quantityDelta, source document type, document number, link, user display name, occurredAt (branch local time), and businessDate

### US-04-08-AC2: Cursor pagination and filters
- **Given** medicine M has 1,500 movements across 4 batches
- **When** the card is requested with `limit=200`, then with the returned `cursor`, and with `type=Sale&from=2026-10-01&to=2026-10-31`
- **Then** pages contain 200 rows without duplicates or gaps, the last page has no `nextCursor`, and the filtered call returns only Sale movements with business dates in October 2026; `limit=201` returns 400 `COMMON.VALIDATION_FAILED`

### US-04-08-AC3: Export
- **Given** a user with `inventory.movements.read` and `reports.export`
- **When** the stock card export is requested for ≤ 100,000 rows as XLSX
- **Then** a file is produced with the same columns and Arabic/English headers per user language; for > 100,000 rows a background export is created (202 with export id) and completion is notified

### US-04-08-AC4: Cost columns gated
- **Given** a user without `reports.inventory.read`
- **When** the stock card or export is requested
- **Then** unitCost and value columns are absent

### US-04-08-AC5: Authorization
- **Given** a user without `inventory.movements.read`, a user not assigned to branch B, and a medicine id of another organization
- **When** each requests a stock card
- **Then** the responses are 403 `IDENTITY.PERMISSION_DENIED`, 403 `IDENTITY.BRANCH_ACCESS_DENIED`, and 404 `COMMON.NOT_FOUND`; export without `reports.export` is 403 `IDENTITY.PERMISSION_DENIED`

## Validation Rules
- `limit` ≤ 200; `from` ≤ `to`; `type` ∈ 15 movement types.

## Authorization Rules
- `inventory.movements.read` + branch assignment; export also `reports.export`; cost columns `reports.inventory.read`.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Invalid limit or dates | 400 `COMMON.VALIDATION_FAILED` |
| Missing permission | 403 `IDENTITY.PERMISSION_DENIED` |
| Unassigned branch | 403 `IDENTITY.BRANCH_ACCESS_DENIED` |
| Other-organization medicine/batch | 404 `COMMON.NOT_FOUND` |

## Edge Cases
- Source documents the user cannot open (e.g., a sale without `sales.sales.read`) show number only, no link.
- CSV export escapes cells starting with `=`, `+`, `-`, `@`.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-04-054 | Integration | Stock card ordering and running balance across movement types | US-04-08-AC1 |
| TS-04-055 | API | Cursor pagination without gaps/duplicates; type/date filters; limit validation | US-04-08-AC2 |
| TS-04-056 | Integration | XLSX export ≤ 100,000 rows sync; > 100,000 rows background export | US-04-08-AC3 |
| TS-04-057 | API | Cost columns absent without reports.inventory.read | US-04-08-AC4 |
| TS-04-058 | API | 403 permission, 403 branch (CS-07), 404 other org (CS-08), export without reports.export | US-04-08-AC5 |
| TS-04-059 | Performance | NFR-04-004: first page p95 ≤ 300 ms at 20 million movements | US-04-08-AC2 |
