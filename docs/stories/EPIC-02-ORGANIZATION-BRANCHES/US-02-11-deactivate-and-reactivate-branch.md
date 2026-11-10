# US-02-11: Deactivate and Reactivate a Branch

| Field | Value |
|---|---|
| Story ID | US-02-11 |
| Epic | EPIC-02 |
| Priority | P1 |
| Complexity | M |
| Related Requirements | FR-02-017, FR-02-018, FR-02-019 |
| Related Business Rules | BR-G-02, BR-G-13, BR-G-26, BR-G-34, BR-02-004, BR-02-006, BR-02-007 |
| Dependencies | US-02-06, US-02-10; precondition count facades from EPIC-04, EPIC-05, EPIC-06 |

## User Story
As an Owner, I want to deactivate a branch that has closed, only after its cash, stock, and pending documents are settled, so that no stock or money is left untracked and its history stays available.

## Business Value
Prevents orphaned stock, open cash sessions, and in-transit transfers when a branch closes, while retaining records (BR-G-34).

## Preconditions
- Organization has ≥ 2 `Active` branches for a successful deactivation.

## Acceptance Criteria

### US-02-11-AC1: Deactivation check reports each precondition
- **Given** branch `ALX02` with 1 `Open` cash session, 37 batches with total on-hand 1,240, and 1 transfer `InTransit` to it
- **When** an Owner calls `GET /api/v1/branches/{ALX02}/deactivation-check`
- **Then** the response is 200 with `canDeactivate: false` and entries `ORG.BRANCH_HAS_OPEN_CASH_SESSIONS` (count 1), `ORG.BRANCH_HAS_STOCK` (1,240 base units, 37 batches), `ORG.BRANCH_HAS_ACTIVE_TRANSFERS` (count 1) failing, and `ORG.BRANCH_HAS_PENDING_DOCUMENTS`, `ORG.LAST_ACTIVE_BRANCH` passing; no state changes.

### US-02-11-AC2: Deactivation blocked
- **Given** the branch from AC1
- **When** the Owner calls `POST /api/v1/branches/{ALX02}/deactivate` with a reason
- **Then** the response is 409 `ORG.BRANCH_DEACTIVATION_BLOCKED` listing the three failing precondition codes, and the branch remains `Active`.

### US-02-11-AC3: Successful deactivation
- **Given** `ALX02` with all preconditions passing and 2 users whose only assignment is `ALX02`
- **When** the Owner deactivates it with reason "Branch closed permanently"
- **Then** the response is 200, status is `Inactive` with `deactivatedAt`, `deactivatedBy`, reason, the response lists the 2 affected user ids, and audit entry `org.branch.deactivated` is written.

### US-02-11-AC4: Inactive branch rejects new documents
- **Given** `ALX02` is `Inactive`
- **When** any posting workflow calls `AssertBranchWritable` (for example opening a cash session or creating a goods receipt)
- **Then** the request returns 409 `ORG.BRANCH_INACTIVE`, while `GET` of its historical sales and movements returns 200 to users in scope.

### US-02-11-AC5: Last active branch cannot be deactivated
- **Given** an organization with a single `Active` branch with zero stock and no open documents
- **When** the Owner deactivates it
- **Then** the response is 409 `ORG.BRANCH_DEACTIVATION_BLOCKED` with `ORG.LAST_ACTIVE_BRANCH`.

### US-02-11-AC6: Reactivation
- **Given** `ALX02` is `Inactive`
- **When** the Owner calls `POST /api/v1/branches/{ALX02}/reactivate`
- **Then** the status is `Active`, audit entry `org.branch.reactivated` is written; reactivating an `Active` branch returns 409 `ORG.INVALID_STATUS_TRANSITION`.

### US-02-11-AC7: Permission denied
- **Given** a Branch Manager (no `org.branches.deactivate`)
- **When** they call the check, deactivate, or reactivate endpoint
- **Then** each returns 403 `COMMON.FORBIDDEN`.

## Validation Rules
- VR-02-022 (reason 10–500 characters), VR-02-025.

## Authorization Rules
- `org.branches.deactivate` + branch in scope (Owner has `AllBranches`).

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Any precondition failing | 409 `ORG.BRANCH_DEACTIVATION_BLOCKED` (+ precondition codes) |
| Posting on inactive branch | 409 `ORG.BRANCH_INACTIVE` |
| Wrong status transition | 409 `ORG.INVALID_STATUS_TRANSITION` |
| Missing / short reason | 422 `COMMON.VALIDATION_FAILED` / `ORG.REASON_REQUIRED` |
| No permission | 403 `COMMON.FORBIDDEN` |
| Branch of another organization | 404 `COMMON.NOT_FOUND` |

## Edge Cases
- Preconditions are re-evaluated inside the deactivation transaction while holding a lock on the branch row; a transfer received between check and deactivate causes 409.
- Expired batches with on-hand > 0 block deactivation; they must be written off (SPEC-04) first.
- Users with `AllBranches` scope are not listed as affected.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-02-058 | Integration | Check returns pass/fail and counts per precondition, no state change | US-02-11-AC1 |
| TS-02-059 | Integration | Each precondition alone blocks deactivation (5 table-driven cases) | US-02-11-AC2, US-02-11-AC5 |
| TS-02-060 | Integration | Successful deactivation lists affected users and audits | US-02-11-AC3 |
| TS-02-061 | Integration | Inactive branch rejects postings, allows history reads | US-02-11-AC4 |
| TS-02-062 | API | Reactivation and invalid transition | US-02-11-AC6 |
| TS-02-063 | API | Manager → 403 on all three endpoints | US-02-11-AC7 |
| TS-02-064 | Concurrency | Transfer received between check and deactivate → 409 | US-02-11-AC2 |
