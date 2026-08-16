import { BrowserRouter, Navigate, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCallback, lazy, Suspense } from 'react';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import LocaleHead from './components/LocaleHead';
import { AppContextProvider } from './contexts/AppContext';
import { I18nProvider } from './i18n';
import { DEFAULT_LOCALE, STORAGE_KEY, type Locale } from './i18n/config';
import { buildLocalePath, negotiateLocale, parseLocalePath } from './i18n/routing';

// The Dev Zone is a self-contained whiteboard that most visitors never open,
// and it drags in the document renderers. A static import put all of it in the
// home page's critical path; as a route-level chunk it costs nothing until
// someone navigates to /:locale/dev-zone.
const DevZonePage = lazy(() => import('./pages/DevZonePage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Anything without a locale segment lands here: bare `/`, and the pre-P1
 * `/dev-zone` URL. Both keep whatever followed the locale slot, so an old
 * bookmark to `/dev-zone` still opens the Dev Zone — in the visitor's
 * language rather than in Spanish.
 */
function LocaleRedirect() {
  const { pathname } = useLocation();
  const { rest } = parseLocalePath(pathname);
  const stored = typeof window === 'undefined' ? null : window.localStorage.getItem(STORAGE_KEY);
  const browser = typeof navigator === 'undefined' ? [] : [...navigator.languages];
  const target = buildLocalePath(negotiateLocale(stored ? [stored, ...browser] : browser), rest);
  return <Navigate to={target} replace />;
}

/**
 * App shell rendered inside the router. The locale comes from the pathname
 * rather than from a `:locale` route param, because `Navigation` and `Footer`
 * render *outside* `<Routes>` — reading it from `useParams` would leave them
 * without an i18n context and every `t()` call in them would throw.
 *
 * `DEFAULT_LOCALE` covers the single frame during which the redirect and 404
 * routes render, where the path carries no locale at all.
 *
 * `AppContextProvider` nests *inside* `I18nProvider` because it translates the
 * résumé modal's title — it is route-independent but not locale-independent.
 * It stays inside `AppShell`, which never remounts on a client navigation, so
 * the modal's open state survives a language switch exactly as it did before.
 *
 * The Dev Zone is a full-screen, self-contained whiteboard, so the global
 * navigation and footer are hidden there to give the canvas the entire
 * viewport.
 */
function AppShell() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { locale, rest } = parseLocalePath(pathname);
  const isDevZone = rest === '/dev-zone';

  /**
   * `/:locale` is a dynamic segment and would otherwise match `/fr` or
   * `/nonsense` and render an English home page at a URL that should 404.
   * Static routes outrank dynamic ones in react-router, so `/dev-zone` and
   * `/` never reach here.
   */
  const firstSegment = pathname.split('/')[1] ?? '';
  const isUnknownLocale = locale === null && firstSegment !== '';

  const onLocaleChange = useCallback(
    (next: Locale) => navigate(buildLocalePath(next, rest)),
    [navigate, rest],
  );

  return (
    <I18nProvider locale={locale ?? DEFAULT_LOCALE} onLocaleChange={onLocaleChange}>
      <LocaleHead />
      <AppContextProvider>
        <div className="bg-cream-50 min-h-screen text-dark-900 font-sans selection:bg-coral-500 selection:text-white">
          {!isDevZone && <Navigation />}

          <Suspense fallback={null}>
            <Routes>
              <Route path="/:locale" element={isUnknownLocale ? <NotFoundPage /> : <HomePage />} />
              <Route
                path="/:locale/dev-zone"
                element={isUnknownLocale ? <NotFoundPage /> : <DevZonePage />}
              />

              <Route path="/" element={<LocaleRedirect />} />
              <Route path="/dev-zone" element={<LocaleRedirect />} />

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>

          {!isDevZone && <Footer />}
        </div>
      </AppContextProvider>
    </I18nProvider>
  );
}

export default function Router() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
