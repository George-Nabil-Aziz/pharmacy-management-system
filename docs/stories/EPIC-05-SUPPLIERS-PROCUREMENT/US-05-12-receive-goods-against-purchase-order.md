# US-05-12: Receive Goods Against a Purchase Order

| Field | Value |
|---|---|
| Story ID | US-05-12 |
| Epic | EPIC-05 |
| Priority | P1 |
| Complexity | M |
| Related Requirements | FR-05-033, FR-05-034, FR-05-035 |
| Related Business Rules | BR-05-005, BR-G-09, BR-G-19, BR-G-20 |
| Dependencies | US-05-06, US-05-10 |

## User Story
As a Branch Manager or Inventory Staff member, I want to receive goods against a purchase order, so that supplier stock and balances are traceable and accurate.

## Business Value
Supports SPEC-05's V1 procure-to-pay scope while preserving branch-level inventory and financial traceability.

## Preconditions
- Source records, settings, permissions, and integration contracts required by FR-05-033, FR-05-034, FR-05-035 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.
- Inventory calls use SPEC-04 `IInventoryAllocation` / posting contracts; lock timeout is 3 s and posting is atomic.

## Acceptance Criteria
### US-05-12-AC1: Successful result
- **Given** CS-03 partial receiving, tolerance and PO status
- **When** An Approved PO for Medicine A has 10 packs ordered, 0 received, tolerance 0%; supplier delivers 4 packs, then 6 packs; pack cost EGP 100.0000
- **Then** first Posted receipt moves status to PartiallyReceived (4/10); remainder receipt moves it to Received (10/10); each receipt shows outstanding packs, price variance, stock movement and reconciliation; totals are EGP 400.00 + EGP 600.00.

### US-05-12-AC2: Validation and negative case
- **Given** Posting 11 paid packs returns 422 PROCUREMENT.OVER_RECEIPT_TOLERANCE_EXCEEDED; mismatched supplier, branch or medicine line rejected without changes
- **When** the system validates the request at the required state transition
- **Then** the specified error is returned and no partial stock, ledger, prescription, or document change remains.

### US-05-12-AC3: Permission denied
- **Given** procurement.receipts.read lacks the required permission or is assigned only to another Branch
- **When** the user calls the branch-scoped endpoint
- **Then** the response is 403 `COMMON.FORBIDDEN`; no protected data or change is returned.

### US-05-12-AC4: Organization isolation
- **Given** the requested record belongs to another Organization
- **When** the caller requests the record by id
- **Then** the response is 404 `COMMON.NOT_FOUND` and discloses no record data (CS-08).

## Validation Rules
- Apply SPEC-05 validation rules for FR-05-033, FR-05-034, FR-05-035; quantities use integer packs or base units as stated per field.

## Authorization Rules
- Require procurement.receipts.read.
- Backend enforces token organization and branch assignment; RLS is not replaced by UI filtering.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Invalid input / prohibited state | 422 `PROCUREMENT.OVER_RECEIPT_TOLERANCE_EXCEEDED` or the specific validation code listed in FR-05-033, FR-05-034, FR-05-035 |
| Missing permission or branch assignment | 403 `COMMON.FORBIDDEN` |
| Record belongs to another Organization | 404 `COMMON.NOT_FOUND` |
| Inventory allocation lock exceeds 3 s | 503 `COMMON.LOCK_TIMEOUT` (where inventory allocation is invoked)

## Edge Cases
- Monetary values use decimal arithmetic and BR-G-18 rounding; base-unit quantities remain integers.
- Duplicate posting requests use the required Idempotency-Key behavior and never duplicate ledger, stock, or sequence effects.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-05-053 | Integration (CS-03) | First 4 of 10 packs received, then remaining 6; PO status Approved → PartiallyReceived → Received, exact quantities and balances | US-05-12-AC1 |
| TS-05-054 | Integration | Negative validation path, no partial effect; PROCUREMENT.OVER_RECEIPT_TOLERANCE_EXCEEDED | US-05-12-AC2 |
| TS-05-055 | Security | Missing permission and cross-branch access return 403 (CS-07) | US-05-12-AC3 |
| TS-05-056 | Security | Cross-organization id returns 404 without data (CS-08) | US-05-12-AC4 |

