# US-06-27: Partial Prescription Fulfillment at the POS

| Field | Value |
|---|---|
| Story ID | US-06-27 |
| Epic | EPIC-06 |
| Priority | P0 |
| Complexity | S |
| Related Requirements | FR-06-061, FR-06-062 |
| Related Business Rules | BR-G-15, BR-06-026 |
| Dependencies | US-06-26 |

## User Story
As a pharmacist, I want to dispense only part of a prescribed quantity when stock is short or the patient wants less, with the remainder tracked and printed, so that the patient can collect the rest later.

## Business Value
Partial dispensing is routine in Egyptian pharmacies; tracking the remainder supports follow-up visits (CS-04 is owned by EPIC-08; this story is the POS side).

## Preconditions
- Prescription Rx1 `Verified`, item Q 30 base units remaining; sellable stock of Q is 20.

## Acceptance Criteria
### US-06-27-AC1: Dispense less than remaining
- **Given** Rx1 loaded into the cart with Q capped at 20 (sellable)
- **When** R completes the sale
- **Then** a `DispensingRecord` of 20 units is created, Rx1 becomes `PartiallyDispensed` with 10 remaining, and the receipt shows "Remaining to dispense: Q — 10 units"

### US-06-27-AC2: Second visit dispenses the remainder
- **Given** Rx1 with 10 remaining
- **When** R loads Rx1 on a later visit and completes a sale of 10 units
- **Then** Rx1 becomes `FullyDispensed` and the receipt shows no remaining line

### US-06-27-AC3: Patient chooses fewer units
- **Given** Rx1 item Q with 30 remaining and sufficient stock
- **When** R reduces the line to 15 and completes
- **Then** 15 is dispensed and 15 remains; a later attempt to dispense 16 against the item returns 422 `SALES.PRESCRIPTION_QUANTITY_EXCEEDED`

### US-06-27-AC4: Void restores remaining
- **Given** the partial sale of 20 units is voided the same day (US-06-20)
- **When** the void commits
- **Then** SPEC-08 reverses the dispensing record and Rx1 remaining returns to 30 with status `Verified`

### US-06-27-AC5: Permission denied
- **Given** a cashier without `prescriptions.dispense`
- **When** the cashier completes a partial dispensing sale
- **Then** the response is 403 `COMMON.FORBIDDEN`

## Validation Rules
- VR-06-041.

## Authorization Rules
- As US-06-26.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Above remaining | 422 `SALES.PRESCRIPTION_QUANTITY_EXCEEDED` |
| No dispense permission | 403 `COMMON.FORBIDDEN` |

## Edge Cases
- Pack-unit line for a prescription in base units: base-unit quantity compared (2 packs × 10 = 20).
- Prescription expires before the second visit → `SALES.PRESCRIPTION_NOT_DISPENSABLE`.
- Return of dispensed units does not restore prescription remaining (SPEC-08 rule; returns are not undispensing).

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-06-161 | Integration | Partial dispensing; PartiallyDispensed; remaining on receipt | US-06-27-AC1 |
| TS-06-162 | Integration | Second visit completes prescription | US-06-27-AC2 |
| TS-06-163 | Integration | Patient-reduced quantity; later over-dispense rejected | US-06-27-AC3 |
| TS-06-164 | Integration | Void reverses dispensing and remaining | US-06-27-AC4 |
| TS-06-165 | Security | 403 without `prescriptions.dispense` | US-06-27-AC5 |
