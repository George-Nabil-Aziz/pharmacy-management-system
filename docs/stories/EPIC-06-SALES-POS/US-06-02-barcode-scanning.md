# US-06-02: Barcode Scanning and Unknown Barcode Handling

| Field | Value |
|---|---|
| Story ID | US-06-02 |
| Epic | EPIC-06 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-06-004, FR-06-005, FR-06-006 |
| Related Business Rules | BR-06-005, BR-06-013 |
| Dependencies | US-06-01, US-06-03, US-03-06 |

## User Story
As a cashier, I want scanning a medicine barcode with a keyboard-wedge scanner to add it to the cart, and to be told clearly when a barcode is unknown, so that I can sell without typing.

## Business Value
Scanning is the fastest and least error-prone way to identify the exact medicine; clean handling of unknown codes prevents selling the wrong item.

## Preconditions
- US-06-01 search and US-06-03 cart exist; medicines have registered `MedicineBarcode` rows (SPEC-03).
- User holds `sales.pos.sell`.

## Acceptance Criteria
### US-06-02-AC1: Scan adds or increments a line
- **Given** the POS screen is active with an empty cart and barcode `6221234567890` belongs to "Panadol 500mg" with sellable stock
- **When** the scanner emits `6221234567890` + Enter with inter-key intervals ≤ 50 ms, twice
- **Then** the cart contains one line "Panadol 500mg", unit Pack, quantity 2

### US-06-02-AC2: Manual typing is not treated as a scan
- **Given** the user is typing in the quantity field with inter-key intervals of 150 ms
- **When** the user types 6 digits and presses Enter
- **Then** no barcode lookup is triggered and the typed value is applied to the field

### US-06-02-AC3: Unknown barcode
- **Given** barcode `9990001112223` is not registered in the organization
- **When** it is scanned
- **Then** the lookup returns 404 `SALES.BARCODE_NOT_FOUND`, the cart is unchanged, a visual and audible alert is shown, the name search opens pre-filled with the code, and the "Link barcode to medicine" action is visible only to users holding `catalog.medicines.update`

### US-06-02-AC4: GS1 batch warning (P2)
- **Given** a GS1 DataMatrix encoding GTIN of "Medicine A", batch `B2`, expiry 2027-04-30, while FEFO would allocate batch `B1`
- **When** it is scanned
- **Then** the medicine line is added and the POS shows a warning that the scanned batch `B2` differs from FEFO batch `B1`; allocation remains FEFO (OD-06-09)

### US-06-02-AC5: Permission and isolation
- **Given** a user without `sales.pos.sell`, and separately a barcode registered only in another organization
- **When** the barcode endpoint is called
- **Then** the first returns 403 `COMMON.FORBIDDEN`; the second returns 404 `SALES.BARCODE_NOT_FOUND` without revealing the other organization (CS-08)

### US-06-02-AC6: Cross-branch denied
- **Given** a user assigned only to branch A
- **When** the user calls `GET /branches/{branchB}/pos/medicines/by-barcode/{code}`
- **Then** the response is 403 `COMMON.FORBIDDEN` (CS-07)

## Validation Rules
- VR-06-002 barcode 6–64 printable ASCII characters; GS1 group separators (FNC1/GS) accepted and parsed.

## Authorization Rules
- `sales.pos.sell` + branch assignment. Linking barcodes uses SPEC-03 `catalog.medicines.update`.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Unknown barcode | 404 `SALES.BARCODE_NOT_FOUND` |
| Barcode of 3 characters | 400 `COMMON.VALIDATION_FAILED` |
| Medicine for barcode inactive | 422 `SALES.MEDICINE_NOT_SELLABLE` |
| Missing permission | 403 `COMMON.FORBIDDEN` |

## Edge Cases
- Barcode matching a medicine with 0 sellable stock → line not added; "Out of stock" message.
- Scan while a modal dialog (payment) is open → scan ignored with a toast "Finish payment first".
- Leading zeros (UPC-A vs EAN-13 representation) are matched as stored; normalization of 12↔13 digit forms is done by SPEC-03 at registration.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-06-008 | E2E | Simulated wedge input adds then increments line | US-06-02-AC1 |
| TS-06-009 | Unit | Scanner detection timing threshold vs manual typing | US-06-02-AC2 |
| TS-06-010 | E2E | Unknown barcode: 404, cart unchanged, alert, link action by permission | US-06-02-AC3 |
| TS-06-011 | Unit | GS1 AI 01/10/17 parsing and FEFO mismatch warning | US-06-02-AC4 |
| TS-06-012 | Security | 403 without permission; other-org barcode 404; other branch 403 | US-06-02-AC5, US-06-02-AC6 |
