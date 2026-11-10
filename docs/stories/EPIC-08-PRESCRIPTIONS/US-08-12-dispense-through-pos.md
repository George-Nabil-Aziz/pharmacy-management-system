# US-08-12: Dispense Prescription Items Through POS (Partial Dispensing)

| Field | Value |
|---|---|
| Story ID | US-08-12 |
| Epic | EPIC-08 |
| Priority | P0 |
| Complexity | L |
| Related Requirements | FR-08-028, FR-08-029, FR-08-030, FR-08-031, FR-08-032, FR-08-033, FR-08-034 |
| Related Business Rules | BR-08-001, BR-08-007, BR-08-008, BR-08-009, BR-08-010, BR-G-06, BR-G-09, BR-G-10, BR-G-15, BR-G-19 |
| Dependencies | US-08-08, SPEC-06 sale completion, SPEC-04 FEFO allocation |

## User Story
As a Pharmacist, I want to load a verified prescription into the POS cart and dispense all or part of its items through a sale so that each visit's dispensing is recorded with medicine, batch, quantity, pharmacist, and sale.

## Business Value
Implements traceable partial dispensing (BRQ-09, BR-G-15, CS-04) while reusing the POS for stock, payment, and invoicing.

## Preconditions
- Prescription `Verified` or `PartiallyDispensed`, not expired, in the sale's branch.
- Caller has an open cash session (SPEC-06) and holds `sales.pos.sell` and `prescriptions.dispense`.

## Acceptance Criteria
### US-08-12-AC1: Dispensing context
- **Given** a Verified prescription with item I1 (medicine M, prescribed 3 packs, `PackSize = 10` → 30 base units)
- **When** the pharmacist calls `GET .../prescriptions/{id}/dispensing-context`
- **Then** the response is 200 listing I1 with `prescribedQuantityBaseUnits = 30`, `dispensedQuantityBaseUnits = 0`, `remainingQuantityBaseUnits = 30`, `isPrescriptionOnly`, `isControlled`, `approvedSubstitutes = []`, and `alerts = []`.

### US-08-12-AC2: First visit — partial dispensing (CS-04 part 1)
- **Given** the context above and sellable stock of M in batches B1 (exp 2027-01) and B2 (exp 2027-06)
- **When** on 2026-11-09 the pharmacist completes a sale with `Idempotency-Key` and line `{ medicineId: M, quantity: 1, unit: "Pack", prescriptionItemId: I1 }`
- **Then** the sale is `Completed`, one `DispensingRecord` exists (I1, sale, sale line, batch B1 by FEFO, 10 base units, pharmacist = caller, `fillNumber = 0`), I1 shows dispensed 10 / remaining 20, the prescription status is `PartiallyDispensed`, and history records `Verified → PartiallyDispensed` — all in the sale's transaction.

### US-08-12-AC3: Second visit — remaining dispensed (CS-04 part 2)
- **Given** the state after AC2 and B1 holds 5 base units
- **When** on 2026-11-19 a different pharmacist completes a sale for 2 packs linked to I1
- **Then** two `DispensingRecord` rows are created for that sale line (B1: 5, B2: 15), I1 shows dispensed 30 / remaining 0, status is `FullyDispensed`, and the detail view lists 3 dispensing records with both pharmacists and both sale numbers.

### US-08-12-AC4: Over-dispensing rejected
- **Given** I1 with remaining 20 base units
- **When** a sale links a line of 3 packs (30 base units) to I1, or two lines of 2 packs each to I1
- **Then** the whole sale is rejected with 422 `PRESCRIPTIONS.QUANTITY_EXCEEDS_REMAINING` (error path `lines[n].prescriptionItemId`), and no sale, stock movement, payment, or dispensing record is persisted.

### US-08-12-AC5: Wrong medicine, branch, or status
- **Given** a Verified prescription in branch A, and a PendingVerification prescription in branch A
- **When** a sale links (a) a line of medicine N ≠ M to I1, (b) a line in branch B to I1, (c) a line to an item of the PendingVerification prescription
- **Then** the sales are rejected with 422 `PRESCRIPTIONS.MEDICINE_MISMATCH`, 422 `PRESCRIPTIONS.BRANCH_MISMATCH`, and 422 `PRESCRIPTIONS.NOT_DISPENSABLE` respectively, with nothing persisted.

### US-08-12-AC6: Concurrent dispensing cannot exceed remaining
- **Given** I1 with remaining 10 base units and two pharmacists at two POS terminals
- **When** both complete a sale of 1 pack linked to I1 at the same moment
- **Then** exactly one sale completes, the other is rejected with 422 `PRESCRIPTIONS.QUANTITY_EXCEEDS_REMAINING`, and I1 dispensed = prescribed.

### US-08-12-AC7: Pack rounding
- **Given** item I2 prescribed 20 base units of medicine K with `PackSize = 14`, `AllowSplitPack = false`, already dispensed 14 (remaining 6)
- **When** a sale of 1 pack linked to I2 is completed without `roundingReason`, then with `roundingReason = "PackRounding"`
- **Then** the first is rejected with 422 `PRESCRIPTIONS.ROUNDING_REASON_REQUIRED`; the second completes with a dispensing record of 14, `roundingExcessBaseUnits = 8`, and I2 remaining 0.

### US-08-12-AC8: Patient linkage
- **Given** a prescription for patient P
- **When** a sale linked to it is completed with no patient selected, and another with patient Q selected
- **Then** the first sale is stored with `patientId = P`; the second is rejected with 422 `PRESCRIPTIONS.PATIENT_MISMATCH`.

### US-08-12-AC9: Permission denied
- **Given** a Cashier with `sales.pos.sell` but without `prescriptions.dispense`
- **When** the Cashier requests the dispensing context or completes a sale containing a line with `prescriptionItemId`
- **Then** both responses are 403 `COMMON.FORBIDDEN` and nothing is persisted.

### US-08-12-AC10: Idempotent retry and atomic failure
- **Given** a sale linked to I1 completed with `Idempotency-Key` K
- **When** the client retries with K and the same payload, and separately a database fault is injected after the dispensing record insert of another sale
- **Then** the retry returns the original response with no additional dispensing record (CS-11), and the faulted sale leaves no sale, movement, dispensing record, or quantity change (CS-10).

## Validation Rules
- VR-08-028 to VR-08-033; VR-08-035 when alert features are enabled.

## Authorization Rules
- Context: `prescriptions.dispense`. Sale completion: `sales.pos.sell` + `prescriptions.dispense` + branch assignment. Pharmacist on the record = authenticated user.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Quantity over remaining | 422 `PRESCRIPTIONS.QUANTITY_EXCEEDS_REMAINING` |
| Pack excess without reason | 422 `PRESCRIPTIONS.ROUNDING_REASON_REQUIRED` |
| Medicine not prescribed / not approved substitute | 422 `PRESCRIPTIONS.MEDICINE_MISMATCH` |
| Prescription of another branch | 422 `PRESCRIPTIONS.BRANCH_MISMATCH` |
| Status not Verified/PartiallyDispensed | 422 `PRESCRIPTIONS.NOT_DISPENSABLE` |
| Expired | 422 `PRESCRIPTIONS.EXPIRED` |
| Patient mismatch | 422 `PRESCRIPTIONS.PATIENT_MISMATCH` |
| Item id of another organization | 422 `PRESCRIPTIONS.NOT_DISPENSABLE` (no existence leak) |
| Same key different payload | 422 `COMMON.IDEMPOTENCY_KEY_REUSED` |
| No `prescriptions.dispense` | 403 `COMMON.FORBIDDEN` |

## Edge Cases
- Stock shortage (`INVENTORY.INSUFFICIENT_STOCK`) rejects the sale before or after prescription validation; the prescription is unchanged either way.
- A prescription-linked line for an OTC medicine follows the same validation as Rx-only lines.
- Lock order: prescription item rows (by id) before batch balance rows (by batch id) to prevent deadlocks.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-08-064 | Integration | Dispensing context content | US-08-12-AC1 |
| TS-08-065 | Integration | **CS-04**: visit 1 dispenses 1 of 3 packs (FEFO B1) → PartiallyDispensed; visit 2 (other pharmacist, +10 days) dispenses 2 packs across B1/B2 → FullyDispensed; verify 3 dispensing records, quantities, statuses, history | US-08-12-AC2, US-08-12-AC3 |
| TS-08-066 | Integration | Over-remaining single line and split lines → full rollback | US-08-12-AC4 |
| TS-08-067 | Integration | Medicine/branch/status mismatch matrix | US-08-12-AC5 |
| TS-08-068 | Concurrency | 50 parallel sales vs remaining 1 pack → exactly 1 success (PostgreSQL) | US-08-12-AC6 |
| TS-08-069 | Integration | Pack rounding without/with reason | US-08-12-AC7 |
| TS-08-070 | Integration | Patient auto-set and mismatch | US-08-12-AC8 |
| TS-08-071 | Security | Cashier without dispense permission → 403 on context and sale | US-08-12-AC9 |
| TS-08-072 | Integration | Idempotent retry (CS-11) and fault injection rollback (CS-10) | US-08-12-AC10 |
| TS-08-073 | Performance | Validation overhead ≤ 150 ms p95 for 10 linked lines | US-08-12-AC2 |
