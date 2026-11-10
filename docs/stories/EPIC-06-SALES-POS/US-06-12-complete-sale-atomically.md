# US-06-12: Complete a Sale Atomically

| Field | Value |
|---|---|
| Story ID | US-06-12 |
| Epic | EPIC-06 |
| Priority | P0 |
| Complexity | L |
| Related Requirements | FR-06-021, FR-06-028, FR-06-029, FR-06-030, FR-06-031, FR-06-032, FR-06-033 |
| Related Business Rules | BR-G-05, BR-G-06, BR-G-07, BR-G-08, BR-G-09, BR-G-10, BR-G-16, BR-G-19, BR-G-24, BR-G-35, BR-06-006, BR-06-013, BR-06-014, BR-06-015, BR-06-016, BR-06-033 |
| Dependencies | US-06-04, US-06-05, US-06-06, US-06-08, US-04-04, US-04-06, US-02-08, US-10-01 |

## User Story
As a cashier, I want pressing "Complete" to record the whole sale — stock deduction, payments, cash, invoice number — in one step that either fully succeeds or leaves nothing behind so that stock and money are always consistent.

## Business Value
This is the core money-and-stock transaction of the product (SPEC-06 §7.3). Atomicity, server re-pricing, and FEFO allocation enforce BRQ-05 and BRQ-07.

## Preconditions
- Cashier C owns an `Open` session S in branch A and holds `sales.pos.sell`.
- `IInventoryAllocation` (SPEC-04), `DocumentSequence` (SPEC-02), audit/outbox (SPEC-10) available. PostgreSQL Row-Level Security is enabled.

## Acceptance Criteria
### US-06-12-AC1: Successful completion
- **Given** the §7.2 cart, a valid `Discount` override, payments Card 100.00 (ref `A1B2C3D4`) + Cash tendered 200.00, `expectedTotal` 261.59
- **When** C posts `POST /branches/{A}/sales` with an Idempotency-Key
- **Then** the response is 201 with invoice number `CAI01-INV-2026-000123` (next in sequence), status `Completed`, total 261.59, change 38.41; and in the same transaction: 3 sale lines with snapshots (FR-06-032), allocations with batch unit cost, `Sale` stock movements whose sum equals −(20 + 7 + 5 × PackSize) base units, balances reduced accordingly, 2 payments, one `SaleCash` cash movement +161.59, override consumed, audit `SaleCompleted`, outbox `SaleCompleted`

### US-06-12-AC2: FEFO across batches with cost snapshot
- **Given** Medicine A in branch A has batch B1 (exp 2027-01-31, 12 units, cost 6.2500), B2 (exp 2027-04-30, 50 units, cost 6.5000), and expired batch B0 (exp 2026-10-31, 30 units)
- **When** a sale of 2 packs (20 units) completes
- **Then** allocations are B1 = 12 at 6.2500 and B2 = 8 at 6.5000; B0 is untouched; B1 sellable becomes 0

### US-06-12-AC3: Expired, do-not-sell, and quarantined stock never sold (CS-02)
- **Given** Medicine F whose only stock is an expired batch, Medicine G whose only stock is inside the do-not-sell window, and Medicine H whose only batch is `Quarantined`
- **When** a sale containing any one of them is submitted
- **Then** the response is 409 `INVENTORY.INSUFFICIENT_STOCK` with `shortages[].sellable = 0` for that line, and no sale, movement, payment, or invoice number is persisted

### US-06-12-AC4: Server re-pricing rejects client total mismatch
- **Given** the branch price of Medicine A changed from 85.5000 to 86.0000 after the cart was quoted
- **When** C submits with `expectedTotal` 261.59
- **Then** the response is 409 `SALES.PRICE_MISMATCH` with the server quote (new total) in the Problem Details `quote` extension, and nothing is persisted

### US-06-12-AC5: Batch selling price override splits the line
- **Given** Medicine K's FEFO allocation for 30 units is 20 from a batch with `SellingPriceOverride` 95.0000 per pack and 10 from a batch priced by the branch price 90.0000 (PackSize 10, unit BaseUnit)
- **When** the sale completes with the quoted `expectedTotal`
- **Then** two sale lines are stored (20 units at 9.5000, 10 units at 9.0000) each with its own allocation, both derived from the same cart line

### US-06-12-AC6: Session required and owned
- **Given** C's session S is `Closed`, and separately session T belongs to cashier D
- **When** C submits a sale with S, and with T
- **Then** S yields 409 `SALES.CASH_SESSION_NOT_OPEN`; T yields 403 `SALES.CASH_SESSION_NOT_OWNED`; nothing is persisted

### US-06-12-AC7: Gapless invoice numbering under failures
- **Given** 3 sales where the second fails with `INVENTORY.INSUFFICIENT_STOCK`
- **When** they are submitted in order
- **Then** the committed invoice numbers are consecutive (…000124, …000125) with no gap

### US-06-12-AC8: Permission, cross-branch, and cross-organization
- **Given** a user without `sales.pos.sell`, a user assigned only to branch B, and a cart containing a medicine id of another organization
- **When** each submits a sale to branch A
- **Then** the first two receive 403 `COMMON.FORBIDDEN` (CS-07); the third receives 422 `SALES.MEDICINE_NOT_SELLABLE` and no data of the other organization is revealed (CS-08)

## Validation Rules
- VR-06-003 to VR-06-022; `expectedTotal` 2 dp.

## Authorization Rules
- `sales.pos.sell` + branch assignment + session ownership; Rx lines additionally per US-06-26; discounts per US-06-06.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Empty lines | 422 `SALES.EMPTY_SALE` |
| Insufficient sellable stock | 409 `INVENTORY.INSUFFICIENT_STOCK` |
| Price changed | 409 `SALES.PRICE_MISMATCH` |
| Session closed / missing | 409 `SALES.CASH_SESSION_NOT_OPEN` |
| Session of another user | 403 `SALES.CASH_SESSION_NOT_OWNED` |
| Missing Idempotency-Key | 400 `COMMON.IDEMPOTENCY_KEY_REQUIRED` |
| No permission / other branch | 403 `COMMON.FORBIDDEN` |

## Edge Cases
- Same medicine on two cart lines (pack + base units) → allocated in one `AllocateAndLock` call; combined quantity checked.
- Batch expires between quote and completion → allocation at completion uses the completion business date.
- Total 0.00 (100% discount with override) → no payments, no cash movement, invoice still numbered.
- Sale completed at 23:59:59.900 Cairo time → business date of that day; DocumentSequence year from business date.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-06-065 | Integration | Full completion of §7.2 cart; verify every written row and balances | US-06-12-AC1 |
| TS-06-066 | Integration | FEFO across two batches with unit cost snapshot; expired batch untouched | US-06-12-AC2 |
| TS-06-067 | Integration | CS-02: expired, do-not-sell window, and quarantined-only stock rejected; nothing persisted | US-06-12-AC3 |
| TS-06-068 | Integration | Price change → `SALES.PRICE_MISMATCH` with quote; nothing persisted | US-06-12-AC4 |
| TS-06-069 | Integration | Batch selling price override splits line into two sale lines | US-06-12-AC5 |
| TS-06-070 | Integration | Closed session 409; other user's session 403 | US-06-12-AC6 |
| TS-06-071 | Integration | Invoice numbers consecutive around a failed sale | US-06-12-AC7 |
| TS-06-072 | Security | 403 permission, CS-07 cross-branch 403, CS-08 other-org medicine not revealed (RLS on) | US-06-12-AC8 |
| TS-06-073 | Performance | p95 ≤ 800 ms / p99 ≤ 1.5 s at 20 cashiers × 50 branches | US-06-12-AC1 |
