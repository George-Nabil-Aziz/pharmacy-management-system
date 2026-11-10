# US-05-09: Create and Edit a Draft Purchase Order

| Field | Value |
|---|---|
| Story ID | US-05-09 |
| Epic | EPIC-05 |
| Priority | P1 |
| Complexity | M |
| Related Requirements | FR-05-026 |
| Related Business Rules | BR-05-001, BR-G-18, BR-G-20 |
| Dependencies | US-05-01, SPEC-02, SPEC-03 |

## User Story
As a Branch Manager or Inventory Staff member, I want to create and edit a draft purchase order, so that supplier stock and balances are traceable and accurate.

## Business Value
Supports SPEC-05's V1 procure-to-pay scope while preserving branch-level inventory and financial traceability.

## Preconditions
- Source records, settings, permissions, and integration contracts required by FR-05-026 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.

## Acceptance Criteria
### US-05-09-AC1: Successful result
- **Given** PO header and lines
- **When** create a Draft purchase order for branch CAI01 and Active supplier S1, expected date 2026-11-20, and two lines: Medicine A 10 packs at EGP 120.0000 per pack with PackSize 20; Medicine B 4 packs at EGP 50.0000 per pack
- **Then** receive a 201 Draft PO number CAI01-PO-2026-NNNNNN, line snapshots, and expected merchandise total EGP 1,400.00.

### US-05-09-AC2: Validation and negative case
- **Given** An expected delivery date of 2026-11-09 is accepted on business date 2026-11-09; date 2026-11-08 returns 400 PROCUREMENT.EXPECTED_DATE_INVALID; 0 ordered packs returns 400 PROCUREMENT.INVALID_QUANTITY
- **When** the system validates the request at the required state transition
- **Then** the specified error is returned and no partial stock, ledger, prescription, or document change remains.

### US-05-09-AC3: Permission denied
- **Given** procurement.purchase-orders.read lacks the required permission or is assigned only to another Branch
- **When** the user calls the branch-scoped endpoint
- **Then** the response is 403 `COMMON.FORBIDDEN`; no protected data or change is returned.

### US-05-09-AC4: Organization isolation
- **Given** the requested record belongs to another Organization
- **When** the caller requests the record by id
- **Then** the response is 404 `COMMON.NOT_FOUND` and discloses no record data (CS-08).

## Validation Rules
- Apply SPEC-05 validation rules for FR-05-026; quantities use integer packs or base units as stated per field.

## Authorization Rules
- Require procurement.purchase-orders.read.
- Backend enforces token organization and branch assignment; RLS is not replaced by UI filtering.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Invalid input / prohibited state | 422 `COMMON.VALIDATION_FAILED` or the specific validation code listed in FR-05-026 |
| Missing permission or branch assignment | 403 `COMMON.FORBIDDEN` |
| Record belongs to another Organization | 404 `COMMON.NOT_FOUND` |
| Inventory allocation lock exceeds 3 s | 503 `COMMON.LOCK_TIMEOUT` (where inventory allocation is invoked)

## Edge Cases
- Monetary values use decimal arithmetic and BR-G-18 rounding; base-unit quantities remain integers.
- Duplicate posting requests use the required Idempotency-Key behavior and never duplicate ledger, stock, or sequence effects.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-05-041 | Integration | Reference behavior and exact values for FR-05-026 | US-05-09-AC1 |
| TS-05-042 | Integration | Negative validation path, no partial effect; COMMON.VALIDATION_FAILED | US-05-09-AC2 |
| TS-05-043 | Security | Missing permission and cross-branch access return 403 (CS-07) | US-05-09-AC3 |
| TS-05-044 | Security | Cross-organization id returns 404 without data (CS-08) | US-05-09-AC4 |

