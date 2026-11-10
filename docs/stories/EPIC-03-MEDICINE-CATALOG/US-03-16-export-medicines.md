# US-03-16: Export medicines

| Field | Value |
|---|---|
| Story ID | US-03-16 |
| Epic | EPIC-03 |
| Priority | P1 |
| Complexity | S |
| Related Requirements | FR-03-038, FR-03-045 |
| Related Business Rules | BR-03-021, BR-03-024 |
| Dependencies | US-03-12, EPIC-01 export permission |

## User Story
As an authorized catalog administrator, I want to export filtered medicines in CSV or XLSX so that I can review and maintain catalog data outside the application.

## Business Value
Consistent exports support analysis while limiting cost disclosure and preventing spreadsheet formula execution.

## Preconditions
- The caller holds `catalog.medicines.export`.
- The requested filters are supported by the medicine list.

## Acceptance Criteria
### US-03-16-AC1: Export a small result set directly
- **Given** filters matching at most 5,000 medicines
- **When** the caller requests CSV or XLSX
- **Then** the file is returned directly with template-compatible columns and only matching records.

### US-03-16-AC2: Run a large export asynchronously
- **Given** filters matching more than 5,000 medicines
- **When** the caller requests an export
- **Then** the response is 202 with a job resource; completion exposes an authorized pre-signed download link valid for 15 minutes.

### US-03-16-AC3: Protect cost data and spreadsheet consumers
- **Given** a user without `catalog.costs.read` and exported cells beginning with `=`, `+`, `-`, or `@`
- **When** the export is generated
- **Then** cost columns are omitted and formula-leading cell values are prefixed with an apostrophe.

### US-03-16-AC4: Deny unauthorized and foreign-Organization export jobs
- **Given** a caller without export permission or a job id from another Organization
- **When** they request an export or retrieve its job/link
- **Then** missing permission returns 403 `COMMON.FORBIDDEN` and the foreign job returns 404 with no download link.

## Validation Rules
- Export format is CSV or XLSX; filters must match the list API schema.
- Only users with `catalog.costs.read` receive `LastPurchaseCost` fields.

## Authorization Rules
- Export and job retrieval require `catalog.medicines.export`; cost columns additionally require `catalog.costs.read`.
- Signed links are issued only after authorization and expire after 15 minutes. RLS is enabled and forced from MVP.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Missing export permission | 403 `COMMON.FORBIDDEN` |
| Invalid format/filter | 400 `COMMON.VALIDATION_FAILED` |
| Foreign or missing export job | 404 `COMMON.NOT_FOUND` |

## Edge Cases
- A result set of exactly 5,000 rows is returned directly; 5,001 rows use a job.
- Cost columns are omitted rather than populated with null for unauthorized users.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-03-086 | Integration | CSV/XLSX direct export with filters at 5,000 rows | US-03-16-AC1 |
| TS-03-087 | Integration | 5,001-row export returns job and a 15-minute signed link | US-03-16-AC2 |
| TS-03-088 | Integration | Cost permission omission and formula-leading cell neutralization | US-03-16-AC3 |
| TS-03-089 | Integration | Missing permission returns 403 and foreign job returns 404 | US-03-16-AC4 |
