import { createHash } from 'node:crypto';

/**
 * Hashes every inline <script> in a document, the way a CSP `script-src`
 * expects them.
 *
 * ── WHY THIS IS ITS OWN FILE ──────────────────────────────────────────────
 *
 * It used to be exported from generate-headers.ts, and check-prerender.ts
 * imported it from there. generate-headers.ts does its work at module scope,
 * so the import *ran the generator*: the check regenerated dist/_headers and
 * then verified the file it had just written.
 *
 * It passed against a deliberately corrupted header file twice before that was
 * noticed, which is the worst kind of check to have: one that reports success
 * because it repaired the thing it was meant to be inspecting.
 *
 * A pure function in a module with no side effects cannot do that. Both the
 * generator and the checker import this, and neither can influence the other.
 */
export function inlineScriptHashes(html: string): string[] {
  /*
    Comments are stripped before anything else, and that is not tidiness.

    index.html explains this CSP in a comment that contains the literal word
    <script>. The matcher found it, hashed the prose that followed, and put
    that hash in the header. The real script was then unhashed, so the browser
    blocked it: no theme attribute, no scroll reveals, no webfont, and the only
    evidence a console message on an otherwise normal-looking page.

    It survived a full build, every check, and a curl of the deployed site,
    because none of those execute a CSP.
  */
  const source = html.replace(/<!--[\s\S]*?-->/g, '');

  const hashes = new Set<string>();
  for (const match of source.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g)) {
    // JSON-LD is data, never executed, and not gated by CSP.
    if (/application\/ld\+json/.test(match[0])) continue;
    const body = match[1];
    if (!body.trim()) continue;
    hashes.add(`'sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}'`);
  }
  return [...hashes].sort();
}
