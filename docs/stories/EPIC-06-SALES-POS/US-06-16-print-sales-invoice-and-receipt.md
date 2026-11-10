# US-06-16: Print Sales Invoice as 80 mm Receipt or A4 Invoice (Arabic / English)

| Field | Value |
|---|---|
| Story ID | US-06-16 |
| Epic | EPIC-06 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-06-039 |
| Related Business Rules | BR-06-030, BR-G-23 |
| Dependencies | US-06-12, US-10-21, US-10-22 |

## User Story
As a cashier, I want the sales invoice to print automatically on our 80 mm thermal printer in Arabic or English, and to produce an A4 invoice when a customer asks, so that every customer receives a correct document.

## Business Value
The invoice is the customer's proof of purchase and the basis for returns; bilingual output serves Egyptian customers and visitors.

## Preconditions
- Branch settings `AutoPrintReceipt`, `DefaultReceiptFormat`, `ReceiptLanguage`, `ReceiptFooterText`; organization legal fields configured (SPEC-02).

## Acceptance Criteria
### US-06-16-AC1: Auto-print original thermal receipt
- **Given** `AutoPrintReceipt` = true, `DefaultReceiptFormat` = Thermal80mm, `ReceiptLanguage` = ar
- **When** a sale completes
- **Then** the POS calls `POST /sales/{id}/prints` (format Thermal80mm, ar, copy 0), receives the render model, and opens the print dialog with a 72 mm-wide RTL layout containing all §8.6 fields; a `SalePrintRecord` with CopyNumber 0 is stored

### US-06-16-AC2: A4 invoice in English as PDF
- **Given** a completed sale
- **When** the user requests format A4, language en, output Pdf
- **Then** a PDF is returned within 2 s (p95) with LTR layout, tax summary per rate, payments with card reference masked to the last 4 characters, and amounts formatted with 2 decimals and EGP currency

### US-06-16-AC3: Content correctness
- **Given** the §7.2 sale with a linked patient and prescription with remaining quantity
- **When** the receipt is rendered
- **Then** it shows invoice number, branch-local date/time, cashier, patient name only (no medical data), each line with quantity+unit, unit price, discount, total, gross 274.73, discounts 27.10, net 247.63, tax 13.96 (14%: 13.96; 0%: 0.00), total 261.59, Card 100.00 (…C3D4), Cash 161.59, tendered 200.00, change 38.41, and "Remaining to dispense" for the prescription item

### US-06-16-AC4: Voided sale banner
- **Given** a voided sale
- **When** it is printed
- **Then** the document shows a "VOIDED" / "ملغاة" banner with void date and is marked as a copy

### US-06-16-AC5: Permission and isolation
- **Given** a user without `sales.sales.read`, a user unassigned to the sale's branch, and a sale id from another organization
- **When** they request a print
- **Then** the first two receive 403 `COMMON.FORBIDDEN` (CS-07); the third 404 `COMMON.NOT_FOUND` (CS-08)

## Validation Rules
- `format` ∈ {Thermal80mm, A4}; `language` ∈ {ar, en}; `output` ∈ {Html, Pdf} (Pdf only for A4); Idempotency-Key required (VR-06-021).

## Authorization Rules
- `sales.sales.read` + branch assignment.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Invalid format/language | 400 `COMMON.VALIDATION_FAILED` |
| No permission / other branch | 403 `COMMON.FORBIDDEN` |
| Sale in another organization | 404 `COMMON.NOT_FOUND` |

## Edge Cases
- Printer offline → browser print fails; the cashier reprints (marked COPY per US-06-17); the original print record already exists.
- Long Arabic medicine names wrap within 72 mm; no truncation of amounts.
- Mandatory content (e.g., tax registration display, e-receipt QR) pending REG-07/REG-08 (OD-06-11).

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-06-095 | E2E | Auto-print original thermal Arabic receipt; print record copy 0 | US-06-16-AC1 |
| TS-06-096 | Integration | A4 English PDF content and generation time | US-06-16-AC2 |
| TS-06-097 | Visual | Receipt snapshot (ar RTL, en LTR) with §7.2 amounts and remaining-to-dispense | US-06-16-AC3 |
| TS-06-098 | Integration | Voided banner on print | US-06-16-AC4 |
| TS-06-099 | Security | 403 permission / CS-07 branch; CS-08 other org 404 | US-06-16-AC5 |
