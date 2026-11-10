# Test Cases — EPIC-03 Medicine Catalog

> **Generated** by `node scripts/docs/gen-test-cases.mjs` on 2026-11-10 from the story files in `docs/stories/EPIC-03-MEDICINE-CATALOG/`. Each test case corresponds to one test scenario (TS) declared in a story; preconditions, steps and expected results are derived from the Given / When / Then of the acceptance criteria it covers. The stories are the source of truth — change a story and regenerate.

**Conventions:** TC ID = TS ID. Priority T0 blocks merge, T1 blocks release, T2/T3 per [MASTER-TEST-STRATEGY §6](../test-plans/MASTER-TEST-STRATEGY.md). Execution: *Automated* tests are implemented in code with a trait/name carrying the TS ID; *Manual* cases are executed from this document. Test data conventions: [TEST-DATA-STRATEGY.md](../test-plans/TEST-DATA-STRATEGY.md).

## Summary (101 test cases)

| TC | Scenario | Type | Priority | Release | Covers |
|---|---|---|---|---|---|
| TS-03-001 | Create manufacturer with valid data returns 201 + ETag | Integration | T1 | MVP | US-03-01-AC1 |
| TS-03-002 | Normalized-name collision for Latin case/whitespace and Arabic variants | Unit | T1 | MVP | US-03-01-AC2 |
| TS-03-003 | New organization has 19 seeded dosage forms with ar/en names | Integration | T1 | MVP | US-03-01-AC3 |
| TS-03-004 | Assigning deactivated manufacturer to new medicine rejected; existing reference retained | Integration | T1 | MVP | US-03-01-AC4 |
| TS-03-005 | Delete referenced vs unreferenced ingredient | Integration | T1 | MVP | US-03-01-AC5 |
| TS-03-006 | Cashier write attempts on all three resources return 403 | Integration | T1 | MVP | US-03-01-AC6 |
| TS-03-007 | Cross-organization GET/PUT/DELETE return 404 with body identical to non-existent id (CS-08) | Integration | T0 | MVP | US-03-01-AC7 |
| TS-03-008 | Create L1/L2/L3 and read tree | Integration | T1 | MVP | US-03-02-AC1 |
| TS-03-009 | Depth validation on create and on subtree move | Unit | T1 | MVP | US-03-02-AC2, US-03-02-AC3 |
| TS-03-010 | Cycle detection on move (self, child, grandchild as new parent) | Unit | T1 | MVP | US-03-02-AC3 |
| TS-03-011 | Sibling uniqueness vs same name under different parent | Integration | T1 | MVP | US-03-02-AC4 |
| TS-03-012 | Deactivation blocked by active child, then allowed | Integration | T1 | MVP | US-03-02-AC5 |
| TS-03-013 | Category filter returns descendants only | Integration | T1 | MVP | US-03-02-AC6 |
| TS-03-014 | 403 for Cashier write; 404 cross-organization (CS-08) | Integration | T0 | MVP | US-03-02-AC7 |
| TS-03-015 | Create category + audit row in same transaction | Integration | T1 | MVP | US-03-03-AC1 |
| TS-03-016 | Rate change returns new ETag and value; audit old/new; no other tables touched | Integration | T1 | MVP | US-03-03-AC2 |
| TS-03-017 | Deactivating default category returns 409 | Integration | T1 | MVP | US-03-03-AC3 |
| TS-03-018 | Rate boundaries 0.00, 100.00 accepted; 100.01, -0.01, 5.555 rejected | Unit | T1 | MVP | US-03-03-AC4 |
| TS-03-019 | Set default to active category succeeds with audit; inactive category rejected | Integration | T1 | MVP | US-03-03-AC5 |
| TS-03-020 | Manager write 403, read 200; cross-organization 404 | Integration | T1 | MVP | US-03-03-AC6, US-03-03-AC7 |
| TS-03-021 | Create with defaults: code, class, tax category, price, history `Initial`, audit — all in one transaction | Integration | T1 | MVP | US-03-04-AC1 |
| TS-03-022 | Duplicate code case-insensitive | Integration | T1 | MVP | US-03-04-AC2 |
| TS-03-023 | ETag flow: 200 / 412 / 428 | Integration | T1 | MVP | US-03-04-AC3 |
| TS-03-024 | PackSize lock with stub probe returning on-hand, reserved, and zero | Integration | T1 | MVP | US-03-04-AC4 |
| TS-03-025 | Storage fields and derived `isRefrigerated` | Integration | T1 | MVP | US-03-04-AC5 |
| TS-03-026 | Field validation boundaries (packSize 1/10,000/10,001; minStock -1/0/1,000,000) | Unit | T1 | MVP | US-03-04-AC6 |
| TS-03-027 | Possible-duplicate detection with normalization and `confirmDuplicate` | Integration | T1 | MVP | US-03-04-AC7 |
| TS-03-028 | Classification at create with/without classify permission | Integration | T1 | MVP | US-03-04-AC8 |
| TS-03-029 | Cashier create/update 403 | Integration | T1 | MVP | US-03-04-AC9 |
| TS-03-030 | Cross-organization medicine and body reference ids (CS-08) | Integration | T0 | MVP | US-03-04-AC10 |
| TS-03-031 | 20 parallel creates without code produce 20 unique sequential codes | Concurrency | T0 | MVP | US-03-04-AC1 |
| TS-03-032 | Replace composition, ordered rows, composed strength text | Integration | T1 | MVP | US-03-05-AC1 |
| TS-03-033 | Strength-text composition keeps explicit text; decimal formatting | Unit | T1 | MVP | US-03-05-AC2 |
| TS-03-034 | Duplicate ingredient rejected atomically | Integration | T1 | MVP | US-03-05-AC3 |
| TS-03-035 | Row limit, strength range, unit enum | Unit | T1 | MVP | US-03-05-AC4 |
| TS-03-036 | Inactive ingredient rejected for new composition, retained on unrelated update | Integration | T1 | MVP | US-03-05-AC5 |
| TS-03-037 | Empty composition accepted | Integration | T1 | MVP | US-03-05-AC6 |
| TS-03-038 | 403 without update permission | Integration | T1 | MVP | US-03-05-AC7 |
| TS-03-039 | Cross-organization medicine and ingredient ids (CS-08) | Integration | T0 | MVP | US-03-05-AC8 |
| TS-03-040 | First barcode becomes primary with normalized code and audit | Integration | T1 | MVP | US-03-06-AC1 |
| TS-03-041 | GS1 mod-10 check digit for GTIN-8/12/13/14 (valid and invalid vectors) | Unit | T1 | MVP | US-03-06-AC2 |
| TS-03-042 | Internal format character set and length 1/32/33 | Unit | T1 | MVP | US-03-06-AC3 |
| TS-03-043 | UPC-A vs EAN-13 equivalence, conflict with inactive medicine | Integration | T1 | MVP | US-03-06-AC4 |
| TS-03-044 | Parallel insert of same code: one 201, one 409 | Concurrency | T0 | MVP | US-03-06-AC5 |
| TS-03-045 | Set primary, delete primary, oldest promoted, audits | Integration | T1 | MVP | US-03-06-AC6 |
| TS-03-046 | 11th barcode rejected | Integration | T1 | MVP | US-03-06-AC7 |
| TS-03-047 | Lookup active, inactive (case-insensitive internal), miss | Integration | T1 | MVP | US-03-06-AC8 |
| TS-03-048 | 403 for add without update permission | Integration | T1 | MVP | US-03-06-AC9 |
| TS-03-049 | Cross-organization lookup 404 and per-organization uniqueness (CS-08) | Integration | T0 | MVP | US-03-06-AC10 |
| TS-03-050 | Change price writes current price, append-only history, audit, and outbox atomically | Integration | T1 | MVP | US-03-07-AC1 |
| TS-03-051 | Large-change confirmation, ETag handling, and newest-first history | Integration | T1 | MVP | US-03-07-AC2 |
| TS-03-052 | Missing permission and non-wide scope both return 403 without mutation | Integration | T1 | MVP | US-03-07-AC3 |
| TS-03-053 | Other-Organization price history/update returns 404 (CS-08) | Integration | T0 | MVP | US-03-07-AC4 |
| TS-03-054 | Set Branch A override and verify Branch B remains on organization default | Integration | T2 | MVP | US-03-08-AC1 |
| TS-03-055 | Remove override and verify fallback plus immutable sales snapshots | Integration | T2 | MVP | US-03-08-AC2 |
| TS-03-056 | Other-Branch request returns 403 (CS-07); disabled setting returns 409 | Integration | T1 | MVP | US-03-08-AC3 |
| TS-03-057 | Cross-Organization Branch/medicine access returns concealed 404 (CS-08) | Integration | T1 | MVP | US-03-08-AC4 |
| TS-03-058 | Default and non-default classification creation permissions | Integration | T1 | MVP | US-03-09-AC1 |
| TS-03-059 | Dedicated change writes audit and outbox atomically | Integration | T1 | MVP | US-03-09-AC2 |
| TS-03-060 | General update rejects class change with 422 | Integration | T1 | MVP | US-03-09-AC3 |
| TS-03-061 | Missing permission returns 403 and foreign medicine returns 404 (CS-08) | Integration | T0 | MVP | US-03-09-AC4 |
| TS-03-062 | Deactivation records reason and audit, then blocks new transaction use | Integration | T1 | MVP | US-03-10-AC1 |
| TS-03-063 | Positive on-hand requires acknowledgement and stock remains visible | Integration | T1 | MVP | US-03-10-AC2 |
| TS-03-064 | Reactivate and hard-delete referenced/unreferenced medicines | Integration | T1 | MVP | US-03-10-AC3 |
| TS-03-065 | Missing permission returns 403 and foreign medicine returns 404 (CS-08) | Integration | T0 | MVP | US-03-10-AC4 |
| TS-03-066 | Search names, ingredients, codes, barcodes and active/inactive filter | Integration | T1 | MVP | US-03-11-AC1 |
| TS-03-067 | Arabic, Arabic-Indic digit, Latin case and whitespace normalization plus ranking tiers | Unit | T1 | MVP | US-03-11-AC2 |
| TS-03-068 | p95 ≤ 300 ms at 50,000 medicines and effective Branch price | Performance | T1 | MVP | US-03-11-AC3 |
| TS-03-069 | Missing permission and other-Branch query return 403; tenant result set is isolated (CS-07, CS-08) | Integration | T0 | MVP | US-03-11-AC4 |
| TS-03-070 | List filters, descendant categories, sorting, and pagination totals | Integration | T1 | MVP | US-03-12-AC1 |
| TS-03-071 | Details include composition, barcode, price, alternatives, and storage | Integration | T1 | MVP | US-03-12-AC2 |
| TS-03-072 | Cost fields appear only with `catalog.costs.read` | Integration | T1 | MVP | US-03-12-AC3 |
| TS-03-073 | Missing permission returns 403 and foreign medicine returns 404 (CS-08) | Integration | T0 | MVP | US-03-12-AC4 |
| TS-03-074 | Bidirectional link and unlink of active medicines | Integration | T2 | V1 | US-03-13-AC1 |
| TS-03-075 | Self, inactive, duplicate, and 20-link boundary failures | Integration | T2 | V1 | US-03-13-AC2 |
| TS-03-076 | Suggestions match dosage form and full ingredient composition | Integration | T2 | V1 | US-03-13-AC3 |
| TS-03-077 | Missing permission returns 403 and foreign target returns 404 (CS-08) | Integration | T1 | V1 | US-03-13-AC4 |
| TS-03-078 | CSV and XLSX templates have supported headers, sample, and UTF-8 BOM | Integration | T2 | V1 | US-03-14-AC1 |
| TS-03-079 | Dry-run reports all row outcomes and leaves catalog unchanged | Integration | T2 | V1 | US-03-14-AC2 |
| TS-03-080 | Reference resolution and price/cost/classification permission gates | Integration | T2 | V1 | US-03-14-AC3 |
| TS-03-081 | Missing permission returns 403 and foreign job returns 404 (CS-08) | Integration | T1 | V1 | US-03-14-AC4 |
| TS-03-082 | Valid commit returns 202 and job status/report remain available for 30 days | Integration | T2 | V1 | US-03-15-AC1 |
| TS-03-083 | AllOrNothing rollback and SkipInvalid valid-row commit behavior | Integration | T2 | V1 | US-03-15-AC2 |
| TS-03-084 | Same idempotency key/request replays one job; identical data causes no duplicate side effects (CS-11) | Concurrency | T1 | V1 | US-03-15-AC3 |
| TS-03-085 | Key hash conflict 422, missing permission 403, foreign job 404 | Integration | T2 | V1 | US-03-15-AC4 |
| TS-03-086 | CSV/XLSX direct export with filters at 5,000 rows | Integration | T2 | V1 | US-03-16-AC1 |
| TS-03-087 | 5,001-row export returns job and a 15-minute signed link | Integration | T2 | V1 | US-03-16-AC2 |
| TS-03-088 | Cost permission omission and formula-leading cell neutralization | Integration | T2 | V1 | US-03-16-AC3 |
| TS-03-089 | Missing permission returns 403 and foreign job returns 404 | Integration | T2 | V1 | US-03-16-AC4 |
| TS-03-090 | Prefix, sequence, check digit, Format, and Source are correct | Integration | T3 | Future | US-03-17-AC1 |
| TS-03-091 | Parallel generation creates distinct organization-unique codes | Concurrency | T3 | Future | US-03-17-AC2 |
| TS-03-092 | Sequence exhaustion, invalid prefix, and barcode limit are rejected | Integration | T3 | Future | US-03-17-AC3 |
| TS-03-093 | Missing permission returns 403 and foreign medicine returns 404 (CS-08) | Integration | T3 | Future | US-03-17-AC4 |
| TS-03-094 | Both label sizes include required names, strength, form, price, barcode, and local print date | Integration | T3 | Future | US-03-18-AC1 |
| TS-03-095 | EAN-13 vs Code 128 selection and branch effective price | Integration | T3 | Future | US-03-18-AC2 |
| TS-03-096 | Other Branch 403, inactive medicine and label count limits | Integration | T3 | Future | US-03-18-AC3 |
| TS-03-097 | Foreign Organization identifiers return concealed 404 (CS-08) | Integration | T3 | Future | US-03-18-AC4 |
| TS-03-098 | Resolve by medicine id/barcode with all effective sale and reorder fields | Integration | T1 | MVP | US-03-19-AC1 |
| TS-03-099 | Later receipt updates cost, duplicate event is ignored, older event does not overwrite | Integration | T1 | MVP | US-03-19-AC2 |
| TS-03-100 | Create/update/status/price/classification events share transaction with outbox | Integration | T1 | MVP | US-03-19-AC3 |
| TS-03-101 | Cost omission, cross-Branch 403, and cross-Organization 404 (CS-07, CS-08) | Integration | T0 | MVP | US-03-19-AC4 |

---

## US-03-01: Manage manufacturers, active ingredients, and dosage forms

### TS-03-001: Create manufacturer with valid data returns 201 + ETag

| Field | Value |
|---|---|
| Story | [US-03-01](../stories/EPIC-03-MEDICINE-CATALOG/US-03-01-manage-manufacturers-ingredients-dosage-forms.md) — Manage manufacturers, active ingredients, and dosage forms |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-01-AC1 |
| Requirements | FR-03-001, FR-03-002, FR-03-003, FR-03-004, FR-03-045 |

**Story preconditions**
- The user is authenticated and belongs to an organization.
- On organization creation, the dosage-form seed list (SPEC-03 §8.4) has been inserted.

**US-03-01-AC1 — Create manufacturer**

*Preconditions / test data*
1. a user with `catalog.reference-data.manage`

*Steps*
1. they POST `/api/v1/catalog/manufacturers` with `nameEn = "Pharco"`, `nameAr = "فاركو"`, `countryCode = "EG"`

*Expected results*
1. the response is 201 with the created manufacturer, `isActive = true`, and an `ETag` header.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-002: Normalized-name collision for Latin case/whitespace and Arabic variants

| Field | Value |
|---|---|
| Story | [US-03-01](../stories/EPIC-03-MEDICINE-CATALOG/US-03-01-manage-manufacturers-ingredients-dosage-forms.md) — Manage manufacturers, active ingredients, and dosage forms |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-01-AC2 |
| Requirements | FR-03-001, FR-03-002, FR-03-003, FR-03-004, FR-03-045 |

**Story preconditions**
- The user is authenticated and belongs to an organization.
- On organization creation, the dosage-form seed list (SPEC-03 §8.4) has been inserted.

**US-03-01-AC2 — Duplicate name after normalization is rejected**

*Preconditions / test data*
1. an active ingredient `Paracetamol` exists in the organization

*Steps*
1. the user creates an active ingredient with `nameEn = "  PARACETAMOL "`

*Expected results*
1. the response is 409 `CATALOG.NAME_DUPLICATE` and no row is created.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-003: New organization has 19 seeded dosage forms with ar/en names

| Field | Value |
|---|---|
| Story | [US-03-01](../stories/EPIC-03-MEDICINE-CATALOG/US-03-01-manage-manufacturers-ingredients-dosage-forms.md) — Manage manufacturers, active ingredients, and dosage forms |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-01-AC3 |
| Requirements | FR-03-001, FR-03-002, FR-03-003, FR-03-004, FR-03-045 |

**Story preconditions**
- The user is authenticated and belongs to an organization.
- On organization creation, the dosage-form seed list (SPEC-03 §8.4) has been inserted.

**US-03-01-AC3 — Dosage forms are seeded per organization**

*Preconditions / test data*
1. a newly created organization

*Steps*
1. a user with `catalog.medicines.read` GETs `/api/v1/catalog/dosage-forms`

*Expected results*
1. the 19 seeded dosage forms of SPEC-03 §8.4 are returned with `isSeeded = true`, `isActive = true`, and both `nameEn` and `nameAr` populated.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-004: Assigning deactivated manufacturer to new medicine rejected; existing reference retained

| Field | Value |
|---|---|
| Story | [US-03-01](../stories/EPIC-03-MEDICINE-CATALOG/US-03-01-manage-manufacturers-ingredients-dosage-forms.md) — Manage manufacturers, active ingredients, and dosage forms |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-01-AC4 |
| Requirements | FR-03-001, FR-03-002, FR-03-003, FR-03-004, FR-03-045 |

**Story preconditions**
- The user is authenticated and belongs to an organization.
- On organization creation, the dosage-form seed list (SPEC-03 §8.4) has been inserted.

**US-03-01-AC4 — Inactive reference data cannot be newly assigned**

*Preconditions / test data*
1. manufacturer M is deactivated and medicine X already references M

*Steps*
1. a user creates a new medicine with `manufacturerId = M`

*Expected results*
1. the response is 400 with field error `CATALOG.REFERENCE_DATA_INACTIVE` on `manufacturerId`, and medicine X still returns `manufacturerId = M` on GET.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-005: Delete referenced vs unreferenced ingredient

| Field | Value |
|---|---|
| Story | [US-03-01](../stories/EPIC-03-MEDICINE-CATALOG/US-03-01-manage-manufacturers-ingredients-dosage-forms.md) — Manage manufacturers, active ingredients, and dosage forms |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-01-AC5 |
| Requirements | FR-03-001, FR-03-002, FR-03-003, FR-03-004, FR-03-045 |

**Story preconditions**
- The user is authenticated and belongs to an organization.
- On organization creation, the dosage-form seed list (SPEC-03 §8.4) has been inserted.

**US-03-01-AC5 — Delete only when unreferenced**

*Preconditions / test data*
1. active ingredient I is used by one medicine and active ingredient J is used by none

*Steps*
1. the user DELETEs I and then J

*Expected results*
1. deleting I returns 409 `CATALOG.REFERENCE_DATA_IN_USE` and deleting J returns 204.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-006: Cashier write attempts on all three resources return 403

| Field | Value |
|---|---|
| Story | [US-03-01](../stories/EPIC-03-MEDICINE-CATALOG/US-03-01-manage-manufacturers-ingredients-dosage-forms.md) — Manage manufacturers, active ingredients, and dosage forms |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-01-AC6 |
| Requirements | FR-03-001, FR-03-002, FR-03-003, FR-03-004, FR-03-045 |

**Story preconditions**
- The user is authenticated and belongs to an organization.
- On organization creation, the dosage-form seed list (SPEC-03 §8.4) has been inserted.

**US-03-01-AC6 — Permission denied**

*Preconditions / test data*
1. a Cashier without `catalog.reference-data.manage`

*Steps*
1. they POST `/api/v1/catalog/manufacturers`

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN` and no row is created.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-007: Cross-organization GET/PUT/DELETE return 404 with body identical to non-existent id (CS-08)

| Field | Value |
|---|---|
| Story | [US-03-01](../stories/EPIC-03-MEDICINE-CATALOG/US-03-01-manage-manufacturers-ingredients-dosage-forms.md) — Manage manufacturers, active ingredients, and dosage forms |
| Type / Execution | Integration / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-03-01-AC7 |
| Critical scenario | CS-08 |
| Requirements | FR-03-001, FR-03-002, FR-03-003, FR-03-004, FR-03-045 |

**Story preconditions**
- The user is authenticated and belongs to an organization.
- On organization creation, the dosage-form seed list (SPEC-03 §8.4) has been inserted.

**US-03-01-AC7 — Cross-organization access**

*Preconditions / test data*
1. manufacturer M belongs to organization B

*Steps*
1. a user of organization A with `catalog.reference-data.manage` PUTs `/api/v1/catalog/manufacturers/{M}`

*Expected results*
1. the response is 404 `CATALOG.REFERENCE_DATA_NOT_FOUND`, identical to the response for a random non-existent id (CS-08).

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-03-02: Manage hierarchical medicine categories

### TS-03-008: Create L1/L2/L3 and read tree

| Field | Value |
|---|---|
| Story | [US-03-02](../stories/EPIC-03-MEDICINE-CATALOG/US-03-02-manage-hierarchical-categories.md) — Manage hierarchical medicine categories |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-02-AC1 |
| Requirements | FR-03-004, FR-03-005, FR-03-030, FR-03-045 |

**Story preconditions**
- The user is authenticated with `catalog.reference-data.manage`.

**US-03-02-AC1 — Create a three-level path**

*Preconditions / test data*
1. no categories exist

*Steps*
1. the user creates `Pain relief` (no parent), then `Analgesics` under it, then `Combinations` under `Analgesics`

*Expected results*
1. each returns 201 with `level` 1, 2, and 3 respectively, and GET `/api/v1/catalog/categories/tree` returns the nested structure.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-009: Depth validation on create and on subtree move

| Field | Value |
|---|---|
| Story | [US-03-02](../stories/EPIC-03-MEDICINE-CATALOG/US-03-02-manage-hierarchical-categories.md) — Manage hierarchical medicine categories |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-02-AC2, US-03-02-AC3 |
| Requirements | FR-03-004, FR-03-005, FR-03-030, FR-03-045 |

**Story preconditions**
- The user is authenticated with `catalog.reference-data.manage`.

**US-03-02-AC2 — Fourth level rejected**

*Preconditions / test data*
1. the level-3 category `Combinations`

*Steps*
1. the user creates a category with `parentId = Combinations`

*Expected results*
1. the response is 422 `CATALOG.CATEGORY_DEPTH_EXCEEDED` and no row is created.

**US-03-02-AC3 — Move creating a cycle or excessive depth rejected**

*Preconditions / test data*
1. `Pain relief` (L1) > `Analgesics` (L2), and a separate L1 `Cold & Flu` with child `Decongestants` (L2)

*Steps*
1. the user moves `Pain relief` under `Analgesics`, and separately moves `Cold & Flu` under `Analgesics`

*Expected results*
1. the first returns 422 `CATALOG.CATEGORY_CYCLE` and the second returns 422 `CATALOG.CATEGORY_DEPTH_EXCEEDED` (its child would become level 4).

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-010: Cycle detection on move (self, child, grandchild as new parent)

| Field | Value |
|---|---|
| Story | [US-03-02](../stories/EPIC-03-MEDICINE-CATALOG/US-03-02-manage-hierarchical-categories.md) — Manage hierarchical medicine categories |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-02-AC3 |
| Requirements | FR-03-004, FR-03-005, FR-03-030, FR-03-045 |

**Story preconditions**
- The user is authenticated with `catalog.reference-data.manage`.

**US-03-02-AC3 — Move creating a cycle or excessive depth rejected**

*Preconditions / test data*
1. `Pain relief` (L1) > `Analgesics` (L2), and a separate L1 `Cold & Flu` with child `Decongestants` (L2)

*Steps*
1. the user moves `Pain relief` under `Analgesics`, and separately moves `Cold & Flu` under `Analgesics`

*Expected results*
1. the first returns 422 `CATALOG.CATEGORY_CYCLE` and the second returns 422 `CATALOG.CATEGORY_DEPTH_EXCEEDED` (its child would become level 4).

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-011: Sibling uniqueness vs same name under different parent

| Field | Value |
|---|---|
| Story | [US-03-02](../stories/EPIC-03-MEDICINE-CATALOG/US-03-02-manage-hierarchical-categories.md) — Manage hierarchical medicine categories |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-02-AC4 |
| Requirements | FR-03-004, FR-03-005, FR-03-030, FR-03-045 |

**Story preconditions**
- The user is authenticated with `catalog.reference-data.manage`.

**US-03-02-AC4 — Sibling name uniqueness**

*Preconditions / test data*
1. `Analgesics` exists under `Pain relief`

*Steps*
1. the user creates `ANALGESICS` under `Pain relief`, and `Analgesics` under `Cold & Flu`

*Expected results*
1. the first returns 409 `CATALOG.NAME_DUPLICATE` and the second returns 201.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-012: Deactivation blocked by active child, then allowed

| Field | Value |
|---|---|
| Story | [US-03-02](../stories/EPIC-03-MEDICINE-CATALOG/US-03-02-manage-hierarchical-categories.md) — Manage hierarchical medicine categories |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-02-AC5 |
| Requirements | FR-03-004, FR-03-005, FR-03-030, FR-03-045 |

**Story preconditions**
- The user is authenticated with `catalog.reference-data.manage`.

**US-03-02-AC5 — Deactivation blocked by active children**

*Preconditions / test data*
1. `Pain relief` has the active child `Analgesics`

*Steps*
1. the user POSTs `/api/v1/catalog/categories/{PainRelief}/deactivate`

*Expected results*
1. the response is 409 `CATALOG.CATEGORY_HAS_ACTIVE_CHILDREN`
2. after deactivating `Analgesics` and its children first, the same call returns 200.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-013: Category filter returns descendants only

| Field | Value |
|---|---|
| Story | [US-03-02](../stories/EPIC-03-MEDICINE-CATALOG/US-03-02-manage-hierarchical-categories.md) — Manage hierarchical medicine categories |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-02-AC6 |
| Requirements | FR-03-004, FR-03-005, FR-03-030, FR-03-045 |

**Story preconditions**
- The user is authenticated with `catalog.reference-data.manage`.

**US-03-02-AC6 — Filter includes descendants**

*Preconditions / test data*
1. medicine A in `Pain relief`, B in `Analgesics`, C in `Combinations`, D in `Cold & Flu`

*Steps*
1. a user GETs `/api/v1/catalog/medicines?categoryId={PainRelief}`

*Expected results*
1. exactly A, B, and C are returned.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-014: 403 for Cashier write; 404 cross-organization (CS-08)

| Field | Value |
|---|---|
| Story | [US-03-02](../stories/EPIC-03-MEDICINE-CATALOG/US-03-02-manage-hierarchical-categories.md) — Manage hierarchical medicine categories |
| Type / Execution | Integration / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-03-02-AC7 |
| Critical scenario | CS-08 |
| Requirements | FR-03-004, FR-03-005, FR-03-030, FR-03-045 |

**Story preconditions**
- The user is authenticated with `catalog.reference-data.manage`.

**US-03-02-AC7 — Permission denied and cross-organization**

*Preconditions / test data*
1. a Cashier without `catalog.reference-data.manage`, and a category K of another organization

*Steps*
1. the Cashier creates a category, and an authorized user of this organization GETs `/api/v1/catalog/categories/{K}`

*Expected results*
1. the first returns 403 `COMMON.FORBIDDEN` and the second returns 404 `CATALOG.REFERENCE_DATA_NOT_FOUND`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-03-03: Manage tax categories

### TS-03-015: Create category + audit row in same transaction

| Field | Value |
|---|---|
| Story | [US-03-03](../stories/EPIC-03-MEDICINE-CATALOG/US-03-03-manage-tax-categories.md) — Manage tax categories |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-03-AC1 |
| Requirements | FR-03-006, FR-03-044, FR-03-045 |

**Story preconditions**
- The organization was created with the seeded `DEFAULT` tax category (0.00%, `requiresReview = true`) set as `DefaultTaxCategoryId`.

**US-03-03-AC1 — Create tax category**

*Preconditions / test data*
1. an Owner with `settings.organization.manage`

*Steps*
1. they POST `/api/v1/catalog/tax-categories` with `code = "STD14"`, `nameEn = "Standard 14%"`, `nameAr = "قياسي 14%"`, `ratePercent = 14.00`

*Expected results*
1. the response is 201, the category is active, and an audit entry `TaxCategoryCreated` is written in the same transaction.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-016: Rate change returns new ETag and value; audit old/new; no other tables touched

| Field | Value |
|---|---|
| Story | [US-03-03](../stories/EPIC-03-MEDICINE-CATALOG/US-03-03-manage-tax-categories.md) — Manage tax categories |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-03-AC2 |
| Requirements | FR-03-006, FR-03-044, FR-03-045 |

**Story preconditions**
- The organization was created with the seeded `DEFAULT` tax category (0.00%, `requiresReview = true`) set as `DefaultTaxCategoryId`.

**US-03-03-AC2 — Rate change is prospective and audited**

*Preconditions / test data*
1. tax category `STD14` at 14.00%

*Steps*
1. the Owner changes `STD14.ratePercent` to 10.00 with a valid `If-Match`

*Expected results*
1. the response is 200 with a new `ETag`, GET returns 10.00, an audit entry records old 14.00 and new 10.00 in the same transaction, and no existing row outside `catalog.tax_categories` and the audit log is modified (completed-sale tax snapshots are untouched, BR-G-20
2. end-to-end check in EPIC-06).

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-017: Deactivating default category returns 409

| Field | Value |
|---|---|
| Story | [US-03-03](../stories/EPIC-03-MEDICINE-CATALOG/US-03-03-manage-tax-categories.md) — Manage tax categories |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-03-AC3 |
| Requirements | FR-03-006, FR-03-044, FR-03-045 |

**Story preconditions**
- The organization was created with the seeded `DEFAULT` tax category (0.00%, `requiresReview = true`) set as `DefaultTaxCategoryId`.

**US-03-03-AC3 — Default category cannot be deactivated**

*Preconditions / test data*
1. `DEFAULT` is the organization's `DefaultTaxCategoryId`

*Steps*
1. the Owner POSTs `/api/v1/catalog/tax-categories/{DEFAULT}/deactivate`

*Expected results*
1. the response is 409 `CATALOG.TAX_CATEGORY_IS_DEFAULT` and the category remains active.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-018: Rate boundaries 0.00, 100.00 accepted; 100.01, -0.01, 5.555 rejected

| Field | Value |
|---|---|
| Story | [US-03-03](../stories/EPIC-03-MEDICINE-CATALOG/US-03-03-manage-tax-categories.md) — Manage tax categories |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-03-AC4 |
| Requirements | FR-03-006, FR-03-044, FR-03-045 |

**Story preconditions**
- The organization was created with the seeded `DEFAULT` tax category (0.00%, `requiresReview = true`) set as `DefaultTaxCategoryId`.

**US-03-03-AC4 — Rate out of range rejected**

*Preconditions / test data*
1. an Owner

*Steps*
1. they create a tax category with `ratePercent = 100.01` or `ratePercent = 5.555`

*Expected results*
1. the response is 400 `COMMON.VALIDATION_FAILED` with `COMMON.OUT_OF_RANGE` on `ratePercent`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-019: Set default to active category succeeds with audit; inactive category rejected

| Field | Value |
|---|---|
| Story | [US-03-03](../stories/EPIC-03-MEDICINE-CATALOG/US-03-03-manage-tax-categories.md) — Manage tax categories |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-03-AC5 |
| Requirements | FR-03-006, FR-03-044, FR-03-045 |

**Story preconditions**
- The organization was created with the seeded `DEFAULT` tax category (0.00%, `requiresReview = true`) set as `DefaultTaxCategoryId`.

**US-03-03-AC5 — Set the default tax category**

*Preconditions / test data*
1. active category `STD14` and inactive category `OLD5`

*Steps*
1. the Owner POSTs `/api/v1/catalog/tax-categories/{STD14}/set-default`, then POSTs the same for `OLD5`

*Expected results*
1. the first returns 200, `OrganizationSettings.DefaultTaxCategoryId = STD14`, and an audit entry is written
2. the second returns 422 `CATALOG.REFERENCE_DATA_INACTIVE` and the default remains `STD14`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-020: Manager write 403, read 200; cross-organization 404

| Field | Value |
|---|---|
| Story | [US-03-03](../stories/EPIC-03-MEDICINE-CATALOG/US-03-03-manage-tax-categories.md) — Manage tax categories |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-03-AC6, US-03-03-AC7 |
| Requirements | FR-03-006, FR-03-044, FR-03-045 |

**Story preconditions**
- The organization was created with the seeded `DEFAULT` tax category (0.00%, `requiresReview = true`) set as `DefaultTaxCategoryId`.

**US-03-03-AC6 — Permission denied**

*Preconditions / test data*
1. a Branch Manager without `settings.organization.manage`

*Steps*
1. they PUT `/api/v1/catalog/tax-categories/{STD14}`

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN` and the rate is unchanged
2. GET `/api/v1/catalog/tax-categories` by the same user returns 200.

**US-03-03-AC7 — Cross-organization**

*Preconditions / test data*
1. tax category T of another organization

*Steps*
1. the Owner GETs or PUTs `/api/v1/catalog/tax-categories/{T}`

*Expected results*
1. the response is 404 `CATALOG.REFERENCE_DATA_NOT_FOUND`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-03-04: Create and update a medicine

### TS-03-021: Create with defaults: code, class, tax category, price, history `Initial`, audit — all in one transaction

| Field | Value |
|---|---|
| Story | [US-03-04](../stories/EPIC-03-MEDICINE-CATALOG/US-03-04-create-and-update-medicine.md) — Create and update a medicine |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-04-AC1 |
| Requirements | FR-03-007, FR-03-008, FR-03-009, FR-03-010, FR-03-011, FR-03-012, FR-03-018, FR-03-024, FR-03-045 |

**Story preconditions**
- At least one active category, dosage form, and tax category exist.
- `IMedicineStockProbe` is available (stub returning "no stock" until EPIC-04 delivers; SPEC-03 §8.1).

**US-03-04-AC1 — Create medicine with generated code**

*Preconditions / test data*
1. a Pharmacist with `catalog.medicines.create` and no medicines in the organization

*Steps*
1. they POST `/api/v1/catalog/medicines` with `tradeNameEn = "Panadol Extra"`, valid category/dosage form, `packSize = 24`, `baseUnitNameEn = "tablet"`, `price.packPrice = 72.00`, no `code`, no `prescriptionClass`, no `taxCategoryId`

*Expected results*
1. the response is 201 with `Location`, `ETag`, `code = "MED-000001"`, `status = "Active"`, `prescriptionClass = "PrescriptionOnly"`, `taxCategoryId` = organization `DefaultTaxCategoryId`
2. a `MedicinePrice` row (72.0000), a `MedicinePriceHistory` row with `changeType = "Initial"`, and a `MedicineCreated` audit entry exist in the same transaction.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-022: Duplicate code case-insensitive

| Field | Value |
|---|---|
| Story | [US-03-04](../stories/EPIC-03-MEDICINE-CATALOG/US-03-04-create-and-update-medicine.md) — Create and update a medicine |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-04-AC2 |
| Requirements | FR-03-007, FR-03-008, FR-03-009, FR-03-010, FR-03-011, FR-03-012, FR-03-018, FR-03-024, FR-03-045 |

**Story preconditions**
- At least one active category, dosage form, and tax category exist.
- `IMedicineStockProbe` is available (stub returning "no stock" until EPIC-04 delivers; SPEC-03 §8.1).

**US-03-04-AC2 — Duplicate code rejected**

*Preconditions / test data*
1. medicine `MED-000001` exists

*Steps*
1. the user creates a medicine with `code = "med-000001"`

*Expected results*
1. the response is 409 `CATALOG.CODE_DUPLICATE`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-023: ETag flow: 200 / 412 / 428

| Field | Value |
|---|---|
| Story | [US-03-04](../stories/EPIC-03-MEDICINE-CATALOG/US-03-04-create-and-update-medicine.md) — Create and update a medicine |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-04-AC3 |
| Requirements | FR-03-007, FR-03-008, FR-03-009, FR-03-010, FR-03-011, FR-03-012, FR-03-018, FR-03-024, FR-03-045 |

**Story preconditions**
- At least one active category, dosage form, and tax category exist.
- `IMedicineStockProbe` is available (stub returning "no stock" until EPIC-04 delivers; SPEC-03 §8.1).

**US-03-04-AC3 — Optimistic concurrency on update**

*Preconditions / test data*
1. medicine X with ETag `E1`

*Steps*
1. user A PUTs an update with `If-Match: E1` and then user B PUTs with `If-Match: E1`, and user C PUTs with no `If-Match`

*Expected results*
1. A receives 200 with a new ETag, B receives 412 `COMMON.CONCURRENCY_CONFLICT`, and C receives 428 `COMMON.PRECONDITION_REQUIRED`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-024: PackSize lock with stub probe returning on-hand, reserved, and zero

| Field | Value |
|---|---|
| Story | [US-03-04](../stories/EPIC-03-MEDICINE-CATALOG/US-03-04-create-and-update-medicine.md) — Create and update a medicine |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-04-AC4 |
| Requirements | FR-03-007, FR-03-008, FR-03-009, FR-03-010, FR-03-011, FR-03-012, FR-03-018, FR-03-024, FR-03-045 |

**Story preconditions**
- At least one active category, dosage form, and tax category exist.
- `IMedicineStockProbe` is available (stub returning "no stock" until EPIC-04 delivers; SPEC-03 §8.1).

**US-03-04-AC4 — PackSize change blocked while stock exists**

*Preconditions / test data*
1. medicine X with `packSize = 24` and the stock probe reports `OnHand = 10` in branch CAI01

*Steps*
1. the user PUTs X with `packSize = 20`

*Expected results*
1. the response is 409 `CATALOG.PACK_SIZE_CHANGE_BLOCKED`
2. when the probe reports zero on-hand and zero reserved in all branches, the same request returns 200 and a `PackSizeChanged` audit entry records 24 → 20.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-025: Storage fields and derived `isRefrigerated`

| Field | Value |
|---|---|
| Story | [US-03-04](../stories/EPIC-03-MEDICINE-CATALOG/US-03-04-create-and-update-medicine.md) — Create and update a medicine |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-04-AC5 |
| Requirements | FR-03-007, FR-03-008, FR-03-009, FR-03-010, FR-03-011, FR-03-012, FR-03-018, FR-03-024, FR-03-045 |

**Story preconditions**
- At least one active category, dosage form, and tax category exist.
- `IMedicineStockProbe` is available (stub returning "no stock" until EPIC-04 delivers; SPEC-03 §8.1).

**US-03-04-AC5 — Storage condition exposed**

*Preconditions / test data*
1. a medicine created with `storageCondition = "Refrigerated2To8C"` and `protectFromLight = true`

*Steps*
1. a user GETs it

*Expected results*
1. the response contains `isRefrigerated = true` and `protectFromLight = true`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-026: Field validation boundaries (packSize 1/10,000/10,001; minStock -1/0/1,000,000)

| Field | Value |
|---|---|
| Story | [US-03-04](../stories/EPIC-03-MEDICINE-CATALOG/US-03-04-create-and-update-medicine.md) — Create and update a medicine |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-04-AC6 |
| Requirements | FR-03-007, FR-03-008, FR-03-009, FR-03-010, FR-03-011, FR-03-012, FR-03-018, FR-03-024, FR-03-045 |

**Story preconditions**
- At least one active category, dosage form, and tax category exist.
- `IMedicineStockProbe` is available (stub returning "no stock" until EPIC-04 delivers; SPEC-03 §8.1).

**US-03-04-AC6 — Field validation**

*Preconditions / test data*
1. a create request with `packSize = 0`, `defaultMinStock = -1`, and `tradeNameEn` of 201 characters

*Steps*
1. it is submitted

*Expected results*
1. the response is 400 `COMMON.VALIDATION_FAILED` with `COMMON.OUT_OF_RANGE` on `packSize` and `defaultMinStock` and `COMMON.MAX_LENGTH` on `tradeNameEn`, and nothing is persisted.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-027: Possible-duplicate detection with normalization and `confirmDuplicate`

| Field | Value |
|---|---|
| Story | [US-03-04](../stories/EPIC-03-MEDICINE-CATALOG/US-03-04-create-and-update-medicine.md) — Create and update a medicine |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-04-AC7 |
| Requirements | FR-03-007, FR-03-008, FR-03-009, FR-03-010, FR-03-011, FR-03-012, FR-03-018, FR-03-024, FR-03-045 |

**Story preconditions**
- At least one active category, dosage form, and tax category exist.
- `IMedicineStockProbe` is available (stub returning "no stock" until EPIC-04 delivers; SPEC-03 §8.1).

**US-03-04-AC7 — Possible duplicate warning**

*Preconditions / test data*
1. an active medicine "Panadol Extra", dosage form `TABLET`, strength text "500 mg / 65 mg"

*Steps*
1. the user creates "PANADOL  extra" with the same dosage form and strength text, first without and then with `confirmDuplicate = true`

*Expected results*
1. the first returns 409 `CATALOG.POSSIBLE_DUPLICATE` listing the existing medicine's id, code, and name
2. the second returns 201.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-028: Classification at create with/without classify permission

| Field | Value |
|---|---|
| Story | [US-03-04](../stories/EPIC-03-MEDICINE-CATALOG/US-03-04-create-and-update-medicine.md) — Create and update a medicine |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-04-AC8 |
| Requirements | FR-03-007, FR-03-008, FR-03-009, FR-03-010, FR-03-011, FR-03-012, FR-03-018, FR-03-024, FR-03-045 |

**Story preconditions**
- At least one active category, dosage form, and tax category exist.
- `IMedicineStockProbe` is available (stub returning "no stock" until EPIC-04 delivers; SPEC-03 §8.1).

**US-03-04-AC8 — Classification requires classify permission**

*Preconditions / test data*
1. an Inventory Staff user with `catalog.medicines.create` but without `catalog.medicines.classify`

*Steps*
1. they create a medicine with `prescriptionClass = "OTC"`

*Expected results*
1. the response is 403 `CATALOG.CLASSIFY_PERMISSION_REQUIRED` and nothing is persisted
2. the same request with `prescriptionClass` omitted returns 201 with `PrescriptionOnly`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-029: Cashier create/update 403

| Field | Value |
|---|---|
| Story | [US-03-04](../stories/EPIC-03-MEDICINE-CATALOG/US-03-04-create-and-update-medicine.md) — Create and update a medicine |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-04-AC9 |
| Requirements | FR-03-007, FR-03-008, FR-03-009, FR-03-010, FR-03-011, FR-03-012, FR-03-018, FR-03-024, FR-03-045 |

**Story preconditions**
- At least one active category, dosage form, and tax category exist.
- `IMedicineStockProbe` is available (stub returning "no stock" until EPIC-04 delivers; SPEC-03 §8.1).

**US-03-04-AC9 — Permission denied**

*Preconditions / test data*
1. a Cashier with only `catalog.medicines.read`

*Steps*
1. they POST `/api/v1/catalog/medicines` or PUT `/api/v1/catalog/medicines/{id}`

*Expected results*
1. each returns 403 `COMMON.FORBIDDEN`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-030: Cross-organization medicine and body reference ids (CS-08)

| Field | Value |
|---|---|
| Story | [US-03-04](../stories/EPIC-03-MEDICINE-CATALOG/US-03-04-create-and-update-medicine.md) — Create and update a medicine |
| Type / Execution | Integration / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-03-04-AC10 |
| Critical scenario | CS-08 |
| Requirements | FR-03-007, FR-03-008, FR-03-009, FR-03-010, FR-03-011, FR-03-012, FR-03-018, FR-03-024, FR-03-045 |

**Story preconditions**
- At least one active category, dosage form, and tax category exist.
- `IMedicineStockProbe` is available (stub returning "no stock" until EPIC-04 delivers; SPEC-03 §8.1).

**US-03-04-AC10 — Cross-organization**

*Preconditions / test data*
1. medicine Y belongs to another organization

*Steps*
1. a Pharmacist GETs or PUTs `/api/v1/catalog/medicines/{Y}`, or creates a medicine with `categoryId` of the other organization

*Expected results*
1. GET/PUT return 404 `CATALOG.MEDICINE_NOT_FOUND`, and the create returns 400 with `CATALOG.REFERENCE_DATA_NOT_FOUND` on `categoryId` (CS-08).

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-031: 20 parallel creates without code produce 20 unique sequential codes

| Field | Value |
|---|---|
| Story | [US-03-04](../stories/EPIC-03-MEDICINE-CATALOG/US-03-04-create-and-update-medicine.md) — Create and update a medicine |
| Type / Execution | Concurrency / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-03-04-AC1 |
| Requirements | FR-03-007, FR-03-008, FR-03-009, FR-03-010, FR-03-011, FR-03-012, FR-03-018, FR-03-024, FR-03-045 |

**Story preconditions**
- At least one active category, dosage form, and tax category exist.
- `IMedicineStockProbe` is available (stub returning "no stock" until EPIC-04 delivers; SPEC-03 §8.1).

**US-03-04-AC1 — Create medicine with generated code**

*Preconditions / test data*
1. a Pharmacist with `catalog.medicines.create` and no medicines in the organization

*Steps*
1. they POST `/api/v1/catalog/medicines` with `tradeNameEn = "Panadol Extra"`, valid category/dosage form, `packSize = 24`, `baseUnitNameEn = "tablet"`, `price.packPrice = 72.00`, no `code`, no `prescriptionClass`, no `taxCategoryId`

*Expected results*
1. the response is 201 with `Location`, `ETag`, `code = "MED-000001"`, `status = "Active"`, `prescriptionClass = "PrescriptionOnly"`, `taxCategoryId` = organization `DefaultTaxCategoryId`
2. a `MedicinePrice` row (72.0000), a `MedicinePriceHistory` row with `changeType = "Initial"`, and a `MedicineCreated` audit entry exist in the same transaction.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-03-05: Define active-ingredient composition and strength

### TS-03-032: Replace composition, ordered rows, composed strength text

| Field | Value |
|---|---|
| Story | [US-03-05](../stories/EPIC-03-MEDICINE-CATALOG/US-03-05-define-active-ingredient-composition.md) — Define active-ingredient composition and strength |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-05-AC1 |
| Requirements | FR-03-013, FR-03-045 |

**Story preconditions**
- Medicine X exists; active ingredients `Paracetamol` and `Caffeine` exist and are active.

**US-03-05-AC1 — Replace composition and compose strength text**

*Preconditions / test data*
1. medicine X with empty `strengthText` and ETag `E1`

*Steps*
1. the Pharmacist PUTs `/api/v1/catalog/medicines/{X}/ingredients` with `If-Match: E1` and rows `[Paracetamol 500 mg (sortOrder 1), Caffeine 65 mg (sortOrder 2)]`

*Expected results*
1. the response is 200 with a new ETag, GET X returns the two rows in sort order, and `strengthText = "500 mg / 65 mg"`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-033: Strength-text composition keeps explicit text; decimal formatting

| Field | Value |
|---|---|
| Story | [US-03-05](../stories/EPIC-03-MEDICINE-CATALOG/US-03-05-define-active-ingredient-composition.md) — Define active-ingredient composition and strength |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-05-AC2 |
| Requirements | FR-03-013, FR-03-045 |

**Story preconditions**
- Medicine X exists; active ingredients `Paracetamol` and `Caffeine` exist and are active.

**US-03-05-AC2 — Explicit strength text is preserved**

*Preconditions / test data*
1. medicine X with `strengthText = "500/65 mg"`

*Steps*
1. the composition is replaced

*Expected results*
1. `strengthText` remains `"500/65 mg"`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-034: Duplicate ingredient rejected atomically

| Field | Value |
|---|---|
| Story | [US-03-05](../stories/EPIC-03-MEDICINE-CATALOG/US-03-05-define-active-ingredient-composition.md) — Define active-ingredient composition and strength |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-05-AC3 |
| Requirements | FR-03-013, FR-03-045 |

**Story preconditions**
- Medicine X exists; active ingredients `Paracetamol` and `Caffeine` exist and are active.

**US-03-05-AC3 — Duplicate ingredient rejected**

*Preconditions / test data*
1. medicine X

*Steps*
1. the request contains `Paracetamol 500 mg` and `Paracetamol 250 mg`

*Expected results*
1. the response is 400 `COMMON.VALIDATION_FAILED` with `CATALOG.INGREDIENT_DUPLICATE` and the previous composition is unchanged.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-035: Row limit, strength range, unit enum

| Field | Value |
|---|---|
| Story | [US-03-05](../stories/EPIC-03-MEDICINE-CATALOG/US-03-05-define-active-ingredient-composition.md) — Define active-ingredient composition and strength |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-05-AC4 |
| Requirements | FR-03-013, FR-03-045 |

**Story preconditions**
- Medicine X exists; active ingredients `Paracetamol` and `Caffeine` exist and are active.

**US-03-05-AC4 — Row limits and value validation**

*Preconditions / test data*
1. medicine X

*Steps*
1. the request contains 11 rows, or a row with `strengthValue = 0`, or `strengthUnit = "grams"`

*Expected results*
1. the response is 400 `COMMON.VALIDATION_FAILED` with `CATALOG.INGREDIENT_LIMIT_EXCEEDED`, `COMMON.OUT_OF_RANGE`, or `COMMON.INVALID_ENUM` respectively.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-036: Inactive ingredient rejected for new composition, retained on unrelated update

| Field | Value |
|---|---|
| Story | [US-03-05](../stories/EPIC-03-MEDICINE-CATALOG/US-03-05-define-active-ingredient-composition.md) — Define active-ingredient composition and strength |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-05-AC5 |
| Requirements | FR-03-013, FR-03-045 |

**Story preconditions**
- Medicine X exists; active ingredients `Paracetamol` and `Caffeine` exist and are active.

**US-03-05-AC5 — Inactive ingredient rejected**

*Preconditions / test data*
1. active ingredient `Phenylephrine` is deactivated

*Steps*
1. it is included in a new composition for X

*Expected results*
1. the response is 400 with `CATALOG.REFERENCE_DATA_INACTIVE`
2. medicines already containing `Phenylephrine` keep it when their other fields are updated.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-037: Empty composition accepted

| Field | Value |
|---|---|
| Story | [US-03-05](../stories/EPIC-03-MEDICINE-CATALOG/US-03-05-define-active-ingredient-composition.md) — Define active-ingredient composition and strength |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-05-AC6 |
| Requirements | FR-03-013, FR-03-045 |

**Story preconditions**
- Medicine X exists; active ingredients `Paracetamol` and `Caffeine` exist and are active.

**US-03-05-AC6 — Empty composition allowed**

*Preconditions / test data*
1. medicine X (a non-medicine item, OD-03-04) with two rows

*Steps*
1. the user PUTs an empty array

*Expected results*
1. the response is 200 and X has zero ingredient rows.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-038: 403 without update permission

| Field | Value |
|---|---|
| Story | [US-03-05](../stories/EPIC-03-MEDICINE-CATALOG/US-03-05-define-active-ingredient-composition.md) — Define active-ingredient composition and strength |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-05-AC7 |
| Requirements | FR-03-013, FR-03-045 |

**Story preconditions**
- Medicine X exists; active ingredients `Paracetamol` and `Caffeine` exist and are active.

**US-03-05-AC7 — Permission denied**

*Preconditions / test data*
1. a Cashier without `catalog.medicines.update`

*Steps*
1. they PUT `/api/v1/catalog/medicines/{X}/ingredients`

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-039: Cross-organization medicine and ingredient ids (CS-08)

| Field | Value |
|---|---|
| Story | [US-03-05](../stories/EPIC-03-MEDICINE-CATALOG/US-03-05-define-active-ingredient-composition.md) — Define active-ingredient composition and strength |
| Type / Execution | Integration / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-03-05-AC8 |
| Critical scenario | CS-08 |
| Requirements | FR-03-013, FR-03-045 |

**Story preconditions**
- Medicine X exists; active ingredients `Paracetamol` and `Caffeine` exist and are active.

**US-03-05-AC8 — Cross-organization**

*Preconditions / test data*
1. medicine Y and active ingredient Z of another organization

*Steps*
1. the Pharmacist PUTs ingredients for Y, or PUTs ingredients for X containing Z

*Expected results*
1. the first returns 404 `CATALOG.MEDICINE_NOT_FOUND`, the second 400 with `CATALOG.REFERENCE_DATA_NOT_FOUND`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-03-06: Manage medicine barcodes and barcode lookup

### TS-03-040: First barcode becomes primary with normalized code and audit

| Field | Value |
|---|---|
| Story | [US-03-06](../stories/EPIC-03-MEDICINE-CATALOG/US-03-06-manage-medicine-barcodes.md) — Manage medicine barcodes and barcode lookup |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-06-AC1 |
| Requirements | FR-03-014, FR-03-015, FR-03-016, FR-03-017, FR-03-044, FR-03-045 |

**Story preconditions**
- Medicine X exists and is visible to the user's organization.

**US-03-06-AC1 — Add a valid GTIN as first (primary) barcode**

*Preconditions / test data*
1. medicine X has no barcodes

*Steps*
1. the user POSTs `/api/v1/catalog/medicines/{X}/barcodes` with `code = "5901234123457"`, `format = "Gtin"`

*Expected results*
1. the response is 201, the barcode has `isPrimary = true`, `source = "Manual"`, `normalizedCode = "05901234123457"`, and a `BarcodeAdded` audit entry is written.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-041: GS1 mod-10 check digit for GTIN-8/12/13/14 (valid and invalid vectors)

| Field | Value |
|---|---|
| Story | [US-03-06](../stories/EPIC-03-MEDICINE-CATALOG/US-03-06-manage-medicine-barcodes.md) — Manage medicine barcodes and barcode lookup |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-06-AC2 |
| Requirements | FR-03-014, FR-03-015, FR-03-016, FR-03-017, FR-03-044, FR-03-045 |

**Story preconditions**
- Medicine X exists and is visible to the user's organization.

**US-03-06-AC2 — Invalid check digit rejected**

*Preconditions / test data*
1. medicine X

*Steps*
1. the user adds `code = "5901234123458"`, `format = "Gtin"`

*Expected results*
1. the response is 400 `COMMON.VALIDATION_FAILED` with `CATALOG.BARCODE_INVALID_CHECKSUM`
2. adding `"59012341234"` (11 digits) as `Gtin` returns `CATALOG.BARCODE_INVALID_FORMAT`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-042: Internal format character set and length 1/32/33

| Field | Value |
|---|---|
| Story | [US-03-06](../stories/EPIC-03-MEDICINE-CATALOG/US-03-06-manage-medicine-barcodes.md) — Manage medicine barcodes and barcode lookup |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-06-AC3 |
| Requirements | FR-03-014, FR-03-015, FR-03-016, FR-03-017, FR-03-044, FR-03-045 |

**Story preconditions**
- Medicine X exists and is visible to the user's organization.

**US-03-06-AC3 — Internal barcode format**

*Preconditions / test data*
1. medicine X

*Steps*
1. the user adds `code = "PH-0012"`, `format = "Internal"`, and separately `code = "PH 0012"`

*Expected results*
1. the first returns 201 and the second returns 400 with `CATALOG.BARCODE_INVALID_FORMAT`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-043: UPC-A vs EAN-13 equivalence, conflict with inactive medicine

| Field | Value |
|---|---|
| Story | [US-03-06](../stories/EPIC-03-MEDICINE-CATALOG/US-03-06-manage-medicine-barcodes.md) — Manage medicine barcodes and barcode lookup |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-06-AC4 |
| Requirements | FR-03-014, FR-03-015, FR-03-016, FR-03-017, FR-03-044, FR-03-045 |

**Story preconditions**
- Medicine X exists and is visible to the user's organization.

**US-03-06-AC4 — Uniqueness across medicines including UPC/EAN equivalence and inactive medicines**

*Preconditions / test data*
1. inactive medicine Y has GTIN `036000291452` (UPC-A)

*Steps*
1. the user adds `0036000291452` (EAN-13 form) to medicine X

*Expected results*
1. the response is 409 `CATALOG.BARCODE_DUPLICATE` with `conflictingMedicineId = Y` and `conflictingMedicineCode`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-044: Parallel insert of same code: one 201, one 409

| Field | Value |
|---|---|
| Story | [US-03-06](../stories/EPIC-03-MEDICINE-CATALOG/US-03-06-manage-medicine-barcodes.md) — Manage medicine barcodes and barcode lookup |
| Type / Execution | Concurrency / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-03-06-AC5 |
| Requirements | FR-03-014, FR-03-015, FR-03-016, FR-03-017, FR-03-044, FR-03-045 |

**Story preconditions**
- Medicine X exists and is visible to the user's organization.

**US-03-06-AC5 — Concurrent duplicate insert**

*Preconditions / test data*
1. medicines X and Z

*Steps*
1. two requests add the same GTIN to X and to Z concurrently

*Expected results*
1. exactly one returns 201 and the other returns 409 `CATALOG.BARCODE_DUPLICATE`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-045: Set primary, delete primary, oldest promoted, audits

| Field | Value |
|---|---|
| Story | [US-03-06](../stories/EPIC-03-MEDICINE-CATALOG/US-03-06-manage-medicine-barcodes.md) — Manage medicine barcodes and barcode lookup |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-06-AC6 |
| Requirements | FR-03-014, FR-03-015, FR-03-016, FR-03-017, FR-03-044, FR-03-045 |

**Story preconditions**
- Medicine X exists and is visible to the user's organization.

**US-03-06-AC6 — Primary management and removal**

*Preconditions / test data*
1. X has barcodes B1 (primary, oldest) and B2, B3

*Steps*
1. the user PUTs `/barcodes/{B3}/primary`, then DELETEs B3

*Expected results*
1. after the PUT only B3 is primary
2. after the DELETE (204) B1 (oldest remaining) is primary
3. both changes write audit entries.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-046: 11th barcode rejected

| Field | Value |
|---|---|
| Story | [US-03-06](../stories/EPIC-03-MEDICINE-CATALOG/US-03-06-manage-medicine-barcodes.md) — Manage medicine barcodes and barcode lookup |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-06-AC7 |
| Requirements | FR-03-014, FR-03-015, FR-03-016, FR-03-017, FR-03-044, FR-03-045 |

**Story preconditions**
- Medicine X exists and is visible to the user's organization.

**US-03-06-AC7 — Limit of 10 barcodes**

*Preconditions / test data*
1. X has 10 barcodes

*Steps*
1. the user adds an 11th

*Expected results*
1. the response is 422 `CATALOG.BARCODE_LIMIT_EXCEEDED`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-047: Lookup active, inactive (case-insensitive internal), miss

| Field | Value |
|---|---|
| Story | [US-03-06](../stories/EPIC-03-MEDICINE-CATALOG/US-03-06-manage-medicine-barcodes.md) — Manage medicine barcodes and barcode lookup |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-06-AC8 |
| Requirements | FR-03-014, FR-03-015, FR-03-016, FR-03-017, FR-03-044, FR-03-045 |

**Story preconditions**
- Medicine X exists and is visible to the user's organization.

**US-03-06-AC8 — Barcode lookup**

*Preconditions / test data*
1. X has GTIN `5901234123457` and Y (inactive) has internal `PH-0099`

*Steps*
1. a Cashier GETs `/api/v1/catalog/medicines/by-barcode/05901234123457`, then `/by-barcode/ph-0099`, then `/by-barcode/1111111111116`

*Expected results*
1. the first returns X with `status = "Active"`, the second returns Y with `status = "Inactive"`, and the third returns 404 `CATALOG.BARCODE_NOT_FOUND`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-048: 403 for add without update permission

| Field | Value |
|---|---|
| Story | [US-03-06](../stories/EPIC-03-MEDICINE-CATALOG/US-03-06-manage-medicine-barcodes.md) — Manage medicine barcodes and barcode lookup |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-06-AC9 |
| Requirements | FR-03-014, FR-03-015, FR-03-016, FR-03-017, FR-03-044, FR-03-045 |

**Story preconditions**
- Medicine X exists and is visible to the user's organization.

**US-03-06-AC9 — Permission denied**

*Preconditions / test data*
1. a Cashier without `catalog.medicines.update`

*Steps*
1. they POST a barcode to X

*Expected results*
1. the response is 403 `COMMON.FORBIDDEN`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-049: Cross-organization lookup 404 and per-organization uniqueness (CS-08)

| Field | Value |
|---|---|
| Story | [US-03-06](../stories/EPIC-03-MEDICINE-CATALOG/US-03-06-manage-medicine-barcodes.md) — Manage medicine barcodes and barcode lookup |
| Type / Execution | Integration / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-03-06-AC10 |
| Critical scenario | CS-08 |
| Requirements | FR-03-014, FR-03-015, FR-03-016, FR-03-017, FR-03-044, FR-03-045 |

**Story preconditions**
- Medicine X exists and is visible to the user's organization.

**US-03-06-AC10 — Cross-organization**

*Preconditions / test data*
1. medicine W of another organization has barcode `4006381333931`

*Steps*
1. a user of this organization looks up `4006381333931`, or adds that same code to X

*Expected results*
1. the lookup returns 404 `CATALOG.BARCODE_NOT_FOUND` and the add returns 201 (uniqueness is per organization), with no data of W revealed.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-03-07: Manage organization selling price with history

### TS-03-050: Change price writes current price, append-only history, audit, and outbox atomically

| Field | Value |
|---|---|
| Story | [US-03-07](../stories/EPIC-03-MEDICINE-CATALOG/US-03-07-manage-organization-selling-price.md) — Manage organization selling price with history |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-07-AC1 |
| Requirements | FR-03-018, FR-03-019, FR-03-020, FR-03-021, FR-03-044, FR-03-045 |

**Story preconditions**
- The medicine has an initial organization default pack price.
- The caller has organization-wide scope and `catalog.prices.update`.

**US-03-07-AC1 — Change organization default price**

*Preconditions / test data*
1. a medicine with current pack price and `AllowSplitPack` settings

*Steps*
1. an authorized user submits a new pack price, optional valid base-unit price, reason, and current `If-Match`

*Expected results*
1. the current price is updated, immutable price history and audit are written in the same transaction, and a `MedicinePriceChanged` event is published through the outbox.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-051: Large-change confirmation, ETag handling, and newest-first history

| Field | Value |
|---|---|
| Story | [US-03-07](../stories/EPIC-03-MEDICINE-CATALOG/US-03-07-manage-organization-selling-price.md) — Manage organization selling price with history |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-07-AC2 |
| Requirements | FR-03-018, FR-03-019, FR-03-020, FR-03-021, FR-03-044, FR-03-045 |

**Story preconditions**
- The medicine has an initial organization default pack price.
- The caller has organization-wide scope and `catalog.prices.update`.

**US-03-07-AC2 — Confirm large changes and preserve history**

*Preconditions / test data*
1. an organization price change exceeds `PriceChangeConfirmThresholdPercent`

*Steps*
1. the request omits `confirmLargeChange` or supplies a stale ETag

*Expected results*
1. the former returns 422 `CATALOG.PRICE_CHANGE_CONFIRMATION_REQUIRED`, the latter returns 412, and neither changes price or history
2. a confirmed change succeeds and history is newest first.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-052: Missing permission and non-wide scope both return 403 without mutation

| Field | Value |
|---|---|
| Story | [US-03-07](../stories/EPIC-03-MEDICINE-CATALOG/US-03-07-manage-organization-selling-price.md) — Manage organization selling price with history |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-07-AC3 |
| Requirements | FR-03-018, FR-03-019, FR-03-020, FR-03-021, FR-03-044, FR-03-045 |

**Story preconditions**
- The medicine has an initial organization default pack price.
- The caller has organization-wide scope and `catalog.prices.update`.

**US-03-07-AC3 — Deny missing scope and permission**

*Preconditions / test data*
1. a caller with `catalog.prices.update` but no organization-wide scope, or a caller lacking that permission

*Steps*
1. either attempts to change the organization default

*Expected results*
1. each request returns 403 `COMMON.FORBIDDEN` and no price is changed.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-053: Other-Organization price history/update returns 404 (CS-08)

| Field | Value |
|---|---|
| Story | [US-03-07](../stories/EPIC-03-MEDICINE-CATALOG/US-03-07-manage-organization-selling-price.md) — Manage organization selling price with history |
| Type / Execution | Integration / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-03-07-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-03-018, FR-03-019, FR-03-020, FR-03-021, FR-03-044, FR-03-045 |

**Story preconditions**
- The medicine has an initial organization default pack price.
- The caller has organization-wide scope and `catalog.prices.update`.

**US-03-07-AC4 — Conceal a medicine from another Organization**

*Preconditions / test data*
1. a medicine owned by another Organization

*Steps*
1. the caller requests its price history or attempts a price update

*Expected results*
1. the response is 404 `CATALOG.MEDICINE_NOT_FOUND`, identical in shape to a missing medicine.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-03-08: Manage branch price overrides

### TS-03-054: Set Branch A override and verify Branch B remains on organization default

| Field | Value |
|---|---|
| Story | [US-03-08](../stories/EPIC-03-MEDICINE-CATALOG/US-03-08-branch-price-override.md) — Manage branch price overrides |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-03-08-AC1 |
| Requirements | FR-03-021, FR-03-022, FR-03-023, FR-03-044, FR-03-045 |

**Story preconditions**
- `AllowBranchPriceOverride` is ON.
- The actor has `catalog.prices.update` and is assigned to the Branch.

**US-03-08-AC1 — Set a branch override**

*Preconditions / test data*
1. a medicine with an organization default and an assigned Branch

*Steps*
1. the manager sets a valid override with a reason and current `If-Match`

*Expected results*
1. the branch price becomes the effective price, history/audit/outbox are written atomically, and other branches remain unchanged.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-055: Remove override and verify fallback plus immutable sales snapshots

| Field | Value |
|---|---|
| Story | [US-03-08](../stories/EPIC-03-MEDICINE-CATALOG/US-03-08-branch-price-override.md) — Manage branch price overrides |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | MVP |
| Covers | US-03-08-AC2 |
| Requirements | FR-03-021, FR-03-022, FR-03-023, FR-03-044, FR-03-045 |

**Story preconditions**
- `AllowBranchPriceOverride` is ON.
- The actor has `catalog.prices.update` and is assigned to the Branch.

**US-03-08-AC2 — Remove override and resolve fallback**

*Preconditions / test data*
1. a Branch has a price override

*Steps*
1. an authorized manager removes it with a reason

*Expected results*
1. the effective price immediately reverts to the organization default, history records the removal, and completed sales remain unchanged.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-056: Other-Branch request returns 403 (CS-07); disabled setting returns 409

| Field | Value |
|---|---|
| Story | [US-03-08](../stories/EPIC-03-MEDICINE-CATALOG/US-03-08-branch-price-override.md) — Manage branch price overrides |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P1) |
| Release | MVP |
| Covers | US-03-08-AC3 |
| Critical scenario | CS-07 |
| Requirements | FR-03-021, FR-03-022, FR-03-023, FR-03-044, FR-03-045 |

**Story preconditions**
- `AllowBranchPriceOverride` is ON.
- The actor has `catalog.prices.update` and is assigned to the Branch.

**US-03-08-AC3 — Deny another Branch and disabled override setting**

*Preconditions / test data*
1. a manager assigned to Branch A but not Branch B, and an organization with overrides disabled

*Steps*
1. they change Branch B's price, or attempt any override while the setting is OFF

*Expected results*
1. the first request returns 403 `COMMON.FORBIDDEN` (CS-07), the second returns 409 `CATALOG.BRANCH_PRICE_OVERRIDE_DISABLED`, and no price changes.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-057: Cross-Organization Branch/medicine access returns concealed 404 (CS-08)

| Field | Value |
|---|---|
| Story | [US-03-08](../stories/EPIC-03-MEDICINE-CATALOG/US-03-08-branch-price-override.md) — Manage branch price overrides |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P1) |
| Release | MVP |
| Covers | US-03-08-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-03-021, FR-03-022, FR-03-023, FR-03-044, FR-03-045 |

**Story preconditions**
- `AllowBranchPriceOverride` is ON.
- The actor has `catalog.prices.update` and is assigned to the Branch.

**US-03-08-AC4 — Hide foreign Organization resources**

*Preconditions / test data*
1. a medicine or Branch id from another Organization

*Steps*
1. a manager requests its effective price or attempts to set an override

*Expected results*
1. the response is 404 with the same result as a missing catalog resource.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-03-09: Set and change prescription classification

### TS-03-058: Default and non-default classification creation permissions

| Field | Value |
|---|---|
| Story | [US-03-09](../stories/EPIC-03-MEDICINE-CATALOG/US-03-09-set-prescription-classification.md) — Set and change prescription classification |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-09-AC1 |
| Requirements | FR-03-024, FR-03-025, FR-03-044, FR-03-045 |

**Story preconditions**
- The medicine exists and is visible in the caller's Organization.
- The actor holds `catalog.medicines.classify` to set a class other than the default `PrescriptionOnly`.

**US-03-09-AC1 — Use default classification at creation**

*Preconditions / test data*
1. a creator with `catalog.medicines.create` but without `catalog.medicines.classify`

*Steps*
1. they create a medicine without a class

*Expected results*
1. it is stored as `PrescriptionOnly`
2. explicitly requesting `OTC` or `Controlled` returns 403 `CATALOG.CLASSIFY_PERMISSION_REQUIRED`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-059: Dedicated change writes audit and outbox atomically

| Field | Value |
|---|---|
| Story | [US-03-09](../stories/EPIC-03-MEDICINE-CATALOG/US-03-09-set-prescription-classification.md) — Set and change prescription classification |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-09-AC2 |
| Requirements | FR-03-024, FR-03-025, FR-03-044, FR-03-045 |

**Story preconditions**
- The medicine exists and is visible in the caller's Organization.
- The actor holds `catalog.medicines.classify` to set a class other than the default `PrescriptionOnly`.

**US-03-09-AC2 — Change classification through dedicated operation**

*Preconditions / test data*
1. a user with `catalog.medicines.classify` and a valid reason

*Steps*
1. they update classification using the dedicated endpoint

*Expected results*
1. the response returns the new class and ETag, with old/new audit values and a `MedicineClassificationChanged` outbox event in the same transaction.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-060: General update rejects class change with 422

| Field | Value |
|---|---|
| Story | [US-03-09](../stories/EPIC-03-MEDICINE-CATALOG/US-03-09-set-prescription-classification.md) — Set and change prescription classification |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-09-AC3 |
| Requirements | FR-03-024, FR-03-025, FR-03-044, FR-03-045 |

**Story preconditions**
- The medicine exists and is visible in the caller's Organization.
- The actor holds `catalog.medicines.classify` to set a class other than the default `PrescriptionOnly`.

**US-03-09-AC3 — Reject generic-update classification changes**

*Preconditions / test data*
1. a medicine with an existing class

*Steps*
1. a user changes `PrescriptionClass` through the general medicine update endpoint

*Expected results*
1. the response is 422 `CATALOG.USE_CLASSIFICATION_ENDPOINT` and the class remains unchanged.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-061: Missing permission returns 403 and foreign medicine returns 404 (CS-08)

| Field | Value |
|---|---|
| Story | [US-03-09](../stories/EPIC-03-MEDICINE-CATALOG/US-03-09-set-prescription-classification.md) — Set and change prescription classification |
| Type / Execution | Integration / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-03-09-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-03-024, FR-03-025, FR-03-044, FR-03-045 |

**Story preconditions**
- The medicine exists and is visible in the caller's Organization.
- The actor holds `catalog.medicines.classify` to set a class other than the default `PrescriptionOnly`.

**US-03-09-AC4 — Deny unauthorized and foreign-resource classification**

*Preconditions / test data*
1. a caller without classify permission or a medicine from another Organization

*Steps*
1. they request a classification change

*Expected results*
1. the first request returns 403 `COMMON.FORBIDDEN`, the foreign medicine returns 404 `CATALOG.MEDICINE_NOT_FOUND`, and no change is made.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-03-10: Deactivate, reactivate, and delete a medicine

### TS-03-062: Deactivation records reason and audit, then blocks new transaction use

| Field | Value |
|---|---|
| Story | [US-03-10](../stories/EPIC-03-MEDICINE-CATALOG/US-03-10-deactivate-reactivate-delete-medicine.md) — Deactivate, reactivate, and delete a medicine |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-10-AC1 |
| Requirements | FR-03-026, FR-03-044, FR-03-045 |

**Story preconditions**
- The actor has `catalog.medicines.deactivate`.
- `IMedicineStockProbe` can report on-hand quantity across all Branches.

**US-03-10-AC1 — Deactivate and retain stock visibility**

*Preconditions / test data*
1. an Active medicine with zero stock

*Steps*
1. an authorized user deactivates it with a 3–200 character reason

*Expected results*
1. status becomes Inactive, metadata and audit are committed atomically, and the medicine cannot be added to new sales, purchase orders, receipts, or dispensing.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-063: Positive on-hand requires acknowledgement and stock remains visible

| Field | Value |
|---|---|
| Story | [US-03-10](../stories/EPIC-03-MEDICINE-CATALOG/US-03-10-deactivate-reactivate-delete-medicine.md) — Deactivate, reactivate, and delete a medicine |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-10-AC2 |
| Requirements | FR-03-026, FR-03-044, FR-03-045 |

**Story preconditions**
- The actor has `catalog.medicines.deactivate`.
- `IMedicineStockProbe` can report on-hand quantity across all Branches.

**US-03-10-AC2 — Require explicit acknowledgement when stock exists**

*Preconditions / test data*
1. a medicine with positive on-hand stock in any Branch

*Steps*
1. the user deactivates it without `acknowledgeStock = true`, then retries with acknowledgement

*Expected results*
1. the first request returns 409 `CATALOG.MEDICINE_HAS_STOCK`
2. the second succeeds and existing stock remains visible for allowed inventory actions.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-064: Reactivate and hard-delete referenced/unreferenced medicines

| Field | Value |
|---|---|
| Story | [US-03-10](../stories/EPIC-03-MEDICINE-CATALOG/US-03-10-deactivate-reactivate-delete-medicine.md) — Deactivate, reactivate, and delete a medicine |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-10-AC3 |
| Requirements | FR-03-026, FR-03-044, FR-03-045 |

**Story preconditions**
- The actor has `catalog.medicines.deactivate`.
- `IMedicineStockProbe` can report on-hand quantity across all Branches.

**US-03-10-AC3 — Reactivate or hard-delete safely**

*Preconditions / test data*
1. an Inactive medicine and an unreferenced medicine

*Steps*
1. an authorized user reactivates the first or hard-deletes the second

*Expected results*
1. reactivation returns it to Active with audit
2. hard deletion succeeds only if no batch, document line, prescription item, or dispensing record references it.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-065: Missing permission returns 403 and foreign medicine returns 404 (CS-08)

| Field | Value |
|---|---|
| Story | [US-03-10](../stories/EPIC-03-MEDICINE-CATALOG/US-03-10-deactivate-reactivate-delete-medicine.md) — Deactivate, reactivate, and delete a medicine |
| Type / Execution | Integration / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-03-10-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-03-026, FR-03-044, FR-03-045 |

**Story preconditions**
- The actor has `catalog.medicines.deactivate`.
- `IMedicineStockProbe` can report on-hand quantity across all Branches.

**US-03-10-AC4 — Deny missing permission and hide another Organization**

*Preconditions / test data*
1. a caller without `catalog.medicines.deactivate` or a medicine owned by another Organization

*Steps*
1. they attempt a lifecycle operation

*Expected results*
1. the first request returns 403 `COMMON.FORBIDDEN`, the second returns 404 `CATALOG.MEDICINE_NOT_FOUND`, and no data changes.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-03-11: Search medicines in Arabic and English

### TS-03-066: Search names, ingredients, codes, barcodes and active/inactive filter

| Field | Value |
|---|---|
| Story | [US-03-11](../stories/EPIC-03-MEDICINE-CATALOG/US-03-11-search-medicines.md) — Search medicines in Arabic and English |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-11-AC1 |
| Requirements | FR-03-017, FR-03-027, FR-03-028, FR-03-029, FR-03-045 |

**Story preconditions**
- Medicines have normalized searchable text generated from names, ingredients, codes, and barcodes.
- The caller holds `catalog.medicines.read`.

**US-03-11-AC1 — Search all supported fields**

*Preconditions / test data*
1. medicines searchable by English/Arabic trade name, generic name, ingredient, code, or barcode

*Steps*
1. the caller submits a valid query

*Expected results*
1. results match the supported fields, return no more than `limit` (default 20, maximum 50), and exclude inactive medicines unless `includeInactive = true`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-067: Arabic, Arabic-Indic digit, Latin case and whitespace normalization plus ranking tiers

| Field | Value |
|---|---|
| Story | [US-03-11](../stories/EPIC-03-MEDICINE-CATALOG/US-03-11-search-medicines.md) — Search medicines in Arabic and English |
| Type / Execution | Unit / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-11-AC2 |
| Requirements | FR-03-017, FR-03-027, FR-03-028, FR-03-029, FR-03-045 |

**Story preconditions**
- Medicines have normalized searchable text generated from names, ingredients, codes, and barcodes.
- The caller holds `catalog.medicines.read`.

**US-03-11-AC2 — Normalize Arabic and rank deterministically**

*Preconditions / test data*
1. searchable Arabic forms that differ by alef/yaa/taa-marbuta/hamza, tashkeel, tatweel, Arabic-Indic digits, Latin case, or whitespace

*Steps*
1. equivalent normalized queries are submitted

*Expected results*
1. normalization is identical for stored text and query
2. exact barcode/code outranks exact name, followed by prefix and trigram tiers with deterministic ties.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-068: p95 ≤ 300 ms at 50,000 medicines and effective Branch price

| Field | Value |
|---|---|
| Story | [US-03-11](../stories/EPIC-03-MEDICINE-CATALOG/US-03-11-search-medicines.md) — Search medicines in Arabic and English |
| Type / Execution | Performance / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-11-AC3 |
| Requirements | FR-03-017, FR-03-027, FR-03-028, FR-03-029, FR-03-045 |

**Story preconditions**
- Medicines have normalized searchable text generated from names, ingredients, codes, and barcodes.
- The caller holds `catalog.medicines.read`.

**US-03-11-AC3 — Meet measurable search and branch targets**

*Preconditions / test data*
1. 50,000 medicines in an Organization

*Steps*
1. representative normalized search queries run with an accessible Branch filter

*Expected results*
1. server-side p95 latency is at most 300 ms and returned prices reflect the effective Branch price.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-069: Missing permission and other-Branch query return 403; tenant result set is isolated (CS-07, CS-08)

| Field | Value |
|---|---|
| Story | [US-03-11](../stories/EPIC-03-MEDICINE-CATALOG/US-03-11-search-medicines.md) — Search medicines in Arabic and English |
| Type / Execution | Integration / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-03-11-AC4 |
| Critical scenario | CS-07, CS-08 |
| Requirements | FR-03-017, FR-03-027, FR-03-028, FR-03-029, FR-03-045 |

**Story preconditions**
- Medicines have normalized searchable text generated from names, ingredients, codes, and barcodes.
- The caller holds `catalog.medicines.read`.

**US-03-11-AC4 — Deny unauthorized scope and isolate Organizations**

*Preconditions / test data*
1. a caller without read permission, a user assigned to Branch A searching with Branch B, and a caller using a Branch id from another Organization

*Steps*
1. they issue search requests

*Expected results*
1. missing permission and Branch B return 403 `COMMON.FORBIDDEN` (CS-07), the foreign Branch returns 404, and no foreign data is exposed.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-03-12: List, filter, and view medicine details

### TS-03-070: List filters, descendant categories, sorting, and pagination totals

| Field | Value |
|---|---|
| Story | [US-03-12](../stories/EPIC-03-MEDICINE-CATALOG/US-03-12-list-and-view-medicines.md) — List, filter, and view medicine details |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-12-AC1 |
| Requirements | FR-03-030, FR-03-031, FR-03-045 |

**Story preconditions**
- The caller is authenticated and holds `catalog.medicines.read`.
- Catalog data and organization default prices exist.

**US-03-12-AC1 — Filter and sort a paginated list**

*Preconditions / test data*
1. medicines with different statuses and reference-data values

*Steps*
1. the caller filters by status, category including descendants, manufacturer, dosage form, class, ingredient, storage, tax category, or barcode presence

*Expected results*
1. the response honors the filters, accepted sort fields, and page/pageSize/totalCount contract.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-071: Details include composition, barcode, price, alternatives, and storage

| Field | Value |
|---|---|
| Story | [US-03-12](../stories/EPIC-03-MEDICINE-CATALOG/US-03-12-list-and-view-medicines.md) — List, filter, and view medicine details |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-12-AC2 |
| Requirements | FR-03-030, FR-03-031, FR-03-045 |

**Story preconditions**
- The caller is authenticated and holds `catalog.medicines.read`.
- Catalog data and organization default prices exist.

**US-03-12-AC2 — View complete authorized medicine details**

*Preconditions / test data*
1. a medicine with composition, barcodes, prices, alternatives, and storage data

*Steps*
1. the caller requests its detail

*Expected results*
1. the response contains these fields and branch overrides only for branches the caller can access.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-072: Cost fields appear only with `catalog.costs.read`

| Field | Value |
|---|---|
| Story | [US-03-12](../stories/EPIC-03-MEDICINE-CATALOG/US-03-12-list-and-view-medicines.md) — List, filter, and view medicine details |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-12-AC3 |
| Requirements | FR-03-030, FR-03-031, FR-03-045 |

**Story preconditions**
- The caller is authenticated and holds `catalog.medicines.read`.
- Catalog data and organization default prices exist.

**US-03-12-AC3 — Omit restricted cost fields**

*Preconditions / test data*
1. one caller with `catalog.costs.read` and another without it

*Steps*
1. each reads the same medicine detail

*Expected results*
1. `LastPurchaseCost` and `LastPurchaseCostAt` are included only for the authorized caller and are omitted, not set to null, for the other.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-073: Missing permission returns 403 and foreign medicine returns 404 (CS-08)

| Field | Value |
|---|---|
| Story | [US-03-12](../stories/EPIC-03-MEDICINE-CATALOG/US-03-12-list-and-view-medicines.md) — List, filter, and view medicine details |
| Type / Execution | Integration / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-03-12-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-03-030, FR-03-031, FR-03-045 |

**Story preconditions**
- The caller is authenticated and holds `catalog.medicines.read`.
- Catalog data and organization default prices exist.

**US-03-12-AC4 — Deny and isolate catalog reads**

*Preconditions / test data*
1. a caller without `catalog.medicines.read` and a medicine id from another Organization

*Steps*
1. they list or view catalog data

*Expected results*
1. missing permission returns 403 `COMMON.FORBIDDEN` and the foreign medicine returns 404 `CATALOG.MEDICINE_NOT_FOUND`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-03-13: Manage alternative medicines and suggestions

### TS-03-074: Bidirectional link and unlink of active medicines

| Field | Value |
|---|---|
| Story | [US-03-13](../stories/EPIC-03-MEDICINE-CATALOG/US-03-13-manage-alternative-medicines.md) — Manage alternative medicines and suggestions |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-03-13-AC1 |
| Requirements | FR-03-032, FR-03-033, FR-03-045 |

**Story preconditions**
- Source and target medicines are in the same Organization.
- The actor holds `catalog.medicines.update` to change links or `catalog.medicines.read` to view suggestions.

**US-03-13-AC1 — Link and unlink an active alternative**

*Preconditions / test data*
1. two distinct Active medicines in the same Organization

*Steps*
1. a user with `catalog.medicines.update` links them with `bidirectional = true` or unlinks the relationship

*Expected results*
1. the reverse link is created or removed as requested, and duplicate links are not created.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-075: Self, inactive, duplicate, and 20-link boundary failures

| Field | Value |
|---|---|
| Story | [US-03-13](../stories/EPIC-03-MEDICINE-CATALOG/US-03-13-manage-alternative-medicines.md) — Manage alternative medicines and suggestions |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-03-13-AC2 |
| Requirements | FR-03-032, FR-03-033, FR-03-045 |

**Story preconditions**
- Source and target medicines are in the same Organization.
- The actor holds `catalog.medicines.update` to change links or `catalog.medicines.read` to view suggestions.

**US-03-13-AC2 — Enforce alternative constraints**

*Preconditions / test data*
1. a self-target, inactive target, existing link, or a medicine already linked to 20 alternatives

*Steps*
1. an authorized user attempts to add another link

*Expected results*
1. the request is rejected with the relevant 422 or 409 code and no partial link is persisted.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-076: Suggestions match dosage form and full ingredient composition

| Field | Value |
|---|---|
| Story | [US-03-13](../stories/EPIC-03-MEDICINE-CATALOG/US-03-13-manage-alternative-medicines.md) — Manage alternative medicines and suggestions |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-03-13-AC3 |
| Requirements | FR-03-032, FR-03-033, FR-03-045 |

**Story preconditions**
- Source and target medicines are in the same Organization.
- The actor holds `catalog.medicines.update` to change links or `catalog.medicines.read` to view suggestions.

**US-03-13-AC3 — Suggest matching composition**

*Preconditions / test data*
1. Active medicines with the same dosage form and identical ingredient/strength/unit sets

*Steps*
1. the caller requests suggestions

*Expected results*
1. at most 20 unlinked medicines excluding the source are returned and labelled for pharmacist review.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-077: Missing permission returns 403 and foreign target returns 404 (CS-08)

| Field | Value |
|---|---|
| Story | [US-03-13](../stories/EPIC-03-MEDICINE-CATALOG/US-03-13-manage-alternative-medicines.md) — Manage alternative medicines and suggestions |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-03-13-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-03-032, FR-03-033, FR-03-045 |

**Story preconditions**
- Source and target medicines are in the same Organization.
- The actor holds `catalog.medicines.update` to change links or `catalog.medicines.read` to view suggestions.

**US-03-13-AC4 — Deny unauthorized and foreign-Organization links**

*Preconditions / test data*
1. a caller without update permission or a target medicine owned by another Organization

*Steps*
1. they attempt to link the target

*Expected results*
1. missing permission returns 403 `COMMON.FORBIDDEN`, the foreign target returns 404 `CATALOG.MEDICINE_NOT_FOUND`, and no foreign data is disclosed.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-03-14: Import medicines: template and dry-run validation

### TS-03-078: CSV and XLSX templates have supported headers, sample, and UTF-8 BOM

| Field | Value |
|---|---|
| Story | [US-03-14](../stories/EPIC-03-MEDICINE-CATALOG/US-03-14-import-medicines-dry-run.md) — Import medicines: template and dry-run validation |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-03-14-AC1 |
| Requirements | FR-03-034, FR-03-035, FR-03-036, FR-03-045 |

**Story preconditions**
- The caller has `catalog.medicines.import`.
- Supported template and import processors are available.

**US-03-14-AC1 — Download compatible templates**

*Preconditions / test data*
1. an authorized catalog administrator

*Steps*
1. they request the CSV or XLSX template

*Expected results*
1. the download contains the supported columns and one example row
2. CSV is UTF-8 with BOM.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-079: Dry-run reports all row outcomes and leaves catalog unchanged

| Field | Value |
|---|---|
| Story | [US-03-14](../stories/EPIC-03-MEDICINE-CATALOG/US-03-14-import-medicines-dry-run.md) — Import medicines: template and dry-run validation |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-03-14-AC2 |
| Requirements | FR-03-034, FR-03-035, FR-03-036, FR-03-045 |

**Story preconditions**
- The caller has `catalog.medicines.import`.
- Supported template and import processors are available.

**US-03-14-AC2 — Validate an import without changing catalog data**

*Preconditions / test data*
1. a valid CSV or XLSX file with at most 10 MB and 20,000 data rows

*Steps*
1. the caller submits it with `dryRun = true`

*Expected results*
1. a job report identifies each row as Create, Update, Unchanged, or Error, with column, stable error code, localized message, and outcome totals
2. no catalog data changes.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-080: Reference resolution and price/cost/classification permission gates

| Field | Value |
|---|---|
| Story | [US-03-14](../stories/EPIC-03-MEDICINE-CATALOG/US-03-14-import-medicines-dry-run.md) — Import medicines: template and dry-run validation |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-03-14-AC3 |
| Requirements | FR-03-034, FR-03-035, FR-03-036, FR-03-045 |

**Story preconditions**
- The caller has `catalog.medicines.import`.
- Supported template and import processors are available.

**US-03-14-AC3 — Resolve reference data and protect restricted columns**

*Preconditions / test data*
1. unresolved reference names, or columns for price, cost, or non-default classification without their respective permissions

*Steps*
1. the dry run validates the file

*Expected results*
1. unresolved values are reported unless permitted `createMissingReferenceData` is enabled
2. disallowed columns report `CATALOG.IMPORT_COLUMN_NOT_PERMITTED`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-081: Missing permission returns 403 and foreign job returns 404 (CS-08)

| Field | Value |
|---|---|
| Story | [US-03-14](../stories/EPIC-03-MEDICINE-CATALOG/US-03-14-import-medicines-dry-run.md) — Import medicines: template and dry-run validation |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-03-14-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-03-034, FR-03-035, FR-03-036, FR-03-045 |

**Story preconditions**
- The caller has `catalog.medicines.import`.
- Supported template and import processors are available.

**US-03-14-AC4 — Reject unauthorized or foreign-Organization jobs**

*Preconditions / test data*
1. a caller without import permission or a job id owned by another Organization

*Steps*
1. they request a template, submit a dry run, or query the job/report

*Expected results*
1. missing permission returns 403 `COMMON.FORBIDDEN` and the foreign job returns 404 `CATALOG.IMPORT_JOB_NOT_FOUND`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-03-15: Import medicines: idempotent commit

### TS-03-082: Valid commit returns 202 and job status/report remain available for 30 days

| Field | Value |
|---|---|
| Story | [US-03-15](../stories/EPIC-03-MEDICINE-CATALOG/US-03-15-import-medicines-commit.md) — Import medicines: idempotent commit |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-03-15-AC1 |
| Requirements | FR-03-036, FR-03-037, FR-03-044, FR-03-045 |

**Story preconditions**
- The dry-run and import job services are available.
- The caller has `catalog.medicines.import` and supplies an `Idempotency-Key` for every commit.

**US-03-15-AC1 — Accept a commit as an asynchronous job**

*Preconditions / test data*
1. a validated import file and a supported `matchBy` and mode

*Steps*
1. the caller submits `dryRun = false` with an idempotency key

*Expected results*
1. the response is 202 with a job resource
2. matching occurs by barcode or code and reports remain available for 30 days.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-083: AllOrNothing rollback and SkipInvalid valid-row commit behavior

| Field | Value |
|---|---|
| Story | [US-03-15](../stories/EPIC-03-MEDICINE-CATALOG/US-03-15-import-medicines-commit.md) — Import medicines: idempotent commit |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-03-15-AC2 |
| Requirements | FR-03-036, FR-03-037, FR-03-044, FR-03-045 |

**Story preconditions**
- The dry-run and import job services are available.
- The caller has `catalog.medicines.import` and supplies an `Idempotency-Key` for every commit.

**US-03-15-AC2 — Enforce selected transaction mode**

*Preconditions / test data*
1. an import with one or more row errors

*Steps*
1. it is committed in `AllOrNothing` or `SkipInvalid` mode

*Expected results*
1. AllOrNothing makes no catalog changes and fails with `CATALOG.IMPORT_HAS_ERRORS`
2. SkipInvalid commits valid rows and reports invalid rows.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-084: Same idempotency key/request replays one job; identical data causes no duplicate side effects (CS-11)

| Field | Value |
|---|---|
| Story | [US-03-15](../stories/EPIC-03-MEDICINE-CATALOG/US-03-15-import-medicines-commit.md) — Import medicines: idempotent commit |
| Type / Execution | Concurrency / Automated |
| Priority | T1 (story P1) |
| Release | V1 |
| Covers | US-03-15-AC3 |
| Critical scenario | CS-11 |
| Requirements | FR-03-036, FR-03-037, FR-03-044, FR-03-045 |

**Story preconditions**
- The dry-run and import job services are available.
- The caller has `catalog.medicines.import` and supplies an `Idempotency-Key` for every commit.

**US-03-15-AC3 — Replay commit safely**

*Preconditions / test data*
1. an identical commit request using the same key

*Steps*
1. it is retried or two identical requests arrive concurrently

*Expected results*
1. the original 202 response and job id are replayed and only one import job and one set of side effects exist
2. re-importing identical data yields Unchanged rows.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-085: Key hash conflict 422, missing permission 403, foreign job 404

| Field | Value |
|---|---|
| Story | [US-03-15](../stories/EPIC-03-MEDICINE-CATALOG/US-03-15-import-medicines-commit.md) — Import medicines: idempotent commit |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-03-15-AC4 |
| Requirements | FR-03-036, FR-03-037, FR-03-044, FR-03-045 |

**Story preconditions**
- The dry-run and import job services are available.
- The caller has `catalog.medicines.import` and supplies an `Idempotency-Key` for every commit.

**US-03-15-AC4 — Reject key reuse and unauthorized or foreign jobs**

*Preconditions / test data*
1. the same key with a different request hash, a caller without import permission, or a job from another Organization

*Steps*
1. they submit or query the request

*Expected results*
1. key reuse returns 422 `COMMON.IDEMPOTENCY_KEY_REUSED`, missing permission returns 403, and the foreign job returns 404 without disclosure.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-03-16: Export medicines

### TS-03-086: CSV/XLSX direct export with filters at 5,000 rows

| Field | Value |
|---|---|
| Story | [US-03-16](../stories/EPIC-03-MEDICINE-CATALOG/US-03-16-export-medicines.md) — Export medicines |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-03-16-AC1 |
| Requirements | FR-03-038, FR-03-045 |

**Story preconditions**
- The caller holds `catalog.medicines.export`.
- The requested filters are supported by the medicine list.

**US-03-16-AC1 — Export a small result set directly**

*Preconditions / test data*
1. filters matching at most 5,000 medicines

*Steps*
1. the caller requests CSV or XLSX

*Expected results*
1. the file is returned directly with template-compatible columns and only matching records.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-087: 5,001-row export returns job and a 15-minute signed link

| Field | Value |
|---|---|
| Story | [US-03-16](../stories/EPIC-03-MEDICINE-CATALOG/US-03-16-export-medicines.md) — Export medicines |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-03-16-AC2 |
| Requirements | FR-03-038, FR-03-045 |

**Story preconditions**
- The caller holds `catalog.medicines.export`.
- The requested filters are supported by the medicine list.

**US-03-16-AC2 — Run a large export asynchronously**

*Preconditions / test data*
1. filters matching more than 5,000 medicines

*Steps*
1. the caller requests an export

*Expected results*
1. the response is 202 with a job resource
2. completion exposes an authorized pre-signed download link valid for 15 minutes.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-088: Cost permission omission and formula-leading cell neutralization

| Field | Value |
|---|---|
| Story | [US-03-16](../stories/EPIC-03-MEDICINE-CATALOG/US-03-16-export-medicines.md) — Export medicines |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-03-16-AC3 |
| Requirements | FR-03-038, FR-03-045 |

**Story preconditions**
- The caller holds `catalog.medicines.export`.
- The requested filters are supported by the medicine list.

**US-03-16-AC3 — Protect cost data and spreadsheet consumers**

*Preconditions / test data*
1. a user without `catalog.costs.read` and exported cells beginning with `=`, `+`, `-`, or `@`

*Steps*
1. the export is generated

*Expected results*
1. cost columns are omitted and formula-leading cell values are prefixed with an apostrophe.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-089: Missing permission returns 403 and foreign job returns 404

| Field | Value |
|---|---|
| Story | [US-03-16](../stories/EPIC-03-MEDICINE-CATALOG/US-03-16-export-medicines.md) — Export medicines |
| Type / Execution | Integration / Automated |
| Priority | T2 (story P1) |
| Release | V1 |
| Covers | US-03-16-AC4 |
| Requirements | FR-03-038, FR-03-045 |

**Story preconditions**
- The caller holds `catalog.medicines.export`.
- The requested filters are supported by the medicine list.

**US-03-16-AC4 — Deny unauthorized and foreign-Organization export jobs**

*Preconditions / test data*
1. a caller without export permission or a job id from another Organization

*Steps*
1. they request an export or retrieve its job/link

*Expected results*
1. missing permission returns 403 `COMMON.FORBIDDEN` and the foreign job returns 404 with no download link.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-03-17: Generate an internal barcode

### TS-03-090: Prefix, sequence, check digit, Format, and Source are correct

| Field | Value |
|---|---|
| Story | [US-03-17](../stories/EPIC-03-MEDICINE-CATALOG/US-03-17-generate-internal-barcode.md) — Generate an internal barcode |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-03-17-AC1 |
| Requirements | FR-03-039, FR-03-045 |

**Story preconditions**
- The medicine has fewer than 10 barcodes.
- `InternalBarcodePrefix` is configured as a two-digit prefix from 20 through 29.
- The caller holds `catalog.medicines.update`.

**US-03-17-AC1 — Generate and store internal EAN-13**

*Preconditions / test data*
1. an eligible medicine and configured prefix

*Steps*
1. the caller requests barcode generation

*Expected results*
1. the service allocates the next 10-digit organization sequence, appends the mod-10 check digit, and stores the barcode with `Format = Internal` and `Source = Generated`.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-091: Parallel generation creates distinct organization-unique codes

| Field | Value |
|---|---|
| Story | [US-03-17](../stories/EPIC-03-MEDICINE-CATALOG/US-03-17-generate-internal-barcode.md) — Generate an internal barcode |
| Type / Execution | Concurrency / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-03-17-AC2 |
| Requirements | FR-03-039, FR-03-045 |

**Story preconditions**
- The medicine has fewer than 10 barcodes.
- `InternalBarcodePrefix` is configured as a two-digit prefix from 20 through 29.
- The caller holds `catalog.medicines.update`.

**US-03-17-AC2 — Preserve uniqueness under concurrent generation**

*Preconditions / test data*
1. two authorized requests generate barcodes concurrently

*Steps*
1. both are committed

*Expected results*
1. each receives a distinct code unique within the Organization.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-092: Sequence exhaustion, invalid prefix, and barcode limit are rejected

| Field | Value |
|---|---|
| Story | [US-03-17](../stories/EPIC-03-MEDICINE-CATALOG/US-03-17-generate-internal-barcode.md) — Generate an internal barcode |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-03-17-AC3 |
| Requirements | FR-03-039, FR-03-045 |

**Story preconditions**
- The medicine has fewer than 10 barcodes.
- `InternalBarcodePrefix` is configured as a two-digit prefix from 20 through 29.
- The caller holds `catalog.medicines.update`.

**US-03-17-AC3 — Reject exhausted sequence or invalid setup**

*Preconditions / test data*
1. the sequence has reached 9,999,999,999, an invalid prefix, or the medicine already has 10 barcodes

*Steps*
1. the caller requests another barcode

*Expected results*
1. the request fails without partial persistence.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-093: Missing permission returns 403 and foreign medicine returns 404 (CS-08)

| Field | Value |
|---|---|
| Story | [US-03-17](../stories/EPIC-03-MEDICINE-CATALOG/US-03-17-generate-internal-barcode.md) — Generate an internal barcode |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-03-17-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-03-039, FR-03-045 |

**Story preconditions**
- The medicine has fewer than 10 barcodes.
- `InternalBarcodePrefix` is configured as a two-digit prefix from 20 through 29.
- The caller holds `catalog.medicines.update`.

**US-03-17-AC4 — Deny missing permission and foreign medicine access**

*Preconditions / test data*
1. a caller without `catalog.medicines.update` or a medicine from another Organization

*Steps*
1. they request generation

*Expected results*
1. missing permission returns 403 `COMMON.FORBIDDEN`, foreign medicine returns 404 `CATALOG.MEDICINE_NOT_FOUND`, and no code is allocated.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-03-18: Print shelf labels

### TS-03-094: Both label sizes include required names, strength, form, price, barcode, and local print date

| Field | Value |
|---|---|
| Story | [US-03-18](../stories/EPIC-03-MEDICINE-CATALOG/US-03-18-print-shelf-labels.md) — Print shelf labels |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-03-18-AC1 |
| Requirements | FR-03-040, FR-03-045 |

**Story preconditions**
- The caller has `catalog.medicines.read` and access to the requested Branch.
- Selected medicines are Active and have catalog details.

**US-03-18-AC1 — Generate requested label PDF**

*Preconditions / test data*
1. 1–500 distinct Active medicines with 1–100 copies each and no more than 2,000 labels total

*Steps*
1. the caller requests either supported template size

*Expected results*
1. a PDF is generated with English/Arabic trade names, strength, dosage form, effective Branch pack price, primary barcode, and print date in the Branch time zone.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-095: EAN-13 vs Code 128 selection and branch effective price

| Field | Value |
|---|---|
| Story | [US-03-18](../stories/EPIC-03-MEDICINE-CATALOG/US-03-18-print-shelf-labels.md) — Print shelf labels |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-03-18-AC2 |
| Requirements | FR-03-040, FR-03-045 |

**Story preconditions**
- The caller has `catalog.medicines.read` and access to the requested Branch.
- Selected medicines are Active and have catalog details.

**US-03-18-AC2 — Choose barcode rendering and effective price**

*Preconditions / test data*
1. a 13-digit numeric primary barcode or another valid barcode and a Branch override

*Steps*
1. labels are rendered

*Expected results*
1. EAN-13 symbology is used only for 13-digit numeric codes, Code 128 otherwise, and the effective price uses the override when present.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-096: Other Branch 403, inactive medicine and label count limits

| Field | Value |
|---|---|
| Story | [US-03-18](../stories/EPIC-03-MEDICINE-CATALOG/US-03-18-print-shelf-labels.md) — Print shelf labels |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-03-18-AC3 |
| Requirements | FR-03-040, FR-03-045 |

**Story preconditions**
- The caller has `catalog.medicines.read` and access to the requested Branch.
- Selected medicines are Active and have catalog details.

**US-03-18-AC3 — Reject invalid scope and excessive labels**

*Preconditions / test data*
1. an out-of-assignment Branch, inactive medicine, or a request exceeding 500 medicines or 2,000 labels

*Steps*
1. labels are requested

*Expected results*
1. Branch access returns 403 `COMMON.FORBIDDEN`
2. inactive items or limits return their specified 422 errors and no PDF is issued.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-097: Foreign Organization identifiers return concealed 404 (CS-08)

| Field | Value |
|---|---|
| Story | [US-03-18](../stories/EPIC-03-MEDICINE-CATALOG/US-03-18-print-shelf-labels.md) — Print shelf labels |
| Type / Execution | Integration / Automated |
| Priority | T3 (story P2) |
| Release | Future |
| Covers | US-03-18-AC4 |
| Critical scenario | CS-08 |
| Requirements | FR-03-040, FR-03-045 |

**Story preconditions**
- The caller has `catalog.medicines.read` and access to the requested Branch.
- Selected medicines are Active and have catalog details.

**US-03-18-AC4 — Conceal another Organization's Branch or medicine**

*Preconditions / test data*
1. a Branch or medicine id from another Organization

*Steps*
1. the caller requests labels

*Expected results*
1. the response is 404 with no names, prices, or barcode data disclosed.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).


## US-03-19: Catalog facade, effective sale info, and integration events

### TS-03-098: Resolve by medicine id/barcode with all effective sale and reorder fields

| Field | Value |
|---|---|
| Story | [US-03-19](../stories/EPIC-03-MEDICINE-CATALOG/US-03-19-catalog-facade-and-integration-events.md) — Catalog facade, effective sale info, and integration events |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-19-AC1 |
| Requirements | FR-03-011, FR-03-023, FR-03-041, FR-03-042, FR-03-043, FR-03-045 |

**Story preconditions**
- The medicine belongs to the caller's Organization.
- Branch-level requests use an assigned Branch or organization-wide scope.

**US-03-19-AC1 — Resolve branch effective sale information**

*Preconditions / test data*
1. a medicine identified by id or barcode and an accessible Branch

*Steps*
1. the caller reads the effective catalog model

*Expected results*
1. it returns status, class, pack/split-pack data, base-unit names, effective pack/base-unit price, tax category/rate, storage condition, and default minimum stock.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-099: Later receipt updates cost, duplicate event is ignored, older event does not overwrite

| Field | Value |
|---|---|
| Story | [US-03-19](../stories/EPIC-03-MEDICINE-CATALOG/US-03-19-catalog-facade-and-integration-events.md) — Catalog facade, effective sale info, and integration events |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-19-AC2 |
| Requirements | FR-03-011, FR-03-023, FR-03-041, FR-03-042, FR-03-043, FR-03-045 |

**Story preconditions**
- The medicine belongs to the caller's Organization.
- Branch-level requests use an assigned Branch or organization-wide scope.

**US-03-19-AC2 — Update last purchase cost idempotently**

*Preconditions / test data*
1. a valid `GoodsReceiptPosted` event with event id and posting time

*Steps*
1. the facade consumer receives it

*Expected results*
1. `LastPurchaseCost` per base unit and timestamp update only for a later receipt
2. duplicate event ids are processed at most once and earlier events do not overwrite newer cost.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-100: Create/update/status/price/classification events share transaction with outbox

| Field | Value |
|---|---|
| Story | [US-03-19](../stories/EPIC-03-MEDICINE-CATALOG/US-03-19-catalog-facade-and-integration-events.md) — Catalog facade, effective sale info, and integration events |
| Type / Execution | Integration / Automated |
| Priority | T1 (story P0) |
| Release | MVP |
| Covers | US-03-19-AC3 |
| Requirements | FR-03-011, FR-03-023, FR-03-041, FR-03-042, FR-03-043, FR-03-045 |

**Story preconditions**
- The medicine belongs to the caller's Organization.
- Branch-level requests use an assigned Branch or organization-wide scope.

**US-03-19-AC3 — Publish catalog changes transactionally**

*Preconditions / test data*
1. medicine create/update/status/price/classification changes

*Steps*
1. each transaction commits

*Expected results*
1. the corresponding integration event is written to the transactional outbox in the same transaction and published without duplication by event id.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

### TS-03-101: Cost omission, cross-Branch 403, and cross-Organization 404 (CS-07, CS-08)

| Field | Value |
|---|---|
| Story | [US-03-19](../stories/EPIC-03-MEDICINE-CATALOG/US-03-19-catalog-facade-and-integration-events.md) — Catalog facade, effective sale info, and integration events |
| Type / Execution | Integration / Automated |
| Priority | T0 (story P0) |
| Release | MVP |
| Covers | US-03-19-AC4 |
| Critical scenario | CS-07, CS-08 |
| Requirements | FR-03-011, FR-03-023, FR-03-041, FR-03-042, FR-03-043, FR-03-045 |

**Story preconditions**
- The medicine belongs to the caller's Organization.
- Branch-level requests use an assigned Branch or organization-wide scope.

**US-03-19-AC4 — Enforce branch, cost, and Organization boundaries**

*Preconditions / test data*
1. a caller without cost permission, an unassigned Branch, or a medicine/Branch from another Organization

*Steps*
1. they request facade data

*Expected results*
1. cost fields are omitted, an unassigned Branch returns 403 `COMMON.FORBIDDEN` (CS-07), and foreign Organization resources return 404 with no data leakage.

**Post-conditions / invariants:** audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).

