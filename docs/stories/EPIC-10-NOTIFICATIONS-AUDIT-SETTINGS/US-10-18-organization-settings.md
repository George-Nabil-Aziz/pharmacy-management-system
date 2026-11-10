# US-10-18: Organization Settings

| Field | Value |
|---|---|
| Story ID | US-10-18 |
| Epic | EPIC-10 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-10-040, FR-10-041 |
| Related Business Rules | BR-G-16, BR-G-17 |
| Dependencies | US-10-17 |

## User Story
As an authorized pharmacy staff member, I want organization settings, so that I can use correct, traceable, and access-controlled results.

## Business Value
Delivers the capability defined by FR-10-040, FR-10-041 with scoped results and measurable outcomes.

## Preconditions
- Source entities and settings required by FR-10-040, FR-10-041 exist.
- PostgreSQL Row-Level Security is enabled from MVP; organization and branch claims are available.

## Acceptance Criteria
### US-10-18-AC1: Required behavior and boundaries
- **Given** Given source events/records matching the required rules in FR-10-040, FR-10-041, with one item deliberately outside the effective scope.
- **When** an authorized caller uses the capability for the scope defined by FR-10-040, FR-10-041
- **Then** the system applies each requirement in FR-10-040, FR-10-041; monetary values, where present, use decimal arithmetic and 2-decimal AwayFromZero rounding. No out-of-scope row contributes to returned totals.

### US-10-18-AC2: Invalid or prohibited input (negative)
- **Given** a caller submits an unsupported value, exceeds a stated limit, or attempts a prohibited transition in FR-10-040, FR-10-041
- **When** the request is processed
- **Then** the request is rejected with the spec-defined validation error and no partial business change is committed.

### US-10-18-AC3: Permission denied
- **Given** a caller lacks `settings.organization.manage` or is assigned to a different branch in the same organization
- **When** they request or change this capability
- **Then** the API returns 403 `COMMON.FORBIDDEN` and returns no restricted data.

### US-10-18-AC4: Cross-organization isolation
- **Given** the requested organization-owned resource belongs to another organization
- **When** the caller requests it
- **Then** the API returns 404 `COMMON.NOT_FOUND` with no existence or data disclosure (CS-08).

## Validation Rules
- Enforce supported values, thresholds, date boundaries, and state transitions stated in FR-10-040, FR-10-041.
- Validate before persistence; failed validation produces no partial write.

## Authorization Rules
- Require settings.organization.manage.
- Enforce token organization and branch assignment in backend queries and PostgreSQL Row-Level Security; cross-branch access returns 403 and cross-organization access returns 404.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Invalid value / forbidden transition defined by FR-10-040, FR-10-041 | 422 `SETTINGS.INVALID_VALUE` for invalid setting values, or the applicable `COMMON.VALIDATION_FAILED` code defined in SPEC-10 |
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
| TS-10-090 | Integration | Reference values/required behavior and reconciliation (FR-10-040, FR-10-041) | US-10-18-AC1 |
| TS-10-091 | API | Negative validation boundary causes no partial effect; spec-defined error (SETTINGS.INVALID_VALUE) | US-10-18-AC2 |
| TS-10-092 | Security | Missing permission and branch mismatch return 403 (CS-07) | US-10-18-AC3 |
| TS-10-093 | Security | Other organization returns 404 and no data (CS-08) | US-10-18-AC4 |

