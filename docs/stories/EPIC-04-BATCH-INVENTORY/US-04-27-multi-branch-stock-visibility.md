# US-04-27: Multi-branch stock visibility

| Field | Value |
|---|---|
| Story ID | US-04-27 |
| Epic | EPIC-04 |
| Priority | P1 |
| Complexity | S |
| Related Requirements | FR-04-063 |
| Related Business Rules | BR-G-02, BR-G-17, BR-04-001 |
| Dependencies | US-04-07 |

## User Story
As a pharmacist, I want to see which other branches of my organization have a medicine in stock so that I can direct a customer or request a transfer.

## Business Value
Multi-branch inventory visibility is a product differentiator (Project Vision §6) and avoids lost sales.

## Preconditions
- Organization has ≥ 2 active branches.

## Acceptance Criteria
### US-04-27-AC1: Quantities across branches without costs
- **Given** medicine M has sellable 12 in A, 0 in C, 40 in D (of which 10 near-expiry), and branch E is `Inactive`
- **When** a pharmacist with `inventory.stock.read-other-branches` assigned only to A calls `GET /api/v1/inventory/medicines/M/branch-availability`
- **Then** rows for A, C, D are returned with sellable, nearExpiry, earliestSellableExpiry, and branch name/phone; E is excluded; no cost or value field is present

### US-04-27-AC2: Permission required
- **Given** a cashier without `inventory.stock.read-other-branches`
- **When** the cashier calls the endpoint
- **Then** the response is 403 `IDENTITY.PERMISSION_DENIED`

### US-04-27-AC3: Other organization's medicine
- **Given** medicine id N belongs to another organization
- **When** the pharmacist requests its availability
- **Then** the response is 404 `COMMON.NOT_FOUND`

### US-04-27-AC4: No branch detail access implied
- **Given** the pharmacist sees branch D in the availability list
- **When** the pharmacist calls `GET /api/v1/branches/D/inventory/batches?medicineId=M`
- **Then** the response is 403 `IDENTITY.BRANCH_ACCESS_DENIED` (visibility is limited to the aggregate endpoint)

## Validation Rules
- Medicine id must be a UUID (400 `COMMON.VALIDATION_FAILED`).

## Authorization Rules
- `inventory.stock.read-other-branches`; organization from token; aggregate quantities only.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Missing permission | 403 `IDENTITY.PERMISSION_DENIED` |
| Other-organization medicine | 404 `COMMON.NOT_FOUND` |
| Branch detail of unassigned branch | 403 `IDENTITY.BRANCH_ACCESS_DENIED` |

## Edge Cases
- Values are computed live (not cached for decisions); response p95 ≤ 500 ms at 50 branches.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-04-186 | API | Availability across active branches, no cost fields, inactive excluded | US-04-27-AC1 |
| TS-04-187 | API | Missing permission → 403 | US-04-27-AC2 |
| TS-04-188 | API | CS-08: other-org medicine → 404 | US-04-27-AC3 |
| TS-04-189 | API | CS-07: branch detail of unassigned branch still 403 | US-04-27-AC4 |
