/**
 * ScreenReaderOnly: Hides content visually but keeps it available to screen readers
 * Location: components/accessibility/ScreenReaderOnly.tsx
 */

import React from 'react'
import { cn } from '@/lib/utils'

export interface ScreenReaderOnlyProps extends React.HTMLAttributes<HTMLSpanElement> {
	children: React.ReactNode
}

export const ScreenReaderOnly: React.FC<ScreenReaderOnlyProps> = ({ className, children, ...props }) => {
	return (
		<span className={cn('sr-only', className)} {...props}>
			{children}
		</span>
	)
}

ScreenReaderOnly.displayName = 'ScreenReaderOnly'
