import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Menu, X } from 'lucide-react';

import { BRAND } from '../../config/brand-identity';
import { SECTION_NAV, ROUTES } from '../../config/navigation';
import Button from '../shared/Button';

/**
 * ── THE HEADER SELLS, IT DOES NOT JUST NAVIGATE ───────────────────────────
 *
 * This used to read Home / Product / Blog / Book a demo, which told a visitor
 * nothing about the product. It now lists six capabilities, because the header
 * is the one piece of copy every visitor sees and it should say what CosmOS
 * does before they scroll.
 *
 * Blog moved to the footer. It has no posts yet, and a nav item leading to
 * "No posts yet" costs more than it earns.
 */
const Header: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.hash]);

  /** Highlights the section being read, but only while actually on the home page. */
  const activeHash = location.pathname === ROUTES.home ? location.hash.replace('#', '') : '';

  return (
    <header
      className={`transition-all duration-300 ${
        scrolled
          ? 'bg-[var(--bg-header)] backdrop-blur-xl gradient-border-bottom shadow-[var(--shadow-sm)]'
          : 'bg-transparent'
      }`}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50 }}
    >
      <div className="section-container flex items-center justify-between gap-4" style={{ height: 72 }}>
        <Link to={ROUTES.home} className="flex items-center gap-3 no-underline shrink-0">
          {/* Light theme only, so the mark never needs to swap. */}
          <img src={BRAND.logos.light} alt={BRAND.brandName} className="h-7 w-auto md:h-8" />
        </Link>

        {/*
          One row, six section anchors and one page link.
          Product sat in its own group on the right and read as detached, as if
          it belonged to the button rather than the nav. It is a different kind
          of destination (a page, not a section), so it keeps a hairline rule
          rather than a gap: same row, still distinguishable.
        */}
        <nav className="hidden lg:flex items-center gap-6">
          {SECTION_NAV.map((item) => (
            <Link
              key={item.hash}
              to={`${ROUTES.home}#${item.hash}`}
              className={`text-[14px] font-medium transition-colors no-underline whitespace-nowrap ${
                activeHash === item.hash
                  ? 'text-[var(--primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {t(item.labelKey)}
            </Link>
          ))}

          <span className="h-4 w-px" style={{ background: 'var(--border-default)' }} />

          <Link
            to={ROUTES.features}
            className={`text-[14px] font-medium transition-colors no-underline whitespace-nowrap ${
              location.pathname === ROUTES.features
                ? 'text-[var(--primary)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {t('nav.features')}
          </Link>
        </nav>

        <div className="hidden lg:flex shrink-0">
          <Button variant="primary" size="sm" href={ROUTES.bookDemo}>
            {t('nav.getStarted')}
          </Button>
        </div>

        {/*
          Hamburger runs until `lg`, matching the nav's own breakpoint. At `md`
          it left a band where the section links were hidden and no drawer had
          appeared, so Product and every capability were unreachable.
        */}
        <button
          className="lg:hidden p-2 text-[var(--text-primary)] bg-transparent border-none cursor-pointer"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={t('nav.toggleMenu')}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/*
        max-height rather than the grid-template-rows 0fr→1fr trick. That trick
        fails here: `overflow: hidden` zeroes the child's automatic minimum
        size, so the 1fr track resolves to 0 and the drawer stays shut. Measured
        in the console: 0px with overflow hidden, 346px without it, same element.

        The ceiling is generous on purpose. It only has to exceed the drawer's
        real height; the transition reads off the actual content because the
        element stops growing when the content does.
      */}
      <div
        id="mobile-menu"
        /*
          Ships closed, so it ships at opacity 0, and check-prerender requires
          that to be declared rather than inferred. A collapsed menu is the one
          honest reason for hidden content in static HTML: the links are all
          reachable from the desktop nav and the footer, so nothing is being
          concealed from a crawler that it cannot read elsewhere.
        */
        data-prerender-hidden="mobile-menu-collapsed"
        className="lg:hidden overflow-hidden bg-[var(--bg-elevated)]"
        style={{
          maxHeight: mobileMenuOpen ? 640 : 0,
          opacity: mobileMenuOpen ? 1 : 0,
          borderBottom: mobileMenuOpen ? '1px solid var(--border-default)' : '1px solid transparent',
          transition:
            'max-height 420ms var(--ease-out), opacity 240ms var(--ease-out), border-color 240ms var(--ease-out)',
        }}
      >
        <div className="section-container py-4 flex flex-col gap-1">
          {SECTION_NAV.map((item) => (
            <Link
              key={item.hash}
              to={`${ROUTES.home}#${item.hash}`}
              className="text-base font-medium py-2 no-underline text-[var(--text-secondary)]"
            >
              {t(item.labelKey)}
            </Link>
          ))}
          <div className="mt-2 flex flex-col gap-1 border-t border-[var(--border-light)] pt-3">
            <Link
              to={ROUTES.features}
              className="text-base font-medium py-2 no-underline text-[var(--text-secondary)]"
            >
              {t('nav.features')}
            </Link>
            <Link
              to={ROUTES.blog}
              className="text-base font-medium py-2 no-underline text-[var(--text-secondary)]"
            >
              {t('nav.blog')}
            </Link>
            <Button variant="primary" size="sm" href={ROUTES.bookDemo} className="mt-2">
              {t('nav.getStarted')}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
