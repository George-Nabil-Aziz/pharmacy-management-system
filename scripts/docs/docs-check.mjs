#!/usr/bin/env node
// Documentation consistency checker and generator.
// Usage: node scripts/docs/docs-check.mjs [--write]
//   --write  regenerates docs/SPEC-STORY-TRACEABILITY.md and docs/REQUIREMENTS.md
// Exit code 1 when errors are found. Warnings never fail the run.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const docs = path.join(root, 'docs');
const WRITE = process.argv.includes('--write');
const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);
const rd = (p) => fs.readFileSync(p, 'utf8');
const rel = (p) => path.relative(root, p).replaceAll('\\', '/');

// ---------- 1. Required files ----------
const SPECS = {
  '01': 'SPEC-01-IDENTITY-ACCESS', '02': 'SPEC-02-ORGANIZATION-BRANCHES', '03': 'SPEC-03-MEDICINE-CATALOG',
  '04': 'SPEC-04-BATCH-INVENTORY', '05': 'SPEC-05-SUPPLIERS-PROCUREMENT', '06': 'SPEC-06-SALES-POS',
  '07': 'SPEC-07-PATIENT-RECORDS', '08': 'SPEC-08-PRESCRIPTIONS', '09': 'SPEC-09-FINANCE-REPORTING',
  '10': 'SPEC-10-NOTIFICATIONS-AUDIT-SETTINGS',
};
const epicDir = (ss) => `EPIC-${ss}-${SPECS[ss].replace(/^SPEC-\d\d-/, '')}`;
const required = [
  'README.md', 'PROJECT-VISION.md', 'MASTER-SDD.md', 'REQUIREMENTS.md', 'GLOSSARY.md',
  'ASSUMPTIONS-AND-OPEN-DECISIONS.md', 'RISKS-AND-MITIGATIONS.md', 'SPEC-STORY-TRACEABILITY.md',
  'DOCUMENTATION-CONVENTIONS.md', 'ADVANCED-FEATURES.md', 'REGULATORY-CONSIDERATIONS-EGYPT.md',
  ...['SYSTEM-ARCHITECTURE', 'DATABASE-DESIGN', 'API-DESIGN', 'SECURITY-ARCHITECTURE', 'INVENTORY-ARCHITECTURE',
    'DEPLOYMENT-ARCHITECTURE'].map((f) => `architecture/${f}.md`),
  ...['ADR-001-ARCHITECTURE-STYLE', 'ADR-002-MULTI-TENANCY', 'ADR-003-INVENTORY-LEDGER', 'ADR-004-FEFO-STRATEGY',
    'ADR-005-AUTHENTICATION', 'ADR-006-FILE-STORAGE', 'ADR-007-BACKGROUND-JOBS', 'ADR-008-AUDIT-LOGGING',
    'ADR-009-LOCALIZATION', 'ADR-010-FRONTEND-STATE-MANAGEMENT'].map((f) => `architecture/decisions/${f}.md`),
  ...Object.values(SPECS).map((s) => `specs/${s}.md`),
  ...Object.keys(SPECS).map((ss) => `stories/${epicDir(ss)}/README.md`),
  ...['MASTER-TEST-STRATEGY', 'TEST-DATA-STRATEGY', 'SECURITY-TEST-PLAN', 'PERFORMANCE-TEST-PLAN',
    'INTEGRATION-TEST-PLAN', 'E2E-TEST-PLAN'].map((f) => `test-plans/${f}.md`),
  ...['IMPLEMENTATION-ROADMAP', 'RELEASE-PLAN', 'DEFINITION-OF-DONE'].map((f) => `roadmap/${f}.md`),
  'test-cases/README.md',
  ...Object.keys(SPECS).map((ss) => `test-cases/TC-${epicDir(ss)}.md`),
];
const generated = new Set(['REQUIREMENTS.md', 'SPEC-STORY-TRACEABILITY.md']);
for (const f of required) {
  const p = path.join(docs, f);
  if (!fs.existsSync(p)) { if (!(WRITE && generated.has(f))) err(`Missing required file: docs/${f}`); continue; }
  if (fs.statSync(p).size < 400) err(`File too small (placeholder?): docs/${f}`);
}

// ---------- helpers ----------
const splitRow = (line) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
const ids = (text, re) => [...new Set(text.match(re) || [])];
const SPEC_HEADINGS = ['Purpose', 'Business Context', 'Scope', 'Out of Scope', 'Actors and Permissions',
  'Functional Requirements', 'Business Rules', 'Data Requirements', 'Validation Rules', 'API Requirements',
  'Authorization Requirements', 'Error Handling', 'Edge Cases', 'Acceptance Criteria', 'Dependencies',
  'Non-Functional Requirements', 'Security and Privacy Considerations', 'Testing Considerations', 'Open Decisions'];
const STORY_SECTIONS = ['User Story', 'Business Value', 'Preconditions', 'Acceptance Criteria', 'Validation Rules',
  'Authorization Rules', 'Error Scenarios', 'Edge Cases', 'Testing Notes'];
const VAGUE = /\b(fast|quickly|user-friendly|appropriate(ly)?|etc\.?|as needed|TBD|TODO)\b/i;

// ---------- 2. Specs ----------
const FR = new Map(); // id -> {ss, text, priority, brq[], stories[]}
const specMeta = {};
for (const [ss, name] of Object.entries(SPECS)) {
  const p = path.join(docs, 'specs', `${name}.md`);
  if (!fs.existsSync(p)) continue;
  const t = rd(p);
  const headings = [...t.matchAll(/^##\s+(?:\d+\.\s*)?(.+?)\s*$/gm)].map((m) => m[1].toLowerCase());
  for (const h of SPEC_HEADINGS) if (!headings.some((x) => x.startsWith(h.toLowerCase()))) err(`${name}: missing heading "${h}"`);
  let count = 0;
  for (const line of t.split(/\r?\n/)) {
    const m = line.match(/^\|\s*(FR-(\d\d)-\d{3})\s*\|/);
    if (!m) continue;
    const c = splitRow(line);
    if (c.length < 5) { err(`${name}: FR row has <5 columns: ${m[1]}`); continue; }
    if (m[2] !== ss) err(`${name}: ${m[1]} has wrong spec prefix`);
    if (FR.has(m[1])) { err(`Duplicate FR id ${m[1]}`); continue; }
    const brq = ids(c[3], /BRQ-\d\d/g);
    const stories = ids(c[4], /US-\d\d-\d\d/g);
    if (!/^P[0-3]$/.test(c[2])) err(`${m[1]}: invalid priority "${c[2]}"`);
    if (!brq.length) err(`${m[1]}: no BRQ mapping`);
    if (VAGUE.test(c[1])) warn(`${m[1]}: vague wording -> "${c[1].match(VAGUE)[0]}"`);
    FR.set(m[1], { ss, text: c[1], priority: c[2], brq, stories, specStories: stories });
    count++;
  }
  specMeta[ss] = { name, frCount: count, br: ids(t, new RegExp(`BR-${ss}-\\d{3}`, 'g')).length,
    nfr: ids(t, new RegExp(`NFR-${ss}-\\d{3}`, 'g')).length, od: ids(t, new RegExp(`OD-${ss}-\\d\\d`, 'g')).length };
  if (!count) err(`${name}: no FR rows parsed`);
}

// ---------- 3. Stories ----------
const US = new Map(); // id -> {ss, title, file, priority, complexity, frs[], acs[], ts:[{id,type,scenario,covers[]}]}
const TS = new Map();
for (const ss of Object.keys(SPECS)) {
  const dir = path.join(docs, 'stories', epicDir(ss));
  if (!fs.existsSync(dir)) { err(`Missing epic folder ${epicDir(ss)}`); continue; }
  const files = fs.readdirSync(dir).filter((f) => /^US-\d\d-\d\d-.*\.md$/.test(f)).sort();
  if (files.length < 8) err(`${epicDir(ss)}: only ${files.length} stories (expected ≥8)`);
  const readme = fs.existsSync(path.join(dir, 'README.md')) ? rd(path.join(dir, 'README.md')) : '';
  for (const f of files) {
    const p = path.join(dir, f);
    const t = rd(p);
    const id = f.slice(0, 8);
    if (US.has(id)) { err(`Duplicate story id ${id}`); continue; }
    if (id.slice(3, 5) !== ss) err(`${f}: story in wrong epic folder`);
    const h1 = t.match(/^#\s+(US-\d\d-\d\d):\s*(.+)$/m);
    if (!h1 || h1[1] !== id) err(`${f}: H1 must be "# ${id}: <title>"`);
    const field = (name) => { const m = t.match(new RegExp(`^\\|\\s*${name}\\s*\\|\\s*(.*?)\\s*\\|`, 'mi')); return m ? m[1] : ''; };
    const frs = ids(field('Related Requirements'), /FR-\d\d-\d{3}/g);
    const priority = field('Priority'); const complexity = field('Complexity');
    if (!/^P[0-3]$/.test(priority)) err(`${id}: invalid priority "${priority}"`);
    if (!/^(XS|S|M|L)$/.test(complexity)) err(`${id}: invalid complexity "${complexity}"${complexity === 'XL' ? ' (XL must be split)' : ''}`);
    if (field('Epic') && field('Epic') !== `EPIC-${ss}`) err(`${id}: Epic field mismatch`);
    if (!frs.length) err(`${id}: no Related Requirements`);
    for (const s of STORY_SECTIONS) if (!new RegExp(`^##\\s+${s}`, 'mi').test(t)) err(`${id}: missing section "${s}"`);
    if (!/^##\s+Dependencies/mi.test(t) && !field('Dependencies')) warn(`${id}: no Dependencies field`);
    const acs = ids(t, new RegExp(`${id}-AC\\d+`, 'g'));
    const acHeads = [...t.matchAll(new RegExp(`^###\\s+(${id}-AC\\d+)`, 'gm'))].map((m) => m[1]);
    if (acHeads.length < 3) err(`${id}: ${acHeads.length} AC headings (min 3)`);
    const gwt = (t.match(/\*\*Given\*\*/g) || []).length;
    if (gwt < acHeads.length) err(`${id}: ${acHeads.length} ACs but ${gwt} Given clauses`);
    if (!/\b403\b/.test(t) && !/\b404\b/.test(t)) warn(`${id}: no 403/404 authorization scenario mentioned`);
    const ts = [];
    for (const line of t.split(/\r?\n/)) {
      const m = line.match(/^\|\s*(TS-(\d\d)-\d{3})\s*\|/);
      if (!m) continue;
      const c = splitRow(line);
      if (m[2] !== ss) err(`${id}: ${m[1]} has wrong epic prefix`);
      const covers = ids(c.slice(1).join(' '), /US-\d\d-\d\d-AC\d+/g);
      const csRefs = ids(c.slice(1).join(' '), /CS-\d\d/g);
      if (TS.has(m[1])) err(`Duplicate test scenario id ${m[1]} (${id} and ${TS.get(m[1]).story})`);
      const entry = { id: m[1], type: c[1] || '', scenario: c[2] || '', covers, cs: csRefs, story: id };
      TS.set(m[1], entry); ts.push(entry);
      for (const a of covers) if (!acHeads.includes(a)) err(`${m[1]} covers unknown AC ${a}`);
    }
    if (!ts.length) err(`${id}: no TS rows in Testing Notes`);
    for (const a of acHeads) if (!ts.some((x) => x.covers.includes(a))) warn(`${a}: not covered by any TS`);
    if (readme && !readme.includes(id)) warn(`${epicDir(ss)}/README.md does not list ${id}`);
    US.set(id, { ss, title: h1 ? h1[2].trim() : f, file: rel(p), priority, complexity, frs, acs: acHeads, ts,
      mvp: (() => { const l = readme.split(/\r?\n/).find((x) => x.startsWith('|') && x.includes(id)) || ''; return /\|\s*Yes\b/.test(l) || /\(MVP\)/.test(l); })() });
  }
}

// ---------- 4. Cross-reference checks ----------
for (const [usId, us] of US) for (const f of us.frs) {
  if (!FR.has(f)) err(`${usId} references unknown requirement ${f}`);
  else if (!FR.get(f).specStories.includes(usId)) warn(`${f} Stories column does not list ${usId} (story references it)`);
}
for (const [frId, fr] of FR) {
  for (const s of fr.specStories) if (!US.has(s)) err(`${frId} lists unknown story ${s}`);
  const linked = [...new Set([...fr.specStories.filter((s) => US.has(s)), ...[...US].filter(([, u]) => u.frs.includes(frId)).map(([k]) => k)])];
  fr.stories = linked.sort();
  if (!linked.length) err(`${frId} is not mapped to any story`);
}
const csAll = Array.from({ length: 13 }, (_, i) => `CS-${String(i + 1).padStart(2, '0')}`);
const csCover = Object.fromEntries(csAll.map((c) => [c, [...TS.values()].filter((t) => t.cs.includes(c)).map((t) => t.id)]));
for (const [c, list] of Object.entries(csCover)) if (!list.length) err(`Critical scenario ${c} has no TS scenario tagged with it`);

// placeholders across all docs
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith('.md') ? [path.join(d, e.name)] : []);
const allMd = walk(docs);
for (const p of allMd) {
  const t = rd(p);
  if (/\b(TBD|TODO|lorem ipsum|FIXME)\b/.test(t)) warn(`${rel(p)}: contains placeholder token`);
  const fences = (t.match(/```/g) || []).length;
  if (fences % 2) err(`${rel(p)}: unbalanced code fences`);
  // Markdown table integrity: each row must have the header's cell count.
  // GFM splits cells on every unescaped "|", including inside code spans.
  const lines = t.split(/\r?\n/); let inFence = false; let cols = 0;
  const isSep = (l) => /^\s*\|?\s*:?-{3,}/.test(l || '');
  const cellCount = (l) => l.trim().replace(/^\|/, '').replace(/(?<!\\)\|$/, '').split(/(?<!\\)\|/).length;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/^\s*```/.test(l)) { inFence = !inFence; continue; }
    if (inFence || !l.trim().startsWith('|')) { cols = 0; continue; }
    if (!cols && isSep(lines[i + 1])) { cols = cellCount(l); continue; }
    if (cols && !isSep(l) && cellCount(l) !== cols) err(`${rel(p)}:${i + 1}: table row has ${cellCount(l)} cells, header has ${cols}`);
  }
}

// ---------- 5. Stats ----------
const brqAll = Array.from({ length: 15 }, (_, i) => `BRQ-${String(i + 1).padStart(2, '0')}`);
const brqCover = Object.fromEntries(brqAll.map((b) => [b, [...FR.values()].filter((f) => f.brq.includes(b)).length]));
for (const [b, n] of Object.entries(brqCover)) if (!n) err(`${b} has no functional requirement`);
const totals = {
  specs: Object.keys(specMeta).length, epics: new Set([...US.values()].map((u) => u.ss)).size, stories: US.size,
  frs: FR.size, brs: Object.values(specMeta).reduce((a, s) => a + s.br, 0), nfrs: Object.values(specMeta).reduce((a, s) => a + s.nfr, 0),
  acs: [...US.values()].reduce((a, u) => a + u.acs.length, 0), ts: TS.size,
  mvpStories: [...US.values()].filter((u) => u.mvp).length,
};

// ---------- 6. Generation ----------
if (WRITE) {
  const today = new Date().toISOString().slice(0, 10);
  const specLink = (ss) => `[SPEC-${ss}](specs/${SPECS[ss]}.md)`;
  const usLink = (id) => `[${id}](${US.get(id).file.replace(/^docs\//, '')})`;
  // Traceability
  let tr = `# Specification ↔ Story Traceability Matrix\n\n> **Generated** by \`node scripts/docs/docs-check.mjs --write\` on ${today}. Do not edit by hand — edit the specs/stories and regenerate.\n\n`;
  tr += `Chain: **Business Requirement (BRQ) → Functional Requirement (FR) → Specification → User Story → Acceptance Criteria → Test Scenario (TS)**.\n\n`;
  tr += `## 1. Totals\n\n| Metric | Count |\n|---|---|\n` + Object.entries({ Specifications: totals.specs, Epics: totals.epics, 'User stories': totals.stories, 'MVP stories': totals.mvpStories, 'Functional requirements': totals.frs, 'Module business rules': totals.brs, 'Module NFRs': totals.nfrs, 'Acceptance criteria': totals.acs, 'Test scenarios': totals.ts }).map(([k, v]) => `| ${k} | ${v} |`).join('\n') + '\n\n';
  tr += `## 2. Business requirement coverage\n\n| BRQ | # FRs | Specs |\n|---|---|---|\n`;
  for (const b of brqAll) { const specs = [...new Set([...FR.values()].filter((f) => f.brq.includes(b)).map((f) => `SPEC-${f.ss}`))].sort(); tr += `| ${b} | ${brqCover[b]} | ${specs.join(', ')} |\n`; }
  tr += `\n## 3. Critical cross-cutting scenario coverage\n\n| CS | Test scenarios |\n|---|---|\n` + csAll.map((c) => `| ${c} | ${csCover[c].join(', ') || '**MISSING**'} |`).join('\n') + '\n\n';
  tr += `## 4. Full chain per specification\n\n`;
  for (const ss of Object.keys(SPECS)) {
    tr += `### ${specLink(ss)} — ${SPECS[ss].replace(/^SPEC-\d\d-/, '').replaceAll('-', ' ')}\n\n| BRQ | FR | Priority | Stories | Acceptance criteria | Test scenarios |\n|---|---|---|---|---|---|\n`;
    for (const [id, f] of [...FR].filter(([, f]) => f.ss === ss)) {
      const acs = f.stories.flatMap((s) => US.get(s)?.acs || []);
      const tss = f.stories.flatMap((s) => (US.get(s)?.ts || []).map((t) => t.id));
      tr += `| ${f.brq.join(', ')} | ${id} | ${f.priority} | ${f.stories.map(usLink).join(', ')} | ${acs.length} (${acs.length ? `${acs[0]} … ${acs.at(-1)}` : '—'}) | ${tss.length ? tss.join(', ') : '—'} |\n`;
    }
    tr += '\n';
  }
  tr += `## 5. Story → acceptance criteria → test scenarios\n\n| Story | Priority | MVP | Requirements | AC → TS |\n|---|---|---|---|---|\n`;
  for (const [id, u] of US) {
    const map = u.acs.map((a) => `${a.split('-').pop()}→${u.ts.filter((t) => t.covers.includes(a)).map((t) => t.id.slice(6)).join('/') || '∅'}`).join('; ');
    tr += `| ${usLink(id)} | ${u.priority} | ${u.mvp ? 'Yes' : ''} | ${u.frs.join(', ')} | ${map} |\n`;
  }
  fs.writeFileSync(path.join(docs, 'SPEC-STORY-TRACEABILITY.md'), tr);
  // Requirements catalog
  let rq = `# Requirements Catalog\n\n> **Generated** by \`node scripts/docs/docs-check.mjs --write\` on ${today} from the specification files. The specifications are the source of truth; edit them and regenerate.\n\n`;
  rq += `This catalog consolidates the business requirements (BRQ), global business rules (BR-G), global non-functional requirements (NFR-G) and every functional requirement (FR) of SPEC-01 … SPEC-10. Definitions of BRQ, BR-G and NFR-G live in [DOCUMENTATION-CONVENTIONS.md](DOCUMENTATION-CONVENTIONS.md) §3, §4 and §7.1.\n\n`;
  rq += `## 1. Summary\n\n| Spec | Functional reqs | P0 | P1 | P2 | P3 | Module rules | Module NFRs | Open decisions |\n|---|---|---|---|---|---|---|---|---|\n`;
  for (const [ss, m] of Object.entries(specMeta)) {
    const fs_ = [...FR.values()].filter((f) => f.ss === ss); const c = (p) => fs_.filter((f) => f.priority === p).length;
    rq += `| ${specLink(ss)} | ${m.frCount} | ${c('P0')} | ${c('P1')} | ${c('P2')} | ${c('P3')} | ${m.br} | ${m.nfr} | ${m.od} |\n`;
  }
  rq += `| **Total** | **${FR.size}** | ${['P0', 'P1', 'P2', 'P3'].map((p) => `**${[...FR.values()].filter((f) => f.priority === p).length}**`).join(' | ')} | **${totals.brs}** | **${totals.nfrs}** | **${Object.values(specMeta).reduce((a, s) => a + s.od, 0)}** |\n\n`;
  rq += `## 2. Business requirements\n\n` + (rd(path.join(docs, 'DOCUMENTATION-CONVENTIONS.md')).match(/## 3\. Business Requirements \(BRQ\)\n\n([\s\S]*?)\n---/)?.[1] || '') + `\n## 3. Functional requirements by specification\n\n`;
  for (const ss of Object.keys(SPECS)) {
    rq += `### ${specLink(ss)}\n\n| ID | Requirement | Priority | BRQ | Stories |\n|---|---|---|---|---|\n`;
    for (const [id, f] of [...FR].filter(([, f]) => f.ss === ss)) rq += `| ${id} | ${f.text} | ${f.priority} | ${f.brq.join(', ')} | ${f.stories.join(', ')} |\n`;
    rq += '\n';
  }
  fs.writeFileSync(path.join(docs, 'REQUIREMENTS.md'), rq);
}

// ---------- 7. Report ----------
console.log('Totals:', JSON.stringify(totals));
console.log('Per spec:', JSON.stringify(Object.fromEntries(Object.entries(specMeta).map(([k, v]) => [k, v.frCount]))));
console.log('Stories per epic:', JSON.stringify(Object.fromEntries(Object.keys(SPECS).map((ss) => [ss, [...US.values()].filter((u) => u.ss === ss).length]))));
console.log(`\nWarnings (${warnings.length}):`); warnings.slice(0, Number(process.env.MAXW || 60)).forEach((w) => console.log('  - ' + w));
if (warnings.length > Number(process.env.MAXW || 60)) console.log(`  … ${warnings.length - Number(process.env.MAXW || 60)} more`);
console.log(`\nErrors (${errors.length}):`); errors.forEach((e) => console.log('  - ' + e));
process.exit(errors.length ? 1 : 0);
