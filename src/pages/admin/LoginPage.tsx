import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Lock, Mail, AlertCircle } from 'lucide-react';
import { useTranslation } from '@/i18n';

export default function LoginPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin/dashboard';

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        setError(error.message);
      } else {
        navigate(from, { replace: true });
      }
    } catch {
      setError(t('admin.login.unexpectedError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-50 to-cream-100 px-4">
      <div className="max-w-md w-full">
        <div className="bg-transparent rounded-2xl  p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-coral-100 rounded-full mb-4">
              <Lock className="w-8 h-8 text-coral-500" />
            </div>
            <h1 className="text-3xl font-bold text-dark-900 mb-2">{t('admin.login.title')}</h1>
            <p className="text-dark-600">{t('admin.login.subtitle')}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark-700 mb-2">
                {t('admin.login.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500 outline-none transition-all"
                  placeholder={t('admin.login.emailPlaceholder')}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark-700 mb-2">
                {t('admin.login.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500 outline-none transition-all"
                  placeholder={t('admin.login.passwordPlaceholder')}
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-coral-500 to-coral-500/80 text-white rounded-lg font-medium hover:bg-coral-600  focus:ring-4 hover:cursor-pointer focus:ring-coral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? t('admin.login.signingIn') : t('admin.login.signIn')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm text-dark-600 hover:text-coral-500 transition-colors"
            >
              {t('admin.login.backToHomepage')}
            </a>
          </div>
        </div>

        <p className="text-center text-sm text-dark-600 mt-6">
          {t('admin.login.protectedArea')}
        </p>
      </div>
    </div>
  );
}
