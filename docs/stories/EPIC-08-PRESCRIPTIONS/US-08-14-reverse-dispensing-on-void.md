# US-08-14: Reverse Dispensing When a Sale Is Voided

| Field | Value |
|---|---|
| Story ID | US-08-14 |
| Epic | EPIC-08 |
| Priority | P1 |
| Complexity | M |
| Related Requirements | FR-08-037, FR-08-038 |
| Related Business Rules | BR-08-010, BR-08-017, BR-08-022, BR-G-11, BR-G-25 |
| Dependencies | US-08-12, SPEC-06 void and sales return |

## User Story
As a Branch Manager, I want voiding a dispensing sale to restore the prescription's remaining quantities so that the prescription reflects what the patient actually received.

## Business Value
Keeps prescription quantities consistent with stock and sales after corrections, using compensating entries only (BR-G-25).

## Preconditions
- A completed sale with prescription-linked lines exists.

## Acceptance Criteria
### US-08-14-AC1: Void restores remaining
- **Given** a FullyDispensed prescription whose item I1 (30 base units) was dispensed in sale S1 (10) and sale S2 (20)
- **When** a user with `sales.sales.void` voids S2 with `Idempotency-Key`
- **Then** in the void transaction a compensating `DispensingRecord` (−20, `reversesDispensingRecordId` set) is created per original record of S2, I1 shows dispensed 10 / remaining 20, status becomes `PartiallyDispensed`, and history records the transition with reason `Sale S2 voided`.

### US-08-14-AC2: Status preserved for Cancelled/Expired
- **Given** an Expired prescription with a dispensing sale S3
- **When** S3 is voided
- **Then** compensating records are created and quantities updated, but the status remains `Expired`.

### US-08-14-AC3: Sales return does not restore quantity
- **Given** a dispensing sale S4 linked to item I2
- **When** a sales return of the dispensed line is completed (SPEC-06)
- **Then** I2 dispensed/remaining quantities are unchanged, and the dispensing record view shows the sales return number.

### US-08-14-AC4: Void failure rolls back
- **Given** a dispensing sale S5
- **When** the void fails after the compensating dispensing record insert (fault injection)
- **Then** the sale stays `Completed`, no compensating records exist, and quantities are unchanged.

### US-08-14-AC5: Permission denied
- **Given** a Pharmacist without `sales.sales.void`
- **When** the Pharmacist voids a dispensing sale
- **Then** the response is 403 `COMMON.FORBIDDEN` and no compensating records are created.

## Validation Rules
- Compensating quantity equals the negative of the original; an original record can be reversed once.

## Authorization Rules
- Governed by SPEC-06 void permission `sales.sales.void` and branch assignment; no additional prescription permission is required.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| No void permission | 403 `COMMON.FORBIDDEN` |
| Fault during void | Full rollback; SPEC-06 error response |
| Retry with same key | Same response; no duplicate compensating rows (CS-11) |

## Edge Cases
- Voided controlled dispensing also creates reversal register entries (US-08-15).
- Voiding the only dispensing sale of a Verified-then-PartiallyDispensed prescription returns it to `Verified`.
- Voiding a refill-cycle sale only affects quantities of that `fillNumber`.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-08-081 | Integration | Void S2 → compensating rows, quantities, PartiallyDispensed | US-08-14-AC1 |
| TS-08-082 | Integration | Void for Expired/Cancelled keeps status | US-08-14-AC2 |
| TS-08-083 | Integration | Sales return leaves quantities; reference shown | US-08-14-AC3 |
| TS-08-084 | Integration | Fault injection rollback; idempotent retry | US-08-14-AC4 |
| TS-08-085 | Security | Void without permission → 403 | US-08-14-AC5 |
