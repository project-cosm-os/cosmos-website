import React from 'react';
import { Link } from 'react-router';
import { Clock, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

import type { BlogPost } from '../../content/blogPosts';
import { useAnalytics } from '../../providers/AnalyticsProvider';

interface BlogCardProps {
  post: BlogPost;
}

const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
  const { trackEvent } = useAnalytics();

  return (
  <Link
    to={`/blog/${post.slug}`}
    onClick={() => trackEvent('blog_card_click', {
      blog_title: post.title,
      blog_slug: post.slug,
      blog_tags: post.tags,
    })}
    className="group flex flex-col h-full bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6 hover:border-[var(--primary)] transition-all no-underline"
  >
    <div className="flex flex-wrap gap-2 mb-3">
      {post.tags.slice(0, 3).map((tag) => (
        <span
          key={tag}
          className="text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--primary-glow)] text-[var(--primary)]"
        >
          {tag}
        </span>
      ))}
    </div>

    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2 group-hover:text-[var(--primary)] transition-colors">
      {post.title}
    </h3>

    <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4 line-clamp-3 flex-1">
      {post.description}
    </p>

    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
        <span>{format(new Date(post.date), 'MMM d, yyyy')}</span>
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {post.readingTime} min read
        </span>
      </div>
      <ArrowRight size={16} className="text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors" />
    </div>
  </Link>
  );
};

export default BlogCard;
