# US-07-01: Create and Maintain Patient Profile

| Field | Value |
|---|---|
| Story ID | US-07-01 |
| Epic | EPIC-07 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-07-001, FR-07-002, FR-07-003, FR-07-004, FR-07-005 |
| Related Business Rules | BR-G-33, BR-G-16, BR-07-001, BR-07-002, BR-07-005, BR-07-015, BR-07-016 |
| Dependencies | None within epic; external: SPEC-01 authentication/permissions, SPEC-02 organization context, SPEC-10 audit log |

## User Story
As a pharmacist, I want to create and update a minimal patient profile identified by mobile phone so that I can recognize returning patients across all branches of my organization.

## Business Value
Gives every later patient feature (allergies, sale linking, history) a single organization-level identity while collecting only the demographics needed to identify the patient.

## Preconditions
- The user is authenticated and belongs to an organization with at least one active branch.
- Organization setting `CollectNationalId` exists (default OFF).

## Acceptance Criteria
### US-07-01-AC1: Create patient with normalized phone
- **Given** a user with `patients.profiles.manage`
- **When** they POST `/api/v1/patients` with `fullName` "منى عبد الله" and `mobilePhone` "0101 234-5678"
- **Then** the response is 201 with `mobilePhone` "+201012345678", a `patientCode` matching `PAT-\d{6}` unique in the organization, `status` "Active", `allergyStatus` "Unknown", and an `ETag` header

### US-07-01-AC2: Approximate age stored as year of birth
- **Given** a user with `patients.profiles.manage` and branch business date 2026-11-09
- **When** they create a patient with `approximateAgeYears` = 60
- **Then** the patient is stored with `birthYear` = 1966, `birthDatePrecision` = "YearOnly", and `dateOfBirth` = null

### US-07-01-AC3: Invalid phone rejected
- **Given** a user with `patients.profiles.manage`
- **When** they create a patient with `mobilePhone` "0131234567"
- **Then** the response is 400 `PATIENTS.INVALID_PHONE` and no patient or patient code is created

### US-07-01-AC4: Update with stale ETag rejected
- **Given** patient P was updated by another user after the caller read ETag E1
- **When** the caller PUTs `/api/v1/patients/{P}` with `If-Match: E1`
- **Then** the response is 412 `COMMON.CONCURRENCY_CONFLICT` and the stored data is unchanged

### US-07-01-AC5: Successful update is audited without values
- **Given** a user with `patients.profiles.manage` and the current ETag
- **When** they change `email` and `addressLine`
- **Then** the response is 200 with a new ETag and one audit entry lists changed fields `["email","addressLine"]`

### US-07-01-AC6: Deactivate and reactivate; no hard delete
- **Given** an `Active` patient P
- **When** the user POSTs `/deactivate` with reason "Moved abroad" and later `/reactivate`
- **Then** status becomes `Inactive` then `Active`, both changes are audited, and `DELETE /api/v1/patients/{P}` returns 405

### US-07-01-AC7: National ID rejected while collection is OFF
- **Given** `CollectNationalId` is OFF
- **When** a patient is created with `nationalId` "29001011234567"
- **Then** the response is 400 `PATIENTS.NATIONAL_ID_DISABLED` and no patient is created

### US-07-01-AC8: Permission denied
- **Given** an `INVENTORY` user without `patients.profiles.manage`
- **When** they POST `/api/v1/patients`
- **Then** the response is 403 `COMMON.FORBIDDEN`

### US-07-01-AC9: Cross-organization access hidden (CS-08)
- **Given** patient P belongs to organization A
- **When** a user of organization B with all patient permissions GETs or PUTs `/api/v1/patients/{P}`
- **Then** the response is 404 `PATIENTS.NOT_FOUND` with no patient data

## Validation Rules
VR-07-001, VR-07-002, VR-07-003, VR-07-004, VR-07-005, VR-07-006, VR-07-007, VR-07-015 (deactivation reason), VR-07-026.

## Authorization Rules
- Create/update/deactivate/reactivate: `patients.profiles.manage`. Read detail: `patients.profiles.read`.
- Organization from token; foreign ids → 404.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Name with digits or < 2 characters | 400 `PATIENTS.INVALID_NAME` |
| Invalid phone | 400 `PATIENTS.INVALID_PHONE` |
| Both `dateOfBirth` and `birthYear` supplied, or future date | 400 `PATIENTS.INVALID_BIRTH_DATE` |
| National ID while OFF | 400 `PATIENTS.NATIONAL_ID_DISABLED` |
| Missing `If-Match` on update | 428 `COMMON.PRECONDITION_REQUIRED` |
| Stale ETag | 412 `COMMON.CONCURRENCY_CONFLICT` |
| Update of `Merged`/`Anonymized` patient | 422 `PATIENTS.PATIENT_MERGED` / `PATIENTS.PATIENT_ANONYMIZED` |
| Missing permission | 403 `COMMON.FORBIDDEN` |
| Other organization's patient | 404 `PATIENTS.NOT_FOUND` |

## Edge Cases
- Phone entered with Arabic-Indic digits "٠١٠١٢٣٤٥٦٧٨" → "+201012345678".
- Same phone as an existing patient is accepted (BR-07-002); duplicate warnings are added in US-07-14.
- Age 0 (newborn) accepted → `birthYear` = current year.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-07-001 | Unit | Phone normalization table: `01012345678`, `201012345678`, `+201012345678`, `00201012345678`, Arabic-Indic digits, spaces/dashes → `+201012345678`; invalid prefixes rejected | US-07-01-AC1, US-07-01-AC3 |
| TS-07-002 | Integration | Create patient returns 201, sequential `PAT-` code unique under 20 parallel creates | US-07-01-AC1 |
| TS-07-003 | Unit | Approximate age → birth year using branch time zone business date | US-07-01-AC2 |
| TS-07-004 | Integration | Stale ETag update → 412, data unchanged; missing ETag → 428 | US-07-01-AC4 |
| TS-07-005 | Integration | Update writes audit entry with field names and no values | US-07-01-AC5 |
| TS-07-006 | Integration | Deactivate/reactivate with reason; DELETE → 405 | US-07-01-AC6 |
| TS-07-007 | Integration | National ID rejected when setting OFF | US-07-01-AC7 |
| TS-07-008 | Security | 403 without permission; CS-08 cross-org GET/PUT/deactivate → 404 with empty body data | US-07-01-AC8, US-07-01-AC9 |
