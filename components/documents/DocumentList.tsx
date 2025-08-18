/**
 * BuffrSign DocumentList Component
 * Location: components/documents/DocumentList.tsx
 */

import React from 'react'
import { DocumentCard } from './DocumentCard'
import { cn } from '@/lib/utils'

export interface DocumentListItem {
	id: string
	title: string
	status: 'draft' | 'pending' | 'completed' | 'expired'
	createdAt: string
	recipients: number
	thumbnail?: string
}

export interface DocumentListProps extends React.HTMLAttributes<HTMLDivElement> {
	documents: DocumentListItem[]
	loading?: boolean
	onSort?: (field: string, direction: 'asc' | 'desc') => void
	onFilter?: (filters: any) => void
	onSelect?: (documentIds: string[]) => void
	onView?: (id: string) => void
	onEdit?: (id: string) => void
	onDelete?: (id: string) => void
}

export const DocumentList: React.FC<DocumentListProps> = ({
	className,
	documents,
	loading,
	onView,
	onEdit,
	onDelete,
	...props
}) => {
	if (loading) {
		return <div className={cn('grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4', className)}>Loading…</div>
	}
	return (
		<div className={cn('grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4', className)} {...props}>
			{documents.map((doc) => (
				<DocumentCard
					key={doc.id}
					document={doc}
					onView={() => onView?.(doc.id)}
					onEdit={() => onEdit?.(doc.id)}
					onDelete={() => onDelete?.(doc.id)}
				/>
			))}
		</div>
	)
}

DocumentList.displayName = 'DocumentList'
