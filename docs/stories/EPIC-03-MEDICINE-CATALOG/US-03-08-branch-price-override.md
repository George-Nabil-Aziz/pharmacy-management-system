# US-03-08: Manage branch price overrides

| Field | Value |
|---|---|
| Story ID | US-03-08 |
| Epic | EPIC-03 |
| Priority | P1 |
| Complexity | S |
| Related Requirements | FR-03-021, FR-03-022, FR-03-023, FR-03-044, FR-03-045 |
| Related Business Rules | BR-03-008, BR-03-009, BR-03-010, BR-03-023, BR-03-024, BR-G-17, BR-G-20 |
| Dependencies | US-03-07, EPIC-01 Branch authorization |

## User Story
As a Branch Manager, I want to set or remove a selling-price override for an assigned Branch so that local prices can differ from the organization's default without changing other branches.

## Business Value
Branch-scoped overrides support local pricing while retaining a consistent organization-level fallback and auditable history.

## Preconditions
- `AllowBranchPriceOverride` is ON.
- The actor has `catalog.prices.update` and is assigned to the Branch.

## Acceptance Criteria
### US-03-08-AC1: Set a branch override
- **Given** a medicine with an organization default and an assigned Branch
- **When** the manager sets a valid override with a reason and current `If-Match`
- **Then** the branch price becomes the effective price, history/audit/outbox are written atomically, and other branches remain unchanged.

### US-03-08-AC2: Remove override and resolve fallback
- **Given** a Branch has a price override
- **When** an authorized manager removes it with a reason
- **Then** the effective price immediately reverts to the organization default, history records the removal, and completed sales remain unchanged.

### US-03-08-AC3: Deny another Branch and disabled override setting
- **Given** a manager assigned to Branch A but not Branch B, and an organization with overrides disabled
- **When** they change Branch B's price, or attempt any override while the setting is OFF
- **Then** the first request returns 403 `COMMON.FORBIDDEN` (CS-07), the second returns 409 `CATALOG.BRANCH_PRICE_OVERRIDE_DISABLED`, and no price changes.

### US-03-08-AC4: Hide foreign Organization resources
- **Given** a medicine or Branch id from another Organization
- **When** a manager requests its effective price or attempts to set an override
- **Then** the response is 404 with the same result as a missing catalog resource.

## Validation Rules
- Price fields follow VR-03-016 and VR-03-017; reason is required and 3–200 characters (VR-03-018).
- Update requires `If-Match`; branch id must be valid and in actor scope.

## Authorization Rules
- Set/remove requires `catalog.prices.update` and access to the route Branch. Organization is taken from the token.
- Cross-branch access in the same Organization returns 403; cross-Organization resources return 404. RLS is enabled and forced from MVP.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Missing permission or other assigned Branch | 403 `COMMON.FORBIDDEN` |
| Overrides disabled | 409 `CATALOG.BRANCH_PRICE_OVERRIDE_DISABLED` |
| Invalid price or reason | 400 `COMMON.VALIDATION_FAILED` |
| Other-Organization resource | 404 `CATALOG.MEDICINE_NOT_FOUND` |
| Stale or missing ETag | 412 `COMMON.CONCURRENCY_CONFLICT` / 428 `COMMON.PRECONDITION_REQUIRED` |

## Edge Cases
- If no override exists, effective price is always the organization default.
- Price-history branch filters include only branches the caller can access.
- Changes affect sales committed after the price change; earlier line snapshots do not change.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-03-054 | Integration | Set Branch A override and verify Branch B remains on organization default | US-03-08-AC1 |
| TS-03-055 | Integration | Remove override and verify fallback plus immutable sales snapshots | US-03-08-AC2 |
| TS-03-056 | Integration | Other-Branch request returns 403 (CS-07); disabled setting returns 409 | US-03-08-AC3 |
| TS-03-057 | Integration | Cross-Organization Branch/medicine access returns concealed 404 (CS-08) | US-03-08-AC4 |
