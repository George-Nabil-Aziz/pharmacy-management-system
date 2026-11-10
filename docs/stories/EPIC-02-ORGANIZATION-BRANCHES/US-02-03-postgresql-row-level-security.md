# US-02-03: PostgreSQL Row-Level Security Defense in Depth

| Field | Value |
|---|---|
| Story ID | US-02-03 |
| Epic | EPIC-02 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-02-007 |
| Related Business Rules | BR-G-17 |
| Dependencies | US-02-01 |

## User Story
As a platform operator, I want the database itself to refuse cross-organization reads and writes so that an application-layer defect (missing filter, raw SQL) cannot leak data.

## Business Value
Second, independent isolation layer (ADR-002, layer L7). Limits blast radius of a defect in application filters.

## Preconditions
- Every tenant-owned table has a non-null `organization_id` column.
- Separate database roles exist: migration role (owner) and application role (non-owner, no `BYPASSRLS`), plus a platform role for allow-listed cross-organization components.
- Enabled from Phase 0 and part of the MVP (ADR-002 amended 2026-11-10; OD-02-08 resolved). Policies are created in the same migration as each tenant-owned table.

## Acceptance Criteria

### US-02-03-AC1: Policies exist on every tenant-owned table
- **Given** the migrated database
- **When** the catalog check test lists tables with an `organization_id` column
- **Then** each has RLS enabled and forced, with a policy for SELECT, INSERT, UPDATE, and DELETE comparing `organization_id` to `current_setting('app.organization_id')`.

### US-02-03-AC2: Query without organization setting returns no rows
- **Given** a connection under the application role with `app.organization_id` not set
- **When** it selects from `inventory.batches`
- **Then** zero rows are returned although rows exist.

### US-02-03-AC3: Raw SQL cannot read another organization
- **Given** a transaction of Org A with `SET LOCAL app.organization_id` = Org A
- **When** a raw SQL query without an organization predicate selects from `sales.sales`
- **Then** only Org A rows are returned.

### US-02-03-AC4: Cross-organization insert rejected by the database
- **Given** a transaction of Org A
- **When** a raw SQL insert sets `organization_id` = Org B
- **Then** the database rejects the insert with a policy violation and the transaction rolls back.

### US-02-03-AC5: Setting does not leak across pooled connections
- **Given** connection pooling with 2 physical connections and alternating Org A / Org B requests
- **When** 1,000 requests run
- **Then** every request sees only its own organization's rows (the setting is transaction-scoped via `SET LOCAL`).

### US-02-03-AC6: Performance budget
- **Given** the NFR-G-02 and NFR-G-03 benchmarks
- **When** run with RLS enabled vs disabled
- **Then** p95 latency increases by ≤ 10% (NFR-02-006).

## Validation Rules
- Migration check fails if a new table with `organization_id` lacks policies.

## Authorization Rules
- Application role: no table ownership, no `BYPASSRLS`. Platform role usable only by allow-listed components (organization metadata listing, provisioning, cross-organization jobs), each access logged.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Application query without organization setting | 0 rows; API returns 404 `COMMON.NOT_FOUND` for the requested id |
| Insert with mismatched organization | 500 `COMMON.INTERNAL_ERROR`; transaction rolled back; security log event |

## Edge Cases
- Organization table itself (`org.organizations`) is filtered by `id = app.organization_id` for the application role.
- Background jobs iterating organizations set the setting per organization transaction.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-02-013 | Database | Catalog check: RLS enabled+forced with 4 policies on every tenant table | US-02-03-AC1 |
| TS-02-014 | Database | No setting → 0 rows | US-02-03-AC2 |
| TS-02-015 | Database (CS-08) | Raw SQL without predicate returns own organization only; cross-org insert rejected | US-02-03-AC3, US-02-03-AC4 |
| TS-02-016 | Integration | Pooled alternating requests show no leakage | US-02-03-AC5 |
| TS-02-017 | Performance | Benchmark delta ≤ 10% p95 | US-02-03-AC6 |
