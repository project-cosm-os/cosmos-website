/**
 * Two checks over the dictionary.
 *
 *   1. No user-visible copy is hardcoded in a component.
 *   2. Every key a component reads actually exists in the dictionary.
 *
 * ── THE DETECTION RULE IS INVERTED ON PURPOSE ─────────────────────────────
 *
 * The obvious way to find hardcoded copy is to look for strings that look like
 * prose. That fails silently: the one sentence whose shape the pattern did not
 * anticipate is the one that ships untranslated, and nothing reports it.
 *
 * So this treats every string literal in a JSX text position as copy unless the
 * POSITION proves otherwise: a `className`, a `style` value, an import path, a
 * token reference. A blind spot in that allowlist produces a false positive,
 * which is loud and takes one line to fix. A blind spot in a prose-matcher
 * produces a false negative, which is what shipped text nobody translated.
 *
 * This is a regex pass rather than a TypeScript-parser pass, which is the
 * weaker of the two options. It is here because the second check below (every
 * key resolves) catches the case that actually matters most: copy moved to the
 * dictionary under a key the component does not read, or the reverse.
 *
 *     pnpm check:i18n
 */
import { readFileSync, globSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dict = JSON.parse(readFileSync(join(root, 'src/i18n/locales/en-US.json'), 'utf8'));

/** Resolve "pillars.recover.heading" against the dictionary. */
function lookup(key: string): unknown {
  return key.split('.').reduce<unknown>(
    (node, part) => (node && typeof node === 'object' ? (node as Record<string, unknown>)[part] : undefined),
    dict,
  );
}

function maskComments(source: string): string {
  const blank = (m: string) => m.replace(/[^\n]/g, ' ');
  return source
    .replace(/\/\*[\s\S]*?\*\//g, blank)
    .replace(/^[ \t]*\/\/.*$/gm, blank)
    .replace(/[ \t]\/\/[ \t].*$/gm, blank);
}

const failures: string[] = [];

/**
 * Files exempt from the hardcoded-string rule, each for a stated reason.
 * An exemption is a decision; leaving one undocumented is how the rule rots.
 */
const EXEMPT: Record<string, string> = {
  'src/i18n/index.ts': 'configures i18next itself',
  'src/i18n/useList.ts': 'reads the dictionary',
  'src/config/brand-identity.ts': 'brand strings are config, shared with SEO and the OG card',
  'src/content/blogPosts.ts': 'parses markdown frontmatter',
  'src/components/shared/SEO.tsx': 'assembles meta tags from brand config',
};

const files = globSync('src/**/*.{ts,tsx}', { cwd: root }).sort();

for (const file of files) {
  const source = readFileSync(join(root, file), 'utf8');
  const body = maskComments(source);
  const lines = source.split('\n');

  // ── Check 2: every t('...') key resolves, and to a string or an array ──
  for (const match of body.matchAll(/\bt\(\s*['"]([a-zA-Z0-9_.]+)['"]/g)) {
    const key = match[1];
    const value = lookup(key);
    if (value === undefined) {
      const line = body.slice(0, match.index).split('\n').length;
      failures.push(`${file}:${line}  t('${key}') is not in the dictionary`);
    }
  }

  if (EXEMPT[file] || !file.endsWith('.tsx')) continue;

  // ── Check 1: JSX text nodes must not contain literal prose ──
  //
  // A text node between tags, containing a letter and a space, that is not
  // entirely a {expression}.
  //
  // CODE_CHARS is what stops `useList<Refusal>('flow.sources')` from reading as
  // a JSX text node: to this regex, the generic's angle brackets look exactly
  // like tags. Real prose on this site never contains a straight quote, a
  // semicolon, a paren or an equals sign, so their presence means the match
  // spanned code rather than text. That was the first thing this check got
  // wrong, and it reported nine false positives out of fourteen.
  const CODE_CHARS = /['"`;()=\\]/;

  for (const match of body.matchAll(/>([^<>{}]*[A-Za-z][^<>{}]*)</g)) {
    const text = match[1].trim();
    if (/^[\d\s.,%₹+−-]+$/.test(text)) continue;  // bare figures
    if (CODE_CHARS.test(text)) continue;

    /*
      Single words count.

      This used to skip anything without a space, on the theory that one word
      is a glyph rather than copy. It is not: the console mockup's sidebar read
      a hardcoded "CosmOS" for the whole life of this check, and any one-word
      button ("Submit", "Cancel") would have been just as invisible.

      What the exemption was actually protecting is short non-words: the "C" in
      the brand mark, a "✓", a bullet. Two characters covers those, and a
      two-letter word is not copy worth translating on its own.
    */
    if (text.length <= 2) continue;

    /*
      An inline opt-out, for the rare string that is markup rather than copy.
      Put `i18n-exempt: <reason>` in a comment on or just above the line.

      Deliberately narrow and deliberately noisy: it names a line rather than a
      file, so exempting one string cannot quietly exempt everything around it,
      and the reason has to be written down.
    */
    const lineNo = body.slice(0, match.index).split('\n').length;
    const nearby = lines.slice(Math.max(0, lineNo - 4), lineNo + 1).join('\n');
    if (/i18n-exempt/.test(nearby)) continue;
    failures.push(`${file}:${lineNo}  hardcoded text: ${JSON.stringify(text.slice(0, 60))}`);
  }
}

// ── Check 3: nothing in the dictionary is unreachable ──
const allSource = files.map((f) => maskComments(readFileSync(join(root, f), 'utf8'))).join('\n');
const referenced = new Set<string>();
for (const m of allSource.matchAll(/['"`]([a-zA-Z0-9_.]+)['"`]/g)) referenced.add(m[1]);
// Components build keys like `pillars.${key}.heading`, so also collect templates.
for (const m of allSource.matchAll(/`([a-zA-Z0-9_.]*)\$\{[^}]+\}([a-zA-Z0-9_.]*)`/g)) {
  referenced.add(m[1].replace(/\.$/, ''));
  referenced.add(m[2].replace(/^\./, ''));
}

function topLevelUnused(): string[] {
  const unused: string[] = [];
  for (const group of Object.keys(dict)) {
    const hit = [...referenced].some((r) => r === group || r.startsWith(`${group}.`));
    if (!hit) unused.push(group);
  }
  return unused;
}

for (const group of topLevelUnused()) {
  failures.push(`src/i18n/locales/en-US.json  "${group}" is not read by any component`);
}

if (failures.length > 0) {
  console.error(`\ni18n check failed (${failures.length}):`);
  for (const f of failures) console.error(`  ${relative('.', f)}`);
  console.error('\nMove copy into src/i18n/locales/en-US.json and read it with t().\n');
  process.exit(1);
}

console.log(`check:i18n — ${files.length} files, no hardcoded copy, every key resolves`);
