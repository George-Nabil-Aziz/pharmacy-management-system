# SPEC-06: Sales & Point of Sale

**Version:** 1.0 (2026-11-09) · **Status:** Draft for review · **Owner:** Product / Business Analysis (Sales & POS) · **Related ADRs:** ADR-001 (modular monolith), ADR-002 (multi-tenancy), ADR-003 / ADR-004 (inventory ledger & locking), ADR-008 (audit), ADR-009 (localization), ADR-010 (frontend state) · **Related BRQs:** BRQ-01, BRQ-05, BRQ-07, BRQ-09, BRQ-10, BRQ-12, BRQ-13, BRQ-15

---

## 1. Purpose

This specification defines the Sales & Point of Sale (POS) module: medicine search and barcode scanning at the counter, the client-side cart, price/discount/tax calculation, payments, the atomic and idempotent sale completion operation, sales invoices and receipts, voids, sales returns and refunds, prescription-linked dispensing at the POS, cash sessions, and sales history. It is the authoritative source for how money and stock change when a medicine is sold or returned.

## 2. Business Context

The POS is the highest-frequency, highest-risk workflow of an Egyptian retail pharmacy: a cashier or pharmacist serves walk-in customers and prescription holders, often under queue pressure, with keyboard-wedge barcode scanners and an 80 mm thermal printer. Every sale simultaneously (a) deducts batch-level stock under FEFO, (b) records money by payment method into a cash session, (c) issues a numbered sales invoice, and (d) may record prescription dispensing. Errors in any of these produce oversell, cash variance, lost traceability, or financial misstatement.

Key business drivers:
- Throughput: a typical sale has 1–5 lines and must complete within the NFR-G-02 envelope.
- Correctness: zero oversell (NFR-G-06), no expired stock sold (BR-G-07), money computed with decimal arithmetic and deterministic rounding (BR-G-18).
- Control: discount limits per role with manager override (BR-G-32), restricted voids, returns with inspection dispositions (REG-11 default behaviour), cash sessions with blind close.
- Traceability: every sale line knows its batches and their unit costs, enabling COGS and gross profit (SPEC-09) and recall tracing (SPEC-04).

## 3. Scope

1. POS medicine search (trade name Arabic/English, generic name / active ingredient, barcode) meeting NFR-G-01.
2. Keyboard-wedge barcode scanning, unknown-barcode handling, GS1 data parsing (P2).
3. Client-side cart (Zustand) with no server-side draft; quantity in packs or base units (split-pack rules).
4. Price resolution (branch override → organization default), quote endpoint, line and invoice discounts, role discount limits, manager override.
5. Tax calculation per `TaxCategory`, tax-inclusive or tax-exclusive pricing (rates are configuration; REG-06).
6. Payments: Cash and Card (card processed on an external terminal and recorded with a reference), split payments, change calculation.
7. Sale completion as one atomic, idempotent server operation (cash session check, server re-pricing, FEFO allocation via the SPEC-04 contract, stock movements, allocations with unit-cost snapshot, payments, cash movements, gapless invoice number, dispensing records, audit, outbox).
8. Sales invoice / receipt generation: 80 mm thermal receipt and A4 invoice, Arabic or English; reprint marked "COPY".
9. Sale void under restricted rules.
10. Sales returns (partial, multiple), return window, refund calculation and refund method rules, approval above threshold, return dispositions (`PendingInspection`, `Restocked`, `Discarded`).
11. Optional link of a sale to a patient (SPEC-07) and to a prescription (SPEC-08), Rx-only and controlled-medicine enforcement, partial fulfillment.
12. Per-line COGS and gross profit from allocations.
13. Cash sessions: open with float, cash in/out, blind close, variance, Z-report, force-close.
14. Sales history, search, and detail.
15. P3: loyalty points (earn, redeem) as decision-support stories subject to OD-06-08; electronic invoice/receipt readiness subject to REG-07.

## 4. Out of Scope

| Item | Reason / where handled |
|---|---|
| Offline POS (selling without server connectivity) | Not in v1; assumption A-candidate and OD-06-01 |
| Payment gateway, card-terminal (ECR) integration, card data capture | Card is processed on a standalone terminal; only the terminal reference is recorded (OD-06-04). No PAN is ever entered or stored |
| Mobile wallets / instant payment (e.g., wallet transfers) as payment methods | OD-06-03 |
| Manual editing of the unit selling price at the POS | Prices change only via `catalog.prices.update` (SPEC-03); price reductions at POS are expressed as discounts |
| Server-side cart drafts, quotations, layaway, credit (account) sales | Not in v1 |
| Cross-branch returns (returning at a branch other than the selling branch) | Not in v1; returns are processed in the sale's branch |
| Cash rounding to coin increments | OD-06-02; v1 settles to 0.01 EGP |
| Direct ESC/POS printer drivers, cash-drawer kick commands | Printing uses the browser print pipeline; drawer opening is a printer-driver configuration (assumption) |
| Promotions engine / automatic discount rules (`DiscountRule`) | P2, separate future spec revision |
| Submission of e-invoices / e-receipts to the tax authority | REG-07; only data readiness (FR-06-065, P3) |
| Organization-wide (cross-branch) sales analytics | SPEC-09 |

## 5. Actors and Permissions

### 5.1 Actors

| Actor | Role code(s) | Interaction with this module |
|---|---|---|
| Cashier | `CASHIER` | Opens/closes own cash session, sells non-prescription items, applies discounts within limit, processes returns within threshold |
| Pharmacist | `PHARMACIST` | All cashier actions plus dispensing of prescription and controlled medicines, return inspection dispositions |
| Branch Manager | `MANAGER` | Discount override, return approval, voids, cash in/out, force-close of sessions, cost/profit visibility |
| Owner | `OWNER` | All permissions |
| Accountant | `ACCOUNTANT` | Read sales, sessions, Z-reports, costs |
| System | — | Background notification of long-open sessions and variances, outbox publishing |

### 5.2 Permissions used

| Permission | Purpose in this module | Default roles |
|---|---|---|
| `sales.pos.sell` | Search/scan at POS, quote, complete sales, request overrides | OWNER, MANAGER, PHARMACIST, CASHIER |
| `sales.sales.read` | Sales history, detail, receipts, prints/reprints, returns list | OWNER, MANAGER, PHARMACIST, CASHIER, ACCOUNTANT |
| `sales.discounts.apply` | Apply line/invoice discounts up to the role limit | OWNER, MANAGER, PHARMACIST, CASHIER |
| `sales.discounts.override` | Approve discounts above a requester's limit (manager override) | OWNER, MANAGER |
| `sales.sales.void` | Void a sale | OWNER, MANAGER |
| `sales.returns.create` | Create sales returns | OWNER, MANAGER, PHARMACIST, CASHIER |
| `sales.returns.approve` | Approve/reject returns requiring approval; approve refund to a non-original method; approve out-of-window returns | OWNER, MANAGER |
| `sales.cash-sessions.open-close` | Open and close own cash session; view own Z-report | OWNER, MANAGER, PHARMACIST, CASHIER |
| `sales.cash-sessions.manage` | View all sessions in branch, force-close others' sessions | OWNER, MANAGER |
| `finance.cash.manage` | Record cash in / cash out movements | OWNER, MANAGER, ACCOUNTANT |
| `inventory.batches.override-fefo` | Select a specific eligible batch instead of FEFO | OWNER, MANAGER, PHARMACIST |
| `prescriptions.dispense` | Complete a sale containing prescription-linked lines | OWNER, MANAGER, PHARMACIST |
| `prescriptions.controlled.dispense` | Complete a sale containing controlled medicines | PHARMACIST (and OWNER/MANAGER only if they also hold the Pharmacist role; REG-02) |
| `patients.profiles.read` / `patients.profiles.manage` | Look up / quick-create a patient at the POS | read: OWNER, MANAGER, PHARMACIST, CASHIER; manage: OWNER, MANAGER, PHARMACIST |
| `patients.medical.read` | Allergy decision-support check at the POS (access-logged, BR-G-29) | OWNER, MANAGER, PHARMACIST |
| `catalog.medicines.update` | Link an unknown scanned barcode to a medicine (SPEC-03 function) | OWNER, MANAGER |
| **`sales.returns.inspect`** (new) | Set return line disposition (`Restocked` / `Discarded`) | OWNER, MANAGER, PHARMACIST |
| **`sales.sales.read-cost`** (new) | See unit costs, COGS, and gross profit on sales and returns | OWNER, MANAGER, ACCOUNTANT |
| **`sales.loyalty.manage`** (new, P3) | Configure loyalty program and adjust balances | OWNER |

## 6. Functional Requirements

| ID | Requirement | Priority | BRQ | Stories |
|---|---|---|---|---|
| FR-06-001 | The system shall search active medicines of the organization at the POS by Arabic or English trade name, generic name / active ingredient, or barcode, with a minimum query length of 2 characters, case-insensitive and Arabic-normalized matching (alef variants أ/إ/آ → ا, ة → ه, ى → ي, diacritics removed), returning at most 20 results ranked: exact barcode, name prefix, ingredient prefix, name contains. | P0 | BRQ-03, BRQ-07 | US-06-01 |
| FR-06-002 | Each POS search result shall show trade names (ar/en), strength, dosage form, pack size, resolved selling price per pack (and per base unit if split allowed), branch sellable quantity (packs + base units), Rx-only and controlled flags, and the nearest sellable expiry date; inactive medicines shall be excluded and medicines with zero sellable quantity shall be shown as "Out of stock" and shall not be addable to the cart. | P0 | BRQ-07, BRQ-05 | US-06-01 |
| FR-06-003 | When a selected medicine has zero sellable quantity, the POS shall list its registered alternatives (SPEC-03 `MedicineAlternative`) that have sellable quantity in the branch. | P2 | BRQ-07 | US-06-01 |
| FR-06-004 | The POS shall recognise keyboard-wedge scanner input (≥ 6 characters, inter-key interval ≤ 50 ms, terminated by Enter) while the POS screen is active, look the code up against `MedicineBarcode` of the organization, and add 1 pack of the matched medicine to the cart or increment the quantity of an existing line with the same medicine, unit, and no explicit batch. | P0 | BRQ-07 | US-06-02 |
| FR-06-005 | When a scanned barcode matches no medicine, the system shall return `SALES.BARCODE_NOT_FOUND` (404), the POS shall leave the cart unchanged, show a visual and audible alert, open the name search pre-filled with the scanned code, and offer users holding `catalog.medicines.update` the SPEC-03 "link barcode to medicine" action. | P0 | BRQ-07 | US-06-02 |
| FR-06-006 | The POS shall parse GS1 element strings (AI 01 GTIN, AI 10 batch number, AI 17 expiry) from scanned GS1 DataMatrix / GS1-128 codes, resolve the medicine by GTIN, and warn when the scanned batch differs from the batch FEFO would allocate. | P2 | BRQ-04, BRQ-07 | US-06-02 |
| FR-06-007 | The cart shall exist only on the client (Zustand store) and be persisted in browser storage keyed by user and branch so that it survives a page refresh; it shall be cleared on logout and after a successful sale completion; no server-side draft sale shall exist. | P0 | BRQ-07 | US-06-03 |
| FR-06-008 | Each cart line shall have a unit of `Pack` or `BaseUnit`; `BaseUnit` shall be selectable only when `Medicine.AllowSplitPack` is true; `QuantityBaseUnits` shall equal `Quantity × PackSize` for `Pack` and `Quantity` for `BaseUnit`; quantity shall be an integer 1–9,999. | P0 | BRQ-04, BRQ-07 | US-06-03 |
| FR-06-009 | The cart shall warn and cap the requested quantity at the sellable quantity last returned by the server for the branch, displaying "Only N available", without blocking other lines; the server allocation remains authoritative. | P0 | BRQ-05 | US-06-03 |
| FR-06-010 | The cart shall support changing quantity, changing unit, removing a line, and clearing the cart (with confirmation), and shall recompute line and invoice totals after each change using the calculation rules in §7.2. | P0 | BRQ-07 | US-06-03 |
| FR-06-011 | The system shall price each allocated batch quantity at `Batch.SellingPriceOverride` when set (returned by `IInventoryAllocation`), otherwise the active `BranchMedicinePrice`, otherwise the organization `MedicinePrice` (BR-04-012); the base-unit price shall be the configured base-unit price, otherwise round(pack price ÷ PackSize, 4, AwayFromZero); when one cart line's allocations resolve to different unit prices the server shall split it into one sale line per distinct price (BR-06-033); a medicine without a resolvable price shall not be addable (`SALES.PRICE_NOT_CONFIGURED`). | P0 | BRQ-07 | US-06-04 |
| FR-06-012 | The system shall provide a read-only quote operation that, for a submitted cart (lines, units, quantities, discounts, explicit batches), calls `IInventoryAllocation` in `Preview` mode and returns server-computed sale lines (after price splitting), unit prices, discounts, invoice-discount allocation, tax per line, totals, and per-line availability, without locking or persisting anything. | P0 | BRQ-07 | US-06-04 |
| FR-06-013 | Each sale line shall use the tax rate of the medicine's `TaxCategory` effective at completion time and snapshot the tax category code and rate on the line; a medicine without a tax category shall be rejected with `SALES.TAX_CATEGORY_MISSING`. | P0 | BRQ-07, BRQ-15 | US-06-05 |
| FR-06-014 | The system shall compute line tax in tax-exclusive or tax-inclusive mode according to organization setting `PricesIncludeTax` (snapshotted on the sale), using the formulas in §7.2. | P0 | BRQ-07, BRQ-15 | US-06-05 |
| FR-06-015 | A user holding `sales.discounts.apply` shall be able to apply a line discount as a percentage (0.00–100.00) or an amount (0.01 ≤ amount ≤ line gross), with an optional reason (required when an override is used). | P0 | BRQ-07 | US-06-06 |
| FR-06-016 | A user holding `sales.discounts.apply` shall be able to apply one invoice discount as a percentage or an amount (≤ sum of line nets before invoice discount); the system shall allocate it to lines pro rata per BR-06-008. | P0 | BRQ-07 | US-06-06 |
| FR-06-017 | The system shall reject a sale whose any line discount percentage or whose effective sale discount percentage (total discounts ÷ gross) exceeds the user's limit (maximum of `RoleDiscountLimits` over the user's roles) unless a valid manager override covering that percentage is supplied (`SALES.DISCOUNT_LIMIT_EXCEEDED`). | P0 | BRQ-01, BRQ-07 | US-06-06, US-06-07 |
| FR-06-018 | The system shall issue a manager override when a different user holding `sales.discounts.override` (scope `Discount`) or `sales.returns.approve` (scopes `ReturnApproval`, `RefundMethod`) and assigned to the branch re-authenticates at the requesting POS; the override shall be single-use, valid for `ManagerOverrideTtlSeconds` (default 120), bound to the requesting user, branch and scope, and for `Discount` carry an approved maximum percentage not above the approver's own limit. | P0 | BRQ-01, BRQ-07 | US-06-07 |
| FR-06-019 | The system shall mark an override consumed in the same transaction as the document that uses it and write an audit entry recording requester, approver, scope, approved percentage, and document id; failed approver authentications shall count toward the approver's account lockout (SPEC-01). | P0 | BRQ-12 | US-06-07 |
| FR-06-020 | A user holding `sales.cash-sessions.open-close` shall be able to open a cash session in an assigned branch with an opening float of 0.00–100,000.00 EGP; at most one `Open` session shall exist per user per branch (`SALES.CASH_SESSION_ALREADY_OPEN`); the opening float shall be recorded as an `OpeningFloat` cash movement. | P0 | BRQ-07 | US-06-08 |
| FR-06-021 | Sale completion and refunds shall require an `Open` cash session owned by the acting user in the same branch (`SALES.CASH_SESSION_NOT_OPEN`); the POS selling screen shall prompt to open a session when none is open. | P0 | BRQ-07 | US-06-08, US-06-12 |
| FR-06-022 | A user holding `finance.cash.manage` shall be able to record a `CashIn` or `CashOut` movement against an open session with amount 0.01–100,000.00, a reason category, and a note of 5–250 characters; a cash out shall not exceed the session's expected cash (`SALES.CASH_OUT_EXCEEDS_AVAILABLE`). | P1 | BRQ-07, BRQ-10 | US-06-09 |
| FR-06-023 | Closing a cash session shall be blind: the closing user enters the counted cash (optionally by EGP denomination 200, 100, 50, 20, 10, 5, 1, 0.50, 0.25) and the expected cash and variance shall not be returned to the client before the count is submitted. | P0 | BRQ-07, BRQ-10 | US-06-10 |
| FR-06-024 | On close, the system shall compute expected cash per BR-06-028 and variance = counted − expected, require a variance note (5–250 characters) when abs(variance) > branch setting `CashVarianceTolerance` (default 5.00 EGP), and notify branch managers (SPEC-10) of such variances. | P0 | BRQ-07, BRQ-10, BRQ-11 | US-06-10 |
| FR-06-025 | The system shall produce a Z-report for a closed session (and an X-report preview for an open session to holders of `sales.cash-sessions.manage`) containing: session times and user, sale count, gross sales, discounts, returns, net sales, tax by rate, totals per payment method, refunds per method, voids (count, amount), cash in/out, opening float, expected cash, counted cash, variance; printable as 80 mm and A4. | P0 | BRQ-10 | US-06-10 |
| FR-06-026 | A closed cash session shall be immutable: sales, refunds, voids, and cash movements against it shall be rejected (`SALES.CASH_SESSION_NOT_OPEN`). | P0 | BRQ-07, BRQ-12 | US-06-10 |
| FR-06-027 | A user holding `sales.cash-sessions.manage` shall be able to force-close another user's open session in an assigned branch by entering the counted cash and a reason (10–250 characters); the session owner shall be notified and an audit entry written. | P1 | BRQ-07, BRQ-12 | US-06-11 |
| FR-06-028 | The system shall complete a sale through a single server operation that performs, in one database transaction, all steps of §7.3; on any failure the transaction shall roll back leaving no sale, stock movement, balance change, payment, cash movement, dispensing record, consumed override, invoice number, or audit entry. | P0 | BRQ-05, BRQ-07 | US-06-12 |
| FR-06-029 | During completion the server shall recompute all prices, discounts, taxes, and totals from current data and reject the sale with `SALES.PRICE_MISMATCH` (409, including the server quote) when the server total differs from the client-submitted `expectedTotal` by any amount. | P0 | BRQ-07 | US-06-12 |
| FR-06-030 | The server shall allocate all lines' base-unit quantities in one call to `IInventoryAllocation` (mode `AllocateAndLock`, purpose `Sale`, 1–200 lines) which applies FEFO (order ExpiryDate, CreatedAt, Id ascending) across eligible batches (excluding expired, do-not-sell window, `Quarantined`, and zero-sellable batches; sellable = OnHand − Reserved) with a single `FOR UPDATE` in BatchId order, possibly across multiple batches per line; the server shall then post one `Sale` stock movement and write one `SaleLineAllocation` (batch, quantity, batch unit cost snapshot) per allocation; any shortage shall fail the whole sale with `INVENTORY.INSUFFICIENT_STOCK` (409) carrying `shortages` per line. | P0 | BRQ-04, BRQ-05 | US-06-12 |
| FR-06-031 | The server shall assign the sales invoice number from the branch `DocumentSequence` for type `INV` and the business year inside the completion transaction, formatted `{BranchCode}-INV-{YYYY}-{NNNNNN}`, gapless and unique per branch and year. | P0 | BRQ-07, BRQ-12 | US-06-12 |
| FR-06-032 | Each sale line shall snapshot medicine trade names (ar/en), unit, pack size, quantity, quantity in base units, unit price, line discount, invoice discount share, net amount, tax category code, tax rate, tax amount, and total amount; the sale shall snapshot `PricesIncludeTax`, business date, cashier, and cash session. | P0 | BRQ-07, BRQ-10 | US-06-12 |
| FR-06-033 | Sale completion shall write an audit entry (`SaleCompleted`) and an outbox message (`SaleCompleted` integration event with sale id, branch, lines, quantities) in the same transaction. | P0 | BRQ-12 | US-06-12 |
| FR-06-034 | The system shall accept payment methods `Cash` and `Card`; a `Card` payment shall require the external terminal reference (4–40 alphanumeric characters) and accept optional last 4 digits; the system shall not capture or store card numbers. | P0 | BRQ-07 | US-06-13 |
| FR-06-035 | A sale shall accept at most one `Cash` and up to three `Card` payments; non-cash payments shall not exceed the sale total (`SALES.PAYMENT_EXCEEDS_TOTAL`); the sum of payments shall be ≥ total (`SALES.PAYMENT_INSUFFICIENT`); change = cash tendered − (total − non-cash payments) and only cash produces change; the cash payment amount recorded and the `SaleCash` cash movement shall equal the cash applied (tendered − change). | P0 | BRQ-07 | US-06-13 |
| FR-06-036 | Sale completion shall require an `Idempotency-Key` header; a repeated request with the same key and body shall return the stored response without a second effect; the same key with a different body shall return 422 `COMMON.IDEMPOTENCY_KEY_REUSED`; concurrent duplicates shall yield exactly one sale; the POS shall reuse the key for retries of an unchanged cart and payments and generate a new key when either changes. | P0 | BRQ-05, BRQ-07 | US-06-14 |
| FR-06-037 | Sale completion shall use `lock_timeout` 3 s; a lock timeout shall return 503 `COMMON.LOCK_TIMEOUT` with `Retry-After: 1`; a deadlock or serialization failure shall be retried as a whole transaction up to 2 additional times with 50–200 ms jittered backoff and then return 503 `COMMON.TRANSIENT_CONFLICT`; in every case nothing shall be persisted. | P0 | BRQ-05, BRQ-14 | US-06-14 |
| FR-06-038 | A user holding `inventory.batches.override-fefo` shall be able to select a specific batch for a line, passed as `explicitBatchId` to `IInventoryAllocation`; the batch must be of the same medicine and branch, eligible, and cover the full line quantity (`INVENTORY.BATCH_NOT_SELLABLE` 422 with reason, or `INVENTORY.INSUFFICIENT_STOCK`); a user without the permission selecting a batch other than the FEFO first choice receives 403 `INVENTORY.FEFO_OVERRIDE_NOT_PERMITTED`; a reason (5–250 characters) is required and the override is audited. | P2 | BRQ-04 | US-06-15 |
| FR-06-039 | The system shall render a sales invoice as an 80 mm thermal receipt (72 mm printable width) or an A4 invoice, in Arabic (RTL) or English, containing the fields in §8.6, and shall auto-print the original after completion when branch setting `AutoPrintReceipt` is on, using `DefaultReceiptFormat` and `ReceiptLanguage`; A4 shall also be downloadable as PDF. | P0 | BRQ-07, BRQ-13 | US-06-16 |
| FR-06-040 | Every print after the original shall be marked "COPY" / "نسخة" with a copy number, and every print shall be recorded as a `SalePrintRecord` with user, time, format, language, and copy number. | P1 | BRQ-12 | US-06-17 |
| FR-06-041 | A user holding `sales.sales.read` shall be able to search sales of an assigned branch by invoice number, business date range (≤ 366 days), cashier, patient, medicine, payment method, status, and total range, paginated and sorted by completion time descending by default. | P1 | BRQ-07, BRQ-10 | US-06-18 |
| FR-06-042 | The sale detail shall show header, lines, allocations (batch number, expiry date, quantity), payments, change, returns, refunds, void information, and prints; unit costs, COGS, and profit shall be included only for holders of `sales.sales.read-cost`. | P1 | BRQ-07, BRQ-10 | US-06-18 |
| FR-06-043 | The system shall compute per-line COGS = Σ round(allocation quantity × allocation unit cost, 2) and line gross profit = line net amount (excluding tax) − line COGS, sale COGS and gross profit as sums of lines, and expose them to SPEC-09 via a read contract. | P1 | BRQ-10 | US-06-19 |
| FR-06-044 | A user holding `sales.sales.void` shall be able to void a sale only when the sale status is `Completed`, the branch business date equals the sale's business date, the sale's cash session is `Open`, and no sales return (any status other than `Rejected`) exists; otherwise `SALES.SALE_NOT_VOIDABLE` (409); a reason of 10–250 characters is required. | P1 | BRQ-07, BRQ-12 | US-06-20 |
| FR-06-045 | A void shall, in one idempotent transaction, set status `Voided`, write `SaleVoid` stock movements returning each allocation quantity to its original batch at the original unit cost, write reversal payments and a `SaleVoid` cash movement in the sale's session for the cash applied, reverse dispensing records and controlled-register entries via SPEC-08, and write an audit entry; the invoice number shall not be reused. | P1 | BRQ-05, BRQ-07, BRQ-12 | US-06-20 |
| FR-06-046 | A user holding `sales.returns.create` shall be able to create a sales return in the sale's branch referencing the original sale and original sale lines (and allocation batches), with returned quantity in base units per line ≤ sold − returned in `Completed` or `PendingApproval` returns (`SALES.RETURN_QUANTITY_EXCEEDED`), a reason, and a gapless return number `{BranchCode}-RET-{YYYY}-{NNNNNN}`; on completion the sale status shall become `PartiallyReturned` or `Returned`. | P0 | BRQ-07, BRQ-05 | US-06-21 |
| FR-06-047 | A return requested more than `ReturnWindowDays` (organization setting, default 14) business days after the sale's business date shall require return approval and an override reason; without it the request shall be rejected with `SALES.RETURN_WINDOW_EXPIRED`. | P0 | BRQ-07 | US-06-21, US-06-22 |
| FR-06-048 | The system shall compute each return line's refund amount per BR-06-021 (proportional to the sale line total including tax, with the final return of a line receiving the exact remainder) so that total refunds per sale line never exceed the line total amount. | P0 | BRQ-07, BRQ-10 | US-06-21 |
| FR-06-049 | A return whose refund total exceeds branch setting `ReturnApprovalThresholdAmount` (default 1,000.00 EGP), or that is outside the return window, or that contains a controlled medicine, shall require approval: either completed immediately with an inline `ReturnApproval` override, or saved as `PendingApproval` (no stock, money, or disposition effect) and then approved (completing it with refund from the approver's open session) or rejected (status `Rejected`, reason 10–250 characters) by a user holding `sales.returns.approve` other than the creator. | P1 | BRQ-01, BRQ-07 | US-06-22 |
| FR-06-050 | Refunds shall default to the original sale's payment methods: for split-paid sales, the refund shall be allocated first to Cash up to the original cash applied net of prior cash refunds, then to Card payments in original order up to each card amount net of prior card refunds. | P0 | BRQ-07 | US-06-21, US-06-23 |
| FR-06-051 | A cash refund shall not exceed the refunding session's expected cash at the time of the refund (`SALES.REFUND_EXCEEDS_CASH_AVAILABLE`), evaluated under the session lock. | P0 | BRQ-07 | US-06-23 |
| FR-06-052 | A card refund shall require the external terminal refund reference; refunding to a method not used on the original sale, or exceeding the original method's remaining refundable amount, shall require a `RefundMethod` override (`SALES.REFUND_METHOD_NOT_ALLOWED` otherwise). | P1 | BRQ-07 | US-06-23 |
| FR-06-053 | Each return line shall be created with disposition `PendingInspection` and no stock movement, unless organization setting `AllowDirectRestockOnReturn` is on and the user holds `sales.returns.inspect`, in which case `Restocked` or `Discarded` may be set at return time. | P0 | BRQ-04, BRQ-05 | US-06-21, US-06-24 |
| FR-06-054 | A user holding `sales.returns.inspect` shall be able to list return lines with disposition `PendingInspection` in an assigned branch and set each line once to `Restocked` (writes a `SalesReturn` stock movement into the original batch at the original allocation unit cost, only if the batch is not expired, not inside the do-not-sell window, and not `Quarantined`; `SALES.RESTOCK_NOT_ALLOWED` otherwise) or `Discarded` (no stock movement; recorded as return loss); a set disposition shall be final. | P0 | BRQ-04, BRQ-05, BRQ-10 | US-06-24 |
| FR-06-055 | The inspection queue shall show for each pending line: return number, return date, medicine, batch number, expiry, quantity, age in days, and shall highlight lines pending more than 7 days. | P1 | BRQ-04 | US-06-24 |
| FR-06-056 | The POS shall allow optionally linking one patient to a sale by searching patients (phone, name, patient code) via SPEC-07, or quick-creating a patient (name, mobile phone) for holders of `patients.profiles.manage`; the link shall be stored on the sale and shown on the invoice as name only. | P1 | BRQ-08 | US-06-25 |
| FR-06-057 | When a patient is linked and the user holds `patients.medical.read`, the POS shall run an allergy decision-support check (SPEC-07 contract) for each cart medicine's active ingredients, display matches as warnings, record the acknowledging user on the line, and access-log the read (BR-G-29); the check shall never block the sale. | P1 | BRQ-08 | US-06-25 |
| FR-06-058 | The POS shall load a prescription in status `Verified` or `PartiallyDispensed` (SPEC-08) for the linked patient into the cart, creating one line per prescription item with quantity defaulted to the remaining quantity capped by sellable quantity, and link each line to its `PrescriptionItem`. | P0 | BRQ-09 | US-06-26 |
| FR-06-059 | When `EnforcePrescriptionForRxOnly` is on, the server shall reject a sale containing an Rx-only medicine line not linked to a dispensable prescription item of the same medicine (or an alternative permitted by SPEC-08) with remaining quantity ≥ line base-unit quantity (`SALES.PRESCRIPTION_REQUIRED` / `SALES.PRESCRIPTION_NOT_DISPENSABLE` / `SALES.PRESCRIPTION_QUANTITY_EXCEEDED`); completing a sale with prescription-linked lines requires `prescriptions.dispense` (403 otherwise). | P0 | BRQ-09, BRQ-05 | US-06-26 |
| FR-06-060 | The server shall reject a sale containing a controlled medicine unless the line is linked to a dispensable prescription item and the completing user holds `prescriptions.controlled.dispense` (`SALES.CONTROLLED_DISPENSE_FORBIDDEN`, 403), regardless of `EnforcePrescriptionForRxOnly`. | P0 | BRQ-09 | US-06-26 |
| FR-06-061 | For each prescription-linked sale line the server shall, via the SPEC-08 dispensing contract within the completion transaction, create one `DispensingRecord` per allocated batch (prescription item, sale line, batch, base-unit quantity, pharmacist, sale) and the `ControlledMedicineRegisterEntry` for controlled medicines, and update the prescription's dispensed quantities and status. | P0 | BRQ-09, BRQ-12 | US-06-26, US-06-27 |
| FR-06-062 | The POS shall allow dispensing less than the remaining prescribed quantity (partial fulfillment); the remaining quantity shall stay tracked by SPEC-08 and be printed on the receipt per prescription item as "Remaining to dispense". | P0 | BRQ-09 | US-06-27 |
| FR-06-063 | Subject to OD-06-08, the system shall accrue loyalty points to the linked patient on sale completion at the configured rate per EGP of net sales (excluding tax), reverse them proportionally on returns and fully on voids, in an append-only loyalty ledger. | P3 | BRQ-07 | US-06-28 |
| FR-06-064 | Subject to OD-06-08, the system shall accept `LoyaltyPoints` as a payment method redeeming the patient's available points at the configured EGP value per point, not exceeding the available balance or the configured maximum share of the sale total. | P3 | BRQ-07 | US-06-29 |
| FR-06-065 | Subject to REG-07, the system shall retain for each completed sale and sales return a structured, immutable invoice data snapshot sufficient to later generate an electronic invoice/receipt submission, and expose a per-document submission status field defaulting to `NotApplicable`. | P3 | BRQ-15 | US-06-30 |

## 7. Business Rules

### 7.1 Rules

| ID | Rule | Source |
|---|---|---|
| BR-06-001 | A `Sale` row is created only by the completion operation; the cart is client-side and there is no server-side draft. | §6.1 Sale statuses, ADR-010 |
| BR-06-002 | A sale requires an `Open` cash session owned by the completing user in the sale's branch. Refunds require an open session of the refunding user in the return's branch. | BR-G-35 |
| BR-06-003 | At most one `Open` cash session per user per branch (DB partial unique index). A user may have open sessions in different branches. | Owner scope |
| BR-06-004 | Selling price = active branch override, else organization default price. Unit price cannot be edited at the POS in v1; reductions are discounts. | BR-G-20 |
| BR-06-005 | Base-unit selling requires `AllowSplitPack = true`. Stock is always deducted in base units. | §6.3 |
| BR-06-006 | The server-computed total is authoritative; any difference from the client's `expectedTotal` rejects the sale. | BR-G-19 |
| BR-06-007 | All amounts use decimal arithmetic; unit prices/costs 4 dp, amounts 2 dp; rounding `AwayFromZero` at line level; document totals are sums of rounded line values. | BR-G-18 |
| BR-06-008 | Invoice discount allocation: share_i = round(D × netBeforeInvoice_i ÷ Σ netBeforeInvoice, 2); the rounding remainder (D − Σ share) is added to the line with the largest netBeforeInvoice (ties: lowest line number). No share exceeds its line's netBeforeInvoice. | BR-G-18 |
| BR-06-009 | Discount limit = max(`RoleDiscountLimits[role]`) over the user's roles (custom roles default 0%). Line discount % = line discount ÷ line gross; sale effective % = (Σ line discounts + invoice discount) ÷ Σ gross. Exceeding requires a `Discount` override whose approved % ≥ the highest applied %; approver ≠ requester; approved % ≤ approver's own limit. | BR-G-32 |
| BR-06-010 | Tax rate and category are snapshotted on each line; `PricesIncludeTax` is snapshotted on the sale. Rates are organization configuration pending REG-06; the product ships no authoritative rate. | BR-G-20, REG-06 |
| BR-06-011 | Payments must fully cover the total; non-cash payments ≤ total; change is produced only from cash. | BR-G-35 |
| BR-06-012 | Card payments are processed on an external terminal; the system records method, amount, and terminal reference only and never captures card numbers. The cashier must obtain terminal approval before submitting the sale. | Owner scope, OD-06-04 |
| BR-06-013 | Allocation follows FEFO over eligible batches (Active, not expired, outside the do-not-sell window, sellable > 0), may split a line over several batches, and never makes OnHand negative. Quarantined batches are never allocated. | BR-G-06, BR-G-07, BR-G-08, BR-G-10 |
| BR-06-014 | Completion, void, return completion, return approval, disposition, and session close are each atomic; they write their stock, money, documents, and audit in one transaction or nothing. | BR-G-09, BR-G-16, BR-G-19, BR-G-35 |
| BR-06-015 | Sales invoice and sales return numbers are gapless per branch, document type, and year, assigned inside the posting transaction. | BR-G-24 |
| BR-06-016 | A completed sale's lines, amounts, payments, and allocations are immutable; only `Status` transitions (`Completed` → `PartiallyReturned` → `Returned`, or `Completed` → `Voided`) and void metadata may change. | BR-G-11 |
| BR-06-017 | Void allowed only: status `Completed`; same branch business date; the sale's cash session still `Open`; no non-rejected return exists; permission `sales.sales.void`; reason given. | Owner scope |
| BR-06-018 | Voids and returns never update or delete ledger rows; they add compensating stock movements (`SaleVoid`, `SalesReturn`), reversal payments, refunds, and cash movements. | BR-G-25 |
| BR-06-019 | A return references the original sale and sale lines; per sale line, Σ returned base units in `Completed` and `PendingApproval` returns ≤ sold base units. Voided sales cannot be returned. Returns are processed only in the sale's branch. | BR-G-12 |
| BR-06-020 | Return window = `ReturnWindowDays` (default 14) between the sale's business date and the return's business date; beyond it, approval with reason is required. | Owner scope |
| BR-06-021 | Return line refund = round(saleLine.TotalAmount × returnedBaseUnits ÷ saleLine.QuantityBaseUnits, 2), except when the return brings the line's cumulative returned quantity to its full sold quantity, in which case refund = saleLine.TotalAmount − Σ prior refunds for that line. The tax portion is computed the same way from saleLine.TaxAmount. | BR-G-18 |
| BR-06-022 | Approval is required when refund total > `ReturnApprovalThresholdAmount`, the return is outside the window, or it includes a controlled medicine. Approver ≠ creator. | BR-G-28 (by analogy) |
| BR-06-023 | Refunds default to original methods (cash first, then cards in original order); cash refunds are limited by the session's expected cash; a different method requires a `RefundMethod` override. | Owner scope |
| BR-06-024 | Return line disposition defaults to `PendingInspection` with no stock movement; `Restocked` returns stock only to the original batch and only if that batch is sellable-eligible (not expired, outside the do-not-sell window, not Quarantined); `Discarded` returns no stock. A disposition, once set, is final. | §10 note, REG-11 |
| BR-06-025 | Rx-only lines require a linked dispensable prescription item when `EnforcePrescriptionForRxOnly` is on; controlled lines always require it plus `prescriptions.controlled.dispense`. | BR-G-21, BR-G-22, REG-01, REG-02 |
| BR-06-026 | Dispensing records and prescription status updates are written in the sale's transaction; a dispensing event records medicine, batch, quantity, pharmacist, and sale. | BR-G-15 |
| BR-06-027 | A closed cash session is immutable; variances are recorded with a note, never edited. | BR-G-26 |
| BR-06-028 | Expected cash = opening float + Σ `SaleCash` − Σ `SaleVoid` − Σ `RefundCash` + Σ `CashIn` − Σ `CashOut` for the session. | Owner scope |
| BR-06-029 | Business date for sales, voids, returns, sessions, and windows is derived from the branch time zone (default `Africa/Cairo`) at the operation time. | BR-G-23 |
| BR-06-030 | The first print of a sale is the original; all later prints are copies marked "COPY" with a sequential copy number. | Owner scope |
| BR-06-031 | Line COGS is derived only from `SaleLineAllocation` unit cost snapshots; later batch cost changes never alter historical COGS. | BR-G-20 |
| BR-06-032 | A `Restocked` return line reverses COGS at the original allocation unit cost; a `Discarded` line does not reverse COGS and is reported as return loss (SPEC-09); a `PendingInspection` line is reported as pending. | Glossary (COGS) |
| BR-06-033 | Price precedence per allocation: `Batch.SellingPriceOverride` → `BranchMedicinePrice` → organization `MedicinePrice`. A cart line whose allocations resolve to different unit prices becomes one sale line per distinct price (ordered by allocation order); a percent line discount applies to each resulting line; an amount line discount is allocated across them pro rata by gross using the BR-06-008 method; all resulting lines keep the same `PrescriptionItemId`. | BR-04-012, OD-04-01 |

### 7.2 Calculation rules

Definitions per line *i* (all money `decimal`; `r(x, n)` = round to *n* dp, `AwayFromZero`):

| Step | Formula |
|---|---|
| Unit price | Pack: resolved pack price. BaseUnit: resolved base-unit price (FR-06-011). 4 dp |
| Gross | `Gross_i = r(UnitPrice_i × Quantity_i, 2)` |
| Line discount | Percent: `LD_i = r(Gross_i × p ÷ 100, 2)`; Amount: `LD_i = a` (≤ Gross_i) |
| Net before invoice discount | `NB_i = Gross_i − LD_i` |
| Invoice discount amount | Percent: `D = r(Σ NB × p ÷ 100, 2)`; Amount: `D = a` (≤ Σ NB) |
| Invoice discount share | BR-06-008 → `S_i` |
| Discounted amount | `A_i = NB_i − S_i` |
| Exclusive mode (`PricesIncludeTax = false`) | `Tax_i = r(A_i × rate_i, 2)`; `Net_i = A_i`; `Total_i = Net_i + Tax_i` |
| Inclusive mode (`PricesIncludeTax = true`) | `Total_i = A_i`; `Tax_i = r(Total_i × rate_i ÷ (1 + rate_i), 2)`; `Net_i = Total_i − Tax_i` |
| Sale totals | Gross = Σ Gross_i; Discounts = Σ LD_i + D; Net = Σ Net_i; Tax = Σ Tax_i; Total = Σ Total_i |
| Payments | NonCash = Σ card amounts (≤ Total); CashDue = Total − NonCash; Change = CashTendered − CashDue (≥ 0); CashApplied = CashDue |
| Line COGS | `COGS_i = Σ_alloc r(qtyBase × UnitCost, 2)`; `GrossProfit_i = Net_i − COGS_i` |

In inclusive mode, discounts are tax-inclusive amounts; the line also stores `DiscountAmountExTax_i = r((LD_i + S_i) ÷ (1 + rate_i), 2)` so that SPEC-09 can report gross sales excluding tax.

**Worked example (EGP, tax-exclusive mode; the 14% rate is illustrative configuration only, pending REG-06):**

| Line | Medicine | Unit | Qty | Unit price | Gross | Line disc. | NB | Inv. share | A = Net | Rate | Tax | Total |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Medicine A (PackSize 10) | Pack | 2 | 85.5000 | 171.00 | 10% = 17.10 | 153.90 | 5.97 | 147.93 | 0% | 0.00 | 147.93 |
| 2 | Medicine B (PackSize 20, split allowed, pack 120.0000) | BaseUnit | 7 | 6.0000 (=120÷20) | 42.00 | 0.00 | 42.00 | 1.63 | 40.37 | 14% | 5.65 (5.6518) | 46.02 |
| 3 | Medicine C | Pack | 5 | 12.3450 | 61.73 (61.725 → AwayFromZero; banker's rounding would give 61.72) | 0.00 | 61.73 | 2.40 | 59.33 | 14% | 8.31 (8.3062) | 67.64 |
| **Σ** | | | | | **274.73** | **17.10** | **257.63** | **10.00** | **247.63** | | **13.96** | **261.59** |

- Invoice discount: amount 10.00. Shares: 10 × 153.90 ÷ 257.63 = 5.97368 → 5.97; 10 × 42.00 ÷ 257.63 = 1.63025 → 1.63; 10 × 61.73 ÷ 257.63 = 2.39607 → 2.40; Σ = 10.00 (remainder 0.00).
- Effective discount % = (17.10 + 10.00) ÷ 274.73 = 9.86%. With `RoleDiscountLimits[CASHIER] = 5`, a cashier needs a `Discount` override approving ≥ 10.00% (line 1 is 10%).
- Payments: Card 100.00 (terminal ref `A1B2C3D4`), Cash tendered 200.00 → CashDue = 161.59, Change = 38.41. Persisted: Payment(Card, 100.00), Payment(Cash, 161.59, tendered 200.00, change 38.41); CashMovement(SaleCash, +161.59).
- Inclusive-mode variant of line 2 (A = 40.37 treated as tax-inclusive): Tax = r(40.37 × 0.14 ÷ 1.14, 2) = r(4.95772, 2) = 4.96; Net = 35.41; Total = 40.37.
- COGS line 1: 20 base units allocated FEFO — batch B1 (exp 2027-01-31) 12 × 6.2500 = 75.00; batch B2 (exp 2027-04-30) 8 × 6.5000 = 52.00 → COGS 127.00; gross profit = 147.93 − 127.00 = 20.93.
- Returns of line 1: first return of 1 pack (10 of 20 base units) → refund r(147.93 × 10 ÷ 20, 2) = r(73.965) = 73.97; second return of the remaining pack → 147.93 − 73.97 = 73.96 (remainder rule BR-06-021).

### 7.3 Sale completion sequence

```mermaid
sequenceDiagram
    autonumber
    participant UI as POS UI (Zustand cart)
    participant API as Sales API (POST /sales)
    participant DB as PostgreSQL (single tx)
    participant PR as Pricing engine (Sales)
    participant RX as Prescriptions facade (SPEC-08)
    participant INV as Inventory facade (SPEC-04)
    participant SEQ as DocumentSequence (SPEC-02)
    participant AUD as Audit + Outbox (SPEC-10)
    UI->>API: POST /branches/{b}/sales + Idempotency-Key + cart, payments, expectedTotal
    API->>API: AuthN, tenant, branch assignment, sales.pos.sell, shape validation (VR-06-xxx)
    API->>DB: BEGIN (Read Committed, lock_timeout 3s)
    API->>DB: INSERT IdempotencyRecord (org,user,key,hash) [unique; duplicate waits, then replays]
    API->>DB: SELECT CashSession FOR SHARE (Open, owner = user, branch = b)
    API->>DB: SELECT ManagerOverride FOR UPDATE (if supplied)
    API->>RX: Validate & lock linked PrescriptionItems (id asc), Rx-only / controlled rules
    API->>INV: IInventoryAllocation AllocateAndLock (purpose Sale, all lines, explicit batches)
    INV->>DB: Single SELECT BatchBalance FOR UPDATE ORDER BY BatchId
    INV-->>API: Allocations (batch, qty, unitCost, sellingPriceOverride) or INVENTORY.INSUFFICIENT_STOCK
    API->>PR: Price allocations (BR-06-033 split), discounts, taxes, totals
    PR-->>API: Server sale lines and totals
    API->>API: Compare with expectedTotal → else 409 SALES.PRICE_MISMATCH
    API->>API: Validate discount limit / override %; mark override consumed
    API->>API: Validate payments (coverage, non-cash ≤ total, card refs) → change
    API->>INV: PostOutbound(Sale) → UPDATE BatchBalance, INSERT StockMovement(Sale) per allocation
    API->>SEQ: Next number (INV, branch, year) — row FOR UPDATE
    API->>DB: INSERT Sale, SaleLines, SaleLineAllocations, Payments, CashMovement(SaleCash)
    API->>RX: Create DispensingRecords, ControlledMedicineRegisterEntries, update Prescription
    API->>AUD: INSERT AuditLog(SaleCompleted), OutboxMessage(SaleCompleted)
    API->>DB: UPDATE IdempotencyRecord (status 201, response body)
    API->>DB: COMMIT
    API-->>UI: 201 Created (sale, invoice number, change)
    UI->>UI: Clear cart, print original receipt
```

**Lock order (all sales-module write operations):** IdempotencyRecord → Sale (void/return only) → CashSession → ManagerOverride → PrescriptionItems (id asc) → BatchBalances (batch id asc) → DocumentSequence. The `DocumentSequence` lock is taken last to minimise the time branch-wide numbering is serialised.

**Rollback semantics:**

| Failure point | Outcome | Response |
|---|---|---|
| Validation before BEGIN | Nothing started | 400/422 with field errors |
| Duplicate key, first request committed | Stored response replayed, no new effect | Stored status (201) + `Idempotency-Replayed: true` header |
| Same key, different body | Rollback | 422 `COMMON.IDEMPOTENCY_KEY_REUSED` |
| Session not open / closed meanwhile | Rollback | 409 `SALES.CASH_SESSION_NOT_OPEN` |
| Price mismatch | Rollback | 409 `SALES.PRICE_MISMATCH` + server quote |
| Discount over limit / invalid override | Rollback; override not consumed | 422 `SALES.DISCOUNT_LIMIT_EXCEEDED` / `SALES.OVERRIDE_INVALID` |
| Payment insufficient / non-cash excess | Rollback | 422 `SALES.PAYMENT_INSUFFICIENT` / `SALES.PAYMENT_EXCEEDS_TOTAL` |
| Prescription rule violated | Rollback | 422 / 403 per FR-06-059/060 |
| Insufficient sellable stock (incl. only expired stock) | Rollback; balances unchanged | 409 `INVENTORY.INSUFFICIENT_STOCK` (`errors` names line index and available quantity) |
| Lock wait > 3 s | Rollback | 503 `COMMON.LOCK_TIMEOUT`, `Retry-After: 1` |
| Deadlock / serialization failure | Whole transaction retried up to 2 additional times | Success, or 503 `COMMON.TRANSIENT_CONFLICT` |
| DB/connection failure at any step, including after stock writes | Rollback by PostgreSQL; idempotency record not persisted, so a retry with the same key re-executes | 500 `COMMON.INTERNAL_ERROR` (or client timeout) |
| Failure after COMMIT but before response delivered | Sale persisted; client retry with same key replays 201 | 201 replay |

Only 2xx responses are stored in the idempotency record (they are written inside the committed transaction); 4xx/5xx outcomes are not stored and a retry re-evaluates against current state.

## 8. Data Requirements

All entities follow §6 conventions (UUIDv7 `Id`, `OrganizationId`, `BranchId`, audit columns, `RowVersion` on mutable aggregates). Schema `sales`.

### 8.1 Sale
`Id, OrganizationId, BranchId, InvoiceNumber (unique per OrganizationId+BranchId), Status (Completed/PartiallyReturned/Returned/Voided), BusinessDate, CompletedAt, CashierUserId, CashSessionId, PatientId?, PrescriptionId?, PricesIncludeTax, GrossAmount, LineDiscountTotal, InvoiceDiscountType (None/Percent/Amount), InvoiceDiscountValue numeric(19,4), InvoiceDiscountAmount, NetAmount, TaxAmount, TotalAmount, PaidAmount, ChangeAmount, DiscountOverrideId?, VoidedAt?, VoidedByUserId?, VoidReason?, VoidCashSessionId?, EInvoiceStatus (NotApplicable default, P3), IdempotencyKey, CorrelationId, RowVersion`.
Constraints: amounts `numeric(19,2)` ≥ 0; `TotalAmount = NetAmount + TaxAmount`; financial columns immutable after insert (enforced in the domain and by a DB trigger that rejects updates of amount columns).

### 8.2 SaleLine
`Id, SaleId, LineNumber, MedicineId, MedicineNameAr, MedicineNameEn, Unit (Pack/BaseUnit), PackSize, Quantity, QuantityBaseUnits, UnitPrice numeric(19,4), GrossAmount, LineDiscountType, LineDiscountValue, LineDiscountAmount, InvoiceDiscountShare, DiscountAmountExTax, NetAmount, TaxCategoryCode, TaxRate numeric(7,4), TaxAmount, TotalAmount, IsRxOnly, IsControlled, PrescriptionItemId?, ExplicitBatchId?, FefoOverrideReason?, AllergyWarningAcknowledgedBy?, ReturnedQuantityBaseUnits (maintained, ≤ QuantityBaseUnits)`.

### 8.3 SaleLineAllocation
`Id, SaleLineId, BatchId, BatchNumber, ExpiryDate, QuantityBaseUnits (>0), UnitCost numeric(19,4), CostAmount numeric(19,2), StockMovementId, ReturnedQuantityBaseUnits, RestockedQuantityBaseUnits`.

### 8.4 Payment, Refund, CashSession, CashMovement
- `Payment`: `Id, SaleId, Sequence, Method (Cash/Card/LoyaltyPoints[P3]), Amount, TenderedAmount? (cash), ChangeAmount? (cash), TerminalReference?, CardLast4?, ReversalOfPaymentId?, CreatedAt, CreatedBy` — append-only; voids add rows with negative `Amount` referencing `ReversalOfPaymentId`.
- `Refund`: `Id, SalesReturnId, Method, Amount (>0), TerminalReference?, CashSessionId, OverrideId?, CreatedAt, CreatedBy` — append-only.
- `CashSession`: `Id, OrganizationId, BranchId, UserId, Status (Open/Closed), OpenedAt, OpeningBusinessDate, OpeningFloat, ClosedAt?, ClosedByUserId?, ClosingType (Normal/Forced)?, CountedCash?, DenominationBreakdown jsonb?, ExpectedCash?, Variance?, VarianceNote?, ForceCloseReason?, RowVersion`. Partial unique index `(OrganizationId, BranchId, UserId) WHERE Status = 'Open'`.
- `CashMovement` (append-only): `Id, OrganizationId, BranchId, CashSessionId, Type (OpeningFloat/SaleCash/SaleVoid/RefundCash/CashIn/CashOut), Amount (signed, numeric(19,2)), ReasonCategory?, Note?, SourceDocumentType, SourceDocumentId, BusinessDate, OccurredAt, UserId`.

### 8.5 SalesReturn, SalesReturnLine, ManagerOverride, SalePrintRecord
- `SalesReturn`: `Id, OrganizationId, BranchId, ReturnNumber (assigned when Completed; PendingApproval returns hold no number), SaleId, Status (Draft[not persisted in v1]/PendingApproval/Completed/Rejected), BusinessDate, Reason, OutOfWindow bool, OverrideReason?, CreatedBy, ApprovedBy?, ApprovedAt?, RejectedBy?, RejectionReason?, ApprovalOverrideId?, RefundTotal, TaxRefundTotal, CashSessionId?, RowVersion`.
- `SalesReturnLine`: `Id, SalesReturnId, SaleLineId, SaleLineAllocationId, BatchId, QuantityBaseUnits (>0), RefundAmount, TaxRefundAmount, UnitCost (snapshot from allocation), Disposition (PendingInspection/Restocked/Discarded), DispositionBy?, DispositionAt?, DispositionNote?, StockMovementId?`.
- `ManagerOverride` (canonical entity owned and issued by SPEC-01 Identity, schema `identity`; consumed here inside the sale/return transaction): `Id, OrganizationId, BranchId, Scope (Discount/ReturnApproval/RefundMethod/SaleVoid), PermissionCode, ContextType, ContextHash, RequestedByUserId, ApprovedByUserId, ApprovedMaxDiscountPercent?, Reason?, IssuedAt, ExpiresAt, ConsumedAt?, ConsumedByDocumentType?, ConsumedByDocumentId?` (SPEC-01 §8.1).
- `SalePrintRecord` (new): `Id, SaleId or SalesReturnId, Format (Thermal80mm/A4), Language (ar/en), Output (Html/Pdf), CopyNumber (0 = original; unique per document), PrintedAt, PrintedBy`.
- `InvoiceSnapshot` (new, P3): `Id, DocumentType (Sale/SalesReturn), DocumentId, SchemaVersion, Payload jsonb, OriginalSnapshotId?, CreatedAt` — immutable.
- `LoyaltyAccount` / `LoyaltyLedgerEntry` (new, P3, subject to OD-06-08): account per patient with `PointsBalance` (≥ 0, row-locked on redemption); append-only entries `Points (signed), SourceDocumentType, SourceDocumentId, Reason?`.

### 8.6 Sales invoice content (both formats)
Organization legal name, branch name, branch address and phone, organization tax registration number and commercial registration number (configurable fields; mandatory content pending REG-07/REG-08), invoice number, date and time (branch time zone, locale format), cashier display name, patient name (if linked), prescription number (if linked), lines (medicine name in print language, quantity + unit, unit price, discount, line total), gross, discounts, net, tax summary per rate, total, payments per method (card reference masked to last 4 characters), cash tendered, change, "Remaining to dispense" per prescription item (if any), return policy text and footer (`ReceiptFooterText` ar/en), "COPY n" banner for copies, and for returns: return number, original invoice number, refunded lines and refund methods.

### 8.7 Settings introduced or used

| Setting | Level | Type / default |
|---|---|---|
| `PricesIncludeTax` | Organization | bool, `true` |
| `RoleDiscountLimits` | Organization | map role code → percent (0–100): OWNER 100, MANAGER 20, PHARMACIST 10, CASHIER 5, ACCOUNTANT 0, INVENTORY 0; custom roles 0 |
| `ManagerOverrideTtlSeconds` | Organization | int 30–600, `120` |
| `ReturnWindowDays` | Organization | int 0–365, `14` |
| `AllowDirectRestockOnReturn` | Organization | bool, `false` (canonical, §10 note) |
| `EnforcePrescriptionForRxOnly` | Organization | bool, `true` (canonical, BR-G-21) |
| `ReturnApprovalThresholdAmount` | Branch | numeric(19,2), `1000.00` |
| `CashVarianceTolerance` | Branch | numeric(19,2), `5.00` |
| `AutoPrintReceipt` | Branch | bool, `true` |
| `DefaultReceiptFormat` | Branch | `Thermal80mm` / `A4`, `Thermal80mm` |
| `ReceiptLanguage` | Branch | `ar` / `en`, `ar` |
| `ReceiptFooterText` | Branch | text ar/en, ≤ 500 chars each |
| `LoyaltyEnabled`, `LoyaltyEarnRate`, `LoyaltyPointValue`, `LoyaltyMaxRedeemPercent` | Organization | P3, subject to OD-06-08 |

### 8.8 Retention
Sales, returns, payments, refunds, cash sessions and movements, overrides, and print records are never hard-deleted (BR-G-34); retention periods pending REG-05. All `sales` tables carry `OrganizationId` and are protected by PostgreSQL Row-Level Security policies in addition to EF Core global query filters (RLS enabled from the MVP).

## 9. Validation Rules

| ID | Field / Object | Rule | Error code |
|---|---|---|---|
| VR-06-001 | Search `q` | Trimmed length 2–100 | `COMMON.VALIDATION_FAILED` |
| VR-06-002 | Barcode | 6–64 printable ASCII characters | `COMMON.VALIDATION_FAILED` |
| VR-06-003 | Sale `lines` | 1–200 lines | `SALES.EMPTY_SALE` (0 lines) / `COMMON.VALIDATION_FAILED` |
| VR-06-004 | Line `quantity` | Integer 1–9,999; `QuantityBaseUnits` ≤ 999,999 | `SALES.INVALID_QUANTITY` |
| VR-06-005 | Line `unit` | `BaseUnit` only if `AllowSplitPack` | `SALES.SPLIT_PACK_NOT_ALLOWED` |
| VR-06-006 | Line `medicineId` | Exists in organization, status `Active` | `SALES.MEDICINE_NOT_SELLABLE` |
| VR-06-007 | Line price | Resolvable per FR-06-011 | `SALES.PRICE_NOT_CONFIGURED` |
| VR-06-008 | Line tax category | Present on medicine | `SALES.TAX_CATEGORY_MISSING` |
| VR-06-009 | Line discount percent | 0.00–100.00, max 2 dp | `COMMON.VALIDATION_FAILED` |
| VR-06-010 | Line discount amount | 0.01 ≤ amount ≤ line gross, max 2 dp | `COMMON.VALIDATION_FAILED` |
| VR-06-011 | Invoice discount | Percent 0.00–100.00 or amount ≤ Σ NB | `COMMON.VALIDATION_FAILED` |
| VR-06-012 | Discount vs limit | Per BR-06-009 | `SALES.DISCOUNT_LIMIT_EXCEEDED` |
| VR-06-013 | `overrideId` | Exists, unexpired, unconsumed, scope matches, bound to user and branch, approved % sufficient | `SALES.OVERRIDE_INVALID` |
| VR-06-014 | Override request | Approver credentials valid, approver ≠ requester, approver holds scope permission and branch | `SALES.OVERRIDE_AUTH_FAILED` / `SALES.OVERRIDE_SELF_NOT_ALLOWED` |
| VR-06-015 | `expectedTotal` | Equals server total | `SALES.PRICE_MISMATCH` |
| VR-06-016 | Payments | 1 Cash max, ≤ 3 Card, each amount > 0.00 (unless total = 0.00 then no payments) | `COMMON.VALIDATION_FAILED` |
| VR-06-017 | Payments coverage | Σ payments (cash tendered counted) ≥ total | `SALES.PAYMENT_INSUFFICIENT` |
| VR-06-018 | Non-cash payments | Σ card ≤ total | `SALES.PAYMENT_EXCEEDS_TOTAL` |
| VR-06-019 | Card `terminalReference` | Required, 4–40 alphanumeric; `cardLast4` optional, exactly 4 digits | `SALES.CARD_REFERENCE_REQUIRED` / `COMMON.VALIDATION_FAILED` |
| VR-06-020 | Cash tendered | 0.00–1,000,000.00 | `COMMON.VALIDATION_FAILED` |
| VR-06-021 | `Idempotency-Key` | Present, UUID format (completion, void, return, approve, reject, disposition, close, force-close, cash movement, print) | `COMMON.IDEMPOTENCY_KEY_REQUIRED` |
| VR-06-022 | Cash session | Open, owned by user, same branch | `SALES.CASH_SESSION_NOT_OPEN` / `SALES.CASH_SESSION_NOT_OWNED` |
| VR-06-023 | Opening float | 0.00–100,000.00, 2 dp | `COMMON.VALIDATION_FAILED` |
| VR-06-024 | Counted cash | 0.00–10,000,000.00; denomination counts integers ≥ 0 and their sum equals counted cash | `SALES.CASH_COUNT_INVALID` |
| VR-06-025 | Variance note | Required (5–250 chars) when abs(variance) > tolerance | `SALES.VARIANCE_REASON_REQUIRED` |
| VR-06-026 | Cash in/out | Amount 0.01–100,000.00; reason category in {Float top-up, Bank deposit, Petty expense, Change exchange, Other}; note 5–250 chars | `COMMON.VALIDATION_FAILED` |
| VR-06-027 | Cash out | ≤ expected cash | `SALES.CASH_OUT_EXCEEDS_AVAILABLE` |
| VR-06-028 | Explicit batch | Same medicine/branch, eligible, covers full line quantity; reason 5–250 chars | `INVENTORY.BATCH_NOT_SELLABLE` / `INVENTORY.FEFO_OVERRIDE_NOT_PERMITTED` / `COMMON.VALIDATION_FAILED` |
| VR-06-029 | Void | Conditions of BR-06-017; reason 10–250 chars | `SALES.SALE_NOT_VOIDABLE` / `COMMON.VALIDATION_FAILED` |
| VR-06-030 | Return sale | Sale in same branch, status `Completed` or `PartiallyReturned` | `SALES.SALE_NOT_RETURNABLE` |
| VR-06-031 | Return quantity | Integer > 0, ≤ remaining returnable for the sale line and for the chosen allocation | `SALES.RETURN_QUANTITY_EXCEEDED` |
| VR-06-032 | Return window | Within window, or approval + override reason (10–250 chars) | `SALES.RETURN_WINDOW_EXPIRED` |
| VR-06-033 | Return reason | 5–250 chars | `COMMON.VALIDATION_FAILED` |
| VR-06-034 | Refund allocation | Σ refund rows = return refund total; each method within remaining refundable for that method unless override | `SALES.REFUND_METHOD_NOT_ALLOWED` |
| VR-06-035 | Cash refund | ≤ refunding session expected cash | `SALES.REFUND_EXCEEDS_CASH_AVAILABLE` |
| VR-06-036 | Approve/reject | Return status `PendingApproval`; approver ≠ creator; rejection reason 10–250 chars | `SALES.RETURN_NOT_PENDING` / `SALES.SELF_APPROVAL_NOT_ALLOWED` |
| VR-06-037 | Disposition | Current disposition `PendingInspection`; target `Restocked` or `Discarded`; note ≤ 250 chars | `SALES.DISPOSITION_ALREADY_SET` |
| VR-06-038 | Restock | Original batch not expired, outside do-not-sell window, not `Quarantined` | `SALES.RESTOCK_NOT_ALLOWED` |
| VR-06-039 | Rx-only line | Linked dispensable prescription item when enforcement on | `SALES.PRESCRIPTION_REQUIRED` |
| VR-06-040 | Prescription item | Prescription `Verified`/`PartiallyDispensed`, not expired/cancelled, same organization, same patient as sale | `SALES.PRESCRIPTION_NOT_DISPENSABLE` |
| VR-06-041 | Dispensed quantity | Line base units ≤ remaining prescribed base units | `SALES.PRESCRIPTION_QUANTITY_EXCEEDED` |
| VR-06-042 | Controlled line | Linked prescription + `prescriptions.controlled.dispense` | `SALES.CONTROLLED_DISPENSE_FORBIDDEN` |
| VR-06-043 | Sales search | Date range ≤ 366 days; `pageSize` ≤ 100 | `COMMON.VALIDATION_FAILED` |

## 10. API Requirements

All paths prefixed `/api/v1`. Branch-scoped resources use `/branches/{branchId}`. Problem Details per §7 conventions.

| Method | Path | Purpose | Permission | Idempotency |
|---|---|---|---|---|
| GET | `/branches/{branchId}/pos/medicines/search?q=&limit=` | POS medicine search with price & sellable quantity | `sales.pos.sell` | No |
| GET | `/branches/{branchId}/pos/medicines/by-barcode/{code}` | Barcode lookup (incl. GS1 parse) | `sales.pos.sell` | No |
| GET | `/branches/{branchId}/pos/medicines/{medicineId}/alternatives` | In-stock alternatives (P2) | `sales.pos.sell` | No |
| POST | `/branches/{branchId}/pos/quote` | Server pricing quote for a cart (no persistence) | `sales.pos.sell` | No (read-only) |
| POST | `/branches/{branchId}/pos/overrides` | Manager re-authentication → single-use override | `sales.pos.sell` (requester) + approver scope permission | No (single-use token) |
| POST | `/branches/{branchId}/pos/allergy-check` | Allergy decision support for patient + medicines | `patients.medical.read` | No |
| GET | `/branches/{branchId}/pos/prescriptions/{prescriptionId}/dispensable` | Remaining dispensable items for cart loading | `prescriptions.dispense` | No |
| POST | `/branches/{branchId}/cash-sessions` | Open own cash session | `sales.cash-sessions.open-close` | Required |
| GET | `/branches/{branchId}/cash-sessions/current` | Current user's open session (no expected cash) | `sales.cash-sessions.open-close` | No |
| GET | `/branches/{branchId}/cash-sessions?status=&userId=&from=&to=` | List sessions | `sales.cash-sessions.manage` | No |
| GET | `/branches/{branchId}/cash-sessions/{sessionId}` | Session detail (owner after close, or manage) | `sales.cash-sessions.open-close` (own) / `sales.cash-sessions.manage` | No |
| POST | `/branches/{branchId}/cash-sessions/{sessionId}/movements` | Cash in / cash out | `finance.cash.manage` | Required |
| POST | `/branches/{branchId}/cash-sessions/{sessionId}/close` | Blind close own session | `sales.cash-sessions.open-close` | Required |
| POST | `/branches/{branchId}/cash-sessions/{sessionId}/force-close` | Force-close another user's session | `sales.cash-sessions.manage` | Required |
| GET | `/branches/{branchId}/cash-sessions/{sessionId}/report?type=X\|Z&format=&lang=` | X-report (open, manage only) / Z-report (closed) | `sales.cash-sessions.open-close` (own Z) / `sales.cash-sessions.manage` | No |
| POST | `/branches/{branchId}/sales` | Complete sale (atomic) | `sales.pos.sell` (+ `prescriptions.dispense` / `prescriptions.controlled.dispense` for Rx lines) | Required |
| GET | `/branches/{branchId}/sales?…` | Sales history search | `sales.sales.read` | No |
| GET | `/branches/{branchId}/sales/{saleId}?include=costs` | Sale detail; cost fields omitted without `sales.sales.read-cost`; explicit `include=costs` without it → 403 | `sales.sales.read` (+ `sales.sales.read-cost`) | No |
| POST | `/branches/{branchId}/sales/{saleId}/prints` | Render receipt/invoice (original or COPY), record print | `sales.sales.read` | Required |
| POST | `/branches/{branchId}/sales/{saleId}/void` | Void sale | `sales.sales.void` | Required |
| GET | `/branches/{branchId}/sales/{saleId}/returnable` | Remaining returnable quantities, refund preview, default refund allocation | `sales.returns.create` | No |
| POST | `/branches/{branchId}/sales-returns` | Create return (Completed or PendingApproval) | `sales.returns.create` | Required |
| GET | `/branches/{branchId}/sales-returns?…` / `/{returnId}` | List / detail returns | `sales.sales.read` | No |
| POST | `/branches/{branchId}/sales-returns/{returnId}/approve` | Approve & complete pending return | `sales.returns.approve` | Required |
| POST | `/branches/{branchId}/sales-returns/{returnId}/reject` | Reject pending return | `sales.returns.approve` | Required |
| GET | `/branches/{branchId}/sales-returns/inspection-queue` | Return lines pending inspection | `sales.returns.inspect` | No |
| POST | `/branches/{branchId}/sales-returns/{returnId}/lines/{lineId}/disposition` | Set Restocked / Discarded | `sales.returns.inspect` | Required |
| POST | `/branches/{branchId}/sales-returns/{returnId}/prints` | Print return receipt | `sales.sales.read` | Required |
| GET | `/branches/{branchId}/sales/{saleId}/einvoice-snapshot` | Structured invoice snapshot (P3, REG-07) | `sales.sales.read` | No |
| GET/PUT | `/loyalty/settings`, `/patients/{patientId}/loyalty` | Loyalty configuration and balance (P3, OD-06-08) | `sales.loyalty.manage` / `patients.profiles.read` | PUT: If-Match |

**Example — complete sale request (worked example in §7.2):**

```json
{
  "cashSessionId": "0193a1c2-0000-7000-8000-000000000001",
  "patientId": null,
  "lines": [
    { "medicineId": "…A", "unit": "Pack", "quantity": 2, "discount": { "type": "Percent", "value": 10.00 } },
    { "medicineId": "…B", "unit": "BaseUnit", "quantity": 7 },
    { "medicineId": "…C", "unit": "Pack", "quantity": 5 }
  ],
  "invoiceDiscount": { "type": "Amount", "value": 10.00 },
  "overrideId": "0193a1c2-0000-7000-8000-00000000000f",
  "payments": [
    { "method": "Card", "amount": 100.00, "terminalReference": "A1B2C3D4", "cardLast4": "4242" },
    { "method": "Cash", "tenderedAmount": 200.00 }
  ],
  "expectedTotal": 261.59
}
```

**Response 201:** `{ "id": "…", "invoiceNumber": "CAI01-INV-2026-000123", "status": "Completed", "totalAmount": 261.59, "changeAmount": 38.41, "businessDate": "2026-11-09", "lines": [ … ], "payments": [ … ] }`

**Response 409 `SALES.PRICE_MISMATCH`:** Problem Details with extension `quote` containing the server-computed lines and totals.

## 11. Authorization Requirements

1. Every endpoint validates organization from token, `branchId` ∈ user's assigned branches (or organization-wide scope), and the listed permission (BR-G-17, §5.3). Cross-branch → 403 `COMMON.FORBIDDEN` (CS-07); resource of another organization → 404 `COMMON.NOT_FOUND` (CS-08).
2. A `saleId`, `returnId`, or `sessionId` in a route must belong to the route's `branchId`; mismatch → 404.
3. A cash session can be used for sales/refunds/close only by its owner; others → 403 `SALES.CASH_SESSION_NOT_OWNED`. Force-close and X-reports require `sales.cash-sessions.manage`.
4. The expected cash of an open session is never returned to its owner before close (blind count); only `sales.cash-sessions.manage` holders see X-reports.
5. Override approvers must hold the scope permission and be assigned to the branch; their credentials are verified by SPEC-01; approver ≠ requester.
6. Return approval and rejection require approver ≠ return creator (`SALES.SELF_APPROVAL_NOT_ALLOWED`).
7. Cost, COGS, and profit fields are omitted (not nulled) in responses for users lacking `sales.sales.read-cost`.
8. Prescription-linked lines require `prescriptions.dispense`; controlled lines `prescriptions.controlled.dispense`; patient lookup `patients.profiles.read`; allergy check `patients.medical.read`.

## 12. Error Handling

| Code | HTTP | Meaning |
|---|---|---|
| `COMMON.VALIDATION_FAILED` | 400 | Field validation errors (`errors` map) |
| `COMMON.IDEMPOTENCY_KEY_REQUIRED` | 400 | Missing/invalid `Idempotency-Key` |
| `COMMON.FORBIDDEN` | 403 | Permission or branch assignment missing |
| `COMMON.NOT_FOUND` | 404 | Resource absent or in another organization |
| `COMMON.IDEMPOTENCY_KEY_REUSED` | 422 | Same key, different request body |
| `COMMON.LOCK_TIMEOUT` | 503 | Lock wait > 3 s; `Retry-After: 1`; nothing persisted; safe to retry with same key (SPEC-04) |
| `COMMON.TRANSIENT_CONFLICT` | 503 | Deadlock/serialization retries exhausted; nothing persisted; safe to retry with same key (SPEC-04) |
| `COMMON.INTERNAL_ERROR` | 500 | Unexpected failure (e.g., DB connection lost); transaction rolled back |
| `COMMON.RATE_LIMITED` | 429 | Override attempts above 5 per 5 minutes per requester |
| `INVENTORY.BATCH_NOT_SELLABLE` | 422 | Explicit batch expired / do-not-sell / quarantined / wrong medicine or branch (owned by SPEC-04) |
| `INVENTORY.FEFO_OVERRIDE_NOT_PERMITTED` | 403 | Explicit non-FEFO batch without `inventory.batches.override-fefo` (owned by SPEC-04) |
| `INVENTORY.INSUFFICIENT_STOCK` | 409 | Not enough sellable stock (owned by SPEC-04) |
| `SALES.BARCODE_NOT_FOUND` | 404 | Unknown barcode |
| `SALES.MEDICINE_NOT_SELLABLE` | 422 | Medicine inactive or not in organization |
| `SALES.PRICE_NOT_CONFIGURED` | 422 | No resolvable price |
| `SALES.TAX_CATEGORY_MISSING` | 422 | Medicine without tax category |
| `SALES.SPLIT_PACK_NOT_ALLOWED` | 422 | Base-unit sale of non-split medicine |
| `SALES.INVALID_QUANTITY` | 422 | Quantity outside limits |
| `SALES.EMPTY_SALE` | 422 | No lines |
| `SALES.PRICE_MISMATCH` | 409 | Client total ≠ server total |
| `SALES.DISCOUNT_LIMIT_EXCEEDED` | 422 | Discount above limit without valid override |
| `SALES.OVERRIDE_INVALID` | 422 | Override expired, consumed, wrong scope/user/branch, insufficient % |
| `SALES.OVERRIDE_AUTH_FAILED` | 422 | Approver credentials invalid or approver lacks permission/branch (no session impact on requester) |
| `SALES.OVERRIDE_SELF_NOT_ALLOWED` | 422 | Approver = requester |
| `SALES.PAYMENT_INSUFFICIENT` | 422 | Payments < total |
| `SALES.PAYMENT_EXCEEDS_TOTAL` | 422 | Card payments > total |
| `SALES.CARD_REFERENCE_REQUIRED` | 422 | Card payment/refund without terminal reference |
| `SALES.CASH_SESSION_NOT_OPEN` | 409 | No open session / session closed |
| `SALES.CASH_SESSION_ALREADY_OPEN` | 409 | User already has an open session in branch |
| `SALES.CASH_SESSION_NOT_OWNED` | 403 | Session belongs to another user |
| `SALES.CASH_COUNT_INVALID` | 422 | Count/denominations inconsistent |
| `SALES.VARIANCE_REASON_REQUIRED` | 422 | Variance above tolerance without note |
| `SALES.CASH_OUT_EXCEEDS_AVAILABLE` | 422 | Cash out > expected cash |
| `SALES.SALE_NOT_VOIDABLE` | 409 | Void conditions not met |
| `SALES.SALE_NOT_RETURNABLE` | 409 | Sale voided or fully returned |
| `SALES.RETURN_QUANTITY_EXCEEDED` | 422 | Over-return |
| `SALES.RETURN_WINDOW_EXPIRED` | 422 | Outside window without approval |
| `SALES.REFUND_EXCEEDS_CASH_AVAILABLE` | 422 | Not enough cash in drawer |
| `SALES.REFUND_METHOD_NOT_ALLOWED` | 422 | Refund method/amount outside original without override |
| `SALES.RETURN_NOT_PENDING` | 409 | Approve/reject on non-pending return |
| `SALES.SELF_APPROVAL_NOT_ALLOWED` | 403 | Approver = creator |
| `SALES.DISPOSITION_ALREADY_SET` | 409 | Disposition already final |
| `SALES.RESTOCK_NOT_ALLOWED` | 422 | Original batch not eligible for restock |
| `SALES.PRESCRIPTION_REQUIRED` | 422 | Rx-only line without prescription |
| `SALES.PRESCRIPTION_NOT_DISPENSABLE` | 422 | Prescription not verified / expired / cancelled / other patient |
| `SALES.PRESCRIPTION_QUANTITY_EXCEEDED` | 422 | Line exceeds remaining prescribed quantity |
| `SALES.CONTROLLED_DISPENSE_FORBIDDEN` | 403 | Controlled line without prescription or permission |
| `SALES.LOYALTY_INSUFFICIENT_POINTS` | 422 | P3 redemption above balance/limit |

Error messages are localized (ar/en) per ADR-009; the POS shows the localized message and, for `INVENTORY.INSUFFICIENT_STOCK` and `SALES.PRICE_MISMATCH`, highlights the affected lines.

## 13. Edge Cases

1. Two cashiers sell the last unit simultaneously → one succeeds; other receives `INVENTORY.INSUFFICIENT_STOCK` (CS-01).
2. Only expired / do-not-sell / quarantined stock remains → allocation finds no eligible batch → `INVENTORY.INSUFFICIENT_STOCK` with `shortages[].sellable = 0` (CS-02).
3. Batch expires at midnight while a cart is open → server allocation at completion uses the business date at completion; the line fails if no other eligible batch exists.
4. Price changed after the item was added → `SALES.PRICE_MISMATCH` with new quote; cashier confirms and resubmits with a new Idempotency-Key.
5. Card approved on the terminal but sale rejected by the server (e.g., stock) → POS shows "Reverse the card transaction on the terminal" instruction; the system records nothing (CS-09). Risk recorded.
6. Network timeout after submit → POS retries with the same Idempotency-Key; if the first commit succeeded, the stored 201 is replayed (CS-11).
7. Cashier closes the session while another tab is completing a sale → the close waits on the session row lock; the sale (holding `FOR SHARE`) commits first and is included; later sales get `SALES.CASH_SESSION_NOT_OPEN`.
8. Sale spanning midnight business date → business date = branch date at completion time; session business date is the opening date; the Z-report covers all sales of the session regardless of date.
9. Total = 0.00 (100% discount with override) → no payments required; invoice issued; no cash movement.
10. Cash tendered exactly equals cash due → change 0.00.
11. Return requested for a line split across two batches → return lines are created per allocation; default allocation for return quantity is latest expiry first; user may change within allocation limits.
12. Return of a sale whose original batch has since been quarantined → return allowed; `Restocked` disposition rejected (`SALES.RESTOCK_NOT_ALLOWED`); only `Discarded` possible.
13. Concurrent return and void on the same sale → both lock the sale row; the second sees the new state and fails (`SALES.SALE_NOT_VOIDABLE` or `SALES.SALE_NOT_RETURNABLE`).
14. Concurrent returns over-returning the same line → serialized on the sale row lock; second exceeds → `SALES.RETURN_QUANTITY_EXCEEDED` (CS-05).
15. Cash refund larger than drawer cash → `SALES.REFUND_EXCEEDS_CASH_AVAILABLE`; cashier may refund partly by card if the original sale was card-paid, or obtain a `RefundMethod` override.
16. Pending-approval return when the sale meanwhile was voided → impossible: void requires no non-rejected return.
17. Manager override requested but manager account locked → `SALES.OVERRIDE_AUTH_FAILED`; cashier's session unaffected.
18. Override token expires between request and completion → `SALES.OVERRIDE_INVALID`; request a new override.
19. Same medicine scanned on two lines with different units (pack + base units) → allocated together in one lock pass; total base units checked against sellable.
20. Rx-only medicine prescribed with a different but permitted alternative → validated by SPEC-08 alternative rules.
21. Patient linked to prescription differs from sale patient → `SALES.PRESCRIPTION_NOT_DISPENSABLE`.
22. Browser storage unavailable (private mode) → cart works in memory only; POS shows a non-blocking warning that the cart will not survive refresh.
23. Unknown barcode that is a valid GS1 code with unregistered GTIN → `SALES.BARCODE_NOT_FOUND`.
24. Cash session left open for > 24 h → daily notification to managers; sales still allowed (no auto-close in v1).
25. Branch deactivated while a session is open → sales rejected by branch authorization; manager force-closes.
26. A cart line of 30 units allocated 20 from a batch with `SellingPriceOverride` 95.0000 and 10 from a batch without override → two sale lines (BR-06-033); the quote shows the split before payment, and a different split at completion yields `SALES.PRICE_MISMATCH` if totals differ.

## 14. Acceptance Criteria

| ID | Criterion |
|---|---|
| SAC-06-01 | A cashier can find a medicine by name, ingredient, or barcode within NFR-G-01 and add it in packs or (if allowed) base units. |
| SAC-06-02 | Server totals for the worked example in §7.2 equal exactly the table values in both client and server engines. |
| SAC-06-03 | A sale completes atomically: stock movements, allocations, payments, cash movement, invoice number, dispensing, audit commit together or not at all (CS-09, CS-10). |
| SAC-06-04 | Concurrency and idempotency hard gates pass: zero oversell (CS-01), single effect for duplicates (CS-11), no invoice-number gaps. |
| SAC-06-05 | Expired, do-not-sell, and quarantined batches are never sold (CS-02). |
| SAC-06-06 | Rx-only and controlled medicines cannot be sold without a verified prescription and required permissions (CS-13). |
| SAC-06-07 | Partial and multiple returns work with exact refund amounts and over-return rejection (CS-05); dispositions control restocking. |
| SAC-06-08 | Cash sessions reconcile: expected cash formula, blind close, variance recording, immutable after close. |
| SAC-06-09 | Voids reverse stock and money completely under the restricted conditions. |
| SAC-06-10 | Receipts print in 80 mm and A4, Arabic and English, with COPY marking on reprints. |
| SAC-06-11 | All endpoints enforce cross-branch 403 (CS-07) and cross-organization 404 (CS-08). |

## 15. Dependencies

| Depends on | Contract used |
|---|---|
| SPEC-01 Identity & Access | Authentication, permissions, branch assignment, approver credential verification for overrides, lockout |
| SPEC-02 Organization & Branches | Branch time zone/business date, `DocumentSequence` (INV, RET), branch and organization settings |
| SPEC-03 Medicine Catalog | Medicine, barcodes, `PackSize`, `AllowSplitPack`, Rx-only/controlled flags, prices (org + branch override), `TaxCategory`, alternatives, link-barcode function |
| SPEC-04 Batch & Inventory | Sellable quantity read model; `IInventoryAllocation` (`AllocateAndLock` / `Preview`, purpose `Sale`); `PostOutbound` (`Sale`); `ReturnToBatch` (`SaleVoid`, `SalesReturn`); batch status, do-not-sell window, `Batch.SellingPriceOverride` |
| SPEC-07 Patient Records | Patient search, quick create, allergy check contract, access logging |
| SPEC-08 Prescriptions | Dispensable items, alternative rules, dispensing record creation/reversal, controlled register, prescription status |
| SPEC-09 Finance & Reporting | Consumes sales, returns, COGS, cash movements, Z-report data |
| SPEC-10 Notifications, Audit & Settings | Audit log, outbox, notifications (variance, long-open session, pending inspection), settings storage |

## 16. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-06-001 | POS search and barcode lookup p95 ≤ 300 ms server time at 50,000 medicines and 500,000 batches per organization (NFR-G-01); barcode lookup p95 ≤ 150 ms. |
| NFR-06-002 | Scan-to-line-rendered on the POS ≤ 400 ms p95 on the NFR-G-09 reference laptop over a 10 Mbps link. |
| NFR-06-003 | Sale completion p95 ≤ 800 ms, p99 ≤ 1.5 s for sales of ≤ 20 lines with 20 concurrent cashiers per branch and 50 active branches (NFR-G-02). |
| NFR-06-004 | Zero oversell and zero negative balances in a concurrency test of 50 parallel completions competing for 10 units, repeated 100 times (NFR-G-06, CS-01). |
| NFR-06-005 | 100 concurrent submissions with the same Idempotency-Key produce exactly 1 sale, 1 set of movements, and identical responses (CS-11). |
| NFR-06-006 | Over 10,000 completions with 5% injected failures (DB fault, stock, price mismatch), committed invoice numbers per branch/year have no gaps and no duplicates. |
| NFR-06-007 | Quote endpoint p95 ≤ 300 ms for carts of ≤ 50 lines. |
| NFR-06-008 | Client and server pricing engines produce identical results for 100% of a shared golden-vector suite of ≥ 500 carts (including the §7.2 example and midpoint cases). |
| NFR-06-009 | The full sale flow (search/scan, quantity, discount, payment, complete, print) is operable by keyboard only; POS meets WCAG 2.2 AA (NFR-G-08). |
| NFR-06-010 | 100% of cart lines are restored after a browser refresh when browser storage is available. |
| NFR-06-011 | Receipt render model returned ≤ 500 ms p95; A4 PDF generated ≤ 2 s p95. |
| NFR-06-012 | Z-report for a session with ≤ 1,000 sales generated ≤ 2 s p95. |
| NFR-06-013 | Sales history search p95 ≤ 500 ms over 1 year and 500,000 sales per branch (NFR-G-03). |
| NFR-06-014 | Return creation and void p95 ≤ 800 ms. |
| NFR-06-015 | Lock timeout 3 s; ≤ 2 additional automatic attempts on deadlock; ≤ 0.1% of completions return 503 under the NFR-06-003 load profile. |

## 17. Security and Privacy Considerations

1. No card numbers (PAN), CVV, or track data are entered, transmitted, logged, or stored; only terminal reference and optional last 4 digits.
2. Manager credentials for overrides are sent over TLS only to the override endpoint, never stored client-side, rate-limited (5 attempts per 5 minutes per requesting user) and count toward the approver's lockout.
3. Blind close: expected cash is not sent to the session owner before close.
4. Receipts show patient name only; no medical data (allergies, conditions) appears on receipts or in sale search results.
5. Allergy checks are access-logged (BR-G-29); patient medical data is never written to logs (NFR-G-10).
6. Cost and profit data hidden without `sales.sales.read-cost` (server-side field omission).
7. The client-side cart in browser storage contains no patient medical data and no payment references; it is cleared on logout.
8. All sensitive operations audited (BR-G-16): sale completion, void, return create/approve/reject, disposition, override issue/consume, FEFO override, cash in/out, session open/close/force-close, reprint.
9. Idempotency records store a request hash and the response; stored responses contain no secrets.

## 18. Testing Considerations

1. Integration tests against real PostgreSQL (Testcontainers) with Row-Level Security enabled (project decision: RLS on from the MVP) for all money/stock operations; no in-memory providers for concurrency tests.
2. Concurrency suites: CS-01 (last unit), multi-line deadlock-prone carts with reversed medicine order, close-vs-sale, return-vs-void, concurrent returns.
3. Fault injection: abort the transaction after stock movement insert, after payment insert, and before commit (CS-10); kill connection; verify ledger and balances unchanged.
4. Idempotency: replay, different-body reuse, concurrent duplicates, retry after injected failure (CS-11).
5. Golden pricing vectors (JSON) shared by C# and TypeScript test suites (NFR-06-008), including the §7.2 example, inclusive mode, 100% discount, and midpoint rounding.
6. Invoice-number gap audit after fault-injected runs (NFR-06-006).
7. Authorization matrix tests per endpoint: each permission absent → 403; other branch → 403 (CS-07); other organization → 404 (CS-08).
8. E2E (Playwright): keyboard-only sale with simulated wedge scanner, Arabic RTL receipt snapshot, COPY reprint.
9. Load tests per NFR-06-003 profile.
10. Critical scenario mapping (EPIC-06 story Testing Notes): CS-01 TS-06-080, TS-06-081; CS-02 TS-06-067, TS-06-091, TS-06-145; CS-05 TS-06-123, TS-06-124, TS-06-125; CS-09 TS-06-076, TS-06-078; CS-10 TS-06-085, TS-06-121, TS-06-129, TS-06-155; CS-11 TS-06-082, TS-06-083, TS-06-118, TS-06-127, TS-06-132; CS-13 TS-06-156, TS-06-157, TS-06-158; CS-07/CS-08 in every story's security scenarios.

## 19. Open Decisions

| ID | Decision needed | Options | Default until decided |
|---|---|---|---|
| OD-06-01 | Offline POS | (a) none; (b) read-only catalog offline; (c) full offline sales with later sync and conflict handling | (a) — v1 requires connectivity |
| OD-06-02 | Cash rounding to coin increments (e.g., 0.25 / 0.50 EGP) | none / per-branch increment with rounding line | None; settle to 0.01 |
| OD-06-03 | Mobile wallet / instant-payment methods recorded with reference | add methods `Wallet`, `InstantTransfer` | Not supported |
| OD-06-04 | Card terminal (ECR) integration | none / per-vendor integration | None; manual reference |
| OD-06-05 | Base-unit price when not configured | derive from pack price (rounded 4 dp) / require explicit | Derive |
| OD-06-06 | Return approval threshold default and whether out-of-window returns are allowed at all | 1,000.00 EGP + approval / block entirely | 1,000.00 + approval |
| OD-06-07 | Refund of card-paid sales in cash | allowed with override / never | Allowed with `RefundMethod` override |
| OD-06-08 | Loyalty program model (earn rate, point value, expiry, liability accounting, patient vs phone identity) | — | Not enabled (P3) |
| OD-06-09 | Selling the physically scanned GS1 batch when it differs from FEFO without `override-fefo` | warn only / auto-select scanned batch / require override | Warn only, FEFO allocates |
| OD-06-10 | Returns of controlled medicines | always discard / allow restock / disallow returns | Approval required; disposition per pharmacist (REG-02, REG-11) |
| OD-06-11 | Mandatory receipt/invoice fields and price display | per REG-07 / REG-08 outcome | Fields configurable, all printed when configured |
| OD-06-12 | Automatic closing of sessions open > 24 h | auto-close / notify only | Notify only |

Candidate assumptions (for `ASSUMPTIONS-AND-OPEN-DECISIONS.md`): POS requires continuous connectivity; card payments are approved on a standalone terminal before the sale is submitted; receipt printers are driven through the browser print dialog (kiosk printing configured per workstation); keyboard-wedge scanners emit an Enter suffix; one cash drawer per cash session.

## 20. Regulatory Review Items

REG-01, REG-02, REG-03, REG-04, REG-05, REG-06, REG-07, REG-08, REG-11.
