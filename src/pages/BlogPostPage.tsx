import { useParams, Link, Navigate } from 'react-router-dom';
import { format } from 'date-fns';
import { usePostBySlug } from '../hooks/useBlog';
import BlogSEO from '../components/blog/BlogSEO';
import MarkdownRenderer from '../components/blog/MarkdownRenderer';
import BlogPostLoader from '../components/blog/BlogPostLoader';
import { Calendar, Clock, Tag, ArrowLeft } from 'lucide-react';
import { useTranslation } from '@/i18n';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = usePostBySlug(slug || '');
  const { t } = useTranslation();

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-dark-900 mb-2">{t('blog.post.errorTitle')}</h1>
          <p className="text-dark-600 mb-4">
            {error instanceof Error ? error.message : t('common.errorOccurred')}
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-coral-500 hover:text-coral-600"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('blog.post.backToBlog')}
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <BlogPostLoader />;
  }

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  if (post.status !== 'published') {
    return <Navigate to="/blog" replace />;
  }

  return (
    <>
      <BlogSEO post={post} />
      <article className="max-w-4xl mx-auto px-6 py-20">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-coral-500 hover:text-coral-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('blog.post.backToBlog')}
        </Link>

        <header className="mb-12">
          {post.featured_image_url && (
            <img
              src={post.featured_image_url}
              alt={post.title}
              className="w-full h-96 object-cover rounded-lg mb-8"
            />
          )}

          <h1 className="text-5xl font-bold text-dark-900 mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-dark-600 mb-6">
            <span className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {post.published_at && format(new Date(post.published_at), 'MMMM d, yyyy')}
            </span>
            {post.reading_time_minutes && (
              <span className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {t('blog.common.readingTime', { minutes: post.reading_time_minutes })}
              </span>
            )}
            <span className="text-dark-700 font-medium">{t('blog.common.byAuthor', { author: post.author })}</span>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <Tag className="w-5 h-5 text-dark-500" />
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-cream-100 text-dark-700 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <MarkdownRenderer content={post.content} className="mb-12" />

        <footer className="border-t border-cream-200 pt-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-coral-500 hover:text-coral-600 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('blog.post.backToAllPosts')}
          </Link>
        </footer>
      </article>
    </>
  );
}
