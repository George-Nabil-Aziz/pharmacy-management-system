# US-06-30: Electronic Invoice / Receipt Data Readiness (P3, pending REG-07)

| Field | Value |
|---|---|
| Story ID | US-06-30 |
| Epic | EPIC-06 |
| Priority | P3 |
| Complexity | S |
| Related Requirements | FR-06-065 |
| Related Business Rules | BR-G-11, BR-G-20, BR-06-016 |
| Dependencies | US-06-12, US-06-21 |

## User Story
As an owner, I want every sale and return to keep an immutable structured invoice snapshot and a submission status so that we can integrate with tax-authority electronic invoicing/receipts once our tax advisor confirms our obligations (REG-07).

## Business Value
Avoids a costly data backfill if e-invoice/e-receipt submission becomes required; no submission is built until REG-07 is resolved.

## Preconditions
- REG-07 outcome pending; this story only stores data and a status.

## Acceptance Criteria
### US-06-30-AC1: Snapshot stored
- **Given** a sale completes
- **When** the transaction commits
- **Then** a structured invoice snapshot (seller identifiers as configured, document number, date/time, lines with quantities, unit prices, discounts, tax category codes, rates, amounts, totals, payment methods) is stored immutably with the sale, and `EInvoiceStatus` = `NotApplicable`

### US-06-30-AC2: Snapshot immutable
- **Given** a stored snapshot
- **When** any update of the snapshot is attempted through the application or directly against the amount columns
- **Then** it is rejected (domain error / DB trigger) and an audit entry is not altered

### US-06-30-AC3: Returns referenced
- **Given** a completed sales return
- **When** it commits
- **Then** its snapshot references the original sale's invoice number and snapshot id

### US-06-30-AC4: Read access
- **Given** a user without `sales.sales.read`, and a user of another organization
- **When** they request a snapshot
- **Then** 403 `COMMON.FORBIDDEN` and 404 `COMMON.NOT_FOUND` (CS-08)

## Validation Rules
- Snapshot schema versioned (`schemaVersion` 1).

## Authorization Rules
- `sales.sales.read` + branch assignment.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| No permission | 403 `COMMON.FORBIDDEN` |
| Other organization | 404 `COMMON.NOT_FOUND` |

## Edge Cases
- Voided sale: snapshot retained; status reflects void for any future submission logic.
- Mandatory fields may change after REG-07; a new schema version is added without rewriting stored snapshots.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-06-175 | Integration | Snapshot written with sale; status NotApplicable | US-06-30-AC1 |
| TS-06-176 | Integration | Snapshot immutability (domain + trigger) | US-06-30-AC2 |
| TS-06-177 | Integration | Return snapshot references original | US-06-30-AC3 |
| TS-06-178 | Security | 403 without permission; CS-08 404 | US-06-30-AC4 |
