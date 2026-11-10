# US-05-21: Supplier Balances and Aging Report

| Field | Value |
|---|---|
| Story ID | US-05-21 |
| Epic | EPIC-05 |
| Priority | P1 |
| Complexity | M |
| Related Requirements | FR-05-051 |
| Related Business Rules | BR-G-18, BR-G-23 |
| Dependencies | US-05-20 |

## User Story
As an Accountant, I want supplier balances and invoice aging buckets as of a selected business date so that I can prioritize outstanding payables.

## Business Value
Supports SPEC-05's V1 procure-to-pay scope while preserving branch-level inventory and financial traceability.

## Preconditions
- Source records, settings, permissions, and integration contracts required by FR-05-051 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.

## Acceptance Criteria
### US-05-21-AC1: Successful result
- **Given** Aging and CSV/XLSX
- **When** As of 2026-11-30 supplier has open invoice balances: EGP 100.00 dated 2026-11-25, EGP 200.00 dated 2026-10-20, EGP 300.00 dated 2026-09-01, EGP 400.00 dated 2026-07-01; unapplied credits EGP 50.00
- **Then** buckets by invoice age show NotDue EGP 100.00, 1-30 EGP 200.00, 31-60 EGP 300.00, 61-90 EGP 0.00, >90 EGP 400.00; unapplied credits EGP 50.00; net outstanding EGP 950.00; export requires reports.export.

### US-05-21-AC2: Validation and negative case
- **Given** missing export permission returns 403 COMMON.FORBIDDEN; cross-org supplier returns 404 COMMON.NOT_FOUND
- **When** the system validates the request at the required state transition
- **Then** the specified error is returned and no partial stock, ledger, prescription, or document change remains.

### US-05-21-AC3: Permission denied
- **Given** procurement.supplier-ledger.read lacks the required permission or is assigned only to another Branch
- **When** the user calls the branch-scoped endpoint
- **Then** the response is 403 `COMMON.FORBIDDEN`; no protected data or change is returned.

### US-05-21-AC4: Organization isolation
- **Given** the requested record belongs to another Organization
- **When** the caller requests the record by id
- **Then** the response is 404 `COMMON.NOT_FOUND` and discloses no record data (CS-08).

## Validation Rules
- Apply SPEC-05 validation rules for FR-05-051; quantities use integer packs or base units as stated per field.

## Authorization Rules
- Require procurement.supplier-ledger.read.
- Backend enforces token organization and branch assignment; RLS is not replaced by UI filtering.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Invalid input / prohibited state | 422 `COMMON.VALIDATION_FAILED` or the specific validation code listed in FR-05-051 |
| Missing permission or branch assignment | 403 `COMMON.FORBIDDEN` |
| Record belongs to another Organization | 404 `COMMON.NOT_FOUND` |
| Inventory allocation lock exceeds 3 s | 503 `COMMON.LOCK_TIMEOUT` (where inventory allocation is invoked)

## Edge Cases
- Monetary values use decimal arithmetic and BR-G-18 rounding; base-unit quantities remain integers.
- Duplicate posting requests use the required Idempotency-Key behavior and never duplicate ledger, stock, or sequence effects.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-05-089 | Integration | Reference behavior and exact values for FR-05-051 | US-05-21-AC1 |
| TS-05-090 | Integration | Negative validation path, no partial effect; COMMON.VALIDATION_FAILED | US-05-21-AC2 |
| TS-05-091 | Security | Missing permission and cross-branch access return 403 (CS-07) | US-05-21-AC3 |
| TS-05-092 | Security | Cross-organization id returns 404 without data (CS-08) | US-05-21-AC4 |

