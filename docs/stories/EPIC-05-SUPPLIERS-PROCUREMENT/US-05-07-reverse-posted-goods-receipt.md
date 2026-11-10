# US-05-07: Reverse a posted goods receipt

| Field | Value |
|---|---|
| Story ID | US-05-07 |
| Epic | EPIC-05 |
| Priority | P1 |
| Complexity | M |
| Related Requirements | FR-05-023, FR-05-035, FR-05-055 |
| Related Business Rules | BR-05-012, BR-G-05, BR-G-08, BR-G-19, BR-G-25 |
| Dependencies | US-05-06, SPEC-04 (ReverseReceipt contract) |

## User Story
As a Branch Manager, I want to reverse a goods receipt that was posted with wrong data (wrong supplier, wrong batch, duplicate entry) before any of its stock is used so that inventory and supplier traceability are corrected without deleting history.

## Business Value
Receiving errors are common on busy delivery days. A controlled, auditable reversal keeps the stock ledger immutable (BR-G-25) and keeps supplier attribution correct, which stock adjustments cannot do.

## Preconditions
- Receipt is Posted in a branch the user is assigned to.
- User holds `procurement.receipts.reverse`.

## Acceptance Criteria

### US-05-07-AC1: Successful reversal
- **Given** a Posted receipt with 2 lines (220 and 50 base units) whose batches still hold available quantities 220 and 50 and no supplier invoice references it
- **When** a Manager POSTs `/reverse` with reason "Duplicate entry of delivery note DN-5531" and a new `Idempotency-Key`
- **Then** the response is 200, status is Reversed, two `ReceiptReversal` movements of −220 and −50 referencing the receipt lines are appended, balances become 0 (batches Depleted per SPEC-04), original `Receipt` movements are unchanged, and an audit entry is written with the reason

### US-05-07-AC2: Reversal blocked when quantity consumed or reserved
- **Given** a Posted receipt line of 220 base units whose batch now has OnHand 230 and Reserved 20 (available 210) after sales and a draft supplier return
- **When** the Manager reverses the receipt
- **Then** the response is 422 `PROCUREMENT.RECEIPT_QUANTITY_CONSUMED` listing that line id with available 210 and required 220, and no movement or status change occurs

### US-05-07-AC3: Reversal blocked when invoiced
- **Given** a Posted receipt with a line referenced by a Posted supplier invoice
- **When** the Manager reverses it
- **Then** the response is 422 `PROCUREMENT.RECEIPT_INVOICED`; after the invoice is cancelled (US-05-15) the reversal succeeds

### US-05-07-AC4: PO quantities and status recomputed
- **Given** a PO line ordered 100 packs with two posted receipts of 60 and 40 packs (PO status Received)
- **When** the 40-pack receipt is reversed
- **Then** the PO line's received paid packs become 60 and the PO status becomes PartiallyReceived in the same transaction; reversing the 60-pack receipt afterwards returns the PO to Approved

### US-05-07-AC5: Idempotency, state, and permission
- **Given** a reversal that succeeded
- **When** the client retries with the same `Idempotency-Key`, another user reverses with a new key, and an Inventory user without `procurement.receipts.reverse` attempts the reversal of another Posted receipt
- **Then** the retry returns the original 200 response with no additional movements (CS-11), the second request returns 409 `PROCUREMENT.RECEIPT_NOT_POSTED`, and the Inventory user receives 403 `COMMON.FORBIDDEN`

## Validation Rules
VR-05-008 (reason), VR-05-032 (Idempotency-Key).

## Authorization Rules
- `procurement.receipts.reverse` plus branch assignment; other-organization receipt → 404; other-branch receipt via this branch's route → 404.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Receipt not Posted (Draft or already Reversed) | 409 `PROCUREMENT.RECEIPT_NOT_POSTED` |
| Available quantity < received quantity on any line | 422 `PROCUREMENT.RECEIPT_QUANTITY_CONSUMED` |
| Referenced by a non-cancelled supplier invoice | 422 `PROCUREMENT.RECEIPT_INVOICED` |
| Missing reason | 400 `COMMON.VALIDATION_FAILED` / `PROCUREMENT.REASON_REQUIRED` |
| Missing / reused Idempotency-Key | 400 `COMMON.IDEMPOTENCY_KEY_REQUIRED` / 422 `COMMON.IDEMPOTENCY_KEY_REUSED` |
| Missing permission or branch | 403 `COMMON.FORBIDDEN` |

## Edge Cases
- For a merged batch, the check is batch-level availability (stock is fungible within a batch); reversal is allowed if the batch still holds enough units even if some units from an earlier receipt were sold (SPEC-05 E-09).
- A concurrent sale on the same batch during reversal is serialized by the `BatchBalance` row lock; whichever commits first determines whether the other succeeds; balance never becomes negative (BR-G-08).
- `LastPurchaseCost` is not rolled back by reversal (reference value only).
- Reversed receipt's number is retained; no number is reused.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-05-031 | Integration | Reverse unconsumed receipt; verify ReceiptReversal movements, balances, status, audit | US-05-07-AC1 |
| TS-05-032 | Integration | Reversal blocked by sold units and by reservations; concurrent sale vs reversal never yields negative balance | US-05-07-AC2 |
| TS-05-033 | Integration (CS-11) | Same-key retry replays response; second reversal 409 | US-05-07-AC5 |
| TS-05-034 | Integration | Invoiced receipt blocked; succeeds after invoice cancellation | US-05-07-AC3 |
| TS-05-035 | Integration / Security | PO Received → PartiallyReceived → Approved on successive reversals; missing permission 403; unassigned branch 403 (CS-07) | US-05-07-AC4, US-05-07-AC5 |
