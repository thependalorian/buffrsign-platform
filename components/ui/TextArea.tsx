/**
 * BuffrSign TextArea Component
 * Location: components/ui/TextArea.tsx
 */

import React from 'react'
import { cn } from '@/lib/utils'

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	label?: string
	error?: string
	required?: boolean
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
	({ className, label, error, required, id, ...props }, ref) => {
		const inputId = id || React.useId()
		return (
			<div className={cn('form-control w-full', className)}>
				{label && (
					<label htmlFor={inputId} className="label">
						<span className="label-text text-gray-700">
							{label} {required && <span className="text-error">*</span>}
						</span>
					</label>
				)}
				<textarea
					id={inputId}
					ref={ref}
					className={cn(
						'textarea textarea-bordered w-full',
						error && 'textarea-error'
					)}
					{...props}
				/>
				{error && (
					<span className="mt-1 text-sm text-error">{error}</span>
				)}
			</div>
		)
	}
)

TextArea.displayName = 'TextArea'
