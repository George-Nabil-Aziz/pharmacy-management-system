# US-05-19: Allocate Unapplied Credit and Reverse a Payment

| Field | Value |
|---|---|
| Story ID | US-05-19 |
| Epic | EPIC-05 |
| Priority | P1 |
| Complexity | M |
| Related Requirements | FR-05-047, FR-05-048, FR-05-055 |
| Related Business Rules | BR-G-16, BR-G-18, BR-G-25 |
| Dependencies | US-05-18 |

## User Story
As a Accountant or authorized procurement user, I want to allocate unapplied credit and reverse a payment, so that supplier stock and balances are traceable and accurate.

## Business Value
Supports SPEC-05's V1 procure-to-pay scope while preserving branch-level inventory and financial traceability.

## Preconditions
- Source records, settings, permissions, and integration contracts required by FR-05-047, FR-05-048, FR-05-055 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.

## Acceptance Criteria
### US-05-19-AC1: Successful result
- **Given** Unapplied allocation and compensating reversal
- **When** Payment P has EGP 250.00 unallocated credit; invoice I has EGP 200.00 outstanding
- **Then** allocation of EGP 200.00 sets invoice Paid; reversal appends PaymentReversal credit EGP 600.00 and compensating allocation, restoring invoice balance and status; repeated reversal rejected.

### US-05-19-AC2: Validation and negative case
- **Given** Second reversal returns 409 PROCUREMENT.PAYMENT_ALREADY_REVERSED; amount > available returns 422 PROCUREMENT.ALLOCATION_EXCEEDS_PAYMENT
- **When** the system validates the request at the required state transition
- **Then** the specified error is returned and no partial stock, ledger, prescription, or document change remains.

### US-05-19-AC3: Permission denied
- **Given** procurement.supplier-ledger.read lacks the required permission or is assigned only to another Branch
- **When** the user calls the branch-scoped endpoint
- **Then** the response is 403 `COMMON.FORBIDDEN`; no protected data or change is returned.

### US-05-19-AC4: Organization isolation
- **Given** the requested record belongs to another Organization
- **When** the caller requests the record by id
- **Then** the response is 404 `COMMON.NOT_FOUND` and discloses no record data (CS-08).

## Validation Rules
- Apply SPEC-05 validation rules for FR-05-047, FR-05-048, FR-05-055; quantities use integer packs or base units as stated per field.

## Authorization Rules
- Require procurement.supplier-ledger.read.
- Backend enforces token organization and branch assignment; RLS is not replaced by UI filtering.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Invalid input / prohibited state | 422 `COMMON.VALIDATION_FAILED` or the specific validation code listed in FR-05-047, FR-05-048, FR-05-055 |
| Missing permission or branch assignment | 403 `COMMON.FORBIDDEN` |
| Record belongs to another Organization | 404 `COMMON.NOT_FOUND` |
| Inventory allocation lock exceeds 3 s | 503 `COMMON.LOCK_TIMEOUT` (where inventory allocation is invoked)

## Edge Cases
- Monetary values use decimal arithmetic and BR-G-18 rounding; base-unit quantities remain integers.
- Duplicate posting requests use the required Idempotency-Key behavior and never duplicate ledger, stock, or sequence effects.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-05-081 | Integration | Reference behavior and exact values for FR-05-047, FR-05-048, FR-05-055 | US-05-19-AC1 |
| TS-05-082 | Integration | Negative validation path, no partial effect; COMMON.VALIDATION_FAILED | US-05-19-AC2 |
| TS-05-083 | Security | Missing permission and cross-branch access return 403 (CS-07) | US-05-19-AC3 |
| TS-05-084 | Security | Cross-organization id returns 404 without data (CS-08) | US-05-19-AC4 |

