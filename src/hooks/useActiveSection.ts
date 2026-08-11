import { useEffect, useState } from 'react';

/**
 * Which section the reader is currently in, for highlighting the header nav.
 *
 * ── THE RULE: LAST ONE PASSED, NOT ONE CURRENTLY ON SCREEN ────────────────
 *
 * The home page lists six sections in its nav but renders thirteen: `own`,
 * `deployment`, `trace`, `faq` and `cta` have no nav entry. Any rule of the
 * form "highlight whatever is on screen" leaves the highlight blinking off
 * while the reader scrolls through those, which reads as a bug.
 *
 * So the active section is the last one in the nav whose top has crossed a
 * line just below the header. Gaps are handled by construction: a section with
 * no nav entry is not a candidate, so the one before it keeps the highlight
 * until the next candidate arrives.
 *
 * ── WHY THE OBSERVER IS A TRIGGER AND NOT THE ANSWER ──────────────────────
 *
 * The observer is not asked which section is visible. It is anchored exactly
 * at the line, so it fires precisely when some section's top crosses it, which
 * is precisely the set of moments the answer can change. The callback then
 * recomputes the rule over all six.
 *
 * That is the whole reason to prefer this over the obvious alternative of
 * measuring on every scroll event: scrolling within one section does no work
 * at all, rather than six `getBoundingClientRect` calls per animation frame.
 *
 * It also keeps working when the tab is not visible. `requestAnimationFrame`
 * does not fire in a hidden tab, so a scroll-plus-rAF version silently stops
 * updating there; observer callbacks are still delivered.
 */

/**
 * Distance from the top of the viewport at which a section becomes current.
 *
 * The header is 72px and fixed, and sections carry `scroll-mt-20` (80px) so a
 * hash link parks them just clear of it. Ninety-six puts the line a little
 * below that, so a section takes over as its heading settles into place rather
 * than while it is still tucked behind the header.
 *
 * This value appears twice, once as a number and once inside the observer's
 * rootMargin string, so they are derived from one constant. Letting them drift
 * would mean the observer fires at a boundary the rule does not use, and the
 * highlight would update one section late.
 */
const ACTIVE_LINE_PX = 96;

export function useActiveSection(hashes: readonly string[], enabled: boolean): string {
  const [active, setActive] = useState('');

  useEffect(() => {
    if (!enabled) {
      setActive('');
      return;
    }

    const elements = hashes
      .map((hash) => ({ hash, el: document.getElementById(hash) }))
      .filter((entry): entry is { hash: string; el: HTMLElement } => entry.el !== null);

    const measure = () => {
      let current = '';
      for (const { hash, el } of elements) {
        if (el.getBoundingClientRect().top <= ACTIVE_LINE_PX) current = hash;
      }
      // React bails out on an unchanged value, so a crossing that does not move
      // the answer costs nothing.
      setActive(current);
    };

    /*
      A thin band just under the header, not the whole viewport. Left at the
      default the root is everything below the line, so a tall section stays
      intersecting for thousands of pixels and the callback fires on entry and
      then not again until it finally leaves.

      The bottom margin is -70% rather than -100% on purpose. At -100% the top
      edge sits at ACTIVE_LINE_PX and the bottom edge at zero, which is an
      inverted rectangle, and an empty root is not required to report
      intersections at all. Chrome tolerated it; that is not a guarantee worth
      shipping on.

      Widening the band cannot change which section is reported, because the
      callback ignores its entries and recomputes the rule over all six. The
      band only decides how often that recompute is offered, and a section top
      crossing ACTIVE_LINE_PX is a boundary of this band either way.
    */
    const observer = new IntersectionObserver(measure, {
      rootMargin: `-${ACTIVE_LINE_PX}px 0px -70% 0px`,
      threshold: 0,
    });
    for (const { el } of elements) observer.observe(el);

    // The observer reports initial state on its own, but only for the elements
    // it can see crossing. Measuring once covers landing deep in the page from
    // a shared /#platform link or a restored scroll position.
    measure();

    return () => observer.disconnect();
  }, [hashes, enabled]);

  return active;
}
