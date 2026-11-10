# US-05-11: Cancel and Close a Purchase Order

| Field | Value |
|---|---|
| Story ID | US-05-11 |
| Epic | EPIC-05 |
| Priority | P1 |
| Complexity | S |
| Related Requirements | FR-05-031, FR-05-032 |
| Related Business Rules | BR-G-25, BR-G-16 |
| Dependencies | US-05-10, US-05-12 |

## User Story
As a Branch Manager or Inventory Staff member, I want to cancel and close a purchase order, so that supplier stock and balances are traceable and accurate.

## Business Value
Supports SPEC-05's V1 procure-to-pay scope while preserving branch-level inventory and financial traceability.

## Preconditions
- Source records, settings, permissions, and integration contracts required by FR-05-031, FR-05-032 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.

## Acceptance Criteria
### US-05-11-AC1: Successful result
- **Given** PO close and cancellation states
- **When** A PartiallyReceived PO has 4 of 10 ordered packs received and no further goods receipt references a cancelable PO
- **Then** manager cancels Draft/Submitted/Approved with 10–500 character reason, or short-closes the partially received PO with reason; status transitions and notifications are recorded.

### US-05-11-AC2: Validation and negative case
- **Given** Cancel when a Posted receipt references PO returns 422 PROCUREMENT.PURCHASE_ORDER_HAS_RECEIPTS; closed/cancelled PO cannot accept receipt
- **When** the system validates the request at the required state transition
- **Then** the specified error is returned and no partial stock, ledger, prescription, or document change remains.

### US-05-11-AC3: Permission denied
- **Given** procurement.purchase-orders.read lacks the required permission or is assigned only to another Branch
- **When** the user calls the branch-scoped endpoint
- **Then** the response is 403 `COMMON.FORBIDDEN`; no protected data or change is returned.

### US-05-11-AC4: Organization isolation
- **Given** the requested record belongs to another Organization
- **When** the caller requests the record by id
- **Then** the response is 404 `COMMON.NOT_FOUND` and discloses no record data (CS-08).

## Validation Rules
- Apply SPEC-05 validation rules for FR-05-031, FR-05-032; quantities use integer packs or base units as stated per field.

## Authorization Rules
- Require procurement.purchase-orders.read.
- Backend enforces token organization and branch assignment; RLS is not replaced by UI filtering.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Invalid input / prohibited state | 422 `COMMON.VALIDATION_FAILED` or the specific validation code listed in FR-05-031, FR-05-032 |
| Missing permission or branch assignment | 403 `COMMON.FORBIDDEN` |
| Record belongs to another Organization | 404 `COMMON.NOT_FOUND` |
| Inventory allocation lock exceeds 3 s | 503 `COMMON.LOCK_TIMEOUT` (where inventory allocation is invoked)

## Edge Cases
- Monetary values use decimal arithmetic and BR-G-18 rounding; base-unit quantities remain integers.
- Duplicate posting requests use the required Idempotency-Key behavior and never duplicate ledger, stock, or sequence effects.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-05-049 | Integration | Reference behavior and exact values for FR-05-031, FR-05-032 | US-05-11-AC1 |
| TS-05-050 | Integration | Negative validation path, no partial effect; COMMON.VALIDATION_FAILED | US-05-11-AC2 |
| TS-05-051 | Security | Missing permission and cross-branch access return 403 (CS-07) | US-05-11-AC3 |
| TS-05-052 | Security | Cross-organization id returns 404 without data (CS-08) | US-05-11-AC4 |

