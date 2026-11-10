# US-05-24: Supplier Price Comparison

| Field | Value |
|---|---|
| Story ID | US-05-24 |
| Epic | EPIC-05 |
| Priority | P2 |
| Complexity | S |
| Related Requirements | FR-05-054 |
| Related Business Rules | BR-G-18, BR-G-20 |
| Dependencies | US-05-08, US-05-13 |

## User Story
As an Accountant or Manager, I want to compare posted supplier purchase prices for a medicine so that I can review cost, bonus, and effective unit-cost history.

## Business Value
Supports SPEC-05's Future procure-to-pay scope while preserving branch-level inventory and financial traceability.

## Preconditions
- Source records, settings, permissions, and integration contracts required by FR-05-054 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.

## Acceptance Criteria
### US-05-24-AC1: Successful result
- **Given** Supplier price comparison
- **When** Medicine A has Posted receipts: S1 10 packs EGP 100.00/pack, S1 20 packs EGP 120.00/pack; S2 5 packs EGP 90.00/pack; PackSize 10
- **Then** S1 weighted average EGP 113.33/pack, EGP 11.3333/base unit, bonus ratio and 2 receipts shown; S2 EGP 90.00/pack; only Posted receipt/invoice lines count.

### US-05-24-AC2: Validation and negative case
- **Given** Draft/Reversed receipts excluded; no data yields empty comparison without inferred costs
- **When** the system validates the request at the required state transition
- **Then** the specified error is returned and no partial stock, ledger, prescription, or document change remains.

### US-05-24-AC3: Permission denied
- **Given** procurement.purchase-orders.read lacks the required permission or is assigned only to another Branch
- **When** the user calls the branch-scoped endpoint
- **Then** the response is 403 `COMMON.FORBIDDEN`; no protected data or change is returned.

### US-05-24-AC4: Organization isolation
- **Given** the requested record belongs to another Organization
- **When** the caller requests the record by id
- **Then** the response is 404 `COMMON.NOT_FOUND` and discloses no record data (CS-08).

## Validation Rules
- Apply SPEC-05 validation rules for FR-05-054; quantities use integer packs or base units as stated per field.

## Authorization Rules
- Require procurement.purchase-orders.read.
- Backend enforces token organization and branch assignment; RLS is not replaced by UI filtering.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Invalid input / prohibited state | 422 `COMMON.VALIDATION_FAILED` or the specific validation code listed in FR-05-054 |
| Missing permission or branch assignment | 403 `COMMON.FORBIDDEN` |
| Record belongs to another Organization | 404 `COMMON.NOT_FOUND` |
| Inventory allocation lock exceeds 3 s | 503 `COMMON.LOCK_TIMEOUT` (where inventory allocation is invoked)

## Edge Cases
- Monetary values use decimal arithmetic and BR-G-18 rounding; base-unit quantities remain integers.
- Duplicate posting requests use the required Idempotency-Key behavior and never duplicate ledger, stock, or sequence effects.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-05-101 | Integration | Reference behavior and exact values for FR-05-054 | US-05-24-AC1 |
| TS-05-102 | Integration | Negative validation path, no partial effect; COMMON.VALIDATION_FAILED | US-05-24-AC2 |
| TS-05-103 | Security | Missing permission and cross-branch access return 403 (CS-07) | US-05-24-AC3 |
| TS-05-104 | Security | Cross-organization id returns 404 without data (CS-08) | US-05-24-AC4 |

