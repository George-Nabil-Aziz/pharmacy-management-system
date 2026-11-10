# Test Cases — EPIC-02 Organization & Branch Management

> **Generated** by `node scripts/docs/gen-test-cases.mjs` on 2026-11-10 from the story files in `docs/stories/EPIC-02-ORGANIZATION-BRANCHES/`. Each test case corresponds to one test scenario (TS) declared in a story; preconditions, steps and expected results are derived from the Given / When / Then of the acceptance criteria it covers. The stories are the source of truth — change a story and regenerate.

**Conventions:** TC ID = TS ID. Priority T0 blocks merge, T1 blocks release, T2/T3 per [MASTER-TEST-STRATEGY §6](../test-plans/MASTER-TEST-STRATEGY.md). Execution: *Automated* tests are implemented in code with a trait/name carrying the TS ID; *Manual* cases are executed from this document. Test data conventions: [TEST-DATA-STRATEGY.md](../test-plans/TEST-DATA-STRATEGY.md).

## Summary (88 test cases)

| TC | Scenario | Type | Priority | Release | Covers |
|---|---|---|---|---|---|
| TS-02-001 | Org identifiers in header/query/body ignored; token org used | Integration | T1 | MVP | US-02-01-AC1 |
| TS-02-002 | Unauthenticated call → 401 with zero tenant queries (query counter) | Integration | T1 | MVP | US-02-01-AC2 |
| TS-02-003 | Org B branch id vs random UUID → identical 404 problem bodies (CS-08) | Integration | T0 | MVP | US-02-01-AC3, US-02-01-AC7 |
| TS-02-004 | Body reference to Org B branch → 422 `COMMON.REFERENCE_NOT_FOUND`, nothing stored | Integration | T1 | MVP | US-02-01-AC4 |
| TS-02-005 | Fault-injected mismatched write → full rollback, security log | Integration | T1 | MVP | US-02-01-AC5 |
| TS-02-006 | Job without organization context fails before queries | Integration | T1 | MVP | US-02-01-AC6 |
| TS-02-007 | Missing filter / unlisted bypass fails build | Architecture | T1 | MVP | US-02-01-AC8 |
| TS-02-008 | Unclassified route fails the suite | Architecture | T1 | MVP | US-02-02-AC1 |
| TS-02-009 | All identifier routes with Org B ids → 404, Org B unchanged | Integration (CS-08) | T0 | MVP | US-02-02-AC2 |
| TS-02-010 | List/report responses scanned for Org B values → none | Integration (CS-08) | T1 | MVP | US-02-02-AC3 |
| TS-02-011 | Body references to Org B entities → 422, nothing persisted | Integration (CS-08) | T1 | MVP | US-02-02-AC4 |
| TS-02-012 | Suite duration ≤ 10 min and merge-blocking | CI | T1 | MVP | US-02-02-AC5 |
| TS-02-013 | Catalog check: RLS enabled+forced with 4 policies on every tenant table | Database | T0 | MVP | US-02-03-AC1 |
| TS-02-014 | No setting → 0 rows | Database | T0 | MVP | US-02-03-AC2 |
| TS-02-015 | Raw SQL without predicate returns own organization only; cross-org insert rejected | Database (CS-08) | T0 | MVP | US-02-03-AC3, US-02-03-AC4 |
| TS-02-016 | Pooled alternating requests show no leakage | Integration | T1 | MVP | US-02-03-AC5 |
| TS-02-017 | Benchmark delta ≤ 10% p95 | Performance | T1 | MVP | US-02-03-AC6 |
| TS-02-018 | Full provisioning creates exact entity set and audit entry | Integration | T1 | MVP | US-02-04-AC1, US-02-04-AC2 |
| TS-02-019 | Fault injection at each step → zero residual rows | Integration | T1 | MVP | US-02-04-AC3 |
| TS-02-020 | Idempotent replay and key reuse with different body | Integration | T1 | MVP | US-02-04-AC4 |
| TS-02-021 | Duplicate owner email (sequential and concurrent) → 409 | Integration | T1 | MVP | US-02-04-AC5 |
| TS-02-022 | Validation errors listed per field | API | T1 | MVP | US-02-04-AC6 |
| TS-02-023 | Organization token → 403 | API | T1 | MVP | US-02-04-AC7 |
| TS-02-024 | Bootstrap on empty DB and refusal on non-empty DB | Integration | T1 | MVP | US-02-04-AC8 |
| TS-02-025 | Profile read with `Unverified` flags and ETag | API | T2 | MVP | US-02-05-AC1 |
| TS-02-026 | Update with audit old/new values; stale ETag 412 | Integration | T2 | MVP | US-02-05-AC2, US-02-05-AC3 |
| TS-02-027 | Tax registration number format rejection | API | T2 | MVP | US-02-05-AC4 |
| TS-02-028 | Organization settings update and `Currency` lock | Integration | T2 | MVP | US-02-05-AC5 |
| TS-02-029 | Pharmacist → 403 on both updates | API | T2 | MVP | US-02-05-AC6 |
| TS-02-030 | Create branch with defaults, settings row, audit | Integration | T1 | MVP | US-02-06-AC1 |
| TS-02-031 | Case-insensitive duplicate code → 409 | API | T1 | MVP | US-02-06-AC2 |
| TS-02-032 | Code change before/after first document number | Integration | T1 | MVP | US-02-06-AC3 |
| TS-02-033 | Time zone change with open cash session → 409 | Integration | T1 | MVP | US-02-06-AC4 |
| TS-02-034 | Field validation codes | API | T1 | MVP | US-02-06-AC5 |
| TS-02-035 | Manager create → 403; Cashier list scoped and out-of-scope detail 403 | API | T1 | MVP | US-02-06-AC6, US-02-06-AC7 |
| TS-02-036 | Org B branch update → 404, Org B unchanged | Integration (CS-08) | T1 | MVP | US-02-06-AC8 |
| TS-02-037 | Defaults returned for new branch | API | T1 | MVP | US-02-07-AC1 |
| TS-02-038 | Update audited, facade returns new value ≤ 5 s | Integration | T1 | MVP | US-02-07-AC2 |
| TS-02-039 | Range, conflict, and tax-category reference validation | API | T1 | MVP | US-02-07-AC3, US-02-07-AC4 |
| TS-02-040 | Completed sale unaffected by later setting change | Integration | T1 | MVP | US-02-07-AC5 |
| TS-02-041 | Cashier and out-of-scope Manager → 403 | API | T1 | MVP | US-02-07-AC6 |
| TS-02-042 | First number format and sequence row | Integration | T1 | MVP | US-02-08-AC1, US-02-08-AC7 |
| TS-02-043 | Rollback consumes no number | Integration | T1 | MVP | US-02-08-AC2 |
| TS-02-044 | 20 × 500 postings with 10% rollbacks → gapless, unique, latency budget | Concurrency | T0 | MVP | US-02-08-AC3 |
| TS-02-045 | Year rollover at Cairo midnight with fake clock | Integration | T1 | MVP | US-02-08-AC4 |
| TS-02-046 | Read-only view, 405 on writes, Cashier 403 | API | T1 | MVP | US-02-08-AC5, US-02-08-AC6 |
| TS-02-047 | Assign two branches with default, audit before/after | Integration | T1 | MVP | US-02-09-AC1 |
| TS-02-048 | Scope change effective ≤ 5 s on existing token (grant and revoke) | Integration | T1 | MVP | US-02-09-AC2 |
| TS-02-049 | `/me/branches` content and exclusion of inactive | API | T1 | MVP | US-02-09-AC3 |
| TS-02-050 | Manager scope limits → 403 `ORG.ASSIGNMENT_OUT_OF_SCOPE` | API | T1 | MVP | US-02-09-AC4 |
| TS-02-051 | Invalid sets and Owner scope fixed → 422 | API | T1 | MVP | US-02-09-AC5, US-02-09-AC6 |
| TS-02-052 | Cashier 403; Org B user id → 404 | API (CS-08) | T1 | MVP | US-02-09-AC7 |
| TS-02-053 | Cashier assigned to A calls B settings route → 403, handler not invoked | Integration (CS-07) | T0 | MVP | US-02-10-AC1 |
| TS-02-054 | Org B branch id in route → 404 | Integration (CS-08) | T1 | MVP | US-02-10-AC2, US-02-10-AC3 |
| TS-02-055 | Stock read for B and org aggregate → 403; AllBranches Accountant → 200 | Integration | T1 | MVP | US-02-10-AC4 |
| TS-02-056 | Composite FK rejects foreign branch on inventory tables | Database | T0 | MVP | US-02-10-AC5 |
| TS-02-057 | Generated cross-branch suite over all branch-scoped routes → 403 | Integration (CS-07) | T1 | MVP | US-02-10-AC6 |
| TS-02-058 | Check returns pass/fail and counts per precondition, no state change | Integration | T2 | V1 | US-02-11-AC1 |
| TS-02-059 | Each precondition alone blocks deactivation (5 table-driven cases) | Integration | T2 | V1 | US-02-11-AC2, US-02-11-AC5 |
| TS-02-060 | Successful deactivation lists affected users and audits | Integration | T2 | V1 | US-02-11-AC3 |
| TS-02-061 | Inactive branch rejects postings, allows history reads | Integration | T2 | V1 | US-02-11-AC4 |
| TS-02-062 | Reactivation and invalid transition | API | T2 | V1 | US-02-11-AC6 |
| TS-02-063 | Manager → 403 on all three endpoints | API | T2 | V1 | US-02-11-AC7 |
| TS-02-064 | Transfer received between check and deactivate → 409 | Concurrency | T1 | V1 | US-02-11-AC2 |
| TS-02-065 | Route policy truth table (flags, status, same branch, other org) | Unit | T2 | V1 | US-02-12-AC1, US-02-12-AC2 |
| TS-02-066 | Approver policy: self-approval and scope modes Source/Destination/Either | Unit | T2 | V1 | US-02-12-AC3, US-02-12-AC4 |
| TS-02-067 | Organization setting update, invalid value, Manager 403 | API | T2 | V1 | US-02-12-AC5, US-02-12-AC6 |
| TS-02-068 | In-transit transfer receivable after destination flag disabled | Integration | T2 | V1 | US-02-12-AC1 |
| TS-02-069 | Reporting scope policy truth table (permission × scope) | Unit | T2 | MVP | US-02-13-AC1, US-02-13-AC2, US-02-13-AC5 |
| TS-02-070 | Unfiltered report limited to assigned branches | Integration | T2 | MVP | US-02-13-AC3 |
| TS-02-071 | Out-of-scope branch filter → 403; Org B branch filter → 404 | Integration (CS-07, CS-08) | T2 | MVP | US-02-13-AC4 |
| TS-02-072 | Listing returns metadata fields only (schema assertion) | API | T2 | V1 | US-02-14-AC1 |
| TS-02-073 | Suspension: tokens revoked, 403 ≤ 60 s, login refused, audit | Integration | T2 | V1 | US-02-14-AC2 |
| TS-02-074 | Data checksums unchanged across suspend/reactivate | Integration | T2 | V1 | US-02-14-AC3, US-02-14-AC4 |
| TS-02-075 | Platform token on tenant routes → 404 | Integration (CS-08) | T2 | V1 | US-02-14-AC5 |
| TS-02-076 | Org token on platform route 403; short reason 422 | API | T2 | V1 | US-02-14-AC6, US-02-14-AC7 |
| TS-02-077 | Create grant with computed expiry and audit | API | T2 | V1 | US-02-15-AC1 |
| TS-02-078 | Duration/grantee validation and duplicate active grant | API | T2 | V1 | US-02-15-AC2, US-02-15-AC3 |
| TS-02-079 | Revoke, session rejected ≤ 60 s, double revoke 409 | Integration | T2 | V1 | US-02-15-AC4 |
| TS-02-080 | Derived status Expired at T + 1 s (fake clock) | Unit | T2 | V1 | US-02-15-AC5 |
| TS-02-081 | Manager → 403 on list/create/revoke | API | T2 | V1 | US-02-15-AC6 |
| TS-02-082 | Session token claims, lifetime ≤ 15 min and ≤ grant expiry | Integration | T2 | V1 | US-02-16-AC1, US-02-16-AC2 |
| TS-02-083 | GET allowed, PUT/POST/DELETE → 403 read-only | Integration | T2 | V1 | US-02-16-AC3 |
| TS-02-084 | Patient, prescription, export routes → 403 | Integration | T2 | V1 | US-02-16-AC4 |
| TS-02-085 | Expired, revoked, foreign grant → identical 403 | API | T2 | V1 | US-02-16-AC5 |
| TS-02-086 | Request after grant expiry with valid token → 403 | Integration | T2 | V1 | US-02-16-AC6 |
| TS-02-087 | Request count equals audit entry count; activity endpoint | Integration | T2 | V1 | US-02-16-AC7 |
| TS-02-088 | Support session with Org B ids → 404 | Integration (CS-08) | T2 | V1 | US-02-16-AC8 |

---

## US-02-01: Tenant Context Resolution and Global Query Filters

### TS-02-001: Org identifiers in header/query/body ignored; token org used

| Field | Value |
|---|---|
| Story | [US-02-01](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-01-tenant-context-and-query-filters.md) — Tenant Context Resolution and Global Query Filters |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-02-01-AC1 |
| Requirements | FR-02-001, FR-02-002, FR-02-003, FR-02-004, FR-02-005 |

**Story preconditions**
- Access tokens issued by SPEC-01 contain `org_id` (organization users) or no `org_id` (platform tokens).
- Two organizations (Org A, Org B) exist in the test fixture, each with one branch and one Owner.

**US-02-01-AC1 — Organization context comes only from the token**

*Preconditions / test data*
1. a user of Org A with a valid access token

*Steps*
1. they call `GET /api/v1/organization` with header `X-Organization-Id` and query `organizationId` set to Org B's id

*Expected results*
1. the response is 200 with Org A's profile and the supplied Org B identifiers are ignored.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-002: Unauthenticated call → 401 with zero tenant queries (query counter)

| Field | Value |
|---|---|
| Story | [US-02-01](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-01-tenant-context-and-query-filters.md) — Tenant Context Resolution and Global Query Filters |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-02-01-AC2 |
| Requirements | FR-02-001, FR-02-002, FR-02-003, FR-02-004, FR-02-005 |

**Story preconditions**
- Access tokens issued by SPEC-01 contain `org_id` (organization users) or no `org_id` (platform tokens).
- Two organizations (Org A, Org B) exist in the test fixture, each with one branch and one Owner.

**US-02-01-AC2 — Missing token rejected before data access**

*Preconditions / test data*
1. no `Authorization` header

*Steps*
1. any tenant-owned endpoint is called

*Expected results*
1. the response is 401 `COMMON.UNAUTHENTICATED` and the database query log for the request contains zero queries on tenant-owned tables.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-003: Org B branch id vs random UUID → identical 404 problem bodies (CS-08)

| Field | Value |
|---|---|
| Story | [US-02-01](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-01-tenant-context-and-query-filters.md) — Tenant Context Resolution and Global Query Filters |
| Type / Execution | Integration / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-02-01-AC3, US-02-01-AC7 |
| Critical scenario | CS-08 |
| Requirements | FR-02-001, FR-02-002, FR-02-003, FR-02-004, FR-02-005 |

**Story preconditions**
- Access tokens issued by SPEC-01 contain `org_id` (organization users) or no `org_id` (platform tokens).
- Two organizations (Org A, Org B) exist in the test fixture, each with one branch and one Owner.

**US-02-01-AC3 — Cross-organization route identifier returns 404**

*Preconditions / test data*
1. a user of Org A with `org.branches.read`

*Steps*
1. they call `GET /api/v1/branches/{branchId}` with Org B's branch id

*Expected results*
1. the response is 404 `COMMON.NOT_FOUND` and its `type`, `title`, `status`, and `code` equal those returned for a random non-existent UUID.

**US-02-01-AC7 — Platform token cannot reach tenant-owned endpoints**

*Preconditions / test data*
1. a platform administrator token without a support session

*Steps*
1. it calls `GET /api/v1/branches`

*Expected results*
1. the response is 404 `COMMON.NOT_FOUND` and no tenant-owned query is executed.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-004: Body reference to Org B branch → 422 `COMMON.REFERENCE_NOT_FOUND`, nothing stored

| Field | Value |
|---|---|
| Story | [US-02-01](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-01-tenant-context-and-query-filters.md) — Tenant Context Resolution and Global Query Filters |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-02-01-AC4 |
| Requirements | FR-02-001, FR-02-002, FR-02-003, FR-02-004, FR-02-005 |

**Story preconditions**
- Access tokens issued by SPEC-01 contain `org_id` (organization users) or no `org_id` (platform tokens).
- Two organizations (Org A, Org B) exist in the test fixture, each with one branch and one Owner.

**US-02-01-AC4 — Cross-organization body reference returns 422**

*Preconditions / test data*
1. a user of Org A with `org.branch-assignments.manage`

*Steps*
1. they submit branch assignments containing Org B's branch id

*Expected results*
1. the response is 422 with `COMMON.REFERENCE_NOT_FOUND` for that field and no assignment is stored.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-005: Fault-injected mismatched write → full rollback, security log

| Field | Value |
|---|---|
| Story | [US-02-01](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-01-tenant-context-and-query-filters.md) — Tenant Context Resolution and Global Query Filters |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-02-01-AC5 |
| Requirements | FR-02-001, FR-02-002, FR-02-003, FR-02-004, FR-02-005 |

**Story preconditions**
- Access tokens issued by SPEC-01 contain `org_id` (organization users) or no `org_id` (platform tokens).
- Two organizations (Org A, Org B) exist in the test fixture, each with one branch and one Owner.

**US-02-01-AC5 — Mismatched OrganizationId on write aborts transaction**

*Preconditions / test data*
1. a request handler of Org A that (by fault injection) attempts to save a row with Org B's `OrganizationId`

*Steps*
1. changes are saved

*Expected results*
1. the whole database transaction is rolled back, the client receives 500 `COMMON.INTERNAL_ERROR`, and a security log event `COMMON.TENANT_MISMATCH` is written with the request `traceId`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-006: Job without organization context fails before queries

| Field | Value |
|---|---|
| Story | [US-02-01](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-01-tenant-context-and-query-filters.md) — Tenant Context Resolution and Global Query Filters |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-02-01-AC6 |
| Requirements | FR-02-001, FR-02-002, FR-02-003, FR-02-004, FR-02-005 |

**Story preconditions**
- Access tokens issued by SPEC-01 contain `org_id` (organization users) or no `org_id` (platform tokens).
- Two organizations (Org A, Org B) exist in the test fixture, each with one branch and one Owner.

**US-02-01-AC6 — Background job without context fails safely**

*Preconditions / test data*
1. a Hangfire job that reads tenant-owned data

*Steps*
1. it is enqueued without an `OrganizationId`

*Expected results*
1. it fails before executing any query and no data is written.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-007: Missing filter / unlisted bypass fails build

| Field | Value |
|---|---|
| Story | [US-02-01](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-01-tenant-context-and-query-filters.md) — Tenant Context Resolution and Global Query Filters |
| Type / Execution | Architecture / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-02-01-AC8 |
| Requirements | FR-02-001, FR-02-002, FR-02-003, FR-02-004, FR-02-005 |

**Story preconditions**
- Access tokens issued by SPEC-01 contain `org_id` (organization users) or no `org_id` (platform tokens).
- Two organizations (Org A, Org B) exist in the test fixture, each with one branch and one Owner.

**US-02-01-AC8 — Architecture test enforces filters**

*Preconditions / test data*
1. a tenant-owned entity added without the organization filter, or filter bypass used outside the allowlist

*Steps*
1. the architecture test suite runs

*Expected results*
1. the build fails naming the entity or call site.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-02-02: Cross-Organization Isolation Test Suite

### TS-02-008: Unclassified route fails the suite

| Field | Value |
|---|---|
| Story | [US-02-02](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-02-cross-organization-isolation-test-suite.md) — Cross-Organization Isolation Test Suite |
| Type / Execution | Architecture / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-02-02-AC1 |
| Requirements | FR-02-004, FR-02-006 |

**Story preconditions**
- US-02-01 is implemented.
- Test fixture seeds Org A and Org B, each with two branches, one user per system role, and at least one record of every tenant-owned aggregate exposed by the API.

**US-02-02-AC1 — Every route is classified**

*Preconditions / test data*
1. the set of registered API routes

*Steps*
1. the suite starts

*Expected results*
1. each route is classified as `TenantBranchScoped`, `TenantOrganization`, `Platform`, or `Anonymous`, and the suite fails listing any unclassified route.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-009: All identifier routes with Org B ids → 404, Org B unchanged

| Field | Value |
|---|---|
| Story | [US-02-02](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-02-cross-organization-isolation-test-suite.md) — Cross-Organization Isolation Test Suite |
| Type / Execution | Integration (CS-08) / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-02-02-AC2 |
| Critical scenario | CS-08 |
| Requirements | FR-02-004, FR-02-006 |

**Story preconditions**
- US-02-01 is implemented.
- Test fixture seeds Org A and Org B, each with two branches, one user per system role, and at least one record of every tenant-owned aggregate exposed by the API.

**US-02-02-AC2 — Cross-organization route identifiers return 404 (CS-08)**

*Preconditions / test data*
1. an Org A Owner token (all permissions, `AllBranches`)

*Steps*
1. every `TenantBranchScoped` and `TenantOrganization` route containing an identifier is called with Org B identifiers (GET, PUT, POST, DELETE as registered)

*Expected results*
1. every response is 404 `COMMON.NOT_FOUND` and no Org B state changes (row counts and `RowVersion` of Org B records unchanged).

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-010: List/report responses scanned for Org B values → none

| Field | Value |
|---|---|
| Story | [US-02-02](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-02-cross-organization-isolation-test-suite.md) — Cross-Organization Isolation Test Suite |
| Type / Execution | Integration (CS-08) / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-02-02-AC3 |
| Requirements | FR-02-004, FR-02-006 |

**Story preconditions**
- US-02-01 is implemented.
- Test fixture seeds Org A and Org B, each with two branches, one user per system role, and at least one record of every tenant-owned aggregate exposed by the API.

**US-02-02-AC3 — No Org B data in any response**

*Preconditions / test data*
1. the Org A Owner token

*Steps*
1. every list and report route is called without filters

*Expected results*
1. no response body contains any Org B record id, name, code, or document number (string scan against Org B fixture values).

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-011: Body references to Org B entities → 422, nothing persisted

| Field | Value |
|---|---|
| Story | [US-02-02](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-02-cross-organization-isolation-test-suite.md) — Cross-Organization Isolation Test Suite |
| Type / Execution | Integration (CS-08) / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-02-02-AC4 |
| Requirements | FR-02-004, FR-02-006 |

**Story preconditions**
- US-02-01 is implemented.
- Test fixture seeds Org A and Org B, each with two branches, one user per system role, and at least one record of every tenant-owned aggregate exposed by the API.

**US-02-02-AC4 — Cross-organization body references rejected**

*Preconditions / test data*
1. the Org A Owner token

*Steps*
1. create/update routes are called with body references to Org B entities (medicine, supplier, patient, branch, batch)

*Expected results*
1. every response is 422 with `COMMON.REFERENCE_NOT_FOUND` and nothing is persisted.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-012: Suite duration ≤ 10 min and merge-blocking

| Field | Value |
|---|---|
| Story | [US-02-02](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-02-cross-organization-isolation-test-suite.md) — Cross-Organization Isolation Test Suite |
| Type / Execution | CI / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-02-02-AC5 |
| Requirements | FR-02-004, FR-02-006 |

**Story preconditions**
- US-02-01 is implemented.
- Test fixture seeds Org A and Org B, each with two branches, one user per system role, and at least one record of every tenant-owned aggregate exposed by the API.

**US-02-02-AC5 — Suite runs in CI within budget**

*Preconditions / test data*
1. the CI pipeline

*Steps*
1. a merge request is built

*Expected results*
1. the suite runs and completes in ≤ 10 minutes, and a failure blocks the merge.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-02-03: PostgreSQL Row-Level Security Defense in Depth

### TS-02-013: Catalog check: RLS enabled+forced with 4 policies on every tenant table

| Field | Value |
|---|---|
| Story | [US-02-03](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-03-postgresql-row-level-security.md) — PostgreSQL Row-Level Security Defense in Depth |
| Type / Execution | Database / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-02-03-AC1 |
| Requirements | FR-02-007 |

**Story preconditions**
- Every tenant-owned table has a non-null `organization_id` column.
- Separate database roles exist: migration role (owner) and application role (non-owner, no `BYPASSRLS`), plus a platform role for allow-listed cross-organization components.
- Enabled from Phase 0 and part of the MVP (ADR-002 amended 2026-11-10; OD-02-08 resolved). Policies are created in the same migration as each tenant-owned table.

**US-02-03-AC1 — Policies exist on every tenant-owned table**

*Preconditions / test data*
1. the migrated database

*Steps*
1. the catalog check test lists tables with an `organization_id` column

*Expected results*
1. each has RLS enabled and forced, with a policy for SELECT, INSERT, UPDATE, and DELETE comparing `organization_id` to `current_setting('app.organization_id')`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-014: No setting → 0 rows

| Field | Value |
|---|---|
| Story | [US-02-03](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-03-postgresql-row-level-security.md) — PostgreSQL Row-Level Security Defense in Depth |
| Type / Execution | Database / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-02-03-AC2 |
| Requirements | FR-02-007 |

**Story preconditions**
- Every tenant-owned table has a non-null `organization_id` column.
- Separate database roles exist: migration role (owner) and application role (non-owner, no `BYPASSRLS`), plus a platform role for allow-listed cross-organization components.
- Enabled from Phase 0 and part of the MVP (ADR-002 amended 2026-11-10; OD-02-08 resolved). Policies are created in the same migration as each tenant-owned table.

**US-02-03-AC2 — Query without organization setting returns no rows**

*Preconditions / test data*
1. a connection under the application role with `app.organization_id` not set

*Steps*
1. it selects from `inventory.batches`

*Expected results*
1. zero rows are returned although rows exist.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-015: Raw SQL without predicate returns own organization only; cross-org insert rejected

| Field | Value |
|---|---|
| Story | [US-02-03](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-03-postgresql-row-level-security.md) — PostgreSQL Row-Level Security Defense in Depth |
| Type / Execution | Database (CS-08) / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-02-03-AC3, US-02-03-AC4 |
| Requirements | FR-02-007 |

**Story preconditions**
- Every tenant-owned table has a non-null `organization_id` column.
- Separate database roles exist: migration role (owner) and application role (non-owner, no `BYPASSRLS`), plus a platform role for allow-listed cross-organization components.
- Enabled from Phase 0 and part of the MVP (ADR-002 amended 2026-11-10; OD-02-08 resolved). Policies are created in the same migration as each tenant-owned table.

**US-02-03-AC3 — Raw SQL cannot read another organization**

*Preconditions / test data*
1. a transaction of Org A with `SET LOCAL app.organization_id` = Org A

*Steps*
1. a raw SQL query without an organization predicate selects from `sales.sales`

*Expected results*
1. only Org A rows are returned.

**US-02-03-AC4 — Cross-organization insert rejected by the database**

*Preconditions / test data*
1. a transaction of Org A

*Steps*
1. a raw SQL insert sets `organization_id` = Org B

*Expected results*
1. the database rejects the insert with a policy violation and the transaction rolls back.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-016: Pooled alternating requests show no leakage

| Field | Value |
|---|---|
| Story | [US-02-03](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-03-postgresql-row-level-security.md) — PostgreSQL Row-Level Security Defense in Depth |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-02-03-AC5 |
| Requirements | FR-02-007 |

**Story preconditions**
- Every tenant-owned table has a non-null `organization_id` column.
- Separate database roles exist: migration role (owner) and application role (non-owner, no `BYPASSRLS`), plus a platform role for allow-listed cross-organization components.
- Enabled from Phase 0 and part of the MVP (ADR-002 amended 2026-11-10; OD-02-08 resolved). Policies are created in the same migration as each tenant-owned table.

**US-02-03-AC5 — Setting does not leak across pooled connections**

*Preconditions / test data*
1. connection pooling with 2 physical connections and alternating Org A / Org B requests

*Steps*
1. 1,000 requests run

*Expected results*
1. every request sees only its own organization's rows (the setting is transaction-scoped via `SET LOCAL`).

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-017: Benchmark delta ≤ 10% p95

| Field | Value |
|---|---|
| Story | [US-02-03](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-03-postgresql-row-level-security.md) — PostgreSQL Row-Level Security Defense in Depth |
| Type / Execution | Performance / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-02-03-AC6 |
| Requirements | FR-02-007 |

**Story preconditions**
- Every tenant-owned table has a non-null `organization_id` column.
- Separate database roles exist: migration role (owner) and application role (non-owner, no `BYPASSRLS`), plus a platform role for allow-listed cross-organization components.
- Enabled from Phase 0 and part of the MVP (ADR-002 amended 2026-11-10; OD-02-08 resolved). Policies are created in the same migration as each tenant-owned table.

**US-02-03-AC6 — Performance budget**

*Preconditions / test data*
1. the NFR-G-02 and NFR-G-03 benchmarks

*Steps*
1. run with RLS enabled vs disabled

*Expected results*
1. p95 latency increases by ≤ 10% (NFR-02-006).

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-02-04: Provision an Organization

### TS-02-018: Full provisioning creates exact entity set and audit entry

| Field | Value |
|---|---|
| Story | [US-02-04](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-04-provision-organization.md) — Provision an Organization |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-02-04-AC1, US-02-04-AC2 |
| Requirements | FR-02-008, FR-02-009, FR-02-010 |

**Story preconditions**
- Caller holds `org.platform-organizations.provision` (platform token), or the bootstrap command is run by the deployment operator.

**US-02-04-AC1 — Successful provisioning creates the full set**

*Preconditions / test data*
1. a valid provisioning request (SPEC-02 §10.3) with header `Idempotency-Key`

*Steps*
1. `POST /api/v1/platform/organizations` is called

*Expected results*
1. the response is 201 with `organizationId`, `branchId`, `ownerUserId`, `ownerStatus = Invited`, and the database contains exactly: 1 Organization (`Active`), 1 OrganizationSettings with §8.4 defaults, 1 Branch (`Active`) with 1 BranchSettings with defaults, 6 system roles, 1 Owner user with `BranchScope = AllBranches` and default branch = the new branch, and 1 audit entry `org.organization.provisioned`.

**US-02-04-AC2 — Owner invitation triggered**

*Preconditions / test data*
1. a successful provisioning

*Steps*
1. the transaction commits

*Expected results*
1. exactly one invitation outbox message for the Owner email is recorded (delivery per SPEC-01).

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-019: Fault injection at each step → zero residual rows

| Field | Value |
|---|---|
| Story | [US-02-04](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-04-provision-organization.md) — Provision an Organization |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-02-04-AC3 |
| Requirements | FR-02-008, FR-02-009, FR-02-010 |

**Story preconditions**
- Caller holds `org.platform-organizations.provision` (platform token), or the bootstrap command is run by the deployment operator.

**US-02-04-AC3 — Atomic rollback on failure**

*Preconditions / test data*
1. a fault injected after the branch row is written

*Steps*
1. provisioning runs

*Expected results*
1. the response is 500 `COMMON.INTERNAL_ERROR` and no Organization, Branch, settings, role, user, or outbox row for this request exists.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-020: Idempotent replay and key reuse with different body

| Field | Value |
|---|---|
| Story | [US-02-04](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-04-provision-organization.md) — Provision an Organization |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-02-04-AC4 |
| Requirements | FR-02-008, FR-02-009, FR-02-010 |

**Story preconditions**
- Caller holds `org.platform-organizations.provision` (platform token), or the bootstrap command is run by the deployment operator.

**US-02-04-AC4 — Idempotent retry**

*Preconditions / test data*
1. a completed provisioning with key K

*Steps*
1. the same request is repeated with key K

*Expected results*
1. the same 201 body is returned and the organization count is unchanged
2. with key K and a different body the response is 422 `COMMON.IDEMPOTENCY_KEY_REUSED`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-021: Duplicate owner email (sequential and concurrent) → 409

| Field | Value |
|---|---|
| Story | [US-02-04](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-04-provision-organization.md) — Provision an Organization |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-02-04-AC5 |
| Requirements | FR-02-008, FR-02-009, FR-02-010 |

**Story preconditions**
- Caller holds `org.platform-organizations.provision` (platform token), or the bootstrap command is run by the deployment operator.

**US-02-04-AC5 — Owner email already in use**

*Preconditions / test data*
1. a user with email `owner@x.example` exists on the platform

*Steps*
1. provisioning uses that owner email

*Expected results*
1. the response is 409 `ORG.OWNER_EMAIL_IN_USE` and nothing is created.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-022: Validation errors listed per field

| Field | Value |
|---|---|
| Story | [US-02-04](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-04-provision-organization.md) — Provision an Organization |
| Type / Execution | API / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-02-04-AC6 |
| Requirements | FR-02-008, FR-02-009, FR-02-010 |

**Story preconditions**
- Caller holds `org.platform-organizations.provision` (platform token), or the bootstrap command is run by the deployment operator.

**US-02-04-AC6 — Validation of branch and organization fields**

*Preconditions / test data*
1. a request with branch code `ca1` and an invalid time zone `Cairo`

*Steps*
1. provisioning is called

*Expected results*
1. the response is 422 `COMMON.VALIDATION_FAILED` with `ORG.BRANCH_CODE_INVALID` and `ORG.TIME_ZONE_INVALID` in `errors`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-023: Organization token → 403

| Field | Value |
|---|---|
| Story | [US-02-04](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-04-provision-organization.md) — Provision an Organization |
| Type / Execution | API / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-02-04-AC7 |
| Requirements | FR-02-008, FR-02-009, FR-02-010 |

**Story preconditions**
- Caller holds `org.platform-organizations.provision` (platform token), or the bootstrap command is run by the deployment operator.

**US-02-04-AC7 — Organization user cannot provision**

*Preconditions / test data*
1. an Org A Owner token

*Steps*
1. `POST /api/v1/platform/organizations` is called

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-024: Bootstrap on empty DB and refusal on non-empty DB

| Field | Value |
|---|---|
| Story | [US-02-04](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-04-provision-organization.md) — Provision an Organization |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-02-04-AC8 |
| Requirements | FR-02-008, FR-02-009, FR-02-010 |

**Story preconditions**
- Caller holds `org.platform-organizations.provision` (platform token), or the bootstrap command is run by the deployment operator.

**US-02-04-AC8 — Bootstrap command**

*Preconditions / test data*
1. an empty database

*Steps*
1. the deployment bootstrap command runs with a provisioning definition file

*Expected results*
1. the same entities as AC1 are created
2. when any organization already exists, the command exits with a non-zero code and creates nothing unless the explicit "add another organization" option is passed.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-02-05: View and Update Organization Profile and Settings

### TS-02-025: Profile read with `Unverified` flags and ETag

| Field | Value |
|---|---|
| Story | [US-02-05](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-05-organization-profile-and-settings.md) — View and Update Organization Profile and Settings |
| Type / Execution | API / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-02-05-AC1 |
| Requirements | FR-02-011, FR-02-012 |

**Story preconditions**
- Organization is `Active`; caller is an organization user.

**US-02-05-AC1 — View profile with unverified flags**

*Preconditions / test data*
1. a user with `org.organization.read`

*Steps*
1. they call `GET /api/v1/organization`

*Expected results*
1. the response is 200 with profile fields, an `ETag`, and `taxRegistrationNumber`/`commercialRegistrationNumber` each accompanied by `verificationStatus: "Unverified"`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-026: Update with audit old/new values; stale ETag 412

| Field | Value |
|---|---|
| Story | [US-02-05](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-05-organization-profile-and-settings.md) — View and Update Organization Profile and Settings |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-02-05-AC2, US-02-05-AC3 |
| Requirements | FR-02-011, FR-02-012 |

**Story preconditions**
- Organization is `Active`; caller is an organization user.

**US-02-05-AC2 — Update profile with concurrency**

*Preconditions / test data*
1. an Owner holding the current `ETag`

*Steps*
1. they `PUT /api/v1/organization` with `If-Match` and a new `legalName`

*Expected results*
1. the response is 200 with a new `ETag`, and an audit entry `org.organization.updated` records old and new values.

**US-02-05-AC3 — Stale ETag rejected**

*Preconditions / test data*
1. the profile was changed by another user after the caller read it

*Steps*
1. the caller submits `PUT` with the old `ETag`

*Expected results*
1. the response is 412 `COMMON.PRECONDITION_FAILED` and nothing changes.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-027: Tax registration number format rejection

| Field | Value |
|---|---|
| Story | [US-02-05](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-05-organization-profile-and-settings.md) — View and Update Organization Profile and Settings |
| Type / Execution | API / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-02-05-AC4 |
| Requirements | FR-02-011, FR-02-012 |

**Story preconditions**
- Organization is `Active`; caller is an organization user.

**US-02-05-AC4 — Invalid tax registration number**

*Preconditions / test data*
1. an Owner

*Steps*
1. they submit `taxRegistrationNumber` = `12345AB`

*Expected results*
1. the response is 422 `COMMON.VALIDATION_FAILED` with `ORG.TAX_REGISTRATION_NUMBER_INVALID`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-028: Organization settings update and `Currency` lock

| Field | Value |
|---|---|
| Story | [US-02-05](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-05-organization-profile-and-settings.md) — View and Update Organization Profile and Settings |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-02-05-AC5 |
| Requirements | FR-02-011, FR-02-012 |

**Story preconditions**
- Organization is `Active`; caller is an organization user.

**US-02-05-AC5 — Update organization settings**

*Preconditions / test data*
1. a user with `settings.organization.manage`

*Steps*
1. they `PUT /api/v1/organization/settings` with `defaultLanguage = "en"` and `If-Match`

*Expected results*
1. the response is 200, the audit entry records old `ar` and new `en`, and `currencyCode` remains `EGP` even if a different value is submitted (422 `ORG.SETTING_OUT_OF_RANGE` for any value other than `EGP`).

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-029: Pharmacist → 403 on both updates

| Field | Value |
|---|---|
| Story | [US-02-05](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-05-organization-profile-and-settings.md) — View and Update Organization Profile and Settings |
| Type / Execution | API / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-02-05-AC6 |
| Requirements | FR-02-011, FR-02-012 |

**Story preconditions**
- Organization is `Active`; caller is an organization user.

**US-02-05-AC6 — Permission denied**

*Preconditions / test data*
1. a Pharmacist (no `org.organization.update`, no `settings.organization.manage`)

*Steps*
1. they call `PUT /api/v1/organization` or `PUT /api/v1/organization/settings`

*Expected results*
1. both return 403 `COMMON.FORBIDDEN`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-02-06: Create and Update Branches

### TS-02-030: Create branch with defaults, settings row, audit

| Field | Value |
|---|---|
| Story | [US-02-06](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-06-create-and-update-branches.md) — Create and Update Branches |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-02-06-AC1 |
| Requirements | FR-02-013, FR-02-014, FR-02-015, FR-02-016 |

**Story preconditions**
- Organization `Active`.

**US-02-06-AC1 — Create branch**

*Preconditions / test data*
1. an Owner with `org.branches.create`

*Steps*
1. they `POST /api/v1/branches` with code `ALX02`, names, governorate `Alexandria`, city, address line, phone `+2034440000`, and no time zone

*Expected results*
1. the response is 201 with status `Active`, `timeZone = "Africa/Cairo"`, a BranchSettings row with §8.4 defaults exists, and audit entry `org.branch.created` is written.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-031: Case-insensitive duplicate code → 409

| Field | Value |
|---|---|
| Story | [US-02-06](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-06-create-and-update-branches.md) — Create and Update Branches |
| Type / Execution | API / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-02-06-AC2 |
| Requirements | FR-02-013, FR-02-014, FR-02-015, FR-02-016 |

**Story preconditions**
- Organization `Active`.

**US-02-06-AC2 — Duplicate code rejected**

*Preconditions / test data*
1. branch `CAI01` exists in the organization

*Steps*
1. a branch is created with code `cai01`

*Expected results*
1. the response is 409 `ORG.BRANCH_CODE_DUPLICATE` (case-insensitive) and no branch is created.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-032: Code change before/after first document number

| Field | Value |
|---|---|
| Story | [US-02-06](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-06-create-and-update-branches.md) — Create and Update Branches |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-02-06-AC3 |
| Requirements | FR-02-013, FR-02-014, FR-02-015, FR-02-016 |

**Story preconditions**
- Organization `Active`.

**US-02-06-AC3 — Code immutable after first document number**

*Preconditions / test data*
1. branch `CAI01` has issued `CAI01-INV-2026-000001`

*Steps*
1. a user updates its code to `CAI09`

*Expected results*
1. the response is 409 `ORG.BRANCH_CODE_IMMUTABLE`
2. before any number is issued the same update succeeds.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-033: Time zone change with open cash session → 409

| Field | Value |
|---|---|
| Story | [US-02-06](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-06-create-and-update-branches.md) — Create and Update Branches |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-02-06-AC4 |
| Requirements | FR-02-013, FR-02-014, FR-02-015, FR-02-016 |

**Story preconditions**
- Organization `Active`.

**US-02-06-AC4 — Time zone change blocked by open cash session**

*Preconditions / test data*
1. branch `CAI01` has a cash session in status `Open`

*Steps*
1. a user with `org.branches.update` changes `timeZone` to `Europe/London`

*Expected results*
1. the response is 409 `ORG.TIME_ZONE_CHANGE_BLOCKED`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-034: Field validation codes

| Field | Value |
|---|---|
| Story | [US-02-06](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-06-create-and-update-branches.md) — Create and Update Branches |
| Type / Execution | API / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-02-06-AC5 |
| Requirements | FR-02-013, FR-02-014, FR-02-015, FR-02-016 |

**Story preconditions**
- Organization `Active`.

**US-02-06-AC5 — Invalid fields rejected**

*Preconditions / test data*
1. a create request with code `1AB`, phone `12345`, and time zone `Mars/Base`

*Steps*
1. it is submitted

*Expected results*
1. the response is 422 `COMMON.VALIDATION_FAILED` with `ORG.BRANCH_CODE_INVALID`, `ORG.PHONE_INVALID`, and `ORG.TIME_ZONE_INVALID`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-035: Manager create → 403; Cashier list scoped and out-of-scope detail 403

| Field | Value |
|---|---|
| Story | [US-02-06](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-06-create-and-update-branches.md) — Create and Update Branches |
| Type / Execution | API / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-02-06-AC6, US-02-06-AC7 |
| Requirements | FR-02-013, FR-02-014, FR-02-015, FR-02-016 |

**Story preconditions**
- Organization `Active`.

**US-02-06-AC6 — Permission denied**

*Preconditions / test data*
1. a Branch Manager (no `org.branches.create`)

*Steps*
1. they `POST /api/v1/branches`

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN`.

**US-02-06-AC7 — List returns only branches in scope**

*Preconditions / test data*
1. a Cashier assigned only to `CAI01` in an organization with branches `CAI01`, `ALX02`

*Steps*
1. they call `GET /api/v1/branches`

*Expected results*
1. only `CAI01` is returned, and `GET /api/v1/branches/{ALX02 id}` returns 403 `COMMON.FORBIDDEN`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-036: Org B branch update → 404, Org B unchanged

| Field | Value |
|---|---|
| Story | [US-02-06](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-06-create-and-update-branches.md) — Create and Update Branches |
| Type / Execution | Integration (CS-08) / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-02-06-AC8 |
| Requirements | FR-02-013, FR-02-014, FR-02-015, FR-02-016 |

**Story preconditions**
- Organization `Active`.

**US-02-06-AC8 — Cross-organization branch update**

*Preconditions / test data*
1. an Org A Owner

*Steps*
1. they `PUT /api/v1/branches/{Org B branch id}`

*Expected results*
1. the response is 404 `COMMON.NOT_FOUND`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-02-07: Configure Branch Settings

### TS-02-037: Defaults returned for new branch

| Field | Value |
|---|---|
| Story | [US-02-07](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-07-branch-settings.md) — Configure Branch Settings |
| Type / Execution | API / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-02-07-AC1 |
| Requirements | FR-02-020, FR-02-021 |

**Story preconditions**
- Branch exists; BranchSettings row created with defaults (US-02-06).

**US-02-07-AC1 — Read effective settings**

*Preconditions / test data*
1. a newly created branch

*Steps*
1. a user with `org.branches.read` calls `GET /api/v1/branches/{branchId}/settings`

*Expected results*
1. the response is 200 with `nearExpiryDays = 90`, `doNotSellWindowDays = 0`, `adjustmentApprovalThreshold = 1000.00`, empty receipt footers, `defaultTaxCategoryId = null`, `pricesIncludeTax = true`, `transfersOutEnabled = true`, `transfersInEnabled = true`, and an `ETag`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-038: Update audited, facade returns new value ≤ 5 s

| Field | Value |
|---|---|
| Story | [US-02-07](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-07-branch-settings.md) — Configure Branch Settings |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-02-07-AC2 |
| Requirements | FR-02-020, FR-02-021 |

**Story preconditions**
- Branch exists; BranchSettings row created with defaults (US-02-06).

**US-02-07-AC2 — Update with audit and propagation**

*Preconditions / test data*
1. a Manager with `settings.branch.manage` and the branch in scope

*Steps*
1. they set `nearExpiryDays = 120` with a valid `If-Match`

*Expected results*
1. the response is 200, audit entry `settings.branch.updated` lists old 90 and new 120, and `GetEffectiveBranchSettings` returns 120 to other modules within 5 seconds.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-039: Range, conflict, and tax-category reference validation

| Field | Value |
|---|---|
| Story | [US-02-07](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-07-branch-settings.md) — Configure Branch Settings |
| Type / Execution | API / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-02-07-AC3, US-02-07-AC4 |
| Requirements | FR-02-020, FR-02-021 |

**Story preconditions**
- Branch exists; BranchSettings row created with defaults (US-02-06).

**US-02-07-AC3 — Out-of-range and conflicting values rejected**

*Preconditions / test data*
1. a Manager

*Steps*
1. they submit `nearExpiryDays = 0`, or `doNotSellWindowDays = 100` with `nearExpiryDays = 90`, or `adjustmentApprovalThreshold = -1`

*Expected results*
1. each returns 422 `COMMON.VALIDATION_FAILED` with `ORG.SETTING_OUT_OF_RANGE` or `ORG.SETTING_CONFLICT` respectively, and nothing changes.

**US-02-07-AC4 — Tax category reference validated**

*Preconditions / test data*
1. a TaxCategory that is `Inactive` or belongs to another organization

*Steps*
1. it is submitted as `defaultTaxCategoryId`

*Expected results*
1. the response is 422 with `COMMON.REFERENCE_NOT_FOUND`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-040: Completed sale unaffected by later setting change

| Field | Value |
|---|---|
| Story | [US-02-07](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-07-branch-settings.md) — Configure Branch Settings |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-02-07-AC5 |
| Requirements | FR-02-020, FR-02-021 |

**Story preconditions**
- Branch exists; BranchSettings row created with defaults (US-02-06).

**US-02-07-AC5 — Not retroactive**

*Preconditions / test data*
1. a sale completed when `pricesIncludeTax = true`

*Steps*
1. the setting is changed to false

*Expected results*
1. the completed sale's stored amounts and reprinted invoice are unchanged.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-041: Cashier and out-of-scope Manager → 403

| Field | Value |
|---|---|
| Story | [US-02-07](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-07-branch-settings.md) — Configure Branch Settings |
| Type / Execution | API / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-02-07-AC6 |
| Requirements | FR-02-020, FR-02-021 |

**Story preconditions**
- Branch exists; BranchSettings row created with defaults (US-02-06).

**US-02-07-AC6 — Permission and scope denied**

*Preconditions / test data*
1. a Cashier (no `settings.branch.manage`), and a Manager not assigned to the branch

*Steps*
1. each calls `PUT /api/v1/branches/{branchId}/settings`

*Expected results*
1. both receive 403 `COMMON.FORBIDDEN`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-02-08: Gapless Document Numbering Sequences

### TS-02-042: First number format and sequence row

| Field | Value |
|---|---|
| Story | [US-02-08](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-08-document-numbering-sequences.md) — Gapless Document Numbering Sequences |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-02-08-AC1, US-02-08-AC7 |
| Requirements | FR-02-014, FR-02-022, FR-02-023, FR-02-024, FR-02-025 |

**Story preconditions**
- Branch exists with a code; consuming modules call `AllocateDocumentNumber` inside their posting transaction.
- Until consuming modules exist, ACs are verified with a test posting harness that opens a transaction, allocates a `SalesInvoice` number, writes a test document row, and commits or rolls back.

**US-02-08-AC1 — Format and first number**

*Preconditions / test data*
1. branch `CAI01` with no sales invoices in 2026

*Steps*
1. the first sale is completed on business date 2026-03-10

*Expected results*
1. the invoice number is `CAI01-INV-2026-000001` and a `DocumentSequence` row (CAI01, SalesInvoice, 2026, CurrentValue = 1) exists.

**US-02-08-AC7 — Sequences are per branch**

*Preconditions / test data*
1. branches `CAI01` and `ALX02`

*Steps*
1. each completes its first 2026 sale

*Expected results*
1. the numbers are `CAI01-INV-2026-000001` and `ALX02-INV-2026-000001`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-043: Rollback consumes no number

| Field | Value |
|---|---|
| Story | [US-02-08](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-08-document-numbering-sequences.md) — Gapless Document Numbering Sequences |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-02-08-AC2 |
| Requirements | FR-02-014, FR-02-022, FR-02-023, FR-02-024, FR-02-025 |

**Story preconditions**
- Branch exists with a code; consuming modules call `AllocateDocumentNumber` inside their posting transaction.
- Until consuming modules exist, ACs are verified with a test posting harness that opens a transaction, allocates a `SalesInvoice` number, writes a test document row, and commits or rolls back.

**US-02-08-AC2 — Rollback consumes no number**

*Preconditions / test data*
1. current value 5 for (CAI01, SalesInvoice, 2026)

*Steps*
1. a sale posting fails after number allocation and rolls back, and the next sale succeeds

*Expected results*
1. the successful sale receives `CAI01-INV-2026-000006`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-044: 20 × 500 postings with 10% rollbacks → gapless, unique, latency budget

| Field | Value |
|---|---|
| Story | [US-02-08](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-08-document-numbering-sequences.md) — Gapless Document Numbering Sequences |
| Type / Execution | Concurrency / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-02-08-AC3 |
| Requirements | FR-02-014, FR-02-022, FR-02-023, FR-02-024, FR-02-025 |

**Story preconditions**
- Branch exists with a code; consuming modules call `AllocateDocumentNumber` inside their posting transaction.
- Until consuming modules exist, ACs are verified with a test posting harness that opens a transaction, allocates a `SalesInvoice` number, writes a test document row, and commits or rolls back.

**US-02-08-AC3 — Concurrency produces no duplicates or gaps**

*Preconditions / test data*
1. 20 concurrent workers posting 500 documents each to (CAI01, SalesInvoice, 2026) with 10% forced rollbacks

*Steps*
1. all complete

*Expected results*
1. issued numbers are exactly 1..N with N = number of committed postings, no duplicates, and allocation adds ≤ 20 ms p95 to the posting transaction.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-045: Year rollover at Cairo midnight with fake clock

| Field | Value |
|---|---|
| Story | [US-02-08](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-08-document-numbering-sequences.md) — Gapless Document Numbering Sequences |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-02-08-AC4 |
| Requirements | FR-02-014, FR-02-022, FR-02-023, FR-02-024, FR-02-025 |

**Story preconditions**
- Branch exists with a code; consuming modules call `AllocateDocumentNumber` inside their posting transaction.
- Until consuming modules exist, ACs are verified with a test posting harness that opens a transaction, allocates a `SalesInvoice` number, writes a test document row, and commits or rolls back.

**US-02-08-AC4 — Year rollover uses branch business date**

*Preconditions / test data*
1. branch time zone `Africa/Cairo`, last 2026 number 000950

*Steps*
1. a sale commits at 2026-12-31T22:00:01Z (2027-01-01 00:00:01 Cairo)

*Expected results*
1. its number is `CAI01-INV-2027-000001`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-046: Read-only view, 405 on writes, Cashier 403

| Field | Value |
|---|---|
| Story | [US-02-08](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-08-document-numbering-sequences.md) — Gapless Document Numbering Sequences |
| Type / Execution | API / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-02-08-AC5, US-02-08-AC6 |
| Requirements | FR-02-014, FR-02-022, FR-02-023, FR-02-024, FR-02-025 |

**Story preconditions**
- Branch exists with a code; consuming modules call `AllocateDocumentNumber` inside their posting transaction.
- Until consuming modules exist, ACs are verified with a test posting harness that opens a transaction, allocates a `SalesInvoice` number, writes a test document row, and commits or rolls back.

**US-02-08-AC5 — Read-only sequence view**

*Preconditions / test data*
1. a Manager with `settings.branch.manage`

*Steps*
1. they call `GET /api/v1/branches/{branchId}/document-sequences?year=2026`

*Expected results*
1. they receive each document type with current value and last issued number
2. no endpoint accepts PUT/POST/DELETE on sequences (405).

**US-02-08-AC6 — Permission denied**

*Preconditions / test data*
1. a Cashier

*Steps*
1. they call the sequence view

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-02-09: Manage User Branch Scope and Assignments

### TS-02-047: Assign two branches with default, audit before/after

| Field | Value |
|---|---|
| Story | [US-02-09](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-09-user-branch-assignments.md) — Manage User Branch Scope and Assignments |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-02-09-AC1 |
| Requirements | FR-02-016, FR-02-026, FR-02-027, FR-02-028 |

**Story preconditions**
- Target user exists in the caller's organization (SPEC-01).

**US-02-09-AC1 — Owner assigns branches and default**

*Preconditions / test data*
1. an Owner and a Pharmacist user with no assignments

*Steps*
1. the Owner calls `PUT /api/v1/users/{userId}/branch-assignments` with `{ "branchScope": "AssignedBranches", "branchIds": [CAI01, ALX02], "defaultBranchId": CAI01 }` and `If-Match`

*Expected results*
1. the response is 200, both assignments exist with `IsDefault` true only for CAI01, and audit entry `org.branch-assignments.changed` contains before `[]` and after `[CAI01, ALX02]`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-048: Scope change effective ≤ 5 s on existing token (grant and revoke)

| Field | Value |
|---|---|
| Story | [US-02-09](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-09-user-branch-assignments.md) — Manage User Branch Scope and Assignments |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-02-09-AC2 |
| Requirements | FR-02-016, FR-02-026, FR-02-027, FR-02-028 |

**Story preconditions**
- Target user exists in the caller's organization (SPEC-01).

**US-02-09-AC2 — Effective within 5 seconds without re-login**

*Preconditions / test data*
1. the Pharmacist is logged in with a token issued before AC1

*Steps*
1. they call `GET /api/v1/branches/{ALX02}/...` 5 seconds after the change commits

*Expected results*
1. the call is authorized (no 403 for scope)
2. after removal of ALX02 the same call returns 403 within 5 seconds.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-049: `/me/branches` content and exclusion of inactive

| Field | Value |
|---|---|
| Story | [US-02-09](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-09-user-branch-assignments.md) — Manage User Branch Scope and Assignments |
| Type / Execution | API / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-02-09-AC3 |
| Requirements | FR-02-016, FR-02-026, FR-02-027, FR-02-028 |

**Story preconditions**
- Target user exists in the caller's organization (SPEC-01).

**US-02-09-AC3 — My branches**

*Preconditions / test data*
1. the Pharmacist from AC1

*Steps*
1. they call `GET /api/v1/me/branches`

*Expected results*
1. they receive CAI01 (`isDefault: true`) and ALX02, each with code, names, status, and time zone
2. `Inactive` branches are excluded.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-050: Manager scope limits → 403 `ORG.ASSIGNMENT_OUT_OF_SCOPE`

| Field | Value |
|---|---|
| Story | [US-02-09](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-09-user-branch-assignments.md) — Manage User Branch Scope and Assignments |
| Type / Execution | API / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-02-09-AC4 |
| Requirements | FR-02-016, FR-02-026, FR-02-027, FR-02-028 |

**Story preconditions**
- Target user exists in the caller's organization (SPEC-01).

**US-02-09-AC4 — Manager limited to own scope**

*Preconditions / test data*
1. a Manager assigned only to CAI01 holding `org.branch-assignments.manage`

*Steps*
1. they assign a user to ALX02, or set `branchScope = AllBranches`, or change an Owner's assignments

*Expected results*
1. each returns 403 `ORG.ASSIGNMENT_OUT_OF_SCOPE` and nothing changes.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-051: Invalid sets and Owner scope fixed → 422

| Field | Value |
|---|---|
| Story | [US-02-09](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-09-user-branch-assignments.md) — Manage User Branch Scope and Assignments |
| Type / Execution | API / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-02-09-AC5, US-02-09-AC6 |
| Requirements | FR-02-016, FR-02-026, FR-02-027, FR-02-028 |

**Story preconditions**
- Target user exists in the caller's organization (SPEC-01).

**US-02-09-AC5 — Invalid assignment sets rejected**

*Preconditions / test data*
1. an Owner

*Steps*
1. they submit an `Inactive` branch, an empty list with `AssignedBranches`, or a default not in the list

*Expected results*
1. the response is 422 `COMMON.VALIDATION_FAILED` with `ORG.ASSIGNMENT_BRANCH_INVALID` or `ORG.ASSIGNMENT_DEFAULT_INVALID`.

**US-02-09-AC6 — Owner scope fixed**

*Preconditions / test data*
1. a user holding the `OWNER` role

*Steps*
1. anyone submits `branchScope = AssignedBranches` for them

*Expected results*
1. the response is 422 `COMMON.VALIDATION_FAILED` with `ORG.OWNER_SCOPE_FIXED`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-052: Cashier 403; Org B user id → 404

| Field | Value |
|---|---|
| Story | [US-02-09](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-09-user-branch-assignments.md) — Manage User Branch Scope and Assignments |
| Type / Execution | API (CS-08) / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-02-09-AC7 |
| Requirements | FR-02-016, FR-02-026, FR-02-027, FR-02-028 |

**Story preconditions**
- Target user exists in the caller's organization (SPEC-01).

**US-02-09-AC7 — Permission denied and cross-organization user**

*Preconditions / test data*
1. a Cashier, and separately an Org A Owner targeting an Org B user id

*Steps*
1. each calls `PUT /api/v1/users/{userId}/branch-assignments`

*Expected results*
1. the Cashier receives 403 `COMMON.FORBIDDEN` and the Org A Owner receives 404 `COMMON.NOT_FOUND`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-02-10: Enforce Branch-Scoped Authorization and Branch Inventory Ownership

### TS-02-053: Cashier assigned to A calls B settings route → 403, handler not invoked

| Field | Value |
|---|---|
| Story | [US-02-10](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-10-branch-scoped-authorization.md) — Enforce Branch-Scoped Authorization and Branch Inventory Ownership |
| Type / Execution | Integration (CS-07) / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-02-10-AC1 |
| Critical scenario | CS-07 |
| Requirements | FR-02-029, FR-02-030 |

**Story preconditions**
- Organization with branches A (`CAI01`) and B (`ALX02`); users with each system role assigned only to A; one Accountant with `AllBranches`.

**US-02-10-AC1 — Cross-branch call returns 403 (CS-07)**

*Preconditions / test data*
1. a Cashier assigned only to branch A with `sales.pos.sell`

*Steps*
1. they call any `/api/v1/branches/{B}/...` route (for example `GET /api/v1/branches/{B}/settings`)

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN`, the handler is not executed, and no branch B data is returned.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-054: Org B branch id in route → 404

| Field | Value |
|---|---|
| Story | [US-02-10](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-10-branch-scoped-authorization.md) — Enforce Branch-Scoped Authorization and Branch Inventory Ownership |
| Type / Execution | Integration (CS-08) / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-02-10-AC2, US-02-10-AC3 |
| Requirements | FR-02-029, FR-02-030 |

**Story preconditions**
- Organization with branches A (`CAI01`) and B (`ALX02`); users with each system role assigned only to A; one Accountant with `AllBranches`.

**US-02-10-AC2 — Branch of another organization returns 404**

*Preconditions / test data*
1. the same Cashier

*Steps*
1. they call `/api/v1/branches/{Org B branch}/...`

*Expected results*
1. the response is 404 `COMMON.NOT_FOUND`.

**US-02-10-AC3 — Check order**

*Preconditions / test data*
1. a user lacking a permission for a route on a branch outside their scope of their own organization

*Steps*
1. they call it

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN` (organization check → 404 precedes permission and scope checks → 403, per SPEC-02 §11.1).

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-055: Stock read for B and org aggregate → 403; AllBranches Accountant → 200

| Field | Value |
|---|---|
| Story | [US-02-10](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-10-branch-scoped-authorization.md) — Enforce Branch-Scoped Authorization and Branch Inventory Ownership |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-02-10-AC4 |
| Requirements | FR-02-029, FR-02-030 |

**Story preconditions**
- Organization with branches A (`CAI01`) and B (`ALX02`); users with each system role assigned only to A; one Accountant with `AllBranches`.

**US-02-10-AC4 — Stock visibility limited to scope**

*Preconditions / test data*
1. an Inventory Staff user assigned to branch A with `inventory.stock.read`

*Steps*
1. they request stock for branch B, or an organization-wide stock aggregate

*Expected results*
1. both return 403 `COMMON.FORBIDDEN`
2. the Accountant with `AllBranches` and `inventory.stock.read` receives both.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-056: Composite FK rejects foreign branch on inventory tables

| Field | Value |
|---|---|
| Story | [US-02-10](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-10-branch-scoped-authorization.md) — Enforce Branch-Scoped Authorization and Branch Inventory Ownership |
| Type / Execution | Database / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-02-10-AC5 |
| Requirements | FR-02-029, FR-02-030 |

**Story preconditions**
- Organization with branches A (`CAI01`) and B (`ALX02`); users with each system role assigned only to A; one Accountant with `AllBranches`.

**US-02-10-AC5 — Inventory rows carry an organization branch**

*Preconditions / test data*
1. the database

*Steps*
1. an insert into `inventory.batches`, `inventory.batch_balances`, or `inventory.stock_movements` references a `BranchId` that does not belong to the row's organization

*Expected results*
1. the insert is rejected (composite foreign key on (`OrganizationId`, `BranchId`)) and the transaction rolls back.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-057: Generated cross-branch suite over all branch-scoped routes → 403

| Field | Value |
|---|---|
| Story | [US-02-10](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-10-branch-scoped-authorization.md) — Enforce Branch-Scoped Authorization and Branch Inventory Ownership |
| Type / Execution | Integration (CS-07) / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-02-10-AC6 |
| Requirements | FR-02-029, FR-02-030 |

**Story preconditions**
- Organization with branches A (`CAI01`) and B (`ALX02`); users with each system role assigned only to A; one Accountant with `AllBranches`.

**US-02-10-AC6 — Every branch-scoped route is covered**

*Preconditions / test data*
1. all registered `TenantBranchScoped` routes

*Steps*
1. the cross-branch suite calls each with branch B as a user assigned only to A

*Expected results*
1. every response is 403 and branch B data is unchanged.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-02-11: Deactivate and Reactivate a Branch

### TS-02-058: Check returns pass/fail and counts per precondition, no state change

| Field | Value |
|---|---|
| Story | [US-02-11](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-11-deactivate-and-reactivate-branch.md) — Deactivate and Reactivate a Branch |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-02-11-AC1 |
| Requirements | FR-02-017, FR-02-018, FR-02-019 |

**Story preconditions**
- Organization has ≥ 2 `Active` branches for a successful deactivation.

**US-02-11-AC1 — Deactivation check reports each precondition**

*Preconditions / test data*
1. branch `ALX02` with 1 `Open` cash session, 37 batches with total on-hand 1,240, and 1 transfer `InTransit` to it

*Steps*
1. an Owner calls `GET /api/v1/branches/{ALX02}/deactivation-check`

*Expected results*
1. the response is 200 with `canDeactivate: false` and entries `ORG.BRANCH_HAS_OPEN_CASH_SESSIONS` (count 1), `ORG.BRANCH_HAS_STOCK` (1,240 base units, 37 batches), `ORG.BRANCH_HAS_ACTIVE_TRANSFERS` (count 1) failing, and `ORG.BRANCH_HAS_PENDING_DOCUMENTS`, `ORG.LAST_ACTIVE_BRANCH` passing
2. no state changes.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-059: Each precondition alone blocks deactivation (5 table-driven cases)

| Field | Value |
|---|---|
| Story | [US-02-11](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-11-deactivate-and-reactivate-branch.md) — Deactivate and Reactivate a Branch |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-02-11-AC2, US-02-11-AC5 |
| Requirements | FR-02-017, FR-02-018, FR-02-019 |

**Story preconditions**
- Organization has ≥ 2 `Active` branches for a successful deactivation.

**US-02-11-AC2 — Deactivation blocked**

*Preconditions / test data*
1. the branch from AC1

*Steps*
1. the Owner calls `POST /api/v1/branches/{ALX02}/deactivate` with a reason

*Expected results*
1. the response is 409 `ORG.BRANCH_DEACTIVATION_BLOCKED` listing the three failing precondition codes, and the branch remains `Active`.

**US-02-11-AC5 — Last active branch cannot be deactivated**

*Preconditions / test data*
1. an organization with a single `Active` branch with zero stock and no open documents

*Steps*
1. the Owner deactivates it

*Expected results*
1. the response is 409 `ORG.BRANCH_DEACTIVATION_BLOCKED` with `ORG.LAST_ACTIVE_BRANCH`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-060: Successful deactivation lists affected users and audits

| Field | Value |
|---|---|
| Story | [US-02-11](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-11-deactivate-and-reactivate-branch.md) — Deactivate and Reactivate a Branch |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-02-11-AC3 |
| Requirements | FR-02-017, FR-02-018, FR-02-019 |

**Story preconditions**
- Organization has ≥ 2 `Active` branches for a successful deactivation.

**US-02-11-AC3 — Successful deactivation**

*Preconditions / test data*
1. `ALX02` with all preconditions passing and 2 users whose only assignment is `ALX02`

*Steps*
1. the Owner deactivates it with reason "Branch closed permanently"

*Expected results*
1. the response is 200, status is `Inactive` with `deactivatedAt`, `deactivatedBy`, reason, the response lists the 2 affected user ids, and audit entry `org.branch.deactivated` is written.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-061: Inactive branch rejects postings, allows history reads

| Field | Value |
|---|---|
| Story | [US-02-11](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-11-deactivate-and-reactivate-branch.md) — Deactivate and Reactivate a Branch |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-02-11-AC4 |
| Requirements | FR-02-017, FR-02-018, FR-02-019 |

**Story preconditions**
- Organization has ≥ 2 `Active` branches for a successful deactivation.

**US-02-11-AC4 — Inactive branch rejects new documents**

*Preconditions / test data*
1. `ALX02` is `Inactive`

*Steps*
1. any posting workflow calls `AssertBranchWritable` (for example opening a cash session or creating a goods receipt)

*Expected results*
1. the request returns 409 `ORG.BRANCH_INACTIVE`, while `GET` of its historical sales and movements returns 200 to users in scope.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-062: Reactivation and invalid transition

| Field | Value |
|---|---|
| Story | [US-02-11](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-11-deactivate-and-reactivate-branch.md) — Deactivate and Reactivate a Branch |
| Type / Execution | API / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-02-11-AC6 |
| Requirements | FR-02-017, FR-02-018, FR-02-019 |

**Story preconditions**
- Organization has ≥ 2 `Active` branches for a successful deactivation.

**US-02-11-AC6 — Reactivation**

*Preconditions / test data*
1. `ALX02` is `Inactive`

*Steps*
1. the Owner calls `POST /api/v1/branches/{ALX02}/reactivate`

*Expected results*
1. the status is `Active`, audit entry `org.branch.reactivated` is written
2. reactivating an `Active` branch returns 409 `ORG.INVALID_STATUS_TRANSITION`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-063: Manager → 403 on all three endpoints

| Field | Value |
|---|---|
| Story | [US-02-11](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-11-deactivate-and-reactivate-branch.md) — Deactivate and Reactivate a Branch |
| Type / Execution | API / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-02-11-AC7 |
| Requirements | FR-02-017, FR-02-018, FR-02-019 |

**Story preconditions**
- Organization has ≥ 2 `Active` branches for a successful deactivation.

**US-02-11-AC7 — Permission denied**

*Preconditions / test data*
1. a Branch Manager (no `org.branches.deactivate`)

*Steps*
1. they call the check, deactivate, or reactivate endpoint

*Expected results*
1. each returns 403 `COMMON.FORBIDDEN`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-064: Transfer received between check and deactivate → 409

| Field | Value |
|---|---|
| Story | [US-02-11](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-11-deactivate-and-reactivate-branch.md) — Deactivate and Reactivate a Branch |
| Type / Execution | Concurrency / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-02-11-AC2 |
| Requirements | FR-02-017, FR-02-018, FR-02-019 |

**Story preconditions**
- Organization has ≥ 2 `Active` branches for a successful deactivation.

**US-02-11-AC2 — Deactivation blocked**

*Preconditions / test data*
1. the branch from AC1

*Steps*
1. the Owner calls `POST /api/v1/branches/{ALX02}/deactivate` with a reason

*Expected results*
1. the response is 409 `ORG.BRANCH_DEACTIVATION_BLOCKED` listing the three failing precondition codes, and the branch remains `Active`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-02-12: Stock Transfer Route and Approval Policy

### TS-02-065: Route policy truth table (flags, status, same branch, other org)

| Field | Value |
|---|---|
| Story | [US-02-12](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-12-stock-transfer-policy.md) — Stock Transfer Route and Approval Policy |
| Type / Execution | Unit / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-02-12-AC1, US-02-12-AC2 |
| Requirements | FR-02-012, FR-02-031, FR-02-032 |

**Story preconditions**
- Branches `CAI01`, `ALX02`, `GIZ03` are `Active` in the same organization.

**US-02-12-AC1 — Allowed route**

*Preconditions / test data*
1. `CAI01.transfersOutEnabled = true` and `ALX02.transfersInEnabled = true`

*Steps*
1. SPEC-04 calls `CheckTransferRoute(CAI01, ALX02)`

*Expected results*
1. the result is allowed.

**US-02-12-AC2 — Disallowed routes**

*Preconditions / test data*
1. `GIZ03.transfersInEnabled = false`, and branch `OLD04` is `Inactive`

*Steps*
1. routes (CAI01→GIZ03), (CAI01→OLD04), (CAI01→CAI01), and (CAI01→Org B branch) are checked via a transfer request

*Expected results*
1. the first three return 422 `ORG.TRANSFER_ROUTE_NOT_ALLOWED` and the Org B destination returns 422 `COMMON.REFERENCE_NOT_FOUND`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-066: Approver policy: self-approval and scope modes Source/Destination/Either

| Field | Value |
|---|---|
| Story | [US-02-12](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-12-stock-transfer-policy.md) — Stock Transfer Route and Approval Policy |
| Type / Execution | Unit / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-02-12-AC3, US-02-12-AC4 |
| Requirements | FR-02-012, FR-02-031, FR-02-032 |

**Story preconditions**
- Branches `CAI01`, `ALX02`, `GIZ03` are `Active` in the same organization.

**US-02-12-AC3 — Approver must differ from requester**

*Preconditions / test data*
1. a transfer CAI01→ALX02 requested by Manager M1 who holds `inventory.transfers.approve` for CAI01

*Steps*
1. M1 attempts to approve it

*Expected results*
1. the response is 403 `ORG.TRANSFER_APPROVER_NOT_ELIGIBLE`.

**US-02-12-AC4 — Approver scope follows `TransferApproverScope`**

*Preconditions / test data*
1. `TransferApproverScope = Source`, Manager M2 assigned only to ALX02, Manager M3 assigned to CAI01, both with `inventory.transfers.approve`

*Steps*
1. each attempts to approve the transfer CAI01→ALX02

*Expected results*
1. M2 receives 403 `ORG.TRANSFER_APPROVER_NOT_ELIGIBLE` and M3 is allowed
2. with `Destination` the results swap
3. with `Either` both are allowed.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-067: Organization setting update, invalid value, Manager 403

| Field | Value |
|---|---|
| Story | [US-02-12](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-12-stock-transfer-policy.md) — Stock Transfer Route and Approval Policy |
| Type / Execution | API / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-02-12-AC5, US-02-12-AC6 |
| Requirements | FR-02-012, FR-02-031, FR-02-032 |

**Story preconditions**
- Branches `CAI01`, `ALX02`, `GIZ03` are `Active` in the same organization.

**US-02-12-AC5 — Update transfer policy settings**

*Preconditions / test data*
1. an Owner with `settings.organization.manage`

*Steps*
1. they set `transferApproverScope = "Either"` via `PUT /api/v1/organization/settings`

*Expected results*
1. the response is 200 and an audit entry records old and new values
2. a value `"Any"` returns 422 `ORG.SETTING_OUT_OF_RANGE`.

**US-02-12-AC6 — Permission denied**

*Preconditions / test data*
1. a Branch Manager (no `settings.organization.manage`)

*Steps*
1. they change `transferApproverScope`

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-068: In-transit transfer receivable after destination flag disabled

| Field | Value |
|---|---|
| Story | [US-02-12](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-12-stock-transfer-policy.md) — Stock Transfer Route and Approval Policy |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-02-12-AC1 |
| Requirements | FR-02-012, FR-02-031, FR-02-032 |

**Story preconditions**
- Branches `CAI01`, `ALX02`, `GIZ03` are `Active` in the same organization.

**US-02-12-AC1 — Allowed route**

*Preconditions / test data*
1. `CAI01.transfersOutEnabled = true` and `ALX02.transfersInEnabled = true`

*Steps*
1. SPEC-04 calls `CheckTransferRoute(CAI01, ALX02)`

*Expected results*
1. the result is allowed.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-02-13: Organization-Level Reporting Scope

### TS-02-069: Reporting scope policy truth table (permission × scope)

| Field | Value |
|---|---|
| Story | [US-02-13](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-13-organization-reporting-scope.md) — Organization-Level Reporting Scope |
| Type / Execution | Unit / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-02-13-AC1, US-02-13-AC2, US-02-13-AC5 |
| Requirements | FR-02-033 |

**Story preconditions**
- Branches `CAI01`, `ALX02`; Owner (`AllBranches`), Accountant AC1 (`AllBranches`, `reports.organization.read`), Manager M1 (assigned `CAI01`, `reports.sales.read`, no `reports.organization.read`), Manager M2 (assigned `CAI01` and `ALX02`, `reports.sales.read`).

**US-02-13-AC1 — Organization-level report allowed**

*Preconditions / test data*
1. Accountant AC1

*Steps*
1. SPEC-09 calls `GetReportingScope(AC1)`

*Expected results*
1. the result is `AllBranches` with `organizationReportsAllowed = true`.

**US-02-13-AC2 — Organization-level report denied**

*Preconditions / test data*
1. Manager M2 (two branches but not `AllBranches` and no `reports.organization.read`)

*Steps*
1. M2 requests an organization-level report

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN`.

**US-02-13-AC5 — Permission without scope is insufficient**

*Preconditions / test data*
1. a user holding `reports.organization.read` but with `AssignedBranches` scope

*Steps*
1. they request an organization-level report

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-070: Unfiltered report limited to assigned branches

| Field | Value |
|---|---|
| Story | [US-02-13](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-13-organization-reporting-scope.md) — Organization-Level Reporting Scope |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-02-13-AC3 |
| Requirements | FR-02-033 |

**Story preconditions**
- Branches `CAI01`, `ALX02`; Owner (`AllBranches`), Accountant AC1 (`AllBranches`, `reports.organization.read`), Manager M1 (assigned `CAI01`, `reports.sales.read`, no `reports.organization.read`), Manager M2 (assigned `CAI01` and `ALX02`, `reports.sales.read`).

**US-02-13-AC3 — Branch reports limited to scope**

*Preconditions / test data*
1. Manager M2

*Steps*
1. M2 requests a sales report without a branch filter

*Expected results*
1. the report includes data from `CAI01` and `ALX02` only, each shown per branch.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-071: Out-of-scope branch filter → 403; Org B branch filter → 404

| Field | Value |
|---|---|
| Story | [US-02-13](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-13-organization-reporting-scope.md) — Organization-Level Reporting Scope |
| Type / Execution | Integration (CS-07, CS-08) / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-02-13-AC4 |
| Requirements | FR-02-033 |

**Story preconditions**
- Branches `CAI01`, `ALX02`; Owner (`AllBranches`), Accountant AC1 (`AllBranches`, `reports.organization.read`), Manager M1 (assigned `CAI01`, `reports.sales.read`, no `reports.organization.read`), Manager M2 (assigned `CAI01` and `ALX02`, `reports.sales.read`).

**US-02-13-AC4 — Branch filter outside scope**

*Preconditions / test data*
1. Manager M1

*Steps*
1. M1 requests a sales report with `branchId = ALX02`

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN`
2. with a branch id of another organization the response is 404 `COMMON.NOT_FOUND`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-02-14: Platform Administration of Organizations (List, Suspend, Reactivate)

### TS-02-072: Listing returns metadata fields only (schema assertion)

| Field | Value |
|---|---|
| Story | [US-02-14](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-14-platform-organization-administration.md) — Platform Administration of Organizations (List, Suspend, Reactivate) |
| Type / Execution | API / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-02-14-AC1 |
| Requirements | FR-02-034, FR-02-035 |

**Story preconditions**
- Caller is a platform administrator with the listed platform permissions.

**US-02-14-AC1 — Metadata-only listing**

*Preconditions / test data*
1. 3 organizations

*Steps*
1. a platform administrator calls `GET /api/v1/platform/organizations?page=1&pageSize=25`

*Expected results*
1. each item contains only `id`, `nameAr`, `nameEn`, `status`, `branchCount`, `userCount`, `createdAt`, `suspendedAt`, `suspensionReason`, and no sales, stock, patient, or financial fields.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-073: Suspension: tokens revoked, 403 ≤ 60 s, login refused, audit

| Field | Value |
|---|---|
| Story | [US-02-14](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-14-platform-organization-administration.md) — Platform Administration of Organizations (List, Suspend, Reactivate) |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-02-14-AC2 |
| Requirements | FR-02-034, FR-02-035 |

**Story preconditions**
- Caller is a platform administrator with the listed platform permissions.

**US-02-14-AC2 — Suspend organization**

*Preconditions / test data*
1. Org A is `Active` and its Cashier is logged in

*Steps*
1. the administrator calls `POST /api/v1/platform/organizations/{OrgA}/suspend` with reason "Security incident under investigation"

*Expected results*
1. Org A is `Suspended`, all Org A refresh tokens are revoked, the Cashier's next request after 60 seconds returns 403 `ORG.ORGANIZATION_SUSPENDED`, Org A login attempts return 403 `ORG.ORGANIZATION_SUSPENDED`, and a platform audit entry `org.organization.suspended` is written.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-074: Data checksums unchanged across suspend/reactivate

| Field | Value |
|---|---|
| Story | [US-02-14](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-14-platform-organization-administration.md) — Platform Administration of Organizations (List, Suspend, Reactivate) |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-02-14-AC3, US-02-14-AC4 |
| Requirements | FR-02-034, FR-02-035 |

**Story preconditions**
- Caller is a platform administrator with the listed platform permissions.

**US-02-14-AC3 — No data changed by suspension**

*Preconditions / test data*
1. row counts and checksums of Org A business tables before suspension

*Steps*
1. Org A is suspended and reactivated

*Expected results*
1. counts and checksums are unchanged.

**US-02-14-AC4 — Reactivate**

*Preconditions / test data*
1. Org A is `Suspended`

*Steps*
1. the administrator reactivates it

*Expected results*
1. status is `Active`, users can log in again, and audit entry `org.organization.reactivated` is written
2. reactivating an `Active` organization returns 409 `ORG.INVALID_STATUS_TRANSITION`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-075: Platform token on tenant routes → 404

| Field | Value |
|---|---|
| Story | [US-02-14](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-14-platform-organization-administration.md) — Platform Administration of Organizations (List, Suspend, Reactivate) |
| Type / Execution | Integration (CS-08) / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-02-14-AC5 |
| Requirements | FR-02-034, FR-02-035 |

**Story preconditions**
- Caller is a platform administrator with the listed platform permissions.

**US-02-14-AC5 — Platform token has no business data access**

*Preconditions / test data*
1. a platform administrator token without a support session

*Steps*
1. it calls `GET /api/v1/branches/{OrgA branch}/settings` or `GET /api/v1/organization`

*Expected results*
1. the response is 404 `COMMON.NOT_FOUND`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-076: Org token on platform route 403; short reason 422

| Field | Value |
|---|---|
| Story | [US-02-14](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-14-platform-organization-administration.md) — Platform Administration of Organizations (List, Suspend, Reactivate) |
| Type / Execution | API / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-02-14-AC6, US-02-14-AC7 |
| Requirements | FR-02-034, FR-02-035 |

**Story preconditions**
- Caller is a platform administrator with the listed platform permissions.

**US-02-14-AC6 — Organization users denied platform routes**

*Preconditions / test data*
1. an Org A Owner

*Steps*
1. they call `POST /api/v1/platform/organizations/{OrgA}/suspend`

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN`.

**US-02-14-AC7 — Missing reason**

*Preconditions / test data*
1. a platform administrator

*Steps*
1. they suspend with a 5-character reason

*Expected results*
1. the response is 422 `COMMON.VALIDATION_FAILED` with `ORG.REASON_REQUIRED`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-02-15: Owner Manages Support Access Grants

### TS-02-077: Create grant with computed expiry and audit

| Field | Value |
|---|---|
| Story | [US-02-15](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-15-manage-support-access-grants.md) — Owner Manages Support Access Grants |
| Type / Execution | API / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-02-15-AC1 |
| Requirements | FR-02-036, FR-02-037 |

**Story preconditions**
- Platform administrator `support1@vendor.example` exists and is active.

**US-02-15-AC1 — Create grant**

*Preconditions / test data*
1. an Owner with `org.support-grants.manage`

*Steps*
1. they `POST /api/v1/support-grants` with `{ "platformAdminEmail": "support1@vendor.example", "durationHours": 24, "reason": "Investigate invoice printing issue" }`

*Expected results*
1. the response is 201 with `status = Active`, `expiresAt = grantedAt + 24h`, and audit entry `org.support-grant.created` is written.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-078: Duration/grantee validation and duplicate active grant

| Field | Value |
|---|---|
| Story | [US-02-15](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-15-manage-support-access-grants.md) — Owner Manages Support Access Grants |
| Type / Execution | API / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-02-15-AC2, US-02-15-AC3 |
| Requirements | FR-02-036, FR-02-037 |

**Story preconditions**
- Platform administrator `support1@vendor.example` exists and is active.

**US-02-15-AC2 — Duration and grantee validation**

*Preconditions / test data*
1. an Owner

*Steps*
1. they submit `durationHours = 0` or `73`, or an email that is not an active platform administrator

*Expected results*
1. the response is 422 `COMMON.VALIDATION_FAILED` with `ORG.SUPPORT_GRANT_DURATION_INVALID` or `ORG.SUPPORT_GRANT_GRANTEE_INVALID` (same code for unknown and non-admin emails).

**US-02-15-AC3 — One active grant per administrator**

*Preconditions / test data*
1. an `Active` grant for `support1@vendor.example`

*Steps*
1. the Owner creates another grant for the same administrator

*Expected results*
1. the response is 409 `ORG.SUPPORT_GRANT_ALREADY_ACTIVE`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-079: Revoke, session rejected ≤ 60 s, double revoke 409

| Field | Value |
|---|---|
| Story | [US-02-15](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-15-manage-support-access-grants.md) — Owner Manages Support Access Grants |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-02-15-AC4 |
| Requirements | FR-02-036, FR-02-037 |

**Story preconditions**
- Platform administrator `support1@vendor.example` exists and is active.

**US-02-15-AC4 — Revoke grant**

*Preconditions / test data*
1. an `Active` grant

*Steps*
1. the Owner calls `POST /api/v1/support-grants/{grantId}/revoke`

*Expected results*
1. status becomes `Revoked` with `revokedAt`/`revokedBy`, audit entry `org.support-grant.revoked` is written, and support-session requests under it return 403 `ORG.SUPPORT_GRANT_INACTIVE` within 60 seconds
2. revoking again returns 409 `ORG.INVALID_STATUS_TRANSITION`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-080: Derived status Expired at T + 1 s (fake clock)

| Field | Value |
|---|---|
| Story | [US-02-15](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-15-manage-support-access-grants.md) — Owner Manages Support Access Grants |
| Type / Execution | Unit / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-02-15-AC5 |
| Requirements | FR-02-036, FR-02-037 |

**Story preconditions**
- Platform administrator `support1@vendor.example` exists and is active.

**US-02-15-AC5 — Expiry enforced exactly**

*Preconditions / test data*
1. a grant with `expiresAt` T

*Steps*
1. the list is read at T + 1 s

*Expected results*
1. the grant shows `status = Expired`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-081: Manager → 403 on list/create/revoke

| Field | Value |
|---|---|
| Story | [US-02-15](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-15-manage-support-access-grants.md) — Owner Manages Support Access Grants |
| Type / Execution | API / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-02-15-AC6 |
| Requirements | FR-02-036, FR-02-037 |

**Story preconditions**
- Platform administrator `support1@vendor.example` exists and is active.

**US-02-15-AC6 — Permission denied**

*Preconditions / test data*
1. a Branch Manager (no `org.support-grants.manage`)

*Steps*
1. they list, create, or revoke grants

*Expected results*
1. each returns 403 `COMMON.FORBIDDEN`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-02-16: Platform Administrator Read-Only Support Session

### TS-02-082: Session token claims, lifetime ≤ 15 min and ≤ grant expiry

| Field | Value |
|---|---|
| Story | [US-02-16](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-16-support-session-read-only-access.md) — Platform Administrator Read-Only Support Session |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-02-16-AC1, US-02-16-AC2 |
| Requirements | FR-02-037, FR-02-038, FR-02-039, FR-02-040 |

**Story preconditions**
- An `Active` support grant exists for the calling platform administrator in Org A.

**US-02-16-AC1 — Start support session**

*Preconditions / test data*
1. an `Active` grant G expiring in 2 hours

*Steps*
1. the administrator calls `POST /api/v1/platform/support-sessions` with `{ "grantId": G }`

*Expected results*
1. the response is 200 with an access token whose lifetime is ≤ 15 minutes, which contains `org_id` = Org A and `support_grant_id` = G, and `FirstUsedAt` of G is set.

**US-02-16-AC2 — Token never outlives grant**

*Preconditions / test data*
1. a grant expiring in 5 minutes

*Steps*
1. a support session starts

*Expected results*
1. the token expiry is ≤ the grant's `expiresAt`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-083: GET allowed, PUT/POST/DELETE → 403 read-only

| Field | Value |
|---|---|
| Story | [US-02-16](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-16-support-session-read-only-access.md) — Platform Administrator Read-Only Support Session |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-02-16-AC3 |
| Requirements | FR-02-037, FR-02-038, FR-02-039, FR-02-040 |

**Story preconditions**
- An `Active` support grant exists for the calling platform administrator in Org A.

**US-02-16-AC3 — Read allowed, writes rejected**

*Preconditions / test data*
1. a support session token

*Steps*
1. it calls `GET /api/v1/branches/{CAI01}/settings` and then `PUT` on the same route

*Expected results*
1. the GET returns 200 and the PUT returns 403 `ORG.SUPPORT_ACCESS_READ_ONLY` with no change.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-084: Patient, prescription, export routes → 403

| Field | Value |
|---|---|
| Story | [US-02-16](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-16-support-session-read-only-access.md) — Platform Administrator Read-Only Support Session |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-02-16-AC4 |
| Requirements | FR-02-037, FR-02-038, FR-02-039, FR-02-040 |

**Story preconditions**
- An `Active` support grant exists for the calling platform administrator in Org A.

**US-02-16-AC4 — Patient, prescription, and export data excluded**

*Preconditions / test data*
1. a support session token

*Steps*
1. it calls a patient profile route, a prescription route, or a report export route

*Expected results*
1. each returns 403 `COMMON.FORBIDDEN`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-085: Expired, revoked, foreign grant → identical 403

| Field | Value |
|---|---|
| Story | [US-02-16](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-16-support-session-read-only-access.md) — Platform Administrator Read-Only Support Session |
| Type / Execution | API / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-02-16-AC5 |
| Requirements | FR-02-037, FR-02-038, FR-02-039, FR-02-040 |

**Story preconditions**
- An `Active` support grant exists for the calling platform administrator in Org A.

**US-02-16-AC5 — No session without active grant**

*Preconditions / test data*
1. a grant that is `Expired` or `Revoked`, or a grant issued to another administrator

*Steps*
1. a session is requested

*Expected results*
1. the response is 403 `ORG.SUPPORT_GRANT_INACTIVE` (same code for all three cases).

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-086: Request after grant expiry with valid token → 403

| Field | Value |
|---|---|
| Story | [US-02-16](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-16-support-session-read-only-access.md) — Platform Administrator Read-Only Support Session |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-02-16-AC6 |
| Requirements | FR-02-037, FR-02-038, FR-02-039, FR-02-040 |

**Story preconditions**
- An `Active` support grant exists for the calling platform administrator in Org A.

**US-02-16-AC6 — Expiry mid-session**

*Preconditions / test data*
1. a support session token still within its lifetime

*Steps*
1. a request is made 1 second after the grant's `expiresAt`

*Expected results*
1. the response is 403 `ORG.SUPPORT_GRANT_INACTIVE`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-087: Request count equals audit entry count; activity endpoint

| Field | Value |
|---|---|
| Story | [US-02-16](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-16-support-session-read-only-access.md) — Platform Administrator Read-Only Support Session |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-02-16-AC7 |
| Requirements | FR-02-037, FR-02-038, FR-02-039, FR-02-040 |

**Story preconditions**
- An `Active` support grant exists for the calling platform administrator in Org A.

**US-02-16-AC7 — Every request audited and visible to Owner**

*Preconditions / test data*
1. a support session that made 12 requests (including 1 rejected PUT)

*Steps*
1. the Owner calls `GET /api/v1/support-grants/{G}/activity`

*Expected results*
1. exactly 12 entries are returned, each with administrator, method, route template, status code, and timestamp.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-02-088: Support session with Org B ids → 404

| Field | Value |
|---|---|
| Story | [US-02-16](../stories/EPIC-02-ORGANIZATION-BRANCHES/US-02-16-support-session-read-only-access.md) — Platform Administrator Read-Only Support Session |
| Type / Execution | Integration (CS-08) / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-02-16-AC8 |
| Requirements | FR-02-037, FR-02-038, FR-02-039, FR-02-040 |

**Story preconditions**
- An `Active` support grant exists for the calling platform administrator in Org A.

**US-02-16-AC8 — Session cannot cross organizations**

*Preconditions / test data*
1. a support session for Org A

*Steps*
1. it requests a resource id of Org B

*Expected results*
1. the response is 404 `COMMON.NOT_FOUND`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

