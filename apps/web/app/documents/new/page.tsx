// Document upload skeleton per Wireframes step 1. Location: apps/web/app/documents/new/page.tsx
'use client';
import { useState } from 'react';
import { api } from '../../../src/lib/api';

export default function NewDocumentPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [useAi, setUseAi] = useState(true);
  const [documentType, setDocumentType] = useState('contract');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (useAi) {
        const aiRes = await api<{ success: boolean; data: { document_id: string; ai_analysis: any } }>(
          '/api/v1/documents/upload-with-analysis',
          { method: 'POST', body: JSON.stringify({ document_type: documentType }) }
        );
        window.location.href = `/recipients?doc=${aiRes.data.document_id}`;
      } else {
        const payload = {
          title,
          file_url: null as any,
          recipients: [],
          message: message || undefined,
        };
        const res = await api<{ success: boolean; data: { id: string } }>(
          '/api/v1/documents',
          { method: 'POST', body: JSON.stringify(payload) }
        );
        window.location.href = `/recipients?doc=${res.data.id}`;
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to create document');
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="steps w-full mb-6">
        <div className="step step-primary">Upload</div>
        <div className="step">Recipients</div>
        <div className="step">Place Fields</div>
        <div className="step">Review & Send</div>
      </div>

      <div className="card bg-base-100 shadow">
        <div className="card-body space-y-4">
          <h1 className="card-title">New Document</h1>
          <form className="space-y-4" onSubmit={submit}>
            <div className="form-control">
              <span className="label-text">Document Title</span>
              <input className="input input-bordered" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="form-control">
              <span className="label-text">Message (optional)</span>
              <textarea className="textarea textarea-bordered" value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
            <div className="form-control">
              <span className="label-text">File</span>
              <input type="file" className="file-input file-input-bordered" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              <label className="label"><span className="label-text-alt">Supported: PDF, DOC, DOCX, JPG • Max: 100MB</span></label>
            </div>
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-3">
                <input type="checkbox" className="checkbox" checked={useAi} onChange={(e) => setUseAi(e.target.checked)} />
                <span className="label-text">Enable AI analysis (auto-detect fields, ETA 2019 check)</span>
              </label>
              {useAi && (
                <div className="mt-2">
                  <span className="label-text">Document Type</span>
                  <select className="select select-bordered w-full mt-1" value={documentType} onChange={(e) => setDocumentType(e.target.value)}>
                    <option value="contract">Contract</option>
                    <option value="employment_contract">Employment Contract</option>
                    <option value="nda">NDA</option>
                    <option value="lease">Lease</option>
                  </select>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button className="btn btn-primary" disabled={submitting || !title}>
                {submitting ? 'Uploading…' : 'Upload & Continue'}
              </button>
              <a className="btn" href="/dashboard">Cancel</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

