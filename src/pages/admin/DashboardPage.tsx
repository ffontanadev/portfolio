import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAllPosts, useDeletePost, usePublishPost, useUnpublishPost } from '../../hooks/useBlog';
import { useAuth } from '../../contexts/AuthContext';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  LogOut,
  Clock,
  Calendar,
  FileText,
} from 'lucide-react';
import { useTranslation } from '@/i18n';

export default function DashboardPage() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');
  const limit = 20;

  const { data, isLoading, error } = useAllPosts(page, limit, {
    status: statusFilter === 'all' ? undefined : statusFilter,
  });
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const deleteMutation = useDeletePost();
  const publishMutation = usePublishPost();
  const unpublishMutation = useUnpublishPost();

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(t('admin.dashboard.deleteConfirm', { title }))) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: string) => {
    if (currentStatus === 'published') {
      await unpublishMutation.mutateAsync(id);
    } else {
      await publishMutation.mutateAsync(id);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-dark-900 mb-2">{t('admin.dashboard.errorTitle')}</h1>
          <p className="text-dark-600">
            {error instanceof Error ? error.message : t('common.errorOccurred')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 mt-20">
      <header className="bg-white border-b border-cream-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-dark-900">{t('admin.dashboard.title')}</h1>
              <p className="text-sm text-dark-600">{t('admin.dashboard.welcome', { email: user?.email ?? '' })}</p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="text-dark-600 hover:text-dark-900 transition-colors"
              >
                {t('admin.dashboard.viewSite')}
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-dark-700 hover:text-dark-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {t('admin.dashboard.signOut')}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${statusFilter === 'all'
                ? 'bg-coral-500 text-white'
                : 'bg-white text-dark-700 hover:bg-cream-100'
                }`}
            >
              {t('admin.dashboard.allPosts')}
            </button>
            <button
              onClick={() => setStatusFilter('published')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${statusFilter === 'published'
                ? 'bg-coral-500 text-white'
                : 'bg-white text-dark-700 hover:bg-cream-100'
                }`}
            >
              {t('admin.dashboard.published')}
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${statusFilter === 'draft'
                ? 'bg-coral-500 text-white'
                : 'bg-white text-dark-700 hover:bg-cream-100'
                }`}
            >
              {t('admin.dashboard.drafts')}
            </button>
          </div>

          <Link
            to="/admin/posts/new"
            className="flex items-center gap-2 px-6 py-3 bg-coral-500 text-white rounded-lg font-medium hover:bg-coral-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            {t('admin.dashboard.newPost')}
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
                <div className="h-6 bg-cream-200 rounded w-1/2 mb-3"></div>
                <div className="h-4 bg-cream-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : data && data.posts.length > 0 ? (
          <>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-cream-100 border-b border-cream-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-dark-900">
                      {t('admin.dashboard.table.title')}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-dark-900">
                      {t('admin.dashboard.table.status')}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-dark-900">
                      {t('admin.dashboard.table.published')}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-dark-900">
                      {t('admin.dashboard.table.created')}
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-dark-900">
                      {t('admin.dashboard.table.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-200">
                  {data.posts.map((post) => (
                    <tr key={post.id} className="hover:bg-cream-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-dark-400 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-dark-900">{post.title}</p>
                            {post.excerpt && (
                              <p className="text-sm text-dark-600 line-clamp-1">
                                {post.excerpt}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${post.published_at
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                            }`}
                        >
                          {post.published_at ? t('admin.dashboard.statusPublished') : t('admin.dashboard.statusDraft')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-dark-600">
                        {post.published_at ? (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(post.published_at), 'MMM d, yyyy')}
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-dark-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {format(new Date(post.created_at), 'MMM d, yyyy')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/posts/${post.id}`}
                            className="p-2 text-dark-600 hover:text-coral-500 hover:bg-cream-100 rounded-lg transition-colors"
                            title={t('admin.dashboard.editTitle')}
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleTogglePublish(post.id, post.published_at ? 'published' : 'draft')}
                            className="p-2 text-dark-600 hover:text-coral-500 hover:bg-cream-100 rounded-lg transition-colors"
                            title={post.published_at ? t('admin.dashboard.unpublishTitle') : t('admin.dashboard.publishTitle')}
                            disabled={publishMutation.isPending || unpublishMutation.isPending}
                          >
                            {post.published_at ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(post.id, post.title)}
                            className="p-2 text-dark-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title={t('admin.dashboard.deleteTitle')}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white text-dark-900 rounded-lg hover:bg-cream-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {t('common.pagination.previous')}
                </button>
                <span className="text-dark-600">
                  {t('common.pagination.pageOf', { page, total: data.totalPages })}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  disabled={page === data.totalPages}
                  className="px-4 py-2 bg-white text-dark-900 rounded-lg hover:bg-cream-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {t('common.pagination.next')}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <FileText className="w-16 h-16 text-dark-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-dark-900 mb-2">{t('admin.dashboard.emptyTitle')}</h3>
            <p className="text-dark-600 mb-6">{t('admin.dashboard.emptyMessage')}</p>
            <Link
              to="/admin/posts/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-coral-500 text-white rounded-lg font-medium hover:bg-coral-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              {t('admin.dashboard.createFirst')}
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
