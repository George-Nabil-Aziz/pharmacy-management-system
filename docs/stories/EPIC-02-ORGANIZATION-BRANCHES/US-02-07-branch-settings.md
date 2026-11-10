# US-02-07: Configure Branch Settings

| Field | Value |
|---|---|
| Story ID | US-02-07 |
| Epic | EPIC-02 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-02-020, FR-02-021 |
| Related Business Rules | BR-G-07, BR-G-27, BR-G-28, BR-02-018, BR-02-020, BR-02-022 |
| Dependencies | US-02-06 |

## User Story
As a Branch Manager, I want to configure my branch's expiry windows, adjustment approval threshold, receipt footers, and tax defaults so that branch operations follow our policies.

## Business Value
Single source of the branch parameters consumed by inventory, POS, prescriptions, reports, and notifications.

## Preconditions
- Branch exists; BranchSettings row created with defaults (US-02-06).

## Acceptance Criteria

### US-02-07-AC1: Read effective settings
- **Given** a newly created branch
- **When** a user with `org.branches.read` calls `GET /api/v1/branches/{branchId}/settings`
- **Then** the response is 200 with `nearExpiryDays = 90`, `doNotSellWindowDays = 0`, `adjustmentApprovalThreshold = 1000.00`, empty receipt footers, `defaultTaxCategoryId = null`, `pricesIncludeTax = true`, `transfersOutEnabled = true`, `transfersInEnabled = true`, and an `ETag`.

### US-02-07-AC2: Update with audit and propagation
- **Given** a Manager with `settings.branch.manage` and the branch in scope
- **When** they set `nearExpiryDays = 120` with a valid `If-Match`
- **Then** the response is 200, audit entry `settings.branch.updated` lists old 90 and new 120, and `GetEffectiveBranchSettings` returns 120 to other modules within 5 seconds.

### US-02-07-AC3: Out-of-range and conflicting values rejected
- **Given** a Manager
- **When** they submit `nearExpiryDays = 0`, or `doNotSellWindowDays = 100` with `nearExpiryDays = 90`, or `adjustmentApprovalThreshold = -1`
- **Then** each returns 422 `COMMON.VALIDATION_FAILED` with `ORG.SETTING_OUT_OF_RANGE` or `ORG.SETTING_CONFLICT` respectively, and nothing changes.

### US-02-07-AC4: Tax category reference validated
- **Given** a TaxCategory that is `Inactive` or belongs to another organization
- **When** it is submitted as `defaultTaxCategoryId`
- **Then** the response is 422 with `COMMON.REFERENCE_NOT_FOUND`.

### US-02-07-AC5: Not retroactive
- **Given** a sale completed when `pricesIncludeTax = true`
- **When** the setting is changed to false
- **Then** the completed sale's stored amounts and reprinted invoice are unchanged.

### US-02-07-AC6: Permission and scope denied
- **Given** a Cashier (no `settings.branch.manage`), and a Manager not assigned to the branch
- **When** each calls `PUT /api/v1/branches/{branchId}/settings`
- **Then** both receive 403 `COMMON.FORBIDDEN`.

## Validation Rules
- VR-02-014, VR-02-015, VR-02-016; receipt footers ≤ 500 characters each; `If-Match` required.

## Authorization Rules
- Read: `org.branches.read` + scope. Update: `settings.branch.manage` + scope.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Value out of range | 422 `COMMON.VALIDATION_FAILED` / `ORG.SETTING_OUT_OF_RANGE` |
| Do-not-sell window > near-expiry days | 422 `COMMON.VALIDATION_FAILED` / `ORG.SETTING_CONFLICT` |
| Invalid tax category | 422 `COMMON.REFERENCE_NOT_FOUND` |
| Stale ETag | 412 `COMMON.PRECONDITION_FAILED` |
| No permission / out of scope | 403 `COMMON.FORBIDDEN` |
| Branch of another organization | 404 `COMMON.NOT_FOUND` |

## Edge Cases
- Settings of an `Inactive` branch can be read but updates return 409 `ORG.BRANCH_INACTIVE`.
- `adjustmentApprovalThreshold = 0.00` is valid and means every adjustment requires approval (BR-02-020).
- Raising `doNotSellWindowDays` takes effect for the next sale allocation; carts already priced on the client are re-validated at sale completion (SPEC-06).

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-02-037 | API | Defaults returned for new branch | US-02-07-AC1 |
| TS-02-038 | Integration | Update audited, facade returns new value ≤ 5 s | US-02-07-AC2 |
| TS-02-039 | API | Range, conflict, and tax-category reference validation | US-02-07-AC3, US-02-07-AC4 |
| TS-02-040 | Integration | Completed sale unaffected by later setting change | US-02-07-AC5 |
| TS-02-041 | API | Cashier and out-of-scope Manager → 403 | US-02-07-AC6 |
