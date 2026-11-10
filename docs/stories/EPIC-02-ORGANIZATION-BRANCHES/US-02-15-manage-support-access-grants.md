# US-02-15: Owner Manages Support Access Grants

| Field | Value |
|---|---|
| Story ID | US-02-15 |
| Epic | EPIC-02 |
| Priority | P1 |
| Complexity | S |
| Related Requirements | FR-02-036, FR-02-037 |
| Related Business Rules | BR-G-16, BR-02-016, BR-02-017 |
| Dependencies | US-02-04 |

## User Story
As an Owner, I want to grant a named platform administrator time-limited read-only access to my organization and revoke it at any time so that support can investigate issues without permanent access to my data.

## Business Value
Enables vendor support while keeping the Owner in control and every access accountable.

## Preconditions
- Platform administrator `support1@vendor.example` exists and is active.

## Acceptance Criteria

### US-02-15-AC1: Create grant
- **Given** an Owner with `org.support-grants.manage`
- **When** they `POST /api/v1/support-grants` with `{ "platformAdminEmail": "support1@vendor.example", "durationHours": 24, "reason": "Investigate invoice printing issue" }`
- **Then** the response is 201 with `status = Active`, `expiresAt = grantedAt + 24h`, and audit entry `org.support-grant.created` is written.

### US-02-15-AC2: Duration and grantee validation
- **Given** an Owner
- **When** they submit `durationHours = 0` or `73`, or an email that is not an active platform administrator
- **Then** the response is 422 `COMMON.VALIDATION_FAILED` with `ORG.SUPPORT_GRANT_DURATION_INVALID` or `ORG.SUPPORT_GRANT_GRANTEE_INVALID` (same code for unknown and non-admin emails).

### US-02-15-AC3: One active grant per administrator
- **Given** an `Active` grant for `support1@vendor.example`
- **When** the Owner creates another grant for the same administrator
- **Then** the response is 409 `ORG.SUPPORT_GRANT_ALREADY_ACTIVE`.

### US-02-15-AC4: Revoke grant
- **Given** an `Active` grant
- **When** the Owner calls `POST /api/v1/support-grants/{grantId}/revoke`
- **Then** status becomes `Revoked` with `revokedAt`/`revokedBy`, audit entry `org.support-grant.revoked` is written, and support-session requests under it return 403 `ORG.SUPPORT_GRANT_INACTIVE` within 60 seconds; revoking again returns 409 `ORG.INVALID_STATUS_TRANSITION`.

### US-02-15-AC5: Expiry enforced exactly
- **Given** a grant with `expiresAt` T
- **When** the list is read at T + 1 s
- **Then** the grant shows `status = Expired`.

### US-02-15-AC6: Permission denied
- **Given** a Branch Manager (no `org.support-grants.manage`)
- **When** they list, create, or revoke grants
- **Then** each returns 403 `COMMON.FORBIDDEN`.

## Validation Rules
- VR-02-020, VR-02-021, VR-02-022.

## Authorization Rules
- `org.support-grants.manage` (Owner by default).

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Invalid duration | 422 `ORG.SUPPORT_GRANT_DURATION_INVALID` |
| Unknown / non-admin grantee | 422 `ORG.SUPPORT_GRANT_GRANTEE_INVALID` |
| Duplicate active grant | 409 `ORG.SUPPORT_GRANT_ALREADY_ACTIVE` |
| Revoke non-active grant | 409 `ORG.INVALID_STATUS_TRANSITION` |
| No permission | 403 `COMMON.FORBIDDEN` |
| Grant id of another organization | 404 `COMMON.NOT_FOUND` |

## Edge Cases
- Grants are never deleted; list supports `status` filter.
- An expired grant can be followed by a new grant for the same administrator.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-02-077 | API | Create grant with computed expiry and audit | US-02-15-AC1 |
| TS-02-078 | API | Duration/grantee validation and duplicate active grant | US-02-15-AC2, US-02-15-AC3 |
| TS-02-079 | Integration | Revoke, session rejected ≤ 60 s, double revoke 409 | US-02-15-AC4 |
| TS-02-080 | Unit | Derived status Expired at T + 1 s (fake clock) | US-02-15-AC5 |
| TS-02-081 | API | Manager → 403 on list/create/revoke | US-02-15-AC6 |
