/**
 * The legal pages, as markdown.
 *
 * ── WHY THESE ARE FILES AND NOT DICTIONARY ENTRIES ────────────────────────
 *
 * Every user-visible string on this site lives in `i18n/locales`, and a privacy
 * policy does not belong there. A dictionary entry is a LABEL, read in place. A
 * policy is a DOCUMENT: headings, tables, links, revised as a whole when what we
 * do changes. Forty keys cannot be read in order, and a dictionary full of
 * paragraphs stops being scannable.
 *
 * Same reasoning and same mechanism as the blog, which is why this file is a
 * near-copy of the loader in `blogPosts.ts` rather than something new.
 *
 * ── FRONTMATTER ───────────────────────────────────────────────────────────
 *
 * `title`, `description` and `updated`. The first two feed the page and its meta
 * tags; `updated` is rendered, because a policy with no date is one a reader
 * cannot tell has changed.
 */

export interface LegalPage {
  slug: string;
  title: string;
  description: string;
  /** ISO date. Shown to the reader. */
  updated: string;
  content: string;
}

function parse(raw: string, fallbackSlug: string): LegalPage {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(raw);
  if (!match) {
    return { slug: fallbackSlug, title: fallbackSlug, description: '', updated: '', content: raw };
  }

  const data: Record<string, string> = {};
  for (const line of match[1]!.split('\n')) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    data[line.slice(0, colon).trim()] = line
      .slice(colon + 1)
      .trim()
      .replace(/^['"]|['"]$/g, '');
  }

  return {
    slug: fallbackSlug,
    title: data.title ?? fallbackSlug,
    description: data.description ?? '',
    updated: data.updated ?? '',
    content: match[2] ?? '',
  };
}

const modules = import.meta.glob('/content/legal/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
});

const pages: LegalPage[] = Object.entries(modules).map(([path, raw]) =>
  parse(raw as string, path.replace('/content/legal/', '').replace(/\.md$/, '')),
);

export function getLegalPage(slug: string): LegalPage | undefined {
  return pages.find((p) => p.slug === slug);
}
