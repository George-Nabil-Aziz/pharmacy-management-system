# US-05-04: Create a draft direct goods receipt

| Field | Value |
|---|---|
| Story ID | US-05-04 |
| Epic | EPIC-05 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-05-008, FR-05-009, FR-05-010, FR-05-011, FR-05-012 |
| Related Business Rules | BR-05-004, BR-05-005, BR-05-006, BR-05-023, BR-G-18, BR-G-20 |
| Dependencies | US-05-01, SPEC-03 (medicine lookup, PackSize), SPEC-02 (business date, settings) |

## User Story
As an Inventory Staff member, I want to record a supplier delivery that arrived without a purchase order as a draft goods receipt, including bonus quantities and line discounts, so that I can check it against the delivery note before it affects stock.

## Business Value
Most Egyptian pharmacy deliveries arrive without a formal PO. Capturing paid and bonus quantities correctly at entry gives the true unit cost used for COGS and inventory valuation.

## Preconditions
- Supplier is Active; medicines exist and are Active.
- User is assigned to the branch and holds `procurement.receipts.create`.
- Organization setting `AllowReceiptWithoutPurchaseOrder` is true for direct receipts.

## Acceptance Criteria

### US-05-04-AC1: Create draft with header and lines
- **Given** a user with `procurement.receipts.create` assigned to branch CAI01, business date 2026-11-09
- **When** they POST `/api/v1/branches/{CAI01}/goods-receipts` with Active supplier, delivery note "DN-5531", delivery date 2026-11-09, and a line: medicine "Panadol Extra" (catalog PackSize 20 tablets), batch "ab123 ", expiry "11/2028", paid 10 packs, bonus 1 pack, unit cost per pack 102.00, discount 0
- **Then** the response is 201 with status Draft, no number, the batch number stored as "ab123" (normalized "AB123" for comparison), expiry stored as 2028-11-30, and PackSize snapshotted on the line

### US-05-04-AC2: Line and total computation with bonus
- **Given** the line in AC1 with PackSize 20 and line discount 5%
- **When** the draft is saved
- **Then** gross = 1020.00, discount = 51.00, net = 969.00, received base units = 220, effective unit cost = 4.4045 (969.00 ÷ 220 rounded AwayFromZero to 4 decimals), and receipt total = sum of line nets

### US-05-04-AC3: Draft has no side effects
- **Given** a saved Draft receipt with 3 lines
- **When** the user reads batch balances, stock movements, PO quantities, and the supplier ledger
- **Then** none of them changed; the user can edit the draft with `If-Match` and can DELETE it, receiving 204, with an audit entry for the deletion

### US-05-04-AC4: Line validation
- **Given** a user editing a Draft
- **When** they submit a line with paid 0 and bonus 0, a line with paid 5 and unit cost 0, a line with discount 120%, and a 501st line
- **Then** the response is 400 `COMMON.VALIDATION_FAILED` with `PROCUREMENT.INVALID_QUANTITY`, `PROCUREMENT.INVALID_UNIT_COST`, `PROCUREMENT.INVALID_DISCOUNT`, and `PROCUREMENT.LINE_LIMIT_EXCEEDED` keyed by line index (or `lines` for the count rule), and the draft is unchanged

### US-05-04-AC5: Direct receipt disabled
- **Given** organization setting `AllowReceiptWithoutPurchaseOrder = false`
- **When** a user validates or posts a draft receipt with no purchase order
- **Then** the response is 422 `PROCUREMENT.PURCHASE_ORDER_REQUIRED`

### US-05-04-AC6: Permission and branch denied
- **Given** a Cashier without `procurement.receipts.create`, and an Inventory user assigned only to branch CAI01
- **When** the Cashier creates a receipt in CAI01, and the Inventory user creates a receipt in branch ALX01
- **Then** both receive 403 `COMMON.FORBIDDEN` and no receipt is created

## Validation Rules
VR-05-008 – VR-05-011, VR-05-014 – VR-05-017. Edits/deletes only in Draft (`PROCUREMENT.RECEIPT_NOT_DRAFT`).

## Authorization Rules
- `procurement.receipts.create`; route `branchId` must be in the user's assigned branches (or org-wide scope).
- Supplier and medicine ids from another organization are treated as not found (404).

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Inactive supplier | 422 `PROCUREMENT.SUPPLIER_INACTIVE` |
| Inactive medicine on a line | 422 `PROCUREMENT.MEDICINE_INACTIVE` |
| Delivery date in future or > 90 days back | 400 `PROCUREMENT.RECEIPT_DATE_INVALID` |
| Edit/delete a Posted receipt | 409 `PROCUREMENT.RECEIPT_NOT_DRAFT` |
| No PO while direct receipts disabled | 422 `PROCUREMENT.PURCHASE_ORDER_REQUIRED` |
| Branch not assigned / missing permission | 403 `COMMON.FORBIDDEN` |
| Supplier/medicine of another organization | 404 `COMMON.NOT_FOUND` |

## Edge Cases
- Bonus-only line (paid 0, bonus 5): net 0.00, effective unit cost 0.0000 (SPEC-05 E-01).
- Same medicine on two lines with different batch numbers is allowed.
- Barcode scan adds a line for the scanned medicine; scanning the same medicine again focuses its existing line rather than creating a duplicate when the batch number is still empty.
- PackSize changes in the catalog after the line was added do not change the line (snapshot).

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-05-016 | Integration | Create draft; verify normalization of batch number, month/year expiry → last day, PackSize snapshot | US-05-04-AC1 |
| TS-05-017 | Unit (property-based) | Line computation over random packs/costs/discounts/PackSize: rounding per BR-G-18, effective cost 4 dp | US-05-04-AC2 |
| TS-05-018 | Integration | Draft save/edit/delete leaves balances, movements, PO, ledger unchanged; deletion audited | US-05-04-AC3 |
| TS-05-019 | Integration | Invalid quantities, zero cost with paid packs, discount > 100, 501 lines; setting disables direct receipt | US-05-04-AC4, US-05-04-AC5 |
| TS-05-020 | Security | Missing permission and unassigned branch → 403 (CS-07); other-org supplier id → 404 (CS-08) | US-05-04-AC6 |
