# US-07-17: Anonymize a Patient

| Field | Value |
|---|---|
| Story ID | US-07-17 |
| Epic | EPIC-07 |
| Priority | P2 |
| Complexity | M |
| Related Requirements | FR-07-039, FR-07-040 |
| Related Business Rules | BR-G-33, BR-G-34, BR-G-16, BR-07-005, BR-07-013, BR-07-016 |
| Dependencies | US-07-01, US-07-04, US-07-08, US-07-09; external: SPEC-08 prescription status facade |

## User Story
As an owner, I want to anonymize a patient who asks for their data to be erased, when permitted, so that personal data is removed while sales, prescription, and audit records required for retention stay intact.

## Business Value
Honours erasure requests where allowed without breaking referential integrity or retention duties (REG-05).

## Preconditions
- Patient is `Active` or `Inactive`.

## Acceptance Criteria
### US-07-17-AC1: Anonymize clears personal data
- **Given** an owner with `patients.data.anonymize` and patient P (code "PAT-000321") with no active prescriptions
- **When** they POST `/api/v1/patients/{P}/anonymize` with `confirmationCode` "PAT-000321", `reason` "Patient erasure request", and an `Idempotency-Key`
- **Then** within 10 s P's name becomes "Anonymized patient", phone, email, address, birth data, gender, national ID, and normalized search keys are null, free text of allergies/conditions/notes is cleared, status is `Anonymized`, and an audit entry is written without the erased values

### US-07-17-AC2: Retained data
- **Given** the anonymization in AC1
- **When** linked sales, prescriptions, consents, and access logs are queried
- **Then** they still exist and reference P's id and patient code; coded allergy data (ingredient id, severity) is retained

### US-07-17-AC3: Blocked by active prescriptions
- **Given** P has a prescription in status `PartiallyDispensed`
- **When** anonymization is requested
- **Then** the response is 409 `PATIENTS.ANONYMIZATION_NOT_PERMITTED` with `blockingReasons: ["ActivePrescription"]` and nothing changes

### US-07-17-AC4: Confirmation mismatch
- **Given** `confirmationCode` "PAT-000322" for patient "PAT-000321"
- **When** anonymization is requested
- **Then** the response is 400 `PATIENTS.ANONYMIZE_CONFIRMATION_MISMATCH`

### US-07-17-AC5: Anonymized patient is terminal
- **Given** P is `Anonymized`
- **When** a user updates P, links P to a sale, records an allergy, or searches by P's former phone
- **Then** updates/links/writes return 422 `PATIENTS.PATIENT_ANONYMIZED` and search returns no result

### US-07-17-AC6: Idempotent replay (CS-11)
- **Given** anonymization completed with key K
- **When** retried with K
- **Then** the stored response is replayed and no second audit entry is written

### US-07-17-AC7: Permission denied
- **Given** a manager without `patients.data.anonymize`
- **When** they request anonymization
- **Then** the response is 403 `COMMON.FORBIDDEN`

### US-07-17-AC8: Cross-organization (CS-08)
- **Given** P belongs to organization A
- **When** an owner of organization B requests anonymization of P
- **Then** the response is 404 `PATIENTS.NOT_FOUND` and nothing changes

## Validation Rules
VR-07-025; `Idempotency-Key` required.

## Authorization Rules
- `patients.data.anonymize`; organization from token.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Active prescription or controlled-register entry | 409 `PATIENTS.ANONYMIZATION_NOT_PERMITTED` |
| Confirmation mismatch | 400 `PATIENTS.ANONYMIZE_CONFIRMATION_MISMATCH` |
| Missing reason | 400 `PATIENTS.REASON_REQUIRED` |
| Patient already `Anonymized` or `Merged` (new key) | 422 `PATIENTS.PATIENT_ANONYMIZED` / `PATIENTS.PATIENT_MERGED` |
| Missing permission | 403 `COMMON.FORBIDDEN` |
| Other organization | 404 `PATIENTS.NOT_FOUND` |

## Edge Cases
- Anonymization of a target with merged sources also anonymizes the `Merged` source rows.
- Patient-name snapshots held on SPEC-08 prescriptions are not changed by this story (OD-07-06).
- Existing export files for P are deleted at anonymization.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-07-109 | Integration | Field scan after anonymization: all FR-07-039 personal fields null/cleared within 10 s (NFR-07-006) | US-07-17-AC1 |
| TS-07-110 | Integration | Sales, prescriptions, consents, access logs retained and linked | US-07-17-AC2 |
| TS-07-111 | Integration | Active prescription / controlled-register entry → 409 with reasons | US-07-17-AC3 |
| TS-07-112 | Integration | Confirmation mismatch → 400 | US-07-17-AC4 |
| TS-07-113 | Integration | Post-anonymization writes/links → 422; search returns nothing | US-07-17-AC5 |
| TS-07-114 | Integration | CS-11 replay | US-07-17-AC6 |
| TS-07-115 | Security | 403 without permission; CS-08 → 404 | US-07-17-AC7, US-07-17-AC8 |
