# US-07-03: Record Patient Consent for Medical Data and Notifications

| Field | Value |
|---|---|
| Story ID | US-07-03 |
| Epic | EPIC-07 |
| Priority | P0 |
| Complexity | S |
| Related Requirements | FR-07-010, FR-07-011, FR-07-012 |
| Related Business Rules | BR-07-005, BR-07-006, BR-07-007, BR-G-16 |
| Dependencies | US-07-01 |

## User Story
As a pharmacist, I want to record when a patient grants or withdraws consent for storing medical data and for receiving notifications so that the pharmacy only stores and uses data the patient has agreed to.

## Business Value
Provides a purpose-based, append-only consent history pending legal confirmation of the legal basis (REG-04).

## Preconditions
- Patient exists and is `Active`.
- `RequireConsentForMedicalData` is ON (default).

## Acceptance Criteria
### US-07-03-AC1: Record consent grant
- **Given** patient P with no consent events
- **When** a user with `patients.profiles.manage` POSTs `/api/v1/patients/{P}/consents` with `purpose` "MedicalDataStorage", `status` "Granted", `method` "Verbal"
- **Then** the response is 201, the event records the user, branch context, and timestamp, and GET `/consents` shows effective `MedicalDataStorage` = "Granted"

### US-07-03-AC2: Withdrawal is a new event
- **Given** P has effective `Notifications` = "Granted"
- **When** the user records `Notifications` = "Withdrawn"
- **Then** the consent history contains both events in order, the effective status is "Withdrawn", and no event is modified or deleted

### US-07-03-AC3: Unchanged state rejected
- **Given** P has effective `MedicalDataStorage` = "Granted"
- **When** the user records "Granted" again for the same purpose
- **Then** the response is 409 `PATIENTS.CONSENT_STATE_UNCHANGED`

### US-07-03-AC4: Medical write blocked without consent
- **Given** `RequireConsentForMedicalData` is ON and P has no `MedicalDataStorage` grant
- **When** a pharmacist POSTs an allergy for P
- **Then** the response is 422 `PATIENTS.CONSENT_REQUIRED` and no allergy is stored

### US-07-03-AC5: Notification consent exposed to SPEC-10
- **Given** P's effective `Notifications` = "Withdrawn"
- **When** SPEC-10 calls the facade `GetNotificationConsent(P)`
- **Then** it returns "Withdrawn" and SPEC-10 sends no patient-directed notification

### US-07-03-AC6: Permission denied
- **Given** a user with `patients.profiles.read` only
- **When** they POST a consent event
- **Then** the response is 403 `COMMON.FORBIDDEN`

### US-07-03-AC7: Cross-organization (CS-08)
- **Given** P belongs to organization A
- **When** a user from organization B GETs or POSTs `/api/v1/patients/{P}/consents`
- **Then** the response is 404 `PATIENTS.NOT_FOUND`

## Validation Rules
VR-07-017, VR-07-018; `note` ≤ 500 characters.

## Authorization Rules
- Read: `patients.profiles.read`. Record: `patients.profiles.manage`.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Unknown purpose or method | 400 `COMMON.VALIDATION_FAILED` |
| Same status as effective | 409 `PATIENTS.CONSENT_STATE_UNCHANGED` |
| Patient `Anonymized` | 422 `PATIENTS.PATIENT_ANONYMIZED` |
| Missing permission | 403 `COMMON.FORBIDDEN` |
| Other organization | 404 `PATIENTS.NOT_FOUND` |

## Edge Cases
- Withdrawal of `MedicalDataStorage` while allergies exist: allergies retained and still checked (BR-07-007, OD-07-03).
- With `RequireConsentForMedicalData` OFF, medical writes succeed without consent; consent events can still be recorded.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-07-018 | Integration | Grant consent; effective status computed from latest event | US-07-03-AC1 |
| TS-07-019 | Integration | Withdraw creates second event; DB role cannot UPDATE consent rows | US-07-03-AC2 |
| TS-07-020 | Integration | Duplicate state → 409 | US-07-03-AC3 |
| TS-07-021 | Integration | Allergy write without consent → 422; with setting OFF → 201 | US-07-03-AC4 |
| TS-07-022 | Unit | Facade returns effective notification consent | US-07-03-AC5 |
| TS-07-023 | Security | 403 for read-only user; CS-08 → 404 | US-07-03-AC6, US-07-03-AC7 |
