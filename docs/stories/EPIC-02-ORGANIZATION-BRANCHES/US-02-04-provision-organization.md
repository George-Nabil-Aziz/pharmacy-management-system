# US-02-04: Provision an Organization

| Field | Value |
|---|---|
| Story ID | US-02-04 |
| Epic | EPIC-02 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-02-008, FR-02-009, FR-02-010 |
| Related Business Rules | BR-02-001, BR-02-003, BR-02-004, BR-02-008 |
| Dependencies | US-02-01, EPIC-01 role seeding and user invitation stories |

## User Story
As a platform administrator, I want to provision a new pharmacy organization with its first branch and Owner in one step so that the pharmacy can start using the system with consistent defaults.

## Business Value
Single, repeatable onboarding path for every organization (including the MVP deployment via bootstrap command), eliminating manual database setup.

## Preconditions
- Caller holds `org.platform-organizations.provision` (platform token), or the bootstrap command is run by the deployment operator.

## Acceptance Criteria

### US-02-04-AC1: Successful provisioning creates the full set
- **Given** a valid provisioning request (SPEC-02 §10.3) with header `Idempotency-Key`
- **When** `POST /api/v1/platform/organizations` is called
- **Then** the response is 201 with `organizationId`, `branchId`, `ownerUserId`, `ownerStatus = Invited`, and the database contains exactly: 1 Organization (`Active`), 1 OrganizationSettings with §8.4 defaults, 1 Branch (`Active`) with 1 BranchSettings with defaults, 6 system roles, 1 Owner user with `BranchScope = AllBranches` and default branch = the new branch, and 1 audit entry `org.organization.provisioned`.

### US-02-04-AC2: Owner invitation triggered
- **Given** a successful provisioning
- **When** the transaction commits
- **Then** exactly one invitation outbox message for the Owner email is recorded (delivery per SPEC-01).

### US-02-04-AC3: Atomic rollback on failure
- **Given** a fault injected after the branch row is written
- **When** provisioning runs
- **Then** the response is 500 `COMMON.INTERNAL_ERROR` and no Organization, Branch, settings, role, user, or outbox row for this request exists.

### US-02-04-AC4: Idempotent retry
- **Given** a completed provisioning with key K
- **When** the same request is repeated with key K
- **Then** the same 201 body is returned and the organization count is unchanged; with key K and a different body the response is 422 `COMMON.IDEMPOTENCY_KEY_REUSED`.

### US-02-04-AC5: Owner email already in use
- **Given** a user with email `owner@x.example` exists on the platform
- **When** provisioning uses that owner email
- **Then** the response is 409 `ORG.OWNER_EMAIL_IN_USE` and nothing is created.

### US-02-04-AC6: Validation of branch and organization fields
- **Given** a request with branch code `ca1` and an invalid time zone `Cairo`
- **When** provisioning is called
- **Then** the response is 422 `COMMON.VALIDATION_FAILED` with `ORG.BRANCH_CODE_INVALID` and `ORG.TIME_ZONE_INVALID` in `errors`.

### US-02-04-AC7: Organization user cannot provision
- **Given** an Org A Owner token
- **When** `POST /api/v1/platform/organizations` is called
- **Then** the response is 403 `COMMON.FORBIDDEN`.

### US-02-04-AC8: Bootstrap command
- **Given** an empty database
- **When** the deployment bootstrap command runs with a provisioning definition file
- **Then** the same entities as AC1 are created; when any organization already exists, the command exits with a non-zero code and creates nothing unless the explicit "add another organization" option is passed.

## Validation Rules
- VR-02-001..007, VR-02-010, VR-02-012, VR-02-023 apply.

## Authorization Rules
- `org.platform-organizations.provision` (platform-level only).

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Missing `Idempotency-Key` | 400 `COMMON.IDEMPOTENCY_KEY_REQUIRED` |
| Field validation failure | 422 `COMMON.VALIDATION_FAILED` |
| Owner email in use | 409 `ORG.OWNER_EMAIL_IN_USE` |
| Same key, different body | 422 `COMMON.IDEMPOTENCY_KEY_REUSED` |
| Organization token | 403 `COMMON.FORBIDDEN` |

## Edge Cases
- Two concurrent provisioning requests with the same owner email and different keys: exactly one succeeds; the other gets 409 `ORG.OWNER_EMAIL_IN_USE` (unique index on email).
- Optional regulatory fields omitted: provisioning succeeds with nulls.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-02-018 | Integration | Full provisioning creates exact entity set and audit entry | US-02-04-AC1, US-02-04-AC2 |
| TS-02-019 | Integration | Fault injection at each step → zero residual rows | US-02-04-AC3 |
| TS-02-020 | Integration | Idempotent replay and key reuse with different body | US-02-04-AC4 |
| TS-02-021 | Integration | Duplicate owner email (sequential and concurrent) → 409 | US-02-04-AC5 |
| TS-02-022 | API | Validation errors listed per field | US-02-04-AC6 |
| TS-02-023 | API | Organization token → 403 | US-02-04-AC7 |
| TS-02-024 | Integration | Bootstrap on empty DB and refusal on non-empty DB | US-02-04-AC8 |
