import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import DevZonePage from './pages/DevZonePage';
import NotFoundPage from './pages/NotFoundPage';
import { AppContextProvider } from './contexts/AppContext';
import { I18nProvider } from './i18n';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * App shell rendered inside the router. The Dev Zone is a full-screen,
 * self-contained whiteboard, so the global navigation and footer are hidden
 * there to give the canvas the entire viewport.
 */
function AppShell() {
  const { pathname } = useLocation();
  const isDevZone = pathname === '/dev-zone';

  return (
    <div className="bg-cream-50 min-h-screen text-dark-900 font-sans selection:bg-coral-500 selection:text-white">
      {!isDevZone && <Navigation />}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dev-zone" element={<DevZonePage />} />

        {/* 404 catch-all route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {!isDevZone && <Footer />}
    </div>
  );
}

export default function Router() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AppContextProvider>
          <BrowserRouter>
            <AppShell />
          </BrowserRouter>
        </AppContextProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}
