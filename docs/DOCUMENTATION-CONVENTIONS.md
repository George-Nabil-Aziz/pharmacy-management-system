# Documentation Conventions & Canonical Domain Reference

**Status:** Authoritative — every document in `docs/` MUST conform to this file.
**Version:** 1.0 (2026-11-09)

This file is the single source of truth for identifiers, terminology, roles, permissions, canonical entities, statuses, and document templates. When any other document disagrees with this file, this file wins and the other document is a defect.

---

## 1. Identifier Schemes

| Artifact | Format | Example | Scope / uniqueness |
|---|---|---|---|
| Business requirement | `BRQ-NN` | `BRQ-04` | Global (defined in §3) |
| Global business rule | `BR-G-NN` | `BR-G-07` | Global (defined in §4) |
| Module business rule | `BR-SS-NNN` | `BR-04-012` | Unique within spec `SS` |
| Functional requirement | `FR-SS-NNN` | `FR-06-014` | Unique within spec `SS` |
| Non-functional requirement | `NFR-SS-NNN` (module) / `NFR-G-NN` (global) | `NFR-06-003` | As above |
| Validation rule | `VR-SS-NNN` | `VR-03-008` | Unique within spec |
| Specification | `SPEC-SS` | `SPEC-04` | `SS` = 01..10 |
| Epic | `EPIC-SS` | `EPIC-04` | 1:1 with spec |
| User story | `US-SS-NN` | `US-04-07` | Unique within epic |
| Acceptance criterion | `US-SS-NN-ACn` | `US-04-07-AC3` | Unique within story |
| Test scenario | `TS-SS-NNN` | `TS-06-021` | Unique within epic; declared in story "Testing Notes" |
| Critical cross-cutting scenario | `CS-NN` | `CS-01` | Global (defined in §9) |
| Open decision | `OD-SS-NN` (module) / `OD-G-NN` (global) | `OD-08-02` | As above |
| Assumption | `A-NN` | `A-12` | Global, in `ASSUMPTIONS-AND-OPEN-DECISIONS.md` |
| Risk | `R-NN` | `R-05` | Global, in `RISKS-AND-MITIGATIONS.md` |
| Regulatory review item | `REG-NN` | `REG-03` | Global (defined in §10) |
| Architecture decision | `ADR-NNN` | `ADR-004` | Global |
| Error code | `MODULE.ERROR_NAME` | `INVENTORY.INSUFFICIENT_STOCK` | Global |

Spec numbers: 01 Identity & Access · 02 Organization & Branches · 03 Medicine Catalog · 04 Batch & Inventory · 05 Suppliers & Procurement · 06 Sales & POS · 07 Patient Records · 08 Prescriptions · 09 Finance & Reporting · 10 Notifications, Audit & Settings.

Priorities: **P0** essential business/security · **P1** core operational · **P2** important enhancement · **P3** advanced/optional.
Complexity: **XS** (<0.5 day) · **S** (0.5–1 day) · **M** (2–3 days) · **L** (4–5 days) · **XL** (must be split before implementation).

---

## 2. Terminology (use exactly these words)

| Use | Do not use | Meaning |
|---|---|---|
| Organization | Tenant, Company, Pharmacy (as entity) | The legal pharmacy business; the tenant boundary |
| Branch | Store, Location, Outlet | A physical pharmacy site owned by one organization |
| Medicine | Product, Drug, Item (as entity) | Catalog definition (org-level), not physical stock |
| Batch | Lot | A received quantity of one medicine in one branch with one batch number + expiry date |
| Base unit | Unit of measure | Smallest sellable unit of a medicine (e.g., tablet, ampoule, bottle). All stock quantities are integers in base units |
| Pack | Box, Package | A sellable grouping of `PackSize` base units |
| Stock movement | Transaction (for stock) | Immutable ledger row recording a quantity change of a batch |
| Batch balance | Stock level | Current on-hand / reserved quantity of a batch (derived from movements, maintained transactionally) |
| Sale | Order, Invoice (as entity) | A completed POS transaction. "Sales invoice" = the printed/issued document of a sale |
| Sales return | Refund (as entity) | Return of items from a completed sale. "Refund" = the money paid back |
| Void | Cancel, Delete | Reversal of a whole sale under restricted rules (§5) |
| Goods receipt | GRN, Receiving | Recording of physically received goods, optionally against a purchase order |
| Supplier invoice | Bill | Supplier's invoice creating a payable |
| Stock transfer | Move | Explicit branch-to-branch transfer workflow |
| Stocktake | Inventory count, Stock count | Physical count session and resulting variance adjustments |
| Stock adjustment | Correction | Authorized manual quantity change with reason |
| Dispensing | Filling | Supplying prescription items to a patient (always via a sale) |
| Cash session | Shift, Till session | A cashier's register session from opening float to closing count |
| Platform administrator | Super admin | SaaS operator staff; outside any organization |

Money terms (must be used precisely in all finance text):
- **Gross sales** = sum of line amounts before discounts, excluding tax.
- **Net sales (Revenue)** = gross sales − discounts − sales returns (excluding tax).
- **COGS** = sum of batch unit cost × quantity sold, net of returned-to-stock quantities.
- **Gross profit** = Net sales − COGS.
- **Cash flow** = actual money in/out by payment method (sales receipts, refunds, supplier payments, expenses, cash in/out).
- **Inventory valuation** = Σ(on-hand quantity × batch unit cost) at a point in time.

---

## 3. Business Requirements (BRQ)

| ID | Business requirement |
|---|---|
| BRQ-01 | Secure, role- and permission-based access with individual accountability. |
| BRQ-02 | Support one or many organizations, each with one or many branches, with strict data isolation. |
| BRQ-03 | Maintain an accurate, searchable medicine catalog. |
| BRQ-04 | Track inventory at batch level per branch with expiry awareness and full movement traceability. |
| BRQ-05 | Prevent sale of expired stock, prevent overselling, and keep stock consistent under concurrency and failure. |
| BRQ-06 | Organize procurement: suppliers, purchase orders, receiving, supplier invoices, returns, payments, balances. |
| BRQ-07 | Fast, reliable POS sales with payments, discounts, taxes, invoices, voids, and returns. |
| BRQ-08 | Maintain patient profiles and history with data minimization and privacy controls. |
| BRQ-09 | Register prescriptions and record traceable (including partial) dispensing under pharmacist verification. |
| BRQ-10 | Provide accurate financial and operational reporting that distinguishes revenue, profit, cash flow, and inventory valuation. |
| BRQ-11 | Proactively alert users to low stock, near-expiry stock, and operational events. |
| BRQ-12 | Make every sensitive operation auditable and tamper-evident. |
| BRQ-13 | Provide Arabic and English UIs (RTL/LTR), locale-aware formats, and light/dark/system themes. |
| BRQ-14 | Operate reliably in production: monitoring, backup, restore, and recoverability. |
| BRQ-15 | Be configurable for Egyptian regulatory and tax requirements once validated by qualified professionals. |

---

## 4. Global Business Rules (BR-G)

Rules 01–19 are mandated by the product owner; 20–35 were identified during analysis.

| ID | Rule |
|---|---|
| BR-G-01 | Every organization owns its branches; a branch belongs to exactly one organization for its lifetime. |
| BR-G-02 | Every branch has its own inventory; stock is never shared implicitly across branches. |
| BR-G-03 | Every medicine can have multiple batches. |
| BR-G-04 | Every batch belongs to exactly one medicine and exactly one branch. A transfer creates/increments a batch in the destination branch linked to the source batch (same batch number, expiry, unit cost). |
| BR-G-05 | Every inventory quantity change is recorded as an immutable stock movement referencing its source document. |
| BR-G-06 | FEFO (first expired, first out) is the default batch allocation strategy for sales, transfers, and supplier returns unless the user explicitly selects an eligible batch with the `inventory.batches.override-fefo` permission. |
| BR-G-07 | Expired batches (expiry date ≤ branch business date) and batches inside the configured do-not-sell window cannot be sold, dispensed, or transferred for sale. |
| BR-G-08 | Negative on-hand quantity is prevented. There is no negative-stock exception in v1. |
| BR-G-09 | Stock updates and their movements are written in the same database transaction as the business document that causes them. |
| BR-G-10 | Concurrent operations must not oversell: allocation locks batch balance rows (`SELECT … FOR UPDATE`, deterministic order by batch id) and a DB check constraint `on_hand >= 0` is the final guard. |
| BR-G-11 | Completed sales are immutable. Corrections occur only via void (restricted) or sales return documents. |
| BR-G-12 | Every sales return references its original sale and the original sale lines; returned quantity per line ≤ sold − previously returned. |
| BR-G-13 | Stock transfers follow the explicit workflow Draft → Requested → Approved → Dispatched (In Transit) → Received (or Partially Received / Cancelled / Rejected). |
| BR-G-14 | OCR results are suggestions only; a pharmacist must verify every prescription item before dispensing. |
| BR-G-15 | Partial prescription dispensing is supported; each dispensing event records medicine, batch, quantity, pharmacist, and sale. |
| BR-G-16 | Every sensitive operation writes an audit log entry in the same transaction (see SPEC-10 sensitive-operation catalog). |
| BR-G-17 | Organization and branch authorization is enforced on the backend for every request; UI hiding is never the control. |
| BR-G-18 | Money uses decimal arithmetic only (C# `decimal`, PostgreSQL `numeric`); no floating point. Unit prices/costs `numeric(19,4)`; document amounts `numeric(19,2)`; rounding `MidpointRounding.AwayFromZero` at line level, then totals are sums of rounded lines. |
| BR-G-19 | Every critical workflow is atomic: on any failure the whole operation rolls back and no partial stock, money, or document state remains. |
| BR-G-20 | Prices, costs, tax rates, and discounts are snapshotted on document lines at the time of the transaction. |
| BR-G-21 | Prescription-only medicines require a linked, verified prescription when the organization setting `EnforcePrescriptionForRxOnly` is on (default ON; regulatory confirmation pending REG-01). |
| BR-G-22 | Controlled medicines can only be dispensed by a Pharmacist, require a linked verified prescription, and are recorded in the controlled-medicine register (rules pending REG-02). |
| BR-G-23 | Timestamps are stored in UTC (`timestamptz`); the branch time zone (default `Africa/Cairo`) defines the business date used for expiry checks, cash sessions, and reports. |
| BR-G-24 | Financial documents (sales invoice, sales return, goods receipt, supplier return, supplier payment, stock transfer, adjustment) get a human-readable number unique per branch, per document type, per year, assigned gaplessly inside the posting transaction (e.g., `CAI01-INV-2026-000123`). |
| BR-G-25 | Corrections are made by reversing/compensating entries; ledger rows (stock movements, payments, cash movements, audit logs) are never updated or deleted. |
| BR-G-26 | A closed cash session is immutable; discrepancies are recorded, not edited. |
| BR-G-27 | Near-expiry threshold is configurable per branch (default 90 days); do-not-sell window is configurable (default 0 days). |
| BR-G-28 | Segregation of duties: stock adjustments above the branch value threshold and stock transfers require approval by a different user holding the approval permission. |
| BR-G-29 | Every read of a patient's medical data (allergies, conditions, history, prescriptions) is access-logged. |
| BR-G-30 | Deactivating a user revokes all their refresh tokens immediately; access tokens expire within their lifetime (≤ 15 min). |
| BR-G-31 | Supplier returns can only be made from batches originally received from that supplier and only up to the batch's available quantity. |
| BR-G-32 | Discounts above the role's configured limit require a manager override (user with `sales.discounts.override` re-authenticating at the POS). |
| BR-G-33 | Medicines, suppliers, patients, and users referenced by any document cannot be hard-deleted; they are deactivated (soft-deleted). |
| BR-G-34 | Financial, inventory, prescription, and audit records are retained and never hard-deleted by application users; retention periods are pending legal review (REG-05). |
| BR-G-35 | A sale is completed only when its payments fully cover the total (cash change computed); stock deduction, payment records, cash movements, and invoice numbering commit together or not at all. |

---

## 5. Roles & Permissions

### 5.1 System roles (seeded per organization, editable clones allowed; custom roles allowed)

| Role code | Name | Typical scope |
|---|---|---|
| `OWNER` | Owner | All branches of the organization; all permissions |
| `MANAGER` | Branch Manager | Assigned branches; operational + approval permissions |
| `PHARMACIST` | Pharmacist | Assigned branches; dispensing, prescriptions, patients, sales |
| `CASHIER` | Cashier | Assigned branches; POS sales, own cash session |
| `INVENTORY` | Inventory Staff | Assigned branches; receiving, counts, transfers (no approval) |
| `ACCOUNTANT` | Accountant | Assigned branches or organization; finance & reports read, expenses, supplier payments |

`PLATFORM_ADMIN` exists only at platform level (SaaS operator): manages organizations and subscriptions; has **no** access to organization business data unless an audited, time-limited support grant is given by the Owner (SPEC-02).

### 5.2 Permission code format
`<module>.<resource>.<action>` — lowercase, kebab-case parts. Modules: `identity`, `org`, `catalog`, `inventory`, `procurement`, `sales`, `patients`, `prescriptions`, `finance`, `reports`, `notifications`, `audit`, `settings`.

Canonical permissions (authors may add more in their spec's "Actors and permissions" section, following the format, and must list them in a table):

```
identity.users.read|create|update|deactivate|reset-password
identity.roles.read|manage
identity.sessions.read|revoke
org.organization.read|update
org.branches.read|create|update|deactivate
org.branch-assignments.manage
catalog.medicines.read|create|update|deactivate|import|export
catalog.prices.update
catalog.reference-data.manage            (categories, manufacturers, ingredients, dosage forms)
inventory.stock.read
inventory.batches.read|update-metadata|override-fefo
inventory.movements.read
inventory.adjustments.create|approve
inventory.write-offs.create|approve      (damaged/expired)
inventory.stocktakes.manage|approve
inventory.transfers.create|approve|dispatch|receive
procurement.suppliers.read|manage
procurement.purchase-orders.read|create|approve|cancel
procurement.receipts.create|post
procurement.supplier-invoices.manage
procurement.supplier-returns.create|post
procurement.supplier-payments.create
sales.pos.sell
sales.sales.read
sales.discounts.apply|override
sales.sales.void
sales.returns.create|approve
sales.cash-sessions.open-close|manage    (manage = view/force-close others)
patients.profiles.read|manage
patients.medical.read|manage             (allergies, conditions, history)
patients.data.export|anonymize
prescriptions.prescriptions.read|create|verify|cancel
prescriptions.dispense
prescriptions.controlled.dispense
finance.expenses.manage
finance.cash.manage                      (cash in/out, reconciliation)
reports.sales.read
reports.inventory.read
reports.finance.read
reports.organization.read                (cross-branch/org-level)
reports.export
notifications.read
notifications.rules.manage
audit.logs.read
settings.organization.manage
settings.branch.manage
```

#### 5.2.1 Permissions added by the specifications (consolidated 2026-11-10)

These codes were introduced by the module specifications and are part of the canonical catalog; the owning spec defines default role grants. `org.platform-organizations.*` permissions belong only to platform users (separate `PlatformUser` store and `platform` token audience, SPEC-01 FR-01-045), never to organization roles.

| Permission | Defined in |
|---|---|
| `audit.chain.verify` | SPEC-10 |
| `audit.logs.export` | SPEC-10 |
| `audit.reports.read` | SPEC-10 |
| `catalog.costs.read` | SPEC-03 |
| `catalog.medicines.classify` | SPEC-03 |
| `finance.expenses.approve` | SPEC-09 |
| `inventory.batches.quarantine` | SPEC-04 |
| `inventory.opening-balances.manage` | SPEC-04 |
| `inventory.reconciliation.read` | SPEC-04 |
| `inventory.reorder-settings.manage` | SPEC-04 |
| `inventory.stock.read-other-branches` | SPEC-04 |
| `notifications.customer.manage` | SPEC-10 |
| `notifications.system.manage` | SPEC-10 |
| `org.platform-organizations.provision` | SPEC-02 |
| `org.platform-organizations.read` | SPEC-02 |
| `org.platform-organizations.suspend` | SPEC-02 |
| `org.support-grants.manage` | SPEC-02 |
| `patients.access-logs.read` | SPEC-07 |
| `patients.allergy-alerts.acknowledge` | SPEC-07 |
| `patients.profiles.merge` | SPEC-07 |
| `prescriptions.controlled-register.read` | SPEC-08 |
| `prescriptions.interactions.override` | SPEC-08 |
| `prescriptions.prescribers.manage` | SPEC-08 |
| `procurement.receipts.override-shelf-life` | SPEC-05 |
| `procurement.receipts.read` | SPEC-05 |
| `procurement.receipts.reverse` | SPEC-05 |
| `procurement.supplier-invoices.approve-variance` | SPEC-05 |
| `procurement.supplier-invoices.read` | SPEC-05 |
| `procurement.supplier-ledger.manage` | SPEC-05 |
| `procurement.supplier-ledger.read` | SPEC-05 |
| `procurement.supplier-payments.reverse` | SPEC-05 |
| `procurement.supplier-returns.read` | SPEC-05 |
| `reports.projections.manage` | SPEC-09 |
| `sales.loyalty.manage` | SPEC-06 |
| `sales.returns.inspect` | SPEC-06 |
| `sales.sales.read-cost` | SPEC-06 |
| `settings.data-export.manage` | SPEC-10 |
| `settings.operations.manage` | SPEC-10 |
| `settings.operations.read` | SPEC-10 |

### 5.3 Authorization model
Effective access = (permission granted by any of the user's roles) AND (target branch ∈ user's assigned branches, or user has organization-wide scope) AND (target organization = user's organization from the token). Branch-scoped endpoints take `branchId` in the route; the server validates it. Cross-organization access returns **404** (do not reveal existence); permission-denied within own organization returns **403**.

---

## 6. Canonical Domain Model

Conventions for all entities unless stated: PK `Id uuid` (UUIDv7 generated by the application); `OrganizationId uuid NOT NULL` on every tenant-owned table; `BranchId uuid` on every branch-scoped table; audit columns `CreatedAt, CreatedBy, UpdatedAt, UpdatedBy`; optimistic concurrency token PostgreSQL `xmin` (mapped as `RowVersion`) on mutable aggregates; soft delete `IsActive`/`DeactivatedAt` for master data only (never for documents/ledgers). Table names snake_case plural in schema per module (e.g., `inventory.batch_balances`).

| Module (DB schema) | Entities (canonical names) |
|---|---|
| Platform / Identity (`identity`) | `User`, `Role`, `Permission`, `RolePermission`, `UserRole`, `UserBranchAssignment`, `RefreshToken` (hashed, with `FamilyId`), `UserSession`, `PasswordResetToken`, `LoginAttempt` |
| Organization (`org`) | `Organization`, `Branch`, `BranchSettings`, `OrganizationSettings`, `DocumentSequence`, `SupportAccessGrant`, `Subscription` (P3) |
| Catalog (`catalog`) | `Medicine`, `MedicineBarcode`, `MedicineCategory`, `Manufacturer`, `ActiveIngredient`, `MedicineIngredient` (strength per ingredient), `DosageForm`, `MedicineAlternative`, `MedicinePrice` (org default + optional `BranchMedicinePrice` override), `TaxCategory` |
| Inventory (`inventory`) | `Batch` (MedicineId, BranchId, BatchNumber, ExpiryDate, UnitCost, SupplierId?, SourceBatchId?, Status), `BatchBalance` (BatchId PK/FK, OnHand, Reserved, check OnHand ≥ 0 and Reserved ≥ 0 and Reserved ≤ OnHand), `StockMovement` (append-only), `StockAdjustment` + `StockAdjustmentLine`, `WriteOff` + `WriteOffLine`, `Stocktake` + `StocktakeLine`, `StockTransfer` + `StockTransferLine` + `StockTransferAllocation`, `ReorderSetting` (per branch per medicine min/max) |
| Procurement (`procurement`) | `Supplier`, `SupplierContact`, `PurchaseOrder`, `PurchaseOrderLine`, `GoodsReceipt`, `GoodsReceiptLine`, `SupplierInvoice`, `SupplierInvoiceLine`, `SupplierReturn`, `SupplierReturnLine`, `SupplierPayment`, `SupplierPaymentAllocation`, `SupplierLedgerEntry` (append-only) |
| Sales (`sales`) | `Sale`, `SaleLine`, `SaleLineAllocation` (batch, qty, unit cost), `Payment`, `SalesReturn`, `SalesReturnLine`, `Refund`, `CashSession`, `CashMovement` (append-only), `DiscountRule` (P2), `IdempotencyRecord` (shared infra table) |
| Patients (`patients`) | `Patient`, `PatientAllergy`, `PatientCondition`, `PatientNote`, `PatientConsent`, `PatientAccessLog` |
| Prescriptions (`prescriptions`) | `Prescriber` (doctor), `Prescription`, `PrescriptionItem`, `PrescriptionAttachment`, `DispensingRecord` (links PrescriptionItem ↔ SaleLine ↔ Batch), `OcrExtraction` (suggestions only), `ControlledMedicineRegisterEntry` |
| Finance (`finance`) | `Expense`, `ExpenseCategory`, `CashMovement` is owned by Sales (read via query), `DailyBranchSummary` (materialized/report projection), `ReportExport` |
| Notifications/Audit/Settings (`platform`) | `Notification`, `NotificationRecipient`, `NotificationRule`, `AuditLog` (append-only, hash-chained), `UserPreference` (language, theme), `FileObject` (storage metadata), `OutboxMessage`, `BackgroundJobRun` |

Medicine is **organization-level** (one catalog per organization). Prices: organization default selling price with optional branch override. Purchase cost lives on the Batch (actual) and on the Medicine as `LastPurchaseCost` (reference only).

### 6.1 Canonical status enums

| Entity | Statuses |
|---|---|
| User | `Invited`, `Active`, `Locked`, `Deactivated` |
| Branch | `Active`, `Inactive` |
| Medicine | `Active`, `Inactive` |
| Batch | `Active`, `Quarantined`, `Expired` (derived/flagged nightly), `Depleted` |
| PurchaseOrder | `Draft`, `Submitted`, `Approved`, `PartiallyReceived`, `Received`, `Closed`, `Cancelled` |
| GoodsReceipt | `Draft`, `Posted`, `Reversed` |
| SupplierInvoice | `Draft`, `Posted`, `PartiallyPaid`, `Paid`, `Cancelled` |
| SupplierReturn | `Draft`, `Posted` |
| Sale | `Completed`, `PartiallyReturned`, `Returned`, `Voided` (no server-side draft; the cart lives on the client until completion) |
| SalesReturn | `Draft`, `PendingApproval`, `Completed`, `Rejected` |
| CashSession | `Open`, `Closed` |
| StockTransfer | `Draft`, `Requested`, `Approved`, `Rejected`, `InTransit`, `PartiallyReceived`, `Received`, `Cancelled` |
| StockAdjustment / WriteOff | `Draft`, `PendingApproval`, `Posted`, `Rejected` |
| Stocktake | `Draft`, `Counting`, `PendingApproval`, `Posted`, `Cancelled` |
| Prescription | `Draft`, `PendingVerification`, `Verified`, `PartiallyDispensed`, `FullyDispensed`, `Cancelled`, `Expired` |
| Notification | `Unread`, `Read`, `Dismissed` |

### 6.2 Stock movement types
`Receipt`, `ReceiptReversal`, `Sale`, `SaleVoid`, `SalesReturn`, `TransferOut`, `TransferIn`, `TransferReturn` (rejected/short items back to source), `AdjustmentIncrease`, `AdjustmentDecrease`, `WriteOffDamaged`, `WriteOffExpired`, `StocktakeVariance`, `SupplierReturn`, `OpeningBalance`. Each movement stores: Id, OrganizationId, BranchId, BatchId, MedicineId, Type, QuantityDelta (signed integer, base units), UnitCost, BalanceAfter, SourceDocumentType, SourceDocumentId, SourceLineId, OccurredAt, BusinessDate, UserId, CorrelationId.

### 6.3 Quantities & units
Stock is integer base units. `Medicine.PackSize` (base units per pack, ≥1) and `Medicine.AllowSplitPack` (bool). POS can sell packs or (if allowed) base units; the line stores both `Quantity` and `QuantityBaseUnits`.

---

## 7. Technical Baseline (decided; see ADRs)

- **Architecture:** Modular monolith, Clean Architecture per module (Domain / Application / Infrastructure / Api contracts), single deployable ASP.NET Core host (.NET 10 LTS), modules communicate through in-process public contracts (MediatR-style requests are internal to a module; cross-module via module facades + integration events through a transactional outbox). — ADR-001
- **Multi-tenancy:** Shared database, shared schema, `OrganizationId` discriminator, EF Core global query filters + mandatory tenant context + PostgreSQL Row-Level Security as defense in depth (enabled from Phase 0 / MVP — decision 2026-11-10; originally planned for the security-hardening phase). — ADR-002
- **Inventory:** Append-only `StockMovement` ledger + transactionally maintained `BatchBalance`; pessimistic row locks for allocation; nightly reconciliation job. — ADR-003, ADR-004
- **Auth:** ASP.NET Core Identity core (password hashing PBKDF2/Identity v3, lockout) + JWT access tokens (15 min, RS256 / ES256 signing key) + opaque refresh tokens (hashed, 14-day sliding, 30-day absolute, rotation with family reuse detection), refresh token in `HttpOnly; Secure; SameSite=Strict` cookie scoped to `/api/v1/auth`. — ADR-005
- **Files:** S3-compatible object storage abstraction (MinIO in Docker/dev, any S3-compatible service in prod), private buckets, pre-signed short-lived URLs after authorization, metadata in `FileObject`. — ADR-006
- **Background jobs:** Hangfire with PostgreSQL storage (in-process server, separate worker host optional). — ADR-007
- **Audit:** Append-only `AuditLog` table written in the same transaction via an EF Core SaveChanges interceptor + explicit domain audit events; per-organization hash chain for tamper evidence. — ADR-008
- **Localization:** i18next (frontend), `Accept-Language` + resource files (backend) returning stable error `code`s plus localized `message`; `ar` and `en`; RTL via `dir` attribute + Tailwind logical properties. — ADR-009
- **Frontend state:** TanStack Query for server state; **Zustand** for client state (POS cart, UI prefs, auth session). — ADR-010
- **Real-time:** SignalR hub `/hubs/notifications`, groups per organization/branch/user. Used for notifications and stock-level hints; never for authoritative stock decisions.
- **Idempotency:** `Idempotency-Key` header (UUID) REQUIRED on: sale completion, sale void, sales return, refund, goods receipt posting, supplier return posting, supplier payment, stock adjustment/write-off posting, transfer dispatch/receive, stocktake posting, cash session close, dispensing. Records stored 24h keyed by (OrganizationId, UserId, Key) with request hash; same key + same hash → replay stored response; same key + different hash → 422 `COMMON.IDEMPOTENCY_KEY_REUSED`.
- **API:** REST, `/api/v1/...`, JSON camelCase, RFC 9457 Problem Details with extensions `code`, `traceId`, `errors` (field → [{code, message}]). Branch-scoped resources: `/api/v1/branches/{branchId}/...`. Org-level resources: `/api/v1/...` (org from token). Pagination: `page`, `pageSize` (default 25, max 100) returning `{ items, page, pageSize, totalCount }`; cursor pagination (`cursor`, `limit`) for ledgers/audit logs. Sorting: `sort=field,-field2`. Filtering: explicit query params. Concurrency: `ETag`/`If-Match` for updates of mutable resources → 412 on mismatch.

### 7.1 Global NFR baseline (NFR-G)

| ID | Target |
|---|---|
| NFR-G-01 | POS medicine search (name/generic/barcode) p95 ≤ 300 ms server time at 50,000 medicines and 500,000 batches per organization. |
| NFR-G-02 | Sale completion p95 ≤ 800 ms, p99 ≤ 1.5 s with 20 concurrent cashiers per branch and 50 branches active. |
| NFR-G-03 | Standard list/detail API p95 ≤ 500 ms; reports over ≤ 1 year/1 branch ≤ 5 s, larger reports run as background exports. |
| NFR-G-04 | Availability target 99.5% monthly for a single-region deployment (excluding announced maintenance). |
| NFR-G-05 | RPO ≤ 15 minutes (WAL archiving / PITR), RTO ≤ 4 hours; restore tested monthly. |
| NFR-G-06 | Zero oversell and zero negative balances under concurrency tests (CS-01) — hard gate. |
| NFR-G-07 | All endpoints authenticated except `/auth/login`, `/auth/refresh`, `/auth/password/forgot\|reset`, health checks. |
| NFR-G-08 | WCAG 2.2 AA for core flows (login, POS, receiving, dispensing). |
| NFR-G-09 | Frontend initial load ≤ 3 s on 10 Mbps / mid-range laptop; POS route interactive ≤ 2 s after login. |
| NFR-G-10 | Logs structured (Serilog JSON) with `traceId`, `organizationId`, `branchId`, `userId`; no secrets, tokens, passwords, or patient medical data in logs. |

---

## 8. Document Templates

### 8.1 Specification file (`docs/specs/SPEC-SS-*.md`) — headings are mandatory and in this order

```
# SPEC-SS: <Title>
**Version / Status / Owner / Related ADRs / Related BRQs**
## 1. Purpose
## 2. Business Context
## 3. Scope
## 4. Out of Scope
## 5. Actors and Permissions
## 6. Functional Requirements
## 7. Business Rules
## 8. Data Requirements
## 9. Validation Rules
## 10. API Requirements
## 11. Authorization Requirements
## 12. Error Handling
## 13. Edge Cases
## 14. Acceptance Criteria
## 15. Dependencies
## 16. Non-Functional Requirements
## 17. Security and Privacy Considerations
## 18. Testing Considerations
## 19. Open Decisions
## 20. Regulatory Review Items   (only REG-xx references; write "None" if none)
```

Functional requirements MUST be a Markdown table with exactly these columns (machine-parsed):

```
| ID | Requirement | Priority | BRQ | Stories |
|---|---|---|---|---|
| FR-04-001 | The system shall ... | P0 | BRQ-04 | US-04-01, US-04-02 |
```

Use "shall" statements, one testable behavior per row, measurable where relevant. Business rules table: `| ID | Rule | Source |` where Source cites BR-G-xx if derived. Validation rules table: `| ID | Field / Object | Rule | Error code |`. API table: `| Method | Path | Purpose | Permission | Idempotency |`. Acceptance criteria in spec are spec-level (`SAC-SS-NN`) and summarize; story ACs are the detailed testable ones.

### 8.2 Story file (`docs/stories/EPIC-SS-<NAME>/US-SS-NN-<kebab-title>.md`)

```
# US-SS-NN: <Title>

| Field | Value |
|---|---|
| Story ID | US-SS-NN |
| Epic | EPIC-SS |
| Priority | P0 |
| Complexity | M |
| Related Requirements | FR-SS-001, FR-SS-004 |
| Related Business Rules | BR-G-07, BR-SS-003 |
| Dependencies | US-SS-01, US-03-02 |

## User Story
As a <role>, I want <capability> so that <benefit>.

## Business Value
## Preconditions
## Acceptance Criteria
### US-SS-NN-AC1: <short name>
- **Given** ...
- **When** ...
- **Then** ...
(at least 3 ACs; include ≥1 negative AC and ≥1 permission-denied AC where an endpoint exists)
## Validation Rules
## Authorization Rules
## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
## Edge Cases
## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-SS-NNN | Integration | ... | US-SS-NN-AC1 |
```

Each epic folder also has `README.md`: epic goal, scope, story list table (`| Story | Title | Priority | Complexity | Requirements |`), dependency diagram (Mermaid), and MVP marking.

### 8.3 Writing rules
- Professional English, Markdown, Mermaid only where it materially helps.
- No implementation code (SQL DDL fragments and JSON request/response examples are allowed as specification).
- No vague words without a measure: "fast", "quickly", "user-friendly", "appropriate", "etc." are prohibited in requirements.
- Never claim legal/regulatory compliance; reference `REG-xx` items instead. Never invent laws, article numbers, authorities' requirements, or medical data sources.
- Drug interaction / allergy features are decision support only.

---

## 9. Critical Cross-Cutting Scenarios (CS) — owners must cover them as TS-xx scenarios

| ID | Scenario | Owning epic(s) |
|---|---|---|
| CS-01 | Two cashiers sell the last available unit simultaneously → exactly one succeeds, other gets `INVENTORY.INSUFFICIENT_STOCK`, balance = 0, one movement | EPIC-06 (with EPIC-04) |
| CS-02 | Attempt to sell an expired batch / batch in do-not-sell window | EPIC-06, EPIC-04 |
| CS-03 | Partial goods receiving against a PO, then the remainder | EPIC-05 |
| CS-04 | Partial prescription dispensing across two visits | EPIC-08 |
| CS-05 | Return items from a completed sale (partial, then remaining; over-return rejected) | EPIC-06 |
| CS-06 | Branch-to-branch transfer, including short receipt and in-transit visibility | EPIC-04 |
| CS-07 | Unauthorized cross-branch access (user assigned to branch A calls branch B) → 403 | EPIC-01, EPIC-02, every epic |
| CS-08 | Unauthorized cross-organization access → 404, no data leaked | EPIC-02, every epic |
| CS-09 | Failed / unconfirmed payment during sale → no stock deducted, no sale persisted | EPIC-06 |
| CS-10 | Database failure mid inventory deduction → full rollback, ledger and balance unchanged | EPIC-04, EPIC-06 |
| CS-11 | Duplicate request / client retry with same Idempotency-Key → single effect, same response | EPIC-06, EPIC-05, EPIC-04 |
| CS-12 | Refresh token reuse after rotation → whole token family revoked | EPIC-01 |
| CS-13 | Controlled / Rx-only medicine sold without verified prescription → blocked | EPIC-06, EPIC-08 |

---

## 10. Regulatory Review Items (REG) — require confirmation by qualified Egyptian professionals

| ID | Topic | Reviewer |
|---|---|---|
| REG-01 | Which medicines require a prescription at dispensing, and prescription validity/retention | Pharmacist / pharmaceutical regulatory counsel |
| REG-02 | Controlled medicines (narcotics/psychotropics) handling, register format, reporting duties | Pharmaceutical regulatory counsel |
| REG-03 | Medicine traceability requirements (batch/serialization, any national track-and-trace programme) | Regulatory counsel |
| REG-04 | Patient personal and health data protection (Egyptian personal data protection legislation applicability, consent, cross-border transfer, data residency) | Privacy / legal counsel |
| REG-05 | Record retention periods for sales, purchase, prescription, controlled-medicine and audit records | Legal & tax counsel |
| REG-06 | Tax treatment of medicines and other goods (VAT applicability/rates) | Tax advisor |
| REG-07 | Electronic invoicing / electronic receipt obligations and integration with the tax authority systems | Tax advisor |
| REG-08 | Pharmacy operating requirements (licensed pharmacist presence for dispensing, pricing rules for medicines, display of prices) | Pharmaceutical regulatory counsel |
| REG-09 | Licensing of any external drug information database (interactions, allergies, catalog import) | Legal / procurement |
| REG-10 | Prescription images and OCR processing by third-party providers (data processor terms, location) | Privacy / legal counsel |
| REG-11 | Returns of dispensed medicines (whether returned medicines may be restocked) | Pharmaceutical regulatory counsel |

Default product behavior pending REG-11: each sales return line gets a disposition. Default `PendingInspection` — no stock movement is created at return time. A pharmacist later sets `Restocked` (creates a `SalesReturn` stock movement into the **original batch**, only if not expired and the batch is not `Quarantined`) or `Discarded` (no stock re-enters; recorded as a return loss). Organization setting `AllowDirectRestockOnReturn` (default OFF) lets an authorized pharmacist choose `Restocked` at return time. Batch status `Quarantined` is used for whole-batch holds (e.g., recalls) and blocks all sales from that batch.

`BatchBalance.Reserved` holds quantities reserved by approved-but-not-dispatched transfers and supplier returns in draft. Sellable quantity = `OnHand − Reserved` for batches with status `Active` and not inside the do-not-sell window.
