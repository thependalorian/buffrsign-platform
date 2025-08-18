/**
 * BuffrSign Input Component
 * Implements the comprehensive design system with all input variants
 * Location: components/ui/Input.tsx
 */

import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Search, Calendar, Phone, Mail, User, Lock } from 'lucide-react';

const inputVariants = cva(
  // Base styles
  "w-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default: "border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-brand-blue-500 focus:ring-brand-blue-100",
        error: "border-error bg-white text-gray-900 placeholder-gray-500 focus:border-error focus:ring-error/20",
        success: "border-success bg-white text-gray-900 placeholder-gray-500 focus:border-success focus:ring-success/20",
        warning: "border-warning bg-white text-gray-900 placeholder-gray-500 focus:border-warning focus:ring-warning/20",
        filled: "border-brand-blue-200 bg-brand-blue-50 text-gray-900 placeholder-gray-600 focus:border-brand-blue-500 focus:ring-brand-blue-100",
      },
      size: {
        sm: "h-8 px-3 text-sm rounded-md",
        md: "h-10 px-4 text-sm rounded-md",
        lg: "h-12 px-4 text-base rounded-lg",
        xl: "h-14 px-6 text-lg rounded-lg",
      },
      fullWidth: {
        true: "w-full",
        false: "w-auto",
      },
      hasIcon: {
        true: "pl-10",
        false: "",
      },
      hasRightIcon: {
        true: "pr-10",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      fullWidth: true,
      hasIcon: false,
      hasRightIcon: false,
    },
  }
);

const labelVariants = cva(
  // Base styles
  "block font-medium transition-colors duration-200",
  {
    variants: {
      variant: {
        default: "text-gray-700",
        error: "text-error",
        success: "text-success",
        warning: "text-warning",
      },
      size: {
        sm: "text-xs mb-1",
        md: "text-sm mb-2",
        lg: "text-base mb-2",
        xl: "text-lg mb-3",
      },
      required: {
        true: "after:content-['*'] after:ml-1 after:text-error",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      required: false,
    },
  }
);

const helperTextVariants = cva(
  // Base styles
  "text-sm transition-colors duration-200",
  {
    variants: {
      variant: {
        default: "text-gray-500",
        error: "text-error",
        success: "text-success",
        warning: "text-warning",
      },
      size: {
        sm: "text-xs mt-1",
        md: "text-sm mt-1",
        lg: "text-sm mt-2",
        xl: "text-base mt-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

const iconVariants = cva(
  // Base styles
  "absolute top-1/2 transform -translate-y-1/2 transition-colors duration-200",
  {
    variants: {
      variant: {
        default: "text-gray-400",
        error: "text-error",
        success: "text-success",
        warning: "text-warning",
      },
      size: {
        sm: "w-4 h-4",
        md: "w-4 h-4",
        lg: "w-5 h-5",
        xl: "w-6 h-6",
      },
      position: {
        left: "left-3",
        right: "right-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      position: "left",
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  helperText?: string;
  error?: string;
  success?: string;
  warning?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  iconType?: 'search' | 'calendar' | 'phone' | 'mail' | 'user' | 'lock' | 'custom';
  showPasswordToggle?: boolean;
  containerClassName?: string;
  labelClassName?: string;
  helperTextClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth,
    label,
    helperText,
    error,
    success,
    warning,
    required = false,
    leftIcon,
    rightIcon,
    iconType,
    showPasswordToggle = false,
    type = 'text',
    containerClassName,
    labelClassName,
    helperTextClassName,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [inputType, setInputType] = React.useState(type);

    // Determine the actual variant based on props
    const actualVariant = error 
      ? 'error' 
      : success 
        ? 'success' 
        : warning 
          ? 'warning' 
          : variant || 'default';

    // Handle password toggle
    React.useEffect(() => {
      if (type === 'password' && showPasswordToggle) {
        setInputType(showPassword ? 'text' : 'password');
      } else {
        setInputType(type);
      }
    }, [type, showPassword, showPasswordToggle]);

    // Get default icon based on type
    const getDefaultIcon = () => {
      if (leftIcon) return leftIcon;
      
      switch (iconType) {
        case 'search':
          return <Search />;
        case 'calendar':
          return <Calendar />;
        case 'phone':
          return <Phone />;
        case 'mail':
          return <Mail />;
        case 'user':
          return <User />;
        case 'lock':
          return <Lock />;
        default:
          return null;
      }
    };

    const defaultLeftIcon = getDefaultIcon();
    const hasLeftIcon = !!defaultLeftIcon || !!leftIcon;
    const hasRightIcon = !!rightIcon || (showPasswordToggle && type === 'password');

    const handlePasswordToggle = () => {
      setShowPassword(!showPassword);
    };

    const renderRightIcon = () => {
      if (showPasswordToggle && type === 'password') {
        return (
          <button
            type="button"
            onClick={handlePasswordToggle}
            className={cn(iconVariants({ variant: actualVariant, size, position: 'right' }), "cursor-pointer hover:text-gray-600")}
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        );
      }
      
      if (rightIcon) {
        return (
          <div className={cn(iconVariants({ variant: actualVariant, size, position: 'right' }))}>
            {rightIcon}
          </div>
        );
      }
      
      return null;
    };

    return (
      <div className={cn("relative", containerClassName)}>
        {label && (
          <label className={cn(labelVariants({ variant: actualVariant, size, required }), labelClassName)}>
            {label}
          </label>
        )}
        
        <div className="relative">
          {hasLeftIcon && (
            <div className={cn(iconVariants({ variant: actualVariant, size, position: 'left' }))}>
              {defaultLeftIcon || leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            type={inputType}
            className={cn(
              inputVariants({ 
                variant: actualVariant, 
                size, 
                fullWidth, 
                hasIcon: hasLeftIcon,
                hasRightIcon: hasRightIcon
              }), 
              className
            )}
            {...props}
          />
          
          {renderRightIcon()}
        </div>
        
        {(helperText || error || success || warning) && (
          <p className={cn(
            helperTextVariants({ 
              variant: actualVariant, 
              size 
            }), 
            helperTextClassName
          )}>
            {error || success || warning || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input, inputVariants };
