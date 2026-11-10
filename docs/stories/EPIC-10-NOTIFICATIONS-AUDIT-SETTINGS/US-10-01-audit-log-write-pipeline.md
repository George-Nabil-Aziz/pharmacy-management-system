# US-10-01: Audit Log Write Pipeline

| Field | Value |
|---|---|
| Story ID | US-10-01 |
| Epic | EPIC-10 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-10-001, FR-10-002, FR-10-003, FR-10-004, FR-10-005 |
| Related Business Rules | BR-G-16, BR-G-19, BR-G-25, BR-G-34, BR-10-001, BR-10-002, BR-10-003, BR-10-006 |
| Dependencies | SPEC-01 authentication (request user context) |

## User Story
As an Owner, I want every sensitive operation to be recorded in an append-only audit log in the same transaction as the change so that I can hold each user accountable and trust that no recorded action is missing.

## Business Value
Provides the foundation for BRQ-12 (auditable, tamper-evident operations). Every other module depends on this pipeline to satisfy BR-G-16.

## Preconditions
- `platform.audit_logs` table exists with monthly partitions and the indexes listed in SPEC-10 §8.1.
- The application database role has `INSERT` and `SELECT` only on `platform.audit_logs`.
- Request context provides organization id, branch id (when route-scoped), user id, IP, user agent, and `traceId`.

## Acceptance Criteria
### US-10-01-AC1: Audit entry committed with the business change
- **Given** a Branch Manager changes the selling price of a medicine (catalog event `CATALOG.PRICE_CHANGED`)
- **When** the price change transaction commits
- **Then** exactly one `AuditLog` row with event code `CATALOG.PRICE_CHANGED` exists with the same commit, and its `CorrelationId` equals the request `traceId`

### US-10-01-AC2: Audit failure rolls back the business change
- **Given** the audit insert is forced to fail (test fault injection) during a stock adjustment posting
- **When** the posting request is processed
- **Then** the API returns 500 with code `AUDIT.WRITE_FAILED`, the adjustment status is unchanged, and no stock movement or balance change exists

### US-10-01-AC3: Envelope fields captured
- **Given** a user from IP `197.32.10.5` with a user agent of 700 characters performs an audited operation in branch `CAI01`
- **When** the audit entry is written
- **Then** it contains event code, category, organization id, branch id, actor user id, actor type `User`, entity type and id, outcome `Succeeded`, IP `197.32.10.5`, the user agent truncated to 512 characters, correlation id, and `OccurredAt` in UTC with microsecond precision

### US-10-01-AC4: Field-level diff without secrets
- **Given** an administrator updates a user's display name and triggers a password reset in the same request
- **When** the `IDENTITY.USER_UPDATED` entry is written
- **Then** `Changes` contains only `{ "displayName": { "before": "...", "after": "..." } }` and no password hash, token, or reset code appears anywhere in the entry

### US-10-01-AC5: Medical values hashed
- **Given** a pharmacist changes a patient allergy from "Penicillin" to "Penicillin, Sulfa"
- **When** `PATIENTS.MEDICAL_DATA_CHANGED` is written
- **Then** `Changes` lists the field name with SHA-256 hashes of the before and after values and no plaintext medical value

### US-10-01-AC6: Append-only enforced at database level (negative)
- **Given** a connection using the application database role
- **When** it executes `UPDATE` of any non-seal column or `DELETE` on `platform.audit_logs`
- **Then** the statement fails with a permission/trigger error and the row is unchanged

### US-10-01-AC7: Failed security operations are audited in their own transaction
- **Given** a login attempt with a wrong password
- **When** the login request completes with 401
- **Then** one `IDENTITY.LOGIN_FAILED` entry with reason `InvalidCredentials` is committed even though no business transaction committed

### US-10-01-AC8: No purge capability
- **Given** the complete API route inventory and the registered recurring jobs
- **When** the route/job inventory test runs
- **Then** no route or job deletes or updates `AuditLog` rows (other than the sealer's seal columns)

## Validation Rules
- Event code must exist in the registry (enforced in US-10-02).
- `UserAgent` truncated to 512 characters; `IpAddress` stored as `inet` (IPv4/IPv6); missing values stored as null.

## Authorization Rules
- No public write endpoint; entries are written only by server-side code.
- Writing an entry does not require any permission from the actor; reading requires `audit.logs.read` (US-10-04).
- No 403/404 scenario applies to this story because it exposes no endpoint; denied business operations (403) and cross-organization attempts (404) are still audited by the pipeline when the catalog marks them as security events (SPEC-10 sensitive-operation catalog).

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Audit insert fails during business transaction | 500 `AUDIT.WRITE_FAILED`, business change rolled back |
| Database role attempts DELETE on audit table | DB permission error; no API exposes this path (verified by TS-10-007) |

## Edge Cases
- One request changing several aggregates (e.g., sale completion) writes one entry per aggregate per catalog event, all in the same transaction.
- System actors (jobs) use `ActorType = System` and `ActorUserId = null`.
- Requests without a branch route parameter store `BranchId = null` unless the domain event carries a branch.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-10-001 | Integration | Price change commits with exactly one audit entry; correlation id matches traceId | US-10-01-AC1 |
| TS-10-002 | Integration | Fault-injected audit insert failure rolls back stock adjustment posting (no movement, no balance change) | US-10-01-AC2 |
| TS-10-003 | Integration | Envelope fields, UA truncation to 512, UTC microsecond timestamp | US-10-01-AC3 |
| TS-10-004 | Unit | Diff builder emits changed fields only, excludes secret-marked fields, hashes medical fields | US-10-01-AC4, US-10-01-AC5 |
| TS-10-005 | Integration | Application DB role UPDATE/DELETE on audit_logs rejected | US-10-01-AC6 |
| TS-10-006 | Integration | Failed login produces committed `IDENTITY.LOGIN_FAILED` entry | US-10-01-AC7 |
| TS-10-007 | Architecture | Route and job inventory contains no audit delete/update path | US-10-01-AC8 |
