import { useEffect } from 'react';
import { useTranslation } from '@/i18n';
import { buildLocalePath } from '@/i18n/routing';

const ORIGIN = 'https://ffontana.dev';

const setMeta = (selector: string, content: string) => {
  document.querySelector(`meta[${selector}]`)?.setAttribute('content', content);
};

/**
 * Syncs the parts of the `<head>` that depend on the active locale. The
 * `hreflang` block, the `og:*` tags and the twitter card are locale-invariant
 * and ship statically in `index.html`.
 *
 * Runtime patching alone is invisible to crawlers that do not run JavaScript,
 * which is exactly the failure §8 describes. `scripts/prerender.js` freezes the
 * result of this component into a static file per locale at build time; this
 * component is what keeps client-side navigation honest afterwards.
 */
const LocaleHead = () => {
  const { locale, messages } = useTranslation();

  useEffect(() => {
    document.title = messages.seo.title;
    setMeta('name="description"', messages.seo.description);
    setMeta('property="og:locale"', locale === 'en' ? 'en_US' : locale);
    setMeta('property="og:url"', `${ORIGIN}${buildLocalePath(locale)}`);
    document
      .querySelector('link[rel="canonical"]')
      ?.setAttribute('href', `${ORIGIN}${buildLocalePath(locale)}`);
  }, [locale, messages]);

  return null;
};

export default LocaleHead;
