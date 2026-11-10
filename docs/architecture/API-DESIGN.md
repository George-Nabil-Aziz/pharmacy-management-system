# API Design

## 1. Purpose and principles

This document defines the external HTTP contract for the Pharmacy Management System (PMS). The API is the public boundary of the .NET 10 modular monolith; modules own their resource contracts and communicate with one another through the in-process facades and outbox described in [SYSTEM-ARCHITECTURE.md](SYSTEM-ARCHITECTURE.md).

Principles:

1. Use REST resources and explicit business-action routes; never expose database tables or cross-module joins as an API contract.
2. Derive organization identity from the validated access token. Do not accept an organization identifier as an authorization input.
3. Use server-side permission, branch-scope, and PostgreSQL RLS enforcement. Frontend route guards are only a UX aid.
4. Make errors machine-readable with stable codes; localize human-readable text independently.
5. Protect retried business commands with idempotency, and protect mutable resources with optimistic concurrency.
6. Do not return or log more sensitive data than the caller is permitted to see.
7. Keep API behavior consistent with [DOCUMENTATION-CONVENTIONS.md](../DOCUMENTATION-CONVENTIONS.md) §5 and §7, the ADRs, and SPEC-01–SPEC-10. This document consolidates their endpoint inventory; it does not silently resolve source-spec differences (see §16).

## 2. Base URL, resource paths, and naming

- API base path: `/api/v1`. Production uses HTTPS; local development may use HTTP on loopback.
- Resource collections use plural, kebab-case nouns: `/purchase-orders`, `/sales-returns`, `/active-ingredients`.
- Branch-scoped resources are rooted at `/api/v1/branches/{branchId}/...`. Verify branch organization and caller assignment on every request.
- Organization-level resources are rooted directly at `/api/v1/...`; their organization is taken from the token. Examples include `/api/v1/catalog/medicines`, `/api/v1/suppliers`, and `/api/v1/patients`.
- Platform-admin resources use `/api/v1/platform/...` and accept only platform-audience credentials. A platform support session is a separately audited, time-limited grant.
- Use lower camelCase for JSON properties, stable UUID resource identifiers, and explicit action subresources for workflow transitions (for example, `POST .../{id}/approve`).
- Query parameters are explicit and allow-listed. Do not treat arbitrary query parameters as database field names.
- Route templates below use `{branchId}`, `{id}`, and similar placeholders; they are not literal values.

## 3. Representation and wire formats

All JSON uses UTF-8 and lower camelCase. Timestamps are ISO-8601 UTC strings with a `Z` suffix; business dates are ISO-8601 calendar dates (`YYYY-MM-DD`) interpreted in the branch time zone. Money is serialized as a decimal **string**, with the scale specified by the field (normally two decimal places; unit costs and unit prices may use four). Quantities are integers in base units unless the endpoint explicitly describes a pack count. Never use floating-point JSON numbers for money.

Example request:

```http
POST /api/v1/branches/0193a1c2-7f00-7c3e-9a51-3b6f2a9d0e11/sales
Authorization: Bearer <access-token>
Accept: application/json
Accept-Language: ar
Content-Type: application/json
Idempotency-Key: 0193a1c2-7f00-7c3e-9a51-3b6f2a9d0e12
X-Correlation-Id: 0193a1c2-7f00-7c3e-9a51-3b6f2a9d0e13
```

```json
{
  "cashSessionId": "0193a1c2-7f00-7c3e-9a51-3b6f2a9d0e14",
  "lines": [
    { "medicineId": "0193a1c2-7f00-7c3e-9a51-3b6f2a9d0e15", "unit": "BaseUnit", "quantity": 7 }
  ],
  "payments": [{ "method": "Cash", "tenderedAmount": "200.00" }],
  "expectedTotal": "32.50"
}
```

Example successful collection:

```json
{
  "items": [
    {
      "id": "0193a1c2-7f00-7c3e-9a51-3b6f2a9d0e15",
      "nameEn": "Example Medicine",
      "packPrice": "120.00",
      "baseUnitPrice": "8.0000",
      "updatedAt": "2026-11-10T06:16:50.580Z"
    }
  ],
  "page": 1,
  "pageSize": 25,
  "totalCount": 1
}
```

Read-only responses omit fields the caller is not allowed to see (for example, cost or medical details); they do not substitute `null` for restricted data unless a spec explicitly defines a minimized response.

## 4. HTTP methods and status codes

| Status | Use |
|---|---|
| `200 OK` | Successful read or command returning a representation; includes replayed idempotent responses. |
| `201 Created` | Synchronously created resource. Return `Location`; include an ETag when the resource is mutable. |
| `202 Accepted` | Work accepted for asynchronous processing. Return a job/export resource identifier and a polling URL in `Location` or the response body. |
| `204 No Content` | Successful operation with no response representation, including naturally idempotent state-setting requests when the spec says no body. |
| `400 Bad Request` | Malformed request or request/field validation failure where the applicable spec maps validation to 400. |
| `401 Unauthorized` | Missing, invalid, expired, wrong-audience, or revoked authentication; include `WWW-Authenticate: Bearer` for bearer authentication failures. |
| `403 Forbidden` | Authenticated caller lacks a permission or is outside their assigned branch scope within their own organization. |
| `404 Not Found` | Resource does not exist or is owned by a different organization. Also use when a resource's branch does not match the branch in its route where the spec requires concealed lookup. |
| `409 Conflict` | State conflict, duplicate/in-flight command, or business conflict that must be resolved before retrying. |
| `412 Precondition Failed` | `If-Match` was supplied but the current ETag does not match. |
| `422 Unprocessable Content` | Structurally valid request violates a business rule or a module maps validation to 422. Some specs currently use this for field validation; see §16. |
| `428 Precondition Required` | A required `If-Match` header is missing. |
| `429 Too Many Requests` | Rate limit exceeded. Include `Retry-After` seconds. |
| `500 Internal Server Error` | Unexpected failure. Return a generic Problem Details body; never expose stack traces, SQL, or secrets. |
| `503 Service Unavailable` | Temporary dependency, lock, timeout, or mandatory audit/access-log failure. Include `Retry-After` when a retry interval is known. |

Use the status and code explicitly assigned to a module error in the catalog (§17). In particular, do not convert every domain error to 400: duplicate/state conflicts generally use 409, permission failures 403, missing resources 404, and retryable infrastructure failures 503.

## 5. Error contract: RFC 9457 Problem Details

Every API error uses `application/problem+json` and RFC 9457 members (`type`, `title`, `status`, `detail`, `instance`) where applicable, plus these extensions:

- `code`: stable, uppercase, namespaced code. Clients branch on this value, never on a localized message.
- `traceId`: W3C trace id used to correlate the response with logs and traces; also returned in `X-Trace-Id`.
- `errors`: optional object mapping a field/path to an array of `{ code, message }` entries.
- `message`: localized user-facing summary selected using `Accept-Language` (`ar` or `en`); default to the organization's language when no supported language is requested.

Validation example:

```json
{
  "type": "https://errors.pharmacy.example/common/validation-failed",
  "title": "Validation failed",
  "status": 400,
  "detail": "One or more fields are invalid.",
  "instance": "/api/v1/branches/0193a1c2-7f00-7c3e-9a51-3b6f2a9d0e11/sales",
  "code": "COMMON.VALIDATION_FAILED",
  "traceId": "4bf92f3577b34da6a3ce929d0e0e4736",
  "message": "يرجى تصحيح الحقول المحددة.",
  "errors": {
    "lines[0].quantity": [
      { "code": "SALES.INVALID_QUANTITY", "message": "يجب أن تكون الكمية عدداً صحيحاً موجباً." }
    ],
    "expectedTotal": [
      { "code": "SALES.PRICE_MISMATCH", "message": "تغير إجمالي البيع؛ راجع عرض السعر." }
    ]
  }
}
```

The top-level message and each field message are localized; their codes do not change with language. Never echo patient medical values, credentials, bearer tokens, raw uploaded content, or SQL in an error. Unexpected exceptions map to `500 COMMON.INTERNAL_ERROR`. Expected domain failures are result values with a code and resource key, not exceptions.

### Global `COMMON.*` codes

| Code | HTTP | Meaning |
|---|---:|---|
| `COMMON.VALIDATION_FAILED` | 400 or 422 per module spec | Generic request validation; `errors` contains field-specific codes. |
| `COMMON.UNAUTHENTICATED` | 401 | Required authentication is absent or invalid. |
| `COMMON.FORBIDDEN` | 403 | Permission or branch-scope check failed. |
| `COMMON.NOT_FOUND` | 404 | Resource absent or in another organization. |
| `COMMON.CONFLICT` | 409 | Generic conflict when no more specific code is registered. |
| `COMMON.CONCURRENCY_CONFLICT` | 412 | Supplied ETag is stale. |
| `COMMON.PRECONDITION_FAILED` | 412 | Used in SPEC-02/SPEC-10 for stale `If-Match`; normalize to `COMMON.CONCURRENCY_CONFLICT` in a future spec revision. |
| `COMMON.PRECONDITION_REQUIRED` | 428 | Required `If-Match` missing. |
| `COMMON.IDEMPOTENCY_KEY_REQUIRED` | 400 | A required idempotency key is absent or malformed. |
| `COMMON.IDEMPOTENCY_KEY_REUSED` | 422 | Same scoped key was reused with a different request hash. |
| `COMMON.RATE_LIMITED` | 429 | Rate limit exceeded; return `Retry-After`. |
| `COMMON.INTERNAL_ERROR` | 500 | Unexpected server failure. |
| `COMMON.LOCK_TIMEOUT` | 503 | Database lock wait timed out; retry guidance is provided when safe. |
| `COMMON.TRANSIENT_CONFLICT` | 503 | Deadlock/serialization retry budget exhausted. |
| `COMMON.TRANSIENT_FAILURE` | 503 | Temporary failure in SPEC-06 terminology; consolidate with `COMMON.TRANSIENT_CONFLICT` in a future spec revision. |
| `COMMON.TIMEOUT` | 503 | Command/query timeout. |
| `COMMON.REFERENCE_NOT_FOUND` | 422 in SPEC-02 | Request body refers to a resource unavailable in the organization. |
| `COMMON.TENANT_MISMATCH` | Internal 500 (client receives `COMMON.INTERNAL_ERROR`) | Tenant write-stamping invariant violation; detailed code is logged only. |

## 6. Authorization and tenant visibility

All checks occur server-side and are applied in this order: authenticate; establish tenant context from the token; verify resource organization; check permission; check branch scope; apply business rules. PostgreSQL RLS is enabled and forced from MVP on every tenant-owned table (ADR-002). The app DB role does not own tables and does not have `BYPASSRLS`.

- **401**: no valid organization/platform token, wrong token audience, expired/revoked session, or missing required tenant claims.
- **403**: valid identity in the correct organization but missing permission, or attempting a branch the user is not assigned to.
- **404**: any identifier owned by another organization, to avoid disclosing the other tenant's resource. A resource belonging to a different branch than the branch in its route also returns 404 where its spec requires hiding branch-level identifiers.
- A branch id belonging to the caller's organization but outside the caller's assignments returns 403, not 404. A branch that belongs to another organization returns 404.
- `PLATFORM_ADMIN` has no implicit business-data access. Support access requires a valid grant and each support request is audited.
- Never rely on client-supplied `organizationId`, hidden UI controls, or client filtering for authorization.

## 7. Collections, filtering, sorting, and search

Standard list routes use offset pagination:

- `page` is 1-based; default `page=1`.
- `pageSize` defaults to 25 and is capped at 100.
- Response shape: `{ "items": [], "page": 1, "pageSize": 25, "totalCount": 0 }`.
- Invalid or excessive values return the module's validation Problem Details.

High-volume, append-only ledgers and audit/access logs use cursor pagination (`cursor`, `limit`) to provide stable traversal; default limits follow the owning spec (normally 100, maximum 200). Cursors are opaque and bound to the query/scope; clients must not synthesize them.

Filters use named query parameters defined by the resource. Sort with `sort=field,-field2` (ascending `field`, descending `field2`); reject unrecognized fields. Search uses `q` or the more specific parameters in the module spec and applies the module's normalization and minimum-length rules. List endpoints must apply authorization filters before pagination and counts.

## 8. Optimistic concurrency: ETag and If-Match

Mutable aggregates expose a strong ETag derived from PostgreSQL `xmin` (EF Core `RowVersion` mapping). Clients send `If-Match: "<etag>"` for updates and any workflow transition whose spec requires it.

- Missing required `If-Match` → `428 COMMON.PRECONDITION_REQUIRED`.
- ETag mismatch → `412 COMMON.CONCURRENCY_CONFLICT` (or legacy `COMMON.PRECONDITION_FAILED` where explicitly documented in SPEC-02/SPEC-10).
- A successful mutation returns the new ETag.
- Commands requiring both an ETag and an idempotency key must satisfy both contracts. The key does not bypass concurrency checks.
- Ledger rows and completed immutable documents are not updated in place; use their documented compensating/action operations.

## 9. Idempotency

The required operations are the union of DOCUMENTATION-CONVENTIONS §7 and explicit additions in the specs. An endpoint marked required rejects a missing/invalid UUID `Idempotency-Key` with `400 COMMON.IDEMPOTENCY_KEY_REQUIRED`.

**Required operations:**

| Module | Operations requiring `Idempotency-Key` |
|---|---|
| SPEC-02 Organization | `POST /api/v1/platform/organizations` provisioning. |
| SPEC-03 Catalog | `POST /api/v1/catalog/imports` when `dryRun=false`. |
| SPEC-04 Inventory | Recall; opening-balance posting; adjustment submit/post and approval; write-off submit/post and approval; transfer approval, dispatch, and receipt; stocktake posting/approval. Use the exact action endpoints and state transitions defined in SPEC-04. |
| SPEC-05 Procurement | Goods-receipt posting and reversal; supplier-invoice posting and cancellation; supplier-return posting; supplier-payment creation, allocation, and reversal; supplier opening balance. |
| SPEC-06 Sales / SPEC-08 dispensing | Cash-session opening, cash movement, close and force-close; sale completion; sale void; return creation, approval/rejection and disposition; sale/return print recording; any dispensing performed through sale completion. |
| SPEC-07 Patients | Patient merge, export request, and anonymization. |
| SPEC-09 Finance & Reporting | Expense creation/reversal/approval; report-projection rebuild. Background report-export request accepts an optional key in SPEC-09. |

For any remaining write endpoint, follow its spec's `Idempotency` column: `Optional` means supported but not mandatory; `If-Match` or `Natural` is not an idempotency key. Read-only calls never require a key. User signup/invitation, selected draft creation, and other optional-key cases remain optional unless a source spec marks them required.

**Storage and behavior**

1. Store the key, request hash, response status/body and replay-safe response headers in the same transaction as the business effect. Retain the record for 24 hours.
2. Uniquely scope records by `(OrganizationId, UserId, Key)`; anonymous/platform flows use their appropriate principal scope. Keys from different users or organizations are isolated.
3. Same key + same canonical request hash replays the original response, including the original success status and resource/job identifier.
4. Same key + different hash returns `422 COMMON.IDEMPOTENCY_KEY_REUSED`.
5. A concurrent duplicate while the first request is still in flight returns `409 COMMON.CONFLICT`; the client retries later with the same key. This in-flight outcome has no dedicated code in the current conventions/specs.
6. A rolled-back attempt stores no successful result; retrying with the same key is safe. The client must reuse the key for retries of the same user action and generate a new key after changing the command payload.

## 10. Rate limits

Apply partitioned limits before application command handling:

| Partition | Limit |
|---|---|
| Login | 10 requests/minute per (source IP, normalized e-mail) and 30 requests/minute per source IP (SPEC-01 FR-01-018). |
| Forgot password / signup / token redemption | 3/hour per e-mail and 10/hour per IP; 5/hour per IP; 10/hour per IP (SPEC-01 FR-01-018). |
| Authenticated API | 300 requests/minute per user. |
| Refresh | 30 requests/minute per source IP (ADR-005/system pipeline). |
| Patient search | SPEC-07 additionally caps search at 60 requests/minute per user. |

Return `429 COMMON.RATE_LIMITED` and `Retry-After`. Do not reveal whether a login e-mail exists. Endpoint-specific limits may be stricter than the general user limit.

## 11. Versioning and deprecation

Use a major version in the URL (`/api/v1`). Additive fields and endpoints remain within the current major version; breaking changes require a new major path. For a deprecated endpoint, return `Deprecation` and `Sunset` response headers, document the replacement, and provide at least six months' notice before removal. Deprecation does not weaken tenant, permission, audit, or retention requirements.

## 12. Files and object storage

Use the private S3-compatible storage abstraction in ADR-006 (MinIO locally/on-premises; selected compatible provider in production). Authorize every upload request, upload confirmation, and download URL request before issuing a short-lived URL; URLs themselves are bearer capabilities and must not be logged or sent in referrers.

- Upload flows create a pending `FileObject`; after upload, verify object existence, measured size, SHA-256, and file signature before activating/linking it.
- Prescription/invoice images and PDFs are initially limited to 10 MiB; catalog/import files to 20 MiB in the shared file policy. A more restrictive owning-spec limit takes precedence (for example, catalog import 10 MB, inventory import 5 MB).
- Allow-list and signature-check types per purpose. Prescription attachments allow JPEG, PNG, PDF, and HEIC per SPEC-08; malware scanning is required where configured and scan-pending/infected files cannot be accessed.
- Pre-signed PUT/GET URLs expire within 5 minutes. An API authorization check is required before issuing a GET URL; prescription attachment URL routes return a 300-second URL.
- Organization data export download may follow the owning spec's longer 24-hour URL limit; report exports use the 5-minute limit. These purpose-specific durations override the general file default.
- Private buckets, TLS in transit, environment-specific credentials, opaque storage keys, and no public ACLs are required.
- Deletion and orphan cleanup follow ADR-006 and the retention decision; no application user may hard-delete a file linked to a retained record.

## 13. Long-running commands and exports

Return `202 Accepted` for work that exceeds the interactive budget or is explicitly asynchronous (large report/catalog imports and exports, audit exports, patient exports, projection rebuilds, on-demand chain verification). Include a stable job/export resource URI and status such as `Queued`, `Running`, `Succeeded`, or `Failed`; expose progress/result/failure code only to an authorized caller.

The client polls the status resource with bounded backoff. On completion, notify through SignalR as a hint and require a subsequent authorized REST read/download. Re-check the requester's authorization at job execution and download time. Store generated files privately and return a pre-signed URL only after authorization. Synchronous report responses must honor SPEC-09's range/row limits.

## 14. SignalR contract

- Hub URL: `/hubs/notifications`; JSON protocol; WebSockets preferred with SSE/long-polling fallback.
- Authenticate with the same JWT. Browser `access_token` query transport is accepted only on the hub negotiate/connect path and is excluded from query-string logs.
- Server-managed groups: `org:{orgId}`, `branch:{branchId}`, and `user:{userId}`. The server validates current organization and branch assignments; clients cannot join arbitrary groups.
- Events: `notificationCreated`, `notificationCountChanged` (SPEC-10 also calls this `unreadCountChanged`), `notificationStatusChanged`, `announcementChanged`, `stockHint`, `transferStatusChanged`, `exportReady`, and `sessionRevoked`.
- Payloads contain identifiers, display keys, status/counts, and non-authoritative stock hints only. Never send patient medical data. Clients refetch authoritative resource details over REST.
- Delivery is best-effort; clients refetch/invalidate relevant TanStack Query data on reconnect. SignalR hints never authorize or decide stock allocation.
- Close connections on access-token expiry and reauthorize on permission/session changes. More than one API instance requires a Redis SignalR backplane.

## 15. OpenAPI, contract tests, and generated clients

Generate and publish an OpenAPI document from ASP.NET Core endpoint metadata and XML/API annotations in CI. Keep the document versioned as a build artifact and validate it for duplicate operations, missing auth/permission descriptions, missing response schemas, and undocumented status/error codes.

CI runs contract tests against OpenAPI and representative HTTP behavior: request/response schemas, Problem Details, localization, status mappings, ETag/If-Match, idempotency replay/conflict, and cross-organization 404 / branch-scope 403 behavior. Integration tests use PostgreSQL 17 with RLS enabled, not a bypassed or SQLite substitute.

Generate TypeScript schema types from OpenAPI with `openapi-typescript`. Use a small typed `fetch` wrapper (using the generated `paths` types) for bearer-token injection, refresh single-flight, `Accept-Language`, correlation IDs, idempotency and ETag headers, and structured Problem Details. Query hooks call this wrapper and integrate with TanStack Query. This keeps generated contracts separate from runtime policy, provides typed endpoint inputs/outputs, and avoids a second server-state cache or manually duplicated DTO definitions.

## 16. Endpoint map (SPEC-01–SPEC-10)

The rows below group related operations for architectural orientation; the owning spec remains authoritative for full parameter lists, action preconditions, optional features, and individual response bodies. Permission names are shown as in the specs, including legacy aliases requiring reconciliation. `Yes` means the key is required; `Optional` means the spec allows it without requiring it; `No` means none is specified.

### SPEC-01 — Identity & Access

| Method | Path | Permission | Idempotent |
|---|---|---|---|
| POST | `/api/v1/auth/{signup,signup/verify,login,refresh,logout,logout-all,password/*,invitations/*}` | Anonymous / authenticated as applicable | Optional for signup; otherwise natural or no key per SPEC-01 |
| GET | `/api/v1/auth/{me,sessions}` | Authenticated | No |
| POST, DELETE | `/api/v1/auth/mfa/*` | Authenticated (P2) | Natural/no key per action |
| GET | `/api/v1/permissions`, `/api/v1/roles[/{roleId}]`, `/api/v1/users[/{userId}]`, `/api/v1/users/{userId}/login-attempts`, `/api/v1/users/{userId}/sessions` | `identity.roles.read`, `identity.users.read`, or `identity.sessions.read` | No |
| POST, PUT, PATCH, DELETE | `/api/v1/roles[/{roleId}[/{clone}]]`, `/api/v1/users[/{userId}]/...` | `identity.roles.manage`, `identity.users.*`, or `org.branch-assignments.manage` | Optional on user invitation/create; otherwise `If-Match`, natural, or no key per SPEC-01 |
| POST, DELETE | `/api/v1/branches/{branchId}/auth/override`, `/api/v1/platform/auth/{login,refresh,logout}` | `sales.pos.sell` plus approver scope; platform anonymous/session | No / natural |

### SPEC-02 — Organization & Branches

| Method | Path | Permission | Idempotent |
|---|---|---|---|
| GET, POST | `/api/v1/platform/organizations[/{organizationId}]`, `/api/v1/platform/support-grants`, `/api/v1/platform/support-sessions` | `org.platform-organizations.*` | Provision: **Yes**; other actions no |
| GET, PUT | `/api/v1/organization[/{settings}]` | `org.organization.read/update`, `settings.organization.manage` | `If-Match` on updates |
| GET, POST, PUT | `/api/v1/branches[/{branchId}[/{settings,deactivation-check,document-sequences}]]` | `org.branches.*`, `settings.branch.manage` | `If-Match` on updates; state-guarded transitions |
| GET, PUT | `/api/v1/me/branches`, `/api/v1/users/{userId}/branch-assignments` | Authenticated / `identity.users.read` / `org.branch-assignments.manage` | `If-Match` on replacement |
| GET, POST | `/api/v1/support-grants[/{grantId}/activity]`, `.../{grantId}/revoke` | `org.support-grants.manage` | State-guarded/no key |

### SPEC-03 — Medicine Catalog

| Method | Path | Permission | Idempotent |
|---|---|---|---|
| GET, POST, PUT, PATCH, DELETE | `/api/v1/catalog/medicines[/{id}[/{ingredients,barcodes,price,classification,alternatives,...}]]` | `catalog.medicines.*`, `catalog.prices.update` | Key not required; `If-Match` on mutable resources |
| GET, POST, PUT, DELETE | `/api/v1/catalog/{categories,manufacturers,active-ingredients,dosage-forms,tax-categories}[/{id}]` | `catalog.reference-data.manage`, `settings.organization.manage` | No; `If-Match` where the spec requires |
| GET, PUT, DELETE | `/api/v1/branches/{branchId}/catalog/medicines/{id}/...` | `catalog.medicines.read`, `catalog.prices.update` + branch access | No; `If-Match` on update |
| POST | `/api/v1/catalog/imports` | `catalog.medicines.import` | **Yes when `dryRun=false`** |
| GET | `/api/v1/catalog/{imports,exports}/...`, `/api/v1/catalog/medicines/export` | `catalog.medicines.import/export` | No |

### SPEC-04 — Batch & Inventory

| Method | Path | Permission | Idempotent |
|---|---|---|---|
| GET, PATCH, PUT, POST | `/api/v1/branches/{branchId}/inventory/{stock,batches,movements,medicines/{medicineId}/stock-card,fefo-preview,low-stock,near-expiry}` | `inventory.stock.read`, `inventory.batches.*`, `inventory.movements.read` | No; `If-Match` for mutable batch metadata |
| POST | `/api/v1/inventory/recalls` | `inventory.batches.quarantine` + org-wide scope | **Yes** |
| GET, POST, PUT | `/api/v1/branches/{branchId}/inventory/{opening-balances,adjustments,write-offs,transfers,stocktakes}` and their action routes | Corresponding `inventory.*` permissions | **Yes for posting/submit/approve/dispatch/receive actions explicitly marked required in SPEC-04**; draft writes otherwise not required |
| GET, POST, PUT | `/api/v1/branches/{branchId}/inventory/{reorder-settings,valuation}`; `/api/v1/inventory/{valuation-snapshots,reconciliation-runs,medicines/{medicineId}/branch-availability,rebalancing-suggestions}` | `inventory.stock.read`, `reports.inventory.read`, or named `inventory.*` permission | No; reconciliation run has no key specified |
| POST | `/api/v1/branches/{branchId}/inventory/medicines/{medicineId}/stock-card/export` | `inventory.movements.read` + `reports.export` | No |

### SPEC-05 — Suppliers & Procurement

| Method | Path | Permission | Idempotent |
|---|---|---|---|
| GET, POST, PUT, DELETE | `/api/v1/suppliers[/{supplierId}[/{contacts,...}]]` | `procurement.suppliers.read/manage` | No; `If-Match` on update |
| GET, POST, PUT, DELETE | `/api/v1/branches/{branchId}/{purchase-orders,goods-receipts,supplier-invoices,supplier-returns,supplier-payments}/...` | Corresponding `procurement.*` permissions | **Yes for receipt post/reverse, invoice post/cancel, return post, payment create/allocate/reverse, and supplier opening balance** |
| POST | `/api/v1/branches/{branchId}/purchase-orders/{poId}/{submit,approve,reject,cancel,close}` | `procurement.purchase-orders.*` | No key specified |
| GET | `/api/v1/{purchase-history,supplier-aging}`, `/api/v1/suppliers/{supplierId}/ledger`, `/api/v1/branches/{branchId}/supplier-aging` | `procurement.receipts.read`, `procurement.supplier-ledger.read`, organization-report scope as specified | No |
| POST | `/api/v1/branches/{branchId}/supplier-aging/export` | `procurement.supplier-ledger.read` + `reports.export` | No |

### SPEC-06 — Sales & POS

| Method | Path | Permission | Idempotent |
|---|---|---|---|
| GET, POST | `/api/v1/branches/{branchId}/pos/{medicines/*,quote,overrides,allergy-check,prescriptions/*}` | `sales.pos.sell` plus relevant patient/prescription permission | No |
| GET, POST | `/api/v1/branches/{branchId}/cash-sessions[/{sessionId}[/{movements,close,force-close,report}]]` | `sales.cash-sessions.*`, `finance.cash.manage` | Required for open, movement, close, force-close |
| POST | `/api/v1/branches/{branchId}/sales`, `/sales/{saleId}/{void,prints}` | `sales.pos.sell`, `sales.sales.void/read` | **Yes** |
| GET, POST | `/api/v1/branches/{branchId}/sales-returns[/{returnId}/...]` | `sales.returns.*`, `sales.sales.read` | **Yes for create, approve/reject, disposition, and print** |

### SPEC-07 — Patient Records

| Method | Path | Permission | Idempotent |
|---|---|---|---|
| GET, POST, PUT | `/api/v1/patients[/{patientId}[/{allergies,conditions,notes,consents,...}]]` | `patients.profiles.*`, `patients.medical.*`, or combined permissions | No except actions marked required |
| GET, POST | `/api/v1/patients/{patientId}/{merge,exports,anonymize}` | `patients.profiles.merge`, `patients.data.export/anonymize` | **Yes for merge, export request, anonymize** |
| POST | `/api/v1/branches/{branchId}/patients/{patientId}/allergy-checks` | `sales.pos.sell` or `prescriptions.dispense` | No |
| GET, PUT | `/api/v1/settings/patients` | `settings.organization.manage` | `If-Match` on update |

### SPEC-08 — Prescriptions

| Method | Path | Permission | Idempotent |
|---|---|---|---|
| GET, POST, PATCH, DELETE | `/api/v1/branches/{branchId}/prescriptions[/{id}[/{items,attachments,...}]]` | `prescriptions.prescriptions.*`, `prescriptions.prescribers.manage` | Optional key on creation/upload; ETag for mutable-resource actions |
| POST | `/api/v1/branches/{branchId}/sales` and `/sales/{saleId}/void` | Sales + prescription dispensing permissions | **Yes** (SPEC-06 contract) |
| POST | `/api/v1/branches/{branchId}/prescriptions/{id}/{alert-overrides,refills}`; attachment OCR/URL routes | `prescriptions.*` permissions | Optional or no key per action |
| GET | `/api/v1/branches/{branchId}/controlled-register`, `/api/v1/patients/{patientId}/prescriptions` | `prescriptions.controlled-register.read` / prescription + patient read | No |

### SPEC-09 — Finance & Reporting

| Method | Path | Permission | Idempotent |
|---|---|---|---|
| GET | `/api/v1/branches/{branchId}/reports/...`, `/api/v1/reports/...`, `/api/v1/dashboard` | `reports.sales.read`, `reports.inventory.read`, `reports.finance.read`, `reports.organization.read` as specified | No |
| POST, GET | `/api/v1/report-exports[/{exportId}[/{download}]]` | `reports.export` + report permission; requester only for status/download | Optional key on request |
| GET, POST, PUT | `/api/v1/expense-categories[/{id}]`, `/api/v1/branches/{branchId}/expenses[/{expenseId}/...]` | `finance.expenses.manage`, `finance.cash.manage`, `finance.expenses.approve` | **Yes** for expense create/reverse/approve/reject; ETag on category rename |
| POST | `/api/v1/branches/{branchId}/reports/projections/rebuild` | `reports.projections.manage` | **Yes** |

### SPEC-10 — Notifications, Audit & Settings

| Method | Path | Permission | Idempotent |
|---|---|---|---|
| GET, POST, PUT, DELETE | `/api/v1/notifications`, `/notification-types`, `/notification-rules`, `/branches/{branchId}/notification-rules`, `/me/notification-preferences` | `notifications.read/manage` or authenticated self | No key; reads and notification state transitions are natural |
| GET, POST | `/api/v1/audit/{event-types,logs,exports,chain/verifications,activity,...}` | `audit.logs.read/export`, `audit.chain.verify`, `audit.reports.read` | No key specified |
| GET, PATCH, PUT, DELETE | `/api/v1/settings/{definitions,organization}`, `/api/v1/branches/{branchId}/settings`, `/api/v1/me/preferences` | Authenticated member, `settings.organization.manage`, `settings.branch.manage` | ETag on updates; natural on removals |
| GET, POST | `/api/v1/platform/{health,jobs,backups,restore-drills,...}` | `settings.operations.*` or backup service principal | No key unless operation is explicitly deduplicated by tool run id |
| GET | `/health/live`, `/health/ready`; `WS /hubs/notifications` | Anonymous health; `notifications.read` hub | No |

## 17. Error-code catalog from SPEC-01–SPEC-10

The tables aggregate codes explicitly listed in sections 9, 10, and 12 of the specs. Codes listed as validation-family members inherit the status shown unless the row calls out a different status. `Field validation` below means the field code appears inside `errors`; where the specs disagree on the top-level validation status, retain the module mapping and see §16.

### SPEC-01 — Identity & Access

| Code(s) | HTTP | Meaning |
|---|---:|---|
| `IDENTITY.TOKEN_INVALID_OR_EXPIRED`, `IDENTITY.CURRENT_PASSWORD_INVALID`, `IDENTITY.MFA_CODE_INVALID` | 400 | Invalid reset/invitation/verification token, current password, or MFA code. |
| `IDENTITY.UNAUTHENTICATED`, `IDENTITY.INVALID_CREDENTIALS`, `IDENTITY.REFRESH_TOKEN_INVALID`, `IDENTITY.REFRESH_TOKEN_REUSED`, `IDENTITY.SESSION_REVOKED` | 401 | Authentication or refresh/session failure. |
| `IDENTITY.PERMISSION_DENIED`, `IDENTITY.BRANCH_ACCESS_DENIED`, `IDENTITY.EMAIL_NOT_VERIFIED`, `IDENTITY.PASSWORD_CHANGE_REQUIRED`, `IDENTITY.MFA_ENROLLMENT_REQUIRED`, `IDENTITY.PRIVILEGE_ESCALATION`, `IDENTITY.USER_OUTSIDE_SCOPE`, `IDENTITY.SELF_MODIFICATION_FORBIDDEN`, `IDENTITY.OVERRIDE_DENIED`, `IDENTITY.OVERRIDE_GRANT_INVALID` | 403 | Scope, policy, restricted-session, or override denial. |
| `IDENTITY.USER_NOT_FOUND`, `IDENTITY.ROLE_NOT_FOUND`, `IDENTITY.SESSION_NOT_FOUND`, `ORG.BRANCH_NOT_FOUND` | 404 | Missing or cross-organization resource. |
| `IDENTITY.EMAIL_ALREADY_EXISTS`, `IDENTITY.ROLE_NAME_EXISTS`, `IDENTITY.ROLE_IN_USE`, `IDENTITY.SYSTEM_ROLE_IMMUTABLE`, `IDENTITY.LAST_OWNER`, `IDENTITY.INVALID_STATUS_TRANSITION`, `IDENTITY.MFA_ALREADY_ENABLED`, `IDENTITY.MFA_REQUIRED_BY_POLICY` | 409 | Duplicate, lifecycle, or role/MFA conflict. |
| `COMMON.CONCURRENCY_CONFLICT`, `IDENTITY.ACCOUNT_LOCKED`, `COMMON.PRECONDITION_REQUIRED`, `COMMON.RATE_LIMITED` | 412, 423, 428, 429 | Stale ETag, locked account (`retryAfterSeconds`), missing ETag, or rate limit. |

### SPEC-02 — Organization & Branches

| Code(s) | HTTP | Meaning |
|---|---:|---|
| `COMMON.UNAUTHENTICATED` | 401 | Missing/invalid token. |
| `COMMON.FORBIDDEN`, `ORG.ORGANIZATION_SUSPENDED`, `ORG.ASSIGNMENT_OUT_OF_SCOPE`, `ORG.TRANSFER_APPROVER_NOT_ELIGIBLE`, `ORG.SUPPORT_GRANT_INACTIVE`, `ORG.SUPPORT_ACCESS_READ_ONLY` | 403 | Permission/scope, suspended organization, ineligible approver, or invalid/read-only support grant. |
| `COMMON.NOT_FOUND` | 404 | Unknown or cross-organization resource. |
| `ORG.BRANCH_CODE_DUPLICATE`, `ORG.BRANCH_CODE_IMMUTABLE`, `ORG.TIME_ZONE_CHANGE_BLOCKED`, `ORG.BRANCH_DEACTIVATION_BLOCKED`, `ORG.BRANCH_INACTIVE`, `ORG.INVALID_STATUS_TRANSITION`, `ORG.OWNER_EMAIL_IN_USE`, `ORG.SUPPORT_GRANT_ALREADY_ACTIVE` | 409 | Organization/branch/grant state conflict or duplicate. |
| `COMMON.PRECONDITION_FAILED` | 412 | Stale ETag (legacy spelling). |
| `COMMON.VALIDATION_FAILED`, `COMMON.REFERENCE_NOT_FOUND`, `COMMON.IDEMPOTENCY_KEY_REUSED`, `ORG.TRANSFER_ROUTE_NOT_ALLOWED` | 422 | Validation, invalid reference, key payload mismatch, or disallowed transfer route. |
| `COMMON.IDEMPOTENCY_KEY_REQUIRED`, `COMMON.PRECONDITION_REQUIRED` | 400, 428 | Provisioning key missing; update ETag missing. |
| `COMMON.TENANT_MISMATCH` | 500 internally | Write-stamping violation; client receives generic `COMMON.INTERNAL_ERROR`. |

### SPEC-03 — Medicine Catalog

| Code(s) | HTTP | Meaning |
|---|---:|---|
| `COMMON.VALIDATION_FAILED`, `COMMON.IDEMPOTENCY_KEY_REQUIRED`, `CATALOG.IMPORT_FILE_INVALID` | 400 | Invalid field/file or required import key missing. |
| `COMMON.FORBIDDEN`, `CATALOG.CLASSIFY_PERMISSION_REQUIRED` | 403 | Authorization or classification permission missing. |
| `CATALOG.MEDICINE_NOT_FOUND`, `CATALOG.BARCODE_NOT_FOUND`, `CATALOG.REFERENCE_DATA_NOT_FOUND`, `CATALOG.IMPORT_JOB_NOT_FOUND` | 404 | Medicine, barcode, reference item, or import job absent/inaccessible. |
| `CATALOG.BARCODE_DUPLICATE`, `CATALOG.CODE_DUPLICATE`, `CATALOG.NAME_DUPLICATE`, `CATALOG.POSSIBLE_DUPLICATE`, `CATALOG.PACK_SIZE_CHANGE_BLOCKED`, `CATALOG.MEDICINE_HAS_STOCK`, `CATALOG.MEDICINE_IN_USE`, `CATALOG.REFERENCE_DATA_IN_USE`, `CATALOG.CATEGORY_HAS_ACTIVE_CHILDREN`, `CATALOG.TAX_CATEGORY_IS_DEFAULT`, `CATALOG.BRANCH_PRICE_OVERRIDE_DISABLED`, `CATALOG.ALTERNATIVE_DUPLICATE`, `CATALOG.IMPORT_IN_PROGRESS`, `CATALOG.BARCODE_SEQUENCE_EXHAUSTED` | 409 | Duplicate, referenced, immutable, or conflicting catalog state. |
| `COMMON.CONCURRENCY_CONFLICT` | 412 | Stale ETag. |
| `CATALOG.IMPORT_FILE_TOO_LARGE` | 413 | Import exceeds size cap. |
| `CATALOG.REFERENCE_DATA_INACTIVE`, `CATALOG.CATEGORY_DEPTH_EXCEEDED`, `CATALOG.CATEGORY_CYCLE`, `CATALOG.PRICE_CHANGE_CONFIRMATION_REQUIRED`, `CATALOG.USE_CLASSIFICATION_ENDPOINT`, `CATALOG.MEDICINE_INACTIVE`, `CATALOG.ALTERNATIVE_SELF_REFERENCE`, `CATALOG.ALTERNATIVE_LIMIT_EXCEEDED`, `CATALOG.IMPORT_TOO_MANY_ROWS`, `CATALOG.IMPORT_HAS_ERRORS`, `CATALOG.LABEL_LIMIT_EXCEEDED`, `CATALOG.SEARCH_QUERY_TOO_SHORT`, `COMMON.IDEMPOTENCY_KEY_REUSED` | 422 | Business-rule validation, import/job failure, or key/request mismatch. |
| `COMMON.PRECONDITION_REQUIRED` | 428 | ETag missing. |

### SPEC-04 — Batch & Inventory

| Code(s) | HTTP | Meaning |
|---|---:|---|
| `INVENTORY.INSUFFICIENT_STOCK`, `INVENTORY.RESERVATION_CONFLICT` | 409 | Insufficient sellable quantity or reservation invariant would be violated. |
| `INVENTORY.BATCH_NOT_SELLABLE`, `INVENTORY.BATCH_EXPIRY_MISMATCH`, `INVENTORY.BATCH_NUMBER_INVALID`, `INVENTORY.EXPIRY_DATE_INVALID`, `INVENTORY.UNIT_COST_INVALID`, `INVENTORY.SELLING_PRICE_INVALID`, `INVENTORY.INVALID_QUANTITY`, `INVENTORY.REASON_REQUIRED`, `INVENTORY.DOCUMENT_LINES_INVALID`, `INVENTORY.RECLASSIFICATION_INVALID`, `INVENTORY.REORDER_SETTING_INVALID`, `INVENTORY.COUNTED_AT_INVALID`, `INVENTORY.STOCKTAKE_SCOPE_INVALID`, `INVENTORY.TRANSFER_QUANTITY_INVALID`, `INVENTORY.MEDICINE_INACTIVE`, `INVENTORY.BRANCH_INACTIVE`, `INVENTORY.WRITE_OFF_NOT_EXPIRED`, `INVENTORY.IMPORT_VALIDATION_FAILED`, `INVENTORY.STOCKTAKE_INCOMPLETE`, `INVENTORY.TRANSFER_SAME_BRANCH`, `INVENTORY.TRANSFER_OVER_RECEIPT` | 422 | Eligibility, quantity, document, or business validation. |
| `INVENTORY.BATCH_METADATA_LOCKED`, `INVENTORY.OPENING_BALANCE_LOCKED`, `INVENTORY.INVALID_STATE_TRANSITION`, `INVENTORY.STOCKTAKE_SCOPE_OVERLAP`, `INVENTORY.STOCKTAKE_VARIANCE_CONFLICT` | 409 | Locked metadata/opening balance, invalid transition, overlap, or variance conflict. |
| `INVENTORY.FEFO_OVERRIDE_NOT_PERMITTED`, `INVENTORY.SELF_APPROVAL_NOT_ALLOWED`, `IDENTITY.PERMISSION_DENIED`, `IDENTITY.BRANCH_ACCESS_DENIED` | 403 | Permission, branch, override, or segregation-of-duties failure. |
| `INVENTORY.IMPORT_FILE_INVALID`, `COMMON.IDEMPOTENCY_KEY_REQUIRED` | 400 | Invalid import file or required key missing. |
| `COMMON.LOCK_TIMEOUT`, `COMMON.TRANSIENT_CONFLICT` | 503 | Lock timeout or exhausted deadlock/serialization retries; `Retry-After: 1` for lock timeout. |
| `COMMON.IDEMPOTENCY_KEY_REUSED` | 422 | Same key, different request hash. |
| `COMMON.CONCURRENCY_CONFLICT`, `COMMON.PRECONDITION_REQUIRED`, `COMMON.NOT_FOUND` | 412, 428, 404 | Stale/missing ETag or missing/cross-organization resource. |

### SPEC-05 — Suppliers & Procurement

| Code(s) | HTTP | Meaning |
|---|---:|---|
| `PROCUREMENT.SHELF_LIFE_OVERRIDE_NOT_PERMITTED`, `PROCUREMENT.VARIANCE_APPROVAL_NOT_PERMITTED` | 403 | Required override/approval permission absent. |
| `PROCUREMENT.SUPPLIER_CODE_DUPLICATE`, `PROCUREMENT.SUPPLIER_TAX_NUMBER_DUPLICATE`, `PROCUREMENT.SUPPLIER_STATUS_UNCHANGED`, `PROCUREMENT.RECEIPT_NOT_DRAFT`, `PROCUREMENT.RECEIPT_NOT_POSTED`, `PROCUREMENT.RECEIPT_QUANTITY_CONSUMED`, `PROCUREMENT.RECEIPT_INVOICED`, `PROCUREMENT.PURCHASE_ORDER_INVALID_TRANSITION`, `PROCUREMENT.SELF_APPROVAL_NOT_ALLOWED`, `PROCUREMENT.PURCHASE_ORDER_HAS_RECEIPTS`, `PROCUREMENT.SUPPLIER_INVOICE_NUMBER_DUPLICATE`, `PROCUREMENT.INVOICE_NOT_DRAFT`, `PROCUREMENT.INVOICE_VARIANCE_APPROVAL_REQUIRED`, `PROCUREMENT.INVOICE_HAS_ALLOCATIONS`, `PROCUREMENT.RETURN_NOT_DRAFT`, `PROCUREMENT.PAYMENT_ALREADY_REVERSED`, `PROCUREMENT.OPENING_BALANCE_EXISTS` | 409 | Duplicate, invalid lifecycle, consumed/invoiced, or already-posted state. |
| `PROCUREMENT.SUPPLIER_NAME_REQUIRED`, `PROCUREMENT.SUPPLIER_TAX_NUMBER_INVALID`, `PROCUREMENT.SUPPLIER_TERMS_INVALID`, `PROCUREMENT.PHONE_INVALID`, `PROCUREMENT.EMAIL_INVALID`, `PROCUREMENT.CONTACT_LIMIT_EXCEEDED`, `PROCUREMENT.REASON_REQUIRED`, `PROCUREMENT.RECEIPT_DATE_INVALID`, `PROCUREMENT.MEDICINE_INACTIVE`, `PROCUREMENT.BATCH_NUMBER_INVALID`, `PROCUREMENT.BATCH_EXPIRED`, `PROCUREMENT.SHELF_LIFE_BELOW_MINIMUM`, `PROCUREMENT.MANUFACTURE_DATE_INVALID`, `PROCUREMENT.INVALID_QUANTITY`, `PROCUREMENT.INVALID_UNIT_COST`, `PROCUREMENT.INVALID_DISCOUNT`, `PROCUREMENT.RECEIPT_NO_LINES`, `PROCUREMENT.LINE_LIMIT_EXCEEDED`, `PROCUREMENT.BATCH_EXPIRY_CONFLICT`, `PROCUREMENT.BATCH_EXPIRY_MISMATCH_CONFIRMATION_REQUIRED`, `PROCUREMENT.BATCH_QUARANTINED`, `PROCUREMENT.PURCHASE_ORDER_REQUIRED`, `PROCUREMENT.PURCHASE_ORDER_NOT_RECEIVABLE`, `PROCUREMENT.PURCHASE_ORDER_MISMATCH`, `PROCUREMENT.PURCHASE_ORDER_LINE_MISMATCH`, `PROCUREMENT.OVER_RECEIPT_TOLERANCE_EXCEEDED`, `PROCUREMENT.PURCHASE_ORDER_NO_LINES`, `PROCUREMENT.PURCHASE_ORDER_DUPLICATE_MEDICINE`, `PROCUREMENT.EXPECTED_DATE_INVALID`, `PROCUREMENT.CREDIT_LIMIT_EXCEEDED`, `PROCUREMENT.CREDIT_LIMIT_ACKNOWLEDGEMENT_REQUIRED`, `PROCUREMENT.INVOICE_DATE_INVALID`, `PROCUREMENT.INVOICE_RECEIPT_MISMATCH`, `PROCUREMENT.INVOICE_QUANTITY_EXCEEDS_RECEIVED`, `PROCUREMENT.RETURN_NO_LINES`, `PROCUREMENT.RETURN_BATCH_SUPPLIER_MISMATCH`, `PROCUREMENT.PAYMENT_AMOUNT_INVALID`, `PROCUREMENT.PAYMENT_DATE_INVALID`, `PROCUREMENT.PAYMENT_METHOD_DETAILS_REQUIRED`, `PROCUREMENT.ALLOCATION_INVOICE_INVALID`, `PROCUREMENT.ALLOCATION_EXCEEDS_OUTSTANDING`, `PROCUREMENT.ALLOCATION_EXCEEDS_PAYMENT`, `PROCUREMENT.OPENING_BALANCE_INVALID`, `INVENTORY.INSUFFICIENT_STOCK` | 422 | Procurement validation/business-rule failure; see SPEC-05 §9 for field-specific meanings. |
| `COMMON.VALIDATION_FAILED`, `COMMON.FORBIDDEN`, `COMMON.NOT_FOUND`, `COMMON.CONCURRENCY_CONFLICT`, `COMMON.IDEMPOTENCY_KEY_REQUIRED`, `COMMON.IDEMPOTENCY_KEY_REUSED` | 400, 403, 404, 412, 400, 422 | Shared request, authorization, lookup, concurrency, and idempotency errors. |
| `500` | 500 | Unexpected failure; transaction rolls back without partial state. |

### SPEC-06 — Sales & POS

| Code(s) | HTTP | Meaning |
|---|---:|---|
| `COMMON.VALIDATION_FAILED`, `COMMON.IDEMPOTENCY_KEY_REQUIRED` | 400 | Invalid request or missing required key. |
| `COMMON.FORBIDDEN`, `SALES.CASH_SESSION_NOT_OWNED`, `SALES.SELF_APPROVAL_NOT_ALLOWED`, `SALES.CONTROLLED_DISPENSE_FORBIDDEN` | 403 | Permission, session ownership, SoD, or controlled-medicine authorization failure. |
| `COMMON.NOT_FOUND`, `SALES.BARCODE_NOT_FOUND` | 404 | Resource or barcode absent/inaccessible. |
| `INVENTORY.INSUFFICIENT_STOCK`, `SALES.PRICE_MISMATCH`, `SALES.CASH_SESSION_NOT_OPEN`, `SALES.CASH_SESSION_ALREADY_OPEN`, `SALES.SALE_NOT_VOIDABLE`, `SALES.SALE_NOT_RETURNABLE`, `SALES.RETURN_NOT_PENDING`, `SALES.DISPOSITION_ALREADY_SET` | 409 | Stock, quote, cash-session, or workflow conflict. |
| `SALES.MEDICINE_NOT_SELLABLE`, `SALES.PRICE_NOT_CONFIGURED`, `SALES.TAX_CATEGORY_MISSING`, `SALES.SPLIT_PACK_NOT_ALLOWED`, `SALES.INVALID_QUANTITY`, `SALES.EMPTY_SALE`, `SALES.DISCOUNT_LIMIT_EXCEEDED`, `SALES.OVERRIDE_INVALID`, `SALES.OVERRIDE_AUTH_FAILED`, `SALES.OVERRIDE_SELF_NOT_ALLOWED`, `SALES.PAYMENT_INSUFFICIENT`, `SALES.PAYMENT_EXCEEDS_TOTAL`, `SALES.CARD_REFERENCE_REQUIRED`, `SALES.CASH_COUNT_INVALID`, `SALES.VARIANCE_REASON_REQUIRED`, `SALES.CASH_OUT_EXCEEDS_AVAILABLE`, `SALES.BATCH_NOT_ELIGIBLE`, `SALES.RETURN_QUANTITY_EXCEEDED`, `SALES.RETURN_WINDOW_EXPIRED`, `SALES.REFUND_EXCEEDS_CASH_AVAILABLE`, `SALES.REFUND_METHOD_NOT_ALLOWED`, `SALES.RESTOCK_NOT_ALLOWED`, `SALES.PRESCRIPTION_REQUIRED`, `SALES.PRESCRIPTION_NOT_DISPENSABLE`, `SALES.PRESCRIPTION_QUANTITY_EXCEEDED`, `SALES.LOYALTY_INSUFFICIENT_POINTS` | 422 | Field or sales business-rule validation. |
| `COMMON.IDEMPOTENCY_KEY_REUSED` | 422 | Same key with a different request. |
| `COMMON.TRANSIENT_FAILURE` | 503 | Lock timeout, retry exhaustion, or DB outage; no business effect persisted. |

### SPEC-07 — Patient Records

| Code(s) | HTTP | Meaning |
|---|---:|---|
| `PATIENTS.NOT_FOUND` | 404 | Patient/subrecord absent or cross-organization. |
| `COMMON.FORBIDDEN` | 403 | Permission or branch scope denied. |
| `PATIENTS.INVALID_NAME`, `PATIENTS.INVALID_PHONE`, `PATIENTS.INVALID_EMAIL`, `PATIENTS.INVALID_ADDRESS`, `PATIENTS.INVALID_BIRTH_DATE`, `PATIENTS.INVALID_GENDER`, `PATIENTS.INVALID_NATIONAL_ID`, `PATIENTS.NATIONAL_ID_DISABLED`, `PATIENTS.SEARCH_TERM_TOO_SHORT`, `PATIENTS.ALLERGY_SUBSTANCE_REQUIRED`, `PATIENTS.INVALID_ALLERGY_FIELD`, `PATIENTS.INVALID_CONDITION`, `PATIENTS.INVALID_NOTE`, `PATIENTS.INVALID_ALLERGY_CHECK`, `PATIENTS.REASON_REQUIRED`, `PATIENTS.ALLERGY_ACK_REASON_REQUIRED`, `PATIENTS.MERGE_SAME_PATIENT`, `PATIENTS.ANONYMIZE_CONFIRMATION_MISMATCH`, `COMMON.VALIDATION_FAILED` | 400 | Field/input validation; errors never echo medical field values. |
| `PATIENTS.DUPLICATE_ALLERGY`, `PATIENTS.ALLERGY_STATUS_CONFLICT`, `PATIENTS.CONSENT_STATE_UNCHANGED`, `PATIENTS.POSSIBLE_DUPLICATE`, `PATIENTS.MERGE_NOT_ALLOWED`, `PATIENTS.ANONYMIZATION_NOT_PERMITTED`, `PATIENTS.EXPORT_NOT_READY` | 409 | Duplicate, state, merge/anonymization, or export conflict. |
| `PATIENTS.INGREDIENT_NOT_FOUND`, `PATIENTS.CONSENT_REQUIRED`, `PATIENTS.PATIENT_INACTIVE`, `PATIENTS.PATIENT_MERGED`, `PATIENTS.PATIENT_ANONYMIZED`, `PATIENTS.ALLERGY_ACKNOWLEDGEMENT_REQUIRED`, `PATIENTS.ALLERGY_BLOCKED`, `COMMON.IDEMPOTENCY_KEY_REUSED` | 422 | Reference/consent/state/allergy rule or idempotency mismatch. |
| `PATIENTS.EXPORT_EXPIRED` | 410 | Export artifact expired. |
| `COMMON.PRECONDITION_REQUIRED`, `COMMON.CONCURRENCY_CONFLICT` | 428, 412 | Missing/stale ETag. |
| `PATIENTS.ACCESS_LOG_UNAVAILABLE`, `COMMON.RATE_LIMITED` | 503, 429 | Mandatory medical-access log unavailable; patient search limit exceeded. |

### SPEC-08 — Prescriptions

| Code(s) | HTTP | Meaning |
|---|---:|---|
| `COMMON.FORBIDDEN`, `PRESCRIPTIONS.CONTROLLED_DISPENSE_FORBIDDEN` | 403 | Permission/branch or controlled-medicine access denied. |
| `PRESCRIPTIONS.NOT_FOUND` | 404 | Prescription/item/attachment/extraction not found in organization and branch. |
| `PRESCRIPTIONS.INVALID_STATUS_TRANSITION`, `PRESCRIPTIONS.IMMUTABLE_AFTER_DISPENSING`, `PRESCRIPTIONS.ATTACHMENT_NOT_AVAILABLE`, `PRESCRIPTIONS.ATTACHMENT_LOCKED`, `PRESCRIPTIONS.OCR_FIELD_ALREADY_DECIDED` | 409 | Workflow, immutability, attachment, or duplicate OCR decision conflict. |
| `PRESCRIPTIONS.VERSION_MISMATCH` | 412 | Stale If-Match; differs from common concurrency code. |
| `PRESCRIPTIONS.ATTACHMENT_TOO_LARGE` | 413 | Attachment exceeds configured cap. |
| `PRESCRIPTIONS.ATTACHMENT_TYPE_NOT_ALLOWED` | 415 | Signature/type not allowed. |
| `PRESCRIPTIONS.PROVIDER_UNAVAILABLE` | 503 | Storage/scanner unavailable; upload not persisted. |
| `PRESCRIPTIONS.SETTING_OUT_OF_RANGE`, `PRESCRIPTIONS.PROVIDER_NOT_CONFIGURED`, `PRESCRIPTIONS.PRESCRIBER_NAME_REQUIRED`, `PRESCRIPTIONS.FIELD_TOO_LONG`, `PRESCRIPTIONS.PRESCRIBER_INVALID`, `PRESCRIPTIONS.PATIENT_INVALID`, `PRESCRIPTIONS.DATE_IN_FUTURE`, `PRESCRIPTIONS.ALREADY_EXPIRED`, `PRESCRIPTIONS.ITEM_MEDICINE_XOR_TEXT`, `PRESCRIPTIONS.MEDICINE_INVALID`, `PRESCRIPTIONS.QUANTITY_INVALID`, `PRESCRIPTIONS.ROUTE_INVALID`, `PRESCRIPTIONS.ITEM_LIMIT_REACHED`, `PRESCRIPTIONS.ATTACHMENT_LIMIT_REACHED`, `PRESCRIPTIONS.NO_ITEMS`, `PRESCRIPTIONS.PATIENT_REQUIRED`, `PRESCRIPTIONS.ITEM_UNRESOLVED`, `PRESCRIPTIONS.CHECKLIST_INCOMPLETE`, `PRESCRIPTIONS.ATTACHMENT_REQUIRED`, `PRESCRIPTIONS.CANCEL_REASON_REQUIRED`, `PRESCRIPTIONS.OVERRIDE_REASON_REQUIRED`, `PRESCRIPTIONS.NOT_DISPENSABLE`, `PRESCRIPTIONS.EXPIRED`, `PRESCRIPTIONS.BRANCH_MISMATCH`, `PRESCRIPTIONS.MEDICINE_MISMATCH`, `PRESCRIPTIONS.QUANTITY_EXCEEDS_REMAINING`, `PRESCRIPTIONS.ROUNDING_REASON_REQUIRED`, `PRESCRIPTIONS.PATIENT_MISMATCH`, `PRESCRIPTIONS.PRESCRIPTION_REQUIRED`, `PRESCRIPTIONS.ALERT_OVERRIDE_REQUIRED`, `PRESCRIPTIONS.SUBSTITUTION_DISABLED`, `PRESCRIPTIONS.SUBSTITUTION_INVALID`, `PRESCRIPTIONS.SUBSTITUTION_REASON_REQUIRED`, `PRESCRIPTIONS.CONSENT_REQUIRED`, `PRESCRIPTIONS.REFILLS_DISABLED`, `PRESCRIPTIONS.NO_REFILLS_REMAINING`, `PRESCRIPTIONS.FEATURE_DISABLED`, `PRESCRIPTIONS.OCR_SOURCE_INVALID`, `PRESCRIPTIONS.REGISTER_RANGE_TOO_LARGE`, `COMMON.IDEMPOTENCY_KEY_REUSED` | 422 unless otherwise noted | Prescription field/business validation or idempotency mismatch. |
| `COMMON.PRECONDITION_REQUIRED` | 428 | Missing If-Match where required. |

### SPEC-09 — Finance & Reporting

| Code(s) | HTTP | Meaning |
|---|---:|---|
| `REPORTS.INVALID_DATE_RANGE`, `REPORTS.INVALID_PRESET`, `REPORTS.INVALID_GROUP_BY`, `REPORTS.INVALID_PAGINATION`, `REPORTS.INVALID_EXPIRY_WINDOW`, `REPORTS.UNSUPPORTED_FORMAT`, `REPORTS.UNKNOWN_REPORT_TYPE`, `REPORTS.INVALID_ANALYTICS_PARAMETER`, `REPORTS.FUTURE_DATE_NOT_ALLOWED`, `REPORTS.REBUILD_RANGE_INVALID` | 400 | Invalid report parameters. |
| `REPORTS.RANGE_REQUIRES_EXPORT`, `REPORTS.DATE_RANGE_TOO_LARGE`, `REPORTS.PDF_ROW_LIMIT_EXCEEDED`, `REPORTS.EXPORT_ROW_LIMIT_EXCEEDED`, `FINANCE.EXPENSE_CATEGORY_NAME_INVALID`, `FINANCE.EXPENSE_CATEGORY_NAME_DUPLICATE`, `FINANCE.EXPENSE_AMOUNT_INVALID`, `FINANCE.EXPENSE_CATEGORY_INACTIVE`, `FINANCE.EXPENSE_DATE_OUT_OF_RANGE`, `FINANCE.EXPENSE_PAYMENT_INVALID`, `FINANCE.EXPENSE_FIELD_INVALID`, `FINANCE.ATTACHMENT_INVALID`, `FINANCE.ATTACHMENT_LIMIT_EXCEEDED`, `FINANCE.CASH_SESSION_NOT_OPEN`, `FINANCE.INSUFFICIENT_DRAWER_CASH`, `FINANCE.EXPENSE_NOT_REVERSIBLE`, `FINANCE.EXPENSE_NOT_PENDING`, `FINANCE.EXPENSE_SELF_APPROVAL_FORBIDDEN`, `COMMON.IDEMPOTENCY_KEY_REUSED` | 422 | Report limit, expense/attachment validation or state, or idempotency mismatch. |
| `COMMON.FORBIDDEN` | 403 | Permission or branch scope denied. |
| `REPORTS.CASH_SESSION_NOT_FOUND`, `REPORTS.EXPORT_NOT_FOUND`, `FINANCE.EXPENSE_NOT_FOUND`, `FINANCE.EXPENSE_CATEGORY_NOT_FOUND`, `COMMON.NOT_FOUND` | 404 | Missing or cross-organization resource. |
| `REPORTS.EXPORT_NOT_READY`, `REPORTS.PROJECTION_REBUILD_IN_PROGRESS` | 409 | Export not complete or rebuild already active. |
| `REPORTS.EXPORT_EXPIRED` | 410 | Export has expired. |
| `COMMON.CONCURRENCY_CONFLICT` | 412 | Stale ETag. |
| `REPORTS.TOO_MANY_CONCURRENT_EXPORTS` | 429 | More than three queued/running exports. |
| `REPORTS.QUERY_TIMEOUT` | 503 | Interactive query timed out; use export. |
| `REPORTS.EXPORT_PERMISSION_REVOKED`, `REPORTS.EXPORT_GENERATION_FAILED` | Job failure code | Background export failure; exposed through job status, not synchronous request. |

### SPEC-10 — Notifications, Audit & Settings

| Code(s) | HTTP | Meaning |
|---|---:|---|
| `AUDIT.WRITE_FAILED`, `AUDIT.UNKNOWN_EVENT_CODE` | 500 | Audit event could not be recorded or an unknown event code was attempted; business operation rolls back. |
| `AUDIT.ACCESS_LOG_UNAVAILABLE` | 503 | Patient-data access logging failed; no medical data returned. |
| `AUDIT.INVALID_DATE_RANGE`, `AUDIT.UNKNOWN_EVENT_CODE` (query code registry), `COMMON.VALIDATION_FAILED` | 400 | Invalid audit query or request. |
| `AUDIT.EXPORT_TOO_LARGE` | 422 | Audit export exceeds row cap. |
| `AUDIT.VERIFICATION_ALREADY_RUNNING`, `NOTIFICATIONS.INVALID_STATUS_TRANSITION`, `SETTINGS.CURRENCY_LOCKED`, `SETTINGS.EXPORT_ALREADY_RUNNING` | 409 | Audit verification, notification, currency, or export state conflict. |
| `NOTIFICATIONS.NOT_FOUND`, `COMMON.NOT_FOUND` | 404 | Notification not owned by caller or cross-organization resource. |
| `NOTIFICATIONS.UNKNOWN_TYPE`, `SETTINGS.UNKNOWN_KEY` | 400 | Unknown notification type or setting key. |
| `NOTIFICATIONS.INVALID_RECIPIENT`, `NOTIFICATIONS.MANDATORY_TYPE`, `NOTIFICATIONS.INVALID_ANNOUNCEMENT`, `NOTIFICATIONS.CONSENT_MISSING`, `SETTINGS.INVALID_VALUE`, `SETTINGS.NOT_OVERRIDABLE`, `SETTINGS.READ_ONLY`, `SETTINGS.UNSUPPORTED_LANGUAGE`, `SETTINGS.INVALID_THEME` | 422 | Notification-rule, announcement, consent, or settings validation. |
| `COMMON.PRECONDITION_REQUIRED`, `COMMON.PRECONDITION_FAILED`, `COMMON.FORBIDDEN` | 428, 412, 403 | Missing/stale ETag or permission/branch denial. |

## 18. Source references

- [DOCUMENTATION-CONVENTIONS.md](../DOCUMENTATION-CONVENTIONS.md) §§5–7.
- [SYSTEM-ARCHITECTURE.md](SYSTEM-ARCHITECTURE.md) §§7–8, 11–15.
- [DATABASE-DESIGN.md](DATABASE-DESIGN.md) §§8, 12–13.
- [ADR-001](decisions/ADR-001-ARCHITECTURE-STYLE.md) through [ADR-010](decisions/ADR-010-FRONTEND-STATE-MANAGEMENT.md).
- [SPEC-01](../specs/SPEC-01-IDENTITY-ACCESS.md) through [SPEC-10](../specs/SPEC-10-NOTIFICATIONS-AUDIT-SETTINGS.md), especially §§9, 10, and 12.
