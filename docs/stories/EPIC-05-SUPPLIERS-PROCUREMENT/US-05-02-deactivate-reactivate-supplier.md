# US-05-02: Deactivate and reactivate a supplier

| Field | Value |
|---|---|
| Story ID | US-05-02 |
| Epic | EPIC-05 |
| Priority | P1 |
| Complexity | S |
| Related Requirements | FR-05-005, FR-05-006, FR-05-055 |
| Related Business Rules | BR-05-003, BR-G-33 |
| Dependencies | US-05-01 |

## User Story
As a Branch Manager, I want to deactivate suppliers we no longer buy from (and reactivate them if needed) so that staff cannot receive or order from them by mistake while their history and balances remain intact.

## Business Value
Prevents purchasing from discontinued or blacklisted distributors while preserving traceability and the ability to settle outstanding balances and return stock.

## Preconditions
- Supplier exists in the user's organization.
- User holds `procurement.suppliers.manage`.

## Acceptance Criteria

### US-05-02-AC1: Deactivate with reason
- **Given** an Active supplier
- **When** a user with `procurement.suppliers.manage` POSTs `/api/v1/suppliers/{id}/deactivate` with reason "Distributor licence suspended in Giza" (≥ 10 chars)
- **Then** the response is 200, status is Inactive, `DeactivatedAt` and reason are stored, and one audit entry is written; no supplier row is deleted

### US-05-02-AC2: Inactive supplier blocked on new procurement documents
- **Given** an Inactive supplier
- **When** a user creates a goods receipt, a purchase order, or a supplier invoice for that supplier, or posts an existing Draft receipt for it
- **Then** each request is rejected with 422 `PROCUREMENT.SUPPLIER_INACTIVE` and no document is created or posted

### US-05-02-AC3: Inactive supplier still usable for settlement
- **Given** an Inactive supplier with an outstanding balance and batches received from it
- **When** a user records a supplier payment, creates a supplier return, or views the ledger for that supplier
- **Then** the operations are allowed (subject to their own permissions) and the supplier appears in reports with status Inactive

### US-05-02-AC4: Reactivate
- **Given** an Inactive supplier
- **When** the user POSTs `/reactivate` with reason "Licence reinstated"
- **Then** status becomes Active, `DeactivatedAt` is cleared, an audit entry is written, and new receipts for the supplier are accepted

### US-05-02-AC5: Invalid transition, missing reason, and permission denied
- **Given** an Active supplier
- **When** a user calls `/reactivate`, or calls `/deactivate` with reason "old", or an Inventory Staff user without `procurement.suppliers.manage` calls `/deactivate`
- **Then** the responses are, respectively, 409 `PROCUREMENT.SUPPLIER_STATUS_UNCHANGED`, 400 `COMMON.VALIDATION_FAILED` with field error `PROCUREMENT.REASON_REQUIRED`, and 403 `COMMON.FORBIDDEN`, and the supplier's status is unchanged in all three cases

## Validation Rules
VR-05-008 (reason 10–500 chars).

## Authorization Rules
- `procurement.suppliers.manage` required for both actions; org-level resource; other-organization supplier → 404.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Deactivate an already Inactive supplier / reactivate an Active one | 409 `PROCUREMENT.SUPPLIER_STATUS_UNCHANGED` |
| Reason missing or < 10 chars | 400 `COMMON.VALIDATION_FAILED` / `PROCUREMENT.REASON_REQUIRED` |
| Supplier used on new receipt/PO/invoice while Inactive | 422 `PROCUREMENT.SUPPLIER_INACTIVE` |
| Missing permission | 403 `COMMON.FORBIDDEN` |
| Supplier of another organization | 404 `COMMON.NOT_FOUND` |

## Edge Cases
- Draft documents created before deactivation remain readable and editable except for posting/submission.
- Deactivation does not cancel open POs automatically; the PO list shows a warning badge for POs whose supplier is Inactive.
- Any attempt to hard-delete a supplier (no DELETE endpoint exists) returns 405.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-05-006 | Integration | Deactivate with valid reason; verify status, timestamps, audit, row retained | US-05-02-AC1 |
| TS-05-007 | Integration | Create receipt/PO/invoice and post existing draft receipt for Inactive supplier → 422 | US-05-02-AC2 |
| TS-05-008 | Integration | Payment, supplier return, ledger read for Inactive supplier succeed | US-05-02-AC3 |
| TS-05-009 | Integration | Reactivate and then post a receipt successfully | US-05-02-AC4 |
| TS-05-010 | Integration / Security | Invalid transitions 409, short reason 400, missing permission 403 | US-05-02-AC5 |
