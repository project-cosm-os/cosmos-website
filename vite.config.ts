import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { vitePrerenderPlugin } from 'vite-prerender-plugin';
import path from 'path';
import fs from 'fs';
import { createRequire } from 'module';
import { normaliseGoogleScheduleUrl } from './src/integrations/scheduling/normalise';

const require = createRequire(import.meta.url);

/**
 * Discover blog post slugs from content/blog/*.md frontmatter at build time.
 * Can't use import.meta.glob in config, so we read files directly with Node fs.
 */
function getBlogSlugs(): string[] {
  const blogDir = path.resolve(__dirname, 'content/blog');
  if (!fs.existsSync(blogDir)) return [];

  return fs.readdirSync(blogDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const raw = fs.readFileSync(path.join(blogDir, f), 'utf-8');
      const match = raw.match(/^---\r?\n[\s\S]*?slug:\s*"?([^"\n]+)"?\r?\n[\s\S]*?---/);
      return match?.[1]?.trim() ?? f.replace(/\.md$/, '');
    });
}

/**
 * Vite plugin that forces `decode-named-character-reference` to resolve to
 * its Node-compatible version (static lookup table) instead of the browser
 * version (which uses document.createElement at module level).
 *
 * Required for prerendering — the browser export uses DOM APIs that aren't
 * available when the prerender script runs in Node.
 */
function forceNodeCharRef(): Plugin {
  // Resolve the Node version (default export) once at config time
  const nodeVersion = require.resolve('decode-named-character-reference');

  return {
    name: 'force-node-decode-named-character-reference',
    enforce: 'pre',
    resolveId(source) {
      if (source === 'decode-named-character-reference') {
        return nodeVersion;
      }
    },
  };
}

/**
 * Makes the Netlify pieces work under `pnpm dev`.
 *
 * ── WHY THIS EXISTS ───────────────────────────────────────────────────────
 *
 * Two things only exist in production: the Function behind `/api/schedule`,
 * and Netlify's form handler at `POST /`. Without this, local development
 * silently misleads on both counts. The booking iframe would request
 * `/api/schedule`, Vite would answer with index.html, and the frame would
 * render the site inside itself. The form would POST to `/`, Vite would return
 * 200, and the UI would report success while nothing had been sent anywhere.
 *
 * A green success message for a submission that went nowhere is the worst of
 * the available outcomes, so the dev server answers both properly.
 *
 * ── THE SECRET STAYS A SECRET ─────────────────────────────────────────────
 *
 * `loadEnv(mode, cwd, '')` with an empty prefix reads every variable in .env,
 * including the unprefixed ones. That is safe here and only here: this runs in
 * the dev server process, in Node. Nothing read this way is passed to `define`
 * or otherwise handed to the client, so `SCHEDULING_URL` still never reaches
 * the browser, exactly as in production.
 */
function netlifyDevShim(mode: string): Plugin {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    name: 'netlify-dev-shim',
    apply: 'serve',

    configureServer(server) {
      server.middlewares.use('/api/schedule', (_req, res) => {
        const { url: target, isEmbeddable, problem } = normaliseGoogleScheduleUrl(
          env.SCHEDULING_URL ?? '',
        );
        if (problem) console.warn(`\n  [schedule] ${problem}\n`);

        if (!target || !isEmbeddable) {
          res.statusCode = 200;
          res.setHeader('content-type', 'text/html; charset=utf-8');
          res.end(
            `<p style="font:16px system-ui;padding:2rem;color:#b91c1c">${
              problem ?? 'SCHEDULING_URL is not set in .env'
            }</p>`,
          );
          return;
        }
        res.statusCode = 302;
        res.setHeader('location', target);
        res.setHeader('cache-control', 'no-store');
        res.end();
      });

      server.middlewares.use((req, res, next) => {
        // Netlify's form endpoint is a POST to the site root.
        if (req.method !== 'POST' || (req.url ?? '') !== '/') return next();

        let body = '';
        req.on('data', (chunk) => { body += chunk; });
        req.on('end', () => {
          const fields = new URLSearchParams(body);
          const recipient = env.DEV_FORM_RECIPIENT?.trim() || '(DEV_FORM_RECIPIENT not set)';

          // Printed rather than sent. Local development should show that the
          // submission arrived and where it would go, without needing a mail
          // account or the Netlify CLI.
          console.log('\n  form submission (dev, not sent)');
          console.log(`  would notify: ${recipient}`);
          for (const [key, value] of fields) {
            if (key === 'form-name' || key === 'website') continue;
            console.log(`    ${key}: ${value}`);
          }
          console.log('');

          res.statusCode = 200;
          res.end('OK');
        });
      });
    },
  };
}

const PRERENDER_ENTRY = path.resolve(__dirname, 'src/prerender.tsx');

export default defineConfig(({ mode }) => ({
  plugins: [
    netlifyDevShim(mode),
    forceNodeCharRef(),
    react(),
    tailwindcss(),
    ...vitePrerenderPlugin({
      prerenderScript: PRERENDER_ENTRY,
      renderTarget: '#root',
      additionalPrerenderRoutes: [
        '/features',
        '/blog',
        '/book-demo',
        ...getBlogSlugs().map((slug) => `/blog/${slug}`),
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.md'],
  server: {
    port: 5175,
    strictPort: true,
  },
  build: {
    outDir: 'dist',

    /*
      No source maps in the deployed output.

      They were on, which published the complete readable source of the site to
      the CDN alongside it: every component, every comment, every internal name.
      For a marketing site that is not a breach, but it is a free map of the
      application for anyone probing it, and the maps were larger than the code
      they described (over 4 MB against 176 kB at one point).

      Turn this back on temporarily if a production-only bug needs tracing, or
      point `sourcemap: 'hidden'` at an error tracker that ingests maps
      privately. Shipping them to the public CDN by default is the wrong
      default.
    */
    sourcemap: false,

    rollupOptions: {
      output: {
        /**
         * ── SPLIT BY REACHABILITY, NOT BY A LIST OF PACKAGE NAMES ─────────
         *
         * There are two rollup entries: the app, and the prerender script that
         * renders the routes at build time. Left alone, rollup puts everything
         * both entries touch into one chunk and names it after the prerender
         * entry (`prerender-<hash>.js`). That name is a trap: an earlier
         * version of this config deleted that file on the reasonable-sounding
         * grounds that no browser runs the prerender script, and shipped a
         * dist whose app bundle 404'd on its own dependencies.
         *
         * The first attempt at fixing it matched package names with a regex.
         * That failed quietly in the other direction: react-markdown's tail
         * (style-to-object, inline-style-parser, and friends) did not match,
         * landed in the shared vendor chunk, and dragged the whole markdown
         * stack onto the home page. A hand-maintained list of package names is
         * the wrong tool, for the same reason it is the wrong tool in
         * check-i18n: the entry you forget is invisible.
         *
         * So this asks rollup instead. `getModuleInfo` exposes the importer
         * graph, so a module can be classified by who can actually reach it:
         * anything only reachable through react-markdown belongs with the blog
         * post, and react-dom/server belongs to the prerender entry and to no
         * browser at all.
         */
        manualChunks(id, { getModuleInfo }) {
          if (!id.includes('node_modules')) return undefined;

          // Server renderer. Only src/prerender.tsx imports it, and shipping it
          // to browsers costs ~90 kB gzipped for code that never runs there.
          if (/react-dom[\\/]server|react-dom-server/.test(id)) return 'prerender-only';

          /**
           * Is every path into this module through one particular package?
           *
           * Used to keep two heavy, conditionally-loaded things off the
           * critical path. Naming packages one by one does not work: what has
           * to move is the package *and its exclusive transitive deps*, and
           * those are the ones nobody remembers (react-markdown's
           * style-to-object, posthog's protobufjs and rrweb).
           */
          const onlyReachableVia = (root: RegExp, appFiles: RegExp) => {
            const seen = new Set<string>();
            const stack = [id];
            let viaRoot = false;
            let viaOther = false;

            while (stack.length > 0) {
              const current = stack.pop() as string;
              if (seen.has(current)) continue;
              seen.add(current);

              if (root.test(current)) {
                viaRoot = true;
                continue;
              }

              const info = getModuleInfo(current);
              const importers = info ? [...info.importers, ...info.dynamicImporters] : [];

              if (importers.length === 0) {
                if (!current.includes('node_modules')) viaOther = true;
                continue;
              }
              for (const importer of importers) {
                if (!importer.includes('node_modules')) {
                  if (appFiles.test(importer)) viaRoot = true;
                  else viaOther = true;
                  continue;
                }
                stack.push(importer);
              }
            }
            return viaRoot && !viaOther;
          };

          if (onlyReachableVia(/[\\/]react-markdown[\\/]/, /BlogRenderer|BlogPost/)) {
            return 'markdown';
          }

          /*
           * posthog-js is `import()`ed, and only when a project key is set.
           * Rollup would have split it out on its own; an earlier version of
           * this function overrode that by sweeping it into `vendor`, which is
           * statically imported by the app. The result was 214 kB of analytics
           * on every page load with analytics switched off, and it dragged
           * posthog's transitive tree (protobufjs, rrweb, dompurify) into the
           * browser with it, advisories and all.
           *
           * Its own chunk restores the lazy load, so with no key configured it
           * is never fetched at all.
           */
          if (onlyReachableVia(/[\\/]posthog-js[\\/]/, /AnalyticsProvider/)) {
            return 'analytics';
          }

          if (id.includes('framer-motion') || id.includes('motion-dom') || id.includes('motion-utils')) {
            return 'motion';
          }
          if (/[\\/](i18next|react-i18next)[\\/]/.test(id)) return 'i18n';
          if (/[\\/](react|react-dom|scheduler|react-router)[\\/]/.test(id)) return 'react';

          return 'vendor';
        },
      },
    },
  },
}));
