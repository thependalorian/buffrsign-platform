/**
 * BuffrSign FloatingActionButton Component
 * Location: components/ui/FloatingActionButton.tsx
 */

import React from 'react'
import { cn } from '@/lib/utils'

export interface FABProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	icon: React.ReactNode
	position?: 'bottom-right' | 'bottom-left'
	label?: string
}

export const FloatingActionButton: React.FC<FABProps> = ({
	className,
	icon,
	position = 'bottom-right',
	label,
	...props
}) => {
	return (
		<button
			className={cn(
				'fixed z-50 inline-flex items-center gap-2 rounded-full bg-brand-blue-600 text-white shadow-lg hover:bg-brand-blue-700 transition-all px-5 py-3',
				position === 'bottom-right' ? 'right-6 bottom-6' : 'left-6 bottom-6',
				className
			)}
			{...props}
		>
			{icon}
			{label && <span className="font-medium">{label}</span>}
		</button>
	)
}

FloatingActionButton.displayName = 'FloatingActionButton'
