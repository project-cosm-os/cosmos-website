import React from 'react';

/**
 * The ledger-rule texture, as a standalone layer for pages whose hero is not
 * itself a `.grid-bg` section.
 *
 * ── IT HAD NEVER RENDERED ─────────────────────────────────────────────────
 *
 * This used to be `<div className="grid-bg" />` with no positioning. A relative
 * div with no content is zero pixels tall, and `.grid-bg::before` is inset from
 * that box, so it was zero too. Every page using this component (/blog,
 * /book-demo, /blog/:slug and the 404) had been shipping an invisible
 * background since the boilerplate was copied. Nothing looked broken, because
 * an absent texture looks exactly like a plain page.
 *
 * It fills its nearest positioned ancestor instead. Each of those pages already
 * wraps its content in `relative overflow-hidden`, which is the containing
 * block this needs.
 *
 * ── PARALLAX WAS REMOVED ──────────────────────────────────────────────────
 *
 * The component took a `parallax` prop and ran a scroll listener behind it.
 * All four call sites passed `parallax={false}`, so the listener and the state
 * update it caused on every scroll event were pure cost on pages that had
 * opted out. The grid drifts on its own now, in CSS, on the compositor.
 */
const GridBackground: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`grid-bg absolute inset-0 ${className}`} aria-hidden="true" />
);

export default GridBackground;
