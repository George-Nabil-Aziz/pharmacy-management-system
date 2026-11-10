# US-02-08: Gapless Document Numbering Sequences

| Field | Value |
|---|---|
| Story ID | US-02-08 |
| Epic | EPIC-02 |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-02-014, FR-02-022, FR-02-023, FR-02-024, FR-02-025 |
| Related Business Rules | BR-G-23, BR-G-24, BR-02-003, BR-02-011, BR-02-012 |
| Dependencies | US-02-06 |

## User Story
As an Accountant, I want every financial document to carry a unique, gapless, human-readable number per branch, type, and year so that documents can be referenced and audited without missing numbers.

## Business Value
Implements BR-G-24 once for all posting workflows (sales invoice, sales return, goods receipt, supplier return, supplier payment, stock transfer, stock adjustment).

## Preconditions
- Branch exists with a code; consuming modules call `AllocateDocumentNumber` inside their posting transaction.
- Until consuming modules exist, ACs are verified with a test posting harness that opens a transaction, allocates a `SalesInvoice` number, writes a test document row, and commits or rolls back.

## Acceptance Criteria

### US-02-08-AC1: Format and first number
- **Given** branch `CAI01` with no sales invoices in 2026
- **When** the first sale is completed on business date 2026-03-10
- **Then** the invoice number is `CAI01-INV-2026-000001` and a `DocumentSequence` row (CAI01, SalesInvoice, 2026, CurrentValue = 1) exists.

### US-02-08-AC2: Rollback consumes no number
- **Given** current value 5 for (CAI01, SalesInvoice, 2026)
- **When** a sale posting fails after number allocation and rolls back, and the next sale succeeds
- **Then** the successful sale receives `CAI01-INV-2026-000006`.

### US-02-08-AC3: Concurrency produces no duplicates or gaps
- **Given** 20 concurrent workers posting 500 documents each to (CAI01, SalesInvoice, 2026) with 10% forced rollbacks
- **When** all complete
- **Then** issued numbers are exactly 1..N with N = number of committed postings, no duplicates, and allocation adds ≤ 20 ms p95 to the posting transaction.

### US-02-08-AC4: Year rollover uses branch business date
- **Given** branch time zone `Africa/Cairo`, last 2026 number 000950
- **When** a sale commits at 2026-12-31T22:00:01Z (2027-01-01 00:00:01 Cairo)
- **Then** its number is `CAI01-INV-2027-000001`.

### US-02-08-AC5: Read-only sequence view
- **Given** a Manager with `settings.branch.manage`
- **When** they call `GET /api/v1/branches/{branchId}/document-sequences?year=2026`
- **Then** they receive each document type with current value and last issued number; no endpoint accepts PUT/POST/DELETE on sequences (405).

### US-02-08-AC6: Permission denied
- **Given** a Cashier
- **When** they call the sequence view
- **Then** the response is 403 `COMMON.FORBIDDEN`.

### US-02-08-AC7: Sequences are per branch
- **Given** branches `CAI01` and `ALX02`
- **When** each completes its first 2026 sale
- **Then** the numbers are `CAI01-INV-2026-000001` and `ALX02-INV-2026-000001`.

## Validation Rules
- `DocumentType` must be one of the seven types in SPEC-02 §8.3; any other value is a programming error (500) caught by unit tests.
- Allocation outside an active database transaction is rejected (programming error).

## Authorization Rules
- Allocation is internal (no HTTP endpoint); view requires `settings.branch.manage` + branch in scope.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Cashier views sequences | 403 `COMMON.FORBIDDEN` |
| Write attempt on sequence route | 405 (method not allowed) |
| Branch of another organization | 404 `COMMON.NOT_FOUND` |
| Posting for `Inactive` branch | 409 `ORG.BRANCH_INACTIVE` (no number allocated) |

## Edge Cases
- Value above 999,999 renders with 7 digits (`CAI01-INV-2026-1000000`).
- The first allocation of a year creates the row; two concurrent first allocations result in one row (insert-if-absent then lock).
- Lock order: the sequence row is locked after stock rows (BR-G-10) to avoid deadlocks; consuming specs follow this order.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-02-042 | Integration | First number format and sequence row | US-02-08-AC1, US-02-08-AC7 |
| TS-02-043 | Integration | Rollback consumes no number | US-02-08-AC2 |
| TS-02-044 | Concurrency | 20 × 500 postings with 10% rollbacks → gapless, unique, latency budget | US-02-08-AC3 |
| TS-02-045 | Integration | Year rollover at Cairo midnight with fake clock | US-02-08-AC4 |
| TS-02-046 | API | Read-only view, 405 on writes, Cashier 403 | US-02-08-AC5, US-02-08-AC6 |
