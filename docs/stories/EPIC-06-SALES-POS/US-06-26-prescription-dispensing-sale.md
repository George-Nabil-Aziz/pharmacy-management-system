# US-06-26: Prescription-Linked Sale with Rx-Only and Controlled Enforcement

| Field | Value |
|---|---|
| Story ID | US-06-26 |
| Epic | EPIC-06 |
| Priority | P0 |
| Complexity | L |
| Related Requirements | FR-06-058, FR-06-059, FR-06-060, FR-06-061 |
| Related Business Rules | BR-G-14, BR-G-15, BR-G-21, BR-G-22, BR-06-025, BR-06-026 |
| Dependencies | US-06-12, US-06-25, US-08-08, US-08-12, US-08-13, US-08-15 |

## User Story
As a pharmacist, I want to load a verified prescription into the POS cart and have the system refuse prescription-only and controlled medicines without a valid prescription so that dispensing is traceable and compliant with our configured rules.

## Business Value
Delivers CS-13 and prescription-to-sale traceability (BRQ-09); each dispensing event is linked to batch, pharmacist, and sale.

## Preconditions
- Prescription Rx1 for patient P is `Verified` (SPEC-08) with items: Medicine Q (Rx-only) 30 base units, Medicine Z (controlled) 10 base units.
- `EnforcePrescriptionForRxOnly` = true. Pharmacist R holds `prescriptions.dispense` and `prescriptions.controlled.dispense`.

## Acceptance Criteria
### US-06-26-AC1: Load prescription into cart
- **Given** patient P is linked in the cart
- **When** R selects Rx1 and calls `GET /pos/prescriptions/{Rx1}/dispensable`
- **Then** the cart receives one line per item with quantity = remaining (Q 30, Z 10) capped by sellable quantity, each line linked to its `PrescriptionItemId`

### US-06-26-AC2: Dispensing recorded atomically
- **Given** the loaded cart
- **When** R completes the sale
- **Then** in the same transaction: one `DispensingRecord` per allocated batch (item, sale line, batch, quantity, pharmacist R, sale), a `ControlledMedicineRegisterEntry` for Z, Rx1 dispensed quantities updated and status `FullyDispensed`; a failure in SPEC-08 writes rolls back the whole sale

### US-06-26-AC3: Rx-only without prescription blocked (CS-13)
- **Given** a cart containing Medicine Q with no prescription link
- **When** any user completes the sale
- **Then** the response is 422 `SALES.PRESCRIPTION_REQUIRED`; no sale, stock movement, or payment is persisted

### US-06-26-AC4: Controlled without permission or prescription blocked (CS-13)
- **Given** a cart with Medicine Z linked to Rx1, completed by cashier C who lacks `prescriptions.controlled.dispense`; and a cart with Z without prescription even with `EnforcePrescriptionForRxOnly` = false
- **When** each is submitted
- **Then** both return 403 `SALES.CONTROLLED_DISPENSE_FORBIDDEN` and nothing is persisted

### US-06-26-AC5: Prescription not dispensable (CS-13)
- **Given** Rx2 is `PendingVerification`, Rx3 is `Expired`, and Rx4 belongs to another patient than the sale's patient
- **When** lines linked to their items are submitted
- **Then** each returns 422 `SALES.PRESCRIPTION_NOT_DISPENSABLE`

### US-06-26-AC6: Quantity above remaining
- **Given** Rx1 item Q has 30 remaining
- **When** a line of 40 units linked to it is submitted
- **Then** the response is 422 `SALES.PRESCRIPTION_QUANTITY_EXCEEDED`

### US-06-26-AC7: Dispense permission and isolation
- **Given** cashier C without `prescriptions.dispense` completing a prescription-linked line of a non-controlled medicine, a prescription of another organization, and a user unassigned to the branch
- **When** they submit / load
- **Then** C receives 403 `COMMON.FORBIDDEN`; the foreign prescription 404 `COMMON.NOT_FOUND` (CS-08); the unassigned user 403 `COMMON.FORBIDDEN` (CS-07)

## Validation Rules
- VR-06-039 to VR-06-042.

## Authorization Rules
- `prescriptions.dispense` for prescription-linked lines; `prescriptions.controlled.dispense` for controlled lines; plus `sales.pos.sell`.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Rx-only without prescription | 422 `SALES.PRESCRIPTION_REQUIRED` |
| Prescription not verified / expired / cancelled / other patient | 422 `SALES.PRESCRIPTION_NOT_DISPENSABLE` |
| Quantity above remaining | 422 `SALES.PRESCRIPTION_QUANTITY_EXCEEDED` |
| Controlled without permission or prescription | 403 `SALES.CONTROLLED_DISPENSE_FORBIDDEN` |
| No `prescriptions.dispense` | 403 `COMMON.FORBIDDEN` |

## Edge Cases
- Alternative medicine permitted by SPEC-08 substitution (US-08-16) satisfies the item.
- Two concurrent sales against the same prescription item → item rows locked (id asc) before inventory; the second sees reduced remaining → `SALES.PRESCRIPTION_QUANTITY_EXCEEDED`.
- `EnforcePrescriptionForRxOnly` = false → Rx-only medicines sell without prescription; controlled still enforced.
- Regulatory rules for which medicines are Rx-only/controlled are pending REG-01/REG-02.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-06-154 | Integration | Load dispensable items into cart with caps | US-06-26-AC1 |
| TS-06-155 | Integration | Dispensing records, register entry, prescription status in sale transaction; SPEC-08 failure rolls back (CS-10 pattern) | US-06-26-AC2 |
| TS-06-156 | Integration | CS-13: Rx-only without verified prescription blocked | US-06-26-AC3 |
| TS-06-157 | Security | CS-13: controlled without permission / without prescription blocked | US-06-26-AC4 |
| TS-06-158 | Integration | CS-13: unverified, expired, other-patient prescription rejected | US-06-26-AC5 |
| TS-06-159 | Concurrency | Quantity above remaining incl. concurrent dispensing of same item | US-06-26-AC6 |
| TS-06-160 | Security | 403 without `prescriptions.dispense`; CS-08 foreign prescription 404; CS-07 branch 403 | US-06-26-AC7 |
