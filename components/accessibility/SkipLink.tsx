/**
 * SkipLink: Keyboard-accessible skip to content link
 * Location: components/accessibility/SkipLink.tsx
 */

import React from 'react'

export interface SkipLinkProps {
	className?: string
	href: string
	children?: React.ReactNode
}

export const SkipLink: React.FC<SkipLinkProps> = ({ className, href, children = 'Skip to content' }) => {
	return (
		<a
			href={href}
			className={`sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-brand-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-md ${className || ''}`}
		>
			{children}
		</a>
	)
}

SkipLink.displayName = 'SkipLink'
