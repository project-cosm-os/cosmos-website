// DOM polyfill must be imported before any other modules that may reference
// browser globals (document, window, navigator) at the module level.
import './prerender-polyfill.js';

import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { HelmetProvider, HelmetServerState } from 'react-helmet-async';

// Initialize i18n so translations work during prerendering
import './i18n';

import App from './App';
import { AnalyticsProvider } from './providers/AnalyticsProvider';

interface PrerenderResult {
  html: string;
  head: {
    lang: string;
    title: string;
    elements: Set<{ type: string; props: Record<string, string> }>;
  };
  links: string[];
}

/**
 * Prerender entry point called by vite-prerender-plugin at build time.
 * Renders the React app at a given URL and returns static HTML + head meta tags.
 */
export async function prerender({ url }: { url: string }): Promise<PrerenderResult> {
  const helmetContext: { helmet?: HelmetServerState } = {};

  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={url}>
          <AnalyticsProvider>
            <App />
          </AnalyticsProvider>
      </StaticRouter>
    </HelmetProvider>,
  );

  const helmet = helmetContext.helmet;
  const elements = new Set<{ type: string; props: Record<string, string> }>();

  if (helmet) {
    // Extract meta tags from helmet
    const metaString = helmet.meta?.toString() ?? '';
    const linkString = helmet.link?.toString() ?? '';
    const scriptString = helmet.script?.toString() ?? '';

    // Parse meta tags
    for (const match of metaString.matchAll(/<meta\s+([^>]*)\/?\s*>/gi)) {
      const props: Record<string, string> = {};
      for (const attr of match[1].matchAll(/(\w[\w-]*)="([^"]*)"/g)) {
        props[attr[1]] = attr[2];
      }
      if (Object.keys(props).length > 0) {
        elements.add({ type: 'meta', props });
      }
    }

    // Parse link tags (canonical etc.)
    for (const match of linkString.matchAll(/<link\s+([^>]*)\/?\s*>/gi)) {
      const props: Record<string, string> = {};
      for (const attr of match[1].matchAll(/(\w[\w-]*)="([^"]*)"/g)) {
        props[attr[1]] = attr[2];
      }
      if (Object.keys(props).length > 0) {
        elements.add({ type: 'link', props });
      }
    }

    console.log('[PRERENDER DEBUG] scriptString length:', scriptString.length);
    console.log('[PRERENDER DEBUG] scriptString head:', scriptString.slice(0, 160));
    // Parse script tags (JSON-LD structured data)
    for (const match of scriptString.matchAll(/<script\s+([^>]*)>([\s\S]*?)<\/script>/gi)) {
      const props: Record<string, string> = {};
      for (const attr of match[1].matchAll(/(\w[\w-]*)="([^"]*)"/g)) {
        props[attr[1]] = attr[2];
      }
      if (match[2]) {
        props.children = match[2];
      }
      elements.add({ type: 'script', props });
    }
  }

  /*
    Read the language off Helmet rather than hardcoding it. This was `'en'`, so
    the `<html lang="en-IN" />` that SEO.tsx sets never reached the output and
    every page shipped claiming plain English. For a product sold only in India,
    the region subtag is a real signal to search.
  */
  const langAttr = helmet?.htmlAttributes?.toString() ?? '';
  const lang = langAttr.match(/lang="([^"]+)"/)?.[1] ?? 'en';

  return {
    html,
    head: {
      lang,
      title: helmet?.title?.toString()?.replace(/<title[^>]*>|<\/title>/g, '') ?? '',
      elements,
    },
    links: [],
  };
}
