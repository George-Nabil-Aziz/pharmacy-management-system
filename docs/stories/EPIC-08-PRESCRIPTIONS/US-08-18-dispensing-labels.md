# US-08-18: Dispensing Labels

| Field | Value |
|---|---|
| Story ID | US-08-18 |
| Epic | EPIC-08 |
| Priority | P2 |
| Complexity | M |
| Related Requirements | FR-08-044 |
| Related Business Rules | BR-08-020 |
| Dependencies | US-08-12, SPEC-10 localization |

## User Story
As a Pharmacist, I want to print a label for each dispensed medicine showing the patient name and dose instructions in Arabic and/or English so that the patient knows how to take it.

## Business Value
Reduces dosing errors at home and supports bilingual patients (BRQ-13).

## Preconditions
- A completed sale with dispensing records.

## Acceptance Criteria
### US-08-18-AC1: Bilingual labels generated
- **Given** sale S with 2 dispensing lines for patient "منى عادل" (Mona Adel)
- **When** a user with `prescriptions.prescriptions.read` calls `GET .../sales/{S}/dispensing-labels?lang=both`
- **Then** the response is 200 `application/pdf` with 2 labels sized 50×30 mm, each containing patient name, medicine name and strength, dosage, frequency, route, instructions, quantity, dispensing date, prescription number, branch name and phone, with the Arabic block rendered right-to-left.

### US-08-18-AC2: Labels for a prescription without patient
- **Given** a dispensing sale whose prescription has no patient
- **When** labels are requested with `lang=en`
- **Then** the patient field shows "—" and all other fields are present.

### US-08-18-AC3: Sale without dispensing
- **Given** sale S2 with no prescription-linked lines
- **When** labels are requested
- **Then** the response is 422 `PRESCRIPTIONS.NO_DISPENSING_RECORDS`.

### US-08-18-AC4: Permission and branch denied
- **Given** a Cashier without `prescriptions.prescriptions.read`, and a Pharmacist assigned only to branch A
- **When** the Cashier requests labels in A, and the Pharmacist requests labels for a sale in branch B
- **Then** both responses are 403 `COMMON.FORBIDDEN`.

### US-08-18-AC5: Invalid language
- **Given** a dispensing sale
- **When** labels are requested with `lang=fr`
- **Then** the response is 422 `PRESCRIPTIONS.QUERY_INVALID`.

## Validation Rules
- `lang` ∈ {`ar`, `en`, `both`} (default = user's UI language).

## Authorization Rules
- `prescriptions.prescriptions.read` + branch assignment; label generation for a prescription with a patient is access-logged.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| No dispensing records on sale | 422 `PRESCRIPTIONS.NO_DISPENSING_RECORDS` |
| Invalid `lang` | 422 `PRESCRIPTIONS.QUERY_INVALID` |
| No permission / unassigned branch | 403 `COMMON.FORBIDDEN` |
| Voided sale | 409 `PRESCRIPTIONS.INVALID_STATUS_TRANSITION` |

## Edge Cases
- Text longer than label space is truncated with an ellipsis and the full instructions are printed on a continuation label.
- Medicine and instruction text are printed as recorded; the system does not generate or translate dosing instructions.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-08-102 | Integration | PDF with 2 bilingual labels; RTL shaping visual check | US-08-18-AC1 |
| TS-08-103 | Integration | No patient → "—" | US-08-18-AC2 |
| TS-08-104 | Integration | No dispensing → 422; invalid lang → 422 | US-08-18-AC3, US-08-18-AC5 |
| TS-08-105 | Security | Cashier → 403; unassigned branch → 403 | US-08-18-AC4 |
| TS-08-106 | Performance | 30 labels ≤ 2 s p95 | US-08-18-AC1 |
