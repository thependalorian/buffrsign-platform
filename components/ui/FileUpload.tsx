/**
 * BuffrSign FileUpload Component
 * Location: components/ui/FileUpload.tsx
 */

import React from 'react'
import { cn } from '@/lib/utils'

export interface FileUploadProps extends React.HTMLAttributes<HTMLDivElement> {
	accept?: string
	multiple?: boolean
	maxSize?: number
	onUpload: (files: File[]) => void
	dragAndDrop?: boolean
	label?: string
	helpText?: string
	error?: string
}

export const FileUpload: React.FC<FileUploadProps> = ({
	className,
	accept,
	multiple,
	maxSize,
	onUpload,
	dragAndDrop = true,
	label,
	helpText,
	error,
	...props
}) => {
	const inputRef = React.useRef<HTMLInputElement>(null)
	const [dragOver, setDragOver] = React.useState(false)

	const handleFiles = (fileList: FileList | null) => {
		if (!fileList) return
		const files = Array.from(fileList)
		if (maxSize) {
			const tooLarge = files.find((f) => f.size > maxSize)
			if (tooLarge) {
				alert(`File ${tooLarge.name} exceeds max size`) // lightweight handling
				return
			}
		}
		onUpload(files)
	}

	return (
		<div className={cn('form-control w-full', className)} {...props}>
			{label && <label className="label"><span className="label-text">{label}</span></label>}
			<div
				className={cn(
					'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
					dragOver ? 'border-brand-blue-400 bg-brand-blue-50' : 'border-gray-300',
					error && 'border-error bg-error/5'
				)}
				onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
				onDragLeave={() => setDragOver(false)}
				onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
			>
				<p className="text-sm text-gray-600">Drag & drop files here or</p>
				<button className="btn btn-sm btn-primary mt-2" type="button" onClick={() => inputRef.current?.click()}>
					Browse
				</button>
				<input
					type="file"
					ref={inputRef}
					className="hidden"
					accept={accept}
					multiple={multiple}
					onChange={(e) => handleFiles(e.target.files)}
				/>
			</div>
			{helpText && <span className="text-xs text-gray-500 mt-2">{helpText}</span>}
			{error && <span className="text-sm text-error mt-1">{error}</span>}
		</div>
	)
}

FileUpload.displayName = 'FileUpload'
