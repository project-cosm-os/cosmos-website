import React, { useRef, type ReactNode } from 'react';
import { useMouseGlow } from '../../hooks/useMouseGlow';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', hover = false, glow = false }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { handleMouseMove } = useMouseGlow(ref);

  if (glow) {
    return (
      <div
        ref={ref}
        onMouseMove={handleMouseMove}
        className={`glow-card p-6 ${className}`}
      >
        {children}
      </div>
    );
  }

  const hoverClass = hover
    ? 'hover:border-[var(--primary)] hover:shadow-[var(--shadow-glow)] hover:-translate-y-1'
    : '';

  return (
    <div
      className={`bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-6 transition-all duration-300 ${hoverClass} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
