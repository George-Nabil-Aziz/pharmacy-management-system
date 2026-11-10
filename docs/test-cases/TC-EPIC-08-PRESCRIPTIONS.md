# Test Cases — EPIC-08 Prescriptions

> **Generated** by `node scripts/docs/gen-test-cases.mjs` on 2026-11-10 from the story files in `docs/stories/EPIC-08-PRESCRIPTIONS/`. Each test case corresponds to one test scenario (TS) declared in a story; preconditions, steps and expected results are derived from the Given / When / Then of the acceptance criteria it covers. The stories are the source of truth — change a story and regenerate.

**Conventions:** TC ID = TS ID. Priority T0 blocks merge, T1 blocks release, T2/T3 per [MASTER-TEST-STRATEGY §6](../test-plans/MASTER-TEST-STRATEGY.md). Execution: *Automated* tests are implemented in code with a trait/name carrying the TS ID; *Manual* cases are executed from this document. Test data conventions: [TEST-DATA-STRATEGY.md](../test-plans/TEST-DATA-STRATEGY.md).

## Summary (122 test cases)

| TC | Scenario | Type | Priority | Release | Covers |
|---|---|---|---|---|---|
| TS-08-001 | Fresh organization returns all default values and ETag | Integration | T2 | MVP | US-08-01-AC1 |
| TS-08-002 | Update validity to 14; new prescription snapshots 14, old keeps 30; audit old/new values | Integration | T2 | MVP | US-08-01-AC2 |
| TS-08-003 | Boundary values 0/1/365/366, size 0/1/20/21, threshold 0.49/0.50/0.99/1.00 | Unit | T2 | MVP | US-08-01-AC3 |
| TS-08-004 | Enable OCR/interactions without provider → 422; Pharmacist PUT → 403 | Integration | T2 | MVP | US-08-01-AC4, US-08-01-AC5 |
| TS-08-005 | Create prescriber; response has `licenseVerified=false` | Integration | T2 | MVP | US-08-02-AC1 |
| TS-08-006 | Search by name prefix, phone prefix, license prefix; inactive excluded; max 20 | Integration | T2 | MVP | US-08-02-AC2 |
| TS-08-007 | Blank/2/150/151-char names | Unit | T2 | MVP | US-08-02-AC3 |
| TS-08-008 | Cashier PATCH/deactivate → 403; cross-org PATCH → 404 | Integration | T2 | MVP | US-08-02-AC4, US-08-02-AC6 |
| TS-08-009 | New prescription with deactivated prescriber → 422; old prescription shows snapshot | Integration | T2 | MVP | US-08-02-AC5 |
| TS-08-010 | Create draft; number format, expiresOn, history, audit | Integration | T1 | MVP | US-08-03-AC1 |
| TS-08-011 | Inline prescriber created atomically; rollback if prescription invalid | Integration | T1 | MVP | US-08-03-AC2 |
| TS-08-012 | Date boundaries: business date +1, −30 (accepted), −31 (rejected) | Unit | T1 | MVP | US-08-03-AC3 |
| TS-08-013 | Edit Verified → PendingVerification; edit PartiallyDispensed → 409 | Integration | T1 | MVP | US-08-03-AC4, US-08-03-AC5 |
| TS-08-014 | Accountant → 403; Pharmacist on unassigned branch → 403 (CS-07) | Security | T0 | MVP | US-08-03-AC6 |
| TS-08-015 | Other-org patient id → 422 without existence leak (CS-08) | Security | T0 | MVP | US-08-03-AC7 |
| TS-08-016 | Base unit computation for Pack (2×20=40) and BaseUnit (15) | Unit | T1 | MVP | US-08-04-AC1 |
| TS-08-017 | Free-text item stored unresolved, flagged in detail | Integration | T1 | MVP | US-08-04-AC2 |
| TS-08-018 | XOR rule matrix (both, neither, one) | Unit | T1 | MVP | US-08-04-AC3 |
| TS-08-019 | 31st item and quantity 0/10,000 rejected | Integration | T1 | MVP | US-08-04-AC4 |
| TS-08-020 | Soft remove; inactive medicine rejected | Integration | T1 | MVP | US-08-04-AC5, US-08-04-AC6 |
| TS-08-021 | No permission → 403; edit on PartiallyDispensed → 409 | Security | T0 | MVP | US-08-04-AC7 |
| TS-08-022 | Upload JPEG → 201, private key, FileObject, audit, Pending | Integration | T1 | MVP | US-08-05-AC1 |
| TS-08-023 | Fake scanner returns clean → Clean within SLA | Integration | T1 | MVP | US-08-05-AC2 |
| TS-08-024 | EICAR → Infected, object removed, notification, no URL | Integration | T1 | MVP | US-08-05-AC3 |
| TS-08-025 | Signature detection: renamed exe, PNG, PDF, HEIC, zero-byte | Unit | T1 | MVP | US-08-05-AC4 |
| TS-08-026 | 11 MiB → 413; 11th file → 422 | Integration | T1 | MVP | US-08-05-AC5 |
| TS-08-027 | Unlink before/after verification | Integration | T1 | MVP | US-08-05-AC6 |
| TS-08-028 | No permission → 403; Cancelled → 409; other org → 404 | Security | T0 | MVP | US-08-05-AC7 |
| TS-08-029 | Issue URL; headers; audit + access log rows | Integration | T1 | MVP | US-08-06-AC1 |
| TS-08-030 | MinIO URL rejected after 300 s | Integration | T1 | MVP | US-08-06-AC2 |
| TS-08-031 | Pending/Infected/ScanFailed → 409 | Integration | T1 | MVP | US-08-06-AC3 |
| TS-08-032 | Cashier → 403; unassigned branch → 403 (CS-07) | Security | T0 | MVP | US-08-06-AC4 |
| TS-08-033 | Other org attachment → 404 (CS-08) | Security | T0 | MVP | US-08-06-AC5 |
| TS-08-034 | Submit OTC-only draft without patient → PendingVerification | Integration | T1 | MVP | US-08-07-AC1 |
| TS-08-035 | Submit with 0 items → 422 | Integration | T1 | MVP | US-08-07-AC2 |
| TS-08-036 | Rx-only item, no patient, enforcement ON → 422; OFF → 200 | Integration | T1 | MVP | US-08-07-AC3 |
| TS-08-037 | Controlled item, no patient, enforcement OFF → 422 | Integration | T1 | MVP | US-08-07-AC4 |
| TS-08-038 | Double submit → 409; no permission → 403 | Security | T0 | MVP | US-08-07-AC5 |
| TS-08-039 | Full verification records verifier, item acks, history, audit | Integration | T1 | MVP | US-08-08-AC1 |
| TS-08-040 | Checklist matrix: each flag false, missing item ack | Unit | T1 | MVP | US-08-08-AC2 |
| TS-08-041 | Verify with unresolved free text → 422 | Integration | T1 | MVP | US-08-08-AC3 |
| TS-08-042 | Resolve free text; original text retained; base units computed | Integration | T1 | MVP | US-08-08-AC4 |
| TS-08-043 | Controlled item without Clean attachment → 422; setting ON → 422 | Integration | T1 | MVP | US-08-08-AC5 |
| TS-08-044 | Resolved-to-controlled without patient → 422 | Integration | T1 | MVP | US-08-08-AC6 |
| TS-08-045 | Cashier verify/resolve → 403 | Security | T0 | MVP | US-08-08-AC7 |
| TS-08-046 | Filters, pagination, summary-only fields | Integration | T2 | MVP | US-08-09-AC1 |
| TS-08-047 | Detail content and one PatientAccessLog row | Integration | T2 | MVP | US-08-09-AC2 |
| TS-08-048 | History rows ordered; no mutation endpoint | Integration | T2 | MVP | US-08-09-AC3 |
| TS-08-049 | Patient history excludes unassigned branch | Security | T1 | MVP | US-08-09-AC4 |
| TS-08-050 | Unassigned branch / no permission → 403 (CS-07) | Security | T1 | MVP | US-08-09-AC5 |
| TS-08-051 | Wrong-branch id and other-org id → 404 (CS-08) | Security | T1 | MVP | US-08-09-AC6 |
| TS-08-052 | List p95 ≤ 500 ms at 1,000,000 prescriptions; detail p95 ≤ 500 ms | Performance | T2 | MVP | US-08-09-AC1, US-08-09-AC2 |
| TS-08-053 | Cancel PartiallyDispensed; records retained; history + audit | Integration | T2 | MVP | US-08-10-AC1 |
| TS-08-054 | Sale against cancelled prescription → 422, no sale/stock change | Integration | T2 | MVP | US-08-10-AC2 |
| TS-08-055 | Reason length boundaries; FullyDispensed cancel → 409 | Unit | T2 | MVP | US-08-10-AC3 |
| TS-08-056 | Cashier cancel → 403 | Security | T1 | MVP | US-08-10-AC4 |
| TS-08-057 | Cancel and sale in parallel: exactly one consistent outcome | Concurrency | T1 | MVP | US-08-10-AC1, US-08-10-AC2 |
| TS-08-058 | Job expires 4 statuses, skips FullyDispensed, logs run | Integration | T2 | MVP | US-08-11-AC1 |
| TS-08-059 | ExpiresOn = business date is still dispensable | Integration | T2 | MVP | US-08-11-AC2 |
| TS-08-060 | Sale at 00:10 before job → PRESCRIPTIONS.EXPIRED | Integration | T2 | MVP | US-08-11-AC3 |
| TS-08-061 | Re-run produces no duplicate history | Integration | T2 | MVP | US-08-11-AC4 |
| TS-08-062 | Status field read-only on PATCH; unassigned branch 403 (CS-07); other organization 404 (CS-08) | Security | T1 | MVP | US-08-11-AC5 |
| TS-08-063 | 100,000 eligible prescriptions expired in ≤ 5 min | Performance | T2 | MVP | US-08-11-AC1 |
| TS-08-064 | Dispensing context content | Integration | T1 | MVP | US-08-12-AC1 |
| TS-08-065 | **CS-04**: visit 1 dispenses 1 of 3 packs (FEFO B1) → PartiallyDispensed; visit 2 (other pharmacist, +10 days) dispenses 2 packs across B1/B2 → FullyDispensed; verify 3 dispensing records, quantities, statuses, history | Integration | T0 | MVP | US-08-12-AC2, US-08-12-AC3 |
| TS-08-066 | Over-remaining single line and split lines → full rollback | Integration | T1 | MVP | US-08-12-AC4 |
| TS-08-067 | Medicine/branch/status mismatch matrix | Integration | T1 | MVP | US-08-12-AC5 |
| TS-08-068 | 50 parallel sales vs remaining 1 pack → exactly 1 success (PostgreSQL) | Concurrency | T0 | MVP | US-08-12-AC6 |
| TS-08-069 | Pack rounding without/with reason | Integration | T1 | MVP | US-08-12-AC7 |
| TS-08-070 | Patient auto-set and mismatch | Integration | T1 | MVP | US-08-12-AC8 |
| TS-08-071 | Cashier without dispense permission → 403 on context and sale | Security | T0 | MVP | US-08-12-AC9 |
| TS-08-072 | Idempotent retry (CS-11) and fault injection rollback (CS-10) | Integration | T0 | MVP | US-08-12-AC10 |
| TS-08-073 | Validation overhead ≤ 150 ms p95 for 10 linked lines | Performance | T0 | MVP | US-08-12-AC2 |
| TS-08-074 | **CS-13**: Rx-only sale without prescription, enforcement ON → 422; assert zero rows in sales, movements, payments, cash movements; batch balance unchanged | Integration | T0 | MVP | US-08-13-AC1 |
| TS-08-075 | **CS-13**: Rx-only linked to PendingVerification prescription → 422 | Integration | T0 | MVP | US-08-13-AC2 |
| TS-08-076 | Enforcement OFF → completes with audit entry per line | Integration | T1 | MVP | US-08-13-AC3 |
| TS-08-077 | **CS-13**: controlled without link, enforcement OFF → 422 | Integration | T0 | MVP | US-08-13-AC4 |
| TS-08-078 | Controlled without controlled permission → 403, nothing persisted | Security | T0 | MVP | US-08-13-AC5 |
| TS-08-079 | Controlled with permission → dispensing record + register entry | Integration | T1 | MVP | US-08-13-AC6 |
| TS-08-080 | POS badge and disabled checkout; API bypass still rejected | E2E | T0 | MVP | US-08-13-AC7, US-08-13-AC1 |
| TS-08-081 | Void S2 → compensating rows, quantities, PartiallyDispensed | Integration | T2 | MVP | US-08-14-AC1 |
| TS-08-082 | Void for Expired/Cancelled keeps status | Integration | T2 | MVP | US-08-14-AC2 |
| TS-08-083 | Sales return leaves quantities; reference shown | Integration | T2 | MVP | US-08-14-AC3 |
| TS-08-084 | Fault injection rollback; idempotent retry | Integration | T2 | MVP | US-08-14-AC4 |
| TS-08-085 | Void without permission → 403 | Security | T1 | MVP | US-08-14-AC5 |
| TS-08-086 | Entry fields and running balance on dispensing | Integration | T2 | MVP | US-08-15-AC1 |
| TS-08-087 | Gapless numbering after rollback | Integration | T2 | MVP | US-08-15-AC2 |
| TS-08-088 | Reversal entry on void | Integration | T2 | MVP | US-08-15-AC3 |
| TS-08-089 | View with cursor pagination; CSV/PDF export; audit row | Integration | T2 | MVP | US-08-15-AC4 |
| TS-08-090 | Range boundaries 366/367 days and from > to | Unit | T2 | MVP | US-08-15-AC5 |
| TS-08-091 | Cashier → 403; unassigned branch → 403 | Security | T1 | MVP | US-08-15-AC6 |
| TS-08-092 | No update/delete endpoint; DB role denies UPDATE/DELETE | Security | T1 | MVP | US-08-15-AC7 |
| TS-08-093 | Record substitution; context lists substitute; audit | Integration | T3 | Future | US-08-16-AC1 |
| TS-08-094 | Dispense substitute; record stores both medicines | Integration | T3 | Future | US-08-16-AC2 |
| TS-08-095 | Consent, same/inactive medicine, reason rules | Unit | T3 | Future | US-08-16-AC3, US-08-16-AC4 |
| TS-08-096 | Feature OFF → 422; Cashier → 403 | Integration | T3 | Future | US-08-16-AC5, US-08-16-AC6 |
| TS-08-097 | Non-listed substitute warning and flag | E2E | T3 | Future | US-08-16-AC7 |
| TS-08-098 | Fake SPEC-07 facade returns match → alert + disclaimer | Integration | T3 | Future | US-08-17-AC1 |
| TS-08-099 | Verify and sale blocked until acknowledged | Integration | T3 | Future | US-08-17-AC2 |
| TS-08-100 | Acknowledge stores override and audit; flow proceeds | Integration | T3 | Future | US-08-17-AC3 |
| TS-08-101 | Short reason → 422; Cashier → 403 | Security | T3 | Future | US-08-17-AC4 |
| TS-08-102 | PDF with 2 bilingual labels; RTL shaping visual check | Integration | T3 | Future | US-08-18-AC1 |
| TS-08-103 | No patient → "—" | Integration | T3 | Future | US-08-18-AC2 |
| TS-08-104 | No dispensing → 422; invalid lang → 422 | Integration | T3 | Future | US-08-18-AC3, US-08-18-AC5 |
| TS-08-105 | Cashier → 403; unassigned branch → 403 | Security | T3 | Future | US-08-18-AC4 |
| TS-08-106 | 30 labels ≤ 2 s p95 | Performance | T3 | Future | US-08-18-AC1 |
| TS-08-107 | Reference behavior and exact values for FR-08-045 | Integration | T3 | Future | US-08-19-AC1 |
| TS-08-108 | Negative validation path, no partial effect; PRESCRIPTIONS.INVALID_STATUS_TRANSITION | Integration | T3 | Future | US-08-19-AC2 |
| TS-08-109 | Missing permission and cross-branch access return 403 (CS-07) | Security | T3 | Future | US-08-19-AC3 |
| TS-08-110 | Cross-organization id returns 404 without data (CS-08) | Security | T3 | Future | US-08-19-AC4 |
| TS-08-111 | Reference behavior and exact values for FR-08-046 | Integration | T3 | Future | US-08-20-AC1 |
| TS-08-112 | Negative validation path, no partial effect; PRESCRIPTIONS.INVALID_STATUS_TRANSITION | Integration | T3 | Future | US-08-20-AC2 |
| TS-08-113 | Missing permission and cross-branch access return 403 (CS-07) | Security | T3 | Future | US-08-20-AC3 |
| TS-08-114 | Cross-organization id returns 404 without data (CS-08) | Security | T3 | Future | US-08-20-AC4 |
| TS-08-115 | Reference behavior and exact values for FR-08-047 | Integration | T3 | Future | US-08-21-AC1 |
| TS-08-116 | Negative validation path, no partial effect; PRESCRIPTIONS.INVALID_STATUS_TRANSITION | Integration | T3 | Future | US-08-21-AC2 |
| TS-08-117 | Missing permission and cross-branch access return 403 (CS-07) | Security | T3 | Future | US-08-21-AC3 |
| TS-08-118 | Cross-organization id returns 404 without data (CS-08) | Security | T3 | Future | US-08-21-AC4 |
| TS-08-119 | Reference behavior and exact values for FR-08-048, FR-08-049, FR-08-050 | Integration | T3 | Future | US-08-22-AC1 |
| TS-08-120 | Negative validation path, no partial effect; PRESCRIPTIONS.INVALID_STATUS_TRANSITION | Integration | T3 | Future | US-08-22-AC2 |
| TS-08-121 | Missing permission and cross-branch access return 403 (CS-07) | Security | T3 | Future | US-08-22-AC3 |
| TS-08-122 | Cross-organization id returns 404 without data (CS-08) | Security | T3 | Future | US-08-22-AC4 |

---

## US-08-01: Prescription Settings

### TS-08-001: Fresh organization returns all default values and ETag

| Field | Value |
|---|---|
| Story | [US-08-01](../stories/EPIC-08-PRESCRIPTIONS/US-08-01-prescription-settings.md) — Prescription Settings |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-08-01-AC1 |
| Requirements | FR-08-001, FR-08-002, FR-08-003 |

**Story preconditions**
- Organization exists with `OrganizationSettings`.
- Caller is authenticated.

**US-08-01-AC1 — Defaults are applied**

*Preconditions / test data*
1. a newly created organization

*Steps*
1. a user with `prescriptions.prescriptions.read` calls `GET /api/v1/settings/prescriptions`

*Expected results*
1. the response is 200 with `prescriptionValidityDays = 30`, `prescriptionAttachmentMaxSizeMb = 10`, `prescriptionAttachmentMaxCount = 10`, `requireAttachmentForVerification = false`, `allowGenericSubstitution = false`, `requireConsentForSubstitution = true`, `allowPrescriptionRefills = false`, `ocrEnabled = false`, `ocrLowConfidenceThreshold = 0.80`, `drugInteractionChecksEnabled = false`, and an `ETag` header.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-002: Update validity to 14; new prescription snapshots 14, old keeps 30; audit old/new values

| Field | Value |
|---|---|
| Story | [US-08-01](../stories/EPIC-08-PRESCRIPTIONS/US-08-01-prescription-settings.md) — Prescription Settings |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-08-01-AC2 |
| Requirements | FR-08-001, FR-08-002, FR-08-003 |

**Story preconditions**
- Organization exists with `OrganizationSettings`.
- Caller is authenticated.

**US-08-01-AC2 — Owner updates settings and change is audited**

*Preconditions / test data*
1. an Owner holding `settings.organization.manage` and the current `ETag`

*Steps*
1. the Owner sets `prescriptionValidityDays = 14` via `PUT /api/v1/settings/prescriptions` with `If-Match`

*Expected results*
1. the response is 200, new prescriptions get `ValidityDays = 14`, prescriptions created earlier keep their snapshotted value, and an `AuditLog` entry records old value 30 and new value 14.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-003: Boundary values 0/1/365/366, size 0/1/20/21, threshold 0.49/0.50/0.99/1.00

| Field | Value |
|---|---|
| Story | [US-08-01](../stories/EPIC-08-PRESCRIPTIONS/US-08-01-prescription-settings.md) — Prescription Settings |
| Type / Execution | Unit / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-08-01-AC3 |
| Requirements | FR-08-001, FR-08-002, FR-08-003 |

**Story preconditions**
- Organization exists with `OrganizationSettings`.
- Caller is authenticated.

**US-08-01-AC3 — Out-of-range values rejected**

*Preconditions / test data*
1. an Owner

*Steps*
1. the Owner submits `prescriptionValidityDays = 0`, `prescriptionAttachmentMaxSizeMb = 25`, or `ocrLowConfidenceThreshold = 0.30`

*Expected results*
1. the response is 422 `PRESCRIPTIONS.SETTING_OUT_OF_RANGE` with the offending field in `errors`, and no setting changes.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-004: Enable OCR/interactions without provider → 422; Pharmacist PUT → 403

| Field | Value |
|---|---|
| Story | [US-08-01](../stories/EPIC-08-PRESCRIPTIONS/US-08-01-prescription-settings.md) — Prescription Settings |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-08-01-AC4, US-08-01-AC5 |
| Requirements | FR-08-001, FR-08-002, FR-08-003 |

**Story preconditions**
- Organization exists with `OrganizationSettings`.
- Caller is authenticated.

**US-08-01-AC4 — Provider-dependent toggles blocked without provider**

*Preconditions / test data*
1. the deployment has no OCR provider and no drug interaction source configured

*Steps*
1. the Owner sets `ocrEnabled = true` or `drugInteractionChecksEnabled = true`

*Expected results*
1. the response is 422 `PRESCRIPTIONS.PROVIDER_NOT_CONFIGURED` and the toggle remains `false`.

**US-08-01-AC5 — Permission denied**

*Preconditions / test data*
1. a Pharmacist without `settings.organization.manage`

*Steps*
1. the Pharmacist calls `PUT /api/v1/settings/prescriptions`

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN` and no audit entry for a change is written.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-08-02: Manage Prescribers

### TS-08-005: Create prescriber; response has `licenseVerified=false`

| Field | Value |
|---|---|
| Story | [US-08-02](../stories/EPIC-08-PRESCRIPTIONS/US-08-02-manage-prescribers.md) — Manage Prescribers |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-08-02-AC1 |
| Requirements | FR-08-004 |

**Story preconditions**
- Caller is authenticated and belongs to the organization.

**US-08-02-AC1 — Create prescriber**

*Preconditions / test data*
1. a user with `prescriptions.prescriptions.create`

*Steps*
1. the user posts `{ "fullName": "Dr. Ahmed Samir", "specialty": "Internal Medicine", "phone": "01001234567", "licenseNumber": "12345" }` to `/api/v1/prescribers`

*Expected results*
1. the response is 201 with the prescriber, `isActive = true`, and `licenseVerified = false`.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-006: Search by name prefix, phone prefix, license prefix; inactive excluded; max 20

| Field | Value |
|---|---|
| Story | [US-08-02](../stories/EPIC-08-PRESCRIPTIONS/US-08-02-manage-prescribers.md) — Manage Prescribers |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-08-02-AC2 |
| Requirements | FR-08-004 |

**Story preconditions**
- Caller is authenticated and belongs to the organization.

**US-08-02-AC2 — Search prescribers**

*Preconditions / test data*
1. 3 active prescribers whose names start with "Ahmed" and 1 deactivated one

*Steps*
1. the user calls `GET /api/v1/prescribers?q=ahmed`

*Expected results*
1. the response contains the 3 active prescribers (≤ 20 results, case- and Arabic/Latin-diacritic-insensitive match on name, phone or license prefix) and excludes the deactivated one unless `includeInactive=true`.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-007: Blank/2/150/151-char names

| Field | Value |
|---|---|
| Story | [US-08-02](../stories/EPIC-08-PRESCRIPTIONS/US-08-02-manage-prescribers.md) — Manage Prescribers |
| Type / Execution | Unit / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-08-02-AC3 |
| Requirements | FR-08-004 |

**Story preconditions**
- Caller is authenticated and belongs to the organization.

**US-08-02-AC3 — Name required**

*Preconditions / test data*
1. a user with `prescriptions.prescriptions.create`

*Steps*
1. the user posts a prescriber with `fullName = " "`

*Expected results*
1. the response is 422 `PRESCRIPTIONS.PRESCRIBER_NAME_REQUIRED` and nothing is stored.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-008: Cashier PATCH/deactivate → 403; cross-org PATCH → 404

| Field | Value |
|---|---|
| Story | [US-08-02](../stories/EPIC-08-PRESCRIPTIONS/US-08-02-manage-prescribers.md) — Manage Prescribers |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-08-02-AC4, US-08-02-AC6 |
| Requirements | FR-08-004 |

**Story preconditions**
- Caller is authenticated and belongs to the organization.

**US-08-02-AC4 — Update and deactivate require manage permission**

*Preconditions / test data*
1. a Cashier with `prescriptions.prescriptions.create` but without `prescriptions.prescribers.manage`

*Steps*
1. the Cashier calls `PATCH /api/v1/prescribers/{id}` or `POST /api/v1/prescribers/{id}/deactivate`

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN`.

**US-08-02-AC6 — Cross-organization isolation**

*Preconditions / test data*
1. a prescriber belonging to organization B

*Steps*
1. a user of organization A calls `PATCH /api/v1/prescribers/{idOfB}`

*Expected results*
1. the response is 404 `PRESCRIPTIONS.NOT_FOUND`.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-009: New prescription with deactivated prescriber → 422; old prescription shows snapshot

| Field | Value |
|---|---|
| Story | [US-08-02](../stories/EPIC-08-PRESCRIPTIONS/US-08-02-manage-prescribers.md) — Manage Prescribers |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-08-02-AC5 |
| Requirements | FR-08-004 |

**Story preconditions**
- Caller is authenticated and belongs to the organization.

**US-08-02-AC5 — Deactivated prescriber cannot be used on new prescriptions**

*Preconditions / test data*
1. a deactivated prescriber referenced by existing prescriptions

*Steps*
1. a user creates a new prescription with that `prescriberId`

*Expected results*
1. the response is 422 `PRESCRIPTIONS.PRESCRIBER_INVALID`, and existing prescriptions still display the prescriber's snapshot name.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-08-03: Register a Draft Prescription

### TS-08-010: Create draft; number format, expiresOn, history, audit

| Field | Value |
|---|---|
| Story | [US-08-03](../stories/EPIC-08-PRESCRIPTIONS/US-08-03-register-prescription.md) — Register a Draft Prescription |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-08-03-AC1 |
| Requirements | FR-08-005, FR-08-006, FR-08-007, FR-08-024 |

**Story preconditions**
- Caller is assigned to the branch in the route.
- Branch has a branch code and business date (SPEC-02).

**US-08-03-AC1 — Create draft with number and expiry**

*Preconditions / test data*
1. branch `CAI01` with business date 2026-11-09 and `PrescriptionValidityDays = 30`

*Steps*
1. a user with `prescriptions.prescriptions.create` posts `{ "patientId": null, "prescriberId": "<active>", "prescriptionDate": "2026-11-05" }` to `/api/v1/branches/{branchId}/prescriptions`

*Expected results*
1. the response is 201 with `status = "Draft"`, `number` matching `CAI01-RX-2026-\d{6}`, `validityDays = 30`, `expiresOn = "2026-12-05"`, an `ETag`, a status history row `null → Draft`, and an `AuditLog` entry.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-011: Inline prescriber created atomically; rollback if prescription invalid

| Field | Value |
|---|---|
| Story | [US-08-03](../stories/EPIC-08-PRESCRIPTIONS/US-08-03-register-prescription.md) — Register a Draft Prescription |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-08-03-AC2 |
| Requirements | FR-08-005, FR-08-006, FR-08-007, FR-08-024 |

**Story preconditions**
- Caller is assigned to the branch in the route.
- Branch has a branch code and business date (SPEC-02).

**US-08-03-AC2 — Inline prescriber**

*Preconditions / test data*
1. no existing prescriber record for the doctor

*Steps*
1. the user posts the prescription with `"prescriber": { "fullName": "Dr. Mona Adel", "phone": "0223456789" }` instead of `prescriberId`

*Expected results*
1. a `Prescriber` is created in the same transaction and linked, and the prescription stores `prescriberNameSnapshot = "Dr. Mona Adel"`.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-012: Date boundaries: business date +1, −30 (accepted), −31 (rejected)

| Field | Value |
|---|---|
| Story | [US-08-03](../stories/EPIC-08-PRESCRIPTIONS/US-08-03-register-prescription.md) — Register a Draft Prescription |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-08-03-AC3 |
| Requirements | FR-08-005, FR-08-006, FR-08-007, FR-08-024 |

**Story preconditions**
- Caller is assigned to the branch in the route.
- Branch has a branch code and business date (SPEC-02).

**US-08-03-AC3 — Future or already-expired date rejected**

*Preconditions / test data*
1. business date 2026-11-09 and validity 30 days

*Steps*
1. the user submits `prescriptionDate = "2026-11-10"` or `prescriptionDate = "2026-10-09"`

*Expected results*
1. the response is 422 with `PRESCRIPTIONS.DATE_IN_FUTURE` or `PRESCRIPTIONS.ALREADY_EXPIRED` respectively, and no prescription or number is created.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-013: Edit Verified → PendingVerification; edit PartiallyDispensed → 409

| Field | Value |
|---|---|
| Story | [US-08-03](../stories/EPIC-08-PRESCRIPTIONS/US-08-03-register-prescription.md) — Register a Draft Prescription |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-08-03-AC4, US-08-03-AC5 |
| Requirements | FR-08-005, FR-08-006, FR-08-007, FR-08-024 |

**Story preconditions**
- Caller is assigned to the branch in the route.
- Branch has a branch code and business date (SPEC-02).

**US-08-03-AC4 — Edit Verified prescription reverts to PendingVerification**

*Preconditions / test data*
1. a `Verified` prescription with no dispensing records

*Steps*
1. the user patches `notes` with a valid `If-Match`

*Expected results*
1. the response is 200, `status = "PendingVerification"`, `verifiedBy`/`verifiedAt` are cleared, and history records `Verified → PendingVerification` with reason `Edited after verification`.

**US-08-03-AC5 — Edit after dispensing rejected**

*Preconditions / test data*
1. a `PartiallyDispensed` prescription

*Steps*
1. the user patches any header field

*Expected results*
1. the response is 409 `PRESCRIPTIONS.IMMUTABLE_AFTER_DISPENSING` and nothing changes.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-014: Accountant → 403; Pharmacist on unassigned branch → 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-08-03](../stories/EPIC-08-PRESCRIPTIONS/US-08-03-register-prescription.md) — Register a Draft Prescription |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-08-03-AC6 |
| Critical scenario | CS-07 |
| Requirements | FR-08-005, FR-08-006, FR-08-007, FR-08-024 |

**Story preconditions**
- Caller is assigned to the branch in the route.
- Branch has a branch code and business date (SPEC-02).

**US-08-03-AC6 — Permission denied and cross-branch**

*Preconditions / test data*
1. an Accountant without `prescriptions.prescriptions.create`, and a Pharmacist assigned only to branch A

*Steps*
1. the Accountant posts to branch A, and the Pharmacist posts to branch B

*Expected results*
1. both responses are 403 `COMMON.FORBIDDEN` (CS-07).

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-015: Other-org patient id → 422 without existence leak (CS-08)

| Field | Value |
|---|---|
| Story | [US-08-03](../stories/EPIC-08-PRESCRIPTIONS/US-08-03-register-prescription.md) — Register a Draft Prescription |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-08-03-AC7 |
| Critical scenario | CS-08 |
| Requirements | FR-08-005, FR-08-006, FR-08-007, FR-08-024 |

**Story preconditions**
- Caller is assigned to the branch in the route.
- Branch has a branch code and business date (SPEC-02).

**US-08-03-AC7 — Cross-organization patient**

*Preconditions / test data*
1. a patient id belonging to another organization

*Steps*
1. the user creates a prescription with that `patientId`

*Expected results*
1. the response is 422 `PRESCRIPTIONS.PATIENT_INVALID` and the response does not reveal whether the patient exists elsewhere.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-08-04: Add and Edit Prescription Items

### TS-08-016: Base unit computation for Pack (2×20=40) and BaseUnit (15)

| Field | Value |
|---|---|
| Story | [US-08-04](../stories/EPIC-08-PRESCRIPTIONS/US-08-04-prescription-items.md) — Add and Edit Prescription Items |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-08-04-AC1 |
| Requirements | FR-08-007, FR-08-008, FR-08-009, FR-08-010 |

**Story preconditions**
- Prescription exists in `Draft`, `PendingVerification`, or `Verified` without dispensing.

**US-08-04-AC1 — Add catalog item in packs**

*Preconditions / test data*
1. a Draft prescription and active medicine M with `PackSize = 20`

*Steps*
1. the user posts `{ "medicineId": "M", "dosage": "500 mg", "frequency": "every 8 hours", "durationDays": 7, "route": "Oral", "instructions": "after meals", "prescribedQuantity": 2, "prescribedUnit": "Pack" }` with the prescription `If-Match`

*Expected results*
1. the response is 201 with `prescribedQuantityBaseUnits = 40`, `dispensedQuantityBaseUnits = 0`, `remainingQuantityBaseUnits = 40`.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-017: Free-text item stored unresolved, flagged in detail

| Field | Value |
|---|---|
| Story | [US-08-04](../stories/EPIC-08-PRESCRIPTIONS/US-08-04-prescription-items.md) — Add and Edit Prescription Items |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-08-04-AC2 |
| Requirements | FR-08-007, FR-08-008, FR-08-009, FR-08-010 |

**Story preconditions**
- Prescription exists in `Draft`, `PendingVerification`, or `Verified` without dispensing.

**US-08-04-AC2 — Add free-text item**

*Preconditions / test data*
1. the doctor wrote a medicine not found in the catalog

*Steps*
1. the user posts `{ "freeTextMedicineName": "Augmentin 1g", "prescribedQuantity": 1, "prescribedUnit": "Pack" }`

*Expected results*
1. the item is stored with `medicineId = null`, `isResolved = false`, `prescribedQuantityBaseUnits = null`, and the prescription detail flags it "must be resolved before verification".

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-018: XOR rule matrix (both, neither, one)

| Field | Value |
|---|---|
| Story | [US-08-04](../stories/EPIC-08-PRESCRIPTIONS/US-08-04-prescription-items.md) — Add and Edit Prescription Items |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-08-04-AC3 |
| Requirements | FR-08-007, FR-08-008, FR-08-009, FR-08-010 |

**Story preconditions**
- Prescription exists in `Draft`, `PendingVerification`, or `Verified` without dispensing.

**US-08-04-AC3 — Medicine and free text are mutually exclusive**

*Preconditions / test data*
1. a Draft prescription

*Steps*
1. the user posts an item with both `medicineId` and `freeTextMedicineName`, or with neither

*Expected results*
1. the response is 422 `PRESCRIPTIONS.ITEM_MEDICINE_XOR_TEXT`.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-019: 31st item and quantity 0/10,000 rejected

| Field | Value |
|---|---|
| Story | [US-08-04](../stories/EPIC-08-PRESCRIPTIONS/US-08-04-prescription-items.md) — Add and Edit Prescription Items |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-08-04-AC4 |
| Requirements | FR-08-007, FR-08-008, FR-08-009, FR-08-010 |

**Story preconditions**
- Prescription exists in `Draft`, `PendingVerification`, or `Verified` without dispensing.

**US-08-04-AC4 — Quantity and item limit validation**

*Preconditions / test data*
1. a Draft prescription with 30 active items

*Steps*
1. the user adds a 31st item, or adds an item with `prescribedQuantity = 0`

*Expected results*
1. the responses are 422 `PRESCRIPTIONS.ITEM_LIMIT_REACHED` and 422 `PRESCRIPTIONS.QUANTITY_INVALID` respectively.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-020: Soft remove; inactive medicine rejected

| Field | Value |
|---|---|
| Story | [US-08-04](../stories/EPIC-08-PRESCRIPTIONS/US-08-04-prescription-items.md) — Add and Edit Prescription Items |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-08-04-AC5, US-08-04-AC6 |
| Requirements | FR-08-007, FR-08-008, FR-08-009, FR-08-010 |

**Story preconditions**
- Prescription exists in `Draft`, `PendingVerification`, or `Verified` without dispensing.

**US-08-04-AC5 — Remove item is soft**

*Preconditions / test data*
1. a PendingVerification prescription with 2 items

*Steps*
1. the user calls `DELETE .../items/{itemId}`

*Expected results*
1. the item has `isRemoved = true`, is excluded from active items and totals, remains visible in history, and an audit entry is written.

**US-08-04-AC6 — Inactive medicine rejected**

*Preconditions / test data*
1. medicine N with status `Inactive`

*Steps*
1. the user adds an item with `medicineId = N`

*Expected results*
1. the response is 422 `PRESCRIPTIONS.MEDICINE_INVALID`.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-021: No permission → 403; edit on PartiallyDispensed → 409

| Field | Value |
|---|---|
| Story | [US-08-04](../stories/EPIC-08-PRESCRIPTIONS/US-08-04-prescription-items.md) — Add and Edit Prescription Items |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-08-04-AC7 |
| Requirements | FR-08-007, FR-08-008, FR-08-009, FR-08-010 |

**Story preconditions**
- Prescription exists in `Draft`, `PendingVerification`, or `Verified` without dispensing.

**US-08-04-AC7 — Permission denied and immutability**

*Preconditions / test data*
1. a user without `prescriptions.prescriptions.create`, and separately a `PartiallyDispensed` prescription

*Steps*
1. the first user adds an item, and an authorized user edits an item of the partially dispensed prescription

*Expected results*
1. the responses are 403 `COMMON.FORBIDDEN` and 409 `PRESCRIPTIONS.IMMUTABLE_AFTER_DISPENSING`.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-08-05: Upload Prescription Attachments with Malware Scanning

### TS-08-022: Upload JPEG → 201, private key, FileObject, audit, Pending

| Field | Value |
|---|---|
| Story | [US-08-05](../stories/EPIC-08-PRESCRIPTIONS/US-08-05-upload-prescription-attachments.md) — Upload Prescription Attachments with Malware Scanning |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-08-05-AC1 |
| Requirements | FR-08-011, FR-08-012, FR-08-014 |

**Story preconditions**
- Prescription exists and is not `Cancelled` or `Expired`.
- Object storage and the malware scanning abstraction are configured (a no-op scanner is allowed only outside Production).

**US-08-05-AC1 — Upload accepted and queued for scan**

*Preconditions / test data*
1. a Draft prescription with 0 attachments and `PrescriptionAttachmentMaxSizeMb = 10`

*Steps*
1. a user with `prescriptions.prescriptions.create` uploads a 3 MiB JPEG as `multipart/form-data` to `.../prescriptions/{id}/attachments`

*Expected results*
1. the response is 201 with `attachmentId`, `contentType = "image/jpeg"`, `sizeBytes`, `sha256`, `scanStatus = "Pending"`
2. the object is in a private bucket under a random key
3. a `FileObject` row and an `AuditLog` entry exist.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-023: Fake scanner returns clean → Clean within SLA

| Field | Value |
|---|---|
| Story | [US-08-05](../stories/EPIC-08-PRESCRIPTIONS/US-08-05-upload-prescription-attachments.md) — Upload Prescription Attachments with Malware Scanning |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-08-05-AC2 |
| Requirements | FR-08-011, FR-08-012, FR-08-014 |

**Story preconditions**
- Prescription exists and is not `Cancelled` or `Expired`.
- Object storage and the malware scanning abstraction are configured (a no-op scanner is allowed only outside Production).

**US-08-05-AC2 — Scan verdict Clean**

*Preconditions / test data*
1. an attachment with `scanStatus = Pending`

*Steps*
1. the scanner returns "clean"

*Expected results*
1. `scanStatus = Clean` and `scanCompletedAt` is set within 60 s p95 of upload.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-024: EICAR → Infected, object removed, notification, no URL

| Field | Value |
|---|---|
| Story | [US-08-05](../stories/EPIC-08-PRESCRIPTIONS/US-08-05-upload-prescription-attachments.md) — Upload Prescription Attachments with Malware Scanning |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-08-05-AC3 |
| Requirements | FR-08-011, FR-08-012, FR-08-014 |

**Story preconditions**
- Prescription exists and is not `Cancelled` or `Expired`.
- Object storage and the malware scanning abstraction are configured (a no-op scanner is allowed only outside Production).

**US-08-05-AC3 — Infected file quarantined**

*Preconditions / test data*
1. an uploaded file that the scanner reports as infected (EICAR test file)

*Steps*
1. the verdict is received

*Expected results*
1. `scanStatus = Infected`, the object is removed from the bucket within 60 s, metadata is kept, the uploader receives a notification, and no access URL can be issued for it.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-025: Signature detection: renamed exe, PNG, PDF, HEIC, zero-byte

| Field | Value |
|---|---|
| Story | [US-08-05](../stories/EPIC-08-PRESCRIPTIONS/US-08-05-upload-prescription-attachments.md) — Upload Prescription Attachments with Malware Scanning |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-08-05-AC4 |
| Requirements | FR-08-011, FR-08-012, FR-08-014 |

**Story preconditions**
- Prescription exists and is not `Cancelled` or `Expired`.
- Object storage and the malware scanning abstraction are configured (a no-op scanner is allowed only outside Production).

**US-08-05-AC4 — Type detected by signature**

*Preconditions / test data*
1. a file named `rx.jpg` whose content is an executable, and a valid HEIC file named `rx.heic`

*Steps*
1. each is uploaded

*Expected results*
1. the executable is rejected with 415 `PRESCRIPTIONS.ATTACHMENT_TYPE_NOT_ALLOWED` and the HEIC is accepted with `contentType = "image/heic"`.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-026: 11 MiB → 413; 11th file → 422

| Field | Value |
|---|---|
| Story | [US-08-05](../stories/EPIC-08-PRESCRIPTIONS/US-08-05-upload-prescription-attachments.md) — Upload Prescription Attachments with Malware Scanning |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-08-05-AC5 |
| Requirements | FR-08-011, FR-08-012, FR-08-014 |

**Story preconditions**
- Prescription exists and is not `Cancelled` or `Expired`.
- Object storage and the malware scanning abstraction are configured (a no-op scanner is allowed only outside Production).

**US-08-05-AC5 — Size and count limits**

*Preconditions / test data*
1. `PrescriptionAttachmentMaxSizeMb = 10` and `PrescriptionAttachmentMaxCount = 10` with 10 active attachments

*Steps*
1. the user uploads an 11 MiB PDF, or an 11th valid file

*Expected results*
1. the responses are 413 `PRESCRIPTIONS.ATTACHMENT_TOO_LARGE` and 422 `PRESCRIPTIONS.ATTACHMENT_LIMIT_REACHED`
2. nothing is stored.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-027: Unlink before/after verification

| Field | Value |
|---|---|
| Story | [US-08-05](../stories/EPIC-08-PRESCRIPTIONS/US-08-05-upload-prescription-attachments.md) — Upload Prescription Attachments with Malware Scanning |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-08-05-AC6 |
| Requirements | FR-08-011, FR-08-012, FR-08-014 |

**Story preconditions**
- Prescription exists and is not `Cancelled` or `Expired`.
- Object storage and the malware scanning abstraction are configured (a no-op scanner is allowed only outside Production).

**US-08-05-AC6 — Unlink before verification only**

*Preconditions / test data*
1. a PendingVerification prescription with an attachment, and a Verified prescription with an attachment

*Steps*
1. the user calls `DELETE .../attachments/{attachmentId}` on each

*Expected results*
1. the first returns 204 with `isRemoved = true` and `FileObject` retained
2. the second returns 409 `PRESCRIPTIONS.ATTACHMENT_LOCKED`.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-028: No permission → 403; Cancelled → 409; other org → 404

| Field | Value |
|---|---|
| Story | [US-08-05](../stories/EPIC-08-PRESCRIPTIONS/US-08-05-upload-prescription-attachments.md) — Upload Prescription Attachments with Malware Scanning |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-08-05-AC7 |
| Requirements | FR-08-011, FR-08-012, FR-08-014 |

**Story preconditions**
- Prescription exists and is not `Cancelled` or `Expired`.
- Object storage and the malware scanning abstraction are configured (a no-op scanner is allowed only outside Production).

**US-08-05-AC7 — Permission denied and closed statuses**

*Preconditions / test data*
1. a user without `prescriptions.prescriptions.create`, and a `Cancelled` prescription

*Steps*
1. the user uploads, and an authorized user uploads to the cancelled prescription

*Expected results*
1. the responses are 403 `COMMON.FORBIDDEN` and 409 `PRESCRIPTIONS.INVALID_STATUS_TRANSITION`.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-08-06: View Prescription Attachments via Pre-signed URL

### TS-08-029: Issue URL; headers; audit + access log rows

| Field | Value |
|---|---|
| Story | [US-08-06](../stories/EPIC-08-PRESCRIPTIONS/US-08-06-view-prescription-attachments.md) — View Prescription Attachments via Pre-signed URL |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-08-06-AC1 |
| Requirements | FR-08-013 |

**Story preconditions**
- Attachment exists with a scan verdict.

**US-08-06-AC1 — URL issued for clean attachment**

*Preconditions / test data*
1. an attachment with `scanStatus = Clean` on a prescription with a patient

*Steps*
1. a user with `prescriptions.prescriptions.read` assigned to the branch calls `POST .../attachments/{attachmentId}/access-url`

*Expected results*
1. the response is 200 with `{ "url": "...", "expiresAt": "<now + 300 s>" }`, the URL returns the object with `Content-Disposition: inline` and `Cache-Control: no-store`, and one `AuditLog` entry and one `PatientAccessLog` entry are written.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-030: MinIO URL rejected after 300 s

| Field | Value |
|---|---|
| Story | [US-08-06](../stories/EPIC-08-PRESCRIPTIONS/US-08-06-view-prescription-attachments.md) — View Prescription Attachments via Pre-signed URL |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-08-06-AC2 |
| Requirements | FR-08-013 |

**Story preconditions**
- Attachment exists with a scan verdict.

**US-08-06-AC2 — URL expires**

*Preconditions / test data*
1. a URL issued at T

*Steps*
1. the URL is requested at T + 301 s

*Expected results*
1. the storage service rejects the request (HTTP 403 from storage) and no content is returned.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-031: Pending/Infected/ScanFailed → 409

| Field | Value |
|---|---|
| Story | [US-08-06](../stories/EPIC-08-PRESCRIPTIONS/US-08-06-view-prescription-attachments.md) — View Prescription Attachments via Pre-signed URL |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-08-06-AC3 |
| Requirements | FR-08-013 |

**Story preconditions**
- Attachment exists with a scan verdict.

**US-08-06-AC3 — Not available while pending or infected**

*Preconditions / test data*
1. attachments with `scanStatus` `Pending`, `Infected`, and `ScanFailed`

*Steps*
1. the user requests an access URL for each

*Expected results*
1. each response is 409 `PRESCRIPTIONS.ATTACHMENT_NOT_AVAILABLE` and no URL is generated.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-032: Cashier → 403; unassigned branch → 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-08-06](../stories/EPIC-08-PRESCRIPTIONS/US-08-06-view-prescription-attachments.md) — View Prescription Attachments via Pre-signed URL |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-08-06-AC4 |
| Critical scenario | CS-07 |
| Requirements | FR-08-013 |

**Story preconditions**
- Attachment exists with a scan verdict.

**US-08-06-AC4 — Permission and branch denied**

*Preconditions / test data*
1. a Cashier without `prescriptions.prescriptions.read`, and a Pharmacist assigned only to branch A

*Steps*
1. the Cashier requests a URL in branch A, and the Pharmacist requests a URL for an attachment in branch B

*Expected results*
1. both responses are 403 `COMMON.FORBIDDEN` (CS-07) and no access log is written.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-033: Other org attachment → 404 (CS-08)

| Field | Value |
|---|---|
| Story | [US-08-06](../stories/EPIC-08-PRESCRIPTIONS/US-08-06-view-prescription-attachments.md) — View Prescription Attachments via Pre-signed URL |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-08-06-AC5 |
| Critical scenario | CS-08 |
| Requirements | FR-08-013 |

**Story preconditions**
- Attachment exists with a scan verdict.

**US-08-06-AC5 — Cross-organization**

*Preconditions / test data*
1. an attachment id of another organization

*Steps*
1. a user requests an access URL

*Expected results*
1. the response is 404 `PRESCRIPTIONS.NOT_FOUND` (CS-08).

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-08-07: Submit Prescription for Verification

### TS-08-034: Submit OTC-only draft without patient → PendingVerification

| Field | Value |
|---|---|
| Story | [US-08-07](../stories/EPIC-08-PRESCRIPTIONS/US-08-07-submit-for-verification.md) — Submit Prescription for Verification |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-08-07-AC1 |
| Requirements | FR-08-015, FR-08-016 |

**Story preconditions**
- Prescription in `Draft`.

**US-08-07-AC1 — Submit valid draft**

*Preconditions / test data*
1. a Draft prescription with 2 active items (OTC medicines only), a prescriber, and no patient

*Steps*
1. a user with `prescriptions.prescriptions.create` calls `POST .../submit` with `If-Match`

*Expected results*
1. the response is 200 with `status = "PendingVerification"` and a history row `Draft → PendingVerification`.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-035: Submit with 0 items → 422

| Field | Value |
|---|---|
| Story | [US-08-07](../stories/EPIC-08-PRESCRIPTIONS/US-08-07-submit-for-verification.md) — Submit Prescription for Verification |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-08-07-AC2 |
| Requirements | FR-08-015, FR-08-016 |

**Story preconditions**
- Prescription in `Draft`.

**US-08-07-AC2 — No items**

*Preconditions / test data*
1. a Draft prescription with 0 active items

*Steps*
1. the user submits it

*Expected results*
1. the response is 422 `PRESCRIPTIONS.NO_ITEMS` and the status stays `Draft`.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-036: Rx-only item, no patient, enforcement ON → 422; OFF → 200

| Field | Value |
|---|---|
| Story | [US-08-07](../stories/EPIC-08-PRESCRIPTIONS/US-08-07-submit-for-verification.md) — Submit Prescription for Verification |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-08-07-AC3 |
| Requirements | FR-08-015, FR-08-016 |

**Story preconditions**
- Prescription in `Draft`.

**US-08-07-AC3 — Patient required for Rx-only when enforcement ON**

*Preconditions / test data*
1. `EnforcePrescriptionForRxOnly = ON` and a Draft without patient containing a medicine with `IsPrescriptionOnly = true`

*Steps*
1. the user submits it

*Expected results*
1. the response is 422 `PRESCRIPTIONS.PATIENT_REQUIRED`.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-037: Controlled item, no patient, enforcement OFF → 422

| Field | Value |
|---|---|
| Story | [US-08-07](../stories/EPIC-08-PRESCRIPTIONS/US-08-07-submit-for-verification.md) — Submit Prescription for Verification |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-08-07-AC4 |
| Requirements | FR-08-015, FR-08-016 |

**Story preconditions**
- Prescription in `Draft`.

**US-08-07-AC4 — Patient required for controlled regardless of setting**

*Preconditions / test data*
1. `EnforcePrescriptionForRxOnly = OFF` and a Draft without patient containing a medicine with `IsControlled = true`

*Steps*
1. the user submits it

*Expected results*
1. the response is 422 `PRESCRIPTIONS.PATIENT_REQUIRED`.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-038: Double submit → 409; no permission → 403

| Field | Value |
|---|---|
| Story | [US-08-07](../stories/EPIC-08-PRESCRIPTIONS/US-08-07-submit-for-verification.md) — Submit Prescription for Verification |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-08-07-AC5 |
| Requirements | FR-08-015, FR-08-016 |

**Story preconditions**
- Prescription in `Draft`.

**US-08-07-AC5 — Wrong status and permission denied**

*Preconditions / test data*
1. a prescription already in `PendingVerification`, and a user without `prescriptions.prescriptions.create`

*Steps*
1. an authorized user submits the pending prescription, and the unauthorized user submits a draft

*Expected results*
1. the responses are 409 `PRESCRIPTIONS.INVALID_STATUS_TRANSITION` and 403 `COMMON.FORBIDDEN`.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-08-08: Pharmacist Verification

### TS-08-039: Full verification records verifier, item acks, history, audit

| Field | Value |
|---|---|
| Story | [US-08-08](../stories/EPIC-08-PRESCRIPTIONS/US-08-08-pharmacist-verification.md) — Pharmacist Verification |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-08-08-AC1 |
| Requirements | FR-08-017, FR-08-018, FR-08-019, FR-08-020, FR-08-024 |

**Story preconditions**
- Prescription in `PendingVerification`.

**US-08-08-AC1 — Verify with full checklist**

*Preconditions / test data*
1. a PendingVerification prescription with 2 catalog items and 1 Clean attachment

*Steps*
1. a user with `prescriptions.prescriptions.verify` posts `checklistVersion = 1`, all checklist flags `true`, and `verified = true` for both items, with `If-Match`

*Expected results*
1. the response is 200 with `status = "Verified"`, `verifiedBy` = caller, `verifiedAt` set, each item has `itemVerifiedBy`/`itemVerifiedAt`, history `PendingVerification → Verified`, and an audit entry.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-040: Checklist matrix: each flag false, missing item ack

| Field | Value |
|---|---|
| Story | [US-08-08](../stories/EPIC-08-PRESCRIPTIONS/US-08-08-pharmacist-verification.md) — Pharmacist Verification |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-08-08-AC2 |
| Requirements | FR-08-017, FR-08-018, FR-08-019, FR-08-020, FR-08-024 |

**Story preconditions**
- Prescription in `PendingVerification`.

**US-08-08-AC2 — Incomplete checklist rejected**

*Preconditions / test data*
1. a PendingVerification prescription with 2 items

*Steps*
1. the pharmacist submits `patientIdentityMatches = false` or acknowledges only 1 of 2 items

*Expected results*
1. the response is 422 `PRESCRIPTIONS.CHECKLIST_INCOMPLETE` listing the missing entries and the status remains `PendingVerification`.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-041: Verify with unresolved free text → 422

| Field | Value |
|---|---|
| Story | [US-08-08](../stories/EPIC-08-PRESCRIPTIONS/US-08-08-pharmacist-verification.md) — Pharmacist Verification |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-08-08-AC3 |
| Requirements | FR-08-017, FR-08-018, FR-08-019, FR-08-020, FR-08-024 |

**Story preconditions**
- Prescription in `PendingVerification`.

**US-08-08-AC3 — Free-text item must be resolved**

*Preconditions / test data*
1. a PendingVerification prescription with a free-text item "Augmentin 1g"

*Steps*
1. the pharmacist verifies without resolving

*Expected results*
1. the response is 422 `PRESCRIPTIONS.ITEM_UNRESOLVED`.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-042: Resolve free text; original text retained; base units computed

| Field | Value |
|---|---|
| Story | [US-08-08](../stories/EPIC-08-PRESCRIPTIONS/US-08-08-pharmacist-verification.md) — Pharmacist Verification |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-08-08-AC4 |
| Requirements | FR-08-017, FR-08-018, FR-08-019, FR-08-020, FR-08-024 |

**Story preconditions**
- Prescription in `PendingVerification`.

**US-08-08-AC4 — Resolve free-text item**

*Preconditions / test data*
1. the same free-text item and active catalog medicine A (`PackSize = 14`)

*Steps*
1. the pharmacist calls `POST .../items/{itemId}/resolve` with `{ "medicineId": "A" }`

*Expected results*
1. the item has `medicineId = A`, `freeTextMedicineName = "Augmentin 1g"` retained, `resolvedBy`/`resolvedAt` set, `prescribedQuantityBaseUnits` computed, and an audit entry exists.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-043: Controlled item without Clean attachment → 422; setting ON → 422

| Field | Value |
|---|---|
| Story | [US-08-08](../stories/EPIC-08-PRESCRIPTIONS/US-08-08-pharmacist-verification.md) — Pharmacist Verification |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-08-08-AC5 |
| Requirements | FR-08-017, FR-08-018, FR-08-019, FR-08-020, FR-08-024 |

**Story preconditions**
- Prescription in `PendingVerification`.

**US-08-08-AC5 — Attachment required**

*Preconditions / test data*
1. a PendingVerification prescription with a controlled item and no Clean attachment (or `RequireAttachmentForVerification = ON` with no Clean attachment)

*Steps*
1. the pharmacist verifies it

*Expected results*
1. the response is 422 `PRESCRIPTIONS.ATTACHMENT_REQUIRED`.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-044: Resolved-to-controlled without patient → 422

| Field | Value |
|---|---|
| Story | [US-08-08](../stories/EPIC-08-PRESCRIPTIONS/US-08-08-pharmacist-verification.md) — Pharmacist Verification |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-08-08-AC6 |
| Requirements | FR-08-017, FR-08-018, FR-08-019, FR-08-020, FR-08-024 |

**Story preconditions**
- Prescription in `PendingVerification`.

**US-08-08-AC6 — Patient re-checked after resolution**

*Preconditions / test data*
1. a PendingVerification prescription without patient whose free-text item was resolved to a controlled medicine

*Steps*
1. the pharmacist verifies it

*Expected results*
1. the response is 422 `PRESCRIPTIONS.PATIENT_REQUIRED`.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-045: Cashier verify/resolve → 403

| Field | Value |
|---|---|
| Story | [US-08-08](../stories/EPIC-08-PRESCRIPTIONS/US-08-08-pharmacist-verification.md) — Pharmacist Verification |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-08-08-AC7 |
| Requirements | FR-08-017, FR-08-018, FR-08-019, FR-08-020, FR-08-024 |

**Story preconditions**
- Prescription in `PendingVerification`.

**US-08-08-AC7 — Permission denied**

*Preconditions / test data*
1. a Cashier with `prescriptions.prescriptions.create` but without `prescriptions.prescriptions.verify`

*Steps*
1. the Cashier calls `POST .../verify` or `POST .../items/{itemId}/resolve`

*Expected results*
1. both responses are 403 `COMMON.FORBIDDEN` and the prescription is unchanged.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-08-09: Search, View, and Track Prescription History

### TS-08-046: Filters, pagination, summary-only fields

| Field | Value |
|---|---|
| Story | [US-08-09](../stories/EPIC-08-PRESCRIPTIONS/US-08-09-search-and-view-prescriptions.md) — Search, View, and Track Prescription History |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-08-09-AC1 |
| Requirements | FR-08-021, FR-08-022, FR-08-023, FR-08-025 |

**Story preconditions**
- Prescriptions exist in the branch.

**US-08-09-AC1 — Filtered list**

*Preconditions / test data*
1. branch A with 60 prescriptions, 12 of them `PartiallyDispensed`

*Steps*
1. a user with `prescriptions.prescriptions.read` calls `GET /api/v1/branches/{A}/prescriptions?status=PartiallyDispensed&hasRemaining=true&page=1&pageSize=10`

*Expected results*
1. the response is 200 with `items` (10), `totalCount = 12`, each item containing only number, prescription date, status, patient display name, prescriber name, item count, and remaining item count (no clinical item text).

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-047: Detail content and one PatientAccessLog row

| Field | Value |
|---|---|
| Story | [US-08-09](../stories/EPIC-08-PRESCRIPTIONS/US-08-09-search-and-view-prescriptions.md) — Search, View, and Track Prescription History |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-08-09-AC2 |
| Requirements | FR-08-021, FR-08-022, FR-08-023, FR-08-025 |

**Story preconditions**
- Prescriptions exist in the branch.

**US-08-09-AC2 — Detail with dispensing records and access log**

*Preconditions / test data*
1. a prescription with a patient, 2 items, and 3 dispensing records from 2 sales

*Steps*
1. the user calls `GET .../prescriptions/{id}`

*Expected results*
1. the response includes per item prescribed/dispensed/remaining base units, each dispensing record (sale number, batch number, expiry date, quantity, pharmacist name, dispensed at), attachment metadata, and one `PatientAccessLog` row is written.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-048: History rows ordered; no mutation endpoint

| Field | Value |
|---|---|
| Story | [US-08-09](../stories/EPIC-08-PRESCRIPTIONS/US-08-09-search-and-view-prescriptions.md) — Search, View, and Track Prescription History |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-08-09-AC3 |
| Requirements | FR-08-021, FR-08-022, FR-08-023, FR-08-025 |

**Story preconditions**
- Prescriptions exist in the branch.

**US-08-09-AC3 — Status history**

*Preconditions / test data*
1. a prescription that moved Draft → PendingVerification → Verified → PartiallyDispensed

*Steps*
1. the user calls `GET .../prescriptions/{id}/history`

*Expected results*
1. 4 rows are returned in chronological order with from, to, actor, timestamp (UTC, displayed in branch time zone), and reason
2. the rows cannot be modified through any endpoint.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-049: Patient history excludes unassigned branch

| Field | Value |
|---|---|
| Story | [US-08-09](../stories/EPIC-08-PRESCRIPTIONS/US-08-09-search-and-view-prescriptions.md) — Search, View, and Track Prescription History |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | MVP |
| Covers | US-08-09-AC4 |
| Requirements | FR-08-021, FR-08-022, FR-08-023, FR-08-025 |

**Story preconditions**
- Prescriptions exist in the branch.

**US-08-09-AC4 — Patient history limited to assigned branches**

*Preconditions / test data*
1. patient P with prescriptions in branches A and B, and a Pharmacist assigned only to A holding `prescriptions.prescriptions.read` and `patients.profiles.read`

*Steps*
1. the Pharmacist calls `GET /api/v1/patients/{P}/prescriptions`

*Expected results*
1. only branch A prescriptions are returned and `totalCount` excludes branch B.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-050: Unassigned branch / no permission → 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-08-09](../stories/EPIC-08-PRESCRIPTIONS/US-08-09-search-and-view-prescriptions.md) — Search, View, and Track Prescription History |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | MVP |
| Covers | US-08-09-AC5 |
| Critical scenario | CS-07 |
| Requirements | FR-08-021, FR-08-022, FR-08-023, FR-08-025 |

**Story preconditions**
- Prescriptions exist in the branch.

**US-08-09-AC5 — Cross-branch and permission denied**

*Preconditions / test data*
1. a Pharmacist assigned only to branch A, and a Cashier without `prescriptions.prescriptions.read`

*Steps*
1. the Pharmacist calls `GET /api/v1/branches/{B}/prescriptions`, and the Cashier calls the list in A

*Expected results*
1. both responses are 403 `COMMON.FORBIDDEN` (CS-07).

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-051: Wrong-branch id and other-org id → 404 (CS-08)

| Field | Value |
|---|---|
| Story | [US-08-09](../stories/EPIC-08-PRESCRIPTIONS/US-08-09-search-and-view-prescriptions.md) — Search, View, and Track Prescription History |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | MVP |
| Covers | US-08-09-AC6 |
| Critical scenario | CS-08 |
| Requirements | FR-08-021, FR-08-022, FR-08-023, FR-08-025 |

**Story preconditions**
- Prescriptions exist in the branch.

**US-08-09-AC6 — Wrong branch or organization id**

*Preconditions / test data*
1. a prescription in branch B of the same organization, and one in another organization

*Steps*
1. a user assigned to A and B requests `GET /api/v1/branches/{A}/prescriptions/{idInB}`, and `GET /api/v1/branches/{A}/prescriptions/{idOtherOrg}`

*Expected results*
1. both responses are 404 `PRESCRIPTIONS.NOT_FOUND` (CS-08) with no data in the body.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-052: List p95 ≤ 500 ms at 1,000,000 prescriptions; detail p95 ≤ 500 ms

| Field | Value |
|---|---|
| Story | [US-08-09](../stories/EPIC-08-PRESCRIPTIONS/US-08-09-search-and-view-prescriptions.md) — Search, View, and Track Prescription History |
| Type / Execution | Performance / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-08-09-AC1, US-08-09-AC2 |
| Requirements | FR-08-021, FR-08-022, FR-08-023, FR-08-025 |

**Story preconditions**
- Prescriptions exist in the branch.

**US-08-09-AC1 — Filtered list**

*Preconditions / test data*
1. branch A with 60 prescriptions, 12 of them `PartiallyDispensed`

*Steps*
1. a user with `prescriptions.prescriptions.read` calls `GET /api/v1/branches/{A}/prescriptions?status=PartiallyDispensed&hasRemaining=true&page=1&pageSize=10`

*Expected results*
1. the response is 200 with `items` (10), `totalCount = 12`, each item containing only number, prescription date, status, patient display name, prescriber name, item count, and remaining item count (no clinical item text).

**US-08-09-AC2 — Detail with dispensing records and access log**

*Preconditions / test data*
1. a prescription with a patient, 2 items, and 3 dispensing records from 2 sales

*Steps*
1. the user calls `GET .../prescriptions/{id}`

*Expected results*
1. the response includes per item prescribed/dispensed/remaining base units, each dispensing record (sale number, batch number, expiry date, quantity, pharmacist name, dispensed at), attachment metadata, and one `PatientAccessLog` row is written.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-08-10: Cancel a Prescription

### TS-08-053: Cancel PartiallyDispensed; records retained; history + audit

| Field | Value |
|---|---|
| Story | [US-08-10](../stories/EPIC-08-PRESCRIPTIONS/US-08-10-cancel-prescription.md) — Cancel a Prescription |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-08-10-AC1 |
| Requirements | FR-08-026, FR-08-024 |

**Story preconditions**
- Prescription in `Draft`, `PendingVerification`, `Verified`, or `PartiallyDispensed`.

**US-08-10-AC1 — Cancel partially dispensed prescription**

*Preconditions / test data*
1. a `PartiallyDispensed` prescription with 2 dispensing records

*Steps*
1. a user with `prescriptions.prescriptions.cancel` posts `{ "reason": "Doctor changed therapy" }` to `.../cancel` with `If-Match`

*Expected results*
1. the response is 200 with `status = "Cancelled"`, `cancelledBy`, `cancelledAt`, the 2 dispensing records unchanged, history `PartiallyDispensed → Cancelled` with the reason, and an audit entry.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-054: Sale against cancelled prescription → 422, no sale/stock change

| Field | Value |
|---|---|
| Story | [US-08-10](../stories/EPIC-08-PRESCRIPTIONS/US-08-10-cancel-prescription.md) — Cancel a Prescription |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-08-10-AC2 |
| Requirements | FR-08-026, FR-08-024 |

**Story preconditions**
- Prescription in `Draft`, `PendingVerification`, `Verified`, or `PartiallyDispensed`.

**US-08-10-AC2 — No dispensing after cancel**

*Preconditions / test data*
1. the cancelled prescription

*Steps*
1. a sale with a line linked to one of its items is completed

*Expected results*
1. the sale is rejected with 422 `PRESCRIPTIONS.NOT_DISPENSABLE` and nothing is persisted.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-055: Reason length boundaries; FullyDispensed cancel → 409

| Field | Value |
|---|---|
| Story | [US-08-10](../stories/EPIC-08-PRESCRIPTIONS/US-08-10-cancel-prescription.md) — Cancel a Prescription |
| Type / Execution | Unit / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-08-10-AC3 |
| Requirements | FR-08-026, FR-08-024 |

**Story preconditions**
- Prescription in `Draft`, `PendingVerification`, `Verified`, or `PartiallyDispensed`.

**US-08-10-AC3 — Reason required and terminal statuses**

*Preconditions / test data*
1. a Verified prescription, and a `FullyDispensed` prescription

*Steps*
1. the user cancels the first with `reason = "x"`, and cancels the second with a valid reason

*Expected results*
1. the responses are 422 `PRESCRIPTIONS.CANCEL_REASON_REQUIRED` and 409 `PRESCRIPTIONS.INVALID_STATUS_TRANSITION`.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-056: Cashier cancel → 403

| Field | Value |
|---|---|
| Story | [US-08-10](../stories/EPIC-08-PRESCRIPTIONS/US-08-10-cancel-prescription.md) — Cancel a Prescription |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | MVP |
| Covers | US-08-10-AC4 |
| Requirements | FR-08-026, FR-08-024 |

**Story preconditions**
- Prescription in `Draft`, `PendingVerification`, `Verified`, or `PartiallyDispensed`.

**US-08-10-AC4 — Permission denied**

*Preconditions / test data*
1. a Cashier without `prescriptions.prescriptions.cancel`

*Steps*
1. the Cashier calls `.../cancel`

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN`.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-057: Cancel and sale in parallel: exactly one consistent outcome

| Field | Value |
|---|---|
| Story | [US-08-10](../stories/EPIC-08-PRESCRIPTIONS/US-08-10-cancel-prescription.md) — Cancel a Prescription |
| Type / Execution | Concurrency / Automated |
| Priority | T1 (story P1) |
| Release | MVP |
| Covers | US-08-10-AC1, US-08-10-AC2 |
| Requirements | FR-08-026, FR-08-024 |

**Story preconditions**
- Prescription in `Draft`, `PendingVerification`, `Verified`, or `PartiallyDispensed`.

**US-08-10-AC1 — Cancel partially dispensed prescription**

*Preconditions / test data*
1. a `PartiallyDispensed` prescription with 2 dispensing records

*Steps*
1. a user with `prescriptions.prescriptions.cancel` posts `{ "reason": "Doctor changed therapy" }` to `.../cancel` with `If-Match`

*Expected results*
1. the response is 200 with `status = "Cancelled"`, `cancelledBy`, `cancelledAt`, the 2 dispensing records unchanged, history `PartiallyDispensed → Cancelled` with the reason, and an audit entry.

**US-08-10-AC2 — No dispensing after cancel**

*Preconditions / test data*
1. the cancelled prescription

*Steps*
1. a sale with a line linked to one of its items is completed

*Expected results*
1. the sale is rejected with 422 `PRESCRIPTIONS.NOT_DISPENSABLE` and nothing is persisted.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-08-11: Prescription Expiry

### TS-08-058: Job expires 4 statuses, skips FullyDispensed, logs run

| Field | Value |
|---|---|
| Story | [US-08-11](../stories/EPIC-08-PRESCRIPTIONS/US-08-11-prescription-expiry.md) — Prescription Expiry |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-08-11-AC1 |
| Requirements | FR-08-027, FR-08-028 |

**Story preconditions**
- Branch time zone configured (default `Africa/Cairo`).

**US-08-11-AC1 — Nightly job expires eligible prescriptions**

*Preconditions / test data*
1. prescriptions with `ExpiresOn = 2026-11-08` in statuses Draft, PendingVerification, Verified, PartiallyDispensed, and FullyDispensed

*Steps*
1. the job runs at 00:30 `Africa/Cairo` on business date 2026-11-09

*Expected results*
1. the first four become `Expired` with history actor `System` and reason `Validity ended`, the FullyDispensed one is unchanged, and a `BackgroundJobRun` row records the count (4).

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-059: ExpiresOn = business date is still dispensable

| Field | Value |
|---|---|
| Story | [US-08-11](../stories/EPIC-08-PRESCRIPTIONS/US-08-11-prescription-expiry.md) — Prescription Expiry |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-08-11-AC2 |
| Requirements | FR-08-027, FR-08-028 |

**Story preconditions**
- Branch time zone configured (default `Africa/Cairo`).

**US-08-11-AC2 — Last valid day**

*Preconditions / test data*
1. a Verified prescription with `ExpiresOn = 2026-11-09`

*Steps*
1. the job runs on business date 2026-11-09 and a sale links to it the same day

*Expected results*
1. the prescription is not expired and dispensing succeeds.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-060: Sale at 00:10 before job → PRESCRIPTIONS.EXPIRED

| Field | Value |
|---|---|
| Story | [US-08-11](../stories/EPIC-08-PRESCRIPTIONS/US-08-11-prescription-expiry.md) — Prescription Expiry |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-08-11-AC3 |
| Requirements | FR-08-027, FR-08-028 |

**Story preconditions**
- Branch time zone configured (default `Africa/Cairo`).

**US-08-11-AC3 — Dispensing blocked before job runs**

*Preconditions / test data*
1. a Verified prescription with `ExpiresOn = 2026-11-08`, business date 2026-11-09 00:10 (job not yet run)

*Steps*
1. a sale with a line linked to it is completed

*Expected results*
1. the sale is rejected with 422 `PRESCRIPTIONS.EXPIRED`, nothing is persisted, and status remains `Verified` until the job runs.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-061: Re-run produces no duplicate history

| Field | Value |
|---|---|
| Story | [US-08-11](../stories/EPIC-08-PRESCRIPTIONS/US-08-11-prescription-expiry.md) — Prescription Expiry |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-08-11-AC4 |
| Requirements | FR-08-027, FR-08-028 |

**Story preconditions**
- Branch time zone configured (default `Africa/Cairo`).

**US-08-11-AC4 — Idempotent re-run**

*Preconditions / test data*
1. the job already ran on 2026-11-09

*Steps*
1. it is triggered again for the same date

*Expected results*
1. no additional history rows are written and the `BackgroundJobRun` records 0 changes.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-062: Status field read-only on PATCH; unassigned branch 403 (CS-07); other organization 404 (CS-08)

| Field | Value |
|---|---|
| Story | [US-08-11](../stories/EPIC-08-PRESCRIPTIONS/US-08-11-prescription-expiry.md) — Prescription Expiry |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | MVP |
| Covers | US-08-11-AC5 |
| Critical scenario | CS-07, CS-08 |
| Requirements | FR-08-027, FR-08-028 |

**Story preconditions**
- Branch time zone configured (default `Africa/Cairo`).

**US-08-11-AC5 — No manual endpoint for expiring**

*Preconditions / test data*
1. any user, including Owner

*Steps*
1. the user attempts to set status `Expired` via `PATCH .../prescriptions/{id}` with `{ "status": "Expired" }`

*Expected results*
1. the response is 422 `PRESCRIPTIONS.FIELD_READ_ONLY` with a field error on `status` and the status is unchanged.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-063: 100,000 eligible prescriptions expired in ≤ 5 min

| Field | Value |
|---|---|
| Story | [US-08-11](../stories/EPIC-08-PRESCRIPTIONS/US-08-11-prescription-expiry.md) — Prescription Expiry |
| Type / Execution | Performance / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-08-11-AC1 |
| Requirements | FR-08-027, FR-08-028 |

**Story preconditions**
- Branch time zone configured (default `Africa/Cairo`).

**US-08-11-AC1 — Nightly job expires eligible prescriptions**

*Preconditions / test data*
1. prescriptions with `ExpiresOn = 2026-11-08` in statuses Draft, PendingVerification, Verified, PartiallyDispensed, and FullyDispensed

*Steps*
1. the job runs at 00:30 `Africa/Cairo` on business date 2026-11-09

*Expected results*
1. the first four become `Expired` with history actor `System` and reason `Validity ended`, the FullyDispensed one is unchanged, and a `BackgroundJobRun` row records the count (4).

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-08-12: Dispense Prescription Items Through POS (Partial Dispensing)

### TS-08-064: Dispensing context content

| Field | Value |
|---|---|
| Story | [US-08-12](../stories/EPIC-08-PRESCRIPTIONS/US-08-12-dispense-through-pos.md) — Dispense Prescription Items Through POS (Partial Dispensing) |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-08-12-AC1 |
| Requirements | FR-08-028, FR-08-029, FR-08-030, FR-08-031, FR-08-032, FR-08-033, FR-08-034 |

**Story preconditions**
- Prescription `Verified` or `PartiallyDispensed`, not expired, in the sale's branch.
- Caller has an open cash session (SPEC-06) and holds `sales.pos.sell` and `prescriptions.dispense`.

**US-08-12-AC1 — Dispensing context**

*Preconditions / test data*
1. a Verified prescription with item I1 (medicine M, prescribed 3 packs, `PackSize = 10` → 30 base units)

*Steps*
1. the pharmacist calls `GET .../prescriptions/{id}/dispensing-context`

*Expected results*
1. the response is 200 listing I1 with `prescribedQuantityBaseUnits = 30`, `dispensedQuantityBaseUnits = 0`, `remainingQuantityBaseUnits = 30`, `isPrescriptionOnly`, `isControlled`, `approvedSubstitutes = []`, and `alerts = []`.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-065: **CS-04**: visit 1 dispenses 1 of 3 packs (FEFO B1) → PartiallyDispensed; visit 2 (other pharmacist, +10 days) dispenses 2 packs across B1/B2 → FullyDispensed; verify 3 dispensing records, quantities, statuses, history

| Field | Value |
|---|---|
| Story | [US-08-12](../stories/EPIC-08-PRESCRIPTIONS/US-08-12-dispense-through-pos.md) — Dispense Prescription Items Through POS (Partial Dispensing) |
| Type / Execution | Integration / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-08-12-AC2, US-08-12-AC3 |
| Critical scenario | CS-04 |
| Requirements | FR-08-028, FR-08-029, FR-08-030, FR-08-031, FR-08-032, FR-08-033, FR-08-034 |

**Story preconditions**
- Prescription `Verified` or `PartiallyDispensed`, not expired, in the sale's branch.
- Caller has an open cash session (SPEC-06) and holds `sales.pos.sell` and `prescriptions.dispense`.

**US-08-12-AC2 — First visit — partial dispensing (CS-04 part 1)**

*Preconditions / test data*
1. the context above and sellable stock of M in batches B1 (exp 2027-01) and B2 (exp 2027-06)

*Steps*
1. on 2026-11-09 the pharmacist completes a sale with `Idempotency-Key` and line `{ medicineId: M, quantity: 1, unit: "Pack", prescriptionItemId: I1 }`

*Expected results*
1. the sale is `Completed`, one `DispensingRecord` exists (I1, sale, sale line, batch B1 by FEFO, 10 base units, pharmacist = caller, `fillNumber = 0`), I1 shows dispensed 10 / remaining 20, the prescription status is `PartiallyDispensed`, and history records `Verified → PartiallyDispensed` — all in the sale's transaction.

**US-08-12-AC3 — Second visit — remaining dispensed (CS-04 part 2)**

*Preconditions / test data*
1. the state after AC2 and B1 holds 5 base units

*Steps*
1. on 2026-11-19 a different pharmacist completes a sale for 2 packs linked to I1

*Expected results*
1. two `DispensingRecord` rows are created for that sale line (B1: 5, B2: 15), I1 shows dispensed 30 / remaining 0, status is `FullyDispensed`, and the detail view lists 3 dispensing records with both pharmacists and both sale numbers.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-066: Over-remaining single line and split lines → full rollback

| Field | Value |
|---|---|
| Story | [US-08-12](../stories/EPIC-08-PRESCRIPTIONS/US-08-12-dispense-through-pos.md) — Dispense Prescription Items Through POS (Partial Dispensing) |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-08-12-AC4 |
| Requirements | FR-08-028, FR-08-029, FR-08-030, FR-08-031, FR-08-032, FR-08-033, FR-08-034 |

**Story preconditions**
- Prescription `Verified` or `PartiallyDispensed`, not expired, in the sale's branch.
- Caller has an open cash session (SPEC-06) and holds `sales.pos.sell` and `prescriptions.dispense`.

**US-08-12-AC4 — Over-dispensing rejected**

*Preconditions / test data*
1. I1 with remaining 20 base units

*Steps*
1. a sale links a line of 3 packs (30 base units) to I1, or two lines of 2 packs each to I1

*Expected results*
1. the whole sale is rejected with 422 `PRESCRIPTIONS.QUANTITY_EXCEEDS_REMAINING` (error path `lines[n].prescriptionItemId`), and no sale, stock movement, payment, or dispensing record is persisted.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-067: Medicine/branch/status mismatch matrix

| Field | Value |
|---|---|
| Story | [US-08-12](../stories/EPIC-08-PRESCRIPTIONS/US-08-12-dispense-through-pos.md) — Dispense Prescription Items Through POS (Partial Dispensing) |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-08-12-AC5 |
| Requirements | FR-08-028, FR-08-029, FR-08-030, FR-08-031, FR-08-032, FR-08-033, FR-08-034 |

**Story preconditions**
- Prescription `Verified` or `PartiallyDispensed`, not expired, in the sale's branch.
- Caller has an open cash session (SPEC-06) and holds `sales.pos.sell` and `prescriptions.dispense`.

**US-08-12-AC5 — Wrong medicine, branch, or status**

*Preconditions / test data*
1. a Verified prescription in branch A, and a PendingVerification prescription in branch A

*Steps*
1. a sale links (a) a line of medicine N ≠ M to I1, (b) a line in branch B to I1, (c) a line to an item of the PendingVerification prescription

*Expected results*
1. the sales are rejected with 422 `PRESCRIPTIONS.MEDICINE_MISMATCH`, 422 `PRESCRIPTIONS.BRANCH_MISMATCH`, and 422 `PRESCRIPTIONS.NOT_DISPENSABLE` respectively, with nothing persisted.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-068: 50 parallel sales vs remaining 1 pack → exactly 1 success (PostgreSQL)

| Field | Value |
|---|---|
| Story | [US-08-12](../stories/EPIC-08-PRESCRIPTIONS/US-08-12-dispense-through-pos.md) — Dispense Prescription Items Through POS (Partial Dispensing) |
| Type / Execution | Concurrency / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-08-12-AC6 |
| Requirements | FR-08-028, FR-08-029, FR-08-030, FR-08-031, FR-08-032, FR-08-033, FR-08-034 |

**Story preconditions**
- Prescription `Verified` or `PartiallyDispensed`, not expired, in the sale's branch.
- Caller has an open cash session (SPEC-06) and holds `sales.pos.sell` and `prescriptions.dispense`.

**US-08-12-AC6 — Concurrent dispensing cannot exceed remaining**

*Preconditions / test data*
1. I1 with remaining 10 base units and two pharmacists at two POS terminals

*Steps*
1. both complete a sale of 1 pack linked to I1 at the same moment

*Expected results*
1. exactly one sale completes, the other is rejected with 422 `PRESCRIPTIONS.QUANTITY_EXCEEDS_REMAINING`, and I1 dispensed = prescribed.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-069: Pack rounding without/with reason

| Field | Value |
|---|---|
| Story | [US-08-12](../stories/EPIC-08-PRESCRIPTIONS/US-08-12-dispense-through-pos.md) — Dispense Prescription Items Through POS (Partial Dispensing) |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-08-12-AC7 |
| Requirements | FR-08-028, FR-08-029, FR-08-030, FR-08-031, FR-08-032, FR-08-033, FR-08-034 |

**Story preconditions**
- Prescription `Verified` or `PartiallyDispensed`, not expired, in the sale's branch.
- Caller has an open cash session (SPEC-06) and holds `sales.pos.sell` and `prescriptions.dispense`.

**US-08-12-AC7 — Pack rounding**

*Preconditions / test data*
1. item I2 prescribed 20 base units of medicine K with `PackSize = 14`, `AllowSplitPack = false`, already dispensed 14 (remaining 6)

*Steps*
1. a sale of 1 pack linked to I2 is completed without `roundingReason`, then with `roundingReason = "PackRounding"`

*Expected results*
1. the first is rejected with 422 `PRESCRIPTIONS.ROUNDING_REASON_REQUIRED`
2. the second completes with a dispensing record of 14, `roundingExcessBaseUnits = 8`, and I2 remaining 0.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-070: Patient auto-set and mismatch

| Field | Value |
|---|---|
| Story | [US-08-12](../stories/EPIC-08-PRESCRIPTIONS/US-08-12-dispense-through-pos.md) — Dispense Prescription Items Through POS (Partial Dispensing) |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-08-12-AC8 |
| Requirements | FR-08-028, FR-08-029, FR-08-030, FR-08-031, FR-08-032, FR-08-033, FR-08-034 |

**Story preconditions**
- Prescription `Verified` or `PartiallyDispensed`, not expired, in the sale's branch.
- Caller has an open cash session (SPEC-06) and holds `sales.pos.sell` and `prescriptions.dispense`.

**US-08-12-AC8 — Patient linkage**

*Preconditions / test data*
1. a prescription for patient P

*Steps*
1. a sale linked to it is completed with no patient selected, and another with patient Q selected

*Expected results*
1. the first sale is stored with `patientId = P`
2. the second is rejected with 422 `PRESCRIPTIONS.PATIENT_MISMATCH`.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-071: Cashier without dispense permission → 403 on context and sale

| Field | Value |
|---|---|
| Story | [US-08-12](../stories/EPIC-08-PRESCRIPTIONS/US-08-12-dispense-through-pos.md) — Dispense Prescription Items Through POS (Partial Dispensing) |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-08-12-AC9 |
| Requirements | FR-08-028, FR-08-029, FR-08-030, FR-08-031, FR-08-032, FR-08-033, FR-08-034 |

**Story preconditions**
- Prescription `Verified` or `PartiallyDispensed`, not expired, in the sale's branch.
- Caller has an open cash session (SPEC-06) and holds `sales.pos.sell` and `prescriptions.dispense`.

**US-08-12-AC9 — Permission denied**

*Preconditions / test data*
1. a Cashier with `sales.pos.sell` but without `prescriptions.dispense`

*Steps*
1. the Cashier requests the dispensing context or completes a sale containing a line with `prescriptionItemId`

*Expected results*
1. both responses are 403 `COMMON.FORBIDDEN` and nothing is persisted.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-072: Idempotent retry (CS-11) and fault injection rollback (CS-10)

| Field | Value |
|---|---|
| Story | [US-08-12](../stories/EPIC-08-PRESCRIPTIONS/US-08-12-dispense-through-pos.md) — Dispense Prescription Items Through POS (Partial Dispensing) |
| Type / Execution | Integration / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-08-12-AC10 |
| Critical scenario | CS-11, CS-10 |
| Requirements | FR-08-028, FR-08-029, FR-08-030, FR-08-031, FR-08-032, FR-08-033, FR-08-034 |

**Story preconditions**
- Prescription `Verified` or `PartiallyDispensed`, not expired, in the sale's branch.
- Caller has an open cash session (SPEC-06) and holds `sales.pos.sell` and `prescriptions.dispense`.

**US-08-12-AC10 — Idempotent retry and atomic failure**

*Preconditions / test data*
1. a sale linked to I1 completed with `Idempotency-Key` K

*Steps*
1. the client retries with K and the same payload, and separately a database fault is injected after the dispensing record insert of another sale

*Expected results*
1. the retry returns the original response with no additional dispensing record (CS-11), and the faulted sale leaves no sale, movement, dispensing record, or quantity change (CS-10).

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-073: Validation overhead ≤ 150 ms p95 for 10 linked lines

| Field | Value |
|---|---|
| Story | [US-08-12](../stories/EPIC-08-PRESCRIPTIONS/US-08-12-dispense-through-pos.md) — Dispense Prescription Items Through POS (Partial Dispensing) |
| Type / Execution | Performance / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-08-12-AC2 |
| Critical scenario | CS-04 |
| Requirements | FR-08-028, FR-08-029, FR-08-030, FR-08-031, FR-08-032, FR-08-033, FR-08-034 |

**Story preconditions**
- Prescription `Verified` or `PartiallyDispensed`, not expired, in the sale's branch.
- Caller has an open cash session (SPEC-06) and holds `sales.pos.sell` and `prescriptions.dispense`.

**US-08-12-AC2 — First visit — partial dispensing (CS-04 part 1)**

*Preconditions / test data*
1. the context above and sellable stock of M in batches B1 (exp 2027-01) and B2 (exp 2027-06)

*Steps*
1. on 2026-11-09 the pharmacist completes a sale with `Idempotency-Key` and line `{ medicineId: M, quantity: 1, unit: "Pack", prescriptionItemId: I1 }`

*Expected results*
1. the sale is `Completed`, one `DispensingRecord` exists (I1, sale, sale line, batch B1 by FEFO, 10 base units, pharmacist = caller, `fillNumber = 0`), I1 shows dispensed 10 / remaining 20, the prescription status is `PartiallyDispensed`, and history records `Verified → PartiallyDispensed` — all in the sale's transaction.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-08-13: Enforce Prescription for Rx-only and Controlled Medicines at Sale

### TS-08-074: **CS-13**: Rx-only sale without prescription, enforcement ON → 422; assert zero rows in sales, movements, payments, cash movements; batch balance unchanged

| Field | Value |
|---|---|
| Story | [US-08-13](../stories/EPIC-08-PRESCRIPTIONS/US-08-13-rx-only-and-controlled-enforcement.md) — Enforce Prescription for Rx-only and Controlled Medicines at Sale |
| Type / Execution | Integration / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-08-13-AC1 |
| Critical scenario | CS-13 |
| Requirements | FR-08-035, FR-08-036 |

**Story preconditions**
- Medicines carry `IsPrescriptionOnly` and `IsControlled` flags (SPEC-03).

**US-08-13-AC1 — Rx-only without prescription blocked (CS-13)**

*Preconditions / test data*
1. `EnforcePrescriptionForRxOnly = ON` and medicine R with `IsPrescriptionOnly = true` in stock

*Steps*
1. a cashier completes a sale containing R without `prescriptionItemId` (plus one OTC line)

*Expected results*
1. the response is 422 `PRESCRIPTIONS.PRESCRIPTION_REQUIRED` with error path `lines[0].prescriptionItemId`, and no sale, stock movement, payment, cash movement, or invoice number is persisted.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-075: **CS-13**: Rx-only linked to PendingVerification prescription → 422

| Field | Value |
|---|---|
| Story | [US-08-13](../stories/EPIC-08-PRESCRIPTIONS/US-08-13-rx-only-and-controlled-enforcement.md) — Enforce Prescription for Rx-only and Controlled Medicines at Sale |
| Type / Execution | Integration / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-08-13-AC2 |
| Critical scenario | CS-13 |
| Requirements | FR-08-035, FR-08-036 |

**Story preconditions**
- Medicines carry `IsPrescriptionOnly` and `IsControlled` flags (SPEC-03).

**US-08-13-AC2 — Rx-only linked to non-verified prescription blocked (CS-13)**

*Preconditions / test data*
1. enforcement ON and a PendingVerification prescription with item for R

*Steps*
1. a pharmacist completes a sale of R linked to that item

*Expected results*
1. the response is 422 `PRESCRIPTIONS.NOT_DISPENSABLE` and nothing is persisted.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-076: Enforcement OFF → completes with audit entry per line

| Field | Value |
|---|---|
| Story | [US-08-13](../stories/EPIC-08-PRESCRIPTIONS/US-08-13-rx-only-and-controlled-enforcement.md) — Enforce Prescription for Rx-only and Controlled Medicines at Sale |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-08-13-AC3 |
| Requirements | FR-08-035, FR-08-036 |

**Story preconditions**
- Medicines carry `IsPrescriptionOnly` and `IsControlled` flags (SPEC-03).

**US-08-13-AC3 — Enforcement OFF allows with audit**

*Preconditions / test data*
1. `EnforcePrescriptionForRxOnly = OFF`

*Steps*
1. a sale containing R without `prescriptionItemId` is completed

*Expected results*
1. the sale completes and one `AuditLog` entry `RxOnlySoldWithoutPrescription` per such line records sale id, line id, medicine, and user.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-077: **CS-13**: controlled without link, enforcement OFF → 422

| Field | Value |
|---|---|
| Story | [US-08-13](../stories/EPIC-08-PRESCRIPTIONS/US-08-13-rx-only-and-controlled-enforcement.md) — Enforce Prescription for Rx-only and Controlled Medicines at Sale |
| Type / Execution | Integration / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-08-13-AC4 |
| Critical scenario | CS-13 |
| Requirements | FR-08-035, FR-08-036 |

**Story preconditions**
- Medicines carry `IsPrescriptionOnly` and `IsControlled` flags (SPEC-03).

**US-08-13-AC4 — Controlled without prescription blocked regardless of setting (CS-13)**

*Preconditions / test data*
1. `EnforcePrescriptionForRxOnly = OFF` and medicine C with `IsControlled = true`

*Steps*
1. a pharmacist completes a sale of C without `prescriptionItemId`

*Expected results*
1. the response is 422 `PRESCRIPTIONS.PRESCRIPTION_REQUIRED` and nothing is persisted.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-078: Controlled without controlled permission → 403, nothing persisted

| Field | Value |
|---|---|
| Story | [US-08-13](../stories/EPIC-08-PRESCRIPTIONS/US-08-13-rx-only-and-controlled-enforcement.md) — Enforce Prescription for Rx-only and Controlled Medicines at Sale |
| Type / Execution | Security / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-08-13-AC5 |
| Requirements | FR-08-035, FR-08-036 |

**Story preconditions**
- Medicines carry `IsPrescriptionOnly` and `IsControlled` flags (SPEC-03).

**US-08-13-AC5 — Controlled requires controlled permission**

*Preconditions / test data*
1. a Verified prescription for C and a user holding `sales.pos.sell` and `prescriptions.dispense` but not `prescriptions.controlled.dispense`

*Steps*
1. the user completes a sale of C linked to the prescription item

*Expected results*
1. the response is 403 `PRESCRIPTIONS.CONTROLLED_DISPENSE_FORBIDDEN` and nothing is persisted.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-079: Controlled with permission → dispensing record + register entry

| Field | Value |
|---|---|
| Story | [US-08-13](../stories/EPIC-08-PRESCRIPTIONS/US-08-13-rx-only-and-controlled-enforcement.md) — Enforce Prescription for Rx-only and Controlled Medicines at Sale |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-08-13-AC6 |
| Requirements | FR-08-035, FR-08-036 |

**Story preconditions**
- Medicines carry `IsPrescriptionOnly` and `IsControlled` flags (SPEC-03).

**US-08-13-AC6 — Controlled with verified prescription and permission succeeds**

*Preconditions / test data*
1. the same prescription and a Pharmacist holding `prescriptions.controlled.dispense`

*Steps*
1. the Pharmacist completes the sale

*Expected results*
1. the sale completes, a `DispensingRecord` and a `ControlledMedicineRegisterEntry` (US-08-15) are created in the same transaction.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-080: POS badge and disabled checkout; API bypass still rejected

| Field | Value |
|---|---|
| Story | [US-08-13](../stories/EPIC-08-PRESCRIPTIONS/US-08-13-rx-only-and-controlled-enforcement.md) — Enforce Prescription for Rx-only and Controlled Medicines at Sale |
| Type / Execution | E2E / Manual |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-08-13-AC7, US-08-13-AC1 |
| Critical scenario | CS-13 |
| Requirements | FR-08-035, FR-08-036 |

**Story preconditions**
- Medicines carry `IsPrescriptionOnly` and `IsControlled` flags (SPEC-03).

**US-08-13-AC7 — POS pre-check**

*Preconditions / test data*
1. enforcement ON

*Steps*
1. the cashier adds R to the cart without a prescription link

*Expected results*
1. the POS shows a blocking badge "Prescription required" on the line within 200 ms and disables checkout
2. the server check in AC1 remains authoritative if the client is bypassed.

**US-08-13-AC1 — Rx-only without prescription blocked (CS-13)**

*Preconditions / test data*
1. `EnforcePrescriptionForRxOnly = ON` and medicine R with `IsPrescriptionOnly = true` in stock

*Steps*
1. a cashier completes a sale containing R without `prescriptionItemId` (plus one OTC line)

*Expected results*
1. the response is 422 `PRESCRIPTIONS.PRESCRIPTION_REQUIRED` with error path `lines[0].prescriptionItemId`, and no sale, stock movement, payment, cash movement, or invoice number is persisted.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-08-14: Reverse Dispensing When a Sale Is Voided

### TS-08-081: Void S2 → compensating rows, quantities, PartiallyDispensed

| Field | Value |
|---|---|
| Story | [US-08-14](../stories/EPIC-08-PRESCRIPTIONS/US-08-14-reverse-dispensing-on-void.md) — Reverse Dispensing When a Sale Is Voided |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-08-14-AC1 |
| Requirements | FR-08-037, FR-08-038 |

**Story preconditions**
- A completed sale with prescription-linked lines exists.

**US-08-14-AC1 — Void restores remaining**

*Preconditions / test data*
1. a FullyDispensed prescription whose item I1 (30 base units) was dispensed in sale S1 (10) and sale S2 (20)

*Steps*
1. a user with `sales.sales.void` voids S2 with `Idempotency-Key`

*Expected results*
1. in the void transaction a compensating `DispensingRecord` (−20, `reversesDispensingRecordId` set) is created per original record of S2, I1 shows dispensed 10 / remaining 20, status becomes `PartiallyDispensed`, and history records the transition with reason `Sale S2 voided`.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-082: Void for Expired/Cancelled keeps status

| Field | Value |
|---|---|
| Story | [US-08-14](../stories/EPIC-08-PRESCRIPTIONS/US-08-14-reverse-dispensing-on-void.md) — Reverse Dispensing When a Sale Is Voided |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-08-14-AC2 |
| Requirements | FR-08-037, FR-08-038 |

**Story preconditions**
- A completed sale with prescription-linked lines exists.

**US-08-14-AC2 — Status preserved for Cancelled/Expired**

*Preconditions / test data*
1. an Expired prescription with a dispensing sale S3

*Steps*
1. S3 is voided

*Expected results*
1. compensating records are created and quantities updated, but the status remains `Expired`.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-083: Sales return leaves quantities; reference shown

| Field | Value |
|---|---|
| Story | [US-08-14](../stories/EPIC-08-PRESCRIPTIONS/US-08-14-reverse-dispensing-on-void.md) — Reverse Dispensing When a Sale Is Voided |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-08-14-AC3 |
| Requirements | FR-08-037, FR-08-038 |

**Story preconditions**
- A completed sale with prescription-linked lines exists.

**US-08-14-AC3 — Sales return does not restore quantity**

*Preconditions / test data*
1. a dispensing sale S4 linked to item I2

*Steps*
1. a sales return of the dispensed line is completed (SPEC-06)

*Expected results*
1. I2 dispensed/remaining quantities are unchanged, and the dispensing record view shows the sales return number.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-084: Fault injection rollback; idempotent retry

| Field | Value |
|---|---|
| Story | [US-08-14](../stories/EPIC-08-PRESCRIPTIONS/US-08-14-reverse-dispensing-on-void.md) — Reverse Dispensing When a Sale Is Voided |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-08-14-AC4 |
| Requirements | FR-08-037, FR-08-038 |

**Story preconditions**
- A completed sale with prescription-linked lines exists.

**US-08-14-AC4 — Void failure rolls back**

*Preconditions / test data*
1. a dispensing sale S5

*Steps*
1. the void fails after the compensating dispensing record insert (fault injection)

*Expected results*
1. the sale stays `Completed`, no compensating records exist, and quantities are unchanged.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-085: Void without permission → 403

| Field | Value |
|---|---|
| Story | [US-08-14](../stories/EPIC-08-PRESCRIPTIONS/US-08-14-reverse-dispensing-on-void.md) — Reverse Dispensing When a Sale Is Voided |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | MVP |
| Covers | US-08-14-AC5 |
| Requirements | FR-08-037, FR-08-038 |

**Story preconditions**
- A completed sale with prescription-linked lines exists.

**US-08-14-AC5 — Permission denied**

*Preconditions / test data*
1. a Pharmacist without `sales.sales.void`

*Steps*
1. the Pharmacist voids a dispensing sale

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN` and no compensating records are created.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-08-15: Controlled Medicine Register

### TS-08-086: Entry fields and running balance on dispensing

| Field | Value |
|---|---|
| Story | [US-08-15](../stories/EPIC-08-PRESCRIPTIONS/US-08-15-controlled-medicine-register.md) — Controlled Medicine Register |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-08-15-AC1 |
| Requirements | FR-08-039, FR-08-040 |

**Story preconditions**
- Controlled dispensing occurs via US-08-13.

**US-08-15-AC1 — Entry created with dispensing**

*Preconditions / test data*
1. branch `CAI01` with 40 base units of controlled medicine C on hand across batches

*Steps*
1. a Pharmacist completes a sale dispensing 10 base units of C from batch B7 against prescription `CAI01-RX-2026-000045`

*Expected results*
1. in the same transaction one `ControlledMedicineRegisterEntry` is created with `entryNumber` `CAI01-CMR-2026-<next gapless seq>`, `entryType = Dispensing`, medicine name and strength snapshot, batch number, quantity 10, `balanceAfterBaseUnits = 30`, patient name and id, prescriber name and license as entered, prescription and sale numbers, and pharmacist.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-087: Gapless numbering after rollback

| Field | Value |
|---|---|
| Story | [US-08-15](../stories/EPIC-08-PRESCRIPTIONS/US-08-15-controlled-medicine-register.md) — Controlled Medicine Register |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-08-15-AC2 |
| Requirements | FR-08-039, FR-08-040 |

**Story preconditions**
- Controlled dispensing occurs via US-08-13.

**US-08-15-AC2 — Gapless numbering under failure**

*Preconditions / test data*
1. the last entry number is `CAI01-CMR-2026-000017`

*Steps*
1. a controlled sale fails and rolls back, then another succeeds

*Expected results*
1. the successful entry is `CAI01-CMR-2026-000018`.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-088: Reversal entry on void

| Field | Value |
|---|---|
| Story | [US-08-15](../stories/EPIC-08-PRESCRIPTIONS/US-08-15-controlled-medicine-register.md) — Controlled Medicine Register |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-08-15-AC3 |
| Requirements | FR-08-039, FR-08-040 |

**Story preconditions**
- Controlled dispensing occurs via US-08-13.

**US-08-15-AC3 — Reversal entry on void**

*Preconditions / test data*
1. the entry from AC1

*Steps*
1. the sale is voided

*Expected results*
1. an entry with `entryType = Reversal`, quantity −10, `reversesEntryId` set, and `balanceAfterBaseUnits = 40` is appended
2. the original entry is unchanged.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-089: View with cursor pagination; CSV/PDF export; audit row

| Field | Value |
|---|---|
| Story | [US-08-15](../stories/EPIC-08-PRESCRIPTIONS/US-08-15-controlled-medicine-register.md) — Controlled Medicine Register |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-08-15-AC4 |
| Requirements | FR-08-039, FR-08-040 |

**Story preconditions**
- Controlled dispensing occurs via US-08-13.

**US-08-15-AC4 — View and export**

*Preconditions / test data*
1. a user with `prescriptions.controlled-register.read` in branch `CAI01`

*Steps*
1. the user calls `GET /api/v1/branches/{CAI01}/controlled-register?from=2026-11-01&to=2026-11-30` and then `POST .../controlled-register/exports` with `{ "format": "csv", "from": "2026-11-01", "to": "2026-11-30" }`

*Expected results*
1. entries are returned in entry-number order with cursor pagination, the export file contains the same entries, and an `AuditLog` entry records the export (user, range, format, row count).

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-090: Range boundaries 366/367 days and from > to

| Field | Value |
|---|---|
| Story | [US-08-15](../stories/EPIC-08-PRESCRIPTIONS/US-08-15-controlled-medicine-register.md) — Controlled Medicine Register |
| Type / Execution | Unit / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-08-15-AC5 |
| Requirements | FR-08-039, FR-08-040 |

**Story preconditions**
- Controlled dispensing occurs via US-08-13.

**US-08-15-AC5 — Range limit**

*Preconditions / test data*
1. the same user

*Steps*
1. the user requests `from=2025-01-01&to=2026-11-30`

*Expected results*
1. the response is 422 `PRESCRIPTIONS.REGISTER_RANGE_TOO_LARGE`.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-091: Cashier → 403; unassigned branch → 403

| Field | Value |
|---|---|
| Story | [US-08-15](../stories/EPIC-08-PRESCRIPTIONS/US-08-15-controlled-medicine-register.md) — Controlled Medicine Register |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | MVP |
| Covers | US-08-15-AC6 |
| Requirements | FR-08-039, FR-08-040 |

**Story preconditions**
- Controlled dispensing occurs via US-08-13.

**US-08-15-AC6 — Permission and branch denied**

*Preconditions / test data*
1. a Cashier without `prescriptions.controlled-register.read`, and a Pharmacist with the permission assigned only to branch A

*Steps*
1. the Cashier reads branch A's register, and the Pharmacist reads branch B's register

*Expected results*
1. both responses are 403 `COMMON.FORBIDDEN`.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-092: No update/delete endpoint; DB role denies UPDATE/DELETE

| Field | Value |
|---|---|
| Story | [US-08-15](../stories/EPIC-08-PRESCRIPTIONS/US-08-15-controlled-medicine-register.md) — Controlled Medicine Register |
| Type / Execution | Security / Automated |
| Priority | T1 (story P1) |
| Release | MVP |
| Covers | US-08-15-AC7 |
| Requirements | FR-08-039, FR-08-040 |

**Story preconditions**
- Controlled dispensing occurs via US-08-13.

**US-08-15-AC7 — Append-only**

*Preconditions / test data*
1. any register entry

*Steps*
1. any user attempts to update or delete it via API

*Expected results*
1. no such endpoint exists (405) and a database-level attempt by the application role to update/delete is rejected.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-08-16: Generic Substitution

### TS-08-093: Record substitution; context lists substitute; audit

| Field | Value |
|---|---|
| Story | [US-08-16](../stories/EPIC-08-PRESCRIPTIONS/US-08-16-generic-substitution.md) — Generic Substitution |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-08-16-AC1 |
| Requirements | FR-08-041, FR-08-042 |

**Story preconditions**
- `AllowGenericSubstitution = ON`.
- Prescription `Verified` or `PartiallyDispensed`.

**US-08-16-AC1 — Record substitution**

*Preconditions / test data*
1. item I1 for medicine M (remaining 20 base units) and active medicine G listed as `MedicineAlternative` of M

*Steps*
1. a user with `prescriptions.prescriptions.verify` posts `{ "substituteMedicineId": "G", "substituteQuantityBaseUnits": 20, "reason": "OutOfStock", "patientConsentObtained": true }` to `.../items/{I1}/substitutions`

*Expected results*
1. the response is 201 with an active substitution, `isCatalogAlternative = true`, `approvedBy`/`approvedAt`, and an audit entry
2. the dispensing context lists G under `approvedSubstitutes`.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-094: Dispense substitute; record stores both medicines

| Field | Value |
|---|---|
| Story | [US-08-16](../stories/EPIC-08-PRESCRIPTIONS/US-08-16-generic-substitution.md) — Generic Substitution |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-08-16-AC2 |
| Requirements | FR-08-041, FR-08-042 |

**Story preconditions**
- `AllowGenericSubstitution = ON`.
- Prescription `Verified` or `PartiallyDispensed`.

**US-08-16-AC2 — Dispense the substitute**

*Preconditions / test data*
1. the substitution from AC1

*Steps*
1. a sale of 20 base units of G linked to I1 is completed

*Expected results*
1. a `DispensingRecord` stores `prescribedMedicineId = M`, `dispensedMedicineId = G`, the substitution id, and I1 remaining becomes 0.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-095: Consent, same/inactive medicine, reason rules

| Field | Value |
|---|---|
| Story | [US-08-16](../stories/EPIC-08-PRESCRIPTIONS/US-08-16-generic-substitution.md) — Generic Substitution |
| Type / Execution | Unit / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-08-16-AC3, US-08-16-AC4 |
| Requirements | FR-08-041, FR-08-042 |

**Story preconditions**
- `AllowGenericSubstitution = ON`.
- Prescription `Verified` or `PartiallyDispensed`.

**US-08-16-AC3 — Consent required**

*Preconditions / test data*
1. `RequireConsentForSubstitution = ON`

*Steps*
1. the pharmacist posts a substitution with `patientConsentObtained = false`

*Expected results*
1. the response is 422 `PRESCRIPTIONS.CONSENT_REQUIRED`.

**US-08-16-AC4 — Invalid substitution**

*Preconditions / test data*
1. item I1 for M

*Steps*
1. the pharmacist submits `substituteMedicineId = M`, an inactive medicine, or `reason = "Other"` without text

*Expected results*
1. the responses are 422 `PRESCRIPTIONS.SUBSTITUTION_INVALID`, 422 `PRESCRIPTIONS.SUBSTITUTION_INVALID`, and 422 `PRESCRIPTIONS.SUBSTITUTION_REASON_REQUIRED`.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-096: Feature OFF → 422; Cashier → 403

| Field | Value |
|---|---|
| Story | [US-08-16](../stories/EPIC-08-PRESCRIPTIONS/US-08-16-generic-substitution.md) — Generic Substitution |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-08-16-AC5, US-08-16-AC6 |
| Requirements | FR-08-041, FR-08-042 |

**Story preconditions**
- `AllowGenericSubstitution = ON`.
- Prescription `Verified` or `PartiallyDispensed`.

**US-08-16-AC5 — Feature disabled**

*Preconditions / test data*
1. `AllowGenericSubstitution = OFF`

*Steps*
1. the pharmacist posts a substitution

*Expected results*
1. the response is 422 `PRESCRIPTIONS.SUBSTITUTION_DISABLED`.

**US-08-16-AC6 — Permission denied**

*Preconditions / test data*
1. a Cashier without `prescriptions.prescriptions.verify`

*Steps*
1. the Cashier posts a substitution

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN`.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-097: Non-listed substitute warning and flag

| Field | Value |
|---|---|
| Story | [US-08-16](../stories/EPIC-08-PRESCRIPTIONS/US-08-16-generic-substitution.md) — Generic Substitution |
| Type / Execution | E2E / Manual |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-08-16-AC7 |
| Requirements | FR-08-041, FR-08-042 |

**Story preconditions**
- `AllowGenericSubstitution = ON`.
- Prescription `Verified` or `PartiallyDispensed`.

**US-08-16-AC7 — Non-listed substitute shows warning**

*Preconditions / test data*
1. active medicine H that is not a `MedicineAlternative` of M

*Steps*
1. the pharmacist records H as substitute with reason `PatientRequest`

*Expected results*
1. the substitution is stored with `isCatalogAlternative = false` and the UI shows "Not a catalog-listed alternative — pharmacist decision" before confirmation.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-08-17: Allergy Alerts at Verification and Dispensing

### TS-08-098: Fake SPEC-07 facade returns match → alert + disclaimer

| Field | Value |
|---|---|
| Story | [US-08-17](../stories/EPIC-08-PRESCRIPTIONS/US-08-17-allergy-alerts.md) — Allergy Alerts at Verification and Dispensing |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-08-17-AC1 |
| Requirements | FR-08-043 |

**Story preconditions**
- Prescription has a patient with recorded allergies (SPEC-07).

**US-08-17-AC1 — Alert displayed with disclaimer**

*Preconditions / test data*
1. patient P with a recorded allergy that SPEC-07's allergy check matches to medicine M on item I1

*Steps*
1. the pharmacist opens verification or the dispensing context

*Expected results*
1. the response includes `alerts: [{ type: "Allergy", itemId: I1, alertKey, allergenDescription, matchBasis }]` and the UI shows the alert with the text "Decision support only. Information depends on recorded patient data and may be incomplete. The pharmacist remains responsible for the dispensing decision."

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-099: Verify and sale blocked until acknowledged

| Field | Value |
|---|---|
| Story | [US-08-17](../stories/EPIC-08-PRESCRIPTIONS/US-08-17-allergy-alerts.md) — Allergy Alerts at Verification and Dispensing |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-08-17-AC2 |
| Requirements | FR-08-043 |

**Story preconditions**
- Prescription has a patient with recorded allergies (SPEC-07).

**US-08-17-AC2 — Acknowledgement required before verify/dispense**

*Preconditions / test data*
1. the open alert from AC1

*Steps*
1. the pharmacist verifies, or completes a sale linked to I1, without acknowledgement

*Expected results*
1. the response is 422 `PRESCRIPTIONS.ALERT_OVERRIDE_REQUIRED`.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-100: Acknowledge stores override and audit; flow proceeds

| Field | Value |
|---|---|
| Story | [US-08-17](../stories/EPIC-08-PRESCRIPTIONS/US-08-17-allergy-alerts.md) — Allergy Alerts at Verification and Dispensing |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-08-17-AC3 |
| Requirements | FR-08-043 |

**Story preconditions**
- Prescription has a patient with recorded allergies (SPEC-07).

**US-08-17-AC3 — Acknowledge with reason**

*Preconditions / test data*
1. the open alert

*Steps*
1. a user with `prescriptions.prescriptions.verify` posts `{ "alertType": "Allergy", "alertKey": "<key>", "itemId": "I1", "reason": "Confirmed with patient: intolerance, not allergy" }` to `.../alert-overrides`

*Expected results*
1. a `PrescriptionAlertOverride` is stored with user and time, an audit entry is written, and verification/dispensing proceed.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-101: Short reason → 422; Cashier → 403

| Field | Value |
|---|---|
| Story | [US-08-17](../stories/EPIC-08-PRESCRIPTIONS/US-08-17-allergy-alerts.md) — Allergy Alerts at Verification and Dispensing |
| Type / Execution | Security / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-08-17-AC4 |
| Requirements | FR-08-043 |

**Story preconditions**
- Prescription has a patient with recorded allergies (SPEC-07).

**US-08-17-AC4 — Short reason and permission denied**

*Preconditions / test data*
1. an open alert

*Steps*
1. the pharmacist posts reason "ok", and a Cashier without `prescriptions.prescriptions.verify` posts a valid reason

*Expected results*
1. the responses are 422 `PRESCRIPTIONS.OVERRIDE_REASON_REQUIRED` and 403 `COMMON.FORBIDDEN`.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-08-18: Dispensing Labels

### TS-08-102: PDF with 2 bilingual labels; RTL shaping visual check

| Field | Value |
|---|---|
| Story | [US-08-18](../stories/EPIC-08-PRESCRIPTIONS/US-08-18-dispensing-labels.md) — Dispensing Labels |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-08-18-AC1 |
| Requirements | FR-08-044 |

**Story preconditions**
- A completed sale with dispensing records.

**US-08-18-AC1 — Bilingual labels generated**

*Preconditions / test data*
1. sale S with 2 dispensing lines for patient "منى عادل" (Mona Adel)

*Steps*
1. a user with `prescriptions.prescriptions.read` calls `GET .../sales/{S}/dispensing-labels?lang=both`

*Expected results*
1. the response is 200 `application/pdf` with 2 labels sized 50×30 mm, each containing patient name, medicine name and strength, dosage, frequency, route, instructions, quantity, dispensing date, prescription number, branch name and phone, with the Arabic block rendered right-to-left.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-103: No patient → "—"

| Field | Value |
|---|---|
| Story | [US-08-18](../stories/EPIC-08-PRESCRIPTIONS/US-08-18-dispensing-labels.md) — Dispensing Labels |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-08-18-AC2 |
| Requirements | FR-08-044 |

**Story preconditions**
- A completed sale with dispensing records.

**US-08-18-AC2 — Labels for a prescription without patient**

*Preconditions / test data*
1. a dispensing sale whose prescription has no patient

*Steps*
1. labels are requested with `lang=en`

*Expected results*
1. the patient field shows "—" and all other fields are present.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-104: No dispensing → 422; invalid lang → 422

| Field | Value |
|---|---|
| Story | [US-08-18](../stories/EPIC-08-PRESCRIPTIONS/US-08-18-dispensing-labels.md) — Dispensing Labels |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-08-18-AC3, US-08-18-AC5 |
| Requirements | FR-08-044 |

**Story preconditions**
- A completed sale with dispensing records.

**US-08-18-AC3 — Sale without dispensing**

*Preconditions / test data*
1. sale S2 with no prescription-linked lines

*Steps*
1. labels are requested

*Expected results*
1. the response is 422 `PRESCRIPTIONS.NO_DISPENSING_RECORDS`.

**US-08-18-AC5 — Invalid language**

*Preconditions / test data*
1. a dispensing sale

*Steps*
1. labels are requested with `lang=fr`

*Expected results*
1. the response is 422 `PRESCRIPTIONS.QUERY_INVALID`.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-105: Cashier → 403; unassigned branch → 403

| Field | Value |
|---|---|
| Story | [US-08-18](../stories/EPIC-08-PRESCRIPTIONS/US-08-18-dispensing-labels.md) — Dispensing Labels |
| Type / Execution | Security / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-08-18-AC4 |
| Requirements | FR-08-044 |

**Story preconditions**
- A completed sale with dispensing records.

**US-08-18-AC4 — Permission and branch denied**

*Preconditions / test data*
1. a Cashier without `prescriptions.prescriptions.read`, and a Pharmacist assigned only to branch A

*Steps*
1. the Cashier requests labels in A, and the Pharmacist requests labels for a sale in branch B

*Expected results*
1. both responses are 403 `COMMON.FORBIDDEN`.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-106: 30 labels ≤ 2 s p95

| Field | Value |
|---|---|
| Story | [US-08-18](../stories/EPIC-08-PRESCRIPTIONS/US-08-18-dispensing-labels.md) — Dispensing Labels |
| Type / Execution | Performance / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-08-18-AC1 |
| Requirements | FR-08-044 |

**Story preconditions**
- A completed sale with dispensing records.

**US-08-18-AC1 — Bilingual labels generated**

*Preconditions / test data*
1. sale S with 2 dispensing lines for patient "منى عادل" (Mona Adel)

*Steps*
1. a user with `prescriptions.prescriptions.read` calls `GET .../sales/{S}/dispensing-labels?lang=both`

*Expected results*
1. the response is 200 `application/pdf` with 2 labels sized 50×30 mm, each containing patient name, medicine name and strength, dosage, frequency, route, instructions, quantity, dispensing date, prescription number, branch name and phone, with the Arabic block rendered right-to-left.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-08-19: Prescription Refills

### TS-08-107: Reference behavior and exact values for FR-08-045

| Field | Value |
|---|---|
| Story | [US-08-19](../stories/EPIC-08-PRESCRIPTIONS/US-08-19-prescription-refills.md) — Prescription Refills |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-08-19-AC1 |
| Requirements | FR-08-045 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-08-045 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.
- OCR and interaction provider toggles default OFF; external processing requires configured providers and review under REG-04/REG-09/REG-10.

**US-08-19-AC1 — Successful result**

*Preconditions / test data*
1. Refill limits and fill reset

*Steps*
1. AllowPrescriptionRefills=ON, Verified prescription expires 2026-12-09, RefillsAllowed=2, RefillsUsed=0, active item prescribed 30 base units and fully dispensed

*Expected results*
1. verifier starts refill: status Verified, RefillsUsed=1, CurrentFillNumber=1, remaining resets to 30
2. audit and history record action.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-108: Negative validation path, no partial effect; PRESCRIPTIONS.INVALID_STATUS_TRANSITION

| Field | Value |
|---|---|
| Story | [US-08-19](../stories/EPIC-08-PRESCRIPTIONS/US-08-19-prescription-refills.md) — Prescription Refills |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-08-19-AC2 |
| Requirements | FR-08-045 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-08-045 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.
- OCR and interaction provider toggles default OFF; external processing requires configured providers and review under REG-04/REG-09/REG-10.

**US-08-19-AC2 — Validation and negative case**

*Preconditions / test data*
1. OFF, non-FullyDispensed, expired, or RefillsUsed=RefillsAllowed (2) is rejected and quantities unchanged

*Steps*
1. the system validates the request at the required state transition

*Expected results*
1. the specified error is returned and no partial stock, ledger, prescription, or document change remains.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-109: Missing permission and cross-branch access return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-08-19](../stories/EPIC-08-PRESCRIPTIONS/US-08-19-prescription-refills.md) — Prescription Refills |
| Type / Execution | Security / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-08-19-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-08-045 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-08-045 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.
- OCR and interaction provider toggles default OFF; external processing requires configured providers and review under REG-04/REG-09/REG-10.

**US-08-19-AC3 — Permission denied**

*Preconditions / test data*
1. prescriptions.prescriptions.verify lacks the required permission or is assigned only to another Branch

*Steps*
1. the user calls the branch-scoped endpoint

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN`
2. no protected data or change is returned.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-110: Cross-organization id returns 404 without data (CS-08)

| Field | Value |
|---|---|
| Story | [US-08-19](../stories/EPIC-08-PRESCRIPTIONS/US-08-19-prescription-refills.md) — Prescription Refills |
| Type / Execution | Security / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-08-19-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-08-045 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-08-045 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.
- OCR and interaction provider toggles default OFF; external processing requires configured providers and review under REG-04/REG-09/REG-10.

**US-08-19-AC4 — Organization isolation**

*Preconditions / test data*
1. the requested record belongs to another Organization

*Steps*
1. the caller requests the record by id

*Expected results*
1. the response is 404 `PRESCRIPTIONS.NOT_FOUND` and discloses no record data (CS-08).

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-08-20: OCR Extraction Suggestions

### TS-08-111: Reference behavior and exact values for FR-08-046

| Field | Value |
|---|---|
| Story | [US-08-20](../stories/EPIC-08-PRESCRIPTIONS/US-08-20-ocr-extraction.md) — OCR Extraction Suggestions |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P3) |
| Release | Future |
| Covers | US-08-20-AC1 |
| Requirements | FR-08-046 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-08-046 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.
- OCR and interaction provider toggles default OFF; external processing requires configured providers and review under REG-04/REG-09/REG-10.

**US-08-20-AC1 — Successful result**

*Preconditions / test data*
1. OCR job lifecycle

*Steps*
1. OcrEnabled=ON with configured provider
2. prescription is editable and attachment ScanStatus=Clean
3. provider completes in 84 s with confidence 0.92

*Expected results*
1. request creates Queued OcrExtraction, background worker completes within timeout 120 s, stores provider/version and confidence 0.00–1.00
2. retry policy is 3 exponential-backoff retries.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-112: Negative validation path, no partial effect; PRESCRIPTIONS.INVALID_STATUS_TRANSITION

| Field | Value |
|---|---|
| Story | [US-08-20](../stories/EPIC-08-PRESCRIPTIONS/US-08-20-ocr-extraction.md) — OCR Extraction Suggestions |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P3) |
| Release | Future |
| Covers | US-08-20-AC2 |
| Requirements | FR-08-046 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-08-046 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.
- OCR and interaction provider toggles default OFF; external processing requires configured providers and review under REG-04/REG-09/REG-10.

**US-08-20-AC2 — Validation and negative case**

*Preconditions / test data*
1. OcrEnabled=OFF, attachment not Clean, non-editable prescription, or no provider (422 PRESCRIPTIONS.PROVIDER_NOT_CONFIGURED) creates no extraction

*Steps*
1. the system validates the request at the required state transition

*Expected results*
1. the specified error is returned and no partial stock, ledger, prescription, or document change remains.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-113: Missing permission and cross-branch access return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-08-20](../stories/EPIC-08-PRESCRIPTIONS/US-08-20-ocr-extraction.md) — OCR Extraction Suggestions |
| Type / Execution | Security / Automated |
| Priority | T3 (story P3) |
| Release | Future |
| Covers | US-08-20-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-08-046 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-08-046 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.
- OCR and interaction provider toggles default OFF; external processing requires configured providers and review under REG-04/REG-09/REG-10.

**US-08-20-AC3 — Permission denied**

*Preconditions / test data*
1. prescriptions.prescriptions.read lacks the required permission or is assigned only to another Branch

*Steps*
1. the user calls the branch-scoped endpoint

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN`
2. no protected data or change is returned.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-114: Cross-organization id returns 404 without data (CS-08)

| Field | Value |
|---|---|
| Story | [US-08-20](../stories/EPIC-08-PRESCRIPTIONS/US-08-20-ocr-extraction.md) — OCR Extraction Suggestions |
| Type / Execution | Security / Automated |
| Priority | T3 (story P3) |
| Release | Future |
| Covers | US-08-20-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-08-046 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-08-046 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.
- OCR and interaction provider toggles default OFF; external processing requires configured providers and review under REG-04/REG-09/REG-10.

**US-08-20-AC4 — Organization isolation**

*Preconditions / test data*
1. the requested record belongs to another Organization

*Steps*
1. the caller requests the record by id

*Expected results*
1. the response is 404 `PRESCRIPTIONS.NOT_FOUND` and discloses no record data (CS-08).

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-08-21: Review and Decide OCR Suggestions

### TS-08-115: Reference behavior and exact values for FR-08-047

| Field | Value |
|---|---|
| Story | [US-08-21](../stories/EPIC-08-PRESCRIPTIONS/US-08-21-ocr-suggestion-review.md) — Review and Decide OCR Suggestions |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P3) |
| Release | Future |
| Covers | US-08-21-AC1 |
| Requirements | FR-08-047 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-08-047 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.
- OCR and interaction provider toggles default OFF; external processing requires configured providers and review under REG-04/REG-09/REG-10.

**US-08-21-AC1 — Successful result**

*Preconditions / test data*
1. Explicit OCR field decisions

*Steps*
1. Extraction suggests patient name and a free-text medicine
2. threshold=0.80
3. one field confidence 0.72, another 0.94

*Expected results*
1. low confidence 0.72 highlighted
2. accepting or editing records per-field decision and copies only chosen value
3. free-text medicine remains unresolved until pharmacist resolves it
4. status remains Draft/PendingVerification.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-116: Negative validation path, no partial effect; PRESCRIPTIONS.INVALID_STATUS_TRANSITION

| Field | Value |
|---|---|
| Story | [US-08-21](../stories/EPIC-08-PRESCRIPTIONS/US-08-21-ocr-suggestion-review.md) — Review and Decide OCR Suggestions |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P3) |
| Release | Future |
| Covers | US-08-21-AC2 |
| Requirements | FR-08-047 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-08-047 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.
- OCR and interaction provider toggles default OFF; external processing requires configured providers and review under REG-04/REG-09/REG-10.

**US-08-21-AC2 — Validation and negative case**

*Preconditions / test data*
1. No decision leaves prescription unchanged
2. OCR cannot set Verified, verify item, or create DispensingRecord (BR-G-14)
3. second decision returns 409 PRESCRIPTIONS.OCR_FIELD_ALREADY_DECIDED

*Steps*
1. the system validates the request at the required state transition

*Expected results*
1. the specified error is returned and no partial stock, ledger, prescription, or document change remains.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-117: Missing permission and cross-branch access return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-08-21](../stories/EPIC-08-PRESCRIPTIONS/US-08-21-ocr-suggestion-review.md) — Review and Decide OCR Suggestions |
| Type / Execution | Security / Automated |
| Priority | T3 (story P3) |
| Release | Future |
| Covers | US-08-21-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-08-047 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-08-047 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.
- OCR and interaction provider toggles default OFF; external processing requires configured providers and review under REG-04/REG-09/REG-10.

**US-08-21-AC3 — Permission denied**

*Preconditions / test data*
1. prescriptions.prescriptions.create lacks the required permission or is assigned only to another Branch

*Steps*
1. the user calls the branch-scoped endpoint

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN`
2. no protected data or change is returned.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-118: Cross-organization id returns 404 without data (CS-08)

| Field | Value |
|---|---|
| Story | [US-08-21](../stories/EPIC-08-PRESCRIPTIONS/US-08-21-ocr-suggestion-review.md) — Review and Decide OCR Suggestions |
| Type / Execution | Security / Automated |
| Priority | T3 (story P3) |
| Release | Future |
| Covers | US-08-21-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-08-047 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-08-047 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.
- OCR and interaction provider toggles default OFF; external processing requires configured providers and review under REG-04/REG-09/REG-10.

**US-08-21-AC4 — Organization isolation**

*Preconditions / test data*
1. the requested record belongs to another Organization

*Steps*
1. the caller requests the record by id

*Expected results*
1. the response is 404 `PRESCRIPTIONS.NOT_FOUND` and discloses no record data (CS-08).

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.


## US-08-22: Drug Interaction Checks and Overrides

### TS-08-119: Reference behavior and exact values for FR-08-048, FR-08-049, FR-08-050

| Field | Value |
|---|---|
| Story | [US-08-22](../stories/EPIC-08-PRESCRIPTIONS/US-08-22-drug-interaction-checks.md) — Drug Interaction Checks and Overrides |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P3) |
| Release | Future |
| Covers | US-08-22-AC1 |
| Requirements | FR-08-048, FR-08-049, FR-08-050 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-08-048, FR-08-049, FR-08-050 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.
- OCR and interaction provider toggles default OFF; external processing requires configured providers and review under REG-04/REG-09/REG-10.

**US-08-22-AC1 — Successful result**

*Preconditions / test data*
1. Licensed-source contract, alerts and override

*Steps*
1. No interaction dataset ships by default. In test only, configured licensed provider returns source name/version and one Major interaction for two active ingredient IDs
2. provider response within 2 s

*Expected results*
1. disabled/unconfigured setting does not call provider
2. enabled check shows severity/source/version and decision-support disclaimer
3. Major/Contraindicated blocks verification/dispensing until permissioned 10–500 char reason is audited.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-120: Negative validation path, no partial effect; PRESCRIPTIONS.INVALID_STATUS_TRANSITION

| Field | Value |
|---|---|
| Story | [US-08-22](../stories/EPIC-08-PRESCRIPTIONS/US-08-22-drug-interaction-checks.md) — Drug Interaction Checks and Overrides |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P3) |
| Release | Future |
| Covers | US-08-22-AC2 |
| Requirements | FR-08-048, FR-08-049, FR-08-050 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-08-048, FR-08-049, FR-08-050 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.
- OCR and interaction provider toggles default OFF; external processing requires configured providers and review under REG-04/REG-09/REG-10.

**US-08-22-AC2 — Validation and negative case**

*Preconditions / test data*
1. provider timeout >2 s displays Interaction check unavailable and does not block
2. enabling without provider returns PRESCRIPTIONS.PROVIDER_NOT_CONFIGURED
3. no invented interaction facts or data

*Steps*
1. the system validates the request at the required state transition

*Expected results*
1. the specified error is returned and no partial stock, ledger, prescription, or document change remains.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-121: Missing permission and cross-branch access return 403 (CS-07)

| Field | Value |
|---|---|
| Story | [US-08-22](../stories/EPIC-08-PRESCRIPTIONS/US-08-22-drug-interaction-checks.md) — Drug Interaction Checks and Overrides |
| Type / Execution | Security / Automated |
| Priority | T3 (story P3) |
| Release | Future |
| Covers | US-08-22-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-08-048, FR-08-049, FR-08-050 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-08-048, FR-08-049, FR-08-050 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.
- OCR and interaction provider toggles default OFF; external processing requires configured providers and review under REG-04/REG-09/REG-10.

**US-08-22-AC3 — Permission denied**

*Preconditions / test data*
1. prescriptions.interactions.override lacks the required permission or is assigned only to another Branch

*Steps*
1. the user calls the branch-scoped endpoint

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN`
2. no protected data or change is returned.

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

### TS-08-122: Cross-organization id returns 404 without data (CS-08)

| Field | Value |
|---|---|
| Story | [US-08-22](../stories/EPIC-08-PRESCRIPTIONS/US-08-22-drug-interaction-checks.md) — Drug Interaction Checks and Overrides |
| Type / Execution | Security / Automated |
| Priority | T3 (story P3) |
| Release | Future |
| Covers | US-08-22-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-08-048, FR-08-049, FR-08-050 |

**Story preconditions**
- Source records, settings, permissions, and integration contracts required by FR-08-048, FR-08-049, FR-08-050 exist.
- PostgreSQL Row-Level Security is enabled from MVP; every request is scoped by organization and, where applicable, branch.
- OCR and interaction provider toggles default OFF; external processing requires configured providers and review under REG-04/REG-09/REG-10.

**US-08-22-AC4 — Organization isolation**

*Preconditions / test data*
1. the requested record belongs to another Organization

*Steps*
1. the caller requests the record by id

*Expected results*
1. the response is 404 `PRESCRIPTIONS.NOT_FOUND` and discloses no record data (CS-08).

**Post-conditions / invariants:** INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.

