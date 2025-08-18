/**
 * BuffrSign Modal Component
 * Implements the comprehensive design system with all modal variants
 * Location: components/ui/Modal.tsx
 */

import React, { useEffect, useRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { createPortal } from 'react-dom';

const modalVariants = cva(
  // Base styles
  "fixed inset-0 z-50 flex items-center justify-center p-4",
  {
    variants: {
      variant: {
        default: "",
        centered: "items-center justify-center",
        top: "items-start justify-center pt-20",
        bottom: "items-end justify-center pb-20",
        left: "items-center justify-start pl-20",
        right: "items-center justify-end pr-20",
      },
      size: {
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
        xl: "p-10",
        full: "p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

const overlayVariants = cva(
  // Base styles
  "fixed inset-0 transition-opacity duration-300",
  {
    variants: {
      variant: {
        default: "bg-black/50 backdrop-blur-sm",
        blur: "bg-black/30 backdrop-blur-md",
        solid: "bg-black/80",
        none: "bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const contentVariants = cva(
  // Base styles
  "relative bg-white rounded-lg shadow-xl transition-all duration-300 max-h-[90vh] overflow-hidden",
  {
    variants: {
      size: {
        sm: "max-w-sm w-full",
        md: "max-w-md w-full",
        lg: "max-w-lg w-full",
        xl: "max-w-xl w-full",
        "2xl": "max-w-2xl w-full",
        "3xl": "max-w-3xl w-full",
        "4xl": "max-w-4xl w-full",
        "5xl": "max-w-5xl w-full",
        "6xl": "max-w-6xl w-full",
        full: "w-full h-full rounded-none",
      },
      animation: {
        fade: "animate-fade-in",
        slideUp: "animate-slide-in-up",
        slideDown: "animate-slide-in-down",
        slideLeft: "animate-slide-in-left",
        slideRight: "animate-slide-in-right",
        scale: "animate-scale-in",
        none: "",
      },
    },
    defaultVariants: {
      size: "md",
      animation: "fade",
    },
  }
);

const headerVariants = cva(
  // Base styles
  "flex items-center justify-between p-6 border-b border-gray-200",
  {
    variants: {
      size: {
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
        xl: "p-10",
        full: "p-6",
      },
      variant: {
        default: "border-gray-200",
        success: "border-success/20 bg-success/5",
        warning: "border-warning/20 bg-warning/5",
        error: "border-error/20 bg-error/5",
        info: "border-info/20 bg-info/5",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
);

const titleVariants = cva(
  // Base styles
  "text-lg font-semibold text-gray-900",
  {
    variants: {
      size: {
        sm: "text-base",
        md: "text-lg",
        lg: "text-xl",
        xl: "text-2xl",
        full: "text-xl",
      },
      variant: {
        default: "text-gray-900",
        success: "text-success",
        warning: "text-warning",
        error: "text-error",
        info: "text-info",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
);

const bodyVariants = cva(
  // Base styles
  "p-6",
  {
    variants: {
      size: {
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
        xl: "p-10",
        full: "p-6",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const footerVariants = cva(
  // Base styles
  "flex items-center justify-end gap-3 p-6 border-t border-gray-200",
  {
    variants: {
      size: {
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
        xl: "p-10",
        full: "p-6",
      },
      variant: {
        default: "border-gray-200",
        success: "border-success/20 bg-success/5",
        warning: "border-warning/20 bg-warning/5",
        error: "border-error/20 bg-error/5",
        info: "border-info/20 bg-info/5",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
);

const closeButtonVariants = cva(
  // Base styles
  "rounded-full p-1 transition-colors duration-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:ring-offset-2",
  {
    variants: {
      size: {
        sm: "p-1",
        md: "p-1.5",
        lg: "p-2",
        xl: "p-2.5",
        full: "p-1.5",
      },
      variant: {
        default: "text-gray-400 hover:text-gray-600",
        success: "text-success hover:text-success/80",
        warning: "text-warning hover:text-warning/80",
        error: "text-error hover:text-error/80",
        info: "text-info hover:text-info/80",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
);

export interface ModalProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof modalVariants> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  preventScroll?: boolean;
  overlayVariant?: VariantProps<typeof overlayVariants>['variant'];
  contentSize?: VariantProps<typeof contentVariants>['size'];
  contentAnimation?: VariantProps<typeof contentVariants>['animation'];
  headerVariant?: VariantProps<typeof headerVariants>['variant'];
  titleVariant?: VariantProps<typeof titleVariants>['variant'];
  footerVariant?: VariantProps<typeof footerVariants>['variant'];
  closeButtonVariant?: VariantProps<typeof closeButtonVariants>['variant'];
  footer?: React.ReactNode;
  icon?: React.ReactNode;
  iconType?: 'success' | 'warning' | 'error' | 'info' | 'custom';
  containerClassName?: string;
  overlayClassName?: string;
  contentClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({ 
    className, 
    variant, 
    size,
    isOpen,
    onClose,
    title,
    description,
    children,
    showCloseButton = true,
    closeOnOverlayClick = true,
    closeOnEscape = true,
    preventScroll = true,
    overlayVariant = 'default',
    contentSize = 'md',
    contentAnimation = 'fade',
    headerVariant = 'default',
    titleVariant = 'default',
    footerVariant = 'default',
    closeButtonVariant = 'default',
    footer,
    icon,
    iconType,
    containerClassName,
    overlayClassName,
    contentClassName,
    headerClassName,
    bodyClassName,
    footerClassName,
    ...props 
  }, ref) => {
    const modalRef = useRef<HTMLDivElement>(null);

    // Handle escape key
    useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && closeOnEscape) {
          onClose();
        }
      };

      if (isOpen) {
        document.addEventListener('keydown', handleEscape);
        if (preventScroll) {
          document.body.style.overflow = 'hidden';
        }
      }

      return () => {
        document.removeEventListener('keydown', handleEscape);
        if (preventScroll) {
          document.body.style.overflow = 'unset';
        }
      };
    }, [isOpen, closeOnEscape, onClose, preventScroll]);

    // Handle overlay click
    const handleOverlayClick = (event: React.MouseEvent) => {
      if (event.target === event.currentTarget && closeOnOverlayClick) {
        onClose();
      }
    };

    // Get default icon based on type
    const getDefaultIcon = () => {
      if (icon) return icon;
      
      switch (iconType) {
        case 'success':
          return <CheckCircle className="w-6 h-6 text-success" />;
        case 'warning':
          return <AlertTriangle className="w-6 h-6 text-warning" />;
        case 'error':
          return <AlertCircle className="w-6 h-6 text-error" />;
        case 'info':
          return <Info className="w-6 h-6 text-info" />;
        default:
          return null;
      }
    };

    const defaultIcon = getDefaultIcon();

    // Don't render if not open
    if (!isOpen) return null;

    const modalContent = (
      <div
        ref={ref}
        className={cn(modalVariants({ variant, size }), containerClassName)}
        {...props}
      >
        {/* Overlay */}
        <div
          className={cn(overlayVariants({ variant: overlayVariant }), overlayClassName)}
          onClick={handleOverlayClick}
        />
        
        {/* Content */}
        <div
          ref={modalRef}
          className={cn(contentVariants({ size: contentSize, animation: contentAnimation }), contentClassName)}
        >
          {/* Header */}
          {(title || showCloseButton || defaultIcon) && (
            <div className={cn(headerVariants({ size: contentSize, variant: headerVariant }), headerClassName)}>
              <div className="flex items-center gap-3">
                {defaultIcon && defaultIcon}
                <div className="flex-1">
                  {title && (
                    <h2 className={cn(titleVariants({ size: contentSize, variant: titleVariant }))}>
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="mt-1 text-sm text-gray-600">
                      {description}
                    </p>
                  )}
                </div>
              </div>
              
              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className={cn(closeButtonVariants({ size: contentSize, variant: closeButtonVariant }))}
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
          
          {/* Body */}
          <div className={cn(bodyVariants({ size: contentSize }), bodyClassName)}>
            {children}
          </div>
          
          {/* Footer */}
          {footer && (
            <div className={cn(footerVariants({ size: contentSize, variant: footerVariant }), footerClassName)}>
              {footer}
            </div>
          )}
        </div>
      </div>
    );

    // Use portal to render modal at the top level
    return createPortal(modalContent, document.body);
  }
);

Modal.displayName = "Modal";

export { Modal, modalVariants };
