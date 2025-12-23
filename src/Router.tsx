import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';
import HomePage from './pages/HomePage';
import BlogListPage from './pages/BlogListPage';
import BlogPostPage from './pages/BlogPostPage';
import LoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import PostEditorPage from './pages/admin/PostEditorPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AppContextProvider } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';

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
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppContextProvider>
            <BrowserRouter>
              <div className="bg-cream-50 min-h-screen text-dark-900 font-sans selection:bg-coral-500 selection:text-white">
                <Navigation />

                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/blog" element={<BlogListPage />} />
                  <Route path="/blog/:slug" element={<BlogPostPage />} />

                  <Route path="/admin/login" element={<LoginPage />} />
                  <Route
                    path="/admin/dashboard"
                    element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/posts/:id"
                    element={
                      <ProtectedRoute>
                        <PostEditorPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 catch-all route */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>

                <Footer />

                {/* AI Portfolio Assistant */}
                <ChatWidget />
              </div>
            </BrowserRouter>
          </AppContextProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
