# US-04-01: Batch model, status derivation, and batch views

| Field | Value |
|---|---|
| Story ID | US-04-01 |
| Epic | EPIC-04 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-04-001, FR-04-002, FR-04-003, FR-04-004, FR-04-005 |
| Related Business Rules | BR-G-03, BR-G-04, BR-G-07, BR-04-001, BR-04-002 |
| Dependencies | EPIC-02 (branches, branch settings), EPIC-03 (medicines) |

## User Story
As an inventory staff member, I want to see every batch of a medicine in my branch with its expiry, balance, status, and sellable quantity so that I know exactly what stock is usable.

## Business Value
Batch-level visibility is the basis for FEFO, expiry control, and traceability (BRQ-04). A deterministic status lets every module make identical sellability decisions.

## Preconditions
- The organization, branch, and medicines exist; the user is authenticated and assigned to the branch.
- `Batch` and `BatchBalance` tables exist with the check constraints in SPEC-04 §8.1. PostgreSQL Row-Level Security on `OrganizationId` is enabled from the MVP for all inventory tables.

## Acceptance Criteria
### US-04-01-AC1: Batch list filtered and sorted by expiry
- **Given** medicine M in branch A has batches B1 (expiry 2027-01-31), B2 (2026-12-31), B3 (2027-06-30, OnHand 0)
- **When** a user with `inventory.batches.read` calls `GET /api/v1/branches/A/inventory/batches?medicineId=M&onlyWithStock=true`
- **Then** the response is 200 with items [B2, B1] in that order, each with batchNumber, expiryDate, status, onHand, reserved, sellable, and `totalCount` = 2

### US-04-01-AC2: Batch detail with eligibility and lineage
- **Given** batch B1 in branch A has OnHand 50, Reserved 10, status `Active`, and was transferred to branch C creating batch C1
- **When** the user calls `GET /api/v1/branches/A/inventory/batches/B1`
- **Then** the response contains onHand 50, reserved 10, sellable 40, `saleEligible` true, `destinationBatches` [C1 with branch C], `sourceBatch` null, and at most the 20 most recent movements in descending BatchSequence

### US-04-01-AC3: Status precedence
- **Given** a batch with ExpiryDate ≤ business date, OnHand 0, and QuarantinedAt set
- **When** its status is derived (posting recomputation or nightly job)
- **Then** the status is `Quarantined`; after release it is `Expired`; a non-expired, non-quarantined batch with OnHand 0 is `Depleted`; with OnHand > 0 it is `Active`

### US-04-01-AC4: Sellable is zero for non-eligible batches
- **Given** branch A has DoNotSellWindowDays 30 and batch B2 expires on business date + 20 with OnHand 15
- **When** the batch list is requested
- **Then** B2 shows sellable 0 and `saleEligible` false with `ineligibleReason` = `DoNotSellWindow`

### US-04-01-AC5: Costs hidden without inventory reports permission
- **Given** a user has `inventory.batches.read` but not `reports.inventory.read`
- **When** the user requests the batch list or detail
- **Then** `unitCost` and value fields are absent from every item

### US-04-01-AC6: Permission denied
- **Given** a user without `inventory.batches.read`
- **When** the user calls the batch list endpoint
- **Then** the response is 403 `IDENTITY.PERMISSION_DENIED`

### US-04-01-AC7: Cross-branch and cross-organization access
- **Given** user U is assigned only to branch A of organization O1
- **When** U requests batches of branch B of O1, a batch of O2 by id, or batch B9 of branch B via route `/branches/A/...`
- **Then** the responses are 403 `IDENTITY.BRANCH_ACCESS_DENIED`, 404 `COMMON.NOT_FOUND`, and 404 `COMMON.NOT_FOUND` respectively, with no batch data in the body

## Validation Rules
- `pageSize` ≤ 100 (VR-04-023); `expiryFrom` ≤ `expiryTo`; `status` ∈ canonical Batch statuses → else 400 `COMMON.VALIDATION_FAILED`.
- Check constraints `on_hand >= 0`, `reserved >= 0`, `reserved <= on_hand` exist (FR-04-002).

## Authorization Rules
- `inventory.batches.read` + branch assignment (or organization-wide scope); costs require `reports.inventory.read`.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Missing permission | 403 `IDENTITY.PERMISSION_DENIED` |
| Branch not assigned | 403 `IDENTITY.BRANCH_ACCESS_DENIED` |
| Batch of another organization or other branch via this route | 404 `COMMON.NOT_FOUND` |
| Invalid filter values | 400 `COMMON.VALIDATION_FAILED` |

## Edge Cases
- Batch with expiry equal to business date shows status per last recomputation but `saleEligible` is always computed live (FR-04-023).
- Batch number search is prefix and case-insensitive; Arabic digits in input are normalized to Latin digits.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-04-001 | Integration | List with medicine/onlyWithStock filters returns batches sorted by expiry ascending with correct totals | US-04-01-AC1 |
| TS-04-002 | Integration | Batch detail shows balance, sellable, eligibility, lineage, last 20 movements | US-04-01-AC2 |
| TS-04-003 | Unit | Status derivation table test over all combinations of quarantine/expired/OnHand | US-04-01-AC3 |
| TS-04-004 | Integration | Do-not-sell window batch shows sellable 0 with reason (CS-02 visibility) | US-04-01-AC4 |
| TS-04-005 | API | Cost fields omitted without `reports.inventory.read`; missing permission → 403 | US-04-01-AC5, US-04-01-AC6 |
| TS-04-006 | API | CS-07 unassigned branch → 403; CS-08 other-org batch → 404; other-branch id via own route → 404 | US-04-01-AC7 |
