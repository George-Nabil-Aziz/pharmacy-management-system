# US-08-04: Add and Edit Prescription Items

| Field | Value |
|---|---|
| Story ID | US-08-04 |
| Epic | EPIC-08 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-08-007, FR-08-008, FR-08-009, FR-08-010 |
| Related Business Rules | BR-08-005, BR-08-009, BR-08-011, BR-08-016 |
| Dependencies | US-08-03, SPEC-03 medicine search |

## User Story
As a Pharmacist, I want to record each prescribed medicine with dose, frequency, duration, route, instructions, and quantity so that dispensing can be tracked item by item.

## Business Value
Item-level quantities are the basis of partial dispensing (BR-G-15) and remaining-quantity tracking.

## Preconditions
- Prescription exists in `Draft`, `PendingVerification`, or `Verified` without dispensing.

## Acceptance Criteria
### US-08-04-AC1: Add catalog item in packs
- **Given** a Draft prescription and active medicine M with `PackSize = 20`
- **When** the user posts `{ "medicineId": "M", "dosage": "500 mg", "frequency": "every 8 hours", "durationDays": 7, "route": "Oral", "instructions": "after meals", "prescribedQuantity": 2, "prescribedUnit": "Pack" }` with the prescription `If-Match`
- **Then** the response is 201 with `prescribedQuantityBaseUnits = 40`, `dispensedQuantityBaseUnits = 0`, `remainingQuantityBaseUnits = 40`.

### US-08-04-AC2: Add free-text item
- **Given** the doctor wrote a medicine not found in the catalog
- **When** the user posts `{ "freeTextMedicineName": "Augmentin 1g", "prescribedQuantity": 1, "prescribedUnit": "Pack" }`
- **Then** the item is stored with `medicineId = null`, `isResolved = false`, `prescribedQuantityBaseUnits = null`, and the prescription detail flags it "must be resolved before verification".

### US-08-04-AC3: Medicine and free text are mutually exclusive
- **Given** a Draft prescription
- **When** the user posts an item with both `medicineId` and `freeTextMedicineName`, or with neither
- **Then** the response is 422 `PRESCRIPTIONS.ITEM_MEDICINE_XOR_TEXT`.

### US-08-04-AC4: Quantity and item limit validation
- **Given** a Draft prescription with 30 active items
- **When** the user adds a 31st item, or adds an item with `prescribedQuantity = 0`
- **Then** the responses are 422 `PRESCRIPTIONS.ITEM_LIMIT_REACHED` and 422 `PRESCRIPTIONS.QUANTITY_INVALID` respectively.

### US-08-04-AC5: Remove item is soft
- **Given** a PendingVerification prescription with 2 items
- **When** the user calls `DELETE .../items/{itemId}`
- **Then** the item has `isRemoved = true`, is excluded from active items and totals, remains visible in history, and an audit entry is written.

### US-08-04-AC6: Inactive medicine rejected
- **Given** medicine N with status `Inactive`
- **When** the user adds an item with `medicineId = N`
- **Then** the response is 422 `PRESCRIPTIONS.MEDICINE_INVALID`.

### US-08-04-AC7: Permission denied and immutability
- **Given** a user without `prescriptions.prescriptions.create`, and separately a `PartiallyDispensed` prescription
- **When** the first user adds an item, and an authorized user edits an item of the partially dispensed prescription
- **Then** the responses are 403 `COMMON.FORBIDDEN` and 409 `PRESCRIPTIONS.IMMUTABLE_AFTER_DISPENSING`.

## Validation Rules
- VR-08-012 to VR-08-018.

## Authorization Rules
- `prescriptions.prescriptions.create` and branch assignment.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Both/neither medicine and text | 422 `PRESCRIPTIONS.ITEM_MEDICINE_XOR_TEXT` |
| Inactive or unknown medicine | 422 `PRESCRIPTIONS.MEDICINE_INVALID` |
| Quantity 0 or > 9,999 | 422 `PRESCRIPTIONS.QUANTITY_INVALID` |
| Invalid route value | 422 `PRESCRIPTIONS.ROUTE_INVALID` |
| 31st item | 422 `PRESCRIPTIONS.ITEM_LIMIT_REACHED` |
| Edit after dispensing | 409 `PRESCRIPTIONS.IMMUTABLE_AFTER_DISPENSING` |
| No permission | 403 `COMMON.FORBIDDEN` |

## Edge Cases
- `prescribedUnit = BaseUnit` for a medicine with `AllowSplitPack = false` is accepted; pack rounding is handled at dispensing (US-08-12).
- Adding/editing an item on a `Verified` prescription returns it to `PendingVerification` (FR-08-007).
- `LineNo` is assigned sequentially and not reused after removal.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-08-016 | Unit | Base unit computation for Pack (2×20=40) and BaseUnit (15) | US-08-04-AC1 |
| TS-08-017 | Integration | Free-text item stored unresolved, flagged in detail | US-08-04-AC2 |
| TS-08-018 | Unit | XOR rule matrix (both, neither, one) | US-08-04-AC3 |
| TS-08-019 | Integration | 31st item and quantity 0/10,000 rejected | US-08-04-AC4 |
| TS-08-020 | Integration | Soft remove; inactive medicine rejected | US-08-04-AC5, US-08-04-AC6 |
| TS-08-021 | Security | No permission → 403; edit on PartiallyDispensed → 409 | US-08-04-AC7 |
