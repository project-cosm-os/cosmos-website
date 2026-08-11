# CosmOS Website

Marketing site for **CosmOS**, autonomous finance for Indian commerce. React, TypeScript, Vite, Tailwind CSS v4.

Built from my boilerplate and reskinned to match `cosmos-console`. The framework (SEO prerendering, i18n, theming, cookie consent, deploy pipeline) was kept; everything visual and every third-party credential was replaced.

## Getting started

```bash
pnpm install
```

```bash
pnpm generate:brand-css
```

```bash
pnpm dev
```

Dev server runs on **http://localhost:5175**. `generate:brand-css` is required before the first run and after any change to `src/config/brand.ts`.

## Scripts

| Script | What it does |
|---|---|
| `pnpm dev` | Dev server on port 5175 |
| `pnpm build` | Typecheck, copy check, SEO files, build, prerender check |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint over `src/` |
| `pnpm generate:brand-css` | Regenerate `src/styles/brand-variables.css` from `brand.ts` |
| `pnpm generate:seo` | Regenerate `sitemap.xml` and `robots.txt` |
| `pnpm check:copy` | Fail on em/en dashes in user-visible copy |
| `pnpm check:i18n` | No hardcoded copy, every key resolves, no dead keys |
| `pnpm check:figures` | Verify the illustrative figures reconcile |
| `pnpm check:prerender` | Verify the built HTML (run after `build`) |
| `pnpm preview` | Serve `dist/` locally |

`pnpm build` runs everything, including `generate:brand-css`.

That last part matters. It used to be excluded, on the reasoning that the deploy workflow ran it separately. That workflow was the GitHub Actions one, and it is gone: Netlify runs `pnpm build` and nothing else. So editing `brand.ts` without remembering to regenerate would have deployed the previous palette, with no error and nothing to notice. Generated files that a build does not regenerate are stale files waiting for a deploy.

## The seven things this project enforces mechanically

Each of these exists because the corresponding defect actually shipped here, and each is invisible on inspection:

1. **`check:copy`** — no em or en dashes in copy. A house rule that was broken nineteen times in the first pass by someone who knew the rule.
2. **`check:prerender`** — every route has static text, real SEO tags, no reference to a file that is not in `dist`, no JS chunk importing a module that is missing, no nav anchor pointing at an id that does not exist, and nothing at `opacity: 0` without an explicit `data-prerender-hidden` opt-in.

   The import-graph part exists because of the worst bug in this repo's history. A build plugin deleted `prerender-<hash>.js`, on the reasonable-sounding grounds that no browser runs the prerender script. Rollup had put the *shared vendor code* in that chunk and the app entry imported it, so `dist/` shipped an app bundle that 404'd on its own dependencies, and every check still passed: the HTML was valid, the `<script>` tag pointed at a file that existed, and the dev server never touches `dist`. Attributes in HTML are not the whole graph; imports inside the JS are.
3. **`scripts/build.ts`** — `vite build` finishes its work in three seconds and then never exits, because esbuild's service process stays open. In CI that is a job that hangs until the runner's timeout.
4. **`dropPrerenderBundle`** in `vite.config.ts` — the prerender entry is a second rollup entry, so vite emitted an 862 kB chunk and `modulepreload`ed it into every page. No browser ever runs it.
5. **`check:figures`** — the demo figures used by the console mockup, the Ask Cosmo panel and the Comply panel are one set of numbers, and they have to add up. The first draft put three fee lines totalling ₹8,65,139 under a tile reading ₹6,31,004. On a page arguing that its numbers are computed rather than guessed, the reader most likely to add that column is the one deciding whether to buy.
6. **`build.rollupOptions.manualChunks`** splits by *reachability*, asking rollup's own module graph rather than matching package names. The first attempt matched names with a regex and failed quietly in the other direction: react-markdown's tail (`style-to-object`, `inline-style-parser`) did not match, landed in the shared vendor chunk, and dragged the whole 349 kB markdown stack onto the home page.
7. **`check:i18n`** — no copy hardcoded in a component, every `t()` key present in the dictionary, and no dictionary group nothing reads. The rule is inverted on purpose: any JSX text node counts as copy unless its position proves otherwise, because a blind spot in an allowlist is a loud false positive while a blind spot in a prose-matcher is text that ships untranslated.

## Motion

Scroll reveals are CSS, driven by one `IntersectionObserver` over `[data-reveal]` (`src/lib/reveal.ts`). framer-motion was removed entirely: it writes its initial state into the DOM as an inline style, which a prerendered site serialises into the static HTML, and it cost 39 kB gzipped for entrances that CSS does natively.

The hidden state is armed by `data-motion="on"`, which `index.html` sets inline before first paint. That attribute is deliberately absent from the HTML on disk, so a crawler reads a fully visible page; a real browser arms it before painting, so nothing is shown and then hidden; and a `<noscript>` rule disarms it for a reader without JS. Get this backwards and a plain `.reveal { opacity: 0 }` ships a blank page to everyone without JS.

**The easing matters more than the durations.** `--ease-out: cubic-bezier(0.22, 0.61, 0.36, 1)`. Not the fashionable expo-out `cubic-bezier(0.16, 1, 0.3, 1)`, which front-loads about 90% of the travel into the first quarter and reads as a snap followed by a stall rather than as movement.

## Page weight

| | gzipped |
|---|---|
| Home page, before | 332 kB |
| Home page, now | **128 kB** |

What moved: `react-dom/server` (184 kB raw) is in its own chunk that no browser fetches, the markdown stack (349 kB raw) loads only on `/blog/:slug` behind `React.lazy`, and framer-motion is gone.

Only `/blog/:slug` is lazy. The other four routes are prerendered and the prerenderer calls `renderToString`, which cannot suspend, so a lazy route would write its Suspense fallback into the static HTML. `check:prerender`'s word count is what would catch that.

## Light only

There is no theme picker. `index.html` sets `data-theme="light"` and nothing changes it. The dark palette is still generated into the stylesheet, so re-enabling is a matter of restoring a toggle rather than restyling.

## Where the design comes from

`src/config/brand.ts` holds two ramps copied verbatim from `cosmos-console/src/tokens/primitive.css`: a `neutral` (ink) ramp and a `brand` (blue) ramp. `pnpm generate:brand-css` turns them into CSS custom properties.

**The primary action is ink, not blue.** That is the decision that makes the site look like the product rather than a template with a logo on it. Blue appears in at most three places on a page: the section eyebrow, one phrase in the headline, and the one element being pointed at.

`src/styles/globals.css` puts every rule in `@layer base` or `@layer components`. This is load-bearing: unlayered CSS beats every `@layer` rule regardless of specificity, so an unlayered `p { margin: 0 }` silently defeats Tailwind's `mx-auto`, and the failure is invisible. That shipped in the first draft.

## Structure

```
content/blog/          Markdown posts, frontmatter with a `slug`
public/assets/         Logos, favicon, OG image
scripts/               Build, generators, and the two checks
src/
  components/
    layout/            Header, Footer
    sections/          Home page sections
    shared/            Button, SEO, ConsoleMockup, GridBackground
    integrations/      Calendly, HubSpot form, cookie consent
    blog/              Blog card
  config/              brand, brand-identity, navigation, integrations
  i18n/                en-US.json and setup
  pages/               Home, Features, Blog, BlogPost, BookDemo, NotFound
  providers/           Theme, Analytics
  styles/              globals.css and the generated brand-variables.css
```

## Pages

| Route | Source |
|---|---|
| `/` | `pages/Home.tsx` — hero, sources, four pillars (recover, automate, comply, own), Ask Cosmo, flow, trust, FAQ, CTA |
| `/features` | `pages/Features.tsx` — every capability, with unbuilt ones marked `soon` |
| `/blog` | `pages/Blog.tsx` |
| `/blog/:slug` | `pages/BlogPost.tsx` |
| `/book-demo` | `pages/BookDemo.tsx` — Calendly, or a message form |
| anything else | `pages/NotFound.tsx` |

Routes are prerendered to static HTML at build time. New top-level routes must be added to `additionalPrerenderRoutes` in `vite.config.ts`; blog posts are discovered automatically from `content/blog`.

## Copy

All of it lives in `src/i18n/locales/en-US.json`, including the demo figures, and `pnpm check:i18n` fails the build if a string appears in a component instead. One file to edit, one file to review, and one place for a second language to go later.

Five rules:

- **No em dashes.** `pnpm check:copy` fails the build. A comma in place of an em dash usually leaves a comma splice, so rewrite the sentence.
- **Nothing claimed that is not built.** The Features page marks unbuilt capabilities `soon`, and the sources strip marks marketplaces that are not connected yet. This audience is professionally suspicious; one overstated capability costs every other one.
- **Every number was counted.** 103 accounts, 39 posting rules, nine integrity checks, four leakage types, twelve question types, five refusals. Each was read out of `cosmos-platform`, not recalled. Re-count before changing one.
- **Say what the product does, not what the website does.** The Features page once opened with "Twenty-one screens, one ledger. What is built is marked as built, and what is coming is marked as coming." That is a note about our own labelling policy taking up the most valuable line on the page. No visitor came here to learn how we label things.
- **Short beats complete.** This is a marketing site, not the documentation. A pillar gets a heading, three lines and four bullets. Anything longer belongs on the Product page or in a demo.

There is no design-partner programme on the site, and the only call to action is a demo. Onboarding a real seller means taking their live marketplace credentials and their books, and there is no SSO, no compliance certification, and no output GST yet. A claim that invites diligence you would fail is worse than no claim.

Content owes as much to the founders' reference site (`cosmos-console/site`, branch `jagadeesh-site-reference`) as to the repos. The GST pillar and the Ask Cosmo section exist because that site had them and the first draft of this one did not.

## Configuration still outstanding

These are placeholders and the site runs without them:

| What | Where | Note |
|---|---|---|
| Domain | `src/config/brand-identity.ts` → `websiteUrl` | Currently `https://cosmos.ai`. Feeds canonical tags, og:url, sitemap and robots. |
| Calendly link | `src/config/integrations.ts` → `calendly` | Set `url`, then `enabled: true`. Until then the booking tab shows a placeholder. |
| PostHog key | `src/config/integrations.ts` → `analytics` | Create a **CosmOS** project. Do not reuse another product's key. |
| Social handles | `src/config/brand-identity.ts` → `social` | Used in the Twitter card. |

Nothing was inherited from the boilerplate's accounts: its HubSpot portal and PostHog key were removed rather than carried over, since shipping them would have sent every CosmOS visitor and form fill into another product's analytics and CRM.

## Assets

`public/assets/logos/*.svg` and the favicon are placeholder wordmarks generated for this repo, not final brand assets. The OG card is generated:

```bash
python3 scripts/generate-og-image.py
```

Regenerate it if the palette or the headline changes; it is what shows when the link is shared.

## Integrations are swappable

Nothing imports Netlify, HubSpot, Google or Calendly directly. Components ask for a provider:

| | Interface | Adapters | Selected by |
|---|---|---|---|
| Booking | `src/integrations/scheduling/` | `google`, `calendly`, `none` | `VITE_SCHEDULING_PROVIDER` |
| Forms | `src/integrations/forms/` | `netlify`, `hubspot`, `none` | `VITE_FORMS_PROVIDER` |

Adding Formspree, a CRM webhook or a self-hosted endpoint is a file implementing the interface plus a name in the union. No component changes.

## What is public and what is not

**The `VITE_` prefix is the boundary.** Vite compiles every `VITE_`-prefixed variable into the JavaScript it ships. That is documented behaviour, not a leak, and it decides where a value belongs:

| | Where | Reaches the browser |
|---|---|---|
| Provider names, HubSpot form ids | `VITE_*` | Yes, and that is fine. Public identifiers. |
| Google Calendar URL | `SCHEDULING_URL`, no prefix | No. Read at request time by `netlify/functions/schedule.ts`. |
| Form recipient | Netlify dashboard only | No. Named in no file in this repo. |

Two honest limits:

- **The booking URL is hidden from the build, not from the browser.** A visitor with devtools open sees the redirect target in the network panel, because the browser has to reach Google for the page to render. This stops bulk scraping of the repo and the CDN. It is not a secret.
- **The recipient address is genuinely absent.** Submissions go to Netlify; the notification address is set under Forms → Form notifications. Note the sibling arivlabs site puts its address in `netlify.toml`, which is in git. This one does not.

`check:prerender` fails the build if any address or booking URL appears in `dist/`. It has caught two: a `mailto:` fallback in the old form, and the contact email inside the Organization JSON-LD, where it was machine-readable by design.

## The Netlify form stub

Netlify finds forms by parsing deployed HTML. **It never runs JavaScript.** The real form sits behind a tab that is not the default on `/book-demo`, so it is in no prerendered file, and Netlify would register no form at all: every submission 404s in a way that reads like a routing bug.

`index.html` therefore carries a hidden stub whose only job is to be found. Its field list must match `DemoForm.tsx`; `check:prerender` compares them on every build, because a drifted stub silently drops the fields it does not know about.

## Security

| Control | Where |
|---|---|
| Exact version pins, no ranges | `package.json`, `.npmrc` `save-exact=true` |
| No dependency may run install scripts | `pnpm.onlyBuiltDependencies: []` |
| Lockfile cannot be rewritten by an install | `.npmrc` `prefer-frozen-lockfile` |
| CSP with hashed inline scripts, no `unsafe-inline` in `script-src` | generated `dist/_headers` |
| HSTS, COOP, CORP, nosniff, `frame-ancestors 'self'` | generated `dist/_headers` |
| No source maps published | `vite.config.ts` |
| No raw HTML in markdown | `rehype-raw` removed |
| No address or booking URL in the output | `check:prerender` |

**Why exact pins.** A caret range is a standing instruction to run code nobody here has reviewed, on whatever machine next installs. That is how most supply-chain compromises of recent years arrived: maintainer account taken over, patch published, every project with a caret picks it up on the next CI run with no commit and no diff. Exact pins make an upgrade a pull request. `pnpm outdated` still shows what has moved.

**`onlyBuiltDependencies: []`** blocks every dependency lifecycle script. A `postinstall` runs with full user privileges the moment a compromised version is fetched, before anyone has looked at anything. Nothing in this tree needs one. If pnpm ever reports a skipped script, read what it does before adding it, and add only that package.

### Known advisories

`pnpm audit` reports findings against transitive dependencies. What matters is whether the code reaches a browser:

- **Nothing vulnerable is on the critical path.** `protobufjs` (critical), `dompurify`, `rrweb` and `opentelemetry` all arrive via `posthog-js`, which is dynamically imported only when a PostHog key is set. It has its own chunk and is not fetched otherwise. Verified against the built output, not assumed.
- The remainder are build tooling (eslint, postcss, minimatch), which never ships.
- `react-router` and `vite` had advisories affecting the versions in use and were upgraded deliberately, within the same major, with the full build re-run.

Re-check after any upgrade with `pnpm audit`, then confirm the package is not in an eagerly-loaded chunk before deciding it matters.

### Page weight and loading

| | |
|---|---|
| Home page | **130 kB gzipped** |
| Compression | Netlify gzip/brotli at the edge. Do not precompress. |
| Immutable assets | `/assets/*` cached one year (filenames are content-hashed) |
| HTML | `must-revalidate`, or a deploy never reaches a returning visitor |
| Lazy | `/blog/:slug` route, `posthog-js`, the booking iframe (`loading="lazy"`) |
| Not lazy | The four prerendered routes. `renderToString` cannot suspend, so a lazy route would write its Suspense fallback into the static HTML. |

## Deployment

Netlify, from `netlify.toml`. `pnpm build` runs typecheck, the copy/i18n/figures checks, the prerenderer and the prerender assertions, so a failing check is a failed deploy.

Target: **cosmos-ai.arivlabs.com** (temporary, while the name is settled: `cosmos.ai` is taken).

Set in the Netlify dashboard before the first deploy:

| Where | Key | Value |
|---|---|---|
| Environment variables | `SCHEDULING_URL` | The **embeddable** calendar URL, see below |
| Environment variables | `VITE_SCHEDULING_PROVIDER` | `google` |
| Environment variables | `VITE_FORMS_PROVIDER` | `netlify` |
| Forms → notifications | recipient | Jagadeesh's address |

### The calendar URL has to be the embeddable one

Google serves an appointment schedule from two paths and only one can be framed. Measured with curl:

| | `x-frame-options` |
|---|---|
| `/appointments/schedules/<id>` | `SAMEORIGIN`, blocked |
| `/calendar/appointments/schedules/<id>` | absent, works |

The share button and every `calendar.app.google` short link give you the first. Embed it and the booking panel is an empty box with a console message nobody is reading: a booking page that silently accepts no bookings.

`normalise.ts` rewrites the long form and appends `gv=true`. A short link cannot be rewritten (the schedule id is not in it), so it is refused with a message in the deploy log rather than rendered blank.

Renaming the product later is `brandName` in `brand-identity.ts`, `websiteUrl` in the same file, the two logo SVGs, and the Netlify domain. `pnpm generate:seo` rewrites the sitemap and robots from `websiteUrl` automatically.

The previous GitHub Actions workflow deployed to an S3 bucket and CloudFront distribution that were never created. It was removed rather than left to fail on the first push.

Note that `build.sourcemap` is `true` in `vite.config.ts`, so source maps are published alongside the site and the source is readable by anyone who looks. That is inherited and fine for a marketing site, but it is a choice, not an oversight.
