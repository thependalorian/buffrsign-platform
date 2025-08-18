/**
 * TrustIndicators: Visual trust and security indicators
 * Location: components/trust/TrustIndicators.tsx
 */

import React from 'react'
import { ShieldCheck, Lock, Activity, Cloud } from 'lucide-react'

export interface TrustIndicatorsProps {
	className?: string
	elements?: Array<'ssl' | 'encryption' | 'compliance' | 'uptime'>
}

const icons = {
	ssl: <ShieldCheck className="w-4 h-4" />,
	encryption: <Lock className="w-4 h-4" />,
	compliance: <Activity className="w-4 h-4" />,
	uptime: <Cloud className="w-4 h-4" />,
}

const labels: Record<string, string> = {
	ssl: 'SSL Secure',
	encryption: '256-bit Encryption',
	compliance: 'ETA 2019 & CRAN',
	uptime: '99.9% Uptime',
}

export const TrustIndicators: React.FC<TrustIndicatorsProps> = ({ className, elements = ['ssl','encryption','compliance','uptime'] }) => {
	return (
		<div className={`flex flex-wrap items-center gap-2 text-xs text-gray-600 ${className || ''}`}>
			{elements.map((el) => (
				<span key={el} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100">
					{icons[el]}
					{labels[el]}
				</span>
			))}
		</div>
	)
}

TrustIndicators.displayName = 'TrustIndicators'
