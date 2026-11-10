# US-06-07: Manager Override at the POS

| Field | Value |
|---|---|
| Story ID | US-06-07 |
| Epic | EPIC-06 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-06-017, FR-06-018, FR-06-019 |
| Related Business Rules | BR-G-16, BR-G-32, BR-06-009 |
| Dependencies | US-06-06 |

## User Story
As a branch manager, I want to approve a discount above a cashier's limit by re-authenticating at the cashier's POS so that exceptions are possible but individually accountable.

## Business Value
Implements BR-G-32 segregation: exceptions need a second, authenticated person and are audited. The same mechanism serves return approvals and refund-method exceptions (US-06-22, US-06-23).

## Preconditions
- Approver holds `sales.discounts.override` (scope `Discount`) or `sales.returns.approve` (scopes `ReturnApproval`, `RefundMethod`) and is assigned to the branch.
- `ManagerOverrideTtlSeconds` = 120 (default).

## Acceptance Criteria
### US-06-07-AC1: Override issued
- **Given** cashier C requests a `Discount` override of 10% and manager M (MANAGER limit 20%) enters valid credentials at C's POS
- **When** `POST /branches/{branchId}/pos/overrides` is called
- **Then** the response is 201 with an override id, scope `Discount`, approved max 10.00%, expiry now + 120 s, bound to C and the branch; an audit entry `ManagerOverrideIssued` is written; M's credentials are not stored client-side

### US-06-07-AC2: Override consumed with the sale
- **Given** a valid override for C of 10%
- **When** C completes the §7.2 sale referencing it
- **Then** the sale stores `DiscountOverrideId`, the override is marked consumed with the sale id in the same transaction, and audit records requester C, approver M, 10.00%, sale id

### US-06-07-AC3: Single use, expiry, and binding
- **Given** an override already consumed, another expired, and another issued to cashier D
- **When** C submits sales referencing each
- **Then** each is rejected with 422 `SALES.OVERRIDE_INVALID` and nothing is persisted

### US-06-07-AC4: Approver limits and self-approval
- **Given** manager M with limit 20%
- **When** M approves 25% for C, or C attempts to approve own request with C's own credentials
- **Then** the first returns 422 `SALES.OVERRIDE_INVALID` (exceeds approver limit) and the second 422 `SALES.OVERRIDE_SELF_NOT_ALLOWED`

### US-06-07-AC5: Failed approver authentication
- **Given** approver credentials are wrong, or belong to a user without `sales.discounts.override`, or to a user not assigned to the branch
- **When** the override is requested
- **Then** the response is 422 `SALES.OVERRIDE_AUTH_FAILED`, the failed attempt counts toward the approver's lockout (SPEC-01), C's session remains valid, and after 5 failed requests in 5 minutes by C further requests return 429

### US-06-07-AC6: Rollback keeps override unconsumed
- **Given** a valid override and a sale that fails with `INVENTORY.INSUFFICIENT_STOCK`
- **When** the transaction rolls back
- **Then** the override is still unconsumed and can be used for the corrected sale before expiry

### US-06-07-AC7: Requester permission and branch
- **Given** a requester without `sales.pos.sell`, or a requester calling for an unassigned branch
- **When** the override endpoint is called
- **Then** the response is 403 `COMMON.FORBIDDEN` (CS-07)

## Validation Rules
- VR-06-013, VR-06-014; requested percent 0.01–100.00.

## Authorization Rules
- Requester: `sales.pos.sell` + branch. Approver: scope permission + branch assignment, approver ≠ requester.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Wrong approver password | 422 `SALES.OVERRIDE_AUTH_FAILED` |
| Approver lacks permission | 422 `SALES.OVERRIDE_AUTH_FAILED` |
| Self approval | 422 `SALES.OVERRIDE_SELF_NOT_ALLOWED` |
| Expired / consumed / foreign override | 422 `SALES.OVERRIDE_INVALID` |
| Rate limit exceeded | 429 `COMMON.RATE_LIMITED` |

## Edge Cases
- Approver account locked → `SALES.OVERRIDE_AUTH_FAILED` (no reason disclosed).
- Cart changed after override but discount still ≤ approved % → override valid.
- Override requested for scope `ReturnApproval` is not usable for discounts (scope mismatch).

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-06-034 | Integration | Override issued with binding, TTL, audit | US-06-07-AC1 |
| TS-06-035 | Integration | Consumption in sale transaction with audit | US-06-07-AC2 |
| TS-06-036 | Integration | Consumed / expired / other-user override rejected | US-06-07-AC3 |
| TS-06-037 | Integration | Approver limit exceeded; self-approval rejected | US-06-07-AC4 |
| TS-06-038 | Security | Failed approver auth counts toward lockout; rate limit 429 | US-06-07-AC5 |
| TS-06-039 | Integration | Rollback leaves override unconsumed | US-06-07-AC6 |
| TS-06-040 | Security | Requester without permission / other branch → 403 | US-06-07-AC7 |
