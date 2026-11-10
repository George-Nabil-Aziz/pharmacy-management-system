# US-10-08: Notification Store, Default Routing, and Notification Center API

| Field | Value |
|---|---|
| Story ID | US-10-08 |
| Epic | EPIC-10 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-10-018, FR-10-019, FR-10-020, FR-10-021, FR-10-022, FR-10-023, FR-10-024 |
| Related Business Rules | BR-G-17, BR-10-007, BR-10-008, BR-10-009, BR-10-014, BR-10-015, BR-10-025 |
| Dependencies | SPEC-01 roles/permissions, SPEC-02 branch assignments |

## User Story
As a pharmacy staff member, I want notifications addressed to me based on my role and branches, with an unread count and the ability to mark them read or dismiss them, so that I see the alerts relevant to my work.

## Business Value
Core of BRQ-11: a reliable, permission-aware notification store that every alert type builds on.

## Preconditions
- `Notification`, `NotificationRecipient`, `NotificationRule` tables exist.
- Users, roles, and branch assignments exist (SPEC-01/02).

## Acceptance Criteria
### US-10-08-AC1: Default rules seeded for new organizations
- **Given** a new organization is created
- **When** provisioning completes
- **Then** one organization-level `NotificationRule` per type in SPEC-10 §8.2 exists with the default recipient roles, `Enabled = true`, `DeliveryMode = Immediate`, `Channels = [InApp]`

### US-10-08-AC2: Recipient resolution respects branch and permission
- **Given** a `LOW_STOCK` notification for branch `CAI01`; Manager M1 assigned to `CAI01`; Manager M2 assigned only to `ALX02`; Inventory user I1 assigned to `CAI01` but deactivated; a custom role user U assigned to `CAI01` without `inventory.stock.read`
- **When** the notification is created
- **Then** a `NotificationRecipient` with status `Unread` exists only for M1 (and any other eligible users), not for M2, I1, or U

### US-10-08-AC3: Localization at display time
- **Given** a notification stored with `titleKey` and parameters
- **When** user A (language `ar`) and user B (language `en`) list their notifications
- **Then** the API returns the same keys and parameters for both and the UI renders Arabic text for A and English text for B; no rendered text is stored

### US-10-08-AC4: List and unread count
- **Given** user A has 30 `Unread`, 10 `Read`, and 5 `Dismissed` notifications across branches `CAI01` and `ALX02`
- **When** A calls `GET /api/v1/notifications?limit=20` and `GET /api/v1/notifications/unread-count`
- **Then** the list returns 20 of the 40 non-dismissed items newest first with a `nextCursor`, and the count returns `{ "total": 30, "byBranch": { "<CAI01>": n1, "<ALX02>": n2 } }` with n1 + n2 = 30

### US-10-08-AC5: Mark read, mark all read, dismiss — idempotent transitions
- **Given** user A has an `Unread` notification N
- **When** A posts `/notifications/{N}/read` twice, then `/notifications/{N}/dismiss`, then `/notifications/read-all?branchId=<CAI01>`
- **Then** both read calls return 204 and N is `Read` with one `ReadAt`; dismiss returns 204 and N is `Dismissed`; read-all sets all of A's `Unread` notifications in `CAI01` to `Read` and leaves `ALX02` unchanged

### US-10-08-AC6: Invalid transition (negative)
- **Given** notification N is `Dismissed`
- **When** A posts `/notifications/{N}/read`
- **Then** the API returns 409 `NOTIFICATIONS.INVALID_STATUS_TRANSITION`

### US-10-08-AC7: Other users' notifications are invisible
- **Given** notification N2 addressed only to user B in the same organization, and N3 in another organization
- **When** user A posts `/notifications/{N2}/read` and `/notifications/{N3}/dismiss`
- **Then** both return 404 `NOTIFICATIONS.NOT_FOUND` and neither record changes

### US-10-08-AC8: Permission denied
- **Given** a user whose custom role lacks `notifications.read`
- **When** they call `GET /api/v1/notifications`
- **Then** the API returns 403 `COMMON.FORBIDDEN`

### US-10-08-AC9: 90-day retention purge
- **Given** notifications created 91 days ago and 89 days ago
- **When** the daily purge at 03:00 `Africa/Cairo` runs
- **Then** the 91-day-old notifications and their recipient records are deleted in batches of ≤ 5,000 and the 89-day-old ones remain

## Validation Rules
- VR-10-009, VR-10-010, VR-10-011. Status filter values: `Unread`, `Read`, `Dismissed`.

## Authorization Rules
- `notifications.read`; operations restricted to the caller's own recipient records (BR-10-025).

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Not own / other org notification | 404 `NOTIFICATIONS.NOT_FOUND` |
| Dismissed → Read | 409 `NOTIFICATIONS.INVALID_STATUS_TRANSITION` |
| `limit` = 500 | 400 `COMMON.VALIDATION_FAILED` |
| No `notifications.read` | 403 `COMMON.FORBIDDEN` |

## Edge Cases
- Zero eligible recipients → notification persisted, metric `notifications_without_recipients` incremented.
- User unassigned from a branch keeps existing recipient records (deep links then return 403 in the owning module).
- Notification payloads never include patient data (BR-10-009) — enforced by a parameter allow-list per type.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-10-044 | Integration | New organization has one default rule per type | US-10-08-AC1 |
| TS-10-045 | Integration | Recipient resolution excludes other-branch, deactivated, and unpermitted users | US-10-08-AC2 |
| TS-10-046 | API | Same keys/params for ar and en users; no stored rendered text | US-10-08-AC3 |
| TS-10-047 | API | List pagination and per-branch unread counts | US-10-08-AC4 |
| TS-10-048 | API | Idempotent read, dismiss, branch-filtered read-all | US-10-08-AC5 |
| TS-10-049 | API | Dismissed → read returns 409 | US-10-08-AC6 |
| TS-10-050 | Security | Other user's and other org's notification ids return 404 (CS-08) | US-10-08-AC7 |
| TS-10-051 | API | Missing `notifications.read` → 403 | US-10-08-AC8 |
| TS-10-052 | Integration | Purge deletes > 90 days, keeps 89-day-old | US-10-08-AC9 |
| TS-10-053 | Performance | Unread count p95 ≤ 100 ms, list p95 ≤ 300 ms at 10,000 records/user (NFR-10-003) | US-10-08-AC4 |
