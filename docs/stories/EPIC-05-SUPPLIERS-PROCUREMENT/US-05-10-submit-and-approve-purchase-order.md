# US-05-10: Submit, Approve, and Reject a Purchase Order

| Field | Value |
|---|---|
| Story ID | US-05-10 |
| Epic | EPIC-05 |
| Priority | P1 |
| Complexity | M |
| Related Requirements | FR-05-027, FR-05-028, FR-05-029, FR-05-030, FR-05-055 |
| Related Business Rules | BR-05-012, BR-G-16, BR-G-28 |
| Dependencies | US-05-09, US-05-01 |

## User Story
As a Branch Manager or Inventory Staff member, I want to submit, approve, and reject a purchase order, so that supplier stock and balances are traceable and accurate.

## Business Value
Supports SPEC-05's V1 procure-to-pay scope while preserving branch-level inventory and financial traceability.

## Preconditions
- Source records, settings, permissions, and integration contracts required by FR-05-027, FR-05-028, FR-05-029, FR-05-030, FR-05-055 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.

## Acceptance Criteria
### US-05-10-AC1: Successful result
- **Given** Threshold, review, credit and audit
- **When** A Draft PO totals EGP 1,200.00; branch PurchaseOrderApprovalThreshold is EGP 1,000.00, supplier outstanding balance EGP 400.00, open approved PO value EGP 500.00, credit limit EGP 2,000.00
- **Then** submit moves it to Submitted, notifies approvers, and a different approver can approve; credit calculation is EGP 2,100.00 and Warn requires acknowledgement; audit records submit and approval.

### US-05-10-AC2: Validation and negative case
- **Given** The PO creator cannot approve it (403 PROCUREMENT.SELF_APPROVAL_NOT_ALLOWED); Block mode above credit limit returns 422 PROCUREMENT.CREDIT_LIMIT_EXCEEDED
- **When** the system validates the request at the required state transition
- **Then** the specified error is returned and no partial stock, ledger, prescription, or document change remains.

### US-05-10-AC3: Permission denied
- **Given** procurement.purchase-orders.read lacks the required permission or is assigned only to another Branch
- **When** the user calls the branch-scoped endpoint
- **Then** the response is 403 `COMMON.FORBIDDEN`; no protected data or change is returned.

### US-05-10-AC4: Organization isolation
- **Given** the requested record belongs to another Organization
- **When** the caller requests the record by id
- **Then** the response is 404 `COMMON.NOT_FOUND` and discloses no record data (CS-08).

## Validation Rules
- Apply SPEC-05 validation rules for FR-05-027, FR-05-028, FR-05-029, FR-05-030, FR-05-055; quantities use integer packs or base units as stated per field.

## Authorization Rules
- Require procurement.purchase-orders.read.
- Backend enforces token organization and branch assignment; RLS is not replaced by UI filtering.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Invalid input / prohibited state | 422 `COMMON.VALIDATION_FAILED` or the specific validation code listed in FR-05-027, FR-05-028, FR-05-029, FR-05-030, FR-05-055 |
| Missing permission or branch assignment | 403 `COMMON.FORBIDDEN` |
| Record belongs to another Organization | 404 `COMMON.NOT_FOUND` |
| Inventory allocation lock exceeds 3 s | 503 `COMMON.LOCK_TIMEOUT` (where inventory allocation is invoked)

## Edge Cases
- Monetary values use decimal arithmetic and BR-G-18 rounding; base-unit quantities remain integers.
- Duplicate posting requests use the required Idempotency-Key behavior and never duplicate ledger, stock, or sequence effects.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-05-045 | Integration | Reference behavior and exact values for FR-05-027, FR-05-028, FR-05-029, FR-05-030, FR-05-055 | US-05-10-AC1 |
| TS-05-046 | Integration | Negative validation path, no partial effect; COMMON.VALIDATION_FAILED | US-05-10-AC2 |
| TS-05-047 | Security | Missing permission and cross-branch access return 403 (CS-07) | US-05-10-AC3 |
| TS-05-048 | Security | Cross-organization id returns 404 without data (CS-08) | US-05-10-AC4 |

