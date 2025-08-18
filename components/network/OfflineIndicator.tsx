/**
 * OfflineIndicator: Shows offline/online state with retry option
 * Location: components/network/OfflineIndicator.tsx
 */

import React from 'react'

export interface OfflineIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
	isOnline: boolean
	onRetry?: () => void
	position?: 'top' | 'bottom'
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ className, isOnline, onRetry, position = 'top', ...props }) => {
	if (isOnline) return null
	return (
		<div className={`fixed left-0 right-0 z-50 ${position === 'top' ? 'top-0' : 'bottom-0'} ${className || ''}`} {...props}>
			<div className="mx-auto max-w-container">
				<div className="m-3 rounded-md bg-warning text-white px-4 py-2 flex items-center justify-between">
					<span>You're offline. We'll retry automatically when you're back online.</span>
					{onRetry && <button className="btn btn-sm" onClick={onRetry}>Retry now</button>}
				</div>
			</div>
		</div>
	)
}

OfflineIndicator.displayName = 'OfflineIndicator'
