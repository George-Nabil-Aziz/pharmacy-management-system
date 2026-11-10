# US-05-16: Draft a Supplier Return with Batch Reservation

| Field | Value |
|---|---|
| Story ID | US-05-16 |
| Epic | EPIC-05 |
| Priority | P1 |
| Complexity | M |
| Related Requirements | FR-05-042, FR-05-043 |
| Related Business Rules | BR-G-06, BR-G-31 |
| Dependencies | US-05-06, SPEC-04 FEFO |

## User Story
As a Accountant or authorized procurement user, I want to draft a supplier return with batch reservation, so that supplier stock and balances are traceable and accurate.

## Business Value
Supports SPEC-05's V1 procure-to-pay scope while preserving branch-level inventory and financial traceability.

## Preconditions
- Source records, settings, permissions, and integration contracts required by FR-05-042, FR-05-043 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.
- Inventory calls use SPEC-04 `IInventoryAllocation` / posting contracts; lock timeout is 3 s and posting is atomic.

## Acceptance Criteria
### US-05-16-AC1: Successful result
- **Given** FEFO and supplier eligibility
- **When** Branch CAI01 has supplier S1 batches of Medicine A: B1 expiry 2026-11-10 on-hand 5/reserved 1; B2 expiry 2027-01-31 Active on-hand 10; B3 expired on-hand 4; B4 Quarantined on-hand 2; supplier S2 batch B5 on-hand 10. Return requests 8 base units
- **Then** AllocateAndLock with purpose SupplierReturn reserves 5 from B1 then 3 from B2 in ExpiryDate, CreatedAt, Id order using purpose SupplierReturn; Preview creates no reservation. Expired/quarantined batches remain eligible only for the same supplier. Candidate selection is FEFO ordered while a single FOR UPDATE locks balances in BatchId order; return value is EGP 25.00 at EGP 5.0000 per unit.

### US-05-16-AC2: Validation and negative case
- **Given** Selecting S2 batch for S1 return returns 422 PROCUREMENT.RETURN_BATCH_SUPPLIER_MISMATCH; requesting > available supplier-owned quantity returns 422 INVENTORY.INSUFFICIENT_STOCK; lock timeout 3 s returns 503 COMMON.LOCK_TIMEOUT
- **When** the system validates the request at the required state transition
- **Then** the specified error is returned and no partial stock, ledger, prescription, or document change remains.

### US-05-16-AC3: Permission denied
- **Given** procurement.supplier-returns.read lacks the required permission or is assigned only to another Branch
- **When** the user calls the branch-scoped endpoint
- **Then** the response is 403 `COMMON.FORBIDDEN`; no protected data or change is returned.

### US-05-16-AC4: Organization isolation
- **Given** the requested record belongs to another Organization
- **When** the caller requests the record by id
- **Then** the response is 404 `COMMON.NOT_FOUND` and discloses no record data (CS-08).

## Validation Rules
- Apply SPEC-05 validation rules for FR-05-042, FR-05-043; quantities use integer packs or base units as stated per field.

## Authorization Rules
- Require procurement.supplier-returns.read.
- Backend enforces token organization and branch assignment; RLS is not replaced by UI filtering.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Invalid input / prohibited state | 422 `PROCUREMENT.RETURN_BATCH_SUPPLIER_MISMATCH` or the specific validation code listed in FR-05-042, FR-05-043 |
| Missing permission or branch assignment | 403 `COMMON.FORBIDDEN` |
| Record belongs to another Organization | 404 `COMMON.NOT_FOUND` |
| Inventory allocation lock exceeds 3 s | 503 `COMMON.LOCK_TIMEOUT` (where inventory allocation is invoked)

## Edge Cases
- Monetary values use decimal arithmetic and BR-G-18 rounding; base-unit quantities remain integers.
- Duplicate posting requests use the required Idempotency-Key behavior and never duplicate ledger, stock, or sequence effects.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-05-069 | Integration | Reference behavior and exact values for FR-05-042, FR-05-043 | US-05-16-AC1 |
| TS-05-070 | Integration | Negative validation path, no partial effect; PROCUREMENT.RETURN_BATCH_SUPPLIER_MISMATCH | US-05-16-AC2 |
| TS-05-071 | Security | Missing permission and cross-branch access return 403 (CS-07) | US-05-16-AC3 |
| TS-05-072 | Security | Cross-organization id returns 404 without data (CS-08) | US-05-16-AC4 |

