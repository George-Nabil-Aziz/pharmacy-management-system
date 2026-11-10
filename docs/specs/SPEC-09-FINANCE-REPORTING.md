# SPEC-09: Finance & Reporting

**Version:** 1.0 (2026-11-09)
**Status:** Draft — for review
**Owner:** Business Analysis / Architecture
**Related ADRs:** ADR-001 (modular monolith), ADR-002 (multi-tenancy), ADR-003/ADR-004 (inventory ledger), ADR-006 (file storage), ADR-007 (background jobs), ADR-008 (audit), ADR-009 (localization)
**Related BRQs:** BRQ-10 (primary), BRQ-01, BRQ-02, BRQ-04, BRQ-06, BRQ-07, BRQ-12, BRQ-13, BRQ-15

---

## 1. Purpose

This specification defines the Finance & Reporting module: operational management reports on sales, purchases, profitability, cash, inventory value, supplier payables, losses, tax collected, and expenses; the dashboard; report exports; and the data strategy that keeps every report consistent with every other report.

The module provides **operational management reporting. It is NOT a general ledger and NOT a double-entry accounting system.** It produces no journal entries, no chart of accounts, no trial balance, no balance sheet, and no statutory financial statements. Figures are management information derived from operational documents and ledgers owned by other modules. Export to an external general ledger / accounting package is a P3 item subject to OD-09-01.

## 2. Business Context

Pharmacy owners, branch managers, and accountants need daily answers to four different questions, which are routinely confused:

| Question | Concept (Conventions §2) | Primary source |
|---|---|---|
| How much did we sell? | **Net sales (Revenue)** | `SaleLine`, `SalesReturnLine` snapshots |
| How much did we earn on what we sold? | **Gross profit** = Net sales − **COGS** | `SaleLineAllocation` batch costs, `StockMovement` (restocked returns) |
| How much money actually came in and went out? | **Cash flow** | `Payment`, `Refund`, `SupplierPayment`, `Expense`, `CashMovement` |
| What is our stock worth? | **Inventory valuation** | `BatchBalance` / `StockMovement` × `Batch.UnitCost` |

Section 6.3 provides a worked numeric example in which the four figures differ for the same business day. All reports use the branch business date (BR-G-23), decimal arithmetic (BR-G-18), and the prices, costs, discounts, and tax amounts snapshotted on document lines (BR-G-20) — never current prices or costs.

## 3. Scope

1. Report query framework: branch scoping, organization-level scoping, business-date ranges with presets, pagination with full-result totals, response metadata.
2. Report data strategy: indexed OLTP queries plus the `DailyBranchSummary` projection maintained from outbox integration events and a nightly reconciliation job; late-correction handling; cross-report consistency (reconciliation) rules.
3. Sales reports: daily sales; sales analysis by cashier, medicine, category, payment method, hour of day.
4. Profitability: COGS, gross profit, gross margin %, operating summary (contribution after expenses and losses).
5. Returns and refunds report.
6. Cash: cash session X-report (open) and Z-report (closed), cash reconciliation and variance report across sessions (consumes `CashSession` / `CashMovement` from SPEC-06).
7. Inventory valuation: current, historical as-of (reconstructed from the movement ledger), roll-forward by movement type, in-transit value; expired / quarantined stock shown separately.
8. Near-expiry and expired stock report.
9. Loss reports: write-offs (damaged/expired), discarded sales returns, stocktake variance value.
10. Purchase report (goods receipts, supplier returns, net purchases).
11. Supplier balances and aging (consumes SPEC-05 `SupplierLedgerEntry`).
12. Expenses: categories, recording with attachments, cash-drawer payout, reversal; approval workflow (P2).
13. Tax (VAT) summary report — informational; rates are configuration (REG-06).
14. Branch comparison (organization level).
15. Dashboard tiles.
16. Exports: CSV (synchronous), CSV/XLSX/PDF background exports with 24-hour download links; all exports audited.
17. Advanced analytics (P3): ABC analysis, sales trends, slow-moving / dead stock, expiry loss forecast.

## 4. Out of Scope

- General ledger, double-entry bookkeeping, journal entries, chart of accounts, accruals, depreciation, period closing, balance sheet, statutory financial statements (GL export: P3, OD-09-01).
- Payroll and HR cost management (salaries may be recorded as an expense category only).
- Tax return preparation or submission; electronic invoice / receipt submission to tax authority systems (REG-07, owned by SPEC-06/SPEC-10 if adopted).
- Multi-currency; all amounts are in the organization's single currency (default EGP) — see OD-09-08.
- Bank reconciliation and bank account management.
- Budgeting and forecasting other than the P3 expiry loss forecast.
- Recording of sales, returns, payments, cash sessions, cash in/out (SPEC-06); goods receipts, supplier invoices, payments (SPEC-05); stock movements, write-offs, stocktakes (SPEC-04). This module reads them.
- Patient-level reports (no SPEC-09 report contains patient identifiers; patient data exports belong to SPEC-07).
- Ad-hoc report designer / custom SQL.

## 5. Actors and Permissions

### 5.1 Actors

| Actor | Uses this module to |
|---|---|
| Owner (`OWNER`) | View all reports for all branches, branch comparison, dashboard, exports, rebuild projections, approve expenses |
| Branch Manager (`MANAGER`) | View branch reports, record/reverse expenses, approve expenses (P2), view cash reconciliation |
| Accountant (`ACCOUNTANT`) | View finance reports, supplier aging, tax summary, record expenses, export |
| Pharmacist (`PHARMACIST`) | View near-expiry and inventory reports |
| Cashier (`CASHIER`) | View X/Z report of own cash session; pay a drawer expense when granted |
| Inventory Staff (`INVENTORY`) | View near-expiry and inventory quantity reports |
| System (background jobs) | Maintain `DailyBranchSummary`, nightly reconciliation, background exports, export file purge |

### 5.2 Permissions used

Canonical permissions (Conventions §5.2): `reports.sales.read`, `reports.inventory.read`, `reports.finance.read`, `reports.organization.read`, `reports.export`, `finance.expenses.manage`, `finance.cash.manage`, `sales.cash-sessions.open-close`, `sales.cash-sessions.manage`.

**New permissions introduced by this spec** (to be added to the SPEC-01 permission catalog):

| Permission | Purpose | Priority |
|---|---|---|
| `finance.expenses.approve` | Approve or reject expenses in `PendingApproval` | P2 |
| `reports.projections.manage` | Trigger a manual rebuild of the `DailyBranchSummary` projection for a branch and date range | P2 |

### 5.3 Report → permission matrix

| Report / function | Required permission(s) |
|---|---|
| Daily sales, sales analysis, returns & refunds | `reports.sales.read` |
| Gross profit / COGS, operating summary, tax summary, purchase report, supplier aging, expenses report, write-off & loss values, cash reconciliation report | `reports.finance.read` |
| Cash session X/Z report | own session: `sales.cash-sessions.open-close`; any session in branch: `sales.cash-sessions.manage` or `reports.finance.read` |
| Inventory valuation (current, historical, roll-forward), near-expiry, in-transit | `reports.inventory.read` |
| Any report across more than one branch, branch comparison, organization dashboard | `reports.organization.read` + the report's own permission |
| Export (any format) | `reports.export` + the report's own permission(s) |
| Expense categories manage; record / reverse expenses | `finance.expenses.manage` |
| Pay an expense from the cash drawer | `finance.expenses.manage` + `finance.cash.manage` |
| Approve / reject expenses | `finance.expenses.approve` |
| Projection rebuild | `reports.projections.manage` |
| Dashboard | each tile requires its source report's permission; tiles the user cannot see are omitted from the response |

### 5.4 Recommended default grants (for SPEC-01 role seeding)

| Permission | OWNER | MANAGER | ACCOUNTANT | PHARMACIST | CASHIER | INVENTORY |
|---|---|---|---|---|---|---|
| `reports.sales.read` | ✓ | ✓ | ✓ | – | – | – |
| `reports.finance.read` | ✓ | ✓ | ✓ | – | – | – |
| `reports.inventory.read` | ✓ | ✓ | ✓ | ✓ | – | ✓ |
| `reports.organization.read` | ✓ | – | ✓ (if org-wide scope) | – | – | – |
| `reports.export` | ✓ | ✓ | ✓ | – | – | – |
| `finance.expenses.manage` | ✓ | ✓ | ✓ | – | – | – |
| `finance.expenses.approve` | ✓ | ✓ | ✓ | – | – | – |
| `finance.cash.manage` | ✓ | ✓ | – | – | – | – |
| `reports.projections.manage` | ✓ | – | – | – | – | – |

## 6. Functional Requirements

### 6.1 Functional requirements table

| ID | Requirement | Priority | BRQ | Stories |
|---|---|---|---|---|
| FR-09-001 | The system shall serve branch reports only under `/api/v1/branches/{branchId}/reports/...`, validating that `branchId` belongs to the caller's organization (else 404) and is in the caller's assigned branches or the caller has organization-wide scope (else 403). | P0 | BRQ-02, BRQ-10 | US-09-01 |
| FR-09-002 | The system shall accept report periods as inclusive branch business dates (`from`, `to`, format `YYYY-MM-DD`) and include a record when its `BusinessDate` (or the business date derived from its UTC timestamp in the branch time zone, BR-G-23) is within the period. | P0 | BRQ-10 | US-09-01 |
| FR-09-003 | The system shall support the date presets `Today`, `Yesterday`, `Last7Days`, `Last30Days`, `ThisWeek`, `LastWeek`, `ThisMonth`, `LastMonth`, `ThisQuarter`, `ThisYear`, `LastYear`, resolved server-side against the branch's current business date, with weeks starting on the organization setting `ReportWeekStartDay` (default Saturday), and shall return the resolved `from`/`to` in the response. | P1 | BRQ-10, BRQ-13 | US-09-01 |
| FR-09-004 | The system shall reject interactive report requests whose period exceeds 366 days (single branch) or 31 days (organization-level detail reports read from OLTP) with `REPORTS.RANGE_REQUIRES_EXPORT`, directing the user to a background export. | P0 | BRQ-10 | US-09-01 |
| FR-09-005 | Every report response shall include `meta` (resolved parameters, `generatedAt` UTC, branch time zone, currency code, `dataAsOf` freshness timestamp) and a `totals` object computed over all rows matching the filters, independent of the returned page. | P1 | BRQ-10 | US-09-01 |
| FR-09-006 | The system shall attribute each financial event to its own business date: sales to the sale's business date, sales returns to the return's completion business date, restocking COGS reversal to the disposition business date, expenses to the expense date, expense reversals to the reversal business date (event-date attribution, BR-09-003). | P0 | BRQ-10 | US-09-02, US-09-03, US-09-05 |
| FR-09-007 | The system shall maintain one `DailyBranchSummary` row per branch per business date (plus `DailyBranchPaymentSummary` rows per payment method), updated by consuming outbox integration events idempotently (each event applied at most once, tracked in `ProjectionInboxRecord`). | P1 | BRQ-10, BRQ-14 | US-09-02 |
| FR-09-008 | A nightly job (default 02:00 branch time) shall recompute `DailyBranchSummary` for each branch for the previous 7 business days from OLTP, evaluate reconciliation rules RC-01…RC-07, correct any differing row, record differences in `BackgroundJobRun`, and notify Owners when any difference ≠ 0.00 is found. | P1 | BRQ-10, BRQ-14 | US-09-02 |
| FR-09-009 | When an event affects a business date earlier than the branch's current business date (late correction), the system shall recompute that date's summary row, increment its `Version`, and set `LastRecomputedAt`; summary rows are replaced, never edited field-by-field from the UI. | P1 | BRQ-10 | US-09-02 |
| FR-09-010 | The system shall allow a user with `reports.projections.manage` to request a rebuild of `DailyBranchSummary` for one branch and a range ≤ 366 days, run as a background job, audited, with at most one rebuild running per branch (else `REPORTS.PROJECTION_REBUILD_IN_PROGRESS`). | P2 | BRQ-10, BRQ-12 | US-09-02 |
| FR-09-011 | The daily sales report shall return, per business date in the period: sale count, gross sales, discounts, sales returns, net sales, tax collected (net), payments received per payment method, refunds paid per payment method, void count and voided amount, and average basket value. | P0 | BRQ-07, BRQ-10 | US-09-03 |
| FR-09-012 | The daily sales report `totals` shall equal the sum of its daily rows for every amount field with a difference of exactly 0.00, and `netSales` shall equal `grossSales − discounts − salesReturns` on every row. | P0 | BRQ-10 | US-09-03 |
| FR-09-013 | The sales analysis report shall group sales for a period by one of `cashier`, `medicine`, `category`, `paymentMethod`, `hourOfDay`, returning per group: quantity sold (base units), sale count, gross sales, discounts, sales returns, net sales, and share of period net sales (%), sortable by any amount column. | P1 | BRQ-07, BRQ-10 | US-09-04 |
| FR-09-014 | The payment method grouping shall report payments received, refunds paid, and net received per method, and the sum of net received across methods shall equal `cashFlowFromSales` for the period. | P1 | BRQ-10 | US-09-04 |
| FR-09-015 | The system shall compute COGS as Σ round₂(`SaleLineAllocation.Quantity` × `SaleLineAllocation.UnitCost`) for non-voided sales in the period minus Σ round₂(quantity × unit cost) of `SalesReturn` stock movements (restocked returns) in the period. | P0 | BRQ-10 | US-09-05 |
| FR-09-016 | The gross profit report shall return net sales, COGS, gross profit, and gross margin % grouped by `day`, `medicine`, or `category`, with margin % = gross profit ÷ net sales × 100 rounded to 2 decimals (AwayFromZero) and `null` when net sales = 0.00. | P0 | BRQ-10 | US-09-05 |
| FR-09-017 | The gross profit report shall flag every group whose gross profit is < 0.00 with `negativeMargin = true` and support filtering to flagged groups only. | P1 | BRQ-10 | US-09-05 |
| FR-09-018 | The returns & refunds report shall list completed sales returns in the period with return number, original sale number, original sale business date, lines, returned quantity, return amount (excl. tax), tax reversed, refund amount per method, line disposition (`PendingInspection`, `Restocked`, `Discarded`), and approver, plus totals and return rate % = sales returns ÷ (gross sales − discounts) × 100. | P1 | BRQ-07, BRQ-10 | US-09-06 |
| FR-09-019 | The system shall produce a Z-report for a `Closed` cash session containing opening float, cash sales receipts, cash refunds, cash in, cash out, expense payouts, expected cash, counted cash, variance, non-cash payments per method, sale count, void count, return count, opened/closed by and at. | P0 | BRQ-07, BRQ-10 | US-09-07 |
| FR-09-020 | The system shall produce an X-report for an `Open` cash session with the same figures as the Z-report except counted cash and variance, labelled "Not final". | P1 | BRQ-07, BRQ-10 | US-09-07 |
| FR-09-021 | The cash reconciliation report shall list closed cash sessions in the period with cashier, expected, counted, and variance, filterable by cashier and by non-zero variance, sortable by absolute variance, with totals of expected, counted, shortages (Σ negative variances) and overages (Σ positive variances). | P1 | BRQ-10 | US-09-07 |
| FR-09-022 | Z-report figures for a closed session shall be identical on every generation (BR-G-26); a session's expected cash shall equal opening float + Σ signed `CashMovement.Amount` of that session (RC-06). | P0 | BRQ-10, BRQ-12 | US-09-07 |
| FR-09-023 | The current inventory valuation report shall list, per batch and aggregated per medicine and category, on-hand quantity (base units), reserved quantity, unit cost, and value = round₂(on-hand × unit cost), split into the classes `Sellable`, `DoNotSellWindow`, `Expired`, `Quarantined` with a subtotal per class. | P0 | BRQ-04, BRQ-10 | US-09-08 |
| FR-09-024 | The current inventory valuation grand total shall equal Σ round₂(`BatchBalance.OnHand` × `Batch.UnitCost`) over all batches of the branch with on-hand > 0, with a difference of exactly 0.00. | P0 | BRQ-10 | US-09-08 |
| FR-09-025 | The system shall reconstruct inventory valuation as of a past business date by summing `StockMovement.QuantityDelta` per batch with `BusinessDate` ≤ as-of date and valuing each batch at `Batch.UnitCost`, classifying batches with `ExpiryDate` ≤ as-of date as `Expired`. | P1 | BRQ-04, BRQ-10 | US-09-09 |
| FR-09-026 | The inventory roll-forward report shall show, for a period, opening value, value change per stock movement type (§6.2 of Conventions), and closing value, where opening value + Σ changes = closing value exactly (RC-04). | P1 | BRQ-04, BRQ-10 | US-09-09 |
| FR-09-027 | The organization-level valuation shall show stock in transit (dispatched, not yet received transfer quantities from `StockTransferAllocation`) as a separate line valued at source batch unit cost, excluded from every branch's on-hand value. | P1 | BRQ-04, BRQ-10 | US-09-09 |
| FR-09-028 | The near-expiry report shall list batches with on-hand > 0 whose days to expiry are between 1 and the window (default: branch near-expiry threshold, BR-G-27; override parameter `days` 1–730), with quantity, cost value, retail value at the current effective selling price, and days to expiry, and list already-expired batches with on-hand > 0 in a separate section. | P0 | BRQ-04, BRQ-11 | US-09-10 |
| FR-09-029 | The loss report shall list, for a period, posted write-offs by type (`WriteOffDamaged`, `WriteOffExpired`), discarded sales return lines (return loss), and stocktake variances, each with medicine, batch, quantity, unit cost, and cost value, with totals per loss type. | P1 | BRQ-04, BRQ-10 | US-09-11 |
| FR-09-030 | The purchase report shall return, for a period, posted goods receipt cost (quantity × batch unit cost), receipt reversals, supplier returns, and net purchases, grouped by `supplier`, `medicine`, `category`, or `day`. | P1 | BRQ-06, BRQ-10 | US-09-12 |
| FR-09-031 | The supplier balances report shall show, per supplier as of a business date, the payable balance = Σ signed `SupplierLedgerEntry.Amount` with entry business date ≤ as-of date. | P1 | BRQ-06, BRQ-10 | US-09-13 |
| FR-09-032 | The supplier aging report shall distribute each supplier's open invoice amounts by days past due as of the as-of date into buckets `NotDue`, `1-30`, `31-60`, `61-90`, `>90`, show unallocated payments and credits separately, and the sum of buckets minus unallocated credits shall equal the supplier balance (RC-07). | P1 | BRQ-06, BRQ-10 | US-09-13 |
| FR-09-033 | The system shall let users with `finance.expenses.manage` create, rename, deactivate, and reactivate organization-level expense categories with unique Arabic and English names; categories referenced by expenses cannot be deleted. | P1 | BRQ-10 | US-09-14 |
| FR-09-034 | The system shall record an expense for a branch with category, amount, expense date, payment method, payment source, description, optional reference number, and up to 5 attachments, writing an audit entry in the same transaction. | P1 | BRQ-10, BRQ-12 | US-09-14 |
| FR-09-035 | The expenses report shall list expenses for a period filtered by branch, category, status, and payment method, with totals per category and an overall total that counts only expenses that reached `Approved` (net of reversals per BR-09-012). | P1 | BRQ-10 | US-09-14 |
| FR-09-036 | When an expense's payment source is `CashDrawer`, the system shall, in the same transaction as the expense reaching `Approved`, append a `CashMovement` of type `ExpensePayout` (negative amount) to the recording user's open cash session in that branch. | P1 | BRQ-07, BRQ-10 | US-09-15 |
| FR-09-037 | The system shall allow reversal of an `Approved` expense with a mandatory reason, setting status `Reversed`, attributing the reversal to the reversal business date, and for drawer-paid expenses appending a compensating `CashMovement` of type `ExpensePayoutReversal` to the reversing user's open cash session. | P1 | BRQ-10, BRQ-12 | US-09-15 |
| FR-09-038 | When the organization setting `ExpenseApprovalThreshold` is set and an expense amount ≥ threshold, the system shall create the expense in `PendingApproval`; a different user with `finance.expenses.approve` shall approve (→ `Approved`) or reject with reason (→ `Rejected`). | P2 | BRQ-10, BRQ-12 | US-09-16 |
| FR-09-039 | The tax summary report shall return, per tax rate and `TaxCategory` snapshotted on sale lines, taxable base (net sales), tax on sales, tax reversed on returns, and net tax collected, plus informational input tax from posted supplier invoices, and display a disclaimer that the report is not a tax return (REG-06, REG-07). | P1 | BRQ-10, BRQ-15 | US-09-17 |
| FR-09-040 | The system shall return any report as CSV synchronously (via `format=csv` on the report endpoint) when the result has ≤ 5,000 rows, containing exactly the same rows and totals as the JSON response for the same parameters. | P0 | BRQ-10 | US-09-18 |
| FR-09-041 | CSV exports shall be UTF-8 with BOM, comma-separated, RFC 4180 quoted, ISO 8601 dates, `.` decimal separator with no thousands separators, column headers in the user's language, and cells beginning with `=`, `+`, `-`, `@`, tab, or carriage return prefixed with a single quote. | P0 | BRQ-10, BRQ-13 | US-09-18 |
| FR-09-042 | Every export request (synchronous or background) and every download of a background export shall write an audit log entry recording user, report type, parameters, format, row count, and outcome. | P0 | BRQ-12 | US-09-18, US-09-19 |
| FR-09-043 | The system shall run exports as background jobs when the result exceeds 5,000 rows or the format is XLSX or PDF, creating a `ReportExport` (`Queued` → `Running` → `Completed`/`Failed`) and notifying the requester on completion or failure. | P1 | BRQ-10 | US-09-19 |
| FR-09-044 | A completed background export shall be downloadable only by the requesting user via a pre-signed URL (TTL 5 minutes) issued per download request, until 24 hours after completion; afterwards the export becomes `Expired`, its file is deleted, and download returns `REPORTS.EXPORT_EXPIRED`. | P1 | BRQ-10, BRQ-12 | US-09-19 |
| FR-09-045 | The system shall limit each user to 3 `Queued` or `Running` exports at a time, rejecting further requests with `REPORTS.TOO_MANY_CONCURRENT_EXPORTS`. | P1 | BRQ-14 | US-09-19 |
| FR-09-046 | The dashboard shall return, for a branch (or all accessible branches with `reports.organization.read`) for the current business date: net sales, sale count, gross profit, gross margin %, low-stock medicine count, near-expiry cost value, expired on-hand cost value, and cash in open sessions, omitting tiles the user lacks permission for. | P1 | BRQ-10, BRQ-11 | US-09-20 |
| FR-09-047 | The branch comparison report shall return, for a period and the branches the user may access, per branch: net sales, sale count, average basket, gross profit, gross margin %, expenses, write-off loss, contribution after expenses, closing inventory value, near-expiry value, cash variance total, and share of organization net sales (%), plus organization totals equal to the sum of branch rows. | P1 | BRQ-02, BRQ-10 | US-09-21 |
| FR-09-048 | The operating summary report shall return for a branch or the organization and a period: net sales, COGS, gross profit, approved expenses (net of reversals), write-off loss, return loss, stocktake variance value, and contribution after expenses, labelled as management information and not net profit. | P1 | BRQ-10 | US-09-21 |
| FR-09-049 | The ABC analysis (P3) shall rank medicines by net sales for a period and classify each medicine by its cumulative share of net sales including itself (rounded to 2 decimals): A if ≤ 80.00%, B if > 80.00% and ≤ 95.00%, C if > 95.00%. | P3 | BRQ-10 | US-09-22 |
| FR-09-050 | The analytics module (P3) shall provide: sales trend (net sales per day/week/month with the same period of the previous year), slow-moving / dead stock (medicines with on-hand > 0 and no sale in the last N days, N 30–365, default 90), and expiry loss forecast (cost value of on-hand units per batch exceeding trailing-90-day average daily sales × days to expiry). | P3 | BRQ-10, BRQ-11 | US-09-22 |

### 6.2 Metric dictionary

All amounts are `numeric(19,2)`; intermediate unit-level values `numeric(19,4)`; rounding `MidpointRounding.AwayFromZero` at line/allocation level, then sums of rounded values (BR-G-18). "In period" means the attribution business date in the table is within `from`…`to`.

| Metric key | Definition / formula | Source tables | Attribution date | Notes |
|---|---|---|---|---|
| `grossSales` | Σ `SaleLine.LineGrossAmount` (quantity × snapshotted unit price, excl. tax) | `sales.sale_lines`, `sales.sales` | `Sale.BusinessDate` | Sales with status `Voided` excluded (BR-09-004) |
| `discounts` | Σ `SaleLine.LineDiscountAmount` (incl. prorated sale-level discount) | `sales.sale_lines` | `Sale.BusinessDate` | Voided excluded |
| `salesReturns` | Σ `SalesReturnLine.LineNetAmount` (returned qty × original unit price − proportional original discount, excl. tax) | `sales.sales_return_lines`, `sales.sales_returns` | return completion business date | Only `Completed` returns |
| `netSales` (Revenue) | `grossSales − discounts − salesReturns` | derived | — | Conventions §2 |
| `taxOnSales` | Σ `SaleLine.LineTaxAmount` | `sales.sale_lines` | `Sale.BusinessDate` | Voided excluded |
| `taxReversed` | Σ `SalesReturnLine.LineTaxAmount` | `sales.sales_return_lines` | return business date | |
| `netTaxCollected` | `taxOnSales − taxReversed` | derived | — | REG-06 |
| `saleCount` | count of `Sale` not `Voided` | `sales.sales` | `Sale.BusinessDate` | |
| `averageBasket` | (`grossSales − discounts`) ÷ `saleCount`, round₂; `null` if `saleCount` = 0 | derived | — | |
| `voidCount` / `voidedAmount` | count / Σ `Sale.Total` of sales `Voided` | `sales.sales` | void business date | Control figure only |
| `cogsSold` | Σ round₂(`SaleLineAllocation.Quantity` × `SaleLineAllocation.UnitCost`) | `sales.sale_line_allocations` | `Sale.BusinessDate` | Voided excluded |
| `cogsRestocked` | Σ round₂(`QuantityDelta` × `UnitCost`) of movements type `SalesReturn` | `inventory.stock_movements` | movement `BusinessDate` (disposition set) | REG-11 disposition |
| `cogs` | `cogsSold − cogsRestocked` | derived | — | Conventions §2 |
| `grossProfit` | `netSales − cogs` | derived | — | |
| `grossMarginPct` | `grossProfit ÷ netSales × 100`, round₂; `null` if `netSales` = 0.00 | derived | — | |
| `returnLoss` | Σ round₂(qty × original allocation unit cost) of return lines with disposition `Discarded` | `sales.sales_return_lines`, `sales.sale_line_allocations` | disposition business date | COGS is not reversed for these |
| `writeOffLoss` | −Σ round₂(`QuantityDelta` × `UnitCost`) of movements `WriteOffDamaged`, `WriteOffExpired` | `inventory.stock_movements` | movement `BusinessDate` | Positive number |
| `stocktakeVarianceValue` | Σ round₂(`QuantityDelta` × `UnitCost`) of movements `StocktakeVariance` | `inventory.stock_movements` | movement `BusinessDate` | Signed |
| `expenses` | Σ `Expense.Amount` of expenses that reached `Approved` with `ExpenseDate` in period − Σ `Expense.Amount` of expenses with `ReversalBusinessDate` in period | `finance.expenses` | expense date / reversal date | BR-09-012 |
| `contributionAfterExpenses` | `grossProfit − expenses − writeOffLoss − returnLoss + stocktakeVarianceValue` | derived | — | Not "net profit" |
| `paymentsReceived[method]` | Σ `Payment.Amount` (applied amount, net of change) of non-voided sales | `sales.payments` | `Sale.BusinessDate` | |
| `refundsPaid[method]` | Σ `Refund.Amount` | `sales.refunds` | refund business date | |
| `cashFlowFromSales` | Σ `paymentsReceived` − Σ `refundsPaid` | derived | — | |
| `supplierPayments[method]` | Σ `SupplierPayment.Amount` | `procurement.supplier_payments` | payment business date | |
| `expensesPaid` | = `expenses` (all payment methods) | `finance.expenses` | as `expenses` | |
| `netCashFlow` | `cashFlowFromSales − Σ supplierPayments − expensesPaid` | derived | — | Excludes drawer-internal cash in/out (float, bank drops) |
| `expectedCash` (session) | `CashSession.OpeningFloat` + Σ signed `CashMovement.Amount` of the session | `sales.cash_sessions`, `sales.cash_movements` | session | RC-06 |
| `cashVariance` (session) | `CashSession.CountedCash − expectedCash` | `sales.cash_sessions` | session close business date | Negative = shortage |
| `inventoryValue(asOf)` | Σ per batch round₂(on-hand at end of as-of date × `Batch.UnitCost`) | current: `inventory.batch_balances`, `inventory.batches`; historical: `inventory.stock_movements` | as-of date | |
| `inTransitValue` | Σ round₂(dispatched − received − returned quantity × source `UnitCost`) | `inventory.stock_transfer_allocations` | as-of date | Org-level only |
| `nearExpiryValue` | Σ round₂(on-hand × `UnitCost`) for `Active` batches with 1 ≤ days to expiry ≤ window | `inventory.batch_balances`, `inventory.batches` | current business date | |
| `expiredStockValue` | Σ round₂(on-hand × `UnitCost`) for batches with `ExpiryDate` ≤ business date | as above | current business date | |
| `lowStockCount` | count of medicines with a `ReorderSetting` where Σ sellable qty ≤ `MinQuantity` | `inventory.reorder_settings`, `inventory.batch_balances` | current | Sellable per Conventions §10 note |
| `purchases` | Σ round₂(`GoodsReceiptLine` quantity × unit cost) of `Posted` receipts − reversals | `procurement.goods_receipt_lines` | receipt business date | |
| `supplierReturnsValue` | Σ `SupplierReturnLine` cost amount, `Posted` | `procurement.supplier_return_lines` | return business date | |
| `netPurchases` | `purchases − supplierReturnsValue` | derived | — | |
| `supplierBalance(asOf)` | Σ signed `SupplierLedgerEntry.Amount` (credit = increases payable) | `procurement.supplier_ledger_entries` | entry business date | |

### 6.3 Worked example — four different numbers for the same day

Branch `CAI01`, business date 2026-11-09, single currency EGP. Illustrative tax configuration: Medicine A tax rate 0%, Medicine B tax rate 14% (illustrative only; actual rates are configuration pending REG-06). Opening inventory valuation at start of day: 10,000.00. Opening cash float: 500.00.

| # | Event | Detail |
|---|---|---|
| E1 | Sale S1 | 10 × Medicine A @ 50.00 = 500.00 gross, line discount 20.00, tax 0.00, total 480.00, paid **cash** 480.00. Allocated batch cost 35.0000 → cogs 350.00 |
| E2 | Sale S2 | 4 × Medicine B @ 25.00 = 100.00 gross, discount 0.00, tax 14.00, total 114.00, paid **card** 114.00. Batch cost 15.0000 → cogs 60.00 |
| E3 | Sale S3 + void | 1 × Medicine A @ 50.00 cash, voided in the same session (excluded from sales; void count 1, voided amount 50.00) |
| E4 | Sales return R1 | Of a sale dated 2026-11-08: 2 × Medicine A @ 50.00, no original discount → 100.00, tax 0.00, refunded **cash** 100.00; disposition `Restocked` the same day into original batch (cost 35.0000) |
| E5 | Expense | Electricity 150.00, approved, paid from **cash drawer** |
| E6 | Write-off | 1 × Medicine A damaged, batch cost 35.0000 |
| E7 | Goods receipt | 20 × Medicine C @ 12.0000 = 240.00, on credit |
| E8 | Supplier payment | 1,000.00 by bank transfer |
| E9 | Session close | Counted cash 725.00 |

| Metric | Computation | Value |
|---|---|---|
| Gross sales | 500.00 + 100.00 | 600.00 |
| Discounts | 20.00 | 20.00 |
| Sales returns | 100.00 | 100.00 |
| **Net sales (Revenue)** | 600.00 − 20.00 − 100.00 | **480.00** |
| Net tax collected | 14.00 − 0.00 | 14.00 |
| COGS | (350.00 + 60.00) − 70.00 | 340.00 |
| **Gross profit** | 480.00 − 340.00 | **140.00** |
| Gross margin % | 140.00 ÷ 480.00 × 100 | 29.17% |
| Contribution after expenses | 140.00 − 150.00 − 35.00 − 0.00 + 0.00 | −45.00 |
| Cash flow from sales | (480.00 + 114.00) − 100.00 | 494.00 |
| **Net cash flow** | 494.00 − 1,000.00 − 150.00 | **−656.00** |
| Expected cash (drawer) | 500.00 + 480.00 + 50.00 − 50.00 − 100.00 − 150.00 | 730.00 |
| Cash variance | 725.00 − 730.00 | −5.00 (shortage) |
| Inventory change | −350.00 − 60.00 (sales) − 35.00 + 35.00 (S3 sale/void) + 70.00 (restock) − 35.00 (write-off) + 240.00 (receipt) | −135.00 |
| **Inventory valuation (end of day)** | 10,000.00 − 135.00 | **9,865.00** |

Revenue 480.00 ≠ gross profit 140.00 ≠ net cash flow −656.00 ≠ inventory valuation 9,865.00. The supplier payment reduces cash but not profit; the goods receipt raises inventory value but not cash or profit on this day; the restocked return reverses 70.00 of COGS and adds 70.00 to inventory value; the expense reduces cash and contribution but not gross profit. This dataset is the mandatory reference fixture for EPIC-09 tests (TS-09-xxx "reference dataset").

### 6.4 Report consistency (reconciliation) rules

| ID | Rule (must hold to 0.00 for any branch and period) |
|---|---|
| RC-01 | Σ `Sale.Total` of non-voided sales = Σ `paymentsReceived` (all methods) for the same sales. |
| RC-02 | Σ `SalesReturn` totals (net + tax) of completed returns = Σ `refundsPaid` for those returns. |
| RC-03 | `netSales + netTaxCollected = cashFlowFromSales` when every sale and return in the period is fully paid/refunded in the period (true by BR-G-35 and RC-02). In the example: 480.00 + 14.00 = 494.00. |
| RC-04 | `inventoryValue(end of to)` = `inventoryValue(end of from − 1)` + Σ round₂(`QuantityDelta` × `UnitCost`) of all movements in the period. |
| RC-05 | `cogs` = −Σ round₂(`QuantityDelta` × `UnitCost`) of movements of types `Sale`, `SaleVoid`, `SalesReturn` in the period, for sales whose business date equals the movement business date. |
| RC-06 | For every closed cash session: `expectedCash` = opening float + Σ signed cash movements; Σ cash `paymentsReceived` − Σ cash `refundsPaid` − Σ `ExpensePayout` + Σ `ExpensePayoutReversal` + Σ cash in − Σ cash out = Σ signed cash movements. |
| RC-07 | Per supplier: Σ aging buckets − unallocated credits = `supplierBalance(asOf)`. |
| RC-08 | `DailyBranchSummary` values for a business date = values computed directly from OLTP for that date (verified nightly, FR-09-008). |
| RC-09 | Branch comparison organization totals = Σ branch rows; daily report totals = Σ daily rows. |

### 6.5 Report data strategy

1. **Detail reports** (sales analysis, returns, Z-report, valuation, near-expiry, losses, purchases, aging, tax, expenses) read OLTP tables directly with read-only transactions, `READ COMMITTED`, statement timeout 30 s, using composite indexes beginning with `(organization_id, branch_id, business_date)` on `sales.sales`, `sales.sales_returns`, `sales.payments`, `sales.refunds`, `sales.cash_movements`, `inventory.stock_movements`, `procurement.goods_receipts`, `procurement.supplier_ledger_entries`, `finance.expenses`, and `(organization_id, branch_id, expiry_date)` on `inventory.batches`.
2. **Summary reports** (daily sales, gross profit by day, dashboard, branch comparison, operating summary, sales trend) read `DailyBranchSummary` for completed business dates and compute the current business date live from OLTP, merging both; `meta.dataAsOf` reports the oldest `LastRecomputedAt`/event watermark used.
3. **Projection updates**: integration events published through the transactional outbox (`SaleCompleted`, `SaleVoided`, `SalesReturnCompleted`, `SalesReturnLineDispositionSet`, `CashSessionClosed`, `WriteOffPosted`, `StocktakePosted`, `GoodsReceiptPosted`, `GoodsReceiptReversed`, `SupplierReturnPosted`, `ExpenseApproved`, `ExpenseReversed`; final names aligned with owning specs) trigger recomputation of the affected `(branch, businessDate)` row from OLTP (recompute-on-event, not increment-on-event), which makes processing idempotent and order-independent.
4. **Late corrections**: any event whose business date is earlier than the branch's current business date (e.g., a void after midnight, a back-dated expense, a delayed outbox message) recomputes that date's row (FR-09-009). Past figures therefore change only when an underlying document of that date changes; the change is visible through `Version`/`LastRecomputedAt`.
5. **Nightly reconciliation** (FR-09-008) and on-demand **rebuild** (FR-09-010) guarantee RC-08.
6. A PostgreSQL read replica for reports is optional (OD-09-03); when used, `meta.dataAsOf` reflects replica lag.

## 7. Business Rules

| ID | Rule | Source |
|---|---|---|
| BR-09-001 | This module is operational management reporting, not a general ledger; it creates no journal entries and its figures are not statutory financial statements. | Scope |
| BR-09-002 | All money metrics use decimal arithmetic and the amounts snapshotted on document lines and allocations; reports never recompute history from current prices or current costs. | BR-G-18, BR-G-20 |
| BR-09-003 | Event-date attribution: every event is reported on its own business date in the branch time zone; corrections appear on the correction's business date, not by altering the original date (except voids, BR-09-004). | BR-G-23, BR-G-25 |
| BR-09-004 | A voided sale is excluded from gross sales, discounts, tax, COGS, payments, and sale count of its sale business date and is reported only as `voidCount`/`voidedAmount` on the void business date; if a void occurs on a later business date, the original date's summary is recomputed (late correction). | BR-G-11 |
| BR-09-005 | Sales returns reduce net sales on the return's business date. COGS is reversed only for return lines with disposition `Restocked`, on the disposition business date. `Discarded` lines produce `returnLoss`; `PendingInspection` lines produce neither. | REG-11 note, Conventions §10 |
| BR-09-006 | COGS uses `SaleLineAllocation.UnitCost` (the batch cost at the time of sale), rounded per allocation. | BR-G-18, BR-G-20 |
| BR-09-007 | Gross margin % is rounded to 2 decimals and is `null` (displayed "—") when net sales = 0.00; no division by zero occurs. | BR-G-18 |
| BR-09-008 | Inventory is valued at `Batch.UnitCost` (actual receipt cost; transfers carry source cost per BR-G-04). No average costing, no revaluation. | BR-G-04 |
| BR-09-009 | Valuation class precedence: `Quarantined` > `Expired` (`ExpiryDate` ≤ business date) > `DoNotSellWindow` > `Sellable`. Each batch belongs to exactly one class. | BR-G-07, BR-G-27 |
| BR-09-010 | A closed cash session's figures are immutable; Z-report generation reads only data of that session and produces identical output on each generation. | BR-G-26 |
| BR-09-011 | Expenses are documents; once `Approved` they are never edited — corrections are made by reversal plus a new expense. | BR-G-25 |
| BR-09-012 | Only expenses that reached `Approved` count in reports; a reversal subtracts the amount on the reversal business date; `PendingApproval` and `Rejected` expenses are excluded from totals and shown separately. | BR-G-25 |
| BR-09-013 | An expense approver must be a different user from its creator. | BR-G-28 (by analogy) |
| BR-09-014 | Organization-level reports include only branches the user may access: all branches with organization-wide scope, otherwise only assigned branches; a requested branch outside that set → 403. | BR-G-17 |
| BR-09-015 | An export contains exactly the rows and totals the report endpoint returns for the same parameters at generation time. | — |
| BR-09-016 | Export files are private, downloadable only by the requester, and deleted ≤ 25 hours after completion. | BR-G-16 |
| BR-09-017 | Tax summary figures are informational, computed from snapshotted tax rates and amounts; the system does not determine tax liability. | REG-06, REG-07 |
| BR-09-018 | Each organization reports in one currency (default `EGP`); amounts are displayed with 2 decimals. | OD-09-08 |
| BR-09-019 | For aging, an invoice's due date is `SupplierInvoice.DueDate`; when absent, invoice date + supplier payment terms days (0 if none). | — |
| BR-09-020 | No SPEC-09 report or export contains patient names, identifiers, or medical data. | BR-G-29, REG-04 |

## 8. Data Requirements

### 8.1 Entities owned by Finance (`finance` schema)

**`ExpenseCategory`** (org-level master data): `Id`, `OrganizationId`, `NameAr` (1–100), `NameEn` (1–100), `IsActive`, `DeactivatedAt`, audit columns, `RowVersion`. Unique (OrganizationId, lower(NameAr)) and (OrganizationId, lower(NameEn)).

**`Expense`** (branch document): `Id`, `OrganizationId`, `BranchId`, `ExpenseCategoryId`, `Amount numeric(19,2)`, `ExpenseDate date` (business date), `PaymentMethod` (`Cash`, `Card`, `BankTransfer`, `MobileWallet`, `Other`), `PaymentSource` (`CashDrawer`, `External`), `CashSessionId uuid?`, `Description` (1–500), `ReferenceNumber` (≤ 50, nullable), `Status` (`PendingApproval`, `Approved`, `Rejected`, `Reversed`), `ApprovedBy`, `ApprovedAt`, `RejectedBy`, `RejectedAt`, `RejectionReason`, `ReversedBy`, `ReversedAt`, `ReversalBusinessDate`, `ReversalReason`, `ReversalCashSessionId?`, audit columns, `RowVersion`.

**`ExpenseAttachment`** (new): `Id`, `OrganizationId`, `ExpenseId`, `FileObjectId`, `CreatedAt`, `CreatedBy`. Append-only (attachments are not deleted).

**`DailyBranchSummary`** (projection): PK (`OrganizationId`, `BranchId`, `BusinessDate`); `SaleCount`, `GrossSales`, `Discounts`, `SalesReturns`, `NetSales`, `TaxOnSales`, `TaxReversed`, `CogsSold`, `CogsRestocked`, `Cogs`, `GrossProfit`, `ReturnLoss`, `WriteOffLoss`, `StocktakeVarianceValue`, `Expenses`, `VoidCount`, `VoidedAmount`, `ReturnCount`, `SupplierPayments`, `Purchases`, `CashVarianceTotal`, `Version int`, `LastRecomputedAt timestamptz`, `LastEventId uuid?`.

**`DailyBranchPaymentSummary`** (new, projection child): PK (`OrganizationId`, `BranchId`, `BusinessDate`, `PaymentMethod`); `PaymentsReceived`, `RefundsPaid`.

**`ProjectionInboxRecord`** (new, infrastructure): `EventId` PK, `Projection` (e.g., `DailyBranchSummary`), `ProcessedAt`. Retained 30 days.

**`ReportExport`**: `Id`, `OrganizationId`, `BranchId?`, `RequestedBy`, `ReportType`, `Parameters jsonb`, `Format` (`Csv`, `Xlsx`, `Pdf`), `Status` (`Queued`, `Running`, `Completed`, `Failed`, `Expired`), `RowCount`, `FileObjectId?`, `FailureCode?`, `RequestedAt`, `StartedAt`, `CompletedAt`, `ExpiresAt` (= `CompletedAt` + 24 h).

### 8.2 Data consumed (read-only)

`Sale`, `SaleLine`, `SaleLineAllocation`, `Payment`, `SalesReturn`, `SalesReturnLine`, `Refund`, `CashSession`, `CashMovement` (SPEC-06); `Batch`, `BatchBalance`, `StockMovement`, `WriteOff(Line)`, `Stocktake(Line)`, `StockTransferAllocation`, `ReorderSetting` (SPEC-04); `GoodsReceipt(Line)`, `SupplierInvoice`, `SupplierReturn(Line)`, `SupplierPayment(Allocation)`, `SupplierLedgerEntry`, `Supplier` (SPEC-05); `Medicine`, `MedicineCategory`, `MedicinePrice`, `BranchMedicinePrice`, `TaxCategory` (SPEC-03); `Branch`, `BranchSettings`, `OrganizationSettings` (SPEC-02); `User` (SPEC-01); `FileObject`, `AuditLog`, `Notification`, `BackgroundJobRun` (SPEC-10).

Expected snapshot fields on SPEC-06 lines (assumption, to be confirmed by SPEC-06): `SaleLine.LineGrossAmount`, `LineDiscountAmount` (incl. prorated sale-level discount), `LineTaxAmount`, `TaxRate`, `TaxCategoryId`, `LineTotal`; `SalesReturnLine.LineNetAmount`, `LineTaxAmount`, `Disposition`, `DispositionBusinessDate`; `Payment.Amount` = applied amount net of change; `CashMovement.Amount` signed.

### 8.3 New settings

| Setting | Level | Default | Purpose |
|---|---|---|---|
| `ReportWeekStartDay` | Organization | `Saturday` | Week presets (OD-09-02) |
| `ExpenseBackdateDays` | Organization | 31 | Max days an expense date may precede the current business date (0–366) |
| `ExpenseApprovalThreshold` | Organization | `null` (approval disabled) | Amount at or above which expenses need approval (P2) |

### 8.4 Sample report response (daily sales, abbreviated)

```json
{
  "meta": {
    "report": "sales-daily", "branchId": "0193...", "from": "2026-11-09", "to": "2026-11-09",
    "preset": "Today", "timeZone": "Africa/Cairo", "currency": "EGP",
    "generatedAt": "2026-11-09T19:02:11Z", "dataAsOf": "2026-11-09T19:02:10Z"
  },
  "items": [{
    "businessDate": "2026-11-09", "saleCount": 2, "grossSales": "600.00", "discounts": "20.00",
    "salesReturns": "100.00", "netSales": "480.00", "netTaxCollected": "14.00",
    "payments": [{"method": "Cash", "received": "480.00", "refunded": "100.00"},
                 {"method": "Card", "received": "114.00", "refunded": "0.00"}],
    "voidCount": 1, "voidedAmount": "50.00", "averageBasket": "290.00"
  }],
  "totals": { "saleCount": 2, "grossSales": "600.00", "netSales": "480.00", "netTaxCollected": "14.00" },
  "page": 1, "pageSize": 25, "totalCount": 1
}
```

Money values are serialized as strings to preserve decimal precision.

## 9. Validation Rules

| ID | Field / Object | Rule | Error code |
|---|---|---|---|
| VR-09-001 | `from`, `to` | Both required unless `preset` given; valid `YYYY-MM-DD`; `from` ≤ `to` | `REPORTS.INVALID_DATE_RANGE` |
| VR-09-002 | `to`, `asOf` | ≤ branch's current business date | `REPORTS.FUTURE_DATE_NOT_ALLOWED` |
| VR-09-003 | Interactive period | ≤ 366 days (single branch); ≤ 31 days for org-level detail reports | `REPORTS.RANGE_REQUIRES_EXPORT` |
| VR-09-004 | Export period | ≤ 1,827 days | `REPORTS.DATE_RANGE_TOO_LARGE` |
| VR-09-005 | `preset` | One of the FR-09-003 values; not combined with `from`/`to` | `REPORTS.INVALID_PRESET` |
| VR-09-006 | `groupBy` | Allowed values for the report (FR-09-013, 016, 030) | `REPORTS.INVALID_GROUP_BY` |
| VR-09-007 | `page`, `pageSize`, `sort` | `page` ≥ 1; 1 ≤ `pageSize` ≤ 100; sort field in report's column list | `REPORTS.INVALID_PAGINATION` |
| VR-09-008 | `days` (near-expiry) | Integer 1–730 | `REPORTS.INVALID_EXPIRY_WINDOW` |
| VR-09-009 | `format` | `csv`, `xlsx`, `pdf` (sync endpoint: `csv` only) | `REPORTS.UNSUPPORTED_FORMAT` |
| VR-09-010 | PDF export | Row count ≤ 5,000 | `REPORTS.PDF_ROW_LIMIT_EXCEEDED` |
| VR-09-011 | CSV/XLSX export | Row count ≤ 1,000,000 | `REPORTS.EXPORT_ROW_LIMIT_EXCEEDED` |
| VR-09-012 | `reportType` | Registered report type | `REPORTS.UNKNOWN_REPORT_TYPE` |
| VR-09-013 | Expense category names | `NameAr`, `NameEn` 1–100 chars after trim | `FINANCE.EXPENSE_CATEGORY_NAME_INVALID` |
| VR-09-014 | Expense category names | Unique per organization, case-insensitive | `FINANCE.EXPENSE_CATEGORY_NAME_DUPLICATE` |
| VR-09-015 | `Expense.Amount` | > 0.00, ≤ 9,999,999.99, max 2 decimals | `FINANCE.EXPENSE_AMOUNT_INVALID` |
| VR-09-016 | `Expense.ExpenseCategoryId` | Exists in organization and `IsActive` | `FINANCE.EXPENSE_CATEGORY_INACTIVE` |
| VR-09-017 | `Expense.ExpenseDate` | ≤ current business date and ≥ current business date − `ExpenseBackdateDays` | `FINANCE.EXPENSE_DATE_OUT_OF_RANGE` |
| VR-09-018 | `PaymentMethod`, `PaymentSource` | Valid enum values; `CashDrawer` requires `PaymentMethod = Cash`; `CashDrawer` not allowed when the expense requires approval (FR-09-038) | `FINANCE.EXPENSE_PAYMENT_INVALID` |
| VR-09-019 | `Description`, `ReferenceNumber` | Description 1–500 chars; reference ≤ 50 chars | `FINANCE.EXPENSE_FIELD_INVALID` |
| VR-09-020 | Attachment | Content type PDF/JPEG/PNG (verified by file signature), ≤ 10 MB | `FINANCE.ATTACHMENT_INVALID` |
| VR-09-021 | Attachments per expense | ≤ 5 | `FINANCE.ATTACHMENT_LIMIT_EXCEEDED` |
| VR-09-022 | Drawer payout / reversal | User has an `Open` cash session in this branch | `FINANCE.CASH_SESSION_NOT_OPEN` |
| VR-09-023 | Drawer payout | Amount ≤ session's current expected cash | `FINANCE.INSUFFICIENT_DRAWER_CASH` |
| VR-09-024 | Expense reversal | Status `Approved`; reason 5–500 chars | `FINANCE.EXPENSE_NOT_REVERSIBLE` / `FINANCE.EXPENSE_FIELD_INVALID` |
| VR-09-025 | Approve / reject | Status `PendingApproval` | `FINANCE.EXPENSE_NOT_PENDING` |
| VR-09-026 | Approve / reject | Actor ≠ creator | `FINANCE.EXPENSE_SELF_APPROVAL_FORBIDDEN` |
| VR-09-027 | Reject | Reason 5–500 chars | `FINANCE.EXPENSE_FIELD_INVALID` |
| VR-09-028 | Projection rebuild | `from` ≤ `to` ≤ current business date; span ≤ 366 days | `REPORTS.REBUILD_RANGE_INVALID` |
| VR-09-029 | Analytics parameters | `slowMovingDays` 30–365; trend `granularity` ∈ `day`,`week`,`month` | `REPORTS.INVALID_ANALYTICS_PARAMETER` |

## 10. API Requirements

All money values are strings with 2 decimals. All list reports support `page`, `pageSize`, `sort`, and `format=csv` (synchronous CSV, FR-09-040). `{b}` = `{branchId}`.

| Method | Path | Purpose | Permission | Idempotency |
|---|---|---|---|---|
| GET | `/api/v1/branches/{b}/reports/sales/daily` | Daily sales report | `reports.sales.read` | N/A (read) |
| GET | `/api/v1/branches/{b}/reports/sales/analysis?groupBy=` | Sales analysis | `reports.sales.read` | N/A |
| GET | `/api/v1/branches/{b}/reports/sales/returns` | Returns & refunds | `reports.sales.read` | N/A |
| GET | `/api/v1/branches/{b}/reports/profit?groupBy=` | Gross profit / COGS | `reports.finance.read` | N/A |
| GET | `/api/v1/branches/{b}/reports/operating-summary` | Operating summary | `reports.finance.read` | N/A |
| GET | `/api/v1/branches/{b}/reports/cash-sessions/{cashSessionId}` | X-report (open) / Z-report (closed) | see §5.3 | N/A |
| GET | `/api/v1/branches/{b}/reports/cash-reconciliation` | Cash variance across sessions | `reports.finance.read` | N/A |
| GET | `/api/v1/branches/{b}/reports/inventory/valuation?asOf=` | Current (no `asOf`) / historical valuation | `reports.inventory.read` | N/A |
| GET | `/api/v1/branches/{b}/reports/inventory/roll-forward` | Valuation roll-forward | `reports.inventory.read` | N/A |
| GET | `/api/v1/branches/{b}/reports/inventory/near-expiry?days=` | Near-expiry & expired stock | `reports.inventory.read` | N/A |
| GET | `/api/v1/branches/{b}/reports/inventory/losses` | Write-off, return loss, stocktake variance | `reports.finance.read` | N/A |
| GET | `/api/v1/branches/{b}/reports/purchases?groupBy=` | Purchase report | `reports.finance.read` | N/A |
| GET | `/api/v1/branches/{b}/reports/supplier-aging?asOf=` | Supplier balances & aging (branch documents) | `reports.finance.read` | N/A |
| GET | `/api/v1/branches/{b}/reports/tax-summary` | Tax summary | `reports.finance.read` | N/A |
| GET | `/api/v1/branches/{b}/reports/expenses` | Expenses report | `reports.finance.read` or `finance.expenses.manage` | N/A |
| GET | `/api/v1/branches/{b}/dashboard` | Branch dashboard | per tile | N/A |
| GET | `/api/v1/dashboard` | Organization dashboard | `reports.organization.read` + per tile | N/A |
| GET | `/api/v1/reports/branch-comparison` | Branch comparison | `reports.organization.read` + `reports.sales.read` + `reports.finance.read` | N/A |
| GET | `/api/v1/reports/operating-summary` | Org operating summary | `reports.organization.read` + `reports.finance.read` | N/A |
| GET | `/api/v1/reports/inventory/valuation?asOf=` | Org valuation incl. in-transit | `reports.organization.read` + `reports.inventory.read` | N/A |
| GET | `/api/v1/reports/supplier-aging?asOf=` | Org supplier aging | `reports.organization.read` + `reports.finance.read` | N/A |
| GET | `/api/v1/branches/{b}/reports/analytics/{abc\|sales-trend\|slow-moving\|expiry-forecast}` | P3 analytics | `reports.sales.read` (abc, trend) / `reports.inventory.read` (others) | N/A |
| POST | `/api/v1/report-exports` | Request background export `{reportType, branchId?, parameters, format}` → 202 | `reports.export` + report permission | Optional `Idempotency-Key` |
| GET | `/api/v1/report-exports` | List own exports (last 7 days) | `reports.export` | N/A |
| GET | `/api/v1/report-exports/{exportId}` | Export status | `reports.export` (requester only) | N/A |
| GET | `/api/v1/report-exports/{exportId}/download` | 302 to pre-signed URL (TTL 5 min) | `reports.export` (requester only) | N/A |
| POST | `/api/v1/branches/{b}/reports/projections/rebuild` | Rebuild `DailyBranchSummary` `{from, to}` → 202 | `reports.projections.manage` | Required |
| GET | `/api/v1/expense-categories` | List categories | `finance.expenses.manage` or `reports.finance.read` | N/A |
| POST | `/api/v1/expense-categories` | Create category | `finance.expenses.manage` | N/A |
| PUT | `/api/v1/expense-categories/{id}` | Rename (`If-Match`) | `finance.expenses.manage` | N/A (ETag) |
| POST | `/api/v1/expense-categories/{id}/deactivate` · `/activate` | Toggle active | `finance.expenses.manage` | N/A |
| GET | `/api/v1/branches/{b}/expenses` · `/{expenseId}` | List / detail | `finance.expenses.manage` or `reports.finance.read` | N/A |
| POST | `/api/v1/branches/{b}/expenses` | Record expense | `finance.expenses.manage` (+ `finance.cash.manage` for `CashDrawer`) | Required |
| POST | `/api/v1/branches/{b}/expenses/{expenseId}/attachments` | Add attachment (multipart) | `finance.expenses.manage` | N/A |
| GET | `/api/v1/branches/{b}/expenses/{expenseId}/attachments/{attachmentId}` | 302 to pre-signed URL | `finance.expenses.manage` or `reports.finance.read` | N/A |
| POST | `/api/v1/branches/{b}/expenses/{expenseId}/reverse` | Reverse `{reason}` | `finance.expenses.manage` (+ `finance.cash.manage` if drawer) | Required |
| POST | `/api/v1/branches/{b}/expenses/{expenseId}/approve` · `/reject` | Approve / reject (P2) | `finance.expenses.approve` | Required |

## 11. Authorization Requirements

1. Every endpoint enforces Conventions §5.3: permission AND branch access AND organization from token. Cross-organization ids (branch, session, expense, export, category) → **404** with no data; same-organization branch not assigned → **403** `COMMON.FORBIDDEN` (CS-07, CS-08).
2. Organization-level endpoints and any request spanning more than one branch require `reports.organization.read`; the branch set is restricted per BR-09-014.
3. Cash session reports: a user with only `sales.cash-sessions.open-close` may read only sessions where `CashSession.CashierId` = caller; other sessions → 403.
4. Export requests are authorized twice: at request time (export + report permissions and branch access) and at job execution time (the requester's current permissions); if revoked in between, the export fails with `REPORTS.EXPORT_PERMISSION_REVOKED`.
5. Export status and downloads are restricted to the requester; any other user (including Owner) → 404.
6. Dashboard tiles are filtered server-side; the response omits unauthorized tiles rather than returning nulls.
7. Expense approval: actor holds `finance.expenses.approve`, has access to the expense's branch, and is not the creator.

## 12. Error Handling

Responses use RFC 9457 Problem Details with `code`, `traceId`, `errors`.

| HTTP | Code | When |
|---|---|---|
| 400 | `REPORTS.INVALID_DATE_RANGE`, `REPORTS.INVALID_PRESET`, `REPORTS.INVALID_GROUP_BY`, `REPORTS.INVALID_PAGINATION`, `REPORTS.INVALID_EXPIRY_WINDOW`, `REPORTS.UNSUPPORTED_FORMAT`, `REPORTS.UNKNOWN_REPORT_TYPE`, `REPORTS.INVALID_ANALYTICS_PARAMETER`, `REPORTS.FUTURE_DATE_NOT_ALLOWED`, `REPORTS.REBUILD_RANGE_INVALID` | Invalid report parameters |
| 422 | `REPORTS.RANGE_REQUIRES_EXPORT`, `REPORTS.DATE_RANGE_TOO_LARGE`, `REPORTS.PDF_ROW_LIMIT_EXCEEDED`, `REPORTS.EXPORT_ROW_LIMIT_EXCEEDED` | Valid parameters exceed interactive or export limits; for sync CSV over 5,000 rows the response is 422 `REPORTS.RANGE_REQUIRES_EXPORT` |
| 422 | `FINANCE.EXPENSE_*`, `FINANCE.ATTACHMENT_*`, `FINANCE.CASH_SESSION_NOT_OPEN`, `FINANCE.INSUFFICIENT_DRAWER_CASH` | Expense validation / state violations |
| 422 | `COMMON.IDEMPOTENCY_KEY_REUSED` | Same key, different request |
| 403 | `COMMON.FORBIDDEN` | Missing permission or branch not accessible |
| 404 | `REPORTS.CASH_SESSION_NOT_FOUND`, `REPORTS.EXPORT_NOT_FOUND`, `FINANCE.EXPENSE_NOT_FOUND`, `FINANCE.EXPENSE_CATEGORY_NOT_FOUND`, `COMMON.NOT_FOUND` | Missing or other-organization resource |
| 409 | `REPORTS.EXPORT_NOT_READY` | Download before `Completed` |
| 409 | `REPORTS.PROJECTION_REBUILD_IN_PROGRESS` | Second rebuild for same branch |
| 410 | `REPORTS.EXPORT_EXPIRED` | Download after `ExpiresAt` |
| 412 | `COMMON.CONCURRENCY_CONFLICT` | `If-Match` mismatch on category rename |
| 429 | `REPORTS.TOO_MANY_CONCURRENT_EXPORTS` | > 3 queued/running exports |
| 503 | `REPORTS.QUERY_TIMEOUT` | Interactive query exceeded 30 s; client suggests export |
| — (job) | `REPORTS.EXPORT_PERMISSION_REVOKED`, `REPORTS.EXPORT_GENERATION_FAILED` | `ReportExport.FailureCode` values |

## 13. Edge Cases

1. Sale completed at 23:59:30 Cairo time is stored at 21:59:30Z and reported on that Cairo business date, not the UTC date.
2. A cash session opened before midnight and closed after midnight: the Z-report covers the whole session; the session's variance is attributed to the close business date; sales inside it are attributed to each sale's business date.
3. A void processed after midnight for a sale of the previous business date recomputes the previous date's summary (BR-09-004) and increments its `Version`.
4. A return of a sale from a previous month reduces net sales in the return's month; the original month's report is unchanged.
5. Return line `PendingInspection` at period end: included in `salesReturns`, excluded from `cogsRestocked` and `returnLoss`; when later `Restocked`, COGS reversal falls on the disposition date — margin of both periods differs from a "matched" view (documented, OD-09-06).
6. Net sales = 0.00 with non-zero COGS (e.g., only returns in period): margin % = `null`, gross profit negative.
7. Branch with no activity in a period: daily report returns rows with zeros for every date in the period (no gaps) and totals 0.00.
8. Medicine category changed after the sale: category grouping uses the medicine's current category (snapshot of category is not kept; OD-09-07 notes alternative).
9. Batch received with unit cost 0.0000 (free goods): valued at 0.00, included in quantities.
10. Historical valuation as of a date before a batch existed: batch excluded (no movements ≤ as-of).
11. Historical valuation and quarantine: quarantine status history is not available; historical reports classify by expiry only and label quarantine as "not reconstructible" (OD-09-04).
12. Stock in transit at as-of date: excluded from both branches, shown as org-level in-transit line (FR-09-027).
13. Organization with branches in different time zones: org-level period uses each branch's own business date.
14. Export requested, then user's `reports.export` revoked before the job runs → export `Failed` with `REPORTS.EXPORT_PERMISSION_REVOKED`.
15. Export result 0 rows: file contains headers and totals only; still audited.
16. Expense reversal by a user other than the creator without an open session for a drawer-paid expense → `FINANCE.CASH_SESSION_NOT_OPEN`; an external-paid expense needs no session.
17. Back-dated expense (within `ExpenseBackdateDays`) triggers a late-correction recompute of that date.
18. Supplier invoice partially paid with a payment that also covers another invoice: aging uses `SupplierPaymentAllocation`; unallocated remainder shown as unallocated credit.
19. Same day contains a rounding remainder: totals are sums of rounded line values, so the daily total may differ by ≤ 0.01 × line count from a recomputation of the unrounded total; reports never present unrounded recomputations.
20. Deactivated branch: still reportable for historical periods by authorized users.

## 14. Acceptance Criteria

| ID | Spec-level acceptance criterion |
|---|---|
| SAC-09-01 | Loading the §6.3 reference dataset yields net sales 480.00, COGS 340.00, gross profit 140.00, margin 29.17%, net cash flow −656.00, expected cash 730.00, variance −5.00, inventory valuation 9,865.00. |
| SAC-09-02 | RC-01…RC-09 hold to 0.00 on the reference dataset and on a randomized dataset of ≥ 10,000 sales. |
| SAC-09-03 | Every report endpoint returns 403 for an unassigned branch of the same organization and 404 for a branch of another organization. |
| SAC-09-04 | `DailyBranchSummary` matches OLTP recomputation for every branch and date after the nightly job. |
| SAC-09-05 | A CSV export contains the same rows and totals as the JSON report for identical parameters, and an audit entry exists for each export and download. |
| SAC-09-06 | Background export download links stop working 24 hours after completion (410). |
| SAC-09-07 | Closed cash session Z-report output is byte-identical across two generations. |
| SAC-09-08 | Historical valuation as of a past date equals the current valuation minus the value of all movements after that date. |
| SAC-09-09 | Expenses count in reports only once `Approved`; reversals appear negative on the reversal date. |
| SAC-09-10 | Single-branch reports over 366 days meet NFR-09-001 on the performance dataset. |

## 15. Dependencies

| Depends on | For |
|---|---|
| SPEC-01 | Permissions (incl. new `finance.expenses.approve`, `reports.projections.manage`), branch assignment, org-wide scope |
| SPEC-02 | Branch time zone, business date, `BranchSettings` (near-expiry threshold, do-not-sell window), `OrganizationSettings` (new settings §8.3) |
| SPEC-03 | Medicine, category, prices, `TaxCategory` |
| SPEC-04 | `Batch`, `BatchBalance`, `StockMovement`, write-offs, stocktakes, transfers, `ReorderSetting` |
| SPEC-05 | Goods receipts, supplier invoices (`DueDate`), supplier returns, payments, `SupplierLedgerEntry` |
| SPEC-06 | Sale/return snapshots (§8.2), `Payment`, `Refund`, `CashSession`, `CashMovement` incl. new types `ExpensePayout`, `ExpensePayoutReversal`; integration events |
| SPEC-10 | `AuditLog`, `Notification` (export completed/failed, reconciliation discrepancy, expense pending approval), `FileObject`, `OutboxMessage`, `BackgroundJobRun` |

## 16. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-09-001 | Single-branch interactive reports over ≤ 366 days: p95 ≤ 5 s server time (NFR-G-03) on a dataset of 250,000 sales, 750,000 sale lines, and 2,000,000 stock movements per branch-year; periods ≤ 31 days: p95 ≤ 1.5 s. |
| NFR-09-002 | Dashboard (branch) p95 ≤ 1 s; organization dashboard for 50 branches p95 ≤ 2 s. |
| NFR-09-003 | `DailyBranchSummary` reflects a committed event within 60 s at p95 and 5 min at p99. |
| NFR-09-004 | Nightly reconciliation for 50 branches × 7 business days completes in ≤ 30 min. |
| NFR-09-005 | Background export starts within 60 s of request at p95; 1,000,000-row CSV completes ≤ 10 min; 1,000,000-row XLSX ≤ 15 min; 5,000-row PDF ≤ 2 min. |
| NFR-09-006 | Reconciliation rules RC-01…RC-09: 0.00 difference on 100% of branches in the nightly job and in automated tests. |
| NFR-09-007 | Interactive report queries are read-only with a 30 s statement timeout; with 10 concurrent report requests per branch, sale completion stays within NFR-G-02. |
| NFR-09-008 | Report labels, column headers, PDF exports, and number/date formatting available in `ar` (RTL) and `en`; CSV numeric values always use Western digits and `.` decimal. |
| NFR-09-009 | Export files deleted ≤ 25 h after completion (hourly purge job). |
| NFR-09-010 | Synchronous CSV of 5,000 rows returned in ≤ 5 s p95. |

## 17. Security and Privacy Considerations

1. Cost, margin, and supplier data are commercially sensitive: they require `reports.finance.read` / `reports.inventory.read`, never `reports.sales.read` alone.
2. No patient data appears in any report or export (BR-09-020); cashier names (staff) appear in cash and sales-by-cashier reports.
3. Export files are stored in private object storage (ADR-006), accessible only via per-request pre-signed URLs with 5-minute TTL; links in notifications point to the API download endpoint, never to the storage URL.
4. CSV formula-injection neutralization (FR-09-041).
5. Audit entries: expense create/approve/reject/reverse, attachment add, category create/rename/deactivate/activate, export request, export download, projection rebuild (SPEC-10 sensitive-operation catalog).
6. Logs never contain report contents or export file URLs (NFR-G-10).
7. Expense attachments are scanned for content-type by file signature; executable or mismatched files are rejected.

## 18. Testing Considerations

1. **Reference dataset** (§6.3) as a shared fixture; every money-report story asserts its exact figures.
2. **Reconciliation property tests**: randomized sales/returns/voids/write-offs/receipts; assert RC-01…RC-09.
3. **Time-zone tests**: events at 21:59Z and 22:00Z (Cairo UTC+2 in winter) and around DST transitions if applicable to the branch time zone.
4. **Authorization matrix**: CS-07 (cross-branch 403) and CS-08 (cross-org 404) on every endpoint; per-tile dashboard filtering.
5. **Projection tests**: duplicate event delivery, out-of-order events, late correction, nightly job discrepancy repair.
6. **Performance**: dataset per NFR-09-001; concurrent reports during POS load test.
7. **Export tests**: row-limit boundaries (5,000 / 5,001), 24 h expiry with a controllable clock, Arabic text in CSV/XLSX/PDF, formula injection.

## 19. Open Decisions

| ID | Decision needed | Default until decided |
|---|---|---|
| OD-09-01 | Whether and how to export to an external general ledger / accounting package (journal export format, account mapping) | Not provided (P3) |
| OD-09-02 | Week start day for presets (Saturday vs Sunday) | `Saturday`, configurable via `ReportWeekStartDay` |
| OD-09-03 | Use of a PostgreSQL read replica for reports | Primary database with read-only transactions |
| OD-09-04 | Whether SPEC-04 keeps batch status history so historical valuation can classify `Quarantined` | Historical classification by expiry only |
| OD-09-05 | Alignment of `CashMovement` types `ExpensePayout` / `ExpensePayoutReversal` with SPEC-06, and whether cashiers may pay expenses from the drawer | Types as named; requires `finance.cash.manage` |
| OD-09-06 | COGS reversal attribution for restocked returns: disposition date (chosen) vs return date | Disposition date |
| OD-09-07 | Snapshot medicine category on sale lines for historical category reporting | Current category used |
| OD-09-08 | Multi-currency support | Single currency per organization, EGP |
| OD-09-09 | Confirm SPEC-06 restricts voids to the same open cash session | Late-correction handling covers cross-date voids |
| OD-09-10 | Tax summary layout alignment with any electronic invoice/receipt obligations | Informational layout (REG-06, REG-07) |
| OD-09-11 | Retail value basis for near-expiry (current effective price vs last sale price) | Current effective selling price |

## 20. Regulatory Review Items

- REG-05 — retention of financial records, expense documents, and export audit trail.
- REG-06 — tax rates and VAT applicability shown in the tax summary are configuration, not determinations.
- REG-07 — whether tax reporting must align with electronic invoicing / receipt systems.
- REG-11 — returned-medicine disposition drives COGS reversal vs return loss.
