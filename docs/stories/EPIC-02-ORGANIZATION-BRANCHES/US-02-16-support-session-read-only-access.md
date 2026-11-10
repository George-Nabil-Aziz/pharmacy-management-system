# US-02-16: Platform Administrator Read-Only Support Session

| Field | Value |
|---|---|
| Story ID | US-02-16 |
| Epic | EPIC-02 |
| Priority | P1 |
| Complexity | M |
| Related Requirements | FR-02-037, FR-02-038, FR-02-039, FR-02-040 |
| Related Business Rules | BR-G-16, BR-G-29, BR-02-016, BR-02-017 |
| Dependencies | US-02-15, US-02-01 |

## User Story
As a platform administrator with an active grant, I want to open a read-only support session in the organization so that I can diagnose a reported problem, while the Owner can see everything I accessed.

## Business Value
Provides support capability without write access, patient data exposure, or unaccountable access.

## Preconditions
- An `Active` support grant exists for the calling platform administrator in Org A.

## Acceptance Criteria

### US-02-16-AC1: Start support session
- **Given** an `Active` grant G expiring in 2 hours
- **When** the administrator calls `POST /api/v1/platform/support-sessions` with `{ "grantId": G }`
- **Then** the response is 200 with an access token whose lifetime is ≤ 15 minutes, which contains `org_id` = Org A and `support_grant_id` = G, and `FirstUsedAt` of G is set.

### US-02-16-AC2: Token never outlives grant
- **Given** a grant expiring in 5 minutes
- **When** a support session starts
- **Then** the token expiry is ≤ the grant's `expiresAt`.

### US-02-16-AC3: Read allowed, writes rejected
- **Given** a support session token
- **When** it calls `GET /api/v1/branches/{CAI01}/settings` and then `PUT` on the same route
- **Then** the GET returns 200 and the PUT returns 403 `ORG.SUPPORT_ACCESS_READ_ONLY` with no change.

### US-02-16-AC4: Patient, prescription, and export data excluded
- **Given** a support session token
- **When** it calls a patient profile route, a prescription route, or a report export route
- **Then** each returns 403 `COMMON.FORBIDDEN`.

### US-02-16-AC5: No session without active grant
- **Given** a grant that is `Expired` or `Revoked`, or a grant issued to another administrator
- **When** a session is requested
- **Then** the response is 403 `ORG.SUPPORT_GRANT_INACTIVE` (same code for all three cases).

### US-02-16-AC6: Expiry mid-session
- **Given** a support session token still within its lifetime
- **When** a request is made 1 second after the grant's `expiresAt`
- **Then** the response is 403 `ORG.SUPPORT_GRANT_INACTIVE`.

### US-02-16-AC7: Every request audited and visible to Owner
- **Given** a support session that made 12 requests (including 1 rejected PUT)
- **When** the Owner calls `GET /api/v1/support-grants/{G}/activity`
- **Then** exactly 12 entries are returned, each with administrator, method, route template, status code, and timestamp.

### US-02-16-AC8: Session cannot cross organizations
- **Given** a support session for Org A
- **When** it requests a resource id of Org B
- **Then** the response is 404 `COMMON.NOT_FOUND`.

## Validation Rules
- `grantId` must be a UUID of a grant issued to the caller.

## Authorization Rules
- Session start: `org.platform-organizations.read` + active grant for the caller + organization `Active`.
- Session permissions: support read-only set of SPEC-02 §11.3; `AllBranches` scope.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Grant expired / revoked / not issued to caller | 403 `ORG.SUPPORT_GRANT_INACTIVE` |
| Organization suspended | 403 `ORG.ORGANIZATION_SUSPENDED` |
| Write request in session | 403 `ORG.SUPPORT_ACCESS_READ_ONLY` |
| Patient / prescription / export route | 403 `COMMON.FORBIDDEN` |
| Resource of another organization | 404 `COMMON.NOT_FOUND` |

## Edge Cases
- Support tokens cannot be refreshed; a new session is started (subject to the grant still being active).
- Audit entries for support requests are written even when the request is rejected (403/404).
- Support sessions do not create `PatientAccessLog` entries because patient routes are blocked.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-02-082 | Integration | Session token claims, lifetime ≤ 15 min and ≤ grant expiry | US-02-16-AC1, US-02-16-AC2 |
| TS-02-083 | Integration | GET allowed, PUT/POST/DELETE → 403 read-only | US-02-16-AC3 |
| TS-02-084 | Integration | Patient, prescription, export routes → 403 | US-02-16-AC4 |
| TS-02-085 | API | Expired, revoked, foreign grant → identical 403 | US-02-16-AC5 |
| TS-02-086 | Integration | Request after grant expiry with valid token → 403 | US-02-16-AC6 |
| TS-02-087 | Integration | Request count equals audit entry count; activity endpoint | US-02-16-AC7 |
| TS-02-088 | Integration (CS-08) | Support session with Org B ids → 404 | US-02-16-AC8 |
