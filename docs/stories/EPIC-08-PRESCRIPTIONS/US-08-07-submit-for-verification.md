# US-08-07: Submit Prescription for Verification

| Field | Value |
|---|---|
| Story ID | US-08-07 |
| Epic | EPIC-08 |
| Priority | P0 |
| Complexity | S |
| Related Requirements | FR-08-015, FR-08-016 |
| Related Business Rules | BR-08-002, BR-G-21, BR-G-22 |
| Dependencies | US-08-03, US-08-04 |

## User Story
As a Cashier or Pharmacist, I want to submit a completed draft prescription for pharmacist verification so that it enters the verification queue.

## Business Value
Separates data entry (possibly by a cashier) from clinical verification by a pharmacist.

## Preconditions
- Prescription in `Draft`.

## Acceptance Criteria
### US-08-07-AC1: Submit valid draft
- **Given** a Draft prescription with 2 active items (OTC medicines only), a prescriber, and no patient
- **When** a user with `prescriptions.prescriptions.create` calls `POST .../submit` with `If-Match`
- **Then** the response is 200 with `status = "PendingVerification"` and a history row `Draft → PendingVerification`.

### US-08-07-AC2: No items
- **Given** a Draft prescription with 0 active items
- **When** the user submits it
- **Then** the response is 422 `PRESCRIPTIONS.NO_ITEMS` and the status stays `Draft`.

### US-08-07-AC3: Patient required for Rx-only when enforcement ON
- **Given** `EnforcePrescriptionForRxOnly = ON` and a Draft without patient containing a medicine with `IsPrescriptionOnly = true`
- **When** the user submits it
- **Then** the response is 422 `PRESCRIPTIONS.PATIENT_REQUIRED`.

### US-08-07-AC4: Patient required for controlled regardless of setting
- **Given** `EnforcePrescriptionForRxOnly = OFF` and a Draft without patient containing a medicine with `IsControlled = true`
- **When** the user submits it
- **Then** the response is 422 `PRESCRIPTIONS.PATIENT_REQUIRED`.

### US-08-07-AC5: Wrong status and permission denied
- **Given** a prescription already in `PendingVerification`, and a user without `prescriptions.prescriptions.create`
- **When** an authorized user submits the pending prescription, and the unauthorized user submits a draft
- **Then** the responses are 409 `PRESCRIPTIONS.INVALID_STATUS_TRANSITION` and 403 `COMMON.FORBIDDEN`.

## Validation Rules
- VR-08-009, VR-08-010 (re-evaluated at submit), VR-08-022, VR-08-023.

## Authorization Rules
- `prescriptions.prescriptions.create` + branch assignment.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| No items | 422 `PRESCRIPTIONS.NO_ITEMS` |
| Patient missing when required | 422 `PRESCRIPTIONS.PATIENT_REQUIRED` |
| Date now beyond validity | 422 `PRESCRIPTIONS.ALREADY_EXPIRED` |
| Not Draft | 409 `PRESCRIPTIONS.INVALID_STATUS_TRANSITION` |
| No permission | 403 `COMMON.FORBIDDEN` |

## Edge Cases
- Free-text items do not block submit (they block verification); the patient rule is evaluated only for resolved items at submit and re-evaluated at verification after resolution.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-08-034 | Integration | Submit OTC-only draft without patient → PendingVerification | US-08-07-AC1 |
| TS-08-035 | Integration | Submit with 0 items → 422 | US-08-07-AC2 |
| TS-08-036 | Integration | Rx-only item, no patient, enforcement ON → 422; OFF → 200 | US-08-07-AC3 |
| TS-08-037 | Integration | Controlled item, no patient, enforcement OFF → 422 | US-08-07-AC4 |
| TS-08-038 | Security | Double submit → 409; no permission → 403 | US-08-07-AC5 |
