import React, { type ReactNode, type ButtonHTMLAttributes } from 'react';
import { Link } from 'react-router';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  external?: boolean;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {},
  secondary: {},
  ghost: {},
  outline: {},
};

const variantClassNames: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  outline: 'btn-outline',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-2.5 text-sm',
  lg: 'px-8 py-3 text-base',
};

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  href,
  external = false,
  children,
  className = '',
  style,
  ...props
}) => {
  const baseClass =
    'inline-flex items-center justify-center font-semibold rounded-[var(--radius-md)] cursor-pointer select-none no-underline';
  const combined = `${baseClass} ${variantClassNames[variant]} ${sizeStyles[size]} ${className}`;
  const mergedStyle = { ...variantStyles[variant], ...style };

  if (href && external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={combined} style={mergedStyle}>
        {children}
      </a>
    );
  }

  if (href) {
    return (
      <Link to={href} className={combined} style={mergedStyle}>
        {children}
      </Link>
    );
  }

  return (
    <button className={combined} style={mergedStyle} {...props}>
      {children}
    </button>
  );
};

export default Button;
