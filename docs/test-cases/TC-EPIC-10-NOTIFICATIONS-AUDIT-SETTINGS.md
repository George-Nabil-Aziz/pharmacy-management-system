# Test Cases — EPIC-10 Notifications, Audit, and Settings

> **Generated** by `node scripts/docs/gen-test-cases.mjs` on 2026-11-10 from the story files in `docs/stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/`. Each test case corresponds to one test scenario (TS) declared in a story; preconditions, steps and expected results are derived from the Given / When / Then of the acceptance criteria it covers. The stories are the source of truth — change a story and regenerate.

**Conventions:** TC ID = TS ID. Priority T0 blocks merge, T1 blocks release, T2/T3 per [MASTER-TEST-STRATEGY §6](../test-plans/MASTER-TEST-STRATEGY.md). Execution: *Automated* tests are implemented in code with a trait/name carrying the TS ID; *Manual* cases are executed from this document. Test data conventions: [TEST-DATA-STRATEGY.md](../test-plans/TEST-DATA-STRATEGY.md).

## Summary (121 test cases)

| TC | Scenario | Type | Priority | Release | Covers |
|---|---|---|---|---|---|
| TS-10-001 | Price change commits with exactly one audit entry; correlation id matches traceId | Integration | T1 | MVP | US-10-01-AC1 |
| TS-10-002 | Fault-injected audit insert failure rolls back stock adjustment posting (no movement, no balance change) | Integration | T1 | MVP | US-10-01-AC2 |
| TS-10-003 | Envelope fields, UA truncation to 512, UTC microsecond timestamp | Integration | T1 | MVP | US-10-01-AC3 |
| TS-10-004 | Diff builder emits changed fields only, excludes secret-marked fields, hashes medical fields | Unit | T1 | MVP | US-10-01-AC4, US-10-01-AC5 |
| TS-10-005 | Application DB role UPDATE/DELETE on audit_logs rejected | Integration | T1 | MVP | US-10-01-AC6 |
| TS-10-006 | Failed login produces committed `IDENTITY.LOGIN_FAILED` entry | Integration | T1 | MVP | US-10-01-AC7 |
| TS-10-007 | Route and job inventory contains no audit delete/update path | Architecture | T1 | MVP | US-10-01-AC8 |
| TS-10-008 | Event types returned with Arabic names; count equals registry | API | T1 | MVP | US-10-02-AC1 |
| TS-10-009 | Unregistered code write rolls back and returns 500 | Integration | T1 | MVP | US-10-02-AC2 |
| TS-10-010 | Conformance check fails for uncovered event code | CI | T1 | MVP | US-10-02-AC3 |
| TS-10-011 | Medical read writes `PATIENTS.MEDICAL_DATA_READ`; audit outage returns 503 without data | Integration | T1 | MVP | US-10-02-AC4, US-10-02-AC5 |
| TS-10-012 | Support grant request audited with grant id and status | Integration | T1 | MVP | US-10-02-AC6 |
| TS-10-013 | Cashier receives 403 on event types | API | T1 | MVP | US-10-02-AC7 |
| TS-10-014 | Sealer assigns sequences 1..3, genesis hash, correct SHA-256 values | Integration | T1 | MVP | US-10-03-AC1 |
| TS-10-015 | 50 ops/s for 10 min; p95 sealing lag ≤ 60 s | Performance | T1 | MVP | US-10-03-AC2 |
| TS-10-016 | Sealer role cannot modify sealed or non-seal columns | Integration | T1 | MVP | US-10-03-AC3 |
| TS-10-017 | Intact chain verification records `Passed` and `AUDIT.CHAIN_VERIFIED` | Integration | T1 | MVP | US-10-03-AC4 |
| TS-10-018 | Modify, delete, and insert rows via superuser → `Failed` with correct first failing sequence; Owner notification and alert | Security | T0 | MVP | US-10-03-AC5 |
| TS-10-019 | Sealer stopped 16 min → `UnsealedBacklog` failure | Integration | T1 | MVP | US-10-03-AC6 |
| TS-10-020 | On-demand 202 then 409; Manager 403; cross-org id 404 | API | T1 | MVP | US-10-03-AC7, US-10-03-AC8 |
| TS-10-021 | Cursor pagination over 500 entries, no duplicates or gaps | API | T1 | MVP | US-10-04-AC1 |
| TS-10-022 | Combined filters return intersection only | API | T1 | MVP | US-10-04-AC2 |
| TS-10-023 | Detail returns diff, metadata, seal status | API | T1 | MVP | US-10-04-AC3 |
| TS-10-024 | Branch-scoped manager sees only own-branch entries; null-branch entries excluded; full pages (CS-07) | Security | T0 | MVP | US-10-04-AC4, US-10-04-AC5 |
| TS-10-025 | Cross-organization entry id returns 404 (CS-08) | Security | T0 | MVP | US-10-04-AC6 |
| TS-10-026 | 400-day range → 400; Cashier → 403 | API | T1 | MVP | US-10-04-AC7 |
| TS-10-027 | Audit UI in ar/RTL with localized names and diff table | E2E | T1 | MVP | US-10-04-AC8 |
| TS-10-028 | 31-day indexed search on 50M entries first page p95 ≤ 2 s (NFR-10-005) | Performance | T1 | MVP | US-10-04-AC1 |
| TS-10-029 | 120k-row CSV export with BOM; URL expiry 24 h | Integration | T2 | V1 | US-10-05-AC1 |
| TS-10-030 | `AUDIT.LOGS_EXPORTED` written; one `EXPORT_READY` notification | Integration | T2 | V1 | US-10-05-AC2 |
| TS-10-031 | 1.4M estimate → 422 | API | T2 | V1 | US-10-05-AC3 |
| TS-10-032 | Branch-scoped export equals scoped search | Security | T1 | V1 | US-10-05-AC4 |
| TS-10-033 | Manager 403; other requester 404 | API | T2 | V1 | US-10-05-AC5 |
| TS-10-034 | 1M-row export ≤ 10 min (NFR-10-007) | Performance | T2 | V1 | US-10-05-AC1 |
| TS-10-035 | POST sale logged with route template; no body/query values | Integration | T2 | V1 | US-10-06-AC1 |
| TS-10-036 | GET and anonymous login not logged | Integration | T2 | V1 | US-10-06-AC2 |
| TS-10-037 | 403 attempt logged | Integration | T2 | V1 | US-10-06-AC3 |
| TS-10-038 | Activity search branch scoping (CS-07); cross-org empty (CS-08); 31-day limit; Cashier 403 | Security | T1 | V1 | US-10-06-AC4, US-10-06-AC5 |
| TS-10-039 | Partition older than 180 days dropped; future partition created | Integration | T2 | V1 | US-10-06-AC6 |
| TS-10-040 | 4 voids vs threshold 3 flagged; 3 voids not flagged | Integration | T3 | Future | US-10-07-AC1, US-10-07-AC2 |
| TS-10-041 | After-hours login across midnight; failed-login burst | Integration | T3 | Future | US-10-07-AC3 |
| TS-10-042 | One notification per Owner per date; idempotent rerun | Integration | T3 | Future | US-10-07-AC4 |
| TS-10-043 | Manager 403; cross-org isolation (CS-08) | Security | T3 | Future | US-10-07-AC5 |
| TS-10-044 | New organization has one default rule per type | Integration | T1 | MVP | US-10-08-AC1 |
| TS-10-045 | Recipient resolution excludes other-branch, deactivated, and unpermitted users | Integration | T1 | MVP | US-10-08-AC2 |
| TS-10-046 | Same keys/params for ar and en users; no stored rendered text | API | T1 | MVP | US-10-08-AC3 |
| TS-10-047 | List pagination and per-branch unread counts | API | T1 | MVP | US-10-08-AC4 |
| TS-10-048 | Idempotent read, dismiss, branch-filtered read-all | API | T1 | MVP | US-10-08-AC5 |
| TS-10-049 | Dismissed → read returns 409 | API | T1 | MVP | US-10-08-AC6 |
| TS-10-050 | Other user's and other org's notification ids return 404 (CS-08) | Security | T0 | MVP | US-10-08-AC7 |
| TS-10-051 | Missing `notifications.read` → 403 | API | T1 | MVP | US-10-08-AC8 |
| TS-10-052 | Purge deletes > 90 days, keeps 89-day-old | Integration | T1 | MVP | US-10-08-AC9 |
| TS-10-053 | Unread count p95 ≤ 100 ms, list p95 ≤ 300 ms at 10,000 records/user (NFR-10-003) | Performance | T1 | MVP | US-10-08-AC4 |
| TS-10-054 | Reference values/required behavior and reconciliation (FR-10-025, FR-10-026) | Integration | T1 | MVP | US-10-09-AC1 |
| TS-10-055 | Negative validation boundary causes no partial effect; spec-defined error (SETTINGS.INVALID_VALUE) | API | T1 | MVP | US-10-09-AC2 |
| TS-10-056 | Missing permission and branch mismatch return 403 (CS-07) | Security | T0 | MVP | US-10-09-AC3 |
| TS-10-057 | Other organization returns 404 and no data (CS-08) | Security | T0 | MVP | US-10-09-AC4 |
| TS-10-058 | Reference values/required behavior and reconciliation (FR-10-027) | Integration | T2 | V1 | US-10-10-AC1 |
| TS-10-059 | Negative validation boundary causes no partial effect; spec-defined error (SETTINGS.INVALID_VALUE) | API | T2 | V1 | US-10-10-AC2 |
| TS-10-060 | Missing permission and branch mismatch return 403 (CS-07) | Security | T1 | V1 | US-10-10-AC3 |
| TS-10-061 | Other organization returns 404 and no data (CS-08) | Security | T1 | V1 | US-10-10-AC4 |
| TS-10-062 | Reference values/required behavior and reconciliation (FR-10-028) | Integration | T2 | V1 | US-10-11-AC1 |
| TS-10-063 | Negative validation boundary causes no partial effect; spec-defined error (SETTINGS.INVALID_VALUE) | API | T2 | V1 | US-10-11-AC2 |
| TS-10-064 | Missing permission and branch mismatch return 403 (CS-07) | Security | T1 | V1 | US-10-11-AC3 |
| TS-10-065 | Other organization returns 404 and no data (CS-08) | Security | T1 | V1 | US-10-11-AC4 |
| TS-10-066 | Reference values/required behavior and reconciliation (FR-10-029, FR-10-030, FR-10-031) | Integration | T2 | V1 | US-10-12-AC1 |
| TS-10-067 | Negative validation boundary causes no partial effect; spec-defined error (SETTINGS.INVALID_VALUE) | API | T2 | V1 | US-10-12-AC2 |
| TS-10-068 | Missing permission and branch mismatch return 403 (CS-07) | Security | T1 | V1 | US-10-12-AC3 |
| TS-10-069 | Other organization returns 404 and no data (CS-08) | Security | T1 | V1 | US-10-12-AC4 |
| TS-10-070 | Reference values/required behavior and reconciliation (FR-10-032) | Integration | T1 | MVP | US-10-13-AC1 |
| TS-10-071 | Negative validation boundary causes no partial effect; spec-defined error (SETTINGS.INVALID_VALUE) | API | T1 | MVP | US-10-13-AC2 |
| TS-10-072 | Missing permission and branch mismatch return 403 (CS-07) | Security | T0 | MVP | US-10-13-AC3 |
| TS-10-073 | Other organization returns 404 and no data (CS-08) | Security | T0 | MVP | US-10-13-AC4 |
| TS-10-074 | Reference values/required behavior and reconciliation (FR-10-033) | Integration | T3 | Future | US-10-14-AC1 |
| TS-10-075 | Negative validation boundary causes no partial effect; spec-defined error (SETTINGS.INVALID_VALUE) | API | T3 | Future | US-10-14-AC2 |
| TS-10-076 | Missing permission and branch mismatch return 403 (CS-07) | Security | T3 | Future | US-10-14-AC3 |
| TS-10-077 | Other organization returns 404 and no data (CS-08) | Security | T3 | Future | US-10-14-AC4 |
| TS-10-078 | Reference values/required behavior and reconciliation (FR-10-034, FR-10-035) | Integration | T3 | Future | US-10-15-AC1 |
| TS-10-079 | Negative validation boundary causes no partial effect; spec-defined error (SETTINGS.INVALID_VALUE) | API | T3 | Future | US-10-15-AC2 |
| TS-10-080 | Missing permission and branch mismatch return 403 (CS-07) | Security | T3 | Future | US-10-15-AC3 |
| TS-10-081 | Other organization returns 404 and no data (CS-08) | Security | T3 | Future | US-10-15-AC4 |
| TS-10-082 | Reference values/required behavior and reconciliation (FR-10-036) | Integration | T3 | Future | US-10-16-AC1 |
| TS-10-083 | Negative validation boundary causes no partial effect; spec-defined error (SETTINGS.INVALID_VALUE) | API | T3 | Future | US-10-16-AC2 |
| TS-10-084 | Missing permission and branch mismatch return 403 (CS-07) | Security | T3 | Future | US-10-16-AC3 |
| TS-10-085 | Other organization returns 404 and no data (CS-08) | Security | T3 | Future | US-10-16-AC4 |
| TS-10-086 | Reference values/required behavior and reconciliation (FR-10-037, FR-10-038, FR-10-039) | Integration | T1 | MVP | US-10-17-AC1 |
| TS-10-087 | Negative validation boundary causes no partial effect; spec-defined error (SETTINGS.INVALID_VALUE) | API | T1 | MVP | US-10-17-AC2 |
| TS-10-088 | Missing permission and branch mismatch return 403 (CS-07) | Security | T0 | MVP | US-10-17-AC3 |
| TS-10-089 | Other organization returns 404 and no data (CS-08) | Security | T0 | MVP | US-10-17-AC4 |
| TS-10-090 | Reference values/required behavior and reconciliation (FR-10-040, FR-10-041) | Integration | T1 | MVP | US-10-18-AC1 |
| TS-10-091 | Negative validation boundary causes no partial effect; spec-defined error (SETTINGS.INVALID_VALUE) | API | T1 | MVP | US-10-18-AC2 |
| TS-10-092 | Missing permission and branch mismatch return 403 (CS-07) | Security | T0 | MVP | US-10-18-AC3 |
| TS-10-093 | Other organization returns 404 and no data (CS-08) | Security | T0 | MVP | US-10-18-AC4 |
| TS-10-094 | Reference values/required behavior and reconciliation (FR-10-042) | Integration | T1 | MVP | US-10-19-AC1 |
| TS-10-095 | Negative validation boundary causes no partial effect; spec-defined error (SETTINGS.INVALID_VALUE) | API | T1 | MVP | US-10-19-AC2 |
| TS-10-096 | Missing permission and branch mismatch return 403 (CS-07) | Security | T0 | MVP | US-10-19-AC3 |
| TS-10-097 | Other organization returns 404 and no data (CS-08) | Security | T0 | MVP | US-10-19-AC4 |
| TS-10-098 | Reference values/required behavior and reconciliation (FR-10-043) | Integration | T1 | MVP | US-10-20-AC1 |
| TS-10-099 | Negative validation boundary causes no partial effect; spec-defined error (SETTINGS.INVALID_VALUE) | API | T1 | MVP | US-10-20-AC2 |
| TS-10-100 | Missing permission and branch mismatch return 403 (CS-07) | Security | T0 | MVP | US-10-20-AC3 |
| TS-10-101 | Other organization returns 404 and no data (CS-08) | Security | T0 | MVP | US-10-20-AC4 |
| TS-10-102 | Reference values/required behavior and reconciliation (FR-10-044, FR-10-045) | Integration | T1 | MVP | US-10-21-AC1 |
| TS-10-103 | Negative validation boundary causes no partial effect; spec-defined error (SETTINGS.INVALID_VALUE) | API | T1 | MVP | US-10-21-AC2 |
| TS-10-104 | Missing permission and branch mismatch return 403 (CS-07) | Security | T0 | MVP | US-10-21-AC3 |
| TS-10-105 | Other organization returns 404 and no data (CS-08) | Security | T0 | MVP | US-10-21-AC4 |
| TS-10-106 | Reference values/required behavior and reconciliation (FR-10-046, FR-10-047, FR-10-048, FR-10-049) | Integration | T1 | MVP | US-10-22-AC1 |
| TS-10-107 | Negative validation boundary causes no partial effect; spec-defined error (SETTINGS.INVALID_VALUE) | API | T1 | MVP | US-10-22-AC2 |
| TS-10-108 | Missing permission and branch mismatch return 403 (CS-07) | Security | T0 | MVP | US-10-22-AC3 |
| TS-10-109 | Other organization returns 404 and no data (CS-08) | Security | T0 | MVP | US-10-22-AC4 |
| TS-10-110 | Reference values/required behavior and reconciliation (FR-10-050, FR-10-051) | Integration | T1 | MVP | US-10-23-AC1 |
| TS-10-111 | Negative validation boundary causes no partial effect; spec-defined error (SETTINGS.INVALID_VALUE) | API | T1 | MVP | US-10-23-AC2 |
| TS-10-112 | Missing permission and branch mismatch return 403 (CS-07) | Security | T0 | MVP | US-10-23-AC3 |
| TS-10-113 | Other organization returns 404 and no data (CS-08) | Security | T0 | MVP | US-10-23-AC4 |
| TS-10-114 | Reference values/required behavior and reconciliation (FR-10-052, FR-10-053, FR-10-054) | Integration | T2 | V1 | US-10-24-AC1 |
| TS-10-115 | Negative validation boundary causes no partial effect; spec-defined error (SETTINGS.INVALID_VALUE) | API | T2 | V1 | US-10-24-AC2 |
| TS-10-116 | Missing permission and branch mismatch return 403 (CS-07) | Security | T1 | V1 | US-10-24-AC3 |
| TS-10-117 | Other organization returns 404 and no data (CS-08) | Security | T1 | V1 | US-10-24-AC4 |
| TS-10-118 | Reference values/required behavior and reconciliation (FR-10-055) | Integration | T3 | Future | US-10-25-AC1 |
| TS-10-119 | Negative validation boundary causes no partial effect; spec-defined error (SETTINGS.INVALID_VALUE) | API | T3 | Future | US-10-25-AC2 |
| TS-10-120 | Missing permission and branch mismatch return 403 (CS-07) | Security | T3 | Future | US-10-25-AC3 |
| TS-10-121 | Other organization returns 404 and no data (CS-08) | Security | T3 | Future | US-10-25-AC4 |

---

## US-10-01: Audit Log Write Pipeline

### TS-10-001: Price change commits with exactly one audit entry; correlation id matches traceId

| Field | Value |
|---|---|
| Story | [US-10-01](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-01-audit-log-write-pipeline.md) — Audit Log Write Pipeline |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-01-AC1 |
| Requirements | FR-10-001, FR-10-002, FR-10-003, FR-10-004, FR-10-005 |

**Story preconditions**
- `platform.audit_logs` table exists with monthly partitions and the indexes listed in SPEC-10 §8.1.
- The application database role has `INSERT` and `SELECT` only on `platform.audit_logs`.
- Request context provides organization id, branch id (when route-scoped), user id, IP, user agent, and `traceId`.

**US-10-01-AC1 — Audit entry committed with the business change**

*Preconditions / test data*
1. a Branch Manager changes the selling price of a medicine (catalog event `CATALOG.PRICE_CHANGED`)

*Steps*
1. the price change transaction commits

*Expected results*
1. exactly one `AuditLog` row with event code `CATALOG.PRICE_CHANGED` exists with the same commit, and its `CorrelationId` equals the request `traceId`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-002: Fault-injected audit insert failure rolls back stock adjustment posting (no movement, no balance change)

| Field | Value |
|---|---|
| Story | [US-10-01](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-01-audit-log-write-pipeline.md) — Audit Log Write Pipeline |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-01-AC2 |
| Requirements | FR-10-001, FR-10-002, FR-10-003, FR-10-004, FR-10-005 |

**Story preconditions**
- `platform.audit_logs` table exists with monthly partitions and the indexes listed in SPEC-10 §8.1.
- The application database role has `INSERT` and `SELECT` only on `platform.audit_logs`.
- Request context provides organization id, branch id (when route-scoped), user id, IP, user agent, and `traceId`.

**US-10-01-AC2 — Audit failure rolls back the business change**

*Preconditions / test data*
1. the audit insert is forced to fail (test fault injection) during a stock adjustment posting

*Steps*
1. the posting request is processed

*Expected results*
1. the API returns 500 with code `AUDIT.WRITE_FAILED`, the adjustment status is unchanged, and no stock movement or balance change exists

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-003: Envelope fields, UA truncation to 512, UTC microsecond timestamp

| Field | Value |
|---|---|
| Story | [US-10-01](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-01-audit-log-write-pipeline.md) — Audit Log Write Pipeline |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-01-AC3 |
| Requirements | FR-10-001, FR-10-002, FR-10-003, FR-10-004, FR-10-005 |

**Story preconditions**
- `platform.audit_logs` table exists with monthly partitions and the indexes listed in SPEC-10 §8.1.
- The application database role has `INSERT` and `SELECT` only on `platform.audit_logs`.
- Request context provides organization id, branch id (when route-scoped), user id, IP, user agent, and `traceId`.

**US-10-01-AC3 — Envelope fields captured**

*Preconditions / test data*
1. a user from IP `197.32.10.5` with a user agent of 700 characters performs an audited operation in branch `CAI01`

*Steps*
1. the audit entry is written

*Expected results*
1. it contains event code, category, organization id, branch id, actor user id, actor type `User`, entity type and id, outcome `Succeeded`, IP `197.32.10.5`, the user agent truncated to 512 characters, correlation id, and `OccurredAt` in UTC with microsecond precision

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-004: Diff builder emits changed fields only, excludes secret-marked fields, hashes medical fields

| Field | Value |
|---|---|
| Story | [US-10-01](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-01-audit-log-write-pipeline.md) — Audit Log Write Pipeline |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-01-AC4, US-10-01-AC5 |
| Requirements | FR-10-001, FR-10-002, FR-10-003, FR-10-004, FR-10-005 |

**Story preconditions**
- `platform.audit_logs` table exists with monthly partitions and the indexes listed in SPEC-10 §8.1.
- The application database role has `INSERT` and `SELECT` only on `platform.audit_logs`.
- Request context provides organization id, branch id (when route-scoped), user id, IP, user agent, and `traceId`.

**US-10-01-AC4 — Field-level diff without secrets**

*Preconditions / test data*
1. an administrator updates a user's display name and triggers a password reset in the same request

*Steps*
1. the `IDENTITY.USER_UPDATED` entry is written

*Expected results*
1. `Changes` contains only `{ "displayName": { "before": "...", "after": "..." } }` and no password hash, token, or reset code appears anywhere in the entry

**US-10-01-AC5 — Medical values hashed**

*Preconditions / test data*
1. a pharmacist changes a patient allergy from "Penicillin" to "Penicillin, Sulfa"

*Steps*
1. `PATIENTS.MEDICAL_DATA_CHANGED` is written

*Expected results*
1. `Changes` lists the field name with SHA-256 hashes of the before and after values and no plaintext medical value

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-005: Application DB role UPDATE/DELETE on audit_logs rejected

| Field | Value |
|---|---|
| Story | [US-10-01](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-01-audit-log-write-pipeline.md) — Audit Log Write Pipeline |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-01-AC6 |
| Requirements | FR-10-001, FR-10-002, FR-10-003, FR-10-004, FR-10-005 |

**Story preconditions**
- `platform.audit_logs` table exists with monthly partitions and the indexes listed in SPEC-10 §8.1.
- The application database role has `INSERT` and `SELECT` only on `platform.audit_logs`.
- Request context provides organization id, branch id (when route-scoped), user id, IP, user agent, and `traceId`.

**US-10-01-AC6 — Append-only enforced at database level (negative)**

*Preconditions / test data*
1. a connection using the application database role

*Steps*
1. it executes `UPDATE` of any non-seal column or `DELETE` on `platform.audit_logs`

*Expected results*
1. the statement fails with a permission/trigger error and the row is unchanged

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-006: Failed login produces committed `IDENTITY.LOGIN_FAILED` entry

| Field | Value |
|---|---|
| Story | [US-10-01](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-01-audit-log-write-pipeline.md) — Audit Log Write Pipeline |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-01-AC7 |
| Requirements | FR-10-001, FR-10-002, FR-10-003, FR-10-004, FR-10-005 |

**Story preconditions**
- `platform.audit_logs` table exists with monthly partitions and the indexes listed in SPEC-10 §8.1.
- The application database role has `INSERT` and `SELECT` only on `platform.audit_logs`.
- Request context provides organization id, branch id (when route-scoped), user id, IP, user agent, and `traceId`.

**US-10-01-AC7 — Failed security operations are audited in their own transaction**

*Preconditions / test data*
1. a login attempt with a wrong password

*Steps*
1. the login request completes with 401

*Expected results*
1. one `IDENTITY.LOGIN_FAILED` entry with reason `InvalidCredentials` is committed even though no business transaction committed

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-007: Route and job inventory contains no audit delete/update path

| Field | Value |
|---|---|
| Story | [US-10-01](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-01-audit-log-write-pipeline.md) — Audit Log Write Pipeline |
| Type / Execution | Architecture / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-01-AC8 |
| Requirements | FR-10-001, FR-10-002, FR-10-003, FR-10-004, FR-10-005 |

**Story preconditions**
- `platform.audit_logs` table exists with monthly partitions and the indexes listed in SPEC-10 §8.1.
- The application database role has `INSERT` and `SELECT` only on `platform.audit_logs`.
- Request context provides organization id, branch id (when route-scoped), user id, IP, user agent, and `traceId`.

**US-10-01-AC8 — No purge capability**

*Preconditions / test data*
1. the complete API route inventory and the registered recurring jobs

*Steps*
1. the route/job inventory test runs

*Expected results*
1. no route or job deletes or updates `AuditLog` rows (other than the sealer's seal columns)

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-10-02: Sensitive-Operation Catalog Registry and Conformance

### TS-10-008: Event types returned with Arabic names; count equals registry

| Field | Value |
|---|---|
| Story | [US-10-02](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-02-sensitive-operation-catalog-registry.md) — Sensitive-Operation Catalog Registry and Conformance |
| Type / Execution | API / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-02-AC1 |
| Requirements | FR-10-006, FR-10-007, FR-10-008 |

**Story preconditions**
- US-10-01 audit write pipeline is available.
- Catalog entries from SPEC-10 §8.3 are registered with category, owner spec, and retention class, with `ar`/`en` display names in the `audit` namespace.

**US-10-02-AC1 — Catalog exposed with localized names**

*Preconditions / test data*
1. an Owner with `audit.logs.read` and `Accept-Language: ar`

*Steps*
1. they call `GET /api/v1/audit/event-types`

*Expected results*
1. the response contains every registered event code with category, owner spec, retention class, and an Arabic display name, and the count equals the registry count

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-009: Unregistered code write rolls back and returns 500

| Field | Value |
|---|---|
| Story | [US-10-02](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-02-sensitive-operation-catalog-registry.md) — Sensitive-Operation Catalog Registry and Conformance |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-02-AC2 |
| Requirements | FR-10-006, FR-10-007, FR-10-008 |

**Story preconditions**
- US-10-01 audit write pipeline is available.
- Catalog entries from SPEC-10 §8.3 are registered with category, owner spec, and retention class, with `ar`/`en` display names in the `audit` namespace.

**US-10-02-AC2 — Unregistered event code rejected**

*Preconditions / test data*
1. application code attempts to write an audit entry with event code `INVENTORY.SOMETHING_NEW` not in the registry

*Steps*
1. the transaction executes

*Expected results*
1. the write fails with `AUDIT.UNKNOWN_EVENT_CODE`, the business transaction rolls back, and the API returns 500

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-010: Conformance check fails for uncovered event code

| Field | Value |
|---|---|
| Story | [US-10-02](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-02-sensitive-operation-catalog-registry.md) — Sensitive-Operation Catalog Registry and Conformance |
| Type / Execution | CI / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-02-AC3 |
| Requirements | FR-10-006, FR-10-007, FR-10-008 |

**Story preconditions**
- US-10-01 audit write pipeline is available.
- Catalog entries from SPEC-10 §8.3 are registered with category, owner spec, and retention class, with `ar`/`en` display names in the `audit` namespace.

**US-10-02-AC3 — Conformance gate in the build**

*Preconditions / test data*
1. a registered event code with no integration test asserting its emission

*Steps*
1. the CI conformance check runs

*Expected results*
1. the build fails and lists the uncovered event code

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-011: Medical read writes `PATIENTS.MEDICAL_DATA_READ`; audit outage returns 503 without data

| Field | Value |
|---|---|
| Story | [US-10-02](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-02-sensitive-operation-catalog-registry.md) — Sensitive-Operation Catalog Registry and Conformance |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-02-AC4, US-10-02-AC5 |
| Requirements | FR-10-006, FR-10-007, FR-10-008 |

**Story preconditions**
- US-10-01 audit write pipeline is available.
- Catalog entries from SPEC-10 §8.3 are registered with category, owner spec, and retention class, with `ar`/`en` display names in the `audit` namespace.

**US-10-02-AC4 — Patient medical data read is audited**

*Preconditions / test data*
1. a pharmacist with `patients.medical.read` in branch `CAI01`

*Steps*
1. they open a patient's allergies and conditions

*Expected results*
1. a `PATIENTS.MEDICAL_DATA_READ` entry with patient id and sections `["allergies","conditions"]` is committed before the response is returned

**US-10-02-AC5 — Medical read fails closed (negative)**

*Preconditions / test data*
1. the audit store is unavailable (fault injection)

*Steps*
1. a pharmacist requests a patient's medical data

*Expected results*
1. the API returns 503 `AUDIT.ACCESS_LOG_UNAVAILABLE` and the response body contains no medical data

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-012: Support grant request audited with grant id and status

| Field | Value |
|---|---|
| Story | [US-10-02](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-02-sensitive-operation-catalog-registry.md) — Sensitive-Operation Catalog Registry and Conformance |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-02-AC6 |
| Requirements | FR-10-006, FR-10-007, FR-10-008 |

**Story preconditions**
- US-10-01 audit write pipeline is available.
- Catalog entries from SPEC-10 §8.3 are registered with category, owner spec, and retention class, with `ar`/`en` display names in the `audit` namespace.

**US-10-02-AC6 — Support access usage audited**

*Preconditions / test data*
1. an active support access grant for platform administrator P on organization O

*Steps*
1. P calls `GET /api/v1/branches/{branchId}/settings` under the grant

*Expected results*
1. an `ORG.SUPPORT_ACCESS_USED` entry with actor type `SupportGrant`, grant id, method `GET`, route template, and status 200 is written to organization O's chain

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-013: Cashier receives 403 on event types

| Field | Value |
|---|---|
| Story | [US-10-02](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-02-sensitive-operation-catalog-registry.md) — Sensitive-Operation Catalog Registry and Conformance |
| Type / Execution | API / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-02-AC7 |
| Requirements | FR-10-006, FR-10-007, FR-10-008 |

**Story preconditions**
- US-10-01 audit write pipeline is available.
- Catalog entries from SPEC-10 §8.3 are registered with category, owner spec, and retention class, with `ar`/`en` display names in the `audit` namespace.

**US-10-02-AC7 — Permission denied**

*Preconditions / test data*
1. a Cashier without `audit.logs.read`

*Steps*
1. they call `GET /api/v1/audit/event-types`

*Expected results*
1. the API returns 403 `COMMON.FORBIDDEN`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-10-03: Per-Organization Audit Hash Chain and Verification

### TS-10-014: Sealer assigns sequences 1..3, genesis hash, correct SHA-256 values

| Field | Value |
|---|---|
| Story | [US-10-03](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-03-audit-hash-chain-and-verification.md) — Per-Organization Audit Hash Chain and Verification |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-03-AC1 |
| Requirements | FR-10-004, FR-10-009, FR-10-010, FR-10-011 |

**Story preconditions**
- US-10-01 is complete; `AuditChainHead` and `AuditChainVerification` tables exist.
- Sealer database role exists with rights limited to seal columns (`ChainSequence`, `PreviousHash`, `Hash`, `SealedAt`) when they are NULL, and to `AuditChainHead`.

**US-10-03-AC1 — Sealing builds a gapless chain**

*Preconditions / test data*
1. a new organization with 3 committed, unsealed audit entries

*Steps*
1. the sealer cycle runs

*Expected results*
1. the entries receive `ChainSequence` 1, 2, 3
2. entry 1 has `PreviousHash` of 64 zeros
3. each `Hash` equals SHA-256 of the canonical serialization (SPEC-10 §8.5) concatenated with `PreviousHash`
4. and `AuditChainHead.LastSequence` = 3

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-015: 50 ops/s for 10 min; p95 sealing lag ≤ 60 s

| Field | Value |
|---|---|
| Story | [US-10-03](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-03-audit-hash-chain-and-verification.md) — Per-Organization Audit Hash Chain and Verification |
| Type / Execution | Performance / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-03-AC2 |
| Requirements | FR-10-004, FR-10-009, FR-10-010, FR-10-011 |

**Story preconditions**
- US-10-01 is complete; `AuditChainHead` and `AuditChainVerification` tables exist.
- Sealer database role exists with rights limited to seal columns (`ChainSequence`, `PreviousHash`, `Hash`, `SealedAt`) when they are NULL, and to `AuditChainHead`.

**US-10-03-AC2 — Sealing lag within target**

*Preconditions / test data*
1. a steady load of 50 audited operations per second across 10 organizations for 10 minutes

*Steps*
1. sealing lag is measured per entry (`SealedAt − commit time`)

*Expected results*
1. p95 lag ≤ 60 s

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-016: Sealer role cannot modify sealed or non-seal columns

| Field | Value |
|---|---|
| Story | [US-10-03](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-03-audit-hash-chain-and-verification.md) — Per-Organization Audit Hash Chain and Verification |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-03-AC3 |
| Requirements | FR-10-004, FR-10-009, FR-10-010, FR-10-011 |

**Story preconditions**
- US-10-01 is complete; `AuditChainHead` and `AuditChainVerification` tables exist.
- Sealer database role exists with rights limited to seal columns (`ChainSequence`, `PreviousHash`, `Hash`, `SealedAt`) when they are NULL, and to `AuditChainHead`.

**US-10-03-AC3 — Sealer cannot alter content or re-seal (negative)**

*Preconditions / test data*
1. a sealed entry

*Steps*
1. the sealer role attempts to update its `Hash` or any non-seal column

*Expected results*
1. the database trigger rejects the statement and the row is unchanged

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-017: Intact chain verification records `Passed` and `AUDIT.CHAIN_VERIFIED`

| Field | Value |
|---|---|
| Story | [US-10-03](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-03-audit-hash-chain-and-verification.md) — Per-Organization Audit Hash Chain and Verification |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-03-AC4 |
| Requirements | FR-10-004, FR-10-009, FR-10-010, FR-10-011 |

**Story preconditions**
- US-10-01 is complete; `AuditChainHead` and `AuditChainVerification` tables exist.
- Sealer database role exists with rights limited to seal columns (`ChainSequence`, `PreviousHash`, `Hash`, `SealedAt`) when they are NULL, and to `AuditChainHead`.

**US-10-03-AC4 — Nightly verification passes**

*Preconditions / test data*
1. an organization whose chain is intact

*Steps*
1. the nightly verification at 02:30 `Africa/Cairo` runs

*Expected results*
1. an `AuditChainVerification` row with result `Passed`, the verified sequence range, and entries checked is recorded, and an `AUDIT.CHAIN_VERIFIED` entry is written

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-018: Modify, delete, and insert rows via superuser → `Failed` with correct first failing sequence; Owner notification and alert

| Field | Value |
|---|---|
| Story | [US-10-03](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-03-audit-hash-chain-and-verification.md) — Per-Organization Audit Hash Chain and Verification |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-10-03-AC5 |
| Requirements | FR-10-004, FR-10-009, FR-10-010, FR-10-011 |

**Story preconditions**
- US-10-01 is complete; `AuditChainHead` and `AuditChainVerification` tables exist.
- Sealer database role exists with rights limited to seal columns (`ChainSequence`, `PreviousHash`, `Hash`, `SealedAt`) when they are NULL, and to `AuditChainHead`.

**US-10-03-AC5 — Tampering detected**

*Preconditions / test data*
1. a privileged database user changes the `Metadata` of the entry with `ChainSequence` 1,042

*Steps*
1. verification runs

*Expected results*
1. the result is `Failed` with `FirstFailingSequence = 1042`, `AUDIT.CHAIN_VERIFICATION_FAILED` is written to the organization and platform chains, an `AUDIT_CHAIN_INTEGRITY_FAILURE` notification is created for every active Owner, and a platform alert is raised within 5 minutes

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-019: Sealer stopped 16 min → `UnsealedBacklog` failure

| Field | Value |
|---|---|
| Story | [US-10-03](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-03-audit-hash-chain-and-verification.md) — Per-Organization Audit Hash Chain and Verification |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-03-AC6 |
| Requirements | FR-10-004, FR-10-009, FR-10-010, FR-10-011 |

**Story preconditions**
- US-10-01 is complete; `AuditChainHead` and `AuditChainVerification` tables exist.
- Sealer database role exists with rights limited to seal columns (`ChainSequence`, `PreviousHash`, `Hash`, `SealedAt`) when they are NULL, and to `AuditChainHead`.

**US-10-03-AC6 — Stale unsealed entries reported**

*Preconditions / test data*
1. the sealer has been stopped and an entry has remained unsealed for 16 minutes

*Steps*
1. verification runs

*Expected results*
1. the result is `Failed` with reason `UnsealedBacklog` and the alerting of AC5 applies

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-020: On-demand 202 then 409; Manager 403; cross-org id 404

| Field | Value |
|---|---|
| Story | [US-10-03](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-03-audit-hash-chain-and-verification.md) — Per-Organization Audit Hash Chain and Verification |
| Type / Execution | API / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-03-AC7, US-10-03-AC8 |
| Requirements | FR-10-004, FR-10-009, FR-10-010, FR-10-011 |

**Story preconditions**
- US-10-01 is complete; `AuditChainHead` and `AuditChainVerification` tables exist.
- Sealer database role exists with rights limited to seal columns (`ChainSequence`, `PreviousHash`, `Hash`, `SealedAt`) when they are NULL, and to `AuditChainHead`.

**US-10-03-AC7 — On-demand verification and single-run guard**

*Preconditions / test data*
1. an Owner with `audit.chain.verify`

*Steps*
1. they `POST /api/v1/audit/chain/verifications` and then immediately post again

*Expected results*
1. the first call returns 202 with the verification id and the second returns 409 `AUDIT.VERIFICATION_ALREADY_RUNNING`

**US-10-03-AC8 — Permission denied and cross-organization isolation**

*Preconditions / test data*
1. a Branch Manager without `audit.chain.verify`, and an Owner of organization A

*Steps*
1. the Manager posts a verification, and the Owner of A requests organization B's verification id

*Expected results*
1. the Manager receives 403 `COMMON.FORBIDDEN` and the Owner of A receives 404 `COMMON.NOT_FOUND`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-10-04: Audit Log Search and Filter

### TS-10-021: Cursor pagination over 500 entries, no duplicates or gaps

| Field | Value |
|---|---|
| Story | [US-10-04](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-04-audit-log-search-and-filter.md) — Audit Log Search and Filter |
| Type / Execution | API / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-04-AC1 |
| Requirements | FR-10-012, FR-10-013 |

**Story preconditions**
- Audit entries exist (US-10-01). User holds `audit.logs.read`.

**US-10-04-AC1 — Filtered search with cursor pagination**

*Preconditions / test data*
1. an Owner with organization-wide scope and 500 `SALES.SALE_VOIDED` entries in November 2026

*Steps*
1. they call `GET /api/v1/audit/logs?from=2026-11-01&to=2026-11-30&eventCodes=SALES.SALE_VOIDED&limit=50`

*Expected results*
1. 50 entries are returned newest first with a `nextCursor`, and following cursors returns all 500 entries exactly once

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-022: Combined filters return intersection only

| Field | Value |
|---|---|
| Story | [US-10-04](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-04-audit-log-search-and-filter.md) — Audit Log Search and Filter |
| Type / Execution | API / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-04-AC2 |
| Requirements | FR-10-012, FR-10-013 |

**Story preconditions**
- Audit entries exist (US-10-01). User holds `audit.logs.read`.

**US-10-04-AC2 — Combined filters**

*Preconditions / test data*
1. entries from several actors and entities

*Steps*
1. the Owner filters by `actorUserId`, `entityType=Medicine`, `entityId`, and `outcome=Succeeded`

*Expected results*
1. only entries matching all filters are returned

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-023: Detail returns diff, metadata, seal status

| Field | Value |
|---|---|
| Story | [US-10-04](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-04-audit-log-search-and-filter.md) — Audit Log Search and Filter |
| Type / Execution | API / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-04-AC3 |
| Requirements | FR-10-012, FR-10-013 |

**Story preconditions**
- Audit entries exist (US-10-01). User holds `audit.logs.read`.

**US-10-04-AC3 — Entry detail with diff and seal status**

*Preconditions / test data*
1. a sealed and verified `CATALOG.PRICE_CHANGED` entry

*Steps*
1. the Owner calls `GET /api/v1/audit/logs/{id}`

*Expected results*
1. the response includes the diff `{ "price": { "before": "45.0000", "after": "47.5000" } }`, metadata, correlation id, and `sealStatus = Verified`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-024: Branch-scoped manager sees only own-branch entries; null-branch entries excluded; full pages (CS-07)

| Field | Value |
|---|---|
| Story | [US-10-04](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-04-audit-log-search-and-filter.md) — Audit Log Search and Filter |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-10-04-AC4, US-10-04-AC5 |
| Critical scenario | CS-07 |
| Requirements | FR-10-012, FR-10-013 |

**Story preconditions**
- Audit entries exist (US-10-01). User holds `audit.logs.read`.

**US-10-04-AC4 — Branch scoping for branch-scoped users**

*Preconditions / test data*
1. a Branch Manager assigned only to branch `CAI01` with `audit.logs.read`

*Steps*
1. they search without a branch filter

*Expected results*
1. only entries with `BranchId = CAI01` are returned
2. entries of other branches and entries with null `BranchId` (e.g., role changes) are excluded, and page sizes are not reduced by post-filtering

**US-10-04-AC5 — Cross-branch filter denied**

*Preconditions / test data*
1. the same Branch Manager

*Steps*
1. they search with `branchId` of branch `ALX02` (not assigned)

*Expected results*
1. the API returns 403 `COMMON.FORBIDDEN`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-025: Cross-organization entry id returns 404 (CS-08)

| Field | Value |
|---|---|
| Story | [US-10-04](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-04-audit-log-search-and-filter.md) — Audit Log Search and Filter |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-10-04-AC6 |
| Critical scenario | CS-08 |
| Requirements | FR-10-012, FR-10-013 |

**Story preconditions**
- Audit entries exist (US-10-01). User holds `audit.logs.read`.

**US-10-04-AC6 — Cross-organization entry hidden**

*Preconditions / test data*
1. an Owner of organization A

*Steps*
1. they request `GET /api/v1/audit/logs/{id}` for an entry of organization B

*Expected results*
1. the API returns 404 `COMMON.NOT_FOUND`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-026: 400-day range → 400; Cashier → 403

| Field | Value |
|---|---|
| Story | [US-10-04](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-04-audit-log-search-and-filter.md) — Audit Log Search and Filter |
| Type / Execution | API / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-04-AC7 |
| Requirements | FR-10-012, FR-10-013 |

**Story preconditions**
- Audit entries exist (US-10-01). User holds `audit.logs.read`.

**US-10-04-AC7 — Invalid date range and permission denied**

*Preconditions / test data*
1. an Owner, and a Cashier without `audit.logs.read`

*Steps*
1. the Owner searches with a 400-day range, and the Cashier searches with a valid range

*Expected results*
1. the Owner receives 400 `AUDIT.INVALID_DATE_RANGE` and the Cashier receives 403 `COMMON.FORBIDDEN`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-027: Audit UI in ar/RTL with localized names and diff table

| Field | Value |
|---|---|
| Story | [US-10-04](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-04-audit-log-search-and-filter.md) — Audit Log Search and Filter |
| Type / Execution | E2E / Manual |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-04-AC8 |
| Requirements | FR-10-012, FR-10-013 |

**Story preconditions**
- Audit entries exist (US-10-01). User holds `audit.logs.read`.

**US-10-04-AC8 — Audit search UI**

*Preconditions / test data*
1. an Owner on the Audit page in Arabic (RTL)

*Steps*
1. they apply filters (date range, event type picker with localized names, user, branch) and open an entry

*Expected results*
1. results show localized event names, timestamps in the branch time zone, and the diff as a before/after table
2. identifiers render LTR

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-028: 31-day indexed search on 50M entries first page p95 ≤ 2 s (NFR-10-005)

| Field | Value |
|---|---|
| Story | [US-10-04](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-04-audit-log-search-and-filter.md) — Audit Log Search and Filter |
| Type / Execution | Performance / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-04-AC1 |
| Requirements | FR-10-012, FR-10-013 |

**Story preconditions**
- Audit entries exist (US-10-01). User holds `audit.logs.read`.

**US-10-04-AC1 — Filtered search with cursor pagination**

*Preconditions / test data*
1. an Owner with organization-wide scope and 500 `SALES.SALE_VOIDED` entries in November 2026

*Steps*
1. they call `GET /api/v1/audit/logs?from=2026-11-01&to=2026-11-30&eventCodes=SALES.SALE_VOIDED&limit=50`

*Expected results*
1. 50 entries are returned newest first with a `nextCursor`, and following cursors returns all 500 entries exactly once

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-10-05: Audit Log Export

### TS-10-029: 120k-row CSV export with BOM; URL expiry 24 h

| Field | Value |
|---|---|
| Story | [US-10-05](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-05-audit-log-export.md) — Audit Log Export |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-10-05-AC1 |
| Requirements | FR-10-014 |

**Story preconditions**
- US-10-04 search filters exist; object storage (ADR-006) is available; `EXPORT_READY` notification type exists (US-10-08).

**US-10-05-AC1 — Asynchronous export**

*Preconditions / test data*
1. an Owner with `audit.logs.export` and a filter matching 120,000 entries

*Steps*
1. they `POST /api/v1/audit/exports` with `{ "format": "csv", "filter": { "from": "2026-10-01", "to": "2026-10-31" } }`

*Expected results*
1. the API returns 202 with an export id, the file is produced as UTF-8 CSV with BOM containing 120,000 rows plus header, and `GET /api/v1/audit/exports/{id}` returns status `Completed` with a pre-signed URL that expires 24 h after generation

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-030: `AUDIT.LOGS_EXPORTED` written; one `EXPORT_READY` notification

| Field | Value |
|---|---|
| Story | [US-10-05](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-05-audit-log-export.md) — Audit Log Export |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-10-05-AC2 |
| Requirements | FR-10-014 |

**Story preconditions**
- US-10-04 search filters exist; object storage (ADR-006) is available; `EXPORT_READY` notification type exists (US-10-08).

**US-10-05-AC2 — Export is itself audited and notified**

*Preconditions / test data*
1. the export in AC1

*Steps*
1. it is requested and completes

*Expected results*
1. an `AUDIT.LOGS_EXPORTED` entry with the filter and row count exists, and the requester receives one `EXPORT_READY` notification linking to the export page (not to the file URL)

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-031: 1.4M estimate → 422

| Field | Value |
|---|---|
| Story | [US-10-05](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-05-audit-log-export.md) — Audit Log Export |
| Type / Execution | API / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-10-05-AC3 |
| Requirements | FR-10-014 |

**Story preconditions**
- US-10-04 search filters exist; object storage (ADR-006) is available; `EXPORT_READY` notification type exists (US-10-08).

**US-10-05-AC3 — Export too large (negative)**

*Preconditions / test data*
1. a filter estimated at 1,400,000 entries

*Steps*
1. the Owner requests an export

*Expected results*
1. the API returns 422 `AUDIT.EXPORT_TOO_LARGE` and no job is created

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-032: Branch-scoped export equals scoped search

| Field | Value |
|---|---|
| Story | [US-10-05](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-05-audit-log-export.md) — Audit Log Export |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-10-05-AC4 |
| Requirements | FR-10-014 |

**Story preconditions**
- US-10-04 search filters exist; object storage (ADR-006) is available; `EXPORT_READY` notification type exists (US-10-08).

**US-10-05-AC4 — Branch scoping applies**

*Preconditions / test data*
1. a user with `audit.logs.export` assigned only to `CAI01` (custom role)

*Steps*
1. they export without a branch filter

*Expected results*
1. the file contains only `CAI01` entries, identical to their search results

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-033: Manager 403; other requester 404

| Field | Value |
|---|---|
| Story | [US-10-05](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-05-audit-log-export.md) — Audit Log Export |
| Type / Execution | API / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-10-05-AC5 |
| Requirements | FR-10-014 |

**Story preconditions**
- US-10-04 search filters exist; object storage (ADR-006) is available; `EXPORT_READY` notification type exists (US-10-08).

**US-10-05-AC5 — Permission denied and requester isolation**

*Preconditions / test data*
1. a Branch Manager without `audit.logs.export`, and a second Owner in the same organization

*Steps*
1. the Manager posts an export, and the second Owner requests the first Owner's export id

*Expected results*
1. the Manager receives 403 `COMMON.FORBIDDEN` and the second Owner receives 404 `COMMON.NOT_FOUND`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-034: 1M-row export ≤ 10 min (NFR-10-007)

| Field | Value |
|---|---|
| Story | [US-10-05](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-05-audit-log-export.md) — Audit Log Export |
| Type / Execution | Performance / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-10-05-AC1 |
| Requirements | FR-10-014 |

**Story preconditions**
- US-10-04 search filters exist; object storage (ADR-006) is available; `EXPORT_READY` notification type exists (US-10-08).

**US-10-05-AC1 — Asynchronous export**

*Preconditions / test data*
1. an Owner with `audit.logs.export` and a filter matching 120,000 entries

*Steps*
1. they `POST /api/v1/audit/exports` with `{ "format": "csv", "filter": { "from": "2026-10-01", "to": "2026-10-31" } }`

*Expected results*
1. the API returns 202 with an export id, the file is produced as UTF-8 CSV with BOM containing 120,000 rows plus header, and `GET /api/v1/audit/exports/{id}` returns status `Completed` with a pre-signed URL that expires 24 h after generation

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-10-06: API Action Log

### TS-10-035: POST sale logged with route template; no body/query values

| Field | Value |
|---|---|
| Story | [US-10-06](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-06-api-action-log.md) — API Action Log |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-10-06-AC1 |
| Requirements | FR-10-015, FR-10-016 |

**Story preconditions**
- `platform.api_action_logs` table with monthly partitions exists.

**US-10-06-AC1 — Mutating requests captured without bodies**

*Preconditions / test data*
1. an authenticated Cashier

*Steps*
1. they call `POST /api/v1/branches/{branchId}/sales` and the response is 201

*Expected results*
1. within 10 s an `ApiActionLog` row exists with user, organization, branch, method `POST`, route template `/api/v1/branches/{branchId}/sales`, status 201, duration in ms, correlation id, IP, and user agent, and contains no request/response body or query-string values

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-036: GET and anonymous login not logged

| Field | Value |
|---|---|
| Story | [US-10-06](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-06-api-action-log.md) — API Action Log |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-10-06-AC2 |
| Requirements | FR-10-015, FR-10-016 |

**Story preconditions**
- `platform.api_action_logs` table with monthly partitions exists.

**US-10-06-AC2 — Read requests and anonymous requests not captured**

*Preconditions / test data*
1. a `GET` request and an anonymous `POST /api/v1/auth/login`

*Steps*
1. they complete

*Expected results*
1. no `ApiActionLog` row is created for them (login is covered by audit events)

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-037: 403 attempt logged

| Field | Value |
|---|---|
| Story | [US-10-06](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-06-api-action-log.md) — API Action Log |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-10-06-AC3 |
| Requirements | FR-10-015, FR-10-016 |

**Story preconditions**
- `platform.api_action_logs` table with monthly partitions exists.

**US-10-06-AC3 — Failed attempts captured**

*Preconditions / test data*
1. a Cashier without `inventory.adjustments.create`

*Steps*
1. they `POST` a stock adjustment and receive 403

*Expected results*
1. an `ApiActionLog` row with status 403 exists

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-038: Activity search branch scoping (CS-07); cross-org empty (CS-08); 31-day limit; Cashier 403

| Field | Value |
|---|---|
| Story | [US-10-06](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-06-api-action-log.md) — API Action Log |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-10-06-AC4, US-10-06-AC5 |
| Critical scenario | CS-07, CS-08 |
| Requirements | FR-10-015, FR-10-016 |

**Story preconditions**
- `platform.api_action_logs` table with monthly partitions exists.

**US-10-06-AC4 — Activity search with scoping**

*Preconditions / test data*
1. a Branch Manager with `audit.logs.read` assigned to `CAI01`

*Steps*
1. they call `GET /api/v1/audit/activity?userId=…&from=2026-11-01&to=2026-11-07`

*Expected results*
1. only rows with `BranchId = CAI01` are returned, newest first, cursor-paginated

**US-10-06-AC5 — Range limit, permission and cross-organization (negative)**

*Preconditions / test data*
1. an Owner, a Cashier, and an Owner of another organization

*Steps*
1. the Owner queries 45 days, the Cashier queries 7 days, and the other organization's Owner filters by a user id of this organization

*Expected results*
1. the Owner receives 400 `AUDIT.INVALID_DATE_RANGE`, the Cashier 403 `COMMON.FORBIDDEN`, and the other Owner receives an empty result

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-039: Partition older than 180 days dropped; future partition created

| Field | Value |
|---|---|
| Story | [US-10-06](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-06-api-action-log.md) — API Action Log |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-10-06-AC6 |
| Requirements | FR-10-015, FR-10-016 |

**Story preconditions**
- `platform.api_action_logs` table with monthly partitions exists.

**US-10-06-AC6 — 180-day retention**

*Preconditions / test data*
1. monthly partitions where the newest row of one partition is older than 180 days

*Steps*
1. the daily partition maintenance job runs

*Expected results*
1. that partition is dropped, newer partitions are untouched, and the next month's partition exists in advance

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-10-07: Suspicious Activity Reports

### TS-10-040: 4 voids vs threshold 3 flagged; 3 voids not flagged

| Field | Value |
|---|---|
| Story | [US-10-07](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-07-suspicious-activity-reports.md) — Suspicious Activity Reports |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-10-07-AC1, US-10-07-AC2 |
| Requirements | FR-10-017 |

**Story preconditions**
- Audit events `SALES.SALE_VOIDED`, `SALES.DISCOUNT_OVERRIDE_APPROVED`, `IDENTITY.LOGIN_SUCCEEDED`, `IDENTITY.LOGIN_FAILED` are emitted (US-10-02).
- Settings `SuspiciousVoidsPerCashierPerDay` (3), `SuspiciousDiscountOverridesPerDay` (5), `AuditAfterHoursStart` (23:00), `AuditAfterHoursEnd` (07:00) exist.

**US-10-07-AC1 — Excessive voids flagged**

*Preconditions / test data*
1. cashier C in branch `CAI01` has 4 voided sales on business date 2026-11-08 and the threshold is 3

*Steps*
1. the daily evaluation for 2026-11-08 runs

*Expected results*
1. a finding `ExcessiveVoids` for C, branch `CAI01`, count 4, threshold 3, with links to the 4 audit entries is stored

**US-10-07-AC2 — At threshold is not flagged (negative)**

*Preconditions / test data*
1. cashier D has exactly 3 voids on the same date

*Steps*
1. the evaluation runs

*Expected results*
1. no finding is created for D

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-041: After-hours login across midnight; failed-login burst

| Field | Value |
|---|---|
| Story | [US-10-07](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-07-suspicious-activity-reports.md) — Suspicious Activity Reports |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-10-07-AC3 |
| Requirements | FR-10-017 |

**Story preconditions**
- Audit events `SALES.SALE_VOIDED`, `SALES.DISCOUNT_OVERRIDE_APPROVED`, `IDENTITY.LOGIN_SUCCEEDED`, `IDENTITY.LOGIN_FAILED` are emitted (US-10-02).
- Settings `SuspiciousVoidsPerCashierPerDay` (3), `SuspiciousDiscountOverridesPerDay` (5), `AuditAfterHoursStart` (23:00), `AuditAfterHoursEnd` (07:00) exist.

**US-10-07-AC3 — After-hours login and failed-login burst**

*Preconditions / test data*
1. a successful login at 23:40 Cairo time in a branch using the default window, and 5 failed logins for user E within 12 minutes

*Steps*
1. the evaluation runs

*Expected results*
1. findings `AfterHoursLogin` and `FailedLoginBurst` are created with the source entries linked

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-042: One notification per Owner per date; idempotent rerun

| Field | Value |
|---|---|
| Story | [US-10-07](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-07-suspicious-activity-reports.md) — Suspicious Activity Reports |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-10-07-AC4 |
| Requirements | FR-10-017 |

**Story preconditions**
- Audit events `SALES.SALE_VOIDED`, `SALES.DISCOUNT_OVERRIDE_APPROVED`, `IDENTITY.LOGIN_SUCCEEDED`, `IDENTITY.LOGIN_FAILED` are emitted (US-10-02).
- Settings `SuspiciousVoidsPerCashierPerDay` (3), `SuspiciousDiscountOverridesPerDay` (5), `AuditAfterHoursStart` (23:00), `AuditAfterHoursEnd` (07:00) exist.

**US-10-07-AC4 — Daily notification to Owners**

*Preconditions / test data*
1. ≥ 1 finding for the organization on 2026-11-08

*Steps*
1. the evaluation completes

*Expected results*
1. exactly one `SUSPICIOUS_ACTIVITY_DETECTED` notification per Owner is created for that business date, and rerunning the evaluation creates no duplicate

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-043: Manager 403; cross-org isolation (CS-08)

| Field | Value |
|---|---|
| Story | [US-10-07](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-07-suspicious-activity-reports.md) — Suspicious Activity Reports |
| Type / Execution | Security / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-10-07-AC5 |
| Critical scenario | CS-08 |
| Requirements | FR-10-017 |

**Story preconditions**
- Audit events `SALES.SALE_VOIDED`, `SALES.DISCOUNT_OVERRIDE_APPROVED`, `IDENTITY.LOGIN_SUCCEEDED`, `IDENTITY.LOGIN_FAILED` are emitted (US-10-02).
- Settings `SuspiciousVoidsPerCashierPerDay` (3), `SuspiciousDiscountOverridesPerDay` (5), `AuditAfterHoursStart` (23:00), `AuditAfterHoursEnd` (07:00) exist.

**US-10-07-AC5 — Report access control**

*Preconditions / test data*
1. a Branch Manager without `audit.reports.read`, and an Owner of another organization

*Steps*
1. they call `GET /api/v1/audit/reports/suspicious-activity?date=2026-11-08`

*Expected results*
1. the Manager receives 403 `COMMON.FORBIDDEN` and the other organization's Owner receives no findings of this organization

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-10-08: Notification Store, Default Routing, and Notification Center API

### TS-10-044: New organization has one default rule per type

| Field | Value |
|---|---|
| Story | [US-10-08](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-08-notification-store-and-center-api.md) — Notification Store, Default Routing, and Notification Center API |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-08-AC1 |
| Requirements | FR-10-018, FR-10-019, FR-10-020, FR-10-021, FR-10-022, FR-10-023, FR-10-024 |

**Story preconditions**
- `Notification`, `NotificationRecipient`, `NotificationRule` tables exist.
- Users, roles, and branch assignments exist (SPEC-01/02).

**US-10-08-AC1 — Default rules seeded for new organizations**

*Preconditions / test data*
1. a new organization is created

*Steps*
1. provisioning completes

*Expected results*
1. one organization-level `NotificationRule` per type in SPEC-10 §8.2 exists with the default recipient roles, `Enabled = true`, `DeliveryMode = Immediate`, `Channels = [InApp]`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-045: Recipient resolution excludes other-branch, deactivated, and unpermitted users

| Field | Value |
|---|---|
| Story | [US-10-08](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-08-notification-store-and-center-api.md) — Notification Store, Default Routing, and Notification Center API |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-08-AC2 |
| Requirements | FR-10-018, FR-10-019, FR-10-020, FR-10-021, FR-10-022, FR-10-023, FR-10-024 |

**Story preconditions**
- `Notification`, `NotificationRecipient`, `NotificationRule` tables exist.
- Users, roles, and branch assignments exist (SPEC-01/02).

**US-10-08-AC2 — Recipient resolution respects branch and permission**

*Preconditions / test data*
1. a `LOW_STOCK` notification for branch `CAI01`
2. Manager M1 assigned to `CAI01`
3. Manager M2 assigned only to `ALX02`
4. Inventory user I1 assigned to `CAI01` but deactivated
5. a custom role user U assigned to `CAI01` without `inventory.stock.read`

*Steps*
1. the notification is created

*Expected results*
1. a `NotificationRecipient` with status `Unread` exists only for M1 (and any other eligible users), not for M2, I1, or U

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-046: Same keys/params for ar and en users; no stored rendered text

| Field | Value |
|---|---|
| Story | [US-10-08](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-08-notification-store-and-center-api.md) — Notification Store, Default Routing, and Notification Center API |
| Type / Execution | API / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-08-AC3 |
| Requirements | FR-10-018, FR-10-019, FR-10-020, FR-10-021, FR-10-022, FR-10-023, FR-10-024 |

**Story preconditions**
- `Notification`, `NotificationRecipient`, `NotificationRule` tables exist.
- Users, roles, and branch assignments exist (SPEC-01/02).

**US-10-08-AC3 — Localization at display time**

*Preconditions / test data*
1. a notification stored with `titleKey` and parameters

*Steps*
1. user A (language `ar`) and user B (language `en`) list their notifications

*Expected results*
1. the API returns the same keys and parameters for both and the UI renders Arabic text for A and English text for B
2. no rendered text is stored

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-047: List pagination and per-branch unread counts

| Field | Value |
|---|---|
| Story | [US-10-08](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-08-notification-store-and-center-api.md) — Notification Store, Default Routing, and Notification Center API |
| Type / Execution | API / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-08-AC4 |
| Requirements | FR-10-018, FR-10-019, FR-10-020, FR-10-021, FR-10-022, FR-10-023, FR-10-024 |

**Story preconditions**
- `Notification`, `NotificationRecipient`, `NotificationRule` tables exist.
- Users, roles, and branch assignments exist (SPEC-01/02).

**US-10-08-AC4 — List and unread count**

*Preconditions / test data*
1. user A has 30 `Unread`, 10 `Read`, and 5 `Dismissed` notifications across branches `CAI01` and `ALX02`

*Steps*
1. A calls `GET /api/v1/notifications?limit=20` and `GET /api/v1/notifications/unread-count`

*Expected results*
1. the list returns 20 of the 40 non-dismissed items newest first with a `nextCursor`, and the count returns `{ "total": 30, "byBranch": { "<CAI01>": n1, "<ALX02>": n2 } }` with n1 + n2 = 30

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-048: Idempotent read, dismiss, branch-filtered read-all

| Field | Value |
|---|---|
| Story | [US-10-08](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-08-notification-store-and-center-api.md) — Notification Store, Default Routing, and Notification Center API |
| Type / Execution | API / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-08-AC5 |
| Requirements | FR-10-018, FR-10-019, FR-10-020, FR-10-021, FR-10-022, FR-10-023, FR-10-024 |

**Story preconditions**
- `Notification`, `NotificationRecipient`, `NotificationRule` tables exist.
- Users, roles, and branch assignments exist (SPEC-01/02).

**US-10-08-AC5 — Mark read, mark all read, dismiss — idempotent transitions**

*Preconditions / test data*
1. user A has an `Unread` notification N

*Steps*
1. A posts `/notifications/{N}/read` twice, then `/notifications/{N}/dismiss`, then `/notifications/read-all?branchId=<CAI01>`

*Expected results*
1. both read calls return 204 and N is `Read` with one `ReadAt`
2. dismiss returns 204 and N is `Dismissed`
3. read-all sets all of A's `Unread` notifications in `CAI01` to `Read` and leaves `ALX02` unchanged

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-049: Dismissed → read returns 409

| Field | Value |
|---|---|
| Story | [US-10-08](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-08-notification-store-and-center-api.md) — Notification Store, Default Routing, and Notification Center API |
| Type / Execution | API / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-08-AC6 |
| Requirements | FR-10-018, FR-10-019, FR-10-020, FR-10-021, FR-10-022, FR-10-023, FR-10-024 |

**Story preconditions**
- `Notification`, `NotificationRecipient`, `NotificationRule` tables exist.
- Users, roles, and branch assignments exist (SPEC-01/02).

**US-10-08-AC6 — Invalid transition (negative)**

*Preconditions / test data*
1. notification N is `Dismissed`

*Steps*
1. A posts `/notifications/{N}/read`

*Expected results*
1. the API returns 409 `NOTIFICATIONS.INVALID_STATUS_TRANSITION`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-050: Other user's and other org's notification ids return 404 (CS-08)

| Field | Value |
|---|---|
| Story | [US-10-08](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-08-notification-store-and-center-api.md) — Notification Store, Default Routing, and Notification Center API |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-10-08-AC7 |
| Critical scenario | CS-08 |
| Requirements | FR-10-018, FR-10-019, FR-10-020, FR-10-021, FR-10-022, FR-10-023, FR-10-024 |

**Story preconditions**
- `Notification`, `NotificationRecipient`, `NotificationRule` tables exist.
- Users, roles, and branch assignments exist (SPEC-01/02).

**US-10-08-AC7 — Other users' notifications are invisible**

*Preconditions / test data*
1. notification N2 addressed only to user B in the same organization, and N3 in another organization

*Steps*
1. user A posts `/notifications/{N2}/read` and `/notifications/{N3}/dismiss`

*Expected results*
1. both return 404 `NOTIFICATIONS.NOT_FOUND` and neither record changes

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-051: Missing `notifications.read` → 403

| Field | Value |
|---|---|
| Story | [US-10-08](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-08-notification-store-and-center-api.md) — Notification Store, Default Routing, and Notification Center API |
| Type / Execution | API / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-08-AC8 |
| Requirements | FR-10-018, FR-10-019, FR-10-020, FR-10-021, FR-10-022, FR-10-023, FR-10-024 |

**Story preconditions**
- `Notification`, `NotificationRecipient`, `NotificationRule` tables exist.
- Users, roles, and branch assignments exist (SPEC-01/02).

**US-10-08-AC8 — Permission denied**

*Preconditions / test data*
1. a user whose custom role lacks `notifications.read`

*Steps*
1. they call `GET /api/v1/notifications`

*Expected results*
1. the API returns 403 `COMMON.FORBIDDEN`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-052: Purge deletes > 90 days, keeps 89-day-old

| Field | Value |
|---|---|
| Story | [US-10-08](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-08-notification-store-and-center-api.md) — Notification Store, Default Routing, and Notification Center API |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-08-AC9 |
| Requirements | FR-10-018, FR-10-019, FR-10-020, FR-10-021, FR-10-022, FR-10-023, FR-10-024 |

**Story preconditions**
- `Notification`, `NotificationRecipient`, `NotificationRule` tables exist.
- Users, roles, and branch assignments exist (SPEC-01/02).

**US-10-08-AC9 — 90-day retention purge**

*Preconditions / test data*
1. notifications created 91 days ago and 89 days ago

*Steps*
1. the daily purge at 03:00 `Africa/Cairo` runs

*Expected results*
1. the 91-day-old notifications and their recipient records are deleted in batches of ≤ 5,000 and the 89-day-old ones remain

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-053: Unread count p95 ≤ 100 ms, list p95 ≤ 300 ms at 10,000 records/user (NFR-10-003)

| Field | Value |
|---|---|
| Story | [US-10-08](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-08-notification-store-and-center-api.md) — Notification Store, Default Routing, and Notification Center API |
| Type / Execution | Performance / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-08-AC4 |
| Requirements | FR-10-018, FR-10-019, FR-10-020, FR-10-021, FR-10-022, FR-10-023, FR-10-024 |

**Story preconditions**
- `Notification`, `NotificationRecipient`, `NotificationRule` tables exist.
- Users, roles, and branch assignments exist (SPEC-01/02).

**US-10-08-AC4 — List and unread count**

*Preconditions / test data*
1. user A has 30 `Unread`, 10 `Read`, and 5 `Dismissed` notifications across branches `CAI01` and `ALX02`

*Steps*
1. A calls `GET /api/v1/notifications?limit=20` and `GET /api/v1/notifications/unread-count`

*Expected results*
1. the list returns 20 of the 40 non-dismissed items newest first with a `nextCursor`, and the count returns `{ "total": 30, "byBranch": { "<CAI01>": n1, "<ALX02>": n2 } }` with n1 + n2 = 30

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-10-09: Low-Stock and Expiry Notifications

### TS-10-054: Reference values/required behavior and reconciliation (FR-10-025, FR-10-026)

| Field | Value |
|---|---|
| Story | [US-10-09](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-09-low-stock-and-expiry-notifications.md) — Low-Stock and Expiry Notifications |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-09-AC1 |
| Requirements | FR-10-025, FR-10-026 |

**Story preconditions**
- Source entities and settings required by FR-10-025, FR-10-026 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-09-AC1 — Required behavior and boundaries**

*Preconditions / test data*
1. Given source events/records matching the required rules in FR-10-025, FR-10-026, with one item deliberately outside the effective scope.

*Steps*
1. an authorized caller uses the capability for the scope defined by FR-10-025, FR-10-026

*Expected results*
1. the system applies each requirement in FR-10-025, FR-10-026
2. monetary values, where present, use decimal arithmetic and 2-decimal AwayFromZero rounding. No out-of-scope row contributes to returned totals.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-055: Negative validation boundary causes no partial effect; spec-defined error (SETTINGS.INVALID_VALUE)

| Field | Value |
|---|---|
| Story | [US-10-09](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-09-low-stock-and-expiry-notifications.md) — Low-Stock and Expiry Notifications |
| Type / Execution | API / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-09-AC2 |
| Requirements | FR-10-025, FR-10-026 |

**Story preconditions**
- Source entities and settings required by FR-10-025, FR-10-026 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-09-AC2 — Invalid or prohibited input (negative)**

*Preconditions / test data*
1. a caller submits an unsupported value, exceeds a stated limit, or attempts a prohibited transition in FR-10-025, FR-10-026

*Steps*
1. the request is processed

*Expected results*
1. the request is rejected with the spec-defined validation error and no partial business change is committed.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-056: Missing permission and branch mismatch return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-10-09](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-09-low-stock-and-expiry-notifications.md) — Low-Stock and Expiry Notifications |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-10-09-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-10-025, FR-10-026 |

**Story preconditions**
- Source entities and settings required by FR-10-025, FR-10-026 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-09-AC3 — Permission denied**

*Preconditions / test data*
1. a caller lacks `notifications.read` or is assigned to a different branch in the same organization

*Steps*
1. they request or change this capability

*Expected results*
1. the API returns 403 `COMMON.FORBIDDEN` and returns no restricted data.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-057: Other organization returns 404 and no data (CS-08)

| Field | Value |
|---|---|
| Story | [US-10-09](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-09-low-stock-and-expiry-notifications.md) — Low-Stock and Expiry Notifications |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-10-09-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-10-025, FR-10-026 |

**Story preconditions**
- Source entities and settings required by FR-10-025, FR-10-026 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-09-AC4 — Cross-organization isolation**

*Preconditions / test data*
1. the requested organization-owned resource belongs to another organization

*Steps*
1. the caller requests it

*Expected results*
1. the API returns 404 `COMMON.NOT_FOUND` with no existence or data disclosure (CS-08).

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-10-10: Operational Event Notifications

### TS-10-058: Reference values/required behavior and reconciliation (FR-10-027)

| Field | Value |
|---|---|
| Story | [US-10-10](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-10-operational-event-notifications.md) — Operational Event Notifications |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-10-10-AC1 |
| Requirements | FR-10-027 |

**Story preconditions**
- Source entities and settings required by FR-10-027 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-10-AC1 — Required behavior and boundaries**

*Preconditions / test data*
1. Given source events/records matching the required rules in FR-10-027, with one item deliberately outside the effective scope.

*Steps*
1. an authorized caller uses the capability for the scope defined by FR-10-027

*Expected results*
1. the system applies each requirement in FR-10-027
2. monetary values, where present, use decimal arithmetic and 2-decimal AwayFromZero rounding. No out-of-scope row contributes to returned totals.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-059: Negative validation boundary causes no partial effect; spec-defined error (SETTINGS.INVALID_VALUE)

| Field | Value |
|---|---|
| Story | [US-10-10](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-10-operational-event-notifications.md) — Operational Event Notifications |
| Type / Execution | API / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-10-10-AC2 |
| Requirements | FR-10-027 |

**Story preconditions**
- Source entities and settings required by FR-10-027 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-10-AC2 — Invalid or prohibited input (negative)**

*Preconditions / test data*
1. a caller submits an unsupported value, exceeds a stated limit, or attempts a prohibited transition in FR-10-027

*Steps*
1. the request is processed

*Expected results*
1. the request is rejected with the spec-defined validation error and no partial business change is committed.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-060: Missing permission and branch mismatch return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-10-10](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-10-operational-event-notifications.md) — Operational Event Notifications |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-10-10-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-10-027 |

**Story preconditions**
- Source entities and settings required by FR-10-027 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-10-AC3 — Permission denied**

*Preconditions / test data*
1. a caller lacks `notifications.read` or is assigned to a different branch in the same organization

*Steps*
1. they request or change this capability

*Expected results*
1. the API returns 403 `COMMON.FORBIDDEN` and returns no restricted data.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-061: Other organization returns 404 and no data (CS-08)

| Field | Value |
|---|---|
| Story | [US-10-10](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-10-operational-event-notifications.md) — Operational Event Notifications |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-10-10-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-10-027 |

**Story preconditions**
- Source entities and settings required by FR-10-027 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-10-AC4 — Cross-organization isolation**

*Preconditions / test data*
1. the requested organization-owned resource belongs to another organization

*Steps*
1. the caller requests it

*Expected results*
1. the API returns 404 `COMMON.NOT_FOUND` with no existence or data disclosure (CS-08).

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-10-11: Notification Rule Management

### TS-10-062: Reference values/required behavior and reconciliation (FR-10-028)

| Field | Value |
|---|---|
| Story | [US-10-11](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-11-notification-rule-management.md) — Notification Rule Management |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-10-11-AC1 |
| Requirements | FR-10-028 |

**Story preconditions**
- Source entities and settings required by FR-10-028 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-11-AC1 — Required behavior and boundaries**

*Preconditions / test data*
1. Given source events/records matching the required rules in FR-10-028, with one item deliberately outside the effective scope.

*Steps*
1. an authorized caller uses the capability for the scope defined by FR-10-028

*Expected results*
1. the system applies each requirement in FR-10-028
2. monetary values, where present, use decimal arithmetic and 2-decimal AwayFromZero rounding. No out-of-scope row contributes to returned totals.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-063: Negative validation boundary causes no partial effect; spec-defined error (SETTINGS.INVALID_VALUE)

| Field | Value |
|---|---|
| Story | [US-10-11](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-11-notification-rule-management.md) — Notification Rule Management |
| Type / Execution | API / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-10-11-AC2 |
| Requirements | FR-10-028 |

**Story preconditions**
- Source entities and settings required by FR-10-028 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-11-AC2 — Invalid or prohibited input (negative)**

*Preconditions / test data*
1. a caller submits an unsupported value, exceeds a stated limit, or attempts a prohibited transition in FR-10-028

*Steps*
1. the request is processed

*Expected results*
1. the request is rejected with the spec-defined validation error and no partial business change is committed.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-064: Missing permission and branch mismatch return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-10-11](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-11-notification-rule-management.md) — Notification Rule Management |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-10-11-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-10-028 |

**Story preconditions**
- Source entities and settings required by FR-10-028 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-11-AC3 — Permission denied**

*Preconditions / test data*
1. a caller lacks `notifications.rules.manage` or is assigned to a different branch in the same organization

*Steps*
1. they request or change this capability

*Expected results*
1. the API returns 403 `COMMON.FORBIDDEN` and returns no restricted data.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-065: Other organization returns 404 and no data (CS-08)

| Field | Value |
|---|---|
| Story | [US-10-11](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-11-notification-rule-management.md) — Notification Rule Management |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-10-11-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-10-028 |

**Story preconditions**
- Source entities and settings required by FR-10-028 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-11-AC4 — Cross-organization isolation**

*Preconditions / test data*
1. the requested organization-owned resource belongs to another organization

*Steps*
1. the caller requests it

*Expected results*
1. the API returns 404 `COMMON.NOT_FOUND` with no existence or data disclosure (CS-08).

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-10-12: Real-Time Notification Delivery and Recovery

### TS-10-066: Reference values/required behavior and reconciliation (FR-10-029, FR-10-030, FR-10-031)

| Field | Value |
|---|---|
| Story | [US-10-12](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-12-real-time-notification-delivery.md) — Real-Time Notification Delivery and Recovery |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-10-12-AC1 |
| Requirements | FR-10-029, FR-10-030, FR-10-031 |

**Story preconditions**
- Source entities and settings required by FR-10-029, FR-10-030, FR-10-031 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-12-AC1 — Required behavior and boundaries**

*Preconditions / test data*
1. Given source events/records matching the required rules in FR-10-029, FR-10-030, FR-10-031, with one item deliberately outside the effective scope.

*Steps*
1. an authorized caller uses the capability for the scope defined by FR-10-029, FR-10-030, FR-10-031

*Expected results*
1. the system applies each requirement in FR-10-029, FR-10-030, FR-10-031
2. monetary values, where present, use decimal arithmetic and 2-decimal AwayFromZero rounding. No out-of-scope row contributes to returned totals.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-067: Negative validation boundary causes no partial effect; spec-defined error (SETTINGS.INVALID_VALUE)

| Field | Value |
|---|---|
| Story | [US-10-12](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-12-real-time-notification-delivery.md) — Real-Time Notification Delivery and Recovery |
| Type / Execution | API / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-10-12-AC2 |
| Requirements | FR-10-029, FR-10-030, FR-10-031 |

**Story preconditions**
- Source entities and settings required by FR-10-029, FR-10-030, FR-10-031 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-12-AC2 — Invalid or prohibited input (negative)**

*Preconditions / test data*
1. a caller submits an unsupported value, exceeds a stated limit, or attempts a prohibited transition in FR-10-029, FR-10-030, FR-10-031

*Steps*
1. the request is processed

*Expected results*
1. the request is rejected with the spec-defined validation error and no partial business change is committed.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-068: Missing permission and branch mismatch return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-10-12](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-12-real-time-notification-delivery.md) — Real-Time Notification Delivery and Recovery |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-10-12-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-10-029, FR-10-030, FR-10-031 |

**Story preconditions**
- Source entities and settings required by FR-10-029, FR-10-030, FR-10-031 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-12-AC3 — Permission denied**

*Preconditions / test data*
1. a caller lacks `notifications.read` or is assigned to a different branch in the same organization

*Steps*
1. they request or change this capability

*Expected results*
1. the API returns 403 `COMMON.FORBIDDEN` and returns no restricted data.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-069: Other organization returns 404 and no data (CS-08)

| Field | Value |
|---|---|
| Story | [US-10-12](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-12-real-time-notification-delivery.md) — Real-Time Notification Delivery and Recovery |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-10-12-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-10-029, FR-10-030, FR-10-031 |

**Story preconditions**
- Source entities and settings required by FR-10-029, FR-10-030, FR-10-031 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-12-AC4 — Cross-organization isolation**

*Preconditions / test data*
1. the requested organization-owned resource belongs to another organization

*Steps*
1. the caller requests it

*Expected results*
1. the API returns 404 `COMMON.NOT_FOUND` with no existence or data disclosure (CS-08).

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-10-13: Notification Center Interface

### TS-10-070: Reference values/required behavior and reconciliation (FR-10-032)

| Field | Value |
|---|---|
| Story | [US-10-13](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-13-notification-center-interface.md) — Notification Center Interface |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-13-AC1 |
| Requirements | FR-10-032 |

**Story preconditions**
- Source entities and settings required by FR-10-032 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-13-AC1 — Required behavior and boundaries**

*Preconditions / test data*
1. Given source events/records matching the required rules in FR-10-032, with one item deliberately outside the effective scope.

*Steps*
1. an authorized caller uses the capability for the scope defined by FR-10-032

*Expected results*
1. the system applies each requirement in FR-10-032
2. monetary values, where present, use decimal arithmetic and 2-decimal AwayFromZero rounding. No out-of-scope row contributes to returned totals.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-071: Negative validation boundary causes no partial effect; spec-defined error (SETTINGS.INVALID_VALUE)

| Field | Value |
|---|---|
| Story | [US-10-13](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-13-notification-center-interface.md) — Notification Center Interface |
| Type / Execution | API / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-13-AC2 |
| Requirements | FR-10-032 |

**Story preconditions**
- Source entities and settings required by FR-10-032 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-13-AC2 — Invalid or prohibited input (negative)**

*Preconditions / test data*
1. a caller submits an unsupported value, exceeds a stated limit, or attempts a prohibited transition in FR-10-032

*Steps*
1. the request is processed

*Expected results*
1. the request is rejected with the spec-defined validation error and no partial business change is committed.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-072: Missing permission and branch mismatch return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-10-13](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-13-notification-center-interface.md) — Notification Center Interface |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-10-13-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-10-032 |

**Story preconditions**
- Source entities and settings required by FR-10-032 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-13-AC3 — Permission denied**

*Preconditions / test data*
1. a caller lacks `notifications.read` or is assigned to a different branch in the same organization

*Steps*
1. they request or change this capability

*Expected results*
1. the API returns 403 `COMMON.FORBIDDEN` and returns no restricted data.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-073: Other organization returns 404 and no data (CS-08)

| Field | Value |
|---|---|
| Story | [US-10-13](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-13-notification-center-interface.md) — Notification Center Interface |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-10-13-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-10-032 |

**Story preconditions**
- Source entities and settings required by FR-10-032 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-13-AC4 — Cross-organization isolation**

*Preconditions / test data*
1. the requested organization-owned resource belongs to another organization

*Steps*
1. the caller requests it

*Expected results*
1. the API returns 404 `COMMON.NOT_FOUND` with no existence or data disclosure (CS-08).

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-10-14: Platform Announcements

### TS-10-074: Reference values/required behavior and reconciliation (FR-10-033)

| Field | Value |
|---|---|
| Story | [US-10-14](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-14-platform-announcements.md) — Platform Announcements |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-10-14-AC1 |
| Requirements | FR-10-033 |

**Story preconditions**
- Source entities and settings required by FR-10-033 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-14-AC1 — Required behavior and boundaries**

*Preconditions / test data*
1. Given source events/records matching the required rules in FR-10-033, with one item deliberately outside the effective scope.

*Steps*
1. an authorized caller uses the capability for the scope defined by FR-10-033

*Expected results*
1. the system applies each requirement in FR-10-033
2. monetary values, where present, use decimal arithmetic and 2-decimal AwayFromZero rounding. No out-of-scope row contributes to returned totals.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-075: Negative validation boundary causes no partial effect; spec-defined error (SETTINGS.INVALID_VALUE)

| Field | Value |
|---|---|
| Story | [US-10-14](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-14-platform-announcements.md) — Platform Announcements |
| Type / Execution | API / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-10-14-AC2 |
| Requirements | FR-10-033 |

**Story preconditions**
- Source entities and settings required by FR-10-033 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-14-AC2 — Invalid or prohibited input (negative)**

*Preconditions / test data*
1. a caller submits an unsupported value, exceeds a stated limit, or attempts a prohibited transition in FR-10-033

*Steps*
1. the request is processed

*Expected results*
1. the request is rejected with the spec-defined validation error and no partial business change is committed.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-076: Missing permission and branch mismatch return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-10-14](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-14-platform-announcements.md) — Platform Announcements |
| Type / Execution | Security / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-10-14-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-10-033 |

**Story preconditions**
- Source entities and settings required by FR-10-033 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-14-AC3 — Permission denied**

*Preconditions / test data*
1. a caller lacks `notifications.system.manage` or is assigned to a different branch in the same organization

*Steps*
1. they request or change this capability

*Expected results*
1. the API returns 403 `COMMON.FORBIDDEN` and returns no restricted data.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-077: Other organization returns 404 and no data (CS-08)

| Field | Value |
|---|---|
| Story | [US-10-14](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-14-platform-announcements.md) — Platform Announcements |
| Type / Execution | Security / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-10-14-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-10-033 |

**Story preconditions**
- Source entities and settings required by FR-10-033 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-14-AC4 — Cross-organization isolation**

*Preconditions / test data*
1. the requested organization-owned resource belongs to another organization

*Steps*
1. the caller requests it

*Expected results*
1. the API returns 404 `COMMON.NOT_FOUND` with no existence or data disclosure (CS-08).

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-10-15: Email and Digest Notifications

### TS-10-078: Reference values/required behavior and reconciliation (FR-10-034, FR-10-035)

| Field | Value |
|---|---|
| Story | [US-10-15](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-15-email-and-digest-notifications.md) — Email and Digest Notifications |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-10-15-AC1 |
| Requirements | FR-10-034, FR-10-035 |

**Story preconditions**
- Source entities and settings required by FR-10-034, FR-10-035 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-15-AC1 — Required behavior and boundaries**

*Preconditions / test data*
1. Given source events/records matching the required rules in FR-10-034, FR-10-035, with one item deliberately outside the effective scope.

*Steps*
1. an authorized caller uses the capability for the scope defined by FR-10-034, FR-10-035

*Expected results*
1. the system applies each requirement in FR-10-034, FR-10-035
2. monetary values, where present, use decimal arithmetic and 2-decimal AwayFromZero rounding. No out-of-scope row contributes to returned totals.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-079: Negative validation boundary causes no partial effect; spec-defined error (SETTINGS.INVALID_VALUE)

| Field | Value |
|---|---|
| Story | [US-10-15](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-15-email-and-digest-notifications.md) — Email and Digest Notifications |
| Type / Execution | API / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-10-15-AC2 |
| Requirements | FR-10-034, FR-10-035 |

**Story preconditions**
- Source entities and settings required by FR-10-034, FR-10-035 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-15-AC2 — Invalid or prohibited input (negative)**

*Preconditions / test data*
1. a caller submits an unsupported value, exceeds a stated limit, or attempts a prohibited transition in FR-10-034, FR-10-035

*Steps*
1. the request is processed

*Expected results*
1. the request is rejected with the spec-defined validation error and no partial business change is committed.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-080: Missing permission and branch mismatch return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-10-15](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-15-email-and-digest-notifications.md) — Email and Digest Notifications |
| Type / Execution | Security / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-10-15-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-10-034, FR-10-035 |

**Story preconditions**
- Source entities and settings required by FR-10-034, FR-10-035 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-15-AC3 — Permission denied**

*Preconditions / test data*
1. a caller lacks `notifications.rules.manage` or is assigned to a different branch in the same organization

*Steps*
1. they request or change this capability

*Expected results*
1. the API returns 403 `COMMON.FORBIDDEN` and returns no restricted data.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-081: Other organization returns 404 and no data (CS-08)

| Field | Value |
|---|---|
| Story | [US-10-15](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-15-email-and-digest-notifications.md) — Email and Digest Notifications |
| Type / Execution | Security / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-10-15-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-10-034, FR-10-035 |

**Story preconditions**
- Source entities and settings required by FR-10-034, FR-10-035 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-15-AC4 — Cross-organization isolation**

*Preconditions / test data*
1. the requested organization-owned resource belongs to another organization

*Steps*
1. the caller requests it

*Expected results*
1. the API returns 404 `COMMON.NOT_FOUND` with no existence or data disclosure (CS-08).

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-10-16: Customer Refill Reminders

### TS-10-082: Reference values/required behavior and reconciliation (FR-10-036)

| Field | Value |
|---|---|
| Story | [US-10-16](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-16-customer-refill-reminders.md) — Customer Refill Reminders |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P3) |
| Release | Future |
| Covers | US-10-16-AC1 |
| Requirements | FR-10-036 |

**Story preconditions**
- Source entities and settings required by FR-10-036 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-16-AC1 — Required behavior and boundaries**

*Preconditions / test data*
1. Given source events/records matching the required rules in FR-10-036, with one item deliberately outside the effective scope.

*Steps*
1. an authorized caller uses the capability for the scope defined by FR-10-036

*Expected results*
1. the system applies each requirement in FR-10-036
2. monetary values, where present, use decimal arithmetic and 2-decimal AwayFromZero rounding. No out-of-scope row contributes to returned totals.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-083: Negative validation boundary causes no partial effect; spec-defined error (SETTINGS.INVALID_VALUE)

| Field | Value |
|---|---|
| Story | [US-10-16](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-16-customer-refill-reminders.md) — Customer Refill Reminders |
| Type / Execution | API / Automated |
| Priority | T3 (story P3) |
| Release | Future |
| Covers | US-10-16-AC2 |
| Requirements | FR-10-036 |

**Story preconditions**
- Source entities and settings required by FR-10-036 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-16-AC2 — Invalid or prohibited input (negative)**

*Preconditions / test data*
1. a caller submits an unsupported value, exceeds a stated limit, or attempts a prohibited transition in FR-10-036

*Steps*
1. the request is processed

*Expected results*
1. the request is rejected with the spec-defined validation error and no partial business change is committed.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-084: Missing permission and branch mismatch return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-10-16](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-16-customer-refill-reminders.md) — Customer Refill Reminders |
| Type / Execution | Security / Automated |
| Priority | T3 (story P3) |
| Release | Future |
| Covers | US-10-16-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-10-036 |

**Story preconditions**
- Source entities and settings required by FR-10-036 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-16-AC3 — Permission denied**

*Preconditions / test data*
1. a caller lacks `notifications.rules.manage` or is assigned to a different branch in the same organization

*Steps*
1. they request or change this capability

*Expected results*
1. the API returns 403 `COMMON.FORBIDDEN` and returns no restricted data.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-085: Other organization returns 404 and no data (CS-08)

| Field | Value |
|---|---|
| Story | [US-10-16](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-16-customer-refill-reminders.md) — Customer Refill Reminders |
| Type / Execution | Security / Automated |
| Priority | T3 (story P3) |
| Release | Future |
| Covers | US-10-16-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-10-036 |

**Story preconditions**
- Source entities and settings required by FR-10-036 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-16-AC4 — Cross-organization isolation**

*Preconditions / test data*
1. the requested organization-owned resource belongs to another organization

*Steps*
1. the caller requests it

*Expected results*
1. the API returns 404 `COMMON.NOT_FOUND` with no existence or data disclosure (CS-08).

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-10-17: Settings Registry and Resolution

### TS-10-086: Reference values/required behavior and reconciliation (FR-10-037, FR-10-038, FR-10-039)

| Field | Value |
|---|---|
| Story | [US-10-17](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-17-settings-registry-and-resolution.md) — Settings Registry and Resolution |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-17-AC1 |
| Requirements | FR-10-037, FR-10-038, FR-10-039 |

**Story preconditions**
- Source entities and settings required by FR-10-037, FR-10-038, FR-10-039 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-17-AC1 — Required behavior and boundaries**

*Preconditions / test data*
1. Given source events/records matching the required rules in FR-10-037, FR-10-038, FR-10-039, with one item deliberately outside the effective scope.

*Steps*
1. an authorized caller uses the capability for the scope defined by FR-10-037, FR-10-038, FR-10-039

*Expected results*
1. the system applies each requirement in FR-10-037, FR-10-038, FR-10-039
2. monetary values, where present, use decimal arithmetic and 2-decimal AwayFromZero rounding. No out-of-scope row contributes to returned totals.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-087: Negative validation boundary causes no partial effect; spec-defined error (SETTINGS.INVALID_VALUE)

| Field | Value |
|---|---|
| Story | [US-10-17](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-17-settings-registry-and-resolution.md) — Settings Registry and Resolution |
| Type / Execution | API / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-17-AC2 |
| Requirements | FR-10-037, FR-10-038, FR-10-039 |

**Story preconditions**
- Source entities and settings required by FR-10-037, FR-10-038, FR-10-039 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-17-AC2 — Invalid or prohibited input (negative)**

*Preconditions / test data*
1. a caller submits an unsupported value, exceeds a stated limit, or attempts a prohibited transition in FR-10-037, FR-10-038, FR-10-039

*Steps*
1. the request is processed

*Expected results*
1. the request is rejected with the spec-defined validation error and no partial business change is committed.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-088: Missing permission and branch mismatch return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-10-17](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-17-settings-registry-and-resolution.md) — Settings Registry and Resolution |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-10-17-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-10-037, FR-10-038, FR-10-039 |

**Story preconditions**
- Source entities and settings required by FR-10-037, FR-10-038, FR-10-039 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-17-AC3 — Permission denied**

*Preconditions / test data*
1. a caller lacks `settings.organization.manage` or is assigned to a different branch in the same organization

*Steps*
1. they request or change this capability

*Expected results*
1. the API returns 403 `COMMON.FORBIDDEN` and returns no restricted data.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-089: Other organization returns 404 and no data (CS-08)

| Field | Value |
|---|---|
| Story | [US-10-17](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-17-settings-registry-and-resolution.md) — Settings Registry and Resolution |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-10-17-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-10-037, FR-10-038, FR-10-039 |

**Story preconditions**
- Source entities and settings required by FR-10-037, FR-10-038, FR-10-039 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-17-AC4 — Cross-organization isolation**

*Preconditions / test data*
1. the requested organization-owned resource belongs to another organization

*Steps*
1. the caller requests it

*Expected results*
1. the API returns 404 `COMMON.NOT_FOUND` with no existence or data disclosure (CS-08).

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-10-18: Organization Settings

### TS-10-090: Reference values/required behavior and reconciliation (FR-10-040, FR-10-041)

| Field | Value |
|---|---|
| Story | [US-10-18](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-18-organization-settings.md) — Organization Settings |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-18-AC1 |
| Requirements | FR-10-040, FR-10-041 |

**Story preconditions**
- Source entities and settings required by FR-10-040, FR-10-041 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-18-AC1 — Required behavior and boundaries**

*Preconditions / test data*
1. Given source events/records matching the required rules in FR-10-040, FR-10-041, with one item deliberately outside the effective scope.

*Steps*
1. an authorized caller uses the capability for the scope defined by FR-10-040, FR-10-041

*Expected results*
1. the system applies each requirement in FR-10-040, FR-10-041
2. monetary values, where present, use decimal arithmetic and 2-decimal AwayFromZero rounding. No out-of-scope row contributes to returned totals.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-091: Negative validation boundary causes no partial effect; spec-defined error (SETTINGS.INVALID_VALUE)

| Field | Value |
|---|---|
| Story | [US-10-18](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-18-organization-settings.md) — Organization Settings |
| Type / Execution | API / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-18-AC2 |
| Requirements | FR-10-040, FR-10-041 |

**Story preconditions**
- Source entities and settings required by FR-10-040, FR-10-041 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-18-AC2 — Invalid or prohibited input (negative)**

*Preconditions / test data*
1. a caller submits an unsupported value, exceeds a stated limit, or attempts a prohibited transition in FR-10-040, FR-10-041

*Steps*
1. the request is processed

*Expected results*
1. the request is rejected with the spec-defined validation error and no partial business change is committed.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-092: Missing permission and branch mismatch return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-10-18](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-18-organization-settings.md) — Organization Settings |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-10-18-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-10-040, FR-10-041 |

**Story preconditions**
- Source entities and settings required by FR-10-040, FR-10-041 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-18-AC3 — Permission denied**

*Preconditions / test data*
1. a caller lacks `settings.organization.manage` or is assigned to a different branch in the same organization

*Steps*
1. they request or change this capability

*Expected results*
1. the API returns 403 `COMMON.FORBIDDEN` and returns no restricted data.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-093: Other organization returns 404 and no data (CS-08)

| Field | Value |
|---|---|
| Story | [US-10-18](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-18-organization-settings.md) — Organization Settings |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-10-18-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-10-040, FR-10-041 |

**Story preconditions**
- Source entities and settings required by FR-10-040, FR-10-041 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-18-AC4 — Cross-organization isolation**

*Preconditions / test data*
1. the requested organization-owned resource belongs to another organization

*Steps*
1. the caller requests it

*Expected results*
1. the API returns 404 `COMMON.NOT_FOUND` with no existence or data disclosure (CS-08).

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-10-19: Branch Settings and Overrides

### TS-10-094: Reference values/required behavior and reconciliation (FR-10-042)

| Field | Value |
|---|---|
| Story | [US-10-19](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-19-branch-settings.md) — Branch Settings and Overrides |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-19-AC1 |
| Requirements | FR-10-042 |

**Story preconditions**
- Source entities and settings required by FR-10-042 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-19-AC1 — Required behavior and boundaries**

*Preconditions / test data*
1. Given source events/records matching the required rules in FR-10-042, with one item deliberately outside the effective scope.

*Steps*
1. an authorized caller uses the capability for the scope defined by FR-10-042

*Expected results*
1. the system applies each requirement in FR-10-042
2. monetary values, where present, use decimal arithmetic and 2-decimal AwayFromZero rounding. No out-of-scope row contributes to returned totals.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-095: Negative validation boundary causes no partial effect; spec-defined error (SETTINGS.INVALID_VALUE)

| Field | Value |
|---|---|
| Story | [US-10-19](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-19-branch-settings.md) — Branch Settings and Overrides |
| Type / Execution | API / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-19-AC2 |
| Requirements | FR-10-042 |

**Story preconditions**
- Source entities and settings required by FR-10-042 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-19-AC2 — Invalid or prohibited input (negative)**

*Preconditions / test data*
1. a caller submits an unsupported value, exceeds a stated limit, or attempts a prohibited transition in FR-10-042

*Steps*
1. the request is processed

*Expected results*
1. the request is rejected with the spec-defined validation error and no partial business change is committed.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-096: Missing permission and branch mismatch return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-10-19](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-19-branch-settings.md) — Branch Settings and Overrides |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-10-19-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-10-042 |

**Story preconditions**
- Source entities and settings required by FR-10-042 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-19-AC3 — Permission denied**

*Preconditions / test data*
1. a caller lacks `settings.branch.manage` or is assigned to a different branch in the same organization

*Steps*
1. they request or change this capability

*Expected results*
1. the API returns 403 `COMMON.FORBIDDEN` and returns no restricted data.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-097: Other organization returns 404 and no data (CS-08)

| Field | Value |
|---|---|
| Story | [US-10-19](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-19-branch-settings.md) — Branch Settings and Overrides |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-10-19-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-10-042 |

**Story preconditions**
- Source entities and settings required by FR-10-042 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-19-AC4 — Cross-organization isolation**

*Preconditions / test data*
1. the requested organization-owned resource belongs to another organization

*Steps*
1. the caller requests it

*Expected results*
1. the API returns 404 `COMMON.NOT_FOUND` with no existence or data disclosure (CS-08).

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-10-20: User Language and Theme Preferences

### TS-10-098: Reference values/required behavior and reconciliation (FR-10-043)

| Field | Value |
|---|---|
| Story | [US-10-20](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-20-user-language-and-theme-preferences.md) — User Language and Theme Preferences |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-20-AC1 |
| Requirements | FR-10-043 |

**Story preconditions**
- Source entities and settings required by FR-10-043 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-20-AC1 — Required behavior and boundaries**

*Preconditions / test data*
1. Given source events/records matching the required rules in FR-10-043, with one item deliberately outside the effective scope.

*Steps*
1. an authorized caller uses the capability for the scope defined by FR-10-043

*Expected results*
1. the system applies each requirement in FR-10-043
2. monetary values, where present, use decimal arithmetic and 2-decimal AwayFromZero rounding. No out-of-scope row contributes to returned totals.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-099: Negative validation boundary causes no partial effect; spec-defined error (SETTINGS.INVALID_VALUE)

| Field | Value |
|---|---|
| Story | [US-10-20](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-20-user-language-and-theme-preferences.md) — User Language and Theme Preferences |
| Type / Execution | API / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-20-AC2 |
| Requirements | FR-10-043 |

**Story preconditions**
- Source entities and settings required by FR-10-043 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-20-AC2 — Invalid or prohibited input (negative)**

*Preconditions / test data*
1. a caller submits an unsupported value, exceeds a stated limit, or attempts a prohibited transition in FR-10-043

*Steps*
1. the request is processed

*Expected results*
1. the request is rejected with the spec-defined validation error and no partial business change is committed.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-100: Missing permission and branch mismatch return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-10-20](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-20-user-language-and-theme-preferences.md) — User Language and Theme Preferences |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-10-20-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-10-043 |

**Story preconditions**
- Source entities and settings required by FR-10-043 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-20-AC3 — Permission denied**

*Preconditions / test data*
1. a caller lacks `authenticated user` or is assigned to a different branch in the same organization

*Steps*
1. they request or change this capability

*Expected results*
1. the API returns 403 `COMMON.FORBIDDEN` and returns no restricted data.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-101: Other organization returns 404 and no data (CS-08)

| Field | Value |
|---|---|
| Story | [US-10-20](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-20-user-language-and-theme-preferences.md) — User Language and Theme Preferences |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-10-20-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-10-043 |

**Story preconditions**
- Source entities and settings required by FR-10-043 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-20-AC4 — Cross-organization isolation**

*Preconditions / test data*
1. the requested organization-owned resource belongs to another organization

*Steps*
1. the caller requests it

*Expected results*
1. the API returns 404 `COMMON.NOT_FOUND` with no existence or data disclosure (CS-08).

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-10-21: Arabic-English Localization and RTL-LTR

### TS-10-102: Reference values/required behavior and reconciliation (FR-10-044, FR-10-045)

| Field | Value |
|---|---|
| Story | [US-10-21](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-21-arabic-english-localization-and-direction.md) — Arabic-English Localization and RTL-LTR |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-21-AC1 |
| Requirements | FR-10-044, FR-10-045 |

**Story preconditions**
- Source entities and settings required by FR-10-044, FR-10-045 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-21-AC1 — Required behavior and boundaries**

*Preconditions / test data*
1. Given source events/records matching the required rules in FR-10-044, FR-10-045, with one item deliberately outside the effective scope.

*Steps*
1. an authorized caller uses the capability for the scope defined by FR-10-044, FR-10-045

*Expected results*
1. the system applies each requirement in FR-10-044, FR-10-045
2. monetary values, where present, use decimal arithmetic and 2-decimal AwayFromZero rounding. No out-of-scope row contributes to returned totals.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-103: Negative validation boundary causes no partial effect; spec-defined error (SETTINGS.INVALID_VALUE)

| Field | Value |
|---|---|
| Story | [US-10-21](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-21-arabic-english-localization-and-direction.md) — Arabic-English Localization and RTL-LTR |
| Type / Execution | API / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-21-AC2 |
| Requirements | FR-10-044, FR-10-045 |

**Story preconditions**
- Source entities and settings required by FR-10-044, FR-10-045 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-21-AC2 — Invalid or prohibited input (negative)**

*Preconditions / test data*
1. a caller submits an unsupported value, exceeds a stated limit, or attempts a prohibited transition in FR-10-044, FR-10-045

*Steps*
1. the request is processed

*Expected results*
1. the request is rejected with the spec-defined validation error and no partial business change is committed.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-104: Missing permission and branch mismatch return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-10-21](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-21-arabic-english-localization-and-direction.md) — Arabic-English Localization and RTL-LTR |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-10-21-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-10-044, FR-10-045 |

**Story preconditions**
- Source entities and settings required by FR-10-044, FR-10-045 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-21-AC3 — Permission denied**

*Preconditions / test data*
1. a caller lacks `authenticated user` or is assigned to a different branch in the same organization

*Steps*
1. they request or change this capability

*Expected results*
1. the API returns 403 `COMMON.FORBIDDEN` and returns no restricted data.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-105: Other organization returns 404 and no data (CS-08)

| Field | Value |
|---|---|
| Story | [US-10-21](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-21-arabic-english-localization-and-direction.md) — Arabic-English Localization and RTL-LTR |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-10-21-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-10-044, FR-10-045 |

**Story preconditions**
- Source entities and settings required by FR-10-044, FR-10-045 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-21-AC4 — Cross-organization isolation**

*Preconditions / test data*
1. the requested organization-owned resource belongs to another organization

*Steps*
1. the caller requests it

*Expected results*
1. the API returns 404 `COMMON.NOT_FOUND` with no existence or data disclosure (CS-08).

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-10-22: Localized Digits Dates Money and Medicine Names

### TS-10-106: Reference values/required behavior and reconciliation (FR-10-046, FR-10-047, FR-10-048, FR-10-049)

| Field | Value |
|---|---|
| Story | [US-10-22](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-22-localized-digits-dates-and-money.md) — Localized Digits Dates Money and Medicine Names |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-22-AC1 |
| Requirements | FR-10-046, FR-10-047, FR-10-048, FR-10-049 |

**Story preconditions**
- Source entities and settings required by FR-10-046, FR-10-047, FR-10-048, FR-10-049 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-22-AC1 — Required behavior and boundaries**

*Preconditions / test data*
1. Given source events/records matching the required rules in FR-10-046, FR-10-047, FR-10-048, FR-10-049, with one item deliberately outside the effective scope.

*Steps*
1. an authorized caller uses the capability for the scope defined by FR-10-046, FR-10-047, FR-10-048, FR-10-049

*Expected results*
1. the system applies each requirement in FR-10-046, FR-10-047, FR-10-048, FR-10-049
2. monetary values, where present, use decimal arithmetic and 2-decimal AwayFromZero rounding. No out-of-scope row contributes to returned totals.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-107: Negative validation boundary causes no partial effect; spec-defined error (SETTINGS.INVALID_VALUE)

| Field | Value |
|---|---|
| Story | [US-10-22](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-22-localized-digits-dates-and-money.md) — Localized Digits Dates Money and Medicine Names |
| Type / Execution | API / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-22-AC2 |
| Requirements | FR-10-046, FR-10-047, FR-10-048, FR-10-049 |

**Story preconditions**
- Source entities and settings required by FR-10-046, FR-10-047, FR-10-048, FR-10-049 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-22-AC2 — Invalid or prohibited input (negative)**

*Preconditions / test data*
1. a caller submits an unsupported value, exceeds a stated limit, or attempts a prohibited transition in FR-10-046, FR-10-047, FR-10-048, FR-10-049

*Steps*
1. the request is processed

*Expected results*
1. the request is rejected with the spec-defined validation error and no partial business change is committed.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-108: Missing permission and branch mismatch return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-10-22](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-22-localized-digits-dates-and-money.md) — Localized Digits Dates Money and Medicine Names |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-10-22-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-10-046, FR-10-047, FR-10-048, FR-10-049 |

**Story preconditions**
- Source entities and settings required by FR-10-046, FR-10-047, FR-10-048, FR-10-049 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-22-AC3 — Permission denied**

*Preconditions / test data*
1. a caller lacks `authenticated user` or is assigned to a different branch in the same organization

*Steps*
1. they request or change this capability

*Expected results*
1. the API returns 403 `COMMON.FORBIDDEN` and returns no restricted data.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-109: Other organization returns 404 and no data (CS-08)

| Field | Value |
|---|---|
| Story | [US-10-22](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-22-localized-digits-dates-and-money.md) — Localized Digits Dates Money and Medicine Names |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-10-22-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-10-046, FR-10-047, FR-10-048, FR-10-049 |

**Story preconditions**
- Source entities and settings required by FR-10-046, FR-10-047, FR-10-048, FR-10-049 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-22-AC4 — Cross-organization isolation**

*Preconditions / test data*
1. the requested organization-owned resource belongs to another organization

*Steps*
1. the caller requests it

*Expected results*
1. the API returns 404 `COMMON.NOT_FOUND` with no existence or data disclosure (CS-08).

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-10-23: Light Dark and System Themes

### TS-10-110: Reference values/required behavior and reconciliation (FR-10-050, FR-10-051)

| Field | Value |
|---|---|
| Story | [US-10-23](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-23-light-dark-system-themes.md) — Light Dark and System Themes |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-23-AC1 |
| Requirements | FR-10-050, FR-10-051 |

**Story preconditions**
- Source entities and settings required by FR-10-050, FR-10-051 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-23-AC1 — Required behavior and boundaries**

*Preconditions / test data*
1. Given source events/records matching the required rules in FR-10-050, FR-10-051, with one item deliberately outside the effective scope.

*Steps*
1. an authorized caller uses the capability for the scope defined by FR-10-050, FR-10-051

*Expected results*
1. the system applies each requirement in FR-10-050, FR-10-051
2. monetary values, where present, use decimal arithmetic and 2-decimal AwayFromZero rounding. No out-of-scope row contributes to returned totals.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-111: Negative validation boundary causes no partial effect; spec-defined error (SETTINGS.INVALID_VALUE)

| Field | Value |
|---|---|
| Story | [US-10-23](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-23-light-dark-system-themes.md) — Light Dark and System Themes |
| Type / Execution | API / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-10-23-AC2 |
| Requirements | FR-10-050, FR-10-051 |

**Story preconditions**
- Source entities and settings required by FR-10-050, FR-10-051 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-23-AC2 — Invalid or prohibited input (negative)**

*Preconditions / test data*
1. a caller submits an unsupported value, exceeds a stated limit, or attempts a prohibited transition in FR-10-050, FR-10-051

*Steps*
1. the request is processed

*Expected results*
1. the request is rejected with the spec-defined validation error and no partial business change is committed.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-112: Missing permission and branch mismatch return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-10-23](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-23-light-dark-system-themes.md) — Light Dark and System Themes |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-10-23-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-10-050, FR-10-051 |

**Story preconditions**
- Source entities and settings required by FR-10-050, FR-10-051 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-23-AC3 — Permission denied**

*Preconditions / test data*
1. a caller lacks `authenticated user` or is assigned to a different branch in the same organization

*Steps*
1. they request or change this capability

*Expected results*
1. the API returns 403 `COMMON.FORBIDDEN` and returns no restricted data.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-113: Other organization returns 404 and no data (CS-08)

| Field | Value |
|---|---|
| Story | [US-10-23](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-23-light-dark-system-themes.md) — Light Dark and System Themes |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-10-23-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-10-050, FR-10-051 |

**Story preconditions**
- Source entities and settings required by FR-10-050, FR-10-051 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-23-AC4 — Cross-organization isolation**

*Preconditions / test data*
1. the requested organization-owned resource belongs to another organization

*Steps*
1. the caller requests it

*Expected results*
1. the API returns 404 `COMMON.NOT_FOUND` with no existence or data disclosure (CS-08).

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-10-24: Platform Health Jobs and Backups

### TS-10-114: Reference values/required behavior and reconciliation (FR-10-052, FR-10-053, FR-10-054)

| Field | Value |
|---|---|
| Story | [US-10-24](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-24-platform-health-jobs-and-backups.md) — Platform Health Jobs and Backups |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-10-24-AC1 |
| Requirements | FR-10-052, FR-10-053, FR-10-054 |

**Story preconditions**
- Source entities and settings required by FR-10-052, FR-10-053, FR-10-054 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-24-AC1 — Required behavior and boundaries**

*Preconditions / test data*
1. Given source events/records matching the required rules in FR-10-052, FR-10-053, FR-10-054, with one item deliberately outside the effective scope.

*Steps*
1. an authorized caller uses the capability for the scope defined by FR-10-052, FR-10-053, FR-10-054

*Expected results*
1. the system applies each requirement in FR-10-052, FR-10-053, FR-10-054
2. monetary values, where present, use decimal arithmetic and 2-decimal AwayFromZero rounding. No out-of-scope row contributes to returned totals.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-115: Negative validation boundary causes no partial effect; spec-defined error (SETTINGS.INVALID_VALUE)

| Field | Value |
|---|---|
| Story | [US-10-24](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-24-platform-health-jobs-and-backups.md) — Platform Health Jobs and Backups |
| Type / Execution | API / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-10-24-AC2 |
| Requirements | FR-10-052, FR-10-053, FR-10-054 |

**Story preconditions**
- Source entities and settings required by FR-10-052, FR-10-053, FR-10-054 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-24-AC2 — Invalid or prohibited input (negative)**

*Preconditions / test data*
1. a caller submits an unsupported value, exceeds a stated limit, or attempts a prohibited transition in FR-10-052, FR-10-053, FR-10-054

*Steps*
1. the request is processed

*Expected results*
1. the request is rejected with the spec-defined validation error and no partial business change is committed.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-116: Missing permission and branch mismatch return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-10-24](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-24-platform-health-jobs-and-backups.md) — Platform Health Jobs and Backups |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-10-24-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-10-052, FR-10-053, FR-10-054 |

**Story preconditions**
- Source entities and settings required by FR-10-052, FR-10-053, FR-10-054 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-24-AC3 — Permission denied**

*Preconditions / test data*
1. a caller lacks `settings.operations.read` or is assigned to a different branch in the same organization

*Steps*
1. they request or change this capability

*Expected results*
1. the API returns 403 `COMMON.FORBIDDEN` and returns no restricted data.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-117: Other organization returns 404 and no data (CS-08)

| Field | Value |
|---|---|
| Story | [US-10-24](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-24-platform-health-jobs-and-backups.md) — Platform Health Jobs and Backups |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-10-24-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-10-052, FR-10-053, FR-10-054 |

**Story preconditions**
- Source entities and settings required by FR-10-052, FR-10-053, FR-10-054 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-24-AC4 — Cross-organization isolation**

*Preconditions / test data*
1. the requested organization-owned resource belongs to another organization

*Steps*
1. the caller requests it

*Expected results*
1. the API returns 404 `COMMON.NOT_FOUND` with no existence or data disclosure (CS-08).

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-10-25: Organization Data Export

### TS-10-118: Reference values/required behavior and reconciliation (FR-10-055)

| Field | Value |
|---|---|
| Story | [US-10-25](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-25-organization-data-export.md) — Organization Data Export |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P3) |
| Release | Future |
| Covers | US-10-25-AC1 |
| Requirements | FR-10-055 |

**Story preconditions**
- Source entities and settings required by FR-10-055 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-25-AC1 — Required behavior and boundaries**

*Preconditions / test data*
1. Given source events/records matching the required rules in FR-10-055, with one item deliberately outside the effective scope.

*Steps*
1. an authorized caller uses the capability for the scope defined by FR-10-055

*Expected results*
1. the system applies each requirement in FR-10-055
2. monetary values, where present, use decimal arithmetic and 2-decimal AwayFromZero rounding. No out-of-scope row contributes to returned totals.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-119: Negative validation boundary causes no partial effect; spec-defined error (SETTINGS.INVALID_VALUE)

| Field | Value |
|---|---|
| Story | [US-10-25](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-25-organization-data-export.md) — Organization Data Export |
| Type / Execution | API / Automated |
| Priority | T3 (story P3) |
| Release | Future |
| Covers | US-10-25-AC2 |
| Requirements | FR-10-055 |

**Story preconditions**
- Source entities and settings required by FR-10-055 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-25-AC2 — Invalid or prohibited input (negative)**

*Preconditions / test data*
1. a caller submits an unsupported value, exceeds a stated limit, or attempts a prohibited transition in FR-10-055

*Steps*
1. the request is processed

*Expected results*
1. the request is rejected with the spec-defined validation error and no partial business change is committed.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-120: Missing permission and branch mismatch return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-10-25](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-25-organization-data-export.md) — Organization Data Export |
| Type / Execution | Security / Automated |
| Priority | T3 (story P3) |
| Release | Future |
| Covers | US-10-25-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-10-055 |

**Story preconditions**
- Source entities and settings required by FR-10-055 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-25-AC3 — Permission denied**

*Preconditions / test data*
1. a caller lacks `settings.data-export.manage` or is assigned to a different branch in the same organization

*Steps*
1. they request or change this capability

*Expected results*
1. the API returns 403 `COMMON.FORBIDDEN` and returns no restricted data.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-10-121: Other organization returns 404 and no data (CS-08)

| Field | Value |
|---|---|
| Story | [US-10-25](../stories/EPIC-10-NOTIFICATIONS-AUDIT-SETTINGS/US-10-25-organization-data-export.md) — Organization Data Export |
| Type / Execution | Security / Automated |
| Priority | T3 (story P3) |
| Release | Future |
| Covers | US-10-25-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-10-055 |

**Story preconditions**
- Source entities and settings required by FR-10-055 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

**US-10-25-AC4 — Cross-organization isolation**

*Preconditions / test data*
1. the requested organization-owned resource belongs to another organization

*Steps*
1. the caller requests it

*Expected results*
1. the API returns 404 `COMMON.NOT_FOUND` with no existence or data disclosure (CS-08).

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

