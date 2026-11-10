#!/usr/bin/env node
// Generates the detailed test-case catalog (docs/test-cases/) from the user stories.
// One test case per TS scenario; preconditions / steps / expected results are derived from the
// Given / When / Then of the acceptance criteria the scenario covers.
// Usage (from repo root): node scripts/docs/gen-test-cases.mjs
import fs from 'node:fs';
import path from 'node:path';

const root = process.argv[2] || process.cwd();
const docs = path.join(root, 'docs');
const storiesDir = path.join(docs, 'stories');
const outDir = path.join(docs, 'test-cases');
fs.mkdirSync(outDir, { recursive: true });
const today = new Date().toISOString().slice(0, 10);

const esc = (s) => s.replace(/(?<!\\)\|/g, '\\|').trim();
const cells = (l) => l.trim().replace(/^\|/, '').replace(/(?<!\\)\|$/, '').split(/(?<!\\)\|/).map((c) => c.trim());
const field = (t, name) => (t.match(new RegExp(`^\\|\\s*${name}\\s*\\|\\s*(.*?)\\s*\\|`, 'mi')) || [])[1] || '';
const section = (t, name) => (t.split(new RegExp(`^##\\s+${name}\\s*$`, 'm'))[1] || '').split(/^##\s+/m)[0];
const steps = (s) => s.split(/;\s+(?=[a-zA-Z`0-9])/).map((x) => x.trim()).filter(Boolean);

// Release per story (from the generated RELEASE-PLAN tables)
const release = {};
const rp = fs.readFileSync(path.join(docs, 'roadmap', 'RELEASE-PLAN.md'), 'utf8');
for (const name of ['MVP', 'V1', 'FUTURE']) {
  const block = rp.split(`<!-- BEGIN:${name} -->`)[1]?.split(`<!-- END:${name} -->`)[0] || '';
  for (const id of block.match(/US-\d\d-\d\d/g) || []) release[id] = name === 'FUTURE' ? 'Future' : name;
}

const AUTOMATED = /^(Unit|Integration|API|Concurrency|Property|Database|Contract|Architecture|CI|Performance|Security|Fault|Multi-node|Load)/i;
const testPriority = (storyPriority, type, cs) => {
  const critical = cs.length > 0 || /Concurrency|Security|Fault|Database/i.test(type);
  if (storyPriority === 'P0') return critical ? 'T0' : 'T1';
  if (storyPriority === 'P1') return critical ? 'T1' : 'T2';
  return 'T3';
};

const totals = { cases: 0, byEpic: {}, byType: {}, byPriority: {}, byRelease: {}, cs: {} };
const epics = fs.readdirSync(storiesDir).filter((d) => /^EPIC-\d\d-/.test(d)).sort();

for (const epic of epics) {
  const ss = epic.slice(5, 7);
  const readme = fs.readFileSync(path.join(storiesDir, epic, 'README.md'), 'utf8');
  const epicTitle = (readme.match(/^#\s+(.+)$/m) || [, epic])[1].replace(/^EPIC-\d\d:?\s*/, '');
  let out = `# Test Cases — EPIC-${ss} ${epicTitle}\n\n> **Generated** by \`node scripts/docs/gen-test-cases.mjs\` on ${today} from the story files in \`docs/stories/${epic}/\`. Each test case corresponds to one test scenario (TS) declared in a story; preconditions, steps and expected results are derived from the Given / When / Then of the acceptance criteria it covers. The stories are the source of truth — change a story and regenerate.\n\n`;
  out += `**Conventions:** TC ID = TS ID. Priority T0 blocks merge, T1 blocks release, T2/T3 per [MASTER-TEST-STRATEGY §6](../test-plans/MASTER-TEST-STRATEGY.md). Execution: *Automated* tests are implemented in code with a trait/name carrying the TS ID; *Manual* cases are executed from this document. Test data conventions: [TEST-DATA-STRATEGY.md](../test-plans/TEST-DATA-STRATEGY.md).\n\n`;
  const files = fs.readdirSync(path.join(storiesDir, epic)).filter((f) => /^US-\d\d-\d\d-.*\.md$/.test(f)).sort();
  const summary = [];
  let body = '';
  let epicCount = 0;
  for (const f of files) {
    const t = fs.readFileSync(path.join(storiesDir, epic, f), 'utf8');
    const id = f.slice(0, 8);
    const title = (t.match(/^#\s+US-\d\d-\d\d:\s*(.+)$/m) || [, f])[1].trim();
    const priority = field(t, 'Priority');
    const frs = field(t, 'Related Requirements');
    const storyPre = section(t, 'Preconditions').split(/\r?\n/).map((l) => l.trim()).filter((l) => l.startsWith('-')).map((l) => l.replace(/^-\s*/, ''));
    const acs = {};
    for (const m of t.matchAll(/^###\s+(US-\d\d-\d\d-AC\d+):\s*(.+?)\s*$\n([\s\S]*?)(?=^###\s|^##\s)/gm)) {
      const bodyAc = m[3];
      const pick = (k) => (bodyAc.match(new RegExp(`\\*\\*${k}\\*\\*\\s*(.+)`)) || [, ''])[1].trim();
      acs[m[1]] = { name: m[2], given: pick('Given'), when: pick('When'), then: pick('Then') };
    }
    const notes = section(t, 'Testing Notes');
    body += `\n## ${id}: ${esc(title)}\n\n`;
    for (const line of notes.split(/\r?\n/)) {
      if (!/^\|\s*TS-\d\d-\d{3}\s*\|/.test(line)) continue;
      const c = cells(line);
      const [tsId, type, scenario, coversRaw] = c;
      const covers = [...new Set((coversRaw || '').match(/US-\d\d-\d\d-AC\d+/g) || [])];
      const cs = [...new Set(`${scenario} ${Object.values(acs).map((a) => a.name).join(' ')}`.match(/CS-\d\d/g) || [])].filter((x) => scenario.includes(x) || covers.some((a) => acs[a]?.name.includes(x)));
      const tp = testPriority(priority, type, cs);
      const exec = AUTOMATED.test(type) ? 'Automated' : 'Manual';
      const rel = release[id] || '—';
      epicCount++; totals.cases++;
      totals.byType[type] = (totals.byType[type] || 0) + 1;
      totals.byPriority[tp] = (totals.byPriority[tp] || 0) + 1;
      totals.byRelease[rel] = (totals.byRelease[rel] || 0) + 1;
      for (const x of cs) (totals.cs[x] ||= []).push(tsId);
      summary.push(`| ${tsId} | ${esc(scenario)} | ${type} | ${tp} | ${rel} | ${covers.join(', ')} |`);

      body += `### ${tsId}: ${esc(scenario)}\n\n`;
      body += `| Field | Value |\n|---|---|\n`;
      body += `| Story | [${id}](../stories/${epic}/${f}) — ${esc(title)} |\n`;
      body += `| Type / Execution | ${type} / ${exec} |\n`;
      body += `| Priority | ${tp} (story ${priority}) |\n`;
      body += `| Release | ${rel} |\n`;
      body += `| Covers | ${covers.join(', ') || '—'} |\n`;
      if (cs.length) body += `| Critical scenario | ${cs.join(', ')} |\n`;
      body += `| Requirements | ${esc(frs)} |\n\n`;
      if (storyPre.length) {
        body += `**Story preconditions**\n`;
        for (const p of storyPre) body += `- ${p}\n`;
        body += `\n`;
      }
      if (!covers.length) body += `**Note:** scenario declares no acceptance criterion; derive steps from the scenario text and the story's validation/error sections.\n\n`;
      for (const a of covers) {
        const ac = acs[a];
        if (!ac) continue;
        body += `**${a} — ${esc(ac.name)}**\n\n`;
        body += `*Preconditions / test data*\n`;
        steps(ac.given).forEach((s, i) => (body += `${i + 1}. ${s}\n`));
        body += `\n*Steps*\n`;
        steps(ac.when).forEach((s, i) => (body += `${i + 1}. ${s}\n`));
        body += `\n*Expected results*\n`;
        steps(ac.then).forEach((s, i) => (body += `${i + 1}. ${s}\n`));
        body += `\n`;
      }
      body += `**Post-conditions / invariants:** ${/Inventory|Sales|Procurement|Prescription/i.test(epicTitle) || /^0[4568]$/.test(ss) ? 'INV-01…INV-10 hold (ledger = balance, no negative stock, audit row present) — see MASTER-TEST-STRATEGY §4.' : 'audit entry present for sensitive operations; no cross-organization rows touched (INV-07, INV-09).'}\n\n`;
    }
  }
  totals.byEpic[epic] = epicCount;
  out += `## Summary (${epicCount} test cases)\n\n| TC | Scenario | Type | Priority | Release | Covers |\n|---|---|---|---|---|---|\n${summary.join('\n')}\n\n---\n${body}`;
  fs.writeFileSync(path.join(outDir, `TC-${epic}.md`), out);
}

// Index
let idx = `# Test Case Catalog\n\n> **Generated** by \`node scripts/docs/gen-test-cases.mjs\` on ${today}. One detailed test case per test scenario declared in the user stories. Regenerate after any story change; do not edit by hand.\n\n`;
idx += `Related: [MASTER-TEST-STRATEGY](../test-plans/MASTER-TEST-STRATEGY.md) · [INTEGRATION-TEST-PLAN](../test-plans/INTEGRATION-TEST-PLAN.md) · [SECURITY-TEST-PLAN](../test-plans/SECURITY-TEST-PLAN.md) · [E2E-TEST-PLAN](../test-plans/E2E-TEST-PLAN.md) (journey-level manual/UI cases live there) · [SPEC-STORY-TRACEABILITY](../SPEC-STORY-TRACEABILITY.md)\n\n`;
idx += `## Totals\n\n| Metric | Value |\n|---|---|\n| Test cases | ${totals.cases} |\n`;
for (const [k, v] of Object.entries(totals.byPriority).sort()) idx += `| Priority ${k} | ${v} |\n`;
for (const [k, v] of Object.entries(totals.byRelease).sort()) idx += `| Release ${k} | ${v} |\n`;
idx += `\n## By epic\n\n| Epic | Test cases | File |\n|---|---|---|\n`;
for (const [e, n] of Object.entries(totals.byEpic)) idx += `| ${e} | ${n} | [TC-${e}.md](TC-${e}.md) |\n`;
idx += `\n## By type\n\n| Type | Count | Execution |\n|---|---|---|\n`;
for (const [k, v] of Object.entries(totals.byType).sort((a, b) => b[1] - a[1])) idx += `| ${k} | ${v} | ${AUTOMATED.test(k) ? 'Automated' : 'Manual'} |\n`;
idx += `\n## Critical scenario coverage\n\n| CS | Test cases |\n|---|---|\n`;
for (let i = 1; i <= 13; i++) { const c = `CS-${String(i).padStart(2, '0')}`; idx += `| ${c} | ${(totals.cs[c] || []).join(', ') || '**MISSING**'} |\n`; }
fs.writeFileSync(path.join(outDir, 'README.md'), idx);
console.log(JSON.stringify({ cases: totals.cases, byEpic: totals.byEpic, byPriority: totals.byPriority, byRelease: totals.byRelease }));
