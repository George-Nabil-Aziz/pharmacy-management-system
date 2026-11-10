# US-03-14: Import medicines: template and dry-run validation

| Field | Value |
|---|---|
| Story ID | US-03-14 |
| Epic | EPIC-03 |
| Priority | P1 |
| Complexity | L |
| Related Requirements | FR-03-034, FR-03-035, FR-03-036, FR-03-045 |
| Related Business Rules | BR-03-018, BR-03-019, BR-03-021, BR-03-022, BR-03-024 |
| Dependencies | US-03-01, US-03-02, US-03-03, US-03-04, US-03-06, US-03-07 |

## User Story
As a catalog administrator, I want a template and a dry-run report for medicine imports so that I can correct file and row errors before committing catalog changes.

## Business Value
Previewing a bounded import prevents accidental bulk changes and provides actionable row-level validation feedback.

## Preconditions
- The caller has `catalog.medicines.import`.
- Supported template and import processors are available.

## Acceptance Criteria
### US-03-14-AC1: Download compatible templates
- **Given** an authorized catalog administrator
- **When** they request the CSV or XLSX template
- **Then** the download contains the supported columns and one example row; CSV is UTF-8 with BOM.

### US-03-14-AC2: Validate an import without changing catalog data
- **Given** a valid CSV or XLSX file with at most 10 MB and 20,000 data rows
- **When** the caller submits it with `dryRun = true`
- **Then** a job report identifies each row as Create, Update, Unchanged, or Error, with column, stable error code, localized message, and outcome totals; no catalog data changes.

### US-03-14-AC3: Resolve reference data and protect restricted columns
- **Given** unresolved reference names, or columns for price, cost, or non-default classification without their respective permissions
- **When** the dry run validates the file
- **Then** unresolved values are reported unless permitted `createMissingReferenceData` is enabled; disallowed columns report `CATALOG.IMPORT_COLUMN_NOT_PERMITTED`.

### US-03-14-AC4: Reject unauthorized or foreign-Organization jobs
- **Given** a caller without import permission or a job id owned by another Organization
- **When** they request a template, submit a dry run, or query the job/report
- **Then** missing permission returns 403 `COMMON.FORBIDDEN` and the foreign job returns 404 `CATALOG.IMPORT_JOB_NOT_FOUND`.

## Validation Rules
- File is `.csv` UTF-8 or `.xlsx`, at most 10 MB and 20,000 data rows; headers are required and unknown columns rejected (VR-03-026).
- Row keys are unique within the file and resolve to at most one medicine; restricted columns require the corresponding permission (VR-03-027).

## Authorization Rules
- Template, dry run, job status, and report require `catalog.medicines.import`.
- Creating missing reference data additionally requires `catalog.reference-data.manage`; import never creates batches or opening stock. RLS is enabled and forced from MVP.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Missing/unknown headers or unreadable file | 400 `CATALOG.IMPORT_FILE_INVALID` |
| File exceeds 10 MB | 413 `CATALOG.IMPORT_FILE_TOO_LARGE` |
| More than 20,000 rows | 422 `CATALOG.IMPORT_TOO_MANY_ROWS` |
| Duplicate or ambiguous row match | 400 `COMMON.VALIDATION_FAILED` |
| Restricted import column | 400 `COMMON.VALIDATION_FAILED` with `CATALOG.IMPORT_COLUMN_NOT_PERMITTED` |
| Missing permission | 403 `COMMON.FORBIDDEN` |
| Foreign Organization job | 404 `CATALOG.IMPORT_JOB_NOT_FOUND` |

## Edge Cases
- Dry-run does not reserve medicine codes or mutate catalog data.
- The system does not integrate an official national drug database; external catalog sources require licensing approval under REG-09.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-03-078 | Integration | CSV and XLSX templates have supported headers, sample, and UTF-8 BOM | US-03-14-AC1 |
| TS-03-079 | Integration | Dry-run reports all row outcomes and leaves catalog unchanged | US-03-14-AC2 |
| TS-03-080 | Integration | Reference resolution and price/cost/classification permission gates | US-03-14-AC3 |
| TS-03-081 | Integration | Missing permission returns 403 and foreign job returns 404 (CS-08) | US-03-14-AC4 |
