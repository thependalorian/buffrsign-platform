/**
 * BuffrSign Button Component
 * Implements the comprehensive design system with all button variants
 * Location: components/ui/Button.tsx
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  // Base styles
  "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        // Primary button - Brand blue
        primary: "bg-brand-blue-600 text-white hover:bg-brand-blue-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 shadow-md",
        
        // Secondary button - Outlined
        secondary: "bg-transparent border-2 border-brand-blue-600 text-brand-blue-600 hover:bg-brand-blue-50 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0",
        
        // Ghost button - Minimal
        ghost: "bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100",
        
        // Success button
        success: "bg-success text-white hover:bg-success/90 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 shadow-md",
        
        // Warning button
        warning: "bg-warning text-white hover:bg-warning/90 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 shadow-md",
        
        // Error button
        error: "bg-error text-white hover:bg-error/90 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 shadow-md",
        
        // Namibian accent button
        namibian: "bg-gradient-to-r from-namibian-gold-500 to-namibian-gold-600 text-white hover:from-namibian-gold-600 hover:to-namibian-gold-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 shadow-md",
        
        // Desert accent button
        desert: "bg-gradient-to-r from-desert-sand to-namibian-gold-300 text-white hover:from-namibian-gold-400 hover:to-namibian-gold-500 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 shadow-md",
      },
      size: {
        xs: "h-8 px-3 text-xs rounded-md",
        sm: "h-9 px-4 text-sm rounded-md",
        md: "h-10 px-6 py-2 text-sm rounded-md",
        lg: "h-12 px-8 py-3 text-base rounded-md",
        xl: "h-14 px-10 py-4 text-lg rounded-lg",
      },
      fullWidth: {
        true: "w-full",
        false: "w-auto",
      },
      loading: {
        true: "opacity-75 cursor-not-allowed",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
      loading: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth, 
    loading, 
    leftIcon, 
    rightIcon, 
    children, 
    disabled,
    ...props 
  }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, loading, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && leftIcon && leftIcon}
        {children}
        {!loading && rightIcon && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
