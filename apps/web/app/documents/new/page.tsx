'use client'

import { useState } from 'react'
import { useAutosave } from '../../../src/hooks/useAutosave'
import { useSmartValidation } from '../../../src/hooks/useSmartValidation'
import { api } from '../../../src/lib/api'

interface DocumentForm {
  title: string
  description: string
  enableAI: boolean
}

export default function NewDocumentPage() {
  const [formData, setFormData] = useState<DocumentForm>({
    title: '',
    description: '',
    enableAI: true
  })
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  // Smart validation for title
  const titleValidator = (value: string) => ({
    valid: value.length >= 3,
    message: value.length < 3 ? 'Title must be at least 3 characters' : undefined,
    suggestions: value.length < 3 ? ['Add more descriptive title', 'Include document type'] : undefined
  })

  const { result: titleValidation, validate: validateTitle } = useSmartValidation(titleValidator)

  // Autosave form data
  const { saving } = useAutosave(formData, async (data) => {
    // Save to localStorage for recovery
    localStorage.setItem('documentDraft', JSON.stringify(data))
  }, 3000)

  const handleTitleChange = (value: string) => {
    setFormData(prev => ({ ...prev, title: value }))
    validateTitle(value)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setUploading(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('file', file)
      formDataToSend.append('title', formData.title)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('enable_ai', formData.enableAI.toString())

      // Use the generic api function instead of specific method
      const response = await api<{ document_id: string }>('/api/v1/ai/documents/upload-with-analysis', {
        method: 'POST',
        body: formDataToSend
      })
      // Redirect to document editor
      window.location.href = `/editor?doc=${response.document_id}`
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Create New Document</h1>
        <p className="text-gray-600">Upload a document to get started with digital signatures</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">Upload Document</h2>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="file-input file-input-bordered w-full"
              required
            />
            <p className="text-sm text-gray-500 mt-2">
              Supported formats: PDF, DOC, DOCX (max 10MB)
            </p>
          </div>
        </div>

        {/* Document Details */}
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h2 className="card-title">Document Details</h2>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Title</span>
                {saving && <span className="label-text-alt text-info">Saving...</span>}
              </label>
              <input
                type="text"
                placeholder="Enter document title"
                className={`input input-bordered ${!titleValidation.valid ? 'input-error' : ''}`}
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
              />
              {!titleValidation.valid && (
                <label className="label">
                  <span className="label-text-alt text-error">{titleValidation.message}</span>
                </label>
              )}
              {titleValidation.suggestions && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Suggestions:</p>
                  <ul className="text-sm text-gray-500">
                    {titleValidation.suggestions.map((suggestion, i) => (
                      <li key={i}>• {suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Description (Optional)</span>
              </label>
              <textarea
                placeholder="Brief description of the document"
                className="textarea textarea-bordered"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Enable AI Analysis</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={formData.enableAI}
                  onChange={(e) => setFormData(prev => ({ ...prev, enableAI: e.target.checked }))}
                />
              </label>
              <label className="label">
                <span className="label-text-alt">
                  AI will analyze your document and suggest signature placements
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            className={`btn btn-primary flex-1 ${uploading ? 'loading' : ''}`}
            disabled={!file || !titleValidation.valid || uploading}
          >
            {uploading ? 'Uploading...' : 'Create Document'}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => window.history.back()}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

