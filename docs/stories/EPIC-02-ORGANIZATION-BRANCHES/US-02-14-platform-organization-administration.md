# US-02-14: Platform Administration of Organizations (List, Suspend, Reactivate)

| Field | Value |
|---|---|
| Story ID | US-02-14 |
| Epic | EPIC-02 |
| Priority | P1 |
| Complexity | M |
| Related Requirements | FR-02-034, FR-02-035 |
| Related Business Rules | BR-02-001, BR-02-016, BR-02-021 |
| Dependencies | US-02-04, EPIC-01 refresh token revocation and login stories |

## User Story
As a platform administrator, I want to see which organizations exist and suspend or reactivate one so that I can operate the service without accessing pharmacies' business data.

## Business Value
Operational control of the SaaS (for example non-payment or security incident) with no exposure of business data.

## Preconditions
- Caller is a platform administrator with the listed platform permissions.

## Acceptance Criteria

### US-02-14-AC1: Metadata-only listing
- **Given** 3 organizations
- **When** a platform administrator calls `GET /api/v1/platform/organizations?page=1&pageSize=25`
- **Then** each item contains only `id`, `nameAr`, `nameEn`, `status`, `branchCount`, `userCount`, `createdAt`, `suspendedAt`, `suspensionReason`, and no sales, stock, patient, or financial fields.

### US-02-14-AC2: Suspend organization
- **Given** Org A is `Active` and its Cashier is logged in
- **When** the administrator calls `POST /api/v1/platform/organizations/{OrgA}/suspend` with reason "Security incident under investigation"
- **Then** Org A is `Suspended`, all Org A refresh tokens are revoked, the Cashier's next request after 60 seconds returns 403 `ORG.ORGANIZATION_SUSPENDED`, Org A login attempts return 403 `ORG.ORGANIZATION_SUSPENDED`, and a platform audit entry `org.organization.suspended` is written.

### US-02-14-AC3: No data changed by suspension
- **Given** row counts and checksums of Org A business tables before suspension
- **When** Org A is suspended and reactivated
- **Then** counts and checksums are unchanged.

### US-02-14-AC4: Reactivate
- **Given** Org A is `Suspended`
- **When** the administrator reactivates it
- **Then** status is `Active`, users can log in again, and audit entry `org.organization.reactivated` is written; reactivating an `Active` organization returns 409 `ORG.INVALID_STATUS_TRANSITION`.

### US-02-14-AC5: Platform token has no business data access
- **Given** a platform administrator token without a support session
- **When** it calls `GET /api/v1/branches/{OrgA branch}/settings` or `GET /api/v1/organization`
- **Then** the response is 404 `COMMON.NOT_FOUND`.

### US-02-14-AC6: Organization users denied platform routes
- **Given** an Org A Owner
- **When** they call `POST /api/v1/platform/organizations/{OrgA}/suspend`
- **Then** the response is 403 `COMMON.FORBIDDEN`.

### US-02-14-AC7: Missing reason
- **Given** a platform administrator
- **When** they suspend with a 5-character reason
- **Then** the response is 422 `COMMON.VALIDATION_FAILED` with `ORG.REASON_REQUIRED`.

## Validation Rules
- VR-02-022, VR-02-024.

## Authorization Rules
- List/view: `org.platform-organizations.read`. Suspend/reactivate: `org.platform-organizations.suspend`. Platform tokens only.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Suspended organization user request / login | 403 `ORG.ORGANIZATION_SUSPENDED` |
| Invalid status transition | 409 `ORG.INVALID_STATUS_TRANSITION` |
| Short reason | 422 `ORG.REASON_REQUIRED` |
| Organization token on platform route | 403 `COMMON.FORBIDDEN` |
| Platform token on tenant route | 404 `COMMON.NOT_FOUND` |
| Unknown organization id | 404 `COMMON.NOT_FOUND` |

## Edge Cases
- Hangfire recurring jobs for a suspended organization (for example nightly expiry flagging) are skipped and logged; backups continue.
- Active support grants of a suspended organization remain stored but sessions are rejected while suspended.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-02-072 | API | Listing returns metadata fields only (schema assertion) | US-02-14-AC1 |
| TS-02-073 | Integration | Suspension: tokens revoked, 403 ≤ 60 s, login refused, audit | US-02-14-AC2 |
| TS-02-074 | Integration | Data checksums unchanged across suspend/reactivate | US-02-14-AC3, US-02-14-AC4 |
| TS-02-075 | Integration (CS-08) | Platform token on tenant routes → 404 | US-02-14-AC5 |
| TS-02-076 | API | Org token on platform route 403; short reason 422 | US-02-14-AC6, US-02-14-AC7 |
