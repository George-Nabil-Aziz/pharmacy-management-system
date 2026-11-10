# US-06-25: Link a Patient to a Sale with Allergy Decision Support

| Field | Value |
|---|---|
| Story ID | US-06-25 |
| Epic | EPIC-06 |
| Priority | P1 |
| Complexity | M |
| Related Requirements | FR-06-056, FR-06-057 |
| Related Business Rules | BR-G-29, BR-G-33 |
| Dependencies | US-06-12, US-07-02, US-07-06, US-07-07 |

## User Story
As a pharmacist, I want to attach the customer's patient profile to the sale and be warned if a medicine matches a recorded allergy so that purchase history is complete and I can counsel the patient.

## Business Value
Builds medication history (SPEC-07) and provides allergy decision support at the counter without blocking sales.

## Preconditions
- Patient profiles exist (SPEC-07); user holds `patients.profiles.read`; allergy check needs `patients.medical.read`.

## Acceptance Criteria
### US-06-25-AC1: Search and link patient
- **Given** patient P with mobile 01001234567
- **When** the cashier searches "01001234567" in the POS patient panel and selects P, then completes the sale
- **Then** the sale stores `PatientId` P and the receipt shows P's name only

### US-06-25-AC2: Quick-create patient
- **Given** no patient matches, and the user holds `patients.profiles.manage`
- **When** the user quick-creates "Mona Adel", 01112223334
- **Then** the patient is created via SPEC-07 and linked to the cart; a user without `patients.profiles.manage` does not see the quick-create action and the SPEC-07 endpoint returns 403 `COMMON.FORBIDDEN`

### US-06-25-AC3: Allergy warning with acknowledgement
- **Given** P has a recorded allergy to "Amoxicillin" and the cart contains a medicine with active ingredient Amoxicillin
- **When** a pharmacist (with `patients.medical.read`) adds it
- **Then** `POST /pos/allergy-check` returns the match, the POS shows a warning that must be acknowledged, the line stores `AllergyWarningAcknowledgedBy`, the read is access-logged, and the sale is not blocked

### US-06-25-AC4: No medical read permission
- **Given** a cashier without `patients.medical.read`
- **When** the allergy check endpoint is called
- **Then** the response is 403 `COMMON.FORBIDDEN`, the POS shows "Allergy check requires a pharmacist", and the sale proceeds

### US-06-25-AC5: Patient of another organization
- **Given** a `patientId` of another organization in the sale request
- **When** the sale is submitted
- **Then** the response is 404 `COMMON.NOT_FOUND` and nothing is persisted (CS-08)

## Validation Rules
- `patientId` must be an active patient of the organization; quick-create per SPEC-07 rules.

## Authorization Rules
- `patients.profiles.read` to link; `patients.profiles.manage` to quick-create; `patients.medical.read` for allergy check.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Allergy check without permission | 403 `COMMON.FORBIDDEN` |
| Patient of another organization | 404 `COMMON.NOT_FOUND` |
| Deactivated patient | 422 `COMMON.VALIDATION_FAILED` |

## Edge Cases
- Patient removed from the cart before completion → no link stored; allergy acknowledgement discarded.
- Allergy data unavailable (SPEC-07 timeout 1 s) → POS shows "Allergy check unavailable"; sale not blocked.
- Patient linked to a prescription must equal the sale patient (US-06-26).

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-06-149 | E2E | Search by phone, link, receipt shows name only | US-06-25-AC1 |
| TS-06-150 | Integration | Quick-create with and without permission | US-06-25-AC2 |
| TS-06-151 | Integration | Allergy match, acknowledgement stored, access log written, sale not blocked | US-06-25-AC3 |
| TS-06-152 | Security | Allergy check 403 without `patients.medical.read` | US-06-25-AC4 |
| TS-06-153 | Security | CS-08: other-organization patient → 404, nothing persisted | US-06-25-AC5 |
