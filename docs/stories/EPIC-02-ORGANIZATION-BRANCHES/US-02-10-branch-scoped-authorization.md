# US-02-10: Enforce Branch-Scoped Authorization and Branch Inventory Ownership

| Field | Value |
|---|---|
| Story ID | US-02-10 |
| Epic | EPIC-02 |
| Priority | P0 |
| Complexity | S |
| Related Requirements | FR-02-029, FR-02-030 |
| Related Business Rules | BR-G-02, BR-G-17, BR-02-010 |
| Dependencies | US-02-01, US-02-09 |

## User Story
As an Owner, I want staff assigned to one branch to be unable to read or change another branch's data, including its stock, so that each branch's operations and inventory stay under the control of its own team.

## Business Value
Implements CS-07 for all branch-scoped routes of every module through one shared enforcement point, and states inventory ownership per branch (BR-G-02).

## Preconditions
- Organization with branches A (`CAI01`) and B (`ALX02`); users with each system role assigned only to A; one Accountant with `AllBranches`.

## Acceptance Criteria

### US-02-10-AC1: Cross-branch call returns 403 (CS-07)
- **Given** a Cashier assigned only to branch A with `sales.pos.sell`
- **When** they call any `/api/v1/branches/{B}/...` route (for example `GET /api/v1/branches/{B}/settings`)
- **Then** the response is 403 `COMMON.FORBIDDEN`, the handler is not executed, and no branch B data is returned.

### US-02-10-AC2: Branch of another organization returns 404
- **Given** the same Cashier
- **When** they call `/api/v1/branches/{Org B branch}/...`
- **Then** the response is 404 `COMMON.NOT_FOUND`.

### US-02-10-AC3: Check order
- **Given** a user lacking a permission for a route on a branch outside their scope of their own organization
- **When** they call it
- **Then** the response is 403 `COMMON.FORBIDDEN` (organization check → 404 precedes permission and scope checks → 403, per SPEC-02 §11.1).

### US-02-10-AC4: Stock visibility limited to scope
- **Given** an Inventory Staff user assigned to branch A with `inventory.stock.read`
- **When** they request stock for branch B, or an organization-wide stock aggregate
- **Then** both return 403 `COMMON.FORBIDDEN`; the Accountant with `AllBranches` and `inventory.stock.read` receives both.

### US-02-10-AC5: Inventory rows carry an organization branch
- **Given** the database
- **When** an insert into `inventory.batches`, `inventory.batch_balances`, or `inventory.stock_movements` references a `BranchId` that does not belong to the row's organization
- **Then** the insert is rejected (composite foreign key on (`OrganizationId`, `BranchId`)) and the transaction rolls back.

### US-02-10-AC6: Every branch-scoped route is covered
- **Given** all registered `TenantBranchScoped` routes
- **When** the cross-branch suite calls each with branch B as a user assigned only to A
- **Then** every response is 403 and branch B data is unchanged.

## Validation Rules
- `branchId` route parameter must be a UUID; otherwise 404 `COMMON.NOT_FOUND`.

## Authorization Rules
- Implemented once as an endpoint filter for all `/api/v1/branches/{branchId}/...` routes, using the scope cache from US-02-09.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Branch in organization, outside scope | 403 `COMMON.FORBIDDEN` |
| Branch of another organization / unknown | 404 `COMMON.NOT_FOUND` |
| User with zero active assignments | 403 `COMMON.FORBIDDEN` |
| Cross-branch stock aggregate without `AllBranches` | 403 `COMMON.FORBIDDEN` |

## Edge Cases
- Stock transfers legitimately touch two branches; SPEC-04 checks the source or destination scope per action (dispatch: source; receive: destination) using this filter on the acting branch route.
- `Inactive` branches remain readable to users in scope (FR-02-019).

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-02-053 | Integration (CS-07) | Cashier assigned to A calls B settings route → 403, handler not invoked | US-02-10-AC1 |
| TS-02-054 | Integration (CS-08) | Org B branch id in route → 404 | US-02-10-AC2, US-02-10-AC3 |
| TS-02-055 | Integration | Stock read for B and org aggregate → 403; AllBranches Accountant → 200 | US-02-10-AC4 |
| TS-02-056 | Database | Composite FK rejects foreign branch on inventory tables | US-02-10-AC5 |
| TS-02-057 | Integration (CS-07) | Generated cross-branch suite over all branch-scoped routes → 403 | US-02-10-AC6 |
