#!/usr/bin/env node
// Regenerates the module open-decision register inside docs/ASSUMPTIONS-AND-OPEN-DECISIONS.md
// from section 19 ("Open Decisions") of every specification.
// Usage (from repo root): node scripts/docs/gen-registers.mjs
import fs from 'node:fs';
import path from 'node:path';

const root = process.argv[2] || process.cwd();
const specDir = path.join(root, 'docs', 'specs');
const target = path.join(root, 'docs', 'ASSUMPTIONS-AND-OPEN-DECISIONS.md');
const cells = (l) => l.trim().replace(/^\|/, '').replace(/(?<!\\)\|$/, '').split(/(?<!\\)\|/).map((c) => c.trim());

let out = '| ID | Spec | Decision needed | Default / recommendation until decided |\n|---|---|---|---|\n';
let count = 0;
for (const f of fs.readdirSync(specDir).filter((x) => /^SPEC-\d\d-.*\.md$/.test(x)).sort()) {
  const t = fs.readFileSync(path.join(specDir, f), 'utf8');
  const sec = t.split(/^##\s+19\.[^\n]*$/m)[1]?.split(/^##\s+20\./m)[0] || '';
  for (const line of sec.split(/\r?\n/)) {
    if (!/^\|\s*OD-\d\d-\d\d\s*\|/.test(line)) continue;
    const c = cells(line);
    out += `| ${c[0]} | [${f.slice(0, 7)}](specs/${f}) | ${c[1]} | ${c[c.length - 1]} |\n`;
    count++;
  }
}
let doc = fs.readFileSync(target, 'utf8');
doc = doc.replace(/(<!-- BEGIN:MODULE-OD -->)[\s\S]*?(<!-- END:MODULE-OD -->)/, `$1\n${out}\n$2`);
fs.writeFileSync(target, doc);
console.log(`Module open decisions: ${count}`);
