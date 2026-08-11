import { useTranslation } from 'react-i18next';

/**
 * Reads an array out of the dictionary.
 *
 * Most copy on this site is a list of things: pillars have bullet points, the
 * flow has three columns of nodes, the FAQ has questions. i18next returns those
 * with `returnObjects: true`, typed as `unknown`, so every call site would
 * otherwise carry its own cast.
 *
 * The cast is unchecked, which is the honest trade: the dictionary is a JSON
 * file rather than a typed module, so the shape is asserted here and enforced
 * by `pnpm check:copy`, which fails when a key a component reads is missing.
 */
export function useList<T>(key: string): T[] {
  const { t } = useTranslation();
  const value = t(key, { returnObjects: true });
  return Array.isArray(value) ? (value as T[]) : [];
}
