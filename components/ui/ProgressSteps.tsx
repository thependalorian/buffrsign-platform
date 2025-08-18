/**
 * BuffrSign Progress Steps Component
 * Implements the comprehensive design system for multi-step workflows
 * Location: components/ui/ProgressSteps.tsx
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Check, Circle } from 'lucide-react';

export interface Step {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  status: 'pending' | 'active' | 'completed' | 'error';
}

const progressStepsVariants = cva(
  // Base styles
  "flex items-center justify-between",
  {
    variants: {
      variant: {
        horizontal: "flex-row",
        vertical: "flex-col space-y-4",
      },
      size: {
        sm: "gap-2",
        md: "gap-4",
        lg: "gap-6",
      },
      fullWidth: {
        true: "w-full",
        false: "w-auto",
      },
    },
    defaultVariants: {
      variant: "horizontal",
      size: "md",
      fullWidth: false,
    },
  }
);

const stepVariants = cva(
  // Base styles
  "flex items-center gap-3 transition-all duration-200",
  {
    variants: {
      status: {
        pending: "text-gray-400",
        active: "text-brand-blue-600 font-semibold",
        completed: "text-success",
        error: "text-error",
      },
      size: {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
      },
      clickable: {
        true: "cursor-pointer hover:opacity-80",
        false: "cursor-default",
      },
    },
    defaultVariants: {
      status: "pending",
      size: "md",
      clickable: false,
    },
  }
);

const stepIconVariants = cva(
  // Base styles
  "flex items-center justify-center rounded-full transition-all duration-200",
  {
    variants: {
      status: {
        pending: "bg-gray-100 text-gray-400 border-2 border-gray-200",
        active: "bg-brand-blue-100 text-brand-blue-600 border-2 border-brand-blue-300",
        completed: "bg-success text-white border-2 border-success",
        error: "bg-error text-white border-2 border-error",
      },
      size: {
        sm: "w-6 h-6 text-xs",
        md: "w-8 h-8 text-sm",
        lg: "w-10 h-10 text-base",
      },
    },
    defaultVariants: {
      status: "pending",
      size: "md",
    },
  }
);

const stepContentVariants = cva(
  // Base styles
  "flex flex-col",
  {
    variants: {
      size: {
        sm: "gap-0.5",
        md: "gap-1",
        lg: "gap-1.5",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const stepTitleVariants = cva(
  // Base styles
  "font-medium leading-tight",
  {
    variants: {
      status: {
        pending: "text-gray-500",
        active: "text-brand-blue-700",
        completed: "text-success",
        error: "text-error",
      },
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
      },
    },
    defaultVariants: {
      status: "pending",
      size: "md",
    },
  }
);

const stepDescriptionVariants = cva(
  // Base styles
  "leading-tight",
  {
    variants: {
      status: {
        pending: "text-gray-400",
        active: "text-brand-blue-600",
        completed: "text-success/80",
        error: "text-error/80",
      },
      size: {
        sm: "text-xs",
        md: "text-xs",
        lg: "text-sm",
      },
    },
    defaultVariants: {
      status: "pending",
      size: "md",
    },
  }
);

const connectorVariants = cva(
  // Base styles
  "flex-1 h-0.5 transition-all duration-200",
  {
    variants: {
      status: {
        pending: "bg-gray-200",
        active: "bg-brand-blue-200",
        completed: "bg-success",
        error: "bg-error",
      },
      size: {
        sm: "h-0.5",
        md: "h-1",
        lg: "h-1.5",
      },
    },
    defaultVariants: {
      status: "pending",
      size: "md",
    },
  }
);

export interface ProgressStepsProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressStepsVariants> {
  steps: Step[];
  currentStep?: number;
  onStepClick?: (stepIndex: number) => void;
  showConnectors?: boolean;
  showStepNumbers?: boolean;
  children?: React.ReactNode;
}

const ProgressSteps = React.forwardRef<HTMLDivElement, ProgressStepsProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth, 
    steps, 
    currentStep = 0,
    onStepClick,
    showConnectors = true,
    showStepNumbers = true,
    children,
    ...props 
  }, ref) => {
    const getStepStatus = (index: number): Step['status'] => {
      if (index < currentStep) return 'completed';
      if (index === currentStep) return 'active';
      return 'pending';
    };

    const getConnectorStatus = (index: number): 'pending' | 'active' | 'completed' | 'error' => {
      if (index < currentStep) return 'completed';
      if (index === currentStep) return 'active';
      return 'pending';
    };

    const handleStepClick = (index: number) => {
      if (onStepClick && index <= currentStep) {
        onStepClick(index);
      }
    };

    const renderStepIcon = (step: Step, index: number) => {
      const status = getStepStatus(index);
      
      if (step.icon) {
        return (
          <div className={cn(stepIconVariants({ status, size }))}>
            {step.icon}
          </div>
        );
      }

      if (status === 'completed') {
        return (
          <div className={cn(stepIconVariants({ status, size }))}>
            <Check className="w-3 h-3" />
          </div>
        );
      }

      if (showStepNumbers) {
        return (
          <div className={cn(stepIconVariants({ status, size }))}>
            {index + 1}
          </div>
        );
      }

      return (
        <div className={cn(stepIconVariants({ status, size }))}>
          <Circle className="w-3 h-3" />
        </div>
      );
    };

    return (
      <div
        ref={ref}
        className={cn(progressStepsVariants({ variant, size, fullWidth, className }))}
        {...props}
      >
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div
              className={cn(
                stepVariants({ 
                  status: getStepStatus(index), 
                  size, 
                  clickable: !!onStepClick && index <= currentStep 
                })
              )}
              onClick={() => handleStepClick(index)}
            >
              {renderStepIcon(step, index)}
              <div className={cn(stepContentVariants({ size }))}>
                <span className={cn(stepTitleVariants({ status: getStepStatus(index), size }))}>
                  {step.title}
                </span>
                {step.description && (
                  <span className={cn(stepDescriptionVariants({ status: getStepStatus(index), size }))}>
                    {step.description}
                  </span>
                )}
              </div>
            </div>
            
            {showConnectors && index < steps.length - 1 && (
              <div className={cn(connectorVariants({ status: getConnectorStatus(index), size }))} />
            )}
          </React.Fragment>
        ))}
        
        {children && (
          <div className="mt-6">
            {children}
          </div>
        )}
      </div>
    );
  }
);

ProgressSteps.displayName = "ProgressSteps";

export { ProgressSteps, progressStepsVariants };
