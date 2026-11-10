# US-08-13: Enforce Prescription for Rx-only and Controlled Medicines at Sale

| Field | Value |
|---|---|
| Story ID | US-08-13 |
| Epic | EPIC-08 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-08-035, FR-08-036 |
| Related Business Rules | BR-08-014, BR-08-015, BR-G-21, BR-G-22, BR-G-19 |
| Dependencies | US-08-12, SPEC-03 medicine flags, SPEC-06 sale completion |

## User Story
As an Owner, I want the POS to block sales of prescription-only and controlled medicines that are not linked to a verified prescription so that these medicines are not dispensed without one.

## Business Value
Applies BR-G-21 and BR-G-22 server-side (CS-13), independently of the UI, with a configurable switch pending REG-01/REG-02.

## Preconditions
- Medicines carry `IsPrescriptionOnly` and `IsControlled` flags (SPEC-03).

## Acceptance Criteria
### US-08-13-AC1: Rx-only without prescription blocked (CS-13)
- **Given** `EnforcePrescriptionForRxOnly = ON` and medicine R with `IsPrescriptionOnly = true` in stock
- **When** a cashier completes a sale containing R without `prescriptionItemId` (plus one OTC line)
- **Then** the response is 422 `PRESCRIPTIONS.PRESCRIPTION_REQUIRED` with error path `lines[0].prescriptionItemId`, and no sale, stock movement, payment, cash movement, or invoice number is persisted.

### US-08-13-AC2: Rx-only linked to non-verified prescription blocked (CS-13)
- **Given** enforcement ON and a PendingVerification prescription with item for R
- **When** a pharmacist completes a sale of R linked to that item
- **Then** the response is 422 `PRESCRIPTIONS.NOT_DISPENSABLE` and nothing is persisted.

### US-08-13-AC3: Enforcement OFF allows with audit
- **Given** `EnforcePrescriptionForRxOnly = OFF`
- **When** a sale containing R without `prescriptionItemId` is completed
- **Then** the sale completes and one `AuditLog` entry `RxOnlySoldWithoutPrescription` per such line records sale id, line id, medicine, and user.

### US-08-13-AC4: Controlled without prescription blocked regardless of setting (CS-13)
- **Given** `EnforcePrescriptionForRxOnly = OFF` and medicine C with `IsControlled = true`
- **When** a pharmacist completes a sale of C without `prescriptionItemId`
- **Then** the response is 422 `PRESCRIPTIONS.PRESCRIPTION_REQUIRED` and nothing is persisted.

### US-08-13-AC5: Controlled requires controlled permission
- **Given** a Verified prescription for C and a user holding `sales.pos.sell` and `prescriptions.dispense` but not `prescriptions.controlled.dispense`
- **When** the user completes a sale of C linked to the prescription item
- **Then** the response is 403 `PRESCRIPTIONS.CONTROLLED_DISPENSE_FORBIDDEN` and nothing is persisted.

### US-08-13-AC6: Controlled with verified prescription and permission succeeds
- **Given** the same prescription and a Pharmacist holding `prescriptions.controlled.dispense`
- **When** the Pharmacist completes the sale
- **Then** the sale completes, a `DispensingRecord` and a `ControlledMedicineRegisterEntry` (US-08-15) are created in the same transaction.

### US-08-13-AC7: POS pre-check
- **Given** enforcement ON
- **When** the cashier adds R to the cart without a prescription link
- **Then** the POS shows a blocking badge "Prescription required" on the line within 200 ms and disables checkout; the server check in AC1 remains authoritative if the client is bypassed.

## Validation Rules
- VR-08-034; plus all VR-08-028–033 for linked lines.

## Authorization Rules
- Controlled lines: `prescriptions.controlled.dispense` in addition to `sales.pos.sell` and `prescriptions.dispense`.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Rx-only line without link (enforcement ON) | 422 `PRESCRIPTIONS.PRESCRIPTION_REQUIRED` |
| Controlled line without link (any setting) | 422 `PRESCRIPTIONS.PRESCRIPTION_REQUIRED` |
| Linked to non-verified/cancelled/expired prescription | 422 `PRESCRIPTIONS.NOT_DISPENSABLE` / `PRESCRIPTIONS.EXPIRED` |
| Controlled without permission | 403 `PRESCRIPTIONS.CONTROLLED_DISPENSE_FORBIDDEN` |

## Edge Cases
- Flag evaluated at sale completion time; flag change mid-cart is caught server-side.
- Idempotent replay of a rejected sale returns the same 422 response.
- A medicine that is both Rx-only and controlled follows the stricter controlled rule.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-08-074 | Integration | **CS-13**: Rx-only sale without prescription, enforcement ON → 422; assert zero rows in sales, movements, payments, cash movements; batch balance unchanged | US-08-13-AC1 |
| TS-08-075 | Integration | **CS-13**: Rx-only linked to PendingVerification prescription → 422 | US-08-13-AC2 |
| TS-08-076 | Integration | Enforcement OFF → completes with audit entry per line | US-08-13-AC3 |
| TS-08-077 | Integration | **CS-13**: controlled without link, enforcement OFF → 422 | US-08-13-AC4 |
| TS-08-078 | Security | Controlled without controlled permission → 403, nothing persisted | US-08-13-AC5 |
| TS-08-079 | Integration | Controlled with permission → dispensing record + register entry | US-08-13-AC6 |
| TS-08-080 | E2E | POS badge and disabled checkout; API bypass still rejected | US-08-13-AC7, US-08-13-AC1 |
