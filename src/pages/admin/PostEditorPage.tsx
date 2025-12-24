import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePostById, useCreatePost, useUpdatePost } from '../../hooks/useBlog';
import MarkdownRenderer from '../../components/blog/MarkdownRenderer';
import { ArrowLeft, Save, Eye, EyeOff, Loader } from 'lucide-react';
import type { CreateBlogPostInput } from '../../types/blog';

export default function PostEditorPage() {
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
      setError('Title, slug, content, and author are required');
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
      setError(err instanceof Error ? err.message : 'Failed to save post');
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
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 px-4 py-2 bg-cream-100 text-dark-700 rounded-lg hover:bg-cream-200 transition-colors"
              >
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showPreview ? 'Edit' : 'Preview'}
              </button>
              <button
                onClick={(e) => handleSubmit(e, false)}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-cream-300 text-dark-700 rounded-lg hover:bg-cream-50 disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Draft
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
                {status === 'published' ? 'Update & Publish' : 'Save & Publish'}
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
            <h1 className="text-4xl font-bold text-dark-900 mb-6">{title || 'Untitled Post'}</h1>
            {excerpt && <p className="text-xl text-dark-600 mb-8">{excerpt}</p>}
            <MarkdownRenderer content={content || '*No content yet*'} />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              <h2 className="text-xl font-bold text-dark-900">Basic Information</h2>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-dark-700 mb-2">
                  Title *
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500 outline-none"
                  placeholder="Enter post title"
                  required
                />
              </div>

              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-dark-700 mb-2">
                  Slug * <span className="text-dark-500 font-normal">(URL-friendly identifier)</span>
                </label>
                <input
                  id="slug"
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500 outline-none font-mono text-sm"
                  placeholder="post-url-slug"
                  required
                />
              </div>

              <div>
                <label htmlFor="author" className="block text-sm font-medium text-dark-700 mb-2">
                  Author *
                </label>
                <input
                  id="author"
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500 outline-none"
                  placeholder="Author name"
                  required
                />
              </div>

              <div>
                <label htmlFor="excerpt" className="block text-sm font-medium text-dark-700 mb-2">
                  Excerpt <span className="text-dark-500 font-normal">(Short summary)</span>
                </label>
                <textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500 outline-none resize-none"
                  placeholder="Brief description of the post"
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-dark-700 mb-2">
                  Content * <span className="text-dark-500 font-normal">(Markdown supported)</span>
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={20}
                  className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500 outline-none font-mono text-sm resize-none"
                  placeholder="Write your post content in Markdown..."
                  required
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              <h2 className="text-xl font-bold text-dark-900">Additional Information</h2>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-dark-700 mb-2">
                  Tags <span className="text-dark-500 font-normal">(Comma-separated)</span>
                </label>
                <input
                  id="tags"
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500 outline-none"
                  placeholder="react, typescript, web development"
                />
              </div>

              <div>
                <label htmlFor="featuredImage" className="block text-sm font-medium text-dark-700 mb-2">
                  Featured Image URL
                </label>
                <input
                  id="featuredImage"
                  type="url"
                  value={featuredImageUrl}
                  onChange={(e) => setFeaturedImageUrl(e.target.value)}
                  className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500 outline-none"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label htmlFor="metaDescription" className="block text-sm font-medium text-dark-700 mb-2">
                  Meta Description <span className="text-dark-500 font-normal">(SEO)</span>
                </label>
                <textarea
                  id="metaDescription"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500 outline-none resize-none"
                  placeholder="SEO description for search engines"
                />
              </div>

              <div>
                <label htmlFor="metaKeywords" className="block text-sm font-medium text-dark-700 mb-2">
                  Meta Keywords <span className="text-dark-500 font-normal">(SEO, comma-separated)</span>
                </label>
                <input
                  id="metaKeywords"
                  type="text"
                  value={metaKeywords}
                  onChange={(e) => setMetaKeywords(e.target.value)}
                  className="w-full px-4 py-3 border border-cream-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500 outline-none"
                  placeholder="web development, programming, tutorial"
                />
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
