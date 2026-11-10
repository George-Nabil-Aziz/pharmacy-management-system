# Test Cases — EPIC-04 Batch & Inventory Management

> **Generated** by `node scripts/docs/gen-test-cases.mjs` on 2026-11-10 from the story files in `docs/stories/EPIC-04-BATCH-INVENTORY/`. Each test case corresponds to one test scenario (TS) declared in a story; preconditions, steps and expected results are derived from the Given / When / Then of the acceptance criteria it covers. The stories are the source of truth — change a story and regenerate.

**Conventions:** TC ID = TS ID. Priority T0 blocks merge, T1 blocks release, T2/T3 per [MASTER-TEST-STRATEGY §6](../test-plans/MASTER-TEST-STRATEGY.md). Execution: *Automated* tests are implemented in code with a trait/name carrying the TS ID; *Manual* cases are executed from this document. Test data conventions: [TEST-DATA-STRATEGY.md](../test-plans/TEST-DATA-STRATEGY.md).

## Summary (193 test cases)

| TC | Scenario | Type | Priority | Release | Covers |
|---|---|---|---|---|---|
| TS-04-001 | List with medicine/onlyWithStock filters returns batches sorted by expiry ascending with correct totals | Integration | T1 | MVP | US-04-01-AC1 |
| TS-04-002 | Batch detail shows balance, sellable, eligibility, lineage, last 20 movements | Integration | T1 | MVP | US-04-01-AC2 |
| TS-04-003 | Status derivation table test over all combinations of quarantine/expired/OnHand | Unit | T1 | MVP | US-04-01-AC3 |
| TS-04-004 | Do-not-sell window batch shows sellable 0 with reason (CS-02 visibility) | Integration | T0 | MVP | US-04-01-AC4 |
| TS-04-005 | Cost fields omitted without `reports.inventory.read`; missing permission → 403 | API | T1 | MVP | US-04-01-AC5, US-04-01-AC6 |
| TS-04-006 | CS-07 unassigned branch → 403; CS-08 other-org batch → 404; other-branch id via own route → 404 | API | T0 | MVP | US-04-01-AC7 |
| TS-04-007 | Outbound posting writes balance and a complete movement row with sequence and BalanceAfter | Integration | T1 | MVP | US-04-02-AC1 |
| TS-04-008 | Outbound beyond OnHand → INSUFFICIENT_STOCK, nothing written | Integration | T1 | MVP | US-04-02-AC2 |
| TS-04-009 | Decrease breaching Reserved ≤ OnHand → RESERVATION_CONFLICT | Integration | T1 | MVP | US-04-02-AC3 |
| TS-04-010 | App DB role UPDATE/DELETE on movements fails; OpenAPI has no mutation route for movements | Integration | T1 | MVP | US-04-02-AC4 |
| TS-04-011 | Matrix validation for all 15 types × sign × source document type | Unit | T1 | MVP | US-04-02-AC5 |
| TS-04-012 | Posting to a batch outside the lock set throws before SQL | Unit | T1 | MVP | US-04-02-AC6 |
| TS-04-013 | Multi-batch transaction emits exactly one StockMovementsPosted message | Integration | T1 | MVP | US-04-02-AC7 |
| TS-04-014 | Receipt into unknown key creates batch, balance, movement; number normalized | Integration | T1 | MVP | US-04-03-AC1 |
| TS-04-015 | Same key increments existing batch with sequence 2 | Integration | T1 | MVP | US-04-03-AC2 |
| TS-04-016 | Different cost creates second batch; FEFO preview orders by CreatedAt | Integration | T1 | MVP | US-04-03-AC3 |
| TS-04-017 | Same number different expiry → 422 BATCH_EXPIRY_MISMATCH | Integration | T1 | MVP | US-04-03-AC4 |
| TS-04-018 | Month/year normalization incl. leap February and invalid month | Unit | T1 | MVP | US-04-03-AC5 |
| TS-04-019 | SalesReturn into expired or quarantined batch rejected with BATCH_NOT_SELLABLE, nothing written; TransferReturn into the same batch accepted, sellable stays 0 | Integration | T1 | MVP | US-04-03-AC6 |
| TS-04-020 | Inbound to inactive medicine rejected; concurrent creation of same key yields one batch | Integration | T1 | MVP | US-04-03-AC7 |
| TS-04-021 | Property-based: allocations sum to request, follow expiry/CreatedAt/Id order, never include ineligible batch | Unit | T1 | MVP | US-04-04-AC1, US-04-04-AC2 |
| TS-04-022 | Split allocation across two batches with costs and overrides | Integration | T1 | MVP | US-04-04-AC2, US-04-04-AC11 |
| TS-04-023 | CS-02: expired-on-business-date, do-not-sell window, quarantined, fully reserved batches excluded | Integration | T0 | MVP | US-04-04-AC3 |
| TS-04-024 | CS-02: Cairo midnight boundary with injected clock before the flagging job runs | Integration | T0 | MVP | US-04-04-AC4 |
| TS-04-025 | Multi-line shortage returns all shortages; no writes | Integration | T1 | MVP | US-04-04-AC5 |
| TS-04-026 | CS-01: 2 concurrent transactions for the last unit → one success, one INSUFFICIENT_STOCK, OnHand 0, one movement | Concurrency | T0 | MVP | US-04-04-AC6 |
| TS-04-027 | CS-01: 1,000 runs × 20 concurrent allocations on 1 unit; overlapping multi-line orders; 0 deadlocks, 0 negatives | Concurrency | T0 | MVP | US-04-04-AC6, US-04-04-AC7 |
| TS-04-028 | Same medicine on two lines shares remaining quantity | Unit | T1 | MVP | US-04-04-AC8 |
| TS-04-029 | SupplierReturn purpose filters supplier, includes Expired/Quarantined; missing supplierId → 400 | Integration | T1 | MVP | US-04-04-AC9 |
| TS-04-030 | Preview does not block on held locks and writes nothing | Integration | T1 | MVP | US-04-04-AC10 |
| TS-04-031 | Preview: 403 without permission, 403 unassigned branch (CS-07), 404 other-org medicine (CS-08) | API | T0 | MVP | US-04-04-AC10 |
| TS-04-032 | NFR-04-001: 10 lines × 50 candidates p95 ≤ 50 ms at 500,000 batches | Performance | T1 | MVP | US-04-04-AC1 |
| TS-04-033 | Override with permission allocates explicit batch, flags override, writes audit in same tx | Integration | T2 | MVP | US-04-05-AC1 |
| TS-04-034 | Override without permission → 403 FEFO_OVERRIDE_NOT_PERMITTED | Integration | T2 | MVP | US-04-05-AC2 |
| TS-04-035 | Explicit = FEFO first choice → no permission needed, not flagged | Unit | T2 | MVP | US-04-05-AC3 |
| TS-04-036 | CS-02: explicit expired / do-not-sell / quarantined batch rejected even with permission | Integration | T1 | MVP | US-04-05-AC4 |
| TS-04-037 | Explicit batch insufficient → INSUFFICIENT_STOCK without top-up | Integration | T2 | MVP | US-04-05-AC5 |
| TS-04-038 | Wrong branch/medicine → 422; other-org batch → 404 (CS-08) | Integration | T1 | MVP | US-04-05-AC6 |
| TS-04-039 | CS-10: fault injection after N SQL commands (N = 1..k) for adjustment, write-off, opening balance, transfer dispatch/receipt, stocktake approval — all tables unchanged | Integration | T0 | MVP | US-04-06-AC1 |
| TS-04-040 | CS-10: connection kill before COMMIT then retry with same key → single effect | Integration | T0 | MVP | US-04-06-AC2 |
| TS-04-041 | CS-11: sequential replay of dispatch with same key returns identical response, one movement set | API | T0 | MVP | US-04-06-AC3 |
| TS-04-042 | CS-11: same key different document → 422 IDEMPOTENCY_KEY_REUSED | API | T0 | MVP | US-04-06-AC4 |
| TS-04-043 | CS-11: concurrent duplicate stocktake approval → one effect, both responses identical | Concurrency | T0 | MVP | US-04-06-AC5 |
| TS-04-044 | Missing key on each posting endpoint → 400 | API | T1 | MVP | US-04-06-AC6 |
| TS-04-045 | Held lock > 3 s → 503 LOCK_TIMEOUT, nothing written, retry succeeds | Integration | T1 | MVP | US-04-06-AC7 |
| TS-04-046 | Injected deadlock retried; three failures → 503 TRANSIENT_CONFLICT | Integration | T1 | MVP | US-04-06-AC8 |
| TS-04-047 | 403 permission, 403 branch (CS-07), 404 other org (CS-08); no idempotency record stored | API | T0 | MVP | US-04-06-AC9 |
| TS-04-048 | Aggregates per bucket computed correctly for mixed batch statuses | Integration | T1 | MVP | US-04-07-AC1 |
| TS-04-049 | CS-06: in-transit outbound/inbound shown in both branches, excluded from onHand | Integration | T0 | MVP | US-04-07-AC2 |
| TS-04-050 | Low-stock filter, pagination, pageSize limit | API | T1 | MVP | US-04-07-AC3 |
| TS-04-051 | Value fields gated by reports.inventory.read; value rounding | API | T1 | MVP | US-04-07-AC4 |
| TS-04-052 | 403 permission, 403 branch (CS-07), 404 other org (CS-08) | API | T0 | MVP | US-04-07-AC5 |
| TS-04-053 | NFR-04-004: 10,000 medicines, page 25, p95 ≤ 500 ms | Performance | T1 | MVP | US-04-07-AC1, US-04-07-AC3 |
| TS-04-054 | Stock card ordering and running balance across movement types | Integration | T1 | MVP | US-04-08-AC1 |
| TS-04-055 | Cursor pagination without gaps/duplicates; type/date filters; limit validation | API | T1 | MVP | US-04-08-AC2 |
| TS-04-056 | XLSX export ≤ 100,000 rows sync; > 100,000 rows background export | Integration | T1 | MVP | US-04-08-AC3 |
| TS-04-057 | Cost columns absent without reports.inventory.read | API | T1 | MVP | US-04-08-AC4 |
| TS-04-058 | 403 permission, 403 branch (CS-07), 404 other org (CS-08), export without reports.export | API | T0 | MVP | US-04-08-AC5 |
| TS-04-059 | NFR-04-004: first page p95 ≤ 300 ms at 20 million movements | Performance | T1 | MVP | US-04-08-AC2 |
| TS-04-060 | Post 3-line opening balance: batches, movements, number, audit | Integration | T1 | MVP | US-04-09-AC1 |
| TS-04-061 | Pack + base-unit conversion to base units | Unit | T1 | MVP | US-04-09-AC2 |
| TS-04-062 | Expired opening balance batch flagged Expired and non-sellable | Integration | T1 | MVP | US-04-09-AC3 |
| TS-04-063 | Lock then post → 409 OPENING_BALANCE_LOCKED | API | T1 | MVP | US-04-09-AC4 |
| TS-04-064 | Line count, cost, and expiry mismatch validations | API | T1 | MVP | US-04-09-AC5 |
| TS-04-065 | NFR-04-003: 5,000-line post p95 ≤ 30 s | Performance | T0 | MVP | US-04-09-AC6 |
| TS-04-066 | CS-10: injected failure at line 4,999 leaves no trace | Integration | T0 | MVP | US-04-09-AC6 |
| TS-04-067 | CS-11: retries with same key → one posting; plus 403 permission, 403 branch (CS-07), 404 other org (CS-08) | API | T0 | MVP | US-04-09-AC6, US-04-09-AC7 |
| TS-04-068 | 2,000-row XLSX creates draft with summary | Integration | T1 | MVP | US-04-10-AC1 |
| TS-04-069 | Row-level errors listed with row/column/code; no draft created | Integration | T1 | MVP | US-04-10-AC2 |
| TS-04-070 | Oversize, wrong type, too many rows, missing header → 400 | API | T1 | MVP | US-04-10-AC3 |
| TS-04-071 | Duplicate rows merged by receipt key | Unit | T1 | MVP | US-04-10-AC4 |
| TS-04-072 | Month/year expiry parsing; formula cells not evaluated and rejected | Security | T0 | MVP | US-04-10-AC5 |
| TS-04-073 | 403 permission, 409 locked, 404 other org (CS-08), 403 unassigned branch (CS-07) | API | T0 | MVP | US-04-10-AC6 |
| TS-04-074 | NFR-04-003: 5,000-row validation p95 ≤ 10 s | Performance | T1 | MVP | US-04-10-AC1 |
| TS-04-075 | Below-threshold submit posts movement, number, audit | Integration | T1 | MVP | US-04-11-AC1 |
| TS-04-076 | Value 1,000.01 → PendingApproval + event; 1,000.00 → Posted | Integration | T1 | MVP | US-04-11-AC2 |
| TS-04-077 | Controlled medicine line forces approval | Integration | T1 | MVP | US-04-11-AC3 |
| TS-04-078 | Decrease beyond OnHand − Reserved → 409, stays Draft | Integration | T1 | MVP | US-04-11-AC4 |
| TS-04-079 | Reason Other note validation | API | T1 | MVP | US-04-11-AC5 |
| TS-04-080 | FoundStock creates new batch via inbound contract | Integration | T1 | MVP | US-04-11-AC6 |
| TS-04-081 | Reclassification pair posts both movements; unequal pair rejected | Integration | T1 | MVP | US-04-11-AC7 |
| TS-04-082 | 403 permission, 403 branch (CS-07), 404 other org (CS-08) | API | T0 | MVP | US-04-11-AC8 |
| TS-04-083 | Approve posts movements and audit | Integration | T1 | MVP | US-04-12-AC1 |
| TS-04-084 | Self-approval → 403 SELF_APPROVAL_NOT_ALLOWED | API | T1 | MVP | US-04-12-AC2 |
| TS-04-085 | Reject with reason; short reason → 422 | API | T1 | MVP | US-04-12-AC3 |
| TS-04-086 | Approval with insufficient current stock → 409, stays pending | Integration | T1 | MVP | US-04-12-AC4 |
| TS-04-087 | Two concurrent approvals → one posts, other 409 | Concurrency | T0 | MVP | US-04-12-AC5 |
| TS-04-088 | 403 permission, 403 branch (CS-07), 404 other org (CS-08) for adjustments and write-offs | API | T0 | MVP | US-04-12-AC6 |
| TS-04-089 | Damaged write-off posts movement and number | Integration | T1 | MVP | US-04-13-AC1 |
| TS-04-090 | Expired write-off on non-expired batch → 422 | API | T1 | MVP | US-04-13-AC2 |
| TS-04-091 | Prefill includes only expired batches with available > 0 | Integration | T1 | MVP | US-04-13-AC3 |
| TS-04-092 | Above-threshold write-off → PendingApproval | Integration | T1 | MVP | US-04-13-AC4 |
| TS-04-093 | Quarantined batch damaged write-off | Integration | T1 | MVP | US-04-13-AC5 |
| TS-04-094 | Write-off > OnHand − Reserved → 409 | Integration | T1 | MVP | US-04-13-AC6 |
| TS-04-095 | 403 permission, 403 branch (CS-07), 404 other org (CS-08) | API | T0 | MVP | US-04-13-AC7 |
| TS-04-096 | Direct expiry correction on single-movement batch with audit old/new | Integration | T2 | MVP | US-04-14-AC1 |
| TS-04-097 | Batch with history → 409 BATCH_METADATA_LOCKED | API | T2 | MVP | US-04-14-AC2 |
| TS-04-098 | Override set/clear; FEFO returns override | Integration | T2 | MVP | US-04-14-AC3 |
| TS-04-099 | Missing catalog.prices.update → 403 | API | T2 | MVP | US-04-14-AC4 |
| TS-04-100 | Price/expiry validation; stale and missing If-Match | API | T2 | MVP | US-04-14-AC5 |
| TS-04-101 | CS-07 other branch → 403; CS-08 other org → 404 | API | T1 | MVP | US-04-14-AC6 |
| TS-04-102 | Flagging sets Expired for Active/Depleted, events only for OnHand > 0 | Integration | T1 | MVP | US-04-15-AC1 |
| TS-04-103 | Rerun same branch/date changes nothing | Integration | T1 | MVP | US-04-15-AC2 |
| TS-04-104 | Quarantined batch unchanged; release derives Expired | Integration | T1 | MVP | US-04-15-AC3 |
| TS-04-105 | Near-expiry digest boundaries (day 90 included, day 91 excluded, zero stock excluded) | Integration | T1 | MVP | US-04-15-AC4 |
| TS-04-106 | Catch-up after missed day flags newly entered batches | Integration | T1 | MVP | US-04-15-AC5 |
| TS-04-107 | NFR-04-007: flagging 100,000 batches ≤ 5 min | Performance | T1 | MVP | US-04-15-AC1 |
| TS-04-108 | Near-expiry list: 403 permission, 403 branch (CS-07), 404 other org (CS-08) | API | T0 | MVP | US-04-15-AC7 |
| TS-04-109 | CS-02: expired batch not sellable although stored status is still Active | Integration | T0 | MVP | US-04-15-AC6 |
| TS-04-110 | Upsert setting; invalid min/max → 422 | API | T2 | MVP | US-04-16-AC1 |
| TS-04-111 | Normal→Low emits one event with correct suggestion and ≤ 60 s latency | Integration | T2 | MVP | US-04-16-AC2 |
| TS-04-112 | No repeated events while Low across scans; concurrent evaluations emit once | Integration | T2 | MVP | US-04-16-AC3 |
| TS-04-113 | Low→Normal emits StockLevelRestored | Integration | T2 | MVP | US-04-16-AC4 |
| TS-04-114 | Scan detects drop caused by do-not-sell window without movement | Integration | T2 | MVP | US-04-16-AC5 |
| TS-04-115 | Low-stock list fields | API | T2 | MVP | US-04-16-AC6 |
| TS-04-116 | 403 permission, 403 branch (CS-07), 404 other org (CS-08) | API | T1 | MVP | US-04-16-AC7 |
| TS-04-117 | Quarantine sets status, no movement, audit, event; FEFO excludes | Integration | T2 | V1 | US-04-17-AC1 |
| TS-04-118 | Release of expired quarantined batch → Expired | Integration | T2 | V1 | US-04-17-AC2 |
| TS-04-119 | Quarantine waits for in-flight sale lock; later sales exclude batch | Concurrency | T1 | V1 | US-04-17-AC3 |
| TS-04-120 | Recall quarantines all branches' batches atomically | Integration | T2 | V1 | US-04-17-AC4 |
| TS-04-121 | Recall without org-wide scope → 403 | API | T2 | V1 | US-04-17-AC5 |
| TS-04-122 | Invalid transitions → 409; short reason → 422 | API | T2 | V1 | US-04-17-AC6 |
| TS-04-123 | CS-07 other branch → 403; CS-08 other org → 404 | API | T1 | V1 | US-04-17-AC7 |
| TS-04-124 | Clean dataset → zero findings (also run after every integration test class) | Integration | T1 | MVP | US-04-18-AC1 |
| TS-04-125 | Seeded on-hand drift → findings + critical event + notification ≤ 5 min | Integration | T1 | MVP | US-04-18-AC2 |
| TS-04-126 | Data checksum unchanged after a run with findings | Integration | T1 | MVP | US-04-18-AC3 |
| TS-04-127 | Sequence gap and status derivation findings | Integration | T1 | MVP | US-04-18-AC4 |
| TS-04-128 | Reserved sum and transfer conservation findings | Integration | T1 | MVP | US-04-18-AC5 |
| TS-04-129 | Persisting drift deduplicated; on-demand run; concurrent run → 409 | Integration | T1 | MVP | US-04-18-AC6 |
| TS-04-130 | 403 permission; CS-08 other-org run → 404 | API | T0 | MVP | US-04-18-AC7 |
| TS-04-131 | NFR-04-006: 500,000 batches / 20 million movements ≤ 30 min, sale p95 impact ≤ 10% | Performance | T1 | MVP | US-04-18-AC1 |
| TS-04-132 | Destination user creates draft readable from both branches | API | T2 | V1 | US-04-19-AC1 |
| TS-04-133 | Same branch / inactive branch → 422 | API | T2 | V1 | US-04-19-AC2 |
| TS-04-134 | Submit assigns source-branch number, audit, status event | Integration | T2 | V1 | US-04-19-AC3 |
| TS-04-135 | Cancel from Draft/Requested; cancel InTransit → 409; edit after submit → 409 | API | T2 | V1 | US-04-19-AC4, US-04-19-AC5 |
| TS-04-136 | CS-07 unrelated branch → 403; permission → 403; CS-08 other org → 404 | API | T1 | V1 | US-04-19-AC6 |
| TS-04-137 | Approval allocates FEFO and reserves without movements | Integration | T2 | V1 | US-04-20-AC1 |
| TS-04-138 | Insufficient stock at approval → 409, no reservation | Integration | T2 | V1 | US-04-20-AC2 |
| TS-04-139 | Sales skip reserved quantity | Integration | T2 | V1 | US-04-20-AC3 |
| TS-04-140 | Reject with reason | API | T2 | V1 | US-04-20-AC4 |
| TS-04-141 | Cancel Approved releases reservations atomically | Integration | T2 | V1 | US-04-20-AC5 |
| TS-04-142 | Self-approval → 403; destination-only manager → 403 (CS-07) | API | T1 | V1 | US-04-20-AC6 |
| TS-04-143 | Missing permission → 403; CS-08 other org → 404 | API | T1 | V1 | US-04-20-AC7 |
| TS-04-144 | CS-11: approve retried with same key → one reservation set | API | T1 | V1 | US-04-20-AC1 |
| TS-04-145 | Dispatch posts TransferOut, consumes reservation, status InTransit, event | Integration | T2 | V1 | US-04-21-AC1 |
| TS-04-146 | Partial dispatch releases remainder; over-dispatch → 422 | Integration | T2 | V1 | US-04-21-AC2 |
| TS-04-147 | Quarantined/expired allocated batch blocks dispatch with no writes | Integration | T2 | V1 | US-04-21-AC3 |
| TS-04-148 | CS-06: in-transit quantities visible to source and destination, excluded from OnHand | E2E | T1 | V1 | US-04-21-AC4 |
| TS-04-149 | CS-07 destination-only user → 403; permission → 403; CS-08 → 404 | API | T1 | V1 | US-04-21-AC5 |
| TS-04-150 | CS-11: dispatch retried with same key → one set of TransferOut movements | API | T1 | V1 | US-04-21-AC6 |
| TS-04-151 | CS-10: fault after first TransferOut insert → full rollback, reservations intact | Integration | T1 | V1 | US-04-21-AC6 |
| TS-04-152 | Full receipt creates linked destination batch with inherited fields; status Received | Integration | T2 | V1 | US-04-22-AC1 |
| TS-04-153 | CS-06: partial receipt then final short → TransferReturn + TransitLoss draft; statuses PartiallyReceived → Received | E2E | T1 | V1 | US-04-22-AC2 |
| TS-04-154 | Rejected damaged → TransferReturn + draft Damaged write-off in source | Integration | T2 | V1 | US-04-22-AC3 |
| TS-04-155 | Over-receipt → 422, no writes | API | T2 | V1 | US-04-22-AC4 |
| TS-04-156 | Second transfer increments same destination batch; direct batch stays separate | Integration | T2 | V1 | US-04-22-AC5 |
| TS-04-157 | CS-07 source-side user → 403; permission → 403; CS-08 → 404 | API | T1 | V1 | US-04-22-AC7 |
| TS-04-158 | CS-06: property-based conservation over random receipt/reject/short sequences | Unit | T1 | V1 | US-04-22-AC6 |
| TS-04-159 | CS-11: receipt retried with same key increments once | API | T1 | V1 | US-04-22-AC8 |
| TS-04-160 | Create cycle draft; empty scope → 422 | API | T2 | V1 | US-04-23-AC1 |
| TS-04-161 | Start snapshot lines with sequence, number, audit | Integration | T2 | V1 | US-04-23-AC2 |
| TS-04-162 | Overlapping start → 409 with batch list | Integration | T2 | V1 | US-04-23-AC3 |
| TS-04-163 | Sales during Counting succeed; movements after snapshot sequence | Concurrency | T1 | V1 | US-04-23-AC4 |
| TS-04-164 | Full count includes only OnHand > 0 batches | Integration | T2 | V1 | US-04-23-AC5 |
| TS-04-165 | 403 permission, 403 branch (CS-07), 404 other org (CS-08) | API | T1 | V1 | US-04-23-AC6 |
| TS-04-166 | Blind response omits snapshot/expected/variance for counters | API | T2 | V1 | US-04-24-AC1 |
| TS-04-167 | Record and overwrite count with audit | API | T2 | V1 | US-04-24-AC2 |
| TS-04-168 | Negative count, CountedAt before start or in future → 422 | API | T2 | V1 | US-04-24-AC3 |
| TS-04-169 | Found batch line added | Integration | T2 | V1 | US-04-24-AC4 |
| TS-04-170 | Incomplete submit → 422; exclude + count → PendingApproval + event | API | T2 | V1 | US-04-24-AC5 |
| TS-04-171 | Edit after submit → 409 | API | T2 | V1 | US-04-24-AC6 |
| TS-04-172 | 403 permission, 403 branch (CS-07), 404 other org (CS-08) | API | T1 | V1 | US-04-24-AC7 |
| TS-04-173 | Expected/variance formula with movements before and after CountedAt and sequence boundary | Unit | T2 | V1 | US-04-25-AC1 |
| TS-04-174 | Approval posts only non-zero variances against current balances | Integration | T2 | V1 | US-04-25-AC2 |
| TS-04-175 | Return for recount → Counting, only returned lines editable | API | T2 | V1 | US-04-25-AC3 |
| TS-04-176 | Self-approval → 403 | API | T2 | V1 | US-04-25-AC4 |
| TS-04-177 | Variance conflict → 409, nothing posted | Integration | T2 | V1 | US-04-25-AC5 |
| TS-04-178 | Found batch created with positive variance | Integration | T2 | V1 | US-04-25-AC6 |
| TS-04-179 | CS-10 failure after 4,000 movements → rollback; CS-11 retries → single posting; NFR-04-002 5,000 lines ≤ 15 s | Integration | T1 | V1 | US-04-25-AC7 |
| TS-04-180 | 403 permission, 403 branch (CS-07), 404 other org (CS-08) | API | T1 | V1 | US-04-25-AC8 |
| TS-04-181 | Snapshot buckets and values from ledger | Integration | T2 | MVP | US-04-26-AC1 |
| TS-04-182 | In-transit valued at source only | Integration | T2 | MVP | US-04-26-AC2 |
| TS-04-183 | As-of valuation equals ledger sums; NFR-04-012 p95 ≤ 5 s | Integration | T2 | MVP | US-04-26-AC3 |
| TS-04-184 | Rerun upserts without duplicates | Integration | T2 | MVP | US-04-26-AC4 |
| TS-04-185 | 403 permission, 403 branch (CS-07), 404 other org (CS-08) | API | T1 | MVP | US-04-26-AC5 |
| TS-04-186 | Availability across active branches, no cost fields, inactive excluded | API | T2 | V1 | US-04-27-AC1 |
| TS-04-187 | Missing permission → 403 | API | T2 | V1 | US-04-27-AC2 |
| TS-04-188 | CS-08: other-org medicine → 404 | API | T1 | V1 | US-04-27-AC3 |
| TS-04-189 | CS-07: branch detail of unassigned branch still 403 | API | T1 | V1 | US-04-27-AC4 |
| TS-04-190 | SourceAboveMax suggestion quantity formula | Integration | T3 | Future | US-04-28-AC1 |
| TS-04-191 | NearExpirySurplus suggestion bounded by sales and source minimum | Integration | T3 | Future | US-04-28-AC2 |
| TS-04-192 | Accept suggestion creates draft transfer; expired suggestion → 409 | API | T3 | Future | US-04-28-AC3 |
| TS-04-193 | 403 permission, CS-07 branch filtering, CS-08 other org → 404 | API | T3 | Future | US-04-28-AC4 |

---

## US-04-01: Batch model, status derivation, and batch views

### TS-04-001: List with medicine/onlyWithStock filters returns batches sorted by expiry ascending with correct totals

| Field | Value |
|---|---|
| Story | [US-04-01](../stories/EPIC-04-BATCH-INVENTORY/US-04-01-batch-model-and-batch-views.md) — Batch model, status derivation, and batch views |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-01-AC1 |
| Requirements | FR-04-001, FR-04-002, FR-04-003, FR-04-004, FR-04-005 |

**Story preconditions**
- The organization, branch, and medicines exist; the user is authenticated and assigned to the branch.
- `Batch` and `BatchBalance` tables exist with the check constraints in SPEC-04 §8.1. PostgreSQL Row-Level Security on `OrganizationId` is enabled from the MVP for all inventory tables.

**US-04-01-AC1 — Batch list filtered and sorted by expiry**

*Preconditions / test data*
1. medicine M in branch A has batches B1 (expiry 2027-01-31), B2 (2026-12-31), B3 (2027-06-30, OnHand 0)

*Steps*
1. a user with `inventory.batches.read` calls `GET /api/v1/branches/A/inventory/batches?medicineId=M&onlyWithStock=true`

*Expected results*
1. the response is 200 with items [B2, B1] in that order, each with batchNumber, expiryDate, status, onHand, reserved, sellable, and `totalCount` = 2

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-002: Batch detail shows balance, sellable, eligibility, lineage, last 20 movements

| Field | Value |
|---|---|
| Story | [US-04-01](../stories/EPIC-04-BATCH-INVENTORY/US-04-01-batch-model-and-batch-views.md) — Batch model, status derivation, and batch views |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-01-AC2 |
| Requirements | FR-04-001, FR-04-002, FR-04-003, FR-04-004, FR-04-005 |

**Story preconditions**
- The organization, branch, and medicines exist; the user is authenticated and assigned to the branch.
- `Batch` and `BatchBalance` tables exist with the check constraints in SPEC-04 §8.1. PostgreSQL Row-Level Security on `OrganizationId` is enabled from the MVP for all inventory tables.

**US-04-01-AC2 — Batch detail with eligibility and lineage**

*Preconditions / test data*
1. batch B1 in branch A has OnHand 50, Reserved 10, status `Active`, and was transferred to branch C creating batch C1

*Steps*
1. the user calls `GET /api/v1/branches/A/inventory/batches/B1`

*Expected results*
1. the response contains onHand 50, reserved 10, sellable 40, `saleEligible` true, `destinationBatches` [C1 with branch C], `sourceBatch` null, and at most the 20 most recent movements in descending BatchSequence

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-003: Status derivation table test over all combinations of quarantine/expired/OnHand

| Field | Value |
|---|---|
| Story | [US-04-01](../stories/EPIC-04-BATCH-INVENTORY/US-04-01-batch-model-and-batch-views.md) — Batch model, status derivation, and batch views |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-01-AC3 |
| Requirements | FR-04-001, FR-04-002, FR-04-003, FR-04-004, FR-04-005 |

**Story preconditions**
- The organization, branch, and medicines exist; the user is authenticated and assigned to the branch.
- `Batch` and `BatchBalance` tables exist with the check constraints in SPEC-04 §8.1. PostgreSQL Row-Level Security on `OrganizationId` is enabled from the MVP for all inventory tables.

**US-04-01-AC3 — Status precedence**

*Preconditions / test data*
1. a batch with ExpiryDate ≤ business date, OnHand 0, and QuarantinedAt set

*Steps*
1. its status is derived (posting recomputation or nightly job)

*Expected results*
1. the status is `Quarantined`
2. after release it is `Expired`
3. a non-expired, non-quarantined batch with OnHand 0 is `Depleted`
4. with OnHand > 0 it is `Active`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-004: Do-not-sell window batch shows sellable 0 with reason (CS-02 visibility)

| Field | Value |
|---|---|
| Story | [US-04-01](../stories/EPIC-04-BATCH-INVENTORY/US-04-01-batch-model-and-batch-views.md) — Batch model, status derivation, and batch views |
| Type / Execution | Integration / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-04-01-AC4 |
| Critical scenario | CS-02 |
| Requirements | FR-04-001, FR-04-002, FR-04-003, FR-04-004, FR-04-005 |

**Story preconditions**
- The organization, branch, and medicines exist; the user is authenticated and assigned to the branch.
- `Batch` and `BatchBalance` tables exist with the check constraints in SPEC-04 §8.1. PostgreSQL Row-Level Security on `OrganizationId` is enabled from the MVP for all inventory tables.

**US-04-01-AC4 — Sellable is zero for non-eligible batches**

*Preconditions / test data*
1. branch A has DoNotSellWindowDays 30 and batch B2 expires on business date + 20 with OnHand 15

*Steps*
1. the batch list is requested

*Expected results*
1. B2 shows sellable 0 and `saleEligible` false with `ineligibleReason` = `DoNotSellWindow`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-005: Cost fields omitted without `reports.inventory.read`; missing permission → 403

| Field | Value |
|---|---|
| Story | [US-04-01](../stories/EPIC-04-BATCH-INVENTORY/US-04-01-batch-model-and-batch-views.md) — Batch model, status derivation, and batch views |
| Type / Execution | API / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-01-AC5, US-04-01-AC6 |
| Requirements | FR-04-001, FR-04-002, FR-04-003, FR-04-004, FR-04-005 |

**Story preconditions**
- The organization, branch, and medicines exist; the user is authenticated and assigned to the branch.
- `Batch` and `BatchBalance` tables exist with the check constraints in SPEC-04 §8.1. PostgreSQL Row-Level Security on `OrganizationId` is enabled from the MVP for all inventory tables.

**US-04-01-AC5 — Costs hidden without inventory reports permission**

*Preconditions / test data*
1. a user has `inventory.batches.read` but not `reports.inventory.read`

*Steps*
1. the user requests the batch list or detail

*Expected results*
1. `unitCost` and value fields are absent from every item

**US-04-01-AC6 — Permission denied**

*Preconditions / test data*
1. a user without `inventory.batches.read`

*Steps*
1. the user calls the batch list endpoint

*Expected results*
1. the response is 403 `IDENTITY.PERMISSION_DENIED`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-006: CS-07 unassigned branch → 403; CS-08 other-org batch → 404; other-branch id via own route → 404

| Field | Value |
|---|---|
| Story | [US-04-01](../stories/EPIC-04-BATCH-INVENTORY/US-04-01-batch-model-and-batch-views.md) — Batch model, status derivation, and batch views |
| Type / Execution | API / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-04-01-AC7 |
| Critical scenario | CS-07, CS-08 |
| Requirements | FR-04-001, FR-04-002, FR-04-003, FR-04-004, FR-04-005 |

**Story preconditions**
- The organization, branch, and medicines exist; the user is authenticated and assigned to the branch.
- `Batch` and `BatchBalance` tables exist with the check constraints in SPEC-04 §8.1. PostgreSQL Row-Level Security on `OrganizationId` is enabled from the MVP for all inventory tables.

**US-04-01-AC7 — Cross-branch and cross-organization access**

*Preconditions / test data*
1. user U is assigned only to branch A of organization O1

*Steps*
1. U requests batches of branch B of O1, a batch of O2 by id, or batch B9 of branch B via route `/branches/A/...`

*Expected results*
1. the responses are 403 `IDENTITY.BRANCH_ACCESS_DENIED`, 404 `COMMON.NOT_FOUND`, and 404 `COMMON.NOT_FOUND` respectively, with no batch data in the body

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-04-02: Stock movement ledger and posting service

### TS-04-007: Outbound posting writes balance and a complete movement row with sequence and BalanceAfter

| Field | Value |
|---|---|
| Story | [US-04-02](../stories/EPIC-04-BATCH-INVENTORY/US-04-02-stock-movement-ledger-posting.md) — Stock movement ledger and posting service |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-02-AC1 |
| Requirements | FR-04-002, FR-04-006, FR-04-007, FR-04-008, FR-04-009, FR-04-010, FR-04-011 |

**Story preconditions**
- US-04-01 tables exist. The caller has an open transaction from the unit of work.
- The application database role has INSERT and SELECT but no UPDATE/DELETE on `inventory.stock_movements`.

**US-04-02-AC1 — Outbound posting writes movement and balance**

*Preconditions / test data*
1. batch B has OnHand 10, Reserved 0, LastMovementSequence 4, and the caller has locked B's balance row in its lock step

*Steps*
1. the caller posts `PostOutbound(B, Sale, 3, source Sale S1 line L1)` and commits

*Expected results*
1. OnHand = 7, LastMovementSequence = 5, and exactly one movement exists with QuantityDelta −3, BalanceAfter 7, BatchSequence 5, UnitCost = batch UnitCost, BusinessDate = branch business date, SourceDocumentType `Sale`, SourceDocumentId S1, SourceLineId L1, UserId and CorrelationId set

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-008: Outbound beyond OnHand → INSUFFICIENT_STOCK, nothing written

| Field | Value |
|---|---|
| Story | [US-04-02](../stories/EPIC-04-BATCH-INVENTORY/US-04-02-stock-movement-ledger-posting.md) — Stock movement ledger and posting service |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-02-AC2 |
| Requirements | FR-04-002, FR-04-006, FR-04-007, FR-04-008, FR-04-009, FR-04-010, FR-04-011 |

**Story preconditions**
- US-04-01 tables exist. The caller has an open transaction from the unit of work.
- The application database role has INSERT and SELECT but no UPDATE/DELETE on `inventory.stock_movements`.

**US-04-02-AC2 — Negative on-hand prevented**

*Preconditions / test data*
1. batch B has OnHand 2, Reserved 0

*Steps*
1. the caller posts an outbound quantity of 3

*Expected results*
1. the service returns `INVENTORY.INSUFFICIENT_STOCK` before writing, the caller's transaction rolls back, and OnHand stays 2 with no new movement

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-009: Decrease breaching Reserved ≤ OnHand → RESERVATION_CONFLICT

| Field | Value |
|---|---|
| Story | [US-04-02](../stories/EPIC-04-BATCH-INVENTORY/US-04-02-stock-movement-ledger-posting.md) — Stock movement ledger and posting service |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-02-AC3 |
| Requirements | FR-04-002, FR-04-006, FR-04-007, FR-04-008, FR-04-009, FR-04-010, FR-04-011 |

**Story preconditions**
- US-04-01 tables exist. The caller has an open transaction from the unit of work.
- The application database role has INSERT and SELECT but no UPDATE/DELETE on `inventory.stock_movements`.

**US-04-02-AC3 — Reserved cannot exceed on-hand**

*Preconditions / test data*
1. batch B has OnHand 10, Reserved 8

*Steps*
1. the caller posts an `AdjustmentDecrease` of 3 without consuming reservation

*Expected results*
1. the service returns `INVENTORY.RESERVATION_CONFLICT` (409) and nothing is written

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-010: App DB role UPDATE/DELETE on movements fails; OpenAPI has no mutation route for movements

| Field | Value |
|---|---|
| Story | [US-04-02](../stories/EPIC-04-BATCH-INVENTORY/US-04-02-stock-movement-ledger-posting.md) — Stock movement ledger and posting service |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-02-AC4 |
| Requirements | FR-04-002, FR-04-006, FR-04-007, FR-04-008, FR-04-009, FR-04-010, FR-04-011 |

**Story preconditions**
- US-04-01 tables exist. The caller has an open transaction from the unit of work.
- The application database role has INSERT and SELECT but no UPDATE/DELETE on `inventory.stock_movements`.

**US-04-02-AC4 — Ledger immutability**

*Preconditions / test data*
1. any stored movement

*Steps*
1. the application role issues UPDATE or DELETE on `inventory.stock_movements`, or a client looks for an update/delete endpoint

*Expected results*
1. the database rejects the statement with a privilege error and no such API route exists (OpenAPI contains no PUT/PATCH/DELETE on movements)

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-011: Matrix validation for all 15 types × sign × source document type

| Field | Value |
|---|---|
| Story | [US-04-02](../stories/EPIC-04-BATCH-INVENTORY/US-04-02-stock-movement-ledger-posting.md) — Stock movement ledger and posting service |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-02-AC5 |
| Requirements | FR-04-002, FR-04-006, FR-04-007, FR-04-008, FR-04-009, FR-04-010, FR-04-011 |

**Story preconditions**
- US-04-01 tables exist. The caller has an open transaction from the unit of work.
- The application database role has INSERT and SELECT but no UPDATE/DELETE on `inventory.stock_movements`.

**US-04-02-AC5 — Movement-type matrix enforced**

*Preconditions / test data*
1. a caller posts type `Sale` with a positive delta, or `TransferIn` with source document type `Sale`, or delta 0

*Steps*
1. the posting service validates the request

*Expected results*
1. it rejects with a programming error (500 `COMMON.INTERNAL_ERROR`, logged at Error) before any SQL write

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-012: Posting to a batch outside the lock set throws before SQL

| Field | Value |
|---|---|
| Story | [US-04-02](../stories/EPIC-04-BATCH-INVENTORY/US-04-02-stock-movement-ledger-posting.md) — Stock movement ledger and posting service |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-02-AC6 |
| Requirements | FR-04-002, FR-04-006, FR-04-007, FR-04-008, FR-04-009, FR-04-010, FR-04-011 |

**Story preconditions**
- US-04-01 tables exist. The caller has an open transaction from the unit of work.
- The application database role has INSERT and SELECT but no UPDATE/DELETE on `inventory.stock_movements`.

**US-04-02-AC6 — Posting on an unlocked batch rejected**

*Preconditions / test data*
1. the caller did not include batch B in its lock step

*Steps*
1. it posts a movement for B

*Expected results*
1. the service rejects with a programming error and no write occurs

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-013: Multi-batch transaction emits exactly one StockMovementsPosted message

| Field | Value |
|---|---|
| Story | [US-04-02](../stories/EPIC-04-BATCH-INVENTORY/US-04-02-stock-movement-ledger-posting.md) — Stock movement ledger and posting service |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-02-AC7 |
| Requirements | FR-04-002, FR-04-006, FR-04-007, FR-04-008, FR-04-009, FR-04-010, FR-04-011 |

**Story preconditions**
- US-04-01 tables exist. The caller has an open transaction from the unit of work.
- The application database role has INSERT and SELECT but no UPDATE/DELETE on `inventory.stock_movements`.

**US-04-02-AC7 — One StockMovementsPosted message per transaction**

*Preconditions / test data*
1. one transaction posts movements for 3 batches of 2 medicines

*Steps*
1. it commits

*Expected results*
1. exactly one `Inventory.StockMovementsPosted.v1` outbox message exists listing the branch, both medicine ids, and the 3 batch ids

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-04-03: Inbound find-or-create and return-to-batch contracts

### TS-04-014: Receipt into unknown key creates batch, balance, movement; number normalized

| Field | Value |
|---|---|
| Story | [US-04-03](../stories/EPIC-04-BATCH-INVENTORY/US-04-03-inbound-and-return-to-batch-contracts.md) — Inbound find-or-create and return-to-batch contracts |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-03-AC1 |
| Requirements | FR-04-001, FR-04-012, FR-04-013, FR-04-014, FR-04-015 |

**Story preconditions**
- US-04-02 posting service available; medicine is `Active` for inbound postings.

**US-04-03-AC1 — New batch created when no match**

*Preconditions / test data*
1. branch A has no batch of medicine M with number `B100`

*Steps*
1. `PostInbound` is called with key (A, M, `b100 `, 2027-03-31, cost 12.5000, supplier S) and quantity 60 of type `Receipt`

*Expected results*
1. a `Batch` with normalized number `B100`, its `BatchBalance` (OnHand 60), and one `Receipt` movement are created, and the batch id is returned

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-015: Same key increments existing batch with sequence 2

| Field | Value |
|---|---|
| Story | [US-04-03](../stories/EPIC-04-BATCH-INVENTORY/US-04-03-inbound-and-return-to-batch-contracts.md) — Inbound find-or-create and return-to-batch contracts |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-03-AC2 |
| Requirements | FR-04-001, FR-04-012, FR-04-013, FR-04-014, FR-04-015 |

**Story preconditions**
- US-04-02 posting service available; medicine is `Active` for inbound postings.

**US-04-03-AC2 — Matching batch incremented**

*Preconditions / test data*
1. batch `B100` exists with the identical receipt key and OnHand 60

*Steps*
1. `PostInbound` is called with the same key and quantity 40

*Expected results*
1. no new batch is created, OnHand = 100, and a second movement with BatchSequence 2 is written

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-016: Different cost creates second batch; FEFO preview orders by CreatedAt

| Field | Value |
|---|---|
| Story | [US-04-03](../stories/EPIC-04-BATCH-INVENTORY/US-04-03-inbound-and-return-to-batch-contracts.md) — Inbound find-or-create and return-to-batch contracts |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-03-AC3 |
| Requirements | FR-04-001, FR-04-012, FR-04-013, FR-04-014, FR-04-015 |

**Story preconditions**
- US-04-02 posting service available; medicine is `Active` for inbound postings.

**US-04-03-AC3 — Different cost or supplier creates a separate batch**

*Preconditions / test data*
1. batch `B100` exists with cost 12.5000 from supplier S

*Steps*
1. `PostInbound` is called with the same number and expiry but cost 13.0000

*Expected results*
1. a second batch with the same number and expiry is created
2. FEFO orders them by CreatedAt

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-017: Same number different expiry → 422 BATCH_EXPIRY_MISMATCH

| Field | Value |
|---|---|
| Story | [US-04-03](../stories/EPIC-04-BATCH-INVENTORY/US-04-03-inbound-and-return-to-batch-contracts.md) — Inbound find-or-create and return-to-batch contracts |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-03-AC4 |
| Requirements | FR-04-001, FR-04-012, FR-04-013, FR-04-014, FR-04-015 |

**Story preconditions**
- US-04-02 posting service available; medicine is `Active` for inbound postings.

**US-04-03-AC4 — Expiry mismatch rejected**

*Preconditions / test data*
1. batch `B100` of medicine M in branch A expires 2027-03-31

*Steps*
1. `PostInbound` is called for `B100` of M in A with expiry 2027-04-30

*Expected results*
1. the contract returns 422 `INVENTORY.BATCH_EXPIRY_MISMATCH` and nothing is written

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-018: Month/year normalization incl. leap February and invalid month

| Field | Value |
|---|---|
| Story | [US-04-03](../stories/EPIC-04-BATCH-INVENTORY/US-04-03-inbound-and-return-to-batch-contracts.md) — Inbound find-or-create and return-to-batch contracts |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-03-AC5 |
| Requirements | FR-04-001, FR-04-012, FR-04-013, FR-04-014, FR-04-015 |

**Story preconditions**
- US-04-02 posting service available; medicine is `Active` for inbound postings.

**US-04-03-AC5 — Month/year expiry normalization**

*Preconditions / test data*
1. an inbound request with expiry input `02/2028`

*Steps*
1. it is validated

*Expected results*
1. the stored ExpiryDate is 2028-02-29
2. input `13/2027` returns 422 `INVENTORY.EXPIRY_DATE_INVALID`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-019: SalesReturn into expired or quarantined batch rejected with BATCH_NOT_SELLABLE, nothing written; TransferReturn into the same batch accepted, sellable stays 0

| Field | Value |
|---|---|
| Story | [US-04-03](../stories/EPIC-04-BATCH-INVENTORY/US-04-03-inbound-and-return-to-batch-contracts.md) — Inbound find-or-create and return-to-batch contracts |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-03-AC6 |
| Requirements | FR-04-001, FR-04-012, FR-04-013, FR-04-014, FR-04-015 |

**Story preconditions**
- US-04-02 posting service available; medicine is `Active` for inbound postings.

**US-04-03-AC6 — Restock into an expired or quarantined batch is rejected**

*Preconditions / test data*
1. batch B sold 5 units and has since become `Expired` (or `Quarantined`)

*Steps*
1. `ReturnToBatch(B, SalesReturn, 2, …)` is called

*Expected results*
1. the contract returns 422 `INVENTORY.BATCH_NOT_SELLABLE` (reason `Expired` or `Quarantined`), no movement is written, and OnHand is unchanged
2. a `ReturnToBatch(B, TransferReturn, 2, …)` into the same batch is accepted and the batch stays non-sellable

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-020: Inbound to inactive medicine rejected; concurrent creation of same key yields one batch

| Field | Value |
|---|---|
| Story | [US-04-03](../stories/EPIC-04-BATCH-INVENTORY/US-04-03-inbound-and-return-to-batch-contracts.md) — Inbound find-or-create and return-to-batch contracts |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-03-AC7 |
| Requirements | FR-04-001, FR-04-012, FR-04-013, FR-04-014, FR-04-015 |

**Story preconditions**
- US-04-02 posting service available; medicine is `Active` for inbound postings.

**US-04-03-AC7 — Inbound to inactive medicine rejected**

*Preconditions / test data*
1. medicine M is `Inactive`

*Steps*
1. `PostInbound` is called for M

*Expected results*
1. the contract returns 422 `INVENTORY.MEDICINE_INACTIVE` and nothing is written

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-04-04: FEFO allocation service

### TS-04-021: Property-based: allocations sum to request, follow expiry/CreatedAt/Id order, never include ineligible batch

| Field | Value |
|---|---|
| Story | [US-04-04](../stories/EPIC-04-BATCH-INVENTORY/US-04-04-fefo-allocation-service.md) — FEFO allocation service |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-04-AC1, US-04-04-AC2 |
| Requirements | FR-04-016, FR-04-017, FR-04-018, FR-04-019, FR-04-020, FR-04-021, FR-04-022, FR-04-023, FR-04-042 |

**Story preconditions**
- Branch policy (time zone, `DoNotSellWindowDays`) available from SPEC-02; batches and balances exist.
- The caller has an open transaction (allocate mode).

**US-04-04-AC1 — Deterministic FEFO ordering**

*Preconditions / test data*
1. medicine M has eligible batches X (expiry 2027-01-31, created 10:00), Y (2027-01-31, created 09:00), Z (2026-12-31)

*Steps*
1. a `Sale` allocation for M is requested

*Expected results*
1. candidates are ordered Z, Y, X
2. when two batches share expiry and CreatedAt, the lower Batch.Id comes first

**US-04-04-AC2 — Line split across batches**

*Preconditions / test data*
1. Z has sellable 5 and Y has sellable 20

*Steps*
1. 12 units are requested

*Expected results*
1. allocations are Z = 5 and Y = 7, each with batchNumber, expiryDate, unitCost, and sellingPriceOverride

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-022: Split allocation across two batches with costs and overrides

| Field | Value |
|---|---|
| Story | [US-04-04](../stories/EPIC-04-BATCH-INVENTORY/US-04-04-fefo-allocation-service.md) — FEFO allocation service |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-04-AC2, US-04-04-AC11 |
| Requirements | FR-04-016, FR-04-017, FR-04-018, FR-04-019, FR-04-020, FR-04-021, FR-04-022, FR-04-023, FR-04-042 |

**Story preconditions**
- Branch policy (time zone, `DoNotSellWindowDays`) available from SPEC-02; batches and balances exist.
- The caller has an open transaction (allocate mode).

**US-04-04-AC2 — Line split across batches**

*Preconditions / test data*
1. Z has sellable 5 and Y has sellable 20

*Steps*
1. 12 units are requested

*Expected results*
1. allocations are Z = 5 and Y = 7, each with batchNumber, expiryDate, unitCost, and sellingPriceOverride

**US-04-04-AC11 — Selling price override returned**

*Preconditions / test data*
1. batch Y has SellingPriceOverride 95.0000

*Steps*
1. Y is allocated

*Expected results*
1. its allocation carries `sellingPriceOverride` 95.0000 and allocations from batches without override carry null

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-023: CS-02: expired-on-business-date, do-not-sell window, quarantined, fully reserved batches excluded

| Field | Value |
|---|---|
| Story | [US-04-04](../stories/EPIC-04-BATCH-INVENTORY/US-04-04-fefo-allocation-service.md) — FEFO allocation service |
| Type / Execution | Integration / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-04-04-AC3 |
| Critical scenario | CS-02 |
| Requirements | FR-04-016, FR-04-017, FR-04-018, FR-04-019, FR-04-020, FR-04-021, FR-04-022, FR-04-023, FR-04-042 |

**Story preconditions**
- Branch policy (time zone, `DoNotSellWindowDays`) available from SPEC-02; batches and balances exist.
- The caller has an open transaction (allocate mode).

**US-04-04-AC3 — Ineligible batches excluded (CS-02)**

*Preconditions / test data*
1. business date 2026-11-09, DoNotSellWindowDays 30, and batches E (expiry 2026-11-09), W (expiry 2026-12-09), Q (Quarantined, 2027-05-31), R (OnHand 4, Reserved 4), V (expiry 2026-12-10, sellable 3)

*Steps*
1. a `Sale` or `TransferReservation` allocation of 3 is requested

*Expected results*
1. only V is allocated
2. a request of 4 fails with `INVENTORY.INSUFFICIENT_STOCK` listing sellable 3

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-024: CS-02: Cairo midnight boundary with injected clock before the flagging job runs

| Field | Value |
|---|---|
| Story | [US-04-04](../stories/EPIC-04-BATCH-INVENTORY/US-04-04-fefo-allocation-service.md) — FEFO allocation service |
| Type / Execution | Integration / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-04-04-AC4 |
| Critical scenario | CS-02 |
| Requirements | FR-04-016, FR-04-017, FR-04-018, FR-04-019, FR-04-020, FR-04-021, FR-04-022, FR-04-023, FR-04-042 |

**Story preconditions**
- Branch policy (time zone, `DoNotSellWindowDays`) available from SPEC-02; batches and balances exist.
- The caller has an open transaction (allocate mode).

**US-04-04-AC4 — Business date from branch time zone, independent of nightly flag (CS-02)**

*Preconditions / test data*
1. batch E expires 2026-11-09, the branch time zone is `Africa/Cairo`, the clock is 2026-11-08T22:30Z (00:30 local on 2026-11-09), and the 00:05 flagging job has not run (status still `Active`)

*Steps*
1. a `Sale` allocation is requested

*Expected results*
1. E is excluded
2. at 2026-11-08T21:30Z (23:30 local on 2026-11-08) E is allocatable

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-025: Multi-line shortage returns all shortages; no writes

| Field | Value |
|---|---|
| Story | [US-04-04](../stories/EPIC-04-BATCH-INVENTORY/US-04-04-fefo-allocation-service.md) — FEFO allocation service |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-04-AC5 |
| Requirements | FR-04-016, FR-04-017, FR-04-018, FR-04-019, FR-04-020, FR-04-021, FR-04-022, FR-04-023, FR-04-042 |

**Story preconditions**
- Branch policy (time zone, `DoNotSellWindowDays`) available from SPEC-02; batches and balances exist.
- The caller has an open transaction (allocate mode).

**US-04-04-AC5 — All-or-nothing with shortages**

*Preconditions / test data*
1. line L1 (medicine M, 10 units, sellable 10) and line L2 (medicine N, 6 units, sellable 2)

*Steps*
1. allocation is requested in allocate mode

*Expected results*
1. it returns 409 `INVENTORY.INSUFFICIENT_STOCK` with `shortages` = [{lineKey L2, medicineId N, requested 6, sellable 2}] and nothing is allocated or written

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-026: CS-01: 2 concurrent transactions for the last unit → one success, one INSUFFICIENT_STOCK, OnHand 0, one movement

| Field | Value |
|---|---|
| Story | [US-04-04](../stories/EPIC-04-BATCH-INVENTORY/US-04-04-fefo-allocation-service.md) — FEFO allocation service |
| Type / Execution | Concurrency / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-04-04-AC6 |
| Critical scenario | CS-01 |
| Requirements | FR-04-016, FR-04-017, FR-04-018, FR-04-019, FR-04-020, FR-04-021, FR-04-022, FR-04-023, FR-04-042 |

**Story preconditions**
- Branch policy (time zone, `DoNotSellWindowDays`) available from SPEC-02; batches and balances exist.
- The caller has an open transaction (allocate mode).

**US-04-04-AC6 — Concurrent sale of the last unit (CS-01, with EPIC-06)**

*Preconditions / test data*
1. batch B is the only eligible batch of M with OnHand 1

*Steps*
1. two transactions request 1 unit of M simultaneously and each posts a `Sale` movement and commits

*Expected results*
1. exactly one succeeds
2. the other waits on the row lock, re-reads OnHand 0, and fails with `INVENTORY.INSUFFICIENT_STOCK`
3. final OnHand 0 and exactly one `Sale` movement exists

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-027: CS-01: 1,000 runs × 20 concurrent allocations on 1 unit; overlapping multi-line orders; 0 deadlocks, 0 negatives

| Field | Value |
|---|---|
| Story | [US-04-04](../stories/EPIC-04-BATCH-INVENTORY/US-04-04-fefo-allocation-service.md) — FEFO allocation service |
| Type / Execution | Concurrency / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-04-04-AC6, US-04-04-AC7 |
| Critical scenario | CS-01 |
| Requirements | FR-04-016, FR-04-017, FR-04-018, FR-04-019, FR-04-020, FR-04-021, FR-04-022, FR-04-023, FR-04-042 |

**Story preconditions**
- Branch policy (time zone, `DoNotSellWindowDays`) available from SPEC-02; batches and balances exist.
- The caller has an open transaction (allocate mode).

**US-04-04-AC6 — Concurrent sale of the last unit (CS-01, with EPIC-06)**

*Preconditions / test data*
1. batch B is the only eligible batch of M with OnHand 1

*Steps*
1. two transactions request 1 unit of M simultaneously and each posts a `Sale` movement and commits

*Expected results*
1. exactly one succeeds
2. the other waits on the row lock, re-reads OnHand 0, and fails with `INVENTORY.INSUFFICIENT_STOCK`
3. final OnHand 0 and exactly one `Sale` movement exists

**US-04-04-AC7 — Lock ordering prevents deadlock**

*Preconditions / test data*
1. transaction T1 requests lines [M (batches 7, 3)] then [N (batch 5)] and T2 requests [N] then [M] concurrently

*Steps*
1. both allocate

*Expected results*
1. each issues one `FOR UPDATE` over the union ordered by BatchId ascending (3, 5, 7)
2. no deadlock (40P01) occurs in 1,000 repetitions

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-028: Same medicine on two lines shares remaining quantity

| Field | Value |
|---|---|
| Story | [US-04-04](../stories/EPIC-04-BATCH-INVENTORY/US-04-04-fefo-allocation-service.md) — FEFO allocation service |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-04-AC8 |
| Requirements | FR-04-016, FR-04-017, FR-04-018, FR-04-019, FR-04-020, FR-04-021, FR-04-022, FR-04-023, FR-04-042 |

**Story preconditions**
- Branch policy (time zone, `DoNotSellWindowDays`) available from SPEC-02; batches and balances exist.
- The caller has an open transaction (allocate mode).

**US-04-04-AC8 — Same medicine on two lines**

*Preconditions / test data*
1. M has one eligible batch with sellable 5

*Steps*
1. lines L1 (M, 3) and L2 (M, 3) are requested

*Expected results*
1. the request fails with `INVENTORY.INSUFFICIENT_STOCK` showing L2 requested 3, sellable 2 (no double counting)

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-029: SupplierReturn purpose filters supplier, includes Expired/Quarantined; missing supplierId → 400

| Field | Value |
|---|---|
| Story | [US-04-04](../stories/EPIC-04-BATCH-INVENTORY/US-04-04-fefo-allocation-service.md) — FEFO allocation service |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-04-AC9 |
| Requirements | FR-04-016, FR-04-017, FR-04-018, FR-04-019, FR-04-020, FR-04-021, FR-04-022, FR-04-023, FR-04-042 |

**Story preconditions**
- Branch policy (time zone, `DoNotSellWindowDays`) available from SPEC-02; batches and balances exist.
- The caller has an open transaction (allocate mode).

**US-04-04-AC9 — Supplier-return purpose**

*Preconditions / test data*
1. M has batches from supplier S: S1 (Expired, sellable-by-balance 4), S2 (Quarantined, 6), and batch T1 from supplier T

*Steps*
1. a `SupplierReturn` allocation of 8 for supplier S is requested

*Expected results*
1. S1 = 4 and S2 = 4 are allocated in FEFO order and T1 is never considered
2. without `supplierId` the request is 400 `COMMON.VALIDATION_FAILED`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-030: Preview does not block on held locks and writes nothing

| Field | Value |
|---|---|
| Story | [US-04-04](../stories/EPIC-04-BATCH-INVENTORY/US-04-04-fefo-allocation-service.md) — FEFO allocation service |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-04-AC10 |
| Requirements | FR-04-016, FR-04-017, FR-04-018, FR-04-019, FR-04-020, FR-04-021, FR-04-022, FR-04-023, FR-04-042 |

**Story preconditions**
- Branch policy (time zone, `DoNotSellWindowDays`) available from SPEC-02; batches and balances exist.
- The caller has an open transaction (allocate mode).

**US-04-04-AC10 — Preview without locks**

*Preconditions / test data*
1. a user with `inventory.stock.read`

*Steps*
1. `POST /api/v1/branches/A/inventory/fefo-preview` is called while another transaction holds a lock on the batch

*Expected results*
1. the preview returns within 500 ms without waiting for the lock, with proposed allocations and per-batch sellable
2. a user without `inventory.stock.read` gets 403 `IDENTITY.PERMISSION_DENIED`, and an unassigned branch gets 403 `IDENTITY.BRANCH_ACCESS_DENIED`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-031: Preview: 403 without permission, 403 unassigned branch (CS-07), 404 other-org medicine (CS-08)

| Field | Value |
|---|---|
| Story | [US-04-04](../stories/EPIC-04-BATCH-INVENTORY/US-04-04-fefo-allocation-service.md) — FEFO allocation service |
| Type / Execution | API / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-04-04-AC10 |
| Critical scenario | CS-07, CS-08 |
| Requirements | FR-04-016, FR-04-017, FR-04-018, FR-04-019, FR-04-020, FR-04-021, FR-04-022, FR-04-023, FR-04-042 |

**Story preconditions**
- Branch policy (time zone, `DoNotSellWindowDays`) available from SPEC-02; batches and balances exist.
- The caller has an open transaction (allocate mode).

**US-04-04-AC10 — Preview without locks**

*Preconditions / test data*
1. a user with `inventory.stock.read`

*Steps*
1. `POST /api/v1/branches/A/inventory/fefo-preview` is called while another transaction holds a lock on the batch

*Expected results*
1. the preview returns within 500 ms without waiting for the lock, with proposed allocations and per-batch sellable
2. a user without `inventory.stock.read` gets 403 `IDENTITY.PERMISSION_DENIED`, and an unassigned branch gets 403 `IDENTITY.BRANCH_ACCESS_DENIED`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-032: NFR-04-001: 10 lines × 50 candidates p95 ≤ 50 ms at 500,000 batches

| Field | Value |
|---|---|
| Story | [US-04-04](../stories/EPIC-04-BATCH-INVENTORY/US-04-04-fefo-allocation-service.md) — FEFO allocation service |
| Type / Execution | Performance / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-04-AC1 |
| Requirements | FR-04-016, FR-04-017, FR-04-018, FR-04-019, FR-04-020, FR-04-021, FR-04-022, FR-04-023, FR-04-042 |

**Story preconditions**
- Branch policy (time zone, `DoNotSellWindowDays`) available from SPEC-02; batches and balances exist.
- The caller has an open transaction (allocate mode).

**US-04-04-AC1 — Deterministic FEFO ordering**

*Preconditions / test data*
1. medicine M has eligible batches X (expiry 2027-01-31, created 10:00), Y (2027-01-31, created 09:00), Z (2026-12-31)

*Steps*
1. a `Sale` allocation for M is requested

*Expected results*
1. candidates are ordered Z, Y, X
2. when two batches share expiry and CreatedAt, the lower Batch.Id comes first

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-04-05: FEFO override with permission

### TS-04-033: Override with permission allocates explicit batch, flags override, writes audit in same tx

| Field | Value |
|---|---|
| Story | [US-04-05](../stories/EPIC-04-BATCH-INVENTORY/US-04-05-fefo-override.md) — FEFO override with permission |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-04-05-AC1 |
| Requirements | FR-04-024 |

**Story preconditions**
- US-04-04 available; the caller passes the actor id and the actor's effective permissions.

**US-04-05-AC1 — Override with permission**

*Preconditions / test data*
1. FEFO first choice for M is batch Z and the pharmacist holds `inventory.batches.override-fefo`

*Steps*
1. a `Sale` allocation is requested with `explicitBatchId` = Y (eligible, sellable 10) for 4 units

*Expected results*
1. Y = 4 is allocated with `isFefoOverride` true and an audit entry (actor, medicine, FEFO batch Z, chosen batch Y, quantity) is written in the same transaction

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-034: Override without permission → 403 FEFO_OVERRIDE_NOT_PERMITTED

| Field | Value |
|---|---|
| Story | [US-04-05](../stories/EPIC-04-BATCH-INVENTORY/US-04-05-fefo-override.md) — FEFO override with permission |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-04-05-AC2 |
| Requirements | FR-04-024 |

**Story preconditions**
- US-04-04 available; the caller passes the actor id and the actor's effective permissions.

**US-04-05-AC2 — Override without permission rejected**

*Preconditions / test data*
1. a cashier without `inventory.batches.override-fefo`

*Steps*
1. the same request with `explicitBatchId` = Y is made

*Expected results*
1. the contract returns 403 `INVENTORY.FEFO_OVERRIDE_NOT_PERMITTED` and nothing is allocated

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-035: Explicit = FEFO first choice → no permission needed, not flagged

| Field | Value |
|---|---|
| Story | [US-04-05](../stories/EPIC-04-BATCH-INVENTORY/US-04-05-fefo-override.md) — FEFO override with permission |
| Type / Execution | Unit / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-04-05-AC3 |
| Requirements | FR-04-024 |

**Story preconditions**
- US-04-04 available; the caller passes the actor id and the actor's effective permissions.

**US-04-05-AC3 — Explicit batch equal to FEFO choice is not an override**

*Preconditions / test data*
1. the cashier lacks the override permission

*Steps*
1. `explicitBatchId` = Z (the FEFO first choice) is requested

*Expected results*
1. the allocation succeeds with `isFefoOverride` false and no override audit entry

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-036: CS-02: explicit expired / do-not-sell / quarantined batch rejected even with permission

| Field | Value |
|---|---|
| Story | [US-04-05](../stories/EPIC-04-BATCH-INVENTORY/US-04-05-fefo-override.md) — FEFO override with permission |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P1) |
| Release | MVP |
| Covers | US-04-05-AC4 |
| Critical scenario | CS-02 |
| Requirements | FR-04-024 |

**Story preconditions**
- US-04-04 available; the caller passes the actor id and the actor's effective permissions.

**US-04-05-AC4 — Ineligible batch never selectable (CS-02)**

*Preconditions / test data*
1. batch E is expired and batch Q is quarantined

*Steps*
1. a user with the override permission requests E or Q explicitly for a `Sale`

*Expected results*
1. the contract returns 422 `INVENTORY.BATCH_NOT_SELLABLE` with reason `Expired` or `Quarantined`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-037: Explicit batch insufficient → INSUFFICIENT_STOCK without top-up

| Field | Value |
|---|---|
| Story | [US-04-05](../stories/EPIC-04-BATCH-INVENTORY/US-04-05-fefo-override.md) — FEFO override with permission |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-04-05-AC5 |
| Requirements | FR-04-024 |

**Story preconditions**
- US-04-04 available; the caller passes the actor id and the actor's effective permissions.

**US-04-05-AC5 — Explicit batch must cover the whole line**

*Preconditions / test data*
1. Y has sellable 3

*Steps*
1. 4 units are requested explicitly from Y

*Expected results*
1. the contract returns 409 `INVENTORY.INSUFFICIENT_STOCK` with sellable 3 (no FEFO top-up)

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-038: Wrong branch/medicine → 422; other-org batch → 404 (CS-08)

| Field | Value |
|---|---|
| Story | [US-04-05](../stories/EPIC-04-BATCH-INVENTORY/US-04-05-fefo-override.md) — FEFO override with permission |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P1) |
| Release | MVP |
| Covers | US-04-05-AC6 |
| Critical scenario | CS-08 |
| Requirements | FR-04-024 |

**Story preconditions**
- US-04-04 available; the caller passes the actor id and the actor's effective permissions.

**US-04-05-AC6 — Batch of another branch or medicine**

*Preconditions / test data*
1. batch K belongs to branch B or to medicine N

*Steps*
1. it is requested explicitly for medicine M in branch A

*Expected results*
1. the contract returns 422 `INVENTORY.BATCH_NOT_SELLABLE` with reason `WrongBranch` or `WrongMedicine`
2. a batch id of another organization returns 404 `COMMON.NOT_FOUND`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-04-06: Posting transactions, idempotency, and failure guarantees

### TS-04-039: CS-10: fault injection after N SQL commands (N = 1..k) for adjustment, write-off, opening balance, transfer dispatch/receipt, stocktake approval — all tables unchanged

| Field | Value |
|---|---|
| Story | [US-04-06](../stories/EPIC-04-BATCH-INVENTORY/US-04-06-posting-transactions-idempotency-and-failure.md) — Posting transactions, idempotency, and failure guarantees |
| Type / Execution | Integration / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-04-06-AC1 |
| Critical scenario | CS-10 |
| Requirements | FR-04-008, FR-04-011, FR-04-019, FR-04-025, FR-04-026, FR-04-027, FR-04-028 |

**Story preconditions**
- Unit of work, idempotency filter, audit interceptor, and outbox from BuildingBlocks are available.
- Posting endpoints are flagged `[RequiresIdempotencyKey]` (SPEC-04 §10).

**US-04-06-AC1 — Full rollback on failure mid-posting (CS-10)**

*Preconditions / test data*
1. a 3-line adjustment below threshold in `Draft` and a fault injector that raises a database error after the 2nd movement insert

*Steps*
1. the user submits it

*Expected results*
1. the response is 500 `COMMON.INTERNAL_ERROR`
2. no movement, balance change, document number, status change, audit entry, outbox message, or idempotency record exists
3. the document remains `Draft`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-040: CS-10: connection kill before COMMIT then retry with same key → single effect

| Field | Value |
|---|---|
| Story | [US-04-06](../stories/EPIC-04-BATCH-INVENTORY/US-04-06-posting-transactions-idempotency-and-failure.md) — Posting transactions, idempotency, and failure guarantees |
| Type / Execution | Integration / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-04-06-AC2 |
| Critical scenario | CS-10, CS-11 |
| Requirements | FR-04-008, FR-04-011, FR-04-019, FR-04-025, FR-04-026, FR-04-027, FR-04-028 |

**Story preconditions**
- Unit of work, idempotency filter, audit interceptor, and outbox from BuildingBlocks are available.
- Posting endpoints are flagged `[RequiresIdempotencyKey]` (SPEC-04 §10).

**US-04-06-AC2 — Connection lost before commit, retry succeeds once (CS-10, CS-11)**

*Preconditions / test data*
1. the database connection is terminated after all writes but before COMMIT of a write-off approval

*Steps*
1. the client retries with the same `Idempotency-Key`

*Expected results*
1. the retry posts the write-off once
2. exactly one set of movements and one document number exist

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-041: CS-11: sequential replay of dispatch with same key returns identical response, one movement set

| Field | Value |
|---|---|
| Story | [US-04-06](../stories/EPIC-04-BATCH-INVENTORY/US-04-06-posting-transactions-idempotency-and-failure.md) — Posting transactions, idempotency, and failure guarantees |
| Type / Execution | API / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-04-06-AC3 |
| Critical scenario | CS-11 |
| Requirements | FR-04-008, FR-04-011, FR-04-019, FR-04-025, FR-04-026, FR-04-027, FR-04-028 |

**Story preconditions**
- Unit of work, idempotency filter, audit interceptor, and outbox from BuildingBlocks are available.
- Posting endpoints are flagged `[RequiresIdempotencyKey]` (SPEC-04 §10).

**US-04-06-AC3 — Sequential replay returns the same response (CS-11)**

*Preconditions / test data*
1. a transfer dispatch completed with key K and response 200

*Steps*
1. the same request with key K is sent again within 24 h

*Expected results*
1. the stored response (same status and body) is returned, and no additional `TransferOut` movement or audit entry is written

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-042: CS-11: same key different document → 422 IDEMPOTENCY_KEY_REUSED

| Field | Value |
|---|---|
| Story | [US-04-06](../stories/EPIC-04-BATCH-INVENTORY/US-04-06-posting-transactions-idempotency-and-failure.md) — Posting transactions, idempotency, and failure guarantees |
| Type / Execution | API / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-04-06-AC4 |
| Critical scenario | CS-11 |
| Requirements | FR-04-008, FR-04-011, FR-04-019, FR-04-025, FR-04-026, FR-04-027, FR-04-028 |

**Story preconditions**
- Unit of work, idempotency filter, audit interceptor, and outbox from BuildingBlocks are available.
- Posting endpoints are flagged `[RequiresIdempotencyKey]` (SPEC-04 §10).

**US-04-06-AC4 — Same key with a different body**

*Preconditions / test data*
1. key K was used for adjustment approval of document D1

*Steps*
1. key K is sent for approval of document D2

*Expected results*
1. the response is 422 `COMMON.IDEMPOTENCY_KEY_REUSED` and nothing is written

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-043: CS-11: concurrent duplicate stocktake approval → one effect, both responses identical

| Field | Value |
|---|---|
| Story | [US-04-06](../stories/EPIC-04-BATCH-INVENTORY/US-04-06-posting-transactions-idempotency-and-failure.md) — Posting transactions, idempotency, and failure guarantees |
| Type / Execution | Concurrency / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-04-06-AC5 |
| Critical scenario | CS-11 |
| Requirements | FR-04-008, FR-04-011, FR-04-019, FR-04-025, FR-04-026, FR-04-027, FR-04-028 |

**Story preconditions**
- Unit of work, idempotency filter, audit interceptor, and outbox from BuildingBlocks are available.
- Posting endpoints are flagged `[RequiresIdempotencyKey]` (SPEC-04 §10).

**US-04-06-AC5 — Concurrent duplicate requests (CS-11)**

*Preconditions / test data*
1. two identical stocktake approval requests with key K arrive simultaneously

*Steps*
1. both execute

*Expected results*
1. the second blocks on the idempotency record insert until the first commits, then replays the first response
2. variance movements exist once

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-044: Missing key on each posting endpoint → 400

| Field | Value |
|---|---|
| Story | [US-04-06](../stories/EPIC-04-BATCH-INVENTORY/US-04-06-posting-transactions-idempotency-and-failure.md) — Posting transactions, idempotency, and failure guarantees |
| Type / Execution | API / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-06-AC6 |
| Requirements | FR-04-008, FR-04-011, FR-04-019, FR-04-025, FR-04-026, FR-04-027, FR-04-028 |

**Story preconditions**
- Unit of work, idempotency filter, audit interceptor, and outbox from BuildingBlocks are available.
- Posting endpoints are flagged `[RequiresIdempotencyKey]` (SPEC-04 §10).

**US-04-06-AC6 — Missing key**

*Preconditions / test data*
1. a posting endpoint requiring idempotency

*Steps*
1. the request has no `Idempotency-Key` header

*Expected results*
1. the response is 400 `COMMON.IDEMPOTENCY_KEY_REQUIRED`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-045: Held lock > 3 s → 503 LOCK_TIMEOUT, nothing written, retry succeeds

| Field | Value |
|---|---|
| Story | [US-04-06](../stories/EPIC-04-BATCH-INVENTORY/US-04-06-posting-transactions-idempotency-and-failure.md) — Posting transactions, idempotency, and failure guarantees |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-06-AC7 |
| Requirements | FR-04-008, FR-04-011, FR-04-019, FR-04-025, FR-04-026, FR-04-027, FR-04-028 |

**Story preconditions**
- Unit of work, idempotency filter, audit interceptor, and outbox from BuildingBlocks are available.
- Posting endpoints are flagged `[RequiresIdempotencyKey]` (SPEC-04 §10).

**US-04-06-AC7 — Lock timeout**

*Preconditions / test data*
1. another transaction holds a lock on a batch balance for longer than 3 s

*Steps*
1. an adjustment submit needs that batch

*Expected results*
1. the response is 503 `COMMON.LOCK_TIMEOUT` with `Retry-After: 1`, nothing is written, and a retry with the same key after the lock is released succeeds

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-046: Injected deadlock retried; three failures → 503 TRANSIENT_CONFLICT

| Field | Value |
|---|---|
| Story | [US-04-06](../stories/EPIC-04-BATCH-INVENTORY/US-04-06-posting-transactions-idempotency-and-failure.md) — Posting transactions, idempotency, and failure guarantees |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-06-AC8 |
| Requirements | FR-04-008, FR-04-011, FR-04-019, FR-04-025, FR-04-026, FR-04-027, FR-04-028 |

**Story preconditions**
- Unit of work, idempotency filter, audit interceptor, and outbox from BuildingBlocks are available.
- Posting endpoints are flagged `[RequiresIdempotencyKey]` (SPEC-04 §10).

**US-04-06-AC8 — Deadlock retried transparently**

*Preconditions / test data*
1. a deadlock (40P01) is injected on the first attempt of a dispatch

*Steps*
1. the execution strategy retries

*Expected results*
1. the second attempt succeeds and the client receives one success
2. after 3 failed attempts the response is 503 `COMMON.TRANSIENT_CONFLICT`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-047: 403 permission, 403 branch (CS-07), 404 other org (CS-08); no idempotency record stored

| Field | Value |
|---|---|
| Story | [US-04-06](../stories/EPIC-04-BATCH-INVENTORY/US-04-06-posting-transactions-idempotency-and-failure.md) — Posting transactions, idempotency, and failure guarantees |
| Type / Execution | API / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-04-06-AC9 |
| Critical scenario | CS-07, CS-08 |
| Requirements | FR-04-008, FR-04-011, FR-04-019, FR-04-025, FR-04-026, FR-04-027, FR-04-028 |

**Story preconditions**
- Unit of work, idempotency filter, audit interceptor, and outbox from BuildingBlocks are available.
- Posting endpoints are flagged `[RequiresIdempotencyKey]` (SPEC-04 §10).

**US-04-06-AC9 — Unauthorized posting attempts leave no trace**

*Preconditions / test data*
1. a user without `inventory.adjustments.create`, or assigned to another branch, or calling a document id of another organization

*Steps*
1. the user calls the submit endpoint with a valid key

*Expected results*
1. the responses are 403 `IDENTITY.PERMISSION_DENIED`, 403 `IDENTITY.BRANCH_ACCESS_DENIED`, 404 `COMMON.NOT_FOUND`, and no idempotency record is stored

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-04-07: Branch stock overview

### TS-04-048: Aggregates per bucket computed correctly for mixed batch statuses

| Field | Value |
|---|---|
| Story | [US-04-07](../stories/EPIC-04-BATCH-INVENTORY/US-04-07-branch-stock-overview.md) — Branch stock overview |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-07-AC1 |
| Requirements | FR-04-005, FR-04-029, FR-04-030, FR-04-054 |

**Story preconditions**
- Batches, balances, reorder settings (optional), and transfers (optional) exist.

**US-04-07-AC1 — Per-medicine aggregates**

*Preconditions / test data*
1. medicine M in branch A has batches: Active OnHand 40 Reserved 5 (expiry in 200 days), Active OnHand 10 (expiry in 60 days, near-expiry threshold 90), Expired OnHand 3, Quarantined OnHand 7

*Steps*
1. a user with `inventory.stock.read` calls `GET /api/v1/branches/A/inventory/stock?search=M`

*Expected results*
1. the row for M shows onHand 60, reserved 5, sellable 45, nearExpiry 10, expired 3, quarantined 7, and earliestSellableExpiry = the 60-day batch's expiry

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-049: CS-06: in-transit outbound/inbound shown in both branches, excluded from onHand

| Field | Value |
|---|---|
| Story | [US-04-07](../stories/EPIC-04-BATCH-INVENTORY/US-04-07-branch-stock-overview.md) — Branch stock overview |
| Type / Execution | Integration / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-04-07-AC2 |
| Critical scenario | CS-06 |
| Requirements | FR-04-005, FR-04-029, FR-04-030, FR-04-054 |

**Story preconditions**
- Batches, balances, reorder settings (optional), and transfers (optional) exist.

**US-04-07-AC2 — In-transit columns**

*Preconditions / test data*
1. an `InTransit` transfer from A to C with 12 outstanding units of M

*Steps*
1. branch A and branch C overviews are requested

*Expected results*
1. A shows inTransitOutbound 12 and C shows inTransitInbound 12, and neither branch's onHand includes the 12 units

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-050: Low-stock filter, pagination, pageSize limit

| Field | Value |
|---|---|
| Story | [US-04-07](../stories/EPIC-04-BATCH-INVENTORY/US-04-07-branch-stock-overview.md) — Branch stock overview |
| Type / Execution | API / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-07-AC3 |
| Requirements | FR-04-005, FR-04-029, FR-04-030, FR-04-054 |

**Story preconditions**
- Batches, balances, reorder settings (optional), and transfers (optional) exist.

**US-04-07-AC3 — Filters and pagination**

*Preconditions / test data*
1. 300 medicines with stock in branch A, 12 of them Low against their ReorderSetting

*Steps*
1. the overview is requested with `lowStock=true&pageSize=10`

*Expected results*
1. 10 items are returned with `totalCount` 12
2. `pageSize=101` returns 400 `COMMON.VALIDATION_FAILED`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-051: Value fields gated by reports.inventory.read; value rounding

| Field | Value |
|---|---|
| Story | [US-04-07](../stories/EPIC-04-BATCH-INVENTORY/US-04-07-branch-stock-overview.md) — Branch stock overview |
| Type / Execution | API / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-07-AC4 |
| Requirements | FR-04-005, FR-04-029, FR-04-030, FR-04-054 |

**Story preconditions**
- Batches, balances, reorder settings (optional), and transfers (optional) exist.

**US-04-07-AC4 — Value fields gated**

*Preconditions / test data*
1. a cashier with `inventory.stock.read` but without `reports.inventory.read`

*Steps*
1. the overview is requested

*Expected results*
1. no `value` or cost field is present
2. for an accountant with `reports.inventory.read` each row includes `onHandValue` = Σ(OnHand × UnitCost) rounded to 2 decimals

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-052: 403 permission, 403 branch (CS-07), 404 other org (CS-08)

| Field | Value |
|---|---|
| Story | [US-04-07](../stories/EPIC-04-BATCH-INVENTORY/US-04-07-branch-stock-overview.md) — Branch stock overview |
| Type / Execution | API / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-04-07-AC5 |
| Critical scenario | CS-07, CS-08 |
| Requirements | FR-04-005, FR-04-029, FR-04-030, FR-04-054 |

**Story preconditions**
- Batches, balances, reorder settings (optional), and transfers (optional) exist.

**US-04-07-AC5 — Authorization**

*Preconditions / test data*
1. a user without `inventory.stock.read`, a user not assigned to branch B, and a branch id of another organization

*Steps*
1. each calls the overview

*Expected results*
1. the responses are 403 `IDENTITY.PERMISSION_DENIED`, 403 `IDENTITY.BRANCH_ACCESS_DENIED`, and 404 `COMMON.NOT_FOUND`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-053: NFR-04-004: 10,000 medicines, page 25, p95 ≤ 500 ms

| Field | Value |
|---|---|
| Story | [US-04-07](../stories/EPIC-04-BATCH-INVENTORY/US-04-07-branch-stock-overview.md) — Branch stock overview |
| Type / Execution | Performance / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-07-AC1, US-04-07-AC3 |
| Requirements | FR-04-005, FR-04-029, FR-04-030, FR-04-054 |

**Story preconditions**
- Batches, balances, reorder settings (optional), and transfers (optional) exist.

**US-04-07-AC1 — Per-medicine aggregates**

*Preconditions / test data*
1. medicine M in branch A has batches: Active OnHand 40 Reserved 5 (expiry in 200 days), Active OnHand 10 (expiry in 60 days, near-expiry threshold 90), Expired OnHand 3, Quarantined OnHand 7

*Steps*
1. a user with `inventory.stock.read` calls `GET /api/v1/branches/A/inventory/stock?search=M`

*Expected results*
1. the row for M shows onHand 60, reserved 5, sellable 45, nearExpiry 10, expired 3, quarantined 7, and earliestSellableExpiry = the 60-day batch's expiry

**US-04-07-AC3 — Filters and pagination**

*Preconditions / test data*
1. 300 medicines with stock in branch A, 12 of them Low against their ReorderSetting

*Steps*
1. the overview is requested with `lowStock=true&pageSize=10`

*Expected results*
1. 10 items are returned with `totalCount` 12
2. `pageSize=101` returns 400 `COMMON.VALIDATION_FAILED`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-04-08: Stock card and movement history

### TS-04-054: Stock card ordering and running balance across movement types

| Field | Value |
|---|---|
| Story | [US-04-08](../stories/EPIC-04-BATCH-INVENTORY/US-04-08-stock-card-and-movement-history.md) — Stock card and movement history |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-08-AC1 |
| Requirements | FR-04-030, FR-04-031 |

**Story preconditions**
- Movements exist; source document numbers are resolvable through module query facades.

**US-04-08-AC1 — Ordered stock card with running balance**

*Preconditions / test data*
1. batch B of medicine M has movements OpeningBalance +100, Sale −3, SalesReturn +1, AdjustmentDecrease −2

*Steps*
1. a user with `inventory.movements.read` calls `GET /api/v1/branches/A/inventory/medicines/M/stock-card?batchId=B`

*Expected results*
1. rows are returned in BatchSequence order with balanceAfter 100, 97, 98, 96, each with type, quantityDelta, source document type, document number, link, user display name, occurredAt (branch local time), and businessDate

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-055: Cursor pagination without gaps/duplicates; type/date filters; limit validation

| Field | Value |
|---|---|
| Story | [US-04-08](../stories/EPIC-04-BATCH-INVENTORY/US-04-08-stock-card-and-movement-history.md) — Stock card and movement history |
| Type / Execution | API / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-08-AC2 |
| Requirements | FR-04-030, FR-04-031 |

**Story preconditions**
- Movements exist; source document numbers are resolvable through module query facades.

**US-04-08-AC2 — Cursor pagination and filters**

*Preconditions / test data*
1. medicine M has 1,500 movements across 4 batches

*Steps*
1. the card is requested with `limit=200`, then with the returned `cursor`, and with `type=Sale&from=2026-10-01&to=2026-10-31`

*Expected results*
1. pages contain 200 rows without duplicates or gaps, the last page has no `nextCursor`, and the filtered call returns only Sale movements with business dates in October 2026
2. `limit=201` returns 400 `COMMON.VALIDATION_FAILED`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-056: XLSX export ≤ 100,000 rows sync; > 100,000 rows background export

| Field | Value |
|---|---|
| Story | [US-04-08](../stories/EPIC-04-BATCH-INVENTORY/US-04-08-stock-card-and-movement-history.md) — Stock card and movement history |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-08-AC3 |
| Requirements | FR-04-030, FR-04-031 |

**Story preconditions**
- Movements exist; source document numbers are resolvable through module query facades.

**US-04-08-AC3 — Export**

*Preconditions / test data*
1. a user with `inventory.movements.read` and `reports.export`

*Steps*
1. the stock card export is requested for ≤ 100,000 rows as XLSX

*Expected results*
1. a file is produced with the same columns and Arabic/English headers per user language
2. for > 100,000 rows a background export is created (202 with export id) and completion is notified

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-057: Cost columns absent without reports.inventory.read

| Field | Value |
|---|---|
| Story | [US-04-08](../stories/EPIC-04-BATCH-INVENTORY/US-04-08-stock-card-and-movement-history.md) — Stock card and movement history |
| Type / Execution | API / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-08-AC4 |
| Requirements | FR-04-030, FR-04-031 |

**Story preconditions**
- Movements exist; source document numbers are resolvable through module query facades.

**US-04-08-AC4 — Cost columns gated**

*Preconditions / test data*
1. a user without `reports.inventory.read`

*Steps*
1. the stock card or export is requested

*Expected results*
1. unitCost and value columns are absent

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-058: 403 permission, 403 branch (CS-07), 404 other org (CS-08), export without reports.export

| Field | Value |
|---|---|
| Story | [US-04-08](../stories/EPIC-04-BATCH-INVENTORY/US-04-08-stock-card-and-movement-history.md) — Stock card and movement history |
| Type / Execution | API / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-04-08-AC5 |
| Critical scenario | CS-07, CS-08 |
| Requirements | FR-04-030, FR-04-031 |

**Story preconditions**
- Movements exist; source document numbers are resolvable through module query facades.

**US-04-08-AC5 — Authorization**

*Preconditions / test data*
1. a user without `inventory.movements.read`, a user not assigned to branch B, and a medicine id of another organization

*Steps*
1. each requests a stock card

*Expected results*
1. the responses are 403 `IDENTITY.PERMISSION_DENIED`, 403 `IDENTITY.BRANCH_ACCESS_DENIED`, and 404 `COMMON.NOT_FOUND`
2. export without `reports.export` is 403 `IDENTITY.PERMISSION_DENIED`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-059: NFR-04-004: first page p95 ≤ 300 ms at 20 million movements

| Field | Value |
|---|---|
| Story | [US-04-08](../stories/EPIC-04-BATCH-INVENTORY/US-04-08-stock-card-and-movement-history.md) — Stock card and movement history |
| Type / Execution | Performance / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-08-AC2 |
| Requirements | FR-04-030, FR-04-031 |

**Story preconditions**
- Movements exist; source document numbers are resolvable through module query facades.

**US-04-08-AC2 — Cursor pagination and filters**

*Preconditions / test data*
1. medicine M has 1,500 movements across 4 batches

*Steps*
1. the card is requested with `limit=200`, then with the returned `cursor`, and with `type=Sale&from=2026-10-01&to=2026-10-31`

*Expected results*
1. pages contain 200 rows without duplicates or gaps, the last page has no `nextCursor`, and the filtered call returns only Sale movements with business dates in October 2026
2. `limit=201` returns 400 `COMMON.VALIDATION_FAILED`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-04-09: Opening balance documents and lock

### TS-04-060: Post 3-line opening balance: batches, movements, number, audit

| Field | Value |
|---|---|
| Story | [US-04-09](../stories/EPIC-04-BATCH-INVENTORY/US-04-09-opening-balance-documents.md) — Opening balance documents and lock |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-09-AC1 |
| Requirements | FR-04-015, FR-04-032, FR-04-033 |

**Story preconditions**
- Branch `Active`; `BranchSettings.OpeningBalanceLocked = false`; medicines exist in the catalog.

**US-04-09-AC1 — Create and post an opening balance**

*Preconditions / test data*
1. an owner with `inventory.opening-balances.manage` creates a draft with 3 lines (M1 batch `A1` exp 2027-05-31 cost 10.0000 qty 100
2. M2 `B7` exp 2026-12-31 cost 4.2500 qty 40
3. M2 `B8` exp 2027-08-31 cost 4.5000 qty 20)

*Steps*
1. the owner posts it with an `Idempotency-Key`

*Expected results*
1. status is `Posted`, number `{BranchCode}-OPB-2026-000001` is assigned, 3 batches are created with `OpeningBalance` movements and balances 100/40/20, and one audit entry records the post

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-061: Pack + base-unit conversion to base units

| Field | Value |
|---|---|
| Story | [US-04-09](../stories/EPIC-04-BATCH-INVENTORY/US-04-09-opening-balance-documents.md) — Opening balance documents and lock |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-09-AC2 |
| Requirements | FR-04-015, FR-04-032, FR-04-033 |

**Story preconditions**
- Branch `Active`; `BranchSettings.OpeningBalanceLocked = false`; medicines exist in the catalog.

**US-04-09-AC2 — Pack quantity conversion**

*Preconditions / test data*
1. M1 has PackSize 20

*Steps*
1. a line is entered as 5 packs plus 3 base units

*Expected results*
1. the stored line quantity is 103 base units and the movement QuantityDelta is +103

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-062: Expired opening balance batch flagged Expired and non-sellable

| Field | Value |
|---|---|
| Story | [US-04-09](../stories/EPIC-04-BATCH-INVENTORY/US-04-09-opening-balance-documents.md) — Opening balance documents and lock |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-09-AC3 |
| Requirements | FR-04-015, FR-04-032, FR-04-033 |

**Story preconditions**
- Branch `Active`; `BranchSettings.OpeningBalanceLocked = false`; medicines exist in the catalog.

**US-04-09-AC3 — Expired stock accepted as Expired**

*Preconditions / test data*
1. a line with expiry `09/2026` and business date 2026-11-09

*Steps*
1. the document is posted

*Expected results*
1. the batch is created with ExpiryDate 2026-09-30 and status `Expired`, sellable 0, and appears in the expired write-off prefill

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-063: Lock then post → 409 OPENING_BALANCE_LOCKED

| Field | Value |
|---|---|
| Story | [US-04-09](../stories/EPIC-04-BATCH-INVENTORY/US-04-09-opening-balance-documents.md) — Opening balance documents and lock |
| Type / Execution | API / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-09-AC4 |
| Requirements | FR-04-015, FR-04-032, FR-04-033 |

**Story preconditions**
- Branch `Active`; `BranchSettings.OpeningBalanceLocked = false`; medicines exist in the catalog.

**US-04-09-AC4 — Lock opening balances**

*Preconditions / test data*
1. opening balances were posted for branch A

*Steps*
1. the owner calls `POST /api/v1/branches/A/inventory/opening-balances/lock`

*Expected results*
1. `OpeningBalanceLocked` becomes true, an audit entry is written, and a subsequent post of another draft returns 409 `INVENTORY.OPENING_BALANCE_LOCKED` with the draft unchanged

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-064: Line count, cost, and expiry mismatch validations

| Field | Value |
|---|---|
| Story | [US-04-09](../stories/EPIC-04-BATCH-INVENTORY/US-04-09-opening-balance-documents.md) — Opening balance documents and lock |
| Type / Execution | API / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-09-AC5 |
| Requirements | FR-04-015, FR-04-032, FR-04-033 |

**Story preconditions**
- Branch `Active`; `BranchSettings.OpeningBalanceLocked = false`; medicines exist in the catalog.

**US-04-09-AC5 — Line limit and validation**

*Preconditions / test data*
1. a draft with 5,001 lines, or a line with cost −1, or a line whose batch number exists with another expiry

*Steps*
1. it is saved or posted

*Expected results*
1. the response is 422 `INVENTORY.DOCUMENT_LINES_INVALID`, `INVENTORY.UNIT_COST_INVALID`, or `INVENTORY.BATCH_EXPIRY_MISMATCH` respectively and nothing is posted

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-065: NFR-04-003: 5,000-line post p95 ≤ 30 s

| Field | Value |
|---|---|
| Story | [US-04-09](../stories/EPIC-04-BATCH-INVENTORY/US-04-09-opening-balance-documents.md) — Opening balance documents and lock |
| Type / Execution | Performance / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-04-09-AC6 |
| Critical scenario | CS-10, CS-11 |
| Requirements | FR-04-015, FR-04-032, FR-04-033 |

**Story preconditions**
- Branch `Active`; `BranchSettings.OpeningBalanceLocked = false`; medicines exist in the catalog.

**US-04-09-AC6 — Atomic posting and retry (CS-10, CS-11)**

*Preconditions / test data*
1. a 5,000-line draft

*Steps*
1. a failure is injected at line 4,999 and then the client retries with the same key twice

*Expected results*
1. after the failure no batch, movement, or number exists
2. the first retry posts all 5,000 lines
3. the second retry replays the response with no extra movements

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-066: CS-10: injected failure at line 4,999 leaves no trace

| Field | Value |
|---|---|
| Story | [US-04-09](../stories/EPIC-04-BATCH-INVENTORY/US-04-09-opening-balance-documents.md) — Opening balance documents and lock |
| Type / Execution | Integration / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-04-09-AC6 |
| Critical scenario | CS-10, CS-11 |
| Requirements | FR-04-015, FR-04-032, FR-04-033 |

**Story preconditions**
- Branch `Active`; `BranchSettings.OpeningBalanceLocked = false`; medicines exist in the catalog.

**US-04-09-AC6 — Atomic posting and retry (CS-10, CS-11)**

*Preconditions / test data*
1. a 5,000-line draft

*Steps*
1. a failure is injected at line 4,999 and then the client retries with the same key twice

*Expected results*
1. after the failure no batch, movement, or number exists
2. the first retry posts all 5,000 lines
3. the second retry replays the response with no extra movements

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-067: CS-11: retries with same key → one posting; plus 403 permission, 403 branch (CS-07), 404 other org (CS-08)

| Field | Value |
|---|---|
| Story | [US-04-09](../stories/EPIC-04-BATCH-INVENTORY/US-04-09-opening-balance-documents.md) — Opening balance documents and lock |
| Type / Execution | API / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-04-09-AC6, US-04-09-AC7 |
| Critical scenario | CS-11, CS-07, CS-08, CS-10 |
| Requirements | FR-04-015, FR-04-032, FR-04-033 |

**Story preconditions**
- Branch `Active`; `BranchSettings.OpeningBalanceLocked = false`; medicines exist in the catalog.

**US-04-09-AC6 — Atomic posting and retry (CS-10, CS-11)**

*Preconditions / test data*
1. a 5,000-line draft

*Steps*
1. a failure is injected at line 4,999 and then the client retries with the same key twice

*Expected results*
1. after the failure no batch, movement, or number exists
2. the first retry posts all 5,000 lines
3. the second retry replays the response with no extra movements

**US-04-09-AC7 — Authorization**

*Preconditions / test data*
1. a manager without `inventory.opening-balances.manage`, an owner of another organization, and a user not assigned to branch A without organization-wide scope

*Steps*
1. each tries to create, post, or lock

*Expected results*
1. the responses are 403 `IDENTITY.PERMISSION_DENIED`, 404 `COMMON.NOT_FOUND`, and 403 `IDENTITY.BRANCH_ACCESS_DENIED`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-04-10: Opening balance file import

### TS-04-068: 2,000-row XLSX creates draft with summary

| Field | Value |
|---|---|
| Story | [US-04-10](../stories/EPIC-04-BATCH-INVENTORY/US-04-10-opening-balance-file-import.md) — Opening balance file import |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-10-AC1 |
| Requirements | FR-04-034 |

**Story preconditions**
- US-04-09 draft documents exist; opening balances not locked. A downloadable template (CSV and XLSX, Arabic and English headers) is provided.

**US-04-10-AC1 — Valid file creates a draft**

*Preconditions / test data*
1. an XLSX with 2,000 valid rows (columns: medicineCode or barcode, batchNumber, expiry, unitCost, quantity, unit `base`/`pack`, supplierCode optional, sellingPriceOverride optional)

*Steps*
1. the owner uploads it to `POST /api/v1/branches/A/inventory/opening-balances/import`

*Expected results*
1. the response is 201 with a `Draft` opening balance document of 2,000 lines and a summary (rows read 2,000, lines created 2,000, merged 0)

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-069: Row-level errors listed with row/column/code; no draft created

| Field | Value |
|---|---|
| Story | [US-04-10](../stories/EPIC-04-BATCH-INVENTORY/US-04-10-opening-balance-file-import.md) — Opening balance file import |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-10-AC2 |
| Requirements | FR-04-034 |

**Story preconditions**
- US-04-09 draft documents exist; opening balances not locked. A downloadable template (CSV and XLSX, Arabic and English headers) is provided.

**US-04-10-AC2 — Row errors reject the whole file**

*Preconditions / test data*
1. a CSV with 3 invalid rows (unknown barcode at row 15, expiry `2027-02-30` at row 40, quantity `-5` at row 88)

*Steps*
1. it is uploaded

*Expected results*
1. the response is 422 `INVENTORY.IMPORT_VALIDATION_FAILED` with `rowErrors` [{row 15, column medicineCode, code `COMMON.NOT_FOUND`}, {row 40, column expiry, code `INVENTORY.EXPIRY_DATE_INVALID`}, {row 88, column quantity, code `INVENTORY.INVALID_QUANTITY`}] and no draft is created

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-070: Oversize, wrong type, too many rows, missing header → 400

| Field | Value |
|---|---|
| Story | [US-04-10](../stories/EPIC-04-BATCH-INVENTORY/US-04-10-opening-balance-file-import.md) — Opening balance file import |
| Type / Execution | API / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-10-AC3 |
| Requirements | FR-04-034 |

**Story preconditions**
- US-04-09 draft documents exist; opening balances not locked. A downloadable template (CSV and XLSX, Arabic and English headers) is provided.

**US-04-10-AC3 — File-level rejection**

*Preconditions / test data*
1. a 6 MB file, a PDF renamed to .csv, a file with 5,001 data rows, or a file missing the `batchNumber` header

*Steps*
1. it is uploaded

*Expected results*
1. the response is 400 `INVENTORY.IMPORT_FILE_INVALID` with the reason

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-071: Duplicate rows merged by receipt key

| Field | Value |
|---|---|
| Story | [US-04-10](../stories/EPIC-04-BATCH-INVENTORY/US-04-10-opening-balance-file-import.md) — Opening balance file import |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-10-AC4 |
| Requirements | FR-04-034 |

**Story preconditions**
- US-04-09 draft documents exist; opening balances not locked. A downloadable template (CSV and XLSX, Arabic and English headers) is provided.

**US-04-10-AC4 — Duplicate rows merged**

*Preconditions / test data*
1. rows 10 and 11 share medicine, batch number, expiry, cost, and supplier with quantities 20 and 30

*Steps*
1. the file is imported

*Expected results*
1. one draft line with quantity 50 is created and the summary reports merged 1

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-072: Month/year expiry parsing; formula cells not evaluated and rejected

| Field | Value |
|---|---|
| Story | [US-04-10](../stories/EPIC-04-BATCH-INVENTORY/US-04-10-opening-balance-file-import.md) — Opening balance file import |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-04-10-AC5 |
| Requirements | FR-04-034 |

**Story preconditions**
- US-04-09 draft documents exist; opening balances not locked. A downloadable template (CSV and XLSX, Arabic and English headers) is provided.

**US-04-10-AC5 — Month/year expiry and formula safety**

*Preconditions / test data*
1. a row with expiry `03/2027` and a cell containing `=HYPERLINK(...)` in batchNumber

*Steps*
1. imported

*Expected results*
1. expiry is stored as 2027-03-31 and the batch number cell fails `INVENTORY.BATCH_NUMBER_INVALID` (formulas are never evaluated)

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-073: 403 permission, 409 locked, 404 other org (CS-08), 403 unassigned branch (CS-07)

| Field | Value |
|---|---|
| Story | [US-04-10](../stories/EPIC-04-BATCH-INVENTORY/US-04-10-opening-balance-file-import.md) — Opening balance file import |
| Type / Execution | API / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-04-10-AC6 |
| Critical scenario | CS-08, CS-07 |
| Requirements | FR-04-034 |

**Story preconditions**
- US-04-09 draft documents exist; opening balances not locked. A downloadable template (CSV and XLSX, Arabic and English headers) is provided.

**US-04-10-AC6 — Authorization and lock**

*Preconditions / test data*
1. a manager without `inventory.opening-balances.manage`, a branch with opening balances locked, and a branch of another organization

*Steps*
1. an import is attempted

*Expected results*
1. the responses are 403 `IDENTITY.PERMISSION_DENIED`, 409 `INVENTORY.OPENING_BALANCE_LOCKED`, and 404 `COMMON.NOT_FOUND`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-074: NFR-04-003: 5,000-row validation p95 ≤ 10 s

| Field | Value |
|---|---|
| Story | [US-04-10](../stories/EPIC-04-BATCH-INVENTORY/US-04-10-opening-balance-file-import.md) — Opening balance file import |
| Type / Execution | Performance / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-10-AC1 |
| Requirements | FR-04-034 |

**Story preconditions**
- US-04-09 draft documents exist; opening balances not locked. A downloadable template (CSV and XLSX, Arabic and English headers) is provided.

**US-04-10-AC1 — Valid file creates a draft**

*Preconditions / test data*
1. an XLSX with 2,000 valid rows (columns: medicineCode or barcode, batchNumber, expiry, unitCost, quantity, unit `base`/`pack`, supplierCode optional, sellingPriceOverride optional)

*Steps*
1. the owner uploads it to `POST /api/v1/branches/A/inventory/opening-balances/import`

*Expected results*
1. the response is 201 with a `Draft` opening balance document of 2,000 lines and a summary (rows read 2,000, lines created 2,000, merged 0)

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-04-11: Stock adjustments with reason codes

### TS-04-075: Below-threshold submit posts movement, number, audit

| Field | Value |
|---|---|
| Story | [US-04-11](../stories/EPIC-04-BATCH-INVENTORY/US-04-11-stock-adjustments.md) — Stock adjustments with reason codes |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-11-AC1 |
| Requirements | FR-04-028, FR-04-035, FR-04-036, FR-04-038 |

**Story preconditions**
- Branch setting `AdjustmentApprovalThresholdAmount` (default 1,000.00 EGP). Batches exist for decrease lines.

**US-04-11-AC1 — Below-threshold adjustment posts immediately**

*Preconditions / test data*
1. threshold 1,000.00 and a draft with one line: batch B (UnitCost 12.5000, OnHand 50) Decrease 4, reason `TheftOrLoss`

*Steps*
1. a user with `inventory.adjustments.create` submits it with an `Idempotency-Key`

*Expected results*
1. value is 50.00, status becomes `Posted`, number `{BranchCode}-ADJ-2026-NNNNNN` is assigned, an `AdjustmentDecrease` −4 movement is written, OnHand = 46, and an audit entry is written in the same transaction

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-076: Value 1,000.01 → PendingApproval + event; 1,000.00 → Posted

| Field | Value |
|---|---|
| Story | [US-04-11](../stories/EPIC-04-BATCH-INVENTORY/US-04-11-stock-adjustments.md) — Stock adjustments with reason codes |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-11-AC2 |
| Requirements | FR-04-028, FR-04-035, FR-04-036, FR-04-038 |

**Story preconditions**
- Branch setting `AdjustmentApprovalThresholdAmount` (default 1,000.00 EGP). Batches exist for decrease lines.

**US-04-11-AC2 — Above-threshold adjustment goes to approval**

*Preconditions / test data*
1. a draft whose value is 1,000.01

*Steps*
1. it is submitted

*Expected results*
1. status becomes `PendingApproval`, a number is assigned, no movement is written, and `Inventory.InventoryDocumentPendingApproval.v1` is emitted for approvers of the branch

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-077: Controlled medicine line forces approval

| Field | Value |
|---|---|
| Story | [US-04-11](../stories/EPIC-04-BATCH-INVENTORY/US-04-11-stock-adjustments.md) — Stock adjustments with reason codes |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-11-AC3 |
| Requirements | FR-04-028, FR-04-035, FR-04-036, FR-04-038 |

**Story preconditions**
- Branch setting `AdjustmentApprovalThresholdAmount` (default 1,000.00 EGP). Batches exist for decrease lines.

**US-04-11-AC3 — Controlled medicine always requires approval**

*Preconditions / test data*
1. a draft of value 10.00 whose line concerns a medicine flagged controlled

*Steps*
1. it is submitted

*Expected results*
1. status becomes `PendingApproval` (REG-02 pending)

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-078: Decrease beyond OnHand − Reserved → 409, stays Draft

| Field | Value |
|---|---|
| Story | [US-04-11](../stories/EPIC-04-BATCH-INVENTORY/US-04-11-stock-adjustments.md) — Stock adjustments with reason codes |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-11-AC4 |
| Requirements | FR-04-028, FR-04-035, FR-04-036, FR-04-038 |

**Story preconditions**
- Branch setting `AdjustmentApprovalThresholdAmount` (default 1,000.00 EGP). Batches exist for decrease lines.

**US-04-11-AC4 — Decrease beyond available rejected**

*Preconditions / test data*
1. batch B has OnHand 10 and Reserved 8

*Steps*
1. a Decrease of 3 is submitted

*Expected results*
1. the response is 409 `INVENTORY.INSUFFICIENT_STOCK` (available 2) and the document stays `Draft`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-079: Reason Other note validation

| Field | Value |
|---|---|
| Story | [US-04-11](../stories/EPIC-04-BATCH-INVENTORY/US-04-11-stock-adjustments.md) — Stock adjustments with reason codes |
| Type / Execution | API / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-11-AC5 |
| Requirements | FR-04-028, FR-04-035, FR-04-036, FR-04-038 |

**Story preconditions**
- Branch setting `AdjustmentApprovalThresholdAmount` (default 1,000.00 EGP). Batches exist for decrease lines.

**US-04-11-AC5 — Reason `Other` requires a note**

*Preconditions / test data*
1. a line with reason `Other` and note "fix" (3 characters)

*Steps*
1. the draft is saved

*Expected results*
1. the response is 422 `INVENTORY.REASON_REQUIRED`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-080: FoundStock creates new batch via inbound contract

| Field | Value |
|---|---|
| Story | [US-04-11](../stories/EPIC-04-BATCH-INVENTORY/US-04-11-stock-adjustments.md) — Stock adjustments with reason codes |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-11-AC6 |
| Requirements | FR-04-028, FR-04-035, FR-04-036, FR-04-038 |

**Story preconditions**
- Branch setting `AdjustmentApprovalThresholdAmount` (default 1,000.00 EGP). Batches exist for decrease lines.

**US-04-11-AC6 — Increase into a new batch (found stock)**

*Preconditions / test data*
1. a line with reason `FoundStock`, no batch id, and new-batch details (`F9`, expiry 2027-10-31, cost 6.0000, qty 12)

*Steps*
1. the adjustment posts

*Expected results*
1. a batch `F9` is created (or matched by receipt key) with an `AdjustmentIncrease` +12 movement

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-081: Reclassification pair posts both movements; unequal pair rejected

| Field | Value |
|---|---|
| Story | [US-04-11](../stories/EPIC-04-BATCH-INVENTORY/US-04-11-stock-adjustments.md) — Stock adjustments with reason codes |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-11-AC7 |
| Requirements | FR-04-028, FR-04-035, FR-04-036, FR-04-038 |

**Story preconditions**
- Branch setting `AdjustmentApprovalThresholdAmount` (default 1,000.00 EGP). Batches exist for decrease lines.

**US-04-11-AC7 — Reclassification pair**

*Preconditions / test data*
1. batch B (number `X1`, wrong expiry 2027-01-31, OnHand 30, two movements) and a reclassification pair: Decrease B by 30, Increase new batch `X1` with expiry 2027-07-31 at the same cost

*Steps*
1. it posts

*Expected results*
1. B ends at OnHand 0 (`Depleted`), the new batch has OnHand 30, both movements reference the same document, and a pair with unequal quantities returns 422 `INVENTORY.RECLASSIFICATION_INVALID`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-082: 403 permission, 403 branch (CS-07), 404 other org (CS-08)

| Field | Value |
|---|---|
| Story | [US-04-11](../stories/EPIC-04-BATCH-INVENTORY/US-04-11-stock-adjustments.md) — Stock adjustments with reason codes |
| Type / Execution | API / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-04-11-AC8 |
| Critical scenario | CS-07, CS-08 |
| Requirements | FR-04-028, FR-04-035, FR-04-036, FR-04-038 |

**Story preconditions**
- Branch setting `AdjustmentApprovalThresholdAmount` (default 1,000.00 EGP). Batches exist for decrease lines.

**US-04-11-AC8 — Authorization**

*Preconditions / test data*
1. a pharmacist without `inventory.adjustments.create`, an inventory user not assigned to branch B, and an adjustment id from another organization

*Steps*
1. each attempts to create or submit

*Expected results*
1. the responses are 403 `IDENTITY.PERMISSION_DENIED`, 403 `IDENTITY.BRANCH_ACCESS_DENIED`, and 404 `COMMON.NOT_FOUND`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-04-12: Adjustment and write-off approval

### TS-04-083: Approve posts movements and audit

| Field | Value |
|---|---|
| Story | [US-04-12](../stories/EPIC-04-BATCH-INVENTORY/US-04-12-adjustment-and-write-off-approval.md) — Adjustment and write-off approval |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-12-AC1 |
| Requirements | FR-04-037 |

**Story preconditions**
- Document in `PendingApproval`; approver assigned to the branch.

**US-04-12-AC1 — Approve and post**

*Preconditions / test data*
1. adjustment D (submitted by user S, value 2,400.00) is `PendingApproval` and manager M ≠ S holds `inventory.adjustments.approve`

*Steps*
1. M calls `POST …/adjustments/D/approve` with an `Idempotency-Key`

*Expected results*
1. status becomes `Posted`, movements are written against current balances, ApprovedBy/At are set, and an audit entry is written in the same transaction

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-084: Self-approval → 403 SELF_APPROVAL_NOT_ALLOWED

| Field | Value |
|---|---|
| Story | [US-04-12](../stories/EPIC-04-BATCH-INVENTORY/US-04-12-adjustment-and-write-off-approval.md) — Adjustment and write-off approval |
| Type / Execution | API / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-12-AC2 |
| Requirements | FR-04-037 |

**Story preconditions**
- Document in `PendingApproval`; approver assigned to the branch.

**US-04-12-AC2 — Self-approval blocked**

*Preconditions / test data*
1. user S holds both create and approve permissions and submitted D

*Steps*
1. S approves D

*Expected results*
1. the response is 403 `INVENTORY.SELF_APPROVAL_NOT_ALLOWED` and D stays `PendingApproval`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-085: Reject with reason; short reason → 422

| Field | Value |
|---|---|
| Story | [US-04-12](../stories/EPIC-04-BATCH-INVENTORY/US-04-12-adjustment-and-write-off-approval.md) — Adjustment and write-off approval |
| Type / Execution | API / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-12-AC3 |
| Requirements | FR-04-037 |

**Story preconditions**
- Document in `PendingApproval`; approver assigned to the branch.

**US-04-12-AC3 — Reject with reason**

*Preconditions / test data*
1. D is `PendingApproval`

*Steps*
1. M rejects it with reason "Count shows no loss
2. recount shelf 4" (≥ 10 characters)

*Expected results*
1. status becomes `Rejected`, no movement is written, the number is retained, and the submitter is notified
2. a reason under 10 characters returns 422 `INVENTORY.REASON_REQUIRED`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-086: Approval with insufficient current stock → 409, stays pending

| Field | Value |
|---|---|
| Story | [US-04-12](../stories/EPIC-04-BATCH-INVENTORY/US-04-12-adjustment-and-write-off-approval.md) — Adjustment and write-off approval |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-12-AC4 |
| Requirements | FR-04-037 |

**Story preconditions**
- Document in `PendingApproval`; approver assigned to the branch.

**US-04-12-AC4 — Stock changed since submission**

*Preconditions / test data*
1. D decreases batch B by 5 and B's available quantity dropped to 3 after submission

*Steps*
1. M approves D

*Expected results*
1. the response is 409 `INVENTORY.INSUFFICIENT_STOCK`, nothing is written, and D stays `PendingApproval` for rejection or resubmission

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-087: Two concurrent approvals → one posts, other 409

| Field | Value |
|---|---|
| Story | [US-04-12](../stories/EPIC-04-BATCH-INVENTORY/US-04-12-adjustment-and-write-off-approval.md) — Adjustment and write-off approval |
| Type / Execution | Concurrency / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-04-12-AC5 |
| Requirements | FR-04-037 |

**Story preconditions**
- Document in `PendingApproval`; approver assigned to the branch.

**US-04-12-AC5 — Concurrent approvals**

*Preconditions / test data*
1. two managers approve D at the same time with different keys

*Steps*
1. both requests execute

*Expected results*
1. exactly one posts
2. the other returns 409 `INVENTORY.INVALID_STATE_TRANSITION`
3. movements exist once

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-088: 403 permission, 403 branch (CS-07), 404 other org (CS-08) for adjustments and write-offs

| Field | Value |
|---|---|
| Story | [US-04-12](../stories/EPIC-04-BATCH-INVENTORY/US-04-12-adjustment-and-write-off-approval.md) — Adjustment and write-off approval |
| Type / Execution | API / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-04-12-AC6 |
| Critical scenario | CS-07, CS-08 |
| Requirements | FR-04-037 |

**Story preconditions**
- Document in `PendingApproval`; approver assigned to the branch.

**US-04-12-AC6 — Authorization**

*Preconditions / test data*
1. an inventory user without `inventory.adjustments.approve`, a manager not assigned to the document's branch, and a write-off id from another organization

*Steps*
1. each approves

*Expected results*
1. the responses are 403 `IDENTITY.PERMISSION_DENIED`, 403 `IDENTITY.BRANCH_ACCESS_DENIED`, and 404 `COMMON.NOT_FOUND`
2. write-off approval requires `inventory.write-offs.approve` analogously

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-04-13: Damaged and expired write-offs

### TS-04-089: Damaged write-off posts movement and number

| Field | Value |
|---|---|
| Story | [US-04-13](../stories/EPIC-04-BATCH-INVENTORY/US-04-13-damaged-and-expired-write-offs.md) — Damaged and expired write-offs |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-13-AC1 |
| Requirements | FR-04-039, FR-04-040 |

**Story preconditions**
- Batches with stock; branch threshold configured; evidence file upload available (SPEC-10 `FileObject`).

**US-04-13-AC1 — Damaged write-off posts**

*Preconditions / test data*
1. batch B (UnitCost 8.0000, OnHand 30) and a damaged write-off line of 5 with note "Broken vials during delivery", value 40.00 ≤ threshold

*Steps*
1. a user with `inventory.write-offs.create` submits it with an `Idempotency-Key`

*Expected results*
1. status is `Posted`, number `{BranchCode}-WOF-2026-NNNNNN` is assigned, a `WriteOffDamaged` −5 movement exists, and OnHand = 25

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-090: Expired write-off on non-expired batch → 422

| Field | Value |
|---|---|
| Story | [US-04-13](../stories/EPIC-04-BATCH-INVENTORY/US-04-13-damaged-and-expired-write-offs.md) — Damaged and expired write-offs |
| Type / Execution | API / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-13-AC2 |
| Requirements | FR-04-039, FR-04-040 |

**Story preconditions**
- Batches with stock; branch threshold configured; evidence file upload available (SPEC-10 `FileObject`).

**US-04-13-AC2 — Expired write-off only for expired batches**

*Preconditions / test data*
1. batch N expires on business date + 10

*Steps*
1. an `Expired` write-off line for N is saved

*Expected results*
1. the response is 422 `INVENTORY.WRITE_OFF_NOT_EXPIRED`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-091: Prefill includes only expired batches with available > 0

| Field | Value |
|---|---|
| Story | [US-04-13](../stories/EPIC-04-BATCH-INVENTORY/US-04-13-damaged-and-expired-write-offs.md) — Damaged and expired write-offs |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-13-AC3 |
| Requirements | FR-04-039, FR-04-040 |

**Story preconditions**
- Batches with stock; branch threshold configured; evidence file upload available (SPEC-10 `FileObject`).

**US-04-13-AC3 — Expired prefill**

*Preconditions / test data*
1. branch A has 3 expired batches with OnHand − Reserved of 6, 0, and 9

*Steps*
1. the user calls `POST …/write-offs/expired-prefill`

*Expected results*
1. a `Draft` expired write-off with 2 lines (6 and 9) is created
2. the batch with 0 available is omitted

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-092: Above-threshold write-off → PendingApproval

| Field | Value |
|---|---|
| Story | [US-04-13](../stories/EPIC-04-BATCH-INVENTORY/US-04-13-damaged-and-expired-write-offs.md) — Damaged and expired write-offs |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-13-AC4 |
| Requirements | FR-04-039, FR-04-040 |

**Story preconditions**
- Batches with stock; branch threshold configured; evidence file upload available (SPEC-10 `FileObject`).

**US-04-13-AC4 — Above threshold requires approval**

*Preconditions / test data*
1. an expired write-off of value 3,200.00 with threshold 1,000.00

*Steps*
1. it is submitted

*Expected results*
1. status is `PendingApproval`, no movement is written, and approval follows US-04-12 with `inventory.write-offs.approve`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-093: Quarantined batch damaged write-off

| Field | Value |
|---|---|
| Story | [US-04-13](../stories/EPIC-04-BATCH-INVENTORY/US-04-13-damaged-and-expired-write-offs.md) — Damaged and expired write-offs |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-13-AC5 |
| Requirements | FR-04-039, FR-04-040 |

**Story preconditions**
- Batches with stock; branch threshold configured; evidence file upload available (SPEC-10 `FileObject`).

**US-04-13-AC5 — Quarantined batch can be written off**

*Preconditions / test data*
1. batch Q is `Quarantined` with OnHand 12

*Steps*
1. a damaged write-off of 12 posts

*Expected results*
1. a `WriteOffDamaged` −12 movement is written and Q remains `Quarantined` with OnHand 0

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-094: Write-off > OnHand − Reserved → 409

| Field | Value |
|---|---|
| Story | [US-04-13](../stories/EPIC-04-BATCH-INVENTORY/US-04-13-damaged-and-expired-write-offs.md) — Damaged and expired write-offs |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-13-AC6 |
| Requirements | FR-04-039, FR-04-040 |

**Story preconditions**
- Batches with stock; branch threshold configured; evidence file upload available (SPEC-10 `FileObject`).

**US-04-13-AC6 — Quantity limited to available**

*Preconditions / test data*
1. batch B has OnHand 10 and Reserved 4

*Steps*
1. a write-off of 7 is submitted

*Expected results*
1. the response is 409 `INVENTORY.INSUFFICIENT_STOCK` and the document stays `Draft`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-095: 403 permission, 403 branch (CS-07), 404 other org (CS-08)

| Field | Value |
|---|---|
| Story | [US-04-13](../stories/EPIC-04-BATCH-INVENTORY/US-04-13-damaged-and-expired-write-offs.md) — Damaged and expired write-offs |
| Type / Execution | API / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-04-13-AC7 |
| Critical scenario | CS-07, CS-08 |
| Requirements | FR-04-039, FR-04-040 |

**Story preconditions**
- Batches with stock; branch threshold configured; evidence file upload available (SPEC-10 `FileObject`).

**US-04-13-AC7 — Authorization**

*Preconditions / test data*
1. a cashier without `inventory.write-offs.create`, a user not assigned to branch B, and a write-off id of another organization

*Steps*
1. each creates or submits

*Expected results*
1. the responses are 403 `IDENTITY.PERMISSION_DENIED`, 403 `IDENTITY.BRANCH_ACCESS_DENIED`, and 404 `COMMON.NOT_FOUND`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-04-14: Batch metadata correction and selling price override

### TS-04-096: Direct expiry correction on single-movement batch with audit old/new

| Field | Value |
|---|---|
| Story | [US-04-14](../stories/EPIC-04-BATCH-INVENTORY/US-04-14-batch-metadata-correction-and-price-override.md) — Batch metadata correction and selling price override |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-04-14-AC1 |
| Requirements | FR-04-038, FR-04-041, FR-04-042 |

**Story preconditions**
- Batch exists in the user's branch.

**US-04-14-AC1 — Direct correction of an untouched batch**

*Preconditions / test data*
1. batch B has exactly one movement (its `Receipt`), no destination batches, and no open transfer or stocktake reference

*Steps*
1. a manager with `inventory.batches.update-metadata` sends `PATCH …/batches/B/metadata` with expiry 2027-09-30, reason "Typo at receiving, pack shows 09/2027", and a valid `If-Match`

*Expected results*
1. ExpiryDate is updated, status is recomputed, and an audit entry stores old and new values and the reason

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-097: Batch with history → 409 BATCH_METADATA_LOCKED

| Field | Value |
|---|---|
| Story | [US-04-14](../stories/EPIC-04-BATCH-INVENTORY/US-04-14-batch-metadata-correction-and-price-override.md) — Batch metadata correction and selling price override |
| Type / Execution | API / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-04-14-AC2 |
| Requirements | FR-04-038, FR-04-041, FR-04-042 |

**Story preconditions**
- Batch exists in the user's branch.

**US-04-14-AC2 — Correction blocked once the batch has history**

*Preconditions / test data*
1. batch B has a `Receipt` and a `Sale` movement

*Steps*
1. the same PATCH is sent

*Expected results*
1. the response is 409 `INVENTORY.BATCH_METADATA_LOCKED` with a hint to use a reclassification adjustment (FR-04-038)

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-098: Override set/clear; FEFO returns override

| Field | Value |
|---|---|
| Story | [US-04-14](../stories/EPIC-04-BATCH-INVENTORY/US-04-14-batch-metadata-correction-and-price-override.md) — Batch metadata correction and selling price override |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-04-14-AC3 |
| Requirements | FR-04-038, FR-04-041, FR-04-042 |

**Story preconditions**
- Batch exists in the user's branch.

**US-04-14-AC3 — Set selling price override with both permissions**

*Preconditions / test data*
1. a manager holding `inventory.batches.update-metadata` and `catalog.prices.update`

*Steps*
1. `PUT …/batches/B/selling-price-override` sets 95.0000 with a valid `If-Match`

*Expected results*
1. the override is stored, audited with old/new value, and subsequent FEFO allocations from B return `sellingPriceOverride` 95.0000
2. sending null clears it

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-099: Missing catalog.prices.update → 403

| Field | Value |
|---|---|
| Story | [US-04-14](../stories/EPIC-04-BATCH-INVENTORY/US-04-14-batch-metadata-correction-and-price-override.md) — Batch metadata correction and selling price override |
| Type / Execution | API / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-04-14-AC4 |
| Requirements | FR-04-038, FR-04-041, FR-04-042 |

**Story preconditions**
- Batch exists in the user's branch.

**US-04-14-AC4 — Override requires both permissions**

*Preconditions / test data*
1. a user with `inventory.batches.update-metadata` but without `catalog.prices.update`

*Steps*
1. the user sets an override

*Expected results*
1. the response is 403 `IDENTITY.PERMISSION_DENIED`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-100: Price/expiry validation; stale and missing If-Match

| Field | Value |
|---|---|
| Story | [US-04-14](../stories/EPIC-04-BATCH-INVENTORY/US-04-14-batch-metadata-correction-and-price-override.md) — Batch metadata correction and selling price override |
| Type / Execution | API / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-04-14-AC5 |
| Requirements | FR-04-038, FR-04-041, FR-04-042 |

**Story preconditions**
- Batch exists in the user's branch.

**US-04-14-AC5 — Validation and concurrency**

*Preconditions / test data*
1. a price of 0, an expiry `2026-02-30`, or a stale `If-Match`

*Steps*
1. submitted

*Expected results*
1. the responses are 422 `INVENTORY.SELLING_PRICE_INVALID`, 422 `INVENTORY.EXPIRY_DATE_INVALID`, and 412 `COMMON.CONCURRENCY_CONFLICT`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-101: CS-07 other branch → 403; CS-08 other org → 404

| Field | Value |
|---|---|
| Story | [US-04-14](../stories/EPIC-04-BATCH-INVENTORY/US-04-14-batch-metadata-correction-and-price-override.md) — Batch metadata correction and selling price override |
| Type / Execution | API / Automated |
| Priority | T1 (story P1) |
| Release | MVP |
| Covers | US-04-14-AC6 |
| Critical scenario | CS-07, CS-08 |
| Requirements | FR-04-038, FR-04-041, FR-04-042 |

**Story preconditions**
- Batch exists in the user's branch.

**US-04-14-AC6 — Cross-branch and cross-organization**

*Preconditions / test data*
1. a manager assigned to branch A only

*Steps*
1. the manager patches a batch of branch B, or of another organization

*Expected results*
1. the responses are 403 `IDENTITY.BRANCH_ACCESS_DENIED` and 404 `COMMON.NOT_FOUND`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-04-15: Nightly expiry flagging and near-expiry detection

### TS-04-102: Flagging sets Expired for Active/Depleted, events only for OnHand > 0

| Field | Value |
|---|---|
| Story | [US-04-15](../stories/EPIC-04-BATCH-INVENTORY/US-04-15-expiry-flagging-and-near-expiry-detection.md) — Nightly expiry flagging and near-expiry detection |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-15-AC1 |
| Requirements | FR-04-003, FR-04-023, FR-04-043, FR-04-044 |

**Story preconditions**
- Hangfire jobs `inventory.expiry-flagging` (00:05 branch local) and `inventory.near-expiry-scan` (06:00 branch local) registered per branch; `BackgroundJobRun` available.

**US-04-15-AC1 — Expired flagging**

*Preconditions / test data*
1. branch A (Africa/Cairo) has batches E1 (expiry 2026-11-09, Active, OnHand 5) and E2 (expiry 2026-11-08, Depleted)

*Steps*
1. the flagging job runs at 2026-11-09 00:05 local

*Expected results*
1. E1 and E2 become `Expired`
2. one `Inventory.BatchExpired.v1` is emitted for E1 only (OnHand > 0)
3. the run is recorded with key (job, A, 2026-11-09)

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-103: Rerun same branch/date changes nothing

| Field | Value |
|---|---|
| Story | [US-04-15](../stories/EPIC-04-BATCH-INVENTORY/US-04-15-expiry-flagging-and-near-expiry-detection.md) — Nightly expiry flagging and near-expiry detection |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-15-AC2 |
| Requirements | FR-04-003, FR-04-023, FR-04-043, FR-04-044 |

**Story preconditions**
- Hangfire jobs `inventory.expiry-flagging` (00:05 branch local) and `inventory.near-expiry-scan` (06:00 branch local) registered per branch; `BackgroundJobRun` available.

**US-04-15-AC2 — Idempotent rerun**

*Preconditions / test data*
1. the job already completed for (A, 2026-11-09)

*Steps*
1. it is triggered again for the same branch and business date

*Expected results*
1. no status changes and no events are produced

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-104: Quarantined batch unchanged; release derives Expired

| Field | Value |
|---|---|
| Story | [US-04-15](../stories/EPIC-04-BATCH-INVENTORY/US-04-15-expiry-flagging-and-near-expiry-detection.md) — Nightly expiry flagging and near-expiry detection |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-15-AC3 |
| Requirements | FR-04-003, FR-04-023, FR-04-043, FR-04-044 |

**Story preconditions**
- Hangfire jobs `inventory.expiry-flagging` (00:05 branch local) and `inventory.near-expiry-scan` (06:00 branch local) registered per branch; `BackgroundJobRun` available.

**US-04-15-AC3 — Quarantined batches untouched**

*Preconditions / test data*
1. batch Q is `Quarantined` with expiry 2026-11-01

*Steps*
1. the flagging job runs

*Expected results*
1. Q stays `Quarantined`
2. after release its derived status is `Expired`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-105: Near-expiry digest boundaries (day 90 included, day 91 excluded, zero stock excluded)

| Field | Value |
|---|---|
| Story | [US-04-15](../stories/EPIC-04-BATCH-INVENTORY/US-04-15-expiry-flagging-and-near-expiry-detection.md) — Nightly expiry flagging and near-expiry detection |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-15-AC4 |
| Requirements | FR-04-003, FR-04-023, FR-04-043, FR-04-044 |

**Story preconditions**
- Hangfire jobs `inventory.expiry-flagging` (00:05 branch local) and `inventory.near-expiry-scan` (06:00 branch local) registered per branch; `BackgroundJobRun` available.

**US-04-15-AC4 — Near-expiry digest**

*Preconditions / test data*
1. NearExpiryThresholdDays 90, business date 2026-11-09, batches N1 (expiry 2027-01-15, OnHand 10), N2 (2027-02-07, OnHand 4), N3 (2027-02-08, OnHand 9), N4 (2026-12-01, OnHand 0)

*Steps*
1. the near-expiry scan runs at 06:00 local

*Expected results*
1. one `Inventory.BatchNearExpiryDetected.v1` for branch A lists N1 and N2 (N3 is beyond 90 days, N4 has no stock), each with `newlyEntered` true on the first run

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-106: Catch-up after missed day flags newly entered batches

| Field | Value |
|---|---|
| Story | [US-04-15](../stories/EPIC-04-BATCH-INVENTORY/US-04-15-expiry-flagging-and-near-expiry-detection.md) — Nightly expiry flagging and near-expiry detection |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-15-AC5 |
| Requirements | FR-04-003, FR-04-023, FR-04-043, FR-04-044 |

**Story preconditions**
- Hangfire jobs `inventory.expiry-flagging` (00:05 branch local) and `inventory.near-expiry-scan` (06:00 branch local) registered per branch; `BackgroundJobRun` available.

**US-04-15-AC5 — Catch-up after a missed run**

*Preconditions / test data*
1. the scan did not run on 2026-11-10 and runs on 2026-11-11

*Steps*
1. it executes

*Expected results*
1. batches that entered the window on 2026-11-10 or 2026-11-11 are flagged `newlyEntered` true
2. batches already reported are flagged false

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-107: NFR-04-007: flagging 100,000 batches ≤ 5 min

| Field | Value |
|---|---|
| Story | [US-04-15](../stories/EPIC-04-BATCH-INVENTORY/US-04-15-expiry-flagging-and-near-expiry-detection.md) — Nightly expiry flagging and near-expiry detection |
| Type / Execution | Performance / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-15-AC1 |
| Requirements | FR-04-003, FR-04-023, FR-04-043, FR-04-044 |

**Story preconditions**
- Hangfire jobs `inventory.expiry-flagging` (00:05 branch local) and `inventory.near-expiry-scan` (06:00 branch local) registered per branch; `BackgroundJobRun` available.

**US-04-15-AC1 — Expired flagging**

*Preconditions / test data*
1. branch A (Africa/Cairo) has batches E1 (expiry 2026-11-09, Active, OnHand 5) and E2 (expiry 2026-11-08, Depleted)

*Steps*
1. the flagging job runs at 2026-11-09 00:05 local

*Expected results*
1. E1 and E2 become `Expired`
2. one `Inventory.BatchExpired.v1` is emitted for E1 only (OnHand > 0)
3. the run is recorded with key (job, A, 2026-11-09)

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-108: Near-expiry list: 403 permission, 403 branch (CS-07), 404 other org (CS-08)

| Field | Value |
|---|---|
| Story | [US-04-15](../stories/EPIC-04-BATCH-INVENTORY/US-04-15-expiry-flagging-and-near-expiry-detection.md) — Nightly expiry flagging and near-expiry detection |
| Type / Execution | API / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-04-15-AC7 |
| Critical scenario | CS-07, CS-08 |
| Requirements | FR-04-003, FR-04-023, FR-04-043, FR-04-044 |

**Story preconditions**
- Hangfire jobs `inventory.expiry-flagging` (00:05 branch local) and `inventory.near-expiry-scan` (06:00 branch local) registered per branch; `BackgroundJobRun` available.

**US-04-15-AC7 — Near-expiry list endpoint authorization**

*Preconditions / test data*
1. a user without `inventory.stock.read`, a user not assigned to branch B, and a branch id of another organization

*Steps*
1. each calls `GET …/inventory/near-expiry`

*Expected results*
1. the responses are 403 `IDENTITY.PERMISSION_DENIED`, 403 `IDENTITY.BRANCH_ACCESS_DENIED`, and 404 `COMMON.NOT_FOUND`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-109: CS-02: expired batch not sellable although stored status is still Active

| Field | Value |
|---|---|
| Story | [US-04-15](../stories/EPIC-04-BATCH-INVENTORY/US-04-15-expiry-flagging-and-near-expiry-detection.md) — Nightly expiry flagging and near-expiry detection |
| Type / Execution | Integration / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-04-15-AC6 |
| Critical scenario | CS-02 |
| Requirements | FR-04-003, FR-04-023, FR-04-043, FR-04-044 |

**Story preconditions**
- Hangfire jobs `inventory.expiry-flagging` (00:05 branch local) and `inventory.near-expiry-scan` (06:00 branch local) registered per branch; `BackgroundJobRun` available.

**US-04-15-AC6 — Eligibility independent of the job (CS-02)**

*Preconditions / test data*
1. the flagging job failed and E1 (expiry = business date) still shows `Active`

*Steps*
1. a sale tries to allocate E1

*Expected results*
1. E1 is excluded by FEFO and an explicit selection returns 422 `INVENTORY.BATCH_NOT_SELLABLE` (reason `Expired`)

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-04-16: Reorder settings and low-stock detection

### TS-04-110: Upsert setting; invalid min/max → 422

| Field | Value |
|---|---|
| Story | [US-04-16](../stories/EPIC-04-BATCH-INVENTORY/US-04-16-reorder-settings-and-low-stock-detection.md) — Reorder settings and low-stock detection |
| Type / Execution | API / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-04-16-AC1 |
| Requirements | FR-04-045, FR-04-046 |

**Story preconditions**
- Medicines exist; outbox and SPEC-10 notification consumers available; job `inventory.low-stock-scan` registered (every 30 min + debounced trigger).

**US-04-16-AC1 — Create and update a reorder setting**

*Preconditions / test data*
1. a user with `inventory.reorder-settings.manage`

*Steps*
1. `PUT …/reorder-settings/M` is sent with min 30, max 120

*Expected results*
1. the setting is stored (state `Normal` until evaluated) and audited
2. min 50 with max 40 returns 422 `INVENTORY.REORDER_SETTING_INVALID`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-111: Normal→Low emits one event with correct suggestion and ≤ 60 s latency

| Field | Value |
|---|---|
| Story | [US-04-16](../stories/EPIC-04-BATCH-INVENTORY/US-04-16-reorder-settings-and-low-stock-detection.md) — Reorder settings and low-stock detection |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-04-16-AC2 |
| Requirements | FR-04-045, FR-04-046 |

**Story preconditions**
- Medicines exist; outbox and SPEC-10 notification consumers available; job `inventory.low-stock-scan` registered (every 30 min + debounced trigger).

**US-04-16-AC2 — Transition to Low emits one event**

*Preconditions / test data*
1. M has min 30, max 120, PackSize 30, sellable 35, in-transit inbound 0, state `Normal`

*Steps*
1. a sale reduces sellable to 18 and the debounced evaluation runs

*Expected results*
1. state becomes `Low`, LowStockSince is set, and exactly one `Inventory.StockLevelLowDetected.v1` is emitted with sellableQuantity 18, suggestedOrderQuantityBaseUnits 102, suggestedOrderPacks 4, within 60 s of the sale commit

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-112: No repeated events while Low across scans; concurrent evaluations emit once

| Field | Value |
|---|---|
| Story | [US-04-16](../stories/EPIC-04-BATCH-INVENTORY/US-04-16-reorder-settings-and-low-stock-detection.md) — Reorder settings and low-stock detection |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-04-16-AC3 |
| Requirements | FR-04-045, FR-04-046 |

**Story preconditions**
- Medicines exist; outbox and SPEC-10 notification consumers available; job `inventory.low-stock-scan` registered (every 30 min + debounced trigger).

**US-04-16-AC3 — No repeated event while Low**

*Preconditions / test data*
1. M is `Low`

*Steps*
1. further sales reduce sellable to 10 and the 30-min scan runs twice

*Expected results*
1. no additional `StockLevelLowDetected` event is emitted

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-113: Low→Normal emits StockLevelRestored

| Field | Value |
|---|---|
| Story | [US-04-16](../stories/EPIC-04-BATCH-INVENTORY/US-04-16-reorder-settings-and-low-stock-detection.md) — Reorder settings and low-stock detection |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-04-16-AC4 |
| Requirements | FR-04-045, FR-04-046 |

**Story preconditions**
- Medicines exist; outbox and SPEC-10 notification consumers available; job `inventory.low-stock-scan` registered (every 30 min + debounced trigger).

**US-04-16-AC4 — Restored to Normal**

*Preconditions / test data*
1. M is `Low` with sellable 10

*Steps*
1. a receipt raises sellable to 40

*Expected results*
1. state becomes `Normal` and one `Inventory.StockLevelRestored.v1` is emitted

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-114: Scan detects drop caused by do-not-sell window without movement

| Field | Value |
|---|---|
| Story | [US-04-16](../stories/EPIC-04-BATCH-INVENTORY/US-04-16-reorder-settings-and-low-stock-detection.md) — Reorder settings and low-stock detection |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-04-16-AC5 |
| Requirements | FR-04-045, FR-04-046 |

**Story preconditions**
- Medicines exist; outbox and SPEC-10 notification consumers available; job `inventory.low-stock-scan` registered (every 30 min + debounced trigger).

**US-04-16-AC5 — Expiry-driven drop detected by the scan**

*Preconditions / test data*
1. M has sellable 35 in one batch that enters the do-not-sell window at the business-date change without any movement

*Steps*
1. the 30-min scan runs after midnight

*Expected results*
1. sellable is 0, state becomes `Low`, and the event is emitted

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-115: Low-stock list fields

| Field | Value |
|---|---|
| Story | [US-04-16](../stories/EPIC-04-BATCH-INVENTORY/US-04-16-reorder-settings-and-low-stock-detection.md) — Reorder settings and low-stock detection |
| Type / Execution | API / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-04-16-AC6 |
| Requirements | FR-04-045, FR-04-046 |

**Story preconditions**
- Medicines exist; outbox and SPEC-10 notification consumers available; job `inventory.low-stock-scan` registered (every 30 min + debounced trigger).

**US-04-16-AC6 — Low-stock list for purchasing**

*Preconditions / test data*
1. 3 medicines are `Low` in branch A

*Steps*
1. a user with `inventory.stock.read` calls `GET …/inventory/low-stock`

*Expected results*
1. 3 rows are returned with sellable, min, max, in-transit inbound, suggested quantity (base units and packs), and LowStockSince

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-116: 403 permission, 403 branch (CS-07), 404 other org (CS-08)

| Field | Value |
|---|---|
| Story | [US-04-16](../stories/EPIC-04-BATCH-INVENTORY/US-04-16-reorder-settings-and-low-stock-detection.md) — Reorder settings and low-stock detection |
| Type / Execution | API / Automated |
| Priority | T1 (story P1) |
| Release | MVP |
| Covers | US-04-16-AC7 |
| Critical scenario | CS-07, CS-08 |
| Requirements | FR-04-045, FR-04-046 |

**Story preconditions**
- Medicines exist; outbox and SPEC-10 notification consumers available; job `inventory.low-stock-scan` registered (every 30 min + debounced trigger).

**US-04-16-AC7 — Authorization**

*Preconditions / test data*
1. a cashier without `inventory.reorder-settings.manage`, a manager not assigned to branch B, and a medicine of another organization

*Steps*
1. each upserts a setting

*Expected results*
1. the responses are 403 `IDENTITY.PERMISSION_DENIED`, 403 `IDENTITY.BRANCH_ACCESS_DENIED`, and 404 `COMMON.NOT_FOUND`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-04-17: Batch quarantine, release, and recall

### TS-04-117: Quarantine sets status, no movement, audit, event; FEFO excludes

| Field | Value |
|---|---|
| Story | [US-04-17](../stories/EPIC-04-BATCH-INVENTORY/US-04-17-batch-quarantine-and-recall.md) — Batch quarantine, release, and recall |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-04-17-AC1 |
| Requirements | FR-04-028, FR-04-047, FR-04-048 |

**Story preconditions**
- Batches exist; recall requires organization-wide scope.

**US-04-17-AC1 — Quarantine blocks sale**

*Preconditions / test data*
1. batch B (Active, OnHand 20) and a user with `inventory.batches.quarantine`

*Steps*
1. the user calls `POST …/batches/B/quarantine` with reason "Supplier quality notice, cloudy suspension" and recall reference `RC-2026-14`

*Expected results*
1. status becomes `Quarantined`, no stock movement is created, an audit entry and `Inventory.BatchQuarantined.v1` are written, and FEFO no longer allocates B

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-118: Release of expired quarantined batch → Expired

| Field | Value |
|---|---|
| Story | [US-04-17](../stories/EPIC-04-BATCH-INVENTORY/US-04-17-batch-quarantine-and-recall.md) — Batch quarantine, release, and recall |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-04-17-AC2 |
| Requirements | FR-04-028, FR-04-047, FR-04-048 |

**Story preconditions**
- Batches exist; recall requires organization-wide scope.

**US-04-17-AC2 — Release re-derives status**

*Preconditions / test data*
1. B is `Quarantined` and its expiry passed during quarantine

*Steps*
1. the user releases it with a reason

*Expected results*
1. QuarantinedAt is cleared, status becomes `Expired` (not `Active`), and `Inventory.BatchReleased.v1` is emitted

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-119: Quarantine waits for in-flight sale lock; later sales exclude batch

| Field | Value |
|---|---|
| Story | [US-04-17](../stories/EPIC-04-BATCH-INVENTORY/US-04-17-batch-quarantine-and-recall.md) — Batch quarantine, release, and recall |
| Type / Execution | Concurrency / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-04-17-AC3 |
| Requirements | FR-04-028, FR-04-047, FR-04-048 |

**Story preconditions**
- Batches exist; recall requires organization-wide scope.

**US-04-17-AC3 — Serialized with concurrent sale**

*Preconditions / test data*
1. a sale transaction holds B's balance lock

*Steps*
1. quarantine of B is requested concurrently

*Expected results*
1. quarantine waits for the lock
2. after the sale commits, quarantine commits
3. no sale started after quarantine commit allocates B

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-120: Recall quarantines all branches' batches atomically

| Field | Value |
|---|---|
| Story | [US-04-17](../stories/EPIC-04-BATCH-INVENTORY/US-04-17-batch-quarantine-and-recall.md) — Batch quarantine, release, and recall |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-04-17-AC4 |
| Requirements | FR-04-028, FR-04-047, FR-04-048 |

**Story preconditions**
- Batches exist; recall requires organization-wide scope.

**US-04-17-AC4 — Organization-wide recall**

*Preconditions / test data*
1. medicine M batch number `L77` exists in branches A (OnHand 10), C (OnHand 4, transferred from A), and D (OnHand 0)

*Steps*
1. an owner with organization-wide scope calls `POST /api/v1/inventory/recalls` with medicine M, batch number `L77`, reason, and an `Idempotency-Key`

*Expected results*
1. all three batches are quarantined in one transaction and the response lists them per branch with OnHand

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-121: Recall without org-wide scope → 403

| Field | Value |
|---|---|
| Story | [US-04-17](../stories/EPIC-04-BATCH-INVENTORY/US-04-17-batch-quarantine-and-recall.md) — Batch quarantine, release, and recall |
| Type / Execution | API / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-04-17-AC5 |
| Requirements | FR-04-028, FR-04-047, FR-04-048 |

**Story preconditions**
- Batches exist; recall requires organization-wide scope.

**US-04-17-AC5 — Recall without organization-wide scope**

*Preconditions / test data*
1. a manager with `inventory.batches.quarantine` assigned only to branch A

*Steps*
1. the manager calls the recall endpoint

*Expected results*
1. the response is 403 `IDENTITY.PERMISSION_DENIED`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-122: Invalid transitions → 409; short reason → 422

| Field | Value |
|---|---|
| Story | [US-04-17](../stories/EPIC-04-BATCH-INVENTORY/US-04-17-batch-quarantine-and-recall.md) — Batch quarantine, release, and recall |
| Type / Execution | API / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-04-17-AC6 |
| Requirements | FR-04-028, FR-04-047, FR-04-048 |

**Story preconditions**
- Batches exist; recall requires organization-wide scope.

**US-04-17-AC6 — Invalid transitions**

*Preconditions / test data*
1. B is already `Quarantined`, or batch K is not quarantined

*Steps*
1. B is quarantined again or K is released

*Expected results*
1. the response is 409 `INVENTORY.INVALID_STATE_TRANSITION`
2. a reason under 10 characters returns 422 `INVENTORY.REASON_REQUIRED`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-123: CS-07 other branch → 403; CS-08 other org → 404

| Field | Value |
|---|---|
| Story | [US-04-17](../stories/EPIC-04-BATCH-INVENTORY/US-04-17-batch-quarantine-and-recall.md) — Batch quarantine, release, and recall |
| Type / Execution | API / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-04-17-AC7 |
| Critical scenario | CS-07, CS-08 |
| Requirements | FR-04-028, FR-04-047, FR-04-048 |

**Story preconditions**
- Batches exist; recall requires organization-wide scope.

**US-04-17-AC7 — Cross-branch and cross-organization**

*Preconditions / test data*
1. a pharmacist assigned to branch A

*Steps*
1. quarantining a batch of branch B or of another organization

*Expected results*
1. the responses are 403 `IDENTITY.BRANCH_ACCESS_DENIED` and 404 `COMMON.NOT_FOUND`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-04-18: Ledger ↔ balance reconciliation job

### TS-04-124: Clean dataset → zero findings (also run after every integration test class)

| Field | Value |
|---|---|
| Story | [US-04-18](../stories/EPIC-04-BATCH-INVENTORY/US-04-18-ledger-balance-reconciliation.md) — Ledger ↔ balance reconciliation job |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-18-AC1 |
| Requirements | FR-04-049, FR-04-050, FR-04-057 |

**Story preconditions**
- Job `inventory.reconciliation` scheduled daily at 01:30 Africa/Cairo; `ReconciliationFinding` table; SPEC-05 facade returns open supplier-return reservations per batch.

**US-04-18-AC1 — Clean run**

*Preconditions / test data*
1. a dataset produced only through the posting contracts (all movement types, transfers, stocktakes)

*Steps*
1. the job runs

*Expected results*
1. zero findings are recorded and the run is `Succeeded` with counts of batches and transfers checked

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-125: Seeded on-hand drift → findings + critical event + notification ≤ 5 min

| Field | Value |
|---|---|
| Story | [US-04-18](../stories/EPIC-04-BATCH-INVENTORY/US-04-18-ledger-balance-reconciliation.md) — Ledger ↔ balance reconciliation job |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-18-AC2 |
| Requirements | FR-04-049, FR-04-050, FR-04-057 |

**Story preconditions**
- Job `inventory.reconciliation` scheduled daily at 01:30 Africa/Cairo; `ReconciliationFinding` table; SPEC-05 facade returns open supplier-return reservations per batch.

**US-04-18-AC2 — On-hand drift detected and alerted**

*Preconditions / test data*
1. a test fixture sets batch B's OnHand to 51 directly while Σ QuantityDelta = 50

*Steps*
1. the job runs

*Expected results*
1. findings `ON_HAND_SUM` (expected 50, actual 51) and `BALANCE_AFTER` are recorded for B, and `Inventory.ReconciliationDriftDetected.v1` (critical) is emitted, reaching OWNER users within 5 minutes

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-126: Data checksum unchanged after a run with findings

| Field | Value |
|---|---|
| Story | [US-04-18](../stories/EPIC-04-BATCH-INVENTORY/US-04-18-ledger-balance-reconciliation.md) — Ledger ↔ balance reconciliation job |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-18-AC3 |
| Requirements | FR-04-049, FR-04-050, FR-04-057 |

**Story preconditions**
- Job `inventory.reconciliation` scheduled daily at 01:30 Africa/Cairo; `ReconciliationFinding` table; SPEC-05 facade returns open supplier-return reservations per batch.

**US-04-18-AC3 — Never auto-corrects**

*Preconditions / test data*
1. findings exist

*Steps*
1. the job completes

*Expected results*
1. OnHand, Reserved, statuses, and movements are unchanged (verified by checksum before and after)

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-127: Sequence gap and status derivation findings

| Field | Value |
|---|---|
| Story | [US-04-18](../stories/EPIC-04-BATCH-INVENTORY/US-04-18-ledger-balance-reconciliation.md) — Ledger ↔ balance reconciliation job |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-18-AC4 |
| Requirements | FR-04-049, FR-04-050, FR-04-057 |

**Story preconditions**
- Job `inventory.reconciliation` scheduled daily at 01:30 Africa/Cairo; `ReconciliationFinding` table; SPEC-05 facade returns open supplier-return reservations per batch.

**US-04-18-AC4 — Sequence and status checks**

*Preconditions / test data*
1. batch C has BatchSequence values 1, 2, 4, and batch D is stored `Active` with expiry before the business date

*Steps*
1. the job runs

*Expected results*
1. findings `SEQUENCE_GAP` for C and `STATUS_DERIVATION` for D are recorded

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-128: Reserved sum and transfer conservation findings

| Field | Value |
|---|---|
| Story | [US-04-18](../stories/EPIC-04-BATCH-INVENTORY/US-04-18-ledger-balance-reconciliation.md) — Ledger ↔ balance reconciliation job |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-18-AC5 |
| Requirements | FR-04-049, FR-04-050, FR-04-057 |

**Story preconditions**
- Job `inventory.reconciliation` scheduled daily at 01:30 Africa/Cairo; `ReconciliationFinding` table; SPEC-05 facade returns open supplier-return reservations per batch.

**US-04-18-AC5 — Reservation and transfer conservation checks**

*Preconditions / test data*
1. batch R has Reserved 10 but open transfer reservations total 6 and supplier-return reservations 0, and transfer T has Σ TransferOut 20, Σ TransferIn 12, Σ TransferReturn 3, outstanding 4

*Steps*
1. the job runs

*Expected results*
1. findings `RESERVED_SUM` (expected 6, actual 10) for R and `TRANSFER_CONSERVATION` (gap 1) for T are recorded

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-129: Persisting drift deduplicated; on-demand run; concurrent run → 409

| Field | Value |
|---|---|
| Story | [US-04-18](../stories/EPIC-04-BATCH-INVENTORY/US-04-18-ledger-balance-reconciliation.md) — Ledger ↔ balance reconciliation job |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-18-AC6 |
| Requirements | FR-04-049, FR-04-050, FR-04-057 |

**Story preconditions**
- Job `inventory.reconciliation` scheduled daily at 01:30 Africa/Cairo; `ReconciliationFinding` table; SPEC-05 facade returns open supplier-return reservations per batch.

**US-04-18-AC6 — Idempotent findings and on-demand run**

*Preconditions / test data*
1. B's drift persists across two days, and an owner with `inventory.reconciliation.read` triggers an on-demand run

*Steps*
1. the runs execute

*Expected results*
1. B's finding keeps its FirstDetectedRunId and no duplicate exists per (batch, check, run date)
2. a second drift event is not emitted for an unchanged finding

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-130: 403 permission; CS-08 other-org run → 404

| Field | Value |
|---|---|
| Story | [US-04-18](../stories/EPIC-04-BATCH-INVENTORY/US-04-18-ledger-balance-reconciliation.md) — Ledger ↔ balance reconciliation job |
| Type / Execution | API / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-04-18-AC7 |
| Critical scenario | CS-08 |
| Requirements | FR-04-049, FR-04-050, FR-04-057 |

**Story preconditions**
- Job `inventory.reconciliation` scheduled daily at 01:30 Africa/Cairo; `ReconciliationFinding` table; SPEC-05 facade returns open supplier-return reservations per batch.

**US-04-18-AC7 — Authorization on findings API**

*Preconditions / test data*
1. a manager without `inventory.reconciliation.read` and an owner of another organization

*Steps*
1. each calls `GET /api/v1/inventory/reconciliation-runs/{runId}/findings`

*Expected results*
1. the responses are 403 `IDENTITY.PERMISSION_DENIED` and 404 `COMMON.NOT_FOUND`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-131: NFR-04-006: 500,000 batches / 20 million movements ≤ 30 min, sale p95 impact ≤ 10%

| Field | Value |
|---|---|
| Story | [US-04-18](../stories/EPIC-04-BATCH-INVENTORY/US-04-18-ledger-balance-reconciliation.md) — Ledger ↔ balance reconciliation job |
| Type / Execution | Performance / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-04-18-AC1 |
| Requirements | FR-04-049, FR-04-050, FR-04-057 |

**Story preconditions**
- Job `inventory.reconciliation` scheduled daily at 01:30 Africa/Cairo; `ReconciliationFinding` table; SPEC-05 facade returns open supplier-return reservations per batch.

**US-04-18-AC1 — Clean run**

*Preconditions / test data*
1. a dataset produced only through the posting contracts (all movement types, transfers, stocktakes)

*Steps*
1. the job runs

*Expected results*
1. zero findings are recorded and the run is `Succeeded` with counts of batches and transfers checked

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-04-19: Transfer drafting, submission, and cancellation

### TS-04-132: Destination user creates draft readable from both branches

| Field | Value |
|---|---|
| Story | [US-04-19](../stories/EPIC-04-BATCH-INVENTORY/US-04-19-transfer-drafting-and-submission.md) — Transfer drafting, submission, and cancellation |
| Type / Execution | API / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-04-19-AC1 |
| Requirements | FR-04-051 |

**Story preconditions**
- Organization has ≥ 2 active branches; user assigned to the source or destination branch.

**US-04-19-AC1 — Create a draft request**

*Preconditions / test data*
1. user U with `inventory.transfers.create` is assigned to destination branch C

*Steps*
1. U calls `POST /api/v1/branches/C/inventory/transfers` with source A, destination C, lines [M1 40 base units, M2 10 base units]

*Expected results*
1. a `Draft` transfer is created (BranchId = A, readable from A and C), with CreatedBy U and no number

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-133: Same branch / inactive branch → 422

| Field | Value |
|---|---|
| Story | [US-04-19](../stories/EPIC-04-BATCH-INVENTORY/US-04-19-transfer-drafting-and-submission.md) — Transfer drafting, submission, and cancellation |
| Type / Execution | API / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-04-19-AC2 |
| Requirements | FR-04-051 |

**Story preconditions**
- Organization has ≥ 2 active branches; user assigned to the source or destination branch.

**US-04-19-AC2 — Same branch or inactive branch rejected**

*Preconditions / test data*
1. source = destination A, or destination D is `Inactive`

*Steps*
1. the draft is created

*Expected results*
1. the responses are 422 `INVENTORY.TRANSFER_SAME_BRANCH` and 422 `INVENTORY.BRANCH_INACTIVE`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-134: Submit assigns source-branch number, audit, status event

| Field | Value |
|---|---|
| Story | [US-04-19](../stories/EPIC-04-BATCH-INVENTORY/US-04-19-transfer-drafting-and-submission.md) — Transfer drafting, submission, and cancellation |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-04-19-AC3 |
| Requirements | FR-04-051 |

**Story preconditions**
- Organization has ≥ 2 active branches; user assigned to the source or destination branch.

**US-04-19-AC3 — Submit assigns number and notifies**

*Preconditions / test data*
1. the draft has ≥ 1 line

*Steps*
1. U submits it with a valid `If-Match`

*Expected results*
1. status becomes `Requested`, number `{SourceBranchCode}-TRF-2026-NNNNNN` from the source branch sequence is assigned, an audit entry is written, and `Inventory.TransferStatusChanged.v1` is emitted for approvers of A

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-135: Cancel from Draft/Requested; cancel InTransit → 409; edit after submit → 409

| Field | Value |
|---|---|
| Story | [US-04-19](../stories/EPIC-04-BATCH-INVENTORY/US-04-19-transfer-drafting-and-submission.md) — Transfer drafting, submission, and cancellation |
| Type / Execution | API / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-04-19-AC4, US-04-19-AC5 |
| Requirements | FR-04-051 |

**Story preconditions**
- Organization has ≥ 2 active branches; user assigned to the source or destination branch.

**US-04-19-AC4 — Cancel before dispatch**

*Preconditions / test data*
1. a transfer in `Draft` or `Requested`

*Steps*
1. a user with `inventory.transfers.create` assigned to A or C cancels it with reason "No longer required, received from supplier"

*Expected results*
1. status becomes `Cancelled`, the number (if any) is retained, and cancellation of an `InTransit` transfer returns 409 `INVENTORY.INVALID_STATE_TRANSITION`

**US-04-19-AC5 — No edits after submit**

*Preconditions / test data*
1. the transfer is `Requested`

*Steps*
1. U tries to change its lines

*Expected results*
1. the response is 409 `INVENTORY.INVALID_STATE_TRANSITION`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-136: CS-07 unrelated branch → 403; permission → 403; CS-08 other org → 404

| Field | Value |
|---|---|
| Story | [US-04-19](../stories/EPIC-04-BATCH-INVENTORY/US-04-19-transfer-drafting-and-submission.md) — Transfer drafting, submission, and cancellation |
| Type / Execution | API / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-04-19-AC6 |
| Critical scenario | CS-07, CS-08 |
| Requirements | FR-04-051 |

**Story preconditions**
- Organization has ≥ 2 active branches; user assigned to the source or destination branch.

**US-04-19-AC6 — Authorization**

*Preconditions / test data*
1. user V assigned only to branch D (neither source nor destination), a cashier without `inventory.transfers.create` at C, and a transfer id of another organization

*Steps*
1. each creates, reads, or submits

*Expected results*
1. the responses are 403 `IDENTITY.BRANCH_ACCESS_DENIED`, 403 `IDENTITY.PERMISSION_DENIED`, and 404 `COMMON.NOT_FOUND`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-04-20: Transfer approval with reservation, rejection

### TS-04-137: Approval allocates FEFO and reserves without movements

| Field | Value |
|---|---|
| Story | [US-04-20](../stories/EPIC-04-BATCH-INVENTORY/US-04-20-transfer-approval-and-reservation.md) — Transfer approval with reservation, rejection |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-04-20-AC1 |
| Requirements | FR-04-052 |

**Story preconditions**
- Transfer `Requested`; approver assigned to the source branch.

**US-04-20-AC1 — Approve reserves by FEFO**

*Preconditions / test data*
1. transfer T (A → C) requests M 40
2. in A, M has sale-eligible batches B1 (expiry 2027-01-31, sellable 25) and B2 (2027-04-30, sellable 30)

*Steps*
1. manager G (≠ creator) with `inventory.transfers.approve` assigned to A approves with an `Idempotency-Key`

*Expected results*
1. status becomes `Approved`, allocations B1 = 25 and B2 = 15 are stored, Reserved increases by 25 and 15, no movement is written, and `Inventory.TransferStatusChanged.v1` is emitted

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-138: Insufficient stock at approval → 409, no reservation

| Field | Value |
|---|---|
| Story | [US-04-20](../stories/EPIC-04-BATCH-INVENTORY/US-04-20-transfer-approval-and-reservation.md) — Transfer approval with reservation, rejection |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-04-20-AC2 |
| Requirements | FR-04-052 |

**Story preconditions**
- Transfer `Requested`; approver assigned to the source branch.

**US-04-20-AC2 — Insufficient stock at approval**

*Preconditions / test data*
1. M has 30 sellable in A

*Steps*
1. G approves the 40-unit request

*Expected results*
1. the response is 409 `INVENTORY.INSUFFICIENT_STOCK` with shortages, and T stays `Requested` with no reservation (G may reject, or the creator may cancel and resubmit)

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-139: Sales skip reserved quantity

| Field | Value |
|---|---|
| Story | [US-04-20](../stories/EPIC-04-BATCH-INVENTORY/US-04-20-transfer-approval-and-reservation.md) — Transfer approval with reservation, rejection |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-04-20-AC3 |
| Requirements | FR-04-052 |

**Story preconditions**
- Transfer `Requested`; approver assigned to the source branch.

**US-04-20-AC3 — Reserved stock is not sellable**

*Preconditions / test data*
1. T is approved and B1 has OnHand 25, Reserved 25

*Steps*
1. a cashier sells M in A

*Expected results*
1. FEFO skips B1 and allocates from B2
2. a sale that needs B1's units fails with `INVENTORY.INSUFFICIENT_STOCK`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-140: Reject with reason

| Field | Value |
|---|---|
| Story | [US-04-20](../stories/EPIC-04-BATCH-INVENTORY/US-04-20-transfer-approval-and-reservation.md) — Transfer approval with reservation, rejection |
| Type / Execution | API / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-04-20-AC4 |
| Requirements | FR-04-052 |

**Story preconditions**
- Transfer `Requested`; approver assigned to the source branch.

**US-04-20-AC4 — Reject with reason**

*Preconditions / test data*
1. T is `Requested`

*Steps*
1. G rejects it with reason "Branch A is below its own minimum for M"

*Expected results*
1. status becomes `Rejected`, no reservation exists, and the creator is notified

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-141: Cancel Approved releases reservations atomically

| Field | Value |
|---|---|
| Story | [US-04-20](../stories/EPIC-04-BATCH-INVENTORY/US-04-20-transfer-approval-and-reservation.md) — Transfer approval with reservation, rejection |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-04-20-AC5 |
| Requirements | FR-04-052 |

**Story preconditions**
- Transfer `Requested`; approver assigned to the source branch.

**US-04-20-AC5 — Cancel after approval releases reservation**

*Preconditions / test data*
1. T is `Approved` with reservations 25 and 15

*Steps*
1. an authorized user cancels it with a reason

*Expected results*
1. status becomes `Cancelled` and Reserved on B1 and B2 decreases by 25 and 15 in the same transaction

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-142: Self-approval → 403; destination-only manager → 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-04-20](../stories/EPIC-04-BATCH-INVENTORY/US-04-20-transfer-approval-and-reservation.md) — Transfer approval with reservation, rejection |
| Type / Execution | API / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-04-20-AC6 |
| Critical scenario | CS-07 |
| Requirements | FR-04-052 |

**Story preconditions**
- Transfer `Requested`; approver assigned to the source branch.

**US-04-20-AC6 — Segregation of duties and side**

*Preconditions / test data*
1. creator U also holds `inventory.transfers.approve`, and manager H is assigned only to destination C

*Steps*
1. U approves, and H approves

*Expected results*
1. the responses are 403 `INVENTORY.SELF_APPROVAL_NOT_ALLOWED` and 403 `IDENTITY.BRANCH_ACCESS_DENIED`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-143: Missing permission → 403; CS-08 other org → 404

| Field | Value |
|---|---|
| Story | [US-04-20](../stories/EPIC-04-BATCH-INVENTORY/US-04-20-transfer-approval-and-reservation.md) — Transfer approval with reservation, rejection |
| Type / Execution | API / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-04-20-AC7 |
| Critical scenario | CS-08 |
| Requirements | FR-04-052 |

**Story preconditions**
- Transfer `Requested`; approver assigned to the source branch.

**US-04-20-AC7 — Permission and organization**

*Preconditions / test data*
1. an inventory user without `inventory.transfers.approve` and a transfer id of another organization

*Steps*
1. each approves

*Expected results*
1. the responses are 403 `IDENTITY.PERMISSION_DENIED` and 404 `COMMON.NOT_FOUND`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-144: CS-11: approve retried with same key → one reservation set

| Field | Value |
|---|---|
| Story | [US-04-20](../stories/EPIC-04-BATCH-INVENTORY/US-04-20-transfer-approval-and-reservation.md) — Transfer approval with reservation, rejection |
| Type / Execution | API / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-04-20-AC1 |
| Critical scenario | CS-11 |
| Requirements | FR-04-052 |

**Story preconditions**
- Transfer `Requested`; approver assigned to the source branch.

**US-04-20-AC1 — Approve reserves by FEFO**

*Preconditions / test data*
1. transfer T (A → C) requests M 40
2. in A, M has sale-eligible batches B1 (expiry 2027-01-31, sellable 25) and B2 (2027-04-30, sellable 30)

*Steps*
1. manager G (≠ creator) with `inventory.transfers.approve` assigned to A approves with an `Idempotency-Key`

*Expected results*
1. status becomes `Approved`, allocations B1 = 25 and B2 = 15 are stored, Reserved increases by 25 and 15, no movement is written, and `Inventory.TransferStatusChanged.v1` is emitted

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-04-21: Transfer dispatch and in-transit visibility

### TS-04-145: Dispatch posts TransferOut, consumes reservation, status InTransit, event

| Field | Value |
|---|---|
| Story | [US-04-21](../stories/EPIC-04-BATCH-INVENTORY/US-04-21-transfer-dispatch-and-in-transit.md) — Transfer dispatch and in-transit visibility |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-04-21-AC1 |
| Requirements | FR-04-053, FR-04-054 |

**Story preconditions**
- Transfer `Approved` with reservations; dispatcher assigned to the source branch.

**US-04-21-AC1 — Dispatch posts TransferOut**

*Preconditions / test data*
1. T (A → C) is `Approved` with allocations B1 = 25, B2 = 15 reserved

*Steps*
1. user D with `inventory.transfers.dispatch` assigned to A dispatches all quantities with an `Idempotency-Key`

*Expected results*
1. `TransferOut` movements −25 (B1) and −15 (B2) are written, OnHand and Reserved decrease by the same amounts, DispatchedQty is stored, status becomes `InTransit`, and `Inventory.TransferStatusChanged.v1` notifies branch C

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-146: Partial dispatch releases remainder; over-dispatch → 422

| Field | Value |
|---|---|
| Story | [US-04-21](../stories/EPIC-04-BATCH-INVENTORY/US-04-21-transfer-dispatch-and-in-transit.md) — Transfer dispatch and in-transit visibility |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-04-21-AC2 |
| Requirements | FR-04-053, FR-04-054 |

**Story preconditions**
- Transfer `Approved` with reservations; dispatcher assigned to the source branch.

**US-04-21-AC2 — Partial dispatch releases remainder**

*Preconditions / test data*
1. only 10 of B2's 15 reserved units can be found

*Steps*
1. D dispatches B1 = 25, B2 = 10

*Expected results*
1. `TransferOut` −10 is written for B2, the remaining 5 reserved units are released, and dispatching more than reserved returns 422 `INVENTORY.TRANSFER_QUANTITY_INVALID`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-147: Quarantined/expired allocated batch blocks dispatch with no writes

| Field | Value |
|---|---|
| Story | [US-04-21](../stories/EPIC-04-BATCH-INVENTORY/US-04-21-transfer-dispatch-and-in-transit.md) — Transfer dispatch and in-transit visibility |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-04-21-AC3 |
| Requirements | FR-04-053, FR-04-054 |

**Story preconditions**
- Transfer `Approved` with reservations; dispatcher assigned to the source branch.

**US-04-21-AC3 — Batch no longer eligible at dispatch**

*Preconditions / test data*
1. B1 was quarantined (or expired) after approval

*Steps*
1. D dispatches

*Expected results*
1. the response is 422 `INVENTORY.BATCH_NOT_SELLABLE` with reason `Quarantined` (or `Expired`), nothing is written, and T stays `Approved`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-148: CS-06: in-transit quantities visible to source and destination, excluded from OnHand

| Field | Value |
|---|---|
| Story | [US-04-21](../stories/EPIC-04-BATCH-INVENTORY/US-04-21-transfer-dispatch-and-in-transit.md) — Transfer dispatch and in-transit visibility |
| Type / Execution | E2E / Manual |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-04-21-AC4 |
| Critical scenario | CS-06 |
| Requirements | FR-04-053, FR-04-054 |

**Story preconditions**
- Transfer `Approved` with reservations; dispatcher assigned to the source branch.

**US-04-21-AC4 — In-transit visibility in both branches (CS-06)**

*Preconditions / test data*
1. T is `InTransit` with 40 units outstanding

*Steps*
1. users of A and C call `GET …/inventory/in-transit` and the stock overview

*Expected results*
1. A sees T as outbound and C as inbound with per-medicine and per-batch outstanding 40, dispatch time, and dispatcher
2. neither branch's OnHand includes the 40 units

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-149: CS-07 destination-only user → 403; permission → 403; CS-08 → 404

| Field | Value |
|---|---|
| Story | [US-04-21](../stories/EPIC-04-BATCH-INVENTORY/US-04-21-transfer-dispatch-and-in-transit.md) — Transfer dispatch and in-transit visibility |
| Type / Execution | API / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-04-21-AC5 |
| Critical scenario | CS-07, CS-08 |
| Requirements | FR-04-053, FR-04-054 |

**Story preconditions**
- Transfer `Approved` with reservations; dispatcher assigned to the source branch.

**US-04-21-AC5 — Wrong side or permission**

*Preconditions / test data*
1. user R assigned only to destination C with `inventory.transfers.dispatch`, and a cashier at A without the permission

*Steps*
1. each dispatches T

*Expected results*
1. the responses are 403 `IDENTITY.BRANCH_ACCESS_DENIED` and 403 `IDENTITY.PERMISSION_DENIED`
2. a transfer id of another organization returns 404 `COMMON.NOT_FOUND`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-150: CS-11: dispatch retried with same key → one set of TransferOut movements

| Field | Value |
|---|---|
| Story | [US-04-21](../stories/EPIC-04-BATCH-INVENTORY/US-04-21-transfer-dispatch-and-in-transit.md) — Transfer dispatch and in-transit visibility |
| Type / Execution | API / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-04-21-AC6 |
| Critical scenario | CS-11, CS-10 |
| Requirements | FR-04-053, FR-04-054 |

**Story preconditions**
- Transfer `Approved` with reservations; dispatcher assigned to the source branch.

**US-04-21-AC6 — Retry and failure (CS-10, CS-11)**

*Preconditions / test data*
1. the first dispatch request times out at the client after commit, and in a separate run a fault is injected after the first `TransferOut` insert

*Steps*
1. the client retries with the same key, and the faulted request ends

*Expected results*
1. the retry replays the original success with movements written once
2. the faulted run leaves T `Approved` with reservations and balances unchanged

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-151: CS-10: fault after first TransferOut insert → full rollback, reservations intact

| Field | Value |
|---|---|
| Story | [US-04-21](../stories/EPIC-04-BATCH-INVENTORY/US-04-21-transfer-dispatch-and-in-transit.md) — Transfer dispatch and in-transit visibility |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-04-21-AC6 |
| Critical scenario | CS-10, CS-11 |
| Requirements | FR-04-053, FR-04-054 |

**Story preconditions**
- Transfer `Approved` with reservations; dispatcher assigned to the source branch.

**US-04-21-AC6 — Retry and failure (CS-10, CS-11)**

*Preconditions / test data*
1. the first dispatch request times out at the client after commit, and in a separate run a fault is injected after the first `TransferOut` insert

*Steps*
1. the client retries with the same key, and the faulted request ends

*Expected results*
1. the retry replays the original success with movements written once
2. the faulted run leaves T `Approved` with reservations and balances unchanged

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-04-22: Transfer receipt with short, over, and rejected quantities

### TS-04-152: Full receipt creates linked destination batch with inherited fields; status Received

| Field | Value |
|---|---|
| Story | [US-04-22](../stories/EPIC-04-BATCH-INVENTORY/US-04-22-transfer-receipt.md) — Transfer receipt with short, over, and rejected quantities |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-04-22-AC1 |
| Requirements | FR-04-055, FR-04-056, FR-04-057 |

**Story preconditions**
- Transfer `InTransit` or `PartiallyReceived`; receiver assigned to the destination branch.

**US-04-22-AC1 — Full receipt into linked destination batch**

*Preconditions / test data*
1. T (A → C) dispatched B1 = 25 (number `X1`, expiry 2027-01-31, cost 12.5000, override 95.0000) and C has no batch with SourceBatchId = B1

*Steps*
1. user R with `inventory.transfers.receive` assigned to C records received 25 with an `Idempotency-Key`

*Expected results*
1. a batch C1 is created in C with the same number, expiry, unit cost, supplier, override and SourceBatchId = B1
2. a `TransferIn` +25 movement is written
3. status becomes `Received`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-153: CS-06: partial receipt then final short → TransferReturn + TransitLoss draft; statuses PartiallyReceived → Received

| Field | Value |
|---|---|
| Story | [US-04-22](../stories/EPIC-04-BATCH-INVENTORY/US-04-22-transfer-receipt.md) — Transfer receipt with short, over, and rejected quantities |
| Type / Execution | E2E / Manual |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-04-22-AC2 |
| Critical scenario | CS-06 |
| Requirements | FR-04-055, FR-04-056, FR-04-057 |

**Story preconditions**
- Transfer `InTransit` or `PartiallyReceived`; receiver assigned to the destination branch.

**US-04-22-AC2 — Partial then final receipt with shortage (CS-06)**

*Preconditions / test data*
1. T dispatched B1 = 25 and B2 = 15

*Steps*
1. R records receipt 1 (B1 received 25, B2 received 10) and later a final receipt (B2 short 5)

*Expected results*
1. after receipt 1 status is `PartiallyReceived` with outstanding 5
2. after the final receipt a `TransferReturn` +5 is posted into source batch B2, a draft `StockAdjustment` (Decrease 5, reason `TransitLoss`, OriginTransferId T) is created in A, and status becomes `Received`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-154: Rejected damaged → TransferReturn + draft Damaged write-off in source

| Field | Value |
|---|---|
| Story | [US-04-22](../stories/EPIC-04-BATCH-INVENTORY/US-04-22-transfer-receipt.md) — Transfer receipt with short, over, and rejected quantities |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-04-22-AC3 |
| Requirements | FR-04-055, FR-04-056, FR-04-057 |

**Story preconditions**
- Transfer `InTransit` or `PartiallyReceived`; receiver assigned to the destination branch.

**US-04-22-AC3 — Rejected damaged items**

*Preconditions / test data*
1. 3 of B1's 25 units arrive broken

*Steps*
1. R records received 22 and rejected 3 with reason `Damaged`

*Expected results*
1. `TransferIn` +22 into C1 and `TransferReturn` +3 into B1 are posted, and a draft `WriteOff` (Damaged, 3 units of B1, OriginTransferId T) is created in A

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-155: Over-receipt → 422, no writes

| Field | Value |
|---|---|
| Story | [US-04-22](../stories/EPIC-04-BATCH-INVENTORY/US-04-22-transfer-receipt.md) — Transfer receipt with short, over, and rejected quantities |
| Type / Execution | API / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-04-22-AC4 |
| Requirements | FR-04-055, FR-04-056, FR-04-057 |

**Story preconditions**
- Transfer `InTransit` or `PartiallyReceived`; receiver assigned to the destination branch.

**US-04-22-AC4 — Over-receipt rejected**

*Preconditions / test data*
1. B2 has outstanding 5

*Steps*
1. R records received 6 for B2

*Expected results*
1. the response is 422 `INVENTORY.TRANSFER_OVER_RECEIPT`, nothing is written, and the receiver records surplus separately via a `FoundStock` adjustment if physically present

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-156: Second transfer increments same destination batch; direct batch stays separate

| Field | Value |
|---|---|
| Story | [US-04-22](../stories/EPIC-04-BATCH-INVENTORY/US-04-22-transfer-receipt.md) — Transfer receipt with short, over, and rejected quantities |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-04-22-AC5 |
| Requirements | FR-04-055, FR-04-056, FR-04-057 |

**Story preconditions**
- Transfer `InTransit` or `PartiallyReceived`; receiver assigned to the destination branch.

**US-04-22-AC5 — Second transfer increments the same destination batch**

*Preconditions / test data*
1. C1 exists from an earlier transfer of B1 with OnHand 10

*Steps*
1. a new transfer of 8 units of B1 is received

*Expected results*
1. C1 is incremented to 18 (no new batch), and a directly received batch with the same number in C remains separate

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-157: CS-07 source-side user → 403; permission → 403; CS-08 → 404

| Field | Value |
|---|---|
| Story | [US-04-22](../stories/EPIC-04-BATCH-INVENTORY/US-04-22-transfer-receipt.md) — Transfer receipt with short, over, and rejected quantities |
| Type / Execution | API / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-04-22-AC7 |
| Critical scenario | CS-07, CS-08 |
| Requirements | FR-04-055, FR-04-056, FR-04-057 |

**Story preconditions**
- Transfer `InTransit` or `PartiallyReceived`; receiver assigned to the destination branch.

**US-04-22-AC7 — Wrong side and organization**

*Preconditions / test data*
1. user S assigned only to source A with `inventory.transfers.receive`, and a transfer id of another organization

*Steps*
1. each records a receipt

*Expected results*
1. the responses are 403 `IDENTITY.BRANCH_ACCESS_DENIED` and 404 `COMMON.NOT_FOUND`
2. a user at C without the permission gets 403 `IDENTITY.PERMISSION_DENIED`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-158: CS-06: property-based conservation over random receipt/reject/short sequences

| Field | Value |
|---|---|
| Story | [US-04-22](../stories/EPIC-04-BATCH-INVENTORY/US-04-22-transfer-receipt.md) — Transfer receipt with short, over, and rejected quantities |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-04-22-AC6 |
| Critical scenario | CS-06 |
| Requirements | FR-04-055, FR-04-056, FR-04-057 |

**Story preconditions**
- Transfer `InTransit` or `PartiallyReceived`; receiver assigned to the destination branch.

**US-04-22-AC6 — Conservation holds**

*Preconditions / test data*
1. any sequence of receipts, rejections, and shortages on T

*Steps*
1. T reaches `Received`

*Expected results*
1. Σ TransferOut = Σ TransferIn + Σ TransferReturn and every allocation satisfies DispatchedQty = Received + Rejected + Short

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-159: CS-11: receipt retried with same key increments once

| Field | Value |
|---|---|
| Story | [US-04-22](../stories/EPIC-04-BATCH-INVENTORY/US-04-22-transfer-receipt.md) — Transfer receipt with short, over, and rejected quantities |
| Type / Execution | API / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-04-22-AC8 |
| Critical scenario | CS-11 |
| Requirements | FR-04-055, FR-04-056, FR-04-057 |

**Story preconditions**
- Transfer `InTransit` or `PartiallyReceived`; receiver assigned to the destination branch.

**US-04-22-AC8 — Idempotent receipt (CS-11)**

*Preconditions / test data*
1. receipt 1 was committed but the response was lost

*Steps*
1. the client retries with the same key

*Expected results*
1. the stored response is returned and C1 is incremented only once

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-04-23: Stocktake creation and start with snapshot

### TS-04-160: Create cycle draft; empty scope → 422

| Field | Value |
|---|---|
| Story | [US-04-23](../stories/EPIC-04-BATCH-INVENTORY/US-04-23-stocktake-creation-and-start.md) — Stocktake creation and start with snapshot |
| Type / Execution | API / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-04-23-AC1 |
| Requirements | FR-04-058, FR-04-059 |

**Story preconditions**
- Branch active; batches exist.

**US-04-23-AC1 — Create a cycle stocktake**

*Preconditions / test data*
1. a user with `inventory.stocktakes.manage` at branch A

*Steps*
1. the user creates a `Cycle` stocktake scoped to category "Antibiotics" and medicine M9

*Expected results*
1. a `Draft` stocktake is created with the scope and no lines
2. a `Cycle` with empty scope returns 422 `INVENTORY.STOCKTAKE_SCOPE_INVALID`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-161: Start snapshot lines with sequence, number, audit

| Field | Value |
|---|---|
| Story | [US-04-23](../stories/EPIC-04-BATCH-INVENTORY/US-04-23-stocktake-creation-and-start.md) — Stocktake creation and start with snapshot |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-04-23-AC2 |
| Requirements | FR-04-058, FR-04-059 |

**Story preconditions**
- Branch active; batches exist.

**US-04-23-AC2 — Start takes a snapshot**

*Preconditions / test data*
1. the scope resolves to 120 batches with OnHand > 0 (including expired and quarantined batches)

*Steps*
1. the user starts the stocktake with a valid `If-Match`

*Expected results*
1. in one transaction (balance rows locked `FOR SHARE` in BatchId order) 120 lines are created with SnapshotOnHand and SnapshotSequence = each batch's LastMovementSequence, status becomes `Counting`, StartedAt is set, number `{BranchCode}-STK-2026-NNNNNN` is assigned, and an audit entry is written

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-162: Overlapping start → 409 with batch list

| Field | Value |
|---|---|
| Story | [US-04-23](../stories/EPIC-04-BATCH-INVENTORY/US-04-23-stocktake-creation-and-start.md) — Stocktake creation and start with snapshot |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-04-23-AC3 |
| Requirements | FR-04-058, FR-04-059 |

**Story preconditions**
- Branch active; batches exist.

**US-04-23-AC3 — Scope overlap rejected**

*Preconditions / test data*
1. batch B is in a stocktake that is `Counting`

*Steps*
1. a second stocktake whose scope includes B is started

*Expected results*
1. the response is 409 `INVENTORY.STOCKTAKE_SCOPE_OVERLAP` listing up to 50 overlapping batches, and the second stocktake stays `Draft`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-163: Sales during Counting succeed; movements after snapshot sequence

| Field | Value |
|---|---|
| Story | [US-04-23](../stories/EPIC-04-BATCH-INVENTORY/US-04-23-stocktake-creation-and-start.md) — Stocktake creation and start with snapshot |
| Type / Execution | Concurrency / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-04-23-AC4 |
| Requirements | FR-04-058, FR-04-059 |

**Story preconditions**
- Branch active; batches exist.

**US-04-23-AC4 — Sales continue during counting**

*Preconditions / test data*
1. the stocktake is `Counting`

*Steps*
1. cashiers sell scoped medicines

*Expected results*
1. sales complete normally (no lock is held after the start transaction) and the movements have BatchSequence > SnapshotSequence

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-164: Full count includes only OnHand > 0 batches

| Field | Value |
|---|---|
| Story | [US-04-23](../stories/EPIC-04-BATCH-INVENTORY/US-04-23-stocktake-creation-and-start.md) — Stocktake creation and start with snapshot |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-04-23-AC5 |
| Requirements | FR-04-058, FR-04-059 |

**Story preconditions**
- Branch active; batches exist.

**US-04-23-AC5 — Full count scope**

*Preconditions / test data*
1. branch A has 3,000 batches with OnHand > 0 and 900 batches with OnHand 0

*Steps*
1. a `Full` stocktake is started

*Expected results*
1. 3,000 lines are created
2. zero-balance batches are not included (found stock is added during counting)

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-165: 403 permission, 403 branch (CS-07), 404 other org (CS-08)

| Field | Value |
|---|---|
| Story | [US-04-23](../stories/EPIC-04-BATCH-INVENTORY/US-04-23-stocktake-creation-and-start.md) — Stocktake creation and start with snapshot |
| Type / Execution | API / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-04-23-AC6 |
| Critical scenario | CS-07, CS-08 |
| Requirements | FR-04-058, FR-04-059 |

**Story preconditions**
- Branch active; batches exist.

**US-04-23-AC6 — Authorization**

*Preconditions / test data*
1. a cashier without `inventory.stocktakes.manage`, a user not assigned to branch B, and a stocktake id of another organization

*Steps*
1. each creates or starts a stocktake

*Expected results*
1. the responses are 403 `IDENTITY.PERMISSION_DENIED`, 403 `IDENTITY.BRANCH_ACCESS_DENIED`, and 404 `COMMON.NOT_FOUND`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-04-24: Stocktake blind counting and submission

### TS-04-166: Blind response omits snapshot/expected/variance for counters

| Field | Value |
|---|---|
| Story | [US-04-24](../stories/EPIC-04-BATCH-INVENTORY/US-04-24-stocktake-blind-counting-and-submission.md) — Stocktake blind counting and submission |
| Type / Execution | API / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-04-24-AC1 |
| Requirements | FR-04-060 |

**Story preconditions**
- Stocktake `Counting`.

**US-04-24-AC1 — Blind lines for counters**

*Preconditions / test data*
1. counter K has `inventory.stocktakes.manage` but not `inventory.stocktakes.approve`

*Steps*
1. K reads `GET …/stocktakes/S/lines`

*Expected results*
1. each line shows medicine, batch number, expiry, and counted fields only
2. `snapshotOnHand`, `expected`, and `variance` are absent

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-167: Record and overwrite count with audit

| Field | Value |
|---|---|
| Story | [US-04-24](../stories/EPIC-04-BATCH-INVENTORY/US-04-24-stocktake-blind-counting-and-submission.md) — Stocktake blind counting and submission |
| Type / Execution | API / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-04-24-AC2 |
| Requirements | FR-04-060 |

**Story preconditions**
- Stocktake `Counting`.

**US-04-24-AC2 — Record a count**

*Preconditions / test data*
1. line L (batch B) in stocktake S started at 08:00

*Steps*
1. K records counted 47 with CountedAt 09:12 (today)

*Expected results*
1. the line stores CountedQuantity 47, CountedAt 09:12, CountedBy K
2. re-entering a count overwrites it and keeps the previous value in the audit trail

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-168: Negative count, CountedAt before start or in future → 422

| Field | Value |
|---|---|
| Story | [US-04-24](../stories/EPIC-04-BATCH-INVENTORY/US-04-24-stocktake-blind-counting-and-submission.md) — Stocktake blind counting and submission |
| Type / Execution | API / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-04-24-AC3 |
| Requirements | FR-04-060 |

**Story preconditions**
- Stocktake `Counting`.

**US-04-24-AC3 — Invalid counts**

*Preconditions / test data*
1. line L

*Steps*
1. K records counted −1, or CountedAt 07:59 (before start), or CountedAt 5 minutes in the future

*Expected results*
1. the responses are 422 `INVENTORY.INVALID_QUANTITY`, 422 `INVENTORY.COUNTED_AT_INVALID`, and 422 `INVENTORY.COUNTED_AT_INVALID`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-169: Found batch line added

| Field | Value |
|---|---|
| Story | [US-04-24](../stories/EPIC-04-BATCH-INVENTORY/US-04-24-stocktake-blind-counting-and-submission.md) — Stocktake blind counting and submission |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-04-24-AC4 |
| Requirements | FR-04-060 |

**Story preconditions**
- Stocktake `Counting`.

**US-04-24-AC4 — Add found batch**

*Preconditions / test data*
1. K finds medicine M with batch `Z5` expiry 2027-06-30 not in the line list

*Steps*
1. K adds a line with batch number, expiry, counted 6 (unit cost defaults to the medicine's LastPurchaseCost, editable only by approvers)

*Expected results*
1. a line with BatchId null (or the matched existing batch outside scope, with SnapshotOnHand 0 and its current sequence) is added

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-170: Incomplete submit → 422; exclude + count → PendingApproval + event

| Field | Value |
|---|---|
| Story | [US-04-24](../stories/EPIC-04-BATCH-INVENTORY/US-04-24-stocktake-blind-counting-and-submission.md) — Stocktake blind counting and submission |
| Type / Execution | API / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-04-24-AC5 |
| Requirements | FR-04-060 |

**Story preconditions**
- Stocktake `Counting`.

**US-04-24-AC5 — Submit requires completeness**

*Preconditions / test data*
1. 118 of 120 lines are counted and none excluded

*Steps*
1. K submits

*Expected results*
1. the response is 422 `INVENTORY.STOCKTAKE_INCOMPLETE` listing the 2 uncounted lines
2. after excluding one with reason `NotAccessible` and counting the other, submit sets status `PendingApproval` and emits `Inventory.InventoryDocumentPendingApproval.v1`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-171: Edit after submit → 409

| Field | Value |
|---|---|
| Story | [US-04-24](../stories/EPIC-04-BATCH-INVENTORY/US-04-24-stocktake-blind-counting-and-submission.md) — Stocktake blind counting and submission |
| Type / Execution | API / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-04-24-AC6 |
| Requirements | FR-04-060 |

**Story preconditions**
- Stocktake `Counting`.

**US-04-24-AC6 — Counting after submission blocked**

*Preconditions / test data*
1. S is `PendingApproval`

*Steps*
1. K edits a count on a line not returned for recount

*Expected results*
1. the response is 409 `INVENTORY.INVALID_STATE_TRANSITION`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-172: 403 permission, 403 branch (CS-07), 404 other org (CS-08)

| Field | Value |
|---|---|
| Story | [US-04-24](../stories/EPIC-04-BATCH-INVENTORY/US-04-24-stocktake-blind-counting-and-submission.md) — Stocktake blind counting and submission |
| Type / Execution | API / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-04-24-AC7 |
| Critical scenario | CS-07, CS-08 |
| Requirements | FR-04-060 |

**Story preconditions**
- Stocktake `Counting`.

**US-04-24-AC7 — Authorization**

*Preconditions / test data*
1. a cashier without `inventory.stocktakes.manage`, a counter not assigned to branch B, and a stocktake id of another organization

*Steps*
1. each reads lines or records counts

*Expected results*
1. the responses are 403 `IDENTITY.PERMISSION_DENIED`, 403 `IDENTITY.BRANCH_ACCESS_DENIED`, and 404 `COMMON.NOT_FOUND`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-04-25: Stocktake review, recount, approval, and variance posting

### TS-04-173: Expected/variance formula with movements before and after CountedAt and sequence boundary

| Field | Value |
|---|---|
| Story | [US-04-25](../stories/EPIC-04-BATCH-INVENTORY/US-04-25-stocktake-approval-and-variance-posting.md) — Stocktake review, recount, approval, and variance posting |
| Type / Execution | Unit / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-04-25-AC1 |
| Requirements | FR-04-061 |

**Story preconditions**
- Stocktake `PendingApproval`.

**US-04-25-AC1 — Variance accounts for movements after snapshot**

*Preconditions / test data*
1. line L: SnapshotOnHand 50 at sequence 10
2. after start, movements Sale −3 (seq 11, 08:30) and Sale −2 (seq 12, 09:30)
3. CountedQuantity 44 with CountedAt 09:12

*Steps*
1. the approver opens the review

*Expected results*
1. Expected = 50 − 3 = 47, Variance = −3, VarianceValue = −3 × UnitCost, shown with totals of positive and negative variance values

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-174: Approval posts only non-zero variances against current balances

| Field | Value |
|---|---|
| Story | [US-04-25](../stories/EPIC-04-BATCH-INVENTORY/US-04-25-stocktake-approval-and-variance-posting.md) — Stocktake review, recount, approval, and variance posting |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-04-25-AC2 |
| Requirements | FR-04-061 |

**Story preconditions**
- Stocktake `PendingApproval`.

**US-04-25-AC2 — Approval posts variance movements**

*Preconditions / test data*
1. lines with variances −3, 0, +2 and current OnHand 45, 20, 8 respectively

*Steps*
1. manager G (≠ submitter) with `inventory.stocktakes.approve` approves with an `Idempotency-Key`

*Expected results*
1. status becomes `Posted`
2. `StocktakeVariance` movements −3 and +2 are written (none for 0)
3. resulting OnHand 42 and 10
4. an audit entry and `Inventory.StockMovementsPosted.v1` are written in the same transaction

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-175: Return for recount → Counting, only returned lines editable

| Field | Value |
|---|---|
| Story | [US-04-25](../stories/EPIC-04-BATCH-INVENTORY/US-04-25-stocktake-approval-and-variance-posting.md) — Stocktake review, recount, approval, and variance posting |
| Type / Execution | API / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-04-25-AC3 |
| Requirements | FR-04-061 |

**Story preconditions**
- Stocktake `PendingApproval`.

**US-04-25-AC3 — Return lines for recount**

*Preconditions / test data*
1. a line with variance −30

*Steps*
1. G returns it for recount with reason "Variance above 20 units, recount shelf 3"

*Expected results*
1. status becomes `Counting`, only returned lines are editable, and resubmission follows US-04-24

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-176: Self-approval → 403

| Field | Value |
|---|---|
| Story | [US-04-25](../stories/EPIC-04-BATCH-INVENTORY/US-04-25-stocktake-approval-and-variance-posting.md) — Stocktake review, recount, approval, and variance posting |
| Type / Execution | API / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-04-25-AC4 |
| Requirements | FR-04-061 |

**Story preconditions**
- Stocktake `PendingApproval`.

**US-04-25-AC4 — Self-approval blocked**

*Preconditions / test data*
1. user K submitted the stocktake and holds `inventory.stocktakes.approve`

*Steps*
1. K approves

*Expected results*
1. the response is 403 `INVENTORY.SELF_APPROVAL_NOT_ALLOWED`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-177: Variance conflict → 409, nothing posted

| Field | Value |
|---|---|
| Story | [US-04-25](../stories/EPIC-04-BATCH-INVENTORY/US-04-25-stocktake-approval-and-variance-posting.md) — Stocktake review, recount, approval, and variance posting |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-04-25-AC5 |
| Requirements | FR-04-061 |

**Story preconditions**
- Stocktake `PendingApproval`.

**US-04-25-AC5 — Variance conflict**

*Preconditions / test data*
1. line L counted 0 at 09:00, but 2 units were sold after 09:00 so current OnHand is 3 and variance is −5

*Steps*
1. G approves

*Expected results*
1. the response is 409 `INVENTORY.STOCKTAKE_VARIANCE_CONFLICT` listing L, nothing is posted, and G returns L for recount

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-178: Found batch created with positive variance

| Field | Value |
|---|---|
| Story | [US-04-25](../stories/EPIC-04-BATCH-INVENTORY/US-04-25-stocktake-approval-and-variance-posting.md) — Stocktake review, recount, approval, and variance posting |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-04-25-AC6 |
| Requirements | FR-04-061 |

**Story preconditions**
- Stocktake `PendingApproval`.

**US-04-25-AC6 — Found batch posting**

*Preconditions / test data*
1. a found-stock line `Z5` with counted 6 and no existing batch

*Steps*
1. the stocktake is approved

*Expected results*
1. batch `Z5` is created via the inbound contract with a `StocktakeVariance` +6 movement

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-179: CS-10 failure after 4,000 movements → rollback; CS-11 retries → single posting; NFR-04-002 5,000 lines ≤ 15 s

| Field | Value |
|---|---|
| Story | [US-04-25](../stories/EPIC-04-BATCH-INVENTORY/US-04-25-stocktake-approval-and-variance-posting.md) — Stocktake review, recount, approval, and variance posting |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-04-25-AC7 |
| Critical scenario | CS-10, CS-11 |
| Requirements | FR-04-061 |

**Story preconditions**
- Stocktake `PendingApproval`.

**US-04-25-AC7 — Atomicity and retry (CS-10, CS-11)**

*Preconditions / test data*
1. a 5,000-line stocktake

*Steps*
1. a failure is injected after 4,000 variance movements, then the approval is retried twice with the same key

*Expected results*
1. the failed attempt leaves no movements and status `PendingApproval`
2. the first retry posts all
3. the second replays the response

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-180: 403 permission, 403 branch (CS-07), 404 other org (CS-08)

| Field | Value |
|---|---|
| Story | [US-04-25](../stories/EPIC-04-BATCH-INVENTORY/US-04-25-stocktake-approval-and-variance-posting.md) — Stocktake review, recount, approval, and variance posting |
| Type / Execution | API / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-04-25-AC8 |
| Critical scenario | CS-07, CS-08 |
| Requirements | FR-04-061 |

**Story preconditions**
- Stocktake `PendingApproval`.

**US-04-25-AC8 — Authorization**

*Preconditions / test data*
1. an inventory user without `inventory.stocktakes.approve`, a manager not assigned to branch B, and a stocktake id of another organization

*Steps*
1. each approves

*Expected results*
1. the responses are 403 `IDENTITY.PERMISSION_DENIED`, 403 `IDENTITY.BRANCH_ACCESS_DENIED`, and 404 `COMMON.NOT_FOUND`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-04-26: Inventory valuation snapshot and as-of valuation

### TS-04-181: Snapshot buckets and values from ledger

| Field | Value |
|---|---|
| Story | [US-04-26](../stories/EPIC-04-BATCH-INVENTORY/US-04-26-inventory-valuation-data.md) — Inventory valuation snapshot and as-of valuation |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-04-26-AC1 |
| Requirements | FR-04-062 |

**Story preconditions**
- Job `inventory.valuation-snapshot` runs per branch at 00:30 branch local for the previous business date.

**US-04-26-AC1 — Nightly snapshot buckets**

*Preconditions / test data*
1. at end of business date 2026-11-09, medicine M in branch A has sellable batch 40 × 12.5000, near-expiry batch 10 × 13.0000, expired batch 3 × 11.0000, quarantined batch 7 × 12.0000

*Steps*
1. the snapshot job runs at 00:30 on 2026-11-10

*Expected results*
1. one `InventoryValuationSnapshot` row (A, 2026-11-09, M) stores quantities 40/10/3/7 and values 500.00/130.00/33.00/84.00, computed from movements with BusinessDate ≤ 2026-11-09

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-182: In-transit valued at source only

| Field | Value |
|---|---|
| Story | [US-04-26](../stories/EPIC-04-BATCH-INVENTORY/US-04-26-inventory-valuation-data.md) — Inventory valuation snapshot and as-of valuation |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-04-26-AC2 |
| Requirements | FR-04-062 |

**Story preconditions**
- Job `inventory.valuation-snapshot` runs per branch at 00:30 branch local for the previous business date.

**US-04-26-AC2 — In-transit attributed to source**

*Preconditions / test data*
1. 15 units × 12.5000 of M are in transit from A to C at end of day

*Steps*
1. the snapshot runs

*Expected results*
1. A's row has InTransitOutbound quantity 15 and value 187.50
2. C's row has no in-transit value

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-183: As-of valuation equals ledger sums; NFR-04-012 p95 ≤ 5 s

| Field | Value |
|---|---|
| Story | [US-04-26](../stories/EPIC-04-BATCH-INVENTORY/US-04-26-inventory-valuation-data.md) — Inventory valuation snapshot and as-of valuation |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-04-26-AC3 |
| Requirements | FR-04-062 |

**Story preconditions**
- Job `inventory.valuation-snapshot` runs per branch at 00:30 branch local for the previous business date.

**US-04-26-AC3 — As-of valuation equals ledger**

*Preconditions / test data*
1. a user with `reports.inventory.read`

*Steps*
1. `GET …/inventory/valuation?asOf=2026-11-09T14:00:00+02:00` is called

*Expected results*
1. per medicine on-hand and value equal Σ QuantityDelta and Σ QuantityDelta × UnitCost of movements with OccurredAt ≤ asOf, and the branch total equals the sum of lines

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-184: Rerun upserts without duplicates

| Field | Value |
|---|---|
| Story | [US-04-26](../stories/EPIC-04-BATCH-INVENTORY/US-04-26-inventory-valuation-data.md) — Inventory valuation snapshot and as-of valuation |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-04-26-AC4 |
| Requirements | FR-04-062 |

**Story preconditions**
- Job `inventory.valuation-snapshot` runs per branch at 00:30 branch local for the previous business date.

**US-04-26-AC4 — Idempotent rerun**

*Preconditions / test data*
1. the snapshot for (A, 2026-11-09) exists

*Steps*
1. the job reruns for that date

*Expected results*
1. rows are upserted with identical values and no duplicates exist

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-185: 403 permission, 403 branch (CS-07), 404 other org (CS-08)

| Field | Value |
|---|---|
| Story | [US-04-26](../stories/EPIC-04-BATCH-INVENTORY/US-04-26-inventory-valuation-data.md) — Inventory valuation snapshot and as-of valuation |
| Type / Execution | API / Automated |
| Priority | T1 (story P1) |
| Release | MVP |
| Covers | US-04-26-AC5 |
| Critical scenario | CS-07, CS-08 |
| Requirements | FR-04-062 |

**Story preconditions**
- Job `inventory.valuation-snapshot` runs per branch at 00:30 branch local for the previous business date.

**US-04-26-AC5 — Authorization**

*Preconditions / test data*
1. an inventory user without `reports.inventory.read`, an accountant not assigned to branch B without organization-wide scope, and a branch of another organization

*Steps*
1. each requests valuation

*Expected results*
1. the responses are 403 `IDENTITY.PERMISSION_DENIED`, 403 `IDENTITY.BRANCH_ACCESS_DENIED`, and 404 `COMMON.NOT_FOUND`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-04-27: Multi-branch stock visibility

### TS-04-186: Availability across active branches, no cost fields, inactive excluded

| Field | Value |
|---|---|
| Story | [US-04-27](../stories/EPIC-04-BATCH-INVENTORY/US-04-27-multi-branch-stock-visibility.md) — Multi-branch stock visibility |
| Type / Execution | API / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-04-27-AC1 |
| Requirements | FR-04-063 |

**Story preconditions**
- Organization has ≥ 2 active branches.

**US-04-27-AC1 — Quantities across branches without costs**

*Preconditions / test data*
1. medicine M has sellable 12 in A, 0 in C, 40 in D (of which 10 near-expiry), and branch E is `Inactive`

*Steps*
1. a pharmacist with `inventory.stock.read-other-branches` assigned only to A calls `GET /api/v1/inventory/medicines/M/branch-availability`

*Expected results*
1. rows for A, C, D are returned with sellable, nearExpiry, earliestSellableExpiry, and branch name/phone
2. E is excluded
3. no cost or value field is present

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-187: Missing permission → 403

| Field | Value |
|---|---|
| Story | [US-04-27](../stories/EPIC-04-BATCH-INVENTORY/US-04-27-multi-branch-stock-visibility.md) — Multi-branch stock visibility |
| Type / Execution | API / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-04-27-AC2 |
| Requirements | FR-04-063 |

**Story preconditions**
- Organization has ≥ 2 active branches.

**US-04-27-AC2 — Permission required**

*Preconditions / test data*
1. a cashier without `inventory.stock.read-other-branches`

*Steps*
1. the cashier calls the endpoint

*Expected results*
1. the response is 403 `IDENTITY.PERMISSION_DENIED`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-188: CS-08: other-org medicine → 404

| Field | Value |
|---|---|
| Story | [US-04-27](../stories/EPIC-04-BATCH-INVENTORY/US-04-27-multi-branch-stock-visibility.md) — Multi-branch stock visibility |
| Type / Execution | API / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-04-27-AC3 |
| Critical scenario | CS-08 |
| Requirements | FR-04-063 |

**Story preconditions**
- Organization has ≥ 2 active branches.

**US-04-27-AC3 — Other organization's medicine**

*Preconditions / test data*
1. medicine id N belongs to another organization

*Steps*
1. the pharmacist requests its availability

*Expected results*
1. the response is 404 `COMMON.NOT_FOUND`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-189: CS-07: branch detail of unassigned branch still 403

| Field | Value |
|---|---|
| Story | [US-04-27](../stories/EPIC-04-BATCH-INVENTORY/US-04-27-multi-branch-stock-visibility.md) — Multi-branch stock visibility |
| Type / Execution | API / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-04-27-AC4 |
| Critical scenario | CS-07 |
| Requirements | FR-04-063 |

**Story preconditions**
- Organization has ≥ 2 active branches.

**US-04-27-AC4 — No branch detail access implied**

*Preconditions / test data*
1. the pharmacist sees branch D in the availability list

*Steps*
1. the pharmacist calls `GET /api/v1/branches/D/inventory/batches?medicineId=M`

*Expected results*
1. the response is 403 `IDENTITY.BRANCH_ACCESS_DENIED` (visibility is limited to the aggregate endpoint)

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-04-28: Multi-branch rebalancing suggestions

### TS-04-190: SourceAboveMax suggestion quantity formula

| Field | Value |
|---|---|
| Story | [US-04-28](../stories/EPIC-04-BATCH-INVENTORY/US-04-28-rebalancing-suggestions.md) — Multi-branch rebalancing suggestions |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P3) |
| Release | Future |
| Covers | US-04-28-AC1 |
| Requirements | FR-04-064 |

**Story preconditions**
- Reorder settings exist; 30-day sales quantities available from the ledger (`Sale` minus `SalesReturn`/`SaleVoid` movements).

**US-04-28-AC1 — Suggestion generated**

*Preconditions / test data*
1. branch C is `Low` for M (sellable 5, max 60) and branch A has sellable 150 for M with MaxQuantity 80

*Steps*
1. the nightly `inventory.rebalancing-suggestions` job runs

*Expected results*
1. a suggestion (source A, destination C, M, quantity 55, rationale `SourceAboveMax`) is stored, with quantity = min(destination max − sellable − inbound in-transit, source sellable − source max)

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-191: NearExpirySurplus suggestion bounded by sales and source minimum

| Field | Value |
|---|---|
| Story | [US-04-28](../stories/EPIC-04-BATCH-INVENTORY/US-04-28-rebalancing-suggestions.md) — Multi-branch rebalancing suggestions |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P3) |
| Release | Future |
| Covers | US-04-28-AC2 |
| Requirements | FR-04-064 |

**Story preconditions**
- Reorder settings exist; 30-day sales quantities available from the ledger (`Sale` minus `SalesReturn`/`SaleVoid` movements).

**US-04-28-AC2 — Near-expiry surplus rationale**

*Preconditions / test data*
1. A has 40 near-expiry units of M expiring in 45 days and 30-day sales of 10

*Steps*
1. the job runs and C is `Low`

*Expected results*
1. a suggestion with rationale `NearExpirySurplus` proposes at most 30 units (near-expiry quantity − 30-day sales), and no suggestion leaves the source below its MinQuantity

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-192: Accept suggestion creates draft transfer; expired suggestion → 409

| Field | Value |
|---|---|
| Story | [US-04-28](../stories/EPIC-04-BATCH-INVENTORY/US-04-28-rebalancing-suggestions.md) — Multi-branch rebalancing suggestions |
| Type / Execution | API / Automated |
| Priority | T3 (story P3) |
| Release | Future |
| Covers | US-04-28-AC3 |
| Requirements | FR-04-064 |

**Story preconditions**
- Reorder settings exist; 30-day sales quantities available from the ledger (`Sale` minus `SalesReturn`/`SaleVoid` movements).

**US-04-28-AC3 — Create a draft transfer from a suggestion**

*Preconditions / test data*
1. a suggestion S and a user with `inventory.transfers.create` assigned to A or C

*Steps*
1. the user accepts S

*Expected results*
1. a `Draft` transfer (A → C, M, 55) is created through US-04-19 and S is marked `Converted`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-04-193: 403 permission, CS-07 branch filtering, CS-08 other org → 404

| Field | Value |
|---|---|
| Story | [US-04-28](../stories/EPIC-04-BATCH-INVENTORY/US-04-28-rebalancing-suggestions.md) — Multi-branch rebalancing suggestions |
| Type / Execution | API / Automated |
| Priority | T3 (story P3) |
| Release | Future |
| Covers | US-04-28-AC4 |
| Critical scenario | CS-07, CS-08 |
| Requirements | FR-04-064 |

**Story preconditions**
- Reorder settings exist; 30-day sales quantities available from the ledger (`Sale` minus `SalesReturn`/`SaleVoid` movements).

**US-04-28-AC4 — Authorization**

*Preconditions / test data*
1. a user without `inventory.transfers.create`, and a suggestion id of another organization

*Steps*
1. each lists or accepts suggestions

*Expected results*
1. the responses are 403 `IDENTITY.PERMISSION_DENIED` and 404 `COMMON.NOT_FOUND`
2. users see only suggestions involving their assigned branches unless they have organization-wide scope

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

