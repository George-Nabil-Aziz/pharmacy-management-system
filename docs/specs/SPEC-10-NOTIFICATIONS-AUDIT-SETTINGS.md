# SPEC-10: Notifications, Audit & Settings

**Version:** 1.0 (2026-11-09)
**Status:** Draft for review
**Owner:** Platform team (cross-cutting services)
**Related ADRs:** ADR-001 (modular monolith), ADR-002 (multi-tenancy), ADR-006 (files), ADR-007 (background jobs), ADR-008 (audit), ADR-009 (localization), ADR-010 (frontend state)
**Related BRQs:** BRQ-01, BRQ-02, BRQ-08, BRQ-11, BRQ-12, BRQ-13, BRQ-14, BRQ-15

---

## 1. Purpose

This specification defines the cross-cutting platform services used by every other module:

1. **Notifications** — in-app notification center, real-time delivery over SignalR, notification rules, de-duplication, digest and email channels, and (P3) customer refill reminders.
2. **Audit** — the authoritative **sensitive-operation catalog** referenced by BR-G-16, the append-only per-organization hash-chained `AuditLog`, chain verification, audit search/export, API action logs, and (P2) suspicious-activity reporting.
3. **Settings** — the settings storage and validation framework, effective-value resolution (organization → branch), organization settings, branch settings framework, user preferences, localization (Arabic/English, RTL/LTR, digits, formats), and themes (light/dark/system).
4. **Operations visibility** — health endpoints, background job status, backup status, restore drill records, and (P3) per-organization data export.

## 2. Business Context

Egyptian community pharmacies and pharmacy chains operate with mixed-skill staff, frequent shift changes, and high exposure to stock loss, expiry loss, and cash discrepancies. Owners need (a) proactive alerts so that stock-outs and expiries are acted on before they cost money (BRQ-11), (b) a tamper-evident record of who did what, where, and when (BRQ-12), and (c) a system that works natively in Arabic (RTL) and English (LTR) with locale-correct numbers and dates (BRQ-13). As a multi-tenant SaaS, the operator also needs visibility into platform health, background jobs, and backups (BRQ-14) without accessing organization business data (BR-G-17, §5.1 of the conventions).

## 3. Scope

| Area | In scope |
|---|---|
| Notifications | Notification persistence, recipient resolution, notification type catalog (§8.2), default rules, rules management per type per branch, de-duplication (low stock ≤ 1 per medicine per branch per 24 h), notification center API and UI (unread count, mark read, mark all read, dismiss), 90-day retention purge, SignalR hub `/hubs/notifications` with organization/branch/user groups, reconnect catch-up via API, platform system notifications (maintenance, release notes), email channel via provider abstraction (P2), daily digest (P2), customer SMS/WhatsApp refill reminders with consent (P3). |
| Audit | Sensitive-operation catalog (§8.3), same-transaction audit write, before/after diff, append-only enforcement, per-organization hash chain sealing and verification (nightly + on demand), audit search/filter/detail, audit export, API action log, suspicious-activity reports (P2). |
| Settings | Settings registry, typed validation, organization and branch settings storage, effective-value resolution with source indicator, change audit, organization settings (§8.4), branch settings framework (values owned by SPEC-02/04/06), user preferences (language, theme). |
| Localization & themes | i18next namespaces, key parity, RTL/LTR mirroring rules, digit style, date/time/number/currency formatting, bilingual medicine-name display, localized backend error messages with stable codes, light/dark/system theme with WCAG 2.2 AA contrast. |
| Operations | `/health/live`, `/health/ready`, platform health details, background job status page, backup status, restore drill records, per-organization data export (P3). |

## 4. Out of Scope

- Business logic that raises events (low-stock calculation, expiry scan, reconciliation, OCR) — owned by SPEC-04, SPEC-05, SPEC-06, SPEC-08; this spec consumes their integration events.
- The values and business meaning of branch operating settings (time zone, near-expiry threshold, do-not-sell window, approval thresholds) — defined in SPEC-02, SPEC-04, SPEC-06. This spec owns storage, validation framework, resolution, and change audit only.
- `PatientAccessLog` structure and patient consent capture — owned by SPEC-07 (this spec consumes consent for P3 reminders and mirrors medical-data reads into `AuditLog`).
- Backup execution (daily full backups, WAL archiving/PITR) — defined in the deployment architecture; this spec covers visibility and drill records only.
- **Single-organization restore within the shared database — not supported in v1** (see OD-10-01).
- Navigation-level (page view / click) user activity tracking.
- Push notifications to mobile devices, browser Web Push, in-app chat.
- Hijri calendar display.
- Languages other than Arabic and English.

## 5. Actors and Permissions

### 5.1 Actors

| Actor | Description |
|---|---|
| Owner (`OWNER`) | Organization-wide; manages organization settings, rules, audit access, exports. |
| Branch Manager (`MANAGER`) | Manages branch settings and branch notification rules; reads audit for assigned branches. |
| Pharmacist, Cashier, Inventory Staff, Accountant | Receive notifications according to rules; manage own preferences. |
| Platform administrator (`PLATFORM_ADMIN`) | Publishes system notifications; views health, jobs, backups; records restore drills. No organization business data access (support grants per SPEC-02). |
| System (background jobs, outbox consumers) | Creates notifications, seals audit chain, runs verification, purges expired notifications. Recorded with `ActorType = System`. |

### 5.2 Permissions used

Canonical permissions from the conventions: `notifications.read`, `notifications.rules.manage`, `audit.logs.read`, `settings.organization.manage`, `settings.branch.manage`.

**New permissions introduced by this spec** (format `<module>.<resource>.<action>`):

| Permission | Purpose | Default roles |
|---|---|---|
| `audit.logs.export` | Export audit log search results | `OWNER` |
| `audit.chain.verify` | Trigger and read audit chain verification | `OWNER` |
| `audit.reports.read` | Read suspicious-activity reports (P2) | `OWNER` |
| `notifications.customer.manage` | View customer notification log and resend/cancel reminders (P3) | `OWNER`, `MANAGER` |
| `notifications.system.manage` | Publish/withdraw platform system notifications (platform scope) | `PLATFORM_ADMIN` |
| `settings.operations.read` | View health details, job status, backup status, restore drills (platform scope) | `PLATFORM_ADMIN` |
| `settings.operations.manage` | Record restore drills, retry failed platform jobs (platform scope) | `PLATFORM_ADMIN` |
| `settings.data-export.manage` | Request/download per-organization data export (P3) | `OWNER` |

### 5.3 Default role mapping for this spec

| Permission | OWNER | MANAGER | PHARMACIST | CASHIER | INVENTORY | ACCOUNTANT |
|---|---|---|---|---|---|---|
| `notifications.read` | Y | Y | Y | Y | Y | Y |
| `notifications.rules.manage` | Y | Y (assigned branches) | – | – | – | – |
| `audit.logs.read` | Y | Y (assigned branches) | – | – | – | – |
| `audit.logs.export` | Y | – | – | – | – | – |
| `audit.chain.verify` | Y | – | – | – | – | – |
| `audit.reports.read` | Y | – | – | – | – | – |
| `settings.organization.manage` | Y | – | – | – | – | – |
| `settings.branch.manage` | Y | Y (assigned branches) | – | – | – | – |
| `notifications.customer.manage` | Y | Y | – | – | – | – |
| `settings.data-export.manage` | Y | – | – | – | – | – |

User preferences (`/api/v1/me/preferences`) require authentication only; a user can only read and change their own preferences.

## 6. Functional Requirements

| ID | Requirement | Priority | BRQ | Stories |
|---|---|---|---|---|
| FR-10-001 | The system shall write an `AuditLog` entry for every operation listed in the sensitive-operation catalog (§8.3) in the same database transaction as the business change, and shall roll back the business change if the audit insert fails. | P0 | BRQ-12 | US-10-01 |
| FR-10-002 | The system shall capture on every audit entry: event code, category, organization, branch (nullable), actor user id, actor type (`User`, `System`, `PlatformAdmin`, `SupportGrant`), support grant id (when applicable), entity type, entity id, outcome (`Succeeded`/`Failed`), client IP address, user agent (truncated to 512 characters), correlation id (= request `traceId`), and `OccurredAt` in UTC with microsecond precision. | P0 | BRQ-12 | US-10-01 |
| FR-10-003 | The system shall store, for update-type audit events, a field-level diff `{field: {before, after}}` of changed fields only; secrets (password hashes, tokens, reset codes, signing keys) shall never be stored, and patient medical field values shall be stored as SHA-256 hashes rather than plaintext (OD-10-04). | P0 | BRQ-12, BRQ-08 | US-10-01 |
| FR-10-004 | The system shall enforce append-only `AuditLog` at the database level: the application database role shall have only `INSERT` and `SELECT` on `platform.audit_logs`, and a trigger shall reject any `UPDATE` other than setting the seal columns (`ChainSequence`, `PreviousHash`, `Hash`, `SealedAt`) from NULL by the sealer role, and shall reject every `DELETE`. | P0 | BRQ-12 | US-10-01, US-10-03 |
| FR-10-005 | The system shall provide no application function, API, or scheduled job that deletes or purges `AuditLog` entries; retention periods are pending REG-05 (BR-G-34). | P0 | BRQ-12 | US-10-01 |
| FR-10-006 | The system shall maintain the sensitive-operation catalog as a code-defined registry of event codes (exposed by `GET /api/v1/audit/event-types` with localized names), shall reject at write time any audit event code not present in the registry, and the build shall fail when any registered event code lacks at least one integration test asserting its emission. | P0 | BRQ-12 | US-10-02 |
| FR-10-007 | The system shall record a `PATIENTS.MEDICAL_DATA_READ` audit entry (patient id, data sections read, purpose code if provided) for every API response that returns patient medical data or prescription content, written in a transaction committed before the response is sent; if the entry cannot be written the request shall fail with HTTP 503 and no medical data shall be returned (BR-G-29). | P0 | BRQ-08, BRQ-12 | US-10-02 |
| FR-10-008 | The system shall record an `ORG.SUPPORT_ACCESS_USED` audit entry for every API request executed under a support access grant, including grant id, platform administrator id, HTTP method, route template, and response status. | P0 | BRQ-12 | US-10-02 |
| FR-10-009 | The system shall seal committed audit entries into a hash chain per chain key (organization id, or `platform` for platform-level events) by assigning a gapless `ChainSequence` starting at 1, `PreviousHash` (64 zeros for sequence 1), and `Hash` = SHA-256 of the canonical serialization (§8.5) concatenated with `PreviousHash`; p95 sealing lag shall be ≤ 60 s after commit. | P0 | BRQ-12 | US-10-03 |
| FR-10-010 | The system shall verify each organization's chain nightly (02:30 `Africa/Cairo`) from the last verified checkpoint and on demand via `POST /api/v1/audit/chain/verifications` (permission `audit.chain.verify`, at most one running verification per organization), recording each run in `AuditChainVerification` with range verified, entries checked, result, and first failing sequence. | P0 | BRQ-12 | US-10-03 |
| FR-10-011 | When verification detects a mismatch, gap, or unsealed entry older than 15 minutes, the system shall record `AUDIT.CHAIN_VERIFICATION_FAILED` (platform chain and organization chain), create an `AUDIT_CHAIN_INTEGRITY_FAILURE` notification for all active Owners of the organization, and raise a platform operations alert within 5 minutes of detection. | P0 | BRQ-12, BRQ-14 | US-10-03 |
| FR-10-012 | The system shall provide audit search `GET /api/v1/audit/logs` with filters: date range (required, maximum 366 days), event codes, category, actor user, actor type, branch, entity type + entity id, correlation id, outcome; cursor pagination (`limit` default 50, max 200) ordered newest first; and an entry detail endpoint returning the diff, metadata, and seal status (`Unsealed`, `Sealed`, `Verified`). | P0 | BRQ-12 | US-10-04 |
| FR-10-013 | The system shall restrict audit search results to entries of the caller's organization; callers without organization-wide scope shall see only entries whose `BranchId` is in their assigned branches and shall not see entries with a null `BranchId`. | P0 | BRQ-12, BRQ-02 | US-10-04 |
| FR-10-014 | The system shall export audit search results asynchronously as CSV (UTF-8 with BOM) or JSON Lines, up to 1,000,000 entries per export, store the file as a `FileObject` downloadable via a pre-signed URL valid for 24 h, record `AUDIT.LOGS_EXPORTED` with the filter used, and notify the requester with an `EXPORT_READY` notification. | P1 | BRQ-12 | US-10-05 |
| FR-10-015 | The system shall record an `ApiActionLog` entry for every authenticated `POST`, `PUT`, `PATCH`, and `DELETE` API request capturing timestamp, organization, branch (from route), user, HTTP method, route template, response status, duration in ms, correlation id, IP, and user agent, excluding request/response bodies and query string values; entries are written asynchronously in batches with at most 5 s of entries at risk on process crash. | P1 | BRQ-01, BRQ-12 | US-10-06 |
| FR-10-016 | The system shall provide `GET /api/v1/audit/activity` (permission `audit.logs.read`, same branch scoping as FR-10-013) filtered by user, date range (≤ 31 days), status class, and route template, and shall retain API action logs for 180 days by dropping monthly partitions older than the retention period. | P1 | BRQ-01 | US-10-06 |
| FR-10-017 | The system shall evaluate suspicious-activity rules daily per branch business date — voids per cashier above `SuspiciousVoidsPerCashierPerDay`, discount overrides per approver or per cashier above `SuspiciousDiscountOverridesPerDay`, successful logins inside the after-hours window (`AuditAfterHoursStart`–`AuditAfterHoursEnd`, branch time zone), and ≥ 5 failed logins for one user within 15 minutes — expose results at `GET /api/v1/audit/reports/suspicious-activity` (permission `audit.reports.read`) with links to source audit entries, and create one `SUSPICIOUS_ACTIVITY_DETECTED` notification per organization per business date when ≥ 1 finding exists. | P2 | BRQ-12 | US-10-07 |
| FR-10-018 | The system shall persist each notification as a `Notification` (type, severity `Info`/`Warning`/`Critical`, organization, branch nullable, title and body localization keys plus parameters, linked entity type and id, dedup key, created at) with one `NotificationRecipient` per recipient user holding status `Unread`, `Read`, or `Dismissed`; notification text shall be rendered in the viewer's language at display time. | P0 | BRQ-11 | US-10-08 |
| FR-10-019 | The system shall resolve recipients at creation time as users who are `Active`, hold `notifications.read`, are assigned to the notification's branch (or have organization-wide scope), hold the type's required permission (§8.2), and match the effective rule (roles or explicit users) for that type and branch; a notification with zero resolved recipients shall still be persisted and counted in metrics. | P0 | BRQ-11, BRQ-01 | US-10-08 |
| FR-10-020 | The system shall seed, for every new organization, a default organization-level rule for each notification type with the default recipient roles listed in §8.2. | P0 | BRQ-11 | US-10-08 |
| FR-10-021 | The system shall provide `GET /api/v1/notifications` returning only the caller's own recipient records, filterable by status (default `Unread` and `Read`), type, branch, and `since` cursor, cursor-paginated (`limit` default 20, max 100), newest first. | P0 | BRQ-11 | US-10-08 |
| FR-10-022 | The system shall provide `GET /api/v1/notifications/unread-count` returning the count of the caller's `Unread` recipient records, total and per branch. | P0 | BRQ-11 | US-10-08 |
| FR-10-023 | The system shall allow the recipient to mark one notification read, mark all (optionally filtered by branch/type) read, and dismiss one notification; transitions are `Unread→Read`, `Unread→Dismissed`, `Read→Dismissed`; repeated requests for an already-applied transition shall return 204 without change. | P0 | BRQ-11 | US-10-08 |
| FR-10-024 | The system shall delete notifications and their recipient records whose `CreatedAt` is older than 90 days via a daily job at 03:00 `Africa/Cairo`, processing in batches of 5,000 rows. | P0 | BRQ-11 | US-10-08 |
| FR-10-025 | The system shall create a `LOW_STOCK` notification when the SPEC-04 integration event reports that a medicine's sellable quantity in a branch fell to or below its reorder minimum, at most one per (organization, branch, medicine) within any rolling 24 h window, enforced atomically under concurrent events, and only when the branch setting `LowStockNotificationsEnabled` is true. | P0 | BRQ-11 | US-10-09 |
| FR-10-026 | The system shall create, from the SPEC-04 daily expiry scan result, at most one `NEAR_EXPIRY` notification and at most one `EXPIRED_DETECTED` notification per branch per business date, each summarizing the count of newly affected batches and their inventory valuation and linking to the corresponding report, only when the branch setting `ExpiryNotificationsEnabled` is true and the count ≥ 1. | P0 | BRQ-11, BRQ-04 | US-10-09 |
| FR-10-027 | The system shall create notifications for `PO_APPROVED`, `PO_RECEIVED`, `TRANSFER_REQUESTED`, `TRANSFER_DISPATCHED`, `TRANSFER_RECEIVED`, `ADJUSTMENT_PENDING_APPROVAL`, `CASH_VARIANCE_ABOVE_THRESHOLD`, `RECONCILIATION_DRIFT_DETECTED`, `OCR_EXTRACTION_READY`, and `EXPORT_READY` from the corresponding integration events (§8.2), processing each event id at most once. | P1 | BRQ-11 | US-10-10 |
| FR-10-028 | The system shall allow users with `notifications.rules.manage` to view and edit, per notification type, the organization default rule and per-branch override rules (enabled, recipient roles, explicit recipient users, delivery mode, channels), with optimistic concurrency, and to remove a branch override to inherit the organization default. | P1 | BRQ-11 | US-10-11 |
| FR-10-029 | The system shall expose SignalR hub `/hubs/notifications` authenticated with the access token, adding each connection to groups `org:{organizationId}`, `branch:{branchId}` for each assigned branch, and `user:{userId}`, and shall remove group memberships and abort connections within 60 s after the user is deactivated or unassigned from a branch. | P1 | BRQ-11, BRQ-01 | US-10-12 |
| FR-10-030 | The system shall push `notificationCreated` (notification summary) and `unreadCountChanged` messages to each recipient's `user:` group only after the notification transaction commits, and `notificationStatusChanged` to the user's other connections when a recipient record changes status. | P1 | BRQ-11 | US-10-12 |
| FR-10-031 | The client shall reconnect automatically with delays of 0, 2, 10, and 30 s then every 30 s, fetch missed notifications via `GET /api/v1/notifications?since={lastCursor}` after each reconnect, and poll the unread count every 60 s while disconnected. | P1 | BRQ-11 | US-10-12 |
| FR-10-032 | The UI shall show a notification bell with an unread badge (displaying `99+` above 99), a panel with the 20 most recent non-dismissed notifications with mark-read/dismiss/mark-all-read actions and deep links to the related entity, and a full notification page with filters; without SignalR (MVP) the unread count shall refresh every 60 s and on window focus. | P0 | BRQ-11, BRQ-13 | US-10-13 |
| FR-10-033 | The system shall allow a platform administrator with `notifications.system.manage` to publish `SYSTEM_MAINTENANCE` or `SYSTEM_RELEASE_NOTES` notifications with mandatory Arabic and English text, target all or selected organizations, an optional display window (start/end UTC), and withdraw them; during an active maintenance window all users of targeted organizations shall see a dismissible-per-session banner. | P2 | BRQ-14 | US-10-14 |
| FR-10-034 | The system shall deliver notifications by email when the effective rule enables the email channel, the organization setting `EmailNotificationsEnabled` is true, and the recipient has a verified email and has not opted out of that type; email content shall exclude patient data, sending shall go through a provider-agnostic interface, and failed sends shall be retried 3 times with 1, 5, and 30 minute delays. | P2 | BRQ-11 | US-10-15 |
| FR-10-035 | The system shall support delivery mode `DailyDigest` per rule, combining a recipient's notifications of digest-mode types from the previous 24 h into one `DIGEST` notification (and email when enabled) at `DigestLocalTime` in the branch time zone, and sending none when there are zero items. | P2 | BRQ-11 | US-10-15 |
| FR-10-036 | The system shall send customer refill reminders by SMS or WhatsApp only to patients with an active `PatientConsent` for refill reminders on that channel (SPEC-07), only when `CustomerRemindersEnabled` is true, never between 21:00 and 09:00 branch local time, with an opt-out instruction in every message, logging each attempt in `CustomerNotification`; medicine names are included only when `RefillReminderIncludeMedicineName` is true (REG-04). | P3 | BRQ-08, BRQ-11 | US-10-16 |
| FR-10-037 | The system shall define every setting in a code-defined registry (§8.4) with key, scope, data type, default, constraints, owner spec, and edit permission, and shall reject writes with unknown keys, wrong types, or values violating constraints. | P0 | BRQ-15 | US-10-17 |
| FR-10-038 | The system shall resolve each setting's effective value as branch override (for keys whose scope allows branch override) → organization value → registry default, and return the source (`Branch`, `Organization`, `Default`) with each value. | P0 | BRQ-15, BRQ-02 | US-10-17 |
| FR-10-039 | The system shall audit every setting change (`SETTINGS.ORGANIZATION_SETTING_CHANGED` / `SETTINGS.BRANCH_SETTING_CHANGED`) with key, before, and after in the same transaction, protect updates with `ETag`/`If-Match` (412 on mismatch), and make changed values effective on the same application instance immediately and on other instances within 30 s. | P0 | BRQ-12, BRQ-15 | US-10-17 |
| FR-10-040 | The system shall provide organization settings read (`GET /api/v1/settings/organization`, any authenticated member, effective values) and update (`PATCH`, permission `settings.organization.manage`) for the organization-scope keys in §8.4, with a settings UI grouped by owner area. | P0 | BRQ-15 | US-10-18 |
| FR-10-041 | The system shall reject a change of `Currency` with `SETTINGS.CURRENCY_LOCKED` once the organization has at least one posted financial document (sale, goods receipt, supplier invoice, supplier payment, or expense). | P0 | BRQ-10, BRQ-15 | US-10-18 |
| FR-10-042 | The system shall provide branch settings read (`GET /api/v1/branches/{branchId}/settings`, users assigned to the branch) and update/remove-override (`PATCH`, `DELETE …/{key}`, permission `settings.branch.manage` for that branch), showing for each key the effective value, the source, and the organization value it would inherit. | P0 | BRQ-15, BRQ-02 | US-10-19 |
| FR-10-043 | The system shall persist per-user preferences (`Language`: `ar`/`en`/null = organization default; `Theme`: `Light`/`Dark`/`System`, default `System`) server-side in `UserPreference`, cache them in browser local storage for pre-login rendering, and apply the server value on every login on any device; effective language = user preference → organization `DefaultLanguage` → `ar`. | P0 | BRQ-13 | US-10-20 |
| FR-10-044 | The frontend shall source every user-visible string from i18next resources organized in namespaces (§8.6) loaded per route, and the CI build shall fail if any key exists in one of `ar`/`en` but not the other or if a lint rule detects a hard-coded user-visible string literal in JSX. | P0 | BRQ-13 | US-10-21 |
| FR-10-045 | The frontend shall set `<html lang dir>` from the effective language (`ar` → `rtl`, `en` → `ltr`) and apply the mirroring rules in §8.7, switching language at runtime without a full page reload. | P0 | BRQ-13 | US-10-21 |
| FR-10-046 | The frontend shall display numerals using the organization setting `DigitStyle` (`Latn` Western or `Arab` Eastern Arabic, applied only when the UI language is `ar`), shall always display identifiers (barcodes, batch numbers, document numbers, phone numbers) with Western digits, and shall accept both digit styles in numeric inputs, normalizing to Western digits before submission. | P0 | BRQ-13 | US-10-22 |
| FR-10-047 | The frontend shall format dates with the Gregorian calendar using `DateFormat` and `TimeFormat` settings in the branch time zone for business data, and format numbers and money via `Intl` with locale `ar-EG` or `en-EG`, the organization `Currency`, and 2 fraction digits for document amounts, without recomputing authoritative totals on the client (BR-G-18). | P0 | BRQ-13 | US-10-22 |
| FR-10-048 | The frontend shall display medicine names per `MedicineNameDisplay`: `EnglishPrimary` shows the English name as primary and the Arabic name (if present) as secondary; `UiLanguagePrimary` shows the name in the UI language as primary with the other as secondary; when the preferred name is missing the other name is shown as primary; search shall match both names. | P0 | BRQ-13, BRQ-03 | US-10-22 |
| FR-10-049 | The backend shall return Problem Details whose `code` and `errors[].code` values are stable identifiers and whose `title`/`message` values are localized from the request `Accept-Language` (`ar` or `en`, default `ar`); the frontend shall display its own translation for a known code and fall back to the server message for an unknown code. | P0 | BRQ-13 | US-10-22 |
| FR-10-050 | The frontend shall support themes `Light`, `Dark`, and `System` using the Tailwind `dark` class on `<html>`, follow `prefers-color-scheme` changes live when `System` is selected, and apply the stored theme before first paint (no flash of the wrong theme); printed documents shall always render in the light palette. | P0 | BRQ-13 | US-10-23 |
| FR-10-051 | Both themes shall meet WCAG 2.2 AA contrast (≥ 4.5:1 normal text, ≥ 3:1 large text and UI component boundaries/focus indicators), verified by automated accessibility checks on core routes in light/dark × ar/en in CI. | P0 | BRQ-13 | US-10-23 |
| FR-10-052 | The system shall expose anonymous `GET /health/live` (process liveness) and `GET /health/ready` (database, object storage, and Hangfire storage reachable) returning only `Healthy`/`Degraded`/`Unhealthy`, and `GET /api/v1/platform/health` with per-dependency status, latency, and version for `settings.operations.read`. | P1 | BRQ-14 | US-10-24 |
| FR-10-053 | The system shall provide a platform job status page listing each recurring job (name, schedule, last run status, last duration, next run, failures in the last 24 h) from `BackgroundJobRun`, allow retry of a failed run with `settings.operations.manage`, and raise a platform alert after 3 consecutive failures of the same job. | P1 | BRQ-14 | US-10-24 |
| FR-10-054 | The system shall display backup status (last successful full backup time and size, WAL archive lag) from `BackupRunRecord` entries reported by the backup tooling, flag a warning when the last successful full backup is older than 26 h or WAL lag exceeds 15 min, and allow `settings.operations.manage` users to record restore drills in `RestoreDrillRecord`, warning when no successful drill exists in the last 35 days (NFR-G-05). | P1 | BRQ-14 | US-10-24 |
| FR-10-055 | The system shall allow an Owner with `settings.data-export.manage` to request a per-organization data export (ZIP of per-module CSV files plus audit log JSON Lines) produced asynchronously, at most one running per organization, excluding password hashes, tokens, and secrets, including patient data only if the requester also holds `patients.data.export`, downloadable for 24 h, and audited (`SETTINGS.DATA_EXPORT_REQUESTED`, `SETTINGS.DATA_EXPORT_DOWNLOADED`). | P3 | BRQ-14, BRQ-08 | US-10-25 |

## 7. Business Rules

| ID | Rule | Source |
|---|---|---|
| BR-10-001 | Every operation in the sensitive-operation catalog (§8.3) writes exactly one audit entry per affected aggregate in the business transaction; a failed audit write fails the operation. | BR-G-16, BR-G-19 |
| BR-10-002 | `AuditLog` entries are never updated (except one-time sealing of NULL seal columns) or deleted by any application user, job, or API. | BR-G-25, BR-G-34 |
| BR-10-003 | Audit entries for failed security operations (e.g., `IDENTITY.LOGIN_FAILED`) are written in their own transaction because no business transaction commits. | BR-G-16 |
| BR-10-004 | Each organization has exactly one audit hash chain; platform-level events (no organization) belong to the `platform` chain. Chain order is seal order, not `OccurredAt` order. | ADR-008 |
| BR-10-005 | Reads of patient medical data and prescription content fail closed if the access audit cannot be recorded. | BR-G-29 |
| BR-10-006 | Audit diffs never contain secrets; medical field values are stored only as SHA-256 hashes. | NFR-G-10, BRQ-08 |
| BR-10-007 | Notifications are informational; no business decision (sale, allocation, approval) depends on a notification being delivered or read. | Real-time baseline §7 |
| BR-10-008 | A user receives a notification only if, at creation time, they could open the linked entity (branch assignment + type's required permission). | BR-G-17 |
| BR-10-009 | Notification titles, bodies, and real-time payloads never contain patient names, contact details, or medical data. | BRQ-08, NFR-G-10 |
| BR-10-010 | At most one `LOW_STOCK` notification per (organization, branch, medicine) is created within any rolling 24 h window. | Owner scope |
| BR-10-011 | `ADJUSTMENT_PENDING_APPROVAL` is never delivered to the user who submitted the document. | BR-G-28 |
| BR-10-012 | Mandatory notification types (`AUDIT_CHAIN_INTEGRITY_FAILURE`, `RECONCILIATION_DRIFT_DETECTED`, `SYSTEM_MAINTENANCE`) cannot be disabled; their rules always include all active Owners. | BRQ-12, BRQ-14 |
| BR-10-013 | Notification rule changes apply only to notifications created after the change; existing recipient records are not altered. Rule changes are audited (`NOTIFICATIONS.RULE_CHANGED`). | BRQ-12 |
| BR-10-014 | Notifications older than 90 days are deleted; notifications are not financial, inventory, prescription, or audit records. | BR-G-34 (exempt class) |
| BR-10-015 | Notification status transitions are only `Unread→Read`, `Unread→Dismissed`, `Read→Dismissed`; a dismissed notification is never shown again in the default list. | §6.1 conventions |
| BR-10-016 | Each organization has exactly one currency; it cannot change after the first posted financial document. | BR-G-18 |
| BR-10-017 | Effective setting value = branch override (only for branch-overridable keys) → organization value → registry default. | Owner scope |
| BR-10-018 | Every settings change is audited with before/after in the same transaction. | BR-G-16 |
| BR-10-019 | New organizations default to `DefaultLanguage = ar`, `DigitStyle = Latn`, `DateFormat = dd/MM/yyyy`, `TimeFormat = H12`, `Currency = EGP`. | Decision in this spec (OD-10-07) |
| BR-10-020 | Identifiers (barcodes, batch numbers, document numbers, phone numbers, emails, URLs) are always displayed left-to-right with Western digits in both languages. | BRQ-13 |
| BR-10-021 | Error codes are stable: a released code is never renamed or reused for another meaning. | ADR-009 |
| BR-10-022 | Customer refill reminders require active channel-specific consent; withdrawal of consent stops all pending reminders for that patient and channel before the next send attempt. | BRQ-08, REG-04 |
| BR-10-023 | Platform administrators see health, job, and backup metadata only; these views never include organization business data. | §5.1 conventions |
| BR-10-024 | Single-organization point-in-time restore inside the shared database is not offered in v1; restore operates on the whole database. | OD-10-01 |
| BR-10-025 | A user can read and change only their own preferences and their own notification recipient records. | BR-G-17 |

## 8. Data Requirements

### 8.1 Entities (schema `platform` unless stated)

| Entity | Key fields | Notes |
|---|---|---|
| `AuditLog` | Id (UUIDv7), ChainKey (text: organization id or `platform`), OrganizationId (nullable only for `platform` chain), BranchId?, EventCode, Category, Outcome, ActorUserId?, ActorType, SupportGrantId?, EntityType, EntityId, Changes jsonb, Metadata jsonb, IpAddress inet, UserAgent varchar(512), CorrelationId, OccurredAt timestamptz, BusinessDate?, ChainSequence bigint?, PreviousHash char(64)?, Hash char(64)?, SealedAt? | Append-only; monthly range partitions on `OccurredAt`; unique (ChainKey, ChainSequence); indexes (OrganizationId, OccurredAt DESC, Id), (OrganizationId, EntityType, EntityId), (OrganizationId, ActorUserId, OccurredAt), (OrganizationId, EventCode, OccurredAt), (OrganizationId, CorrelationId). |
| `AuditChainHead` **(new)** | ChainKey PK, LastSequence, LastHash, LastSealedAt | Updated only by the sealer role. |
| `AuditChainVerification` **(new)** | Id, OrganizationId, Trigger (`Scheduled`/`OnDemand`), RequestedBy?, FromSequence, ToSequence, EntriesChecked, Result (`Running`/`Passed`/`Failed`), FirstFailingSequence?, FailureReason?, StartedAt, CompletedAt? | |
| `ApiActionLog` **(new)** | Id, OrganizationId, BranchId?, UserId, Method, RouteTemplate, StatusCode, DurationMs, CorrelationId, IpAddress, UserAgent, OccurredAt | Monthly partitions; 180-day retention (operational log, not audit). |
| `Notification` | Id, OrganizationId, BranchId?, Type, Severity, TitleKey, BodyKey, Parameters jsonb, EntityType?, EntityId?, DedupKey?, SourceEventId?, CreatedAt | Unique (OrganizationId, SourceEventId, Type) where SourceEventId not null. |
| `NotificationRecipient` | NotificationId, UserId, OrganizationId, Status, ReadAt?, DismissedAt?, EmailStatus? | PK (NotificationId, UserId); index (UserId, Status, CreatedAt DESC). |
| `NotificationRule` | Id, OrganizationId, BranchId? (null = organization default), Type, Enabled, RecipientRoles text[], RecipientUserIds uuid[], DeliveryMode (`Immediate`/`DailyDigest`), Channels (`InApp` always; `Email`), RowVersion | Unique (OrganizationId, BranchId, Type). |
| `NotificationDedupState` **(new)** | OrganizationId, DedupKey, LastCreatedAt | PK (OrganizationId, DedupKey); conditional update `WHERE LastCreatedAt < now() − 24 h`. |
| `UserNotificationPreference` **(new, P2)** | UserId, Type, EmailOptOut | Per-user email opt-out. |
| `SystemAnnouncement` **(new, P2)** | Id, Type, Severity, TitleAr, TitleEn, BodyAr, BodyEn, TargetOrganizationIds? (null = all), StartsAt?, EndsAt?, Status (`Published`/`Withdrawn`), CreatedBy | Platform-level; fan-out creates `Notification` rows per organization. |
| `CustomerNotification` **(new, P3)** | Id, OrganizationId, BranchId, PatientId, Channel (`Sms`/`WhatsApp`), TemplateKey, Status (`Scheduled`/`Sent`/`Failed`/`Cancelled`), ProviderMessageId?, ScheduledFor, SentAt?, FailureReason? | Message body is not stored; template key + parameters only. |
| `OrganizationSettings` / `BranchSettings` (schema `org`) | OrganizationId / BranchId, Key, Value jsonb, UpdatedAt, UpdatedBy, RowVersion | One row per explicitly set key; absence = inherit. |
| `UserPreference` | UserId PK, Language?, Theme, UpdatedAt | |
| `BackgroundJobRun` | Id, JobName, StartedAt, CompletedAt?, Status, DurationMs, Error? (no secrets), OrganizationId? | Shared with other specs. |
| `BackupRunRecord` **(new)** | Id, Kind (`Full`/`WalArchive`), StartedAt, CompletedAt, Status, SizeBytes?, WalLagSeconds?, Tool, Location (non-secret label) | Reported by backup tooling with a service credential. |
| `RestoreDrillRecord` **(new)** | Id, PerformedAt, PerformedBy, BackupUsedAt, TargetEnvironment, RecoveryPointAchieved, MeasuredRtoMinutes, Result (`Passed`/`Failed`), Notes | Platform-level. |
| `FileObject` | per ADR-006 | Exports. |

### 8.2 Notification type catalog

| Type | Trigger (source) | Default recipient roles | Required permission for recipient | Severity | De-duplication | Priority |
|---|---|---|---|---|---|---|
| `LOW_STOCK` | SPEC-04 event: sellable quantity of medicine in branch ≤ reorder minimum | MANAGER, INVENTORY | `inventory.stock.read` | Warning | 1 per org+branch+medicine per rolling 24 h | P0 |
| `NEAR_EXPIRY` | SPEC-04 daily expiry scan: batches newly inside `NearExpiryThresholdDays` with on-hand > 0 | MANAGER, INVENTORY, PHARMACIST | `inventory.stock.read` | Warning | 1 per branch per business date (aggregated) | P0 |
| `EXPIRED_DETECTED` | SPEC-04 nightly scan: batches newly flagged `Expired` with on-hand > 0 | MANAGER, INVENTORY, PHARMACIST | `inventory.stock.read` | Critical | 1 per branch per business date (aggregated) | P0 |
| `PO_APPROVED` | SPEC-05: purchase order → `Approved` | PO creator (explicit) + INVENTORY | `procurement.purchase-orders.read` | Info | 1 per source event | P1 |
| `PO_RECEIVED` | SPEC-05: goods receipt posted against a PO | MANAGER, ACCOUNTANT | `procurement.purchase-orders.read` | Info | 1 per source event | P1 |
| `TRANSFER_REQUESTED` | SPEC-04: transfer → `Requested` | holders of `inventory.transfers.approve` in source branch | `inventory.transfers.approve` | Info | 1 per source event | P1 |
| `TRANSFER_DISPATCHED` | SPEC-04: transfer → `InTransit` | holders of `inventory.transfers.receive` in destination branch | `inventory.transfers.receive` | Info | 1 per source event | P1 |
| `TRANSFER_RECEIVED` | SPEC-04: transfer → `Received` / `PartiallyReceived` | requester and approver (explicit), source MANAGER | `inventory.stock.read` | Info (Warning when partial) | 1 per source event | P1 |
| `ADJUSTMENT_PENDING_APPROVAL` | SPEC-04: stock adjustment / write-off / stocktake → `PendingApproval` | holders of the matching `.approve` permission in branch, excluding submitter | matching `inventory.*.approve` | Warning | 1 per source event | P1 |
| `CASH_VARIANCE_ABOVE_THRESHOLD` | SPEC-06: cash session closed with abs(variance) > `CashVarianceNotificationThreshold` | MANAGER, ACCOUNTANT, OWNER | `sales.cash-sessions.manage` | Warning | 1 per cash session | P1 |
| `RECONCILIATION_DRIFT_DETECTED` | SPEC-04 nightly reconciliation finds balance ≠ Σ movements | OWNER, MANAGER (mandatory) | `inventory.stock.read` | Critical | 1 per branch per run | P1 |
| `OCR_EXTRACTION_READY` | SPEC-08: OCR extraction completed or failed | uploading user (explicit) | `prescriptions.prescriptions.read` | Info | 1 per extraction | P1 |
| `EXPORT_READY` | This spec / SPEC-09: export file ready or failed | requester (explicit) | none beyond requester | Info | 1 per export | P1 |
| `AUDIT_CHAIN_INTEGRITY_FAILURE` | This spec: verification failed | OWNER (mandatory) | `audit.logs.read` | Critical | 1 per verification run | P1 |
| `SUSPICIOUS_ACTIVITY_DETECTED` | This spec: daily suspicious-activity evaluation | OWNER | `audit.reports.read` | Warning | 1 per org per business date | P2 |
| `SYSTEM_MAINTENANCE` | Platform administrator | all active users (mandatory) | `notifications.read` | Warning | 1 per announcement | P2 |
| `SYSTEM_RELEASE_NOTES` | Platform administrator | all active users | `notifications.read` | Info | 1 per announcement | P2 |
| `DIGEST` | This spec: daily digest | the digest owner | `notifications.read` | Info | 1 per user per branch per day | P2 |

Customer channel (not in-app): `REFILL_REMINDER` (P3) — SMS/WhatsApp to consenting patients (FR-10-036).

Example notification list item and SignalR `notificationCreated` payload (identical shape):

```json
{
  "id": "0193f1d2-7a10-7c3e-9a51-4b8e2f0c1d22",
  "type": "LOW_STOCK",
  "severity": "Warning",
  "branchId": "0193a0aa-1111-7000-8000-000000000001",
  "titleKey": "notifications:lowStock.title",
  "bodyKey": "notifications:lowStock.body",
  "parameters": { "medicineName": { "en": "Panadol 500mg", "ar": "بنادول ٥٠٠ مجم" }, "sellableQty": 12, "reorderMin": 20 },
  "entity": { "type": "Medicine", "id": "0193b2cc-2222-7000-8000-000000000002" },
  "status": "Unread",
  "createdAt": "2026-11-09T08:15:30.123Z",
  "cursor": "MTczMTE0MDEzMDEyM3wwMTkzZjFkMg"
}
```

### 8.3 Sensitive-operation catalog (authoritative for BR-G-16)

Every entry captures the common envelope (FR-10-002). "Diff" = field-level before/after (FR-10-003). Retention classes: **SEC** (security), **FIN** (financial/inventory), **PHI** (patient/prescription), **CFG** (configuration/administration). All classes: no application purge in v1; retention periods pending REG-05.

| # | Event code | Owner spec | Trigger | Specific captured fields | Retention |
|---|---|---|---|---|---|
| 1 | `IDENTITY.LOGIN_SUCCEEDED` | SPEC-01 | Successful login | user id, method, session id | SEC |
| 2 | `IDENTITY.LOGIN_FAILED` | SPEC-01 | Failed login | normalized login identifier (SHA-256 if no matching user), reason code (`InvalidCredentials`, `Locked`, `Deactivated`), attempt count | SEC |
| 3 | `IDENTITY.ACCOUNT_LOCKED` | SPEC-01 | Lockout threshold reached | user id, lockout end | SEC |
| 4 | `IDENTITY.PASSWORD_RESET_REQUESTED` | SPEC-01 | Forgot-password request | user id (if exists), delivery channel | SEC |
| 5 | `IDENTITY.PASSWORD_RESET_COMPLETED` | SPEC-01 | Reset via token or by admin (`identity.users.reset-password`) | target user id, performed by self/admin | SEC |
| 6 | `IDENTITY.PASSWORD_CHANGED` | SPEC-01 | User changes own password | user id | SEC |
| 7 | `IDENTITY.USER_CREATED` | SPEC-01 | User invited/created | user id, roles, branches | SEC |
| 8 | `IDENTITY.USER_UPDATED` | SPEC-01 | Profile fields changed | diff (excluding secrets) | SEC |
| 9 | `IDENTITY.USER_DEACTIVATED` | SPEC-01 | User deactivated | user id, reason, tokens revoked count | SEC |
| 10 | `IDENTITY.USER_REACTIVATED` | SPEC-01 | User reactivated | user id | SEC |
| 11 | `IDENTITY.ROLE_PERMISSIONS_CHANGED` | SPEC-01 | Role created/edited/deleted | role id, permissions added/removed | SEC |
| 12 | `IDENTITY.USER_ROLES_CHANGED` | SPEC-01 | Role assigned/unassigned | user id, roles added/removed | SEC |
| 13 | `IDENTITY.SESSION_REVOKED` | SPEC-01 | Session/refresh family revoked | user id, session id, reason | SEC |
| 14 | `IDENTITY.REFRESH_TOKEN_REUSE_DETECTED` | SPEC-01 | Rotated token reused (CS-12) | user id, family id | SEC |
| 15 | `ORG.BRANCH_ASSIGNMENT_CHANGED` | SPEC-02 | User branch assignment changed | user id, branches added/removed, org-wide scope flag diff | SEC |
| 16 | `ORG.ORGANIZATION_UPDATED` | SPEC-02 | Organization profile changed | diff | CFG |
| 17 | `ORG.BRANCH_CREATED` / `ORG.BRANCH_UPDATED` / `ORG.BRANCH_DEACTIVATED` | SPEC-02 | Branch lifecycle | branch id, diff | CFG |
| 18 | `ORG.SUPPORT_ACCESS_GRANTED` / `ORG.SUPPORT_ACCESS_REVOKED` | SPEC-02 | Owner grants/revokes support access | grant id, platform admin id, scope, expires at | SEC |
| 19 | `ORG.SUPPORT_ACCESS_USED` | SPEC-02 / SPEC-10 | Every API request under a grant | grant id, method, route template, status | SEC |
| 20 | `CATALOG.PRICE_CHANGED` | SPEC-03 | Org price or branch override changed | medicine id, branch id?, old/new price, effective from | FIN |
| 21 | `CATALOG.MEDICINE_REGULATORY_FLAGS_CHANGED` | SPEC-03 | Rx-only / controlled flags changed | medicine id, diff | CFG |
| 22 | `CATALOG.MEDICINES_IMPORTED` / `CATALOG.MEDICINES_EXPORTED` | SPEC-03 | Bulk import/export | file id, row counts | CFG |
| 23 | `INVENTORY.ADJUSTMENT_SUBMITTED` / `_APPROVED` / `_REJECTED` / `_POSTED` | SPEC-04 | Stock adjustment lifecycle | document id/number, lines (batch, delta, reason), value, approver | FIN |
| 24 | `INVENTORY.WRITE_OFF_POSTED` (and `_APPROVED`/`_REJECTED`) | SPEC-04 | Damaged/expired write-off | document id, lines, value, reason | FIN |
| 25 | `INVENTORY.STOCKTAKE_POSTED` (and `_APPROVED`) | SPEC-04 | Stocktake variances posted | stocktake id, variance lines count, net variance value | FIN |
| 26 | `INVENTORY.TRANSFER_STATUS_CHANGED` | SPEC-04 | Each transfer transition (Requested, Approved, Rejected, InTransit, PartiallyReceived, Received, Cancelled) | transfer id/number, from→to status, source/destination branch, quantities | FIN |
| 27 | `INVENTORY.BATCH_STATUS_CHANGED` | SPEC-04 | Quarantine / release | batch id, from→to status, reason | FIN |
| 28 | `INVENTORY.BATCH_METADATA_UPDATED` | SPEC-04 | Batch number/expiry corrected | batch id, diff | FIN |
| 29 | `INVENTORY.FEFO_OVERRIDDEN` | SPEC-04/06 | Non-FEFO batch selected | document id, chosen batch, FEFO batch | FIN |
| 30 | `INVENTORY.RECONCILIATION_DRIFT_DETECTED` | SPEC-04 | Nightly reconciliation mismatch (System actor) | branch id, batches affected, drift summary | FIN |
| 31 | `PROCUREMENT.PO_APPROVED` / `PROCUREMENT.PO_CANCELLED` | SPEC-05 | PO approval/cancellation | PO id/number, total, approver | FIN |
| 32 | `PROCUREMENT.RECEIPT_POSTED` / `PROCUREMENT.RECEIPT_REVERSED` | SPEC-05 | Goods receipt posted/reversed | receipt id/number, lines count, value, PO id? | FIN |
| 33 | `PROCUREMENT.SUPPLIER_INVOICE_POSTED` | SPEC-05 | Supplier invoice posted | invoice id, supplier id, total | FIN |
| 34 | `PROCUREMENT.SUPPLIER_RETURN_POSTED` | SPEC-05 | Supplier return posted | return id/number, value | FIN |
| 35 | `PROCUREMENT.SUPPLIER_PAYMENT_CREATED` | SPEC-05 | Supplier payment | payment id, supplier id, amount, method, allocations | FIN |
| 36 | `SALES.SALE_COMPLETED` | SPEC-06 | Sale completed | sale id/invoice number, total, payment methods, cash session id, lines count | FIN |
| 37 | `SALES.SALE_VOIDED` | SPEC-06 | Sale voided | sale id, reason, approver, total | FIN |
| 38 | `SALES.RETURN_COMPLETED` / `_APPROVED` / `_REJECTED` | SPEC-06 | Sales return lifecycle | return id, original sale id, lines, amount | FIN |
| 39 | `SALES.RETURN_DISPOSITION_SET` | SPEC-06 | Line disposition `Restocked`/`Discarded` | return line id, disposition, batch id | FIN |
| 40 | `SALES.REFUND_ISSUED` | SPEC-06 | Refund paid | refund id, amount, method | FIN |
| 41 | `SALES.DISCOUNT_OVERRIDE_APPROVED` | SPEC-06 | Manager override (BR-G-32) | sale ref, cashier id, approver id, requested %/amount, role limit | FIN |
| 42 | `SALES.CASH_SESSION_CLOSED` | SPEC-06 | Cash session closed | session id, expected, counted, variance | FIN |
| 43 | `SALES.CASH_SESSION_FORCE_CLOSED` | SPEC-06 | Manager force-close | session id, cashier id, reason, variance | FIN |
| 44 | `FINANCE.CASH_MOVEMENT_RECORDED` | SPEC-09 | Cash in/out | amount, direction, reason, session id | FIN |
| 45 | `FINANCE.EXPENSE_RECORDED` / `FINANCE.EXPENSE_CHANGED` | SPEC-09 | Expense create/change | expense id, diff | FIN |
| 46 | `FINANCE.REPORT_EXPORTED` | SPEC-09 | Report exported | report type, filter, row count | CFG |
| 47 | `PATIENTS.MEDICAL_DATA_READ` | SPEC-07 / SPEC-10 | Any read returning medical data or prescription content | patient id, sections read | PHI |
| 48 | `PATIENTS.MEDICAL_DATA_CHANGED` | SPEC-07 | Allergy/condition/history change | patient id, changed field names, hashed values | PHI |
| 49 | `PATIENTS.PROFILE_CHANGED` | SPEC-07 | Personal data change | patient id, changed field names | PHI |
| 50 | `PATIENTS.CONSENT_CHANGED` | SPEC-07 | Consent given/withdrawn | patient id, consent type, channel, new state | PHI |
| 51 | `PATIENTS.DATA_EXPORTED` / `PATIENTS.ANONYMIZED` | SPEC-07 | Subject export / anonymization | patient id, file id? | PHI |
| 52 | `PRESCRIPTIONS.VERIFIED` / `PRESCRIPTIONS.CANCELLED` | SPEC-08 | Prescription verification/cancellation | prescription id, pharmacist id, items count | PHI |
| 53 | `PRESCRIPTIONS.DISPENSED` | SPEC-08 | Dispensing event | prescription item id, sale line id, batch id, quantity, pharmacist id | PHI |
| 54 | `PRESCRIPTIONS.CONTROLLED_DISPENSED` | SPEC-08 | Controlled-medicine dispensing (REG-02) | as #53 + register entry id | PHI |
| 55 | `PRESCRIPTIONS.OCR_SUGGESTION_ACCEPTED` | SPEC-08 | Pharmacist accepts/edits OCR suggestions | extraction id, fields accepted/modified/rejected counts | PHI |
| 56 | `SETTINGS.ORGANIZATION_SETTING_CHANGED` / `SETTINGS.BRANCH_SETTING_CHANGED` | SPEC-10 | Settings change | key, before, after, branch id? | CFG |
| 57 | `NOTIFICATIONS.RULE_CHANGED` | SPEC-10 | Notification rule changed | type, branch id?, diff | CFG |
| 58 | `AUDIT.LOGS_EXPORTED` | SPEC-10 | Audit export requested | filter, row count, file id | SEC |
| 59 | `AUDIT.CHAIN_VERIFIED` / `AUDIT.CHAIN_VERIFICATION_FAILED` | SPEC-10 | Verification result (System or user) | verification id, range, first failing sequence? | SEC |
| 60 | `SETTINGS.DATA_EXPORT_REQUESTED` / `SETTINGS.DATA_EXPORT_DOWNLOADED` | SPEC-10 | Org data export | export id, includes patient data flag | SEC |
| 61 | `NOTIFICATIONS.SYSTEM_ANNOUNCEMENT_PUBLISHED` / `_WITHDRAWN` | SPEC-10 | Platform announcement (platform chain) | announcement id, targets | CFG |
| 62 | `SETTINGS.RESTORE_DRILL_RECORDED` | SPEC-10 | Restore drill recorded (platform chain) | drill id, result, RTO | CFG |
| 63 | `NOTIFICATIONS.CUSTOMER_REMINDER_SENT` | SPEC-10 | Refill reminder sent (P3) | patient id, channel, template key | PHI |

Owner specs may add events; any addition must be registered here (via change to this spec) before it can be written (FR-10-006).

### 8.4 Settings catalog

Scope: `Organization` (organization only), `Branch` (branch only; default from registry), `OrgWithBranchOverride` (organization value, optionally overridden per branch), `Platform` (deployment configuration; not editable through the API).

| Key | Scope | Type | Default | Constraints | Owner spec | Edit permission |
|---|---|---|---|---|---|---|
| `Currency` | Organization | ISO 4217 code | `EGP` | Value in platform `SupportedCurrencies`; locked after first posted financial document | SPEC-10 | `settings.organization.manage` |
| `DefaultLanguage` | Organization | enum `ar`,`en` | `ar` | — | SPEC-10 | `settings.organization.manage` |
| `DigitStyle` | Organization | enum `Latn`,`Arab` | `Latn` | Applies to `ar` UI only | SPEC-10 | `settings.organization.manage` |
| `DateFormat` | Organization | enum `dd/MM/yyyy`,`yyyy-MM-dd` | `dd/MM/yyyy` | — | SPEC-10 | `settings.organization.manage` |
| `TimeFormat` | Organization | enum `H12`,`H24` | `H12` | — | SPEC-10 | `settings.organization.manage` |
| `MedicineNameDisplay` | Organization | enum `EnglishPrimary`,`UiLanguagePrimary` | `EnglishPrimary` | — | SPEC-10 | `settings.organization.manage` |
| `EnforcePrescriptionForRxOnly` | Organization | bool | `true` | REG-01 | SPEC-08 | `settings.organization.manage` |
| `AllowDirectRestockOnReturn` | Organization | bool | `false` | REG-11 | SPEC-06 | `settings.organization.manage` |
| `ReturnWindowDays` | Organization | int | `14` (proposed; SPEC-06 authoritative) | 0–365 | SPEC-06 | `settings.organization.manage` |
| `CashVarianceNotificationThreshold` | OrgWithBranchOverride | money `numeric(19,2)` | `50.00` | 0.00–100000.00 | SPEC-06 / SPEC-10 | org: `settings.organization.manage`; branch: `settings.branch.manage` |
| `EmailNotificationsEnabled` | Organization | bool | `false` | P2 | SPEC-10 | `settings.organization.manage` |
| `DigestLocalTime` | OrgWithBranchOverride | time `HH:mm` | `08:00` | 00:00–23:59, 15-min steps | SPEC-10 | as above |
| `SuspiciousVoidsPerCashierPerDay` | Organization | int | `3` | 1–100 | SPEC-10 | `settings.organization.manage` |
| `SuspiciousDiscountOverridesPerDay` | Organization | int | `5` | 1–100 | SPEC-10 | `settings.organization.manage` |
| `AuditAfterHoursStart` / `AuditAfterHoursEnd` | OrgWithBranchOverride | time `HH:mm` | `23:00` / `07:00` | Start ≠ End | SPEC-10 | as above |
| `CustomerRemindersEnabled` | Organization | bool | `false` | P3; requires provider configured | SPEC-10 | `settings.organization.manage` |
| `RefillReminderIncludeMedicineName` | Organization | bool | `false` | P3; REG-04 | SPEC-10 | `settings.organization.manage` |
| `TimeZone` | Branch | IANA zone | `Africa/Cairo` | Valid IANA id | SPEC-02 | `settings.branch.manage` |
| `NearExpiryThresholdDays` | Branch | int | `90` | 1–730 (SPEC-04 authoritative) | SPEC-04 | `settings.branch.manage` |
| `DoNotSellWindowDays` | Branch | int | `0` | 0–365 (SPEC-04 authoritative) | SPEC-04 | `settings.branch.manage` |
| `AdjustmentApprovalThresholdAmount` | Branch | money `numeric(19,2)` | `1000.00` | ≥ 0.00 | SPEC-04 | `settings.branch.manage` |
| `LowStockNotificationsEnabled` | Branch | bool | `true` | — | SPEC-10 | `settings.branch.manage` |
| `ExpiryNotificationsEnabled` | Branch | bool | `true` | — | SPEC-10 | `settings.branch.manage` |
| `SupportedCurrencies` | Platform | ISO code list | `[EGP]` | — | SPEC-10 | deployment config |
| `NotificationRetentionDays` | Platform | int | `90` | fixed in v1 (OD-10-10) | SPEC-10 | deployment config |
| `ApiActionLogRetentionDays` | Platform | int | `180` | 30–730 | SPEC-10 | deployment config |

Other specs may register additional keys in this registry following the same columns; the owner spec defines meaning, default, and constraints; this spec provides storage, validation, resolution, and audit.

Example effective branch settings response:

```json
{
  "branchId": "0193a0aa-1111-7000-8000-000000000001",
  "etag": "W/\"8812\"",
  "items": [
    { "key": "NearExpiryThresholdDays", "value": 60, "source": "Branch", "inheritedValue": null, "overridable": true },
    { "key": "CashVarianceNotificationThreshold", "value": "50.00", "source": "Organization", "inheritedValue": "50.00", "overridable": true },
    { "key": "TimeZone", "value": "Africa/Cairo", "source": "Default", "inheritedValue": null, "overridable": true }
  ]
}
```

### 8.5 Audit hash canonical serialization

UTF-8 JSON, keys sorted lexicographically, no insignificant whitespace, timestamps ISO-8601 UTC with 6 fractional digits, nulls included, of: `Id, ChainKey, ChainSequence, OrganizationId, BranchId, EventCode, Category, Outcome, ActorUserId, ActorType, SupportGrantId, EntityType, EntityId, Changes, Metadata, IpAddress, UserAgent, CorrelationId, OccurredAt`. `Hash = hex(SHA-256(canonical || PreviousHash))`. A sealer worker runs every 10 s, seals committed unsealed rows per chain in (`OccurredAt`, `Id`) order of visibility, and updates `AuditChainHead` in the same transaction.

### 8.6 i18next namespaces

`common`, `errors`, `validation`, `auth`, `navigation`, `pos`, `catalog`, `inventory`, `procurement`, `patients`, `prescriptions`, `finance`, `reports`, `notifications`, `audit`, `settings`, `platform`. Key format: `namespace:area.key` in camelCase. `common`, `errors`, `validation`, `navigation` load at start-up; others load with their route. Fallback language: `en` for missing keys at runtime (CI prevents this in release builds).

### 8.7 RTL/LTR mirroring rules

| Element | Rule |
|---|---|
| Layout spacing/alignment | Tailwind logical utilities only (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`, `text-end`); physical `ml-/mr-/pl-/pr-/left-/right-/text-left/text-right` prohibited by lint except in the print stylesheet. |
| Navigation sidebar, drawers, breadcrumbs | Mirror (sidebar on the right in `rtl`). |
| Directional icons (back/forward arrows, chevrons, "next" buttons) | Mirror via `rtl:` variant. |
| Non-directional icons (search, bell, checkmark, plus), logos, media controls, clocks | Do not mirror. |
| Tables | Column order follows reading direction; numeric columns aligned to `end`. |
| Identifiers, codes, emails, URLs, phone numbers, barcodes | Rendered in an LTR-isolated span (`dir="ltr"` / `<bdi>`), BR-10-020. |
| Mixed-language text (English medicine names in Arabic UI) | Wrapped with `dir="auto"` isolation. |
| Charts | Time axis remains left-to-right in both directions; legends and labels follow UI direction (OD-10-08). |
| Printed documents (invoices, receipts) | Direction follows the organization `DefaultLanguage`, light palette. |

## 9. Validation Rules

| ID | Field / Object | Rule | Error code |
|---|---|---|---|
| VR-10-001 | Audit search `from`/`to` | Both required; `from` ≤ `to`; range ≤ 366 days | `AUDIT.INVALID_DATE_RANGE` |
| VR-10-002 | Audit search `limit` | 1–200 | `COMMON.VALIDATION_FAILED` |
| VR-10-003 | Audit search `eventCodes` | Each code exists in the registry | `AUDIT.UNKNOWN_EVENT_CODE` |
| VR-10-004 | Audit search `branchId` | Branch in caller's scope | `COMMON.FORBIDDEN` (403) |
| VR-10-005 | Audit export | Estimated row count ≤ 1,000,000 | `AUDIT.EXPORT_TOO_LARGE` |
| VR-10-006 | Audit export `format` | `csv` or `jsonl` | `COMMON.VALIDATION_FAILED` |
| VR-10-007 | Chain verification request | No verification `Running` for the organization | `AUDIT.VERIFICATION_ALREADY_RUNNING` (409) |
| VR-10-008 | API activity search range | ≤ 31 days | `AUDIT.INVALID_DATE_RANGE` |
| VR-10-009 | Notification id (read/dismiss) | Recipient record exists for caller | `NOTIFICATIONS.NOT_FOUND` (404) |
| VR-10-010 | Notification status transition | Allowed transitions only (BR-10-015) | `NOTIFICATIONS.INVALID_STATUS_TRANSITION` (409) |
| VR-10-011 | Notification list `limit` | 1–100 | `COMMON.VALIDATION_FAILED` |
| VR-10-012 | Rule `type` | Exists in type catalog | `NOTIFICATIONS.UNKNOWN_TYPE` |
| VR-10-013 | Rule `recipientRoles` / `recipientUserIds` | Roles exist in organization; users active, in organization, assigned to the branch (for branch rules) | `NOTIFICATIONS.INVALID_RECIPIENT` |
| VR-10-014 | Rule for mandatory type | `enabled = true` and Owners included | `NOTIFICATIONS.MANDATORY_TYPE` |
| VR-10-015 | Rule `deliveryMode` / `channels` | `Immediate`/`DailyDigest`; channels ⊆ {`InApp`,`Email`}, `InApp` always present | `COMMON.VALIDATION_FAILED` |
| VR-10-016 | System announcement | `titleAr`, `titleEn`, `bodyAr`, `bodyEn` non-empty (title ≤ 120, body ≤ 2,000 chars); `endsAt` > `startsAt` | `NOTIFICATIONS.INVALID_ANNOUNCEMENT` |
| VR-10-017 | Customer reminder | Active consent for patient + channel | `NOTIFICATIONS.CONSENT_MISSING` |
| VR-10-018 | Setting key | Exists in registry | `SETTINGS.UNKNOWN_KEY` |
| VR-10-019 | Setting value | Matches type; within constraints | `SETTINGS.INVALID_VALUE` |
| VR-10-020 | Branch override | Key scope is `Branch` or `OrgWithBranchOverride` | `SETTINGS.NOT_OVERRIDABLE` |
| VR-10-021 | Organization override of `Branch`-only key / `Platform` key via API | Not allowed | `SETTINGS.READ_ONLY` |
| VR-10-022 | `Currency` change | No posted financial document exists | `SETTINGS.CURRENCY_LOCKED` (409) |
| VR-10-023 | Settings update | `If-Match` present and current | `COMMON.PRECONDITION_REQUIRED` (428) / `COMMON.PRECONDITION_FAILED` (412) |
| VR-10-024 | User preference `language` | `ar`, `en`, or null | `SETTINGS.UNSUPPORTED_LANGUAGE` |
| VR-10-025 | User preference `theme` | `Light`, `Dark`, `System` | `SETTINGS.INVALID_THEME` |
| VR-10-026 | Restore drill record | `performedAt` ≤ now; `measuredRtoMinutes` ≥ 0; `result` in `Passed`/`Failed` | `COMMON.VALIDATION_FAILED` |
| VR-10-027 | Data export request | No export `Running` for the organization | `SETTINGS.EXPORT_ALREADY_RUNNING` (409) |
| VR-10-028 | Numeric input normalization | Eastern Arabic digits (U+0660–U+0669) and Arabic decimal separator (U+066B) converted to ASCII before validation | (client-side; server rejects non-ASCII numerics with `COMMON.VALIDATION_FAILED`) |

## 10. API Requirements

All endpoints follow §7 of the conventions (Problem Details, camelCase, `Accept-Language`). No endpoint in this spec requires `Idempotency-Key` (none is in the mandatory list); state transitions on notifications are naturally idempotent.

| Method | Path | Purpose | Permission | Idempotency |
|---|---|---|---|---|
| GET | `/api/v1/notifications` | List own notifications (cursor, filters) | `notifications.read` | N/A (read) |
| GET | `/api/v1/notifications/unread-count` | Own unread count (total + per branch) | `notifications.read` | N/A |
| POST | `/api/v1/notifications/{id}/read` | Mark read | `notifications.read` | Natural (repeat → 204) |
| POST | `/api/v1/notifications/read-all` | Mark all (filtered) read | `notifications.read` | Natural |
| POST | `/api/v1/notifications/{id}/dismiss` | Dismiss | `notifications.read` | Natural |
| GET | `/api/v1/notification-types` | Type catalog with localized names | `notifications.read` | N/A |
| GET | `/api/v1/notification-rules` | Organization default rules | `notifications.rules.manage` | N/A |
| PUT | `/api/v1/notification-rules/{type}` | Update organization default rule (`If-Match`) | `notifications.rules.manage` (org-wide scope) | ETag |
| GET | `/api/v1/branches/{branchId}/notification-rules` | Effective rules for branch | `notifications.rules.manage` | N/A |
| PUT | `/api/v1/branches/{branchId}/notification-rules/{type}` | Create/update branch override (`If-Match` when updating) | `notifications.rules.manage` | ETag |
| DELETE | `/api/v1/branches/{branchId}/notification-rules/{type}` | Remove branch override | `notifications.rules.manage` | Natural |
| GET/PUT | `/api/v1/me/notification-preferences` | Email opt-outs per type (P2) | authenticated (self) | ETag |
| WS | `/hubs/notifications` | SignalR hub | `notifications.read` | N/A |
| GET/POST | `/api/v1/platform/system-announcements` | List / publish announcements (P2) | `notifications.system.manage` | N/A |
| POST | `/api/v1/platform/system-announcements/{id}/withdraw` | Withdraw announcement | `notifications.system.manage` | Natural |
| GET | `/api/v1/system-announcements/active` | Active banners for caller's organization | authenticated | N/A |
| GET | `/api/v1/branches/{branchId}/customer-notifications` | Customer reminder log (P3) | `notifications.customer.manage` | N/A |
| POST | `/api/v1/branches/{branchId}/customer-notifications/{id}/cancel` | Cancel scheduled reminder (P3) | `notifications.customer.manage` | Natural |
| GET | `/api/v1/audit/event-types` | Sensitive-operation catalog | `audit.logs.read` | N/A |
| GET | `/api/v1/audit/logs` | Audit search (cursor) | `audit.logs.read` | N/A |
| GET | `/api/v1/audit/logs/{id}` | Audit entry detail | `audit.logs.read` | N/A |
| POST | `/api/v1/audit/exports` | Request audit export (202) | `audit.logs.export` | N/A |
| GET | `/api/v1/audit/exports/{id}` | Export status + download URL | `audit.logs.export` (requester) | N/A |
| POST | `/api/v1/audit/chain/verifications` | Start on-demand verification (202) | `audit.chain.verify` | N/A |
| GET | `/api/v1/audit/chain/verifications` | Verification history | `audit.chain.verify` | N/A |
| GET | `/api/v1/audit/activity` | API action log search | `audit.logs.read` | N/A |
| GET | `/api/v1/audit/reports/suspicious-activity` | Suspicious activity report (P2) | `audit.reports.read` | N/A |
| GET | `/api/v1/settings/definitions` | Settings registry (keys, types, constraints, localized labels) | authenticated | N/A |
| GET | `/api/v1/settings/organization` | Effective organization settings | authenticated member | N/A |
| PATCH | `/api/v1/settings/organization` | Update organization settings (`If-Match`) | `settings.organization.manage` | ETag |
| GET | `/api/v1/branches/{branchId}/settings` | Effective branch settings with source | assigned to branch | N/A |
| PATCH | `/api/v1/branches/{branchId}/settings` | Set branch overrides (`If-Match`) | `settings.branch.manage` | ETag |
| DELETE | `/api/v1/branches/{branchId}/settings/{key}` | Remove branch override | `settings.branch.manage` | Natural |
| GET | `/api/v1/me/preferences` | Own preferences | authenticated | N/A |
| PUT | `/api/v1/me/preferences` | Update own preferences | authenticated | Natural |
| GET | `/health/live`, `/health/ready` | Liveness / readiness | anonymous (NFR-G-07) | N/A |
| GET | `/api/v1/platform/health` | Dependency detail | `settings.operations.read` | N/A |
| GET | `/api/v1/platform/jobs` | Recurring job status | `settings.operations.read` | N/A |
| POST | `/api/v1/platform/jobs/runs/{runId}/retry` | Retry failed run | `settings.operations.manage` | N/A |
| GET | `/api/v1/platform/backups` | Backup status | `settings.operations.read` | N/A |
| POST | `/api/v1/platform/backups/runs` | Backup tooling reports a run (service credential) | service principal `backup-reporter` | Natural (by tool run id) |
| GET/POST | `/api/v1/platform/restore-drills` | List / record restore drills | read: `settings.operations.read`; record: `settings.operations.manage` | N/A |
| POST | `/api/v1/data-exports` | Request organization data export (P3, 202) | `settings.data-export.manage` | N/A |
| GET | `/api/v1/data-exports/{id}` | Export status + download URL | `settings.data-export.manage` | N/A |

SignalR server → client messages: `notificationCreated` (§8.2 payload), `unreadCountChanged` `{ total, byBranch }`, `notificationStatusChanged` `{ id, status }`, `announcementChanged` `{ id }`.

## 11. Authorization Requirements

- All checks are enforced on the backend (BR-G-17); UI hiding is cosmetic only.
- Cross-organization ids (notification, audit entry, export, rule, branch) return **404**; cross-branch or missing permission within the organization returns **403** (CS-07, CS-08).
- Notification endpoints operate only on the caller's own `NotificationRecipient` records; another user's notification id returns 404.
- Audit search and API activity search apply branch scoping (FR-10-013) in the query, not as a post-filter on a page, so pagination never reveals hidden entries.
- SignalR group joins are server-side only; clients cannot request arbitrary groups. Branch groups are computed from current assignments.
- Platform endpoints (`/api/v1/platform/...`) require a platform-level token; organization tokens receive 403. Platform tokens calling organization endpoints receive 403 unless a valid support grant applies (SPEC-02), in which case every request is audited (FR-10-008).
- `MANAGER` users with `notifications.rules.manage` or `settings.branch.manage` can edit only branch-level rules/settings for assigned branches; organization defaults require organization-wide scope.
- Export download URLs are pre-signed for the requester after an authorization check, expire in 24 h, and are never sent in notifications or emails (the notification links to the in-app export page).

## 12. Error Handling

| Situation | HTTP | Code |
|---|---|---|
| Audit write fails during business transaction | 500 (business operation rolled back) | `AUDIT.WRITE_FAILED` |
| Medical-data read cannot be audited | 503 | `AUDIT.ACCESS_LOG_UNAVAILABLE` |
| Unknown audit event code at write (developer defect) | 500 | `AUDIT.UNKNOWN_EVENT_CODE` |
| Invalid audit date range | 400 | `AUDIT.INVALID_DATE_RANGE` |
| Export too large | 422 | `AUDIT.EXPORT_TOO_LARGE` |
| Verification already running | 409 | `AUDIT.VERIFICATION_ALREADY_RUNNING` |
| Notification not found / not own | 404 | `NOTIFICATIONS.NOT_FOUND` |
| Invalid notification transition (e.g., dismissed → read) | 409 | `NOTIFICATIONS.INVALID_STATUS_TRANSITION` |
| Unknown notification type | 400 | `NOTIFICATIONS.UNKNOWN_TYPE` |
| Invalid rule recipient | 422 | `NOTIFICATIONS.INVALID_RECIPIENT` |
| Disabling mandatory type / removing Owners | 422 | `NOTIFICATIONS.MANDATORY_TYPE` |
| Invalid announcement | 422 | `NOTIFICATIONS.INVALID_ANNOUNCEMENT` |
| Reminder without consent | 422 | `NOTIFICATIONS.CONSENT_MISSING` |
| Unknown setting key | 400 | `SETTINGS.UNKNOWN_KEY` |
| Invalid setting value | 422 | `SETTINGS.INVALID_VALUE` |
| Branch override of non-overridable key | 422 | `SETTINGS.NOT_OVERRIDABLE` |
| Write to read-only/platform key | 422 | `SETTINGS.READ_ONLY` |
| Currency locked | 409 | `SETTINGS.CURRENCY_LOCKED` |
| Unsupported language / invalid theme | 422 | `SETTINGS.UNSUPPORTED_LANGUAGE` / `SETTINGS.INVALID_THEME` |
| Data export already running | 409 | `SETTINGS.EXPORT_ALREADY_RUNNING` |
| Missing `If-Match` | 428 | `COMMON.PRECONDITION_REQUIRED` |
| Stale `If-Match` | 412 | `COMMON.PRECONDITION_FAILED` |
| Missing permission / branch not assigned | 403 | `COMMON.FORBIDDEN` |
| Resource in another organization | 404 | `COMMON.NOT_FOUND` |

Background failures (notification creation, email send, sealing, verification, exports) never surface to the end user as HTTP errors; they are recorded in `BackgroundJobRun`, retried per job policy, and alerted per FR-10-053.

## 13. Edge Cases

1. Two concurrent stock movements cross the reorder minimum for the same medicine/branch within milliseconds → exactly one `LOW_STOCK` notification (atomic dedup state update).
2. Stock drops below minimum, is replenished, and drops again within 24 h → no second notification; after 24 h → a new notification.
3. A user is unassigned from a branch after a notification was delivered → the existing recipient record remains readable in their list, but the deep link returns 403 from the owning module; no new notifications for that branch.
4. A user is deactivated while connected via SignalR → connection aborted within 60 s; access token expires ≤ 15 min (BR-G-30).
5. Integration event redelivered by the outbox → unique (OrganizationId, SourceEventId, Type) prevents duplicates.
6. A long-running transaction commits an audit entry with an `OccurredAt` earlier than already-sealed entries → sealed in the next sealer cycle with the next sequence (chain order = seal order).
7. Sealer down for 1 hour → backlog sealed on recovery; verification reports unsealed entries older than 15 minutes as a failure condition (FR-10-011) so the outage is visible.
8. A database administrator modifies an audit row directly → next verification reports the first failing sequence.
9. Org default language changed from `ar` to `en` → users with explicit `Language` keep theirs; users with null preference switch at next app load.
10. Browser local storage cleared → pre-login screen uses browser language (`ar*` → `ar`, otherwise `en`) and system theme; server preferences apply after login.
11. Medicine has no Arabic name and display mode is `UiLanguagePrimary` in `ar` → English name shown as primary.
12. Eastern Arabic digits pasted into a quantity field → normalized to Western digits; mixed digit styles in a barcode field → barcode compared after normalization.
13. Branch override equals the organization value → stored as an explicit override (source `Branch`); removing it is required to follow future organization changes.
14. Currency change attempted while the first sale is being completed concurrently → currency update takes a row lock on the organization settings and re-checks for posted documents in the same transaction; one of the two outcomes is consistent.
15. Unread count above 99 → badge shows `99+`; API returns the exact number.
16. Notification created for a branch in a different time zone than the viewer → timestamps displayed in the branch time zone with the zone abbreviation.
17. Maintenance announcement window ends while a user has the banner open → banner removed on next `announcementChanged` or within 60 s polling.
18. Audit export filter matches 0 rows → export completes with a header-only file and `EXPORT_READY` is still sent.
19. Daily expiry scan rerun for the same business date → no second `NEAR_EXPIRY`/`EXPIRED_DETECTED` for that branch/date.
20. Refill reminder scheduled at 20:55 but provider queue delays to 21:05 → send is deferred to 09:00 next day.

## 14. Acceptance Criteria

| ID | Criterion |
|---|---|
| SAC-10-01 | For every event code in §8.3, an integration test performs the operation and finds exactly one matching audit entry committed with the business change; forcing the audit insert to fail leaves no business change. |
| SAC-10-02 | Direct `UPDATE`/`DELETE` of an audit row by the application role fails; modifying a sealed row via a privileged role is detected by the next verification with the correct first failing sequence. |
| SAC-10-03 | Audit search returns only in-scope entries (branch and organization), cross-organization entry ids return 404, and a 31-day query on 50 million entries returns the first page within the NFR target. |
| SAC-10-04 | Low-stock notifications respect the 24 h de-duplication under 50 concurrent events; near-expiry/expired notifications are aggregated per branch per business date. |
| SAC-10-05 | Notification center shows correct unread counts, transitions are idempotent, and notifications older than 90 days are purged. |
| SAC-10-06 | Connected clients receive notifications within the NFR latency target and recover missed notifications after reconnect with no duplicates in the list. |
| SAC-10-07 | Effective settings resolve branch → organization → default with the correct source; every change is audited with before/after; stale `If-Match` returns 412. |
| SAC-10-08 | The application is fully usable in Arabic (RTL) and English (LTR) with no missing keys, correct digit style, date and currency formats, and both themes pass automated WCAG AA contrast checks. |
| SAC-10-09 | Platform administrators can see health, job, backup, and restore drill status without access to organization business data. |

## 15. Dependencies

| Dependency | Direction | Detail |
|---|---|---|
| SPEC-01 Identity & Access | Inbound | Authentication, roles, permissions, user status, login events, password reset events; verified email (P2). |
| SPEC-02 Organization & Branches | Inbound | Organization/branch lifecycle, branch assignments, org-wide scope flag, support access grants, `TimeZone` meaning, `OrganizationSettings`/`BranchSettings` entities. |
| SPEC-03 Medicine Catalog | Inbound | Medicine English/Arabic names (display rule), price change events. |
| SPEC-04 Batch & Inventory | Inbound events | `MedicineBelowReorderLevel`, `ExpiryScanCompleted` (newly near-expiry / expired batches per branch), `ReconciliationDriftDetected`, transfer status events, adjustment/write-off/stocktake `PendingApproval` events; `NearExpiryThresholdDays`, `DoNotSellWindowDays`, `AdjustmentApprovalThresholdAmount` definitions. |
| SPEC-05 Suppliers & Procurement | Inbound events | `PurchaseOrderApproved`, `GoodsReceiptPosted`. |
| SPEC-06 Sales & POS | Inbound events | `CashSessionClosed` (with variance); `ReturnWindowDays`, `AllowDirectRestockOnReturn`, cash variance threshold meaning; void/discount override audit events used by suspicious-activity rules. |
| SPEC-07 Patient Records | Inbound | `PatientConsent` (refill reminders), `PatientAccessLog` mirrored to audit. |
| SPEC-08 Prescriptions | Inbound events | `OcrExtractionCompleted`; `EnforcePrescriptionForRxOnly` meaning; refill due dates (P3). |
| SPEC-09 Finance & Reporting | Inbound | Report export completion (`EXPORT_READY`), finance audit events. |
| Deployment architecture | Inbound | Backup tooling posting `BackupRunRecord`; alerting channel for platform alerts. |
| All specs | Outbound | Audit write API, settings resolution API, notification creation contract, localization resources, theme tokens. |

Integration event names above are proposals; the owning specs are authoritative and this spec will align to them.

## 16. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-10-001 | Notification delivered to connected SignalR clients p95 ≤ 2 s, p99 ≤ 5 s after the notification transaction commits. |
| NFR-10-002 | Notification created p95 ≤ 10 s after the source business transaction commits (outbox → consumer). |
| NFR-10-003 | `GET /notifications/unread-count` p95 ≤ 100 ms; `GET /notifications` p95 ≤ 300 ms for users with 10,000 recipient records. |
| NFR-10-004 | Audit write adds ≤ 10 ms p95 to the business transaction; sale completion still meets NFR-G-02. |
| NFR-10-005 | Audit search first page p95 ≤ 2 s for a 31-day range with ≥ 1 indexed filter on an organization holding 50 million entries; ≤ 5 s for a 366-day range. |
| NFR-10-006 | Audit sealing lag p95 ≤ 60 s; verification throughput ≥ 200,000 entries per minute per worker. |
| NFR-10-007 | Audit export of 1,000,000 entries completes ≤ 10 minutes. |
| NFR-10-008 | Effective setting resolution p95 ≤ 5 ms (cached); cross-instance propagation ≤ 30 s. |
| NFR-10-009 | One application instance sustains 5,000 concurrent SignalR connections with ≤ 70% CPU at 20 notifications/s. |
| NFR-10-010 | Runtime language switch re-renders the current route ≤ 500 ms without full reload; theme toggle ≤ 100 ms with no flash of wrong theme on initial load. |
| NFR-10-011 | i18n key parity between `ar` and `en` = 100% on every release build. |
| NFR-10-012 | WCAG 2.2 AA contrast with 0 automated violations on core routes (login, POS, receiving, dispensing, notification center, settings) in light/dark × ar/en. |
| NFR-10-013 | `/health/live` p95 ≤ 50 ms; `/health/ready` p95 ≤ 500 ms (dependency checks time out at 2 s each). |
| NFR-10-014 | API action logging adds ≤ 2 ms p95 to request latency (asynchronous batching). |
| NFR-10-015 | Notification purge and API log partition maintenance complete ≤ 15 minutes per run without blocking OLTP queries (batch size 5,000, no table locks). |

## 17. Security and Privacy Considerations

- Audit and notification data are tenant-scoped with `OrganizationId`, EF Core global filters, and RLS (ADR-002).
- The application DB role cannot update or delete audit rows; the sealer runs with a separate role restricted to seal columns (FR-10-004). Chain tampering by a superuser is detectable, not preventable (OD-10-02 proposes external anchoring).
- SignalR access tokens passed in the WebSocket query string are redacted from all logs (NFR-G-10); hub connections are re-authorized on reconnect.
- Notification content and emails exclude patient data (BR-10-009); summary money amounts (e.g., near-expiry valuation, cash variance) reach only users holding the type's required permission (BR-10-008).
- Medical values in audit diffs are hashed (OD-10-04); medical data reads are always access-logged (BR-G-29).
- IP addresses and user agents in audit and API logs are personal data of staff; access is restricted to `audit.logs.read` (REG-04).
- Exports are encrypted at rest in object storage, delivered via pre-signed URLs (≤ 24 h), and audited.
- Customer messaging requires channel-specific consent, honors withdrawal, includes opt-out instructions, and minimizes content (REG-04); provider data-processing terms are pending (OD-10-05).
- Health endpoints expose no versions, hostnames, or dependency details anonymously.

## 18. Testing Considerations

- **Catalog conformance**: a generated test matrix asserts one integration test per event code (FR-10-006).
- **Rollback tests**: inject audit insert failure → business change absent (CS-10 pattern).
- **Tamper tests**: modify, delete (via superuser), reorder, and insert rows; verification must identify the first failing sequence.
- **Concurrency**: 50 parallel low-stock events for one medicine/branch → 1 notification; concurrent mark-all-read and new notification → count consistent.
- **Isolation**: CS-07 and CS-08 for every endpoint in §10 (cross-branch 403, cross-organization 404).
- **Real-time**: Playwright multi-tab tests for delivery, cross-tab read sync, disconnect/reconnect catch-up; load test for NFR-10-001/009.
- **Localization**: key parity CI check; visual regression snapshots in ar/rtl and en/ltr; digit normalization unit tests; Intl formatting snapshots for `ar-EG`/`en-EG`.
- **Accessibility**: axe-core in CI for both themes and directions (FR-10-051).
- **Operations**: health endpoints with each dependency down; job failure alert after 3 consecutive failures; backup staleness warning thresholds.

## 19. Open Decisions

| ID | Decision needed | Options | Proposed default |
|---|---|---|---|
| OD-10-01 | Single-organization restore within the shared database | (a) Not supported; whole-DB restore to a staging instance and manual extraction of one organization's rows; (b) build a per-organization logical export/import tool; (c) database-per-organization for premium tier | (a) for v1, documented runbook; revisit with (b) after P3 data export exists |
| OD-10-02 | Audit chain sealing mode and external anchoring | Asynchronous sealer (chosen) vs synchronous per-organization lock at commit; optional daily publication of chain heads to write-once storage | Async sealer; external anchoring P2 |
| OD-10-03 | Audit and API log retention periods and archival tier | Per REG-05 | No purge of audit in v1; API logs 180 days |
| OD-10-04 | Patient medical values in audit diffs | SHA-256 hash (chosen) vs encrypted plaintext with key restricted to Owners | Hash, pending REG-04 |
| OD-10-05 | Email, SMS, WhatsApp providers | To be selected (data location, cost, Arabic support) | Provider-agnostic interface; SMTP reference for email |
| OD-10-06 | SignalR scale-out when > 1 app instance | Redis backplane vs managed SignalR service vs sticky sessions only | Redis backplane when the second instance is added |
| OD-10-07 | Default language and digit style for new Egyptian organizations | `ar` + `Latn` (chosen) vs `ar` + `Arab` | Validate with pilot pharmacies |
| OD-10-08 | Chart axis direction in RTL | LTR time axis (chosen) vs mirrored | LTR, validate in usability testing |
| OD-10-09 | Logging GET requests on sensitive resources in `ApiActionLog` | Mutating only (chosen) vs include GET for selected routes | Mutating only; medical reads covered by audit |
| OD-10-10 | Notification retention configurable per organization | Fixed 90 days (chosen) vs 30–365 configurable | Fixed |
| OD-10-11 | Medicine names in refill reminder messages | Excluded by default (chosen) vs included | Excluded pending REG-04 |
| OD-10-12 | Whether per-organization export serves data portability obligations | Pending REG-04 | Operational feature only |

## 20. Regulatory Review Items

- **REG-02** — controlled-medicine dispensing audit content (catalog #54).
- **REG-04** — staff IP/user-agent logging, patient medical data in audit, customer messaging consent and content, data export, provider data location.
- **REG-05** — retention periods for audit logs, API action logs, and exported data.
