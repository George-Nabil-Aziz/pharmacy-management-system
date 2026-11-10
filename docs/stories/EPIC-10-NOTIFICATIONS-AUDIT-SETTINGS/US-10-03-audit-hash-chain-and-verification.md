# US-10-03: Per-Organization Audit Hash Chain and Verification

| Field | Value |
|---|---|
| Story ID | US-10-03 |
| Epic | EPIC-10 |
| Priority | P0 |
| Complexity | L |
| Related Requirements | FR-10-004, FR-10-009, FR-10-010, FR-10-011 |
| Related Business Rules | BR-G-25, BR-10-002, BR-10-004, BR-10-012 |
| Dependencies | US-10-01 |

## User Story
As an Owner, I want the audit log to be hash-chained per organization and verified automatically so that any modification, deletion, or insertion of audit entries outside the application is detected.

## Business Value
Delivers the tamper-evidence part of BRQ-12; gives owners and auditors objective evidence that the audit trail is intact.

## Preconditions
- US-10-01 is complete; `AuditChainHead` and `AuditChainVerification` tables exist.
- Sealer database role exists with rights limited to seal columns (`ChainSequence`, `PreviousHash`, `Hash`, `SealedAt`) when they are NULL, and to `AuditChainHead`.

## Acceptance Criteria
### US-10-03-AC1: Sealing builds a gapless chain
- **Given** a new organization with 3 committed, unsealed audit entries
- **When** the sealer cycle runs
- **Then** the entries receive `ChainSequence` 1, 2, 3; entry 1 has `PreviousHash` of 64 zeros; each `Hash` equals SHA-256 of the canonical serialization (SPEC-10 §8.5) concatenated with `PreviousHash`; and `AuditChainHead.LastSequence` = 3

### US-10-03-AC2: Sealing lag within target
- **Given** a steady load of 50 audited operations per second across 10 organizations for 10 minutes
- **When** sealing lag is measured per entry (`SealedAt − commit time`)
- **Then** p95 lag ≤ 60 s

### US-10-03-AC3: Sealer cannot alter content or re-seal (negative)
- **Given** a sealed entry
- **When** the sealer role attempts to update its `Hash` or any non-seal column
- **Then** the database trigger rejects the statement and the row is unchanged

### US-10-03-AC4: Nightly verification passes
- **Given** an organization whose chain is intact
- **When** the nightly verification at 02:30 `Africa/Cairo` runs
- **Then** an `AuditChainVerification` row with result `Passed`, the verified sequence range, and entries checked is recorded, and an `AUDIT.CHAIN_VERIFIED` entry is written

### US-10-03-AC5: Tampering detected
- **Given** a privileged database user changes the `Metadata` of the entry with `ChainSequence` 1,042
- **When** verification runs
- **Then** the result is `Failed` with `FirstFailingSequence = 1042`, `AUDIT.CHAIN_VERIFICATION_FAILED` is written to the organization and platform chains, an `AUDIT_CHAIN_INTEGRITY_FAILURE` notification is created for every active Owner, and a platform alert is raised within 5 minutes

### US-10-03-AC6: Stale unsealed entries reported
- **Given** the sealer has been stopped and an entry has remained unsealed for 16 minutes
- **When** verification runs
- **Then** the result is `Failed` with reason `UnsealedBacklog` and the alerting of AC5 applies

### US-10-03-AC7: On-demand verification and single-run guard
- **Given** an Owner with `audit.chain.verify`
- **When** they `POST /api/v1/audit/chain/verifications` and then immediately post again
- **Then** the first call returns 202 with the verification id and the second returns 409 `AUDIT.VERIFICATION_ALREADY_RUNNING`

### US-10-03-AC8: Permission denied and cross-organization isolation
- **Given** a Branch Manager without `audit.chain.verify`, and an Owner of organization A
- **When** the Manager posts a verification, and the Owner of A requests organization B's verification id
- **Then** the Manager receives 403 `COMMON.FORBIDDEN` and the Owner of A receives 404 `COMMON.NOT_FOUND`

## Validation Rules
- VR-10-007: only one `Running` verification per organization.
- Verification ranges start from the last `Passed` checkpoint; a full re-verification from sequence 1 is performed weekly (Sunday 03:30 `Africa/Cairo`).

## Authorization Rules
- `audit.chain.verify` for POST/GET verification endpoints; organization from token.
- Sealer and verifier jobs run as System actors.

## Error Scenarios
| Scenario | Expected result (HTTP status + error code) |
|---|---|
| Verification already running | 409 `AUDIT.VERIFICATION_ALREADY_RUNNING` |
| Missing permission | 403 `COMMON.FORBIDDEN` |
| Verification id of another organization | 404 `COMMON.NOT_FOUND` |

## Edge Cases
- Entries committed late with earlier `OccurredAt` are sealed in the next cycle; chain order is seal order (BR-10-004).
- Deleted row → sequence gap → `Failed` with reason `SequenceGap`.
- Platform-level events (no organization) are sealed in the `platform` chain and verified by a platform job.

## Testing Notes
| Test ID | Type | Scenario | Covers |
|---|---|---|---|
| TS-10-014 | Integration | Sealer assigns sequences 1..3, genesis hash, correct SHA-256 values | US-10-03-AC1 |
| TS-10-015 | Performance | 50 ops/s for 10 min; p95 sealing lag ≤ 60 s | US-10-03-AC2 |
| TS-10-016 | Integration | Sealer role cannot modify sealed or non-seal columns | US-10-03-AC3 |
| TS-10-017 | Integration | Intact chain verification records `Passed` and `AUDIT.CHAIN_VERIFIED` | US-10-03-AC4 |
| TS-10-018 | Security | Modify, delete, and insert rows via superuser → `Failed` with correct first failing sequence; Owner notification and alert | US-10-03-AC5 |
| TS-10-019 | Integration | Sealer stopped 16 min → `UnsealedBacklog` failure | US-10-03-AC6 |
| TS-10-020 | API | On-demand 202 then 409; Manager 403; cross-org id 404 | US-10-03-AC7, US-10-03-AC8 |
