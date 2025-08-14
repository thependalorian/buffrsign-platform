// Smart template generation per llamaindex.md. Location: apps/web/app/templates/generate-smart/page.tsx
'use client';
import { useState } from 'react';
import { api } from '../../../src/lib/api';

export default function GenerateSmartTemplatePage() {
  const [templateType, setTemplateType] = useState('service_agreement');
  const [creating, setCreating] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    try {
      setCreating(true);
      setError(null);
      const res = await api<{ success: boolean; data: any }>(`/api/v1/templates/generate-smart`, {
        method: 'POST',
        body: JSON.stringify({ template_type: templateType, requirements: {} }),
      });
      setResult(res.data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Generate Smart Template</h1>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="card bg-base-100 shadow">
        <div className="card-body space-y-4">
          <div className="form-control">
            <span className="label-text">Template Type</span>
            <select className="select select-bordered" value={templateType} onChange={(e) => setTemplateType(e.target.value)}>
              <option value="service_agreement">Service Agreement</option>
              <option value="employment_contract">Employment Contract</option>
              <option value="nda">NDA</option>
              <option value="lease">Lease</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={submit} disabled={creating}>{creating ? 'Generating…' : 'Generate'}</button>
        </div>
      </div>
      {result && (
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <div className="card-title">Result</div>
            <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

