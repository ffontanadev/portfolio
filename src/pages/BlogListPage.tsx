import { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { usePublishedPosts, useTags } from '../hooks/useBlog';
import { BlogListSEO } from '../components/blog/BlogSEO';
import BlogListLoader from '../components/blog/BlogListLoader';
import { ChevronLeft, ChevronRight, Clock, Calendar, Tag } from 'lucide-react';
import { useTranslation } from '@/i18n';

export default function BlogListPage() {
  const [page, setPage] = useState(1);
  const [selectedTag, setSelectedTag] = useState<string | undefined>();
  const limit = 10;
  const { t } = useTranslation();

  const { data, isLoading, error } = usePublishedPosts(page, limit, {
    tag: selectedTag,
  });

  const { data: tags } = useTags();

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-dark-900 mb-2">{t('blog.list.errorTitle')}</h1>
          <p className="text-dark-600">
            {error instanceof Error ? error.message : t('common.errorOccurred')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <BlogListSEO />
      <main className="max-w-5xl mx-auto px-6 py-16">
        <header className="mb-12">
          <h1 className="text-5xl font-bold text-dark-900 mb-4">{t('blog.list.title')}</h1>
          <p className="text-xl text-dark-600">
            {t('blog.list.subtitle')}
          </p>
        </header>

        {tags && tags.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTag(undefined)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!selectedTag
                ? 'bg-coral-500 text-white'
                : 'bg-cream-100 text-dark-700 hover:bg-cream-200'
                }`}
            >
              {t('blog.list.allPosts')}
            </button>
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedTag === tag
                  ? 'bg-coral-500 text-white'
                  : 'bg-cream-100 text-dark-700 hover:bg-cream-200'
                  }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <BlogListLoader count={3} />
        ) : data && data.posts.length > 0 ? (
          <>
            <div className="space-y-12">
              {data.posts.map((post) => (
                <article
                  key={post.id}
                  className="border-b border-cream-200 pb-8 last:border-0"
                >
                  <Link
                    to={`/blog/${post.slug}`}
                    className="group block hover:opacity-90 transition-opacity"
                  >
                    {post.featured_image_url && (
                      <img
                        src={post.featured_image_url}
                        alt={post.title}
                        className="w-full h-64 object-cover rounded-lg mb-6"
                      />
                    )}
                    <h2 className="text-3xl font-bold text-dark-900 mb-3 group-hover:text-coral-500 transition-colors">
                      {post.title}
                    </h2>
                  </Link>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-dark-600 mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {post.published_at &&
                        format(new Date(post.published_at), 'MMMM d, yyyy')}
                    </span>
                    {post.reading_time_minutes && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {t('blog.common.readingTime', { minutes: post.reading_time_minutes })}
                      </span>
                    )}
                    <span className="text-dark-500">{t('blog.common.byAuthor', { author: post.author })}</span>
                  </div>

                  {post.excerpt && (
                    <p className="text-dark-700 leading-relaxed mb-4">{post.excerpt}</p>
                  )}

                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <Tag className="w-4 h-4 text-dark-500" />
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-cream-100 text-dark-700 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <Link
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center text-coral-500 hover:text-coral-600 font-medium transition-colors"
                  >
                    {t('blog.list.readMore')}
                  </Link>
                </article>
              ))}
            </div>

            {data.totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg bg-cream-100 text-dark-900 hover:bg-cream-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {t('common.pagination.previous')}
                </button>

                <span className="text-dark-600">
                  {t('common.pagination.pageOf', { page, total: data.totalPages })}
                </span>

                <button
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  disabled={page === data.totalPages}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg bg-cream-100 text-dark-900 hover:bg-cream-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {t('common.pagination.next')}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 h-[650px]">
            <p className="text-xl text-dark-600">{t('blog.list.empty')}</p>
            {selectedTag && (
              <button
                onClick={() => setSelectedTag(undefined)}
                className="mt-4 text-coral-500 hover:text-coral-600 underline"
              >
                {t('blog.list.clearFilter')}
              </button>
            )}
          </div>
        )}
      </main>
    </>
  );
}
