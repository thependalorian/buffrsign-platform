/**
 * BuffrSign Alert Component
 * Implements the comprehensive design system with all alert variants
 * Location: components/ui/Alert.tsx
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

const alertVariants = cva(
  // Base styles
  "relative w-full rounded-lg border p-4 transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-white border-gray-200 text-gray-900",
        info: "bg-info/10 border-info/20 text-info",
        success: "bg-success/10 border-success/20 text-success",
        warning: "bg-warning/10 border-warning/20 text-warning",
        error: "bg-error/10 border-error/20 text-error",
        namibian: "bg-namibian-gold/10 border-namibian-gold/20 text-namibian-gold-800",
        desert: "bg-desert-sand/10 border-desert-sand/20 text-desert-sand-800",
        savanna: "bg-savanna-green/10 border-savanna-green/20 text-savanna-green-800",
      },
      size: {
        sm: "p-3 text-sm",
        md: "p-4 text-base",
        lg: "p-6 text-lg",
      },
      fullWidth: {
        true: "w-full",
        false: "w-auto",
      },
      dismissible: {
        true: "pr-12",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      fullWidth: true,
      dismissible: false,
    },
  }
);

const iconVariants = cva(
  // Base styles
  "flex-shrink-0",
  {
    variants: {
      variant: {
        default: "text-gray-400",
        info: "text-info",
        success: "text-success",
        warning: "text-warning",
        error: "text-error",
        namibian: "text-namibian-gold-600",
        desert: "text-desert-sand-600",
        savanna: "text-savanna-green-600",
      },
      size: {
        sm: "w-4 h-4",
        md: "w-5 h-5",
        lg: "w-6 h-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

const titleVariants = cva(
  // Base styles
  "font-medium leading-tight",
  {
    variants: {
      variant: {
        default: "text-gray-900",
        info: "text-info",
        success: "text-success",
        warning: "text-warning",
        error: "text-error",
        namibian: "text-namibian-gold-900",
        desert: "text-desert-sand-900",
        savanna: "text-savanna-green-900",
      },
      size: {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

const descriptionVariants = cva(
  // Base styles
  "mt-1 leading-relaxed",
  {
    variants: {
      variant: {
        default: "text-gray-600",
        info: "text-info/80",
        success: "text-success/80",
        warning: "text-warning/80",
        error: "text-error/80",
        namibian: "text-namibian-gold-700",
        desert: "text-desert-sand-700",
        savanna: "text-savanna-green-700",
      },
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

const closeButtonVariants = cva(
  // Base styles
  "absolute top-4 right-4 rounded-full p-1 transition-colors duration-200 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "text-gray-400 hover:text-gray-600 focus:ring-gray-500",
        info: "text-info hover:text-info/80 focus:ring-info",
        success: "text-success hover:text-success/80 focus:ring-success",
        warning: "text-warning hover:text-warning/80 focus:ring-warning",
        error: "text-error hover:text-error/80 focus:ring-error",
        namibian: "text-namibian-gold-600 hover:text-namibian-gold-800 focus:ring-namibian-gold-500",
        desert: "text-desert-sand-600 hover:text-desert-sand-800 focus:ring-desert-sand-500",
        savanna: "text-savanna-green-600 hover:text-savanna-green-800 focus:ring-savanna-green-500",
      },
      size: {
        sm: "p-0.5",
        md: "p-1",
        lg: "p-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

const actionsVariants = cva(
  // Base styles
  "mt-4 flex flex-wrap gap-2",
  {
    variants: {
      size: {
        sm: "mt-3",
        md: "mt-4",
        lg: "mt-6",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  iconType?: 'info' | 'success' | 'warning' | 'error' | 'custom';
  dismissible?: boolean;
  onDismiss?: () => void;
  actions?: React.ReactNode;
  containerClassName?: string;
  iconClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  actionsClassName?: string;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth,
    title,
    description,
    icon,
    iconType,
    dismissible = false,
    onDismiss,
    actions,
    containerClassName,
    iconClassName,
    titleClassName,
    descriptionClassName,
    actionsClassName,
    children,
    ...props 
  }, ref) => {
    // Get default icon based on type
    const getDefaultIcon = () => {
      if (icon) return icon;
      
      switch (iconType) {
        case 'info':
          return <Info />;
        case 'success':
          return <CheckCircle />;
        case 'warning':
          return <AlertTriangle />;
        case 'error':
          return <AlertCircle />;
        default:
          // Auto-detect icon based on variant
          switch (variant) {
            case 'info':
              return <Info />;
            case 'success':
              return <CheckCircle />;
            case 'warning':
              return <AlertTriangle />;
            case 'error':
              return <AlertCircle />;
            default:
              return null;
          }
      }
    };

    const defaultIcon = getDefaultIcon();
    const showIcon = !!defaultIcon;
    const showDismissButton = dismissible && onDismiss;

    return (
      <div
        ref={ref}
        className={cn(
          alertVariants({ 
            variant, 
            size, 
            fullWidth, 
            dismissible: showDismissButton 
          }), 
          containerClassName,
          className
        )}
        role="alert"
        {...props}
      >
        {/* Dismiss Button */}
        {showDismissButton && (
          <button
            type="button"
            onClick={onDismiss}
            className={cn(closeButtonVariants({ variant, size }))}
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        
        <div className="flex gap-3">
          {/* Icon */}
          {showIcon && (
            <div className={cn(iconVariants({ variant, size }), iconClassName)}>
              {defaultIcon}
            </div>
          )}
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className={cn(titleVariants({ variant, size }), titleClassName)}>
                {title}
              </h3>
            )}
            
            {description && (
              <p className={cn(descriptionVariants({ variant, size }), descriptionClassName)}>
                {description}
              </p>
            )}
            
            {children && (
              <div className={cn(descriptionVariants({ variant, size }), descriptionClassName)}>
                {children}
              </div>
            )}
            
            {/* Actions */}
            {actions && (
              <div className={cn(actionsVariants({ size }), actionsClassName)}>
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

Alert.displayName = "Alert";

export { Alert, alertVariants };
