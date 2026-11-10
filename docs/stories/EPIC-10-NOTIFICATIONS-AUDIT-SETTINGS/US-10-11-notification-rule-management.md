# US-10-11: Notification Rule Management

| Field | Value |
|---|---|
| Story ID | US-10-11 |
| Epic | EPIC-10 |
| Priority | P1 |
| Complexity | M |
| Related Requirements | FR-10-028 |
| Related Business Rules | BR-G-16, BR-G-17 |
| Dependencies | US-10-08 |

## User Story
As an authorized pharmacy staff member, I want notification rule management, so that I can use correct, traceable, and access-controlled results.

## Business Value
Delivers the capability defined by FR-10-028 with scoped results and measurable outcomes.

## Preconditions
- Source entities and settings required by FR-10-028 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

## Acceptance Criteria
### US-10-11-AC1: Required behavior and boundaries
- **Given** Given source events/records matching the required rules in FR-10-028, with one item deliberately outside the effective scope.
- **When** an authorized caller uses the capability for the scope defined by FR-10-028
- **Then** the system applies each requirement in FR-10-028; monetary values, where present, use decimal arithmetic and 2-decimal AwayFromZero rounding. No out-of-scope row contributes to returned totals.

### US-10-11-AC2: Invalid or prohibited input (negative)
- **Given** a caller submits an unsupported value, exceeds a stated limit, or attempts a prohibited transition in FR-10-028
- **When** the request is processed
- **Then** the request is rejected with the spec-defined validation error and no partial business change is committed.

### US-10-11-AC3: Permission denied
- **Given** a caller lacks `notifications.rules.manage` or is assigned to a different branch in the same organization
- **When** they request or change this capability
- **Then** the API returns 403 `COMMON.FORBIDDEN` and returns no restricted data.

### US-10-11-AC4: Cross-organization isolation
- **Given** the requested organization-owned resource belongs to another organization
- **When** the caller requests it
- **Then** the API returns 404 `COMMON.NOT_FOUND` with no existence or data disclosure (CS-08).

## Validation Rules
- Enforce supported values, thresholds, date boundaries, and state transitions stated in FR-10-028.
- Validate before persistence; failed validation produces no partial write.

## Authorization Rules
- Require notifications.rules.manage.
- Enforce token organization and branch assignment in backend queries and PostgreSQL Row-Level Security; cross-branch access returns 403 and cross-organization access returns 404.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Invalid value / forbidden transition defined by FR-10-028 | 422 `SETTINGS.INVALID_VALUE` for invalid setting values, or the applicable `COMMON.VALIDATION_FAILED` code defined in SPEC-10 |
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
| TS-10-062 | Integration | Reference values/required behavior and reconciliation (FR-10-028) | US-10-11-AC1 |
| TS-10-063 | API | Negative validation boundary causes no partial effect; spec-defined error (SETTINGS.INVALID_VALUE) | US-10-11-AC2 |
| TS-10-064 | Security | Missing permission and branch mismatch return 403 (CS-07) | US-10-11-AC3 |
| TS-10-065 | Security | Other organization returns 404 and no data (CS-08) | US-10-11-AC4 |

