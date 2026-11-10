# US-05-23: Supplier Performance Metrics

| Field | Value |
|---|---|
| Story ID | US-05-23 |
| Epic | EPIC-05 |
| Priority | P2 |
| Complexity | M |
| Related Requirements | FR-05-053 |
| Related Business Rules | BR-G-18, BR-G-23 |
| Dependencies | US-05-08, US-05-12, US-05-17 |

## User Story
As an Owner or Manager, I want supplier delivery, fill, price variance, and return metrics for a period so that I can compare supplier performance using posted records.

## Business Value
Supports SPEC-05's Future procure-to-pay scope while preserving branch-level inventory and financial traceability.

## Preconditions
- Source records, settings, permissions, and integration contracts required by FR-05-053 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.

## Acceptance Criteria
### US-05-23-AC1: Successful result
- **Given** Performance metric formulas
- **When** Supplier S1 has two eligible POs: first receipt 2 days late, second on time; ordered 10 packs, received 8 and 10; receipt net values EGP 800.00 and EGP 1,000.00; returns EGP 90.00
- **Then** on-time delivery 50.0%; fill rate 90.0%; return rate 5.0%; price variance uses weighted formula and displays 1 decimal; only POs with expected date and >=1 receipt count for on-time.

### US-05-23-AC2: Validation and negative case
- **Given** no eligible receipts returns null/zero according to report contract and does not divide by zero; reversed receipts excluded
- **When** the system validates the request at the required state transition
- **Then** the specified error is returned and no partial stock, ledger, prescription, or document change remains.

### US-05-23-AC3: Permission denied
- **Given** procurement.purchase-orders.read lacks the required permission or is assigned only to another Branch
- **When** the user calls the branch-scoped endpoint
- **Then** the response is 403 `COMMON.FORBIDDEN`; no protected data or change is returned.

### US-05-23-AC4: Organization isolation
- **Given** the requested record belongs to another Organization
- **When** the caller requests the record by id
- **Then** the response is 404 `COMMON.NOT_FOUND` and discloses no record data (CS-08).

## Validation Rules
- Apply SPEC-05 validation rules for FR-05-053; quantities use integer packs or base units as stated per field.

## Authorization Rules
- Require procurement.purchase-orders.read.
- Backend enforces token organization and branch assignment; RLS is not replaced by UI filtering.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Invalid input / prohibited state | 422 `COMMON.VALIDATION_FAILED` or the specific validation code listed in FR-05-053 |
| Missing permission or branch assignment | 403 `COMMON.FORBIDDEN` |
| Record belongs to another Organization | 404 `COMMON.NOT_FOUND` |
| Inventory allocation lock exceeds 3 s | 503 `COMMON.LOCK_TIMEOUT` (where inventory allocation is invoked)

## Edge Cases
- Monetary values use decimal arithmetic and BR-G-18 rounding; base-unit quantities remain integers.
- Duplicate posting requests use the required Idempotency-Key behavior and never duplicate ledger, stock, or sequence effects.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-05-097 | Integration | Reference behavior and exact values for FR-05-053 | US-05-23-AC1 |
| TS-05-098 | Integration | Negative validation path, no partial effect; COMMON.VALIDATION_FAILED | US-05-23-AC2 |
| TS-05-099 | Security | Missing permission and cross-branch access return 403 (CS-07) | US-05-23-AC3 |
| TS-05-100 | Security | Cross-organization id returns 404 without data (CS-08) | US-05-23-AC4 |

