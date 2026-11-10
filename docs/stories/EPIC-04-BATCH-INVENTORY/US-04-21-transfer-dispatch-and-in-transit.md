# US-04-21: Transfer dispatch and in-transit visibility

| Field | Value |
|---|---|
| Story ID | US-04-21 |
| Epic | EPIC-04 |
| Priority | P1 |
| Complexity | M |
| Related Requirements | FR-04-053, FR-04-054 |
| Related Business Rules | BR-G-07, BR-G-13, BR-04-019, BR-04-020, BR-04-027 |
| Dependencies | US-04-20 |

## User Story
As the source branch inventory staff, I want to dispatch an approved transfer so that stock leaves my branch's books, and both branches can see it in transit until it arrives.

## Business Value
Accurate branch stock during shipment and visibility of goods on the road (CS-06).

## Preconditions
- Transfer `Approved` with reservations; dispatcher assigned to the source branch.

## Acceptance Criteria
### US-04-21-AC1: Dispatch posts TransferOut
- **Given** T (A → C) is `Approved` with allocations B1 = 25, B2 = 15 reserved
- **When** user D with `inventory.transfers.dispatch` assigned to A dispatches all quantities with an `Idempotency-Key`
- **Then** `TransferOut` movements −25 (B1) and −15 (B2) are written, OnHand and Reserved decrease by the same amounts, DispatchedQty is stored, status becomes `InTransit`, and `Inventory.TransferStatusChanged.v1` notifies branch C

### US-04-21-AC2: Partial dispatch releases remainder
- **Given** only 10 of B2's 15 reserved units can be found
- **When** D dispatches B1 = 25, B2 = 10
- **Then** `TransferOut` −10 is written for B2, the remaining 5 reserved units are released, and dispatching more than reserved returns 422 `INVENTORY.TRANSFER_QUANTITY_INVALID`

### US-04-21-AC3: Batch no longer eligible at dispatch
- **Given** B1 was quarantined (or expired) after approval
- **When** D dispatches
- **Then** the response is 422 `INVENTORY.BATCH_NOT_SELLABLE` with reason `Quarantined` (or `Expired`), nothing is written, and T stays `Approved`

### US-04-21-AC4: In-transit visibility in both branches (CS-06)
- **Given** T is `InTransit` with 40 units outstanding
- **When** users of A and C call `GET …/inventory/in-transit` and the stock overview
- **Then** A sees T as outbound and C as inbound with per-medicine and per-batch outstanding 40, dispatch time, and dispatcher; neither branch's OnHand includes the 40 units

### US-04-21-AC5: Wrong side or permission
- **Given** user R assigned only to destination C with `inventory.transfers.dispatch`, and a cashier at A without the permission
- **When** each dispatches T
- **Then** the responses are 403 `IDENTITY.BRANCH_ACCESS_DENIED` and 403 `IDENTITY.PERMISSION_DENIED`; a transfer id of another organization returns 404 `COMMON.NOT_FOUND`

### US-04-21-AC6: Retry and failure (CS-10, CS-11)
- **Given** the first dispatch request times out at the client after commit, and in a separate run a fault is injected after the first `TransferOut` insert
- **When** the client retries with the same key, and the faulted request ends
- **Then** the retry replays the original success with movements written once; the faulted run leaves T `Approved` with reservations and balances unchanged

## Validation Rules
- VR-04-016; VR-04-022 (only `Approved` can be dispatched).

## Authorization Rules
- `inventory.transfers.dispatch` + assignment to source branch; in-transit view `inventory.stock.read` at either branch.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Dispatch > reserved / zero total | 422 `INVENTORY.TRANSFER_QUANTITY_INVALID` |
| Batch quarantined/expired | 422 `INVENTORY.BATCH_NOT_SELLABLE` |
| Not `Approved` | 409 `INVENTORY.INVALID_STATE_TRANSITION` |
| Destination-side user | 403 `IDENTITY.BRANCH_ACCESS_DENIED` |
| Lock timeout | 503 `COMMON.LOCK_TIMEOUT` |

## Edge Cases
- In-transit stock is valued in the source branch until receipt (BR-04-020).
- Dispatch documents (delivery note) are printed after commit; printing failure does not affect posting.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-04-145 | Integration | Dispatch posts TransferOut, consumes reservation, status InTransit, event | US-04-21-AC1 |
| TS-04-146 | Integration | Partial dispatch releases remainder; over-dispatch → 422 | US-04-21-AC2 |
| TS-04-147 | Integration | Quarantined/expired allocated batch blocks dispatch with no writes | US-04-21-AC3 |
| TS-04-148 | E2E | CS-06: in-transit quantities visible to source and destination, excluded from OnHand | US-04-21-AC4 |
| TS-04-149 | API | CS-07 destination-only user → 403; permission → 403; CS-08 → 404 | US-04-21-AC5 |
| TS-04-150 | API | CS-11: dispatch retried with same key → one set of TransferOut movements | US-04-21-AC6 |
| TS-04-151 | Integration | CS-10: fault after first TransferOut insert → full rollback, reservations intact | US-04-21-AC6 |
