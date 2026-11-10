# ADR-006: File Storage — S3-Compatible Object Storage Abstraction with Private Buckets and Pre-Signed URLs

| Field | Value |
|---|---|
| Status | Accepted |
| Date | 2026-11-09 |
| Deciders | Solution architect, security lead, DevOps lead |
| Related BRQs | BRQ-08, BRQ-09, BRQ-12, BRQ-14 |
| Related REG | REG-04, REG-05, REG-10 |
| Related ADRs | ADR-001, ADR-002, ADR-008 |
| Supersedes | — |

## 1. Context

The system stores binary files: prescription images/PDFs (SPEC-08), supplier invoice scans (SPEC-05), medicine import files (SPEC-03), report exports (SPEC-09), organization logos (SPEC-02), and backups metadata (SPEC-10). Prescription images are sensitive health data (BRQ-08, REG-04, REG-10). Files must be private, authorized per request, validated (type, size, content sniffing), and retained per policy (REG-05). Deployment ranges from a single Docker host to a SaaS cloud environment.

## 2. Decision Drivers

1. **Security** — no public URLs; authorization via the API before every access; tenant isolation.
2. **Portability** — same code on a single-pharmacy server and on any cloud.
3. **Database health** — keep large binaries out of the transactional database and its backups/replication.
4. **Scalability** — downloads should not stream through application memory.
5. **Backup/restore** — files and metadata restorable consistently (NFR-G-05).
6. **Cost and operational simplicity**.

## 3. Considered Options

### Option A — PostgreSQL `bytea` (or large objects)
- **Pros:** Transactional with metadata; single backup; simple authorization.
- **Cons:** Database bloat and slower backups/restores (threatens RTO ≤ 4 h); WAL volume increases RPO pressure; every download streams through the API and DB; poor scalability for image-heavy prescription workflows.

### Option B — Local filesystem / mounted volume
- **Pros:** Simple; no extra service; fast on a single host.
- **Cons:** Breaks with multiple app replicas unless shared storage (NFS) is added; separate backup procedure; path traversal and permission risks; no pre-signed URL mechanism; poor fit for SaaS.

### Option C — S3-compatible object storage behind an `IFileStorage` abstraction (chosen)
- **Pros:** Works with MinIO (Docker/on-prem) and any S3-compatible cloud service; private buckets; pre-signed short-lived URLs offload transfer from the API; versioning, server-side encryption, and lifecycle policies available; independent scaling.
- **Cons:** Additional service to operate (MinIO) in on-prem installs; metadata (DB) and object (bucket) are not in one transaction — orphan handling required; S3-compatibility varies across providers for advanced features.

## 4. Decision

Adopt **Option C**:

1. `IFileStorage` abstraction in the platform module; S3 API implementation; **MinIO** in Docker Compose for development and on-prem; any S3-compatible service in production (provider selection subject to REG-04 residency outcome).
2. **Metadata** in `platform.file_objects` (`FileObject`): Id (UUIDv7), OrganizationId, BranchId?, owning entity type/id, purpose (e.g., `PrescriptionImage`), original name (sanitized), content type (sniffed), size, SHA-256 hash, storage key, status (`Pending`, `Active`, `Deleted`), uploaded by/at, retention class.
3. **Object keys** are opaque: `{organizationId}/{purpose}/{yyyy}/{mm}/{fileObjectId}` — never user-supplied names.
4. **Upload flow:** client requests upload → API authorizes and creates `FileObject(Pending)` → API returns a pre-signed PUT URL (≤ 5 min, content-type and max size constrained) **or** streams small files through the API → client confirms → API verifies object existence, size, hash and magic-byte type → status `Active` and links to the owning entity in the business transaction. Orphaned `Pending` objects are purged by a Hangfire job after 24 h.
5. **Download flow:** API authorizes (permission + branch scope + organization; patient-data access logged per BR-G-29) → returns a pre-signed GET URL (≤ 5 min) with `Content-Disposition: attachment` for non-image types.
6. **Validation:** allow-list per purpose (initially JPEG, PNG, PDF for prescriptions/invoices; CSV/XLSX for imports); size limits per purpose (initially 10 MB images/PDF, 20 MB imports); malware scanning hook designed (provider selection is open decision OD-G-01; ClamAV in a sidecar container is the default candidate) and enabled in the hardening phase.
7. **Security:** buckets private, no public ACLs; server-side encryption enabled; TLS in transit; separate credentials per environment.
8. **Deletion:** application users cannot hard-delete files linked to retained records (BR-G-34); deletion is a retention-job action after REG-05 periods are confirmed.

## 5. Consequences

**Positive**
- Database stays lean; backups faster; RTO achievable.
- Same code for all deployment models; scales horizontally.
- Strong access control with time-limited URLs.

**Negative**
- Two-phase metadata/object consistency must be handled (pending/orphan cleanup).
- Backup and restore must cover both PostgreSQL and the bucket, with consistent points in time (bucket versioning + documented restore order).
- Pre-signed URLs, once issued, are usable by anyone holding them until expiry (short TTL mitigates).

## 6. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Malicious file upload (polyglot, script) | Magic-byte sniffing, allow-list, re-encoding of images (optional), malware scan hook, `nosniff` headers |
| Pre-signed URL leakage via logs/referrers | TTL ≤ 5 min; URLs never logged (NFR-G-10); `Referrer-Policy: no-referrer` |
| Data residency of prescription images (REG-04/REG-10) | Provider choice per deployment; on-prem MinIO option; documented in deployment design |
| Bucket/DB restore inconsistency | Versioned bucket; restore runbook restores bucket to ≥ DB point in time; reconciliation job flags missing objects |

## 7. Revisit Triggers

- REG-04/REG-10 outcomes impose storage location or encryption-key custody requirements.
- File volume or access patterns require a CDN or tiered storage.
- Selected S3-compatible provider lacks required features (pre-signed conditions, versioning).

## 8. Related Documents

- [DOCUMENTATION-CONVENTIONS.md](../../DOCUMENTATION-CONVENTIONS.md) §6 (`FileObject`), §7
- [REGULATORY-CONSIDERATIONS-EGYPT.md](../../REGULATORY-CONSIDERATIONS-EGYPT.md) — REG-04, REG-05, REG-10
- SPEC-08 Prescriptions, SPEC-10 Notifications, Audit & Settings in [specs/](../../specs/)
