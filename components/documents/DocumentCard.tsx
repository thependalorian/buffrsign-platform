/**
 * BuffrSign DocumentCard Component
 * Location: components/documents/DocumentCard.tsx
 */

import React from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { IconButton } from '@/components/ui/IconButton'
import { cn } from '@/lib/utils'
import { FileText, Eye, Edit2, Trash2, Users } from 'lucide-react'

export interface DocumentCardProps extends React.HTMLAttributes<HTMLDivElement> {
	document: {
		id: string
		title: string
		status: 'draft' | 'pending' | 'completed' | 'expired'
		createdAt: string
		recipients: number
		thumbnail?: string
	}
	onView: () => void
	onEdit: () => void
	onDelete: () => void
}

const statusToBadge = (status: DocumentCardProps['document']['status']) => {
	switch (status) {
		case 'draft': return 'badge-ghost'
		case 'pending': return 'badge-warning'
		case 'completed': return 'badge-success'
		case 'expired': return 'badge-error'
	}
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ className, document, onView, onEdit, onDelete, ...props }) => {
	return (
		<Card className={cn('document-card', className)} {...props}>
			<CardContent className="flex items-center gap-4">
				{document.thumbnail ? (
					<img src={document.thumbnail} alt={document.title} className="w-16 h-20 object-cover rounded" />
				) : (
					<div className="w-16 h-20 bg-gray-100 rounded flex items-center justify-center text-gray-400">
						<FileText />
					</div>
				)}
				<div className="flex-1">
					<div className="flex items-center gap-2">
						<h3 className="font-semibold text-gray-900">{document.title}</h3>
						<span className={cn('badge badge-sm', statusToBadge(document.status))}>{document.status}</span>
					</div>
					<div className="mt-1 text-sm text-gray-500 flex items-center gap-4">
						<span>{new Date(document.createdAt).toLocaleDateString()}</span>
						<span className="inline-flex items-center gap-1"><Users className="w-4 h-4" /> {document.recipients} recipients</span>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<IconButton variant="ghost" icon={<Eye />} tooltip="View" onClick={onView} />
					<IconButton variant="ghost" icon={<Edit2 />} tooltip="Edit" onClick={onEdit} />
					<IconButton variant="ghost" icon={<Trash2 />} tooltip="Delete" onClick={onDelete} />
				</div>
			</CardContent>
		</Card>
	)
}

DocumentCard.displayName = 'DocumentCard'
