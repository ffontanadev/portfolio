import { useTranslation } from '@/i18n';

/**
 * First focusable element on every route. The primary navigation is `fixed`
 * and precedes `<main>` in the DOM, so without this a keyboard or switch user
 * tabs through the whole nav - logo, five links, two GitHub links, the
 * language switcher - before reaching any content, on every page load.
 *
 * Invisible until focused: `sr-only` takes it out of the layout, `focus:`
 * puts it back. It has to stay in the tab order (never `display: none`), which
 * is exactly what `sr-only` does and `hidden` does not.
 *
 * `#main` is on the `<main>` of all three routes, each carrying `tabIndex={-1}`
 * so the jump moves focus rather than only scrolling the viewport.
 */
const SkipLink = () => {
    const { t } = useTranslation();

    return (
        <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-[100] focus:rounded-sm focus:bg-dark-900 focus:px-4 focus:py-3 focus:font-mono focus:text-sm focus:text-cream-50 focus:outline-solid focus:outline-2 focus:outline-offset-2 focus:outline-coral-700"
        >
            {t('nav.skipToContent')}
        </a>
    );
};

export default SkipLink;
