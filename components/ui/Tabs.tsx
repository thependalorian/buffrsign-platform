/**
 * BuffrSign Tabs Component
 * Location: components/ui/Tabs.tsx
 */

import React from 'react'
import { cn } from '@/lib/utils'

export interface TabItem {
	id: string
	label: string
	content: React.ReactNode
	icon?: React.ReactNode
	badge?: string | number
}

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
	tabs: TabItem[]
	defaultTab?: string
}

export const Tabs: React.FC<TabsProps> = ({ className, tabs, defaultTab, ...props }) => {
	const [active, setActive] = React.useState<string>(defaultTab || tabs[0]?.id)
	return (
		<div className={cn('w-full', className)} {...props}>
			<div role="tablist" className="tabs tabs-bordered">
				{tabs.map((t) => (
					<button
						key={t.id}
						role="tab"
						className={cn('tab', active === t.id && 'tab-active font-medium')}
						onClick={() => setActive(t.id)}
					>
						{t.icon}
						<span className="ml-2">{t.label}</span>
						{t.badge !== undefined && (
							<span className="ml-2 badge badge-sm">{t.badge}</span>
						)}
					</button>
				))}
			</div>
			<div className="mt-4">
				{tabs.map((t) => (
					<div key={t.id} className={cn(active !== t.id && 'hidden')}>
						{t.content}
					</div>
				))}
			</div>
		</div>
	)
}

Tabs.displayName = 'Tabs'
