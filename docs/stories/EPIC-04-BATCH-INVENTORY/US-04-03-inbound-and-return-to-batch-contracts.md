# US-04-03: Inbound find-or-create and return-to-batch contracts

| Field | Value |
|---|---|
| Story ID | US-04-03 |
| Epic | EPIC-04 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-04-001, FR-04-012, FR-04-013, FR-04-014, FR-04-015 |
| Related Business Rules | BR-G-03, BR-G-04, BR-G-12, BR-04-003, BR-04-004, BR-04-005, BR-04-031, BR-04-032 |
| Dependencies | US-04-02 |

## User Story
As a procurement or sales module developer, I want inbound and return contracts that resolve the correct batch so that receipts, transfers, voids, and returns always land in the right batch without duplicates.

## Business Value
Correct batch identity keeps FEFO, costs, and traceability accurate across receiving (SPEC-05), returns (SPEC-06), and transfers.

## Preconditions
- US-04-02 posting service available; medicine is `Active` for inbound postings.

## Acceptance Criteria
### US-04-03-AC1: New batch created when no match
- **Given** branch A has no batch of medicine M with number `B100`
- **When** `PostInbound` is called with key (A, M, `b100 `, 2027-03-31, cost 12.5000, supplier S) and quantity 60 of type `Receipt`
- **Then** a `Batch` with normalized number `B100`, its `BatchBalance` (OnHand 60), and one `Receipt` movement are created, and the batch id is returned

### US-04-03-AC2: Matching batch incremented
- **Given** batch `B100` exists with the identical receipt key and OnHand 60
- **When** `PostInbound` is called with the same key and quantity 40
- **Then** no new batch is created, OnHand = 100, and a second movement with BatchSequence 2 is written

### US-04-03-AC3: Different cost or supplier creates a separate batch
- **Given** batch `B100` exists with cost 12.5000 from supplier S
- **When** `PostInbound` is called with the same number and expiry but cost 13.0000
- **Then** a second batch with the same number and expiry is created; FEFO orders them by CreatedAt

### US-04-03-AC4: Expiry mismatch rejected
- **Given** batch `B100` of medicine M in branch A expires 2027-03-31
- **When** `PostInbound` is called for `B100` of M in A with expiry 2027-04-30
- **Then** the contract returns 422 `INVENTORY.BATCH_EXPIRY_MISMATCH` and nothing is written

### US-04-03-AC5: Month/year expiry normalization
- **Given** an inbound request with expiry input `02/2028`
- **When** it is validated
- **Then** the stored ExpiryDate is 2028-02-29; input `13/2027` returns 422 `INVENTORY.EXPIRY_DATE_INVALID`

### US-04-03-AC6: Restock into an expired or quarantined batch is rejected
- **Given** batch B sold 5 units and has since become `Expired` (or `Quarantined`)
- **When** `ReturnToBatch(B, SalesReturn, 2, …)` is called
- **Then** the contract returns 422 `INVENTORY.BATCH_NOT_SELLABLE` (reason `Expired` or `Quarantined`), no movement is written, and OnHand is unchanged; a `ReturnToBatch(B, TransferReturn, 2, …)` into the same batch is accepted and the batch stays non-sellable

### US-04-03-AC7: Inbound to inactive medicine rejected
- **Given** medicine M is `Inactive`
- **When** `PostInbound` is called for M
- **Then** the contract returns 422 `INVENTORY.MEDICINE_INACTIVE` and nothing is written

## Validation Rules
- VR-04-002 batch number, VR-04-003 expiry, VR-04-004 unit cost, VR-04-006 mismatch, VR-04-007 medicine active (inbound only).

## Authorization Rules
- Internal contract; caller's permissions apply (e.g., `procurement.receipts.post`). Tenant context asserted; RLS enforced.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Same number, different expiry | 422 `INVENTORY.BATCH_EXPIRY_MISMATCH` |
| Invalid expiry / cost / number | 422 `INVENTORY.EXPIRY_DATE_INVALID` / `INVENTORY.UNIT_COST_INVALID` / `INVENTORY.BATCH_NUMBER_INVALID` |
| Inactive medicine on inbound | 422 `INVENTORY.MEDICINE_INACTIVE` |
| Return to batch of another branch/organization | 404 `COMMON.NOT_FOUND` |
| `SalesReturn` restock into expired / do-not-sell-window / quarantined batch | 422 `INVENTORY.BATCH_NOT_SELLABLE` |

## Edge Cases
- Two concurrent receipts creating the same new batch: the unique partial index on the receipt key makes one insert fail; the contract retries the find step once and increments the batch created by the other transaction.
- `TransferIn` uses the lineage key (BR-04-005), covered in US-04-22.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-04-014 | Integration | Receipt into unknown key creates batch, balance, movement; number normalized | US-04-03-AC1 |
| TS-04-015 | Integration | Same key increments existing batch with sequence 2 | US-04-03-AC2 |
| TS-04-016 | Integration | Different cost creates second batch; FEFO preview orders by CreatedAt | US-04-03-AC3 |
| TS-04-017 | Integration | Same number different expiry → 422 BATCH_EXPIRY_MISMATCH | US-04-03-AC4 |
| TS-04-018 | Unit | Month/year normalization incl. leap February and invalid month | US-04-03-AC5 |
| TS-04-019 | Integration | SalesReturn into expired or quarantined batch rejected with BATCH_NOT_SELLABLE, nothing written; TransferReturn into the same batch accepted, sellable stays 0 | US-04-03-AC6 |
| TS-04-020 | Integration | Inbound to inactive medicine rejected; concurrent creation of same key yields one batch | US-04-03-AC7 |
