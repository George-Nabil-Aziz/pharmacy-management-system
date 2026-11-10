# US-07-11: View Prescription History Links

| Field | Value |
|---|---|
| Story ID | US-07-11 |
| Epic | EPIC-07 |
| Priority | P1 |
| Complexity | S |
| Related Requirements | FR-07-017, FR-07-031 |
| Related Business Rules | BR-G-29, BR-07-012 |
| Dependencies | US-07-05; external: SPEC-08 prescription query facade |

## User Story
As a pharmacist, I want to see a patient's previous prescriptions from the patient record so that I can open them and check dispensing progress.

## Business Value
Connects the patient record to SPEC-08 without duplicating prescription data.

## Preconditions
- Prescriptions linked to the patient exist (SPEC-08).

## Acceptance Criteria
### US-07-11-AC1: List prescription links
- **Given** P has 2 prescriptions (`Verified`, `PartiallyDispensed`)
- **When** a pharmacist with `patients.medical.read` and `prescriptions.prescriptions.read` GETs `/api/v1/patients/{P}/prescriptions`
- **Then** both are returned with id, number, date, prescriber name, status, and dispensing progress (dispensed vs prescribed items), newest first, and one access-log row with category "Prescriptions" is written

### US-07-11-AC2: Both permissions required
- **Given** a user with `patients.medical.read` but without `prescriptions.prescriptions.read`
- **When** they request the list
- **Then** the response is 403 `COMMON.FORBIDDEN` and no access-log row is written

### US-07-11-AC3: Read-only links
- **Given** the list response
- **When** inspected
- **Then** it contains no editable fields and no prescription images; opening a prescription navigates to SPEC-08 endpoints

### US-07-11-AC4: Cross-organization (CS-08)
- **Given** P belongs to organization A
- **When** a user of organization B requests P's prescriptions
- **Then** the response is 404 `PATIENTS.NOT_FOUND`

## Validation Rules
Optional `status` filter values from the canonical Prescription status enum; pagination `pageSize` ≤ 100.

## Authorization Rules
- `patients.medical.read` + `prescriptions.prescriptions.read`; logged.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Invalid status filter | 400 `COMMON.VALIDATION_FAILED` |
| Missing either permission | 403 `COMMON.FORBIDDEN` |
| Access-log failure | 503 `PATIENTS.ACCESS_LOG_UNAVAILABLE` |
| Other organization | 404 `PATIENTS.NOT_FOUND` |

## Edge Cases
- `Cancelled` and `Expired` prescriptions are included and labelled.
- Patient with no prescriptions returns an empty list (200) and still writes an access-log row.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-07-075 | Integration | List with progress; logged | US-07-11-AC1 |
| TS-07-076 | Security | Missing prescriptions permission → 403, no log | US-07-11-AC2 |
| TS-07-077 | Contract | Response contains no images or editable fields | US-07-11-AC3 |
| TS-07-078 | Security | CS-08 → 404 | US-07-11-AC4 |
