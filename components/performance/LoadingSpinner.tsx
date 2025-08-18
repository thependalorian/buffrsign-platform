/**
 * LoadingSpinner: Animated loading spinner with different sizes
 * Location: components/performance/LoadingSpinner.tsx
 */

import React from 'react'

export interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
	size?: 'sm' | 'md' | 'lg' | 'xl'
	color?: 'primary' | 'secondary' | 'white'
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
	className, 
	size = 'md', 
	color = 'primary',
	...props 
}) => {
	const sizeClasses = {
		sm: 'w-4 h-4',
		md: 'w-6 h-6', 
		lg: 'w-8 h-8',
		xl: 'w-12 h-12'
	}

	const colorClasses = {
		primary: 'text-brand-blue-600',
		secondary: 'text-gray-600',
		white: 'text-white'
	}

	return (
		<div
			className={`animate-spin rounded-full border-2 border-gray-300 border-t-current ${sizeClasses[size]} ${colorClasses[color]} ${className || ''}`}
			{...props}
		/>
	)
}

LoadingSpinner.displayName = 'LoadingSpinner'
