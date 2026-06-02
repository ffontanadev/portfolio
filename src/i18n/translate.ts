/** Variables interpolated into a translation string via `{name}` placeholders. */
export type TranslateVars = Record<string, string | number>;

/** Replaces `{name}` placeholders in a template with the provided values. */
export const interpolate = (template: string, vars?: TranslateVars): string => {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
};

/**
 * Resolves a dot-separated `path` (e.g. `"contact.headline"`) against a nested
 * messages object and interpolates any `{name}` placeholders. Falls back to the
 * raw path when the key is missing so a typo surfaces visibly instead of
 * crashing the UI.
 */
export const translate = (
  source: Record<string, unknown>,
  path: string,
  vars?: TranslateVars,
): string => {
  const value = path
    .split('.')
    .reduce<unknown>((acc, key) => (acc != null && typeof acc === 'object' ? (acc as Record<string, unknown>)[key] : undefined), source);

  if (typeof value !== 'string') {
    if (import.meta.env.DEV) {
      console.warn(`[i18n] Missing or non-string translation for key: "${path}"`);
    }
    return path;
  }

  return interpolate(value, vars);
};
