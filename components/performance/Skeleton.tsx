/**
 * Skeleton: Perceived performance skeleton loader
 * Location: components/performance/Skeleton.tsx
 */

import React from 'react'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
	shape?: 'text' | 'image' | 'card' | 'circle'
	animated?: boolean
	width?: string | number
	height?: string | number
}

export const Skeleton: React.FC<SkeletonProps> = ({
	className,
	shape = 'text',
	animated = true,
	width,
	height,
	...props
}) => {
	const shapeClass =
		shape === 'text' ? 'h-4 rounded' :
		shape === 'image' ? 'h-40 rounded' :
		shape === 'card' ? 'h-32 rounded-lg' :
		'rounded-full h-10 w-10'

	return (
		<div
			className={`bg-gray-200 ${animated ? 'animate-pulse-slow' : ''} ${shapeClass} ${className || ''}`}
			style={{ width, height }}
			{...props}
		/>
	)
}

Skeleton.displayName = 'Skeleton'
