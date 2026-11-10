# US-05-17: Post a Supplier Return and Debit Note

| Field | Value |
|---|---|
| Story ID | US-05-17 |
| Epic | EPIC-05 |
| Priority | P1 |
| Complexity | M |
| Related Requirements | FR-05-044, FR-05-055 |
| Related Business Rules | BR-G-05, BR-G-09, BR-G-16, BR-G-19, BR-G-25, BR-G-31 |
| Dependencies | US-05-16, SPEC-04 |

## User Story
As a Accountant or authorized procurement user, I want to post a supplier return and debit note, so that supplier stock and balances are traceable and accurate.

## Business Value
Supports SPEC-05's V1 procure-to-pay scope while preserving branch-level inventory and financial traceability.

## Preconditions
- Source records, settings, permissions, and integration contracts required by FR-05-044, FR-05-055 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.
- Inventory calls use SPEC-04 `IInventoryAllocation` / posting contracts; lock timeout is 3 s and posting is atomic.

## Acceptance Criteria
### US-05-17-AC1: Successful result
- **Given** Idempotent return posting
- **When** Draft supplier return reserves 10 base units at EGP 12.5000 unit cost
- **Then** posting with Idempotency-Key creates one CAI01-SRT-2026-NNNNNN, movement for -10 units, releases reservation, DebitNote EGP 125.00 and outbox/audit rows; repeated same-key same-body returns identical response.

### US-05-17-AC2: Validation and negative case
- **Given** same key different body returns 422 COMMON.IDEMPOTENCY_KEY_REUSED; injected failure rolls back all effects
- **When** the system validates the request at the required state transition
- **Then** the specified error is returned and no partial stock, ledger, prescription, or document change remains.

### US-05-17-AC3: Permission denied
- **Given** procurement.supplier-returns.read lacks the required permission or is assigned only to another Branch
- **When** the user calls the branch-scoped endpoint
- **Then** the response is 403 `COMMON.FORBIDDEN`; no protected data or change is returned.

### US-05-17-AC4: Organization isolation
- **Given** the requested record belongs to another Organization
- **When** the caller requests the record by id
- **Then** the response is 404 `COMMON.NOT_FOUND` and discloses no record data (CS-08).

## Validation Rules
- Apply SPEC-05 validation rules for FR-05-044, FR-05-055; quantities use integer packs or base units as stated per field.

## Authorization Rules
- Require procurement.supplier-returns.read.
- Backend enforces token organization and branch assignment; RLS is not replaced by UI filtering.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Invalid input / prohibited state | 422 `COMMON.VALIDATION_FAILED` or the specific validation code listed in FR-05-044, FR-05-055 |
| Missing permission or branch assignment | 403 `COMMON.FORBIDDEN` |
| Record belongs to another Organization | 404 `COMMON.NOT_FOUND` |
| Inventory allocation lock exceeds 3 s | 503 `COMMON.LOCK_TIMEOUT` (where inventory allocation is invoked)

## Edge Cases
- Monetary values use decimal arithmetic and BR-G-18 rounding; base-unit quantities remain integers.
- Duplicate posting requests use the required Idempotency-Key behavior and never duplicate ledger, stock, or sequence effects.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-05-073 | Integration | Reference behavior and exact values for FR-05-044, FR-05-055 | US-05-17-AC1 |
| TS-05-074 | Integration | Negative validation path, no partial effect; COMMON.VALIDATION_FAILED | US-05-17-AC2 |
| TS-05-075 | Security | Missing permission and cross-branch access return 403 (CS-07) | US-05-17-AC3 |
| TS-05-076 | Security | Cross-organization id returns 404 without data (CS-08) | US-05-17-AC4 |

