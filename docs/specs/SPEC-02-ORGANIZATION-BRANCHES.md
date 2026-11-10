# SPEC-02: Organization & Branch Management

**Version:** 1.0 (2026-11-09) · **Status:** Draft for review · **Owner:** Product / Solution Architecture · **Related ADRs:** ADR-001 (modular monolith), ADR-002 (multi-tenancy), ADR-005 (auth), ADR-007 (background jobs), ADR-008 (audit) · **Related BRQs:** BRQ-01, BRQ-02, BRQ-04, BRQ-10, BRQ-12, BRQ-15

---

## 1. Purpose

This specification defines how pharmacy organizations and their branches are represented, provisioned, configured, and isolated from one another. It is the authoritative source for:

- the Organization and Branch aggregates, their lifecycles, and their settings;
- the organization (tenant) isolation mechanism used by every other module;
- the branch scope of users (which branches a user may act in) and its enforcement;
- document numbering sequences (BR-G-24) consumed by every posting workflow;
- organization-level policy for stock transfers and cross-branch reporting;
- platform administrator management of organizations and Owner-granted support access.

## 2. Business Context

The product is sold to Egyptian pharmacy businesses that range from a single pharmacy to chains of 50 branches. Each business (an **Organization**) must see only its own data (BRQ-02). Within an organization, staff typically work in one branch, while owners, accountants, and area managers work across branches. Inventory is physically per branch (BR-G-02), and stock moves between branches only through the explicit stock transfer workflow (BR-G-13, SPEC-04).

The first production deployment serves one organization with 1–2 branches (MVP), but the multi-organization data model and isolation enforcement are part of the MVP so that the SaaS model (several organizations in one shared database) requires no data migration later.

Platform administrators (the SaaS operator) manage organizations but have no access to organization business data unless the organization's Owner grants time-limited, read-only, audited support access.

## 3. Scope

| Area | Included in this spec |
|---|---|
| Organization profile | Display names (Arabic/English), legal name, tax registration number, commercial registration number, contact details, address. Regulatory field values are stored as entered and are not verified (REG-08). |
| Organization provisioning | Atomic creation of Organization, OrganizationSettings, first Branch, BranchSettings, seeded system roles, Owner user (invited), via platform API and a deployment bootstrap command. |
| Platform administration | List/view organization metadata, suspend and reactivate organizations. |
| Branches | Create, update, deactivate (with preconditions), reactivate; branch code, addresses, contact info, time zone, license fields. |
| Branch settings | Definition and semantics of each branch setting (catalog in §8.4). The settings UI framework belongs to SPEC-10. |
| Organization settings | Definition of organization-level settings owned here (§8.4) and storage/defaults of organization settings whose semantics are owned by other specs. |
| User-to-branch assignments | Branch scope of each user (`AssignedBranches` or `AllBranches`), assigned branches, default branch. |
| Branch-scoped authorization | Enforcement that a route `branchId` belongs to the caller's organization and is in the caller's branch scope (CS-07). |
| Branch inventory ownership | Statement of ownership and visibility rules; inventory behavior is SPEC-04. |
| Stock transfer policy | Which branches may send/receive transfers and who may approve; the workflow is SPEC-04. |
| Reporting scope | Who may see cross-branch / organization-level data; the reports themselves are SPEC-09. |
| Tenant isolation | Tenant context resolution, global query filters, insert stamping, RLS, 404 on cross-organization access, isolation test suite (CS-08). |
| Support access | Owner-granted, time-limited, read-only, audited platform administrator access. |
| Document numbering | `DocumentSequence` and the gapless numbering service (BR-G-24). |

## 4. Out of Scope

- Authentication, user creation, roles and permission assignment, password and session management (SPEC-01). This spec only manages branch assignments and branch scope of existing users.
- Stock transfer workflow states, allocation, dispatch, and receiving (SPEC-04).
- Inventory behavior per branch: batches, balances, movements (SPEC-04).
- Report content and computation (SPEC-09).
- Settings UI framework, notification delivery, audit log storage and viewer (SPEC-10).
- Subscriptions, billing, plan limits (P3; `Subscription` entity reserved).
- Self-service public organization sign-up (see OD-02-01).
- Verification of license, tax registration, or commercial registration values with any authority (REG-07, REG-08).
- Electronic invoicing integration (REG-07; future spec).
- Moving a branch from one organization to another (prohibited by BR-G-01).

## 5. Actors and Permissions

### 5.1 Actors

| Actor | Description |
|---|---|
| Owner (`OWNER`) | Full control of the organization; always has `AllBranches` scope. |
| Branch Manager (`MANAGER`) | Manages branch details, settings, and assignments for branches in their scope. |
| Accountant (`ACCOUNTANT`) | Reads organization and branch data; may hold `AllBranches` scope for reporting. |
| Pharmacist, Cashier, Inventory Staff | Consume branch context; read their accessible branches. |
| Platform administrator (`PLATFORM_ADMIN`) | SaaS operator; provisions, suspends, reactivates organizations; uses support sessions when granted. |
| System (background jobs, outbox handlers) | Runs with an explicit organization context per unit of work. |

### 5.2 Permissions used

| Permission | Canonical / New | Purpose | Default roles |
|---|---|---|---|
| `org.organization.read` | Canonical | View organization profile and organization settings | All organization roles |
| `org.organization.update` | Canonical | Update organization profile | OWNER |
| `org.branches.read` | Canonical | View branches in scope | All organization roles |
| `org.branches.create` | Canonical | Create branch | OWNER |
| `org.branches.update` | Canonical | Update branch details | OWNER, MANAGER |
| `org.branches.deactivate` | Canonical | Deactivate / reactivate branch, run deactivation check | OWNER |
| `org.branch-assignments.manage` | Canonical | Manage user branch scope and assignments | OWNER, MANAGER (limited, BR-02-009) |
| `settings.organization.manage` | Canonical | Update organization settings | OWNER |
| `settings.branch.manage` | Canonical | Update branch settings; view document sequences | OWNER, MANAGER |
| `reports.organization.read` | Canonical | Cross-branch / organization-level reports (with `AllBranches` scope) | OWNER, ACCOUNTANT |
| `identity.users.read` | Canonical (SPEC-01) | View a user's branch assignments | OWNER, MANAGER |
| `org.support-grants.manage` | **New** | Create, list, revoke support access grants; view support activity | OWNER |
| `org.platform-organizations.read` | **New (platform-level)** | List/view organization metadata; list grants issued to self | PLATFORM_ADMIN |
| `org.platform-organizations.provision` | **New (platform-level)** | Provision an organization | PLATFORM_ADMIN |
| `org.platform-organizations.suspend` | **New (platform-level)** | Suspend / reactivate an organization | PLATFORM_ADMIN |

Platform-level permissions are never assignable to organization roles; organization permissions are never held by a platform token.

## 6. Functional Requirements

| ID | Requirement | Priority | BRQ | Stories |
|---|---|---|---|---|
| FR-02-001 | The system shall resolve the organization context of every request exclusively from the `org_id` claim of the validated access token, ignore any organization identifier supplied in headers, query string, or body, and reject a request with no valid token with 401 `COMMON.UNAUTHENTICATED` before any database query is executed. | P0 | BRQ-02 | US-02-01 |
| FR-02-002 | The system shall apply an organization filter (`OrganizationId = current organization`) to every query on every tenant-owned entity, and an automated architecture test shall fail the build when a tenant-owned entity has no filter or when filter bypass is used outside the allow-listed platform components. | P0 | BRQ-02 | US-02-01 |
| FR-02-003 | The system shall set `OrganizationId` from the organization context on every inserted tenant-owned row and abort the whole database transaction when an insert or update carries an `OrganizationId` different from the current organization context. | P0 | BRQ-02 | US-02-01 |
| FR-02-004 | The system shall return 404 `COMMON.NOT_FOUND` with a response body byte-identical (except `traceId`) to that of a non-existent identifier when a route identifier refers to a resource of another organization, and 422 `COMMON.REFERENCE_NOT_FOUND` when a request body references such a resource. | P0 | BRQ-02 | US-02-01, US-02-02 |
| FR-02-005 | The system shall require an explicit organization context for every background job, outbox message handler, cache entry key, SignalR group, and file object access that touches tenant-owned data, and shall fail (without side effects) any such unit of work that starts without one. | P0 | BRQ-02 | US-02-01 |
| FR-02-006 | The system shall include an automated cross-organization isolation test suite that seeds two organizations and, for every registered tenant-owned API route, verifies that a caller of organization A using identifiers of organization B receives 404 (route identifiers) or 422 (body references) and that no organization B data appears in any response; the suite shall fail when a registered route is not classified. | P0 | BRQ-02 | US-02-02 |
| FR-02-007 | The system shall enforce PostgreSQL Row-Level Security on every tenant-owned table using a transaction-scoped organization setting, with the application database role lacking `BYPASSRLS` and table ownership, so that a query without the organization setting returns zero rows. | P0 | BRQ-02 | US-02-03 |
| FR-02-008 | The system shall allow a platform administrator to provision an organization, creating in one database transaction: the Organization (status `Active`), OrganizationSettings with defaults, the first Branch with BranchSettings defaults, the six system roles with their default permission sets, and an Owner user in status `Invited` with `AllBranches` scope, and shall trigger the SPEC-01 invitation for the Owner. | P0 | BRQ-02 | US-02-04 |
| FR-02-009 | The system shall make provisioning atomic (no Organization, Branch, role, user, or settings row remains after any failure) and idempotent via a required `Idempotency-Key` header. | P0 | BRQ-02 | US-02-04 |
| FR-02-010 | The system shall provide a deployment bootstrap command that provisions the first organization with the same result and validation as FR-02-008 and refuses to run when any organization already exists unless explicitly instructed to add another. | P0 | BRQ-02 | US-02-04 |
| FR-02-011 | The system shall allow users with `org.organization.update` to view and update the organization profile (display name Arabic/English, legal name, tax registration number, commercial registration number, address, phone, email) using `If-Match` concurrency, storing regulatory identifiers as entered and labelling them "unverified" in responses (REG-08). | P1 | BRQ-02, BRQ-15 | US-02-05 |
| FR-02-012 | The system shall store organization settings defined in §8.4 with their defaults at provisioning and allow users with `settings.organization.manage` to update them with range validation and an audit entry containing old and new values. | P1 | BRQ-02, BRQ-15 | US-02-05, US-02-12 |
| FR-02-013 | The system shall allow users with `org.branches.create` to create a branch with code, Arabic and English names, governorate, city, address line, phone, optional email, time zone (default `Africa/Cairo`), and optional license number, license issuer, and license expiry date, in status `Active`, creating its BranchSettings with defaults in the same transaction. | P0 | BRQ-02 | US-02-06 |
| FR-02-014 | The system shall enforce that a branch code matches `^[A-Z][A-Z0-9]{2,7}$`, is unique within the organization (case-insensitive), and cannot be changed once any document number has been issued for the branch. | P0 | BRQ-02 | US-02-06, US-02-08 |
| FR-02-015 | The system shall allow users with `org.branches.update` to update branch details using `If-Match` concurrency, and shall reject a time zone change while the branch has an `Open` cash session; an accepted time zone change applies from the next business date. | P0 | BRQ-02 | US-02-06 |
| FR-02-016 | The system shall return from branch list and detail endpoints only branches in the caller's branch scope; a branch of the caller's organization outside scope returns 403 `COMMON.FORBIDDEN` on detail. | P0 | BRQ-01, BRQ-02 | US-02-06, US-02-09 |
| FR-02-017 | The system shall provide a deactivation check that returns, for a branch, the pass/fail result and blocking counts of each deactivation precondition in BR-02-007 without changing state. | P1 | BRQ-02 | US-02-11 |
| FR-02-018 | The system shall deactivate a branch (status `Inactive`, with reason, timestamp, and user) only when all preconditions in BR-02-007 pass, and otherwise reject with 409 `ORG.BRANCH_DEACTIVATION_BLOCKED` listing each failing precondition code. | P1 | BRQ-02, BRQ-04 | US-02-11 |
| FR-02-019 | The system shall keep all data of an `Inactive` branch readable to users in scope, reject any document creation or posting for it with 409 `ORG.BRANCH_INACTIVE`, exclude it from branch selection for operations, and allow users with `org.branches.deactivate` to reactivate it. | P1 | BRQ-02 | US-02-11 |
| FR-02-020 | The system shall maintain the branch settings defined in §8.4 (near-expiry days, do-not-sell window days, adjustment approval threshold, receipt footers, default tax category, prices-include-tax flag, transfers out/in enabled) with the specified types, ranges, and defaults, and expose effective values to other modules through the Organization module facade. | P0 | BRQ-04, BRQ-11, BRQ-15 | US-02-07 |
| FR-02-021 | The system shall allow users with `settings.branch.manage` to update branch settings with range and cross-field validation, write an audit entry with old and new values, apply changes only to operations started after commit (never to completed documents), and make changes visible to all modules within 5 seconds of commit. | P0 | BRQ-04, BRQ-12 | US-02-07 |
| FR-02-022 | The system shall number financial documents per (branch, document type, calendar year of the branch business date) in the format `{BranchCode}-{Prefix}-{YYYY}-{NNNNNN}` using the prefixes in §8.3, with a minimum of 6 zero-padded digits. | P0 | BRQ-12 | US-02-08 |
| FR-02-023 | The system shall allocate document numbers inside the calling posting transaction so that a rolled-back posting consumes no number, producing a gapless sequence starting at 1 for each new (branch, document type, year). | P0 | BRQ-12 | US-02-08 |
| FR-02-024 | The system shall guarantee zero duplicate document numbers under concurrent postings, enforced by row locking of the sequence and a unique constraint on (OrganizationId, BranchId, DocumentType, DocumentNumber) in each consuming document table. | P0 | BRQ-05, BRQ-12 | US-02-08 |
| FR-02-025 | The system shall expose document sequences read-only to users with `settings.branch.manage` and shall provide no API to reset, decrement, or edit a sequence. | P1 | BRQ-12 | US-02-08 |
| FR-02-026 | The system shall allow users with `org.branch-assignments.manage` to set a user's branch scope (`AssignedBranches` or `AllBranches`), the set of assigned active branches of the same organization, and exactly one default branch, and provide every authenticated user an endpoint listing their accessible branches with the default flagged. | P0 | BRQ-01, BRQ-02 | US-02-09 |
| FR-02-027 | The system shall restrict a caller without `AllBranches` scope to adding or removing assignments only for branches in their own scope, and shall reject their attempts to grant `AllBranches` or modify an Owner's scope with 403 `ORG.ASSIGNMENT_OUT_OF_SCOPE`. | P0 | BRQ-01 | US-02-09 |
| FR-02-028 | The system shall apply branch assignment and scope changes to the affected user's authorization within 5 seconds of commit without requiring re-login, and record an audit entry with the before and after assignment sets. | P0 | BRQ-01, BRQ-12 | US-02-09 |
| FR-02-029 | The system shall, before executing any branch-scoped endpoint (`/api/v1/branches/{branchId}/...`), return 404 `COMMON.NOT_FOUND` when `branchId` does not belong to the caller's organization and 403 `COMMON.FORBIDDEN` when it belongs to the organization but is outside the caller's branch scope (CS-07). | P0 | BRQ-01, BRQ-02 | US-02-10 |
| FR-02-030 | The system shall require that every Batch, BatchBalance, and StockMovement carries the `BranchId` of a branch of the same organization, and shall return stock data of a branch only to callers whose branch scope includes that branch; cross-branch stock aggregates require `AllBranches` scope. | P0 | BRQ-02, BRQ-04 | US-02-10 |
| FR-02-031 | The system shall expose a transfer route policy to SPEC-04 that allows a transfer only when source and destination are distinct `Active` branches of the same organization, the source has `TransfersOutEnabled = true`, and the destination has `TransfersInEnabled = true`, otherwise returning 422 `ORG.TRANSFER_ROUTE_NOT_ALLOWED`. | P1 | BRQ-02, BRQ-04 | US-02-12 |
| FR-02-032 | The system shall expose a transfer approval policy to SPEC-04 that allows approval only by a user who holds `inventory.transfers.approve`, is not the transfer requester, and has in scope the branch designated by organization setting `TransferApproverScope` (`Source`, `Destination`, or `Either`), otherwise returning 403 `ORG.TRANSFER_APPROVER_NOT_ELIGIBLE`. | P1 | BRQ-01, BRQ-04 | US-02-12 |
| FR-02-033 | The system shall expose a reporting scope policy to SPEC-09 under which organization-level and cross-branch reports require `reports.organization.read` and `AllBranches` scope, other reports are limited to branches in the caller's scope, and an explicit branch filter outside scope returns 403 `COMMON.FORBIDDEN`. | P1 | BRQ-10, BRQ-01 | US-02-13 |
| FR-02-034 | The system shall allow platform administrators with `org.platform-organizations.read` to list and view organization metadata only (name, status, branch count, user count, created date, suspension data) and shall return 404 to a platform token on every tenant-owned endpoint. | P1 | BRQ-02 | US-02-14 |
| FR-02-035 | The system shall allow platform administrators with `org.platform-organizations.suspend` to suspend an `Active` organization with a mandatory reason and reactivate a `Suspended` one; while suspended, all requests of the organization's users return 403 `ORG.ORGANIZATION_SUSPENDED` within 60 seconds of commit, all refresh tokens are revoked, and no data is changed or deleted. | P1 | BRQ-02, BRQ-12 | US-02-14 |
| FR-02-036 | The system shall allow users with `org.support-grants.manage` to create a support access grant naming one platform administrator (by email), a duration of 1–72 hours, and a reason, to list grants, and to revoke an active grant. | P1 | BRQ-02, BRQ-12 | US-02-15 |
| FR-02-037 | The system shall reject every support-session request made after the grant's `ExpiresAt` and every request made more than 60 seconds after a grant revocation with 403 `ORG.SUPPORT_GRANT_INACTIVE`. | P1 | BRQ-02 | US-02-15, US-02-16 |
| FR-02-038 | The system shall allow a platform administrator holding an active grant to start a support session that issues an access token (lifetime ≤ 15 minutes and never beyond the grant's `ExpiresAt`) carrying the organization, the grant identifier, `AllBranches` scope, and the support read-only permission set (§11.3). | P1 | BRQ-02 | US-02-16 |
| FR-02-039 | The system shall reject any non-read request (any method other than GET/HEAD) in a support session with 403 `ORG.SUPPORT_ACCESS_READ_ONLY`, and reject patient, prescription, and export endpoints with 403 `COMMON.FORBIDDEN`. | P1 | BRQ-02, BRQ-08 | US-02-16 |
| FR-02-040 | The system shall write an audit entry for every support-session request (grant id, platform administrator, method, route template, status code, timestamp) and allow users with `org.support-grants.manage` to view the activity of each grant. | P1 | BRQ-12 | US-02-16 |

## 7. Business Rules

| ID | Rule | Source |
|---|---|---|
| BR-02-001 | An organization has status `Active` or `Suspended`. Organizations are never hard-deleted by application users or platform administrators through the application. | BR-G-34 |
| BR-02-002 | A branch belongs to exactly one organization for its lifetime; no operation changes `Branch.OrganizationId`. | BR-G-01 |
| BR-02-003 | Branch code: `^[A-Z][A-Z0-9]{2,7}$`, unique within the organization, immutable after the first document number is issued for the branch. | BR-G-24 |
| BR-02-004 | Every `Active` organization has at least one `Active` branch; the last `Active` branch cannot be deactivated. | Derived |
| BR-02-005 | The branch time zone (IANA identifier, default `Africa/Cairo`) defines the branch business date; a change is accepted only when no cash session of the branch is `Open` and applies from the next business date. | BR-G-23 |
| BR-02-006 | An `Inactive` branch is read-only: no sale, return, goods receipt, transfer, adjustment, write-off, stocktake, cash session, or prescription dispensing may be created or posted for it. | Derived |
| BR-02-007 | Deactivation preconditions: (a) no `Open` cash session (`ORG.BRANCH_HAS_OPEN_CASH_SESSIONS`); (b) no stock transfer with the branch as source or destination in `Requested`, `Approved`, `InTransit`, or `PartiallyReceived` (`ORG.BRANCH_HAS_ACTIVE_TRANSFERS`); (c) sum of `BatchBalance.OnHand` for the branch = 0 (`ORG.BRANCH_HAS_STOCK`); (d) no stock adjustment or write-off in `Draft`/`PendingApproval`, no stocktake in `Draft`/`Counting`/`PendingApproval`, no goods receipt in `Draft` (`ORG.BRANCH_HAS_PENDING_DOCUMENTS`); (e) BR-02-004 (`ORG.LAST_ACTIVE_BRANCH`). | BR-G-02, BR-G-13, BR-G-26 |
| BR-02-008 | Users with the `OWNER` role always have `AllBranches` scope; their scope cannot be changed to `AssignedBranches`. | §5.1 |
| BR-02-009 | A caller with `org.branch-assignments.manage` but without `AllBranches` scope may only add/remove assignments for branches in their own scope, cannot grant `AllBranches`, and cannot change Owner users. | BR-G-17 |
| BR-02-010 | A user with `AssignedBranches` scope and zero assignments to `Active` branches can authenticate but receives 403 on every branch-scoped endpoint. Exactly one assigned branch is flagged default when the user has ≥ 1 assignment. | Derived |
| BR-02-011 | Document numbers are unique and gapless per (branch, document type, calendar year of branch business date); the year is taken from the business date of the posting. | BR-G-24, BR-G-23 |
| BR-02-012 | Document sequences are never reset, decremented, or edited by any user, including the Owner and platform administrators. | BR-G-24, BR-G-25 |
| BR-02-013 | Stock transfers are allowed only between distinct `Active` branches of the same organization whose transfer flags permit it; stock is never shared implicitly. | BR-G-02, BR-G-13 |
| BR-02-014 | A stock transfer is approved by a user different from its requester who holds `inventory.transfers.approve` and has the branch designated by `TransferApproverScope` in scope. | BR-G-28 |
| BR-02-015 | Cross-branch and organization-level report data requires `reports.organization.read` and `AllBranches` scope. | Master SDD §7 Multi-Branch rule 5 |
| BR-02-016 | Platform administrators have no access to organization business data except through an active support grant. | §5.1 |
| BR-02-017 | A support grant is read-only, lasts 1–72 hours, names exactly one platform administrator, excludes patient and prescription data and exports, can be revoked by the Owner at any time, and every request under it is audited. At most one active grant exists per (organization, platform administrator). | BR-G-16, BR-G-29 |
| BR-02-018 | Settings changes are never retroactive: documents keep snapshotted values. | BR-G-20 |
| BR-02-019 | Tax registration, commercial registration, and license values are stored as entered; the system makes no decision based on their validity. | REG-07, REG-08 |
| BR-02-020 | A stock adjustment or write-off requires approval when its value Σ\|QuantityDelta × UnitCost\| over all lines is strictly greater than the branch `AdjustmentApprovalThresholdAmount`; a threshold of 0.00 means every adjustment requires approval. | BR-G-28 |
| BR-02-021 | While an organization is `Suspended`, its users cannot log in or call any endpoint; background jobs for the organization (except retention/backups) are skipped; data is retained unchanged. | BR-G-34 |
| BR-02-022 | `DoNotSellWindowDays` must be ≤ `NearExpiryThresholdDays` for the same branch. | BR-G-07, BR-G-27 |

## 8. Data Requirements

All tables are in schema `org` unless stated. Common conventions of DOCUMENTATION-CONVENTIONS §6 apply (UUIDv7 `Id`, audit columns, `xmin` as `RowVersion`).

### 8.1 Entities

| Entity | Key attributes | Notes |
|---|---|---|
| `Organization` | `Id`, `NameAr` (≤ 150), `NameEn` (≤ 150), `LegalName` (≤ 250), `TaxRegistrationNumber` (≤ 20, nullable), `CommercialRegistrationNumber` (≤ 30, nullable), `Governorate`, `City`, `AddressLine` (≤ 250), `Phone`, `Email`, `Status` (`Active`/`Suspended`), `SuspendedAt`, `SuspendedBy`, `SuspensionReason` (≤ 500), `RowVersion` | `Id` is the organization identifier; it has no `OrganizationId` column. Read only through the Organization module. |
| `Branch` | `Id`, `OrganizationId`, `Code`, `NameAr`, `NameEn`, `Governorate`, `City`, `AddressLine`, `Phone`, `Email?`, `TimeZone` (IANA), `LicenseNumber?`, `LicenseIssuer?`, `LicenseExpiryDate?`, `Status` (`Active`/`Inactive`), `DeactivatedAt?`, `DeactivatedBy?`, `DeactivationReason?`, `RowVersion` | Unique (`OrganizationId`, upper(`Code`)). |
| `BranchSettings` | `BranchId` (PK/FK), `OrganizationId`, one column per setting in §8.4, `RowVersion` | 1:1 with Branch. |
| `OrganizationSettings` | `OrganizationId` (PK/FK), one column per setting in §8.4, `RowVersion` | 1:1 with Organization. |
| `DocumentSequence` | `Id`, `OrganizationId`, `BranchId`, `DocumentType`, `Year` (int), `CurrentValue` (bigint ≥ 0), `UpdatedAt` | Unique (`OrganizationId`, `BranchId`, `DocumentType`, `Year`). Row created on first use in a year. Not user-editable. |
| `SupportAccessGrant` | `Id`, `OrganizationId`, `PlatformAdminUserId`, `Reason` (10–500), `GrantedBy`, `GrantedAt`, `ExpiresAt`, `RevokedAt?`, `RevokedBy?`, `FirstUsedAt?` | Derived status: `Active` (now < ExpiresAt and not revoked), `Expired`, `Revoked`. Never deleted. |
| `UserBranchAssignment` (identity schema, managed by this spec) | `Id`, `OrganizationId`, `UserId`, `BranchId`, `IsDefault` | Unique (`UserId`, `BranchId`); at most one `IsDefault = true` per user (partial unique index). |
| `User.BranchScope` (attribute on SPEC-01 `User`) | `AssignedBranches` / `AllBranches` | **New attribute**; managed through this spec's endpoints. |

**Referential integrity for branch ownership:** `Branch` has a unique key (`Id`, `OrganizationId`); every branch-scoped table references it with a composite foreign key (`OrganizationId`, `BranchId`) so that a row can never reference a branch of another organization (FR-02-030).

**New canonical statuses introduced:** Organization `Active`, `Suspended`; SupportAccessGrant (derived) `Active`, `Expired`, `Revoked`.

### 8.2 Seeded data at provisioning

| Item | Value |
|---|---|
| System roles | `OWNER`, `MANAGER`, `PHARMACIST`, `CASHIER`, `INVENTORY`, `ACCOUNTANT` with default permission sets defined by SPEC-01 |
| Owner user | Status `Invited`, role `OWNER`, `BranchScope = AllBranches`, default branch = first branch |
| First branch | Code, names, address, time zone from the provisioning request; status `Active` |
| Settings | OrganizationSettings and BranchSettings with defaults (§8.4) |
| Document sequences | None pre-created; rows are created on first allocation per year |

### 8.3 Document types and prefixes (BR-G-24)

| DocumentType | Prefix | Consumer spec |
|---|---|---|
| `SalesInvoice` | `INV` | SPEC-06 |
| `SalesReturn` | `RET` | SPEC-06 |
| `GoodsReceipt` | `RCV` | SPEC-05 |
| `SupplierReturn` | `SRN` | SPEC-05 |
| `SupplierPayment` | `SPY` | SPEC-05 |
| `StockTransfer` | `TRF` | SPEC-04 |
| `StockAdjustment` | `ADJ` | SPEC-04 |

Example: `CAI01-INV-2026-000123`. Numbers above 999999 extend to 7+ digits without truncation. Write-offs and stocktakes: see OD-02-02.

### 8.4 Settings catalog (owned semantics)

**Branch settings (`BranchSettings`)**

| Key | Type | Range / format | Default | Semantics | Consumers |
|---|---|---|---|---|---|
| `NearExpiryThresholdDays` | int | 1–730 | 90 | A batch is near-expiry when `ExpiryDate − business date ≤ NearExpiryThresholdDays` | SPEC-04, SPEC-09, SPEC-10 |
| `DoNotSellWindowDays` | int | 0–365, ≤ `NearExpiryThresholdDays` | 0 | A batch cannot be sold/dispensed/transferred for sale when `ExpiryDate − business date ≤ DoNotSellWindowDays` (in addition to expired batches) | SPEC-04, SPEC-06, SPEC-08 |
| `AdjustmentApprovalThresholdAmount` | numeric(19,2), EGP | 0.00–10,000,000.00 | 1,000.00 (OD-02-06) | BR-02-020 | SPEC-04 |
| `ReceiptFooterAr` | text | 0–500 chars | empty | Printed at bottom of Arabic receipts | SPEC-06 |
| `ReceiptFooterEn` | text | 0–500 chars | empty | Printed at bottom of English receipts | SPEC-06 |
| `DefaultTaxCategoryId` | uuid, nullable | Active `TaxCategory` of the same organization | null | Tax category applied to medicines without an explicit tax category in this branch (REG-06) | SPEC-03, SPEC-06 |
| `PricesIncludeTax` | bool | — | true (OD-02-11) | **Organization-level setting (decision 2026-11-10)** — listed here for reference only; defined in SPEC-06 §8 and the SPEC-10 registry; not overridable per branch so tax mode is uniform across the organization (REG-06) | SPEC-06 |
| `TransfersOutEnabled` | bool | — | true | Branch may be a transfer source | SPEC-04 |
| `TransfersInEnabled` | bool | — | true | Branch may be a transfer destination | SPEC-04 |

**Organization settings (`OrganizationSettings`)**

| Key | Type | Range | Default | Semantics owner |
|---|---|---|---|---|
| `DefaultLanguage` | enum | `ar`, `en` | `ar` | This spec (default UI language for new users; SPEC-10 user preference overrides) |
| `Currency` | string | `EGP` only (read-only in v1) | `EGP` | This spec |
| `TransferApproverScope` | enum | `Source`, `Destination`, `Either` | `Source` (OD-02-05) | This spec (BR-02-014) |
| `EnforcePrescriptionForRxOnly` | bool | — | true | SPEC-08 (BR-G-21, REG-01) |
| `AllowDirectRestockOnReturn` | bool | — | false | SPEC-06 (REG-11) |

New setting keys introduced by this spec: `ReceiptFooterAr`, `ReceiptFooterEn`, `DefaultTaxCategoryId`, `PricesIncludeTax`, `TransfersOutEnabled`, `TransfersInEnabled`, `AdjustmentApprovalThresholdAmount`, `NearExpiryThresholdDays`, `DoNotSellWindowDays`, `DefaultLanguage`, `Currency`, `TransferApproverScope`.

## 9. Validation Rules

| ID | Field / Object | Rule | Error code |
|---|---|---|---|
| VR-02-001 | Organization.NameAr / NameEn | Required, 2–150 characters after trimming | `ORG.NAME_INVALID` |
| VR-02-002 | Organization.LegalName | Required, 2–250 characters | `ORG.LEGAL_NAME_INVALID` |
| VR-02-003 | Organization.TaxRegistrationNumber | Optional; digits only; length 9 (OD-02-07) | `ORG.TAX_REGISTRATION_NUMBER_INVALID` |
| VR-02-004 | Organization.CommercialRegistrationNumber | Optional; 1–30 characters, letters/digits/`-`/`/` | `ORG.COMMERCIAL_REGISTRATION_INVALID` |
| VR-02-005 | Phone (organization, branch) | Required; Egyptian format: `^(\+20\|0)(1[0125]\d{8}\|[2-9]\d{7,8})$` after removing spaces | `ORG.PHONE_INVALID` |
| VR-02-006 | Email (organization, branch, owner) | RFC 5322 address, ≤ 254 characters | `ORG.EMAIL_INVALID` |
| VR-02-007 | Branch.Code | `^[A-Z][A-Z0-9]{2,7}$` | `ORG.BRANCH_CODE_INVALID` |
| VR-02-008 | Branch.Code | Unique within organization (case-insensitive) | `ORG.BRANCH_CODE_DUPLICATE` (409) |
| VR-02-009 | Branch.Code change | Rejected once any `DocumentSequence.CurrentValue > 0` for the branch | `ORG.BRANCH_CODE_IMMUTABLE` (409) |
| VR-02-010 | Branch.TimeZone | Valid IANA time zone identifier known to the server | `ORG.TIME_ZONE_INVALID` |
| VR-02-011 | Branch.TimeZone change | No `Open` cash session in branch | `ORG.TIME_ZONE_CHANGE_BLOCKED` (409) |
| VR-02-012 | Branch.Governorate / City / AddressLine | Required; Governorate from the 27-governorate reference list; City 2–100; AddressLine 5–250 | `ORG.ADDRESS_INVALID` |
| VR-02-013 | Branch.LicenseExpiryDate | Optional; valid date; no range restriction (stored unverified) | `ORG.LICENSE_FIELDS_INVALID` |
| VR-02-014 | Branch settings numeric values | Within ranges of §8.4 | `ORG.SETTING_OUT_OF_RANGE` |
| VR-02-015 | DoNotSellWindowDays vs NearExpiryThresholdDays | `DoNotSellWindowDays ≤ NearExpiryThresholdDays` | `ORG.SETTING_CONFLICT` |
| VR-02-016 | DefaultTaxCategoryId | Must reference an `Active` TaxCategory of the same organization | `COMMON.REFERENCE_NOT_FOUND` |
| VR-02-017 | Branch assignments | Each branch must be `Active` and belong to caller's organization | `ORG.ASSIGNMENT_BRANCH_INVALID` |
| VR-02-018 | Branch assignments | `AssignedBranches` scope requires ≥ 1 branch; exactly one default; default ∈ assigned set | `ORG.ASSIGNMENT_DEFAULT_INVALID` |
| VR-02-019 | Owner scope | Owner user scope must remain `AllBranches` | `ORG.OWNER_SCOPE_FIXED` |
| VR-02-020 | Support grant duration | Integer hours 1–72 | `ORG.SUPPORT_GRANT_DURATION_INVALID` |
| VR-02-021 | Support grant platform admin | Email must identify an active platform administrator; unknown emails return the same error | `ORG.SUPPORT_GRANT_GRANTEE_INVALID` |
| VR-02-022 | Support grant reason / suspension reason / deactivation reason | 10–500 characters | `ORG.REASON_REQUIRED` |
| VR-02-023 | Provisioning owner email | Not already used by any user in the platform | `ORG.OWNER_EMAIL_IN_USE` (409) |
| VR-02-024 | Organization status transition | Suspend only from `Active`; reactivate only from `Suspended` | `ORG.INVALID_STATUS_TRANSITION` (409) |
| VR-02-025 | Branch status transition | Deactivate only from `Active`; reactivate only from `Inactive` | `ORG.INVALID_STATUS_TRANSITION` (409) |
| VR-02-026 | Support grant uniqueness | No other `Active` grant for the same (organization, platform administrator) | `ORG.SUPPORT_GRANT_ALREADY_ACTIVE` (409) |

Field-level validation failures return 422 `COMMON.VALIDATION_FAILED` with field codes in `errors`; conflict-type rules return 409 with the listed code as the top-level `code`.

## 10. API Requirements

### 10.1 Endpoints

| Method | Path | Purpose | Permission | Idempotency |
|---|---|---|---|---|
| POST | `/api/v1/platform/organizations` | Provision organization | `org.platform-organizations.provision` | Required |
| GET | `/api/v1/platform/organizations` | List organization metadata (paged; filter `status`, `search`) | `org.platform-organizations.read` | No |
| GET | `/api/v1/platform/organizations/{organizationId}` | View organization metadata | `org.platform-organizations.read` | No |
| POST | `/api/v1/platform/organizations/{organizationId}/suspend` | Suspend organization | `org.platform-organizations.suspend` | No (state-guarded) |
| POST | `/api/v1/platform/organizations/{organizationId}/reactivate` | Reactivate organization | `org.platform-organizations.suspend` | No (state-guarded) |
| GET | `/api/v1/platform/support-grants` | List grants issued to the calling platform administrator | `org.platform-organizations.read` | No |
| POST | `/api/v1/platform/support-sessions` | Start support session from a grant; returns support access token | `org.platform-organizations.read` + active grant | No |
| GET | `/api/v1/organization` | View organization profile | `org.organization.read` | No |
| PUT | `/api/v1/organization` | Update organization profile (`If-Match`) | `org.organization.update` | No |
| GET | `/api/v1/organization/settings` | View organization settings | `org.organization.read` | No |
| PUT | `/api/v1/organization/settings` | Update organization settings (`If-Match`) | `settings.organization.manage` | No |
| GET | `/api/v1/branches` | List branches in caller scope (filter `status`) | `org.branches.read` | No |
| POST | `/api/v1/branches` | Create branch | `org.branches.create` | No |
| GET | `/api/v1/branches/{branchId}` | View branch | `org.branches.read` | No |
| PUT | `/api/v1/branches/{branchId}` | Update branch (`If-Match`) | `org.branches.update` | No |
| GET | `/api/v1/branches/{branchId}/deactivation-check` | Evaluate deactivation preconditions | `org.branches.deactivate` | No |
| POST | `/api/v1/branches/{branchId}/deactivate` | Deactivate branch | `org.branches.deactivate` | No (state-guarded) |
| POST | `/api/v1/branches/{branchId}/reactivate` | Reactivate branch | `org.branches.deactivate` | No (state-guarded) |
| GET | `/api/v1/branches/{branchId}/settings` | View branch settings | `org.branches.read` | No |
| PUT | `/api/v1/branches/{branchId}/settings` | Update branch settings (`If-Match`) | `settings.branch.manage` | No |
| GET | `/api/v1/branches/{branchId}/document-sequences` | View sequences (filter `year`) | `settings.branch.manage` | No |
| GET | `/api/v1/me/branches` | Accessible branches of caller with default flag | Authenticated | No |
| GET | `/api/v1/users/{userId}/branch-assignments` | View a user's scope and assignments | `identity.users.read` | No |
| PUT | `/api/v1/users/{userId}/branch-assignments` | Replace a user's scope and assignments (`If-Match`) | `org.branch-assignments.manage` | No |
| GET | `/api/v1/support-grants` | List support grants (filter `status`) | `org.support-grants.manage` | No |
| POST | `/api/v1/support-grants` | Create support grant | `org.support-grants.manage` | No |
| POST | `/api/v1/support-grants/{grantId}/revoke` | Revoke support grant | `org.support-grants.manage` | No (state-guarded) |
| GET | `/api/v1/support-grants/{grantId}/activity` | Support session activity (cursor paged) | `org.support-grants.manage` | No |

Provisioning is added to the `Idempotency-Key` REQUIRED list because it creates multiple aggregates and an outgoing invitation.

### 10.2 Internal module facade (consumed in-process by other modules)

| Operation | Consumers | Contract |
|---|---|---|
| `GetBranchContext(branchId)` | All | Returns status, time zone, current business date, code; 404 semantics if not in organization |
| `GetEffectiveBranchSettings(branchId)` | SPEC-04, 06, 08, 09, 10 | Effective values per §8.4 |
| `AllocateDocumentNumber(branchId, documentType, businessDate)` | SPEC-04, 05, 06 | Must be called inside the caller's open database transaction; returns formatted number |
| `CheckTransferRoute(sourceBranchId, destinationBranchId)` | SPEC-04 | FR-02-031 |
| `CheckTransferApprover(transferRequesterId, approverUserId, sourceBranchId, destinationBranchId)` | SPEC-04 | FR-02-032 |
| `GetReportingScope(userId)` | SPEC-09 | Returns `AllBranches` or list of branch ids, plus whether organization-level reports are allowed |
| `AssertBranchWritable(branchId)` | All posting workflows | Throws `ORG.BRANCH_INACTIVE` for `Inactive` branch |

### 10.3 Examples

Provisioning request:

```json
{
  "organization": {
    "nameAr": "صيدليات النيل",
    "nameEn": "Nile Pharmacies",
    "legalName": "Nile Pharmacies LLC",
    "taxRegistrationNumber": "123456789",
    "phone": "+20225550000",
    "email": "info@nile-pharma.example"
  },
  "firstBranch": {
    "code": "CAI01",
    "nameAr": "فرع مدينة نصر",
    "nameEn": "Nasr City Branch",
    "governorate": "Cairo",
    "city": "Nasr City",
    "addressLine": "12 Abbas El Akkad St.",
    "phone": "+20222220000",
    "timeZone": "Africa/Cairo"
  },
  "owner": { "fullName": "Ahmed Hassan", "email": "owner@nile-pharma.example", "preferredLanguage": "ar" }
}
```

Response `201 Created`:

```json
{ "organizationId": "0192f0a4-...", "branchId": "0192f0a4-...", "ownerUserId": "0192f0a4-...", "ownerStatus": "Invited" }
```

Deactivation blocked `409`:

```json
{
  "type": "https://errors.pharmacy.example/org/branch-deactivation-blocked",
  "title": "Branch cannot be deactivated",
  "status": 409,
  "code": "ORG.BRANCH_DEACTIVATION_BLOCKED",
  "traceId": "00-...",
  "errors": {
    "preconditions": [
      { "code": "ORG.BRANCH_HAS_OPEN_CASH_SESSIONS", "message": "1 open cash session" },
      { "code": "ORG.BRANCH_HAS_STOCK", "message": "On-hand quantity 1,240 base units in 37 batches" }
    ]
  }
}
```

## 11. Authorization Requirements

### 11.1 General

- Effective access follows DOCUMENTATION-CONVENTIONS §5.3: permission AND branch scope AND organization match. All checks are server-side (BR-G-17).
- Order of checks for branch-scoped routes: (1) authentication → 401; (2) organization status `Suspended` → 403 `ORG.ORGANIZATION_SUSPENDED`; (3) `branchId` not in caller's organization → 404 `COMMON.NOT_FOUND`; (4) permission missing → 403 `COMMON.FORBIDDEN`; (5) branch outside scope → 403 `COMMON.FORBIDDEN`; (6) business rules.
- Organization-level routes (`/api/v1/organization`, `/api/v1/branches` list, `/api/v1/users/...`) check permission only; returned data is filtered to scope.
- Platform routes (`/api/v1/platform/...`) accept only platform tokens; organization tokens receive 403 `COMMON.FORBIDDEN`.

### 11.2 Tenant isolation mechanics

The isolation design is layered so that a single defect in one layer does not expose another organization's data (ADR-002).

| Layer | Mechanism | Failure behavior |
|---|---|---|
| L1 Token | The access token (ADR-005) carries `org_id`, `sub`, and (support sessions only) `support_grant_id`. Signature, issuer, audience, and lifetime are validated before any handler. | Invalid/missing token → 401 `COMMON.UNAUTHENTICATED`. |
| L2 Request organization context | A per-request organization context is populated from `org_id` only (FR-02-001). It is immutable for the request. Platform tokens produce a "platform" context with no organization. | Tenant-owned endpoint with no organization context → 404 `COMMON.NOT_FOUND`; no query executed. |
| L3 Organization status | Organization status is checked per request from a cache (TTL ≤ 60 s, invalidated on change). | `Suspended` → 403 `ORG.ORGANIZATION_SUSPENDED`. |
| L4 EF Core global query filters | Every entity carrying `OrganizationId` is filtered by the current organization. Filter bypass is permitted only in allow-listed platform components (organization metadata listing, provisioning, cross-organization maintenance jobs); an architecture test enforces both the presence of filters and the allowlist (FR-02-002). | Cross-organization rows are invisible → handler produces 404. |
| L5 Write stamping | A SaveChanges interceptor stamps `OrganizationId` on inserts and aborts the transaction when any tracked tenant-owned row's `OrganizationId` ≠ context (FR-02-003). | Transaction rolled back; 500 with `COMMON.TENANT_MISMATCH` logged as a security event (not exposed in detail to client). |
| L6 Raw SQL | Any raw SQL / Dapper query must include an explicit `organization_id` predicate; code review checklist plus RLS as backstop. | RLS returns zero rows. |
| L7 PostgreSQL RLS | Each tenant-owned table has an RLS policy `organization_id = current_setting('app.organization_id')::uuid` for SELECT/INSERT/UPDATE/DELETE. The application sets `app.organization_id` with `SET LOCAL` at the start of each database transaction. The application role is not table owner and lacks `BYPASSRLS`; migrations run under a separate role. Platform components use a dedicated role/connection with explicit, audited cross-organization queries (FR-02-007). Enabled and forced from Phase 0 / MVP (ADR-002 amended 2026-11-10, OD-02-08). | Missing setting → zero rows / insert rejected. |
| L8 Asynchronous work | Hangfire jobs, outbox messages, and integration events carry `OrganizationId`; the job runner establishes the organization context before execution. Jobs iterating over organizations open one context per organization. | Job without context fails before touching data (FR-02-005). |
| L9 Real-time & cache & files | SignalR groups are named with organization id and joined only from the server using token claims; cache keys are prefixed with organization id; file objects are authorized through their owning record before a pre-signed URL is generated. | Join/lookup outside organization denied. |
| L10 Verification | Cross-organization isolation suite (FR-02-006, CS-08) runs in CI on every merge; unclassified routes fail the build. | Build fails. |

Cross-organization response contract: for any identifier belonging to another organization, the response status, `code`, `title`, and `type` are identical to those of a random non-existent UUID, and response time difference between the two cases is not used as a design guarantee (see §17).

### 11.3 Support session permission set

The support access token carries every `*.read` permission of the canonical list and `audit.logs.read`, `inventory.movements.read`, `reports.sales.read`, `reports.inventory.read`, `reports.finance.read`, `reports.organization.read`, **except** `patients.profiles.read`, `patients.medical.read`, `prescriptions.prescriptions.read`, and all export permissions (`reports.export`, `catalog.medicines.export`, `patients.data.export`). Branch scope is `AllBranches`. Any other method than GET/HEAD returns 403 `ORG.SUPPORT_ACCESS_READ_ONLY` (OD-02-04).

## 12. Error Handling

All errors use RFC 9457 Problem Details with `code`, `traceId`, `errors` and localized `message` (ar/en).

| HTTP | Code | When |
|---|---|---|
| 401 | `COMMON.UNAUTHENTICATED` | Missing/invalid token |
| 403 | `COMMON.FORBIDDEN` | Permission missing or branch outside scope (own organization) |
| 403 | `ORG.ORGANIZATION_SUSPENDED` | Organization suspended (login and all API calls) |
| 403 | `ORG.ASSIGNMENT_OUT_OF_SCOPE` | BR-02-009 violation |
| 403 | `ORG.TRANSFER_APPROVER_NOT_ELIGIBLE` | FR-02-032 |
| 403 | `ORG.SUPPORT_GRANT_INACTIVE` | Grant expired/revoked or no active grant at session start |
| 403 | `ORG.SUPPORT_ACCESS_READ_ONLY` | Write attempted in support session |
| 404 | `COMMON.NOT_FOUND` | Unknown id or id of another organization |
| 400 | `COMMON.IDEMPOTENCY_KEY_REQUIRED` | `Idempotency-Key` missing on provisioning |
| 409 | `ORG.BRANCH_CODE_DUPLICATE`, `ORG.BRANCH_CODE_IMMUTABLE`, `ORG.TIME_ZONE_CHANGE_BLOCKED`, `ORG.BRANCH_DEACTIVATION_BLOCKED`, `ORG.BRANCH_INACTIVE`, `ORG.INVALID_STATUS_TRANSITION`, `ORG.OWNER_EMAIL_IN_USE`, `ORG.SUPPORT_GRANT_ALREADY_ACTIVE` | Conflicts |
| 412 | `COMMON.PRECONDITION_FAILED` | `If-Match` mismatch |
| 422 | `COMMON.VALIDATION_FAILED` | Field validation (field codes per §9) |
| 422 | `COMMON.REFERENCE_NOT_FOUND` | Body references a resource not in the organization |
| 422 | `ORG.TRANSFER_ROUTE_NOT_ALLOWED` | FR-02-031 |
| 422 | `COMMON.IDEMPOTENCY_KEY_REUSED` | Same key, different provisioning payload |
| 428 | `COMMON.PRECONDITION_REQUIRED` | `If-Match` header missing on update |
| 500 | `COMMON.TENANT_MISMATCH` (logged only; client sees generic `COMMON.INTERNAL_ERROR`) | L5 write-stamping violation |

## 13. Edge Cases

| # | Case | Expected behavior |
|---|---|---|
| E-01 | Posting crosses midnight in branch time zone (e.g., starts 23:59:59 Cairo, commits 00:00:01) | Year/business date is taken at allocation time inside the transaction; a document posted on 1 January gets the new year sequence starting at 000001. |
| E-02 | Two branches of different organizations both use code `CAI01` | Allowed; uniqueness is per organization. Document numbers are unique per organization+branch. |
| E-03 | Time zone change requested while a cash session is open | Rejected `ORG.TIME_ZONE_CHANGE_BLOCKED`. |
| E-04 | User's only assigned branch is deactivated | User remains `Active`; `/me/branches` returns empty list; branch-scoped calls 403; deactivation response lists affected users (count and ids). |
| E-05 | Owner tries to deactivate the only active branch | 409 `ORG.BRANCH_DEACTIVATION_BLOCKED` with `ORG.LAST_ACTIVE_BRANCH`. |
| E-06 | Stock arrives in a branch (transfer received) between deactivation check and deactivate | Deactivate re-evaluates preconditions inside its transaction with locks on the branch row; returns 409 if failing. |
| E-07 | Support grant expires during a support session | The next request after `ExpiresAt` returns 403 `ORG.SUPPORT_GRANT_INACTIVE` even if token lifetime remains. |
| E-08 | Owner revokes and re-creates a grant for the same admin | Allowed; the earlier grant stays `Revoked`; the new grant has a new id. |
| E-09 | Organization suspended while a sale is being posted | The in-flight transaction completes or fails atomically; subsequent requests return 403. |
| E-10 | Provisioning repeated with same Idempotency-Key after a timeout | Same 201 response replayed; no duplicate organization. |
| E-11 | `DoNotSellWindowDays` raised above `NearExpiryThresholdDays` in the same request as lowering `NearExpiryThresholdDays` | Validation uses the final values of the request; rejected if final `DoNotSellWindowDays > NearExpiryThresholdDays`. |
| E-12 | Manager removes their own last branch assignment | Rejected by VR-02-018 if scope is `AssignedBranches` and the resulting set is empty. |
| E-13 | Platform admin who also has an organization account | Not supported; one identity is either platform or organization (A: candidate assumption). |
| E-14 | Document sequence above 999,999 | Continues as 1000000 (7 digits). |

## 14. Acceptance Criteria

| ID | Criterion |
|---|---|
| SAC-02-01 | The isolation suite covers 100% of tenant-owned routes, and every cross-organization call returns 404/422 with zero leaked fields (CS-08). |
| SAC-02-02 | A user assigned only to branch A receives 403 on every branch-scoped endpoint of branch B of the same organization (CS-07). |
| SAC-02-03 | Provisioning creates exactly one organization, one branch, six system roles, one invited Owner, and default settings, atomically and idempotently. |
| SAC-02-04 | Branch create/update enforces code, address, phone, and time zone rules; code is immutable after first document number. |
| SAC-02-05 | Deactivation is blocked by each precondition in BR-02-007 and succeeds when all pass; inactive branches reject new documents. |
| SAC-02-06 | Branch settings are validated against §8.4, audited, and visible to consuming modules within 5 s. |
| SAC-02-07 | Under 20 concurrent postings × 500 documents per branch/type, numbers are unique, gapless, and rollbacks consume no number. |
| SAC-02-08 | Assignment changes take effect within 5 s and Managers cannot exceed their own scope. |
| SAC-02-09 | Suspension blocks all organization users within 60 s and reactivation restores access without data change. |
| SAC-02-10 | Support sessions are read-only, exclude patient/prescription data and exports, stop at expiry/revocation, and every request is audited. |

## 15. Dependencies

| Dependency | Direction | Detail |
|---|---|---|
| SPEC-01 Identity & Access | Inbound/outbound | Token claims (`org_id`, `support_grant_id`), user/role creation at provisioning, invitation, refresh token revocation on suspension, platform administrator identities, login rejection for suspended organizations. |
| SPEC-03 Catalog | Outbound | `TaxCategory` for `DefaultTaxCategoryId`. |
| SPEC-04 Inventory | Outbound | Consumes transfer route/approver policies, branch settings, document numbers; provides precondition counts (stock, transfers, pending adjustments/stocktakes). |
| SPEC-05 Procurement | Outbound | Consumes document numbers; provides draft goods receipt count. |
| SPEC-06 Sales | Outbound | Consumes settings and document numbers; provides open cash session count. |
| SPEC-09 Reporting | Outbound | Consumes reporting scope policy. |
| SPEC-10 Audit/Settings/Notifications | Outbound | Audit log writes, settings UI framework, notifications for support grant events. |
| ADR-002 | — | Multi-tenancy design. |

## 16. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-02-001 | Isolation suite: 0 cross-organization data exposures; 100% of registered tenant-owned routes classified and tested on every CI run; suite runtime ≤ 10 minutes. |
| NFR-02-002 | Organization context + branch scope resolution adds ≤ 5 ms p95 per request (cache hit ratio ≥ 95%). |
| NFR-02-003 | Document number allocation adds ≤ 20 ms p95 to the posting transaction with 20 concurrent postings per branch and document type; 0 duplicates and 0 gaps in a 10,000-posting concurrency test with 10% forced rollbacks. |
| NFR-02-004 | Provisioning completes in ≤ 3 s p95 (excluding email delivery). |
| NFR-02-005 | Branch settings and assignment changes visible to all modules ≤ 5 s after commit; suspension and grant revocation effective ≤ 60 s after commit. |
| NFR-02-006 | Enabling RLS increases p95 latency of NFR-G-02 and NFR-G-03 benchmarks by ≤ 10%. |
| NFR-02-007 | Branch list, branch settings, and `/me/branches` p95 ≤ 300 ms for an organization with 50 branches and 1,000 users. |
| NFR-02-008 | 100% of support-session requests produce an audit entry in the same request; verified by test comparing request count to audit count. |

## 17. Security and Privacy Considerations

- Cross-organization existence is never revealed (404 with identical body). Branch existence inside the caller's own organization may be revealed by 403; this is accepted because branches are not secret within an organization.
- Organization identifiers are UUIDv7 and are not enumerable in practice; nevertheless, security relies on L2–L7, not on unguessability.
- Platform administrators never receive patient or prescription data, even in support sessions (BR-02-017; REG-04 pending for any future change).
- Support grants, suspensions, provisioning, branch deactivation, settings changes, and assignment changes are sensitive operations and write audit entries in the same transaction (BR-G-16).
- Filter bypass and the platform database role are restricted to allow-listed components and covered by architecture tests; their use is logged with `organizationId` of each accessed organization.
- Logs include `organizationId`, `branchId`, `userId` (NFR-G-10); support-session logs include `supportGrantId`.
- Tax registration, commercial registration, and license values are business identifiers, not personal data; owner contact data is personal data handled per REG-04.

## 18. Testing Considerations

| Area | Approach |
|---|---|
| Isolation (CS-08) | Two-organization fixture; reflection over registered routes; each route classified as tenant-owned branch-scoped, tenant-owned org-level, platform, or anonymous; generated requests with organization B ids under organization A token; assert 404/422 and absence of organization B ids/names in response bodies. |
| Cross-branch (CS-07) | Fixture: one organization, branches A and B, users assigned to A only; generated calls to every branch-scoped route with branch B id → 403. |
| RLS | Integration tests against real PostgreSQL (Testcontainers): query without `app.organization_id` returns 0 rows; insert with mismatched organization rejected. |
| Numbering | Concurrency test with parallel posting transactions and forced rollbacks; verify gapless sets per (branch, type, year); year rollover test with fake clock in `Africa/Cairo`. |
| Architecture tests | Entity filter presence, filter-bypass allowlist, facade-only cross-module access. |
| Provisioning | Fault injection at each step to verify full rollback; idempotent replay. |
| Policies | Table-driven tests for transfer route, approver, and reporting scope. |

## 19. Open Decisions

| ID | Decision needed | Default until decided |
|---|---|---|
| OD-02-01 | Offer self-service public organization sign-up (adds an unauthenticated endpoint to NFR-G-07) or keep platform-admin provisioning only. | Platform-admin provisioning and bootstrap command only. |
| OD-02-02 | Whether write-offs (`WOF`) and stocktakes (`STK`) receive BR-G-24 document numbers. | Not numbered; referenced by id. |
| OD-02-03 | Allow a configurable starting number per sequence for pharmacies migrating mid-year from another system. | All sequences start at 1. |
| OD-02-04 | Whether an Owner may opt in to include patient/prescription data in a support grant. | Always excluded. |
| OD-02-05 | Default `TransferApproverScope`. | `Source`. |
| OD-02-06 | Default `AdjustmentApprovalThresholdAmount` value. | 1,000.00 EGP. |
| OD-02-07 | Tax registration number format validation (length 9 digits assumed). | Digits only, 9 digits; to be confirmed with REG-07 review. |
| OD-02-08 | Enable RLS in MVP rather than in the security-hardening phase. | **Resolved 2026-11-10:** RLS is enabled from Phase 0 and is part of the MVP (ADR-002 amended). |
| OD-02-09 | Allow users to view sellable quantities in branches outside their scope (e.g., "available at other branches" at POS). | Not allowed. |
| OD-02-10 | Calendar year vs fiscal year for document numbering. | Calendar year of branch business date. |
| OD-02-11 | Default `PricesIncludeTax`. | true; pending REG-06. Scope resolved 2026-11-10: organization-level (SPEC-06), not per branch. |

## 20. Regulatory Review Items

- REG-04 — Owner contact data and support access scope (platform administrator access to organization data; data residency of the shared database).
- REG-05 — Retention of organization, branch, and audit records after suspension or deactivation.
- REG-06 — Tax defaults per branch (`DefaultTaxCategoryId`, `PricesIncludeTax`).
- REG-07 — Tax registration number format and document numbering requirements for electronic invoicing/receipts.
- REG-08 — Pharmacy license fields (per branch) and any licensed pharmacist presence requirement per branch.
