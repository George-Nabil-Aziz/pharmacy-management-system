# US-06-15: Explicit Batch Selection at the POS (FEFO Override)

| Field | Value |
|---|---|
| Story ID | US-06-15 |
| Epic | EPIC-06 |
| Priority | P2 |
| Complexity | S |
| Related Requirements | FR-06-038 |
| Related Business Rules | BR-G-06, BR-G-07, BR-06-013 |
| Dependencies | US-06-12, US-04-05 |

## User Story
As a pharmacist, I want to sell a specific eligible batch instead of the FEFO choice, with a reason, so that I can hand over the box the customer is holding when it is safe to do so.

## Business Value
Supports real counter situations (customer-selected box, damaged outer pack of FEFO batch) while keeping FEFO as the default and the deviation audited.

## Preconditions
- User holds `inventory.batches.override-fefo`; batches visible in the line's batch picker (SPEC-04 batch views).

## Acceptance Criteria
### US-06-15-AC1: Eligible explicit batch
- **Given** Medicine A has FEFO batch B1 (exp 2027-01-31) and batch B2 (exp 2027-04-30) with 50 sellable units
- **When** a pharmacist selects B2 for 20 units with reason "Customer box from shelf" and completes the sale
- **Then** the allocation is B2 = 20 units with `IsFefoOverride = true`, the reason is stored on the line, and an audit entry records the FEFO override

### US-06-15-AC2: Ineligible batch (CS-02)
- **Given** batch B0 is expired, B3 is in the do-not-sell window, and B4 is `Quarantined`
- **When** the pharmacist selects any of them and completes
- **Then** the response is 422 `INVENTORY.BATCH_NOT_SELLABLE` with reason `Expired`, `DoNotSellWindow`, or `Quarantined` respectively; nothing is persisted

### US-06-15-AC3: Explicit batch must cover the line
- **Given** B2 has 10 sellable units
- **When** the pharmacist selects B2 for 20 units
- **Then** the response is 409 `INVENTORY.INSUFFICIENT_STOCK` (no fallback to other batches)

### US-06-15-AC4: Permission denied
- **Given** a cashier without `inventory.batches.override-fefo`
- **When** a request selects B2 (not the FEFO first choice)
- **Then** the response is 403 `INVENTORY.FEFO_OVERRIDE_NOT_PERMITTED`; selecting B1 (the FEFO first choice) explicitly is accepted

### US-06-15-AC5: Reason required and batch of another branch
- **Given** an explicit batch without a reason, and a batch id from branch B
- **When** each is submitted for branch A
- **Then** the first returns 400 `COMMON.VALIDATION_FAILED`; the second 422 `INVENTORY.BATCH_NOT_SELLABLE` (reason `WrongBranch`) (CS-07)

## Validation Rules
- VR-06-028.

## Authorization Rules
- `inventory.batches.override-fefo` for non-FEFO batches, in addition to `sales.pos.sell`.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Expired / do-not-sell / quarantined batch | 422 `INVENTORY.BATCH_NOT_SELLABLE` |
| Insufficient on chosen batch | 409 `INVENTORY.INSUFFICIENT_STOCK` |
| No override permission | 403 `INVENTORY.FEFO_OVERRIDE_NOT_PERMITTED` |
| Missing reason | 400 `COMMON.VALIDATION_FAILED` |

## Edge Cases
- Explicit batch with `SellingPriceOverride` → line priced at the override (BR-06-033).
- GS1-scanned batch (US-06-02) can pre-fill the picker; selection still requires the permission when not FEFO (OD-06-09).

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-06-090 | Integration | Explicit eligible batch allocated, flagged, audited | US-06-15-AC1 |
| TS-06-091 | Integration | CS-02: explicit expired / do-not-sell / quarantined batch rejected | US-06-15-AC2 |
| TS-06-092 | Integration | Explicit batch insufficient → 409, no fallback | US-06-15-AC3 |
| TS-06-093 | Security | 403 without override permission; FEFO-first explicit allowed | US-06-15-AC4 |
| TS-06-094 | Security | Missing reason 400; CS-07 batch of other branch rejected | US-06-15-AC5 |
