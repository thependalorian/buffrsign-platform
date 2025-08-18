/**
 * BuffrSign Breadcrumb Component
 * Location: components/ui/Breadcrumb.tsx
 */

import React from 'react'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
	label: string
	href?: string
	current?: boolean
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLDivElement> {
	items: BreadcrumbItem[]
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ className, items, ...props }) => {
	return (
		<nav className={cn('text-sm breadcrumbs', className)} aria-label="Breadcrumb" {...props}>
			<ul>
				{items.map((item, idx) => (
					<li key={idx} className={cn(item.current && 'text-gray-500')}>
						{item.href && !item.current ? (
							<a href={item.href} className="hover:text-brand-blue-600">{item.label}</a>
						) : (
							<span>{item.label}</span>
						)}
					</li>
				))}
			</ul>
		</nav>
	)
}

Breadcrumb.displayName = 'Breadcrumb'
