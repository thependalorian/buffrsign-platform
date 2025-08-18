/**
 * BuffrSign RadioGroup Component
 * Location: components/ui/RadioGroup.tsx
 */

import React from 'react'
import { cn } from '@/lib/utils'

export interface RadioOption {
	value: string
	label: string
	description?: string
}

export interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
	name: string
	options: RadioOption[]
	label?: string
	error?: string
	value?: string
	onChange?: (value: string) => void
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
	className,
	name,
	options,
	label,
	error,
	value,
	onChange,
	...props
}) => {
	const groupName = name
	return (
		<div className={cn('form-control w-full', className)} {...props}>
			{label && (
				<label className="label"><span className="label-text font-medium">{label}</span></label>
			)}
			<div className="space-y-3">
				{options.map((opt) => (
					<label key={opt.value} className="flex items-start gap-3 cursor-pointer">
						<input
							type="radio"
							name={groupName}
							className={cn('radio', error && 'radio-error')}
							checked={value === opt.value}
							onChange={() => onChange?.(opt.value)}
						/>
						<div className="flex flex-col">
							<span className="text-sm font-medium text-gray-800">{opt.label}</span>
							{opt.description && <span className="text-xs text-gray-500">{opt.description}</span>}
						</div>
					</label>
				))}
			</div>
			{error && <span className="mt-1 text-sm text-error">{error}</span>}
		</div>
	)
}

RadioGroup.displayName = 'RadioGroup'
