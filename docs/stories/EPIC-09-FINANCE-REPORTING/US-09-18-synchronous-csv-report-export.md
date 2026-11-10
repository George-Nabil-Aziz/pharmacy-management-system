# US-09-18: Synchronous CSV Report Export

| Field | Value |
|---|---|
| Story ID | US-09-18 |
| Epic | EPIC-09 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-09-040, FR-09-041, FR-09-042 |
| Related Business Rules | BR-G-18, BR-G-23, BR-G-17 |
| Dependencies | US-09-01 |

## User Story
As an authorized pharmacy owner or accountant, I want synchronous csv report export, so that I can use correct, traceable, and access-controlled results.

## Business Value
Delivers the capability defined by FR-09-040, FR-09-041, FR-09-042 with scoped results and measurable outcomes.

## Preconditions
- Source entities and settings required by FR-09-040, FR-09-041, FR-09-042 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

## Acceptance Criteria
### US-09-18-AC1: Exact reference result
- **Given** Given an accepted reference dataset whose relevant line is 10 units Ã— EGP 12.5000 per unit, the line amount is EGP 125.00; all financial amounts are EGP rounded to 2 decimals per BR-G-18.
- **When** an authorized caller uses the capability for the scope defined by FR-09-040, FR-09-041, FR-09-042
- **Then** the system applies each requirement in FR-09-040, FR-09-041, FR-09-042; monetary values, where present, use decimal arithmetic and 2-decimal AwayFromZero rounding. No out-of-scope row contributes to returned totals.

### US-09-18-AC2: Invalid or prohibited input (negative)
- **Given** a caller submits an unsupported value, exceeds a stated limit, or attempts a prohibited transition in FR-09-040, FR-09-041, FR-09-042
- **When** the request is processed
- **Then** the request is rejected with the spec-defined validation error and no partial business change is committed.

### US-09-18-AC3: Permission denied
- **Given** a caller lacks `reports.export` or is assigned to a different branch in the same organization
- **When** they request or change this capability
- **Then** the API returns 403 `COMMON.FORBIDDEN` and returns no restricted data.

### US-09-18-AC4: Cross-organization isolation
- **Given** the requested organization-owned resource belongs to another organization
- **When** the caller requests it
- **Then** the API returns 404 `COMMON.NOT_FOUND` with no existence or data disclosure (CS-08).

## Validation Rules
- Enforce supported values, thresholds, date boundaries, and state transitions stated in FR-09-040, FR-09-041, FR-09-042.
- Validate before persistence; failed validation produces no partial write.

## Authorization Rules
- Require reports.export.
- Enforce token organization and branch assignment in backend queries and PostgreSQL Row-Level Security; cross-branch access returns 403 and cross-organization access returns 404.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Invalid value / forbidden transition defined by FR-09-040, FR-09-041, FR-09-042 | 400 with the applicable `REPORTS.INVALID_DATE_RANGE` or `REPORTS.INVALID_GROUP_BY` code defined in SPEC-09 |
| Missing permission or branch assignment | 403 `COMMON.FORBIDDEN` |
| Resource belongs to another organization | 404 `COMMON.NOT_FOUND` |
| Stale `If-Match`, when applicable | 412 `COMMON.PRECONDITION_FAILED` |

## Edge Cases
- Empty result sets return no rows and correctly defined zero totals.
- Concurrent duplicate event delivery is deduplicated when the FR requires idempotency.
- Business-date calculations use the branch time zone; immutable ledgers are corrected by compensating entries.
- No unsupported compliance claim is made; applicable review remains under the cited REG items.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-09-095 | Integration | Reference values/required behavior and reconciliation (FR-09-040, FR-09-041, FR-09-042) | US-09-18-AC1 |
| TS-09-096 | API | Negative validation boundary causes no partial effect; spec-defined error (REPORTS.RANGE_REQUIRES_EXPORT) | US-09-18-AC2 |
| TS-09-097 | Security | Missing permission and branch mismatch return 403 (CS-07) | US-09-18-AC3 |
| TS-09-098 | Security | Other organization returns 404 and no data (CS-08) | US-09-18-AC4 |

