import React, { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';

import SEO from '../components/shared/SEO';
import BlogRenderer from '../components/blog/BlogRenderer';
import GridBackground from '../components/shared/GridBackground';
import { BRAND } from '../config/brand-identity';
import { getPostBySlug } from '../content/blogPosts';
import { useAnalytics } from '../providers/AnalyticsProvider';
import { useScrollDepth } from '../hooks/useScrollDepth';
import { useTimeOnPage } from '../hooks/useTimeOnPage';

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const { trackEvent } = useAnalytics();
  const post = slug ? getPostBySlug(slug) : undefined;

  const blogProperties = useMemo(() => (post ? {
    blog_title: post.title,
    blog_slug: post.slug,
    blog_author: post.author,
    reading_time_min: post.readingTime,
  } : undefined), [post]);

  useScrollDepth(post?.slug ?? '', blogProperties);
  useTimeOnPage(post?.slug ?? '', blogProperties);

  useEffect(() => {
    if (post) {
      trackEvent('blog_post_viewed', {
        blog_title: post.title,
        blog_slug: post.slug,
        blog_author: post.author,
        blog_tags: post.tags,
        reading_time_min: post.readingTime,
      });
    }
  }, [post, trackEvent]);

  if (!post) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4">{t('blog.postNotFound')}</h1>
        <Link
          to="/blog"
          className="text-[var(--primary)] hover:underline flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          {t('blog.backToBlog')}
        </Link>
      </div>
    );
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: {
      '@type': 'Organization',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: BRAND.companyName,
      url: BRAND.websiteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${BRAND.websiteUrl}${BRAND.logos.icon}`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BRAND.websiteUrl}/blog/${post.slug}`,
    },
    keywords: post.tags.join(', '),
  };

  return (
    <div className="relative overflow-hidden">
      <SEO
        title={post.title}
        description={post.description}
        path={`/blog/${post.slug}`}
        type="article"
        jsonLd={articleSchema}
      />
      <GridBackground />

      <div className="relative py-24 md:py-32" style={{ zIndex: 1 }}>
        <div className="max-w-3xl mx-auto px-6">
          <div className="animate-in">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors mb-8 no-underline"
            >
              <ArrowLeft size={16} />
              {t('blog.backToBlog')}
            </Link>

            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--primary-glow)] text-[var(--primary)]"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--text-primary)] mb-4 leading-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-muted)] mb-10 pb-8 border-b border-[var(--border-light)]">
              <span className="font-medium text-[var(--text-secondary)]">{post.author}</span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                {format(new Date(post.date), 'MMMM d, yyyy')}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} />
                {post.readingTime} min read
              </span>
            </div>

            <BlogRenderer content={post.content} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
