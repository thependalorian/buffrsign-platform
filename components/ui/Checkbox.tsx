/**
 * BuffrSign Checkbox Component
 * Location: components/ui/Checkbox.tsx
 */

import React from 'react'
import { cn } from '@/lib/utils'

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label: string
	indeterminate?: boolean
	error?: string
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
	({ className, label, indeterminate, error, id, ...props }, ref) => {
		const checkboxId = id || React.useId()
		const internalRef = React.useRef<HTMLInputElement>(null)
		React.useEffect(() => {
			if (internalRef.current) {
				internalRef.current.indeterminate = !!indeterminate
			}
		}, [indeterminate])
		return (
			<label htmlFor={checkboxId} className={cn('label cursor-pointer items-center gap-3', className)}>
				<input
					id={checkboxId}
					type="checkbox"
					ref={(node) => {
						internalRef.current = node!
						if (typeof ref === 'function') ref(node as any)
						else if (ref) (ref as any).current = node
					}}
					className={cn('checkbox', error && 'checkbox-error')}
					{...props}
				/>
				<span className="label-text">{label}</span>
				{error && <span className="text-sm text-error ml-2">{error}</span>}
			</label>
		)
	}
)

Checkbox.displayName = 'Checkbox'
