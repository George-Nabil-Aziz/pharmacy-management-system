# US-04-06: Posting transactions, idempotency, and failure guarantees

| Field | Value |
|---|---|
| Story ID | US-04-06 |
| Epic | EPIC-04 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-04-008, FR-04-011, FR-04-019, FR-04-025, FR-04-026, FR-04-027, FR-04-028 |
| Related Business Rules | BR-G-09, BR-G-16, BR-G-19, BR-G-24, BR-04-007, BR-04-008 |
| Dependencies | US-04-02, US-04-04 |

## User Story
As a branch manager, I want every inventory posting to either fully happen once or not at all so that retries, crashes, and contention never leave partial or duplicated stock changes.

## Business Value
Delivers CS-10 and CS-11 for inventory documents and the shared transaction pattern reused by SPEC-05/06/08.

## Preconditions
- Unit of work, idempotency filter, audit interceptor, and outbox from BuildingBlocks are available.
- Posting endpoints are flagged `[RequiresIdempotencyKey]` (SPEC-04 §10).

## Acceptance Criteria
### US-04-06-AC1: Full rollback on failure mid-posting (CS-10)
- **Given** a 3-line adjustment below threshold in `Draft` and a fault injector that raises a database error after the 2nd movement insert
- **When** the user submits it
- **Then** the response is 500 `COMMON.INTERNAL_ERROR`; no movement, balance change, document number, status change, audit entry, outbox message, or idempotency record exists; the document remains `Draft`

### US-04-06-AC2: Connection lost before commit, retry succeeds once (CS-10, CS-11)
- **Given** the database connection is terminated after all writes but before COMMIT of a write-off approval
- **When** the client retries with the same `Idempotency-Key`
- **Then** the retry posts the write-off once; exactly one set of movements and one document number exist

### US-04-06-AC3: Sequential replay returns the same response (CS-11)
- **Given** a transfer dispatch completed with key K and response 200
- **When** the same request with key K is sent again within 24 h
- **Then** the stored response (same status and body) is returned, and no additional `TransferOut` movement or audit entry is written

### US-04-06-AC4: Same key with a different body
- **Given** key K was used for adjustment approval of document D1
- **When** key K is sent for approval of document D2
- **Then** the response is 422 `COMMON.IDEMPOTENCY_KEY_REUSED` and nothing is written

### US-04-06-AC5: Concurrent duplicate requests (CS-11)
- **Given** two identical stocktake approval requests with key K arrive simultaneously
- **When** both execute
- **Then** the second blocks on the idempotency record insert until the first commits, then replays the first response; variance movements exist once

### US-04-06-AC6: Missing key
- **Given** a posting endpoint requiring idempotency
- **When** the request has no `Idempotency-Key` header
- **Then** the response is 400 `COMMON.IDEMPOTENCY_KEY_REQUIRED`

### US-04-06-AC7: Lock timeout
- **Given** another transaction holds a lock on a batch balance for longer than 3 s
- **When** an adjustment submit needs that batch
- **Then** the response is 503 `COMMON.LOCK_TIMEOUT` with `Retry-After: 1`, nothing is written, and a retry with the same key after the lock is released succeeds

### US-04-06-AC8: Deadlock retried transparently
- **Given** a deadlock (40P01) is injected on the first attempt of a dispatch
- **When** the execution strategy retries
- **Then** the second attempt succeeds and the client receives one success; after 3 failed attempts the response is 503 `COMMON.TRANSIENT_CONFLICT`

### US-04-06-AC9: Unauthorized posting attempts leave no trace
- **Given** a user without `inventory.adjustments.create`, or assigned to another branch, or calling a document id of another organization
- **When** the user calls the submit endpoint with a valid key
- **Then** the responses are 403 `IDENTITY.PERMISSION_DENIED`, 403 `IDENTITY.BRANCH_ACCESS_DENIED`, 404 `COMMON.NOT_FOUND`, and no idempotency record is stored

## Validation Rules
- `Idempotency-Key` must be a UUID; otherwise 400 `COMMON.VALIDATION_FAILED`.

## Authorization Rules
- Authorization runs before the idempotency filter stores anything; idempotency records are keyed (OrganizationId, UserId, Key).

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Missing key | 400 `COMMON.IDEMPOTENCY_KEY_REQUIRED` |
| Key reused with different body | 422 `COMMON.IDEMPOTENCY_KEY_REUSED` |
| Lock timeout | 503 `COMMON.LOCK_TIMEOUT` |
| Deadlock after retries | 503 `COMMON.TRANSIENT_CONFLICT` |
| Unexpected DB failure | 500 `COMMON.INTERNAL_ERROR`, full rollback |

## Edge Cases
- Validation failures (4xx) are stored as idempotent responses only when produced after the business transaction started; authorization failures are never stored.
- A request replayed after 24 h is treated as new; document state guards (`INVENTORY.INVALID_STATE_TRANSITION`) prevent a second posting.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-04-039 | Integration | CS-10: fault injection after N SQL commands (N = 1..k) for adjustment, write-off, opening balance, transfer dispatch/receipt, stocktake approval — all tables unchanged | US-04-06-AC1 |
| TS-04-040 | Integration | CS-10: connection kill before COMMIT then retry with same key → single effect | US-04-06-AC2 |
| TS-04-041 | API | CS-11: sequential replay of dispatch with same key returns identical response, one movement set | US-04-06-AC3 |
| TS-04-042 | API | CS-11: same key different document → 422 IDEMPOTENCY_KEY_REUSED | US-04-06-AC4 |
| TS-04-043 | Concurrency | CS-11: concurrent duplicate stocktake approval → one effect, both responses identical | US-04-06-AC5 |
| TS-04-044 | API | Missing key on each posting endpoint → 400 | US-04-06-AC6 |
| TS-04-045 | Integration | Held lock > 3 s → 503 LOCK_TIMEOUT, nothing written, retry succeeds | US-04-06-AC7 |
| TS-04-046 | Integration | Injected deadlock retried; three failures → 503 TRANSIENT_CONFLICT | US-04-06-AC8 |
| TS-04-047 | API | 403 permission, 403 branch (CS-07), 404 other org (CS-08); no idempotency record stored | US-04-06-AC9 |
