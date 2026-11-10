# Test Cases — EPIC-07 Patients & Medical Records

> **Generated** by `node scripts/docs/gen-test-cases.mjs` on 2026-11-10 from the story files in `docs/stories/EPIC-07-PATIENT-RECORDS/`. Each test case corresponds to one test scenario (TS) declared in a story; preconditions, steps and expected results are derived from the Given / When / Then of the acceptance criteria it covers. The stories are the source of truth — change a story and regenerate.

**Conventions:** TC ID = TS ID. Priority T0 blocks merge, T1 blocks release, T2/T3 per [MASTER-TEST-STRATEGY §6](../test-plans/MASTER-TEST-STRATEGY.md). Execution: *Automated* tests are implemented in code with a trait/name carrying the TS ID; *Manual* cases are executed from this document. Test data conventions: [TEST-DATA-STRATEGY.md](../test-plans/TEST-DATA-STRATEGY.md).

## Summary (115 test cases)

| TC | Scenario | Type | Priority | Release | Covers |
|---|---|---|---|---|---|
| TS-07-001 | Phone normalization table: `01012345678`, `201012345678`, `+201012345678`, `00201012345678`, Arabic-Indic digits, spaces/dashes → `+201012345678`; invalid prefixes rejected | Unit | T1 | MVP | US-07-01-AC1, US-07-01-AC3 |
| TS-07-002 | Create patient returns 201, sequential `PAT-` code unique under 20 parallel creates | Integration | T1 | MVP | US-07-01-AC1 |
| TS-07-003 | Approximate age → birth year using branch time zone business date | Unit | T1 | MVP | US-07-01-AC2 |
| TS-07-004 | Stale ETag update → 412, data unchanged; missing ETag → 428 | Integration | T1 | MVP | US-07-01-AC4 |
| TS-07-005 | Update writes audit entry with field names and no values | Integration | T1 | MVP | US-07-01-AC5 |
| TS-07-006 | Deactivate/reactivate with reason; DELETE → 405 | Integration | T1 | MVP | US-07-01-AC6 |
| TS-07-007 | National ID rejected when setting OFF | Integration | T1 | MVP | US-07-01-AC7 |
| TS-07-008 | 403 without permission; CS-08 cross-org GET/PUT/deactivate → 404 with empty body data | Security | T0 | MVP | US-07-01-AC8, US-07-01-AC9 |
| TS-07-009 | Phone exact match across 4 input formats returns all patients sharing the number | Integration | T1 | MVP | US-07-02-AC1 |
| TS-07-010 | Suffix search 6–10 digits returns only suffix matches | Integration | T1 | MVP | US-07-02-AC2 |
| TS-07-011 | Arabic normalization corpus (≥ 200 pairs, NFR-07-004) | Unit | T1 | MVP | US-07-02-AC3 |
| TS-07-012 | Code search case-insensitive exact | Integration | T1 | MVP | US-07-02-AC4 |
| TS-07-013 | Search response schema contains only allowed fields; no access-log row created | Contract | T1 | MVP | US-07-02-AC5 |
| TS-07-014 | Too-short terms → 400 | Integration | T1 | MVP | US-07-02-AC6 |
| TS-07-015 | Status filtering for Inactive/Merged/Anonymized | Integration | T1 | MVP | US-07-02-AC7 |
| TS-07-016 | 403 without permission; CS-08 no foreign-org results | Security | T0 | MVP | US-07-02-AC8, US-07-02-AC9 |
| TS-07-017 | p95 ≤ 300 ms at 500,000 patients (NFR-07-001) | Performance | T1 | MVP | US-07-02-AC1, US-07-02-AC3 |
| TS-07-018 | Grant consent; effective status computed from latest event | Integration | T1 | MVP | US-07-03-AC1 |
| TS-07-019 | Withdraw creates second event; DB role cannot UPDATE consent rows | Integration | T1 | MVP | US-07-03-AC2 |
| TS-07-020 | Duplicate state → 409 | Integration | T1 | MVP | US-07-03-AC3 |
| TS-07-021 | Allergy write without consent → 422; with setting OFF → 201 | Integration | T1 | MVP | US-07-03-AC4 |
| TS-07-022 | Facade returns effective notification consent | Unit | T1 | MVP | US-07-03-AC5 |
| TS-07-023 | 403 for read-only user; CS-08 → 404 | Security | T0 | MVP | US-07-03-AC6, US-07-03-AC7 |
| TS-07-024 | Record ingredient allergy; allergy status derived; audit without values | Integration | T1 | MVP | US-07-04-AC1 |
| TS-07-025 | Free-text allergy stored | Integration | T1 | MVP | US-07-04-AC2 |
| TS-07-026 | Duplicate active ingredient → 409 (partial unique index under 2 parallel posts) | Integration | T1 | MVP | US-07-04-AC3 |
| TS-07-027 | Foreign/unknown ingredient → 422 | Integration | T1 | MVP | US-07-04-AC4 |
| TS-07-028 | EnteredInError lifecycle, DELETE → 405, status recomputed | Integration | T1 | MVP | US-07-04-AC5 |
| TS-07-029 | NKA rejected with active allergy; accepted when none | Integration | T1 | MVP | US-07-04-AC6 |
| TS-07-030 | One access-log row per GET with correct categories | Integration | T1 | MVP | US-07-04-AC7 |
| TS-07-031 | 403 for profiles-only user, no log row; CS-08 → 404 | Security | T0 | MVP | US-07-04-AC8, US-07-04-AC9 |
| TS-07-032 | Parameterized over every medical endpoint: one log row per 200 response, none on 4xx | Integration | T1 | MVP | US-07-05-AC1 |
| TS-07-033 | Fault injection on log write → 503 with no medical fields in body | Integration | T1 | MVP | US-07-05-AC2 |
| TS-07-034 | Demographic detail writes no log row | Integration | T1 | MVP | US-07-05-AC3 |
| TS-07-035 | Access log listing, filters, cursor, audit of the view | Integration | T1 | MVP | US-07-05-AC4 |
| TS-07-036 | DB privilege test: UPDATE/DELETE denied on access logs (NFR-07-009) | Security | T0 | MVP | US-07-05-AC5 |
| TS-07-037 | Audit entry and Serilog output contain no medical values (NFR-07-008) | Security | T0 | MVP | US-07-05-AC6 |
| TS-07-038 | 403 without permission; CS-08 → 404 | Security | T0 | MVP | US-07-05-AC7, US-07-05-AC8 |
| TS-07-039 | Log write overhead ≤ 20 ms p95 (NFR-07-003) | Performance | T1 | MVP | US-07-05-AC1 |
| TS-07-040 | POS search by phone, link, complete sale; purchase history shows sale | E2E | T1 | MVP | US-07-06-AC1 |
| TS-07-041 | Quick-create with name + phone links patient within POS | E2E | T1 | MVP | US-07-06-AC2 |
| TS-07-042 | Facade rejects Inactive/Anonymized; sale rolled back (no sale row, no stock movement) | Integration | T1 | MVP | US-07-06-AC3 |
| TS-07-043 | Merged patient → 422 with surviving id | Integration | T1 | MVP | US-07-06-AC4 |
| TS-07-044 | Quick-create 403; sale without patient still completes | Security | T0 | MVP | US-07-06-AC5 |
| TS-07-045 | CS-08 foreign patient id → 404, no sale | Security | T0 | MVP | US-07-06-AC6 |
| TS-07-046 | Exact ingredient match on multi-ingredient medicine; access log `AllergyCheck` | Integration | T1 | MVP | US-07-07-AC1 |
| TS-07-047 | Matching ignores related-but-different ingredients (fixture data only) | Unit | T1 | MVP | US-07-07-AC2 |
| TS-07-048 | Free-text allergy counted, not matched | Integration | T1 | MVP | US-07-07-AC3 |
| TS-07-049 | Response minimization by permission | Contract | T1 | MVP | US-07-07-AC4 |
| TS-07-050 | Completion without ack → 422; no sale/stock/payment rows | Integration | T1 | MVP | US-07-07-AC5 |
| TS-07-051 | Override ack committed with sale; injected sale failure leaves no ack row | Integration | T1 | MVP | US-07-07-AC6 |
| TS-07-052 | `Other` without text → 400 | Integration | T1 | MVP | US-07-07-AC7 |
| TS-07-053 | Block mode rejects with/without ack; succeeds after removing line | Integration | T1 | MVP | US-07-07-AC8 |
| TS-07-054 | Allergy added between check and completion caught by server re-check | Integration | T1 | MVP | US-07-07-AC9 |
| TS-07-055 | CS-07 unassigned branch → 403; CS-08 foreign patient → 404 | Security | T0 | MVP | US-07-07-AC10, US-07-07-AC11 |
| TS-07-056 | Ack without permission (session or override) → 403; payload user id ignored | Security | T0 | MVP | US-07-07-AC12 |
| TS-07-057 | Check of 50 medicines p95 ≤ 200 ms (NFR-07-002) | Performance | T1 | MVP | US-07-07-AC1 |
| TS-07-058 | Record condition; audit without name value | Integration | T2 | V1 | US-07-08-AC1 |
| TS-07-059 | Status lifecycle with reasons; DELETE → 405 | Integration | T2 | V1 | US-07-08-AC2 |
| TS-07-060 | No condition rows created by sales/dispensing events | Integration | T2 | V1 | US-07-08-AC3 |
| TS-07-061 | Consent gate → 422 | Integration | T2 | V1 | US-07-08-AC4 |
| TS-07-062 | Onset year validation | Unit | T2 | V1 | US-07-08-AC5 |
| TS-07-063 | Logged read; 403 for cashier; CS-08 → 404 | Security | T1 | V1 | US-07-08-AC6, US-07-08-AC7 |
| TS-07-064 | Add note; audit excludes text | Integration | T2 | V1 | US-07-09-AC1 |
| TS-07-065 | Amendment chain, original unchanged | Integration | T2 | V1 | US-07-09-AC2 |
| TS-07-066 | PUT/PATCH/DELETE → 405 | Integration | T2 | V1 | US-07-09-AC3 |
| TS-07-067 | Length and same-patient amendment validation | Unit | T2 | V1 | US-07-09-AC4 |
| TS-07-068 | 403 for cashier; logged read; CS-08 → 404 | Security | T1 | V1 | US-07-09-AC5, US-07-09-AC6 |
| TS-07-069 | Medication history across 2 branches with partial return and prescription link; logged | Integration | T2 | V1 | US-07-10-AC1 |
| TS-07-070 | Voided filter behaviour | Integration | T2 | V1 | US-07-10-AC2 |
| TS-07-071 | Write verbs → 405 | Integration | T2 | V1 | US-07-10-AC3 |
| TS-07-072 | Purchase history branch-limited, no lines, no access log | Integration | T2 | V1 | US-07-10-AC4 |
| TS-07-073 | 403 for missing medical/sales permissions | Security | T1 | V1 | US-07-10-AC5 |
| TS-07-074 | CS-08 → 404; CS-07 opening sale of unassigned branch → 403 | Security | T1 | V1 | US-07-10-AC6 |
| TS-07-075 | List with progress; logged | Integration | T2 | V1 | US-07-11-AC1 |
| TS-07-076 | Missing prescriptions permission → 403, no log | Security | T1 | V1 | US-07-11-AC2 |
| TS-07-077 | Response contains no images or editable fields | Contract | T2 | V1 | US-07-11-AC3 |
| TS-07-078 | CS-08 → 404 | Security | T1 | V1 | US-07-11-AC4 |
| TS-07-079 | Timeline merge order, cursor stability, logged | Integration | T3 | Future | US-07-12-AC1 |
| TS-07-080 | Profiles-only user sees non-medical events only; no log row | Security | T3 | Future | US-07-12-AC2 |
| TS-07-081 | Type filter | Integration | T3 | Future | US-07-12-AC3 |
| TS-07-082 | Invalid type → 400 | Integration | T3 | Future | US-07-12-AC4 |
| TS-07-083 | 403 without permission; CS-08 → 404 | Security | T3 | Future | US-07-12-AC5, US-07-12-AC6 |
| TS-07-084 | Settings update audited with old/new; Block mode takes effect on next sale | Integration | T2 | V1 | US-07-13-AC1 |
| TS-07-085 | 403 for non-owner | Security | T1 | V1 | US-07-13-AC2 |
| TS-07-086 | National ID encrypted at rest (DB dump scan), masked in responses (NFR-07-007) | Security | T1 | V1 | US-07-13-AC3 |
| TS-07-087 | Reveal returns full value, no-store header, access-log `Reveal` | Integration | T2 | V1 | US-07-13-AC4 |
| TS-07-088 | 14-digit validation incl. Arabic-Indic digits | Unit | T2 | V1 | US-07-13-AC5 |
| TS-07-089 | OFF hides values; reveal → 400 | Integration | T2 | V1 | US-07-13-AC6 |
| TS-07-090 | CS-08 reveal → 404 | Security | T1 | V1 | US-07-13-AC7 |
| TS-07-091 | Same phone → 409 with masked candidates; no row created | Integration | T3 | Future | US-07-14-AC1 |
| TS-07-092 | Confirm override → 201, audit flag | Integration | T3 | Future | US-07-14-AC2 |
| TS-07-093 | Normalized name + birth year match | Integration | T3 | Future | US-07-14-AC3 |
| TS-07-094 | Candidate list reasons, exclusions, de-duplicated pairs | Integration | T3 | Future | US-07-14-AC4 |
| TS-07-095 | 403 without merge permission; CS-08 no foreign candidates | Security | T3 | Future | US-07-14-AC5, US-07-14-AC6 |
| TS-07-096 | Records re-pointed, status Merged, audit counts, no sale/prescription rows modified | Integration | T3 | Future | US-07-15-AC1 |
| TS-07-097 | History, timeline, allergy check include source records | Integration | T3 | Future | US-07-15-AC2 |
| TS-07-098 | Consent most-restrictive rule matrix (4 combinations × 2 purposes) | Unit | T3 | Future | US-07-15-AC3 |
| TS-07-099 | Same/merged/anonymized rejections; duplicate allergy inactivation | Integration | T3 | Future | US-07-15-AC4 |
| TS-07-100 | CS-11 replay and key reuse | Integration | T3 | Future | US-07-15-AC5 |
| TS-07-101 | Two parallel merges of one source → exactly one succeeds | Concurrency | T3 | Future | US-07-15-AC4 |
| TS-07-102 | 403 without permission; CS-08 → 404 | Security | T3 | Future | US-07-15-AC6, US-07-15-AC7 |
| TS-07-103 | Request → 202 Queued, audit entry | Integration | T3 | V1 | US-07-16-AC1 |
| TS-07-104 | Export JSON schema, exclusions, access log `Export`; ≤ 60 s for 5,000 entries (NFR-07-005) | Integration | T3 | V1 | US-07-16-AC2 |
| TS-07-105 | Pre-signed URL 15-minute validity and re-issue | Integration | T3 | V1 | US-07-16-AC3 |
| TS-07-106 | Not ready → 409; 7-day cleanup job → 410 | Integration | T3 | V1 | US-07-16-AC4 |
| TS-07-107 | CS-11 idempotent export request | Integration | T3 | V1 | US-07-16-AC5 |
| TS-07-108 | 403 without permission; CS-08 → 404 | Security | T3 | V1 | US-07-16-AC6, US-07-16-AC7 |
| TS-07-109 | Field scan after anonymization: all FR-07-039 personal fields null/cleared within 10 s (NFR-07-006) | Integration | T3 | V1 | US-07-17-AC1 |
| TS-07-110 | Sales, prescriptions, consents, access logs retained and linked | Integration | T3 | V1 | US-07-17-AC2 |
| TS-07-111 | Active prescription / controlled-register entry → 409 with reasons | Integration | T3 | V1 | US-07-17-AC3 |
| TS-07-112 | Confirmation mismatch → 400 | Integration | T3 | V1 | US-07-17-AC4 |
| TS-07-113 | Post-anonymization writes/links → 422; search returns nothing | Integration | T3 | V1 | US-07-17-AC5 |
| TS-07-114 | CS-11 replay | Integration | T3 | V1 | US-07-17-AC6 |
| TS-07-115 | 403 without permission; CS-08 → 404 | Security | T3 | V1 | US-07-17-AC7, US-07-17-AC8 |

---

## US-07-01: Create and Maintain Patient Profile

### TS-07-001: Phone normalization table: `01012345678`, `201012345678`, `+201012345678`, `00201012345678`, Arabic-Indic digits, spaces/dashes → `+201012345678`; invalid prefixes rejected

| Field | Value |
|---|---|
| Story | [US-07-01](../stories/EPIC-07-PATIENT-RECORDS/US-07-01-create-and-maintain-patient-profile.md) — Create and Maintain Patient Profile |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-07-01-AC1, US-07-01-AC3 |
| Requirements | FR-07-001, FR-07-002, FR-07-003, FR-07-004, FR-07-005 |

**Story preconditions**
- The user is authenticated and belongs to an organization with at least one active branch.
- Organization setting `CollectNationalId` exists (default OFF).

**US-07-01-AC1 — Create patient with normalized phone**

*Preconditions / test data*
1. a user with `patients.profiles.manage`

*Steps*
1. they POST `/api/v1/patients` with `fullName` "منى عبد الله" and `mobilePhone` "0101 234-5678"

*Expected results*
1. the response is 201 with `mobilePhone` "+201012345678", a `patientCode` matching `PAT-\d{6}` unique in the organization, `status` "Active", `allergyStatus` "Unknown", and an `ETag` header

**US-07-01-AC3 — Invalid phone rejected**

*Preconditions / test data*
1. a user with `patients.profiles.manage`

*Steps*
1. they create a patient with `mobilePhone` "0131234567"

*Expected results*
1. the response is 400 `PATIENTS.INVALID_PHONE` and no patient or patient code is created

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-002: Create patient returns 201, sequential `PAT-` code unique under 20 parallel creates

| Field | Value |
|---|---|
| Story | [US-07-01](../stories/EPIC-07-PATIENT-RECORDS/US-07-01-create-and-maintain-patient-profile.md) — Create and Maintain Patient Profile |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-07-01-AC1 |
| Requirements | FR-07-001, FR-07-002, FR-07-003, FR-07-004, FR-07-005 |

**Story preconditions**
- The user is authenticated and belongs to an organization with at least one active branch.
- Organization setting `CollectNationalId` exists (default OFF).

**US-07-01-AC1 — Create patient with normalized phone**

*Preconditions / test data*
1. a user with `patients.profiles.manage`

*Steps*
1. they POST `/api/v1/patients` with `fullName` "منى عبد الله" and `mobilePhone` "0101 234-5678"

*Expected results*
1. the response is 201 with `mobilePhone` "+201012345678", a `patientCode` matching `PAT-\d{6}` unique in the organization, `status` "Active", `allergyStatus` "Unknown", and an `ETag` header

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-003: Approximate age → birth year using branch time zone business date

| Field | Value |
|---|---|
| Story | [US-07-01](../stories/EPIC-07-PATIENT-RECORDS/US-07-01-create-and-maintain-patient-profile.md) — Create and Maintain Patient Profile |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-07-01-AC2 |
| Requirements | FR-07-001, FR-07-002, FR-07-003, FR-07-004, FR-07-005 |

**Story preconditions**
- The user is authenticated and belongs to an organization with at least one active branch.
- Organization setting `CollectNationalId` exists (default OFF).

**US-07-01-AC2 — Approximate age stored as year of birth**

*Preconditions / test data*
1. a user with `patients.profiles.manage` and branch business date 2026-11-09

*Steps*
1. they create a patient with `approximateAgeYears` = 60

*Expected results*
1. the patient is stored with `birthYear` = 1966, `birthDatePrecision` = "YearOnly", and `dateOfBirth` = null

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-004: Stale ETag update → 412, data unchanged; missing ETag → 428

| Field | Value |
|---|---|
| Story | [US-07-01](../stories/EPIC-07-PATIENT-RECORDS/US-07-01-create-and-maintain-patient-profile.md) — Create and Maintain Patient Profile |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-07-01-AC4 |
| Requirements | FR-07-001, FR-07-002, FR-07-003, FR-07-004, FR-07-005 |

**Story preconditions**
- The user is authenticated and belongs to an organization with at least one active branch.
- Organization setting `CollectNationalId` exists (default OFF).

**US-07-01-AC4 — Update with stale ETag rejected**

*Preconditions / test data*
1. patient P was updated by another user after the caller read ETag E1

*Steps*
1. the caller PUTs `/api/v1/patients/{P}` with `If-Match: E1`

*Expected results*
1. the response is 412 `COMMON.CONCURRENCY_CONFLICT` and the stored data is unchanged

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-005: Update writes audit entry with field names and no values

| Field | Value |
|---|---|
| Story | [US-07-01](../stories/EPIC-07-PATIENT-RECORDS/US-07-01-create-and-maintain-patient-profile.md) — Create and Maintain Patient Profile |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-07-01-AC5 |
| Requirements | FR-07-001, FR-07-002, FR-07-003, FR-07-004, FR-07-005 |

**Story preconditions**
- The user is authenticated and belongs to an organization with at least one active branch.
- Organization setting `CollectNationalId` exists (default OFF).

**US-07-01-AC5 — Successful update is audited without values**

*Preconditions / test data*
1. a user with `patients.profiles.manage` and the current ETag

*Steps*
1. they change `email` and `addressLine`

*Expected results*
1. the response is 200 with a new ETag and one audit entry lists changed fields `["email","addressLine"]`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-006: Deactivate/reactivate with reason; DELETE → 405

| Field | Value |
|---|---|
| Story | [US-07-01](../stories/EPIC-07-PATIENT-RECORDS/US-07-01-create-and-maintain-patient-profile.md) — Create and Maintain Patient Profile |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-07-01-AC6 |
| Requirements | FR-07-001, FR-07-002, FR-07-003, FR-07-004, FR-07-005 |

**Story preconditions**
- The user is authenticated and belongs to an organization with at least one active branch.
- Organization setting `CollectNationalId` exists (default OFF).

**US-07-01-AC6 — Deactivate and reactivate; no hard delete**

*Preconditions / test data*
1. an `Active` patient P

*Steps*
1. the user POSTs `/deactivate` with reason "Moved abroad" and later `/reactivate`

*Expected results*
1. status becomes `Inactive` then `Active`, both changes are audited, and `DELETE /api/v1/patients/{P}` returns 405

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-007: National ID rejected when setting OFF

| Field | Value |
|---|---|
| Story | [US-07-01](../stories/EPIC-07-PATIENT-RECORDS/US-07-01-create-and-maintain-patient-profile.md) — Create and Maintain Patient Profile |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-07-01-AC7 |
| Requirements | FR-07-001, FR-07-002, FR-07-003, FR-07-004, FR-07-005 |

**Story preconditions**
- The user is authenticated and belongs to an organization with at least one active branch.
- Organization setting `CollectNationalId` exists (default OFF).

**US-07-01-AC7 — National ID rejected while collection is OFF**

*Preconditions / test data*
1. `CollectNationalId` is OFF

*Steps*
1. a patient is created with `nationalId` "29001011234567"

*Expected results*
1. the response is 400 `PATIENTS.NATIONAL_ID_DISABLED` and no patient is created

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-008: 403 without permission; CS-08 cross-org GET/PUT/deactivate → 404 with empty body data

| Field | Value |
|---|---|
| Story | [US-07-01](../stories/EPIC-07-PATIENT-RECORDS/US-07-01-create-and-maintain-patient-profile.md) — Create and Maintain Patient Profile |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-07-01-AC8, US-07-01-AC9 |
| Critical scenario | CS-08 |
| Requirements | FR-07-001, FR-07-002, FR-07-003, FR-07-004, FR-07-005 |

**Story preconditions**
- The user is authenticated and belongs to an organization with at least one active branch.
- Organization setting `CollectNationalId` exists (default OFF).

**US-07-01-AC8 — Permission denied**

*Preconditions / test data*
1. an `INVENTORY` user without `patients.profiles.manage`

*Steps*
1. they POST `/api/v1/patients`

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN`

**US-07-01-AC9 — Cross-organization access hidden (CS-08)**

*Preconditions / test data*
1. patient P belongs to organization A

*Steps*
1. a user of organization B with all patient permissions GETs or PUTs `/api/v1/patients/{P}`

*Expected results*
1. the response is 404 `PATIENTS.NOT_FOUND` with no patient data

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-07-02: Search Patients by Phone, Name, and Code

### TS-07-009: Phone exact match across 4 input formats returns all patients sharing the number

| Field | Value |
|---|---|
| Story | [US-07-02](../stories/EPIC-07-PATIENT-RECORDS/US-07-02-search-patients.md) — Search Patients by Phone, Name, and Code |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-07-02-AC1 |
| Requirements | FR-07-002, FR-07-006, FR-07-007, FR-07-008, FR-07-009 |

**Story preconditions**
- Patients exist in the organization (US-07-01).

**US-07-02-AC1 — Search by full phone in any accepted format**

*Preconditions / test data*
1. patient P with phone "+201012345678"

*Steps*
1. a user with `patients.profiles.read` GETs `/api/v1/patients?phone=00201012345678`

*Expected results*
1. P is returned, together with every other patient sharing that number

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-010: Suffix search 6–10 digits returns only suffix matches

| Field | Value |
|---|---|
| Story | [US-07-02](../stories/EPIC-07-PATIENT-RECORDS/US-07-02-search-patients.md) — Search Patients by Phone, Name, and Code |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-07-02-AC2 |
| Requirements | FR-07-002, FR-07-006, FR-07-007, FR-07-008, FR-07-009 |

**Story preconditions**
- Patients exist in the organization (US-07-01).

**US-07-02-AC2 — Search by phone suffix**

*Preconditions / test data*
1. patients with phones ending "345678" and others not

*Steps*
1. the user searches `phone=345678`

*Expected results*
1. only patients whose phone ends with "345678" are returned

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-011: Arabic normalization corpus (≥ 200 pairs, NFR-07-004)

| Field | Value |
|---|---|
| Story | [US-07-02](../stories/EPIC-07-PATIENT-RECORDS/US-07-02-search-patients.md) — Search Patients by Phone, Name, and Code |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-07-02-AC3 |
| Requirements | FR-07-002, FR-07-006, FR-07-007, FR-07-008, FR-07-009 |

**Story preconditions**
- Patients exist in the organization (US-07-01).

**US-07-02-AC3 — Arabic name normalization**

*Preconditions / test data*
1. patient "أحمد مُصطفى عليّ"

*Steps*
1. the user searches `q=احمد مصطفي` or `q=مصطفى أَحمد`

*Expected results*
1. the patient is returned in both cases

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-012: Code search case-insensitive exact

| Field | Value |
|---|---|
| Story | [US-07-02](../stories/EPIC-07-PATIENT-RECORDS/US-07-02-search-patients.md) — Search Patients by Phone, Name, and Code |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-07-02-AC4 |
| Requirements | FR-07-002, FR-07-006, FR-07-007, FR-07-008, FR-07-009 |

**Story preconditions**
- Patients exist in the organization (US-07-01).

**US-07-02-AC4 — Search by patient code**

*Preconditions / test data*
1. patient code "PAT-000123"

*Steps*
1. the user searches `code=pat-000123`

*Expected results*
1. exactly that patient is returned

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-013: Search response schema contains only allowed fields; no access-log row created

| Field | Value |
|---|---|
| Story | [US-07-02](../stories/EPIC-07-PATIENT-RECORDS/US-07-02-search-patients.md) — Search Patients by Phone, Name, and Code |
| Type / Execution | Contract / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-07-02-AC5 |
| Requirements | FR-07-002, FR-07-006, FR-07-007, FR-07-008, FR-07-009 |

**Story preconditions**
- Patients exist in the organization (US-07-01).

**US-07-02-AC5 — List results are masked**

*Preconditions / test data*
1. any successful search

*Steps*
1. results are returned

*Expected results*
1. each item contains only `id`, `patientCode`, `fullName`, `maskedPhone` (e.g., "•••••••5678"), `ageYears`, `status`
2. no email, address, date of birth, national ID, allergy status, or other medical data
3. and no `PatientAccessLog` entry is written

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-014: Too-short terms → 400

| Field | Value |
|---|---|
| Story | [US-07-02](../stories/EPIC-07-PATIENT-RECORDS/US-07-02-search-patients.md) — Search Patients by Phone, Name, and Code |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-07-02-AC6 |
| Requirements | FR-07-002, FR-07-006, FR-07-007, FR-07-008, FR-07-009 |

**Story preconditions**
- Patients exist in the organization (US-07-01).

**US-07-02-AC6 — Search term too short**

*Preconditions / test data*
1. a user with `patients.profiles.read`

*Steps*
1. they search `q=أ` or `phone=1234`

*Expected results*
1. the response is 400 `PATIENTS.SEARCH_TERM_TOO_SHORT`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-015: Status filtering for Inactive/Merged/Anonymized

| Field | Value |
|---|---|
| Story | [US-07-02](../stories/EPIC-07-PATIENT-RECORDS/US-07-02-search-patients.md) — Search Patients by Phone, Name, and Code |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-07-02-AC7 |
| Requirements | FR-07-002, FR-07-006, FR-07-007, FR-07-008, FR-07-009 |

**Story preconditions**
- Patients exist in the organization (US-07-01).

**US-07-02-AC7 — Inactive, merged, anonymized handling**

*Preconditions / test data*
1. an `Inactive` patient and a `Merged` patient matching the query

*Steps*
1. the user searches without `includeInactive`

*Expected results*
1. neither is returned
2. with `includeInactive=true` the `Inactive` patient is returned and `Merged`/`Anonymized` patients are never returned

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-016: 403 without permission; CS-08 no foreign-org results

| Field | Value |
|---|---|
| Story | [US-07-02](../stories/EPIC-07-PATIENT-RECORDS/US-07-02-search-patients.md) — Search Patients by Phone, Name, and Code |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-07-02-AC8, US-07-02-AC9 |
| Critical scenario | CS-08 |
| Requirements | FR-07-002, FR-07-006, FR-07-007, FR-07-008, FR-07-009 |

**Story preconditions**
- Patients exist in the organization (US-07-01).

**US-07-02-AC8 — Permission denied**

*Preconditions / test data*
1. an `ACCOUNTANT` user without `patients.profiles.read`

*Steps*
1. they call the search endpoint

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN`

**US-07-02-AC9 — Organization isolation (CS-08)**

*Preconditions / test data*
1. organization B has a patient with phone "+201012345678"

*Steps*
1. a user of organization A searches that phone

*Expected results*
1. no organization B patient appears in results

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-017: p95 ≤ 300 ms at 500,000 patients (NFR-07-001)

| Field | Value |
|---|---|
| Story | [US-07-02](../stories/EPIC-07-PATIENT-RECORDS/US-07-02-search-patients.md) — Search Patients by Phone, Name, and Code |
| Type / Execution | Performance / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-07-02-AC1, US-07-02-AC3 |
| Requirements | FR-07-002, FR-07-006, FR-07-007, FR-07-008, FR-07-009 |

**Story preconditions**
- Patients exist in the organization (US-07-01).

**US-07-02-AC1 — Search by full phone in any accepted format**

*Preconditions / test data*
1. patient P with phone "+201012345678"

*Steps*
1. a user with `patients.profiles.read` GETs `/api/v1/patients?phone=00201012345678`

*Expected results*
1. P is returned, together with every other patient sharing that number

**US-07-02-AC3 — Arabic name normalization**

*Preconditions / test data*
1. patient "أحمد مُصطفى عليّ"

*Steps*
1. the user searches `q=احمد مصطفي` or `q=مصطفى أَحمد`

*Expected results*
1. the patient is returned in both cases

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-07-03: Record Patient Consent for Medical Data and Notifications

### TS-07-018: Grant consent; effective status computed from latest event

| Field | Value |
|---|---|
| Story | [US-07-03](../stories/EPIC-07-PATIENT-RECORDS/US-07-03-record-patient-consent.md) — Record Patient Consent for Medical Data and Notifications |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-07-03-AC1 |
| Requirements | FR-07-010, FR-07-011, FR-07-012 |

**Story preconditions**
- Patient exists and is `Active`.
- `RequireConsentForMedicalData` is ON (default).

**US-07-03-AC1 — Record consent grant**

*Preconditions / test data*
1. patient P with no consent events

*Steps*
1. a user with `patients.profiles.manage` POSTs `/api/v1/patients/{P}/consents` with `purpose` "MedicalDataStorage", `status` "Granted", `method` "Verbal"

*Expected results*
1. the response is 201, the event records the user, branch context, and timestamp, and GET `/consents` shows effective `MedicalDataStorage` = "Granted"

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-019: Withdraw creates second event; DB role cannot UPDATE consent rows

| Field | Value |
|---|---|
| Story | [US-07-03](../stories/EPIC-07-PATIENT-RECORDS/US-07-03-record-patient-consent.md) — Record Patient Consent for Medical Data and Notifications |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-07-03-AC2 |
| Requirements | FR-07-010, FR-07-011, FR-07-012 |

**Story preconditions**
- Patient exists and is `Active`.
- `RequireConsentForMedicalData` is ON (default).

**US-07-03-AC2 — Withdrawal is a new event**

*Preconditions / test data*
1. P has effective `Notifications` = "Granted"

*Steps*
1. the user records `Notifications` = "Withdrawn"

*Expected results*
1. the consent history contains both events in order, the effective status is "Withdrawn", and no event is modified or deleted

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-020: Duplicate state → 409

| Field | Value |
|---|---|
| Story | [US-07-03](../stories/EPIC-07-PATIENT-RECORDS/US-07-03-record-patient-consent.md) — Record Patient Consent for Medical Data and Notifications |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-07-03-AC3 |
| Requirements | FR-07-010, FR-07-011, FR-07-012 |

**Story preconditions**
- Patient exists and is `Active`.
- `RequireConsentForMedicalData` is ON (default).

**US-07-03-AC3 — Unchanged state rejected**

*Preconditions / test data*
1. P has effective `MedicalDataStorage` = "Granted"

*Steps*
1. the user records "Granted" again for the same purpose

*Expected results*
1. the response is 409 `PATIENTS.CONSENT_STATE_UNCHANGED`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-021: Allergy write without consent → 422; with setting OFF → 201

| Field | Value |
|---|---|
| Story | [US-07-03](../stories/EPIC-07-PATIENT-RECORDS/US-07-03-record-patient-consent.md) — Record Patient Consent for Medical Data and Notifications |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-07-03-AC4 |
| Requirements | FR-07-010, FR-07-011, FR-07-012 |

**Story preconditions**
- Patient exists and is `Active`.
- `RequireConsentForMedicalData` is ON (default).

**US-07-03-AC4 — Medical write blocked without consent**

*Preconditions / test data*
1. `RequireConsentForMedicalData` is ON and P has no `MedicalDataStorage` grant

*Steps*
1. a pharmacist POSTs an allergy for P

*Expected results*
1. the response is 422 `PATIENTS.CONSENT_REQUIRED` and no allergy is stored

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-022: Facade returns effective notification consent

| Field | Value |
|---|---|
| Story | [US-07-03](../stories/EPIC-07-PATIENT-RECORDS/US-07-03-record-patient-consent.md) — Record Patient Consent for Medical Data and Notifications |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-07-03-AC5 |
| Requirements | FR-07-010, FR-07-011, FR-07-012 |

**Story preconditions**
- Patient exists and is `Active`.
- `RequireConsentForMedicalData` is ON (default).

**US-07-03-AC5 — Notification consent exposed to SPEC-10**

*Preconditions / test data*
1. P's effective `Notifications` = "Withdrawn"

*Steps*
1. SPEC-10 calls the facade `GetNotificationConsent(P)`

*Expected results*
1. it returns "Withdrawn" and SPEC-10 sends no patient-directed notification

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-023: 403 for read-only user; CS-08 → 404

| Field | Value |
|---|---|
| Story | [US-07-03](../stories/EPIC-07-PATIENT-RECORDS/US-07-03-record-patient-consent.md) — Record Patient Consent for Medical Data and Notifications |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-07-03-AC6, US-07-03-AC7 |
| Critical scenario | CS-08 |
| Requirements | FR-07-010, FR-07-011, FR-07-012 |

**Story preconditions**
- Patient exists and is `Active`.
- `RequireConsentForMedicalData` is ON (default).

**US-07-03-AC6 — Permission denied**

*Preconditions / test data*
1. a user with `patients.profiles.read` only

*Steps*
1. they POST a consent event

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN`

**US-07-03-AC7 — Cross-organization (CS-08)**

*Preconditions / test data*
1. P belongs to organization A

*Steps*
1. a user from organization B GETs or POSTs `/api/v1/patients/{P}/consents`

*Expected results*
1. the response is 404 `PATIENTS.NOT_FOUND`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-07-04: Record and Manage Patient Allergies

### TS-07-024: Record ingredient allergy; allergy status derived; audit without values

| Field | Value |
|---|---|
| Story | [US-07-04](../stories/EPIC-07-PATIENT-RECORDS/US-07-04-record-and-manage-allergies.md) — Record and Manage Patient Allergies |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-07-04-AC1 |
| Requirements | FR-07-011, FR-07-013, FR-07-014, FR-07-015, FR-07-016, FR-07-017, FR-07-020 |

**Story preconditions**
- Patient `Active`; effective `MedicalDataStorage` consent `Granted` (when required).
- `ActiveIngredient` reference data exists in the organization's catalog (SPEC-03).

**US-07-04-AC1 — Record ingredient-based allergy**

*Preconditions / test data*
1. a pharmacist with `patients.medical.manage` and patient P with `allergyStatus` "Unknown"

*Steps*
1. they POST `/api/v1/patients/{P}/allergies` with `activeIngredientId` of "Amoxicillin", `reaction` "Skin rash", `severity` "Moderate", `source` "PatientReported"

*Expected results*
1. the response is 201 with `status` "Active", `recordedBy` = caller, P's `allergyStatus` becomes "HasAllergies", and the audit entry lists field names only (no reaction text)

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-025: Free-text allergy stored

| Field | Value |
|---|---|
| Story | [US-07-04](../stories/EPIC-07-PATIENT-RECORDS/US-07-04-record-and-manage-allergies.md) — Record and Manage Patient Allergies |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-07-04-AC2 |
| Requirements | FR-07-011, FR-07-013, FR-07-014, FR-07-015, FR-07-016, FR-07-017, FR-07-020 |

**Story preconditions**
- Patient `Active`; effective `MedicalDataStorage` consent `Granted` (when required).
- `ActiveIngredient` reference data exists in the organization's catalog (SPEC-03).

**US-07-04-AC2 — Record free-text allergy**

*Preconditions / test data*
1. the substance is not in the catalog

*Steps*
1. the pharmacist posts `substanceText` "Latex" with `severity` "Unknown"

*Expected results*
1. the allergy is stored with `substanceType` "FreeText" and `activeIngredientId` null

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-026: Duplicate active ingredient → 409 (partial unique index under 2 parallel posts)

| Field | Value |
|---|---|
| Story | [US-07-04](../stories/EPIC-07-PATIENT-RECORDS/US-07-04-record-and-manage-allergies.md) — Record and Manage Patient Allergies |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-07-04-AC3 |
| Requirements | FR-07-011, FR-07-013, FR-07-014, FR-07-015, FR-07-016, FR-07-017, FR-07-020 |

**Story preconditions**
- Patient `Active`; effective `MedicalDataStorage` consent `Granted` (when required).
- `ActiveIngredient` reference data exists in the organization's catalog (SPEC-03).

**US-07-04-AC3 — Duplicate active ingredient allergy rejected**

*Preconditions / test data*
1. P has an `Active` allergy to ingredient X

*Steps*
1. another `Active` allergy to X is posted

*Expected results*
1. the response is 409 `PATIENTS.DUPLICATE_ALLERGY`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-027: Foreign/unknown ingredient → 422

| Field | Value |
|---|---|
| Story | [US-07-04](../stories/EPIC-07-PATIENT-RECORDS/US-07-04-record-and-manage-allergies.md) — Record and Manage Patient Allergies |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-07-04-AC4 |
| Requirements | FR-07-011, FR-07-013, FR-07-014, FR-07-015, FR-07-016, FR-07-017, FR-07-020 |

**Story preconditions**
- Patient `Active`; effective `MedicalDataStorage` consent `Granted` (when required).
- `ActiveIngredient` reference data exists in the organization's catalog (SPEC-03).

**US-07-04-AC4 — Unknown ingredient rejected**

*Preconditions / test data*
1. an `activeIngredientId` from another organization or non-existent

*Steps*
1. the allergy is posted

*Expected results*
1. the response is 422 `PATIENTS.INGREDIENT_NOT_FOUND`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-028: EnteredInError lifecycle, DELETE → 405, status recomputed

| Field | Value |
|---|---|
| Story | [US-07-04](../stories/EPIC-07-PATIENT-RECORDS/US-07-04-record-and-manage-allergies.md) — Record and Manage Patient Allergies |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-07-04-AC5 |
| Requirements | FR-07-011, FR-07-013, FR-07-014, FR-07-015, FR-07-016, FR-07-017, FR-07-020 |

**Story preconditions**
- Patient `Active`; effective `MedicalDataStorage` consent `Granted` (when required).
- `ActiveIngredient` reference data exists in the organization's catalog (SPEC-03).

**US-07-04-AC5 — Mark entered-in-error; no deletion**

*Preconditions / test data*
1. an `Active` allergy A

*Steps*
1. the pharmacist POSTs `/allergies/{A}/status` with `status` "EnteredInError" and `reason` "Recorded on wrong patient"

*Expected results*
1. A remains stored with the new status and reason, is excluded from allergy checks, `DELETE` on A returns 405, and if no `Active` allergy remains, `allergyStatus` becomes "Unknown"

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-029: NKA rejected with active allergy; accepted when none

| Field | Value |
|---|---|
| Story | [US-07-04](../stories/EPIC-07-PATIENT-RECORDS/US-07-04-record-and-manage-allergies.md) — Record and Manage Patient Allergies |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-07-04-AC6 |
| Requirements | FR-07-011, FR-07-013, FR-07-014, FR-07-015, FR-07-016, FR-07-017, FR-07-020 |

**Story preconditions**
- Patient `Active`; effective `MedicalDataStorage` consent `Granted` (when required).
- `ActiveIngredient` reference data exists in the organization's catalog (SPEC-03).

**US-07-04-AC6 — No-known-allergies conflict**

*Preconditions / test data*
1. P has at least one `Active` allergy

*Steps*
1. the pharmacist PUTs `/allergy-status` with "NoKnownAllergies"

*Expected results*
1. the response is 409 `PATIENTS.ALLERGY_STATUS_CONFLICT`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-030: One access-log row per GET with correct categories

| Field | Value |
|---|---|
| Story | [US-07-04](../stories/EPIC-07-PATIENT-RECORDS/US-07-04-record-and-manage-allergies.md) — Record and Manage Patient Allergies |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-07-04-AC7 |
| Requirements | FR-07-011, FR-07-013, FR-07-014, FR-07-015, FR-07-016, FR-07-017, FR-07-020 |

**Story preconditions**
- Patient `Active`; effective `MedicalDataStorage` consent `Granted` (when required).
- `ActiveIngredient` reference data exists in the organization's catalog (SPEC-03).

**US-07-04-AC7 — Read is access-logged**

*Preconditions / test data*
1. a user with `patients.medical.read`

*Steps*
1. they GET `/api/v1/patients/{P}/allergies`

*Expected results*
1. exactly one `PatientAccessLog` row is written with `accessType` "View" and categories `["AllergyStatus","Allergies"]`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-031: 403 for profiles-only user, no log row; CS-08 → 404

| Field | Value |
|---|---|
| Story | [US-07-04](../stories/EPIC-07-PATIENT-RECORDS/US-07-04-record-and-manage-allergies.md) — Record and Manage Patient Allergies |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-07-04-AC8, US-07-04-AC9 |
| Critical scenario | CS-08 |
| Requirements | FR-07-011, FR-07-013, FR-07-014, FR-07-015, FR-07-016, FR-07-017, FR-07-020 |

**Story preconditions**
- Patient `Active`; effective `MedicalDataStorage` consent `Granted` (when required).
- `ActiveIngredient` reference data exists in the organization's catalog (SPEC-03).

**US-07-04-AC8 — Permission denied for demographics-only user**

*Preconditions / test data*
1. a cashier with `patients.profiles.read` but not `patients.medical.read`

*Steps*
1. they GET `/allergies`

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN`, no allergy data is returned, and no access-log row is written

**US-07-04-AC9 — Cross-organization (CS-08)**

*Preconditions / test data*
1. P belongs to organization A

*Steps*
1. a pharmacist of organization B GETs or POSTs allergies for P

*Expected results*
1. the response is 404 `PATIENTS.NOT_FOUND`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-07-05: Log and Review Medical Data Access

### TS-07-032: Parameterized over every medical endpoint: one log row per 200 response, none on 4xx

| Field | Value |
|---|---|
| Story | [US-07-05](../stories/EPIC-07-PATIENT-RECORDS/US-07-05-log-and-review-medical-data-access.md) — Log and Review Medical Data Access |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-07-05-AC1 |
| Requirements | FR-07-017, FR-07-018, FR-07-019, FR-07-020 |

**Story preconditions**
- At least one endpoint returns medical data (cross-cutting mechanism; verified first against allergies in US-07-04).

**US-07-05-AC1 — One log entry per medical response**

*Preconditions / test data*
1. a user with `patients.medical.read` working in branch B (header `X-Branch-Id`)

*Steps*
1. they request any endpoint that returns medical data for patient P

*Expected results*
1. exactly one `PatientAccessLog` row is persisted before the response with patient, user, organization, branch B, `accessType`, data categories, endpoint, `traceId`, and UTC timestamp

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-033: Fault injection on log write → 503 with no medical fields in body

| Field | Value |
|---|---|
| Story | [US-07-05](../stories/EPIC-07-PATIENT-RECORDS/US-07-05-log-and-review-medical-data-access.md) — Log and Review Medical Data Access |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-07-05-AC2 |
| Requirements | FR-07-017, FR-07-018, FR-07-019, FR-07-020 |

**Story preconditions**
- At least one endpoint returns medical data (cross-cutting mechanism; verified first against allergies in US-07-04).

**US-07-05-AC2 — Fail closed when log cannot be written**

*Preconditions / test data*
1. the access-log write fails (fault injected)

*Steps*
1. the user requests P's allergies

*Expected results*
1. the response is 503 `PATIENTS.ACCESS_LOG_UNAVAILABLE` and the body contains no medical data

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-034: Demographic detail writes no log row

| Field | Value |
|---|---|
| Story | [US-07-05](../stories/EPIC-07-PATIENT-RECORDS/US-07-05-log-and-review-medical-data-access.md) — Log and Review Medical Data Access |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-07-05-AC3 |
| Requirements | FR-07-017, FR-07-018, FR-07-019, FR-07-020 |

**Story preconditions**
- At least one endpoint returns medical data (cross-cutting mechanism; verified first against allergies in US-07-04).

**US-07-05-AC3 — Demographic reads are not access-logged**

*Preconditions / test data*
1. a user with `patients.profiles.read`

*Steps*
1. they GET `/api/v1/patients/{P}` (demographics only)

*Expected results*
1. no `PatientAccessLog` row is written

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-035: Access log listing, filters, cursor, audit of the view

| Field | Value |
|---|---|
| Story | [US-07-05](../stories/EPIC-07-PATIENT-RECORDS/US-07-05-log-and-review-medical-data-access.md) — Log and Review Medical Data Access |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-07-05-AC4 |
| Requirements | FR-07-017, FR-07-018, FR-07-019, FR-07-020 |

**Story preconditions**
- At least one endpoint returns medical data (cross-cutting mechanism; verified first against allergies in US-07-04).

**US-07-05-AC4 — Review access log**

*Preconditions / test data*
1. an owner with `patients.access-logs.read` and P has 120 log entries

*Steps*
1. they GET `/api/v1/patients/{P}/access-logs?limit=50&category=Allergies`

*Expected results*
1. entries are returned newest first, filtered to the category, with a `nextCursor`, showing user display name, branch, access type, categories, and time
2. and the view itself writes an audit log entry

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-036: DB privilege test: UPDATE/DELETE denied on access logs (NFR-07-009)

| Field | Value |
|---|---|
| Story | [US-07-05](../stories/EPIC-07-PATIENT-RECORDS/US-07-05-log-and-review-medical-data-access.md) — Log and Review Medical Data Access |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-07-05-AC5 |
| Requirements | FR-07-017, FR-07-018, FR-07-019, FR-07-020 |

**Story preconditions**
- At least one endpoint returns medical data (cross-cutting mechanism; verified first against allergies in US-07-04).

**US-07-05-AC5 — Logs are append-only**

*Preconditions / test data*
1. existing access-log rows

*Steps*
1. any application code path attempts UPDATE or DELETE on `patients.patient_access_logs`

*Expected results*
1. the database rejects it (no privilege) and the rows are unchanged

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-037: Audit entry and Serilog output contain no medical values (NFR-07-008)

| Field | Value |
|---|---|
| Story | [US-07-05](../stories/EPIC-07-PATIENT-RECORDS/US-07-05-log-and-review-medical-data-access.md) — Log and Review Medical Data Access |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-07-05-AC6 |
| Requirements | FR-07-017, FR-07-018, FR-07-019, FR-07-020 |

**Story preconditions**
- At least one endpoint returns medical data (cross-cutting mechanism; verified first against allergies in US-07-04).

**US-07-05-AC6 — Writes audited without medical values**

*Preconditions / test data*
1. a pharmacist edits an allergy reaction

*Steps*
1. the change is saved

*Expected results*
1. the audit log entry includes entity type, id, action, and `changedFields: ["reaction"]` but not the old or new reaction text

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-038: 403 without permission; CS-08 → 404

| Field | Value |
|---|---|
| Story | [US-07-05](../stories/EPIC-07-PATIENT-RECORDS/US-07-05-log-and-review-medical-data-access.md) — Log and Review Medical Data Access |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-07-05-AC7, US-07-05-AC8 |
| Critical scenario | CS-08 |
| Requirements | FR-07-017, FR-07-018, FR-07-019, FR-07-020 |

**Story preconditions**
- At least one endpoint returns medical data (cross-cutting mechanism; verified first against allergies in US-07-04).

**US-07-05-AC7 — Permission denied**

*Preconditions / test data*
1. a pharmacist without `patients.access-logs.read`

*Steps*
1. they GET `/access-logs`

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN`

**US-07-05-AC8 — Cross-organization (CS-08)**

*Preconditions / test data*
1. P belongs to organization A

*Steps*
1. an owner of organization B requests P's access logs

*Expected results*
1. the response is 404 `PATIENTS.NOT_FOUND`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-039: Log write overhead ≤ 20 ms p95 (NFR-07-003)

| Field | Value |
|---|---|
| Story | [US-07-05](../stories/EPIC-07-PATIENT-RECORDS/US-07-05-log-and-review-medical-data-access.md) — Log and Review Medical Data Access |
| Type / Execution | Performance / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-07-05-AC1 |
| Requirements | FR-07-017, FR-07-018, FR-07-019, FR-07-020 |

**Story preconditions**
- At least one endpoint returns medical data (cross-cutting mechanism; verified first against allergies in US-07-04).

**US-07-05-AC1 — One log entry per medical response**

*Preconditions / test data*
1. a user with `patients.medical.read` working in branch B (header `X-Branch-Id`)

*Steps*
1. they request any endpoint that returns medical data for patient P

*Expected results*
1. exactly one `PatientAccessLog` row is persisted before the response with patient, user, organization, branch B, `accessType`, data categories, endpoint, `traceId`, and UTC timestamp

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-07-06: Link a Patient to a Sale at the POS

### TS-07-040: POS search by phone, link, complete sale; purchase history shows sale

| Field | Value |
|---|---|
| Story | [US-07-06](../stories/EPIC-07-PATIENT-RECORDS/US-07-06-link-patient-to-sale.md) — Link a Patient to a Sale at the POS |
| Type / Execution | E2E / Manual |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-07-06-AC1 |
| Requirements | FR-07-001, FR-07-006, FR-07-021, FR-07-022 |

**Story preconditions**
- Cashier has an open cash session (SPEC-06) in branch B.

**US-07-06-AC1 — Find and link by phone**

*Preconditions / test data*
1. an `Active` patient P with phone "+201012345678"

*Steps*
1. the cashier searches "01012345678" at the POS, selects P, and completes the sale

*Expected results*
1. the completed sale stores `PatientId` = P and P's purchase history includes the sale

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-041: Quick-create with name + phone links patient within POS

| Field | Value |
|---|---|
| Story | [US-07-06](../stories/EPIC-07-PATIENT-RECORDS/US-07-06-link-patient-to-sale.md) — Link a Patient to a Sale at the POS |
| Type / Execution | E2E / Manual |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-07-06-AC2 |
| Requirements | FR-07-001, FR-07-006, FR-07-021, FR-07-022 |

**Story preconditions**
- Cashier has an open cash session (SPEC-06) in branch B.

**US-07-06-AC2 — Quick-create from POS**

*Preconditions / test data*
1. no patient matches the phone and the cashier has `patients.profiles.manage`

*Steps*
1. they POST `/api/v1/patients` with only `fullName` and `mobilePhone`

*Expected results*
1. the response is 201 with `id` and `patientCode`, and the POS cart shows the patient as linked without leaving the POS screen

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-042: Facade rejects Inactive/Anonymized; sale rolled back (no sale row, no stock movement)

| Field | Value |
|---|---|
| Story | [US-07-06](../stories/EPIC-07-PATIENT-RECORDS/US-07-06-link-patient-to-sale.md) — Link a Patient to a Sale at the POS |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-07-06-AC3 |
| Requirements | FR-07-001, FR-07-006, FR-07-021, FR-07-022 |

**Story preconditions**
- Cashier has an open cash session (SPEC-06) in branch B.

**US-07-06-AC3 — Inactive patient cannot be linked**

*Preconditions / test data*
1. patient P is `Inactive`

*Steps*
1. a sale referencing P is completed

*Expected results*
1. the facade rejects it, the sale fails with 422 `PATIENTS.PATIENT_INACTIVE`, and no sale is persisted

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-043: Merged patient → 422 with surviving id

| Field | Value |
|---|---|
| Story | [US-07-06](../stories/EPIC-07-PATIENT-RECORDS/US-07-06-link-patient-to-sale.md) — Link a Patient to a Sale at the POS |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-07-06-AC4 |
| Requirements | FR-07-001, FR-07-006, FR-07-021, FR-07-022 |

**Story preconditions**
- Cashier has an open cash session (SPEC-06) in branch B.

**US-07-06-AC4 — Merged patient redirected**

*Preconditions / test data*
1. patient S was merged into T

*Steps*
1. a sale referencing S is completed

*Expected results*
1. the response is 422 `PATIENTS.PATIENT_MERGED` with `survivingPatientId` = T

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-044: Quick-create 403; sale without patient still completes

| Field | Value |
|---|---|
| Story | [US-07-06](../stories/EPIC-07-PATIENT-RECORDS/US-07-06-link-patient-to-sale.md) — Link a Patient to a Sale at the POS |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-07-06-AC5 |
| Requirements | FR-07-001, FR-07-006, FR-07-021, FR-07-022 |

**Story preconditions**
- Cashier has an open cash session (SPEC-06) in branch B.

**US-07-06-AC5 — Quick-create permission denied**

*Preconditions / test data*
1. a cashier whose role lacks `patients.profiles.manage`

*Steps*
1. they attempt quick-create

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN` and the cashier can still complete the sale without a patient

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-045: CS-08 foreign patient id → 404, no sale

| Field | Value |
|---|---|
| Story | [US-07-06](../stories/EPIC-07-PATIENT-RECORDS/US-07-06-link-patient-to-sale.md) — Link a Patient to a Sale at the POS |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-07-06-AC6 |
| Critical scenario | CS-08 |
| Requirements | FR-07-001, FR-07-006, FR-07-021, FR-07-022 |

**Story preconditions**
- Cashier has an open cash session (SPEC-06) in branch B.

**US-07-06-AC6 — Foreign patient id at sale (CS-08)**

*Preconditions / test data*
1. patient P belongs to organization A

*Steps*
1. a cashier of organization B completes a sale with `patientId` = P

*Expected results*
1. the response is 404 `PATIENTS.NOT_FOUND` and no sale is persisted

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-07-07: Allergy Alert and Acknowledgement at POS and Dispensing

### TS-07-046: Exact ingredient match on multi-ingredient medicine; access log `AllergyCheck`

| Field | Value |
|---|---|
| Story | [US-07-07](../stories/EPIC-07-PATIENT-RECORDS/US-07-07-allergy-alert-and-acknowledgement.md) — Allergy Alert and Acknowledgement at POS and Dispensing |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-07-07-AC1 |
| Requirements | FR-07-017, FR-07-023, FR-07-024, FR-07-025, FR-07-026 |

**Story preconditions**
- A patient is linked to the cart (US-07-06).
- `AllergyAlertMode` setting exists (default `Warn`).

**US-07-07-AC1 — Exact ingredient match returned**

*Preconditions / test data*
1. patient P has an `Active` allergy to ingredient "Amoxicillin" and medicine M contains "Amoxicillin" and "Clavulanic acid"

*Steps*
1. a user with `sales.pos.sell` in branch B POSTs `/api/v1/branches/{B}/patients/{P}/allergy-checks` with `[M]`

*Expected results*
1. one match (M, allergy) is returned with the decision-support disclaimer, and one `PatientAccessLog` row with `accessType` "AllergyCheck" is written

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-047: Matching ignores related-but-different ingredients (fixture data only)

| Field | Value |
|---|---|
| Story | [US-07-07](../stories/EPIC-07-PATIENT-RECORDS/US-07-07-allergy-alert-and-acknowledgement.md) — Allergy Alert and Acknowledgement at POS and Dispensing |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-07-07-AC2 |
| Requirements | FR-07-017, FR-07-023, FR-07-024, FR-07-025, FR-07-026 |

**Story preconditions**
- A patient is linked to the cart (US-07-06).
- `AllergyAlertMode` setting exists (default `Warn`).

**US-07-07-AC2 — No cross-reactivity inference**

*Preconditions / test data*
1. P's only allergy is to "Amoxicillin" and medicine N contains only "Ampicillin"

*Steps*
1. the check runs for `[N]`

*Expected results*
1. no match is returned (only exact ingredient ids match)

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-048: Free-text allergy counted, not matched

| Field | Value |
|---|---|
| Story | [US-07-07](../stories/EPIC-07-PATIENT-RECORDS/US-07-07-allergy-alert-and-acknowledgement.md) — Allergy Alert and Acknowledgement at POS and Dispensing |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-07-07-AC3 |
| Requirements | FR-07-017, FR-07-023, FR-07-024, FR-07-025, FR-07-026 |

**Story preconditions**
- A patient is linked to the cart (US-07-06).
- `AllergyAlertMode` setting exists (default `Warn`).

**US-07-07-AC3 — Free-text allergies flagged for manual review**

*Preconditions / test data*
1. P additionally has an `Active` free-text allergy "Penicillin family"

*Steps*
1. the check runs for any medicines

*Expected results*
1. `unmatchedFreeTextAllergyCount` = 1 and no automatic match is produced from the free text

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-049: Response minimization by permission

| Field | Value |
|---|---|
| Story | [US-07-07](../stories/EPIC-07-PATIENT-RECORDS/US-07-07-allergy-alert-and-acknowledgement.md) — Allergy Alert and Acknowledgement at POS and Dispensing |
| Type / Execution | Contract / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-07-07-AC4 |
| Requirements | FR-07-017, FR-07-023, FR-07-024, FR-07-025, FR-07-026 |

**Story preconditions**
- A patient is linked to the cart (US-07-06).
- `AllergyAlertMode` setting exists (default `Warn`).

**US-07-07-AC4 — Detail minimized for users without medical read**

*Preconditions / test data*
1. a cashier without `patients.medical.read`

*Steps*
1. the check returns a match

*Expected results*
1. the match includes medicine and ingredient name, `severity` and `reaction` are null, and `detailRestricted` = true
2. a pharmacist with `patients.medical.read` receives severity and reaction

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-050: Completion without ack → 422; no sale/stock/payment rows

| Field | Value |
|---|---|
| Story | [US-07-07](../stories/EPIC-07-PATIENT-RECORDS/US-07-07-allergy-alert-and-acknowledgement.md) — Allergy Alert and Acknowledgement at POS and Dispensing |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-07-07-AC5 |
| Requirements | FR-07-017, FR-07-023, FR-07-024, FR-07-025, FR-07-026 |

**Story preconditions**
- A patient is linked to the cart (US-07-06).
- `AllergyAlertMode` setting exists (default `Warn`).

**US-07-07-AC5 — Completion blocked until acknowledged (Warn mode)**

*Preconditions / test data*
1. `AllergyAlertMode` = `Warn` and the cart contains M matched to P's allergy

*Steps*
1. the sale is completed without an acknowledgement for (M, allergy)

*Expected results*
1. the response is 422 `PATIENTS.ALLERGY_ACKNOWLEDGEMENT_REQUIRED` listing the unacknowledged matches, and no sale, stock movement, or payment is persisted

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-051: Override ack committed with sale; injected sale failure leaves no ack row

| Field | Value |
|---|---|
| Story | [US-07-07](../stories/EPIC-07-PATIENT-RECORDS/US-07-07-allergy-alert-and-acknowledgement.md) — Allergy Alert and Acknowledgement at POS and Dispensing |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-07-07-AC6 |
| Requirements | FR-07-017, FR-07-023, FR-07-024, FR-07-025, FR-07-026 |

**Story preconditions**
- A patient is linked to the cart (US-07-06).
- `AllergyAlertMode` setting exists (default `Warn`).

**US-07-07-AC6 — Acknowledged sale persists acknowledgement atomically**

*Preconditions / test data*
1. the cashier lacks `patients.allergy-alerts.acknowledge` and a pharmacist re-authenticates via the POS override and selects reason "PrescriberConfirmed"

*Steps*
1. the sale is completed with the acknowledgement and override token

*Expected results*
1. the sale completes and one `AllergyAlertAcknowledgement` row (sale, sale line, allergy, ingredient, reason, pharmacist as acknowledging user) is committed in the same transaction
2. if the sale fails, no acknowledgement row exists

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-052: `Other` without text → 400

| Field | Value |
|---|---|
| Story | [US-07-07](../stories/EPIC-07-PATIENT-RECORDS/US-07-07-allergy-alert-and-acknowledgement.md) — Allergy Alert and Acknowledgement at POS and Dispensing |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-07-07-AC7 |
| Requirements | FR-07-017, FR-07-023, FR-07-024, FR-07-025, FR-07-026 |

**Story preconditions**
- A patient is linked to the cart (US-07-06).
- `AllergyAlertMode` setting exists (default `Warn`).

**US-07-07-AC7 — Reason text required for "Other"**

*Preconditions / test data*
1. an acknowledgement with `reasonCode` "Other" and empty `reasonText`

*Steps*
1. the sale is completed

*Expected results*
1. the response is 400 `PATIENTS.ALLERGY_ACK_REASON_REQUIRED`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-053: Block mode rejects with/without ack; succeeds after removing line

| Field | Value |
|---|---|
| Story | [US-07-07](../stories/EPIC-07-PATIENT-RECORDS/US-07-07-allergy-alert-and-acknowledgement.md) — Allergy Alert and Acknowledgement at POS and Dispensing |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-07-07-AC8 |
| Requirements | FR-07-017, FR-07-023, FR-07-024, FR-07-025, FR-07-026 |

**Story preconditions**
- A patient is linked to the cart (US-07-06).
- `AllergyAlertMode` setting exists (default `Warn`).

**US-07-07-AC8 — Block mode**

*Preconditions / test data*
1. `AllergyAlertMode` = `Block`

*Steps*
1. a sale or dispensing containing a matched medicine is completed, with or without acknowledgement

*Expected results*
1. the response is 422 `PATIENTS.ALLERGY_BLOCKED` and nothing is persisted
2. removing the matched line allows completion

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-054: Allergy added between check and completion caught by server re-check

| Field | Value |
|---|---|
| Story | [US-07-07](../stories/EPIC-07-PATIENT-RECORDS/US-07-07-allergy-alert-and-acknowledgement.md) — Allergy Alert and Acknowledgement at POS and Dispensing |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-07-07-AC9 |
| Requirements | FR-07-017, FR-07-023, FR-07-024, FR-07-025, FR-07-026 |

**Story preconditions**
- A patient is linked to the cart (US-07-06).
- `AllergyAlertMode` setting exists (default `Warn`).

**US-07-07-AC9 — Server re-check catches allergy added after client check**

*Preconditions / test data*
1. the POS checked the cart with no matches, then a pharmacist recorded a new matching allergy for P

*Steps*
1. the sale is completed

*Expected results*
1. the server re-check returns 422 `PATIENTS.ALLERGY_ACKNOWLEDGEMENT_REQUIRED` with the new match

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-055: CS-07 unassigned branch → 403; CS-08 foreign patient → 404

| Field | Value |
|---|---|
| Story | [US-07-07](../stories/EPIC-07-PATIENT-RECORDS/US-07-07-allergy-alert-and-acknowledgement.md) — Allergy Alert and Acknowledgement at POS and Dispensing |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-07-07-AC10, US-07-07-AC11 |
| Critical scenario | CS-07, CS-08 |
| Requirements | FR-07-017, FR-07-023, FR-07-024, FR-07-025, FR-07-026 |

**Story preconditions**
- A patient is linked to the cart (US-07-06).
- `AllergyAlertMode` setting exists (default `Warn`).

**US-07-07-AC10 — Branch not assigned (CS-07)**

*Preconditions / test data*
1. a cashier assigned only to branch A

*Steps*
1. they POST an allergy check on `/api/v1/branches/{B}/...`

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN` and no access-log row is written

**US-07-07-AC11 — Cross-organization (CS-08)**

*Preconditions / test data*
1. P belongs to organization A

*Steps*
1. a user of organization B runs an allergy check for P in their own branch

*Expected results*
1. the response is 404 `PATIENTS.NOT_FOUND`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-056: Ack without permission (session or override) → 403; payload user id ignored

| Field | Value |
|---|---|
| Story | [US-07-07](../stories/EPIC-07-PATIENT-RECORDS/US-07-07-allergy-alert-and-acknowledgement.md) — Allergy Alert and Acknowledgement at POS and Dispensing |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-07-07-AC12 |
| Requirements | FR-07-017, FR-07-023, FR-07-024, FR-07-025, FR-07-026 |

**Story preconditions**
- A patient is linked to the cart (US-07-06).
- `AllergyAlertMode` setting exists (default `Warn`).

**US-07-07-AC12 — Acknowledgement by unauthorized user rejected**

*Preconditions / test data*
1. neither the session user nor the override token holder has `patients.allergy-alerts.acknowledge`

*Steps*
1. the sale is completed with an acknowledgement

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN` and nothing is persisted

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-057: Check of 50 medicines p95 ≤ 200 ms (NFR-07-002)

| Field | Value |
|---|---|
| Story | [US-07-07](../stories/EPIC-07-PATIENT-RECORDS/US-07-07-allergy-alert-and-acknowledgement.md) — Allergy Alert and Acknowledgement at POS and Dispensing |
| Type / Execution | Performance / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-07-07-AC1 |
| Requirements | FR-07-017, FR-07-023, FR-07-024, FR-07-025, FR-07-026 |

**Story preconditions**
- A patient is linked to the cart (US-07-06).
- `AllergyAlertMode` setting exists (default `Warn`).

**US-07-07-AC1 — Exact ingredient match returned**

*Preconditions / test data*
1. patient P has an `Active` allergy to ingredient "Amoxicillin" and medicine M contains "Amoxicillin" and "Clavulanic acid"

*Steps*
1. a user with `sales.pos.sell` in branch B POSTs `/api/v1/branches/{B}/patients/{P}/allergy-checks` with `[M]`

*Expected results*
1. one match (M, allergy) is returned with the decision-support disclaimer, and one `PatientAccessLog` row with `accessType` "AllergyCheck" is written

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-07-08: Manage Chronic Conditions

### TS-07-058: Record condition; audit without name value

| Field | Value |
|---|---|
| Story | [US-07-08](../stories/EPIC-07-PATIENT-RECORDS/US-07-08-manage-chronic-conditions.md) — Manage Chronic Conditions |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-07-08-AC1 |
| Requirements | FR-07-011, FR-07-017, FR-07-027 |

**Story preconditions**
- Patient `Active`; consent granted when required.

**US-07-08-AC1 — Record condition**

*Preconditions / test data*
1. a pharmacist with `patients.medical.manage`

*Steps*
1. they POST `/api/v1/patients/{P}/conditions` with `name` "Hypertension", `code` "I10", `codeSystem` "ICD-10", `onsetYear` 2019

*Expected results*
1. the response is 201 with `status` "Active", `recordedBy` = caller, and an audit entry without the condition name

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-059: Status lifecycle with reasons; DELETE → 405

| Field | Value |
|---|---|
| Story | [US-07-08](../stories/EPIC-07-PATIENT-RECORDS/US-07-08-manage-chronic-conditions.md) — Manage Chronic Conditions |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-07-08-AC2 |
| Requirements | FR-07-011, FR-07-017, FR-07-027 |

**Story preconditions**
- Patient `Active`; consent granted when required.

**US-07-08-AC2 — Resolve and mark entered-in-error**

*Preconditions / test data*
1. an `Active` condition C

*Steps*
1. the pharmacist sets `status` "Resolved" with reason, or "EnteredInError" with reason

*Expected results*
1. C keeps its history, is shown with the new status, and `DELETE` returns 405

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-060: No condition rows created by sales/dispensing events

| Field | Value |
|---|---|
| Story | [US-07-08](../stories/EPIC-07-PATIENT-RECORDS/US-07-08-manage-chronic-conditions.md) — Manage Chronic Conditions |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-07-08-AC3 |
| Requirements | FR-07-011, FR-07-017, FR-07-027 |

**Story preconditions**
- Patient `Active`; consent granted when required.

**US-07-08-AC3 — No inferred conditions**

*Preconditions / test data*
1. P bought insulin in three linked sales

*Steps*
1. conditions are listed

*Expected results*
1. no condition exists that was not entered by a user (all rows have a human `recordedBy`)

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-061: Consent gate → 422

| Field | Value |
|---|---|
| Story | [US-07-08](../stories/EPIC-07-PATIENT-RECORDS/US-07-08-manage-chronic-conditions.md) — Manage Chronic Conditions |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-07-08-AC4 |
| Requirements | FR-07-011, FR-07-017, FR-07-027 |

**Story preconditions**
- Patient `Active`; consent granted when required.

**US-07-08-AC4 — Consent required**

*Preconditions / test data*
1. `RequireConsentForMedicalData` ON and P without `MedicalDataStorage` grant

*Steps*
1. a condition is posted

*Expected results*
1. the response is 422 `PATIENTS.CONSENT_REQUIRED`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-062: Onset year validation

| Field | Value |
|---|---|
| Story | [US-07-08](../stories/EPIC-07-PATIENT-RECORDS/US-07-08-manage-chronic-conditions.md) — Manage Chronic Conditions |
| Type / Execution | Unit / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-07-08-AC5 |
| Requirements | FR-07-011, FR-07-017, FR-07-027 |

**Story preconditions**
- Patient `Active`; consent granted when required.

**US-07-08-AC5 — Invalid onset year**

*Preconditions / test data*
1. P's birth year is 1980

*Steps*
1. a condition with `onsetYear` 1975 is posted

*Expected results*
1. the response is 400 `PATIENTS.INVALID_CONDITION`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-063: Logged read; 403 for cashier; CS-08 → 404

| Field | Value |
|---|---|
| Story | [US-07-08](../stories/EPIC-07-PATIENT-RECORDS/US-07-08-manage-chronic-conditions.md) — Manage Chronic Conditions |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-07-08-AC6, US-07-08-AC7 |
| Critical scenario | CS-08 |
| Requirements | FR-07-011, FR-07-017, FR-07-027 |

**Story preconditions**
- Patient `Active`; consent granted when required.

**US-07-08-AC6 — Read logged; permission denied**

*Preconditions / test data*
1. a pharmacist with `patients.medical.read` and a cashier without it

*Steps*
1. each GETs `/conditions`

*Expected results*
1. the pharmacist receives the list and one access-log row with category "Conditions" is written
2. the cashier receives 403 `COMMON.FORBIDDEN`

**US-07-08-AC7 — Cross-organization (CS-08)**

*Preconditions / test data*
1. P belongs to organization A

*Steps*
1. a user of organization B requests P's conditions

*Expected results*
1. the response is 404 `PATIENTS.NOT_FOUND`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-07-09: Record Restricted Pharmacist Notes

### TS-07-064: Add note; audit excludes text

| Field | Value |
|---|---|
| Story | [US-07-09](../stories/EPIC-07-PATIENT-RECORDS/US-07-09-record-pharmacist-notes.md) — Record Restricted Pharmacist Notes |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-07-09-AC1 |
| Requirements | FR-07-011, FR-07-017, FR-07-028 |

**Story preconditions**
- Patient `Active`; consent granted when required.

**US-07-09-AC1 — Add note**

*Preconditions / test data*
1. a pharmacist with `patients.medical.manage` in branch B

*Steps*
1. they POST `/api/v1/patients/{P}/notes` with `text` of 300 characters

*Expected results*
1. the response is 201 with author, branch B, and timestamp
2. the audit entry excludes the text

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-065: Amendment chain, original unchanged

| Field | Value |
|---|---|
| Story | [US-07-09](../stories/EPIC-07-PATIENT-RECORDS/US-07-09-record-pharmacist-notes.md) — Record Restricted Pharmacist Notes |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-07-09-AC2 |
| Requirements | FR-07-011, FR-07-017, FR-07-028 |

**Story preconditions**
- Patient `Active`; consent granted when required.

**US-07-09-AC2 — Amend note**

*Preconditions / test data*
1. note N exists

*Steps*
1. the pharmacist posts a note with `amendsNoteId` = N

*Expected results*
1. a new note is stored referencing N, N is unchanged, and the list shows N marked "amended" with the amendment beneath it

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-066: PUT/PATCH/DELETE → 405

| Field | Value |
|---|---|
| Story | [US-07-09](../stories/EPIC-07-PATIENT-RECORDS/US-07-09-record-pharmacist-notes.md) — Record Restricted Pharmacist Notes |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-07-09-AC3 |
| Requirements | FR-07-011, FR-07-017, FR-07-028 |

**Story preconditions**
- Patient `Active`; consent granted when required.

**US-07-09-AC3 — Notes are immutable**

*Preconditions / test data*
1. note N exists

*Steps*
1. any user sends PUT, PATCH, or DELETE to `/notes/{N}`

*Expected results*
1. the response is 405 and N is unchanged

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-067: Length and same-patient amendment validation

| Field | Value |
|---|---|
| Story | [US-07-09](../stories/EPIC-07-PATIENT-RECORDS/US-07-09-record-pharmacist-notes.md) — Record Restricted Pharmacist Notes |
| Type / Execution | Unit / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-07-09-AC4 |
| Requirements | FR-07-011, FR-07-017, FR-07-028 |

**Story preconditions**
- Patient `Active`; consent granted when required.

**US-07-09-AC4 — Length validation**

*Preconditions / test data*
1. a pharmacist with `patients.medical.manage`

*Steps*
1. they post a note of 2,001 characters, or an amendment referencing another patient's note

*Expected results*
1. the response is 400 `PATIENTS.INVALID_NOTE`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-068: 403 for cashier; logged read; CS-08 → 404

| Field | Value |
|---|---|
| Story | [US-07-09](../stories/EPIC-07-PATIENT-RECORDS/US-07-09-record-pharmacist-notes.md) — Record Restricted Pharmacist Notes |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-07-09-AC5, US-07-09-AC6 |
| Critical scenario | CS-08 |
| Requirements | FR-07-011, FR-07-017, FR-07-028 |

**Story preconditions**
- Patient `Active`; consent granted when required.

**US-07-09-AC5 — Restricted read, logged**

*Preconditions / test data*
1. a cashier without `patients.medical.read`

*Steps*
1. they GET `/notes`

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN`
2. a pharmacist's successful GET writes one access-log row with category "Notes"

**US-07-09-AC6 — Cross-organization (CS-08)**

*Preconditions / test data*
1. P belongs to organization A

*Steps*
1. a pharmacist of organization B posts or reads notes for P

*Expected results*
1. the response is 404 `PATIENTS.NOT_FOUND`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-07-10: View Medication and Purchase History

### TS-07-069: Medication history across 2 branches with partial return and prescription link; logged

| Field | Value |
|---|---|
| Story | [US-07-10](../stories/EPIC-07-PATIENT-RECORDS/US-07-10-view-medication-and-purchase-history.md) — View Medication and Purchase History |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-07-10-AC1 |
| Requirements | FR-07-017, FR-07-029, FR-07-030 |

**Story preconditions**
- Sales have been linked to the patient (US-07-06).

**US-07-10-AC1 — Medication history derived from sales and dispensing**

*Preconditions / test data*
1. P has 3 linked completed sales across branches A and B, one line partially returned

*Steps*
1. a pharmacist with `patients.medical.read` GETs `/api/v1/patients/{P}/medication-history`

*Expected results*
1. each line shows medicine, quantity in base units, returned quantity, date, branch, sale number, and prescription id when dispensed against a prescription, newest first
2. one access-log row with category "MedicationHistory" is written

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-070: Voided filter behaviour

| Field | Value |
|---|---|
| Story | [US-07-10](../stories/EPIC-07-PATIENT-RECORDS/US-07-10-view-medication-and-purchase-history.md) — View Medication and Purchase History |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-07-10-AC2 |
| Requirements | FR-07-017, FR-07-029, FR-07-030 |

**Story preconditions**
- Sales have been linked to the patient (US-07-06).

**US-07-10-AC2 — Voided sales excluded by default**

*Preconditions / test data*
1. one of P's sales is `Voided`

*Steps*
1. history is requested without `includeVoided`

*Expected results*
1. the voided sale's lines are absent
2. with `includeVoided=true` they appear flagged "Voided"

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-071: Write verbs → 405

| Field | Value |
|---|---|
| Story | [US-07-10](../stories/EPIC-07-PATIENT-RECORDS/US-07-10-view-medication-and-purchase-history.md) — View Medication and Purchase History |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-07-10-AC3 |
| Requirements | FR-07-017, FR-07-029, FR-07-030 |

**Story preconditions**
- Sales have been linked to the patient (US-07-06).

**US-07-10-AC3 — Read-only**

*Preconditions / test data*
1. the medication history endpoint

*Steps*
1. a POST, PUT, or DELETE is sent to it

*Expected results*
1. the response is 405

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-072: Purchase history branch-limited, no lines, no access log

| Field | Value |
|---|---|
| Story | [US-07-10](../stories/EPIC-07-PATIENT-RECORDS/US-07-10-view-medication-and-purchase-history.md) — View Medication and Purchase History |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-07-10-AC4 |
| Requirements | FR-07-017, FR-07-029, FR-07-030 |

**Story preconditions**
- Sales have been linked to the patient (US-07-06).

**US-07-10-AC4 — Purchase history without line items, branch-limited**

*Preconditions / test data*
1. a manager assigned to branch A only, with `patients.profiles.read` and `sales.sales.read`, and P has sales in branches A and B

*Steps*
1. they GET `/purchase-history`

*Expected results*
1. only branch A sales are returned with sale number, date, branch, total, and status, without medicine lines, and no access-log row is written

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-073: 403 for missing medical/sales permissions

| Field | Value |
|---|---|
| Story | [US-07-10](../stories/EPIC-07-PATIENT-RECORDS/US-07-10-view-medication-and-purchase-history.md) — View Medication and Purchase History |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-07-10-AC5 |
| Requirements | FR-07-017, FR-07-029, FR-07-030 |

**Story preconditions**
- Sales have been linked to the patient (US-07-06).

**US-07-10-AC5 — Permission denied**

*Preconditions / test data*
1. a user with `patients.profiles.read` but not `patients.medical.read`

*Steps*
1. they GET `/medication-history`

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN`
2. and a user lacking `sales.sales.read` gets 403 on `/purchase-history`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-074: CS-08 → 404; CS-07 opening sale of unassigned branch → 403

| Field | Value |
|---|---|
| Story | [US-07-10](../stories/EPIC-07-PATIENT-RECORDS/US-07-10-view-medication-and-purchase-history.md) — View Medication and Purchase History |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-07-10-AC6 |
| Critical scenario | CS-08, CS-07 |
| Requirements | FR-07-017, FR-07-029, FR-07-030 |

**Story preconditions**
- Sales have been linked to the patient (US-07-06).

**US-07-10-AC6 — Cross-organization (CS-08)**

*Preconditions / test data*
1. P belongs to organization A

*Steps*
1. a user of organization B requests either history

*Expected results*
1. the response is 404 `PATIENTS.NOT_FOUND`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-07-11: View Prescription History Links

### TS-07-075: List with progress; logged

| Field | Value |
|---|---|
| Story | [US-07-11](../stories/EPIC-07-PATIENT-RECORDS/US-07-11-view-prescription-history-links.md) — View Prescription History Links |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-07-11-AC1 |
| Requirements | FR-07-017, FR-07-031 |

**Story preconditions**
- Prescriptions linked to the patient exist (SPEC-08).

**US-07-11-AC1 — List prescription links**

*Preconditions / test data*
1. P has 2 prescriptions (`Verified`, `PartiallyDispensed`)

*Steps*
1. a pharmacist with `patients.medical.read` and `prescriptions.prescriptions.read` GETs `/api/v1/patients/{P}/prescriptions`

*Expected results*
1. both are returned with id, number, date, prescriber name, status, and dispensing progress (dispensed vs prescribed items), newest first, and one access-log row with category "Prescriptions" is written

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-076: Missing prescriptions permission → 403, no log

| Field | Value |
|---|---|
| Story | [US-07-11](../stories/EPIC-07-PATIENT-RECORDS/US-07-11-view-prescription-history-links.md) — View Prescription History Links |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-07-11-AC2 |
| Requirements | FR-07-017, FR-07-031 |

**Story preconditions**
- Prescriptions linked to the patient exist (SPEC-08).

**US-07-11-AC2 — Both permissions required**

*Preconditions / test data*
1. a user with `patients.medical.read` but without `prescriptions.prescriptions.read`

*Steps*
1. they request the list

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN` and no access-log row is written

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-077: Response contains no images or editable fields

| Field | Value |
|---|---|
| Story | [US-07-11](../stories/EPIC-07-PATIENT-RECORDS/US-07-11-view-prescription-history-links.md) — View Prescription History Links |
| Type / Execution | Contract / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-07-11-AC3 |
| Requirements | FR-07-017, FR-07-031 |

**Story preconditions**
- Prescriptions linked to the patient exist (SPEC-08).

**US-07-11-AC3 — Read-only links**

*Preconditions / test data*
1. the list response

*Steps*
1. inspected

*Expected results*
1. it contains no editable fields and no prescription images
2. opening a prescription navigates to SPEC-08 endpoints

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-078: CS-08 → 404

| Field | Value |
|---|---|
| Story | [US-07-11](../stories/EPIC-07-PATIENT-RECORDS/US-07-11-view-prescription-history-links.md) — View Prescription History Links |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-07-11-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-07-017, FR-07-031 |

**Story preconditions**
- Prescriptions linked to the patient exist (SPEC-08).

**US-07-11-AC4 — Cross-organization (CS-08)**

*Preconditions / test data*
1. P belongs to organization A

*Steps*
1. a user of organization B requests P's prescriptions

*Expected results*
1. the response is 404 `PATIENTS.NOT_FOUND`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-07-12: Patient Interaction Timeline

### TS-07-079: Timeline merge order, cursor stability, logged

| Field | Value |
|---|---|
| Story | [US-07-12](../stories/EPIC-07-PATIENT-RECORDS/US-07-12-patient-interaction-timeline.md) — Patient Interaction Timeline |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-07-12-AC1 |
| Requirements | FR-07-017, FR-07-032 |

**Story preconditions**
- Patient has events from at least two sources.

**US-07-12-AC1 — Merged chronological timeline**

*Preconditions / test data*
1. P has a profile update, a consent grant, an allergy recorded, a sale, and a dispensing event

*Steps*
1. a pharmacist with `patients.profiles.read` and `patients.medical.read` GETs `/api/v1/patients/{P}/timeline?limit=20`

*Expected results*
1. all events are returned newest first with type, timestamp, branch, user, and a link target, with a `nextCursor` when more exist, and one access-log row with category "Timeline" is written

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-080: Profiles-only user sees non-medical events only; no log row

| Field | Value |
|---|---|
| Story | [US-07-12](../stories/EPIC-07-PATIENT-RECORDS/US-07-12-patient-interaction-timeline.md) — Patient Interaction Timeline |
| Type / Execution | Security / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-07-12-AC2 |
| Requirements | FR-07-017, FR-07-032 |

**Story preconditions**
- Patient has events from at least two sources.

**US-07-12-AC2 — Medical events omitted without medical permission**

*Preconditions / test data*
1. a cashier with `patients.profiles.read` only

*Steps*
1. they request the timeline

*Expected results*
1. only `ProfileCreated`, `ProfileUpdated`, `ConsentChanged`, and `Sale` events are returned (sale events without lines) and no access-log row is written

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-081: Type filter

| Field | Value |
|---|---|
| Story | [US-07-12](../stories/EPIC-07-PATIENT-RECORDS/US-07-12-patient-interaction-timeline.md) — Patient Interaction Timeline |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-07-12-AC3 |
| Requirements | FR-07-017, FR-07-032 |

**Story preconditions**
- Patient has events from at least two sources.

**US-07-12-AC3 — Type filter**

*Preconditions / test data*
1. the pharmacist requests `types=AllergyRecorded,AllergyAlertAcknowledged`

*Steps*
1. the timeline is returned

*Expected results*
1. only those event types appear

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-082: Invalid type → 400

| Field | Value |
|---|---|
| Story | [US-07-12](../stories/EPIC-07-PATIENT-RECORDS/US-07-12-patient-interaction-timeline.md) — Patient Interaction Timeline |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-07-12-AC4 |
| Requirements | FR-07-017, FR-07-032 |

**Story preconditions**
- Patient has events from at least two sources.

**US-07-12-AC4 — Invalid type rejected**

*Preconditions / test data*
1. any user with access

*Steps*
1. they request `types=Diagnosis`

*Expected results*
1. the response is 400 `COMMON.VALIDATION_FAILED`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-083: 403 without permission; CS-08 → 404

| Field | Value |
|---|---|
| Story | [US-07-12](../stories/EPIC-07-PATIENT-RECORDS/US-07-12-patient-interaction-timeline.md) — Patient Interaction Timeline |
| Type / Execution | Security / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-07-12-AC5, US-07-12-AC6 |
| Critical scenario | CS-08 |
| Requirements | FR-07-017, FR-07-032 |

**Story preconditions**
- Patient has events from at least two sources.

**US-07-12-AC5 — Permission denied**

*Preconditions / test data*
1. a user without `patients.profiles.read`

*Steps*
1. they request the timeline

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN`

**US-07-12-AC6 — Cross-organization (CS-08)**

*Preconditions / test data*
1. P belongs to organization A

*Steps*
1. a user of organization B requests P's timeline

*Expected results*
1. the response is 404 `PATIENTS.NOT_FOUND`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-07-13: Configure Patient Privacy Settings and Optional National ID

### TS-07-084: Settings update audited with old/new; Block mode takes effect on next sale

| Field | Value |
|---|---|
| Story | [US-07-13](../stories/EPIC-07-PATIENT-RECORDS/US-07-13-configure-patient-privacy-settings.md) — Configure Patient Privacy Settings and Optional National ID |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-07-13-AC1 |
| Requirements | FR-07-033, FR-07-034 |

**Story preconditions**
- Settings seeded with defaults at organization creation.

**US-07-13-AC1 — View and change settings with audit**

*Preconditions / test data*
1. an owner with `settings.organization.manage`

*Steps*
1. they PUT `/api/v1/settings/patients` changing `AllergyAlertMode` from `Warn` to `Block`

*Expected results*
1. the response is 200, subsequent sale completions apply `Block` behaviour, and an audit entry records old and new values

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-085: 403 for non-owner

| Field | Value |
|---|---|
| Story | [US-07-13](../stories/EPIC-07-PATIENT-RECORDS/US-07-13-configure-patient-privacy-settings.md) — Configure Patient Privacy Settings and Optional National ID |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-07-13-AC2 |
| Requirements | FR-07-033, FR-07-034 |

**Story preconditions**
- Settings seeded with defaults at organization creation.

**US-07-13-AC2 — Permission denied**

*Preconditions / test data*
1. a pharmacist without `settings.organization.manage`

*Steps*
1. they PUT the settings

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN` and settings are unchanged

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-086: National ID encrypted at rest (DB dump scan), masked in responses (NFR-07-007)

| Field | Value |
|---|---|
| Story | [US-07-13](../stories/EPIC-07-PATIENT-RECORDS/US-07-13-configure-patient-privacy-settings.md) — Configure Patient Privacy Settings and Optional National ID |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-07-13-AC3 |
| Requirements | FR-07-033, FR-07-034 |

**Story preconditions**
- Settings seeded with defaults at organization creation.

**US-07-13-AC3 — National ID accepted and masked when ON**

*Preconditions / test data*
1. `CollectNationalId` is ON

*Steps*
1. a user with `patients.profiles.manage` saves `nationalId` "29001011234567" and another user with `patients.profiles.read` GETs the patient

*Expected results*
1. the value is stored encrypted, responses show `nationalIdMasked` "••••••••••4567", and the full value is not present in any GET response

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-087: Reveal returns full value, no-store header, access-log `Reveal`

| Field | Value |
|---|---|
| Story | [US-07-13](../stories/EPIC-07-PATIENT-RECORDS/US-07-13-configure-patient-privacy-settings.md) — Configure Patient Privacy Settings and Optional National ID |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-07-13-AC4 |
| Requirements | FR-07-033, FR-07-034 |

**Story preconditions**
- Settings seeded with defaults at organization creation.

**US-07-13-AC4 — Reveal is explicit and logged**

*Preconditions / test data*
1. `CollectNationalId` is ON and P has a national ID

*Steps*
1. a user with `patients.profiles.manage` POSTs `/api/v1/patients/{P}/national-id/reveal`

*Expected results*
1. the full value is returned with `Cache-Control: no-store` and one access-log row with `accessType` "Reveal" and category "NationalId" is written

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-088: 14-digit validation incl. Arabic-Indic digits

| Field | Value |
|---|---|
| Story | [US-07-13](../stories/EPIC-07-PATIENT-RECORDS/US-07-13-configure-patient-privacy-settings.md) — Configure Patient Privacy Settings and Optional National ID |
| Type / Execution | Unit / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-07-13-AC5 |
| Requirements | FR-07-033, FR-07-034 |

**Story preconditions**
- Settings seeded with defaults at organization creation.

**US-07-13-AC5 — Invalid national ID**

*Preconditions / test data*
1. `CollectNationalId` is ON

*Steps*
1. `nationalId` "2900101123" (10 digits) is saved

*Expected results*
1. the response is 400 `PATIENTS.INVALID_NATIONAL_ID`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-089: OFF hides values; reveal → 400

| Field | Value |
|---|---|
| Story | [US-07-13](../stories/EPIC-07-PATIENT-RECORDS/US-07-13-configure-patient-privacy-settings.md) — Configure Patient Privacy Settings and Optional National ID |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-07-13-AC6 |
| Requirements | FR-07-033, FR-07-034 |

**Story preconditions**
- Settings seeded with defaults at organization creation.

**US-07-13-AC6 — Switching OFF hides existing values**

*Preconditions / test data*
1. P has a stored national ID and the owner sets `CollectNationalId` OFF

*Steps*
1. any user GETs P or calls reveal

*Expected results*
1. no national ID field (masked or full) is returned and reveal returns 400 `PATIENTS.NATIONAL_ID_DISABLED`
2. stored ciphertext is retained

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-090: CS-08 reveal → 404

| Field | Value |
|---|---|
| Story | [US-07-13](../stories/EPIC-07-PATIENT-RECORDS/US-07-13-configure-patient-privacy-settings.md) — Configure Patient Privacy Settings and Optional National ID |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-07-13-AC7 |
| Critical scenario | CS-08 |
| Requirements | FR-07-033, FR-07-034 |

**Story preconditions**
- Settings seeded with defaults at organization creation.

**US-07-13-AC7 — Cross-organization reveal (CS-08)**

*Preconditions / test data*
1. P belongs to organization A

*Steps*
1. a user of organization B calls reveal for P

*Expected results*
1. the response is 404 `PATIENTS.NOT_FOUND`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-07-14: Detect Duplicate Patients

### TS-07-091: Same phone → 409 with masked candidates; no row created

| Field | Value |
|---|---|
| Story | [US-07-14](../stories/EPIC-07-PATIENT-RECORDS/US-07-14-detect-duplicate-patients.md) — Detect Duplicate Patients |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-07-14-AC1 |
| Requirements | FR-07-035 |

**Story preconditions**
- Normalized phone and name keys exist (US-07-01, US-07-02).

**US-07-14-AC1 — Same phone warning**

*Preconditions / test data*
1. patient P with phone "+201012345678"

*Steps*
1. a user creates another patient with phone "01012345678" without `confirmNotDuplicate`

*Expected results*
1. the response is 409 `PATIENTS.POSSIBLE_DUPLICATE` with `candidates` containing P's id, code, name, masked phone, and age only, and no patient is created

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-092: Confirm override → 201, audit flag

| Field | Value |
|---|---|
| Story | [US-07-14](../stories/EPIC-07-PATIENT-RECORDS/US-07-14-detect-duplicate-patients.md) — Detect Duplicate Patients |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-07-14-AC2 |
| Requirements | FR-07-035 |

**Story preconditions**
- Normalized phone and name keys exist (US-07-01, US-07-02).

**US-07-14-AC2 — Confirm not duplicate**

*Preconditions / test data*
1. the warning in AC1 (e.g., a family member sharing the phone)

*Steps*
1. the user resubmits with `confirmNotDuplicate = true`

*Expected results*
1. the response is 201 and the audit entry records that the duplicate warning was overridden

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-093: Normalized name + birth year match

| Field | Value |
|---|---|
| Story | [US-07-14](../stories/EPIC-07-PATIENT-RECORDS/US-07-14-detect-duplicate-patients.md) — Detect Duplicate Patients |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-07-14-AC3 |
| Requirements | FR-07-035 |

**Story preconditions**
- Normalized phone and name keys exist (US-07-01, US-07-02).

**US-07-14-AC3 — Same normalized name and birth year**

*Preconditions / test data*
1. patient "فاطمة السيد", birth year 1975, phone A

*Steps*
1. "فاطمه السيد", birth year 1975, phone B is created

*Expected results*
1. the response is 409 `PATIENTS.POSSIBLE_DUPLICATE`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-094: Candidate list reasons, exclusions, de-duplicated pairs

| Field | Value |
|---|---|
| Story | [US-07-14](../stories/EPIC-07-PATIENT-RECORDS/US-07-14-detect-duplicate-patients.md) — Detect Duplicate Patients |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-07-14-AC4 |
| Requirements | FR-07-035 |

**Story preconditions**
- Normalized phone and name keys exist (US-07-01, US-07-02).

**US-07-14-AC4 — Organization-wide candidate list**

*Preconditions / test data*
1. an owner with `patients.profiles.merge`

*Steps*
1. they GET `/api/v1/patients/duplicate-candidates?page=1`

*Expected results*
1. candidate pairs are returned with match reason (`SamePhone`, `SameNameAndBirthYear`) and masked fields only, excluding `Merged` and `Anonymized` patients

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-095: 403 without merge permission; CS-08 no foreign candidates

| Field | Value |
|---|---|
| Story | [US-07-14](../stories/EPIC-07-PATIENT-RECORDS/US-07-14-detect-duplicate-patients.md) — Detect Duplicate Patients |
| Type / Execution | Security / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-07-14-AC5, US-07-14-AC6 |
| Critical scenario | CS-08 |
| Requirements | FR-07-035 |

**Story preconditions**
- Normalized phone and name keys exist (US-07-01, US-07-02).

**US-07-14-AC5 — Permission denied**

*Preconditions / test data*
1. a pharmacist without `patients.profiles.merge`

*Steps*
1. they GET the candidate list

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN`

**US-07-14-AC6 — Organization isolation (CS-08)**

*Preconditions / test data*
1. organization B has a patient with the same phone

*Steps*
1. a user in organization A creates a patient with that phone

*Expected results*
1. no warning references the organization B patient and the patient is created (201) if no organization A candidate exists

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-07-15: Merge Duplicate Patients

### TS-07-096: Records re-pointed, status Merged, audit counts, no sale/prescription rows modified

| Field | Value |
|---|---|
| Story | [US-07-15](../stories/EPIC-07-PATIENT-RECORDS/US-07-15-merge-duplicate-patients.md) — Merge Duplicate Patients |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-07-15-AC1 |
| Requirements | FR-07-036, FR-07-037 |

**Story preconditions**
- Source S and target T are in the same organization, each `Active` or `Inactive`.

**US-07-15-AC1 — Merge moves patient-owned records**

*Preconditions / test data*
1. S has 2 allergies, 1 condition, 3 notes, 2 consent events, 1 acknowledgement

*Steps*
1. an owner with `patients.profiles.merge` POSTs `/api/v1/patients/{T}/merge` with `sourcePatientId` = S and an `Idempotency-Key`

*Expected results*
1. in one transaction those records are re-pointed to T, S gets status `Merged` with `MergedIntoPatientId` = T, T's `allergyStatus` is recomputed, and one audit entry lists moved record counts
2. sales and prescriptions of S are not modified

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-097: History, timeline, allergy check include source records

| Field | Value |
|---|---|
| Story | [US-07-15](../stories/EPIC-07-PATIENT-RECORDS/US-07-15-merge-duplicate-patients.md) — Merge Duplicate Patients |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-07-15-AC2 |
| Requirements | FR-07-036, FR-07-037 |

**Story preconditions**
- Source S and target T are in the same organization, each `Active` or `Inactive`.

**US-07-15-AC2 — Histories resolve merged patients**

*Preconditions / test data*
1. the merge in AC1 and S had 2 linked sales

*Steps*
1. T's medication history, timeline, or allergy check is requested

*Expected results*
1. S's sales and dispensing appear in T's history, and the allergy check uses allergies from both

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-098: Consent most-restrictive rule matrix (4 combinations × 2 purposes)

| Field | Value |
|---|---|
| Story | [US-07-15](../stories/EPIC-07-PATIENT-RECORDS/US-07-15-merge-duplicate-patients.md) — Merge Duplicate Patients |
| Type / Execution | Unit / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-07-15-AC3 |
| Requirements | FR-07-036, FR-07-037 |

**Story preconditions**
- Source S and target T are in the same organization, each `Active` or `Inactive`.

**US-07-15-AC3 — Most restrictive consent**

*Preconditions / test data*
1. T's effective `Notifications` = `Granted` and S's = `Withdrawn`

*Steps*
1. they are merged

*Expected results*
1. T's effective `Notifications` becomes `Withdrawn` (a system consent event "merge" is appended), and `MedicalDataStorage` is `Granted` only if both were `Granted`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-099: Same/merged/anonymized rejections; duplicate allergy inactivation

| Field | Value |
|---|---|
| Story | [US-07-15](../stories/EPIC-07-PATIENT-RECORDS/US-07-15-merge-duplicate-patients.md) — Merge Duplicate Patients |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-07-15-AC4 |
| Requirements | FR-07-036, FR-07-037 |

**Story preconditions**
- Source S and target T are in the same organization, each `Active` or `Inactive`.

**US-07-15-AC4 — Invalid merges rejected**

*Preconditions / test data*
1. S = T, or S is already `Merged`/`Anonymized`

*Steps*
1. the merge is requested

*Expected results*
1. the response is 400 `PATIENTS.MERGE_SAME_PATIENT` or 409 `PATIENTS.MERGE_NOT_ALLOWED` respectively and nothing changes

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-100: CS-11 replay and key reuse

| Field | Value |
|---|---|
| Story | [US-07-15](../stories/EPIC-07-PATIENT-RECORDS/US-07-15-merge-duplicate-patients.md) — Merge Duplicate Patients |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-07-15-AC5 |
| Critical scenario | CS-11 |
| Requirements | FR-07-036, FR-07-037 |

**Story preconditions**
- Source S and target T are in the same organization, each `Active` or `Inactive`.

**US-07-15-AC5 — Idempotent replay (CS-11)**

*Preconditions / test data*
1. a merge completed with key K

*Steps*
1. the identical request is retried with K

*Expected results*
1. the stored response is replayed and no second audit entry or event is created
2. the same K with a different body returns 422 `COMMON.IDEMPOTENCY_KEY_REUSED`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-101: Two parallel merges of one source → exactly one succeeds

| Field | Value |
|---|---|
| Story | [US-07-15](../stories/EPIC-07-PATIENT-RECORDS/US-07-15-merge-duplicate-patients.md) — Merge Duplicate Patients |
| Type / Execution | Concurrency / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-07-15-AC4 |
| Requirements | FR-07-036, FR-07-037 |

**Story preconditions**
- Source S and target T are in the same organization, each `Active` or `Inactive`.

**US-07-15-AC4 — Invalid merges rejected**

*Preconditions / test data*
1. S = T, or S is already `Merged`/`Anonymized`

*Steps*
1. the merge is requested

*Expected results*
1. the response is 400 `PATIENTS.MERGE_SAME_PATIENT` or 409 `PATIENTS.MERGE_NOT_ALLOWED` respectively and nothing changes

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-102: 403 without permission; CS-08 → 404

| Field | Value |
|---|---|
| Story | [US-07-15](../stories/EPIC-07-PATIENT-RECORDS/US-07-15-merge-duplicate-patients.md) — Merge Duplicate Patients |
| Type / Execution | Security / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-07-15-AC6, US-07-15-AC7 |
| Critical scenario | CS-08 |
| Requirements | FR-07-036, FR-07-037 |

**Story preconditions**
- Source S and target T are in the same organization, each `Active` or `Inactive`.

**US-07-15-AC6 — Permission denied**

*Preconditions / test data*
1. a pharmacist without `patients.profiles.merge`

*Steps*
1. they request a merge

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN`

**US-07-15-AC7 — Cross-organization (CS-08)**

*Preconditions / test data*
1. S belongs to organization B

*Steps*
1. an owner of organization A merges S into T

*Expected results*
1. the response is 404 `PATIENTS.NOT_FOUND` and nothing changes

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-07-16: Export a Patient's Data (Data Subject Request)

### TS-07-103: Request → 202 Queued, audit entry

| Field | Value |
|---|---|
| Story | [US-07-16](../stories/EPIC-07-PATIENT-RECORDS/US-07-16-export-patient-data.md) — Export a Patient's Data (Data Subject Request) |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | V1 |
| Covers | US-07-16-AC1 |
| Requirements | FR-07-017, FR-07-038 |

**Story preconditions**
- Patient exists (any status except `Merged`; a `Merged` source is exported via its target).

**US-07-16-AC1 — Request export**

*Preconditions / test data*
1. an owner with `patients.data.export`

*Steps*
1. they POST `/api/v1/patients/{P}/exports` with an `Idempotency-Key`

*Expected results*
1. the response is 202 with `exportId` and `status` "Queued", and an audit entry is written

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-104: Export JSON schema, exclusions, access log `Export`; ≤ 60 s for 5,000 entries (NFR-07-005)

| Field | Value |
|---|---|
| Story | [US-07-16](../stories/EPIC-07-PATIENT-RECORDS/US-07-16-export-patient-data.md) — Export a Patient's Data (Data Subject Request) |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | V1 |
| Covers | US-07-16-AC2 |
| Requirements | FR-07-017, FR-07-038 |

**Story preconditions**
- Patient exists (any status except `Merged`; a `Merged` source is exported via its target).

**US-07-16-AC2 — Export content and timing**

*Preconditions / test data*
1. P has ≤ 5,000 history entries

*Steps*
1. the job runs

*Expected results*
1. within 60 s the export is `Ready`
2. the UTF-8 JSON contains `demographics`, `consents`, `allergies`, `conditions`, `notes`, `medicationHistory`, `prescriptionLinks`, `allergyAcknowledgements`, `generatedAt`, and `schemaVersion`
3. it excludes other patients' data, internal user emails, and prescription images
4. one access-log row with `accessType` "Export" and category "FullExport" is written

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-105: Pre-signed URL 15-minute validity and re-issue

| Field | Value |
|---|---|
| Story | [US-07-16](../stories/EPIC-07-PATIENT-RECORDS/US-07-16-export-patient-data.md) — Export a Patient's Data (Data Subject Request) |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | V1 |
| Covers | US-07-16-AC3 |
| Requirements | FR-07-017, FR-07-038 |

**Story preconditions**
- Patient exists (any status except `Merged`; a `Merged` source is exported via its target).

**US-07-16-AC3 — Download link**

*Preconditions / test data*
1. the export is `Ready`

*Steps*
1. the owner GETs `/exports/{exportId}`

*Expected results*
1. the response contains a pre-signed URL valid 15 minutes
2. after expiry the URL returns 403 from storage and a new GET issues a fresh URL

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-106: Not ready → 409; 7-day cleanup job → 410

| Field | Value |
|---|---|
| Story | [US-07-16](../stories/EPIC-07-PATIENT-RECORDS/US-07-16-export-patient-data.md) — Export a Patient's Data (Data Subject Request) |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | V1 |
| Covers | US-07-16-AC4 |
| Requirements | FR-07-017, FR-07-038 |

**Story preconditions**
- Patient exists (any status except `Merged`; a `Merged` source is exported via its target).

**US-07-16-AC4 — Not ready and expired**

*Preconditions / test data*
1. an export in `Queued` status, and another generated 8 days ago

*Steps*
1. the owner requests their download URLs

*Expected results*
1. the first returns 409 `PATIENTS.EXPORT_NOT_READY` and the second 410 `PATIENTS.EXPORT_EXPIRED` (file deleted after 7 days)

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-107: CS-11 idempotent export request

| Field | Value |
|---|---|
| Story | [US-07-16](../stories/EPIC-07-PATIENT-RECORDS/US-07-16-export-patient-data.md) — Export a Patient's Data (Data Subject Request) |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | V1 |
| Covers | US-07-16-AC5 |
| Critical scenario | CS-11 |
| Requirements | FR-07-017, FR-07-038 |

**Story preconditions**
- Patient exists (any status except `Merged`; a `Merged` source is exported via its target).

**US-07-16-AC5 — Idempotent request (CS-11)**

*Preconditions / test data*
1. an export request with key K succeeded

*Steps*
1. it is retried with K

*Expected results*
1. the same `exportId` is returned and only one job runs

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-108: 403 without permission; CS-08 → 404

| Field | Value |
|---|---|
| Story | [US-07-16](../stories/EPIC-07-PATIENT-RECORDS/US-07-16-export-patient-data.md) — Export a Patient's Data (Data Subject Request) |
| Type / Execution | Security / Automated |
| Priority | T3 (story P2) |
| Release | V1 |
| Covers | US-07-16-AC6, US-07-16-AC7 |
| Critical scenario | CS-08 |
| Requirements | FR-07-017, FR-07-038 |

**Story preconditions**
- Patient exists (any status except `Merged`; a `Merged` source is exported via its target).

**US-07-16-AC6 — Permission denied**

*Preconditions / test data*
1. a pharmacist without `patients.data.export`

*Steps*
1. they request an export

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN`

**US-07-16-AC7 — Cross-organization (CS-08)**

*Preconditions / test data*
1. P belongs to organization A

*Steps*
1. an owner of organization B requests an export or an export id of A

*Expected results*
1. the response is 404 `PATIENTS.NOT_FOUND`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-07-17: Anonymize a Patient

### TS-07-109: Field scan after anonymization: all FR-07-039 personal fields null/cleared within 10 s (NFR-07-006)

| Field | Value |
|---|---|
| Story | [US-07-17](../stories/EPIC-07-PATIENT-RECORDS/US-07-17-anonymize-patient.md) — Anonymize a Patient |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | V1 |
| Covers | US-07-17-AC1 |
| Requirements | FR-07-039, FR-07-040 |

**Story preconditions**
- Patient is `Active` or `Inactive`.

**US-07-17-AC1 — Anonymize clears personal data**

*Preconditions / test data*
1. an owner with `patients.data.anonymize` and patient P (code "PAT-000321") with no active prescriptions

*Steps*
1. they POST `/api/v1/patients/{P}/anonymize` with `confirmationCode` "PAT-000321", `reason` "Patient erasure request", and an `Idempotency-Key`

*Expected results*
1. within 10 s P's name becomes "Anonymized patient", phone, email, address, birth data, gender, national ID, and normalized search keys are null, free text of allergies/conditions/notes is cleared, status is `Anonymized`, and an audit entry is written without the erased values

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-110: Sales, prescriptions, consents, access logs retained and linked

| Field | Value |
|---|---|
| Story | [US-07-17](../stories/EPIC-07-PATIENT-RECORDS/US-07-17-anonymize-patient.md) — Anonymize a Patient |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | V1 |
| Covers | US-07-17-AC2 |
| Requirements | FR-07-039, FR-07-040 |

**Story preconditions**
- Patient is `Active` or `Inactive`.

**US-07-17-AC2 — Retained data**

*Preconditions / test data*
1. the anonymization in AC1

*Steps*
1. linked sales, prescriptions, consents, and access logs are queried

*Expected results*
1. they still exist and reference P's id and patient code
2. coded allergy data (ingredient id, severity) is retained

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-111: Active prescription / controlled-register entry → 409 with reasons

| Field | Value |
|---|---|
| Story | [US-07-17](../stories/EPIC-07-PATIENT-RECORDS/US-07-17-anonymize-patient.md) — Anonymize a Patient |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | V1 |
| Covers | US-07-17-AC3 |
| Requirements | FR-07-039, FR-07-040 |

**Story preconditions**
- Patient is `Active` or `Inactive`.

**US-07-17-AC3 — Blocked by active prescriptions**

*Preconditions / test data*
1. P has a prescription in status `PartiallyDispensed`

*Steps*
1. anonymization is requested

*Expected results*
1. the response is 409 `PATIENTS.ANONYMIZATION_NOT_PERMITTED` with `blockingReasons: ["ActivePrescription"]` and nothing changes

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-112: Confirmation mismatch → 400

| Field | Value |
|---|---|
| Story | [US-07-17](../stories/EPIC-07-PATIENT-RECORDS/US-07-17-anonymize-patient.md) — Anonymize a Patient |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | V1 |
| Covers | US-07-17-AC4 |
| Requirements | FR-07-039, FR-07-040 |

**Story preconditions**
- Patient is `Active` or `Inactive`.

**US-07-17-AC4 — Confirmation mismatch**

*Preconditions / test data*
1. `confirmationCode` "PAT-000322" for patient "PAT-000321"

*Steps*
1. anonymization is requested

*Expected results*
1. the response is 400 `PATIENTS.ANONYMIZE_CONFIRMATION_MISMATCH`

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-113: Post-anonymization writes/links → 422; search returns nothing

| Field | Value |
|---|---|
| Story | [US-07-17](../stories/EPIC-07-PATIENT-RECORDS/US-07-17-anonymize-patient.md) — Anonymize a Patient |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | V1 |
| Covers | US-07-17-AC5 |
| Requirements | FR-07-039, FR-07-040 |

**Story preconditions**
- Patient is `Active` or `Inactive`.

**US-07-17-AC5 — Anonymized patient is terminal**

*Preconditions / test data*
1. P is `Anonymized`

*Steps*
1. a user updates P, links P to a sale, records an allergy, or searches by P's former phone

*Expected results*
1. updates/links/writes return 422 `PATIENTS.PATIENT_ANONYMIZED` and search returns no result

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-114: CS-11 replay

| Field | Value |
|---|---|
| Story | [US-07-17](../stories/EPIC-07-PATIENT-RECORDS/US-07-17-anonymize-patient.md) — Anonymize a Patient |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | V1 |
| Covers | US-07-17-AC6 |
| Critical scenario | CS-11 |
| Requirements | FR-07-039, FR-07-040 |

**Story preconditions**
- Patient is `Active` or `Inactive`.

**US-07-17-AC6 — Idempotent replay (CS-11)**

*Preconditions / test data*
1. anonymization completed with key K

*Steps*
1. retried with K

*Expected results*
1. the stored response is replayed and no second audit entry is written

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-07-115: 403 without permission; CS-08 → 404

| Field | Value |
|---|---|
| Story | [US-07-17](../stories/EPIC-07-PATIENT-RECORDS/US-07-17-anonymize-patient.md) — Anonymize a Patient |
| Type / Execution | Security / Automated |
| Priority | T3 (story P2) |
| Release | V1 |
| Covers | US-07-17-AC7, US-07-17-AC8 |
| Critical scenario | CS-08 |
| Requirements | FR-07-039, FR-07-040 |

**Story preconditions**
- Patient is `Active` or `Inactive`.

**US-07-17-AC7 — Permission denied**

*Preconditions / test data*
1. a manager without `patients.data.anonymize`

*Steps*
1. they request anonymization

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN`

**US-07-17-AC8 — Cross-organization (CS-08)**

*Preconditions / test data*
1. P belongs to organization A

*Steps*
1. an owner of organization B requests anonymization of P

*Expected results*
1. the response is 404 `PATIENTS.NOT_FOUND` and nothing changes

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

