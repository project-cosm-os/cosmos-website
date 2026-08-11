import { useEffect } from 'react';

/**
 * Scroll reveals, in CSS, with one IntersectionObserver for the whole page.
 *
 * ── WHY NOT framer-motion ─────────────────────────────────────────────────
 *
 * framer-motion writes its initial state into the DOM as an inline style, and
 * this site is prerendered: `initial={{ opacity: 0 }}` is serialised into the
 * static HTML, so the section ships invisible and stays invisible until React
 * hydrates. That shipped once already, on /book-demo and /blog, and is the
 * reason check:prerender exists.
 *
 * It is also 39 kB gzipped for entrance animations that CSS does natively.
 *
 * ── HOW THE HIDDEN STATE IS ARMED ─────────────────────────────────────────
 *
 * The trap with CSS reveals is the mirror image: if the stylesheet says
 * `.reveal { opacity: 0 }` then a crawler, a reader with JS disabled, and a
 * failed hydration all get a blank page.
 *
 * So the hidden state is gated behind `data-motion="on"`, which an inline
 * script in index.html sets before first paint. The prerendered HTML on disk
 * never carries that attribute, so the static file reads as fully visible; a
 * real browser arms it synchronously before painting, so there is no flash of
 * content that then hides; and a <noscript> rule disarms it for readers
 * without JS.
 *
 * ── ONE OBSERVER, NOT ONE PER SECTION ─────────────────────────────────────
 *
 * A hook per section means a hook's worth of observer per section. One
 * observer over `[data-reveal]` costs the same regardless of how many sections
 * the page grows, and re-scans on route change to pick up the new page's nodes.
 */

/** Distance above the viewport bottom at which a section starts animating. */
const ROOT_MARGIN = '0px 0px -12% 0px';

/** Fires once a tenth of the element has crossed. Larger feels late on tall sections. */
const THRESHOLD = 0.1;

export function useRevealOnScroll(deps: unknown[] = []): void {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const targets = document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-revealed])');
    if (targets.length === 0) return;

    // Reduced motion still needs the content shown, just not moved. Marking
    // everything revealed immediately is simpler and safer than relying on the
    // CSS media query alone, which would leave the observer running for nothing.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      targets.forEach((el) => el.setAttribute('data-revealed', ''));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute('data-revealed', '');
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: ROOT_MARGIN, threshold: THRESHOLD },
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // `deps` is the caller's, by design: App passes the pathname so the scan
    // re-runs when a new page mounts.
  }, deps);
}
