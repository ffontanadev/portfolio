import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
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

export default function Router() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AppContextProvider>
          <BrowserRouter>
            <div className="bg-cream-50 min-h-screen text-dark-900 font-sans selection:bg-coral-500 selection:text-white">
              <Navigation />

              <Routes>
                <Route path="/" element={<HomePage />} />

                {/* 404 catch-all route */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>

              <Footer />

            </div>
          </BrowserRouter>
        </AppContextProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}
