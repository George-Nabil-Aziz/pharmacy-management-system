// Generates release scope tables from story files and injects them into RELEASE-PLAN.md between markers.
// Usage: node scripts/docs/gen-release-plan.mjs   (run from repo root)
import fs from 'node:fs';
import path from 'node:path';
const root = process.argv[2] || process.cwd();
const sdir = path.join(root, 'docs', 'stories');
const OVERRIDE = { // release decisions recorded in RELEASE-PLAN §3
  'US-01-01': 'V1', 'US-01-09': 'V1', 'US-04-16': 'MVP', 'US-08-15': 'MVP', 'US-10-03': 'MVP',
  'US-01-18': 'V1', 'US-01-19': 'V1', 'US-07-16': 'V1', 'US-07-17': 'V1',
};
const pts = { XS: 0.5, S: 1, M: 2.5, L: 4.5 };
const rows = [];
for (const d of fs.readdirSync(sdir).sort()) {
  const readme = fs.readFileSync(path.join(sdir, d, 'README.md'), 'utf8');
  for (const f of fs.readdirSync(path.join(sdir, d)).filter((x) => /^US-/.test(x)).sort()) {
    const t = fs.readFileSync(path.join(sdir, d, f), 'utf8');
    const id = f.slice(0, 8);
    const title = (t.match(/^#\s+US-\d\d-\d\d:\s*(.+)$/m) || [])[1].trim();
    const pr = (t.match(/\|\s*Priority\s*\|\s*(P\d)/) || [])[1];
    const cx = (t.match(/\|\s*Complexity\s*\|\s*(\w+)/) || [])[1];
    const line = readme.split(/\r?\n/).find((l) => l.startsWith('|') && l.includes(id)) || '';
    const mvp = /\|\s*Yes\b/.test(line) || /\(MVP\)/.test(line);
    let rel = mvp ? 'MVP' : pr === 'P1' ? 'V1' : 'Future';
    if (OVERRIDE[id]) rel = OVERRIDE[id];
    rows.push({ id, epic: d, title, pr, cx, rel, link: `../stories/${d}/${f}` });
  }
}
const table = (rel) => {
  const list = rows.filter((r) => r.rel === rel);
  let s = `| Epic | Story | Title | Priority | Complexity |\n|---|---|---|---|---|\n`;
  for (const r of list) s += `| ${r.epic.slice(0, 7)} | [${r.id}](${r.link}) | ${r.title.replaceAll('|', '/')} | ${r.pr} | ${r.cx} |\n`;
  return s;
};
const summary = () => {
  let s = `| Release | Stories | P0 | P1 | P2 | P3 | Estimated effort (ideal dev-days) |\n|---|---|---|---|---|---|---|\n`;
  for (const rel of ['MVP', 'V1', 'Future']) {
    const l = rows.filter((r) => r.rel === rel); const c = (p) => l.filter((r) => r.pr === p).length;
    s += `| ${rel} | ${l.length} | ${c('P0')} | ${c('P1')} | ${c('P2')} | ${c('P3')} | ${l.reduce((a, r) => a + (pts[r.cx] || 0), 0)} |\n`;
  }
  return s;
};
const file = path.join(root, 'docs', 'roadmap', 'RELEASE-PLAN.md');
let doc = fs.readFileSync(file, 'utf8');
const inject = (name, content) => { doc = doc.replace(new RegExp(`(<!-- BEGIN:${name} -->)[\\s\\S]*?(<!-- END:${name} -->)`), `$1\n${content}\n$2`); };
inject('SUMMARY', summary()); inject('MVP', table('MVP')); inject('V1', table('V1')); inject('FUTURE', table('Future'));
fs.writeFileSync(file, doc);

console.log(summary());
