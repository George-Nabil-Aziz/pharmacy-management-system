# US-10-10: Operational Event Notifications

| Field | Value |
|---|---|
| Story ID | US-10-10 |
| Epic | EPIC-10 |
| Priority | P1 |
| Complexity | M |
| Related Requirements | FR-10-027 |
| Related Business Rules | BR-G-16, BR-G-17 |
| Dependencies | US-10-08, SPEC-04, SPEC-05, SPEC-06 |

## User Story
As an authorized pharmacy staff member, I want operational event notifications, so that I can use correct, traceable, and access-controlled results.

## Business Value
Delivers the capability defined by FR-10-027 with scoped results and measurable outcomes.

## Preconditions
- Source entities and settings required by FR-10-027 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

## Acceptance Criteria
### US-10-10-AC1: Required behavior and boundaries
- **Given** Given source events/records matching the required rules in FR-10-027, with one item deliberately outside the effective scope.
- **When** an authorized caller uses the capability for the scope defined by FR-10-027
- **Then** the system applies each requirement in FR-10-027; monetary values, where present, use decimal arithmetic and 2-decimal AwayFromZero rounding. No out-of-scope row contributes to returned totals.

### US-10-10-AC2: Invalid or prohibited input (negative)
- **Given** a caller submits an unsupported value, exceeds a stated limit, or attempts a prohibited transition in FR-10-027
- **When** the request is processed
- **Then** the request is rejected with the spec-defined validation error and no partial business change is committed.

### US-10-10-AC3: Permission denied
- **Given** a caller lacks `notifications.read` or is assigned to a different branch in the same organization
- **When** they request or change this capability
- **Then** the API returns 403 `COMMON.FORBIDDEN` and returns no restricted data.

### US-10-10-AC4: Cross-organization isolation
- **Given** the requested organization-owned resource belongs to another organization
- **When** the caller requests it
- **Then** the API returns 404 `COMMON.NOT_FOUND` with no existence or data disclosure (CS-08).

## Validation Rules
- Enforce supported values, thresholds, date boundaries, and state transitions stated in FR-10-027.
- Validate before persistence; failed validation produces no partial write.

## Authorization Rules
- Require notifications.read.
- Enforce token organization and branch assignment in backend queries and PostgreSQL Row-Level Security; cross-branch access returns 403 and cross-organization access returns 404.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Invalid value / forbidden transition defined by FR-10-027 | 422 `SETTINGS.INVALID_VALUE` for invalid setting values, or the applicable `COMMON.VALIDATION_FAILED` code defined in SPEC-10 |
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
| TS-10-058 | Integration | Reference values/required behavior and reconciliation (FR-10-027) | US-10-10-AC1 |
| TS-10-059 | API | Negative validation boundary causes no partial effect; spec-defined error (SETTINGS.INVALID_VALUE) | US-10-10-AC2 |
| TS-10-060 | Security | Missing permission and branch mismatch return 403 (CS-07) | US-10-10-AC3 |
| TS-10-061 | Security | Other organization returns 404 and no data (CS-08) | US-10-10-AC4 |

