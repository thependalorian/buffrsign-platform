'use client'

import React from 'react'
import { Card } from ' @/components/ui/Card'
import { Button } from ' @/components/ui/Button'
import { Badge } from ' @/components/ui/Badge'
import { 
  FileText, 
  MoreVertical, 
  Eye, 
  Edit, 
  Download, 
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Document {
  id: string
  title: string
  status: 'draft' | 'pending' | 'completed' | 'expired'
  createdAt: string
  recipients: number
  completedSignatures: number
  totalSignatures: number
  thumbnail?: string
  fileSize: number
}

interface DocumentCardProps {
  document: Document
  onView: (id: string) => void
  onEdit: (id: string) => void
  onDownload: (id: string) => void
  onDelete: (id: string) => void
}

const statusConfig = {
  draft: {
    color: 'gray' as const,
    icon: Clock,
    label: 'Draft'
  },
  pending: {
    color: 'yellow' as const,
    icon: Clock,
    label: 'Pending'
  },
  completed: {
    color: 'green' as const,
    icon: CheckCircle,
    label: 'Completed'
  },
  expired: {
    color: 'red' as const,
    icon: XCircle,
    label: 'Expired'
  }
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onView,
  onEdit,
  onDownload,
  onDelete
}) => {
  const status = statusConfig[document.status]
  const StatusIcon = status.icon

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="flex-shrink-0">
            {document.thumbnail ? (
              <img 
                src={document.thumbnail} 
                alt={document.title}
                className="w-12 h-12 rounded object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {document.title}
            </h3>
            <div className="mt-1 flex items-center space-x-2">
              <Badge variant={status.color} size="sm">
                <StatusIcon className="h-3 w-3 mr-1" />
                {status.label}
              </Badge>
              {document.status !== 'draft' && (
                <span className="text-xs text-gray-500">
                  {document.completedSignatures}/{document.totalSignatures} signed
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formatDistanceToNow(new Date(document.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" onClick={() => onView(document.id)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit(document.id)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDownload(document.id)}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(document.id)}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
