/**
 * BuffrSign IconButton Component
 * Location: components/ui/IconButton.tsx
 */

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const iconButtonVariants = cva(
	"inline-flex items-center justify-center rounded-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
	{
		variants: {
			variant: {
				primary: 'bg-brand-blue-600 text-white hover:bg-brand-blue-700 hover:shadow',
				secondary: 'bg-transparent border border-brand-blue-600 text-brand-blue-600 hover:bg-brand-blue-50',
				ghost: 'bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100',
			},
			size: {
				sm: 'h-8 w-8',
				md: 'h-10 w-10',
				lg: 'h-12 w-12',
			},
			circle: {
				true: 'rounded-full',
				false: '',
			},
		},
		defaultVariants: {
			variant: 'primary',
			size: 'md',
			circle: true,
		},
	}
)

export interface IconButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof iconButtonVariants> {
	icon: React.ReactNode
	tooltip?: string
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
	({ className, variant, size, circle, icon, tooltip, ...props }, ref) => {
		return (
			<button
				ref={ref}
				className={cn(iconButtonVariants({ variant, size, circle, className }))}
				aria-label={tooltip}
				title={tooltip}
				{...props}
			>
				{icon}
			</button>
		)
	}
)

IconButton.displayName = 'IconButton'
