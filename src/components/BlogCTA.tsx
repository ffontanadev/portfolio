import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { usePublishedPosts } from '../hooks/useBlog';
import { Clock, Calendar, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/i18n';

const ease = [0.22, 1, 0.36, 1] as const;

const BlogCTA = () => {
  const { data, isLoading } = usePublishedPosts(1, 1);
  const latestPost = data?.posts[0];
  const { t } = useTranslation();

  return (
    <section className="relative py-28 md:py-36 bg-cream-100 px-6 md:px-20 overflow-hidden">
      {/* Ambient blobs */}
      <div
        aria-hidden="true"
        className="absolute -top-20 -right-20 w-[28rem] h-[28rem] bg-coral-500/8 rounded-full blur-3xl pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-32 -left-16 w-[24rem] h-[24rem] bg-purple-500/6 rounded-full blur-3xl pointer-events-none"
      />

      <div className="max-w-[1440px] mx-auto relative">
        <div className="flex items-center gap-4 mb-16">
          <span className="text-eyebrow text-coral-500">{t('blogCta.eyebrow')}</span>
          <span className="h-px flex-1 max-w-[160px] bg-dark-900/15" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
          {/* Left Column - Latest Post */}
          {!isLoading && latestPost ? (
            <motion.div
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.9, ease }}
            >
              <Link
                to={`/blog/${latestPost.slug}`}
                className="group block glass-card rounded-3xl p-7 soft-lift transition-colors duration-500"
              >
                {latestPost.featured_image_url && (
                  <div className="w-full h-56 mb-6 overflow-hidden rounded-2xl">
                    <motion.img
                      src={latestPost.featured_image_url}
                      alt={latestPost.title}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.04 }}
                      transition={{ duration: 1.2, ease }}
                    />
                  </div>
                )}

                <span className="text-eyebrow text-coral-500">{t('blogCta.latestPost')}</span>

                <h3 className="mt-3 text-2xl md:text-[1.75rem] font-display font-bold tracking-[-0.01em] leading-tight text-dark-900 group-hover:text-coral-500 transition-colors duration-500">
                  {latestPost.title}
                </h3>

                {latestPost.excerpt && (
                  <p className="mt-4 text-dark-900/65 font-light leading-relaxed line-clamp-3">
                    {latestPost.excerpt}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap items-center gap-4 font-mono text-[10px] uppercase tracking-widest text-dark-900/50">
                  {latestPost.published_at && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {format(new Date(latestPost.published_at), 'MMM d, yyyy')}
                    </span>
                  )}
                  {latestPost.reading_time_minutes && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {latestPost.reading_time_minutes} min
                    </span>
                  )}
                </div>

                <span className="mt-6 inline-flex items-center gap-2 text-coral-500 font-medium">
                  <span className="reveal-underline">{t('blogCta.readThePost')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-500" />
                </span>
              </Link>
            </motion.div>
          ) : isLoading ? (
            <motion.div
              initial={{ opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="glass-card rounded-3xl p-7 h-full"
            >
              <div className="w-full h-56 mb-6 bg-dark-900/5 rounded-2xl animate-pulse" />
              <div className="h-3 w-24 bg-dark-900/10 rounded mb-4 animate-pulse" />
              <div className="h-7 w-3/4 bg-dark-900/10 rounded mb-3 animate-pulse" />
              <div className="h-4 w-full bg-dark-900/8 rounded mb-2 animate-pulse" />
              <div className="h-4 w-5/6 bg-dark-900/8 rounded animate-pulse" />
            </motion.div>
          ) : null}

          {/* Right Column - Invitation */}
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, ease, delay: 0.15 }}
            className="flex flex-col justify-center md:pt-12"
          >
            <h2 className="font-display font-display-md font-bold text-4xl md:text-5xl tracking-[-0.02em] leading-[1.05] text-dark-900">
              {t('blogCta.headingBefore')}{' '}
              <span className="font-display-italic text-coral-500" style={{ fontStyle: 'italic' }}>
                {t('blogCta.headingEmphasis')}
              </span>
              <br />
              {t('blogCta.headingAfter')}
            </h2>
            <p className="mt-6 max-w-md text-lg text-dark-900/60 font-light leading-relaxed">
              {t('blogCta.description')}
            </p>
            <div className="mt-10">
              <Link
                to="/blog"
                className="group relative inline-flex items-center gap-3 overflow-hidden bg-dark-900 text-cream-50 px-8 py-4 rounded-full font-medium"
              >
                <span className="relative z-10">{t('blogCta.visitJournal')}</span>
                <ArrowRight className="relative z-10 w-4 h-4 group-hover:translate-x-1 transition-transform duration-500" />
                <span className="absolute inset-0 bg-coral-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BlogCTA;
