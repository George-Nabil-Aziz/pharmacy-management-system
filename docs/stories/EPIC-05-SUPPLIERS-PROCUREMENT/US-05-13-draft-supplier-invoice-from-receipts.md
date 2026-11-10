# US-05-13: Draft a Supplier Invoice from Receipts

| Field | Value |
|---|---|
| Story ID | US-05-13 |
| Epic | EPIC-05 |
| Priority | P1 |
| Complexity | M |
| Related Requirements | FR-05-036, FR-05-037, FR-05-038 |
| Related Business Rules | BR-G-18, BR-G-20, REG-06 |
| Dependencies | US-05-06, SPEC-03 TaxCategory |

## User Story
As a Accountant or authorized procurement user, I want to draft a supplier invoice from receipts, so that supplier stock and balances are traceable and accurate.

## Business Value
Supports SPEC-05's V1 procure-to-pay scope while preserving branch-level inventory and financial traceability.

## Preconditions
- Source records, settings, permissions, and integration contracts required by FR-05-036, FR-05-037, FR-05-038 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.
- Inventory calls use SPEC-04 `IInventoryAllocation` / posting contracts; lock timeout is 3 s and posting is atomic.

## Acceptance Criteria
### US-05-13-AC1: Successful result
- **Given** Invoice drafts and tax totals
- **When** A Posted receipt line has 5 paid packs at EGP 100.0000, 10% discount and a snapshotted 14% tax rate (pending REG-06); invoice uses 3 packs at EGP 100.0000, no discount
- **Then** draft invoice total is net EGP 300.00 plus tax EGP 42.00 = EGP 342.00; invoiced packs 3 and receipt line status PartiallyInvoiced.

### US-05-13-AC2: Validation and negative case
- **Given** A fourth pack beyond remaining 2 returns 422 PROCUREMENT.INVOICE_QUANTITY_EXCEEDS_RECEIVED; duplicate active supplier invoice number returns 409 PROCUREMENT.SUPPLIER_INVOICE_NUMBER_DUPLICATE
- **When** the system validates the request at the required state transition
- **Then** the specified error is returned and no partial stock, ledger, prescription, or document change remains.

### US-05-13-AC3: Permission denied
- **Given** procurement.supplier-invoices.read lacks the required permission or is assigned only to another Branch
- **When** the user calls the branch-scoped endpoint
- **Then** the response is 403 `COMMON.FORBIDDEN`; no protected data or change is returned.

### US-05-13-AC4: Organization isolation
- **Given** the requested record belongs to another Organization
- **When** the caller requests the record by id
- **Then** the response is 404 `COMMON.NOT_FOUND` and discloses no record data (CS-08).

## Validation Rules
- Apply SPEC-05 validation rules for FR-05-036, FR-05-037, FR-05-038; quantities use integer packs or base units as stated per field.

## Authorization Rules
- Require procurement.supplier-invoices.read.
- Backend enforces token organization and branch assignment; RLS is not replaced by UI filtering.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Invalid input / prohibited state | 422 `COMMON.VALIDATION_FAILED` or the specific validation code listed in FR-05-036, FR-05-037, FR-05-038 |
| Missing permission or branch assignment | 403 `COMMON.FORBIDDEN` |
| Record belongs to another Organization | 404 `COMMON.NOT_FOUND` |
| Inventory allocation lock exceeds 3 s | 503 `COMMON.LOCK_TIMEOUT` (where inventory allocation is invoked)

## Edge Cases
- Monetary values use decimal arithmetic and BR-G-18 rounding; base-unit quantities remain integers.
- Duplicate posting requests use the required Idempotency-Key behavior and never duplicate ledger, stock, or sequence effects.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-05-057 | Integration | Reference behavior and exact values for FR-05-036, FR-05-037, FR-05-038 | US-05-13-AC1 |
| TS-05-058 | Integration | Negative validation path, no partial effect; COMMON.VALIDATION_FAILED | US-05-13-AC2 |
| TS-05-059 | Security | Missing permission and cross-branch access return 403 (CS-07) | US-05-13-AC3 |
| TS-05-060 | Security | Cross-organization id returns 404 without data (CS-08) | US-05-13-AC4 |

