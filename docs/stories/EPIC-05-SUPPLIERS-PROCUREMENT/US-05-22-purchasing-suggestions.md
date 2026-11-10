# US-05-22: Purchasing Suggestions from Reorder Levels

| Field | Value |
|---|---|
| Story ID | US-05-22 |
| Epic | EPIC-05 |
| Priority | P2 |
| Complexity | M |
| Related Requirements | FR-05-052 |
| Related Business Rules | BR-G-02, BR-G-06 |
| Dependencies | US-05-09, SPEC-04 ReorderSetting |

## User Story
As Inventory Staff, I want reorder-based purchasing suggestions converted into draft purchase orders so that the branch can replenish medicines below minimum stock.

## Business Value
Supports SPEC-05's Future procure-to-pay scope while preserving branch-level inventory and financial traceability.

## Preconditions
- Source records, settings, permissions, and integration contracts required by FR-05-052 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.

## Acceptance Criteria
### US-05-22-AC1: Successful result
- **Given** Reorder suggestion threshold
- **When** Medicine A PackSize 10, sellable on-hand 30, outstanding on-order 20, min 60, max 120; latest Posted receipt supplier S1
- **Then** suggested packs = ceil((120 - 50)/10) = 7; preferred supplier S1; Create PO creates one Draft with 7 packs; low-stock event flag is shown.

### US-05-22-AC2: Validation and negative case
- **Given** Medicine above minimum generates no suggestion; inactive medicine or no assigned branch is excluded
- **When** the system validates the request at the required state transition
- **Then** the specified error is returned and no partial stock, ledger, prescription, or document change remains.

### US-05-22-AC3: Permission denied
- **Given** procurement.purchase-orders.read lacks the required permission or is assigned only to another Branch
- **When** the user calls the branch-scoped endpoint
- **Then** the response is 403 `COMMON.FORBIDDEN`; no protected data or change is returned.

### US-05-22-AC4: Organization isolation
- **Given** the requested record belongs to another Organization
- **When** the caller requests the record by id
- **Then** the response is 404 `COMMON.NOT_FOUND` and discloses no record data (CS-08).

## Validation Rules
- Apply SPEC-05 validation rules for FR-05-052; quantities use integer packs or base units as stated per field.

## Authorization Rules
- Require procurement.purchase-orders.read.
- Backend enforces token organization and branch assignment; RLS is not replaced by UI filtering.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Invalid input / prohibited state | 422 `COMMON.VALIDATION_FAILED` or the specific validation code listed in FR-05-052 |
| Missing permission or branch assignment | 403 `COMMON.FORBIDDEN` |
| Record belongs to another Organization | 404 `COMMON.NOT_FOUND` |
| Inventory allocation lock exceeds 3 s | 503 `COMMON.LOCK_TIMEOUT` (where inventory allocation is invoked)

## Edge Cases
- Monetary values use decimal arithmetic and BR-G-18 rounding; base-unit quantities remain integers.
- Duplicate posting requests use the required Idempotency-Key behavior and never duplicate ledger, stock, or sequence effects.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-05-093 | Integration | Reference behavior and exact values for FR-05-052 | US-05-22-AC1 |
| TS-05-094 | Integration | Negative validation path, no partial effect; COMMON.VALIDATION_FAILED | US-05-22-AC2 |
| TS-05-095 | Security | Missing permission and cross-branch access return 403 (CS-07) | US-05-22-AC3 |
| TS-05-096 | Security | Cross-organization id returns 404 without data (CS-08) | US-05-22-AC4 |

