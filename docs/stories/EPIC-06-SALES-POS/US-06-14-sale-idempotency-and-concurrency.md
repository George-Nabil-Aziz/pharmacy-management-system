# US-06-14: Sale Completion Idempotency, Concurrency, and Failure Safety

| Field | Value |
|---|---|
| Story ID | US-06-14 |
| Epic | EPIC-06 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-06-036, FR-06-037 |
| Related Business Rules | BR-G-08, BR-G-10, BR-G-19, BR-06-014, BR-06-015 |
| Dependencies | US-06-12, US-04-06 |

## User Story
As an owner, I want sale completion to be safe under retries, simultaneous cashiers, and database failures so that we never oversell, double-charge, or lose stock records.

## Business Value
Delivers the hard gates NFR-G-06 and CS-01/CS-10/CS-11; without them stock and cash cannot be trusted.

## Preconditions
- US-06-12 implemented; `IdempotencyRecord` infrastructure; tests run on PostgreSQL with RLS enabled.

## Acceptance Criteria
### US-06-14-AC1: Last unit sold concurrently (CS-01)
- **Given** Medicine L has exactly 1 sellable base unit in branch A, and cashiers C and D each have an open session
- **When** both submit a sale of 1 unit at the same time
- **Then** exactly one returns 201 and the other 409 `INVENTORY.INSUFFICIENT_STOCK`; the batch balance is 0; exactly one `Sale` movement exists

### US-06-14-AC2: Replay with same key (CS-11)
- **Given** a sale was committed for Idempotency-Key K
- **When** the client retries the identical request with K (e.g., after a timeout)
- **Then** the response is the stored 201 body with header `Idempotency-Replayed: true`; no second sale, movement, payment, or invoice number exists

### US-06-14-AC3: Concurrent duplicates (CS-11)
- **Given** 100 identical requests with key K are sent concurrently
- **When** they complete
- **Then** exactly 1 sale exists and all successful responses carry the same sale id and invoice number

### US-06-14-AC4: Key reused with different body
- **Given** key K was used for a committed sale
- **When** a request with K and a different cart is sent
- **Then** the response is 422 `COMMON.IDEMPOTENCY_KEY_REUSED` and nothing is persisted

### US-06-14-AC5: Database failure mid-deduction (CS-10)
- **Given** a fault is injected after the `Sale` stock movements are inserted and before commit
- **When** the sale is submitted
- **Then** the response is 500 `COMMON.INTERNAL_ERROR`; batch balances, stock movements, payments, cash movements, document sequence, and idempotency records are exactly as before; a retry with the same key then succeeds once

### US-06-14-AC6: Deadlock and lock timeout
- **Given** two carts containing Medicines M and N in opposite order, and a third transaction holding a lock on a needed balance row for 5 s
- **When** they are submitted concurrently
- **Then** the first two both commit (single ordered `FOR UPDATE` in BatchId order prevents deadlock; any deadlock is retried up to 2 additional times) and the third returns 503 `COMMON.LOCK_TIMEOUT` with `Retry-After: 1` with nothing persisted; exhausted deadlock retries return 503 `COMMON.TRANSIENT_CONFLICT`

### US-06-14-AC7: Client key lifecycle
- **Given** the POS submitted with key K and got a network timeout
- **When** the cashier presses Complete again without changes, and later edits the cart and presses Complete
- **Then** the first retry reuses K; after the edit a new key is generated; a missing key returns 400 `COMMON.IDEMPOTENCY_KEY_REQUIRED`

### US-06-14-AC8: Keys are per user and organization
- **Given** cashier D (same organization) and a user of another organization send a request with the same key value K used by C
- **When** they submit their own carts
- **Then** each is processed independently (keys are scoped by OrganizationId and UserId) and no response of C is ever returned to them (CS-08)

## Validation Rules
- VR-06-021; idempotency records retained 24 h.

## Authorization Rules
- As US-06-12; replayed responses are returned only to the same organization and user (403 rules unchanged).

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Missing key | 400 `COMMON.IDEMPOTENCY_KEY_REQUIRED` |
| Key reused, different body | 422 `COMMON.IDEMPOTENCY_KEY_REUSED` |
| Oversell attempt | 409 `INVENTORY.INSUFFICIENT_STOCK` |
| Lock wait > 3 s | 503 `COMMON.LOCK_TIMEOUT` |
| Deadlock retries exhausted | 503 `COMMON.TRANSIENT_CONFLICT` |
| DB failure | 500 `COMMON.INTERNAL_ERROR` |

## Edge Cases
- Failed (4xx/5xx) outcomes are not stored; a retry with the same key re-evaluates current state.
- Key older than 24 h → treated as new (client never retries that long; cart cleared on success).
- Response lost after commit → replay returns 201.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-06-080 | Concurrency | CS-01: two cashiers, last unit → one success, one `INVENTORY.INSUFFICIENT_STOCK`, balance 0, one movement | US-06-14-AC1 |
| TS-06-081 | Concurrency | CS-01: 50 parallel completions for 10 units × 100 runs → zero oversell, no negative balance | US-06-14-AC1 |
| TS-06-082 | Integration | CS-11: replay with same key returns stored response, single effect | US-06-14-AC2 |
| TS-06-083 | Concurrency | CS-11: 100 concurrent duplicates → one sale | US-06-14-AC3 |
| TS-06-084 | Integration | Key reuse with different body → 422 | US-06-14-AC4 |
| TS-06-085 | Fault injection | CS-10: DB failure after stock movements → full rollback; retry succeeds once | US-06-14-AC5 |
| TS-06-086 | Concurrency | Opposite-order carts commit; lock timeout 503 `COMMON.LOCK_TIMEOUT`; exhausted retries 503 | US-06-14-AC6 |
| TS-06-087 | E2E | POS key reuse on retry, new key after edit; missing key 400 | US-06-14-AC7 |
| TS-06-088 | Security | Same key value from other user / CS-08 other organization processed independently | US-06-14-AC8 |
| TS-06-089 | Fault injection | Invoice-number gap audit over 10,000 completions with 5% injected failures | US-06-14-AC5 |
