# Glossary

| Field | Value |
|---|---|
| Version | 1.0 |
| Date | 2026-11-09 |
| Authority | Consistent with [DOCUMENTATION-CONVENTIONS.md §2](DOCUMENTATION-CONVENTIONS.md). Where a term appears in the conventions' "Use" column, that exact word must be used in all documents; the "Do not use" synonyms are listed here only to aid recognition. |

**Legend — Category:** **D** = pharmacy/operations domain · **F** = finance · **T** = technical · **S** = security/privacy · **R** = regulatory/process.
Arabic equivalents are provided as common working translations for UI resources and training; they are not legal definitions and must be reviewed by a pharmacist/translator before use in `ar` resource files.

| Term | Cat. | Definition | Arabic equivalent |
|---|---|---|---|
| Access log (patient) | S | Append-only record of each read of a patient's medical data (allergies, conditions, history, prescriptions), entity `PatientAccessLog` (BR-G-29). | سجل الاطلاع على بيانات المريض |
| Access token | S | Short-lived (15 min) signed JWT presented on each API request; held in memory only in the SPA (ADR-005). | رمز الوصول |
| Active ingredient | D | Pharmacologically active substance of a medicine; a medicine may have several, each with a strength (`MedicineIngredient`). Also called generic substance. | المادة الفعالة |
| Adjustment (stock adjustment) | D | Authorized manual quantity change of a batch with a mandatory reason, posted as `AdjustmentIncrease`/`AdjustmentDecrease` movements; above the branch value threshold requires approval by a different user (BR-G-28). Do not use "correction". | تسوية مخزنية |
| Aging (receivables/payables) | F | Classification of open balances (e.g., supplier payables) by age bucket (0–30, 31–60, 61–90, >90 days) since document date or due date. | أعمار الأرصدة |
| Allergy alert | D | Decision-support warning when a medicine's active ingredients match a patient's recorded allergy; requires pharmacist review; never a guarantee of safety (advanced feature). | تنبيه الحساسية |
| Alternative medicine | D | Another catalog medicine with the same active ingredient(s), strength, and dosage form, recorded as `MedicineAlternative`; substitution is the pharmacist's decision (REG-08). | دواء بديل |
| Append-only | T | Storage rule under which rows are only inserted, never updated or deleted; applies to stock movements, cash movements, supplier ledger entries, audit logs (BR-G-25). | إضافة فقط (غير قابل للتعديل) |
| Audit log | S | Same-transaction, hash-chained, append-only record of sensitive operations: who, what, when, where, why (ADR-008, BR-G-16). | سجل التدقيق |
| Base unit | D | Smallest sellable unit of a medicine (tablet, capsule, ampoule, bottle). All stock quantities are integers in base units. Do not use "unit of measure". | الوحدة الأساسية |
| Batch | D | A received quantity of one medicine in one branch with one batch number, one expiry date, and one unit cost (BR-G-04). Do not use "lot". | التشغيلة (الدفعة) |
| Batch balance | D | Current `OnHand` and `Reserved` quantity of a batch, maintained in the same transaction as its movements. Do not use "stock level". | رصيد التشغيلة |
| Batch number | D | Manufacturer's identifier printed on the pack identifying a production batch. | رقم التشغيلة |
| Bonus quantity | D/F | Free additional units given by a supplier/distributor on a purchase (e.g., 10 + 1). Recorded separately on goods receipt lines; carries no invoice value; lowers the effective unit cost of the batch. | كمية بونص (هدية) |
| Branch | D | A physical pharmacy site belonging to exactly one organization (BR-G-01). Do not use "store", "location", "outlet". | الفرع |
| Business date | D/T | The calendar date in the branch's time zone (default `Africa/Cairo`) used for expiry checks, cash sessions, reports, and document-number years (BR-G-23). | تاريخ العمل |
| Cash flow | F | Actual money in and out by payment method: sales receipts, refunds, supplier payments, expenses, cash in/out. Distinct from profit. | التدفق النقدي |
| Cash movement | F | Append-only record of money entering or leaving a cash session (sale receipt, refund, cash in, cash out). | حركة نقدية |
| Cash session | D/F | A cashier's register session from opening float to closing count; immutable once closed (BR-G-26). Do not use "shift" or "till session". | جلسة الخزينة (الوردية النقدية) |
| COGS (Cost of goods sold) | F | Σ (batch unit cost × quantity sold), net of quantities returned to stock. | تكلفة البضاعة المباعة |
| Controlled medicine | D/R | Medicine subject to special legal controls (e.g., narcotics, psychotropics). Dispensed only by a Pharmacist against a verified prescription and recorded in the controlled-medicine register (BR-G-22, REG-02). | دواء خاضع للرقابة (جدول) |
| Controlled-medicine register | R | System record (`ControlledMedicineRegisterEntry`) of every controlled-medicine dispensing; format pending REG-02. | سجل الأدوية الخاضعة للرقابة |
| Correlation ID | T | Identifier propagated through a request, its jobs, and its logs to correlate them. | معرّف الربط |
| Decision support | D/R | Information presented to help a professional decide (alerts, suggestions); never an automatic decision, diagnosis, or prescription. | دعم القرار |
| Discount override | D | Approval by a user holding `sales.discounts.override`, re-authenticating at the POS, for a discount above the cashier's role limit (BR-G-32). | تجاوز حد الخصم |
| Dispensing | D | Supplying prescription items to a patient; always performed through a sale and recorded per item, batch, quantity, pharmacist, and sale line (BR-G-15). Do not use "filling". | الصرف |
| Do-not-sell window | D | Configurable number of days before expiry during which a batch may not be sold (default 0) (BR-G-27). | فترة حظر البيع قبل الانتهاء |
| Document number | F/T | Human-readable, gapless number per branch, document type, and year (e.g., `CAI01-INV-2026-000123`) (BR-G-24). | رقم المستند |
| Dosage form | D | Physical form of a medicine (tablet, syrup, injection, cream). | الشكل الصيدلي |
| Drug interaction alert | D | Decision-support warning that two medicines may interact, based on licensed reference data (REG-09); requires pharmacist review (advanced feature). | تنبيه التداخل الدوائي |
| ETag | T | HTTP entity tag representing a resource version (from PostgreSQL `xmin`); used with `If-Match` for optimistic concurrency; mismatch → 412. | وسم الإصدار |
| Expense | F | Operating cost not part of COGS (rent, utilities, salaries), recorded by category per branch. | مصروف |
| Expiry date | D | Date after which a batch must not be sold; batches with expiry date ≤ business date are expired (BR-G-07). | تاريخ انتهاء الصلاحية |
| FEFO (First Expired, First Out) | D | Default allocation strategy selecting eligible batches with the earliest expiry first (BR-G-06, ADR-004). | الأقرب انتهاءً يُصرف أولاً |
| FIFO (First In, First Out) | D/F | Strategy using the earliest received stock first; not the default in this system. | الوارد أولاً يُصرف أولاً |
| Generic name | D | Non-proprietary name of a medicine's active ingredient(s), used for search and alternatives. | الاسم العلمي |
| Generic substitution | D/R | Dispensing an alternative medicine with the same active ingredients and strength instead of the prescribed trade name; a pharmacist decision subject to REG-08. | الاستبدال بالبديل العلمي |
| Goods receipt | D | Recording of physically received goods, optionally against a purchase order; posting creates or increments batches. Do not use "GRN" or "receiving" as entity names. | استلام بضاعة (إذن استلام) |
| Gross profit | F | Net sales − COGS. | مجمل الربح |
| Gross sales | F | Sum of line amounts before discounts, excluding tax. | إجمالي المبيعات |
| Hash chain | S | Sequence of audit entries in which each entry's hash includes the previous entry's hash, making tampering detectable (ADR-008). | سلسلة التجزئة |
| Idempotency key | T | Client-generated UUID in the `Idempotency-Key` header; repeating a request with the same key and body yields a single effect and the same response (conventions §7, CS-11). | مفتاح عدم التكرار |
| In transit | D | State of transferred stock that has left the source branch and not yet been received (`InTransit`). | قيد النقل |
| Inventory valuation | F | Σ (on-hand quantity × batch unit cost) at a point in time. | تقييم المخزون |
| JWT (JSON Web Token) | S | Signed token format used for access tokens, carrying user, organization, and scope claims. | رمز JWT |
| Medicine | D | Organization-level catalog definition of a sellable medicine; not physical stock. Do not use "product", "drug", or "item" as entity names. | الدواء (الصنف) |
| Modular monolith | T | Single deployable application internally divided into modules with explicit boundaries, own schemas, and public contracts (ADR-001). | تطبيق أحادي معياري |
| Near-expiry | D | Batch whose expiry falls within the branch's near-expiry threshold (default 90 days) (BR-G-27); triggers alerts. | قارب على الانتهاء |
| Net sales (Revenue) | F | Gross sales − discounts − sales returns, excluding tax. | صافي المبيعات (الإيراد) |
| OCR (Optical Character Recognition) | T | Extraction of text from prescription images; results are suggestions only and are never auto-approved (BR-G-14). | التعرف الضوئي على الحروف |
| On hand | D | Physical quantity of a batch recorded in the system, in base units. | الكمية الفعلية |
| Opening balance | D | Initial stock loaded at go-live, recorded as `OpeningBalance` movements. | رصيد افتتاحي |
| Organization | D | The legal pharmacy business and the tenant boundary. Do not use "tenant", "company", or "pharmacy" as entity names. | المنشأة (المؤسسة) |
| Outbox (transactional outbox) | T | Table (`OutboxMessage`) in which integration events are written in the business transaction and dispatched afterwards, guaranteeing no lost or phantom events. | صندوق الصادر للمعاملات |
| Oversell | D | Selling more than the sellable quantity; prevented by row locks and a check constraint (BR-G-10, NFR-G-06). | البيع بما يتجاوز الرصيد |
| Pack | D | A sellable grouping of `PackSize` base units (e.g., a box of 3 strips × 10 tablets = 30). Do not use "box" or "package" as entity names. | العبوة |
| PackSize | D | Number of base units in one pack (≥ 1). | عدد الوحدات في العبوة |
| Partial dispensing | D | Dispensing only part of a prescription's items or quantities in a visit; the remainder may be dispensed later (BR-G-15, CS-04). | الصرف الجزئي |
| Pessimistic locking | T | Locking rows before modifying them (`SELECT … FOR UPDATE`) so concurrent transactions wait (ADR-004). | القفل التشاؤمي |
| Platform administrator | S | SaaS operator staff outside any organization; no business-data access without an Owner-approved support grant. Do not use "super admin". | مدير المنصة |
| Pre-signed URL | T | Time-limited URL granting access to one stored object, issued only after authorization (ADR-006). | رابط موقّع مسبقاً |
| Prescriber | D | Doctor or other professional who issued a prescription. | الطبيب الواصف |
| Prescription | D | Record of a prescriber's order for a patient, with items, optional attachments, and a verification status. | الروشتة (الوصفة الطبية) |
| Prescription verification | D | Pharmacist's review and confirmation of every prescription item before dispensing. | التحقق من الروشتة |
| Problem Details | T | RFC 9457 standard JSON error format, extended with `code`, `traceId`, `errors`. | تفاصيل المشكلة (صيغة الأخطاء) |
| Purchase order | D | Request to a supplier for medicines and quantities; may be received partially (CS-03). | أمر شراء |
| Quarantine | D | Batch status `Quarantined` that blocks all sales from the batch (e.g., recall, inspection). | حجر (إيقاف التشغيلة) |
| Recall | D/R | Withdrawal of a batch from use at the instruction of a manufacturer or authority; handled by quarantining batches. | سحب تشغيلة |
| Reconciliation (ledger) | T | Nightly verification that each batch balance equals the sum of its movements (ADR-003). | المطابقة |
| Refresh token | S | Long-lived opaque credential used to obtain new access tokens; stored hashed, rotated on every use, sent only in an HttpOnly cookie (ADR-005). | رمز التحديث |
| Refresh token family | S | All refresh tokens descending from one login; reuse of a rotated token revokes the whole family (CS-12). | عائلة رموز التحديث |
| Refund | F | Money paid back to a customer for a sales return. | رد المبلغ |
| Reorder level (min/max) | D | Per-branch per-medicine minimum and maximum stock (`ReorderSetting`) driving low-stock alerts and purchase suggestions. | حد إعادة الطلب |
| Reserved quantity | D | Part of on-hand quantity held for approved-but-not-dispatched transfers and draft supplier returns; not sellable. | الكمية المحجوزة |
| RLS (Row-Level Security) | S | PostgreSQL feature restricting rows visible to a session by policy; used as defense in depth for organization isolation (ADR-002). | أمان على مستوى الصف |
| RPO / RTO | T | Recovery Point Objective (max data loss, ≤ 15 min) / Recovery Time Objective (max downtime, ≤ 4 h) (NFR-G-05). | هدف نقطة/زمن الاستعادة |
| Rx-only medicine | D/R | Prescription-only medicine; requires a linked, verified prescription when `EnforcePrescriptionForRxOnly` is on (BR-G-21, REG-01). | دواء لا يُصرف إلا بروشتة |
| Sale | D | A completed POS transaction; immutable once completed (BR-G-11). Do not use "order" or "invoice" as entity name. | عملية بيع |
| Sales invoice | F | The printed/issued document of a sale. | فاتورة البيع |
| Sales return | D | Return of items from a completed sale, referencing original lines (BR-G-12). Do not use "refund" as the entity. | مرتجع مبيعات |
| Segregation of duties | S | Rule that the approver of an adjustment or transfer is a different user from the requester (BR-G-28). | الفصل بين المهام |
| Sellable quantity | D | `OnHand − Reserved` for `Active` batches outside the do-not-sell window. | الكمية القابلة للبيع |
| Snapshot (price/cost) | F | Copy of price, cost, tax rate, and discount stored on a document line at transaction time (BR-G-20). | لقطة السعر |
| Soft delete (deactivation) | T | Marking master data inactive instead of deleting it (BR-G-33). | إلغاء التفعيل |
| Split pack | D | Selling fewer base units than a full pack (e.g., one strip) when `AllowSplitPack` is true. | بيع بالشريط (تجزئة العبوة) |
| Stock movement | D | Immutable ledger row recording a signed quantity change of a batch, linked to its source document. Do not use "transaction" for stock. | حركة مخزون |
| Stock transfer | D | Explicit branch-to-branch transfer workflow Draft → Requested → Approved → InTransit → Received (BR-G-13). Do not use "move". | تحويل مخزني بين الفروع |
| Stocktake | D | Physical count session producing variance adjustments (`StocktakeVariance`). Do not use "inventory count". | الجرد |
| Supplier | D | Vendor (manufacturer, distributor, wholesaler) from which the organization purchases medicines. | المورد |
| Supplier invoice | F | Supplier's invoice creating a payable. Do not use "bill". | فاتورة المورد |
| Supplier return | D | Return of stock to the supplier from batches received from that supplier (BR-G-31). | مرتجع مشتريات (مرتجع للمورد) |
| Support access grant | S | Owner-approved, time-limited, audited permission for a platform administrator to access organization data. | تصريح دعم فني مؤقت |
| Tenant context | T | Per-request organization, user, and branch scope resolved from the access token; mandatory for data access (ADR-002). | سياق المنشأة |
| UUIDv7 | T | Time-ordered UUID generated by the application for primary keys; index-friendly. | معرّف UUIDv7 |
| Variance | F/D | Difference between expected and actual values: counted vs system quantity in a stocktake, or expected vs counted cash in a cash session. | الفرق (العجز/الزيادة) |
| Void | D | Reversal of a whole completed sale under restricted rules and permission `sales.sales.void`, creating `SaleVoid` movements. Do not use "cancel" or "delete". | إلغاء عملية بيع |
| Write-off | D | Removal of damaged or expired stock with reason and approval (`WriteOffDamaged`, `WriteOffExpired`). | إعدام / شطب مخزون |
