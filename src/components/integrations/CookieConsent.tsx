import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, Shield } from 'lucide-react';

import { useCookieConsent, type CookiePreferences } from '../../hooks/useCookieConsent';
import Button from '../shared/Button';

type View = 'banner' | 'manage';

const CookieConsent: React.FC = () => {
  const { t } = useTranslation();
  const { isUndecided, preferences, acceptAll, declineAll, savePreferences, reopenConsent } = useCookieConsent();
  const [view, setView] = useState<View>('banner');
  const [draft, setDraft] = useState<CookiePreferences>(preferences);

  const handleSavePreferences = () => {
    savePreferences(draft);
  };

  const handleOpenManage = () => {
    setDraft(preferences);
    setView('manage');
  };

  const handleFloatingClick = () => {
    setDraft(preferences);
    setView('manage');
    reopenConsent();
  };

  return (
    <>
      {!isUndecided && (
          <button
            onClick={handleFloatingClick}
            style={{ animation: 'pop-in 220ms var(--ease-out) both' }}
            className="fixed bottom-4 left-4 z-50 w-10 h-10 rounded-full bg-[var(--bg-card)] border border-[var(--border-default)] shadow-lg flex items-center justify-center cursor-pointer hover:border-[var(--primary)] transition-colors"
            aria-label={t('cookieConsent.manage')}
          >
            <Shield size={18} className="text-[var(--text-secondary)]" />
          </button>
      )}

      {isUndecided && (
          <div
            className="fixed bottom-0 left-0 right-0 z-50 p-4"
            style={{ animation: 'slide-up 320ms var(--ease-out) both' }}
          >
            <div className="section-container">
              <div className="glass-card p-5 md:p-6">
                {view === 'banner' ? (
                  <div
                    key="banner"
                    /*
                      Allowed to prerender hidden. A consent bar painted before
                      the page it sits on is worse than one arriving a beat
                      late, and check-prerender keys its exemption off this
                      attribute so the allowance is explicit here rather than a
                      text match over the markup.
                    */
                    data-prerender-hidden="cookie-consent"
                    style={{ animation: 'fade-in 160ms var(--ease-out) both' }}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <Shield size={20} className="text-[var(--primary)] shrink-0 mt-0.5" />
                      <p className="text-sm text-[var(--text-secondary)] m-0">
                        {t('cookieConsent.message')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={handleOpenManage}
                        className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors bg-transparent border-none cursor-pointer px-0"
                      >
                        <Settings size={14} />
                        {t('cookieConsent.manage')}
                      </button>
                      <Button variant="ghost" size="sm" onClick={declineAll}>
                        {t('cookieConsent.decline')}
                      </Button>
                      <Button variant="primary" size="sm" onClick={acceptAll}>
                        {t('cookieConsent.accept')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    key="manage"
                    style={{ animation: 'fade-in 160ms var(--ease-out) both' }}
                    className="flex flex-col gap-5"
                  >
                    <div>
                      <h3 className="text-base font-semibold text-[var(--text-primary)] m-0 mb-1">
                        {t('cookieConsent.manageTitle')}
                      </h3>
                      <p className="text-sm text-[var(--text-muted)] m-0">
                        {t('cookieConsent.manageDescription')}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3">
                      <CookieCategory
                        label={t('cookieConsent.necessary')}
                        description={t('cookieConsent.necessaryDescription')}
                        checked={true}
                        disabled={true}
                      />
                      <CookieCategory
                        label={t('cookieConsent.analytics')}
                        description={t('cookieConsent.analyticsDescription')}
                        checked={draft.analytics}
                        onChange={(val) => setDraft({ ...draft, analytics: val })}
                      />
                      <CookieCategory
                        label={t('cookieConsent.marketing')}
                        description={t('cookieConsent.marketingDescription')}
                        checked={draft.marketing}
                        onChange={(val) => setDraft({ ...draft, marketing: val })}
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3">
                      <Button variant="ghost" size="sm" onClick={() => setView('banner')}>
                        {t('cookieConsent.back')}
                      </Button>
                      <Button variant="primary" size="sm" onClick={handleSavePreferences}>
                        {t('cookieConsent.savePreferences')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
      )}
    </>
  );
};

interface CookieCategoryProps {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (value: boolean) => void;
}

const CookieCategory: React.FC<CookieCategoryProps> = ({
  label,
  description,
  checked,
  disabled = false,
  onChange,
}) => (
  <div className="flex items-center justify-between gap-4 rounded-[var(--radius-md)] bg-[var(--bg-elevated)] p-3">
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-[var(--text-primary)] m-0">{label}</p>
      <p className="text-xs text-[var(--text-muted)] m-0 mt-0.5">{description}</p>
    </div>
    <label className="relative inline-flex items-center cursor-pointer shrink-0">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="sr-only peer"
      />
      <div
        className={`w-9 h-5 rounded-full transition-colors ${
          disabled
            ? 'bg-[var(--primary)] opacity-60 cursor-not-allowed'
            : checked
              ? 'bg-[var(--primary)] cursor-pointer'
              : 'bg-[var(--border-default)] cursor-pointer'
        } peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--primary-glow)] after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform ${
          checked ? 'after:translate-x-full' : ''
        }`}
      />
    </label>
  </div>
);

export default CookieConsent;
