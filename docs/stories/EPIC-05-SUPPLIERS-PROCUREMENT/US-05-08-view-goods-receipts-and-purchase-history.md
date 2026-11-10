# US-05-08: View goods receipts and purchase history

| Field | Value |
|---|---|
| Story ID | US-05-08 |
| Epic | EPIC-05 |
| Priority | P1 |
| Complexity | S |
| Related Requirements | FR-05-024, FR-05-025 |
| Related Business Rules | BR-05-001, BR-G-17 |
| Dependencies | US-05-06 |

## User Story
As a Branch Manager, I want to search goods receipts and see the purchase history of a medicine or a supplier so that I can answer "when did we last buy this, from whom, at what cost and bonus?" before reordering.

## Business Value
Purchase history drives negotiation with distributors (cost and bonus terms) and supports traceability questions (which supplier delivered a given batch).

## Preconditions
- User holds `procurement.receipts.read` and is assigned to the branch (or has organization-wide scope).

## Acceptance Criteria

### US-05-08-AC1: List and filter receipts
- **Given** branch CAI01 has 120 receipts (100 Posted, 15 Draft, 5 Reversed)
- **When** the user calls GET `/api/v1/branches/{CAI01}/goods-receipts?status=Posted&supplierId={S1}&from=2026-10-01&to=2026-10-31&page=1&pageSize=25`
- **Then** the response contains only Posted receipts of S1 posted in October 2026 (by branch business date), sorted by posting date descending, with `totalCount` matching, p95 ≤ 500 ms

### US-05-08-AC2: Receipt detail with batches
- **Given** a Posted receipt
- **When** the user opens its detail
- **Then** each line shows medicine, batch id, batch number, expiry, paid and bonus packs, unit cost per pack, discount %, net amount, effective unit cost, whether the batch was created or incremented, and any shelf-life override (user, reason, remaining days)

### US-05-08-AC3: Purchase history by medicine
- **Given** medicine M1 was received 4 times in CAI01 (one of them later Reversed)
- **When** the user calls GET `/api/v1/branches/{CAI01}/purchase-history?medicineId={M1}`
- **Then** exactly 3 rows are returned (Reversed excluded) with posting date, supplier, receipt number, batch, paid/bonus packs, unit cost per pack, discount %, effective unit cost, newest first

### US-05-08-AC4: Org-wide history requires scope
- **Given** a Manager assigned only to CAI01 without `reports.organization.read`, and an Owner with organization-wide scope
- **When** each calls GET `/api/v1/purchase-history?supplierId={S1}`
- **Then** the Manager receives 403 `COMMON.FORBIDDEN` and the Owner receives rows from all branches with a branch column

### US-05-08-AC5: Branch and permission denied
- **Given** a user assigned to CAI01 only, and a Cashier without `procurement.receipts.read`
- **When** the first user lists receipts of ALX01 and the Cashier lists receipts of CAI01
- **Then** both receive 403 `COMMON.FORBIDDEN`

## Validation Rules
`from` ≤ `to`; date range ≤ 366 days for history queries (`COMMON.VALIDATION_FAILED`); `pageSize` ≤ 100.

## Authorization Rules
- `procurement.receipts.read` + branch assignment; org-wide history additionally requires organization-wide scope or `reports.organization.read`.
- Unit cost columns are hidden for users without `procurement.receipts.read`; no other cost exposure path exists in this story.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Unassigned branch / missing permission | 403 `COMMON.FORBIDDEN` |
| Receipt id of another organization or branch | 404 `COMMON.NOT_FOUND` |
| Invalid date range | 400 `COMMON.VALIDATION_FAILED` |

## Edge Cases
- Draft receipts are visible only in the list (status filter), never in purchase history.
- Medicines that are now Inactive still appear in history.
- Export of history to CSV/XLSX uses SPEC-09's export framework and requires `reports.export`.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-05-036 | Integration / Performance | Filter by status, supplier, date range; sorting; paging; p95 ≤ 500 ms with 50,000 receipts | US-05-08-AC1 |
| TS-05-037 | Integration | Detail shows created vs incremented batches and override metadata | US-05-08-AC2 |
| TS-05-038 | Integration | History excludes Draft and Reversed receipts | US-05-08-AC3 |
| TS-05-039 | Security | Org-wide history 403 without scope; Owner sees all branches | US-05-08-AC4 |
| TS-05-040 | Security | Unassigned branch 403 (CS-07); no-permission 403; other-org receipt id 404 (CS-08) | US-05-08-AC5 |
