import React from 'react'
import { cn } from ' @/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        success: 'border-transparent bg-green-100 text-green-800 hover:bg-green-200',
        warning: 'border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
        error: 'border-transparent bg-red-100 text-red-800 hover:bg-red-200',
        info: 'border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200',
        gray: 'border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200',
        // ETA 2019 compliance badges
        compliant: 'border-transparent bg-green-100 text-green-800 hover:bg-green-200',
        'needs-review': 'border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
        'non-compliant': 'border-transparent bg-red-100 text-red-800 hover:bg-red-200',
        // Document status badges
        draft: 'border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200',
        pending: 'border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
        completed: 'border-transparent bg-green-100 text-green-800 hover:bg-green-200',
        expired: 'border-transparent bg-red-100 text-red-800 hover:bg-red-200'
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode
}

function Badge({ className, variant, size, icon, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </div>
  )
}

// Specialized badges for BuffrSign
export const ComplianceBadge: React.FC<{
  status: 'compliant' | 'needs-review' | 'non-compliant'
  children: React.ReactNode
}> = ({ status, children }) => {
  const icons = {
    compliant: '✓',
    'needs-review': '⚠',
    'non-compliant': '✗'
  }

  return (
    <Badge variant={status} icon={icons[status]}>
      {children}
    </Badge>
  )
}

export const DocumentStatusBadge: React.FC<{
  status: 'draft' | 'pending' | 'completed' | 'expired'
  children: React.ReactNode
}> = ({ status, children }) => {
  const icons = {
    draft: '',
    pending: '⏳',
    completed: '✅',
    expired: '❌'
  }

  return (
    <Badge variant={status} icon={icons[status]}>
      {children}
    </Badge>
  )
}

export const ETAComplianceBadge: React.FC<{
  section: string
  compliant: boolean
}> = ({ section, compliant }) => {
  return (
    <Badge variant={compliant ? 'compliant' : 'non-compliant'}>
      ETA {section} {compliant ? '✓' : '✗'}
    </Badge>
  )
}

export { Badge, badgeVariants }
