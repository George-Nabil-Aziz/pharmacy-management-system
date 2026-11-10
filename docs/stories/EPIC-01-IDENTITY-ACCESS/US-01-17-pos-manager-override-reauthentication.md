# US-01-17: Re-authenticate a manager for a POS override

| Field | Value |
|---|---|
| Story ID | US-01-17 |
| Epic | EPIC-01 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-01-037, FR-01-038, FR-01-039, FR-01-040 |
| Related Business Rules | BR-01-015, BR-01-016, BR-01-018, BR-01-021, BR-G-32 |
| Dependencies | US-01-02, US-01-07, US-01-08, US-01-10, EPIC-06 override context |

## User Story
As a POS user, I want a second authorized user to re-authenticate for an eligible override so that the requested action can proceed without switching the workstation session.

## Business Value
Re-authentication preserves individual accountability while avoiding a shared or elevated POS session.

## Preconditions
- The requesting user is authenticated, holds `sales.pos.sell`, and is assigned to the Branch.
- The overrider has an Active account and an override-eligible permission for that Branch.

## Acceptance Criteria
### US-01-17-AC1: Issue a bound single-use ManagerOverride
- **Given** a requester and a different eligible overrider
- **When** the requester submits valid overrider credentials, permission, context type, and SHA-256 context hash
- **Then** the response is 200 with a grant bound to Organization, Branch, requester, overrider, permission, and context hash, expiring 120 seconds after issue; no session or token is created for the overrider.

### US-01-17-AC2: Consume grant once in the caller transaction
- **Given** a valid unexpired grant whose context matches
- **When** the consuming business operation validates it inside its database transaction
- **Then** consumption commits atomically with the operation, and every second use or mismatched context is rejected.

### US-01-17-AC3: Deny unauthorized override attempts without disclosure
- **Given** a requester without `sales.pos.sell`, an overrider with invalid credentials or missing branch scope, a self-override attempt, or an identifier from another Organization
- **When** an override is requested or validated
- **Then** permission or override failures return 403 with the specified generic code, foreign Organization resources return 404, and no grant is issued; failed password verification counts toward lockout.

## Validation Rules
- `permission` must be override-eligible; `contextHash` is exactly 64 hexadecimal characters; context type is from the SPEC-06 list; reason is at most 200 characters (VR-01-018, VR-01-019).
- Tokens have at least 256 bits of entropy and are stored only as hashes (BR-01-021).

## Authorization Rules
- Requester: `sales.pos.sell` and Branch assignment. Overrider: requested override permission and Branch scope; must be a different Active User.
- No overrider session or access/refresh token is created. Cross-Organization access returns 404; same-Organization permission/branch denial returns 403. RLS is enabled and forced from MVP.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Requester missing permission or Branch assignment | 403 `IDENTITY.PERMISSION_DENIED` / `IDENTITY.BRANCH_ACCESS_DENIED` |
| Invalid/ineligible overrider or self-override | 403 `IDENTITY.OVERRIDE_DENIED` |
| Grant expired, consumed, or context mismatch | 403 `IDENTITY.OVERRIDE_GRANT_INVALID` |
| Other Organization resource | 404 `COMMON.NOT_FOUND` |
| Invalid context hash or permission code | 400 `COMMON.VALIDATION_FAILED` |
| Rate limit exceeded | 429 `COMMON.RATE_LIMITED` |

## Edge Cases
- Wrong overrider passwords increment the overrider's lockout counter; the response remains generic.
- A grant expiring while a request waits for the business transaction lock is rejected at consumption time.
- A concurrent attempt to consume one grant succeeds at most once.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-01-080 | Integration | Valid grant claims, 120-second expiry, and no overrider session/token | US-01-17-AC1 |
| TS-01-081 | Integration | Grant consumed atomically and cannot be reused or consumed with changed context | US-01-17-AC2 |
| TS-01-082 | Integration | Missing requester permission, out-of-branch approver, and self-override are denied; failures count toward lockout | US-01-17-AC3 |
| TS-01-083 | Concurrency | Parallel consumption produces at most one success; foreign Organization lookup returns 404 (CS-08) | US-01-17-AC3 |
