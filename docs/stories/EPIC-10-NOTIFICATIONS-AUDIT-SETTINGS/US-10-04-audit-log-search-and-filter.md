# US-10-04: Audit Log Search and Filter

| Field | Value |
|---|---|
| Story ID | US-10-04 |
| Epic | EPIC-10 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-10-012, FR-10-013 |
| Related Business Rules | BR-G-17, BR-10-002 |
| Dependencies | US-10-01 |

## User Story
As an Owner or Branch Manager, I want to search and filter audit entries and open an entry's details so that I can investigate who did what, where, and when.

## Business Value
Makes the audit trail usable for daily supervision (e.g., price changes, voids) and incident investigation.

## Preconditions
- Audit entries exist (US-10-01). User holds `audit.logs.read`.

## Acceptance Criteria
### US-10-04-AC1: Filtered search with cursor pagination
- **Given** an Owner with organization-wide scope and 500 `SALES.SALE_VOIDED` entries in November 2026
- **When** they call `GET /api/v1/audit/logs?from=2026-11-01&to=2026-11-30&eventCodes=SALES.SALE_VOIDED&limit=50`
- **Then** 50 entries are returned newest first with a `nextCursor`, and following cursors returns all 500 entries exactly once

### US-10-04-AC2: Combined filters
- **Given** entries from several actors and entities
- **When** the Owner filters by `actorUserId`, `entityType=Medicine`, `entityId`, and `outcome=Succeeded`
- **Then** only entries matching all filters are returned

### US-10-04-AC3: Entry detail with diff and seal status
- **Given** a sealed and verified `CATALOG.PRICE_CHANGED` entry
- **When** the Owner calls `GET /api/v1/audit/logs/{id}`
- **Then** the response includes the diff `{ "price": { "before": "45.0000", "after": "47.5000" } }`, metadata, correlation id, and `sealStatus = Verified`

### US-10-04-AC4: Branch scoping for branch-scoped users
- **Given** a Branch Manager assigned only to branch `CAI01` with `audit.logs.read`
- **When** they search without a branch filter
- **Then** only entries with `BranchId = CAI01` are returned; entries of other branches and entries with null `BranchId` (e.g., role changes) are excluded, and page sizes are not reduced by post-filtering

### US-10-04-AC5: Cross-branch filter denied
- **Given** the same Branch Manager
- **When** they search with `branchId` of branch `ALX02` (not assigned)
- **Then** the API returns 403 `COMMON.FORBIDDEN`

### US-10-04-AC6: Cross-organization entry hidden
- **Given** an Owner of organization A
- **When** they request `GET /api/v1/audit/logs/{id}` for an entry of organization B
- **Then** the API returns 404 `COMMON.NOT_FOUND`

### US-10-04-AC7: Invalid date range and permission denied
- **Given** an Owner, and a Cashier without `audit.logs.read`
- **When** the Owner searches with a 400-day range, and the Cashier searches with a valid range
- **Then** the Owner receives 400 `AUDIT.INVALID_DATE_RANGE` and the Cashier receives 403 `COMMON.FORBIDDEN`

### US-10-04-AC8: Audit search UI
- **Given** an Owner on the Audit page in Arabic (RTL)
- **When** they apply filters (date range, event type picker with localized names, user, branch) and open an entry
- **Then** results show localized event names, timestamps in the branch time zone, and the diff as a before/after table; identifiers render LTR

## Validation Rules
- VR-10-001 date range required, ≤ 366 days; VR-10-002 `limit` 1–200; VR-10-003 event codes registered; VR-10-004 branch in scope.

## Authorization Rules
- `audit.logs.read`; organization from token; branch scoping per FR-10-013 applied in the query.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Range > 366 days or `from` > `to` | 400 `AUDIT.INVALID_DATE_RANGE` |
| Unknown event code filter | 400 `AUDIT.UNKNOWN_EVENT_CODE` |
| `limit` = 500 | 400 `COMMON.VALIDATION_FAILED` |
| Unassigned branch filter | 403 `COMMON.FORBIDDEN` |
| Entry of another organization | 404 `COMMON.NOT_FOUND` |

## Edge Cases
- Unsealed entries appear in results with `sealStatus = Unsealed`.
- Searching by `correlationId` returns all entries of one request across modules.
- Entries of deactivated users show the user's name with a "deactivated" marker.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-10-021 | API | Cursor pagination over 500 entries, no duplicates or gaps | US-10-04-AC1 |
| TS-10-022 | API | Combined filters return intersection only | US-10-04-AC2 |
| TS-10-023 | API | Detail returns diff, metadata, seal status | US-10-04-AC3 |
| TS-10-024 | Security | Branch-scoped manager sees only own-branch entries; null-branch entries excluded; full pages (CS-07) | US-10-04-AC4, US-10-04-AC5 |
| TS-10-025 | Security | Cross-organization entry id returns 404 (CS-08) | US-10-04-AC6 |
| TS-10-026 | API | 400-day range → 400; Cashier → 403 | US-10-04-AC7 |
| TS-10-027 | E2E | Audit UI in ar/RTL with localized names and diff table | US-10-04-AC8 |
| TS-10-028 | Performance | 31-day indexed search on 50M entries first page p95 ≤ 2 s (NFR-10-005) | US-10-04-AC1 |
