import { Routes, Route, useLocation, Navigate } from 'react-router';
import { useEffect, lazy, Suspense } from 'react';

import { ROUTES } from './config/navigation';
import { useRevealOnScroll } from './lib/reveal';
import { useAnalytics } from './providers/AnalyticsProvider';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Features from './pages/Features';
import Blog from './pages/Blog';
import BookDemo from './pages/BookDemo';
import NotFound from './pages/NotFound';

/**
 * ── ONLY THIS ROUTE IS LAZY, AND THAT IS NOT AN OVERSIGHT ─────────────────
 *
 * BlogPost pulls in react-markdown and the whole unified/micromark stack, which
 * is the heaviest thing in the dependency tree and is needed by exactly one
 * route. Splitting it out keeps it off every other page.
 *
 * The other four routes stay eagerly imported because they are prerendered, and
 * the prerenderer calls `renderToString`, which cannot suspend: a lazy route
 * would render its Suspense fallback into the static HTML instead of the page.
 * This one is safe today because `content/blog` is empty, so no post route is
 * prerendered at all.
 *
 * That safety expires the moment somebody adds a post. `check:prerender`
 * enforces a word count on every prerendered route, so a page that shipped a
 * fallback instead of content fails the build rather than going out quietly.
 */
const BlogPost = lazy(() => import('./pages/BlogPost'));

/**
 * Strips trailing slashes to prevent duplicate URLs for SEO.
 * Google treats /blog and /blog/ as different pages — this normalizes to no trailing slash.
 */
function TrailingSlashRedirect() {
  const { pathname, search, hash } = useLocation();

  if (pathname !== '/' && pathname.endsWith('/')) {
    return <Navigate to={pathname.replace(/\/+$/, '') + search + hash} replace />;
  }

  return null;
}

/**
 * Scrolls to the section named in the URL hash.
 *
 * react-router does not do this: a client-side navigation to /#recover updates
 * the URL and leaves the page where it was, so the header's capability links
 * would appear to do nothing from any page other than the one already showing
 * that section.
 *
 * Two paths, because they have different requirements:
 *
 *   Already on the home page. The section exists, so scroll straight away. No
 *   waiting, and nothing that depends on a frame being scheduled.
 *
 *   Arriving from /features or /blog. The home page has not mounted when the
 *   location changes, so the target does not exist yet and one frame is enough
 *   for it to render.
 *
 * `scroll-mt-20` on the sections handles the fixed header's overlap.
 */
function HashScroll() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }

    const id = hash.slice(1);
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const frame = requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash]);

  return null;
}

function App() {
  const location = useLocation();
  const { trackPageView } = useAnalytics();

  // Re-scans on route change so a newly mounted page's sections get observed.
  useRevealOnScroll([location.pathname]);

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname, trackPageView]);

  return (
    <Layout>
      <TrailingSlashRedirect />
      <HashScroll />
      <Routes>
        <Route path={ROUTES.home} element={<Home />} />
        <Route path={ROUTES.features} element={<Features />} />
        <Route path={ROUTES.blog} element={<Blog />} />
        <Route
          path="/blog/:slug"
          element={
            <Suspense fallback={<div style={{ minHeight: '70vh' }} />}>
              <BlogPost />
            </Suspense>
          }
        />
        <Route path={ROUTES.bookDemo} element={<BookDemo />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

export default App;
