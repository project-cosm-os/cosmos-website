import { useState, useCallback, useMemo } from 'react';
import { BRAND } from '../config/brand-identity';
import { INTEGRATIONS } from '../config/integrations';

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

type ConsentStatus = 'undecided' | 'decided';

const STORAGE_KEY = BRAND.storageKeys.cookieConsent;

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
};

function loadPreferences(): { status: ConsentStatus; preferences: CookiePreferences } {
  if (typeof window === 'undefined') {
    return { status: 'undecided', preferences: DEFAULT_PREFERENCES };
  }

  if (!INTEGRATIONS.cookieConsent.enabled) {
    return {
      status: 'decided',
      preferences: { necessary: true, analytics: true, marketing: true },
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { status: 'undecided', preferences: DEFAULT_PREFERENCES };

    if (stored === 'accepted' || stored === 'declined') {
      localStorage.removeItem(STORAGE_KEY);
      return { status: 'undecided', preferences: DEFAULT_PREFERENCES };
    }

    const parsed = JSON.parse(stored) as CookiePreferences;
    return {
      status: 'decided',
      preferences: { ...DEFAULT_PREFERENCES, ...parsed, necessary: true },
    };
  } catch {
    return { status: 'undecided', preferences: DEFAULT_PREFERENCES };
  }
}

export function useCookieConsent() {
  const initial = useMemo(() => loadPreferences(), []);
  const [status, setStatus] = useState<ConsentStatus>(initial.status);
  const [preferences, setPreferences] = useState<CookiePreferences>(initial.preferences);

  const savePreferences = useCallback((prefs: CookiePreferences) => {
    const safePrefs = { ...prefs, necessary: true };
    setPreferences(safePrefs);
    setStatus('decided');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safePrefs));
    window.dispatchEvent(new CustomEvent('cookie-consent-changed', { detail: safePrefs }));
  }, []);

  const acceptAll = useCallback(() => {
    savePreferences({ necessary: true, analytics: true, marketing: true });
  }, [savePreferences]);

  const declineAll = useCallback(() => {
    savePreferences({ necessary: true, analytics: false, marketing: false });
  }, [savePreferences]);

  const updatePreferences = useCallback((partial: Partial<CookiePreferences>) => {
    savePreferences({ ...preferences, ...partial });
  }, [preferences, savePreferences]);

  const resetConsent = useCallback(() => {
    setStatus('undecided');
    setPreferences(DEFAULT_PREFERENCES);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const reopenConsent = useCallback(() => {
    setStatus('undecided');
  }, []);

  return {
    status,
    preferences,
    isUndecided: status === 'undecided',
    acceptAll,
    declineAll,
    updatePreferences,
    savePreferences,
    resetConsent,
    reopenConsent,
  };
}
