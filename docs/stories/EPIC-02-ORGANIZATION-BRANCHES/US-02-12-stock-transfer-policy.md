# US-02-12: Stock Transfer Route and Approval Policy

| Field | Value |
|---|---|
| Story ID | US-02-12 |
| Epic | EPIC-02 |
| Priority | P1 |
| Complexity | S |
| Related Requirements | FR-02-012, FR-02-031, FR-02-032 |
| Related Business Rules | BR-G-02, BR-G-13, BR-G-28, BR-02-013, BR-02-014 |
| Dependencies | US-02-07, US-02-09; consumed by the EPIC-04 stock transfer stories |

## User Story
As an Owner, I want to control which branches may send or receive stock transfers and which branch's approvers must approve them so that stock moves between branches only under my organization's policy.

## Business Value
Separates organization policy (this spec) from the transfer workflow (SPEC-04) and enforces segregation of duties (BR-G-28).

## Preconditions
- Branches `CAI01`, `ALX02`, `GIZ03` are `Active` in the same organization.

## Acceptance Criteria

### US-02-12-AC1: Allowed route
- **Given** `CAI01.transfersOutEnabled = true` and `ALX02.transfersInEnabled = true`
- **When** SPEC-04 calls `CheckTransferRoute(CAI01, ALX02)`
- **Then** the result is allowed.

### US-02-12-AC2: Disallowed routes
- **Given** `GIZ03.transfersInEnabled = false`, and branch `OLD04` is `Inactive`
- **When** routes (CAI01→GIZ03), (CAI01→OLD04), (CAI01→CAI01), and (CAI01→Org B branch) are checked via a transfer request
- **Then** the first three return 422 `ORG.TRANSFER_ROUTE_NOT_ALLOWED` and the Org B destination returns 422 `COMMON.REFERENCE_NOT_FOUND`.

### US-02-12-AC3: Approver must differ from requester
- **Given** a transfer CAI01→ALX02 requested by Manager M1 who holds `inventory.transfers.approve` for CAI01
- **When** M1 attempts to approve it
- **Then** the response is 403 `ORG.TRANSFER_APPROVER_NOT_ELIGIBLE`.

### US-02-12-AC4: Approver scope follows `TransferApproverScope`
- **Given** `TransferApproverScope = Source`, Manager M2 assigned only to ALX02, Manager M3 assigned to CAI01, both with `inventory.transfers.approve`
- **When** each attempts to approve the transfer CAI01→ALX02
- **Then** M2 receives 403 `ORG.TRANSFER_APPROVER_NOT_ELIGIBLE` and M3 is allowed; with `Destination` the results swap; with `Either` both are allowed.

### US-02-12-AC5: Update transfer policy settings
- **Given** an Owner with `settings.organization.manage`
- **When** they set `transferApproverScope = "Either"` via `PUT /api/v1/organization/settings`
- **Then** the response is 200 and an audit entry records old and new values; a value `"Any"` returns 422 `ORG.SETTING_OUT_OF_RANGE`.

### US-02-12-AC6: Permission denied
- **Given** a Branch Manager (no `settings.organization.manage`)
- **When** they change `transferApproverScope`
- **Then** the response is 403 `COMMON.FORBIDDEN`.

## Validation Rules
- `TransferApproverScope` ∈ {`Source`, `Destination`, `Either`}; `TransfersOutEnabled`/`TransfersInEnabled` boolean (US-02-07).

## Authorization Rules
- Organization setting: `settings.organization.manage`. Branch flags: `settings.branch.manage`. Approval permission itself: `inventory.transfers.approve` (SPEC-04).

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Route not allowed | 422 `ORG.TRANSFER_ROUTE_NOT_ALLOWED` |
| Destination of another organization | 422 `COMMON.REFERENCE_NOT_FOUND` |
| Requester approves own transfer / wrong scope | 403 `ORG.TRANSFER_APPROVER_NOT_ELIGIBLE` |
| Invalid setting value | 422 `ORG.SETTING_OUT_OF_RANGE` |
| No permission | 403 `COMMON.FORBIDDEN` |

## Edge Cases
- Disabling `TransfersInEnabled` does not affect transfers already `Approved` or `InTransit`; they can still be received (policy is evaluated at request and approval time only).
- A user with `AllBranches` scope satisfies any `TransferApproverScope` value but still cannot approve their own request.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-02-065 | Unit | Route policy truth table (flags, status, same branch, other org) | US-02-12-AC1, US-02-12-AC2 |
| TS-02-066 | Unit | Approver policy: self-approval and scope modes Source/Destination/Either | US-02-12-AC3, US-02-12-AC4 |
| TS-02-067 | API | Organization setting update, invalid value, Manager 403 | US-02-12-AC5, US-02-12-AC6 |
| TS-02-068 | Integration | In-transit transfer receivable after destination flag disabled | US-02-12-AC1 |
