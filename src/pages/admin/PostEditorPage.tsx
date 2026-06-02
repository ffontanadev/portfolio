import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePostById, useCreatePost, useUpdatePost } from '../../hooks/useBlog';
import MarkdownRenderer from '../../components/blog/MarkdownRenderer';
import { ArrowLeft, Save, Eye, EyeOff, Loader } from 'lucide-react';
import type { CreateBlogPostInput } from '../../types/blog';
import { useTranslation } from '@/i18n';

export default function PostEditorPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNewPost = id === 'new';

  const { data: existingPost, isLoading: loadingPost } = usePostById(
    !isNewPost && id ? id : ''
  );
  const createMutation = useCreatePost();
  const updateMutation = useUpdatePost();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [author, setAuthor] = useState('');
  const [tags, setTags] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (existingPost) {
      setTitle(existingPost.title);
      setSlug(existingPost.slug);
      setContent(existingPost.content);
      setExcerpt(existingPost.excerpt || '');
      setAuthor(existingPost.author);
      setTags(existingPost.tags?.join(', ') || '');
      setMetaDescription(existingPost.meta_description || '');
      setMetaKeywords(existingPost.meta_keywords?.join(', ') || '');
      setFeaturedImageUrl(existingPost.featured_image_url || '');
      setStatus(existingPost.status);
    }
  }, [existingPost]);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (isNewPost && !slug) {
      setSlug(generateSlug(value));
    }
  };

  const handleSubmit = async (e: FormEvent, publishNow = false) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !slug.trim() || !content.trim() || !author.trim()) {
      setError(t('admin.editor.validationError'));
      return;
    }

    const postData: CreateBlogPostInput = {
      title: title.trim(),
      slug: slug.trim(),
      content: content.trim(),
      excerpt: excerpt.trim() || undefined,
      author: author.trim(),
      status: publishNow ? 'published' : status,
      published_at: publishNow ? new Date().toISOString() : undefined,
      tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
      meta_description: metaDescription.trim() || undefined,
      meta_keywords: metaKeywords
        ? metaKeywords.split(',').map((k) => k.trim()).filter(Boolean)
        : undefined,
      featured_image_url: featuredImageUrl.trim() || undefined,
    };

    try {
      if (isNewPost) {
        await createMutation.mutateAsync(postData);
      } else if (id) {
        await updateMutation.mutateAsync({ id, input: postData });
      }
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('admin.editor.saveError'));
    }
  };

  if (!isNewPost && loadingPost) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-coral-500" />
      </div>
    );
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="min-h-screen bg-cream-50">
      <header className="bg-white border-b border-cream-200 sticky mt-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/admin/dashboard"
              className="flex items-center gap-2 text-dark-600 hover:text-dark-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('admin.editor.backToDashboard')}
            </Link>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 px-4 py-2 bg-cream-100 text-dark-700 rounded-lg hover:bg-cream-200 transition-colors"
              >
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showPreview ? t('admin.editor.edit') : t('admin.editor.preview')}
              </button>
              <button
                onClick={(e) => handleSubmit(e, false)}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-cream-300 text-dark-700 rounded-lg hover:bg-cream-50 disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                {t('admin.editor.saveDraft')}
              </button>
              <button
                onClick={(e) => handleSubmit(e, true)}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2 bg-coral-500 text-white rounded-lg hover:bg-coral-600 disabled:opacity-50 transition-colors"
              >
                {isSaving ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {status === 'published' ? t('admin.editor.updatePublish') : t('admin.editor.savePublish')}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {showPreview ? (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-4xl font-bold text-dark-900 mb-6">{title || t('admin.editor.untitled')}</h1>
            {excerpt && <p className="text-xl text-dark-600 mb-8">{excerpt}</p>}
            <MarkdownRenderer content={content || t('admin.editor.noContent')} />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              <h2 className="text-xl font-bold text-dark-900">{t('admin.editor.basicInfo')}</h2>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-dark-700 mb-2">
                  {t('admin.editor.titleLabel')}
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500 outline-none"
                  placeholder={t('admin.editor.titlePlaceholder')}
                  required
                />
              </div>

              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-dark-700 mb-2">
                  {t('admin.editor.slugLabel')} <span className="text-dark-500 font-normal">{t('admin.editor.slugHint')}</span>
                </label>
                <input
                  id="slug"
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500 outline-none font-mono text-sm"
                  placeholder={t('admin.editor.slugPlaceholder')}
                  required
                />
              </div>

              <div>
                <label htmlFor="author" className="block text-sm font-medium text-dark-700 mb-2">
                  {t('admin.editor.authorLabel')}
                </label>
                <input
                  id="author"
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500 outline-none"
                  placeholder={t('admin.editor.authorPlaceholder')}
                  required
                />
              </div>

              <div>
                <label htmlFor="excerpt" className="block text-sm font-medium text-dark-700 mb-2">
                  {t('admin.editor.excerptLabel')} <span className="text-dark-500 font-normal">{t('admin.editor.excerptHint')}</span>
                </label>
                <textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500 outline-none resize-none"
                  placeholder={t('admin.editor.excerptPlaceholder')}
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-dark-700 mb-2">
                  {t('admin.editor.contentLabel')} <span className="text-dark-500 font-normal">{t('admin.editor.contentHint')}</span>
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={20}
                  className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500 outline-none font-mono text-sm resize-none"
                  placeholder={t('admin.editor.contentPlaceholder')}
                  required
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              <h2 className="text-xl font-bold text-dark-900">{t('admin.editor.additionalInfo')}</h2>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-dark-700 mb-2">
                  {t('admin.editor.tagsLabel')} <span className="text-dark-500 font-normal">{t('admin.editor.tagsHint')}</span>
                </label>
                <input
                  id="tags"
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500 outline-none"
                  placeholder={t('admin.editor.tagsPlaceholder')}
                />
              </div>

              <div>
                <label htmlFor="featuredImage" className="block text-sm font-medium text-dark-700 mb-2">
                  {t('admin.editor.featuredImageLabel')}
                </label>
                <input
                  id="featuredImage"
                  type="url"
                  value={featuredImageUrl}
                  onChange={(e) => setFeaturedImageUrl(e.target.value)}
                  className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500 outline-none"
                  placeholder={t('admin.editor.featuredImagePlaceholder')}
                />
              </div>

              <div>
                <label htmlFor="metaDescription" className="block text-sm font-medium text-dark-700 mb-2">
                  {t('admin.editor.metaDescriptionLabel')} <span className="text-dark-500 font-normal">{t('admin.editor.metaDescriptionHint')}</span>
                </label>
                <textarea
                  id="metaDescription"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500 outline-none resize-none"
                  placeholder={t('admin.editor.metaDescriptionPlaceholder')}
                />
              </div>

              <div>
                <label htmlFor="metaKeywords" className="block text-sm font-medium text-dark-700 mb-2">
                  {t('admin.editor.metaKeywordsLabel')} <span className="text-dark-500 font-normal">{t('admin.editor.metaKeywordsHint')}</span>
                </label>
                <input
                  id="metaKeywords"
                  type="text"
                  value={metaKeywords}
                  onChange={(e) => setMetaKeywords(e.target.value)}
                  className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500 outline-none"
                  placeholder={t('admin.editor.metaKeywordsPlaceholder')}
                />
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
