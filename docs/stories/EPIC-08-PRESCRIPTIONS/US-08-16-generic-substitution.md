# US-08-16: Generic Substitution

| Field | Value |
|---|---|
| Story ID | US-08-16 |
| Epic | EPIC-08 |
| Priority | P2 |
| Complexity | M |
| Related Requirements | FR-08-041, FR-08-042 |
| Related Business Rules | BR-08-019, BR-08-014, BR-G-15 |
| Dependencies | US-08-12, US-08-01, SPEC-03 `MedicineAlternative` |

## User Story
As a Pharmacist, I want to record a substitution of a prescribed medicine with an alternative, with reason and patient consent, so that I can dispense an available equivalent while keeping the decision traceable.

## Business Value
Avoids lost sales and patient return visits when the prescribed brand is unavailable, under an explicit, recorded pharmacist decision (policy pending REG-08).

## Preconditions
- `AllowGenericSubstitution = ON`.
- Prescription `Verified` or `PartiallyDispensed`.

## Acceptance Criteria
### US-08-16-AC1: Record substitution
- **Given** item I1 for medicine M (remaining 20 base units) and active medicine G listed as `MedicineAlternative` of M
- **When** a user with `prescriptions.prescriptions.verify` posts `{ "substituteMedicineId": "G", "substituteQuantityBaseUnits": 20, "reason": "OutOfStock", "patientConsentObtained": true }` to `.../items/{I1}/substitutions`
- **Then** the response is 201 with an active substitution, `isCatalogAlternative = true`, `approvedBy`/`approvedAt`, and an audit entry; the dispensing context lists G under `approvedSubstitutes`.

### US-08-16-AC2: Dispense the substitute
- **Given** the substitution from AC1
- **When** a sale of 20 base units of G linked to I1 is completed
- **Then** a `DispensingRecord` stores `prescribedMedicineId = M`, `dispensedMedicineId = G`, the substitution id, and I1 remaining becomes 0.

### US-08-16-AC3: Consent required
- **Given** `RequireConsentForSubstitution = ON`
- **When** the pharmacist posts a substitution with `patientConsentObtained = false`
- **Then** the response is 422 `PRESCRIPTIONS.CONSENT_REQUIRED`.

### US-08-16-AC4: Invalid substitution
- **Given** item I1 for M
- **When** the pharmacist submits `substituteMedicineId = M`, an inactive medicine, or `reason = "Other"` without text
- **Then** the responses are 422 `PRESCRIPTIONS.SUBSTITUTION_INVALID`, 422 `PRESCRIPTIONS.SUBSTITUTION_INVALID`, and 422 `PRESCRIPTIONS.SUBSTITUTION_REASON_REQUIRED`.

### US-08-16-AC5: Feature disabled
- **Given** `AllowGenericSubstitution = OFF`
- **When** the pharmacist posts a substitution
- **Then** the response is 422 `PRESCRIPTIONS.SUBSTITUTION_DISABLED`.

### US-08-16-AC6: Permission denied
- **Given** a Cashier without `prescriptions.prescriptions.verify`
- **When** the Cashier posts a substitution
- **Then** the response is 403 `COMMON.FORBIDDEN`.

### US-08-16-AC7: Non-listed substitute shows warning
- **Given** active medicine H that is not a `MedicineAlternative` of M
- **When** the pharmacist records H as substitute with reason `PatientRequest`
- **Then** the substitution is stored with `isCatalogAlternative = false` and the UI shows "Not a catalog-listed alternative — pharmacist decision" before confirmation.

## Validation Rules
- VR-08-036. `substituteQuantityBaseUnits` 1–(remaining expressed in substitute units, pharmacist-entered, ≤ 9,999).

## Authorization Rules
- `prescriptions.prescriptions.verify` + branch assignment. Dispensing a controlled substitute requires `prescriptions.controlled.dispense`.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Feature OFF | 422 `PRESCRIPTIONS.SUBSTITUTION_DISABLED` |
| Same or inactive medicine | 422 `PRESCRIPTIONS.SUBSTITUTION_INVALID` |
| Missing reason text for Other | 422 `PRESCRIPTIONS.SUBSTITUTION_REASON_REQUIRED` |
| Consent false when required | 422 `PRESCRIPTIONS.CONSENT_REQUIRED` |
| Status not Verified/PartiallyDispensed | 409 `PRESCRIPTIONS.INVALID_STATUS_TRANSITION` |
| No permission | 403 `COMMON.FORBIDDEN` |

## Edge Cases
- Recording a new substitution deactivates the previous active one for the item.
- Remaining is decremented proportionally: dispensed substitute units × (item remaining at substitution ÷ substitute quantity), rounded down to an integer; the item is fully dispensed when the substitute quantity is fully dispensed.
- A controlled substitute triggers patient/attachment requirements and register entries.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-08-093 | Integration | Record substitution; context lists substitute; audit | US-08-16-AC1 |
| TS-08-094 | Integration | Dispense substitute; record stores both medicines | US-08-16-AC2 |
| TS-08-095 | Unit | Consent, same/inactive medicine, reason rules | US-08-16-AC3, US-08-16-AC4 |
| TS-08-096 | Integration | Feature OFF → 422; Cashier → 403 | US-08-16-AC5, US-08-16-AC6 |
| TS-08-097 | E2E | Non-listed substitute warning and flag | US-08-16-AC7 |
