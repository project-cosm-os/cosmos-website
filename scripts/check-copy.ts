/**
 * Fails the build on em dashes and en dashes in user-visible copy.
 *
 * ── WHY THIS IS A SCRIPT AND NOT A STYLE NOTE ─────────────────────────────
 *
 * "No em dashes" is a house rule for this product's copy, and it is exactly the
 * kind of rule that survives about three files of good intentions. It was
 * violated nineteen times in the first pass of this site by the person who knew
 * the rule. A grep in CI is cheaper than a reviewer who has to care.
 *
 * ── WHAT COUNTS AS COPY ───────────────────────────────────────────────────
 *
 * Comments are masked out, because a dash in an explanation of the code is not
 * something a visitor reads. Everything else in a .tsx/.ts/.json under src/ is
 * treated as copy. That is deliberately over-broad: a false positive here costs
 * one punctuation change, while a false negative ships a dash onto the homepage.
 *
 * The en dash is included because it is what a spellchecker turns a hyphenated
 * range into, and it is visually indistinguishable in a rendered sentence.
 *
 *     pnpm check:copy
 */
import { readFileSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { globSync } from 'node:fs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Replace comment bodies with spaces, keeping newlines so line numbers hold. */
function maskComments(source: string): string {
  const blank = (m: string) => m.replace(/[^\n]/g, ' ');
  return source
    .replace(/\/\*[\s\S]*?\*\//g, blank)
    .replace(/^[ \t]*\/\/.*$/gm, blank)
    .replace(/[ \t]\/\/[ \t].*$/gm, blank);
}

const BANNED = /[—–]/;

const files = globSync('src/**/*.{ts,tsx,json}', { cwd: root });
const failures: string[] = [];

for (const file of files.sort()) {
  const raw = readFileSync(join(root, file), 'utf8');
  const body = file.endsWith('.json') ? raw : maskComments(raw);
  const rawLines = raw.split('\n');

  body.split('\n').forEach((line, i) => {
    if (BANNED.test(line)) {
      failures.push(`  ${relative('.', file)}:${i + 1}  ${rawLines[i].trim().slice(0, 100)}`);
    }
  });
}

if (failures.length > 0) {
  console.error(`\nem/en dash in copy (${failures.length}):\n${failures.join('\n')}\n`);
  console.error('Rewrite the sentence. A comma in place of an em dash usually leaves a splice.\n');
  process.exit(1);
}

console.log(`check:copy — ${files.length} files, no em or en dashes in copy`);
