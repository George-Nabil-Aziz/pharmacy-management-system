# US-07-04: Record and Manage Patient Allergies

| Field | Value |
|---|---|
| Story ID | US-07-04 |
| Epic | EPIC-07 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-07-011, FR-07-013, FR-07-014, FR-07-015, FR-07-016, FR-07-017, FR-07-020 |
| Related Business Rules | BR-G-29, BR-G-16, BR-07-003, BR-07-005, BR-07-008, BR-07-014 |
| Dependencies | US-07-01, US-07-03, US-07-05; external: SPEC-03 `ActiveIngredient` reference data |

## User Story
As a pharmacist, I want to record a patient's allergies as structured data linked to catalog active ingredients when possible so that allergy alerts can be raised at the counter.

## Business Value
Structured allergy data is the input to POS/dispensing decision support; correct lifecycle handling keeps the record trustworthy without deleting history.

## Preconditions
- Patient `Active`; effective `MedicalDataStorage` consent `Granted` (when required).
- `ActiveIngredient` reference data exists in the organization's catalog (SPEC-03).

## Acceptance Criteria
### US-07-04-AC1: Record ingredient-based allergy
- **Given** a pharmacist with `patients.medical.manage` and patient P with `allergyStatus` "Unknown"
- **When** they POST `/api/v1/patients/{P}/allergies` with `activeIngredientId` of "Amoxicillin", `reaction` "Skin rash", `severity` "Moderate", `source` "PatientReported"
- **Then** the response is 201 with `status` "Active", `recordedBy` = caller, P's `allergyStatus` becomes "HasAllergies", and the audit entry lists field names only (no reaction text)

### US-07-04-AC2: Record free-text allergy
- **Given** the substance is not in the catalog
- **When** the pharmacist posts `substanceText` "Latex" with `severity` "Unknown"
- **Then** the allergy is stored with `substanceType` "FreeText" and `activeIngredientId` null

### US-07-04-AC3: Duplicate active ingredient allergy rejected
- **Given** P has an `Active` allergy to ingredient X
- **When** another `Active` allergy to X is posted
- **Then** the response is 409 `PATIENTS.DUPLICATE_ALLERGY`

### US-07-04-AC4: Unknown ingredient rejected
- **Given** an `activeIngredientId` from another organization or non-existent
- **When** the allergy is posted
- **Then** the response is 422 `PATIENTS.INGREDIENT_NOT_FOUND`

### US-07-04-AC5: Mark entered-in-error; no deletion
- **Given** an `Active` allergy A
- **When** the pharmacist POSTs `/allergies/{A}/status` with `status` "EnteredInError" and `reason` "Recorded on wrong patient"
- **Then** A remains stored with the new status and reason, is excluded from allergy checks, `DELETE` on A returns 405, and if no `Active` allergy remains, `allergyStatus` becomes "Unknown"

### US-07-04-AC6: No-known-allergies conflict
- **Given** P has at least one `Active` allergy
- **When** the pharmacist PUTs `/allergy-status` with "NoKnownAllergies"
- **Then** the response is 409 `PATIENTS.ALLERGY_STATUS_CONFLICT`

### US-07-04-AC7: Read is access-logged
- **Given** a user with `patients.medical.read`
- **When** they GET `/api/v1/patients/{P}/allergies`
- **Then** exactly one `PatientAccessLog` row is written with `accessType` "View" and categories `["AllergyStatus","Allergies"]`

### US-07-04-AC8: Permission denied for demographics-only user
- **Given** a cashier with `patients.profiles.read` but not `patients.medical.read`
- **When** they GET `/allergies`
- **Then** the response is 403 `COMMON.FORBIDDEN`, no allergy data is returned, and no access-log row is written

### US-07-04-AC9: Cross-organization (CS-08)
- **Given** P belongs to organization A
- **When** a pharmacist of organization B GETs or POSTs allergies for P
- **Then** the response is 404 `PATIENTS.NOT_FOUND`

## Validation Rules
VR-07-010, VR-07-011, VR-07-012, VR-07-013, VR-07-014, VR-07-015, VR-07-016, VR-07-017, VR-07-023.

## Authorization Rules
- Read: `patients.medical.read` (logged). Write: `patients.medical.manage`.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Both or neither of `activeIngredientId` / `substanceText` | 400 `PATIENTS.ALLERGY_SUBSTANCE_REQUIRED` |
| Invalid severity/source | 400 `PATIENTS.INVALID_ALLERGY_FIELD` |
| Status change without reason | 400 `PATIENTS.REASON_REQUIRED` |
| No consent (setting ON) | 422 `PATIENTS.CONSENT_REQUIRED` |
| Patient `Inactive` | 422 `PATIENTS.PATIENT_INACTIVE` |
| Stale ETag on edit | 412 `COMMON.CONCURRENCY_CONFLICT` |
| Access-log write failure on read | 503 `PATIENTS.ACCESS_LOG_UNAVAILABLE` |

## Edge Cases
- Reactivating an `Inactive` allergy when another `Active` one to the same ingredient exists → 409 `PATIENTS.DUPLICATE_ALLERGY`.
- Ingredient deactivated in catalog after recording: allergy stays valid.
- `EnteredInError` allergies are shown only with `includeInactive=true`.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-07-024 | Integration | Record ingredient allergy; allergy status derived; audit without values | US-07-04-AC1 |
| TS-07-025 | Integration | Free-text allergy stored | US-07-04-AC2 |
| TS-07-026 | Integration | Duplicate active ingredient → 409 (partial unique index under 2 parallel posts) | US-07-04-AC3 |
| TS-07-027 | Integration | Foreign/unknown ingredient → 422 | US-07-04-AC4 |
| TS-07-028 | Integration | EnteredInError lifecycle, DELETE → 405, status recomputed | US-07-04-AC5 |
| TS-07-029 | Integration | NKA rejected with active allergy; accepted when none | US-07-04-AC6 |
| TS-07-030 | Integration | One access-log row per GET with correct categories | US-07-04-AC7 |
| TS-07-031 | Security | 403 for profiles-only user, no log row; CS-08 → 404 | US-07-04-AC8, US-07-04-AC9 |
