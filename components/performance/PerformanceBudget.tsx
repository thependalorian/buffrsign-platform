/**
 * PerformanceBudget: Small badge showing estimated time/progress
 * Location: components/performance/PerformanceBudget.tsx
 */

import React from 'react'

export interface PerformanceBudgetProps {
	className?: string
	estimatedTime?: number // seconds
	showProgress?: boolean
	progress?: number // 0..100
}

export const PerformanceBudget: React.FC<PerformanceBudgetProps> = ({ className, estimatedTime, showProgress, progress }) => {
	return (
		<div className={`inline-flex items-center gap-2 text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 ${className || ''}`}>
			{estimatedTime !== undefined && <span>~{estimatedTime}s</span>}
			{showProgress && (
				<div className="w-16 h-1 bg-gray-300 rounded overflow-hidden">
					<div className="h-1 bg-brand-blue-600" style={{ width: `${Math.min(100, Math.max(0, progress || 0))}%` }} />
				</div>
			)}
		</div>
	)
}

PerformanceBudget.displayName = 'PerformanceBudget'
