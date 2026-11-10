# US-01-20: Authenticate platform administrators separately

| Field | Value |
|---|---|
| Story ID | US-01-20 |
| Epic | EPIC-01 |
| Priority | P1 |
| Complexity | M |
| Related Requirements | FR-01-045 |
| Related Business Rules | BR-01-001, BR-01-019, BR-01-021 |
| Dependencies | US-01-03, US-01-07, SPEC-02 platform organization operations |

## User Story
As a platform administrator, I want a separate login and refresh-token lifecycle so that I can operate platform functions without being an Organization user or receiving implicit access to business data.

## Business Value
Platform administration must be independently authenticated before onboarding multiple Organizations, while keeping platform and Organization security boundaries distinct.

## Preconditions
- A `PlatformUser` has been provisioned through the deployment provisioning command.
- Platform token-signing keys and the separate platform authentication store are available.

## Acceptance Criteria
### US-01-20-AC1: Login against the platform identity store
- **Given** an Active PlatformUser with a password of at least 14 characters
- **When** they POST `/api/v1/platform/auth/login` with valid credentials
- **Then** the response contains an access token with audience `platform` and no `org` claim, plus a secure refresh cookie scoped to `/api/v1/platform/auth`.

### US-01-20-AC2: Rotate and revoke platform sessions
- **Given** a platform refresh cookie
- **When** the administrator refreshes or logs out
- **Then** refresh rotation follows the single-use token-family rules, logout revokes the platform session, and no platform refresh token is returned in a response body.

### US-01-20-AC3: Reject credentials and cross-audience tokens
- **Given** invalid platform credentials, an Organization token sent to platform endpoints, or a platform token sent to Organization endpoints
- **When** a login or authenticated request is made
- **Then** authentication fails with a generic 401 response and no session or business data is returned.

## Validation Rules
- Platform administrator passwords contain at least 14 characters.
- Platform identities are created only by the deployment provisioning command (FR-01-045).

## Authorization Rules
- Platform login, refresh, and logout are authentication endpoints; they do not use Organization permissions. Missing/invalid credentials and wrong token audience use 401, and rate limiting uses 429; therefore a permission-based 403 scenario does not apply to these endpoints.
- A platform administrator has no implicit access to Organization business data; support access requires the separate SPEC-02 grant.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Invalid platform credentials | 401 `IDENTITY.INVALID_CREDENTIALS` |
| Organization token on platform endpoint or platform token on Organization endpoint | 401 `IDENTITY.UNAUTHENTICATED` |
| Rate limit exceeded | 429 `COMMON.RATE_LIMITED` |
| Platform identity provisioned through a public API | No such public endpoint; provisioning is deployment-only |

## Edge Cases
- PlatformUser records have no `OrganizationId` and are excluded from tenant query filters.
- A PlatformUser and organization User with the same email are not a supported shared identity.
- Platform login remains available independently of Organization database tenant context.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-01-092 | Integration | Platform login returns platform audience, no org claim, scoped cookie | US-01-20-AC1 |
| TS-01-093 | Integration | Platform refresh rotates once; logout revokes the session | US-01-20-AC2 |
| TS-01-094 | Integration | Wrong audience tokens rejected on both platform and Organization APIs | US-01-20-AC3 |
| TS-01-095 | Security | Platform authentication requires 14-character minimum and public provisioning is absent | US-01-20-AC1, US-01-20-AC3 |
