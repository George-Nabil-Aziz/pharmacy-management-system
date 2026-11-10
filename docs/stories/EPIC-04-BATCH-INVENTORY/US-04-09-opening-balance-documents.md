# US-04-09: Opening balance documents and lock

| Field | Value |
|---|---|
| Story ID | US-04-09 |
| Epic | EPIC-04 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-04-015, FR-04-032, FR-04-033 |
| Related Business Rules | BR-G-05, BR-G-19, BR-G-24, BR-04-003, BR-04-004, BR-04-016, BR-04-030 |
| Dependencies | US-04-03 |

## User Story
As a pharmacy owner going live, I want to enter my existing shelf stock as opening balances by batch and then lock them so that the system starts from an accurate, traceable stock position.

## Business Value
Go-live prerequisite for every branch (P0); without it FEFO, sales, and valuation start from zero.

## Preconditions
- Branch `Active`; `BranchSettings.OpeningBalanceLocked = false`; medicines exist in the catalog.

## Acceptance Criteria
### US-04-09-AC1: Create and post an opening balance
- **Given** an owner with `inventory.opening-balances.manage` creates a draft with 3 lines (M1 batch `A1` exp 2027-05-31 cost 10.0000 qty 100; M2 `B7` exp 2026-12-31 cost 4.2500 qty 40; M2 `B8` exp 2027-08-31 cost 4.5000 qty 20)
- **When** the owner posts it with an `Idempotency-Key`
- **Then** status is `Posted`, number `{BranchCode}-OPB-2026-000001` is assigned, 3 batches are created with `OpeningBalance` movements and balances 100/40/20, and one audit entry records the post

### US-04-09-AC2: Pack quantity conversion
- **Given** M1 has PackSize 20
- **When** a line is entered as 5 packs plus 3 base units
- **Then** the stored line quantity is 103 base units and the movement QuantityDelta is +103

### US-04-09-AC3: Expired stock accepted as Expired
- **Given** a line with expiry `09/2026` and business date 2026-11-09
- **When** the document is posted
- **Then** the batch is created with ExpiryDate 2026-09-30 and status `Expired`, sellable 0, and appears in the expired write-off prefill

### US-04-09-AC4: Lock opening balances
- **Given** opening balances were posted for branch A
- **When** the owner calls `POST /api/v1/branches/A/inventory/opening-balances/lock`
- **Then** `OpeningBalanceLocked` becomes true, an audit entry is written, and a subsequent post of another draft returns 409 `INVENTORY.OPENING_BALANCE_LOCKED` with the draft unchanged

### US-04-09-AC5: Line limit and validation
- **Given** a draft with 5,001 lines, or a line with cost −1, or a line whose batch number exists with another expiry
- **When** it is saved or posted
- **Then** the response is 422 `INVENTORY.DOCUMENT_LINES_INVALID`, `INVENTORY.UNIT_COST_INVALID`, or `INVENTORY.BATCH_EXPIRY_MISMATCH` respectively and nothing is posted

### US-04-09-AC6: Atomic posting and retry (CS-10, CS-11)
- **Given** a 5,000-line draft
- **When** a failure is injected at line 4,999 and then the client retries with the same key twice
- **Then** after the failure no batch, movement, or number exists; the first retry posts all 5,000 lines; the second retry replays the response with no extra movements

### US-04-09-AC7: Authorization
- **Given** a manager without `inventory.opening-balances.manage`, an owner of another organization, and a user not assigned to branch A without organization-wide scope
- **When** each tries to create, post, or lock
- **Then** the responses are 403 `IDENTITY.PERMISSION_DENIED`, 404 `COMMON.NOT_FOUND`, and 403 `IDENTITY.BRANCH_ACCESS_DENIED`

## Validation Rules
- VR-04-001..VR-04-007, VR-04-012 (1–5,000 lines). Selling price override optional (VR-04-005).

## Authorization Rules
- `inventory.opening-balances.manage` for create, edit, post, lock; branch assignment or organization-wide scope.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Posting after lock | 409 `INVENTORY.OPENING_BALANCE_LOCKED` |
| Posting an already posted document | 409 `INVENTORY.INVALID_STATE_TRANSITION` |
| Invalid line data | 422 field codes (VR-04-001..007) |
| Missing Idempotency-Key on post | 400 `COMMON.IDEMPOTENCY_KEY_REQUIRED` |
| Draft edit with stale ETag | 412 `COMMON.CONCURRENCY_CONFLICT` |

## Edge Cases
- Lines with the same receipt key are merged (SPEC-04 E-15); a matching existing batch from an earlier opening balance is incremented.
- Locking is allowed with zero posted documents (branch opened with no stock). Lock is irreversible (OD-04-04).

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-04-060 | Integration | Post 3-line opening balance: batches, movements, number, audit | US-04-09-AC1 |
| TS-04-061 | Unit | Pack + base-unit conversion to base units | US-04-09-AC2 |
| TS-04-062 | Integration | Expired opening balance batch flagged Expired and non-sellable | US-04-09-AC3 |
| TS-04-063 | API | Lock then post → 409 OPENING_BALANCE_LOCKED | US-04-09-AC4 |
| TS-04-064 | API | Line count, cost, and expiry mismatch validations | US-04-09-AC5 |
| TS-04-065 | Performance | NFR-04-003: 5,000-line post p95 ≤ 30 s | US-04-09-AC6 |
| TS-04-066 | Integration | CS-10: injected failure at line 4,999 leaves no trace | US-04-09-AC6 |
| TS-04-067 | API | CS-11: retries with same key → one posting; plus 403 permission, 403 branch (CS-07), 404 other org (CS-08) | US-04-09-AC6, US-04-09-AC7 |
