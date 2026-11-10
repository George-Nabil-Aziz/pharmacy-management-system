# US-04-23: Stocktake creation and start with snapshot

| Field | Value |
|---|---|
| Story ID | US-04-23 |
| Epic | EPIC-04 |
| Priority | P1 |
| Complexity | M |
| Related Requirements | FR-04-058, FR-04-059 |
| Related Business Rules | BR-04-007, BR-04-022, BR-04-030 |
| Dependencies | US-04-02 |

## User Story
As an inventory staff member, I want to define a full or cycle count and start it with a snapshot of system quantities so that counting can happen while the pharmacy keeps selling.

## Business Value
Enables periodic physical verification (BRQ-04) without closing the branch.

## Preconditions
- Branch active; batches exist.

## Acceptance Criteria
### US-04-23-AC1: Create a cycle stocktake
- **Given** a user with `inventory.stocktakes.manage` at branch A
- **When** the user creates a `Cycle` stocktake scoped to category "Antibiotics" and medicine M9
- **Then** a `Draft` stocktake is created with the scope and no lines; a `Cycle` with empty scope returns 422 `INVENTORY.STOCKTAKE_SCOPE_INVALID`

### US-04-23-AC2: Start takes a snapshot
- **Given** the scope resolves to 120 batches with OnHand > 0 (including expired and quarantined batches)
- **When** the user starts the stocktake with a valid `If-Match`
- **Then** in one transaction (balance rows locked `FOR SHARE` in BatchId order) 120 lines are created with SnapshotOnHand and SnapshotSequence = each batch's LastMovementSequence, status becomes `Counting`, StartedAt is set, number `{BranchCode}-STK-2026-NNNNNN` is assigned, and an audit entry is written

### US-04-23-AC3: Scope overlap rejected
- **Given** batch B is in a stocktake that is `Counting`
- **When** a second stocktake whose scope includes B is started
- **Then** the response is 409 `INVENTORY.STOCKTAKE_SCOPE_OVERLAP` listing up to 50 overlapping batches, and the second stocktake stays `Draft`

### US-04-23-AC4: Sales continue during counting
- **Given** the stocktake is `Counting`
- **When** cashiers sell scoped medicines
- **Then** sales complete normally (no lock is held after the start transaction) and the movements have BatchSequence > SnapshotSequence

### US-04-23-AC5: Full count scope
- **Given** branch A has 3,000 batches with OnHand > 0 and 900 batches with OnHand 0
- **When** a `Full` stocktake is started
- **Then** 3,000 lines are created; zero-balance batches are not included (found stock is added during counting)

### US-04-23-AC6: Authorization
- **Given** a cashier without `inventory.stocktakes.manage`, a user not assigned to branch B, and a stocktake id of another organization
- **When** each creates or starts a stocktake
- **Then** the responses are 403 `IDENTITY.PERMISSION_DENIED`, 403 `IDENTITY.BRANCH_ACCESS_DENIED`, and 404 `COMMON.NOT_FOUND`

## Validation Rules
- VR-04-017; VR-04-022 (start only from `Draft`); cancel reason 10–500 characters.

## Authorization Rules
- `inventory.stocktakes.manage` + branch assignment.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Empty cycle scope | 422 `INVENTORY.STOCKTAKE_SCOPE_INVALID` |
| Overlap | 409 `INVENTORY.STOCKTAKE_SCOPE_OVERLAP` |
| Start from non-Draft | 409 `INVENTORY.INVALID_STATE_TRANSITION` |
| Lock wait > 3 s at start | 503 `COMMON.LOCK_TIMEOUT` |

## Edge Cases
- A medicine added to the scoped category after start is not in scope; it can be counted as an added line.
- Start of a full count on 10,000 batches completes within the start transaction p95 ≤ 5 s.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-04-160 | API | Create cycle draft; empty scope → 422 | US-04-23-AC1 |
| TS-04-161 | Integration | Start snapshot lines with sequence, number, audit | US-04-23-AC2 |
| TS-04-162 | Integration | Overlapping start → 409 with batch list | US-04-23-AC3 |
| TS-04-163 | Concurrency | Sales during Counting succeed; movements after snapshot sequence | US-04-23-AC4 |
| TS-04-164 | Integration | Full count includes only OnHand > 0 batches | US-04-23-AC5 |
| TS-04-165 | API | 403 permission, 403 branch (CS-07), 404 other org (CS-08) | US-04-23-AC6 |
