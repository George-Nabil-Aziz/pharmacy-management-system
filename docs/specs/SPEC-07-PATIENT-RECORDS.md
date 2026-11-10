# SPEC-07: Patients & Medical Records

**Version:** 1.0 · **Status:** Draft for review · **Owner:** Business Analysis / Architecture · **Related ADRs:** ADR-001, ADR-002, ADR-006, ADR-007, ADR-008, ADR-009 · **Related BRQs:** BRQ-01, BRQ-02, BRQ-08, BRQ-09, BRQ-12, BRQ-13, BRQ-15

---

## 1. Purpose

Define how the system stores and uses information about pharmacy patients — demographics, consent, allergies, chronic conditions, pharmacist notes, and derived medication/purchase/prescription history — with **privacy by design** and **data minimization** as primary constraints. The module also provides allergy decision-support checks at the point of sale and at dispensing.

The system never diagnoses, never prescribes, and never infers medical facts. Allergy alerts are decision support only; the pharmacist remains responsible for every clinical decision.

## 2. Business Context

Egyptian community pharmacies serve repeat customers, many with chronic conditions, who are typically identified by their mobile phone number. Pharmacists benefit from knowing a patient's recorded allergies and medication history at the counter. At the same time, health data is sensitive personal data; its storage, consent, cross-border transfer, and retention are subject to legal review (REG-04, REG-05). The product therefore:

- separates demographic data (`patients.profiles.*`) from medical data (`patients.medical.*`) at the permission level;
- logs every read of medical data (BR-G-29);
- collects only the fields needed for safe dispensing and patient identification;
- replaces deletion with anonymization where records are referenced by retained documents (BR-G-33, BR-G-34).

Patients are **organization-level** records: one patient profile is visible across all branches of the organization, subject to permissions.

## 3. Scope

| Area | Included | Priority |
|---|---|---|
| Patient profile | Create, edit, deactivate/reactivate; patient code; mobile phone (E.164); optional email, minimal address, date of birth or year of birth, gender | P0 |
| Patient search | By phone (any accepted format), by name with Arabic normalization, by patient code; masked list results | P0 |
| Consent | Purpose-based consent records (`MedicalDataStorage`, `Notifications`), append-only history | P0 / P1 |
| Allergies | Structured allergy records (ingredient reference or free text, reaction, severity, source, recorded-by), allergy status (`Unknown`, `NoKnownAllergies`, `HasAllergies`) | P0 |
| Access logging | `PatientAccessLog` entry for every medical-data read; per-patient access-log view | P0 / P1 |
| Link to sale | Validation facade for SPEC-06 to attach a patient to a sale; quick-create from POS | P0 / P1 |
| Allergy alerts | Exact `ActiveIngredient` match at POS and dispensing; acknowledgement with reason; optional blocking mode | P0 / P1 |
| Chronic conditions | Free text + optional code, status lifecycle | P1 |
| Pharmacist notes | Restricted, append-only notes with amendments | P1 |
| Derived history | Medication history (SPEC-06/08), purchase history (SPEC-06), prescription links (SPEC-08) — read-only | P1 |
| Interaction timeline | Chronological merged events, filtered by permission | P2 |
| Privacy settings | Organization settings for consent requirement, allergy alert mode, optional national ID collection | P1 / P2 |
| Duplicates & merge | Duplicate detection on create and candidate list; audited merge | P2 |
| Data subject requests | Export of a patient's data; anonymization | P2 |

## 4. Out of Scope

- Diagnosis, clinical decision rules, dose checking, drug–drug interaction checking, and allergy cross-reactivity (e.g., drug class or related-ingredient inference). Only exact `ActiveIngredient` matches are checked in v1. Any external drug database is subject to REG-09.
- Prescription registration, verification, and dispensing workflow (SPEC-08). This spec only provides read-only links and the allergy check consumed by SPEC-08/SPEC-06.
- Sale creation and payment (SPEC-06). This spec only validates the patient link and stores allergy acknowledgements.
- Sending notifications (SPEC-10). This spec only exposes the patient's notification consent.
- Insurance, medical-coverage, and loyalty programmes.
- Patient self-service portal or patient login.
- Integration with any national health record or government identity service.
- Hard deletion of patients (BR-G-33).

### 4.1 Data deliberately NOT collected

| Data | Reason |
|---|---|
| National ID number (default) | Not needed to identify a pharmacy patient or to dispense; a high-impact identifier if leaked. Collected only if the organization enables `CollectNationalId` (default OFF), stored encrypted and masked (FR-07-034). |
| Photograph, biometrics, signature images | Not needed for any v1 workflow. |
| Religion, ethnicity, nationality, marital status, occupation, income | Not relevant to dispensing; would increase sensitivity without benefit. |
| Structured full address, GPS location | Delivery is out of scope; a single optional free-text address line (area/city) is sufficient. |
| Insurance/medical-coverage numbers | Insurance is out of scope in v1. |
| Payment card data | Never stored in patient records (payments belong to SPEC-06). |
| Family relationships / guardian links | Not modelled in v1; shared phone numbers are allowed instead. |
| Pregnancy/lactation status, weight, height, lab results | Not modelled as structured data in v1 (OD-07-10); a pharmacist may record relevant context in a restricted note. |
| System-generated diagnoses or risk scores | The system does not diagnose (§1). |

## 5. Actors and Permissions

| Actor | Description |
|---|---|
| Pharmacist | Records and reads medical data, acknowledges allergy alerts, links patients at dispensing. |
| Cashier | Searches, links, and quick-creates patients at the POS; sees minimized allergy alerts. |
| Branch Manager | Maintains demographics; medical access only if granted. |
| Owner | All permissions, including data subject requests, merge, access-log review, and settings. |
| Accountant / Inventory Staff | No patient access by default. |
| Platform administrator | No access to patient data (SPEC-02 support grant excludes medical data unless the grant explicitly includes it — see OD-07-08). |

### 5.1 Permissions used

| Permission | Status | Grants |
|---|---|---|
| `patients.profiles.read` | Canonical | Read demographics, consents, masked search results |
| `patients.profiles.manage` | Canonical | Create/update/deactivate/reactivate profiles; record consent; reveal national ID (if enabled) |
| `patients.medical.read` | Canonical | Read allergies, allergy status, conditions, notes, medication history, prescription links, medical timeline events, allergy acknowledgements (all access-logged) |
| `patients.medical.manage` | Canonical | Create/update allergies, allergy status, conditions, notes |
| `patients.data.export` | Canonical | Generate and download a patient data export |
| `patients.data.anonymize` | Canonical | Anonymize a patient |
| `patients.profiles.merge` | **New** | Merge duplicate patients and view duplicate candidates |
| `patients.access-logs.read` | **New** | Read the access log of a patient |
| `patients.allergy-alerts.acknowledge` | **New** | Acknowledge an allergy alert at POS or dispensing |
| `sales.pos.sell`, `prescriptions.dispense` | Canonical (SPEC-06/08) | Run an allergy check for a branch |
| `sales.sales.read` | Canonical (SPEC-06) | Required in addition to `patients.profiles.read` for purchase history |
| `prescriptions.prescriptions.read` | Canonical (SPEC-08) | Required in addition to `patients.medical.read` for prescription links |
| `settings.organization.manage` | Canonical (SPEC-10) | Change patient privacy settings |

### 5.2 Proposed default grants (seeded roles; editable — OD-07-08)

| Permission | OWNER | MANAGER | PHARMACIST | CASHIER | INVENTORY | ACCOUNTANT |
|---|---|---|---|---|---|---|
| `patients.profiles.read` | Yes | Yes | Yes | Yes | No | No |
| `patients.profiles.manage` | Yes | Yes | Yes | Yes | No | No |
| `patients.medical.read` | Yes | No | Yes | No | No | No |
| `patients.medical.manage` | Yes | No | Yes | No | No | No |
| `patients.allergy-alerts.acknowledge` | Yes | No | Yes | No | No | No |
| `patients.access-logs.read` | Yes | No | No | No | No | No |
| `patients.profiles.merge` | Yes | No | No | No | No | No |
| `patients.data.export` | Yes | No | No | No | No | No |
| `patients.data.anonymize` | Yes | No | No | No | No | No |

## 6. Functional Requirements

| ID | Requirement | Priority | BRQ | Stories |
|---|---|---|---|---|
| FR-07-001 | The system shall create a patient with a required full name (2–150 characters) and required mobile phone, optional email, optional address line (≤ 250 characters), optional date of birth or year of birth, and optional gender, and shall assign an organization-unique patient code in the format `PAT-NNNNNN`. | P0 | BRQ-08 | US-07-01, US-07-06 |
| FR-07-002 | The system shall normalize every phone number input to E.164, accepting Egyptian mobile numbers in the forms `01XXXXXXXXX`, `201XXXXXXXXX`, `+201XXXXXXXXX`, `00201XXXXXXXXX` (with spaces/dashes and Arabic-Indic digits ٠–٩), and other numbers only when supplied with a `+` country code and 8–15 digits. | P0 | BRQ-08 | US-07-01, US-07-02 |
| FR-07-003 | The system shall store date of birth with a precision flag (`Exact` or `YearOnly`), accepting an exact date, a year of birth, or an approximate age in years (converted to year of birth = current year in branch time zone − age). | P1 | BRQ-08 | US-07-01 |
| FR-07-004 | The system shall update patient demographics only with a matching `If-Match` ETag (412 otherwise) and shall write an audit log entry listing the changed field names. | P0 | BRQ-08, BRQ-12 | US-07-01 |
| FR-07-005 | The system shall deactivate and reactivate patients (soft delete) and shall never hard-delete a patient. | P0 | BRQ-08 | US-07-01 |
| FR-07-006 | The system shall search patients by phone: a value normalizing to a complete number returns exact matches; a digits-only value of 6–10 digits returns suffix matches. | P0 | BRQ-08 | US-07-02, US-07-06 |
| FR-07-007 | The system shall search patients by name using Arabic normalization (remove diacritics and tatweel; unify أ/إ/آ/ٱ→ا, ى→ي, ة→ه, ؤ→و, ئ→ي; Latin case-insensitive; collapse whitespace), matching every query token (≥ 2 characters) as a prefix of any name token in any order. | P0 | BRQ-08, BRQ-13 | US-07-02 |
| FR-07-008 | The system shall search patients by exact patient code (case-insensitive). | P0 | BRQ-08 | US-07-02 |
| FR-07-009 | The system shall return search results containing only patient id, patient code, full name, masked phone (last 4 digits visible), age in years (if known), and status; results shall contain no medical data, email, address, or national ID. | P0 | BRQ-08 | US-07-02 |
| FR-07-010 | The system shall record consent as append-only `PatientConsent` events per purpose (`MedicalDataStorage`, `Notifications`) with status (`Granted`/`Withdrawn`), method (`Verbal`, `Written`, `Electronic`), optional note, recording user, and timestamp; the effective consent is the latest event per purpose. | P0 | BRQ-08 | US-07-03 |
| FR-07-011 | When `RequireConsentForMedicalData` is ON, the system shall reject creation or update of allergies, allergy status, conditions, and notes for a patient without effective `MedicalDataStorage` = `Granted` with `PATIENTS.CONSENT_REQUIRED`. | P0 | BRQ-08 | US-07-03, US-07-04, US-07-08, US-07-09 |
| FR-07-012 | The system shall expose the effective `Notifications` consent through the module facade so SPEC-10 sends no patient-directed notification unless it is `Granted`. | P1 | BRQ-08, BRQ-11 | US-07-03 |
| FR-07-013 | The system shall record an allergy with substance (either an `ActiveIngredient` reference or free text ≤ 200 characters), reaction (≤ 500 characters, optional), severity (`Mild`, `Moderate`, `Severe`, `Unknown`), source (`PatientReported`, `PrescriberReported`, `PharmacistObserved`, `Document`), and recorded-by user and timestamp. | P0 | BRQ-08 | US-07-04 |
| FR-07-014 | The system shall accept an `ActiveIngredient` reference only if it exists in the organization's catalog (SPEC-03) and shall reject a second `Active` allergy to the same ingredient for the same patient. | P0 | BRQ-08 | US-07-04 |
| FR-07-015 | The system shall change allergy status among `Active`, `Inactive`, and `EnteredInError` with a mandatory reason and shall never hard-delete allergy records. | P0 | BRQ-08, BRQ-12 | US-07-04 |
| FR-07-016 | The system shall maintain the patient allergy status `Unknown` (default), `NoKnownAllergies`, or `HasAllergies`; it shall set `HasAllergies` automatically when an `Active` allergy exists and shall reject `NoKnownAllergies` while any `Active` allergy exists. | P0 | BRQ-08 | US-07-04 |
| FR-07-017 | The system shall write a `PatientAccessLog` entry (patient, user, organization, branch context, access type, data categories, trace id, timestamp) for every API response that contains a patient's medical data, including allergy checks and exports. | P0 | BRQ-08, BRQ-12 | US-07-05, US-07-04, US-07-07, US-07-08, US-07-09, US-07-10, US-07-11, US-07-12, US-07-16 |
| FR-07-018 | The system shall persist the access-log entry before the response is returned and shall return 503 `PATIENTS.ACCESS_LOG_UNAVAILABLE` with no medical data if the entry cannot be persisted. | P0 | BRQ-08, BRQ-12 | US-07-05 |
| FR-07-019 | The system shall list a patient's access-log entries (newest first, cursor pagination, filter by date range, user, and data category) to users with `patients.access-logs.read`, and shall audit each such view. | P1 | BRQ-08, BRQ-12 | US-07-05 |
| FR-07-020 | The system shall write an audit log entry for every create/update/status change of medical data that records entity type, entity id, action, and changed field names, but not the values of medical fields. | P0 | BRQ-12 | US-07-05, US-07-04 |
| FR-07-021 | The system shall provide a facade used by SPEC-06 at sale completion that accepts a patient id only if the patient belongs to the caller's organization and has status `Active`; a `Merged` patient is rejected with the surviving patient id. | P0 | BRQ-07, BRQ-08 | US-07-06 |
| FR-07-022 | The system shall allow quick creation of a patient from the POS with only full name and mobile phone and shall return the new patient ready for linking in the same response. | P1 | BRQ-07, BRQ-08 | US-07-06 |
| FR-07-023 | The system shall run an allergy check for a patient and a list of ≤ 100 medicine ids, returning one match per (medicine, `Active` allergy) pair where the allergy's `ActiveIngredientId` equals an ingredient of the medicine (SPEC-03 `MedicineIngredient`), plus the count of `Active` free-text allergies requiring manual review; no other matching logic shall be applied. | P0 | BRQ-08, BRQ-09 | US-07-07 |
| FR-07-024 | At sale completion and dispensing with a linked patient, the system shall re-run the allergy check server-side and, in `AllergyAlertMode` = `Warn`, shall reject completion with `PATIENTS.ALLERGY_ACKNOWLEDGEMENT_REQUIRED` unless every match carries an acknowledgement with a reason code by a user holding `patients.allergy-alerts.acknowledge`. | P0 | BRQ-08, BRQ-09 | US-07-07 |
| FR-07-025 | In `AllergyAlertMode` = `Block`, the system shall reject sale completion and dispensing containing any matched medicine with `PATIENTS.ALLERGY_BLOCKED`, without acknowledgement override. | P1 | BRQ-08, BRQ-09 | US-07-07 |
| FR-07-026 | The system shall persist each acknowledgement as an `AllergyAlertAcknowledgement` (sale, sale line, allergy, ingredient, reason code, reason text, acknowledging user, timestamp) in the same transaction as the sale, and shall show allergy reaction and severity in alerts only to users holding `patients.medical.read`. | P0 | BRQ-08, BRQ-12 | US-07-07 |
| FR-07-027 | The system shall record chronic conditions with name (≤ 200 characters), optional code (≤ 20 characters) with optional code system label (≤ 30 characters), optional onset year, and status (`Active`, `Resolved`, `EnteredInError`); the system shall not create, suggest, or infer conditions. | P1 | BRQ-08 | US-07-08 |
| FR-07-028 | The system shall record pharmacist notes (≤ 2,000 characters) as immutable entries; corrections shall be made by an amendment note referencing the original. | P1 | BRQ-08, BRQ-12 | US-07-09 |
| FR-07-029 | The system shall return a read-only medication history derived from linked sales (SPEC-06) and dispensing records (SPEC-08): medicine, quantity in base units, returned quantity, date, branch, sale number, and prescription id if any; voided sales excluded by default. | P1 | BRQ-08 | US-07-10 |
| FR-07-030 | The system shall return a read-only purchase history listing sale number, date, branch, total amount, and status of linked sales, without line items, limited to the user's assigned branches unless the user has organization-wide scope. | P1 | BRQ-08, BRQ-07 | US-07-10 |
| FR-07-031 | The system shall return read-only links to the patient's prescriptions (SPEC-08): prescription id, number, date, prescriber name, status, and dispensing progress. | P1 | BRQ-08, BRQ-09 | US-07-11 |
| FR-07-032 | The system shall return a patient interaction timeline (newest first, cursor pagination) merging profile, consent, allergy, condition, note, sale, prescription, dispensing, acknowledgement, and merge events, omitting medical event types for users without `patients.medical.read`. | P2 | BRQ-08 | US-07-12 |
| FR-07-033 | The system shall let users with `settings.organization.manage` view and change the organization settings `RequireConsentForMedicalData` (default ON), `AllergyAlertMode` (`Warn` default, `Block`), and `CollectNationalId` (default OFF), each change audited with old and new values. | P1 | BRQ-08, BRQ-15 | US-07-13 |
| FR-07-034 | When `CollectNationalId` is ON, the system shall accept an optional 14-digit national ID, store it encrypted at application level, display it masked (last 4 digits) and return the full value only through an explicit reveal action that is access-logged; when OFF, the system shall reject any national ID input with `PATIENTS.NATIONAL_ID_DISABLED`. | P2 | BRQ-08 | US-07-13 |
| FR-07-035 | The system shall detect possible duplicates at creation (same normalized phone, or same normalized name and same year of birth) and return 409 `PATIENTS.POSSIBLE_DUPLICATE` with masked candidates unless the request sets `confirmNotDuplicate = true`, and shall list organization-wide duplicate candidate pairs on demand. | P2 | BRQ-08 | US-07-14 |
| FR-07-036 | The system shall merge a source patient into a target patient: re-point allergies, conditions, notes, consents, and acknowledgements to the target, set the source status to `Merged` with `MergedIntoPatientId`, set a source allergy `Inactive` (reason "Duplicate after merge") when the target already has an `Active` allergy to the same ingredient, leave sales and prescriptions unmodified, and write one audit entry listing moved record counts, all in one transaction. | P2 | BRQ-08, BRQ-12 | US-07-15 |
| FR-07-037 | After a merge, the system shall include records of all patients merged into the target in history, timeline, and allergy checks, and shall set the target's effective consent per purpose to `Granted` only if both patients' effective consent was `Granted`. | P2 | BRQ-08 | US-07-15 |
| FR-07-038 | The system shall generate a patient data export (JSON, UTF-8) asynchronously containing demographics, consents, allergies, conditions, notes, medication history, prescription links, and acknowledgements; it shall be downloadable through a pre-signed URL valid 15 minutes and deleted 7 days after generation. | P2 | BRQ-08 | US-07-16 |
| FR-07-039 | The system shall anonymize a patient irreversibly: clear name (replaced by `Anonymized patient`), phone, email, address, date/year of birth, gender, national ID, and normalized search keys; clear free-text content of allergies, conditions, and notes; set status `Anonymized`; retain record ids, coded data (ingredient ids, severities), links from retained documents, consents, and access logs. | P2 | BRQ-08 | US-07-17 |
| FR-07-040 | The system shall reject anonymization with `PATIENTS.ANONYMIZATION_NOT_PERMITTED` while the patient has a prescription in status `PendingVerification`, `Verified`, or `PartiallyDispensed`, or any `ControlledMedicineRegisterEntry` (pending REG-02, REG-05), and shall require a reason and the patient code typed as confirmation. | P2 | BRQ-08 | US-07-17 |

## 7. Business Rules

| ID | Rule | Source |
|---|---|---|
| BR-07-001 | A patient belongs to exactly one organization and is visible to permitted users in every branch of that organization; there is no branch-level patient ownership. | BR-G-01, BRQ-02 |
| BR-07-002 | Mobile phone is required and is **not** unique: family members may share a number. Duplicate handling is by warning (FR-07-035), never by uniqueness constraint. | Analysis |
| BR-07-003 | Demographic data and medical data are authorized by separate permission families (`patients.profiles.*` vs `patients.medical.*`); holding one never implies the other. | BRQ-08 |
| BR-07-004 | Every read of medical data is access-logged; if the log cannot be written the read fails (fail closed). | BR-G-29 |
| BR-07-005 | Patients, allergies, conditions, notes, consents, acknowledgements, and access logs are never hard-deleted by application users; corrections use status changes (`Inactive`, `EnteredInError`), amendments, or anonymization. | BR-G-33, BR-G-34, BR-G-25 |
| BR-07-006 | Consent events are append-only; withdrawal is a new event. The legal basis for storing medical data is pending REG-04; until confirmed, `RequireConsentForMedicalData` defaults to ON. | REG-04 |
| BR-07-007 | Consent withdrawal for `MedicalDataStorage` blocks new medical writes; existing `Active` allergies continue to be used for allergy checks as a safety measure until OD-07-03 is decided. | Analysis, OD-07-03 |
| BR-07-008 | Allergy matching uses exact `ActiveIngredientId` equality only. No class, cross-reactivity, or name-similarity matching is performed, and free-text allergies are never auto-matched. | Vision §decision support, REG-09 |
| BR-07-009 | Allergy alerts are decision support only. In `Warn` mode they never block a sale that carries valid acknowledgements; blocking occurs only when the organization sets `AllergyAlertMode` = `Block`. | Owner scope |
| BR-07-010 | An allergy acknowledgement requires a reason code from `PrescriberConfirmed`, `PatientConfirmedTolerance`, `AllergyRecordIncorrect`, `PurchaseForAnotherPerson`, `Other`; `Other` requires reason text (5–500 characters). | Analysis |
| BR-07-011 | If the user completing a sale lacks `patients.allergy-alerts.acknowledge`, a user holding it must re-authenticate at the POS using the SPEC-01/SPEC-06 override mechanism (same as BR-G-32). | BR-G-32 |
| BR-07-012 | Medication history, purchase history, and prescription links are derived and read-only in this module; they are never edited here. | BR-G-11 |
| BR-07-013 | A `Merged` or `Anonymized` patient cannot be linked to new sales or prescriptions, edited, or merged again. Anonymization is irreversible. | Analysis |
| BR-07-014 | Audit entries and application logs never contain values of medical fields or full national IDs. | NFR-G-10, BR-G-16 |
| BR-07-015 | National ID is not collected unless `CollectNationalId` is ON; switching it OFF hides existing values from all responses but does not delete them (deletion via anonymization only). | Data minimization |
| BR-07-016 | Patient status lifecycle: `Active` ⇄ `Inactive`; `Active`/`Inactive` → `Merged` (as source); `Active`/`Inactive` → `Anonymized`. `Merged` and `Anonymized` are terminal. | Analysis |

## 8. Data Requirements

All tables are in schema `patients`, carry `Id uuid` (UUIDv7), `OrganizationId`, and audit columns per conventions §6. `Patient` uses `RowVersion` (`xmin`).

| Entity | Key fields |
|---|---|
| `Patient` | PatientCode (unique per org), FullName, NameNormalized, MobilePhoneE164, PhoneDigits (for suffix search), Email?, AddressLine?, DateOfBirth?, BirthYear?, BirthDatePrecision (`Exact`/`YearOnly`)?, Gender? (`Male`/`Female`), NationalIdEncrypted?, NationalIdLast4?, AllergyStatus (`Unknown`/`NoKnownAllergies`/`HasAllergies`), Status (`Active`/`Inactive`/`Merged`/`Anonymized`), MergedIntoPatientId?, DeactivatedAt?, AnonymizedAt?, RowVersion |
| `PatientAllergy` | PatientId, SubstanceType (`Ingredient`/`FreeText`), ActiveIngredientId?, SubstanceText?, Reaction?, Severity, Source, Status (`Active`/`Inactive`/`EnteredInError`), StatusReason?, RecordedByUserId, RecordedAt, RowVersion |
| `PatientCondition` | PatientId, Name, Code?, CodeSystem?, OnsetYear?, Status (`Active`/`Resolved`/`EnteredInError`), StatusReason?, RecordedByUserId, RecordedAt, RowVersion |
| `PatientNote` | PatientId, Text, AmendsNoteId?, AuthorUserId, BranchId (context), CreatedAt (immutable) |
| `PatientConsent` | PatientId, Purpose (`MedicalDataStorage`/`Notifications`), Status (`Granted`/`Withdrawn`), Method (`Verbal`/`Written`/`Electronic`; `SystemMerge` only for events appended by a merge per FR-07-037), Note? (≤ 500), RecordedByUserId, BranchId, RecordedAt (append-only) |
| `PatientAccessLog` | PatientId, UserId, BranchId?, AccessType (`View`/`AllergyCheck`/`Export`/`Reveal`), DataCategories (set of `AllergyStatus`, `Allergies`, `Conditions`, `Notes`, `MedicationHistory`, `Prescriptions`, `Timeline`, `Acknowledgements`, `NationalId`, `FullExport`), Endpoint, TraceId, OccurredAt (append-only) |
| `AllergyAlertAcknowledgement` (**new entity**) | PatientId, PatientAllergyId, ActiveIngredientId, MedicineId, BranchId, SaleId, SaleLineId, PrescriptionItemId?, ReasonCode, ReasonText?, AcknowledgedByUserId, AcknowledgedAt (append-only) |
| `PatientExport` (**new entity**) | PatientId, RequestedByUserId, Status (`Queued`/`Ready`/`Failed`/`Expired`), FileObjectId?, CreatedAt, ReadyAt?, ExpiresAt |

Indexes (design intent): unique `(OrganizationId, PatientCode)`; `(OrganizationId, MobilePhoneE164)`; trigram index on `NameNormalized`; reverse-digit or trigram index on `PhoneDigits`; `(OrganizationId, PatientId, OccurredAt DESC)` on `PatientAccessLog`; partial unique `(PatientId, ActiveIngredientId) WHERE Status = 'Active'` on `PatientAllergy`.

### 8.1 Data classification

| Field / data set | Sensitivity | Who can read | Access-logged? |
|---|---|---|---|
| PatientCode, Status | Internal | `patients.profiles.read` | No |
| FullName | Personal | `patients.profiles.read` | No |
| MobilePhone | Personal | `patients.profiles.read` (masked in lists; full in detail) | No |
| Email, AddressLine | Personal | `patients.profiles.read` (detail only) | No |
| DateOfBirth / BirthYear | Personal | `patients.profiles.read` (lists show age only) | No |
| Gender | Personal | `patients.profiles.read` (detail only) | No |
| National ID (if enabled) | Highly sensitive personal | Masked: `patients.profiles.read`; full: `patients.profiles.manage` via reveal | Yes (`Reveal`) |
| Consents | Personal | `patients.profiles.read` | No |
| AllergyStatus | Health | `patients.medical.read` | Yes |
| Allergies | Health | `patients.medical.read` | Yes |
| Allergy match at POS (minimized) | Health | `sales.pos.sell` or `prescriptions.dispense` in the branch | Yes (`AllergyCheck`) |
| Conditions | Health | `patients.medical.read` | Yes |
| Pharmacist notes | Health (restricted) | `patients.medical.read` | Yes |
| Medication history | Health | `patients.medical.read` | Yes |
| Prescription links | Health | `patients.medical.read` + `prescriptions.prescriptions.read` | Yes |
| Purchase history (totals only) | Personal / financial | `patients.profiles.read` + `sales.sales.read` | No |
| Timeline (medical event types) | Health | `patients.medical.read` | Yes |
| Allergy acknowledgements | Health | `patients.medical.read` | Yes |
| PatientAccessLog | Security | `patients.access-logs.read` | Audited (AuditLog) |
| Patient export file | Health (full record) | `patients.data.export` | Yes (`Export`) |

## 9. Validation Rules

| ID | Field / Object | Rule | Error code |
|---|---|---|---|
| VR-07-001 | `fullName` | Required; 2–150 characters after trim; letters (Arabic/Latin), spaces, `.`, `'`, `-` only; no digits | `PATIENTS.INVALID_NAME` |
| VR-07-002 | `mobilePhone` | Required; normalizes per FR-07-002; Egyptian mobile = `+20` followed by `10`, `11`, `12`, or `15` and 8 digits | `PATIENTS.INVALID_PHONE` |
| VR-07-003 | `email` | Optional; ≤ 254 characters; RFC 5322 address syntax (single address) | `PATIENTS.INVALID_EMAIL` |
| VR-07-004 | `addressLine` | Optional; ≤ 250 characters | `PATIENTS.INVALID_ADDRESS` |
| VR-07-005 | `dateOfBirth` / `birthYear` / `approximateAgeYears` | At most one supplied; date not in the future (branch business date); age 0–130; year between current year − 130 and current year | `PATIENTS.INVALID_BIRTH_DATE` |
| VR-07-006 | `gender` | Optional; one of `Male`, `Female` | `PATIENTS.INVALID_GENDER` |
| VR-07-007 | `nationalId` | Rejected when `CollectNationalId` is OFF | `PATIENTS.NATIONAL_ID_DISABLED` |
| VR-07-008 | `nationalId` | When ON: exactly 14 digits (Arabic-Indic digits normalized) | `PATIENTS.INVALID_NATIONAL_ID` |
| VR-07-009 | Search `q` | Name tokens ≥ 2 characters; phone digits 6–15; at least one of `q`, `phone`, `code` | `PATIENTS.SEARCH_TERM_TOO_SHORT` |
| VR-07-010 | Allergy substance | Exactly one of `activeIngredientId` or `substanceText` (1–200 characters) | `PATIENTS.ALLERGY_SUBSTANCE_REQUIRED` |
| VR-07-011 | Allergy `activeIngredientId` | Must exist in the organization's catalog | `PATIENTS.INGREDIENT_NOT_FOUND` |
| VR-07-012 | Allergy duplicate | No other `Active` allergy to the same ingredient for the patient | `PATIENTS.DUPLICATE_ALLERGY` |
| VR-07-013 | Allergy `severity` / `source` | Values from the enumerations in FR-07-013 | `PATIENTS.INVALID_ALLERGY_FIELD` |
| VR-07-014 | Allergy `reaction` | Optional; ≤ 500 characters | `PATIENTS.INVALID_ALLERGY_FIELD` |
| VR-07-015 | Status change `reason` (allergy/condition/deactivation) | Required; 5–500 characters | `PATIENTS.REASON_REQUIRED` |
| VR-07-016 | Allergy status `NoKnownAllergies` | Rejected while any `Active` allergy exists | `PATIENTS.ALLERGY_STATUS_CONFLICT` |
| VR-07-017 | Medical write consent | Effective `MedicalDataStorage` consent `Granted` when `RequireConsentForMedicalData` ON | `PATIENTS.CONSENT_REQUIRED` |
| VR-07-018 | Consent event | `purpose`, `status`, `method` from enumerations; status must differ from current effective status | `PATIENTS.CONSENT_STATE_UNCHANGED` |
| VR-07-019 | Condition | `name` 1–200; `code` ≤ 20; `codeSystem` ≤ 30; `onsetYear` ≤ current year and ≥ birth year when known | `PATIENTS.INVALID_CONDITION` |
| VR-07-020 | Note | `text` 1–2,000 characters; `amendsNoteId` must belong to the same patient | `PATIENTS.INVALID_NOTE` |
| VR-07-021 | Acknowledgement | `reasonCode` from BR-07-010; `reasonText` 5–500 when `Other` | `PATIENTS.ALLERGY_ACK_REASON_REQUIRED` |
| VR-07-022 | Allergy check | 1–100 medicine ids, each in the organization's catalog | `PATIENTS.INVALID_ALLERGY_CHECK` |
| VR-07-023 | Patient state for writes/link | Status must be `Active` (writes/link) | `PATIENTS.PATIENT_INACTIVE`, `PATIENTS.PATIENT_MERGED`, `PATIENTS.PATIENT_ANONYMIZED` |
| VR-07-024 | Merge | Source ≠ target; both `Active` or `Inactive` | `PATIENTS.MERGE_SAME_PATIENT`, `PATIENTS.MERGE_NOT_ALLOWED` |
| VR-07-025 | Anonymize | `confirmationCode` equals patient code; `reason` 5–500 characters | `PATIENTS.ANONYMIZE_CONFIRMATION_MISMATCH`, `PATIENTS.REASON_REQUIRED` |
| VR-07-026 | Updates | `If-Match` header required and current | 428 `COMMON.PRECONDITION_REQUIRED` / 412 `COMMON.CONCURRENCY_CONFLICT` |

## 10. API Requirements

Org-level resources use `/api/v1/patients` (organization from token). Branch context for access logs and acknowledgements is taken from the `X-Branch-Id` header (validated against assignments) on org-level endpoints, and from the route on branch-scoped endpoints.

| Method | Path | Purpose | Permission | Idempotency |
|---|---|---|---|---|
| POST | `/api/v1/patients` | Create patient (also POS quick-create) | `patients.profiles.manage` | Optional |
| GET | `/api/v1/patients` | Search (`q`, `phone`, `code`, `includeInactive`, `page`, `pageSize`) | `patients.profiles.read` | — |
| GET | `/api/v1/patients/{patientId}` | Demographics detail (+ ETag) | `patients.profiles.read` | — |
| PUT | `/api/v1/patients/{patientId}` | Update demographics (`If-Match`) | `patients.profiles.manage` | — |
| POST | `/api/v1/patients/{patientId}/deactivate` · `/reactivate` | Change active state | `patients.profiles.manage` | — |
| POST | `/api/v1/patients/{patientId}/national-id/reveal` | Reveal full national ID | `patients.profiles.manage` | — |
| GET · POST | `/api/v1/patients/{patientId}/consents` | Consent history · record consent event | `patients.profiles.read` · `patients.profiles.manage` | — |
| GET | `/api/v1/patients/{patientId}/allergies` | Allergy status + allergies (`includeInactive`) | `patients.medical.read` | — |
| POST | `/api/v1/patients/{patientId}/allergies` | Record allergy | `patients.medical.manage` | Optional |
| PUT | `/api/v1/patients/{patientId}/allergies/{allergyId}` | Edit reaction/severity/source (`If-Match`) | `patients.medical.manage` | — |
| POST | `/api/v1/patients/{patientId}/allergies/{allergyId}/status` | Set `Active`/`Inactive`/`EnteredInError` with reason | `patients.medical.manage` | — |
| PUT | `/api/v1/patients/{patientId}/allergy-status` | Set `NoKnownAllergies` / `Unknown` | `patients.medical.manage` | — |
| GET · POST | `/api/v1/patients/{patientId}/conditions` | List · record condition | `patients.medical.read` · `patients.medical.manage` | — |
| PUT · POST | `/api/v1/patients/{patientId}/conditions/{conditionId}` · `/status` | Edit · change status | `patients.medical.manage` | — |
| GET · POST | `/api/v1/patients/{patientId}/notes` | List · add note or amendment | `patients.medical.read` · `patients.medical.manage` | — |
| GET | `/api/v1/patients/{patientId}/medication-history` | Derived medication history | `patients.medical.read` | — |
| GET | `/api/v1/patients/{patientId}/purchase-history` | Linked sales (totals only) | `patients.profiles.read` + `sales.sales.read` | — |
| GET | `/api/v1/patients/{patientId}/prescriptions` | Prescription links | `patients.medical.read` + `prescriptions.prescriptions.read` | — |
| GET | `/api/v1/patients/{patientId}/allergy-acknowledgements` | Acknowledgement history | `patients.medical.read` | — |
| GET | `/api/v1/patients/{patientId}/timeline` | Interaction timeline (cursor) | `patients.profiles.read` (+ `patients.medical.read` for medical events) | — |
| GET | `/api/v1/patients/{patientId}/access-logs` | Access log (cursor) | `patients.access-logs.read` | — |
| POST | `/api/v1/branches/{branchId}/patients/{patientId}/allergy-checks` | Allergy check for medicine ids | `sales.pos.sell` or `prescriptions.dispense` | — |
| GET | `/api/v1/patients/duplicate-candidates` | Duplicate candidate pairs | `patients.profiles.merge` | — |
| POST | `/api/v1/patients/{targetPatientId}/merge` | Merge `sourcePatientId` into target | `patients.profiles.merge` | **Required** |
| POST · GET | `/api/v1/patients/{patientId}/exports` · `/exports/{exportId}` | Request export · status + download URL | `patients.data.export` | **Required** (POST) |
| POST | `/api/v1/patients/{patientId}/anonymize` | Anonymize | `patients.data.anonymize` | **Required** |
| GET · PUT | `/api/v1/settings/patients` | Patient privacy settings | `settings.organization.manage` | — |

Module facade (in-process, ADR-001) consumed by SPEC-06/08/10: `ValidatePatientForLink`, `CheckAllergies`, `RecordAllergyAcknowledgements` (joins the caller's transaction), `GetNotificationConsent`, `ResolveSurvivingPatient`.

Example — allergy check response (user without `patients.medical.read`):

```json
{
  "patientId": "0192f0c4-7a1e-7c3e-9a51-2b6f1d0e4a10",
  "mode": "Warn",
  "matches": [
    {
      "medicineId": "0192f0c4-8b2d-7d10-a1c2-55aa0e9b7731",
      "allergyId": "0192f0c4-9c3e-7e20-b2d3-66bb1fac8842",
      "ingredientName": "Amoxicillin",
      "severity": null,
      "reaction": null,
      "detailRestricted": true
    }
  ],
  "unmatchedFreeTextAllergyCount": 1,
  "allergyStatus": "HasAllergies",
  "disclaimer": "Decision support only. Exact ingredient match; no cross-reactivity checked."
}
```

Example — sale completion fragment carried to SPEC-06 (acknowledgements):

```json
{
  "patientId": "0192f0c4-7a1e-7c3e-9a51-2b6f1d0e4a10",
  "allergyAcknowledgements": [
    {
      "medicineId": "0192f0c4-8b2d-7d10-a1c2-55aa0e9b7731",
      "allergyId": "0192f0c4-9c3e-7e20-b2d3-66bb1fac8842",
      "reasonCode": "PrescriberConfirmed",
      "reasonText": null,
      "overrideToken": "opaque-override-token-from-SPEC-01"
    }
  ]
}
```

## 11. Authorization Requirements

1. Every endpoint enforces permission + organization (from token) on the backend (BR-G-17). A patient id from another organization returns **404 `PATIENTS.NOT_FOUND`** with no data (CS-08).
2. Missing permission within the organization returns **403 `COMMON.FORBIDDEN`**; responses never partially include medical data for a user lacking `patients.medical.read` except the minimized allergy match (FR-07-026).
3. Branch-scoped allergy-check: `branchId` must be in the user's assigned branches or the user must have organization-wide scope; otherwise **403** (CS-07).
4. Org-level endpoints that record branch context (`X-Branch-Id`) reject a branch not assigned to the user with 403.
5. Purchase history is limited to the user's assigned branches; medication history and other medical data are org-wide for holders of `patients.medical.read` (OD-07-04). Opening a linked sale still enforces SPEC-06 branch authorization.
6. Allergy acknowledgement is attributed to the user whose identity is proven by the session or override token, never to a user id supplied in the payload.
7. `PLATFORM_ADMIN` has no access to patient endpoints (SPEC-02).

## 12. Error Handling

Responses use RFC 9457 Problem Details with `code`, `traceId`, `errors`. Messages are localized (`ar`/`en`); error responses never echo medical field values.

| Error code | HTTP | Meaning |
|---|---|---|
| `PATIENTS.NOT_FOUND` | 404 | Patient (or sub-record) not found in caller's organization |
| `COMMON.FORBIDDEN` | 403 | Missing permission or branch not assigned |
| `PATIENTS.INVALID_NAME`, `PATIENTS.INVALID_PHONE`, `PATIENTS.INVALID_EMAIL`, `PATIENTS.INVALID_ADDRESS`, `PATIENTS.INVALID_BIRTH_DATE`, `PATIENTS.INVALID_GENDER`, `PATIENTS.INVALID_NATIONAL_ID` | 400 | Field validation |
| `PATIENTS.NATIONAL_ID_DISABLED` | 400 | National ID supplied while collection is OFF |
| `PATIENTS.SEARCH_TERM_TOO_SHORT` | 400 | Search input below minimums |
| `PATIENTS.ALLERGY_SUBSTANCE_REQUIRED`, `PATIENTS.INVALID_ALLERGY_FIELD`, `PATIENTS.INVALID_CONDITION`, `PATIENTS.INVALID_NOTE`, `PATIENTS.INVALID_ALLERGY_CHECK`, `PATIENTS.REASON_REQUIRED`, `PATIENTS.ALLERGY_ACK_REASON_REQUIRED`, `PATIENTS.MERGE_SAME_PATIENT`, `PATIENTS.ANONYMIZE_CONFIRMATION_MISMATCH` | 400 | Validation |
| `PATIENTS.INGREDIENT_NOT_FOUND` | 422 | Ingredient id not in organization catalog |
| `PATIENTS.DUPLICATE_ALLERGY` | 409 | Active allergy to the same ingredient exists |
| `PATIENTS.ALLERGY_STATUS_CONFLICT` | 409 | `NoKnownAllergies` while active allergies exist |
| `PATIENTS.CONSENT_REQUIRED` | 422 | Medical write without granted consent |
| `PATIENTS.CONSENT_STATE_UNCHANGED` | 409 | Consent event does not change effective status |
| `PATIENTS.PATIENT_INACTIVE`, `PATIENTS.PATIENT_MERGED`, `PATIENTS.PATIENT_ANONYMIZED` | 422 | Patient state forbids the operation (`PATIENT_MERGED` includes `survivingPatientId`) |
| `PATIENTS.POSSIBLE_DUPLICATE` | 409 | Duplicate candidates found (masked candidates in `candidates`) |
| `PATIENTS.MERGE_NOT_ALLOWED` | 409 | Patient state forbids merge |
| `PATIENTS.ALLERGY_ACKNOWLEDGEMENT_REQUIRED` | 422 | Unacknowledged allergy matches at sale/dispensing (`matches` list) |
| `PATIENTS.ALLERGY_BLOCKED` | 422 | `Block` mode and a matched medicine present |
| `PATIENTS.ANONYMIZATION_NOT_PERMITTED` | 409 | Active prescriptions or controlled-register entries exist |
| `PATIENTS.EXPORT_NOT_READY` | 409 | Export still `Queued` |
| `PATIENTS.EXPORT_EXPIRED` | 410 | Export file deleted after 7 days |
| `PATIENTS.ACCESS_LOG_UNAVAILABLE` | 503 | Access log write failed; no medical data returned |
| `COMMON.PRECONDITION_REQUIRED` | 428 | `If-Match` missing |
| `COMMON.CONCURRENCY_CONFLICT` | 412 | ETag mismatch |
| `COMMON.IDEMPOTENCY_KEY_REUSED` | 422 | Same key, different request hash |
| `COMMON.VALIDATION_FAILED` | 400 | Generic request validation (enumerations, pagination, ranges, missing `Idempotency-Key`) |
| `COMMON.RATE_LIMITED` | 429 | Search rate limit (60 requests/minute/user) exceeded |
| (none) | 405 | Write verb on immutable/read-only resource (notes, histories, `DELETE` on patients/allergies/conditions) |

## 13. Edge Cases

1. Two family members share one phone: search by phone returns both; creation with the same phone raises a duplicate warning (P2) that can be confirmed.
2. Patient gives approximate age "about 60": stored as `BirthYear` with `YearOnly` precision; age displayed as computed from year.
3. Name entered as "أحمد" and searched as "احمد" or "أَحْمَد": matches via normalization.
4. Phone entered with Arabic-Indic digits "٠١٠١٢٣٤٥٦٧٨": normalized to `+201012345678`.
5. Allergy to an ingredient later deactivated in the catalog: the allergy remains `Active` and still matches medicines containing that ingredient id.
6. Medicine with multiple ingredients, two of which match two allergies: two matches returned; each needs its own acknowledgement.
7. Sale with no linked patient: no allergy check is performed; the system does not infer patients.
8. Patient linked after the cashier already added lines: the client re-runs the check; the server re-checks at completion regardless.
9. Allergy recorded between the POS check and sale completion: server re-check returns `ALLERGY_ACKNOWLEDGEMENT_REQUIRED` with the new match.
10. Consent withdrawn while allergies exist: allergies still checked (BR-07-007); new medical writes blocked.
11. Patient merged while a cashier has the source in the cart: completion fails with `PATIENTS.PATIENT_MERGED` and `survivingPatientId`.
12. `CollectNationalId` switched OFF after values were stored: values hidden in all responses and exports show `"nationalId": "hidden-by-setting"`; reveal returns `NATIONAL_ID_DISABLED`.
13. Access-log storage failure during POS allergy check: check returns 503; the client shows "allergy check unavailable — pharmacist review required" and server completion re-check also fails closed (sale with linked patient cannot complete until the check succeeds or the patient is unlinked).
14. Export requested for a patient with > 5,000 history entries: export still completes; NFR-07-005 applies to ≤ 5,000.
15. Anonymized patient referenced by historical sales: sales show "Anonymized patient" and patient code.

## 14. Acceptance Criteria

| ID | Criterion |
|---|---|
| SAC-07-01 | A patient can be created with name + phone in any accepted format and found by phone, normalized name, or code; lists never show medical data or full phone numbers. |
| SAC-07-02 | Medical data cannot be read without `patients.medical.read`, and every read produces exactly one `PatientAccessLog` entry per request; failures to log block the read. |
| SAC-07-03 | Allergies are recorded with structured fields, never hard-deleted, and drive exact-ingredient alerts at POS/dispensing that require acknowledgement in `Warn` mode and block in `Block` mode. |
| SAC-07-04 | With `RequireConsentForMedicalData` ON, medical data cannot be written without granted consent. |
| SAC-07-05 | Merge, export, and anonymization are audited, idempotent, and respect the preconditions in FR-07-036–FR-07-040. |
| SAC-07-06 | Cross-organization access to any patient endpoint returns 404 with no data (CS-08); cross-branch allergy checks return 403 (CS-07). |

## 15. Dependencies

| Depends on | For |
|---|---|
| SPEC-01 Identity & Access | Authentication, permissions, POS re-authentication override token (BR-07-011) |
| SPEC-02 Organization & Branches | Organization/branch context, branch time zone, support-grant exclusions |
| SPEC-03 Medicine Catalog | `ActiveIngredient`, `MedicineIngredient` for allergy references and matching |
| SPEC-06 Sales & POS | Sale patient link, sale completion invoking allergy re-check and acknowledgement persistence; sale data for histories |
| SPEC-08 Prescriptions | Prescription links, dispensing records, allergy check at dispensing |
| SPEC-10 Notifications, Audit & Settings | `AuditLog`, `OrganizationSettings`, `FileObject`, background jobs, notification consent consumer |

Consumers: SPEC-06, SPEC-08, SPEC-09 (no patient data in finance reports), SPEC-10.

## 16. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-07-001 | Patient search (phone, name, code) p95 ≤ 300 ms server time at 500,000 patients per organization. |
| NFR-07-002 | Allergy check for ≤ 50 medicines p95 ≤ 200 ms server time, including the access-log write. |
| NFR-07-003 | Access-log write adds ≤ 20 ms p95 to the read request; 100% of medical-data responses have a matching log entry (verified by automated test comparing responses vs. log rows). |
| NFR-07-004 | Arabic name normalization passes a reviewed test corpus of ≥ 200 query/name pairs with 100% expected results. |
| NFR-07-005 | Patient export for ≤ 5,000 history entries completes within 60 s of request (p95). |
| NFR-07-006 | Anonymization of one patient completes within 10 s and leaves zero personal fields listed in FR-07-039 non-null (verified by automated scan). |
| NFR-07-007 | National ID values are encrypted with a key held outside the database (key management per ADR on secrets); database dumps contain no plaintext national IDs. |
| NFR-07-008 | Application logs, traces, and error responses contain no medical field values, phone numbers in full, or national IDs (NFR-G-10); verified by log-scanning test on the integration suite. |
| NFR-07-009 | `PatientAccessLog` and `AllergyAlertAcknowledgement` are append-only: application database role has no UPDATE/DELETE privilege on these tables. |
| NFR-07-010 | Patient screens meet WCAG 2.2 AA and render correctly in `ar` (RTL) and `en` (LTR). |

## 17. Security and Privacy Considerations

- **Data minimization:** only fields in §8 are stored; §4.1 lists deliberately excluded data. National ID OFF by default.
- **Separation of duties:** demographic vs. medical permission families; access-log review restricted to `patients.access-logs.read`.
- **Access logging:** every medical read logged and fail-closed (BR-07-004); access logs reviewable per patient.
- **Masking:** lists show last 4 phone digits and age only; national ID masked except on audited reveal.
- **Audit:** all writes audited without medical values (BR-07-014).
- **Encryption:** TLS in transit; storage encryption at rest; application-level encryption for national ID.
- **Export files:** private bucket, pre-signed URLs of 15 minutes, auto-deletion after 7 days (ADR-006).
- **Anonymization over deletion:** respects BR-G-33/BR-G-34; retention periods pending REG-05.
- **Consent and legal basis:** pending REG-04; the product does not claim compliance with any data protection law.
- **Cross-border transfer / data residency** of patient data: pending REG-04 (OD-07-11).
- **Rate limiting:** search endpoints limited to 60 requests/minute/user to reduce enumeration by phone suffix.
- **Decision support disclaimer:** allergy alerts show "Decision support only — exact ingredient match; no cross-reactivity checked."

## 18. Testing Considerations

- Test scenarios are declared in EPIC-07 stories as `TS-07-001` … `TS-07-115`.
- Mandatory cross-cutting coverage: CS-07 (cross-branch allergy check → 403) and CS-08 (cross-organization patient access → 404, no data) on every endpoint family; CS-11 for merge/anonymize/export idempotency.
- Access-log completeness test: for each medical endpoint, assert exactly one log row per successful response and zero medical data on log-failure injection.
- Arabic normalization corpus (NFR-07-004) maintained as test data and reviewed by an Arabic-speaking pharmacist.
- Log-scanning test (NFR-07-008) runs on the full integration suite.
- Allergy matching tests must use fixture ingredients only; no external drug data (REG-09).

## 19. Open Decisions

| ID | Decision needed | Default until decided |
|---|---|---|
| OD-07-01 | Should mobile phone be optional for patients without a phone (e.g., elderly)? | Required |
| OD-07-02 | Legal basis for storing health data and whether explicit consent is required (REG-04). | `RequireConsentForMedicalData` = ON |
| OD-07-03 | Effect of `MedicalDataStorage` consent withdrawal on existing medical data (retain, inactivate, or anonymize medical part). | Retain; block new writes; keep allergy checks |
| OD-07-04 | Should medical/medication history be visible across all branches or only assigned branches? | Org-wide for `patients.medical.read` holders; purchase history branch-limited |
| OD-07-05 | Retention period for `PatientAccessLog`, acknowledgements, and inactive patients (REG-05). | Retain indefinitely |
| OD-07-06 | Anonymization blocking conditions and handling of patient-name snapshots on prescriptions (SPEC-08). | Block per FR-07-040; prescription snapshots unchanged |
| OD-07-07 | Support unmerge? | Not supported in v1 |
| OD-07-08 | Default seeded grants (CASHIER `patients.profiles.manage`; MANAGER medical access) and whether support grants may ever include medical data. | As §5.2; support grants exclude medical data |
| OD-07-09 | Export format: JSON only, or also bilingual PDF. | JSON only |
| OD-07-10 | Structured pregnancy/lactation and weight fields for decision support. | Not collected |
| OD-07-11 | Data residency and cross-border hosting of patient data (REG-04). | Pending hosting decision |

Candidate assumptions (to be registered as `A-NN`): (1) Egyptian patients are identified primarily by mobile number; (2) the SPEC-01 POS override mechanism can carry an allergy-acknowledgement scope; (3) SPEC-03 maintains `MedicineIngredient` for the medicines in scope of alerts — medicines without ingredient data produce no matches and the UI states "no ingredient data".

## 20. Regulatory Review Items

REG-04, REG-05, REG-02 (anonymization blocked by controlled-medicine register entries), REG-09 (any external allergy/ingredient data source), REG-01 (prescription retention affecting anonymization), REG-10 (only insofar as prescription images are included in exports — excluded in v1).
