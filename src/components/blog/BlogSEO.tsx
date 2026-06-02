import type { BlogPost } from '../../types/blog';
import { useTranslation } from '@/i18n';

interface BlogSEOProps {
  post: BlogPost;
  isList?: boolean;
}

export default function BlogSEO({ post, isList = false }: BlogSEOProps) {
  const { t } = useTranslation();
  const siteUrl = window.location.origin;
  const postUrl = `${siteUrl}/blog/${post.slug}`;
  const title = isList ? t('seo.blogTitle') : post.title;
  const description = post.meta_description || post.excerpt || post.title;
  const keywords = post.meta_keywords?.join(', ') || post.tags?.join(', ') || '';

  return (
    <>
      <title>{title} | {t('seo.siteSuffix')}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}

      {post.author && <meta name="author" content={post.author} />}

      {post.published_at && (
        <meta property="article:published_time" content={post.published_at} />
      )}
      {post.updated_at && (
        <meta property="article:modified_time" content={post.updated_at} />
      )}

      {post.tags?.map((tag) => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={postUrl} />
      {post.featured_image_url && (
        <meta property="og:image" content={post.featured_image_url} />
      )}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {post.featured_image_url && (
        <meta name="twitter:image" content={post.featured_image_url} />
      )}

      <link rel="canonical" href={postUrl} />

      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: description,
          author: {
            '@type': 'Person',
            name: post.author,
          },
          datePublished: post.published_at,
          dateModified: post.updated_at,
          image: post.featured_image_url,
          url: postUrl,
          keywords: keywords,
        })}
      </script>
    </>
  );
}

interface BlogListSEOProps {
  pageTitle?: string;
  pageDescription?: string;
}

export function BlogListSEO({
  pageTitle,
  pageDescription,
}: BlogListSEOProps) {
  const { t } = useTranslation();
  const siteUrl = window.location.origin;
  const blogUrl = `${siteUrl}/blog`;
  const resolvedTitle = pageTitle ?? t('seo.blogTitle');
  const resolvedDescription = pageDescription ?? t('seo.blogDescription');

  return (
    <>
      <title>{resolvedTitle} | {t('seo.siteSuffix')}</title>
      <meta name="description" content={resolvedDescription} />

      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={resolvedDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={blogUrl} />

      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={resolvedTitle} />
      <meta name="twitter:description" content={resolvedDescription} />

      <link rel="canonical" href={blogUrl} />
    </>
  );
}
