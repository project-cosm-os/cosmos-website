import React from 'react';
import { useTranslation } from 'react-i18next';

import SEO, { breadcrumbSchema } from '../components/shared/SEO';
import BlogCard from '../components/blog/BlogCard';
import GridBackground from '../components/shared/GridBackground';
import { getAllPosts } from '../content/blogPosts';

const Blog: React.FC = () => {
  const { t } = useTranslation();
  const posts = getAllPosts();

  return (
    <div className="relative overflow-hidden">
      <SEO
        title="Blog"
        description="Notes on marketplace settlements, GST and TCS, inventory costing, and what it takes to close the books for an Indian e-commerce business."
        path="/blog"
        jsonLd={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' },
        ])}
      />
      <GridBackground />

      <div className="relative py-24 md:py-32" style={{ zIndex: 1 }}>
        {/*
          The page header animates in CSS rather than through framer-motion.
          A motion `initial={{opacity:0}}` is written into the prerendered HTML
          as an inline style, so the h1 ships invisible and stays invisible
          until React hydrates. `.animate-in` is a keyframe on a class: it runs
          on first paint, needs no JS, and leaves nothing hidden in the markup.
        */}
        <div className="max-w-3xl mx-auto text-center px-6 mb-12 animate-in">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
            {t('blog.title')}
          </h1>
          <p className="text-lg text-[var(--text-secondary)]">{t('blog.subtitle')}</p>
        </div>

        <div className="max-w-4xl mx-auto px-6">
          {posts.length === 0 ? (
            <p className="text-center text-[var(--text-muted)]">{t('blog.noPosts')}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-fr">
              {posts.map((post, i) => (
                <div
                  key={post.slug}
                  className="h-full animate-in"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <BlogCard post={post} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Blog;
