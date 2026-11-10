# Test Cases — EPIC-06 Sales & Point of Sale

> **Generated** by `node scripts/docs/gen-test-cases.mjs` on 2026-11-10 from the story files in `docs/stories/EPIC-06-SALES-POS/`. Each test case corresponds to one test scenario (TS) declared in a story; preconditions, steps and expected results are derived from the Given / When / Then of the acceptance criteria it covers. The stories are the source of truth — change a story and regenerate.

**Conventions:** TC ID = TS ID. Priority T0 blocks merge, T1 blocks release, T2/T3 per [MASTER-TEST-STRATEGY §6](../test-plans/MASTER-TEST-STRATEGY.md). Execution: *Automated* tests are implemented in code with a trait/name carrying the TS ID; *Manual* cases are executed from this document. Test data conventions: [TEST-DATA-STRATEGY.md](../test-plans/TEST-DATA-STRATEGY.md).

## Summary (178 test cases)

| TC | Scenario | Type | Priority | Release | Covers |
|---|---|---|---|---|---|
| TS-06-001 | Ranking of barcode, name prefix, ingredient, contains; ≤ 20 results | Integration | T1 | MVP | US-06-01-AC1 |
| TS-06-002 | Arabic normalization variants (أ/إ/آ, ة, ى, diacritics) | Unit | T1 | MVP | US-06-01-AC2 |
| TS-06-003 | Result fields, sellable split into packs+units, out-of-stock flag; expired-only stock shows 0 | Integration | T1 | MVP | US-06-01-AC3 |
| TS-06-004 | Inactive excluded; short query 400 | Integration | T1 | MVP | US-06-01-AC4 |
| TS-06-005 | Alternatives filtered by sellable stock | Integration | T1 | MVP | US-06-01-AC5 |
| TS-06-006 | 403 without permission; 403 other branch; other-org data absent / 404 | Security | T0 | MVP | US-06-01-AC6, US-06-01-AC7 |
| TS-06-007 | p95 ≤ 300 ms at 50,000 medicines / 500,000 batches | Performance | T1 | MVP | US-06-01-AC1 |
| TS-06-008 | Simulated wedge input adds then increments line | E2E | T1 | MVP | US-06-02-AC1 |
| TS-06-009 | Scanner detection timing threshold vs manual typing | Unit | T1 | MVP | US-06-02-AC2 |
| TS-06-010 | Unknown barcode: 404, cart unchanged, alert, link action by permission | E2E | T1 | MVP | US-06-02-AC3 |
| TS-06-011 | GS1 AI 01/10/17 parsing and FEFO mismatch warning | Unit | T1 | MVP | US-06-02-AC4 |
| TS-06-012 | 403 without permission; other-org barcode 404; other branch 403 | Security | T0 | MVP | US-06-02-AC5, US-06-02-AC6 |
| TS-06-013 | QuantityBaseUnits derivation; BaseUnit availability by AllowSplitPack | Unit | T1 | MVP | US-06-03-AC1 |
| TS-06-014 | Quantity bound validation | Unit | T1 | MVP | US-06-03-AC2 |
| TS-06-015 | Sellable cap warning per line | Unit | T1 | MVP | US-06-03-AC3 |
| TS-06-016 | Cart persistence on refresh; cleared on logout; per user+branch keys | E2E | T1 | MVP | US-06-03-AC4 |
| TS-06-017 | Recalculation vs golden vectors after edits | Unit | T1 | MVP | US-06-03-AC5 |
| TS-06-018 | Branch override vs organization default | Integration | T1 | MVP | US-06-04-AC1 |
| TS-06-019 | Base-unit price derivation and rounding | Unit | T1 | MVP | US-06-04-AC2 |
| TS-06-020 | Quote equals §7.2 example; nothing persisted | Integration | T1 | MVP | US-06-04-AC3 |
| TS-06-021 | Missing price rejected | Integration | T1 | MVP | US-06-04-AC4 |
| TS-06-022 | 403 permission / other branch; other-org medicine not revealed | Security | T0 | MVP | US-06-04-AC5 |
| TS-06-023 | Quote p95 ≤ 300 ms for 50 lines | Performance | T1 | MVP | US-06-04-AC3 |
| TS-06-024 | Exclusive mode golden vectors incl. §7.2 | Unit | T1 | MVP | US-06-05-AC1 |
| TS-06-025 | Inclusive mode golden vectors incl. 40.37 → 4.96 | Unit | T1 | MVP | US-06-05-AC2 |
| TS-06-026 | Rate and mode snapshots unchanged after configuration change | Integration | T1 | MVP | US-06-05-AC3, US-06-05-AC5 |
| TS-06-027 | Missing tax category rejected | Integration | T1 | MVP | US-06-05-AC4 |
| TS-06-028 | Line discount percent/amount computation | Unit | T1 | MVP | US-06-06-AC1 |
| TS-06-029 | Pro-rata allocation and remainder rule | Unit | T1 | MVP | US-06-06-AC2 |
| TS-06-030 | Within-limit discount accepted | Integration | T1 | MVP | US-06-06-AC3 |
| TS-06-031 | Over-limit rejected, nothing persisted | Integration | T1 | MVP | US-06-06-AC4 |
| TS-06-032 | Effective limit = max over roles; custom role default 0 | Unit | T1 | MVP | US-06-06-AC5 |
| TS-06-033 | Discount without `sales.discounts.apply` → 403 | Security | T0 | MVP | US-06-06-AC6 |
| TS-06-034 | Override issued with binding, TTL, audit | Integration | T1 | MVP | US-06-07-AC1 |
| TS-06-035 | Consumption in sale transaction with audit | Integration | T1 | MVP | US-06-07-AC2 |
| TS-06-036 | Consumed / expired / other-user override rejected | Integration | T1 | MVP | US-06-07-AC3 |
| TS-06-037 | Approver limit exceeded; self-approval rejected | Integration | T1 | MVP | US-06-07-AC4 |
| TS-06-038 | Failed approver auth counts toward lockout; rate limit 429 | Security | T0 | MVP | US-06-07-AC5 |
| TS-06-039 | Rollback leaves override unconsumed | Integration | T1 | MVP | US-06-07-AC6 |
| TS-06-040 | Requester without permission / other branch → 403 | Security | T0 | MVP | US-06-07-AC7 |
| TS-06-041 | Open session creates OpeningFloat movement and audit | Integration | T1 | MVP | US-06-08-AC1 |
| TS-06-042 | Second open same branch rejected; other branch allowed | Integration | T1 | MVP | US-06-08-AC2 |
| TS-06-043 | Parallel opens → one session | Concurrency | T0 | MVP | US-06-08-AC3 |
| TS-06-044 | POS blocked without session; API 409 | E2E | T1 | MVP | US-06-08-AC4 |
| TS-06-045 | Float validation | Unit | T1 | MVP | US-06-08-AC5 |
| TS-06-046 | 403 permission/branch; 404 other organization | Security | T0 | MVP | US-06-08-AC6 |
| TS-06-047 | Cash in updates expected cash and audits | Integration | T2 | MVP | US-06-09-AC1 |
| TS-06-048 | Cash out within available | Integration | T2 | MVP | US-06-09-AC2 |
| TS-06-049 | Cash out over available and concurrent cash out + refund serialization | Concurrency | T1 | MVP | US-06-09-AC3 |
| TS-06-050 | Movement on closed session rejected | Integration | T2 | MVP | US-06-09-AC4 |
| TS-06-051 | 403 permission / branch; 404 other organization | Security | T1 | MVP | US-06-09-AC5 |
| TS-06-052 | Expected cash formula and variance from mixed movements | Integration | T1 | MVP | US-06-10-AC1 |
| TS-06-053 | Blind: no expected cash for owner before close; X-report for manager only | Security | T0 | MVP | US-06-10-AC2 |
| TS-06-054 | Variance note requirement and manager notification | Integration | T1 | MVP | US-06-10-AC3 |
| TS-06-055 | Denomination breakdown consistency | Unit | T1 | MVP | US-06-10-AC4 |
| TS-06-056 | Z-report totals reconcile with sales, returns, voids, movements | Integration | T1 | MVP | US-06-10-AC5 |
| TS-06-057 | Close vs in-flight sale; immutability after close | Concurrency | T0 | MVP | US-06-10-AC6 |
| TS-06-058 | Non-owner 403 `SALES.CASH_SESSION_NOT_OWNED`; no permission 403; other org 404 | Security | T0 | MVP | US-06-10-AC7 |
| TS-06-059 | Z-report ≤ 2 s for 1,000 sales | Performance | T1 | MVP | US-06-10-AC5 |
| TS-06-060 | Force-close with Forced type, audit, owner notification | Integration | T2 | MVP | US-06-11-AC1 |
| TS-06-061 | Variance note required above tolerance | Integration | T2 | MVP | US-06-11-AC2 |
| TS-06-062 | Owner close vs manager force-close race → one close persists | Concurrency | T1 | MVP | US-06-11-AC3 |
| TS-06-063 | Reason length validation | Unit | T2 | MVP | US-06-11-AC4 |
| TS-06-064 | 403 without manage / other branch (CS-07); 404 other organization (CS-08) | Security | T1 | MVP | US-06-11-AC5 |
| TS-06-065 | Full completion of §7.2 cart; verify every written row and balances | Integration | T1 | MVP | US-06-12-AC1 |
| TS-06-066 | FEFO across two batches with unit cost snapshot; expired batch untouched | Integration | T1 | MVP | US-06-12-AC2 |
| TS-06-067 | CS-02: expired, do-not-sell window, and quarantined-only stock rejected; nothing persisted | Integration | T0 | MVP | US-06-12-AC3 |
| TS-06-068 | Price change → `SALES.PRICE_MISMATCH` with quote; nothing persisted | Integration | T1 | MVP | US-06-12-AC4 |
| TS-06-069 | Batch selling price override splits line into two sale lines | Integration | T1 | MVP | US-06-12-AC5 |
| TS-06-070 | Closed session 409; other user's session 403 | Integration | T1 | MVP | US-06-12-AC6 |
| TS-06-071 | Invoice numbers consecutive around a failed sale | Integration | T1 | MVP | US-06-12-AC7 |
| TS-06-072 | 403 permission, CS-07 cross-branch 403, CS-08 other-org medicine not revealed (RLS on) | Security | T0 | MVP | US-06-12-AC8 |
| TS-06-073 | p95 ≤ 800 ms / p99 ≤ 1.5 s at 20 cashiers × 50 branches | Performance | T1 | MVP | US-06-12-AC1 |
| TS-06-074 | Cash with change: payment, change, cash movement | Integration | T1 | MVP | US-06-13-AC1 |
| TS-06-075 | Split card + cash; only last 4 digits stored | Integration | T1 | MVP | US-06-13-AC2 |
| TS-06-076 | CS-09: insufficient payment → no stock deducted, no sale persisted | Integration | T0 | MVP | US-06-13-AC3 |
| TS-06-077 | Card exceeding total; missing reference | Integration | T1 | MVP | US-06-13-AC4 |
| TS-06-078 | CS-09: declined/unconfirmed card blocks completion; reversal instruction after server rejection | E2E | T0 | MVP | US-06-13-AC5 |
| TS-06-079 | Payment entry count limits | Unit | T1 | MVP | US-06-13-AC6 |
| TS-06-080 | CS-01: two cashiers, last unit → one success, one `INVENTORY.INSUFFICIENT_STOCK`, balance 0, one movement | Concurrency | T0 | MVP | US-06-14-AC1 |
| TS-06-081 | CS-01: 50 parallel completions for 10 units × 100 runs → zero oversell, no negative balance | Concurrency | T0 | MVP | US-06-14-AC1 |
| TS-06-082 | CS-11: replay with same key returns stored response, single effect | Integration | T0 | MVP | US-06-14-AC2 |
| TS-06-083 | CS-11: 100 concurrent duplicates → one sale | Concurrency | T0 | MVP | US-06-14-AC3 |
| TS-06-084 | Key reuse with different body → 422 | Integration | T1 | MVP | US-06-14-AC4 |
| TS-06-085 | CS-10: DB failure after stock movements → full rollback; retry succeeds once | Fault injection | T0 | MVP | US-06-14-AC5 |
| TS-06-086 | Opposite-order carts commit; lock timeout 503 `COMMON.LOCK_TIMEOUT`; exhausted retries 503 | Concurrency | T0 | MVP | US-06-14-AC6 |
| TS-06-087 | POS key reuse on retry, new key after edit; missing key 400 | E2E | T1 | MVP | US-06-14-AC7 |
| TS-06-088 | Same key value from other user / CS-08 other organization processed independently | Security | T0 | MVP | US-06-14-AC8 |
| TS-06-089 | Invoice-number gap audit over 10,000 completions with 5% injected failures | Fault injection | T0 | MVP | US-06-14-AC5 |
| TS-06-090 | Explicit eligible batch allocated, flagged, audited | Integration | T3 | Future | US-06-15-AC1 |
| TS-06-091 | CS-02: explicit expired / do-not-sell / quarantined batch rejected | Integration | T3 | Future | US-06-15-AC2 |
| TS-06-092 | Explicit batch insufficient → 409, no fallback | Integration | T3 | Future | US-06-15-AC3 |
| TS-06-093 | 403 without override permission; FEFO-first explicit allowed | Security | T3 | Future | US-06-15-AC4 |
| TS-06-094 | Missing reason 400; CS-07 batch of other branch rejected | Security | T3 | Future | US-06-15-AC5 |
| TS-06-095 | Auto-print original thermal Arabic receipt; print record copy 0 | E2E | T1 | MVP | US-06-16-AC1 |
| TS-06-096 | A4 English PDF content and generation time | Integration | T1 | MVP | US-06-16-AC2 |
| TS-06-097 | Receipt snapshot (ar RTL, en LTR) with §7.2 amounts and remaining-to-dispense | Visual | T1 | MVP | US-06-16-AC3 |
| TS-06-098 | Voided banner on print | Integration | T1 | MVP | US-06-16-AC4 |
| TS-06-099 | 403 permission / CS-07 branch; CS-08 other org 404 | Security | T0 | MVP | US-06-16-AC5 |
| TS-06-100 | Sequential COPY numbering and print records | Integration | T2 | MVP | US-06-17-AC1 |
| TS-06-101 | Reprint audit entry | Integration | T2 | MVP | US-06-17-AC2 |
| TS-06-102 | Idempotent retry and concurrent reprints keep unique copy numbers | Concurrency | T1 | MVP | US-06-17-AC3 |
| TS-06-103 | 403 without permission; CS-08 other org 404 | Security | T1 | MVP | US-06-17-AC4 |
| TS-06-104 | Date/method/status filters, pagination, default sort | Integration | T2 | MVP | US-06-18-AC1 |
| TS-06-105 | Invoice number, medicine, patient, cashier filters | Integration | T2 | MVP | US-06-18-AC2 |
| TS-06-106 | Cost fields omitted without `sales.sales.read-cost` | Security | T1 | MVP | US-06-18-AC3 |
| TS-06-107 | Range and page size validation | Unit | T2 | MVP | US-06-18-AC4 |
| TS-06-108 | 403 permission, CS-07 cross-branch 403, CS-08 cross-org 404 | Security | T1 | MVP | US-06-18-AC5 |
| TS-06-109 | Search p95 ≤ 500 ms over 500,000 sales / 1 year | Performance | T2 | MVP | US-06-18-AC1 |
| TS-06-110 | COGS and profit for §7.2 line 1 | Unit | T2 | MVP | US-06-19-AC1 |
| TS-06-111 | Batch cost change does not alter historical COGS | Integration | T2 | MVP | US-06-19-AC2 |
| TS-06-112 | Restocked vs discarded effect on COGS | Integration | T2 | MVP | US-06-19-AC3 |
| TS-06-113 | Cost fields hidden / 403 without permission | Security | T1 | MVP | US-06-19-AC4 |
| TS-06-114 | Full void reversal: movements, payments, cash, dispensing, audit | Integration | T2 | MVP | US-06-20-AC1 |
| TS-06-115 | Different business date rejected | Integration | T2 | MVP | US-06-20-AC2 |
| TS-06-116 | Closed session / existing return rejected | Integration | T2 | MVP | US-06-20-AC3 |
| TS-06-117 | Void vs return race → one wins | Concurrency | T1 | MVP | US-06-20-AC4 |
| TS-06-118 | CS-11: idempotent void replay | Integration | T1 | MVP | US-06-20-AC5 |
| TS-06-119 | 403 without `sales.sales.void`; reason validation | Security | T1 | MVP | US-06-20-AC6 |
| TS-06-120 | CS-07 cross-branch 403; CS-08 cross-org 404 | Security | T1 | MVP | US-06-20-AC7 |
| TS-06-121 | CS-10: failure after `SaleVoid` movements → full rollback | Fault injection | T1 | MVP | US-06-20-AC1 |
| TS-06-122 | Returnable preview per allocation and default refund allocation | Integration | T1 | MVP | US-06-21-AC1 |
| TS-06-123 | CS-05: partial return then remaining; refunds 73.97 + 73.96; statuses PartiallyReturned → Returned; PendingInspection with no stock movement | Integration | T0 | MVP | US-06-21-AC2 |
| TS-06-124 | CS-05: over-return rejected | Integration | T0 | MVP | US-06-21-AC3 |
| TS-06-125 | CS-05: concurrent returns serialized, no over-return | Concurrency | T0 | MVP | US-06-21-AC4 |
| TS-06-126 | Window expired, voided sale, no session | Integration | T1 | MVP | US-06-21-AC5 |
| TS-06-127 | CS-11: return replay single effect | Integration | T0 | MVP | US-06-21-AC6 |
| TS-06-128 | 403 permission; CS-07 cross-branch 403; CS-08 cross-org 404 | Security | T0 | MVP | US-06-21-AC7 |
| TS-06-129 | CS-10: failure after refund insert → no return, refund, or cash movement remains | Fault injection | T0 | MVP | US-06-21-AC2 |
| TS-06-130 | Inline approval with `ReturnApproval` override | Integration | T2 | MVP | US-06-22-AC1 |
| TS-06-131 | Deferred PendingApproval without effects; reservation of quantities | Integration | T2 | MVP | US-06-22-AC2 |
| TS-06-132 | Approve completes with number and refund from approver session; CS-11 replay single effect | Integration | T1 | MVP | US-06-22-AC3 |
| TS-06-133 | Reject releases quantities; approve vs reject race | Concurrency | T1 | MVP | US-06-22-AC4 |
| TS-06-134 | Self-approval 403; out-of-window without reason 422 | Security | T1 | MVP | US-06-22-AC5 |
| TS-06-135 | Controlled medicine return requires approval | Integration | T2 | MVP | US-06-22-AC6 |
| TS-06-136 | 403 permission; CS-07 cross-branch 403; CS-08 cross-org 404 | Security | T1 | MVP | US-06-22-AC7 |
| TS-06-137 | Default allocation cash-first then cards, net of prior refunds | Unit | T1 | MVP | US-06-23-AC1 |
| TS-06-138 | Cash refund above expected cash rejected | Integration | T1 | MVP | US-06-23-AC2 |
| TS-06-139 | Card refund without reference rejected | Integration | T1 | MVP | US-06-23-AC3 |
| TS-06-140 | Different method rejected without override, accepted with it | Integration | T1 | MVP | US-06-23-AC4 |
| TS-06-141 | Concurrent refund and cash out serialize on session lock | Concurrency | T0 | MVP | US-06-23-AC5 |
| TS-06-142 | Refund to another user's session → 403 | Security | T0 | MVP | US-06-23-AC6 |
| TS-06-143 | Queue fields and > 7-day highlighting | Integration | T1 | MVP | US-06-24-AC1 |
| TS-06-144 | Restock posts `SalesReturn` movement into original batch at original cost | Integration | T1 | MVP | US-06-24-AC2 |
| TS-06-145 | CS-02 related: restock blocked into expired / do-not-sell / quarantined batch; discard allowed | Integration | T0 | MVP | US-06-24-AC3 |
| TS-06-146 | Final disposition; concurrent attempts → one succeeds | Concurrency | T0 | MVP | US-06-24-AC4 |
| TS-06-147 | Direct restock setting on/off and permission | Integration | T1 | MVP | US-06-24-AC5 |
| TS-06-148 | 403 permission; CS-07 cross-branch 403; CS-08 cross-org 404 | Security | T0 | MVP | US-06-24-AC6 |
| TS-06-149 | Search by phone, link, receipt shows name only | E2E | T2 | MVP | US-06-25-AC1 |
| TS-06-150 | Quick-create with and without permission | Integration | T2 | MVP | US-06-25-AC2 |
| TS-06-151 | Allergy match, acknowledgement stored, access log written, sale not blocked | Integration | T2 | MVP | US-06-25-AC3 |
| TS-06-152 | Allergy check 403 without `patients.medical.read` | Security | T1 | MVP | US-06-25-AC4 |
| TS-06-153 | CS-08: other-organization patient → 404, nothing persisted | Security | T1 | MVP | US-06-25-AC5 |
| TS-06-154 | Load dispensable items into cart with caps | Integration | T1 | MVP | US-06-26-AC1 |
| TS-06-155 | Dispensing records, register entry, prescription status in sale transaction; SPEC-08 failure rolls back (CS-10 pattern) | Integration | T0 | MVP | US-06-26-AC2 |
| TS-06-156 | CS-13: Rx-only without verified prescription blocked | Integration | T0 | MVP | US-06-26-AC3 |
| TS-06-157 | CS-13: controlled without permission / without prescription blocked | Security | T0 | MVP | US-06-26-AC4 |
| TS-06-158 | CS-13: unverified, expired, other-patient prescription rejected | Integration | T0 | MVP | US-06-26-AC5 |
| TS-06-159 | Quantity above remaining incl. concurrent dispensing of same item | Concurrency | T0 | MVP | US-06-26-AC6 |
| TS-06-160 | 403 without `prescriptions.dispense`; CS-08 foreign prescription 404; CS-07 branch 403 | Security | T0 | MVP | US-06-26-AC7 |
| TS-06-161 | Partial dispensing; PartiallyDispensed; remaining on receipt | Integration | T1 | MVP | US-06-27-AC1 |
| TS-06-162 | Second visit completes prescription | Integration | T1 | MVP | US-06-27-AC2 |
| TS-06-163 | Patient-reduced quantity; later over-dispense rejected | Integration | T1 | MVP | US-06-27-AC3 |
| TS-06-164 | Void reverses dispensing and remaining | Integration | T1 | MVP | US-06-27-AC4 |
| TS-06-165 | 403 without `prescriptions.dispense` | Security | T0 | MVP | US-06-27-AC5 |
| TS-06-166 | Accrual on completion in same transaction | Integration | T3 | Future | US-06-28-AC1 |
| TS-06-167 | Proportional reversal on return; full on void | Integration | T3 | Future | US-06-28-AC2 |
| TS-06-168 | No accrual without patient / disabled | Integration | T3 | Future | US-06-28-AC3 |
| TS-06-169 | 403 on configuration without permission | Security | T3 | Future | US-06-28-AC4 |
| TS-06-170 | Redemption payment and ledger entry | Integration | T3 | Future | US-06-29-AC1 |
| TS-06-171 | Insufficient / above cap rejected | Integration | T3 | Future | US-06-29-AC2 |
| TS-06-172 | Concurrent redemption → one success | Concurrency | T3 | Future | US-06-29-AC3 |
| TS-06-173 | Points refunded on return | Integration | T3 | Future | US-06-29-AC4 |
| TS-06-174 | CS-08 other-organization patient 404 | Security | T3 | Future | US-06-29-AC5 |
| TS-06-175 | Snapshot written with sale; status NotApplicable | Integration | T3 | Future | US-06-30-AC1 |
| TS-06-176 | Snapshot immutability (domain + trigger) | Integration | T3 | Future | US-06-30-AC2 |
| TS-06-177 | Return snapshot references original | Integration | T3 | Future | US-06-30-AC3 |
| TS-06-178 | 403 without permission; CS-08 404 | Security | T3 | Future | US-06-30-AC4 |

---

## US-06-01: POS Medicine Search

### TS-06-001: Ranking of barcode, name prefix, ingredient, contains; ≤ 20 results

| Field | Value |
|---|---|
| Story | [US-06-01](../stories/EPIC-06-SALES-POS/US-06-01-pos-medicine-search.md) — POS Medicine Search |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-01-AC1 |
| Requirements | FR-06-001, FR-06-002, FR-06-003 |

**Story preconditions**
- User is authenticated, assigned to the branch, and holds `sales.pos.sell`.
- Catalog (SPEC-03) and branch sellable quantity read model (SPEC-04) are available.

**US-06-01-AC1 — Ranked search results**

*Preconditions / test data*
1. active medicines "Panadol 500mg" (barcode 6221234567890) and "Panadol Extra" and an ingredient "Paracetamol" linked to both

*Steps*
1. the user calls `GET /branches/{branchId}/pos/medicines/search?q=pana`

*Expected results*
1. the response is 200 with ≤ 20 items, name-prefix matches ranked before ingredient-prefix and contains matches, and a search for `6221234567890` returns "Panadol 500mg" first as an exact barcode match

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-002: Arabic normalization variants (أ/إ/آ, ة, ى, diacritics)

| Field | Value |
|---|---|
| Story | [US-06-01](../stories/EPIC-06-SALES-POS/US-06-01-pos-medicine-search.md) — POS Medicine Search |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-01-AC2 |
| Requirements | FR-06-001, FR-06-002, FR-06-003 |

**Story preconditions**
- User is authenticated, assigned to the branch, and holds `sales.pos.sell`.
- Catalog (SPEC-03) and branch sellable quantity read model (SPEC-04) are available.

**US-06-01-AC2 — Arabic normalization**

*Preconditions / test data*
1. a medicine with Arabic trade name "أموكسيسيلين"

*Steps*
1. the user searches "اموكسي" (without hamza) or "أموكسي"

*Expected results*
1. both queries return the medicine

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-003: Result fields, sellable split into packs+units, out-of-stock flag; expired-only stock shows 0

| Field | Value |
|---|---|
| Story | [US-06-01](../stories/EPIC-06-SALES-POS/US-06-01-pos-medicine-search.md) — POS Medicine Search |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-01-AC3 |
| Requirements | FR-06-001, FR-06-002, FR-06-003 |

**Story preconditions**
- User is authenticated, assigned to the branch, and holds `sales.pos.sell`.
- Catalog (SPEC-03) and branch sellable quantity read model (SPEC-04) are available.

**US-06-01-AC3 — Result fields and out-of-stock handling**

*Preconditions / test data*
1. a medicine with resolved pack price 85.5000, PackSize 10, sellable 25 base units, nearest sellable expiry 2027-01-31, and another medicine with 0 sellable units

*Steps*
1. the user searches for them

*Expected results*
1. the first result shows price 85.50, sellable "2 packs + 5 units", expiry 2027-01-31, Rx-only and controlled flags
2. the second shows "Out of stock" and the POS add action is disabled

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-004: Inactive excluded; short query 400

| Field | Value |
|---|---|
| Story | [US-06-01](../stories/EPIC-06-SALES-POS/US-06-01-pos-medicine-search.md) — POS Medicine Search |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-01-AC4 |
| Requirements | FR-06-001, FR-06-002, FR-06-003 |

**Story preconditions**
- User is authenticated, assigned to the branch, and holds `sales.pos.sell`.
- Catalog (SPEC-03) and branch sellable quantity read model (SPEC-04) are available.

**US-06-01-AC4 — Inactive medicines and short queries excluded**

*Preconditions / test data*
1. an inactive medicine matching "zyrt"

*Steps*
1. the user searches "zyrt", and separately searches "z"

*Expected results*
1. the inactive medicine is not returned
2. the 1-character query returns 400 `COMMON.VALIDATION_FAILED`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-005: Alternatives filtered by sellable stock

| Field | Value |
|---|---|
| Story | [US-06-01](../stories/EPIC-06-SALES-POS/US-06-01-pos-medicine-search.md) — POS Medicine Search |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-01-AC5 |
| Requirements | FR-06-001, FR-06-002, FR-06-003 |

**Story preconditions**
- User is authenticated, assigned to the branch, and holds `sales.pos.sell`.
- Catalog (SPEC-03) and branch sellable quantity read model (SPEC-04) are available.

**US-06-01-AC5 — In-stock alternatives (P2)**

*Preconditions / test data*
1. a medicine with 0 sellable units and two registered alternatives of which one has sellable stock

*Steps*
1. the user opens alternatives for it

*Expected results*
1. only the in-stock alternative is listed with price and sellable quantity

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-006: 403 without permission; 403 other branch; other-org data absent / 404

| Field | Value |
|---|---|
| Story | [US-06-01](../stories/EPIC-06-SALES-POS/US-06-01-pos-medicine-search.md) — POS Medicine Search |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-06-01-AC6, US-06-01-AC7 |
| Requirements | FR-06-001, FR-06-002, FR-06-003 |

**Story preconditions**
- User is authenticated, assigned to the branch, and holds `sales.pos.sell`.
- Catalog (SPEC-03) and branch sellable quantity read model (SPEC-04) are available.

**US-06-01-AC6 — Permission denied**

*Preconditions / test data*
1. a user without `sales.pos.sell`

*Steps*
1. the user calls the search endpoint

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN`

**US-06-01-AC7 — Cross-branch and cross-organization isolation**

*Preconditions / test data*
1. a user assigned only to branch A of organization X

*Steps*
1. the user searches with branch B's id, and separately searches a term matching only a medicine of organization Y

*Expected results*
1. the branch B call returns 403 `COMMON.FORBIDDEN` (CS-07) and the organization Y medicine is never returned (CS-08)

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-007: p95 ≤ 300 ms at 50,000 medicines / 500,000 batches

| Field | Value |
|---|---|
| Story | [US-06-01](../stories/EPIC-06-SALES-POS/US-06-01-pos-medicine-search.md) — POS Medicine Search |
| Type / Execution | Performance / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-01-AC1 |
| Requirements | FR-06-001, FR-06-002, FR-06-003 |

**Story preconditions**
- User is authenticated, assigned to the branch, and holds `sales.pos.sell`.
- Catalog (SPEC-03) and branch sellable quantity read model (SPEC-04) are available.

**US-06-01-AC1 — Ranked search results**

*Preconditions / test data*
1. active medicines "Panadol 500mg" (barcode 6221234567890) and "Panadol Extra" and an ingredient "Paracetamol" linked to both

*Steps*
1. the user calls `GET /branches/{branchId}/pos/medicines/search?q=pana`

*Expected results*
1. the response is 200 with ≤ 20 items, name-prefix matches ranked before ingredient-prefix and contains matches, and a search for `6221234567890` returns "Panadol 500mg" first as an exact barcode match

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-06-02: Barcode Scanning and Unknown Barcode Handling

### TS-06-008: Simulated wedge input adds then increments line

| Field | Value |
|---|---|
| Story | [US-06-02](../stories/EPIC-06-SALES-POS/US-06-02-barcode-scanning.md) — Barcode Scanning and Unknown Barcode Handling |
| Type / Execution | E2E / Manual |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-02-AC1 |
| Requirements | FR-06-004, FR-06-005, FR-06-006 |

**Story preconditions**
- US-06-01 search and US-06-03 cart exist; medicines have registered `MedicineBarcode` rows (SPEC-03).
- User holds `sales.pos.sell`.

**US-06-02-AC1 — Scan adds or increments a line**

*Preconditions / test data*
1. the POS screen is active with an empty cart and barcode `6221234567890` belongs to "Panadol 500mg" with sellable stock

*Steps*
1. the scanner emits `6221234567890` + Enter with inter-key intervals ≤ 50 ms, twice

*Expected results*
1. the cart contains one line "Panadol 500mg", unit Pack, quantity 2

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-009: Scanner detection timing threshold vs manual typing

| Field | Value |
|---|---|
| Story | [US-06-02](../stories/EPIC-06-SALES-POS/US-06-02-barcode-scanning.md) — Barcode Scanning and Unknown Barcode Handling |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-02-AC2 |
| Requirements | FR-06-004, FR-06-005, FR-06-006 |

**Story preconditions**
- US-06-01 search and US-06-03 cart exist; medicines have registered `MedicineBarcode` rows (SPEC-03).
- User holds `sales.pos.sell`.

**US-06-02-AC2 — Manual typing is not treated as a scan**

*Preconditions / test data*
1. the user is typing in the quantity field with inter-key intervals of 150 ms

*Steps*
1. the user types 6 digits and presses Enter

*Expected results*
1. no barcode lookup is triggered and the typed value is applied to the field

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-010: Unknown barcode: 404, cart unchanged, alert, link action by permission

| Field | Value |
|---|---|
| Story | [US-06-02](../stories/EPIC-06-SALES-POS/US-06-02-barcode-scanning.md) — Barcode Scanning and Unknown Barcode Handling |
| Type / Execution | E2E / Manual |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-02-AC3 |
| Requirements | FR-06-004, FR-06-005, FR-06-006 |

**Story preconditions**
- US-06-01 search and US-06-03 cart exist; medicines have registered `MedicineBarcode` rows (SPEC-03).
- User holds `sales.pos.sell`.

**US-06-02-AC3 — Unknown barcode**

*Preconditions / test data*
1. barcode `9990001112223` is not registered in the organization

*Steps*
1. it is scanned

*Expected results*
1. the lookup returns 404 `SALES.BARCODE_NOT_FOUND`, the cart is unchanged, a visual and audible alert is shown, the name search opens pre-filled with the code, and the "Link barcode to medicine" action is visible only to users holding `catalog.medicines.update`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-011: GS1 AI 01/10/17 parsing and FEFO mismatch warning

| Field | Value |
|---|---|
| Story | [US-06-02](../stories/EPIC-06-SALES-POS/US-06-02-barcode-scanning.md) — Barcode Scanning and Unknown Barcode Handling |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-02-AC4 |
| Requirements | FR-06-004, FR-06-005, FR-06-006 |

**Story preconditions**
- US-06-01 search and US-06-03 cart exist; medicines have registered `MedicineBarcode` rows (SPEC-03).
- User holds `sales.pos.sell`.

**US-06-02-AC4 — GS1 batch warning (P2)**

*Preconditions / test data*
1. a GS1 DataMatrix encoding GTIN of "Medicine A", batch `B2`, expiry 2027-04-30, while FEFO would allocate batch `B1`

*Steps*
1. it is scanned

*Expected results*
1. the medicine line is added and the POS shows a warning that the scanned batch `B2` differs from FEFO batch `B1`
2. allocation remains FEFO (OD-06-09)

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-012: 403 without permission; other-org barcode 404; other branch 403

| Field | Value |
|---|---|
| Story | [US-06-02](../stories/EPIC-06-SALES-POS/US-06-02-barcode-scanning.md) — Barcode Scanning and Unknown Barcode Handling |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-06-02-AC5, US-06-02-AC6 |
| Requirements | FR-06-004, FR-06-005, FR-06-006 |

**Story preconditions**
- US-06-01 search and US-06-03 cart exist; medicines have registered `MedicineBarcode` rows (SPEC-03).
- User holds `sales.pos.sell`.

**US-06-02-AC5 — Permission and isolation**

*Preconditions / test data*
1. a user without `sales.pos.sell`, and separately a barcode registered only in another organization

*Steps*
1. the barcode endpoint is called

*Expected results*
1. the first returns 403 `COMMON.FORBIDDEN`
2. the second returns 404 `SALES.BARCODE_NOT_FOUND` without revealing the other organization (CS-08)

**US-06-02-AC6 — Cross-branch denied**

*Preconditions / test data*
1. a user assigned only to branch A

*Steps*
1. the user calls `GET /branches/{branchB}/pos/medicines/by-barcode/{code}`

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN` (CS-07)

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-06-03: POS Cart with Pack and Base-Unit Quantities

### TS-06-013: QuantityBaseUnits derivation; BaseUnit availability by AllowSplitPack

| Field | Value |
|---|---|
| Story | [US-06-03](../stories/EPIC-06-SALES-POS/US-06-03-pos-cart-pack-and-unit-quantities.md) — POS Cart with Pack and Base-Unit Quantities |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-03-AC1 |
| Requirements | FR-06-007, FR-06-008, FR-06-009, FR-06-010 |

**Story preconditions**
- US-06-01 provides medicine data (PackSize, AllowSplitPack, price, sellable quantity).

**US-06-03-AC1 — Pack and base-unit lines**

*Preconditions / test data*
1. Medicine B has PackSize 20 and AllowSplitPack = true, and Medicine A has PackSize 10 and AllowSplitPack = false

*Steps*
1. the cashier adds Medicine B with unit BaseUnit quantity 7 and Medicine A with unit Pack quantity 2

*Expected results*
1. the cart shows B: 7 base units (QuantityBaseUnits 7) and A: 2 packs (QuantityBaseUnits 20), and the BaseUnit option is not offered for Medicine A

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-014: Quantity bound validation

| Field | Value |
|---|---|
| Story | [US-06-03](../stories/EPIC-06-SALES-POS/US-06-03-pos-cart-pack-and-unit-quantities.md) — POS Cart with Pack and Base-Unit Quantities |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-03-AC2 |
| Requirements | FR-06-007, FR-06-008, FR-06-009, FR-06-010 |

**Story preconditions**
- US-06-01 provides medicine data (PackSize, AllowSplitPack, price, sellable quantity).

**US-06-03-AC2 — Quantity bounds**

*Preconditions / test data*
1. a cart line

*Steps*
1. the cashier enters quantity 0, -1, 2.5, or 10000

*Expected results*
1. the value is rejected inline and the previous valid quantity is kept

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-015: Sellable cap warning per line

| Field | Value |
|---|---|
| Story | [US-06-03](../stories/EPIC-06-SALES-POS/US-06-03-pos-cart-pack-and-unit-quantities.md) — POS Cart with Pack and Base-Unit Quantities |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-03-AC3 |
| Requirements | FR-06-007, FR-06-008, FR-06-009, FR-06-010 |

**Story preconditions**
- US-06-01 provides medicine data (PackSize, AllowSplitPack, price, sellable quantity).

**US-06-03-AC3 — Sellable cap warning**

*Preconditions / test data*
1. Medicine A has 25 sellable base units (2 packs + 5 units)

*Steps*
1. the cashier sets quantity 3 packs

*Expected results*
1. the cart caps the line at 2 packs, shows "Only 2 packs + 5 units available", and other lines are unaffected

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-016: Cart persistence on refresh; cleared on logout; per user+branch keys

| Field | Value |
|---|---|
| Story | [US-06-03](../stories/EPIC-06-SALES-POS/US-06-03-pos-cart-pack-and-unit-quantities.md) — POS Cart with Pack and Base-Unit Quantities |
| Type / Execution | E2E / Manual |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-03-AC4 |
| Requirements | FR-06-007, FR-06-008, FR-06-009, FR-06-010 |

**Story preconditions**
- US-06-01 provides medicine data (PackSize, AllowSplitPack, price, sellable quantity).

**US-06-03-AC4 — Cart persists across refresh and clears on logout/completion**

*Preconditions / test data*
1. a cart with 3 lines for user U in branch A

*Steps*
1. the page is refreshed, then later the user logs out

*Expected results*
1. after refresh all 3 lines with quantities, units, and discounts are restored
2. after logout and login the cart is empty
3. a cart of user U in branch B is stored separately

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-017: Recalculation vs golden vectors after edits

| Field | Value |
|---|---|
| Story | [US-06-03](../stories/EPIC-06-SALES-POS/US-06-03-pos-cart-pack-and-unit-quantities.md) — POS Cart with Pack and Base-Unit Quantities |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-03-AC5 |
| Requirements | FR-06-007, FR-06-008, FR-06-009, FR-06-010 |

**Story preconditions**
- US-06-01 provides medicine data (PackSize, AllowSplitPack, price, sellable quantity).

**US-06-03-AC5 — Totals recalculated after each edit**

*Preconditions / test data*
1. the worked-example cart of SPEC-06 §7.2

*Steps*
1. the cashier changes line 3 from 5 to 4 packs and then removes line 2

*Expected results*
1. the displayed totals equal the values produced by the golden pricing engine for the resulting cart

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-06-04: Price Resolution and Server Quote

### TS-06-018: Branch override vs organization default

| Field | Value |
|---|---|
| Story | [US-06-04](../stories/EPIC-06-SALES-POS/US-06-04-price-resolution-and-quote.md) — Price Resolution and Server Quote |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-04-AC1 |
| Requirements | FR-06-011, FR-06-012 |

**Story preconditions**
- SPEC-03 provides organization `MedicinePrice` and optional `BranchMedicinePrice`, `PackSize`, optional base-unit price.

**US-06-04-AC1 — Branch override wins**

*Preconditions / test data*
1. Medicine A has organization price 90.0000 and an active branch override of 85.5000 in branch A, and no override in branch B

*Steps*
1. quotes are requested for 1 pack in branch A and in branch B

*Expected results*
1. the unit price is 85.5000 in branch A and 90.0000 in branch B

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-019: Base-unit price derivation and rounding

| Field | Value |
|---|---|
| Story | [US-06-04](../stories/EPIC-06-SALES-POS/US-06-04-price-resolution-and-quote.md) — Price Resolution and Server Quote |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-04-AC2 |
| Requirements | FR-06-011, FR-06-012 |

**Story preconditions**
- SPEC-03 provides organization `MedicinePrice` and optional `BranchMedicinePrice`, `PackSize`, optional base-unit price.

**US-06-04-AC2 — Base-unit price derivation**

*Preconditions / test data*
1. Medicine B has pack price 120.0000, PackSize 20, AllowSplitPack = true, and no base-unit price
2. Medicine D has pack price 10.0000, PackSize 3

*Steps*
1. base-unit quotes are requested

*Expected results*
1. B's base-unit price is 6.0000 and D's is 3.3333 (10 ÷ 3 rounded to 4 dp AwayFromZero)

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-020: Quote equals §7.2 example; nothing persisted

| Field | Value |
|---|---|
| Story | [US-06-04](../stories/EPIC-06-SALES-POS/US-06-04-price-resolution-and-quote.md) — Price Resolution and Server Quote |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-04-AC3 |
| Requirements | FR-06-011, FR-06-012 |

**Story preconditions**
- SPEC-03 provides organization `MedicinePrice` and optional `BranchMedicinePrice`, `PackSize`, optional base-unit price.

**US-06-04-AC3 — Quote returns full calculation without persistence**

*Preconditions / test data*
1. the cart of SPEC-06 §7.2 (with a valid override id)

*Steps*
1. `POST /branches/{branchId}/pos/quote` is called

*Expected results*
1. the response is 200 with per-line gross, discounts, invoice-discount shares (5.97, 1.63, 2.40), tax, totals 261.59, and per-line sellable quantity
2. no sale, movement, or override consumption is persisted

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-021: Missing price rejected

| Field | Value |
|---|---|
| Story | [US-06-04](../stories/EPIC-06-SALES-POS/US-06-04-price-resolution-and-quote.md) — Price Resolution and Server Quote |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-04-AC4 |
| Requirements | FR-06-011, FR-06-012 |

**Story preconditions**
- SPEC-03 provides organization `MedicinePrice` and optional `BranchMedicinePrice`, `PackSize`, optional base-unit price.

**US-06-04-AC4 — Price not configured**

*Preconditions / test data*
1. Medicine E has no organization price and no branch override

*Steps*
1. it is quoted

*Expected results*
1. the line returns `SALES.PRICE_NOT_CONFIGURED` (422) and the POS prevents adding it

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-022: 403 permission / other branch; other-org medicine not revealed

| Field | Value |
|---|---|
| Story | [US-06-04](../stories/EPIC-06-SALES-POS/US-06-04-price-resolution-and-quote.md) — Price Resolution and Server Quote |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-06-04-AC5 |
| Requirements | FR-06-011, FR-06-012 |

**Story preconditions**
- SPEC-03 provides organization `MedicinePrice` and optional `BranchMedicinePrice`, `PackSize`, optional base-unit price.

**US-06-04-AC5 — Permission and isolation**

*Preconditions / test data*
1. a user without `sales.pos.sell`, and separately a user assigned only to branch A

*Steps*
1. they call the quote endpoint for branch A and branch B respectively

*Expected results*
1. both receive 403 `COMMON.FORBIDDEN`
2. a medicine id of another organization in the cart yields 422 `SALES.MEDICINE_NOT_SELLABLE` without revealing it (CS-08)

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-023: Quote p95 ≤ 300 ms for 50 lines

| Field | Value |
|---|---|
| Story | [US-06-04](../stories/EPIC-06-SALES-POS/US-06-04-price-resolution-and-quote.md) — Price Resolution and Server Quote |
| Type / Execution | Performance / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-04-AC3 |
| Requirements | FR-06-011, FR-06-012 |

**Story preconditions**
- SPEC-03 provides organization `MedicinePrice` and optional `BranchMedicinePrice`, `PackSize`, optional base-unit price.

**US-06-04-AC3 — Quote returns full calculation without persistence**

*Preconditions / test data*
1. the cart of SPEC-06 §7.2 (with a valid override id)

*Steps*
1. `POST /branches/{branchId}/pos/quote` is called

*Expected results*
1. the response is 200 with per-line gross, discounts, invoice-discount shares (5.97, 1.63, 2.40), tax, totals 261.59, and per-line sellable quantity
2. no sale, movement, or override consumption is persisted

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-06-05: Tax Calculation per Tax Category

### TS-06-024: Exclusive mode golden vectors incl. §7.2

| Field | Value |
|---|---|
| Story | [US-06-05](../stories/EPIC-06-SALES-POS/US-06-05-tax-calculation.md) — Tax Calculation per Tax Category |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-05-AC1 |
| Requirements | FR-06-013, FR-06-014 |

**Story preconditions**
- `TaxCategory` with rates configured by the organization (SPEC-03); organization setting `PricesIncludeTax`.

**US-06-05-AC1 — Exclusive mode**

*Preconditions / test data*
1. `PricesIncludeTax = false` and the §7.2 cart where lines 2 and 3 use a category configured at 14% (illustrative)

*Steps*
1. the cart is quoted

*Expected results*
1. line 2 tax = 5.65, line 3 tax = 8.31, line 1 tax = 0.00, total tax = 13.96, total = 261.59

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-025: Inclusive mode golden vectors incl. 40.37 → 4.96

| Field | Value |
|---|---|
| Story | [US-06-05](../stories/EPIC-06-SALES-POS/US-06-05-tax-calculation.md) — Tax Calculation per Tax Category |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-05-AC2 |
| Requirements | FR-06-013, FR-06-014 |

**Story preconditions**
- `TaxCategory` with rates configured by the organization (SPEC-03); organization setting `PricesIncludeTax`.

**US-06-05-AC2 — Inclusive mode**

*Preconditions / test data*
1. `PricesIncludeTax = true` and a line with discounted amount 40.37 at 14%

*Steps*
1. it is quoted

*Expected results*
1. line total = 40.37, tax = 4.96, net = 35.41

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-026: Rate and mode snapshots unchanged after configuration change

| Field | Value |
|---|---|
| Story | [US-06-05](../stories/EPIC-06-SALES-POS/US-06-05-tax-calculation.md) — Tax Calculation per Tax Category |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-05-AC3, US-06-05-AC5 |
| Requirements | FR-06-013, FR-06-014 |

**Story preconditions**
- `TaxCategory` with rates configured by the organization (SPEC-03); organization setting `PricesIncludeTax`.

**US-06-05-AC3 — Rate snapshot**

*Preconditions / test data*
1. a completed sale with line tax rate 14%

*Steps*
1. the tax category rate is later changed to 10%

*Expected results*
1. the stored sale line still shows rate 14.0000 and tax 8.31, and new quotes use 10%

**US-06-05-AC5 — Mode snapshot on sale**

*Preconditions / test data*
1. a sale completed with `PricesIncludeTax = false`

*Steps*
1. the setting is switched to true

*Expected results*
1. the sale's stored `PricesIncludeTax` remains false and its receipt reprint shows identical amounts

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-027: Missing tax category rejected

| Field | Value |
|---|---|
| Story | [US-06-05](../stories/EPIC-06-SALES-POS/US-06-05-tax-calculation.md) — Tax Calculation per Tax Category |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-05-AC4 |
| Requirements | FR-06-013, FR-06-014 |

**Story preconditions**
- `TaxCategory` with rates configured by the organization (SPEC-03); organization setting `PricesIncludeTax`.

**US-06-05-AC4 — Missing tax category**

*Preconditions / test data*
1. a medicine with no tax category

*Steps*
1. it is quoted or sold

*Expected results*
1. the response is 422 `SALES.TAX_CATEGORY_MISSING` and no sale is persisted

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-06-06: Line and Invoice Discounts within Role Limits

### TS-06-028: Line discount percent/amount computation

| Field | Value |
|---|---|
| Story | [US-06-06](../stories/EPIC-06-SALES-POS/US-06-06-line-and-invoice-discounts.md) — Line and Invoice Discounts within Role Limits |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-06-AC1 |
| Requirements | FR-06-015, FR-06-016, FR-06-017 |

**Story preconditions**
- User holds `sales.discounts.apply`; organization setting `RoleDiscountLimits` configured (defaults OWNER 100, MANAGER 20, PHARMACIST 10, CASHIER 5).

**US-06-06-AC1 — Line discount percent and amount**

*Preconditions / test data*
1. a line with gross 171.00

*Steps*
1. the cashier applies 5% and, on another cart, 8.55 EGP

*Expected results*
1. line discount = 8.55 in both cases and net before invoice discount = 162.45

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-029: Pro-rata allocation and remainder rule

| Field | Value |
|---|---|
| Story | [US-06-06](../stories/EPIC-06-SALES-POS/US-06-06-line-and-invoice-discounts.md) — Line and Invoice Discounts within Role Limits |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-06-AC2 |
| Requirements | FR-06-015, FR-06-016, FR-06-017 |

**Story preconditions**
- User holds `sales.discounts.apply`; organization setting `RoleDiscountLimits` configured (defaults OWNER 100, MANAGER 20, PHARMACIST 10, CASHIER 5).

**US-06-06-AC2 — Invoice discount pro-rata allocation**

*Preconditions / test data*
1. lines with net before invoice discount 153.90, 42.00, 61.73 and an invoice discount of 10.00 EGP

*Steps*
1. the cart is quoted

*Expected results*
1. shares are 5.97, 1.63, 2.40 (sum 10.00), and for an invoice discount of 0.01 on two equal lines of 5.00 the full 0.01 is assigned to line 1 (largest, lowest line number)

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-030: Within-limit discount accepted

| Field | Value |
|---|---|
| Story | [US-06-06](../stories/EPIC-06-SALES-POS/US-06-06-line-and-invoice-discounts.md) — Line and Invoice Discounts within Role Limits |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-06-AC3 |
| Requirements | FR-06-015, FR-06-016, FR-06-017 |

**Story preconditions**
- User holds `sales.discounts.apply`; organization setting `RoleDiscountLimits` configured (defaults OWNER 100, MANAGER 20, PHARMACIST 10, CASHIER 5).

**US-06-06-AC3 — Within limit accepted**

*Preconditions / test data*
1. a CASHIER (limit 5%) and a cart with gross 200.00

*Steps*
1. the cashier applies an invoice discount of 10.00 (5.00%) and completes the sale

*Expected results*
1. the sale is accepted without override

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-031: Over-limit rejected, nothing persisted

| Field | Value |
|---|---|
| Story | [US-06-06](../stories/EPIC-06-SALES-POS/US-06-06-line-and-invoice-discounts.md) — Line and Invoice Discounts within Role Limits |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-06-AC4 |
| Requirements | FR-06-015, FR-06-016, FR-06-017 |

**Story preconditions**
- User holds `sales.discounts.apply`; organization setting `RoleDiscountLimits` configured (defaults OWNER 100, MANAGER 20, PHARMACIST 10, CASHIER 5).

**US-06-06-AC4 — Above limit rejected without override**

*Preconditions / test data*
1. a CASHIER (limit 5%)

*Steps*
1. the cashier completes a sale with a 10% line discount and no override id

*Expected results*
1. the response is 422 `SALES.DISCOUNT_LIMIT_EXCEEDED`, nothing is persisted, and the POS offers "Request manager override"

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-032: Effective limit = max over roles; custom role default 0

| Field | Value |
|---|---|
| Story | [US-06-06](../stories/EPIC-06-SALES-POS/US-06-06-line-and-invoice-discounts.md) — Line and Invoice Discounts within Role Limits |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-06-AC5 |
| Requirements | FR-06-015, FR-06-016, FR-06-017 |

**Story preconditions**
- User holds `sales.discounts.apply`; organization setting `RoleDiscountLimits` configured (defaults OWNER 100, MANAGER 20, PHARMACIST 10, CASHIER 5).

**US-06-06-AC5 — Multiple roles use maximum limit**

*Preconditions / test data*
1. a user holding both CASHIER (5%) and PHARMACIST (10%) roles

*Steps*
1. the user applies an 8% invoice discount

*Expected results*
1. the sale is accepted without override

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-033: Discount without `sales.discounts.apply` → 403

| Field | Value |
|---|---|
| Story | [US-06-06](../stories/EPIC-06-SALES-POS/US-06-06-line-and-invoice-discounts.md) — Line and Invoice Discounts within Role Limits |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-06-06-AC6 |
| Requirements | FR-06-015, FR-06-016, FR-06-017 |

**Story preconditions**
- User holds `sales.discounts.apply`; organization setting `RoleDiscountLimits` configured (defaults OWNER 100, MANAGER 20, PHARMACIST 10, CASHIER 5).

**US-06-06-AC6 — Permission denied**

*Preconditions / test data*
1. a user with `sales.pos.sell` but without `sales.discounts.apply`

*Steps*
1. the user completes a sale containing any discount > 0

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN` and the POS hides discount controls for that user

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-06-07: Manager Override at the POS

### TS-06-034: Override issued with binding, TTL, audit

| Field | Value |
|---|---|
| Story | [US-06-07](../stories/EPIC-06-SALES-POS/US-06-07-manager-discount-override.md) — Manager Override at the POS |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-07-AC1 |
| Requirements | FR-06-017, FR-06-018, FR-06-019 |

**Story preconditions**
- Approver holds `sales.discounts.override` (scope `Discount`) or `sales.returns.approve` (scopes `ReturnApproval`, `RefundMethod`) and is assigned to the branch.
- `ManagerOverrideTtlSeconds` = 120 (default).

**US-06-07-AC1 — Override issued**

*Preconditions / test data*
1. cashier C requests a `Discount` override of 10% and manager M (MANAGER limit 20%) enters valid credentials at C's POS

*Steps*
1. `POST /branches/{branchId}/pos/overrides` is called

*Expected results*
1. the response is 201 with an override id, scope `Discount`, approved max 10.00%, expiry now + 120 s, bound to C and the branch
2. an audit entry `ManagerOverrideIssued` is written
3. M's credentials are not stored client-side

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-035: Consumption in sale transaction with audit

| Field | Value |
|---|---|
| Story | [US-06-07](../stories/EPIC-06-SALES-POS/US-06-07-manager-discount-override.md) — Manager Override at the POS |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-07-AC2 |
| Requirements | FR-06-017, FR-06-018, FR-06-019 |

**Story preconditions**
- Approver holds `sales.discounts.override` (scope `Discount`) or `sales.returns.approve` (scopes `ReturnApproval`, `RefundMethod`) and is assigned to the branch.
- `ManagerOverrideTtlSeconds` = 120 (default).

**US-06-07-AC2 — Override consumed with the sale**

*Preconditions / test data*
1. a valid override for C of 10%

*Steps*
1. C completes the §7.2 sale referencing it

*Expected results*
1. the sale stores `DiscountOverrideId`, the override is marked consumed with the sale id in the same transaction, and audit records requester C, approver M, 10.00%, sale id

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-036: Consumed / expired / other-user override rejected

| Field | Value |
|---|---|
| Story | [US-06-07](../stories/EPIC-06-SALES-POS/US-06-07-manager-discount-override.md) — Manager Override at the POS |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-07-AC3 |
| Requirements | FR-06-017, FR-06-018, FR-06-019 |

**Story preconditions**
- Approver holds `sales.discounts.override` (scope `Discount`) or `sales.returns.approve` (scopes `ReturnApproval`, `RefundMethod`) and is assigned to the branch.
- `ManagerOverrideTtlSeconds` = 120 (default).

**US-06-07-AC3 — Single use, expiry, and binding**

*Preconditions / test data*
1. an override already consumed, another expired, and another issued to cashier D

*Steps*
1. C submits sales referencing each

*Expected results*
1. each is rejected with 422 `SALES.OVERRIDE_INVALID` and nothing is persisted

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-037: Approver limit exceeded; self-approval rejected

| Field | Value |
|---|---|
| Story | [US-06-07](../stories/EPIC-06-SALES-POS/US-06-07-manager-discount-override.md) — Manager Override at the POS |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-07-AC4 |
| Requirements | FR-06-017, FR-06-018, FR-06-019 |

**Story preconditions**
- Approver holds `sales.discounts.override` (scope `Discount`) or `sales.returns.approve` (scopes `ReturnApproval`, `RefundMethod`) and is assigned to the branch.
- `ManagerOverrideTtlSeconds` = 120 (default).

**US-06-07-AC4 — Approver limits and self-approval**

*Preconditions / test data*
1. manager M with limit 20%

*Steps*
1. M approves 25% for C, or C attempts to approve own request with C's own credentials

*Expected results*
1. the first returns 422 `SALES.OVERRIDE_INVALID` (exceeds approver limit) and the second 422 `SALES.OVERRIDE_SELF_NOT_ALLOWED`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-038: Failed approver auth counts toward lockout; rate limit 429

| Field | Value |
|---|---|
| Story | [US-06-07](../stories/EPIC-06-SALES-POS/US-06-07-manager-discount-override.md) — Manager Override at the POS |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-06-07-AC5 |
| Requirements | FR-06-017, FR-06-018, FR-06-019 |

**Story preconditions**
- Approver holds `sales.discounts.override` (scope `Discount`) or `sales.returns.approve` (scopes `ReturnApproval`, `RefundMethod`) and is assigned to the branch.
- `ManagerOverrideTtlSeconds` = 120 (default).

**US-06-07-AC5 — Failed approver authentication**

*Preconditions / test data*
1. approver credentials are wrong, or belong to a user without `sales.discounts.override`, or to a user not assigned to the branch

*Steps*
1. the override is requested

*Expected results*
1. the response is 422 `SALES.OVERRIDE_AUTH_FAILED`, the failed attempt counts toward the approver's lockout (SPEC-01), C's session remains valid, and after 5 failed requests in 5 minutes by C further requests return 429

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-039: Rollback leaves override unconsumed

| Field | Value |
|---|---|
| Story | [US-06-07](../stories/EPIC-06-SALES-POS/US-06-07-manager-discount-override.md) — Manager Override at the POS |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-07-AC6 |
| Requirements | FR-06-017, FR-06-018, FR-06-019 |

**Story preconditions**
- Approver holds `sales.discounts.override` (scope `Discount`) or `sales.returns.approve` (scopes `ReturnApproval`, `RefundMethod`) and is assigned to the branch.
- `ManagerOverrideTtlSeconds` = 120 (default).

**US-06-07-AC6 — Rollback keeps override unconsumed**

*Preconditions / test data*
1. a valid override and a sale that fails with `INVENTORY.INSUFFICIENT_STOCK`

*Steps*
1. the transaction rolls back

*Expected results*
1. the override is still unconsumed and can be used for the corrected sale before expiry

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-040: Requester without permission / other branch → 403

| Field | Value |
|---|---|
| Story | [US-06-07](../stories/EPIC-06-SALES-POS/US-06-07-manager-discount-override.md) — Manager Override at the POS |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-06-07-AC7 |
| Requirements | FR-06-017, FR-06-018, FR-06-019 |

**Story preconditions**
- Approver holds `sales.discounts.override` (scope `Discount`) or `sales.returns.approve` (scopes `ReturnApproval`, `RefundMethod`) and is assigned to the branch.
- `ManagerOverrideTtlSeconds` = 120 (default).

**US-06-07-AC7 — Requester permission and branch**

*Preconditions / test data*
1. a requester without `sales.pos.sell`, or a requester calling for an unassigned branch

*Steps*
1. the override endpoint is called

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN` (CS-07)

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-06-08: Open Cash Session with Opening Float

### TS-06-041: Open session creates OpeningFloat movement and audit

| Field | Value |
|---|---|
| Story | [US-06-08](../stories/EPIC-06-SALES-POS/US-06-08-open-cash-session.md) — Open Cash Session with Opening Float |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-08-AC1 |
| Requirements | FR-06-020, FR-06-021 |

**Story preconditions**
- User holds `sales.cash-sessions.open-close` and is assigned to the branch.

**US-06-08-AC1 — Open session**

*Preconditions / test data*
1. cashier C has no open session in branch A

*Steps*
1. C posts `POST /branches/{A}/cash-sessions` with opening float 500.00 and an Idempotency-Key

*Expected results*
1. the response is 201 with status `Open`, opening business date per branch time zone, and a `CashMovement` of type `OpeningFloat` +500.00 is written with an audit entry

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-042: Second open same branch rejected; other branch allowed

| Field | Value |
|---|---|
| Story | [US-06-08](../stories/EPIC-06-SALES-POS/US-06-08-open-cash-session.md) — Open Cash Session with Opening Float |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-08-AC2 |
| Requirements | FR-06-020, FR-06-021 |

**Story preconditions**
- User holds `sales.cash-sessions.open-close` and is assigned to the branch.

**US-06-08-AC2 — One open session per user per branch**

*Preconditions / test data*
1. C already has an `Open` session in branch A

*Steps*
1. C tries to open another in branch A, and then one in branch B (assigned)

*Expected results*
1. branch A returns 409 `SALES.CASH_SESSION_ALREADY_OPEN`
2. branch B succeeds

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-043: Parallel opens → one session

| Field | Value |
|---|---|
| Story | [US-06-08](../stories/EPIC-06-SALES-POS/US-06-08-open-cash-session.md) — Open Cash Session with Opening Float |
| Type / Execution | Concurrency / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-06-08-AC3 |
| Requirements | FR-06-020, FR-06-021 |

**Story preconditions**
- User holds `sales.cash-sessions.open-close` and is assigned to the branch.

**US-06-08-AC3 — Concurrent opens**

*Preconditions / test data*
1. C sends two open requests for branch A concurrently with different Idempotency-Keys

*Steps*
1. both execute

*Expected results*
1. exactly one session is created and the other returns 409 `SALES.CASH_SESSION_ALREADY_OPEN` (partial unique index)

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-044: POS blocked without session; API 409

| Field | Value |
|---|---|
| Story | [US-06-08](../stories/EPIC-06-SALES-POS/US-06-08-open-cash-session.md) — Open Cash Session with Opening Float |
| Type / Execution | E2E / Manual |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-08-AC4 |
| Requirements | FR-06-020, FR-06-021 |

**Story preconditions**
- User holds `sales.cash-sessions.open-close` and is assigned to the branch.

**US-06-08-AC4 — Selling requires session**

*Preconditions / test data*
1. C has no open session in branch A

*Steps*
1. C opens the POS selling screen, or calls the sale completion endpoint

*Expected results*
1. the screen shows the "Open cash session" prompt and blocks the Pay action
2. the API returns 409 `SALES.CASH_SESSION_NOT_OPEN`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-045: Float validation

| Field | Value |
|---|---|
| Story | [US-06-08](../stories/EPIC-06-SALES-POS/US-06-08-open-cash-session.md) — Open Cash Session with Opening Float |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-08-AC5 |
| Requirements | FR-06-020, FR-06-021 |

**Story preconditions**
- User holds `sales.cash-sessions.open-close` and is assigned to the branch.

**US-06-08-AC5 — Invalid float**

*Preconditions / test data*
1. an open request

*Steps*
1. float is -1.00, 100000.01, or 10.005

*Expected results*
1. the response is 400 `COMMON.VALIDATION_FAILED`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-046: 403 permission/branch; 404 other organization

| Field | Value |
|---|---|
| Story | [US-06-08](../stories/EPIC-06-SALES-POS/US-06-08-open-cash-session.md) — Open Cash Session with Opening Float |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-06-08-AC6 |
| Requirements | FR-06-020, FR-06-021 |

**Story preconditions**
- User holds `sales.cash-sessions.open-close` and is assigned to the branch.

**US-06-08-AC6 — Permission and branch**

*Preconditions / test data*
1. a user without `sales.cash-sessions.open-close`, and a user not assigned to branch B

*Steps*
1. they open a session in branch A and branch B respectively

*Expected results*
1. both receive 403 `COMMON.FORBIDDEN` (CS-07)
2. a branch id of another organization returns 404 `COMMON.NOT_FOUND` (CS-08)

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-06-09: Cash In and Cash Out Movements

### TS-06-047: Cash in updates expected cash and audits

| Field | Value |
|---|---|
| Story | [US-06-09](../stories/EPIC-06-SALES-POS/US-06-09-cash-in-and-cash-out.md) — Cash In and Cash Out Movements |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-06-09-AC1 |
| Requirements | FR-06-022 |

**Story preconditions**
- An `Open` session exists; user holds `finance.cash.manage`.

**US-06-09-AC1 — Cash in**

*Preconditions / test data*
1. session S with expected cash 500.00

*Steps*
1. the manager posts a `CashIn` of 200.00, category "Float top-up", note "Change coins added"

*Expected results*
1. a `CashIn` movement +200.00 is written with an audit entry and S's expected cash becomes 700.00

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-048: Cash out within available

| Field | Value |
|---|---|
| Story | [US-06-09](../stories/EPIC-06-SALES-POS/US-06-09-cash-in-and-cash-out.md) — Cash In and Cash Out Movements |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-06-09-AC2 |
| Requirements | FR-06-022 |

**Story preconditions**
- An `Open` session exists; user holds `finance.cash.manage`.

**US-06-09-AC2 — Cash out within available**

*Preconditions / test data*
1. S with expected cash 700.00

*Steps*
1. the manager posts a `CashOut` of 600.00, category "Bank deposit"

*Expected results*
1. a `CashOut` movement −600.00 is written and expected cash becomes 100.00

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-049: Cash out over available and concurrent cash out + refund serialization

| Field | Value |
|---|---|
| Story | [US-06-09](../stories/EPIC-06-SALES-POS/US-06-09-cash-in-and-cash-out.md) — Cash In and Cash Out Movements |
| Type / Execution | Concurrency / Automated |
| Priority | T1 (story P1) |
| Release | MVP |
| Covers | US-06-09-AC3 |
| Requirements | FR-06-022 |

**Story preconditions**
- An `Open` session exists; user holds `finance.cash.manage`.

**US-06-09-AC3 — Cash out exceeding available**

*Preconditions / test data*
1. S with expected cash 100.00

*Steps*
1. a `CashOut` of 100.01 is posted

*Expected results*
1. the response is 422 `SALES.CASH_OUT_EXCEEDS_AVAILABLE` and nothing is written

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-050: Movement on closed session rejected

| Field | Value |
|---|---|
| Story | [US-06-09](../stories/EPIC-06-SALES-POS/US-06-09-cash-in-and-cash-out.md) — Cash In and Cash Out Movements |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-06-09-AC4 |
| Requirements | FR-06-022 |

**Story preconditions**
- An `Open` session exists; user holds `finance.cash.manage`.

**US-06-09-AC4 — Closed session rejected**

*Preconditions / test data*
1. session S is `Closed`

*Steps*
1. a cash movement is posted to S

*Expected results*
1. the response is 409 `SALES.CASH_SESSION_NOT_OPEN`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-051: 403 permission / branch; 404 other organization

| Field | Value |
|---|---|
| Story | [US-06-09](../stories/EPIC-06-SALES-POS/US-06-09-cash-in-and-cash-out.md) — Cash In and Cash Out Movements |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | MVP |
| Covers | US-06-09-AC5 |
| Requirements | FR-06-022 |

**Story preconditions**
- An `Open` session exists; user holds `finance.cash.manage`.

**US-06-09-AC5 — Permission and isolation**

*Preconditions / test data*
1. a cashier without `finance.cash.manage`, and a manager not assigned to S's branch

*Steps*
1. they post a movement to S

*Expected results*
1. both receive 403 `COMMON.FORBIDDEN`
2. a session id of another organization returns 404 `COMMON.NOT_FOUND`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-06-10: Close Cash Session with Blind Count and Z-Report

### TS-06-052: Expected cash formula and variance from mixed movements

| Field | Value |
|---|---|
| Story | [US-06-10](../stories/EPIC-06-SALES-POS/US-06-10-close-cash-session-and-z-report.md) — Close Cash Session with Blind Count and Z-Report |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-10-AC1 |
| Requirements | FR-06-023, FR-06-024, FR-06-025, FR-06-026 |

**Story preconditions**
- C owns an `Open` session S; sales, refunds, and cash movements exist.

**US-06-10-AC1 — Expected cash and variance**

*Preconditions / test data*
1. S has float 500.00, `SaleCash` 1,861.59, `SaleVoid` −61.59, `RefundCash` −73.97, `CashIn` 200.00, `CashOut` −600.00

*Steps*
1. C closes S with counted cash 1,824.03 and an Idempotency-Key

*Expected results*
1. expected cash = 1,826.03, variance = −2.00, status `Closed`, `ClosingType` Normal, audit written
2. the response includes expected and variance only after closing

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-053: Blind: no expected cash for owner before close; X-report for manager only

| Field | Value |
|---|---|
| Story | [US-06-10](../stories/EPIC-06-SALES-POS/US-06-10-close-cash-session-and-z-report.md) — Close Cash Session with Blind Count and Z-Report |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-06-10-AC2 |
| Requirements | FR-06-023, FR-06-024, FR-06-025, FR-06-026 |

**Story preconditions**
- C owns an `Open` session S; sales, refunds, and cash movements exist.

**US-06-10-AC2 — Blind count before close**

*Preconditions / test data*
1. S is open

*Steps*
1. C calls `GET /cash-sessions/current` or `GET /cash-sessions/{S}`

*Expected results*
1. the response contains no expected cash, variance, or totals by method
2. a holder of `sales.cash-sessions.manage` can see an X-report

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-054: Variance note requirement and manager notification

| Field | Value |
|---|---|
| Story | [US-06-10](../stories/EPIC-06-SALES-POS/US-06-10-close-cash-session-and-z-report.md) — Close Cash Session with Blind Count and Z-Report |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-10-AC3 |
| Requirements | FR-06-023, FR-06-024, FR-06-025, FR-06-026 |

**Story preconditions**
- C owns an `Open` session S; sales, refunds, and cash movements exist.

**US-06-10-AC3 — Variance above tolerance needs note and notifies**

*Preconditions / test data*
1. `CashVarianceTolerance` = 5.00 and expected cash 1,826.03

*Steps*
1. C closes with counted 1,800.00 without a note, then with note "Gave wrong change"

*Expected results*
1. the first returns 422 `SALES.VARIANCE_REASON_REQUIRED` with S still open
2. the second closes S with variance −26.03 and branch managers receive a notification

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-055: Denomination breakdown consistency

| Field | Value |
|---|---|
| Story | [US-06-10](../stories/EPIC-06-SALES-POS/US-06-10-close-cash-session-and-z-report.md) — Close Cash Session with Blind Count and Z-Report |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-10-AC4 |
| Requirements | FR-06-023, FR-06-024, FR-06-025, FR-06-026 |

**Story preconditions**
- C owns an `Open` session S; sales, refunds, and cash movements exist.

**US-06-10-AC4 — Denomination breakdown**

*Preconditions / test data*
1. C enters 9 × 200, 2 × 10, 4 × 1, 0 × 0.25

*Steps*
1. the declared counted cash is 1,824.03

*Expected results*
1. the response is 422 `SALES.CASH_COUNT_INVALID` (breakdown sums to 1,824.00)
2. with counted 1,824.00 the close succeeds

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-056: Z-report totals reconcile with sales, returns, voids, movements

| Field | Value |
|---|---|
| Story | [US-06-10](../stories/EPIC-06-SALES-POS/US-06-10-close-cash-session-and-z-report.md) — Close Cash Session with Blind Count and Z-Report |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-10-AC5 |
| Requirements | FR-06-023, FR-06-024, FR-06-025, FR-06-026 |

**Story preconditions**
- C owns an `Open` session S; sales, refunds, and cash movements exist.

**US-06-10-AC5 — Z-report content**

*Preconditions / test data*
1. S is closed

*Steps*
1. C requests the Z-report (80 mm, ar)

*Expected results*
1. it shows session user and times, sale count, gross sales, discounts, returns, net sales, tax by rate, totals per payment method, refunds per method, voids (count, amount), cash in/out, float, expected, counted, variance, all consistent with stored documents

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-057: Close vs in-flight sale; immutability after close

| Field | Value |
|---|---|
| Story | [US-06-10](../stories/EPIC-06-SALES-POS/US-06-10-close-cash-session-and-z-report.md) — Close Cash Session with Blind Count and Z-Report |
| Type / Execution | Concurrency / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-06-10-AC6 |
| Requirements | FR-06-023, FR-06-024, FR-06-025, FR-06-026 |

**Story preconditions**
- C owns an `Open` session S; sales, refunds, and cash movements exist.

**US-06-10-AC6 — Closed session immutable; close vs in-flight sale**

*Preconditions / test data*
1. S is being closed while a sale on S is in progress

*Steps*
1. both run concurrently

*Expected results*
1. the sale either commits before the close (and is included in expected cash) or fails with 409 `SALES.CASH_SESSION_NOT_OPEN`
2. after close, any sale, refund, or movement on S returns 409 `SALES.CASH_SESSION_NOT_OPEN` and a second close returns 409 `SALES.CASH_SESSION_NOT_OPEN`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-058: Non-owner 403 `SALES.CASH_SESSION_NOT_OWNED`; no permission 403; other org 404

| Field | Value |
|---|---|
| Story | [US-06-10](../stories/EPIC-06-SALES-POS/US-06-10-close-cash-session-and-z-report.md) — Close Cash Session with Blind Count and Z-Report |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-06-10-AC7 |
| Requirements | FR-06-023, FR-06-024, FR-06-025, FR-06-026 |

**Story preconditions**
- C owns an `Open` session S; sales, refunds, and cash movements exist.

**US-06-10-AC7 — Permission and ownership**

*Preconditions / test data*
1. user D (with `sales.cash-sessions.open-close`) who does not own S, and a user without the permission

*Steps*
1. they call close on S

*Expected results*
1. D receives 403 `SALES.CASH_SESSION_NOT_OWNED`
2. the other receives 403 `COMMON.FORBIDDEN`
3. another organization's session id returns 404

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-059: Z-report ≤ 2 s for 1,000 sales

| Field | Value |
|---|---|
| Story | [US-06-10](../stories/EPIC-06-SALES-POS/US-06-10-close-cash-session-and-z-report.md) — Close Cash Session with Blind Count and Z-Report |
| Type / Execution | Performance / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-10-AC5 |
| Requirements | FR-06-023, FR-06-024, FR-06-025, FR-06-026 |

**Story preconditions**
- C owns an `Open` session S; sales, refunds, and cash movements exist.

**US-06-10-AC5 — Z-report content**

*Preconditions / test data*
1. S is closed

*Steps*
1. C requests the Z-report (80 mm, ar)

*Expected results*
1. it shows session user and times, sale count, gross sales, discounts, returns, net sales, tax by rate, totals per payment method, refunds per method, voids (count, amount), cash in/out, float, expected, counted, variance, all consistent with stored documents

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-06-11: Force-Close Another User's Cash Session

### TS-06-060: Force-close with Forced type, audit, owner notification

| Field | Value |
|---|---|
| Story | [US-06-11](../stories/EPIC-06-SALES-POS/US-06-11-force-close-cash-session.md) — Force-Close Another User's Cash Session |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-06-11-AC1 |
| Requirements | FR-06-027 |

**Story preconditions**
- Manager M holds `sales.cash-sessions.manage` and is assigned to the branch; cashier C owns `Open` session S.

**US-06-11-AC1 — Force-close**

*Preconditions / test data*
1. S has expected cash 1,250.00

*Steps*
1. M posts `POST /branches/{branchId}/cash-sessions/{S}/force-close` with counted 1,250.00, reason "Cashier left at end of shift", and an Idempotency-Key

*Expected results*
1. S becomes `Closed` with `ClosingType` Forced, `ClosedByUserId` M, variance 0.00
2. an audit entry is written and C receives a notification

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-061: Variance note required above tolerance

| Field | Value |
|---|---|
| Story | [US-06-11](../stories/EPIC-06-SALES-POS/US-06-11-force-close-cash-session.md) — Force-Close Another User's Cash Session |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-06-11-AC2 |
| Requirements | FR-06-027 |

**Story preconditions**
- Manager M holds `sales.cash-sessions.manage` and is assigned to the branch; cashier C owns `Open` session S.

**US-06-11-AC2 — Variance rules apply**

*Preconditions / test data*
1. `CashVarianceTolerance` 5.00 and expected cash 1,250.00

*Steps*
1. M force-closes with counted 1,200.00 and no variance note

*Expected results*
1. the response is 422 `SALES.VARIANCE_REASON_REQUIRED`
2. with a note the session closes with variance −50.00 and managers are notified

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-062: Owner close vs manager force-close race → one close persists

| Field | Value |
|---|---|
| Story | [US-06-11](../stories/EPIC-06-SALES-POS/US-06-11-force-close-cash-session.md) — Force-Close Another User's Cash Session |
| Type / Execution | Concurrency / Automated |
| Priority | T1 (story P1) |
| Release | MVP |
| Covers | US-06-11-AC3 |
| Requirements | FR-06-027 |

**Story preconditions**
- Manager M holds `sales.cash-sessions.manage` and is assigned to the branch; cashier C owns `Open` session S.

**US-06-11-AC3 — Session already closed**

*Preconditions / test data*
1. S was closed by C a moment earlier

*Steps*
1. M's force-close executes

*Expected results*
1. the response is 409 `SALES.CASH_SESSION_NOT_OPEN` and the stored close is unchanged

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-063: Reason length validation

| Field | Value |
|---|---|
| Story | [US-06-11](../stories/EPIC-06-SALES-POS/US-06-11-force-close-cash-session.md) — Force-Close Another User's Cash Session |
| Type / Execution | Unit / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-06-11-AC4 |
| Requirements | FR-06-027 |

**Story preconditions**
- Manager M holds `sales.cash-sessions.manage` and is assigned to the branch; cashier C owns `Open` session S.

**US-06-11-AC4 — Missing reason**

*Preconditions / test data*
1. an open session

*Steps*
1. M submits a reason of 5 characters

*Expected results*
1. the response is 400 `COMMON.VALIDATION_FAILED`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-064: 403 without manage / other branch (CS-07); 404 other organization (CS-08)

| Field | Value |
|---|---|
| Story | [US-06-11](../stories/EPIC-06-SALES-POS/US-06-11-force-close-cash-session.md) — Force-Close Another User's Cash Session |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | MVP |
| Covers | US-06-11-AC5 |
| Critical scenario | CS-07, CS-08 |
| Requirements | FR-06-027 |

**Story preconditions**
- Manager M holds `sales.cash-sessions.manage` and is assigned to the branch; cashier C owns `Open` session S.

**US-06-11-AC5 — Permission and isolation**

*Preconditions / test data*
1. a cashier with only `sales.cash-sessions.open-close`, and a manager not assigned to S's branch

*Steps*
1. each calls force-close on S

*Expected results*
1. both receive 403 `COMMON.FORBIDDEN` (CS-07)
2. a session of another organization returns 404 `COMMON.NOT_FOUND` (CS-08)

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-06-12: Complete a Sale Atomically

### TS-06-065: Full completion of §7.2 cart; verify every written row and balances

| Field | Value |
|---|---|
| Story | [US-06-12](../stories/EPIC-06-SALES-POS/US-06-12-complete-sale-atomically.md) — Complete a Sale Atomically |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-12-AC1 |
| Requirements | FR-06-021, FR-06-028, FR-06-029, FR-06-030, FR-06-031, FR-06-032, FR-06-033 |

**Story preconditions**
- Cashier C owns an `Open` session S in branch A and holds `sales.pos.sell`.
- `IInventoryAllocation` (SPEC-04), `DocumentSequence` (SPEC-02), audit/outbox (SPEC-10) available. PostgreSQL Row-Level Security is enabled.

**US-06-12-AC1 — Successful completion**

*Preconditions / test data*
1. the §7.2 cart, a valid `Discount` override, payments Card 100.00 (ref `A1B2C3D4`) + Cash tendered 200.00, `expectedTotal` 261.59

*Steps*
1. C posts `POST /branches/{A}/sales` with an Idempotency-Key

*Expected results*
1. the response is 201 with invoice number `CAI01-INV-2026-000123` (next in sequence), status `Completed`, total 261.59, change 38.41
2. and in the same transaction: 3 sale lines with snapshots (FR-06-032), allocations with batch unit cost, `Sale` stock movements whose sum equals −(20 + 7 + 5 × PackSize) base units, balances reduced accordingly, 2 payments, one `SaleCash` cash movement +161.59, override consumed, audit `SaleCompleted`, outbox `SaleCompleted`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-066: FEFO across two batches with unit cost snapshot; expired batch untouched

| Field | Value |
|---|---|
| Story | [US-06-12](../stories/EPIC-06-SALES-POS/US-06-12-complete-sale-atomically.md) — Complete a Sale Atomically |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-12-AC2 |
| Requirements | FR-06-021, FR-06-028, FR-06-029, FR-06-030, FR-06-031, FR-06-032, FR-06-033 |

**Story preconditions**
- Cashier C owns an `Open` session S in branch A and holds `sales.pos.sell`.
- `IInventoryAllocation` (SPEC-04), `DocumentSequence` (SPEC-02), audit/outbox (SPEC-10) available. PostgreSQL Row-Level Security is enabled.

**US-06-12-AC2 — FEFO across batches with cost snapshot**

*Preconditions / test data*
1. Medicine A in branch A has batch B1 (exp 2027-01-31, 12 units, cost 6.2500), B2 (exp 2027-04-30, 50 units, cost 6.5000), and expired batch B0 (exp 2026-10-31, 30 units)

*Steps*
1. a sale of 2 packs (20 units) completes

*Expected results*
1. allocations are B1 = 12 at 6.2500 and B2 = 8 at 6.5000
2. B0 is untouched
3. B1 sellable becomes 0

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-067: CS-02: expired, do-not-sell window, and quarantined-only stock rejected; nothing persisted

| Field | Value |
|---|---|
| Story | [US-06-12](../stories/EPIC-06-SALES-POS/US-06-12-complete-sale-atomically.md) — Complete a Sale Atomically |
| Type / Execution | Integration / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-06-12-AC3 |
| Critical scenario | CS-02 |
| Requirements | FR-06-021, FR-06-028, FR-06-029, FR-06-030, FR-06-031, FR-06-032, FR-06-033 |

**Story preconditions**
- Cashier C owns an `Open` session S in branch A and holds `sales.pos.sell`.
- `IInventoryAllocation` (SPEC-04), `DocumentSequence` (SPEC-02), audit/outbox (SPEC-10) available. PostgreSQL Row-Level Security is enabled.

**US-06-12-AC3 — Expired, do-not-sell, and quarantined stock never sold (CS-02)**

*Preconditions / test data*
1. Medicine F whose only stock is an expired batch, Medicine G whose only stock is inside the do-not-sell window, and Medicine H whose only batch is `Quarantined`

*Steps*
1. a sale containing any one of them is submitted

*Expected results*
1. the response is 409 `INVENTORY.INSUFFICIENT_STOCK` with `shortages[].sellable = 0` for that line, and no sale, movement, payment, or invoice number is persisted

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-068: Price change → `SALES.PRICE_MISMATCH` with quote; nothing persisted

| Field | Value |
|---|---|
| Story | [US-06-12](../stories/EPIC-06-SALES-POS/US-06-12-complete-sale-atomically.md) — Complete a Sale Atomically |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-12-AC4 |
| Requirements | FR-06-021, FR-06-028, FR-06-029, FR-06-030, FR-06-031, FR-06-032, FR-06-033 |

**Story preconditions**
- Cashier C owns an `Open` session S in branch A and holds `sales.pos.sell`.
- `IInventoryAllocation` (SPEC-04), `DocumentSequence` (SPEC-02), audit/outbox (SPEC-10) available. PostgreSQL Row-Level Security is enabled.

**US-06-12-AC4 — Server re-pricing rejects client total mismatch**

*Preconditions / test data*
1. the branch price of Medicine A changed from 85.5000 to 86.0000 after the cart was quoted

*Steps*
1. C submits with `expectedTotal` 261.59

*Expected results*
1. the response is 409 `SALES.PRICE_MISMATCH` with the server quote (new total) in the Problem Details `quote` extension, and nothing is persisted

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-069: Batch selling price override splits line into two sale lines

| Field | Value |
|---|---|
| Story | [US-06-12](../stories/EPIC-06-SALES-POS/US-06-12-complete-sale-atomically.md) — Complete a Sale Atomically |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-12-AC5 |
| Requirements | FR-06-021, FR-06-028, FR-06-029, FR-06-030, FR-06-031, FR-06-032, FR-06-033 |

**Story preconditions**
- Cashier C owns an `Open` session S in branch A and holds `sales.pos.sell`.
- `IInventoryAllocation` (SPEC-04), `DocumentSequence` (SPEC-02), audit/outbox (SPEC-10) available. PostgreSQL Row-Level Security is enabled.

**US-06-12-AC5 — Batch selling price override splits the line**

*Preconditions / test data*
1. Medicine K's FEFO allocation for 30 units is 20 from a batch with `SellingPriceOverride` 95.0000 per pack and 10 from a batch priced by the branch price 90.0000 (PackSize 10, unit BaseUnit)

*Steps*
1. the sale completes with the quoted `expectedTotal`

*Expected results*
1. two sale lines are stored (20 units at 9.5000, 10 units at 9.0000) each with its own allocation, both derived from the same cart line

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-070: Closed session 409; other user's session 403

| Field | Value |
|---|---|
| Story | [US-06-12](../stories/EPIC-06-SALES-POS/US-06-12-complete-sale-atomically.md) — Complete a Sale Atomically |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-12-AC6 |
| Requirements | FR-06-021, FR-06-028, FR-06-029, FR-06-030, FR-06-031, FR-06-032, FR-06-033 |

**Story preconditions**
- Cashier C owns an `Open` session S in branch A and holds `sales.pos.sell`.
- `IInventoryAllocation` (SPEC-04), `DocumentSequence` (SPEC-02), audit/outbox (SPEC-10) available. PostgreSQL Row-Level Security is enabled.

**US-06-12-AC6 — Session required and owned**

*Preconditions / test data*
1. C's session S is `Closed`, and separately session T belongs to cashier D

*Steps*
1. C submits a sale with S, and with T

*Expected results*
1. S yields 409 `SALES.CASH_SESSION_NOT_OPEN`
2. T yields 403 `SALES.CASH_SESSION_NOT_OWNED`
3. nothing is persisted

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-071: Invoice numbers consecutive around a failed sale

| Field | Value |
|---|---|
| Story | [US-06-12](../stories/EPIC-06-SALES-POS/US-06-12-complete-sale-atomically.md) — Complete a Sale Atomically |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-12-AC7 |
| Requirements | FR-06-021, FR-06-028, FR-06-029, FR-06-030, FR-06-031, FR-06-032, FR-06-033 |

**Story preconditions**
- Cashier C owns an `Open` session S in branch A and holds `sales.pos.sell`.
- `IInventoryAllocation` (SPEC-04), `DocumentSequence` (SPEC-02), audit/outbox (SPEC-10) available. PostgreSQL Row-Level Security is enabled.

**US-06-12-AC7 — Gapless invoice numbering under failures**

*Preconditions / test data*
1. 3 sales where the second fails with `INVENTORY.INSUFFICIENT_STOCK`

*Steps*
1. they are submitted in order

*Expected results*
1. the committed invoice numbers are consecutive (…000124, …000125) with no gap

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-072: 403 permission, CS-07 cross-branch 403, CS-08 other-org medicine not revealed (RLS on)

| Field | Value |
|---|---|
| Story | [US-06-12](../stories/EPIC-06-SALES-POS/US-06-12-complete-sale-atomically.md) — Complete a Sale Atomically |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-06-12-AC8 |
| Critical scenario | CS-07, CS-08 |
| Requirements | FR-06-021, FR-06-028, FR-06-029, FR-06-030, FR-06-031, FR-06-032, FR-06-033 |

**Story preconditions**
- Cashier C owns an `Open` session S in branch A and holds `sales.pos.sell`.
- `IInventoryAllocation` (SPEC-04), `DocumentSequence` (SPEC-02), audit/outbox (SPEC-10) available. PostgreSQL Row-Level Security is enabled.

**US-06-12-AC8 — Permission, cross-branch, and cross-organization**

*Preconditions / test data*
1. a user without `sales.pos.sell`, a user assigned only to branch B, and a cart containing a medicine id of another organization

*Steps*
1. each submits a sale to branch A

*Expected results*
1. the first two receive 403 `COMMON.FORBIDDEN` (CS-07)
2. the third receives 422 `SALES.MEDICINE_NOT_SELLABLE` and no data of the other organization is revealed (CS-08)

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-073: p95 ≤ 800 ms / p99 ≤ 1.5 s at 20 cashiers × 50 branches

| Field | Value |
|---|---|
| Story | [US-06-12](../stories/EPIC-06-SALES-POS/US-06-12-complete-sale-atomically.md) — Complete a Sale Atomically |
| Type / Execution | Performance / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-12-AC1 |
| Requirements | FR-06-021, FR-06-028, FR-06-029, FR-06-030, FR-06-031, FR-06-032, FR-06-033 |

**Story preconditions**
- Cashier C owns an `Open` session S in branch A and holds `sales.pos.sell`.
- `IInventoryAllocation` (SPEC-04), `DocumentSequence` (SPEC-02), audit/outbox (SPEC-10) available. PostgreSQL Row-Level Security is enabled.

**US-06-12-AC1 — Successful completion**

*Preconditions / test data*
1. the §7.2 cart, a valid `Discount` override, payments Card 100.00 (ref `A1B2C3D4`) + Cash tendered 200.00, `expectedTotal` 261.59

*Steps*
1. C posts `POST /branches/{A}/sales` with an Idempotency-Key

*Expected results*
1. the response is 201 with invoice number `CAI01-INV-2026-000123` (next in sequence), status `Completed`, total 261.59, change 38.41
2. and in the same transaction: 3 sale lines with snapshots (FR-06-032), allocations with batch unit cost, `Sale` stock movements whose sum equals −(20 + 7 + 5 × PackSize) base units, balances reduced accordingly, 2 payments, one `SaleCash` cash movement +161.59, override consumed, audit `SaleCompleted`, outbox `SaleCompleted`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-06-13: Cash, Card, and Split Payments with Change

### TS-06-074: Cash with change: payment, change, cash movement

| Field | Value |
|---|---|
| Story | [US-06-13](../stories/EPIC-06-SALES-POS/US-06-13-cash-card-and-split-payments.md) — Cash, Card, and Split Payments with Change |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-13-AC1 |
| Requirements | FR-06-034, FR-06-035 |

**Story preconditions**
- US-06-12 completion; card terminal is a standalone device (no integration, OD-06-04).

**US-06-13-AC1 — Cash with change**

*Preconditions / test data*
1. a sale total of 261.59

*Steps*
1. C pays Cash with tendered 300.00

*Expected results*
1. the Cash payment is stored with amount 261.59, tendered 300.00, change 38.41
2. cash movement `SaleCash` +261.59
3. the POS displays change 38.41 in ≥ 32 px digits

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-075: Split card + cash; only last 4 digits stored

| Field | Value |
|---|---|
| Story | [US-06-13](../stories/EPIC-06-SALES-POS/US-06-13-cash-card-and-split-payments.md) — Cash, Card, and Split Payments with Change |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-13-AC2 |
| Requirements | FR-06-034, FR-06-035 |

**Story preconditions**
- US-06-12 completion; card terminal is a standalone device (no integration, OD-06-04).

**US-06-13-AC2 — Split card + cash**

*Preconditions / test data*
1. a total of 261.59

*Steps*
1. C pays Card 100.00 (ref `A1B2C3D4`, last4 `4242`) and Cash tendered 200.00

*Expected results*
1. payments Card 100.00 and Cash 161.59 (change 38.41) are stored
2. cash movement +161.59
3. no card number other than last 4 digits is stored

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-076: CS-09: insufficient payment → no stock deducted, no sale persisted

| Field | Value |
|---|---|
| Story | [US-06-13](../stories/EPIC-06-SALES-POS/US-06-13-cash-card-and-split-payments.md) — Cash, Card, and Split Payments with Change |
| Type / Execution | Integration / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-06-13-AC3 |
| Critical scenario | CS-09 |
| Requirements | FR-06-034, FR-06-035 |

**Story preconditions**
- US-06-12 completion; card terminal is a standalone device (no integration, OD-06-04).

**US-06-13-AC3 — Insufficient payment (CS-09)**

*Preconditions / test data*
1. a total of 261.59

*Steps*
1. C submits Card 100.00 + Cash tendered 150.00

*Expected results*
1. the response is 422 `SALES.PAYMENT_INSUFFICIENT`
2. no sale, stock movement, payment, cash movement, or invoice number is persisted and batch balances are unchanged

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-077: Card exceeding total; missing reference

| Field | Value |
|---|---|
| Story | [US-06-13](../stories/EPIC-06-SALES-POS/US-06-13-cash-card-and-split-payments.md) — Cash, Card, and Split Payments with Change |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-13-AC4 |
| Requirements | FR-06-034, FR-06-035 |

**Story preconditions**
- US-06-12 completion; card terminal is a standalone device (no integration, OD-06-04).

**US-06-13-AC4 — Card cannot exceed total or lack reference**

*Preconditions / test data*
1. a total of 261.59

*Steps*
1. C submits Card 300.00, or Card 261.59 without a terminal reference

*Expected results*
1. the first returns 422 `SALES.PAYMENT_EXCEEDS_TOTAL`
2. the second 422 `SALES.CARD_REFERENCE_REQUIRED`
3. nothing persisted

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-078: CS-09: declined/unconfirmed card blocks completion; reversal instruction after server rejection

| Field | Value |
|---|---|
| Story | [US-06-13](../stories/EPIC-06-SALES-POS/US-06-13-cash-card-and-split-payments.md) — Cash, Card, and Split Payments with Change |
| Type / Execution | E2E / Manual |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-06-13-AC5 |
| Critical scenario | CS-09 |
| Requirements | FR-06-034, FR-06-035 |

**Story preconditions**
- US-06-12 completion; card terminal is a standalone device (no integration, OD-06-04).

**US-06-13-AC5 — Declined / unconfirmed card (CS-09)**

*Preconditions / test data*
1. the terminal declined the card and the cashier has no terminal reference

*Steps*
1. the cashier tries to finish the sale

*Expected results*
1. the POS Pay button stays disabled until a reference is entered or the card payment is removed
2. if a sale is rejected by the server after the terminal approved the card, the POS shows "Reverse the card transaction on the terminal" and the server has persisted nothing

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-079: Payment entry count limits

| Field | Value |
|---|---|
| Story | [US-06-13](../stories/EPIC-06-SALES-POS/US-06-13-cash-card-and-split-payments.md) — Cash, Card, and Split Payments with Change |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-13-AC6 |
| Requirements | FR-06-034, FR-06-035 |

**Story preconditions**
- US-06-12 completion; card terminal is a standalone device (no integration, OD-06-04).

**US-06-13-AC6 — Payment method limits**

*Preconditions / test data*
1. a total of 500.00

*Steps*
1. C submits two Cash entries, or four Card entries

*Expected results*
1. the response is 400 `COMMON.VALIDATION_FAILED`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-06-14: Sale Completion Idempotency, Concurrency, and Failure Safety

### TS-06-080: CS-01: two cashiers, last unit → one success, one `INVENTORY.INSUFFICIENT_STOCK`, balance 0, one movement

| Field | Value |
|---|---|
| Story | [US-06-14](../stories/EPIC-06-SALES-POS/US-06-14-sale-idempotency-and-concurrency.md) — Sale Completion Idempotency, Concurrency, and Failure Safety |
| Type / Execution | Concurrency / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-06-14-AC1 |
| Critical scenario | CS-01 |
| Requirements | FR-06-036, FR-06-037 |

**Story preconditions**
- US-06-12 implemented; `IdempotencyRecord` infrastructure; tests run on PostgreSQL with RLS enabled.

**US-06-14-AC1 — Last unit sold concurrently (CS-01)**

*Preconditions / test data*
1. Medicine L has exactly 1 sellable base unit in branch A, and cashiers C and D each have an open session

*Steps*
1. both submit a sale of 1 unit at the same time

*Expected results*
1. exactly one returns 201 and the other 409 `INVENTORY.INSUFFICIENT_STOCK`
2. the batch balance is 0
3. exactly one `Sale` movement exists

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-081: CS-01: 50 parallel completions for 10 units × 100 runs → zero oversell, no negative balance

| Field | Value |
|---|---|
| Story | [US-06-14](../stories/EPIC-06-SALES-POS/US-06-14-sale-idempotency-and-concurrency.md) — Sale Completion Idempotency, Concurrency, and Failure Safety |
| Type / Execution | Concurrency / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-06-14-AC1 |
| Critical scenario | CS-01 |
| Requirements | FR-06-036, FR-06-037 |

**Story preconditions**
- US-06-12 implemented; `IdempotencyRecord` infrastructure; tests run on PostgreSQL with RLS enabled.

**US-06-14-AC1 — Last unit sold concurrently (CS-01)**

*Preconditions / test data*
1. Medicine L has exactly 1 sellable base unit in branch A, and cashiers C and D each have an open session

*Steps*
1. both submit a sale of 1 unit at the same time

*Expected results*
1. exactly one returns 201 and the other 409 `INVENTORY.INSUFFICIENT_STOCK`
2. the batch balance is 0
3. exactly one `Sale` movement exists

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-082: CS-11: replay with same key returns stored response, single effect

| Field | Value |
|---|---|
| Story | [US-06-14](../stories/EPIC-06-SALES-POS/US-06-14-sale-idempotency-and-concurrency.md) — Sale Completion Idempotency, Concurrency, and Failure Safety |
| Type / Execution | Integration / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-06-14-AC2 |
| Critical scenario | CS-11 |
| Requirements | FR-06-036, FR-06-037 |

**Story preconditions**
- US-06-12 implemented; `IdempotencyRecord` infrastructure; tests run on PostgreSQL with RLS enabled.

**US-06-14-AC2 — Replay with same key (CS-11)**

*Preconditions / test data*
1. a sale was committed for Idempotency-Key K

*Steps*
1. the client retries the identical request with K (e.g., after a timeout)

*Expected results*
1. the response is the stored 201 body with header `Idempotency-Replayed: true`
2. no second sale, movement, payment, or invoice number exists

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-083: CS-11: 100 concurrent duplicates → one sale

| Field | Value |
|---|---|
| Story | [US-06-14](../stories/EPIC-06-SALES-POS/US-06-14-sale-idempotency-and-concurrency.md) — Sale Completion Idempotency, Concurrency, and Failure Safety |
| Type / Execution | Concurrency / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-06-14-AC3 |
| Critical scenario | CS-11 |
| Requirements | FR-06-036, FR-06-037 |

**Story preconditions**
- US-06-12 implemented; `IdempotencyRecord` infrastructure; tests run on PostgreSQL with RLS enabled.

**US-06-14-AC3 — Concurrent duplicates (CS-11)**

*Preconditions / test data*
1. 100 identical requests with key K are sent concurrently

*Steps*
1. they complete

*Expected results*
1. exactly 1 sale exists and all successful responses carry the same sale id and invoice number

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-084: Key reuse with different body → 422

| Field | Value |
|---|---|
| Story | [US-06-14](../stories/EPIC-06-SALES-POS/US-06-14-sale-idempotency-and-concurrency.md) — Sale Completion Idempotency, Concurrency, and Failure Safety |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-14-AC4 |
| Requirements | FR-06-036, FR-06-037 |

**Story preconditions**
- US-06-12 implemented; `IdempotencyRecord` infrastructure; tests run on PostgreSQL with RLS enabled.

**US-06-14-AC4 — Key reused with different body**

*Preconditions / test data*
1. key K was used for a committed sale

*Steps*
1. a request with K and a different cart is sent

*Expected results*
1. the response is 422 `COMMON.IDEMPOTENCY_KEY_REUSED` and nothing is persisted

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-085: CS-10: DB failure after stock movements → full rollback; retry succeeds once

| Field | Value |
|---|---|
| Story | [US-06-14](../stories/EPIC-06-SALES-POS/US-06-14-sale-idempotency-and-concurrency.md) — Sale Completion Idempotency, Concurrency, and Failure Safety |
| Type / Execution | Fault injection / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-06-14-AC5 |
| Critical scenario | CS-10 |
| Requirements | FR-06-036, FR-06-037 |

**Story preconditions**
- US-06-12 implemented; `IdempotencyRecord` infrastructure; tests run on PostgreSQL with RLS enabled.

**US-06-14-AC5 — Database failure mid-deduction (CS-10)**

*Preconditions / test data*
1. a fault is injected after the `Sale` stock movements are inserted and before commit

*Steps*
1. the sale is submitted

*Expected results*
1. the response is 500 `COMMON.INTERNAL_ERROR`
2. batch balances, stock movements, payments, cash movements, document sequence, and idempotency records are exactly as before
3. a retry with the same key then succeeds once

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-086: Opposite-order carts commit; lock timeout 503 `COMMON.LOCK_TIMEOUT`; exhausted retries 503

| Field | Value |
|---|---|
| Story | [US-06-14](../stories/EPIC-06-SALES-POS/US-06-14-sale-idempotency-and-concurrency.md) — Sale Completion Idempotency, Concurrency, and Failure Safety |
| Type / Execution | Concurrency / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-06-14-AC6 |
| Requirements | FR-06-036, FR-06-037 |

**Story preconditions**
- US-06-12 implemented; `IdempotencyRecord` infrastructure; tests run on PostgreSQL with RLS enabled.

**US-06-14-AC6 — Deadlock and lock timeout**

*Preconditions / test data*
1. two carts containing Medicines M and N in opposite order, and a third transaction holding a lock on a needed balance row for 5 s

*Steps*
1. they are submitted concurrently

*Expected results*
1. the first two both commit (single ordered `FOR UPDATE` in BatchId order prevents deadlock
2. any deadlock is retried up to 2 additional times) and the third returns 503 `COMMON.LOCK_TIMEOUT` with `Retry-After: 1` with nothing persisted
3. exhausted deadlock retries return 503 `COMMON.TRANSIENT_CONFLICT`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-087: POS key reuse on retry, new key after edit; missing key 400

| Field | Value |
|---|---|
| Story | [US-06-14](../stories/EPIC-06-SALES-POS/US-06-14-sale-idempotency-and-concurrency.md) — Sale Completion Idempotency, Concurrency, and Failure Safety |
| Type / Execution | E2E / Manual |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-14-AC7 |
| Requirements | FR-06-036, FR-06-037 |

**Story preconditions**
- US-06-12 implemented; `IdempotencyRecord` infrastructure; tests run on PostgreSQL with RLS enabled.

**US-06-14-AC7 — Client key lifecycle**

*Preconditions / test data*
1. the POS submitted with key K and got a network timeout

*Steps*
1. the cashier presses Complete again without changes, and later edits the cart and presses Complete

*Expected results*
1. the first retry reuses K
2. after the edit a new key is generated
3. a missing key returns 400 `COMMON.IDEMPOTENCY_KEY_REQUIRED`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-088: Same key value from other user / CS-08 other organization processed independently

| Field | Value |
|---|---|
| Story | [US-06-14](../stories/EPIC-06-SALES-POS/US-06-14-sale-idempotency-and-concurrency.md) — Sale Completion Idempotency, Concurrency, and Failure Safety |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-06-14-AC8 |
| Critical scenario | CS-08 |
| Requirements | FR-06-036, FR-06-037 |

**Story preconditions**
- US-06-12 implemented; `IdempotencyRecord` infrastructure; tests run on PostgreSQL with RLS enabled.

**US-06-14-AC8 — Keys are per user and organization**

*Preconditions / test data*
1. cashier D (same organization) and a user of another organization send a request with the same key value K used by C

*Steps*
1. they submit their own carts

*Expected results*
1. each is processed independently (keys are scoped by OrganizationId and UserId) and no response of C is ever returned to them (CS-08)

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-089: Invoice-number gap audit over 10,000 completions with 5% injected failures

| Field | Value |
|---|---|
| Story | [US-06-14](../stories/EPIC-06-SALES-POS/US-06-14-sale-idempotency-and-concurrency.md) — Sale Completion Idempotency, Concurrency, and Failure Safety |
| Type / Execution | Fault injection / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-06-14-AC5 |
| Critical scenario | CS-10 |
| Requirements | FR-06-036, FR-06-037 |

**Story preconditions**
- US-06-12 implemented; `IdempotencyRecord` infrastructure; tests run on PostgreSQL with RLS enabled.

**US-06-14-AC5 — Database failure mid-deduction (CS-10)**

*Preconditions / test data*
1. a fault is injected after the `Sale` stock movements are inserted and before commit

*Steps*
1. the sale is submitted

*Expected results*
1. the response is 500 `COMMON.INTERNAL_ERROR`
2. batch balances, stock movements, payments, cash movements, document sequence, and idempotency records are exactly as before
3. a retry with the same key then succeeds once

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-06-15: Explicit Batch Selection at the POS (FEFO Override)

### TS-06-090: Explicit eligible batch allocated, flagged, audited

| Field | Value |
|---|---|
| Story | [US-06-15](../stories/EPIC-06-SALES-POS/US-06-15-explicit-batch-selection-at-pos.md) — Explicit Batch Selection at the POS (FEFO Override) |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-06-15-AC1 |
| Requirements | FR-06-038 |

**Story preconditions**
- User holds `inventory.batches.override-fefo`; batches visible in the line's batch picker (SPEC-04 batch views).

**US-06-15-AC1 — Eligible explicit batch**

*Preconditions / test data*
1. Medicine A has FEFO batch B1 (exp 2027-01-31) and batch B2 (exp 2027-04-30) with 50 sellable units

*Steps*
1. a pharmacist selects B2 for 20 units with reason "Customer box from shelf" and completes the sale

*Expected results*
1. the allocation is B2 = 20 units with `IsFefoOverride = true`, the reason is stored on the line, and an audit entry records the FEFO override

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-091: CS-02: explicit expired / do-not-sell / quarantined batch rejected

| Field | Value |
|---|---|
| Story | [US-06-15](../stories/EPIC-06-SALES-POS/US-06-15-explicit-batch-selection-at-pos.md) — Explicit Batch Selection at the POS (FEFO Override) |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-06-15-AC2 |
| Critical scenario | CS-02 |
| Requirements | FR-06-038 |

**Story preconditions**
- User holds `inventory.batches.override-fefo`; batches visible in the line's batch picker (SPEC-04 batch views).

**US-06-15-AC2 — Ineligible batch (CS-02)**

*Preconditions / test data*
1. batch B0 is expired, B3 is in the do-not-sell window, and B4 is `Quarantined`

*Steps*
1. the pharmacist selects any of them and completes

*Expected results*
1. the response is 422 `INVENTORY.BATCH_NOT_SELLABLE` with reason `Expired`, `DoNotSellWindow`, or `Quarantined` respectively
2. nothing is persisted

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-092: Explicit batch insufficient → 409, no fallback

| Field | Value |
|---|---|
| Story | [US-06-15](../stories/EPIC-06-SALES-POS/US-06-15-explicit-batch-selection-at-pos.md) — Explicit Batch Selection at the POS (FEFO Override) |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-06-15-AC3 |
| Requirements | FR-06-038 |

**Story preconditions**
- User holds `inventory.batches.override-fefo`; batches visible in the line's batch picker (SPEC-04 batch views).

**US-06-15-AC3 — Explicit batch must cover the line**

*Preconditions / test data*
1. B2 has 10 sellable units

*Steps*
1. the pharmacist selects B2 for 20 units

*Expected results*
1. the response is 409 `INVENTORY.INSUFFICIENT_STOCK` (no fallback to other batches)

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-093: 403 without override permission; FEFO-first explicit allowed

| Field | Value |
|---|---|
| Story | [US-06-15](../stories/EPIC-06-SALES-POS/US-06-15-explicit-batch-selection-at-pos.md) — Explicit Batch Selection at the POS (FEFO Override) |
| Type / Execution | Security / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-06-15-AC4 |
| Requirements | FR-06-038 |

**Story preconditions**
- User holds `inventory.batches.override-fefo`; batches visible in the line's batch picker (SPEC-04 batch views).

**US-06-15-AC4 — Permission denied**

*Preconditions / test data*
1. a cashier without `inventory.batches.override-fefo`

*Steps*
1. a request selects B2 (not the FEFO first choice)

*Expected results*
1. the response is 403 `INVENTORY.FEFO_OVERRIDE_NOT_PERMITTED`
2. selecting B1 (the FEFO first choice) explicitly is accepted

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-094: Missing reason 400; CS-07 batch of other branch rejected

| Field | Value |
|---|---|
| Story | [US-06-15](../stories/EPIC-06-SALES-POS/US-06-15-explicit-batch-selection-at-pos.md) — Explicit Batch Selection at the POS (FEFO Override) |
| Type / Execution | Security / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-06-15-AC5 |
| Critical scenario | CS-07 |
| Requirements | FR-06-038 |

**Story preconditions**
- User holds `inventory.batches.override-fefo`; batches visible in the line's batch picker (SPEC-04 batch views).

**US-06-15-AC5 — Reason required and batch of another branch**

*Preconditions / test data*
1. an explicit batch without a reason, and a batch id from branch B

*Steps*
1. each is submitted for branch A

*Expected results*
1. the first returns 400 `COMMON.VALIDATION_FAILED`
2. the second 422 `INVENTORY.BATCH_NOT_SELLABLE` (reason `WrongBranch`) (CS-07)

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-06-16: Print Sales Invoice as 80 mm Receipt or A4 Invoice (Arabic / English)

### TS-06-095: Auto-print original thermal Arabic receipt; print record copy 0

| Field | Value |
|---|---|
| Story | [US-06-16](../stories/EPIC-06-SALES-POS/US-06-16-print-sales-invoice-and-receipt.md) — Print Sales Invoice as 80 mm Receipt or A4 Invoice (Arabic / English) |
| Type / Execution | E2E / Manual |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-16-AC1 |
| Requirements | FR-06-039 |

**Story preconditions**
- Branch settings `AutoPrintReceipt`, `DefaultReceiptFormat`, `ReceiptLanguage`, `ReceiptFooterText`; organization legal fields configured (SPEC-02).

**US-06-16-AC1 — Auto-print original thermal receipt**

*Preconditions / test data*
1. `AutoPrintReceipt` = true, `DefaultReceiptFormat` = Thermal80mm, `ReceiptLanguage` = ar

*Steps*
1. a sale completes

*Expected results*
1. the POS calls `POST /sales/{id}/prints` (format Thermal80mm, ar, copy 0), receives the render model, and opens the print dialog with a 72 mm-wide RTL layout containing all §8.6 fields
2. a `SalePrintRecord` with CopyNumber 0 is stored

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-096: A4 English PDF content and generation time

| Field | Value |
|---|---|
| Story | [US-06-16](../stories/EPIC-06-SALES-POS/US-06-16-print-sales-invoice-and-receipt.md) — Print Sales Invoice as 80 mm Receipt or A4 Invoice (Arabic / English) |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-16-AC2 |
| Requirements | FR-06-039 |

**Story preconditions**
- Branch settings `AutoPrintReceipt`, `DefaultReceiptFormat`, `ReceiptLanguage`, `ReceiptFooterText`; organization legal fields configured (SPEC-02).

**US-06-16-AC2 — A4 invoice in English as PDF**

*Preconditions / test data*
1. a completed sale

*Steps*
1. the user requests format A4, language en, output Pdf

*Expected results*
1. a PDF is returned within 2 s (p95) with LTR layout, tax summary per rate, payments with card reference masked to the last 4 characters, and amounts formatted with 2 decimals and EGP currency

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-097: Receipt snapshot (ar RTL, en LTR) with §7.2 amounts and remaining-to-dispense

| Field | Value |
|---|---|
| Story | [US-06-16](../stories/EPIC-06-SALES-POS/US-06-16-print-sales-invoice-and-receipt.md) — Print Sales Invoice as 80 mm Receipt or A4 Invoice (Arabic / English) |
| Type / Execution | Visual / Manual |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-16-AC3 |
| Requirements | FR-06-039 |

**Story preconditions**
- Branch settings `AutoPrintReceipt`, `DefaultReceiptFormat`, `ReceiptLanguage`, `ReceiptFooterText`; organization legal fields configured (SPEC-02).

**US-06-16-AC3 — Content correctness**

*Preconditions / test data*
1. the §7.2 sale with a linked patient and prescription with remaining quantity

*Steps*
1. the receipt is rendered

*Expected results*
1. it shows invoice number, branch-local date/time, cashier, patient name only (no medical data), each line with quantity+unit, unit price, discount, total, gross 274.73, discounts 27.10, net 247.63, tax 13.96 (14%: 13.96
2. 0%: 0.00), total 261.59, Card 100.00 (…C3D4), Cash 161.59, tendered 200.00, change 38.41, and "Remaining to dispense" for the prescription item

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-098: Voided banner on print

| Field | Value |
|---|---|
| Story | [US-06-16](../stories/EPIC-06-SALES-POS/US-06-16-print-sales-invoice-and-receipt.md) — Print Sales Invoice as 80 mm Receipt or A4 Invoice (Arabic / English) |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-16-AC4 |
| Requirements | FR-06-039 |

**Story preconditions**
- Branch settings `AutoPrintReceipt`, `DefaultReceiptFormat`, `ReceiptLanguage`, `ReceiptFooterText`; organization legal fields configured (SPEC-02).

**US-06-16-AC4 — Voided sale banner**

*Preconditions / test data*
1. a voided sale

*Steps*
1. it is printed

*Expected results*
1. the document shows a "VOIDED" / "ملغاة" banner with void date and is marked as a copy

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-099: 403 permission / CS-07 branch; CS-08 other org 404

| Field | Value |
|---|---|
| Story | [US-06-16](../stories/EPIC-06-SALES-POS/US-06-16-print-sales-invoice-and-receipt.md) — Print Sales Invoice as 80 mm Receipt or A4 Invoice (Arabic / English) |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-06-16-AC5 |
| Critical scenario | CS-07, CS-08 |
| Requirements | FR-06-039 |

**Story preconditions**
- Branch settings `AutoPrintReceipt`, `DefaultReceiptFormat`, `ReceiptLanguage`, `ReceiptFooterText`; organization legal fields configured (SPEC-02).

**US-06-16-AC5 — Permission and isolation**

*Preconditions / test data*
1. a user without `sales.sales.read`, a user unassigned to the sale's branch, and a sale id from another organization

*Steps*
1. they request a print

*Expected results*
1. the first two receive 403 `COMMON.FORBIDDEN` (CS-07)
2. the third 404 `COMMON.NOT_FOUND` (CS-08)

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-06-17: Reprint Sales Invoice with COPY Marking

### TS-06-100: Sequential COPY numbering and print records

| Field | Value |
|---|---|
| Story | [US-06-17](../stories/EPIC-06-SALES-POS/US-06-17-reprint-with-copy-marking.md) — Reprint Sales Invoice with COPY Marking |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-06-17-AC1 |
| Requirements | FR-06-040 |

**Story preconditions**
- The original print (copy 0) exists for the sale.

**US-06-17-AC1 — COPY marking with sequence**

*Preconditions / test data*
1. a sale with an original print record

*Steps*
1. the user prints it twice more

*Expected results*
1. the documents show "COPY 1" / "نسخة 1" and "COPY 2" / "نسخة 2", and print records with CopyNumber 1 and 2 are stored with user, time, format, and language

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-101: Reprint audit entry

| Field | Value |
|---|---|
| Story | [US-06-17](../stories/EPIC-06-SALES-POS/US-06-17-reprint-with-copy-marking.md) — Reprint Sales Invoice with COPY Marking |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-06-17-AC2 |
| Requirements | FR-06-040 |

**Story preconditions**
- The original print (copy 0) exists for the sale.

**US-06-17-AC2 — Reprint audited**

*Preconditions / test data*
1. a reprint

*Steps*
1. it is recorded

*Expected results*
1. an audit entry `SaleReceiptReprinted` with sale id, copy number, and user is written in the same transaction

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-102: Idempotent retry and concurrent reprints keep unique copy numbers

| Field | Value |
|---|---|
| Story | [US-06-17](../stories/EPIC-06-SALES-POS/US-06-17-reprint-with-copy-marking.md) — Reprint Sales Invoice with COPY Marking |
| Type / Execution | Concurrency / Automated |
| Priority | T1 (story P1) |
| Release | MVP |
| Covers | US-06-17-AC3 |
| Requirements | FR-06-040 |

**Story preconditions**
- The original print (copy 0) exists for the sale.

**US-06-17-AC3 — Idempotent print request**

*Preconditions / test data*
1. a reprint request with Idempotency-Key K was processed

*Steps*
1. the same request with K is retried

*Expected results*
1. the same copy number is returned and no additional print record is created

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-103: 403 without permission; CS-08 other org 404

| Field | Value |
|---|---|
| Story | [US-06-17](../stories/EPIC-06-SALES-POS/US-06-17-reprint-with-copy-marking.md) — Reprint Sales Invoice with COPY Marking |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | MVP |
| Covers | US-06-17-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-06-040 |

**Story preconditions**
- The original print (copy 0) exists for the sale.

**US-06-17-AC4 — Permission denied and isolation**

*Preconditions / test data*
1. a user without `sales.sales.read`, and a user of another organization

*Steps*
1. they request a reprint

*Expected results*
1. the first receives 403 `COMMON.FORBIDDEN`
2. the second 404 `COMMON.NOT_FOUND` (CS-08)

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-06-18: Sales History Search and Sale Detail

### TS-06-104: Date/method/status filters, pagination, default sort

| Field | Value |
|---|---|
| Story | [US-06-18](../stories/EPIC-06-SALES-POS/US-06-18-sales-history-and-detail.md) — Sales History Search and Sale Detail |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-06-18-AC1 |
| Requirements | FR-06-041, FR-06-042 |

**Story preconditions**
- Completed sales exist; user holds `sales.sales.read`.

**US-06-18-AC1 — Search with filters**

*Preconditions / test data*
1. 1,000 sales in branch A over 3 months

*Steps*
1. the user calls `GET /branches/{A}/sales?from=2026-10-01&to=2026-10-31&paymentMethod=Card&status=Completed&page=1&pageSize=25`

*Expected results*
1. the response is 200 with `{ items, page, pageSize, totalCount }` containing only October card-paid completed sales sorted by completion time descending

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-105: Invoice number, medicine, patient, cashier filters

| Field | Value |
|---|---|
| Story | [US-06-18](../stories/EPIC-06-SALES-POS/US-06-18-sales-history-and-detail.md) — Sales History Search and Sale Detail |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-06-18-AC2 |
| Requirements | FR-06-041, FR-06-042 |

**Story preconditions**
- Completed sales exist; user holds `sales.sales.read`.

**US-06-18-AC2 — Search by invoice number, medicine, patient, cashier**

*Preconditions / test data*
1. sale `CAI01-INV-2026-000123` contains Medicine A, patient P, cashier C

*Steps*
1. the user filters by `invoiceNumber`, `medicineId`, `patientId`, or `cashierUserId`

*Expected results*
1. each result set includes the sale

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-106: Cost fields omitted without `sales.sales.read-cost`

| Field | Value |
|---|---|
| Story | [US-06-18](../stories/EPIC-06-SALES-POS/US-06-18-sales-history-and-detail.md) — Sales History Search and Sale Detail |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | MVP |
| Covers | US-06-18-AC3 |
| Requirements | FR-06-041, FR-06-042 |

**Story preconditions**
- Completed sales exist; user holds `sales.sales.read`.

**US-06-18-AC3 — Detail with allocations; costs hidden without permission**

*Preconditions / test data*
1. the §7.2 sale

*Steps*
1. a cashier (no `sales.sales.read-cost`) and an accountant (with it) open the detail

*Expected results*
1. both see lines, allocations (batch number, expiry, quantity), payments, change, returns, voids, prints
2. only the accountant's response contains `unitCost`, `cogs`, and `grossProfit` fields (omitted, not null, for the cashier)

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-107: Range and page size validation

| Field | Value |
|---|---|
| Story | [US-06-18](../stories/EPIC-06-SALES-POS/US-06-18-sales-history-and-detail.md) — Sales History Search and Sale Detail |
| Type / Execution | Unit / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-06-18-AC4 |
| Requirements | FR-06-041, FR-06-042 |

**Story preconditions**
- Completed sales exist; user holds `sales.sales.read`.

**US-06-18-AC4 — Invalid range**

*Preconditions / test data*
1. a search

*Steps*
1. the date range exceeds 366 days or `pageSize` is 101

*Expected results*
1. the response is 400 `COMMON.VALIDATION_FAILED`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-108: 403 permission, CS-07 cross-branch 403, CS-08 cross-org 404

| Field | Value |
|---|---|
| Story | [US-06-18](../stories/EPIC-06-SALES-POS/US-06-18-sales-history-and-detail.md) — Sales History Search and Sale Detail |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | MVP |
| Covers | US-06-18-AC5 |
| Critical scenario | CS-07, CS-08 |
| Requirements | FR-06-041, FR-06-042 |

**Story preconditions**
- Completed sales exist; user holds `sales.sales.read`.

**US-06-18-AC5 — Permission and isolation**

*Preconditions / test data*
1. a user without `sales.sales.read`, a user unassigned to branch A, and a sale id belonging to another organization

*Steps*
1. they search or open detail

*Expected results*
1. 403 `COMMON.FORBIDDEN`, 403 `COMMON.FORBIDDEN` (CS-07), and 404 `COMMON.NOT_FOUND` (CS-08) respectively

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-109: Search p95 ≤ 500 ms over 500,000 sales / 1 year

| Field | Value |
|---|---|
| Story | [US-06-18](../stories/EPIC-06-SALES-POS/US-06-18-sales-history-and-detail.md) — Sales History Search and Sale Detail |
| Type / Execution | Performance / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-06-18-AC1 |
| Requirements | FR-06-041, FR-06-042 |

**Story preconditions**
- Completed sales exist; user holds `sales.sales.read`.

**US-06-18-AC1 — Search with filters**

*Preconditions / test data*
1. 1,000 sales in branch A over 3 months

*Steps*
1. the user calls `GET /branches/{A}/sales?from=2026-10-01&to=2026-10-31&paymentMethod=Card&status=Completed&page=1&pageSize=25`

*Expected results*
1. the response is 200 with `{ items, page, pageSize, totalCount }` containing only October card-paid completed sales sorted by completion time descending

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-06-19: Line COGS and Gross Profit

### TS-06-110: COGS and profit for §7.2 line 1

| Field | Value |
|---|---|
| Story | [US-06-19](../stories/EPIC-06-SALES-POS/US-06-19-line-cogs-and-gross-profit.md) — Line COGS and Gross Profit |
| Type / Execution | Unit / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-06-19-AC1 |
| Requirements | FR-06-043 |

**Story preconditions**
- Sale allocations store `UnitCost` snapshots.

**US-06-19-AC1 — COGS from allocations**

*Preconditions / test data*
1. line 1 of §7.2 (net 147.93) allocated B1 = 12 × 6.2500 and B2 = 8 × 6.5000

*Steps*
1. the sale cost view is requested

*Expected results*
1. line COGS = 75.00 + 52.00 = 127.00 and gross profit = 20.93
2. sale COGS and profit are sums over lines

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-111: Batch cost change does not alter historical COGS

| Field | Value |
|---|---|
| Story | [US-06-19](../stories/EPIC-06-SALES-POS/US-06-19-line-cogs-and-gross-profit.md) — Line COGS and Gross Profit |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-06-19-AC2 |
| Requirements | FR-06-043 |

**Story preconditions**
- Sale allocations store `UnitCost` snapshots.

**US-06-19-AC2 — Historical cost stability**

*Preconditions / test data*
1. batch B1's unit cost is later corrected from 6.2500 to 6.4000 (SPEC-04)

*Steps*
1. the historical sale is viewed

*Expected results*
1. line COGS remains 127.00

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-112: Restocked vs discarded effect on COGS

| Field | Value |
|---|---|
| Story | [US-06-19](../stories/EPIC-06-SALES-POS/US-06-19-line-cogs-and-gross-profit.md) — Line COGS and Gross Profit |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-06-19-AC3 |
| Requirements | FR-06-043 |

**Story preconditions**
- Sale allocations store `UnitCost` snapshots.

**US-06-19-AC3 — Returns adjust COGS by disposition**

*Preconditions / test data*
1. 10 units of line 1 were returned from allocation B1 and `Restocked`, and 5 units from allocation B2 were returned and `Discarded`

*Steps*
1. the read contract for SPEC-09 is queried

*Expected results*
1. net COGS reverses only the restocked units at their allocation cost (10 × 6.2500 = 62.50, net line COGS 64.50) and the 5 discarded units (5 × 6.5000 = 32.50) are reported as return loss

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-113: Cost fields hidden / 403 without permission

| Field | Value |
|---|---|
| Story | [US-06-19](../stories/EPIC-06-SALES-POS/US-06-19-line-cogs-and-gross-profit.md) — Line COGS and Gross Profit |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | MVP |
| Covers | US-06-19-AC4 |
| Requirements | FR-06-043 |

**Story preconditions**
- Sale allocations store `UnitCost` snapshots.

**US-06-19-AC4 — Permission denied**

*Preconditions / test data*
1. a cashier without `sales.sales.read-cost`

*Steps*
1. the cashier requests `GET /sales/{id}` and `GET /sales/{id}?include=costs`

*Expected results*
1. the first returns the detail with cost fields omitted
2. the second returns 403 `COMMON.FORBIDDEN`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-06-20: Void a Sale

### TS-06-114: Full void reversal: movements, payments, cash, dispensing, audit

| Field | Value |
|---|---|
| Story | [US-06-20](../stories/EPIC-06-SALES-POS/US-06-20-void-sale.md) — Void a Sale |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-06-20-AC1 |
| Requirements | FR-06-044, FR-06-045 |

**Story preconditions**
- Sale X is `Completed` in branch A on today's business date; X's cash session S is `Open`; user holds `sales.sales.void`.

**US-06-20-AC1 — Successful void**

*Preconditions / test data*
1. sale X (the §7.2 sale) with allocations B1 12, B2 8 for line 1, cash applied 161.59 and card 100.00

*Steps*
1. the manager posts `POST /branches/{A}/sales/{X}/void` with reason "Wrong customer cart scanned" and an Idempotency-Key

*Expected results*
1. in one transaction: X status `Voided` with void metadata
2. `SaleVoid` movements return 12 to B1 and 8 to B2 (and all other allocations) at original unit costs via `ReturnToBatch`
3. reversal payments −161.59 (Cash) and −100.00 (Card)
4. a `SaleVoid` cash movement −161.59 in S
5. dispensing records reversed via SPEC-08
6. audit entry written
7. the invoice number is retained and never reused

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-115: Different business date rejected

| Field | Value |
|---|---|
| Story | [US-06-20](../stories/EPIC-06-SALES-POS/US-06-20-void-sale.md) — Void a Sale |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-06-20-AC2 |
| Requirements | FR-06-044, FR-06-045 |

**Story preconditions**
- Sale X is `Completed` in branch A on today's business date; X's cash session S is `Open`; user holds `sales.sales.void`.

**US-06-20-AC2 — Different business date**

*Preconditions / test data*
1. X was completed yesterday

*Steps*
1. void is requested

*Expected results*
1. the response is 409 `SALES.SALE_NOT_VOIDABLE` and nothing changes

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-116: Closed session / existing return rejected

| Field | Value |
|---|---|
| Story | [US-06-20](../stories/EPIC-06-SALES-POS/US-06-20-void-sale.md) — Void a Sale |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-06-20-AC3 |
| Requirements | FR-06-044, FR-06-045 |

**Story preconditions**
- Sale X is `Completed` in branch A on today's business date; X's cash session S is `Open`; user holds `sales.sales.void`.

**US-06-20-AC3 — Session closed or returns exist**

*Preconditions / test data*
1. X's session S is `Closed`, or X has a `Completed` or `PendingApproval` return

*Steps*
1. void is requested

*Expected results*
1. the response is 409 `SALES.SALE_NOT_VOIDABLE`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-117: Void vs return race → one wins

| Field | Value |
|---|---|
| Story | [US-06-20](../stories/EPIC-06-SALES-POS/US-06-20-void-sale.md) — Void a Sale |
| Type / Execution | Concurrency / Automated |
| Priority | T1 (story P1) |
| Release | MVP |
| Covers | US-06-20-AC4 |
| Requirements | FR-06-044, FR-06-045 |

**Story preconditions**
- Sale X is `Completed` in branch A on today's business date; X's cash session S is `Open`; user holds `sales.sales.void`.

**US-06-20-AC4 — Concurrent void and return**

*Preconditions / test data*
1. a void and a return on X are submitted simultaneously

*Steps*
1. both execute

*Expected results*
1. exactly one succeeds
2. the other returns 409 (`SALES.SALE_NOT_VOIDABLE` or `SALES.SALE_NOT_RETURNABLE`)
3. stock and money reflect only the successful operation

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-118: CS-11: idempotent void replay

| Field | Value |
|---|---|
| Story | [US-06-20](../stories/EPIC-06-SALES-POS/US-06-20-void-sale.md) — Void a Sale |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P1) |
| Release | MVP |
| Covers | US-06-20-AC5 |
| Critical scenario | CS-11 |
| Requirements | FR-06-044, FR-06-045 |

**Story preconditions**
- Sale X is `Completed` in branch A on today's business date; X's cash session S is `Open`; user holds `sales.sales.void`.

**US-06-20-AC5 — Idempotent void (CS-11)**

*Preconditions / test data*
1. a void with key K committed

*Steps*
1. the identical request with K is retried

*Expected results*
1. the stored response is replayed and no second set of reversals exists
2. a void with a new key returns 409 `SALES.SALE_NOT_VOIDABLE`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-119: 403 without `sales.sales.void`; reason validation

| Field | Value |
|---|---|
| Story | [US-06-20](../stories/EPIC-06-SALES-POS/US-06-20-void-sale.md) — Void a Sale |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | MVP |
| Covers | US-06-20-AC6 |
| Requirements | FR-06-044, FR-06-045 |

**Story preconditions**
- Sale X is `Completed` in branch A on today's business date; X's cash session S is `Open`; user holds `sales.sales.void`.

**US-06-20-AC6 — Missing reason and permission**

*Preconditions / test data*
1. a cashier without `sales.sales.void`, and a manager sending a 5-character reason

*Steps*
1. each requests void

*Expected results*
1. the cashier receives 403 `COMMON.FORBIDDEN`
2. the manager 400 `COMMON.VALIDATION_FAILED`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-120: CS-07 cross-branch 403; CS-08 cross-org 404

| Field | Value |
|---|---|
| Story | [US-06-20](../stories/EPIC-06-SALES-POS/US-06-20-void-sale.md) — Void a Sale |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | MVP |
| Covers | US-06-20-AC7 |
| Critical scenario | CS-07, CS-08 |
| Requirements | FR-06-044, FR-06-045 |

**Story preconditions**
- Sale X is `Completed` in branch A on today's business date; X's cash session S is `Open`; user holds `sales.sales.void`.

**US-06-20-AC7 — Cross-branch and cross-organization**

*Preconditions / test data*
1. a manager assigned only to branch B, and a sale id from another organization

*Steps*
1. they void X in branch A / the foreign sale

*Expected results*
1. 403 `COMMON.FORBIDDEN` (CS-07) and 404 `COMMON.NOT_FOUND` (CS-08)

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-121: CS-10: failure after `SaleVoid` movements → full rollback

| Field | Value |
|---|---|
| Story | [US-06-20](../stories/EPIC-06-SALES-POS/US-06-20-void-sale.md) — Void a Sale |
| Type / Execution | Fault injection / Automated |
| Priority | T1 (story P1) |
| Release | MVP |
| Covers | US-06-20-AC1 |
| Critical scenario | CS-10 |
| Requirements | FR-06-044, FR-06-045 |

**Story preconditions**
- Sale X is `Completed` in branch A on today's business date; X's cash session S is `Open`; user holds `sales.sales.void`.

**US-06-20-AC1 — Successful void**

*Preconditions / test data*
1. sale X (the §7.2 sale) with allocations B1 12, B2 8 for line 1, cash applied 161.59 and card 100.00

*Steps*
1. the manager posts `POST /branches/{A}/sales/{X}/void` with reason "Wrong customer cart scanned" and an Idempotency-Key

*Expected results*
1. in one transaction: X status `Voided` with void metadata
2. `SaleVoid` movements return 12 to B1 and 8 to B2 (and all other allocations) at original unit costs via `ReturnToBatch`
3. reversal payments −161.59 (Cash) and −100.00 (Card)
4. a `SaleVoid` cash movement −161.59 in S
5. dispensing records reversed via SPEC-08
6. audit entry written
7. the invoice number is retained and never reused

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-06-21: Create a Sales Return with Refund

### TS-06-122: Returnable preview per allocation and default refund allocation

| Field | Value |
|---|---|
| Story | [US-06-21](../stories/EPIC-06-SALES-POS/US-06-21-create-sales-return.md) — Create a Sales Return with Refund |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-21-AC1 |
| Requirements | FR-06-046, FR-06-047, FR-06-048, FR-06-050, FR-06-053 |

**Story preconditions**
- Sale X is `Completed` or `PartiallyReturned` in branch A; the user holds `sales.returns.create` and owns an `Open` session in branch A; the refund total is ≤ `ReturnApprovalThresholdAmount` and within `ReturnWindowDays` (otherwise see US-06-22).

**US-06-21-AC1 — Returnable preview**

*Preconditions / test data*
1. sale X (§7.2) with line 1 = 2 packs (20 base units) total 147.93, paid Card 100.00 + Cash 161.59

*Steps*
1. the user calls `GET /branches/{A}/sales/{X}/returnable`

*Expected results*
1. the response lists per line and per allocation the remaining returnable base units (line 1: B1 12, B2 8), the refund preview for each, and the default refund allocation (cash first)

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-123: CS-05: partial return then remaining; refunds 73.97 + 73.96; statuses PartiallyReturned → Returned; PendingInspection with no stock movement

| Field | Value |
|---|---|
| Story | [US-06-21](../stories/EPIC-06-SALES-POS/US-06-21-create-sales-return.md) — Create a Sales Return with Refund |
| Type / Execution | Integration / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-06-21-AC2 |
| Critical scenario | CS-05 |
| Requirements | FR-06-046, FR-06-047, FR-06-048, FR-06-050, FR-06-053 |

**Story preconditions**
- Sale X is `Completed` or `PartiallyReturned` in branch A; the user holds `sales.returns.create` and owns an `Open` session in branch A; the refund total is ≤ `ReturnApprovalThresholdAmount` and within `ReturnWindowDays` (otherwise see US-06-22).

**US-06-21-AC2 — Partial return then remaining (CS-05)**

*Preconditions / test data*
1. sale X

*Steps*
1. the user returns 10 base units of line 1 (from allocation B2 8 and B1 2 per latest-expiry-first default) with reason "Customer changed mind", then later returns the remaining 10 units

*Expected results*
1. the first return is `Completed` with number `CAI01-RET-2026-000045`, refund 73.97 in Cash, lines with disposition `PendingInspection` and no stock movement, a `RefundCash` cash movement −73.97, audit entry, and X becomes `PartiallyReturned`
2. the second refund is 73.96 (remainder rule) and after all lines are fully returned X becomes `Returned`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-124: CS-05: over-return rejected

| Field | Value |
|---|---|
| Story | [US-06-21](../stories/EPIC-06-SALES-POS/US-06-21-create-sales-return.md) — Create a Sales Return with Refund |
| Type / Execution | Integration / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-06-21-AC3 |
| Critical scenario | CS-05 |
| Requirements | FR-06-046, FR-06-047, FR-06-048, FR-06-050, FR-06-053 |

**Story preconditions**
- Sale X is `Completed` or `PartiallyReturned` in branch A; the user holds `sales.returns.create` and owns an `Open` session in branch A; the refund total is ≤ `ReturnApprovalThresholdAmount` and within `ReturnWindowDays` (otherwise see US-06-22).

**US-06-21-AC3 — Over-return rejected (CS-05)**

*Preconditions / test data*
1. 10 of 20 units of line 1 have been returned

*Steps*
1. a return of 11 units of line 1 is submitted

*Expected results*
1. the response is 422 `SALES.RETURN_QUANTITY_EXCEEDED` and nothing is persisted

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-125: CS-05: concurrent returns serialized, no over-return

| Field | Value |
|---|---|
| Story | [US-06-21](../stories/EPIC-06-SALES-POS/US-06-21-create-sales-return.md) — Create a Sales Return with Refund |
| Type / Execution | Concurrency / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-06-21-AC4 |
| Critical scenario | CS-05 |
| Requirements | FR-06-046, FR-06-047, FR-06-048, FR-06-050, FR-06-053 |

**Story preconditions**
- Sale X is `Completed` or `PartiallyReturned` in branch A; the user holds `sales.returns.create` and owns an `Open` session in branch A; the refund total is ≤ `ReturnApprovalThresholdAmount` and within `ReturnWindowDays` (otherwise see US-06-22).

**US-06-21-AC4 — Concurrent returns cannot over-return (CS-05)**

*Preconditions / test data*
1. 20 units remain returnable on line 1

*Steps*
1. two returns of 15 units each are submitted concurrently by two users

*Expected results*
1. exactly one completes
2. the other returns 422 `SALES.RETURN_QUANTITY_EXCEEDED` (sale row lock serializes them)

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-126: Window expired, voided sale, no session

| Field | Value |
|---|---|
| Story | [US-06-21](../stories/EPIC-06-SALES-POS/US-06-21-create-sales-return.md) — Create a Sales Return with Refund |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-21-AC5 |
| Requirements | FR-06-046, FR-06-047, FR-06-048, FR-06-050, FR-06-053 |

**Story preconditions**
- Sale X is `Completed` or `PartiallyReturned` in branch A; the user holds `sales.returns.create` and owns an `Open` session in branch A; the refund total is ≤ `ReturnApprovalThresholdAmount` and within `ReturnWindowDays` (otherwise see US-06-22).

**US-06-21-AC5 — Window, voided sale, and sessions**

*Preconditions / test data*
1. a sale 15 business days old with `ReturnWindowDays` 14, a `Voided` sale, and a user without an open session

*Steps*
1. returns are submitted without approval

*Expected results*
1. the responses are 422 `SALES.RETURN_WINDOW_EXPIRED`, 409 `SALES.SALE_NOT_RETURNABLE`, and 409 `SALES.CASH_SESSION_NOT_OPEN` respectively

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-127: CS-11: return replay single effect

| Field | Value |
|---|---|
| Story | [US-06-21](../stories/EPIC-06-SALES-POS/US-06-21-create-sales-return.md) — Create a Sales Return with Refund |
| Type / Execution | Integration / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-06-21-AC6 |
| Critical scenario | CS-11 |
| Requirements | FR-06-046, FR-06-047, FR-06-048, FR-06-050, FR-06-053 |

**Story preconditions**
- Sale X is `Completed` or `PartiallyReturned` in branch A; the user holds `sales.returns.create` and owns an `Open` session in branch A; the refund total is ≤ `ReturnApprovalThresholdAmount` and within `ReturnWindowDays` (otherwise see US-06-22).

**US-06-21-AC6 — Idempotent return (CS-11)**

*Preconditions / test data*
1. a completed return created with Idempotency-Key K

*Steps*
1. the identical request is retried with K

*Expected results*
1. the stored response is replayed and no second return, refund, or cash movement exists

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-128: 403 permission; CS-07 cross-branch 403; CS-08 cross-org 404

| Field | Value |
|---|---|
| Story | [US-06-21](../stories/EPIC-06-SALES-POS/US-06-21-create-sales-return.md) — Create a Sales Return with Refund |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-06-21-AC7 |
| Critical scenario | CS-07, CS-08 |
| Requirements | FR-06-046, FR-06-047, FR-06-048, FR-06-050, FR-06-053 |

**Story preconditions**
- Sale X is `Completed` or `PartiallyReturned` in branch A; the user holds `sales.returns.create` and owns an `Open` session in branch A; the refund total is ≤ `ReturnApprovalThresholdAmount` and within `ReturnWindowDays` (otherwise see US-06-22).

**US-06-21-AC7 — Permission, cross-branch, cross-organization**

*Preconditions / test data*
1. a user without `sales.returns.create`, a user assigned only to branch B returning sale X of branch A, and a sale id of another organization

*Steps*
1. each submits a return

*Expected results*
1. 403 `COMMON.FORBIDDEN`, 403 `COMMON.FORBIDDEN` (CS-07), and 404 `COMMON.NOT_FOUND` (CS-08)

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-129: CS-10: failure after refund insert → no return, refund, or cash movement remains

| Field | Value |
|---|---|
| Story | [US-06-21](../stories/EPIC-06-SALES-POS/US-06-21-create-sales-return.md) — Create a Sales Return with Refund |
| Type / Execution | Fault injection / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-06-21-AC2 |
| Critical scenario | CS-10, CS-05 |
| Requirements | FR-06-046, FR-06-047, FR-06-048, FR-06-050, FR-06-053 |

**Story preconditions**
- Sale X is `Completed` or `PartiallyReturned` in branch A; the user holds `sales.returns.create` and owns an `Open` session in branch A; the refund total is ≤ `ReturnApprovalThresholdAmount` and within `ReturnWindowDays` (otherwise see US-06-22).

**US-06-21-AC2 — Partial return then remaining (CS-05)**

*Preconditions / test data*
1. sale X

*Steps*
1. the user returns 10 base units of line 1 (from allocation B2 8 and B1 2 per latest-expiry-first default) with reason "Customer changed mind", then later returns the remaining 10 units

*Expected results*
1. the first return is `Completed` with number `CAI01-RET-2026-000045`, refund 73.97 in Cash, lines with disposition `PendingInspection` and no stock movement, a `RefundCash` cash movement −73.97, audit entry, and X becomes `PartiallyReturned`
2. the second refund is 73.96 (remainder rule) and after all lines are fully returned X becomes `Returned`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-06-22: Return Approval Above Threshold or Outside Window

### TS-06-130: Inline approval with `ReturnApproval` override

| Field | Value |
|---|---|
| Story | [US-06-22](../stories/EPIC-06-SALES-POS/US-06-22-return-approval.md) — Return Approval Above Threshold or Outside Window |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-06-22-AC1 |
| Requirements | FR-06-047, FR-06-049 |

**Story preconditions**
- `ReturnApprovalThresholdAmount` = 1,000.00 (branch); approver holds `sales.returns.approve`.

**US-06-22-AC1 — Inline approval via manager override**

*Preconditions / test data*
1. a return with refund total 1,200.00 created by cashier C

*Steps*
1. manager M re-authenticates at C's POS (override scope `ReturnApproval`) and C submits the return with the override id

*Expected results*
1. the return is `Completed` immediately with `ApprovedBy` M, refund from C's session, override consumed, audit written

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-131: Deferred PendingApproval without effects; reservation of quantities

| Field | Value |
|---|---|
| Story | [US-06-22](../stories/EPIC-06-SALES-POS/US-06-22-return-approval.md) — Return Approval Above Threshold or Outside Window |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-06-22-AC2 |
| Requirements | FR-06-047, FR-06-049 |

**Story preconditions**
- `ReturnApprovalThresholdAmount` = 1,000.00 (branch); approver holds `sales.returns.approve`.

**US-06-22-AC2 — Deferred approval**

*Preconditions / test data*
1. the same return submitted without an override

*Steps*
1. it is saved

*Expected results*
1. it is `PendingApproval` with no return number, no refund, no cash movement, and its quantities reserved
2. managers are notified

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-132: Approve completes with number and refund from approver session; CS-11 replay single effect

| Field | Value |
|---|---|
| Story | [US-06-22](../stories/EPIC-06-SALES-POS/US-06-22-return-approval.md) — Return Approval Above Threshold or Outside Window |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P1) |
| Release | MVP |
| Covers | US-06-22-AC3 |
| Critical scenario | CS-11 |
| Requirements | FR-06-047, FR-06-049 |

**Story preconditions**
- `ReturnApprovalThresholdAmount` = 1,000.00 (branch); approver holds `sales.returns.approve`.

**US-06-22-AC3 — Approve completes the return**

*Preconditions / test data*
1. a `PendingApproval` return R by C and manager M with an open session in the branch

*Steps*
1. M posts `POST /sales-returns/{R}/approve` with refund details and an Idempotency-Key

*Expected results*
1. R becomes `Completed`, receives the next return number, the refund and `RefundCash` movement are recorded in M's session, and audit records approver M

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-133: Reject releases quantities; approve vs reject race

| Field | Value |
|---|---|
| Story | [US-06-22](../stories/EPIC-06-SALES-POS/US-06-22-return-approval.md) — Return Approval Above Threshold or Outside Window |
| Type / Execution | Concurrency / Automated |
| Priority | T1 (story P1) |
| Release | MVP |
| Covers | US-06-22-AC4 |
| Requirements | FR-06-047, FR-06-049 |

**Story preconditions**
- `ReturnApprovalThresholdAmount` = 1,000.00 (branch); approver holds `sales.returns.approve`.

**US-06-22-AC4 — Reject**

*Preconditions / test data*
1. a `PendingApproval` return R

*Steps*
1. M rejects with reason "Medicine opened, not returnable"

*Expected results*
1. R becomes `Rejected`, its reserved quantities are released, and C is notified
2. a later approve on R returns 409 `SALES.RETURN_NOT_PENDING`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-134: Self-approval 403; out-of-window without reason 422

| Field | Value |
|---|---|
| Story | [US-06-22](../stories/EPIC-06-SALES-POS/US-06-22-return-approval.md) — Return Approval Above Threshold or Outside Window |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | MVP |
| Covers | US-06-22-AC5 |
| Requirements | FR-06-047, FR-06-049 |

**Story preconditions**
- `ReturnApprovalThresholdAmount` = 1,000.00 (branch); approver holds `sales.returns.approve`.

**US-06-22-AC5 — Self-approval and out-of-window reason**

*Preconditions / test data*
1. M created return R, and an out-of-window return submitted with an override but no override reason

*Steps*
1. M approves R, and the second return is submitted

*Expected results*
1. the first returns 403 `SALES.SELF_APPROVAL_NOT_ALLOWED`
2. the second 422 `SALES.RETURN_WINDOW_EXPIRED`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-135: Controlled medicine return requires approval

| Field | Value |
|---|---|
| Story | [US-06-22](../stories/EPIC-06-SALES-POS/US-06-22-return-approval.md) — Return Approval Above Threshold or Outside Window |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-06-22-AC6 |
| Requirements | FR-06-047, FR-06-049 |

**Story preconditions**
- `ReturnApprovalThresholdAmount` = 1,000.00 (branch); approver holds `sales.returns.approve`.

**US-06-22-AC6 — Controlled medicine always needs approval**

*Preconditions / test data*
1. a return of a controlled medicine with refund 50.00

*Steps*
1. it is submitted without an override

*Expected results*
1. it is saved as `PendingApproval`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-136: 403 permission; CS-07 cross-branch 403; CS-08 cross-org 404

| Field | Value |
|---|---|
| Story | [US-06-22](../stories/EPIC-06-SALES-POS/US-06-22-return-approval.md) — Return Approval Above Threshold or Outside Window |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | MVP |
| Covers | US-06-22-AC7 |
| Critical scenario | CS-07, CS-08 |
| Requirements | FR-06-047, FR-06-049 |

**Story preconditions**
- `ReturnApprovalThresholdAmount` = 1,000.00 (branch); approver holds `sales.returns.approve`.

**US-06-22-AC7 — Permission and isolation**

*Preconditions / test data*
1. a cashier without `sales.returns.approve`, a manager not assigned to the branch, and a return id of another organization

*Steps*
1. they approve

*Expected results*
1. 403 `COMMON.FORBIDDEN`, 403 `COMMON.FORBIDDEN` (CS-07), and 404 `COMMON.NOT_FOUND` (CS-08)

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-06-23: Refund Method Rules and Cash-in-Drawer Limit

### TS-06-137: Default allocation cash-first then cards, net of prior refunds

| Field | Value |
|---|---|
| Story | [US-06-23](../stories/EPIC-06-SALES-POS/US-06-23-refund-method-rules.md) — Refund Method Rules and Cash-in-Drawer Limit |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-23-AC1 |
| Requirements | FR-06-050, FR-06-051, FR-06-052 |

**Story preconditions**
- US-06-21 return creation; refunding user owns an open session.

**US-06-23-AC1 — Default allocation cash first**

*Preconditions / test data*
1. sale X paid Card 100.00 + Cash 161.59 and a return refund of 200.00

*Steps*
1. the default refund allocation is used

*Expected results*
1. refunds are Cash 161.59 and Card 38.41 (Card requires a terminal refund reference)

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-138: Cash refund above expected cash rejected

| Field | Value |
|---|---|
| Story | [US-06-23](../stories/EPIC-06-SALES-POS/US-06-23-refund-method-rules.md) — Refund Method Rules and Cash-in-Drawer Limit |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-23-AC2 |
| Requirements | FR-06-050, FR-06-051, FR-06-052 |

**Story preconditions**
- US-06-21 return creation; refunding user owns an open session.

**US-06-23-AC2 — Cash refund limited by drawer**

*Preconditions / test data*
1. the refunding session's expected cash is 50.00

*Steps*
1. a cash refund of 73.97 is submitted

*Expected results*
1. the response is 422 `SALES.REFUND_EXCEEDS_CASH_AVAILABLE` and nothing is persisted

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-139: Card refund without reference rejected

| Field | Value |
|---|---|
| Story | [US-06-23](../stories/EPIC-06-SALES-POS/US-06-23-refund-method-rules.md) — Refund Method Rules and Cash-in-Drawer Limit |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-23-AC3 |
| Requirements | FR-06-050, FR-06-051, FR-06-052 |

**Story preconditions**
- US-06-21 return creation; refunding user owns an open session.

**US-06-23-AC3 — Card refund requires reference**

*Preconditions / test data*
1. a card-paid sale

*Steps*
1. a card refund is submitted without terminal reference

*Expected results*
1. the response is 422 `SALES.CARD_REFERENCE_REQUIRED`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-140: Different method rejected without override, accepted with it

| Field | Value |
|---|---|
| Story | [US-06-23](../stories/EPIC-06-SALES-POS/US-06-23-refund-method-rules.md) — Refund Method Rules and Cash-in-Drawer Limit |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-23-AC4 |
| Requirements | FR-06-050, FR-06-051, FR-06-052 |

**Story preconditions**
- US-06-21 return creation; refunding user owns an open session.

**US-06-23-AC4 — Different method needs override**

*Preconditions / test data*
1. a sale paid entirely by Card 100.00

*Steps*
1. the cashier refunds 60.00 in Cash without an override, and then with a `RefundMethod` override approved by manager M

*Expected results*
1. the first returns 422 `SALES.REFUND_METHOD_NOT_ALLOWED`
2. the second completes with refund Cash 60.00, override consumed, audit recording M

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-141: Concurrent refund and cash out serialize on session lock

| Field | Value |
|---|---|
| Story | [US-06-23](../stories/EPIC-06-SALES-POS/US-06-23-refund-method-rules.md) — Refund Method Rules and Cash-in-Drawer Limit |
| Type / Execution | Concurrency / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-06-23-AC5 |
| Requirements | FR-06-050, FR-06-051, FR-06-052 |

**Story preconditions**
- US-06-21 return creation; refunding user owns an open session.

**US-06-23-AC5 — Concurrent cash outflows**

*Preconditions / test data*
1. the session's expected cash is 100.00

*Steps*
1. a cash refund of 80.00 and a cash out of 50.00 run concurrently on the same session

*Expected results*
1. exactly one succeeds and the other is rejected (`SALES.REFUND_EXCEEDS_CASH_AVAILABLE` or `SALES.CASH_OUT_EXCEEDS_AVAILABLE`)
2. expected cash never becomes negative

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-142: Refund to another user's session → 403

| Field | Value |
|---|---|
| Story | [US-06-23](../stories/EPIC-06-SALES-POS/US-06-23-refund-method-rules.md) — Refund Method Rules and Cash-in-Drawer Limit |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-06-23-AC6 |
| Requirements | FR-06-050, FR-06-051, FR-06-052 |

**Story preconditions**
- US-06-21 return creation; refunding user owns an open session.

**US-06-23-AC6 — Refund in another user's session denied**

*Preconditions / test data*
1. session T belongs to cashier D

*Steps*
1. cashier C submits a return refund specifying T

*Expected results*
1. the response is 403 `SALES.CASH_SESSION_NOT_OWNED`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-06-24: Return Disposition Inspection (Restock or Discard)

### TS-06-143: Queue fields and > 7-day highlighting

| Field | Value |
|---|---|
| Story | [US-06-24](../stories/EPIC-06-SALES-POS/US-06-24-return-disposition-inspection.md) — Return Disposition Inspection (Restock or Discard) |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-24-AC1 |
| Requirements | FR-06-053, FR-06-054, FR-06-055 |

**Story preconditions**
- Return lines with disposition `PendingInspection` exist; user holds `sales.returns.inspect`.

**US-06-24-AC1 — Inspection queue**

*Preconditions / test data*
1. 3 pending return lines in branch A, one 9 days old

*Steps*
1. the pharmacist calls `GET /branches/{A}/sales-returns/inspection-queue`

*Expected results*
1. each line shows return number, return date, medicine, batch number, expiry, quantity, and age
2. the 9-day-old line is highlighted (> 7 days)

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-144: Restock posts `SalesReturn` movement into original batch at original cost

| Field | Value |
|---|---|
| Story | [US-06-24](../stories/EPIC-06-SALES-POS/US-06-24-return-disposition-inspection.md) — Return Disposition Inspection (Restock or Discard) |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-24-AC2 |
| Requirements | FR-06-053, FR-06-054, FR-06-055 |

**Story preconditions**
- Return lines with disposition `PendingInspection` exist; user holds `sales.returns.inspect`.

**US-06-24-AC2 — Restock into original batch**

*Preconditions / test data*
1. a pending line of 10 base units from allocation batch B1 (not expired, `Active`, unit cost 6.2500)

*Steps*
1. the pharmacist sets disposition `Restocked` with an Idempotency-Key

*Expected results*
1. a `SalesReturn` stock movement +10 into B1 at unit cost 6.2500 is posted via `ReturnToBatch`, B1 OnHand increases by 10, the line records disposition user/time and movement id, and an audit entry is written

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-145: CS-02 related: restock blocked into expired / do-not-sell / quarantined batch; discard allowed

| Field | Value |
|---|---|
| Story | [US-06-24](../stories/EPIC-06-SALES-POS/US-06-24-return-disposition-inspection.md) — Return Disposition Inspection (Restock or Discard) |
| Type / Execution | Integration / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-06-24-AC3 |
| Critical scenario | CS-02 |
| Requirements | FR-06-053, FR-06-054, FR-06-055 |

**Story preconditions**
- Return lines with disposition `PendingInspection` exist; user holds `sales.returns.inspect`.

**US-06-24-AC3 — Restock blocked for ineligible batch**

*Preconditions / test data*
1. the original batch has expired, is within the do-not-sell window, or is `Quarantined`

*Steps*
1. `Restocked` is requested

*Expected results*
1. the response is 422 `SALES.RESTOCK_NOT_ALLOWED`
2. `Discarded` is accepted (no stock movement
3. return loss recorded)

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-146: Final disposition; concurrent attempts → one succeeds

| Field | Value |
|---|---|
| Story | [US-06-24](../stories/EPIC-06-SALES-POS/US-06-24-return-disposition-inspection.md) — Return Disposition Inspection (Restock or Discard) |
| Type / Execution | Concurrency / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-06-24-AC4 |
| Requirements | FR-06-053, FR-06-054, FR-06-055 |

**Story preconditions**
- Return lines with disposition `PendingInspection` exist; user holds `sales.returns.inspect`.

**US-06-24-AC4 — Disposition is final**

*Preconditions / test data*
1. a line already `Discarded`

*Steps*
1. any disposition is requested again

*Expected results*
1. the response is 409 `SALES.DISPOSITION_ALREADY_SET`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-147: Direct restock setting on/off and permission

| Field | Value |
|---|---|
| Story | [US-06-24](../stories/EPIC-06-SALES-POS/US-06-24-return-disposition-inspection.md) — Return Disposition Inspection (Restock or Discard) |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-24-AC5 |
| Requirements | FR-06-053, FR-06-054, FR-06-055 |

**Story preconditions**
- Return lines with disposition `PendingInspection` exist; user holds `sales.returns.inspect`.

**US-06-24-AC5 — Direct restock at return time**

*Preconditions / test data*
1. `AllowDirectRestockOnReturn` = true and a pharmacist holding `sales.returns.inspect`

*Steps*
1. the pharmacist creates a return with line disposition `Restocked`

*Expected results*
1. the `SalesReturn` movement is posted in the return transaction
2. with the setting false the request returns 400 `COMMON.VALIDATION_FAILED` and a cashier without `sales.returns.inspect` gets 403 `COMMON.FORBIDDEN`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-148: 403 permission; CS-07 cross-branch 403; CS-08 cross-org 404

| Field | Value |
|---|---|
| Story | [US-06-24](../stories/EPIC-06-SALES-POS/US-06-24-return-disposition-inspection.md) — Return Disposition Inspection (Restock or Discard) |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-06-24-AC6 |
| Critical scenario | CS-07, CS-08 |
| Requirements | FR-06-053, FR-06-054, FR-06-055 |

**Story preconditions**
- Return lines with disposition `PendingInspection` exist; user holds `sales.returns.inspect`.

**US-06-24-AC6 — Permission and isolation**

*Preconditions / test data*
1. a cashier without `sales.returns.inspect`, a pharmacist not assigned to branch A, and a return line of another organization

*Steps*
1. they call the queue or set a disposition

*Expected results*
1. 403 `COMMON.FORBIDDEN`, 403 `COMMON.FORBIDDEN` (CS-07), 404 `COMMON.NOT_FOUND` (CS-08)

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-06-25: Link a Patient to a Sale with Allergy Decision Support

### TS-06-149: Search by phone, link, receipt shows name only

| Field | Value |
|---|---|
| Story | [US-06-25](../stories/EPIC-06-SALES-POS/US-06-25-link-patient-and-allergy-check.md) — Link a Patient to a Sale with Allergy Decision Support |
| Type / Execution | E2E / Manual |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-06-25-AC1 |
| Requirements | FR-06-056, FR-06-057 |

**Story preconditions**
- Patient profiles exist (SPEC-07); user holds `patients.profiles.read`; allergy check needs `patients.medical.read`.

**US-06-25-AC1 — Search and link patient**

*Preconditions / test data*
1. patient P with mobile 01001234567

*Steps*
1. the cashier searches "01001234567" in the POS patient panel and selects P, then completes the sale

*Expected results*
1. the sale stores `PatientId` P and the receipt shows P's name only

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-150: Quick-create with and without permission

| Field | Value |
|---|---|
| Story | [US-06-25](../stories/EPIC-06-SALES-POS/US-06-25-link-patient-and-allergy-check.md) — Link a Patient to a Sale with Allergy Decision Support |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-06-25-AC2 |
| Requirements | FR-06-056, FR-06-057 |

**Story preconditions**
- Patient profiles exist (SPEC-07); user holds `patients.profiles.read`; allergy check needs `patients.medical.read`.

**US-06-25-AC2 — Quick-create patient**

*Preconditions / test data*
1. no patient matches, and the user holds `patients.profiles.manage`

*Steps*
1. the user quick-creates "Mona Adel", 01112223334

*Expected results*
1. the patient is created via SPEC-07 and linked to the cart
2. a user without `patients.profiles.manage` does not see the quick-create action and the SPEC-07 endpoint returns 403 `COMMON.FORBIDDEN`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-151: Allergy match, acknowledgement stored, access log written, sale not blocked

| Field | Value |
|---|---|
| Story | [US-06-25](../stories/EPIC-06-SALES-POS/US-06-25-link-patient-and-allergy-check.md) — Link a Patient to a Sale with Allergy Decision Support |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-06-25-AC3 |
| Requirements | FR-06-056, FR-06-057 |

**Story preconditions**
- Patient profiles exist (SPEC-07); user holds `patients.profiles.read`; allergy check needs `patients.medical.read`.

**US-06-25-AC3 — Allergy warning with acknowledgement**

*Preconditions / test data*
1. P has a recorded allergy to "Amoxicillin" and the cart contains a medicine with active ingredient Amoxicillin

*Steps*
1. a pharmacist (with `patients.medical.read`) adds it

*Expected results*
1. `POST /pos/allergy-check` returns the match, the POS shows a warning that must be acknowledged, the line stores `AllergyWarningAcknowledgedBy`, the read is access-logged, and the sale is not blocked

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-152: Allergy check 403 without `patients.medical.read`

| Field | Value |
|---|---|
| Story | [US-06-25](../stories/EPIC-06-SALES-POS/US-06-25-link-patient-and-allergy-check.md) — Link a Patient to a Sale with Allergy Decision Support |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | MVP |
| Covers | US-06-25-AC4 |
| Requirements | FR-06-056, FR-06-057 |

**Story preconditions**
- Patient profiles exist (SPEC-07); user holds `patients.profiles.read`; allergy check needs `patients.medical.read`.

**US-06-25-AC4 — No medical read permission**

*Preconditions / test data*
1. a cashier without `patients.medical.read`

*Steps*
1. the allergy check endpoint is called

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN`, the POS shows "Allergy check requires a pharmacist", and the sale proceeds

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-153: CS-08: other-organization patient → 404, nothing persisted

| Field | Value |
|---|---|
| Story | [US-06-25](../stories/EPIC-06-SALES-POS/US-06-25-link-patient-and-allergy-check.md) — Link a Patient to a Sale with Allergy Decision Support |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | MVP |
| Covers | US-06-25-AC5 |
| Critical scenario | CS-08 |
| Requirements | FR-06-056, FR-06-057 |

**Story preconditions**
- Patient profiles exist (SPEC-07); user holds `patients.profiles.read`; allergy check needs `patients.medical.read`.

**US-06-25-AC5 — Patient of another organization**

*Preconditions / test data*
1. a `patientId` of another organization in the sale request

*Steps*
1. the sale is submitted

*Expected results*
1. the response is 404 `COMMON.NOT_FOUND` and nothing is persisted (CS-08)

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-06-26: Prescription-Linked Sale with Rx-Only and Controlled Enforcement

### TS-06-154: Load dispensable items into cart with caps

| Field | Value |
|---|---|
| Story | [US-06-26](../stories/EPIC-06-SALES-POS/US-06-26-prescription-dispensing-sale.md) — Prescription-Linked Sale with Rx-Only and Controlled Enforcement |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-26-AC1 |
| Requirements | FR-06-058, FR-06-059, FR-06-060, FR-06-061 |

**Story preconditions**
- Prescription Rx1 for patient P is `Verified` (SPEC-08) with items: Medicine Q (Rx-only) 30 base units, Medicine Z (controlled) 10 base units.
- `EnforcePrescriptionForRxOnly` = true. Pharmacist R holds `prescriptions.dispense` and `prescriptions.controlled.dispense`.

**US-06-26-AC1 — Load prescription into cart**

*Preconditions / test data*
1. patient P is linked in the cart

*Steps*
1. R selects Rx1 and calls `GET /pos/prescriptions/{Rx1}/dispensable`

*Expected results*
1. the cart receives one line per item with quantity = remaining (Q 30, Z 10) capped by sellable quantity, each line linked to its `PrescriptionItemId`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-155: Dispensing records, register entry, prescription status in sale transaction; SPEC-08 failure rolls back (CS-10 pattern)

| Field | Value |
|---|---|
| Story | [US-06-26](../stories/EPIC-06-SALES-POS/US-06-26-prescription-dispensing-sale.md) — Prescription-Linked Sale with Rx-Only and Controlled Enforcement |
| Type / Execution | Integration / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-06-26-AC2 |
| Critical scenario | CS-10 |
| Requirements | FR-06-058, FR-06-059, FR-06-060, FR-06-061 |

**Story preconditions**
- Prescription Rx1 for patient P is `Verified` (SPEC-08) with items: Medicine Q (Rx-only) 30 base units, Medicine Z (controlled) 10 base units.
- `EnforcePrescriptionForRxOnly` = true. Pharmacist R holds `prescriptions.dispense` and `prescriptions.controlled.dispense`.

**US-06-26-AC2 — Dispensing recorded atomically**

*Preconditions / test data*
1. the loaded cart

*Steps*
1. R completes the sale

*Expected results*
1. in the same transaction: one `DispensingRecord` per allocated batch (item, sale line, batch, quantity, pharmacist R, sale), a `ControlledMedicineRegisterEntry` for Z, Rx1 dispensed quantities updated and status `FullyDispensed`
2. a failure in SPEC-08 writes rolls back the whole sale

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-156: CS-13: Rx-only without verified prescription blocked

| Field | Value |
|---|---|
| Story | [US-06-26](../stories/EPIC-06-SALES-POS/US-06-26-prescription-dispensing-sale.md) — Prescription-Linked Sale with Rx-Only and Controlled Enforcement |
| Type / Execution | Integration / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-06-26-AC3 |
| Critical scenario | CS-13 |
| Requirements | FR-06-058, FR-06-059, FR-06-060, FR-06-061 |

**Story preconditions**
- Prescription Rx1 for patient P is `Verified` (SPEC-08) with items: Medicine Q (Rx-only) 30 base units, Medicine Z (controlled) 10 base units.
- `EnforcePrescriptionForRxOnly` = true. Pharmacist R holds `prescriptions.dispense` and `prescriptions.controlled.dispense`.

**US-06-26-AC3 — Rx-only without prescription blocked (CS-13)**

*Preconditions / test data*
1. a cart containing Medicine Q with no prescription link

*Steps*
1. any user completes the sale

*Expected results*
1. the response is 422 `SALES.PRESCRIPTION_REQUIRED`
2. no sale, stock movement, or payment is persisted

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-157: CS-13: controlled without permission / without prescription blocked

| Field | Value |
|---|---|
| Story | [US-06-26](../stories/EPIC-06-SALES-POS/US-06-26-prescription-dispensing-sale.md) — Prescription-Linked Sale with Rx-Only and Controlled Enforcement |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-06-26-AC4 |
| Critical scenario | CS-13 |
| Requirements | FR-06-058, FR-06-059, FR-06-060, FR-06-061 |

**Story preconditions**
- Prescription Rx1 for patient P is `Verified` (SPEC-08) with items: Medicine Q (Rx-only) 30 base units, Medicine Z (controlled) 10 base units.
- `EnforcePrescriptionForRxOnly` = true. Pharmacist R holds `prescriptions.dispense` and `prescriptions.controlled.dispense`.

**US-06-26-AC4 — Controlled without permission or prescription blocked (CS-13)**

*Preconditions / test data*
1. a cart with Medicine Z linked to Rx1, completed by cashier C who lacks `prescriptions.controlled.dispense`
2. and a cart with Z without prescription even with `EnforcePrescriptionForRxOnly` = false

*Steps*
1. each is submitted

*Expected results*
1. both return 403 `SALES.CONTROLLED_DISPENSE_FORBIDDEN` and nothing is persisted

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-158: CS-13: unverified, expired, other-patient prescription rejected

| Field | Value |
|---|---|
| Story | [US-06-26](../stories/EPIC-06-SALES-POS/US-06-26-prescription-dispensing-sale.md) — Prescription-Linked Sale with Rx-Only and Controlled Enforcement |
| Type / Execution | Integration / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-06-26-AC5 |
| Critical scenario | CS-13 |
| Requirements | FR-06-058, FR-06-059, FR-06-060, FR-06-061 |

**Story preconditions**
- Prescription Rx1 for patient P is `Verified` (SPEC-08) with items: Medicine Q (Rx-only) 30 base units, Medicine Z (controlled) 10 base units.
- `EnforcePrescriptionForRxOnly` = true. Pharmacist R holds `prescriptions.dispense` and `prescriptions.controlled.dispense`.

**US-06-26-AC5 — Prescription not dispensable (CS-13)**

*Preconditions / test data*
1. Rx2 is `PendingVerification`, Rx3 is `Expired`, and Rx4 belongs to another patient than the sale's patient

*Steps*
1. lines linked to their items are submitted

*Expected results*
1. each returns 422 `SALES.PRESCRIPTION_NOT_DISPENSABLE`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-159: Quantity above remaining incl. concurrent dispensing of same item

| Field | Value |
|---|---|
| Story | [US-06-26](../stories/EPIC-06-SALES-POS/US-06-26-prescription-dispensing-sale.md) — Prescription-Linked Sale with Rx-Only and Controlled Enforcement |
| Type / Execution | Concurrency / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-06-26-AC6 |
| Requirements | FR-06-058, FR-06-059, FR-06-060, FR-06-061 |

**Story preconditions**
- Prescription Rx1 for patient P is `Verified` (SPEC-08) with items: Medicine Q (Rx-only) 30 base units, Medicine Z (controlled) 10 base units.
- `EnforcePrescriptionForRxOnly` = true. Pharmacist R holds `prescriptions.dispense` and `prescriptions.controlled.dispense`.

**US-06-26-AC6 — Quantity above remaining**

*Preconditions / test data*
1. Rx1 item Q has 30 remaining

*Steps*
1. a line of 40 units linked to it is submitted

*Expected results*
1. the response is 422 `SALES.PRESCRIPTION_QUANTITY_EXCEEDED`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-160: 403 without `prescriptions.dispense`; CS-08 foreign prescription 404; CS-07 branch 403

| Field | Value |
|---|---|
| Story | [US-06-26](../stories/EPIC-06-SALES-POS/US-06-26-prescription-dispensing-sale.md) — Prescription-Linked Sale with Rx-Only and Controlled Enforcement |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-06-26-AC7 |
| Critical scenario | CS-08, CS-07 |
| Requirements | FR-06-058, FR-06-059, FR-06-060, FR-06-061 |

**Story preconditions**
- Prescription Rx1 for patient P is `Verified` (SPEC-08) with items: Medicine Q (Rx-only) 30 base units, Medicine Z (controlled) 10 base units.
- `EnforcePrescriptionForRxOnly` = true. Pharmacist R holds `prescriptions.dispense` and `prescriptions.controlled.dispense`.

**US-06-26-AC7 — Dispense permission and isolation**

*Preconditions / test data*
1. cashier C without `prescriptions.dispense` completing a prescription-linked line of a non-controlled medicine, a prescription of another organization, and a user unassigned to the branch

*Steps*
1. they submit / load

*Expected results*
1. C receives 403 `COMMON.FORBIDDEN`
2. the foreign prescription 404 `COMMON.NOT_FOUND` (CS-08)
3. the unassigned user 403 `COMMON.FORBIDDEN` (CS-07)

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-06-27: Partial Prescription Fulfillment at the POS

### TS-06-161: Partial dispensing; PartiallyDispensed; remaining on receipt

| Field | Value |
|---|---|
| Story | [US-06-27](../stories/EPIC-06-SALES-POS/US-06-27-partial-prescription-fulfillment.md) — Partial Prescription Fulfillment at the POS |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-27-AC1 |
| Requirements | FR-06-061, FR-06-062 |

**Story preconditions**
- Prescription Rx1 `Verified`, item Q 30 base units remaining; sellable stock of Q is 20.

**US-06-27-AC1 — Dispense less than remaining**

*Preconditions / test data*
1. Rx1 loaded into the cart with Q capped at 20 (sellable)

*Steps*
1. R completes the sale

*Expected results*
1. a `DispensingRecord` of 20 units is created, Rx1 becomes `PartiallyDispensed` with 10 remaining, and the receipt shows "Remaining to dispense: Q — 10 units"

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-162: Second visit completes prescription

| Field | Value |
|---|---|
| Story | [US-06-27](../stories/EPIC-06-SALES-POS/US-06-27-partial-prescription-fulfillment.md) — Partial Prescription Fulfillment at the POS |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-27-AC2 |
| Requirements | FR-06-061, FR-06-062 |

**Story preconditions**
- Prescription Rx1 `Verified`, item Q 30 base units remaining; sellable stock of Q is 20.

**US-06-27-AC2 — Second visit dispenses the remainder**

*Preconditions / test data*
1. Rx1 with 10 remaining

*Steps*
1. R loads Rx1 on a later visit and completes a sale of 10 units

*Expected results*
1. Rx1 becomes `FullyDispensed` and the receipt shows no remaining line

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-163: Patient-reduced quantity; later over-dispense rejected

| Field | Value |
|---|---|
| Story | [US-06-27](../stories/EPIC-06-SALES-POS/US-06-27-partial-prescription-fulfillment.md) — Partial Prescription Fulfillment at the POS |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-27-AC3 |
| Requirements | FR-06-061, FR-06-062 |

**Story preconditions**
- Prescription Rx1 `Verified`, item Q 30 base units remaining; sellable stock of Q is 20.

**US-06-27-AC3 — Patient chooses fewer units**

*Preconditions / test data*
1. Rx1 item Q with 30 remaining and sufficient stock

*Steps*
1. R reduces the line to 15 and completes

*Expected results*
1. 15 is dispensed and 15 remains
2. a later attempt to dispense 16 against the item returns 422 `SALES.PRESCRIPTION_QUANTITY_EXCEEDED`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-164: Void reverses dispensing and remaining

| Field | Value |
|---|---|
| Story | [US-06-27](../stories/EPIC-06-SALES-POS/US-06-27-partial-prescription-fulfillment.md) — Partial Prescription Fulfillment at the POS |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-06-27-AC4 |
| Requirements | FR-06-061, FR-06-062 |

**Story preconditions**
- Prescription Rx1 `Verified`, item Q 30 base units remaining; sellable stock of Q is 20.

**US-06-27-AC4 — Void restores remaining**

*Preconditions / test data*
1. the partial sale of 20 units is voided the same day (US-06-20)

*Steps*
1. the void commits

*Expected results*
1. SPEC-08 reverses the dispensing record and Rx1 remaining returns to 30 with status `Verified`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-165: 403 without `prescriptions.dispense`

| Field | Value |
|---|---|
| Story | [US-06-27](../stories/EPIC-06-SALES-POS/US-06-27-partial-prescription-fulfillment.md) — Partial Prescription Fulfillment at the POS |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-06-27-AC5 |
| Requirements | FR-06-061, FR-06-062 |

**Story preconditions**
- Prescription Rx1 `Verified`, item Q 30 base units remaining; sellable stock of Q is 20.

**US-06-27-AC5 — Permission denied**

*Preconditions / test data*
1. a cashier without `prescriptions.dispense`

*Steps*
1. the cashier completes a partial dispensing sale

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-06-28: Loyalty Points Accrual (P3, subject to OD-06-08)

### TS-06-166: Accrual on completion in same transaction

| Field | Value |
|---|---|
| Story | [US-06-28](../stories/EPIC-06-SALES-POS/US-06-28-loyalty-points-accrual.md) — Loyalty Points Accrual (P3, subject to OD-06-08) |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P3) |
| Release | Future |
| Covers | US-06-28-AC1 |
| Requirements | FR-06-063 |

**Story preconditions**
- OD-06-08 decided; `LoyaltyEnabled` = true, `LoyaltyEarnRate` = 1 point per 10.00 EGP net sales (illustrative); user holds `sales.loyalty.manage` for configuration.

**US-06-28-AC1 — Accrual on completion**

*Preconditions / test data*
1. a sale with linked patient P and net sales (excluding tax) 247.63

*Steps*
1. the sale completes

*Expected results*
1. an append-only loyalty ledger entry of +24 points (floor(247.63 ÷ 10.00)) is written in the sale transaction

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-167: Proportional reversal on return; full on void

| Field | Value |
|---|---|
| Story | [US-06-28](../stories/EPIC-06-SALES-POS/US-06-28-loyalty-points-accrual.md) — Loyalty Points Accrual (P3, subject to OD-06-08) |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P3) |
| Release | Future |
| Covers | US-06-28-AC2 |
| Requirements | FR-06-063 |

**Story preconditions**
- OD-06-08 decided; `LoyaltyEnabled` = true, `LoyaltyEarnRate` = 1 point per 10.00 EGP net sales (illustrative); user holds `sales.loyalty.manage` for configuration.

**US-06-28-AC2 — Reversal on return and void**

*Preconditions / test data*
1. the sale above

*Steps*
1. half of its net value is returned, and in another case the sale is voided

*Expected results*
1. a −12 points entry is written with the return
2. a −24 points entry is written with the void

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-168: No accrual without patient / disabled

| Field | Value |
|---|---|
| Story | [US-06-28](../stories/EPIC-06-SALES-POS/US-06-28-loyalty-points-accrual.md) — Loyalty Points Accrual (P3, subject to OD-06-08) |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P3) |
| Release | Future |
| Covers | US-06-28-AC3 |
| Requirements | FR-06-063 |

**Story preconditions**
- OD-06-08 decided; `LoyaltyEnabled` = true, `LoyaltyEarnRate` = 1 point per 10.00 EGP net sales (illustrative); user holds `sales.loyalty.manage` for configuration.

**US-06-28-AC3 — No patient or disabled program**

*Preconditions / test data*
1. a sale without a linked patient, or `LoyaltyEnabled` = false

*Steps*
1. the sale completes

*Expected results*
1. no loyalty entry is written

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-169: 403 on configuration without permission

| Field | Value |
|---|---|
| Story | [US-06-28](../stories/EPIC-06-SALES-POS/US-06-28-loyalty-points-accrual.md) — Loyalty Points Accrual (P3, subject to OD-06-08) |
| Type / Execution | Security / Automated |
| Priority | T3 (story P3) |
| Release | Future |
| Covers | US-06-28-AC4 |
| Requirements | FR-06-063 |

**Story preconditions**
- OD-06-08 decided; `LoyaltyEnabled` = true, `LoyaltyEarnRate` = 1 point per 10.00 EGP net sales (illustrative); user holds `sales.loyalty.manage` for configuration.

**US-06-28-AC4 — Configuration permission**

*Preconditions / test data*
1. a manager without `sales.loyalty.manage`

*Steps*
1. the manager changes `LoyaltyEarnRate`

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-06-29: Loyalty Points Redemption as Payment (P3, subject to OD-06-08)

### TS-06-170: Redemption payment and ledger entry

| Field | Value |
|---|---|
| Story | [US-06-29](../stories/EPIC-06-SALES-POS/US-06-29-loyalty-points-redemption.md) — Loyalty Points Redemption as Payment (P3, subject to OD-06-08) |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P3) |
| Release | Future |
| Covers | US-06-29-AC1 |
| Requirements | FR-06-064 |

**Story preconditions**
- US-06-28 live; `LoyaltyPointValue` = 0.10 EGP per point, `LoyaltyMaxRedeemPercent` = 50 (illustrative).

**US-06-29-AC1 — Redeem within balance and cap**

*Preconditions / test data*
1. patient P has 500 points and a sale total of 261.59

*Steps*
1. the cashier applies 400 points (40.00 EGP) and pays the rest in cash

*Expected results*
1. payments are LoyaltyPoints 40.00 and Cash 221.59
2. a −400 points ledger entry is written in the sale transaction

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-171: Insufficient / above cap rejected

| Field | Value |
|---|---|
| Story | [US-06-29](../stories/EPIC-06-SALES-POS/US-06-29-loyalty-points-redemption.md) — Loyalty Points Redemption as Payment (P3, subject to OD-06-08) |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P3) |
| Release | Future |
| Covers | US-06-29-AC2 |
| Requirements | FR-06-064 |

**Story preconditions**
- US-06-28 live; `LoyaltyPointValue` = 0.10 EGP per point, `LoyaltyMaxRedeemPercent` = 50 (illustrative).

**US-06-29-AC2 — Insufficient points or above cap**

*Preconditions / test data*
1. P has 100 points, or the redemption exceeds 50% of the total

*Steps*
1. the sale is submitted

*Expected results*
1. the response is 422 `SALES.LOYALTY_INSUFFICIENT_POINTS` and nothing is persisted

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-172: Concurrent redemption → one success

| Field | Value |
|---|---|
| Story | [US-06-29](../stories/EPIC-06-SALES-POS/US-06-29-loyalty-points-redemption.md) — Loyalty Points Redemption as Payment (P3, subject to OD-06-08) |
| Type / Execution | Concurrency / Automated |
| Priority | T3 (story P3) |
| Release | Future |
| Covers | US-06-29-AC3 |
| Requirements | FR-06-064 |

**Story preconditions**
- US-06-28 live; `LoyaltyPointValue` = 0.10 EGP per point, `LoyaltyMaxRedeemPercent` = 50 (illustrative).

**US-06-29-AC3 — Concurrent redemption**

*Preconditions / test data*
1. P has 500 points and two sales each redeeming 400 points are submitted concurrently

*Steps*
1. both execute

*Expected results*
1. exactly one succeeds (loyalty account row locked)
2. the other returns 422 `SALES.LOYALTY_INSUFFICIENT_POINTS`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-173: Points refunded on return

| Field | Value |
|---|---|
| Story | [US-06-29](../stories/EPIC-06-SALES-POS/US-06-29-loyalty-points-redemption.md) — Loyalty Points Redemption as Payment (P3, subject to OD-06-08) |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P3) |
| Release | Future |
| Covers | US-06-29-AC4 |
| Requirements | FR-06-064 |

**Story preconditions**
- US-06-28 live; `LoyaltyPointValue` = 0.10 EGP per point, `LoyaltyMaxRedeemPercent` = 50 (illustrative).

**US-06-29-AC4 — Refund of redeemed points**

*Preconditions / test data*
1. a sale paid partly by points is fully returned

*Steps*
1. the refund is allocated

*Expected results*
1. the points portion is refunded as points (+400) and the remainder by the original methods

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-174: CS-08 other-organization patient 404

| Field | Value |
|---|---|
| Story | [US-06-29](../stories/EPIC-06-SALES-POS/US-06-29-loyalty-points-redemption.md) — Loyalty Points Redemption as Payment (P3, subject to OD-06-08) |
| Type / Execution | Security / Automated |
| Priority | T3 (story P3) |
| Release | Future |
| Covers | US-06-29-AC5 |
| Critical scenario | CS-08 |
| Requirements | FR-06-064 |

**Story preconditions**
- US-06-28 live; `LoyaltyPointValue` = 0.10 EGP per point, `LoyaltyMaxRedeemPercent` = 50 (illustrative).

**US-06-29-AC5 — Patient of another organization**

*Preconditions / test data*
1. a sale referencing a patient of another organization for redemption

*Steps*
1. submitted

*Expected results*
1. the response is 404 `COMMON.NOT_FOUND` (CS-08)

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-06-30: Electronic Invoice / Receipt Data Readiness (P3, pending REG-07)

### TS-06-175: Snapshot written with sale; status NotApplicable

| Field | Value |
|---|---|
| Story | [US-06-30](../stories/EPIC-06-SALES-POS/US-06-30-e-invoice-data-readiness.md) — Electronic Invoice / Receipt Data Readiness (P3, pending REG-07) |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P3) |
| Release | Future |
| Covers | US-06-30-AC1 |
| Requirements | FR-06-065 |

**Story preconditions**
- REG-07 outcome pending; this story only stores data and a status.

**US-06-30-AC1 — Snapshot stored**

*Preconditions / test data*
1. a sale completes

*Steps*
1. the transaction commits

*Expected results*
1. a structured invoice snapshot (seller identifiers as configured, document number, date/time, lines with quantities, unit prices, discounts, tax category codes, rates, amounts, totals, payment methods) is stored immutably with the sale, and `EInvoiceStatus` = `NotApplicable`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-176: Snapshot immutability (domain + trigger)

| Field | Value |
|---|---|
| Story | [US-06-30](../stories/EPIC-06-SALES-POS/US-06-30-e-invoice-data-readiness.md) — Electronic Invoice / Receipt Data Readiness (P3, pending REG-07) |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P3) |
| Release | Future |
| Covers | US-06-30-AC2 |
| Requirements | FR-06-065 |

**Story preconditions**
- REG-07 outcome pending; this story only stores data and a status.

**US-06-30-AC2 — Snapshot immutable**

*Preconditions / test data*
1. a stored snapshot

*Steps*
1. any update of the snapshot is attempted through the application or directly against the amount columns

*Expected results*
1. it is rejected (domain error / DB trigger) and an audit entry is not altered

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-177: Return snapshot references original

| Field | Value |
|---|---|
| Story | [US-06-30](../stories/EPIC-06-SALES-POS/US-06-30-e-invoice-data-readiness.md) — Electronic Invoice / Receipt Data Readiness (P3, pending REG-07) |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P3) |
| Release | Future |
| Covers | US-06-30-AC3 |
| Requirements | FR-06-065 |

**Story preconditions**
- REG-07 outcome pending; this story only stores data and a status.

**US-06-30-AC3 — Returns referenced**

*Preconditions / test data*
1. a completed sales return

*Steps*
1. it commits

*Expected results*
1. its snapshot references the original sale's invoice number and snapshot id

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-06-178: 403 without permission; CS-08 404

| Field | Value |
|---|---|
| Story | [US-06-30](../stories/EPIC-06-SALES-POS/US-06-30-e-invoice-data-readiness.md) — Electronic Invoice / Receipt Data Readiness (P3, pending REG-07) |
| Type / Execution | Security / Automated |
| Priority | T3 (story P3) |
| Release | Future |
| Covers | US-06-30-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-06-065 |

**Story preconditions**
- REG-07 outcome pending; this story only stores data and a status.

**US-06-30-AC4 — Read access**

*Preconditions / test data*
1. a user without `sales.sales.read`, and a user of another organization

*Steps*
1. they request a snapshot

*Expected results*
1. 403 `COMMON.FORBIDDEN` and 404 `COMMON.NOT_FOUND` (CS-08)

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

