# EPIC-09: Finance and Reporting

## Goal

Provide accurate, auditable financial and operational reports that distinguish net sales, COGS, gross profit, cash flow, and inventory valuation.

## Scope

Branch and organization reports, projection reconciliation, finance and inventory analytics, expenses, exports, and dashboards. MVP includes the daily sales report, gross profit/COGS report, current stock valuation, near-expiry report, cash session Z-report/reconciliation, and CSV export. All other capabilities are post-MVP.

## Stories

| Story | Title | Priority | Complexity | Requirements | MVP |
|---|---|---|---|---|---|
| US-09-01 | Report Filters and Scoping | P0 | M | FR-09-001–005 | Yes |
| US-09-02 | DailyBranchSummary Projection, Late Corrections, and Nightly Reconciliation | P1 | L | FR-09-006–010 | No |
| US-09-03 | Daily Sales Report | P0 | M | FR-09-006, FR-09-011–012 | Yes |
| US-09-04 | Sales Analysis by Cashier, Medicine, Category, Payment Method, and Hour | P1 | M | FR-09-013–014 | No |
| US-09-05 | Gross Profit and COGS Report | P0 | M | FR-09-006, FR-09-015–017 | Yes |
| US-09-06 | Returns and Refunds Report | P1 | M | FR-09-018 | No |
| US-09-07 | Cash Session X/Z Report and Cash Reconciliation | P0 | M | FR-09-019–022 | Yes |
| US-09-08 | Current Inventory Valuation (Stock on Hand) | P0 | M | FR-09-023–024 | Yes |
| US-09-09 | Historical Inventory Valuation | P1 | M | FR-09-025–027 | No |
| US-09-10 | Near-Expiry and Expired Stock Report | P0 | M | FR-09-028 | Yes |
| US-09-11 | Inventory Loss Report | P1 | M | FR-09-029 | No |
| US-09-12 | Purchase Report | P1 | M | FR-09-030 | No |
| US-09-13 | Supplier Balances and Aging | P1 | M | FR-09-031–032 | No |
| US-09-14 | Expense Categories and Expense Reporting | P1 | L | FR-09-033–035 | No |
| US-09-15 | Expense Cash Payout and Reversal | P1 | M | FR-09-036–037 | No |
| US-09-16 | Expense Approval Workflow | P2 | M | FR-09-038 | No |
| US-09-17 | Tax Summary Report | P1 | M | FR-09-039 | No |
| US-09-18 | Synchronous CSV Report Export | P0 | M | FR-09-040–042 | Yes |
| US-09-19 | Background Report Exports | P1 | L | FR-09-042–045 | No |
| US-09-20 | Branch and Organization Dashboard | P1 | M | FR-09-046 | No |
| US-09-21 | Branch Comparison and Operating Summary | P1 | L | FR-09-047–048 | No |
| US-09-22 | ABC and Operational Analytics | P3 | L | FR-09-049–050 | No |

## Dependencies

```mermaid
graph TD
  U01[US-09-01 Filters and Scoping] --> U02[US-09-02 Summary Projection]
  U01 --> U03[US-09-03 Daily Sales]
  U01 --> U04[US-09-04 Sales Analysis]
  U03 --> U05[US-09-05 Gross Profit and COGS]
  U03 --> U06[US-09-06 Returns and Refunds]
  U01 --> U07[US-09-07 Cash Z-report and Reconciliation]
  U01 --> U08[US-09-08 Current Valuation]
  U08 --> U09[US-09-09 Historical Valuation and Roll-forward]
  U01 --> U10[US-09-10 Near-expiry]
  U08 --> U11[US-09-11 Loss Report]
  U01 --> U12[US-09-12 Purchase Report]
  U01 --> U13[US-09-13 Supplier Balances and Aging]
  U01 --> U14[US-09-14 Expense Categories and Report]
  U14 --> U15[US-09-15 Expense Cash Payout and Reversal]
  U14 --> U16[US-09-16 Expense Approval]
  U01 --> U17[US-09-17 Tax Summary]
  U01 --> U18[US-09-18 CSV Export]
  U18 --> U19[US-09-19 Background Exports]
  U03 --> U20[US-09-20 Dashboard]
  U05 --> U21[US-09-21 Comparison and Operating Summary]
  U14 --> U21
  U03 --> U22[US-09-22 ABC and Operational Analytics]
  U08 --> U22
```
