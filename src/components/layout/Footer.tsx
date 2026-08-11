import React from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Linkedin } from 'lucide-react';

import { BRAND } from '../../config/brand-identity';
import { ROUTES } from '../../config/navigation';
import { useCookieConsent } from '../../hooks/useCookieConsent';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const { resetConsent } = useCookieConsent();
  const logoSrc = BRAND.logos.light;

  return (
    <footer className="gradient-border-top bg-[var(--bg-elevated)]">
      <div className="section-container py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-6">
            <Link to={ROUTES.home}>
              <img src={logoSrc} alt={BRAND.brandName} className="w-36" />
            </Link>
            <span className="hidden md:block text-sm text-[var(--text-muted)]">
              {t('footer.tagline', { tagline: BRAND.productTagline })}
            </span>
          </div>

          {/* Nav + Social */}
          <div className="flex items-center gap-8">
            <Link
              to={ROUTES.features}
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors no-underline"
            >
              {t('footer.features')}
            </Link>
            <Link
              to={ROUTES.blog}
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors no-underline"
            >
              {t('blog.title')}
            </Link>
            <Link
              to={ROUTES.bookDemo}
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors no-underline"
            >
              {t('footer.bookDemo')}
            </Link>
            <a
              href={BRAND.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin size={18} />
            </a>
          </div>
        </div>

        {/* Copyright & Cookie Settings */}
        <div className="mt-6 pt-6 border-t border-[var(--border-light)] flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-[var(--text-muted)] m-0">
            {t('footer.copyright', { companyName: BRAND.companyName })}
          </p>
          <button
            onClick={resetConsent}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors bg-transparent border-none cursor-pointer px-0"
          >
            {t('footer.cookieSettings')}
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
