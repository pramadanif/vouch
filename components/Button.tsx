import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'white';
  size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-semibold tracking-tight transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    // Solid Royal Blue - High Trust
    primary: "bg-brand-action text-white hover:bg-brand-actionHover shadow-sm hover:shadow-md border border-transparent",
    // Solid Slate - Understated
    secondary: "bg-brand-primary text-white hover:bg-slate-800 shadow-sm",
    // Outline - Clean
    outline: "bg-transparent text-brand-primary border border-brand-border hover:border-brand-primary hover:bg-gray-50",
    // White - Contrast
    white: "bg-white text-brand-primary hover:bg-gray-50 shadow-sm border border-brand-border"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-8 py-3.5 text-lg",
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