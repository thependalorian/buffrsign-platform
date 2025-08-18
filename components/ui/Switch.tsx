/**
 * BuffrSign Switch Component
 * Location: components/ui/Switch.tsx
 */

import React from 'react'
import { cn } from '@/lib/utils'

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string
	size?: 'sm' | 'md' | 'lg'
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
	({ className, label, size = 'md', id, ...props }, ref) => {
		const switchId = id || React.useId()
		const sizeClass = size === 'sm' ? 'toggle-sm' : size === 'lg' ? 'toggle-lg' : ''
		return (
			<label htmlFor={switchId} className={cn('label cursor-pointer gap-3', className)}>
				<span className="label-text">{label}</span>
				<input id={switchId} ref={ref} type="checkbox" className={cn('toggle', sizeClass)} {...props} />
			</label>
		)
	}
)

Switch.displayName = 'Switch'
