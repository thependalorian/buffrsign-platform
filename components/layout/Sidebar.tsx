/**
 * BuffrSign Sidebar Component
 * Implements collapsible navigation aligned to the design system
 * Location: components/layout/Sidebar.tsx
 */

import React from 'react'
import { cn } from '@/lib/utils'

export interface SidebarNavItem {
	name: string
	href: string
	icon: React.ReactNode
	current?: boolean
	badge?: string | number
}

export interface SidebarUser {
	name: string
	email: string
	avatar?: string
}

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
	navigation: SidebarNavItem[]
	user?: SidebarUser
	collapsed?: boolean
}

export const Sidebar: React.FC<SidebarProps> = ({ className, navigation, user, collapsed = false, ...props }) => {
	return (
		<aside className={cn('sidebar-buffrsign w-64 p-4', collapsed && 'w-20', className)} {...props}>
			{user && (
				<div className={cn('flex items-center gap-3 mb-6', collapsed && 'justify-center') }>
					{user.avatar ? (
						<img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
					) : (
						<div className="w-10 h-10 rounded-full bg-brand-blue-100 text-brand-blue-700 flex items-center justify-center font-semibold">
							{user.name.slice(0,1).toUpperCase()}
						</div>
					)}
					{!collapsed && (
						<div>
							<div className="text-sm font-medium text-gray-900">{user.name}</div>
							<div className="text-xs text-gray-500">{user.email}</div>
						</div>
					)}
				</div>
			)}
			<nav className="space-y-1">
				{navigation.map((item) => (
					<a
						key={item.href}
						href={item.href}
						className={cn(
							'sidebar-item-buffrsign',
							item.current && 'sidebar-item-buffrsign-active',
							collapsed && 'justify-center'
						)}
					>
						<span className="w-5 h-5">{item.icon}</span>
						{!collapsed && (
							<>
								<span>{item.name}</span>
								{item.badge !== undefined && (
									<span className="badge badge-sm ml-auto">{item.badge}</span>
								)}
							</>
						)}
					</a>
				))}
			</nav>
		</aside>
	)
}

Sidebar.displayName = 'Sidebar'
