/**
 * BuffrSign Signature Field Component
 * Implements the comprehensive design system for digital signature placement
 * Location: components/ui/SignatureField.tsx
 */

import React, { useState, useRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { PenTool, Type, Upload, Check, AlertCircle } from 'lucide-react';

export interface SignatureData {
  type: 'drawn' | 'typed' | 'uploaded';
  value: string;
  timestamp: Date;
  signerId: string;
}

const signatureFieldVariants = cva(
  // Base styles
  "relative border-2 border-dashed rounded-md transition-all duration-200 cursor-pointer group",
  {
    variants: {
      variant: {
        // Empty signature field
        empty: "border-brand-blue-200 bg-brand-blue-50/30 hover:border-brand-blue-400 hover:bg-brand-blue-50",
        
        // Filled signature field
        filled: "border-success bg-success/10",
        
        // Required signature field
        required: "border-error bg-error/10",
        
        // Optional signature field
        optional: "border-gray-300 bg-gray-50/30 hover:border-gray-400 hover:bg-gray-100",
        
        // AI suggested signature field
        aiSuggested: "border-namibian-gold-300 bg-namibian-gold-50/30 hover:border-namibian-gold-400 hover:bg-namibian-gold-50",
      },
      size: {
        sm: "p-3 min-h-[60px]",
        md: "p-4 min-h-[80px]",
        lg: "p-6 min-h-[100px]",
        xl: "p-8 min-h-[120px]",
      },
      fullWidth: {
        true: "w-full",
        false: "w-auto",
      },
      disabled: {
        true: "opacity-50 cursor-not-allowed pointer-events-none",
        false: "",
      },
    },
    defaultVariants: {
      variant: "empty",
      size: "md",
      fullWidth: false,
      disabled: false,
    },
  }
);

const signatureContentVariants = cva(
  // Base styles
  "flex flex-col items-center justify-center text-center",
  {
    variants: {
      variant: {
        empty: "text-gray-500",
        filled: "text-success",
        required: "text-error",
        optional: "text-gray-500",
        aiSuggested: "text-namibian-gold-700",
      },
      size: {
        sm: "gap-1 text-xs",
        md: "gap-2 text-sm",
        lg: "gap-3 text-base",
        xl: "gap-4 text-lg",
      },
    },
    defaultVariants: {
      variant: "empty",
      size: "md",
    },
  }
);

const signatureIconVariants = cva(
  // Base styles
  "transition-all duration-200",
  {
    variants: {
      variant: {
        empty: "text-gray-400 group-hover:text-brand-blue-500",
        filled: "text-success",
        required: "text-error",
        optional: "text-gray-400 group-hover:text-gray-600",
        aiSuggested: "text-namibian-gold-500 group-hover:text-namibian-gold-600",
      },
      size: {
        sm: "w-4 h-4",
        md: "w-5 h-5",
        lg: "w-6 h-6",
        xl: "w-8 h-8",
      },
    },
    defaultVariants: {
      variant: "empty",
      size: "md",
    },
  }
);

const signatureTextVariants = cva(
  // Base styles
  "font-medium",
  {
    variants: {
      variant: {
        empty: "text-gray-600",
        filled: "text-success",
        required: "text-error",
        optional: "text-gray-600",
        aiSuggested: "text-namibian-gold-700",
      },
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
        xl: "text-lg",
      },
    },
    defaultVariants: {
      variant: "empty",
      size: "md",
    },
  }
);

const signatureSubtextVariants = cva(
  // Base styles
  "",
  {
    variants: {
      variant: {
        empty: "text-gray-400",
        filled: "text-success/70",
        required: "text-error/70",
        optional: "text-gray-400",
        aiSuggested: "text-namibian-gold-600",
      },
      size: {
        sm: "text-xs",
        md: "text-xs",
        lg: "text-sm",
        xl: "text-sm",
      },
    },
    defaultVariants: {
      variant: "empty",
      size: "md",
    },
  }
);

const signatureBadgeVariants = cva(
  // Base styles
  "absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium",
  {
    variants: {
      variant: {
        empty: "bg-gray-100 text-gray-600",
        filled: "bg-success text-white",
        required: "bg-error text-white",
        optional: "bg-gray-100 text-gray-600",
        aiSuggested: "bg-namibian-gold-100 text-namibian-gold-700",
      },
    },
    defaultVariants: {
      variant: "empty",
    },
  }
);

export interface SignatureFieldProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof signatureFieldVariants> {
  label?: string;
  placeholder?: string;
  required?: boolean;
  signatureData?: SignatureData;
  aiSuggested?: boolean;
  onSignatureClick?: () => void;
  onSignatureChange?: (signatureData: SignatureData) => void;
  signerName?: string;
  signerRole?: string;
  children?: React.ReactNode;
}

const SignatureField = React.forwardRef<HTMLDivElement, SignatureFieldProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth, 
    disabled,
    label,
    placeholder = "Click to add signature",
    required = false,
    signatureData,
    aiSuggested = false,
    onSignatureClick,
    onSignatureChange,
    signerName,
    signerRole,
    children,
    ...props 
  }, ref) => {
    const [isHovered, setIsHovered] = useState(false);
    
    // Determine the actual variant based on props
    const actualVariant = signatureData 
      ? 'filled' 
      : required 
        ? 'required' 
        : aiSuggested 
          ? 'aiSuggested' 
          : variant || 'empty';

    const handleClick = () => {
      if (!disabled && onSignatureClick) {
        onSignatureClick();
      }
    };

    const renderSignatureContent = () => {
      if (signatureData) {
        return (
          <div className={cn(signatureContentVariants({ variant: actualVariant, size }))}>
            <Check className={cn(signatureIconVariants({ variant: actualVariant, size }))} />
            <div className="flex flex-col items-center">
              <span className={cn(signatureTextVariants({ variant: actualVariant, size }))}>
                {signatureData.type === 'drawn' && 'Signature Added'}
                {signatureData.type === 'typed' && 'Typed Signature'}
                {signatureData.type === 'uploaded' && 'Uploaded Signature'}
              </span>
              <span className={cn(signatureSubtextVariants({ variant: actualVariant, size }))}>
                {signatureData.timestamp.toLocaleDateString()}
              </span>
            </div>
          </div>
        );
      }

      return (
        <div className={cn(signatureContentVariants({ variant: actualVariant, size }))}>
          {actualVariant === 'aiSuggested' ? (
            <PenTool className={cn(signatureIconVariants({ variant: actualVariant, size }))} />
          ) : (
            <PenTool className={cn(signatureIconVariants({ variant: actualVariant, size }))} />
          )}
          <div className="flex flex-col items-center">
            <span className={cn(signatureTextVariants({ variant: actualVariant, size }))}>
              {placeholder}
            </span>
            <span className={cn(signatureSubtextVariants({ variant: actualVariant, size }))}>
              {signerName && `For: ${signerName}`}
              {signerRole && signerName && ` (${signerRole})`}
              {!signerName && signerRole && `Role: ${signerRole}`}
            </span>
          </div>
        </div>
      );
    };

    const renderBadge = () => {
      if (aiSuggested) {
        return (
          <div className={cn(signatureBadgeVariants({ variant: actualVariant }))}>
            AI Suggested
          </div>
        );
      }

      if (required) {
        return (
          <div className={cn(signatureBadgeVariants({ variant: actualVariant }))}>
            Required
          </div>
        );
      }

      return null;
    };

    return (
      <div
        ref={ref}
        className={cn(signatureFieldVariants({ variant: actualVariant, size, fullWidth, disabled, className }))}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {renderBadge()}
        
        {renderSignatureContent()}
        
        {children && (
          <div className="mt-4">
            {children}
          </div>
        )}
        
        {/* Signature options overlay on hover */}
        {isHovered && !signatureData && !disabled && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-md flex items-center justify-center">
            <div className="flex gap-2">
              <button
                className="flex items-center gap-2 px-3 py-2 bg-brand-blue-600 text-white rounded-md hover:bg-brand-blue-700 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle drawn signature
                }}
              >
                <PenTool className="w-4 h-4" />
                Draw
              </button>
              <button
                className="flex items-center gap-2 px-3 py-2 bg-brand-blue-600 text-white rounded-md hover:bg-brand-blue-700 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle typed signature
                }}
              >
                <Type className="w-4 h-4" />
                Type
              </button>
              <button
                className="flex items-center gap-2 px-3 py-2 bg-brand-blue-600 text-white rounded-md hover:bg-brand-blue-700 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle uploaded signature
                }}
              >
                <Upload className="w-4 h-4" />
                Upload
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
);

SignatureField.displayName = "SignatureField";

export { SignatureField, signatureFieldVariants };
