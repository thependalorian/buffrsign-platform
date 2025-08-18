/**
 * BuffrSign Card Component
 * Implements the comprehensive design system with all card variants
 * Location: components/ui/Card.tsx
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  // Base styles
  "bg-white rounded-lg border border-gray-100 transition-all duration-300",
  {
    variants: {
      variant: {
        // Default card
        default: "shadow-card hover:shadow-elevated",
        
        // Interactive card with hover effects
        interactive: "shadow-card hover:shadow-elevated hover:-translate-y-1 cursor-pointer",
        
        // Elevated card with stronger shadow
        elevated: "shadow-elevated",
        
        // Outline card with border emphasis
        outline: "border-2 border-gray-200 shadow-sm",
        
        // Gradient card with cultural accents
        gradient: "bg-gradient-to-br from-brand-blue-50 to-namibian-gold-50 border-brand-blue-200",
        
        // Desert accent card
        desert: "bg-gradient-to-br from-desert-sand/10 to-namibian-gold-50 border-desert-sand/20",
        
        // Savanna accent card
        savanna: "bg-gradient-to-br from-savanna-green/10 to-success/10 border-savanna-green/20",
        
        // Sunset accent card
        sunset: "bg-gradient-to-br from-sunset-orange/10 to-namibian-gold-50 border-sunset-orange/20",
      },
      size: {
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
        xl: "p-10",
      },
      fullWidth: {
        true: "w-full",
        false: "w-auto",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      fullWidth: false,
    },
  }
);

const cardHeaderVariants = cva(
  "flex flex-col space-y-1.5",
  {
    variants: {
      size: {
        sm: "pb-3",
        md: "pb-4",
        lg: "pb-6",
        xl: "pb-8",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const cardTitleVariants = cva(
  "text-lg font-semibold leading-none tracking-tight",
  {
    variants: {
      size: {
        sm: "text-base",
        md: "text-lg",
        lg: "text-xl",
        xl: "text-2xl",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const cardDescriptionVariants = cva(
  "text-sm text-gray-600",
  {
    variants: {
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
        xl: "text-lg",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const cardContentVariants = cva(
  "pt-0",
  {
    variants: {
      size: {
        sm: "pt-0",
        md: "pt-0",
        lg: "pt-0",
        xl: "pt-0",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const cardFooterVariants = cva(
  "flex items-center pt-0",
  {
    variants: {
      size: {
        sm: "pt-3",
        md: "pt-4",
        lg: "pt-6",
        xl: "pt-8",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  children: React.ReactNode;
}

export interface CardHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardHeaderVariants> {
  children: React.ReactNode;
}

export interface CardTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof cardTitleVariants> {
  children: React.ReactNode;
}

export interface CardDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof cardDescriptionVariants> {
  children: React.ReactNode;
}

export interface CardContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardContentVariants> {
  children: React.ReactNode;
}

export interface CardFooterProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardFooterVariants> {
  children: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, fullWidth, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, size, fullWidth, className }))}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, size, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardHeaderVariants({ size, className }))}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, size, children, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn(cardTitleVariants({ size, className }))}
        {...props}
      >
        {children}
      </h3>
    );
  }
);

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, size, children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn(cardDescriptionVariants({ size, className }))}
        {...props}
      >
        {children}
      </p>
    );
  }
);

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, size, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardContentVariants({ size, className }))}
        {...props}
      >
        {children}
      </div>
    );
  }
);

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, size, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardFooterVariants({ size, className }))}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
CardHeader.displayName = "CardHeader";
CardTitle.displayName = "CardTitle";
CardDescription.displayName = "CardDescription";
CardContent.displayName = "CardContent";
CardFooter.displayName = "CardFooter";

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  cardVariants 
};
