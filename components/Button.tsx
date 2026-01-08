import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'white' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyles = `
    inline-flex items-center justify-center font-semibold tracking-tight 
    transition-all duration-300 ease-smooth rounded-xl
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-action/50
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    active:scale-[0.98]
  `.replace(/\s+/g, ' ').trim();

  const variants = {
    // Primary - High impact with glow
    primary: `
      bg-gradient-to-r from-brand-action to-brand-primary text-white 
      shadow-button hover:shadow-button-hover 
      hover:-translate-y-0.5 
      border border-brand-action/20
    `.replace(/\s+/g, ' ').trim(),

    // Secondary - Solid and professional
    secondary: `
      bg-brand-primary text-white 
      shadow-sm hover:shadow-lg 
      hover:-translate-y-0.5
      border border-brand-primary/20
    `.replace(/\s+/g, ' ').trim(),

    // Outline - Clean and minimal
    outline: `
      bg-white/50 backdrop-blur-sm text-brand-primary 
      border-2 border-brand-border 
      hover:border-brand-action hover:bg-white hover:shadow-soft
    `.replace(/\s+/g, ' ').trim(),

    // White - For dark backgrounds
    white: `
      bg-white text-brand-primary 
      shadow-card hover:shadow-card-hover 
      hover:-translate-y-0.5
      border border-white/20
    `.replace(/\s+/g, ' ').trim(),

    // Ghost - Ultra minimal
    ghost: `
      bg-transparent text-brand-secondary 
      hover:text-brand-primary hover:bg-brand-surfaceHighlight
    `.replace(/\s+/g, ' ').trim(),
  };

  const sizes = {
    sm: "px-4 py-2 text-sm gap-1.5",
    md: "px-6 py-3 text-sm gap-2",
    lg: "px-8 py-4 text-base gap-2",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;