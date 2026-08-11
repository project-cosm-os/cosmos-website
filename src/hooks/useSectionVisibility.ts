import { useEffect, useRef } from 'react';
import { useAnalytics } from '../providers/AnalyticsProvider';

export function useSectionVisibility(
  sectionName: string,
  properties?: Record<string, unknown>,
) {
  const { trackEvent } = useAnalytics();
  const ref = useRef<HTMLElement>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    firedRef.current = false;
  }, [sectionName]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !firedRef.current) {
          firedRef.current = true;
          trackEvent('section_viewed', {
            section: sectionName,
            ...properties,
          });
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [sectionName, properties, trackEvent]);

  return ref;
}
