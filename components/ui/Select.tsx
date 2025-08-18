/**
 * BuffrSign Select Component
 * Location: components/ui/Select.tsx
 */

import React from 'react'
import { cn } from '@/lib/utils'

export interface SelectOption {
	value: string
	label: string
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
	label?: string
	options: SelectOption[]
	error?: string
	placeholder?: string
	multiple?: boolean
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
	({ className, label, options, error, placeholder, multiple, id, ...props }, ref) => {
		const selectId = id || React.useId()
		return (
			<div className={cn('form-control w-full', className)}>
				{label && <label htmlFor={selectId} className="label"><span className="label-text">{label}</span></label>}
				<select
					id={selectId}
					ref={ref}
					className={cn('select select-bordered w-full', error && 'select-error')}
					multiple={multiple}
					{...props}
				>
					{placeholder && !multiple && (
						<option value="" disabled selected>{placeholder}</option>
					)}
					{options.map((opt) => (
						<option key={opt.value} value={opt.value}>{opt.label}</option>
					))}
				</select>
				{error && <span className="mt-1 text-sm text-error">{error}</span>}
			</div>
		)
	}
)

Select.displayName = 'Select'
