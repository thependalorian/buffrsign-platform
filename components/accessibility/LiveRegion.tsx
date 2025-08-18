/**
 * LiveRegion: Announces dynamic updates to assistive technologies
 * Location: components/accessibility/LiveRegion.tsx
 */

import React from 'react'

export interface LiveRegionProps {
	className?: string
	politeness?: 'polite' | 'assertive'
	role?: 'status' | 'alert'
	children: React.ReactNode
}

export const LiveRegion: React.FC<LiveRegionProps> = ({ className, politeness = 'polite', role, children }) => {
	return (
		<div
			aria-live={politeness}
			role={role || (politeness === 'assertive' ? 'alert' : 'status')}
			className={`sr-only ${className || ''}`}
		>
			{children}
		</div>
	)
}

LiveRegion.displayName = 'LiveRegion'
