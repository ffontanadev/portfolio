import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { usePublishedPosts } from '../hooks/useBlog';
import { Clock, Calendar, ArrowRight } from 'lucide-react';

const BlogCTA = () => {
  const { data, isLoading } = usePublishedPosts(1, 1);
  const latestPost = data?.posts[0];

  return (
    <section className="py-20 bg-cream-100 px-6 md:px-20">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Left Column - Latest Blog Post Card */}
          {!isLoading && latestPost ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Link
                to={`/blog/${latestPost.slug}`}
                className="block bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group h-full"
              >
                {latestPost.featured_image_url && (
                  <div className="w-full h-48 mb-4 overflow-hidden rounded-lg">
                    <img
                      src={latestPost.featured_image_url}
                      alt={latestPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                <div className="mb-3">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Latest Post</span>
                </div>

                <h3 className="text-2xl font-bold text-dark-900 mb-3 group-hover:text-coral-500 transition-colors">
                  {latestPost.title}
                </h3>

                {latestPost.excerpt && (
                  <p className="text-dark-700 leading-relaxed mb-4 line-clamp-3">
                    {latestPost.excerpt}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm text-dark-600 mb-4">
                  {latestPost.published_at && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(latestPost.published_at), 'MMM d, yyyy')}
                    </span>
                  )}
                  {latestPost.reading_time_minutes && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {latestPost.reading_time_minutes} min read
                    </span>
                  )}
                </div>

                <span className="inline-flex items-center text-coral-500 group-hover:text-coral-600 font-medium transition-colors">
                  Read more <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </motion.div>
          ) : isLoading ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl p-6 shadow-sm h-full animate-pulse"
            >
              <div className="w-full h-48 mb-4 bg-gray-200 rounded-lg" />
              <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 rounded w-5/6 mb-4" />
              <div className="flex gap-4">
                <div className="h-4 bg-gray-200 rounded w-24" />
                <div className="h-4 bg-gray-200 rounded w-20" />
              </div>
            </motion.div>
          ) : null}

          {/* Right Column - Blog Invitation */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col justify-center"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-dark-900 mb-6">
              More insights on the blog
            </h2>
            <p className="text-lg text-dark-600 mb-8 leading-relaxed">
              Dive into articles about web development, design patterns, and the creative process behind building modern digital experiences.
            </p>
            <div>
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 bg-dark-900 text-white px-8 py-4 rounded-full font-bold hover:bg-coral-500 transition-colors group"
              >
                Visit Blog
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BlogCTA;
