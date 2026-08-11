/**
 * Checks what the prerenderer actually emitted, after `vite build`.
 *
 * ── WHY THIS EXISTS ───────────────────────────────────────────────────────
 *
 * The prerender pipeline is the reason this boilerplate was kept: every route
 * ships as static HTML so a crawler and a first paint both get real content
 * without waiting for React. It is also completely invisible when it goes
 * wrong. The dev server always looks right, because in dev the JS has already
 * run by the time anyone looks.
 *
 * Two failures shipped before this check existed:
 *
 *   1. framer-motion's `initial={{ opacity: 0 }}` is serialised into the static
 *      HTML as an inline style. /book-demo and /blog shipped with their <h1>
 *      set to opacity 0. The heading was in the markup, so nothing looked
 *      broken to a text-based audit, and it was invisible until hydration.
 *
 *   2. The sitemap listed two blog posts that no longer existed.
 *
 * So: assert every route has real text, no hidden content outside the cookie
 * banner, and the SEO tags a share preview depends on.
 *
 *     pnpm check:prerender          (run automatically after build)
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';

import { inlineScriptHashes } from './lib/csp';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

/**
 * An element may prerender hidden only by opting in explicitly, with
 * `data-prerender-hidden="<reason>"` on the element itself. Today that is the
 * cookie banner, which is meant to arrive a beat after the page.
 *
 * An opt-in attribute rather than a pattern over the markup: a regex on class
 * names or nearby text would quietly start covering whatever else happened to
 * match it, which is the failure this check exists to catch.
 */
const ALLOWED_HIDDEN = /data-prerender-hidden="/;

const ROUTES = [
  { path: 'index.html', name: '/', minWords: 300 },
  { path: 'features/index.html', name: '/features', minWords: 300 },
  { path: 'book-demo/index.html', name: '/book-demo', minWords: 60 },
  { path: 'blog/index.html', name: '/blog', minWords: 20 },
];

const REQUIRED_TAGS = [
  { name: 'title', re: /<title>[^<]{10,}<\/title>/ },
  { name: 'description', re: /<meta[^>]+name="description"[^>]+content="[^"]{50,}"/ },
  { name: 'og:title', re: /<meta[^>]+property="og:title"/ },
  { name: 'og:image', re: /<meta[^>]+property="og:image"[^>]+content="https?:\/\/[^"]+"/ },
  { name: 'canonical', re: /<link[^>]+rel="canonical"[^>]+href="https?:\/\/[^"]+"/ },
];

const failures: string[] = [];

if (!existsSync(dist)) {
  console.error('\ndist/ not found. Run `pnpm build` first.\n');
  process.exit(1);
}

for (const route of ROUTES) {
  const file = join(dist, route.path);
  if (!existsSync(file)) {
    failures.push(`${route.name}: not prerendered (${route.path} missing)`);
    continue;
  }

  const html = readFileSync(file, 'utf8');
  const head = html.split('</head>')[0] ?? '';
  const body = html.split('<body>')[1] ?? '';

  /*
    The canonical must name the URL the host actually serves.

    Netlify serves a prerendered route from `<route>/index.html` at
    `/features/` and 301s the slashless form to it. Canonicals saying
    `/features` therefore pointed at a URL that redirected back to the page
    carrying the tag, and the sitemap submitted the redirecting form of every
    URL. Nothing broke; Google was simply asked to resolve a contradiction on
    every route.

    Cheap to assert, and impossible to notice by reading the page.
  */
  const canonical = head.match(/rel="canonical"[^>]*href="([^"]+)"/)?.[1];
  const expected = route.name === '/' ? '/' : `${route.name}/`;
  if (canonical && !canonical.endsWith(expected)) {
    failures.push(`${route.name}: canonical is ${canonical}, expected it to end with ${expected}`);
  }

  for (const tag of REQUIRED_TAGS) {
    if (!tag.re.test(head)) failures.push(`${route.name}: missing or empty ${tag.name}`);
  }

  // Text a crawler can read without executing anything.
  const words = body.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ')
    .split(/\s+/).filter(Boolean).length;
  if (words < route.minWords) {
    failures.push(`${route.name}: only ${words} words of static text (expected ${route.minWords}+)`);
  }

  // Every local asset the page references must actually be in dist. A stripped
  // chunk that left its <link> behind, or a logo path that was never copied,
  // is a 404 on a page that otherwise looks completely fine.
  const refs = [...html.matchAll(/(?:href|src)="(\/[^"]+\.(?:js|css|svg|png|jpg|webp|ico))"/g)];
  for (const [, href] of refs) {
    if (!existsSync(join(dist, href.replace(/^\//, '')))) {
      failures.push(`${route.name}: references ${href}, which is not in dist`);
    }
  }

  /*
    Inline event handlers cannot run under this CSP.

    A hash whitelists an inline <script>; it does nothing for an `onload=` or
    `onclick=` attribute, which needs 'unsafe-hashes' or 'unsafe-inline'. So a
    handler in the built HTML is code that silently never executes in
    production while working perfectly on the dev server, which sends no CSP.

    That shipped once: `onload="this.media='all'"` on the font stylesheet, so
    Inter never loaded and the site ran on fallback fonts with no visible error.
  */
  // Comments masked first. This file explains the bug in prose that contains
  // the very string being searched for, and relying on the surrounding
  // punctuation not to match is luck rather than a rule.
  const htmlNoComments = html.replace(/<!--[\s\S]*?-->/g, '');
  for (const match of htmlNoComments.matchAll(/\son(?:load|click|error|submit|change|focus|blur|mouse\w+)=/g)) {
    const near = htmlNoComments
      .slice(Math.max(0, (match.index ?? 0) - 60), (match.index ?? 0) + 40)
      .replace(/\s+/g, ' ');
    failures.push(`${route.name}: inline event handler, blocked by CSP and will not run — ...${near.trim()}...`);
  }

  // ── Structured data must be present, parse, and carry the expected types ──
  //
  // Worth checking mechanically because it is invisible twice over: it is
  // metadata, so nothing on the page changes when it breaks, and a single
  // malformed character makes the whole block worthless to a crawler without
  // any build step complaining.
  //
  // Note the attribute-tolerant match. Helmet emits `<script data-rh="true"
  // type="application/ld+json">`, and a pattern anchored on `<script type=`
  // finds nothing and reports the schema missing when it is right there.
  const ldBlocks = [...head.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)];
  if (ldBlocks.length === 0) {
    failures.push(`${route.name}: no JSON-LD in the head`);
  }
  for (const [, block] of ldBlocks) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(block.replace(/&quot;/g, '"').replace(/&amp;/g, '&'));
    } catch (error) {
      failures.push(`${route.name}: JSON-LD does not parse (${(error as Error).message})`);
      continue;
    }
    const types = new Set(
      (Array.isArray(parsed) ? parsed : [parsed]).map((n) => (n as { '@type': string })['@type']),
    );
    for (const required of ['Organization', 'WebSite']) {
      if (!types.has(required)) failures.push(`${route.name}: JSON-LD is missing ${required}`);
    }
  }

  // The language must carry the region: this is sold only in India, and the
  // subtag was silently dropped once already by a hardcoded 'en' in prerender.
  const lang = html.match(/<html[^>]*lang="([^"]+)"/)?.[1];
  if (lang !== 'en-IN') {
    failures.push(`${route.name}: <html lang> is ${lang ?? 'missing'}, expected en-IN`);
  }

  // `opacity: 0` exactly. `opacity: 0.72` is a deliberate de-emphasis and fine.
  const hidden = [...body.matchAll(/<(\w+)([^>]*opacity: ?0(?![.\d])[^>]*)>(.{0,160})/g)];
  for (const match of hidden) {
    const context = match[2] + match[3];
    if (ALLOWED_HIDDEN.test(context)) continue;
    const text = match[3].replace(/<[^>]+>/g, ' ').trim().slice(0, 60);
    failures.push(
      `${route.name}: <${match[1]}> ships at opacity 0, invisible until hydration — ${JSON.stringify(text)}`,
    );
  }
}

// ── Check 3: the header's capability links must land somewhere ──
//
// SECTION_NAV in config/navigation.ts carries a hash per capability, and the
// section ids live in the components. Nothing connects the two, so renaming a
// section id leaves a nav link that silently scrolls nowhere. The prerendered
// home page has every id in it, so this is the cheapest place to check.
const homeHtml = readFileSync(join(dist, 'index.html'), 'utf8');
const navHashes = readFileSync(join(root, 'src/config/navigation.ts'), 'utf8')
  .matchAll(/hash: '([a-z-]+)'/g);

for (const [, hash] of navHashes) {
  if (!new RegExp(`id="${hash}"`).test(homeHtml)) {
    failures.push(`/: header links to #${hash}, but no section has that id`);
  }
}

// ── The CSP must actually cover the scripts in the page ──
//
// A hash-based CSP fails in the quietest way available: change the inline
// script, forget the hash, and the browser refuses to run it. The page still
// renders, nothing is styled wrong, and the only evidence is a console message.
// Here the theme and motion flags live in that script, so the failure would
// look like "the reveals stopped working on production, but not locally".
//
// generate-headers.ts derives the hash from the built HTML; this re-derives it
// from the same HTML and checks the emitted header contains it. Independent
// derivation, so a bug in one is not silently agreed with by the other.
{
  const headersFile = join(dist, '_headers');
  if (!existsSync(headersFile)) {
    failures.push('dist/_headers was not generated');
  } else {
    const headers = readFileSync(headersFile, 'utf8');
    const expected = inlineScriptHashes(readFileSync(join(dist, 'index.html'), 'utf8'));

    for (const hash of expected) {
      if (!headers.includes(hash)) {
        failures.push(`dist/_headers CSP is missing the hash for an inline script (${hash})`);
      }
    }
    if (/script-src[^;]*'unsafe-inline'/.test(headers)) {
      failures.push("dist/_headers CSP allows 'unsafe-inline' in script-src");
    }
    // The booking iframe is same-origin (/api/schedule) before it redirects.
    if (!/frame-src[^;]*'self'/.test(headers)) {
      failures.push("dist/_headers CSP frame-src is missing 'self'; the booking iframe will be blocked");
    }
    for (const required of ['Strict-Transport-Security', 'X-Content-Type-Options', 'frame-ancestors']) {
      if (!headers.includes(required)) failures.push(`dist/_headers is missing ${required}`);
    }
  }
}

// ── Nothing in dist/ may contain an email address or a booking URL ──
//
// This is the requirement, so it is a build failure rather than a convention.
// An address reached the output twice before this existed: once as a `mailto:`
// fallback in the form, and once inside the Organization JSON-LD, where it is
// machine-readable by design and therefore the easiest thing on the page to
// scrape.
//
// Both the address and the calendar URL now live server-side only, and this
// asserts that whatever gets built has not quietly reacquired them. The scan
// covers HTML and JS: an address inlined into a bundle is just as public as
// one in the markup.
{
  const scanned: string[] = [];
  const walkDist = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walkDist(full);
      else if (/\.(html|js)$/.test(entry.name)) scanned.push(full);
    }
  };
  if (existsSync(dist)) walkDist(dist);

  // Any address, not a list of known ones: a new address nobody thought to add
  // to an allowlist is exactly the one that would slip through.
  const EMAIL = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
  const BOOKING = /calendar\.google\.com|calendly\.com\/[a-z0-9-]/gi;

  // Addresses that are meant to be there. Schema.org URLs are namespaces, not
  // mail; the font hosts are in preconnect hints.
  const ALLOWED = /@(?:schema\.org|w3\.org|example\.com)|sentry|\.svg|\.png/i;

  for (const file of scanned) {
    const content = readFileSync(file, 'utf8');
    const rel = file.slice(dist.length + 1);

    for (const hit of new Set(content.match(EMAIL) ?? [])) {
      if (ALLOWED.test(hit)) continue;
      failures.push(`${rel}: contains the email address ${hit}`);
    }
    for (const hit of new Set(content.match(BOOKING) ?? [])) {
      failures.push(`${rel}: contains a booking URL (${hit}); it belongs in SCHEDULING_URL`);
    }
  }
}

// ── The Netlify form must be in the static HTML ──
//
// Netlify's build step finds forms by parsing the deployed HTML. It never runs
// JavaScript, so a form that only exists after React mounts is invisible to it
// and every submission returns a 404 that reads like a routing bug.
//
// This site prerenders, so the markup is on disk and detection works. That is
// the single load-bearing fact behind the whole form setup, and it would break
// silently if /book-demo ever stopped being prerendered or the form moved
// behind a lazy boundary. Hence an assertion rather than a comment.
// Checked on the home page, not /book-demo: the stub lives in index.html so it
// is present on every prerendered route regardless of which tab is active.
const stubHost = join(dist, 'index.html');
if (existsSync(stubHost)) {
  const formHtml = readFileSync(stubHost, 'utf8');
  const required: [string, RegExp][] = [
    ['data-netlify="true"', /data-netlify="true"/],
    ['name="demo-request"', /<form[^>]+name="demo-request"/],
    ['hidden form-name input', /<input[^>]+name="form-name"[^>]*>/],
    ['honeypot declaration', /netlify-honeypot="website"/],
  ];
  for (const [label, pattern] of required) {
    if (!pattern.test(formHtml)) {
      failures.push(`/: the Netlify form stub is missing ${label}`);
    }
  }
  for (const field of ['name', 'email', 'company', 'message']) {
    if (!new RegExp(`(?:input|textarea)[^>]+name="${field}"`).test(formHtml)) {
      failures.push(`/: the Netlify form stub has no field named "${field}"`);
    }
  }
}

// ── Check 4: every JS module a chunk imports must exist ──
//
// This is the check that was missing when it mattered. A build plugin deleted
// `prerender-<hash>.js` on the reasonable-sounding grounds that no browser runs
// the prerender script. Rollup had put the shared vendor code in that chunk and
// the app entry imported it, so dist/ shipped an app bundle that 404'd on its
// own dependencies, and every check still passed: the HTML was fine, the
// <script> tag pointed at a file that existed, and the dev server never touched
// dist at all.
//
// Attributes in HTML are not the whole graph. Imports inside the JS are.
const assetsDir = join(dist, 'assets');
if (existsSync(assetsDir)) {
  for (const file of readdirSync(assetsDir).filter((f) => f.endsWith('.js'))) {
    const source = readFileSync(join(assetsDir, file), 'utf8');
    const specifiers = [
      ...source.matchAll(/(?:from|import)\s*\(?\s*["'](\.\/[^"']+\.js)["']/g),
    ];
    for (const [, spec] of specifiers) {
      if (!existsSync(join(assetsDir, spec.replace('./', '')))) {
        failures.push(`assets/${file} imports ${spec}, which is not in dist`);
      }
    }
  }
}

if (failures.length > 0) {
  console.error(`\nprerender check failed (${failures.length}):`);
  for (const f of failures) console.error(`  ${f}`);
  console.error(
    '\nHidden content is usually a framer-motion `initial={{opacity:0}}`. Use the\n' +
      '`.animate-in` CSS class for anything above the fold, or `initial={false}`\n' +
      'on AnimatePresence, so the entrance does not depend on hydration.\n',
  );
  process.exit(1);
}

console.log(`check:prerender — ${ROUTES.length} routes, all with static text and SEO tags`);
