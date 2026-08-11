/**
 * Generates public/sitemap.xml and public/robots.txt.
 *
 * ── WHY THESE ARE GENERATED RATHER THAN WRITTEN ───────────────────────────
 *
 * Both files hard-code the production domain, and the domain also appears in
 * brand-identity.ts for canonical tags and og:url. Three hand-maintained copies
 * of one value is three chances to ship a sitemap pointing at the wrong host,
 * and a sitemap is the one file nobody looks at again after launch.
 *
 * The route list has the same problem in reverse: the boilerplate shipped a
 * sitemap listing two blog posts that no longer exist. A sitemap advertising
 * 404s is worse than no sitemap, because a crawler treats it as a signal about
 * how much of the site it can trust.
 *
 * So both are derived: routes from navigation.ts, posts from content/blog, host
 * from brand-identity.ts. Run by `pnpm build` before vite.
 */
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { BRAND } from '../src/config/brand-identity';
import { ROUTES } from '../src/config/navigation';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/** No trailing slash, so `${origin}${path}` never doubles it. */
const origin = BRAND.websiteUrl.replace(/\/+$/, '');

interface Entry {
  path: string;
  changefreq: 'weekly' | 'monthly';
  priority: string;
}

const entries: Entry[] = [
  { path: ROUTES.home, changefreq: 'weekly', priority: '1.0' },
  { path: ROUTES.features, changefreq: 'monthly', priority: '0.9' },
  { path: ROUTES.bookDemo, changefreq: 'monthly', priority: '0.8' },
  { path: ROUTES.blog, changefreq: 'weekly', priority: '0.7' },
];

// Blog posts, read the same way the app reads them: the slug in the frontmatter
// rather than the filename, because BlogPost.tsx routes on the former.
const blogDir = join(root, 'content', 'blog');
if (existsSync(blogDir)) {
  for (const file of readdirSync(blogDir).filter((f) => f.endsWith('.md')).sort()) {
    const slug = readFileSync(join(blogDir, file), 'utf8').match(/^slug:\s*"?([^"\n]+)"?$/m)?.[1];
    if (slug) {
      entries.push({ path: `${ROUTES.blog}/${slug.trim()}`, changefreq: 'monthly', priority: '0.6' });
    }
  }
}

const today = new Date().toISOString().slice(0, 10);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (e) => `  <url>
    <loc>${origin}${e.path === '/' ? '/' : `${e.path}/`}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Sitemap: ${origin}/sitemap.xml
`;

writeFileSync(join(root, 'public', 'sitemap.xml'), sitemap);
writeFileSync(join(root, 'public', 'robots.txt'), robots);

console.log(`SEO files written for ${origin} (${entries.length} urls)`);
