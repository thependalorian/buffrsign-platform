/**
 * ProgressiveOnboarding: Contextual onboarding checklist and coach marks
 * Location: components/onboarding/ProgressiveOnboarding.tsx
 */

import React from 'react'
import { CheckCircle2 } from 'lucide-react'

export interface OnboardingTask {
	id: string
	title: string
	description?: string
	completed: boolean
}

export interface ProgressiveOnboardingProps {
	className?: string
	tasks: OnboardingTask[]
	onToggle: (id: string, completed: boolean) => void
}

export const ProgressiveOnboarding: React.FC<ProgressiveOnboardingProps> = ({ className, tasks, onToggle }) => {
	const completed = tasks.filter(t => t.completed).length
	return (
		<div className={`card-buffrsign p-4 ${className || ''}`}>
			<div className="flex items-center justify-between mb-3">
				<h3 className="font-semibold">Getting started</h3>
				<span className="text-xs text-gray-500">{completed}/{tasks.length} completed</span>
			</div>
			<ul className="space-y-2">
				{tasks.map((t) => (
					<li key={t.id} className={`flex items-start gap-3 p-2 rounded hover:bg-gray-50 ${t.completed ? 'opacity-70' : ''}`}>
						<button
							className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center ${t.completed ? 'bg-success text-white border-success' : 'border-gray-300'}`}
							onClick={() => onToggle(t.id, !t.completed)}
							aria-label={t.completed ? 'Mark incomplete' : 'Mark complete'}
						>
							{t.completed && <CheckCircle2 className="w-4 h-4" />}
						</button>
						<div>
							<div className="text-sm font-medium text-gray-800">{t.title}</div>
							{t.description && <div className="text-xs text-gray-500">{t.description}</div>}
						</div>
					</li>
				))}
			</ul>
		</div>
	)
}

ProgressiveOnboarding.displayName = 'ProgressiveOnboarding'
