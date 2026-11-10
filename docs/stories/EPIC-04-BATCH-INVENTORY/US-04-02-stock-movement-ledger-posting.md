# US-04-02: Stock movement ledger and posting service

| Field | Value |
|---|---|
| Story ID | US-04-02 |
| Epic | EPIC-04 |
| Priority | P0 |
| Complexity | L |
| Related Requirements | FR-04-002, FR-04-006, FR-04-007, FR-04-008, FR-04-009, FR-04-010, FR-04-011 |
| Related Business Rules | BR-G-05, BR-G-08, BR-G-09, BR-G-10, BR-G-25, BR-04-006, BR-04-007, BR-04-008, BR-04-029 |
| Dependencies | US-04-01 |

## User Story
As an inventory domain owner, I want a single internal posting service that writes stock movements and balances atomically so that every quantity change is traceable and balances can never drift or go negative.

## Business Value
This is the only write path to stock (ADR-003). Correctness here guarantees ledger integrity for every module (BRQ-04, BRQ-05).

## Preconditions
- US-04-01 tables exist. The caller has an open transaction from the unit of work.
- The application database role has INSERT and SELECT but no UPDATE/DELETE on `inventory.stock_movements`.

## Acceptance Criteria
### US-04-02-AC1: Outbound posting writes movement and balance
- **Given** batch B has OnHand 10, Reserved 0, LastMovementSequence 4, and the caller has locked B's balance row in its lock step
- **When** the caller posts `PostOutbound(B, Sale, 3, source Sale S1 line L1)` and commits
- **Then** OnHand = 7, LastMovementSequence = 5, and exactly one movement exists with QuantityDelta −3, BalanceAfter 7, BatchSequence 5, UnitCost = batch UnitCost, BusinessDate = branch business date, SourceDocumentType `Sale`, SourceDocumentId S1, SourceLineId L1, UserId and CorrelationId set

### US-04-02-AC2: Negative on-hand prevented
- **Given** batch B has OnHand 2, Reserved 0
- **When** the caller posts an outbound quantity of 3
- **Then** the service returns `INVENTORY.INSUFFICIENT_STOCK` before writing, the caller's transaction rolls back, and OnHand stays 2 with no new movement

### US-04-02-AC3: Reserved cannot exceed on-hand
- **Given** batch B has OnHand 10, Reserved 8
- **When** the caller posts an `AdjustmentDecrease` of 3 without consuming reservation
- **Then** the service returns `INVENTORY.RESERVATION_CONFLICT` (409) and nothing is written

### US-04-02-AC4: Ledger immutability
- **Given** any stored movement
- **When** the application role issues UPDATE or DELETE on `inventory.stock_movements`, or a client looks for an update/delete endpoint
- **Then** the database rejects the statement with a privilege error and no such API route exists (OpenAPI contains no PUT/PATCH/DELETE on movements)

### US-04-02-AC5: Movement-type matrix enforced
- **Given** a caller posts type `Sale` with a positive delta, or `TransferIn` with source document type `Sale`, or delta 0
- **When** the posting service validates the request
- **Then** it rejects with a programming error (500 `COMMON.INTERNAL_ERROR`, logged at Error) before any SQL write

### US-04-02-AC6: Posting on an unlocked batch rejected
- **Given** the caller did not include batch B in its lock step
- **When** it posts a movement for B
- **Then** the service rejects with a programming error and no write occurs

### US-04-02-AC7: One StockMovementsPosted message per transaction
- **Given** one transaction posts movements for 3 batches of 2 medicines
- **When** it commits
- **Then** exactly one `Inventory.StockMovementsPosted.v1` outbox message exists listing the branch, both medicine ids, and the 3 batch ids

## Validation Rules
- QuantityDelta integer ≠ 0, |delta| ≤ 1,000,000 (VR-04-001); type/sign/source per SPEC-04 §6.3 (BR-04-006).

## Authorization Rules
- Internal contract; no HTTP endpoint. The facade asserts `OrganizationId`/`BranchId` against the ambient tenant context; RLS (enabled from MVP) provides defense in depth.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Outbound > OnHand | 409 `INVENTORY.INSUFFICIENT_STOCK` (via caller) |
| Posting would make Reserved > OnHand | 409 `INVENTORY.RESERVATION_CONFLICT` |
| Matrix violation / unlocked batch | 500 `COMMON.INTERNAL_ERROR` |
| Check constraint reached (missed pre-check) | 409 `INVENTORY.INSUFFICIENT_STOCK`, logged Warning |
| Tenant mismatch between arguments and context | 404 `COMMON.NOT_FOUND` |

## Edge Cases
- Two movements on the same batch in one transaction get consecutive BatchSequence values and chained BalanceAfter.
- A movement on an inactive medicine (decrease/return) is accepted; inbound to an inactive medicine is rejected by US-04-03.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-04-007 | Integration | Outbound posting writes balance and a complete movement row with sequence and BalanceAfter | US-04-02-AC1 |
| TS-04-008 | Integration | Outbound beyond OnHand → INSUFFICIENT_STOCK, nothing written | US-04-02-AC2 |
| TS-04-009 | Integration | Decrease breaching Reserved ≤ OnHand → RESERVATION_CONFLICT | US-04-02-AC3 |
| TS-04-010 | Integration | App DB role UPDATE/DELETE on movements fails; OpenAPI has no mutation route for movements | US-04-02-AC4 |
| TS-04-011 | Unit | Matrix validation for all 15 types × sign × source document type | US-04-02-AC5 |
| TS-04-012 | Unit | Posting to a batch outside the lock set throws before SQL | US-04-02-AC6 |
| TS-04-013 | Integration | Multi-batch transaction emits exactly one StockMovementsPosted message | US-04-02-AC7 |
