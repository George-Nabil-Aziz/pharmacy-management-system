# Test Cases — EPIC-05 Suppliers & Procurement

> **Generated** by `node scripts/docs/gen-test-cases.mjs` on 2026-11-10 from the story files in `docs/stories/EPIC-05-SUPPLIERS-PROCUREMENT/`. Each test case corresponds to one test scenario (TS) declared in a story; preconditions, steps and expected results are derived from the Given / When / Then of the acceptance criteria it covers. The stories are the source of truth — change a story and regenerate.

**Conventions:** TC ID = TS ID. Priority T0 blocks merge, T1 blocks release, T2/T3 per [MASTER-TEST-STRATEGY §6](../test-plans/MASTER-TEST-STRATEGY.md). Execution: *Automated* tests are implemented in code with a trait/name carrying the TS ID; *Manual* cases are executed from this document. Test data conventions: [TEST-DATA-STRATEGY.md](../test-plans/TEST-DATA-STRATEGY.md).

## Summary (104 test cases)

| TC | Scenario | Type | Priority | Release | Covers |
|---|---|---|---|---|---|
| TS-05-001 | Create supplier without code; verify generated code, normalized tax number, Active status, audit entry | Integration | T1 | MVP | US-05-01-AC1 |
| TS-05-002 | Duplicate code (case-insensitive) and duplicate normalized tax number against an Inactive supplier | Integration | T1 | MVP | US-05-01-AC2 |
| TS-05-003 | Two updates with the same If-Match; second gets 412; audit before/after values | Integration | T1 | MVP | US-05-01-AC3 |
| TS-05-004 | Search by Arabic partial name with status filter at 3,000 and 5,000 suppliers; p95 ≤ 300 ms | Integration / Performance | T1 | MVP | US-05-01-AC4 |
| TS-05-005 | Cashier create → 403; cross-organization GET/PUT by id → 404 (CS-08); invalid fields → 400 codes | Security | T0 | MVP | US-05-01-AC5, US-05-01-AC6 |
| TS-05-006 | Deactivate with valid reason; verify status, timestamps, audit, row retained | Integration | T2 | MVP | US-05-02-AC1 |
| TS-05-007 | Create receipt/PO/invoice and post existing draft receipt for Inactive supplier → 422 | Integration | T2 | MVP | US-05-02-AC2 |
| TS-05-008 | Payment, supplier return, ledger read for Inactive supplier succeed | Integration | T2 | MVP | US-05-02-AC3 |
| TS-05-009 | Reactivate and then post a receipt successfully | Integration | T2 | MVP | US-05-02-AC4 |
| TS-05-010 | Invalid transitions 409, short reason 400, missing permission 403 | Integration / Security | T1 | MVP | US-05-02-AC5 |
| TS-05-011 | Add primary contact; verify detail and audit | Integration | T2 | MVP | US-05-03-AC1 |
| TS-05-012 | Switch primary contact; concurrent primary switch never yields two primaries | Integration | T2 | MVP | US-05-03-AC2 |
| TS-05-013 | 21st contact and invalid phone/email rejected | Integration | T2 | MVP | US-05-03-AC3 |
| TS-05-014 | Edit with If-Match then delete; audit before values | Integration | T2 | MVP | US-05-03-AC4 |
| TS-05-015 | Read-only user 403; cross-organization contact id 404 (CS-08) | Security | T1 | MVP | US-05-03-AC5 |
| TS-05-016 | Create draft; verify normalization of batch number, month/year expiry → last day, PackSize snapshot | Integration | T1 | MVP | US-05-04-AC1 |
| TS-05-017 | Line computation over random packs/costs/discounts/PackSize: rounding per BR-G-18, effective cost 4 dp | Unit (property-based) | T1 | MVP | US-05-04-AC2 |
| TS-05-018 | Draft save/edit/delete leaves balances, movements, PO, ledger unchanged; deletion audited | Integration | T1 | MVP | US-05-04-AC3 |
| TS-05-019 | Invalid quantities, zero cost with paid packs, discount > 100, 501 lines; setting disables direct receipt | Integration | T1 | MVP | US-05-04-AC4, US-05-04-AC5 |
| TS-05-020 | Missing permission and unassigned branch → 403 (CS-07); other-org supplier id → 404 (CS-08) | Security | T0 | MVP | US-05-04-AC6 |
| TS-05-021 | Expiry = business date and < business date rejected even for Owner | Integration | T1 | MVP | US-05-05-AC1 |
| TS-05-022 | Remaining-days boundary: 179 rejected, 180 accepted, setting 0 disables check; Cairo midnight boundary | Unit | T1 | MVP | US-05-05-AC2 |
| TS-05-023 | Manager override stored on line and audited in posting transaction | Integration | T1 | MVP | US-05-05-AC3 |
| TS-05-024 | Override reason supplied by user without permission → 403 | Security | T0 | MVP | US-05-05-AC4 |
| TS-05-025 | Revalidation after business-date rollover; in-receipt expiry conflict; existing-batch mismatch with/without confirmation | Integration | T1 | MVP | US-05-05-AC5 |
| TS-05-026 | Post 2-line receipt; verify number, batches, balances, movements (type, sign, source ids), LastPurchaseCost, audit, outbox | Integration | T1 | MVP | US-05-06-AC1 |
| TS-05-027 | Merge-key matrix: each key component differing (batch no., expiry, cost, supplier, status Depleted/Quarantined) | Integration | T1 | MVP | US-05-06-AC2, US-05-06-AC3 |
| TS-05-028 | 10 parallel + 3 sequential retries with same key → one effect, identical responses; same key different body → 422 | Integration (CS-11) | T0 | MVP | US-05-06-AC4 |
| TS-05-029 | Concurrent post of same receipt → one 200, one 409; fault injection mid-posting → full rollback and no number gap | Integration (CS-10) | T1 | MVP | US-05-06-AC5, US-05-06-AC6 |
| TS-05-030 | post-permission missing 403; unassigned branch 403 (CS-07); other-org receipt 404 (CS-08) | Security | T0 | MVP | US-05-06-AC7 |
| TS-05-031 | Reverse unconsumed receipt; verify ReceiptReversal movements, balances, status, audit | Integration | T2 | MVP | US-05-07-AC1 |
| TS-05-032 | Reversal blocked by sold units and by reservations; concurrent sale vs reversal never yields negative balance | Integration | T2 | MVP | US-05-07-AC2 |
| TS-05-033 | Same-key retry replays response; second reversal 409 | Integration (CS-11) | T2 | MVP | US-05-07-AC5 |
| TS-05-034 | Invoiced receipt blocked; succeeds after invoice cancellation | Integration | T2 | MVP | US-05-07-AC3 |
| TS-05-035 | PO Received → PartiallyReceived → Approved on successive reversals; missing permission 403; unassigned branch 403 (CS-07) | Integration / Security | T1 | MVP | US-05-07-AC4, US-05-07-AC5 |
| TS-05-036 | Filter by status, supplier, date range; sorting; paging; p95 ≤ 500 ms with 50,000 receipts | Integration / Performance | T2 | MVP | US-05-08-AC1 |
| TS-05-037 | Detail shows created vs incremented batches and override metadata | Integration | T2 | MVP | US-05-08-AC2 |
| TS-05-038 | History excludes Draft and Reversed receipts | Integration | T2 | MVP | US-05-08-AC3 |
| TS-05-039 | Org-wide history 403 without scope; Owner sees all branches | Security | T1 | MVP | US-05-08-AC4 |
| TS-05-040 | Unassigned branch 403 (CS-07); no-permission 403; other-org receipt id 404 (CS-08) | Security | T1 | MVP | US-05-08-AC5 |
| TS-05-041 | Reference behavior and exact values for FR-05-026 | Integration | T2 | V1 | US-05-09-AC1 |
| TS-05-042 | Negative validation path, no partial effect; COMMON.VALIDATION_FAILED | Integration | T2 | V1 | US-05-09-AC2 |
| TS-05-043 | Missing permission and cross-branch access return 403 (CS-07) | Security | T1 | V1 | US-05-09-AC3 |
| TS-05-044 | Cross-organization id returns 404 without data (CS-08) | Security | T1 | V1 | US-05-09-AC4 |
| TS-05-045 | Reference behavior and exact values for FR-05-027, FR-05-028, FR-05-029, FR-05-030, FR-05-055 | Integration | T2 | V1 | US-05-10-AC1 |
| TS-05-046 | Negative validation path, no partial effect; COMMON.VALIDATION_FAILED | Integration | T2 | V1 | US-05-10-AC2 |
| TS-05-047 | Missing permission and cross-branch access return 403 (CS-07) | Security | T1 | V1 | US-05-10-AC3 |
| TS-05-048 | Cross-organization id returns 404 without data (CS-08) | Security | T1 | V1 | US-05-10-AC4 |
| TS-05-049 | Reference behavior and exact values for FR-05-031, FR-05-032 | Integration | T2 | V1 | US-05-11-AC1 |
| TS-05-050 | Negative validation path, no partial effect; COMMON.VALIDATION_FAILED | Integration | T2 | V1 | US-05-11-AC2 |
| TS-05-051 | Missing permission and cross-branch access return 403 (CS-07) | Security | T1 | V1 | US-05-11-AC3 |
| TS-05-052 | Cross-organization id returns 404 without data (CS-08) | Security | T1 | V1 | US-05-11-AC4 |
| TS-05-053 | First 4 of 10 packs received, then remaining 6; PO status Approved → PartiallyReceived → Received, exact quantities and balances | Integration (CS-03) | T2 | V1 | US-05-12-AC1 |
| TS-05-054 | Negative validation path, no partial effect; PROCUREMENT.OVER_RECEIPT_TOLERANCE_EXCEEDED | Integration | T2 | V1 | US-05-12-AC2 |
| TS-05-055 | Missing permission and cross-branch access return 403 (CS-07) | Security | T1 | V1 | US-05-12-AC3 |
| TS-05-056 | Cross-organization id returns 404 without data (CS-08) | Security | T1 | V1 | US-05-12-AC4 |
| TS-05-057 | Reference behavior and exact values for FR-05-036, FR-05-037, FR-05-038 | Integration | T2 | V1 | US-05-13-AC1 |
| TS-05-058 | Negative validation path, no partial effect; COMMON.VALIDATION_FAILED | Integration | T2 | V1 | US-05-13-AC2 |
| TS-05-059 | Missing permission and cross-branch access return 403 (CS-07) | Security | T1 | V1 | US-05-13-AC3 |
| TS-05-060 | Cross-organization id returns 404 without data (CS-08) | Security | T1 | V1 | US-05-13-AC4 |
| TS-05-061 | Reference behavior and exact values for FR-05-039, FR-05-040, FR-05-055 | Integration | T2 | V1 | US-05-14-AC1 |
| TS-05-062 | Negative validation path, no partial effect; COMMON.VALIDATION_FAILED | Integration | T2 | V1 | US-05-14-AC2 |
| TS-05-063 | Missing permission and cross-branch access return 403 (CS-07) | Security | T1 | V1 | US-05-14-AC3 |
| TS-05-064 | Cross-organization id returns 404 without data (CS-08) | Security | T1 | V1 | US-05-14-AC4 |
| TS-05-065 | Reference behavior and exact values for FR-05-041 | Integration | T2 | V1 | US-05-15-AC1 |
| TS-05-066 | Negative validation path, no partial effect; COMMON.VALIDATION_FAILED | Integration | T2 | V1 | US-05-15-AC2 |
| TS-05-067 | Missing permission and cross-branch access return 403 (CS-07) | Security | T1 | V1 | US-05-15-AC3 |
| TS-05-068 | Cross-organization id returns 404 without data (CS-08) | Security | T1 | V1 | US-05-15-AC4 |
| TS-05-069 | Reference behavior and exact values for FR-05-042, FR-05-043 | Integration | T2 | V1 | US-05-16-AC1 |
| TS-05-070 | Negative validation path, no partial effect; PROCUREMENT.RETURN_BATCH_SUPPLIER_MISMATCH | Integration | T2 | V1 | US-05-16-AC2 |
| TS-05-071 | Missing permission and cross-branch access return 403 (CS-07) | Security | T1 | V1 | US-05-16-AC3 |
| TS-05-072 | Cross-organization id returns 404 without data (CS-08) | Security | T1 | V1 | US-05-16-AC4 |
| TS-05-073 | Reference behavior and exact values for FR-05-044, FR-05-055 | Integration | T2 | V1 | US-05-17-AC1 |
| TS-05-074 | Negative validation path, no partial effect; COMMON.VALIDATION_FAILED | Integration | T2 | V1 | US-05-17-AC2 |
| TS-05-075 | Missing permission and cross-branch access return 403 (CS-07) | Security | T1 | V1 | US-05-17-AC3 |
| TS-05-076 | Cross-organization id returns 404 without data (CS-08) | Security | T1 | V1 | US-05-17-AC4 |
| TS-05-077 | Reference behavior and exact values for FR-05-045, FR-05-046, FR-05-055 | Integration | T2 | V1 | US-05-18-AC1 |
| TS-05-078 | Negative validation path, no partial effect; COMMON.VALIDATION_FAILED | Integration | T2 | V1 | US-05-18-AC2 |
| TS-05-079 | Missing permission and cross-branch access return 403 (CS-07) | Security | T1 | V1 | US-05-18-AC3 |
| TS-05-080 | Cross-organization id returns 404 without data (CS-08) | Security | T1 | V1 | US-05-18-AC4 |
| TS-05-081 | Reference behavior and exact values for FR-05-047, FR-05-048, FR-05-055 | Integration | T2 | V1 | US-05-19-AC1 |
| TS-05-082 | Negative validation path, no partial effect; COMMON.VALIDATION_FAILED | Integration | T2 | V1 | US-05-19-AC2 |
| TS-05-083 | Missing permission and cross-branch access return 403 (CS-07) | Security | T1 | V1 | US-05-19-AC3 |
| TS-05-084 | Cross-organization id returns 404 without data (CS-08) | Security | T1 | V1 | US-05-19-AC4 |
| TS-05-085 | Reference behavior and exact values for FR-05-049, FR-05-050, FR-05-055 | Integration | T2 | V1 | US-05-20-AC1 |
| TS-05-086 | Negative validation path, no partial effect; COMMON.VALIDATION_FAILED | Integration | T2 | V1 | US-05-20-AC2 |
| TS-05-087 | Missing permission and cross-branch access return 403 (CS-07) | Security | T1 | V1 | US-05-20-AC3 |
| TS-05-088 | Cross-organization id returns 404 without data (CS-08) | Security | T1 | V1 | US-05-20-AC4 |
| TS-05-089 | Reference behavior and exact values for FR-05-051 | Integration | T2 | V1 | US-05-21-AC1 |
| TS-05-090 | Negative validation path, no partial effect; COMMON.VALIDATION_FAILED | Integration | T2 | V1 | US-05-21-AC2 |
| TS-05-091 | Missing permission and cross-branch access return 403 (CS-07) | Security | T1 | V1 | US-05-21-AC3 |
| TS-05-092 | Cross-organization id returns 404 without data (CS-08) | Security | T1 | V1 | US-05-21-AC4 |
| TS-05-093 | Reference behavior and exact values for FR-05-052 | Integration | T3 | Future | US-05-22-AC1 |
| TS-05-094 | Negative validation path, no partial effect; COMMON.VALIDATION_FAILED | Integration | T3 | Future | US-05-22-AC2 |
| TS-05-095 | Missing permission and cross-branch access return 403 (CS-07) | Security | T3 | Future | US-05-22-AC3 |
| TS-05-096 | Cross-organization id returns 404 without data (CS-08) | Security | T3 | Future | US-05-22-AC4 |
| TS-05-097 | Reference behavior and exact values for FR-05-053 | Integration | T3 | Future | US-05-23-AC1 |
| TS-05-098 | Negative validation path, no partial effect; COMMON.VALIDATION_FAILED | Integration | T3 | Future | US-05-23-AC2 |
| TS-05-099 | Missing permission and cross-branch access return 403 (CS-07) | Security | T3 | Future | US-05-23-AC3 |
| TS-05-100 | Cross-organization id returns 404 without data (CS-08) | Security | T3 | Future | US-05-23-AC4 |
| TS-05-101 | Reference behavior and exact values for FR-05-054 | Integration | T3 | Future | US-05-24-AC1 |
| TS-05-102 | Negative validation path, no partial effect; COMMON.VALIDATION_FAILED | Integration | T3 | Future | US-05-24-AC2 |
| TS-05-103 | Missing permission and cross-branch access return 403 (CS-07) | Security | T3 | Future | US-05-24-AC3 |
| TS-05-104 | Cross-organization id returns 404 without data (CS-08) | Security | T3 | Future | US-05-24-AC4 |

---

## US-05-01: Manage supplier records

### TS-05-001: Create supplier without code; verify generated code, normalized tax number, Active status, audit entry

| Field | Value |
|---|---|
| Story | [US-05-01](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-01-manage-supplier-records.md) — Manage supplier records |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-05-01-AC1 |
| Requirements | FR-05-001, FR-05-002, FR-05-003, FR-05-004, FR-05-055 |

**Story preconditions**
- The user is authenticated and belongs to an organization.
- The user holds `procurement.suppliers.manage` (create/update) or `procurement.suppliers.read` (list/detail).

**US-05-01-AC1 — Create supplier with defaults**

*Preconditions / test data*
1. a user with `procurement.suppliers.manage`

*Steps*
1. they POST `/api/v1/suppliers` with English name "Ibn Sina Pharma", no code, tax registration number "200-123-456", payment terms 30 days, and credit limit 250000.00

*Expected results*
1. the response is 201 with an auto-generated code in format `SUP-NNNNN`, tax registration number stored as "200123456", status Active, and the supplier is returned by list calls from every branch of the organization

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-002: Duplicate code (case-insensitive) and duplicate normalized tax number against an Inactive supplier

| Field | Value |
|---|---|
| Story | [US-05-01](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-01-manage-supplier-records.md) — Manage supplier records |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-05-01-AC2 |
| Requirements | FR-05-001, FR-05-002, FR-05-003, FR-05-004, FR-05-055 |

**Story preconditions**
- The user is authenticated and belongs to an organization.
- The user holds `procurement.suppliers.manage` (create/update) or `procurement.suppliers.read` (list/detail).

**US-05-01-AC2 — Duplicate code or tax registration number rejected**

*Preconditions / test data*
1. an Inactive supplier with code "IBNSINA" and tax registration number "200123456" exists in the organization

*Steps*
1. a user creates another supplier with code "ibnsina" or tax registration number "200 123 456"

*Expected results*
1. the response is 409 with `PROCUREMENT.SUPPLIER_CODE_DUPLICATE` or `PROCUREMENT.SUPPLIER_TAX_NUMBER_DUPLICATE` respectively and no supplier is created

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-003: Two updates with the same If-Match; second gets 412; audit before/after values

| Field | Value |
|---|---|
| Story | [US-05-01](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-01-manage-supplier-records.md) — Manage supplier records |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-05-01-AC3 |
| Requirements | FR-05-001, FR-05-002, FR-05-003, FR-05-004, FR-05-055 |

**Story preconditions**
- The user is authenticated and belongs to an organization.
- The user holds `procurement.suppliers.manage` (create/update) or `procurement.suppliers.read` (list/detail).

**US-05-01-AC3 — Update with optimistic concurrency and audit**

*Preconditions / test data*
1. a supplier with ETag "v1"

*Steps*
1. user A PUTs a change of payment terms from 30 to 45 with `If-Match: v1`, and then user B PUTs another change with `If-Match: v1`

*Expected results*
1. user A receives 200 with a new ETag and an audit entry containing before value 30 and after value 45

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-004: Search by Arabic partial name with status filter at 3,000 and 5,000 suppliers; p95 ≤ 300 ms

| Field | Value |
|---|---|
| Story | [US-05-01](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-01-manage-supplier-records.md) — Manage supplier records |
| Type / Execution | Integration / Performance / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-05-01-AC4 |
| Requirements | FR-05-001, FR-05-002, FR-05-003, FR-05-004, FR-05-055 |

**Story preconditions**
- The user is authenticated and belongs to an organization.
- The user holds `procurement.suppliers.manage` (create/update) or `procurement.suppliers.read` (list/detail).

**US-05-01-AC4 — Search and filter**

*Preconditions / test data*
1. 3,000 suppliers in the organization, of which 2 have Arabic names containing "المتحدة" and one is Inactive

*Steps*
1. a user with `procurement.suppliers.read` calls GET `/api/v1/suppliers?search=المتحدة&status=Active&page=1&pageSize=25`

*Expected results*
1. the response contains exactly the 1 Active matching supplier with `totalCount = 1`, and search also matches code, English name, tax registration number, and phone

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-005: Cashier create → 403; cross-organization GET/PUT by id → 404 (CS-08); invalid fields → 400 codes

| Field | Value |
|---|---|
| Story | [US-05-01](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-01-manage-supplier-records.md) — Manage supplier records |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-05-01-AC5, US-05-01-AC6 |
| Critical scenario | CS-08 |
| Requirements | FR-05-001, FR-05-002, FR-05-003, FR-05-004, FR-05-055 |

**Story preconditions**
- The user is authenticated and belongs to an organization.
- The user holds `procurement.suppliers.manage` (create/update) or `procurement.suppliers.read` (list/detail).

**US-05-01-AC5 — Permission denied and organization isolation**

*Preconditions / test data*
1. a Cashier without `procurement.suppliers.manage`, and a supplier belonging to another organization

*Steps*
1. the Cashier POSTs `/api/v1/suppliers`, and a Manager of the first organization GETs `/api/v1/suppliers/{otherOrgSupplierId}`

*Expected results*
1. the Cashier receives 403 `COMMON.FORBIDDEN`, the Manager receives 404 `COMMON.NOT_FOUND`, and no data from the other organization is returned

**US-05-01-AC6 — Field validation**

*Preconditions / test data*
1. a user with `procurement.suppliers.manage`

*Steps*
1. they submit a supplier with neither Arabic nor English name, payment terms 400, and phone "12345"

*Expected results*
1. the response is 400 `COMMON.VALIDATION_FAILED` with field errors `PROCUREMENT.SUPPLIER_NAME_REQUIRED`, `PROCUREMENT.SUPPLIER_TERMS_INVALID`, and `PROCUREMENT.PHONE_INVALID`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-05-02: Deactivate and reactivate a supplier

### TS-05-006: Deactivate with valid reason; verify status, timestamps, audit, row retained

| Field | Value |
|---|---|
| Story | [US-05-02](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-02-deactivate-reactivate-supplier.md) — Deactivate and reactivate a supplier |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-05-02-AC1 |
| Requirements | FR-05-005, FR-05-006, FR-05-055 |

**Story preconditions**
- Supplier exists in the user's organization.
- User holds `procurement.suppliers.manage`.

**US-05-02-AC1 — Deactivate with reason**

*Preconditions / test data*
1. an Active supplier

*Steps*
1. a user with `procurement.suppliers.manage` POSTs `/api/v1/suppliers/{id}/deactivate` with reason "Distributor licence suspended in Giza" (≥ 10 chars)

*Expected results*
1. the response is 200, status is Inactive, `DeactivatedAt` and reason are stored, and one audit entry is written
2. no supplier row is deleted

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-007: Create receipt/PO/invoice and post existing draft receipt for Inactive supplier → 422

| Field | Value |
|---|---|
| Story | [US-05-02](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-02-deactivate-reactivate-supplier.md) — Deactivate and reactivate a supplier |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-05-02-AC2 |
| Requirements | FR-05-005, FR-05-006, FR-05-055 |

**Story preconditions**
- Supplier exists in the user's organization.
- User holds `procurement.suppliers.manage`.

**US-05-02-AC2 — Inactive supplier blocked on new procurement documents**

*Preconditions / test data*
1. an Inactive supplier

*Steps*
1. a user creates a goods receipt, a purchase order, or a supplier invoice for that supplier, or posts an existing Draft receipt for it

*Expected results*
1. each request is rejected with 422 `PROCUREMENT.SUPPLIER_INACTIVE` and no document is created or posted

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-008: Payment, supplier return, ledger read for Inactive supplier succeed

| Field | Value |
|---|---|
| Story | [US-05-02](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-02-deactivate-reactivate-supplier.md) — Deactivate and reactivate a supplier |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-05-02-AC3 |
| Requirements | FR-05-005, FR-05-006, FR-05-055 |

**Story preconditions**
- Supplier exists in the user's organization.
- User holds `procurement.suppliers.manage`.

**US-05-02-AC3 — Inactive supplier still usable for settlement**

*Preconditions / test data*
1. an Inactive supplier with an outstanding balance and batches received from it

*Steps*
1. a user records a supplier payment, creates a supplier return, or views the ledger for that supplier

*Expected results*
1. the operations are allowed (subject to their own permissions) and the supplier appears in reports with status Inactive

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-009: Reactivate and then post a receipt successfully

| Field | Value |
|---|---|
| Story | [US-05-02](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-02-deactivate-reactivate-supplier.md) — Deactivate and reactivate a supplier |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-05-02-AC4 |
| Requirements | FR-05-005, FR-05-006, FR-05-055 |

**Story preconditions**
- Supplier exists in the user's organization.
- User holds `procurement.suppliers.manage`.

**US-05-02-AC4 — Reactivate**

*Preconditions / test data*
1. an Inactive supplier

*Steps*
1. the user POSTs `/reactivate` with reason "Licence reinstated"

*Expected results*
1. status becomes Active, `DeactivatedAt` is cleared, an audit entry is written, and new receipts for the supplier are accepted

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-010: Invalid transitions 409, short reason 400, missing permission 403

| Field | Value |
|---|---|
| Story | [US-05-02](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-02-deactivate-reactivate-supplier.md) — Deactivate and reactivate a supplier |
| Type / Execution | Integration / Security / Automated |
| Priority | T1 (story P1) |
| Release | MVP |
| Covers | US-05-02-AC5 |
| Requirements | FR-05-005, FR-05-006, FR-05-055 |

**Story preconditions**
- Supplier exists in the user's organization.
- User holds `procurement.suppliers.manage`.

**US-05-02-AC5 — Invalid transition, missing reason, and permission denied**

*Preconditions / test data*
1. an Active supplier

*Steps*
1. a user calls `/reactivate`, or calls `/deactivate` with reason "old", or an Inventory Staff user without `procurement.suppliers.manage` calls `/deactivate`

*Expected results*
1. the responses are, respectively, 409 `PROCUREMENT.SUPPLIER_STATUS_UNCHANGED`, 400 `COMMON.VALIDATION_FAILED` with field error `PROCUREMENT.REASON_REQUIRED`, and 403 `COMMON.FORBIDDEN`, and the supplier's status is unchanged in all three cases

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-05-03: Manage supplier contacts

### TS-05-011: Add primary contact; verify detail and audit

| Field | Value |
|---|---|
| Story | [US-05-03](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-03-manage-supplier-contacts.md) — Manage supplier contacts |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-05-03-AC1 |
| Requirements | FR-05-007 |

**Story preconditions**
- Supplier exists in the user's organization (Active or Inactive).
- User holds `procurement.suppliers.manage` (write) or `procurement.suppliers.read` (read).

**US-05-03-AC1 — Add contact**

*Preconditions / test data*
1. a supplier with no contacts

*Steps*
1. a user with `procurement.suppliers.manage` POSTs `/api/v1/suppliers/{id}/contacts` with name "Mahmoud Adel", job title "Sales representative – Nasr City", mobile "01012345678", `isPrimary = true`

*Expected results*
1. the response is 201, the contact is returned in supplier detail as primary, and an audit entry is written

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-012: Switch primary contact; concurrent primary switch never yields two primaries

| Field | Value |
|---|---|
| Story | [US-05-03](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-03-manage-supplier-contacts.md) — Manage supplier contacts |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-05-03-AC2 |
| Requirements | FR-05-007 |

**Story preconditions**
- Supplier exists in the user's organization (Active or Inactive).
- User holds `procurement.suppliers.manage` (write) or `procurement.suppliers.read` (read).

**US-05-03-AC2 — Single primary contact**

*Preconditions / test data*
1. a supplier whose primary contact is "Mahmoud Adel"

*Steps*
1. a user adds or edits contact "Sara Hassan" with `isPrimary = true`

*Expected results*
1. in the same transaction "Sara Hassan" becomes primary and "Mahmoud Adel" becomes non-primary
2. at no time does the supplier have two primary contacts

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-013: 21st contact and invalid phone/email rejected

| Field | Value |
|---|---|
| Story | [US-05-03](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-03-manage-supplier-contacts.md) — Manage supplier contacts |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-05-03-AC3 |
| Requirements | FR-05-007 |

**Story preconditions**
- Supplier exists in the user's organization (Active or Inactive).
- User holds `procurement.suppliers.manage` (write) or `procurement.suppliers.read` (read).

**US-05-03-AC3 — Contact limit and field validation**

*Preconditions / test data*
1. a supplier with 20 contacts

*Steps*
1. a user adds a 21st contact, or adds a contact with mobile "0101234" or email "sara@"

*Expected results*
1. the responses are 422 `PROCUREMENT.CONTACT_LIMIT_EXCEEDED`, and 400 `COMMON.VALIDATION_FAILED` with `PROCUREMENT.PHONE_INVALID` / `PROCUREMENT.EMAIL_INVALID`
2. no contact is added

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-014: Edit with If-Match then delete; audit before values

| Field | Value |
|---|---|
| Story | [US-05-03](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-03-manage-supplier-contacts.md) — Manage supplier contacts |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-05-03-AC4 |
| Requirements | FR-05-007 |

**Story preconditions**
- Supplier exists in the user's organization (Active or Inactive).
- User holds `procurement.suppliers.manage` (write) or `procurement.suppliers.read` (read).

**US-05-03-AC4 — Edit and remove contact**

*Preconditions / test data*
1. a supplier with contact "Mahmoud Adel"

*Steps*
1. the user PUTs a new mobile "01112345678" with a valid `If-Match`, then DELETEs the contact

*Expected results*
1. the edit returns 200, the delete returns 204, and both changes are audited with before values

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-015: Read-only user 403; cross-organization contact id 404 (CS-08)

| Field | Value |
|---|---|
| Story | [US-05-03](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-03-manage-supplier-contacts.md) — Manage supplier contacts |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | MVP |
| Covers | US-05-03-AC5 |
| Critical scenario | CS-08 |
| Requirements | FR-05-007 |

**Story preconditions**
- Supplier exists in the user's organization (Active or Inactive).
- User holds `procurement.suppliers.manage` (write) or `procurement.suppliers.read` (read).

**US-05-03-AC5 — Permission denied and isolation**

*Preconditions / test data*
1. a Pharmacist with only `procurement.suppliers.read`, and a contact belonging to a supplier of another organization

*Steps*
1. the Pharmacist POSTs a contact, and any user GETs or PUTs the other organization's contact id

*Expected results*
1. the Pharmacist receives 403 `COMMON.FORBIDDEN` and the other-organization requests return 404 `COMMON.NOT_FOUND`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-05-04: Create a draft direct goods receipt

### TS-05-016: Create draft; verify normalization of batch number, month/year expiry → last day, PackSize snapshot

| Field | Value |
|---|---|
| Story | [US-05-04](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-04-create-draft-direct-goods-receipt.md) — Create a draft direct goods receipt |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-05-04-AC1 |
| Requirements | FR-05-008, FR-05-009, FR-05-010, FR-05-011, FR-05-012 |

**Story preconditions**
- Supplier is Active; medicines exist and are Active.
- User is assigned to the branch and holds `procurement.receipts.create`.
- Organization setting `AllowReceiptWithoutPurchaseOrder` is true for direct receipts.

**US-05-04-AC1 — Create draft with header and lines**

*Preconditions / test data*
1. a user with `procurement.receipts.create` assigned to branch CAI01, business date 2026-11-09

*Steps*
1. they POST `/api/v1/branches/{CAI01}/goods-receipts` with Active supplier, delivery note "DN-5531", delivery date 2026-11-09, and a line: medicine "Panadol Extra" (catalog PackSize 20 tablets), batch "ab123 ", expiry "11/2028", paid 10 packs, bonus 1 pack, unit cost per pack 102.00, discount 0

*Expected results*
1. the response is 201 with status Draft, no number, the batch number stored as "ab123" (normalized "AB123" for comparison), expiry stored as 2028-11-30, and PackSize snapshotted on the line

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-017: Line computation over random packs/costs/discounts/PackSize: rounding per BR-G-18, effective cost 4 dp

| Field | Value |
|---|---|
| Story | [US-05-04](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-04-create-draft-direct-goods-receipt.md) — Create a draft direct goods receipt |
| Type / Execution | Unit (property-based) / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-05-04-AC2 |
| Requirements | FR-05-008, FR-05-009, FR-05-010, FR-05-011, FR-05-012 |

**Story preconditions**
- Supplier is Active; medicines exist and are Active.
- User is assigned to the branch and holds `procurement.receipts.create`.
- Organization setting `AllowReceiptWithoutPurchaseOrder` is true for direct receipts.

**US-05-04-AC2 — Line and total computation with bonus**

*Preconditions / test data*
1. the line in AC1 with PackSize 20 and line discount 5%

*Steps*
1. the draft is saved

*Expected results*
1. gross = 1020.00, discount = 51.00, net = 969.00, received base units = 220, effective unit cost = 4.4045 (969.00 ÷ 220 rounded AwayFromZero to 4 decimals), and receipt total = sum of line nets

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-018: Draft save/edit/delete leaves balances, movements, PO, ledger unchanged; deletion audited

| Field | Value |
|---|---|
| Story | [US-05-04](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-04-create-draft-direct-goods-receipt.md) — Create a draft direct goods receipt |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-05-04-AC3 |
| Requirements | FR-05-008, FR-05-009, FR-05-010, FR-05-011, FR-05-012 |

**Story preconditions**
- Supplier is Active; medicines exist and are Active.
- User is assigned to the branch and holds `procurement.receipts.create`.
- Organization setting `AllowReceiptWithoutPurchaseOrder` is true for direct receipts.

**US-05-04-AC3 — Draft has no side effects**

*Preconditions / test data*
1. a saved Draft receipt with 3 lines

*Steps*
1. the user reads batch balances, stock movements, PO quantities, and the supplier ledger

*Expected results*
1. none of them changed
2. the user can edit the draft with `If-Match` and can DELETE it, receiving 204, with an audit entry for the deletion

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-019: Invalid quantities, zero cost with paid packs, discount > 100, 501 lines; setting disables direct receipt

| Field | Value |
|---|---|
| Story | [US-05-04](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-04-create-draft-direct-goods-receipt.md) — Create a draft direct goods receipt |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-05-04-AC4, US-05-04-AC5 |
| Requirements | FR-05-008, FR-05-009, FR-05-010, FR-05-011, FR-05-012 |

**Story preconditions**
- Supplier is Active; medicines exist and are Active.
- User is assigned to the branch and holds `procurement.receipts.create`.
- Organization setting `AllowReceiptWithoutPurchaseOrder` is true for direct receipts.

**US-05-04-AC4 — Line validation**

*Preconditions / test data*
1. a user editing a Draft

*Steps*
1. they submit a line with paid 0 and bonus 0, a line with paid 5 and unit cost 0, a line with discount 120%, and a 501st line

*Expected results*
1. the response is 400 `COMMON.VALIDATION_FAILED` with `PROCUREMENT.INVALID_QUANTITY`, `PROCUREMENT.INVALID_UNIT_COST`, `PROCUREMENT.INVALID_DISCOUNT`, and `PROCUREMENT.LINE_LIMIT_EXCEEDED` keyed by line index (or `lines` for the count rule), and the draft is unchanged

**US-05-04-AC5 — Direct receipt disabled**

*Preconditions / test data*
1. organization setting `AllowReceiptWithoutPurchaseOrder = false`

*Steps*
1. a user validates or posts a draft receipt with no purchase order

*Expected results*
1. the response is 422 `PROCUREMENT.PURCHASE_ORDER_REQUIRED`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-020: Missing permission and unassigned branch → 403 (CS-07); other-org supplier id → 404 (CS-08)

| Field | Value |
|---|---|
| Story | [US-05-04](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-04-create-draft-direct-goods-receipt.md) — Create a draft direct goods receipt |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-05-04-AC6 |
| Critical scenario | CS-07, CS-08 |
| Requirements | FR-05-008, FR-05-009, FR-05-010, FR-05-011, FR-05-012 |

**Story preconditions**
- Supplier is Active; medicines exist and are Active.
- User is assigned to the branch and holds `procurement.receipts.create`.
- Organization setting `AllowReceiptWithoutPurchaseOrder` is true for direct receipts.

**US-05-04-AC6 — Permission and branch denied**

*Preconditions / test data*
1. a Cashier without `procurement.receipts.create`, and an Inventory user assigned only to branch CAI01

*Steps*
1. the Cashier creates a receipt in CAI01, and the Inventory user creates a receipt in branch ALX01

*Expected results*
1. both receive 403 `COMMON.FORBIDDEN` and no receipt is created

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-05-05: Validate batch expiry and shelf life on receipt

### TS-05-021: Expiry = business date and < business date rejected even for Owner

| Field | Value |
|---|---|
| Story | [US-05-05](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-05-validate-batch-expiry-and-shelf-life.md) — Validate batch expiry and shelf life on receipt |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-05-05-AC1 |
| Requirements | FR-05-013, FR-05-014, FR-05-015 |

**Story preconditions**
- A Draft goods receipt exists (US-05-04).
- Branch setting `MinRemainingShelfLifeDaysOnReceipt` is configured (default 180).

**US-05-05-AC1 — Expired stock always rejected**

*Preconditions / test data*
1. branch business date 2026-11-09 (Africa/Cairo) and a line with expiry 2026-11-09

*Steps*
1. any user, including an Owner holding `procurement.receipts.override-shelf-life`, validates or posts the receipt

*Expected results*
1. the response is 422 with `errors["lines[0].expiryDate"]` = `PROCUREMENT.BATCH_EXPIRED` and the receipt remains Draft

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-022: Remaining-days boundary: 179 rejected, 180 accepted, setting 0 disables check; Cairo midnight boundary

| Field | Value |
|---|---|
| Story | [US-05-05](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-05-validate-batch-expiry-and-shelf-life.md) — Validate batch expiry and shelf life on receipt |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-05-05-AC2 |
| Requirements | FR-05-013, FR-05-014, FR-05-015 |

**Story preconditions**
- A Draft goods receipt exists (US-05-04).
- Branch setting `MinRemainingShelfLifeDaysOnReceipt` is configured (default 180).

**US-05-05-AC2 — Short-dated stock rejected without override**

*Preconditions / test data*
1. `MinRemainingShelfLifeDaysOnReceipt = 180` and a line with expiry 2027-03-31 (142 days remaining)

*Steps*
1. an Inventory user without the override permission posts the receipt

*Expected results*
1. the response is 422 `PROCUREMENT.SHELF_LIFE_BELOW_MINIMUM` with remaining days 142 and minimum 180 in the error detail

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-023: Manager override stored on line and audited in posting transaction

| Field | Value |
|---|---|
| Story | [US-05-05](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-05-validate-batch-expiry-and-shelf-life.md) — Validate batch expiry and shelf life on receipt |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-05-05-AC3 |
| Requirements | FR-05-013, FR-05-014, FR-05-015 |

**Story preconditions**
- A Draft goods receipt exists (US-05-04).
- Branch setting `MinRemainingShelfLifeDaysOnReceipt` is configured (default 180).

**US-05-05-AC3 — Override with permission and reason**

*Preconditions / test data*
1. the same short-dated line carrying override reason "Supplier agreed to take back unsold units in March 2027"

*Steps*
1. a Branch Manager holding `procurement.receipts.override-shelf-life` and `procurement.receipts.post` posts the receipt

*Expected results*
1. the line is accepted, the line stores override user, reason, and remaining days 142, and an audit entry of type shelf-life override is written in the posting transaction

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-024: Override reason supplied by user without permission → 403

| Field | Value |
|---|---|
| Story | [US-05-05](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-05-validate-batch-expiry-and-shelf-life.md) — Validate batch expiry and shelf life on receipt |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-05-05-AC4 |
| Requirements | FR-05-013, FR-05-014, FR-05-015 |

**Story preconditions**
- A Draft goods receipt exists (US-05-04).
- Branch setting `MinRemainingShelfLifeDaysOnReceipt` is configured (default 180).

**US-05-05-AC4 — Override attempted without permission**

*Preconditions / test data*
1. a short-dated line with an override reason

*Steps*
1. an Inventory user without `procurement.receipts.override-shelf-life` posts it

*Expected results*
1. the response is 403 `PROCUREMENT.SHELF_LIFE_OVERRIDE_NOT_PERMITTED` and nothing is posted

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-025: Revalidation after business-date rollover; in-receipt expiry conflict; existing-batch mismatch with/without confirmation

| Field | Value |
|---|---|
| Story | [US-05-05](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-05-validate-batch-expiry-and-shelf-life.md) — Validate batch expiry and shelf life on receipt |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-05-05-AC5 |
| Requirements | FR-05-013, FR-05-014, FR-05-015 |

**Story preconditions**
- A Draft goods receipt exists (US-05-04).
- Branch setting `MinRemainingShelfLifeDaysOnReceipt` is configured (default 180).

**US-05-05-AC5 — Revalidation at posting and batch/expiry consistency**

*Preconditions / test data*
1. a Draft saved on 2026-11-09 with a line expiring 2026-11-10, a receipt containing batch "AB123" of the same medicine twice with expiries 2028-11-30 and 2028-12-31, and a separate receipt whose batch "XY9" exists in the branch with a different expiry

*Steps*
1. the first receipt is posted on business date 2026-11-10, the second is posted, and the third is posted without `confirmExpiryMismatch`

*Expected results*
1. the responses are 422 `PROCUREMENT.BATCH_EXPIRED`, 422 `PROCUREMENT.BATCH_EXPIRY_CONFLICT`, and 422 `PROCUREMENT.BATCH_EXPIRY_MISMATCH_CONFIRMATION_REQUIRED`
2. posting the third with `confirmExpiryMismatch = true` succeeds and creates a separate batch

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-05-06: Post a goods receipt to inventory

### TS-05-026: Post 2-line receipt; verify number, batches, balances, movements (type, sign, source ids), LastPurchaseCost, audit, outbox

| Field | Value |
|---|---|
| Story | [US-05-06](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-06-post-goods-receipt-to-inventory.md) — Post a goods receipt to inventory |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-05-06-AC1 |
| Requirements | FR-05-016, FR-05-017, FR-05-018, FR-05-019, FR-05-020, FR-05-021, FR-05-022, FR-05-055 |

**Story preconditions**
- Draft receipt passes US-05-04 and US-05-05 validations.
- User is assigned to the branch and holds `procurement.receipts.post`.
- Client generates a UUID `Idempotency-Key` per posting attempt and reuses it on retry.

**US-05-06-AC1 — Atomic posting creates batches and movements**

*Preconditions / test data*
1. a Draft receipt in CAI01 with 2 lines: medicine M1 batch "B1" 10+1 packs (PackSize 20, net 969.00) and medicine M2 batch "C7" 5 packs (PackSize 10, net 250.00), and no existing matching batches

*Steps*
1. the user POSTs `/post` with a new `Idempotency-Key`

*Expected results*
1. the response is 200 with status Posted and number `CAI01-RCV-2026-NNNNNN` (next gapless value), two new Active batches with `SupplierId` = receipt supplier and unit costs 4.4045 and 5.0000, balances OnHand 220 and 50, exactly two `Receipt` movements referencing the receipt and line ids, M1/M2 `LastPurchaseCost` updated, one audit entry, and one outbox message `procurement.goods-receipt.posted`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-027: Merge-key matrix: each key component differing (batch no., expiry, cost, supplier, status Depleted/Quarantined)

| Field | Value |
|---|---|
| Story | [US-05-06](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-06-post-goods-receipt-to-inventory.md) — Post a goods receipt to inventory |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-05-06-AC2, US-05-06-AC3 |
| Requirements | FR-05-016, FR-05-017, FR-05-018, FR-05-019, FR-05-020, FR-05-021, FR-05-022, FR-05-055 |

**Story preconditions**
- Draft receipt passes US-05-04 and US-05-05 validations.
- User is assigned to the branch and holds `procurement.receipts.post`.
- Client generates a UUID `Idempotency-Key` per posting attempt and reuses it on retry.

**US-05-06-AC2 — Merge into existing batch only on full key match**

*Preconditions / test data*
1. branch CAI01 has batch X (M1, "B1", 2028-11-30, unit cost 4.4045, same supplier, Active, OnHand 30) and batch Y (M1, "B1", 2028-11-30, unit cost 4.2000, same supplier)

*Steps*
1. a receipt line for M1 "b1 " 2028-11-30 with effective unit cost 4.4045 from the same supplier is posted, and another line identical except from a different supplier is posted

*Expected results*
1. the first line increments batch X (OnHand 30 + received base units) and creates no new batch
2. the second line creates a new batch with the other supplier's id
3. batch Y is unchanged

**US-05-06-AC3 — Quarantined batch match rejected**

*Preconditions / test data*
1. a Quarantined batch matching the merge key of a receipt line

*Steps*
1. the receipt is posted

*Expected results*
1. the response is 422 `PROCUREMENT.BATCH_QUARANTINED` for that line and no part of the receipt is posted

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-028: 10 parallel + 3 sequential retries with same key → one effect, identical responses; same key different body → 422

| Field | Value |
|---|---|
| Story | [US-05-06](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-06-post-goods-receipt-to-inventory.md) — Post a goods receipt to inventory |
| Type / Execution | Integration (CS-11) / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-05-06-AC4 |
| Critical scenario | CS-11 |
| Requirements | FR-05-016, FR-05-017, FR-05-018, FR-05-019, FR-05-020, FR-05-021, FR-05-022, FR-05-055 |

**Story preconditions**
- Draft receipt passes US-05-04 and US-05-05 validations.
- User is assigned to the branch and holds `procurement.receipts.post`.
- Client generates a UUID `Idempotency-Key` per posting attempt and reuses it on retry.

**US-05-06-AC4 — Idempotent retry (CS-11)**

*Preconditions / test data*
1. a posting request that succeeded but whose response was lost by the client

*Steps*
1. the client retries 3 times with the same `Idempotency-Key` and identical body, and once with the same key but a different body

*Expected results*
1. the three retries return 200 with the identical response body (same number, same batch ids) and the database holds exactly one set of movements, batches, and one number
2. the different-body request returns 422 `COMMON.IDEMPOTENCY_KEY_REUSED`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-029: Concurrent post of same receipt → one 200, one 409; fault injection mid-posting → full rollback and no number gap

| Field | Value |
|---|---|
| Story | [US-05-06](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-06-post-goods-receipt-to-inventory.md) — Post a goods receipt to inventory |
| Type / Execution | Integration (CS-10) / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-05-06-AC5, US-05-06-AC6 |
| Requirements | FR-05-016, FR-05-017, FR-05-018, FR-05-019, FR-05-020, FR-05-021, FR-05-022, FR-05-055 |

**Story preconditions**
- Draft receipt passes US-05-04 and US-05-05 validations.
- User is assigned to the branch and holds `procurement.receipts.post`.
- Client generates a UUID `Idempotency-Key` per posting attempt and reuses it on retry.

**US-05-06-AC5 — Concurrent posting of the same receipt**

*Preconditions / test data*
1. a Draft receipt

*Steps*
1. two users post it simultaneously with different `Idempotency-Key` values

*Expected results*
1. exactly one request returns 200
2. the other returns 409 `PROCUREMENT.RECEIPT_NOT_DRAFT`
3. exactly one `Receipt` movement exists per line

**US-05-06-AC6 — Failure rolls back everything**

*Preconditions / test data*
1. a Draft receipt with 3 lines and a fault injected after the second line's movement is written

*Steps*
1. the receipt is posted

*Expected results*
1. the response is 500, the receipt remains Draft with no number, no batch, balance, movement, PO quantity, `LastPurchaseCost`, audit, or outbox change persists, and the next successful posting in the branch receives the number that would have been used (no gap)

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-030: post-permission missing 403; unassigned branch 403 (CS-07); other-org receipt 404 (CS-08)

| Field | Value |
|---|---|
| Story | [US-05-06](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-06-post-goods-receipt-to-inventory.md) — Post a goods receipt to inventory |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-05-06-AC7 |
| Critical scenario | CS-07, CS-08 |
| Requirements | FR-05-016, FR-05-017, FR-05-018, FR-05-019, FR-05-020, FR-05-021, FR-05-022, FR-05-055 |

**Story preconditions**
- Draft receipt passes US-05-04 and US-05-05 validations.
- User is assigned to the branch and holds `procurement.receipts.post`.
- Client generates a UUID `Idempotency-Key` per posting attempt and reuses it on retry.

**US-05-06-AC7 — Permission and branch isolation**

*Preconditions / test data*
1. a user with `procurement.receipts.create` but not `procurement.receipts.post`, a user assigned only to ALX01, and a receipt id of another organization

*Steps*
1. each posts the CAI01 receipt (or the other-organization id)

*Expected results*
1. the responses are 403 `COMMON.FORBIDDEN`, 403 `COMMON.FORBIDDEN`, and 404 `COMMON.NOT_FOUND`, and nothing is posted

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-05-07: Reverse a posted goods receipt

### TS-05-031: Reverse unconsumed receipt; verify ReceiptReversal movements, balances, status, audit

| Field | Value |
|---|---|
| Story | [US-05-07](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-07-reverse-posted-goods-receipt.md) — Reverse a posted goods receipt |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-05-07-AC1 |
| Requirements | FR-05-023, FR-05-035, FR-05-055 |

**Story preconditions**
- Receipt is Posted in a branch the user is assigned to.
- User holds `procurement.receipts.reverse`.

**US-05-07-AC1 — Successful reversal**

*Preconditions / test data*
1. a Posted receipt with 2 lines (220 and 50 base units) whose batches still hold available quantities 220 and 50 and no supplier invoice references it

*Steps*
1. a Manager POSTs `/reverse` with reason "Duplicate entry of delivery note DN-5531" and a new `Idempotency-Key`

*Expected results*
1. the response is 200, status is Reversed, two `ReceiptReversal` movements of −220 and −50 referencing the receipt lines are appended, balances become 0 (batches Depleted per SPEC-04), original `Receipt` movements are unchanged, and an audit entry is written with the reason

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-032: Reversal blocked by sold units and by reservations; concurrent sale vs reversal never yields negative balance

| Field | Value |
|---|---|
| Story | [US-05-07](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-07-reverse-posted-goods-receipt.md) — Reverse a posted goods receipt |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-05-07-AC2 |
| Requirements | FR-05-023, FR-05-035, FR-05-055 |

**Story preconditions**
- Receipt is Posted in a branch the user is assigned to.
- User holds `procurement.receipts.reverse`.

**US-05-07-AC2 — Reversal blocked when quantity consumed or reserved**

*Preconditions / test data*
1. a Posted receipt line of 220 base units whose batch now has OnHand 230 and Reserved 20 (available 210) after sales and a draft supplier return

*Steps*
1. the Manager reverses the receipt

*Expected results*
1. the response is 422 `PROCUREMENT.RECEIPT_QUANTITY_CONSUMED` listing that line id with available 210 and required 220, and no movement or status change occurs

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-033: Same-key retry replays response; second reversal 409

| Field | Value |
|---|---|
| Story | [US-05-07](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-07-reverse-posted-goods-receipt.md) — Reverse a posted goods receipt |
| Type / Execution | Integration (CS-11) / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-05-07-AC5 |
| Requirements | FR-05-023, FR-05-035, FR-05-055 |

**Story preconditions**
- Receipt is Posted in a branch the user is assigned to.
- User holds `procurement.receipts.reverse`.

**US-05-07-AC5 — Idempotency, state, and permission**

*Preconditions / test data*
1. a reversal that succeeded

*Steps*
1. the client retries with the same `Idempotency-Key`, another user reverses with a new key, and an Inventory user without `procurement.receipts.reverse` attempts the reversal of another Posted receipt

*Expected results*
1. the retry returns the original 200 response with no additional movements (CS-11), the second request returns 409 `PROCUREMENT.RECEIPT_NOT_POSTED`, and the Inventory user receives 403 `COMMON.FORBIDDEN`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-034: Invoiced receipt blocked; succeeds after invoice cancellation

| Field | Value |
|---|---|
| Story | [US-05-07](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-07-reverse-posted-goods-receipt.md) — Reverse a posted goods receipt |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-05-07-AC3 |
| Requirements | FR-05-023, FR-05-035, FR-05-055 |

**Story preconditions**
- Receipt is Posted in a branch the user is assigned to.
- User holds `procurement.receipts.reverse`.

**US-05-07-AC3 — Reversal blocked when invoiced**

*Preconditions / test data*
1. a Posted receipt with a line referenced by a Posted supplier invoice

*Steps*
1. the Manager reverses it

*Expected results*
1. the response is 422 `PROCUREMENT.RECEIPT_INVOICED`
2. after the invoice is cancelled (US-05-15) the reversal succeeds

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-035: PO Received → PartiallyReceived → Approved on successive reversals; missing permission 403; unassigned branch 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-05-07](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-07-reverse-posted-goods-receipt.md) — Reverse a posted goods receipt |
| Type / Execution | Integration / Security / Automated |
| Priority | T1 (story P1) |
| Release | MVP |
| Covers | US-05-07-AC4, US-05-07-AC5 |
| Critical scenario | CS-07 |
| Requirements | FR-05-023, FR-05-035, FR-05-055 |

**Story preconditions**
- Receipt is Posted in a branch the user is assigned to.
- User holds `procurement.receipts.reverse`.

**US-05-07-AC4 — PO quantities and status recomputed**

*Preconditions / test data*
1. a PO line ordered 100 packs with two posted receipts of 60 and 40 packs (PO status Received)

*Steps*
1. the 40-pack receipt is reversed

*Expected results*
1. the PO line's received paid packs become 60 and the PO status becomes PartiallyReceived in the same transaction
2. reversing the 60-pack receipt afterwards returns the PO to Approved

**US-05-07-AC5 — Idempotency, state, and permission**

*Preconditions / test data*
1. a reversal that succeeded

*Steps*
1. the client retries with the same `Idempotency-Key`, another user reverses with a new key, and an Inventory user without `procurement.receipts.reverse` attempts the reversal of another Posted receipt

*Expected results*
1. the retry returns the original 200 response with no additional movements (CS-11), the second request returns 409 `PROCUREMENT.RECEIPT_NOT_POSTED`, and the Inventory user receives 403 `COMMON.FORBIDDEN`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-05-08: View goods receipts and purchase history

### TS-05-036: Filter by status, supplier, date range; sorting; paging; p95 ≤ 500 ms with 50,000 receipts

| Field | Value |
|---|---|
| Story | [US-05-08](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-08-view-goods-receipts-and-purchase-history.md) — View goods receipts and purchase history |
| Type / Execution | Integration / Performance / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-05-08-AC1 |
| Requirements | FR-05-024, FR-05-025 |

**Story preconditions**
- User holds `procurement.receipts.read` and is assigned to the branch (or has organization-wide scope).

**US-05-08-AC1 — List and filter receipts**

*Preconditions / test data*
1. branch CAI01 has 120 receipts (100 Posted, 15 Draft, 5 Reversed)

*Steps*
1. the user calls GET `/api/v1/branches/{CAI01}/goods-receipts?status=Posted&supplierId={S1}&from=2026-10-01&to=2026-10-31&page=1&pageSize=25`

*Expected results*
1. the response contains only Posted receipts of S1 posted in October 2026 (by branch business date), sorted by posting date descending, with `totalCount` matching, p95 ≤ 500 ms

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-037: Detail shows created vs incremented batches and override metadata

| Field | Value |
|---|---|
| Story | [US-05-08](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-08-view-goods-receipts-and-purchase-history.md) — View goods receipts and purchase history |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-05-08-AC2 |
| Requirements | FR-05-024, FR-05-025 |

**Story preconditions**
- User holds `procurement.receipts.read` and is assigned to the branch (or has organization-wide scope).

**US-05-08-AC2 — Receipt detail with batches**

*Preconditions / test data*
1. a Posted receipt

*Steps*
1. the user opens its detail

*Expected results*
1. each line shows medicine, batch id, batch number, expiry, paid and bonus packs, unit cost per pack, discount %, net amount, effective unit cost, whether the batch was created or incremented, and any shelf-life override (user, reason, remaining days)

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-038: History excludes Draft and Reversed receipts

| Field | Value |
|---|---|
| Story | [US-05-08](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-08-view-goods-receipts-and-purchase-history.md) — View goods receipts and purchase history |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-05-08-AC3 |
| Requirements | FR-05-024, FR-05-025 |

**Story preconditions**
- User holds `procurement.receipts.read` and is assigned to the branch (or has organization-wide scope).

**US-05-08-AC3 — Purchase history by medicine**

*Preconditions / test data*
1. medicine M1 was received 4 times in CAI01 (one of them later Reversed)

*Steps*
1. the user calls GET `/api/v1/branches/{CAI01}/purchase-history?medicineId={M1}`

*Expected results*
1. exactly 3 rows are returned (Reversed excluded) with posting date, supplier, receipt number, batch, paid/bonus packs, unit cost per pack, discount %, effective unit cost, newest first

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-039: Org-wide history 403 without scope; Owner sees all branches

| Field | Value |
|---|---|
| Story | [US-05-08](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-08-view-goods-receipts-and-purchase-history.md) — View goods receipts and purchase history |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | MVP |
| Covers | US-05-08-AC4 |
| Requirements | FR-05-024, FR-05-025 |

**Story preconditions**
- User holds `procurement.receipts.read` and is assigned to the branch (or has organization-wide scope).

**US-05-08-AC4 — Org-wide history requires scope**

*Preconditions / test data*
1. a Manager assigned only to CAI01 without `reports.organization.read`, and an Owner with organization-wide scope

*Steps*
1. each calls GET `/api/v1/purchase-history?supplierId={S1}`

*Expected results*
1. the Manager receives 403 `COMMON.FORBIDDEN` and the Owner receives rows from all branches with a branch column

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-040: Unassigned branch 403 (CS-07); no-permission 403; other-org receipt id 404 (CS-08)

| Field | Value |
|---|---|
| Story | [US-05-08](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-08-view-goods-receipts-and-purchase-history.md) — View goods receipts and purchase history |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | MVP |
| Covers | US-05-08-AC5 |
| Critical scenario | CS-07, CS-08 |
| Requirements | FR-05-024, FR-05-025 |

**Story preconditions**
- User holds `procurement.receipts.read` and is assigned to the branch (or has organization-wide scope).

**US-05-08-AC5 — Branch and permission denied**

*Preconditions / test data*
1. a user assigned to CAI01 only, and a Cashier without `procurement.receipts.read`

*Steps*
1. the first user lists receipts of ALX01 and the Cashier lists receipts of CAI01

*Expected results*
1. both receive 403 `COMMON.FORBIDDEN`

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-05-09: Create and Edit a Draft Purchase Order

### TS-05-041: Reference behavior and exact values for FR-05-026

| Field | Value |
|---|---|
| Story | [US-05-09](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-09-create-draft-purchase-order.md) — Create and Edit a Draft Purchase Order |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-05-09-AC1 |
| Requirements | FR-05-026 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-026 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.

**US-05-09-AC1 — Successful result**

*Preconditions / test data*
1. PO header and lines

*Steps*
1. create a Draft purchase order for branch CAI01 and Active supplier S1, expected date 2026-11-20, and two lines: Medicine A 10 packs at EGP 120.0000 per pack with PackSize 20
2. Medicine B 4 packs at EGP 50.0000 per pack

*Expected results*
1. receive a 201 Draft PO number CAI01-PO-2026-NNNNNN, line snapshots, and expected merchandise total EGP 1,400.00.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-042: Negative validation path, no partial effect; COMMON.VALIDATION_FAILED

| Field | Value |
|---|---|
| Story | [US-05-09](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-09-create-draft-purchase-order.md) — Create and Edit a Draft Purchase Order |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-05-09-AC2 |
| Requirements | FR-05-026 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-026 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.

**US-05-09-AC2 — Validation and negative case**

*Preconditions / test data*
1. An expected delivery date of 2026-11-09 is accepted on business date 2026-11-09
2. date 2026-11-08 returns 400 PROCUREMENT.EXPECTED_DATE_INVALID
3. 0 ordered packs returns 400 PROCUREMENT.INVALID_QUANTITY

*Steps*
1. the system validates the request at the required state transition

*Expected results*
1. the specified error is returned and no partial stock, ledger, prescription, or document change remains.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-043: Missing permission and cross-branch access return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-05-09](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-09-create-draft-purchase-order.md) — Create and Edit a Draft Purchase Order |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-05-09-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-05-026 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-026 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.

**US-05-09-AC3 — Permission denied**

*Preconditions / test data*
1. procurement.purchase-orders.read lacks the required permission or is assigned only to another Branch

*Steps*
1. the user calls the branch-scoped endpoint

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN`
2. no protected data or change is returned.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-044: Cross-organization id returns 404 without data (CS-08)

| Field | Value |
|---|---|
| Story | [US-05-09](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-09-create-draft-purchase-order.md) — Create and Edit a Draft Purchase Order |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-05-09-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-05-026 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-026 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.

**US-05-09-AC4 — Organization isolation**

*Preconditions / test data*
1. the requested record belongs to another Organization

*Steps*
1. the caller requests the record by id

*Expected results*
1. the response is 404 `COMMON.NOT_FOUND` and discloses no record data (CS-08).

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-05-10: Submit, Approve, and Reject a Purchase Order

### TS-05-045: Reference behavior and exact values for FR-05-027, FR-05-028, FR-05-029, FR-05-030, FR-05-055

| Field | Value |
|---|---|
| Story | [US-05-10](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-10-submit-and-approve-purchase-order.md) — Submit, Approve, and Reject a Purchase Order |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-05-10-AC1 |
| Requirements | FR-05-027, FR-05-028, FR-05-029, FR-05-030, FR-05-055 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-027, FR-05-028, FR-05-029, FR-05-030, FR-05-055 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.

**US-05-10-AC1 — Successful result**

*Preconditions / test data*
1. Threshold, review, credit and audit

*Steps*
1. A Draft PO totals EGP 1,200.00
2. branch PurchaseOrderApprovalThreshold is EGP 1,000.00, supplier outstanding balance EGP 400.00, open approved PO value EGP 500.00, credit limit EGP 2,000.00

*Expected results*
1. submit moves it to Submitted, notifies approvers, and a different approver can approve
2. credit calculation is EGP 2,100.00 and Warn requires acknowledgement
3. audit records submit and approval.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-046: Negative validation path, no partial effect; COMMON.VALIDATION_FAILED

| Field | Value |
|---|---|
| Story | [US-05-10](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-10-submit-and-approve-purchase-order.md) — Submit, Approve, and Reject a Purchase Order |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-05-10-AC2 |
| Requirements | FR-05-027, FR-05-028, FR-05-029, FR-05-030, FR-05-055 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-027, FR-05-028, FR-05-029, FR-05-030, FR-05-055 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.

**US-05-10-AC2 — Validation and negative case**

*Preconditions / test data*
1. The PO creator cannot approve it (403 PROCUREMENT.SELF_APPROVAL_NOT_ALLOWED)
2. Block mode above credit limit returns 422 PROCUREMENT.CREDIT_LIMIT_EXCEEDED

*Steps*
1. the system validates the request at the required state transition

*Expected results*
1. the specified error is returned and no partial stock, ledger, prescription, or document change remains.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-047: Missing permission and cross-branch access return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-05-10](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-10-submit-and-approve-purchase-order.md) — Submit, Approve, and Reject a Purchase Order |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-05-10-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-05-027, FR-05-028, FR-05-029, FR-05-030, FR-05-055 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-027, FR-05-028, FR-05-029, FR-05-030, FR-05-055 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.

**US-05-10-AC3 — Permission denied**

*Preconditions / test data*
1. procurement.purchase-orders.read lacks the required permission or is assigned only to another Branch

*Steps*
1. the user calls the branch-scoped endpoint

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN`
2. no protected data or change is returned.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-048: Cross-organization id returns 404 without data (CS-08)

| Field | Value |
|---|---|
| Story | [US-05-10](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-10-submit-and-approve-purchase-order.md) — Submit, Approve, and Reject a Purchase Order |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-05-10-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-05-027, FR-05-028, FR-05-029, FR-05-030, FR-05-055 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-027, FR-05-028, FR-05-029, FR-05-030, FR-05-055 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.

**US-05-10-AC4 — Organization isolation**

*Preconditions / test data*
1. the requested record belongs to another Organization

*Steps*
1. the caller requests the record by id

*Expected results*
1. the response is 404 `COMMON.NOT_FOUND` and discloses no record data (CS-08).

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-05-11: Cancel and Close a Purchase Order

### TS-05-049: Reference behavior and exact values for FR-05-031, FR-05-032

| Field | Value |
|---|---|
| Story | [US-05-11](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-11-cancel-and-close-purchase-order.md) — Cancel and Close a Purchase Order |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-05-11-AC1 |
| Requirements | FR-05-031, FR-05-032 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-031, FR-05-032 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.

**US-05-11-AC1 — Successful result**

*Preconditions / test data*
1. PO close and cancellation states

*Steps*
1. A PartiallyReceived PO has 4 of 10 ordered packs received and no further goods receipt references a cancelable PO

*Expected results*
1. manager cancels Draft/Submitted/Approved with 10–500 character reason, or short-closes the partially received PO with reason
2. status transitions and notifications are recorded.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-050: Negative validation path, no partial effect; COMMON.VALIDATION_FAILED

| Field | Value |
|---|---|
| Story | [US-05-11](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-11-cancel-and-close-purchase-order.md) — Cancel and Close a Purchase Order |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-05-11-AC2 |
| Requirements | FR-05-031, FR-05-032 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-031, FR-05-032 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.

**US-05-11-AC2 — Validation and negative case**

*Preconditions / test data*
1. Cancel when a Posted receipt references PO returns 422 PROCUREMENT.PURCHASE_ORDER_HAS_RECEIPTS
2. closed/cancelled PO cannot accept receipt

*Steps*
1. the system validates the request at the required state transition

*Expected results*
1. the specified error is returned and no partial stock, ledger, prescription, or document change remains.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-051: Missing permission and cross-branch access return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-05-11](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-11-cancel-and-close-purchase-order.md) — Cancel and Close a Purchase Order |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-05-11-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-05-031, FR-05-032 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-031, FR-05-032 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.

**US-05-11-AC3 — Permission denied**

*Preconditions / test data*
1. procurement.purchase-orders.read lacks the required permission or is assigned only to another Branch

*Steps*
1. the user calls the branch-scoped endpoint

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN`
2. no protected data or change is returned.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-052: Cross-organization id returns 404 without data (CS-08)

| Field | Value |
|---|---|
| Story | [US-05-11](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-11-cancel-and-close-purchase-order.md) — Cancel and Close a Purchase Order |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-05-11-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-05-031, FR-05-032 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-031, FR-05-032 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.

**US-05-11-AC4 — Organization isolation**

*Preconditions / test data*
1. the requested record belongs to another Organization

*Steps*
1. the caller requests the record by id

*Expected results*
1. the response is 404 `COMMON.NOT_FOUND` and discloses no record data (CS-08).

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-05-12: Receive Goods Against a Purchase Order

### TS-05-053: First 4 of 10 packs received, then remaining 6; PO status Approved → PartiallyReceived → Received, exact quantities and balances

| Field | Value |
|---|---|
| Story | [US-05-12](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-12-receive-goods-against-purchase-order.md) — Receive Goods Against a Purchase Order |
| Type / Execution | Integration (CS-03) / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-05-12-AC1 |
| Requirements | FR-05-033, FR-05-034, FR-05-035 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-033, FR-05-034, FR-05-035 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.
- Inventory calls use SPEC-04 `IInventoryAllocation` / posting contracts; lock timeout is 3 s and posting is atomic.

**US-05-12-AC1 — Successful result**

*Preconditions / test data*
1. CS-03 partial receiving, tolerance and PO status

*Steps*
1. An Approved PO for Medicine A has 10 packs ordered, 0 received, tolerance 0%
2. supplier delivers 4 packs, then 6 packs
3. pack cost EGP 100.0000

*Expected results*
1. first Posted receipt moves status to PartiallyReceived (4/10)
2. remainder receipt moves it to Received (10/10)
3. each receipt shows outstanding packs, price variance, stock movement and reconciliation
4. totals are EGP 400.00 + EGP 600.00.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-054: Negative validation path, no partial effect; PROCUREMENT.OVER_RECEIPT_TOLERANCE_EXCEEDED

| Field | Value |
|---|---|
| Story | [US-05-12](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-12-receive-goods-against-purchase-order.md) — Receive Goods Against a Purchase Order |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-05-12-AC2 |
| Requirements | FR-05-033, FR-05-034, FR-05-035 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-033, FR-05-034, FR-05-035 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.
- Inventory calls use SPEC-04 `IInventoryAllocation` / posting contracts; lock timeout is 3 s and posting is atomic.

**US-05-12-AC2 — Validation and negative case**

*Preconditions / test data*
1. Posting 11 paid packs returns 422 PROCUREMENT.OVER_RECEIPT_TOLERANCE_EXCEEDED
2. mismatched supplier, branch or medicine line rejected without changes

*Steps*
1. the system validates the request at the required state transition

*Expected results*
1. the specified error is returned and no partial stock, ledger, prescription, or document change remains.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-055: Missing permission and cross-branch access return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-05-12](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-12-receive-goods-against-purchase-order.md) — Receive Goods Against a Purchase Order |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-05-12-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-05-033, FR-05-034, FR-05-035 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-033, FR-05-034, FR-05-035 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.
- Inventory calls use SPEC-04 `IInventoryAllocation` / posting contracts; lock timeout is 3 s and posting is atomic.

**US-05-12-AC3 — Permission denied**

*Preconditions / test data*
1. procurement.receipts.read lacks the required permission or is assigned only to another Branch

*Steps*
1. the user calls the branch-scoped endpoint

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN`
2. no protected data or change is returned.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-056: Cross-organization id returns 404 without data (CS-08)

| Field | Value |
|---|---|
| Story | [US-05-12](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-12-receive-goods-against-purchase-order.md) — Receive Goods Against a Purchase Order |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-05-12-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-05-033, FR-05-034, FR-05-035 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-033, FR-05-034, FR-05-035 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.
- Inventory calls use SPEC-04 `IInventoryAllocation` / posting contracts; lock timeout is 3 s and posting is atomic.

**US-05-12-AC4 — Organization isolation**

*Preconditions / test data*
1. the requested record belongs to another Organization

*Steps*
1. the caller requests the record by id

*Expected results*
1. the response is 404 `COMMON.NOT_FOUND` and discloses no record data (CS-08).

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-05-13: Draft a Supplier Invoice from Receipts

### TS-05-057: Reference behavior and exact values for FR-05-036, FR-05-037, FR-05-038

| Field | Value |
|---|---|
| Story | [US-05-13](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-13-draft-supplier-invoice-from-receipts.md) — Draft a Supplier Invoice from Receipts |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-05-13-AC1 |
| Requirements | FR-05-036, FR-05-037, FR-05-038 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-036, FR-05-037, FR-05-038 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.
- Inventory calls use SPEC-04 `IInventoryAllocation` / posting contracts; lock timeout is 3 s and posting is atomic.

**US-05-13-AC1 — Successful result**

*Preconditions / test data*
1. Invoice drafts and tax totals

*Steps*
1. A Posted receipt line has 5 paid packs at EGP 100.0000, 10% discount and a snapshotted 14% tax rate (pending REG-06)
2. invoice uses 3 packs at EGP 100.0000, no discount

*Expected results*
1. draft invoice total is net EGP 300.00 plus tax EGP 42.00 = EGP 342.00
2. invoiced packs 3 and receipt line status PartiallyInvoiced.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-058: Negative validation path, no partial effect; COMMON.VALIDATION_FAILED

| Field | Value |
|---|---|
| Story | [US-05-13](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-13-draft-supplier-invoice-from-receipts.md) — Draft a Supplier Invoice from Receipts |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-05-13-AC2 |
| Requirements | FR-05-036, FR-05-037, FR-05-038 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-036, FR-05-037, FR-05-038 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.
- Inventory calls use SPEC-04 `IInventoryAllocation` / posting contracts; lock timeout is 3 s and posting is atomic.

**US-05-13-AC2 — Validation and negative case**

*Preconditions / test data*
1. A fourth pack beyond remaining 2 returns 422 PROCUREMENT.INVOICE_QUANTITY_EXCEEDS_RECEIVED
2. duplicate active supplier invoice number returns 409 PROCUREMENT.SUPPLIER_INVOICE_NUMBER_DUPLICATE

*Steps*
1. the system validates the request at the required state transition

*Expected results*
1. the specified error is returned and no partial stock, ledger, prescription, or document change remains.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-059: Missing permission and cross-branch access return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-05-13](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-13-draft-supplier-invoice-from-receipts.md) — Draft a Supplier Invoice from Receipts |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-05-13-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-05-036, FR-05-037, FR-05-038 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-036, FR-05-037, FR-05-038 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.
- Inventory calls use SPEC-04 `IInventoryAllocation` / posting contracts; lock timeout is 3 s and posting is atomic.

**US-05-13-AC3 — Permission denied**

*Preconditions / test data*
1. procurement.supplier-invoices.read lacks the required permission or is assigned only to another Branch

*Steps*
1. the user calls the branch-scoped endpoint

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN`
2. no protected data or change is returned.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-060: Cross-organization id returns 404 without data (CS-08)

| Field | Value |
|---|---|
| Story | [US-05-13](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-13-draft-supplier-invoice-from-receipts.md) — Draft a Supplier Invoice from Receipts |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-05-13-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-05-036, FR-05-037, FR-05-038 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-036, FR-05-037, FR-05-038 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.
- Inventory calls use SPEC-04 `IInventoryAllocation` / posting contracts; lock timeout is 3 s and posting is atomic.

**US-05-13-AC4 — Organization isolation**

*Preconditions / test data*
1. the requested record belongs to another Organization

*Steps*
1. the caller requests the record by id

*Expected results*
1. the response is 404 `COMMON.NOT_FOUND` and discloses no record data (CS-08).

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-05-14: Match and Post a Supplier Invoice

### TS-05-061: Reference behavior and exact values for FR-05-039, FR-05-040, FR-05-055

| Field | Value |
|---|---|
| Story | [US-05-14](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-14-match-and-post-supplier-invoice.md) — Match and Post a Supplier Invoice |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-05-14-AC1 |
| Requirements | FR-05-039, FR-05-040, FR-05-055 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-039, FR-05-040, FR-05-055 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.
- Inventory calls use SPEC-04 `IInventoryAllocation` / posting contracts; lock timeout is 3 s and posting is atomic.

**US-05-14-AC1 — Successful result**

*Preconditions / test data*
1. Matching tolerance and posting

*Steps*
1. Invoice line is EGP 102.0000 per pack vs receipt EGP 100.0000
2. price tolerance 2.00%
3. supplier-stated total differs from computed total by EGP 1.01 against EGP 1.00 tolerance

*Expected results*
1. exactly-at-tolerance variance is not flagged
2. above-threshold variance is flagged
3. authorized variance approver posts with reason, number CAI01-SINV-2026-NNNNNN and one Invoice credit
4. Batch.UnitCost remains unchanged.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-062: Negative validation path, no partial effect; COMMON.VALIDATION_FAILED

| Field | Value |
|---|---|
| Story | [US-05-14](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-14-match-and-post-supplier-invoice.md) — Match and Post a Supplier Invoice |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-05-14-AC2 |
| Requirements | FR-05-039, FR-05-040, FR-05-055 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-039, FR-05-040, FR-05-055 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.
- Inventory calls use SPEC-04 `IInventoryAllocation` / posting contracts; lock timeout is 3 s and posting is atomic.

**US-05-14-AC2 — Validation and negative case**

*Preconditions / test data*
1. Above-threshold post without approval permission or reason is rejected
2. unauthorized gets 403 PROCUREMENT.VARIANCE_APPROVAL_NOT_PERMITTED
3. no ledger entry is created

*Steps*
1. the system validates the request at the required state transition

*Expected results*
1. the specified error is returned and no partial stock, ledger, prescription, or document change remains.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-063: Missing permission and cross-branch access return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-05-14](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-14-match-and-post-supplier-invoice.md) — Match and Post a Supplier Invoice |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-05-14-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-05-039, FR-05-040, FR-05-055 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-039, FR-05-040, FR-05-055 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.
- Inventory calls use SPEC-04 `IInventoryAllocation` / posting contracts; lock timeout is 3 s and posting is atomic.

**US-05-14-AC3 — Permission denied**

*Preconditions / test data*
1. procurement.supplier-invoices.read lacks the required permission or is assigned only to another Branch

*Steps*
1. the user calls the branch-scoped endpoint

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN`
2. no protected data or change is returned.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-064: Cross-organization id returns 404 without data (CS-08)

| Field | Value |
|---|---|
| Story | [US-05-14](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-14-match-and-post-supplier-invoice.md) — Match and Post a Supplier Invoice |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-05-14-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-05-039, FR-05-040, FR-05-055 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-039, FR-05-040, FR-05-055 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.
- Inventory calls use SPEC-04 `IInventoryAllocation` / posting contracts; lock timeout is 3 s and posting is atomic.

**US-05-14-AC4 — Organization isolation**

*Preconditions / test data*
1. the requested record belongs to another Organization

*Steps*
1. the caller requests the record by id

*Expected results*
1. the response is 404 `COMMON.NOT_FOUND` and discloses no record data (CS-08).

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-05-15: Cancel a Supplier Invoice

### TS-05-065: Reference behavior and exact values for FR-05-041

| Field | Value |
|---|---|
| Story | [US-05-15](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-15-cancel-supplier-invoice.md) — Cancel a Supplier Invoice |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-05-15-AC1 |
| Requirements | FR-05-041 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-041 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.
- Inventory calls use SPEC-04 `IInventoryAllocation` / posting contracts; lock timeout is 3 s and posting is atomic.

**US-05-15-AC1 — Successful result**

*Preconditions / test data*
1. Posted invoice has no active payment allocation

*Steps*
1. A Posted supplier invoice of EGP 1,140.00 has no active payment allocation

*Expected results*
1. cancellation appends EGP 1,140.00 InvoiceCancellation debit ledger entry and releases invoiced receipt packs
2. Draft cancellation creates no ledger entry.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-066: Negative validation path, no partial effect; COMMON.VALIDATION_FAILED

| Field | Value |
|---|---|
| Story | [US-05-15](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-15-cancel-supplier-invoice.md) — Cancel a Supplier Invoice |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-05-15-AC2 |
| Requirements | FR-05-041 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-041 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.
- Inventory calls use SPEC-04 `IInventoryAllocation` / posting contracts; lock timeout is 3 s and posting is atomic.

**US-05-15-AC2 — Validation and negative case**

*Preconditions / test data*
1. Posted invoice with active payment allocation cannot be cancelled
2. repeated invalid status action returns the spec-defined conflict

*Steps*
1. the system validates the request at the required state transition

*Expected results*
1. the specified error is returned and no partial stock, ledger, prescription, or document change remains.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-067: Missing permission and cross-branch access return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-05-15](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-15-cancel-supplier-invoice.md) — Cancel a Supplier Invoice |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-05-15-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-05-041 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-041 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.
- Inventory calls use SPEC-04 `IInventoryAllocation` / posting contracts; lock timeout is 3 s and posting is atomic.

**US-05-15-AC3 — Permission denied**

*Preconditions / test data*
1. procurement.supplier-invoices.read lacks the required permission or is assigned only to another Branch

*Steps*
1. the user calls the branch-scoped endpoint

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN`
2. no protected data or change is returned.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-068: Cross-organization id returns 404 without data (CS-08)

| Field | Value |
|---|---|
| Story | [US-05-15](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-15-cancel-supplier-invoice.md) — Cancel a Supplier Invoice |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-05-15-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-05-041 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-041 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.
- Inventory calls use SPEC-04 `IInventoryAllocation` / posting contracts; lock timeout is 3 s and posting is atomic.

**US-05-15-AC4 — Organization isolation**

*Preconditions / test data*
1. the requested record belongs to another Organization

*Steps*
1. the caller requests the record by id

*Expected results*
1. the response is 404 `COMMON.NOT_FOUND` and discloses no record data (CS-08).

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-05-16: Draft a Supplier Return with Batch Reservation

### TS-05-069: Reference behavior and exact values for FR-05-042, FR-05-043

| Field | Value |
|---|---|
| Story | [US-05-16](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-16-draft-supplier-return-with-reservation.md) — Draft a Supplier Return with Batch Reservation |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-05-16-AC1 |
| Requirements | FR-05-042, FR-05-043 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-042, FR-05-043 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.
- Inventory calls use SPEC-04 `IInventoryAllocation` / posting contracts; lock timeout is 3 s and posting is atomic.

**US-05-16-AC1 — Successful result**

*Preconditions / test data*
1. FEFO and supplier eligibility

*Steps*
1. Branch CAI01 has supplier S1 batches of Medicine A: B1 expiry 2026-11-10 on-hand 5/reserved 1
2. B2 expiry 2027-01-31 Active on-hand 10
3. B3 expired on-hand 4
4. B4 Quarantined on-hand 2
5. supplier S2 batch B5 on-hand 10. Return requests 8 base units

*Expected results*
1. AllocateAndLock with purpose SupplierReturn reserves 5 from B1 then 3 from B2 in ExpiryDate, CreatedAt, Id order using purpose SupplierReturn
2. Preview creates no reservation. Expired/quarantined batches remain eligible only for the same supplier. Candidate selection is FEFO ordered while a single FOR UPDATE locks balances in BatchId order
3. return value is EGP 25.00 at EGP 5.0000 per unit.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-070: Negative validation path, no partial effect; PROCUREMENT.RETURN_BATCH_SUPPLIER_MISMATCH

| Field | Value |
|---|---|
| Story | [US-05-16](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-16-draft-supplier-return-with-reservation.md) — Draft a Supplier Return with Batch Reservation |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-05-16-AC2 |
| Requirements | FR-05-042, FR-05-043 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-042, FR-05-043 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.
- Inventory calls use SPEC-04 `IInventoryAllocation` / posting contracts; lock timeout is 3 s and posting is atomic.

**US-05-16-AC2 — Validation and negative case**

*Preconditions / test data*
1. Selecting S2 batch for S1 return returns 422 PROCUREMENT.RETURN_BATCH_SUPPLIER_MISMATCH
2. requesting > available supplier-owned quantity returns 422 INVENTORY.INSUFFICIENT_STOCK
3. lock timeout 3 s returns 503 COMMON.LOCK_TIMEOUT

*Steps*
1. the system validates the request at the required state transition

*Expected results*
1. the specified error is returned and no partial stock, ledger, prescription, or document change remains.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-071: Missing permission and cross-branch access return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-05-16](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-16-draft-supplier-return-with-reservation.md) — Draft a Supplier Return with Batch Reservation |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-05-16-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-05-042, FR-05-043 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-042, FR-05-043 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.
- Inventory calls use SPEC-04 `IInventoryAllocation` / posting contracts; lock timeout is 3 s and posting is atomic.

**US-05-16-AC3 — Permission denied**

*Preconditions / test data*
1. procurement.supplier-returns.read lacks the required permission or is assigned only to another Branch

*Steps*
1. the user calls the branch-scoped endpoint

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN`
2. no protected data or change is returned.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-072: Cross-organization id returns 404 without data (CS-08)

| Field | Value |
|---|---|
| Story | [US-05-16](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-16-draft-supplier-return-with-reservation.md) — Draft a Supplier Return with Batch Reservation |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-05-16-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-05-042, FR-05-043 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-042, FR-05-043 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.
- Inventory calls use SPEC-04 `IInventoryAllocation` / posting contracts; lock timeout is 3 s and posting is atomic.

**US-05-16-AC4 — Organization isolation**

*Preconditions / test data*
1. the requested record belongs to another Organization

*Steps*
1. the caller requests the record by id

*Expected results*
1. the response is 404 `COMMON.NOT_FOUND` and discloses no record data (CS-08).

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-05-17: Post a Supplier Return and Debit Note

### TS-05-073: Reference behavior and exact values for FR-05-044, FR-05-055

| Field | Value |
|---|---|
| Story | [US-05-17](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-17-post-supplier-return-and-debit-note.md) — Post a Supplier Return and Debit Note |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-05-17-AC1 |
| Requirements | FR-05-044, FR-05-055 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-044, FR-05-055 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.
- Inventory calls use SPEC-04 `IInventoryAllocation` / posting contracts; lock timeout is 3 s and posting is atomic.

**US-05-17-AC1 — Successful result**

*Preconditions / test data*
1. Idempotent return posting

*Steps*
1. Draft supplier return reserves 10 base units at EGP 12.5000 unit cost

*Expected results*
1. posting with Idempotency-Key creates one CAI01-SRT-2026-NNNNNN, movement for -10 units, releases reservation, DebitNote EGP 125.00 and outbox/audit rows
2. repeated same-key same-body returns identical response.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-074: Negative validation path, no partial effect; COMMON.VALIDATION_FAILED

| Field | Value |
|---|---|
| Story | [US-05-17](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-17-post-supplier-return-and-debit-note.md) — Post a Supplier Return and Debit Note |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-05-17-AC2 |
| Requirements | FR-05-044, FR-05-055 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-044, FR-05-055 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.
- Inventory calls use SPEC-04 `IInventoryAllocation` / posting contracts; lock timeout is 3 s and posting is atomic.

**US-05-17-AC2 — Validation and negative case**

*Preconditions / test data*
1. same key different body returns 422 COMMON.IDEMPOTENCY_KEY_REUSED
2. injected failure rolls back all effects

*Steps*
1. the system validates the request at the required state transition

*Expected results*
1. the specified error is returned and no partial stock, ledger, prescription, or document change remains.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-075: Missing permission and cross-branch access return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-05-17](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-17-post-supplier-return-and-debit-note.md) — Post a Supplier Return and Debit Note |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-05-17-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-05-044, FR-05-055 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-044, FR-05-055 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.
- Inventory calls use SPEC-04 `IInventoryAllocation` / posting contracts; lock timeout is 3 s and posting is atomic.

**US-05-17-AC3 — Permission denied**

*Preconditions / test data*
1. procurement.supplier-returns.read lacks the required permission or is assigned only to another Branch

*Steps*
1. the user calls the branch-scoped endpoint

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN`
2. no protected data or change is returned.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-076: Cross-organization id returns 404 without data (CS-08)

| Field | Value |
|---|---|
| Story | [US-05-17](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-17-post-supplier-return-and-debit-note.md) — Post a Supplier Return and Debit Note |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-05-17-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-05-044, FR-05-055 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-044, FR-05-055 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.
- Inventory calls use SPEC-04 `IInventoryAllocation` / posting contracts; lock timeout is 3 s and posting is atomic.

**US-05-17-AC4 — Organization isolation**

*Preconditions / test data*
1. the requested record belongs to another Organization

*Steps*
1. the caller requests the record by id

*Expected results*
1. the response is 404 `COMMON.NOT_FOUND` and discloses no record data (CS-08).

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-05-18: Record a Supplier Payment with Allocations

### TS-05-077: Reference behavior and exact values for FR-05-045, FR-05-046, FR-05-055

| Field | Value |
|---|---|
| Story | [US-05-18](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-18-record-supplier-payment.md) — Record a Supplier Payment with Allocations |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-05-18-AC1 |
| Requirements | FR-05-045, FR-05-046, FR-05-055 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-045, FR-05-046, FR-05-055 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.

**US-05-18-AC1 — Successful result**

*Preconditions / test data*
1. Payment and oldest due allocation

*Steps*
1. Supplier S1 invoices I1 EGP 500.00 and I2 EGP 300.00 are Posted and outstanding
2. payment EGP 600.00 BankTransfer references TR-44

*Expected results*
1. payment records one Payment debit, allocates EGP 500.00 to older-due I1 then EGP 100.00 to I2
2. statuses Paid and PartiallyPaid
3. total amount EGP 600.00.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-078: Negative validation path, no partial effect; COMMON.VALIDATION_FAILED

| Field | Value |
|---|---|
| Story | [US-05-18](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-18-record-supplier-payment.md) — Record a Supplier Payment with Allocations |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-05-18-AC2 |
| Requirements | FR-05-045, FR-05-046, FR-05-055 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-045, FR-05-046, FR-05-055 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.

**US-05-18-AC2 — Validation and negative case**

*Preconditions / test data*
1. Missing BankReference returns 422 PROCUREMENT.PAYMENT_METHOD_DETAILS_REQUIRED
2. allocating beyond outstanding rejects with PROCUREMENT.ALLOCATION_EXCEEDS_OUTSTANDING

*Steps*
1. the system validates the request at the required state transition

*Expected results*
1. the specified error is returned and no partial stock, ledger, prescription, or document change remains.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-079: Missing permission and cross-branch access return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-05-18](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-18-record-supplier-payment.md) — Record a Supplier Payment with Allocations |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-05-18-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-05-045, FR-05-046, FR-05-055 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-045, FR-05-046, FR-05-055 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.

**US-05-18-AC3 — Permission denied**

*Preconditions / test data*
1. procurement.supplier-ledger.read lacks the required permission or is assigned only to another Branch

*Steps*
1. the user calls the branch-scoped endpoint

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN`
2. no protected data or change is returned.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-080: Cross-organization id returns 404 without data (CS-08)

| Field | Value |
|---|---|
| Story | [US-05-18](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-18-record-supplier-payment.md) — Record a Supplier Payment with Allocations |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-05-18-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-05-045, FR-05-046, FR-05-055 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-045, FR-05-046, FR-05-055 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.

**US-05-18-AC4 — Organization isolation**

*Preconditions / test data*
1. the requested record belongs to another Organization

*Steps*
1. the caller requests the record by id

*Expected results*
1. the response is 404 `COMMON.NOT_FOUND` and discloses no record data (CS-08).

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-05-19: Allocate Unapplied Credit and Reverse a Payment

### TS-05-081: Reference behavior and exact values for FR-05-047, FR-05-048, FR-05-055

| Field | Value |
|---|---|
| Story | [US-05-19](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-19-allocate-credit-and-reverse-payment.md) — Allocate Unapplied Credit and Reverse a Payment |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-05-19-AC1 |
| Requirements | FR-05-047, FR-05-048, FR-05-055 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-047, FR-05-048, FR-05-055 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.

**US-05-19-AC1 — Successful result**

*Preconditions / test data*
1. Unapplied allocation and compensating reversal

*Steps*
1. Payment P has EGP 250.00 unallocated credit
2. invoice I has EGP 200.00 outstanding

*Expected results*
1. allocation of EGP 200.00 sets invoice Paid
2. reversal appends PaymentReversal credit EGP 600.00 and compensating allocation, restoring invoice balance and status
3. repeated reversal rejected.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-082: Negative validation path, no partial effect; COMMON.VALIDATION_FAILED

| Field | Value |
|---|---|
| Story | [US-05-19](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-19-allocate-credit-and-reverse-payment.md) — Allocate Unapplied Credit and Reverse a Payment |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-05-19-AC2 |
| Requirements | FR-05-047, FR-05-048, FR-05-055 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-047, FR-05-048, FR-05-055 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.

**US-05-19-AC2 — Validation and negative case**

*Preconditions / test data*
1. Second reversal returns 409 PROCUREMENT.PAYMENT_ALREADY_REVERSED
2. amount > available returns 422 PROCUREMENT.ALLOCATION_EXCEEDS_PAYMENT

*Steps*
1. the system validates the request at the required state transition

*Expected results*
1. the specified error is returned and no partial stock, ledger, prescription, or document change remains.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-083: Missing permission and cross-branch access return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-05-19](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-19-allocate-credit-and-reverse-payment.md) — Allocate Unapplied Credit and Reverse a Payment |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-05-19-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-05-047, FR-05-048, FR-05-055 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-047, FR-05-048, FR-05-055 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.

**US-05-19-AC3 — Permission denied**

*Preconditions / test data*
1. procurement.supplier-ledger.read lacks the required permission or is assigned only to another Branch

*Steps*
1. the user calls the branch-scoped endpoint

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN`
2. no protected data or change is returned.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-084: Cross-organization id returns 404 without data (CS-08)

| Field | Value |
|---|---|
| Story | [US-05-19](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-19-allocate-credit-and-reverse-payment.md) — Allocate Unapplied Credit and Reverse a Payment |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-05-19-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-05-047, FR-05-048, FR-05-055 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-047, FR-05-048, FR-05-055 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.

**US-05-19-AC4 — Organization isolation**

*Preconditions / test data*
1. the requested record belongs to another Organization

*Steps*
1. the caller requests the record by id

*Expected results*
1. the response is 404 `COMMON.NOT_FOUND` and discloses no record data (CS-08).

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-05-20: Supplier Opening Balance and Ledger Statement

### TS-05-085: Reference behavior and exact values for FR-05-049, FR-05-050, FR-05-055

| Field | Value |
|---|---|
| Story | [US-05-20](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-20-supplier-opening-balance-and-ledger.md) — Supplier Opening Balance and Ledger Statement |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-05-20-AC1 |
| Requirements | FR-05-049, FR-05-050, FR-05-055 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-049, FR-05-050, FR-05-055 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.

**US-05-20-AC1 — Successful result**

*Preconditions / test data*
1. Opening balance and ledger statement

*Steps*
1. Supplier S1 branch CAI01 has no ledger entries
2. record opening balance +EGP 1,250.00 as of 2026-11-01
3. later invoice credit EGP 342.00 and payment debit EGP 200.00

*Expected results*
1. statement lists chronological entries and running balances
2. closing balance EGP 1,392.00 (owed to supplier)
3. opening balance represented once.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-086: Negative validation path, no partial effect; COMMON.VALIDATION_FAILED

| Field | Value |
|---|---|
| Story | [US-05-20](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-20-supplier-opening-balance-and-ledger.md) — Supplier Opening Balance and Ledger Statement |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-05-20-AC2 |
| Requirements | FR-05-049, FR-05-050, FR-05-055 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-049, FR-05-050, FR-05-055 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.

**US-05-20-AC2 — Validation and negative case**

*Preconditions / test data*
1. second opening balance rejected with 409 PROCUREMENT.OPENING_BALANCE_EXISTS
2. amount EGP 0.00 rejected PROCUREMENT.OPENING_BALANCE_INVALID

*Steps*
1. the system validates the request at the required state transition

*Expected results*
1. the specified error is returned and no partial stock, ledger, prescription, or document change remains.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-087: Missing permission and cross-branch access return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-05-20](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-20-supplier-opening-balance-and-ledger.md) — Supplier Opening Balance and Ledger Statement |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-05-20-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-05-049, FR-05-050, FR-05-055 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-049, FR-05-050, FR-05-055 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.

**US-05-20-AC3 — Permission denied**

*Preconditions / test data*
1. procurement.supplier-ledger.read lacks the required permission or is assigned only to another Branch

*Steps*
1. the user calls the branch-scoped endpoint

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN`
2. no protected data or change is returned.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-088: Cross-organization id returns 404 without data (CS-08)

| Field | Value |
|---|---|
| Story | [US-05-20](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-20-supplier-opening-balance-and-ledger.md) — Supplier Opening Balance and Ledger Statement |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-05-20-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-05-049, FR-05-050, FR-05-055 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-049, FR-05-050, FR-05-055 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.

**US-05-20-AC4 — Organization isolation**

*Preconditions / test data*
1. the requested record belongs to another Organization

*Steps*
1. the caller requests the record by id

*Expected results*
1. the response is 404 `COMMON.NOT_FOUND` and discloses no record data (CS-08).

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-05-21: Supplier Balances and Aging Report

### TS-05-089: Reference behavior and exact values for FR-05-051

| Field | Value |
|---|---|
| Story | [US-05-21](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-21-supplier-balances-and-aging.md) — Supplier Balances and Aging Report |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-05-21-AC1 |
| Requirements | FR-05-051 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-051 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.

**US-05-21-AC1 — Successful result**

*Preconditions / test data*
1. Aging and CSV/XLSX

*Steps*
1. As of 2026-11-30 supplier has open invoice balances: EGP 100.00 dated 2026-11-25, EGP 200.00 dated 2026-10-20, EGP 300.00 dated 2026-09-01, EGP 400.00 dated 2026-07-01
2. unapplied credits EGP 50.00

*Expected results*
1. buckets by invoice age show NotDue EGP 100.00, 1-30 EGP 200.00, 31-60 EGP 300.00, 61-90 EGP 0.00, >90 EGP 400.00
2. unapplied credits EGP 50.00
3. net outstanding EGP 950.00
4. export requires reports.export.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-090: Negative validation path, no partial effect; COMMON.VALIDATION_FAILED

| Field | Value |
|---|---|
| Story | [US-05-21](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-21-supplier-balances-and-aging.md) — Supplier Balances and Aging Report |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-05-21-AC2 |
| Requirements | FR-05-051 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-051 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.

**US-05-21-AC2 — Validation and negative case**

*Preconditions / test data*
1. missing export permission returns 403 COMMON.FORBIDDEN
2. cross-org supplier returns 404 COMMON.NOT_FOUND

*Steps*
1. the system validates the request at the required state transition

*Expected results*
1. the specified error is returned and no partial stock, ledger, prescription, or document change remains.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-091: Missing permission and cross-branch access return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-05-21](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-21-supplier-balances-and-aging.md) — Supplier Balances and Aging Report |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-05-21-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-05-051 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-051 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.

**US-05-21-AC3 — Permission denied**

*Preconditions / test data*
1. procurement.supplier-ledger.read lacks the required permission or is assigned only to another Branch

*Steps*
1. the user calls the branch-scoped endpoint

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN`
2. no protected data or change is returned.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-092: Cross-organization id returns 404 without data (CS-08)

| Field | Value |
|---|---|
| Story | [US-05-21](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-21-supplier-balances-and-aging.md) — Supplier Balances and Aging Report |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-05-21-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-05-051 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-051 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.

**US-05-21-AC4 — Organization isolation**

*Preconditions / test data*
1. the requested record belongs to another Organization

*Steps*
1. the caller requests the record by id

*Expected results*
1. the response is 404 `COMMON.NOT_FOUND` and discloses no record data (CS-08).

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-05-22: Purchasing Suggestions from Reorder Levels

### TS-05-093: Reference behavior and exact values for FR-05-052

| Field | Value |
|---|---|
| Story | [US-05-22](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-22-purchasing-suggestions.md) — Purchasing Suggestions from Reorder Levels |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-05-22-AC1 |
| Requirements | FR-05-052 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-052 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.

**US-05-22-AC1 — Successful result**

*Preconditions / test data*
1. Reorder suggestion threshold

*Steps*
1. Medicine A PackSize 10, sellable on-hand 30, outstanding on-order 20, min 60, max 120
2. latest Posted receipt supplier S1

*Expected results*
1. suggested packs = ceil((120 - 50)/10) = 7
2. preferred supplier S1
3. Create PO creates one Draft with 7 packs
4. low-stock event flag is shown.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-094: Negative validation path, no partial effect; COMMON.VALIDATION_FAILED

| Field | Value |
|---|---|
| Story | [US-05-22](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-22-purchasing-suggestions.md) — Purchasing Suggestions from Reorder Levels |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-05-22-AC2 |
| Requirements | FR-05-052 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-052 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.

**US-05-22-AC2 — Validation and negative case**

*Preconditions / test data*
1. Medicine above minimum generates no suggestion
2. inactive medicine or no assigned branch is excluded

*Steps*
1. the system validates the request at the required state transition

*Expected results*
1. the specified error is returned and no partial stock, ledger, prescription, or document change remains.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-095: Missing permission and cross-branch access return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-05-22](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-22-purchasing-suggestions.md) — Purchasing Suggestions from Reorder Levels |
| Type / Execution | Security / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-05-22-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-05-052 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-052 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.

**US-05-22-AC3 — Permission denied**

*Preconditions / test data*
1. procurement.purchase-orders.read lacks the required permission or is assigned only to another Branch

*Steps*
1. the user calls the branch-scoped endpoint

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN`
2. no protected data or change is returned.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-096: Cross-organization id returns 404 without data (CS-08)

| Field | Value |
|---|---|
| Story | [US-05-22](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-22-purchasing-suggestions.md) — Purchasing Suggestions from Reorder Levels |
| Type / Execution | Security / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-05-22-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-05-052 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-052 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.

**US-05-22-AC4 — Organization isolation**

*Preconditions / test data*
1. the requested record belongs to another Organization

*Steps*
1. the caller requests the record by id

*Expected results*
1. the response is 404 `COMMON.NOT_FOUND` and discloses no record data (CS-08).

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-05-23: Supplier Performance Metrics

### TS-05-097: Reference behavior and exact values for FR-05-053

| Field | Value |
|---|---|
| Story | [US-05-23](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-23-supplier-performance-metrics.md) — Supplier Performance Metrics |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-05-23-AC1 |
| Requirements | FR-05-053 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-053 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.

**US-05-23-AC1 — Successful result**

*Preconditions / test data*
1. Performance metric formulas

*Steps*
1. Supplier S1 has two eligible POs: first receipt 2 days late, second on time
2. ordered 10 packs, received 8 and 10
3. receipt net values EGP 800.00 and EGP 1,000.00
4. returns EGP 90.00

*Expected results*
1. on-time delivery 50.0%
2. fill rate 90.0%
3. return rate 5.0%
4. price variance uses weighted formula and displays 1 decimal
5. only POs with expected date and >=1 receipt count for on-time.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-098: Negative validation path, no partial effect; COMMON.VALIDATION_FAILED

| Field | Value |
|---|---|
| Story | [US-05-23](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-23-supplier-performance-metrics.md) — Supplier Performance Metrics |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-05-23-AC2 |
| Requirements | FR-05-053 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-053 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.

**US-05-23-AC2 — Validation and negative case**

*Preconditions / test data*
1. no eligible receipts returns null/zero according to report contract and does not divide by zero
2. reversed receipts excluded

*Steps*
1. the system validates the request at the required state transition

*Expected results*
1. the specified error is returned and no partial stock, ledger, prescription, or document change remains.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-099: Missing permission and cross-branch access return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-05-23](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-23-supplier-performance-metrics.md) — Supplier Performance Metrics |
| Type / Execution | Security / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-05-23-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-05-053 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-053 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.

**US-05-23-AC3 — Permission denied**

*Preconditions / test data*
1. procurement.purchase-orders.read lacks the required permission or is assigned only to another Branch

*Steps*
1. the user calls the branch-scoped endpoint

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN`
2. no protected data or change is returned.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-100: Cross-organization id returns 404 without data (CS-08)

| Field | Value |
|---|---|
| Story | [US-05-23](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-23-supplier-performance-metrics.md) — Supplier Performance Metrics |
| Type / Execution | Security / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-05-23-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-05-053 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-053 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.

**US-05-23-AC4 — Organization isolation**

*Preconditions / test data*
1. the requested record belongs to another Organization

*Steps*
1. the caller requests the record by id

*Expected results*
1. the response is 404 `COMMON.NOT_FOUND` and discloses no record data (CS-08).

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-05-24: Supplier Price Comparison

### TS-05-101: Reference behavior and exact values for FR-05-054

| Field | Value |
|---|---|
| Story | [US-05-24](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-24-supplier-price-comparison.md) — Supplier Price Comparison |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-05-24-AC1 |
| Requirements | FR-05-054 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-054 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.

**US-05-24-AC1 — Successful result**

*Preconditions / test data*
1. Supplier price comparison

*Steps*
1. Medicine A has Posted receipts: S1 10 packs EGP 100.00/pack, S1 20 packs EGP 120.00/pack
2. S2 5 packs EGP 90.00/pack
3. PackSize 10

*Expected results*
1. S1 weighted average EGP 113.33/pack, EGP 11.3333/base unit, bonus ratio and 2 receipts shown
2. S2 EGP 90.00/pack
3. only Posted receipt/invoice lines count.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-102: Negative validation path, no partial effect; COMMON.VALIDATION_FAILED

| Field | Value |
|---|---|
| Story | [US-05-24](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-24-supplier-price-comparison.md) — Supplier Price Comparison |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-05-24-AC2 |
| Requirements | FR-05-054 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-054 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.

**US-05-24-AC2 — Validation and negative case**

*Preconditions / test data*
1. Draft/Reversed receipts excluded
2. no data yields empty comparison without inferred costs

*Steps*
1. the system validates the request at the required state transition

*Expected results*
1. the specified error is returned and no partial stock, ledger, prescription, or document change remains.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-103: Missing permission and cross-branch access return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-05-24](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-24-supplier-price-comparison.md) — Supplier Price Comparison |
| Type / Execution | Security / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-05-24-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-05-054 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-054 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.

**US-05-24-AC3 — Permission denied**

*Preconditions / test data*
1. procurement.purchase-orders.read lacks the required permission or is assigned only to another Branch

*Steps*
1. the user calls the branch-scoped endpoint

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN`
2. no protected data or change is returned.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-05-104: Cross-organization id returns 404 without data (CS-08)

| Field | Value |
|---|---|
| Story | [US-05-24](../stories/EPIC-05-SUPPLIERS-PROCUREMENT/US-05-24-supplier-price-comparison.md) — Supplier Price Comparison |
| Type / Execution | Security / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-05-24-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-05-054 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-05-054 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.

**US-05-24-AC4 — Organization isolation**

*Preconditions / test data*
1. the requested record belongs to another Organization

*Steps*
1. the caller requests the record by id

*Expected results*
1. the response is 404 `COMMON.NOT_FOUND` and discloses no record data (CS-08).

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

