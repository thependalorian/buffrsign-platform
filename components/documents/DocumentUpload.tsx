/**
 * BuffrSign DocumentUpload Component
 * Location: components/documents/DocumentUpload.tsx
 */

import React from 'react'
import { FileUpload } from '@/components/ui/FileUpload'
import { Checkbox } from '@/components/ui/Checkbox'
import { cn } from '@/lib/utils'

export interface DocumentUploadProps extends React.HTMLAttributes<HTMLDivElement> {
	onUpload: (files: File[]) => void
	acceptedTypes?: string[]
	maxSize?: number
	multiple?: boolean
	aiAnalysis?: boolean
	onToggleAI?: (enabled: boolean) => void
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
	className,
	onUpload,
	acceptedTypes = ['.pdf', '.docx', '.png', '.jpg'],
	maxSize = 10 * 1024 * 1024,
	multiple = true,
	aiAnalysis = true,
	onToggleAI,
	...props
}) => {
	return (
		<div className={cn('space-y-4', className)} {...props}>
			<FileUpload
				label="Upload Document(s)"
				helpText={`Accepted: ${acceptedTypes.join(', ')} • Max ${Math.round(maxSize / (1024*1024))}MB`}
				accept={acceptedTypes.join(',')}
				multiple={multiple}
				maxSize={maxSize}
				onUpload={onUpload}
			/>
			<div className="flex items-center justify-between">
				<Checkbox
					label="Enable AI analysis"
					checked={aiAnalysis}
					onChange={(e) => onToggleAI?.(e.currentTarget.checked)}
				/>
				<a className="text-sm text-brand-blue-600 hover:underline" href="/templates/generate-smart">Generate smart template</a>
			</div>
		</div>
	)
}

DocumentUpload.displayName = 'DocumentUpload'
