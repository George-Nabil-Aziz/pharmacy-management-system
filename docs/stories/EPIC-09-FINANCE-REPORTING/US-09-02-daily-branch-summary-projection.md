# US-09-02: DailyBranchSummary Projection, Late Corrections, and Nightly Reconciliation

| Field | Value |
|---|---|
| Story ID | US-09-02 |
| Epic | EPIC-09 |
| Priority | P1 |
| Complexity | L |
| Related Requirements | FR-09-006, FR-09-007, FR-09-008, FR-09-009, FR-09-010 |
| Related Business Rules | BR-G-23, BR-G-25, BR-09-003, BR-09-004, BR-09-005 |
| Dependencies | US-09-01, US-09-03, US-09-05, SPEC-06 (integration events), SPEC-10 (outbox, `BackgroundJobRun`, notifications) |

## User Story
As an owner, I want daily per-branch summary figures to be maintained automatically and verified every night against source documents, so that dashboards and multi-day reports are fast and always reconcile with the detailed reports.

## Business Value
Summary reports (dashboard, branch comparison, trends) become constant-time per day instead of scanning sale lines, while the nightly reconciliation guarantees that summary and detail never disagree (RC-08).

## Preconditions
- The §6.3 reference dataset of SPEC-09 is loaded for branch `CAI01`, business date 2026-11-09.
- Integration events are published via the transactional outbox.
- User `OWN1` (role `OWNER`) holds `reports.projections.manage`; user `M1` (`MANAGER`) does not.

## Acceptance Criteria
### US-09-02-AC1: Projection reflects events
- **Given** the reference dataset events are committed
- **When** the projection processes the resulting integration events
- **Then** within 60 s the `DailyBranchSummary` row for (`CAI01`, 2026-11-09) has `SaleCount = 2`, `GrossSales = 600.00`, `Discounts = 20.00`, `SalesReturns = 100.00`, `NetSales = 480.00`, `CogsSold = 410.00`, `CogsRestocked = 70.00`, `Cogs = 340.00`, `GrossProfit = 140.00`, `Expenses = 150.00`, `WriteOffLoss = 35.00`, `VoidCount = 1`, `VoidedAmount = 50.00`, and `DailyBranchPaymentSummary` rows Cash (480.00 received / 100.00 refunded) and Card (114.00 / 0.00)

### US-09-02-AC2: Duplicate and out-of-order events are idempotent
- **Given** the `SaleCompleted` event for S2 is delivered twice and the `SalesReturnCompleted` event for R1 is delivered before the S1 event
- **When** all deliveries are processed
- **Then** the summary row equals the AC1 values exactly and exactly one `ProjectionInboxRecord` exists per event id

### US-09-02-AC3: Late correction recomputes the past date
- **Given** the AC1 row has `Version = n` and the branch business date has advanced to 2026-11-10
- **When** sale S2 (business date 2026-11-09, 114.00) is voided at 2026-11-09T22:10:00Z (00:10 Cairo on 2026-11-10)
- **Then** the 2026-11-09 row is recomputed to `SaleCount = 1`, `GrossSales = 500.00`, `NetSales = 380.00`, `Cogs = 280.00`, `GrossProfit = 100.00`, `Version = n + 1`, `LastRecomputedAt` updated, and the 2026-11-10 row shows `VoidCount = 1`, `VoidedAmount = 114.00`

### US-09-02-AC4: Nightly reconciliation repairs a discrepancy
- **Given** a test fixture has set the 2026-11-09 row `NetSales` to 470.00 directly in the database
- **When** the nightly reconciliation job runs for `CAI01`
- **Then** the row is corrected to 480.00, the `BackgroundJobRun` records difference 10.00 for metric `netSales` on 2026-11-09, and every user with role `OWNER` receives one notification

### US-09-02-AC5: Manual rebuild
- **Given** `OWN1` sends `POST /branches/{CAI01}/reports/projections/rebuild` with `from=2026-10-01&to=2026-11-09` and an `Idempotency-Key`
- **When** a second rebuild for `CAI01` is requested while the first is running
- **Then** the first returns 202 and writes an audit entry, and the second returns 409 `REPORTS.PROJECTION_REBUILD_IN_PROGRESS`

### US-09-02-AC6: Rebuild range invalid (negative)
- **Given** `OWN1` requests a rebuild for `from=2025-01-01&to=2026-11-09` (678 days)
- **When** the request is sent
- **Then** the API returns 400 `REPORTS.REBUILD_RANGE_INVALID` and no job is enqueued

### US-09-02-AC7: Permission denied and cross-organization
- **Given** `M1` lacks `reports.projections.manage`, and branch `B9` belongs to another organization
- **When** `M1` requests a rebuild for `CAI01`, and `OWN1` requests a rebuild for `B9`
- **Then** the first returns 403 `COMMON.FORBIDDEN` and the second returns 404 `COMMON.NOT_FOUND`

## Validation Rules
- VR-09-028.

## Authorization Rules
- Rebuild: `reports.projections.manage` + branch access. Projection consumers run as system jobs scoped to the event's organization.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Rebuild range > 366 days or `to` in future | 400 `REPORTS.REBUILD_RANGE_INVALID` |
| Concurrent rebuild for same branch | 409 `REPORTS.PROJECTION_REBUILD_IN_PROGRESS` |
| Missing `Idempotency-Key` on rebuild | 400 `COMMON.IDEMPOTENCY_KEY_REQUIRED` |
| Same key, different body | 422 `COMMON.IDEMPOTENCY_KEY_REUSED` |
| No permission | 403 `COMMON.FORBIDDEN` |
| Other organization's branch | 404 `COMMON.NOT_FOUND` |
| Projection handler failure | Event retried with exponential backoff (max 10 attempts), then dead-lettered and an Owner notification raised; nightly job repairs the row |

## Edge Cases
- Event for a business date with no existing row creates the row.
- A day with no events still gets a zero row when the nightly job runs.
- Back-dated expense (US-09-14) recomputes its expense date row.
- Rebuild during live event processing: recompute-from-OLTP is idempotent, last writer wins with identical values.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-09-009 | Integration | Reference dataset → summary and payment summary values within 60 s | US-09-02-AC1 |
| TS-09-010 | Integration | Duplicate and out-of-order delivery yields identical row, one inbox record per event | US-09-02-AC2 |
| TS-09-011 | Integration | Cross-midnight void recomputes previous date and increments `Version` | US-09-02-AC3 |
| TS-09-012 | Integration | Nightly job repairs tampered row, records difference, notifies Owners | US-09-02-AC4 |
| TS-09-013 | Property | Randomized 10,000-sale dataset: RC-08 holds for every branch/date after nightly job | US-09-02-AC4 |
| TS-09-014 | Integration | Rebuild 202 + audit; concurrent rebuild 409 | US-09-02-AC5 |
| TS-09-015 | Integration | Rebuild range validation | US-09-02-AC6 |
| TS-09-016 | Security | 403 without permission; 404 cross-organization (CS-07/CS-08) | US-09-02-AC7 |
