# US-04-17: Batch quarantine, release, and recall

| Field | Value |
|---|---|
| Story ID | US-04-17 |
| Epic | EPIC-04 |
| Priority | P1 |
| Complexity | M |
| Related Requirements | FR-04-028, FR-04-047, FR-04-048 |
| Related Business Rules | BR-G-16, BR-04-002, BR-04-007, BR-04-027 |
| Dependencies | US-04-04 |

## User Story
As a pharmacist or owner, I want to quarantine a batch, or recall a batch number across all branches, so that suspect stock cannot be sold or dispensed until it is released.

## Business Value
Patient safety during recalls and quality holds (BRQ-05); supports traceability expectations (REG-03).

## Preconditions
- Batches exist; recall requires organization-wide scope.

## Acceptance Criteria
### US-04-17-AC1: Quarantine blocks sale
- **Given** batch B (Active, OnHand 20) and a user with `inventory.batches.quarantine`
- **When** the user calls `POST …/batches/B/quarantine` with reason "Supplier quality notice, cloudy suspension" and recall reference `RC-2026-14`
- **Then** status becomes `Quarantined`, no stock movement is created, an audit entry and `Inventory.BatchQuarantined.v1` are written, and FEFO no longer allocates B

### US-04-17-AC2: Release re-derives status
- **Given** B is `Quarantined` and its expiry passed during quarantine
- **When** the user releases it with a reason
- **Then** QuarantinedAt is cleared, status becomes `Expired` (not `Active`), and `Inventory.BatchReleased.v1` is emitted

### US-04-17-AC3: Serialized with concurrent sale
- **Given** a sale transaction holds B's balance lock
- **When** quarantine of B is requested concurrently
- **Then** quarantine waits for the lock; after the sale commits, quarantine commits; no sale started after quarantine commit allocates B

### US-04-17-AC4: Organization-wide recall
- **Given** medicine M batch number `L77` exists in branches A (OnHand 10), C (OnHand 4, transferred from A), and D (OnHand 0)
- **When** an owner with organization-wide scope calls `POST /api/v1/inventory/recalls` with medicine M, batch number `L77`, reason, and an `Idempotency-Key`
- **Then** all three batches are quarantined in one transaction and the response lists them per branch with OnHand

### US-04-17-AC5: Recall without organization-wide scope
- **Given** a manager with `inventory.batches.quarantine` assigned only to branch A
- **When** the manager calls the recall endpoint
- **Then** the response is 403 `IDENTITY.PERMISSION_DENIED`

### US-04-17-AC6: Invalid transitions
- **Given** B is already `Quarantined`, or batch K is not quarantined
- **When** B is quarantined again or K is released
- **Then** the response is 409 `INVENTORY.INVALID_STATE_TRANSITION`; a reason under 10 characters returns 422 `INVENTORY.REASON_REQUIRED`

### US-04-17-AC7: Cross-branch and cross-organization
- **Given** a pharmacist assigned to branch A
- **When** quarantining a batch of branch B or of another organization
- **Then** the responses are 403 `IDENTITY.BRANCH_ACCESS_DENIED` and 404 `COMMON.NOT_FOUND`

## Validation Rules
- VR-04-013 reason; recall reference ≤ 100 characters; recall batch number normalized as in BR-04-004.

## Authorization Rules
- `inventory.batches.quarantine` + branch assignment; recall additionally organization-wide scope.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Re-quarantine / release non-quarantined | 409 `INVENTORY.INVALID_STATE_TRANSITION` |
| Recall with no matching batches | 404 `COMMON.NOT_FOUND` |
| Recall without org-wide scope | 403 `IDENTITY.PERMISSION_DENIED` |
| Lock timeout | 503 `COMMON.LOCK_TIMEOUT` |

## Edge Cases
- Quarantined batches with transfer reservations cannot be dispatched (US-04-21); supplier returns and damaged write-offs remain possible (BR-04-027).
- Sales returns into a quarantined batch are accepted and stay non-sellable.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-04-117 | Integration | Quarantine sets status, no movement, audit, event; FEFO excludes | US-04-17-AC1 |
| TS-04-118 | Integration | Release of expired quarantined batch → Expired | US-04-17-AC2 |
| TS-04-119 | Concurrency | Quarantine waits for in-flight sale lock; later sales exclude batch | US-04-17-AC3 |
| TS-04-120 | Integration | Recall quarantines all branches' batches atomically | US-04-17-AC4 |
| TS-04-121 | API | Recall without org-wide scope → 403 | US-04-17-AC5 |
| TS-04-122 | API | Invalid transitions → 409; short reason → 422 | US-04-17-AC6 |
| TS-04-123 | API | CS-07 other branch → 403; CS-08 other org → 404 | US-04-17-AC7 |
