# US-07-08: Manage Chronic Conditions

| Field | Value |
|---|---|
| Story ID | US-07-08 |
| Epic | EPIC-07 |
| Priority | P1 |
| Complexity | S |
| Related Requirements | FR-07-011, FR-07-017, FR-07-027 |
| Related Business Rules | BR-G-29, BR-07-003, BR-07-005, BR-07-014 |
| Dependencies | US-07-03, US-07-05 |

## User Story
As a pharmacist, I want to record chronic conditions the patient reports (for example, "Type 2 diabetes") so that I have context when counselling the patient.

## Business Value
Supports repeat chronic-medication customers. The system records what the pharmacist enters; it never creates, suggests, or infers a condition.

## Preconditions
- Patient `Active`; consent granted when required.

## Acceptance Criteria
### US-07-08-AC1: Record condition
- **Given** a pharmacist with `patients.medical.manage`
- **When** they POST `/api/v1/patients/{P}/conditions` with `name` "Hypertension", `code` "I10", `codeSystem` "ICD-10", `onsetYear` 2019
- **Then** the response is 201 with `status` "Active", `recordedBy` = caller, and an audit entry without the condition name

### US-07-08-AC2: Resolve and mark entered-in-error
- **Given** an `Active` condition C
- **When** the pharmacist sets `status` "Resolved" with reason, or "EnteredInError" with reason
- **Then** C keeps its history, is shown with the new status, and `DELETE` returns 405

### US-07-08-AC3: No inferred conditions
- **Given** P bought insulin in three linked sales
- **When** conditions are listed
- **Then** no condition exists that was not entered by a user (all rows have a human `recordedBy`)

### US-07-08-AC4: Consent required
- **Given** `RequireConsentForMedicalData` ON and P without `MedicalDataStorage` grant
- **When** a condition is posted
- **Then** the response is 422 `PATIENTS.CONSENT_REQUIRED`

### US-07-08-AC5: Invalid onset year
- **Given** P's birth year is 1980
- **When** a condition with `onsetYear` 1975 is posted
- **Then** the response is 400 `PATIENTS.INVALID_CONDITION`

### US-07-08-AC6: Read logged; permission denied
- **Given** a pharmacist with `patients.medical.read` and a cashier without it
- **When** each GETs `/conditions`
- **Then** the pharmacist receives the list and one access-log row with category "Conditions" is written; the cashier receives 403 `COMMON.FORBIDDEN`

### US-07-08-AC7: Cross-organization (CS-08)
- **Given** P belongs to organization A
- **When** a user of organization B requests P's conditions
- **Then** the response is 404 `PATIENTS.NOT_FOUND`

## Validation Rules
VR-07-015, VR-07-017, VR-07-019, VR-07-023.

## Authorization Rules
- Read: `patients.medical.read` (logged). Write: `patients.medical.manage`.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Name empty or > 200 characters | 400 `PATIENTS.INVALID_CONDITION` |
| Status change without reason | 400 `PATIENTS.REASON_REQUIRED` |
| No consent | 422 `PATIENTS.CONSENT_REQUIRED` |
| Stale ETag | 412 `COMMON.CONCURRENCY_CONFLICT` |
| Missing permission | 403 `COMMON.FORBIDDEN` |
| Other organization | 404 `PATIENTS.NOT_FOUND` |

## Edge Cases
- Code and code system are free labels; no code list is validated in v1.
- Same condition name entered twice is allowed (no deduplication); UI shows both.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-07-058 | Integration | Record condition; audit without name value | US-07-08-AC1 |
| TS-07-059 | Integration | Status lifecycle with reasons; DELETE → 405 | US-07-08-AC2 |
| TS-07-060 | Integration | No condition rows created by sales/dispensing events | US-07-08-AC3 |
| TS-07-061 | Integration | Consent gate → 422 | US-07-08-AC4 |
| TS-07-062 | Unit | Onset year validation | US-07-08-AC5 |
| TS-07-063 | Security | Logged read; 403 for cashier; CS-08 → 404 | US-07-08-AC6, US-07-08-AC7 |
