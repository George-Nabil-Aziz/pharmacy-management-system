# US-08-17: Allergy Alerts at Verification and Dispensing

| Field | Value |
|---|---|
| Story ID | US-08-17 |
| Epic | EPIC-08 |
| Priority | P2 |
| Complexity | S |
| Related Requirements | FR-08-043 |
| Related Business Rules | BR-08-013, BR-G-29 |
| Dependencies | US-08-08, US-08-12, SPEC-07 allergy check facade |

## User Story
As a Pharmacist, I want to see recorded patient allergies that match prescribed medicines during verification and dispensing so that I can make an informed decision.

## Business Value
Reuses patient allergy data (SPEC-07) as decision support; the pharmacist remains responsible for the decision.

## Preconditions
- Prescription has a patient with recorded allergies (SPEC-07).

## Acceptance Criteria
### US-08-17-AC1: Alert displayed with disclaimer
- **Given** patient P with a recorded allergy that SPEC-07's allergy check matches to medicine M on item I1
- **When** the pharmacist opens verification or the dispensing context
- **Then** the response includes `alerts: [{ type: "Allergy", itemId: I1, alertKey, allergenDescription, matchBasis }]` and the UI shows the alert with the text "Decision support only. Information depends on recorded patient data and may be incomplete. The pharmacist remains responsible for the dispensing decision."

### US-08-17-AC2: Acknowledgement required before verify/dispense
- **Given** the open alert from AC1
- **When** the pharmacist verifies, or completes a sale linked to I1, without acknowledgement
- **Then** the response is 422 `PRESCRIPTIONS.ALERT_OVERRIDE_REQUIRED`.

### US-08-17-AC3: Acknowledge with reason
- **Given** the open alert
- **When** a user with `prescriptions.prescriptions.verify` posts `{ "alertType": "Allergy", "alertKey": "<key>", "itemId": "I1", "reason": "Confirmed with patient: intolerance, not allergy" }` to `.../alert-overrides`
- **Then** a `PrescriptionAlertOverride` is stored with user and time, an audit entry is written, and verification/dispensing proceed.

### US-08-17-AC4: Short reason and permission denied
- **Given** an open alert
- **When** the pharmacist posts reason "ok", and a Cashier without `prescriptions.prescriptions.verify` posts a valid reason
- **Then** the responses are 422 `PRESCRIPTIONS.OVERRIDE_REASON_REQUIRED` and 403 `COMMON.FORBIDDEN`.

## Validation Rules
- VR-08-027 (override reason 10–500 chars), VR-08-035.

## Authorization Rules
- Viewing alerts: same as verification/dispensing context. Acknowledging: `prescriptions.prescriptions.verify`. Allergy data read is access-logged (BR-G-29).

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Unacknowledged alert at verify/dispense | 422 `PRESCRIPTIONS.ALERT_OVERRIDE_REQUIRED` |
| Reason < 10 chars | 422 `PRESCRIPTIONS.OVERRIDE_REASON_REQUIRED` |
| No permission | 403 `COMMON.FORBIDDEN` |
| SPEC-07 check unavailable | Banner "Allergy check unavailable"; not blocking; event audited |

## Edge Cases
- Prescription without patient → no allergy check; UI states "No patient linked — allergy check not performed".
- A new allergy recorded after acknowledgement produces a new `alertKey` that requires a new acknowledgement.
- The matching logic and data belong to SPEC-07; this story neither defines nor ships allergen data.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-08-098 | Integration | Fake SPEC-07 facade returns match → alert + disclaimer | US-08-17-AC1 |
| TS-08-099 | Integration | Verify and sale blocked until acknowledged | US-08-17-AC2 |
| TS-08-100 | Integration | Acknowledge stores override and audit; flow proceeds | US-08-17-AC3 |
| TS-08-101 | Security | Short reason → 422; Cashier → 403 | US-08-17-AC4 |
