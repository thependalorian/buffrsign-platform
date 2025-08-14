// Editor skeleton per Wireframes field placement. Location: apps/web/app/editor/page.tsx
'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '../../src/lib/api';

type Field = { id: string; type: 'signature' | 'text' | 'date' | 'checkbox'; assignee?: string; required?: boolean };

export default function EditorPage() {
  const params = useSearchParams();
  const docId = params.get('doc');
  const [fields, setFields] = useState<Field[]>([]);
  const addField = (type: Field['type']) => setFields((f) => [...f, { id: Math.random().toString(36).slice(2), type }]);
  const toggleRequired = (id: string) => setFields((f) => f.map((x) => (x.id === id ? { ...x, required: !x.required } : x)));

  return (
    <div className="space-y-4">
      <div className="steps w-full">
        <div className="step step-primary">Upload</div>
        <div className="step step-primary">Recipients</div>
        <div className="step step-primary">Place Fields</div>
        <div className="step">Review & Send</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-3">
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <div className="card-title">Tools</div>
              <div className="grid grid-cols-2 gap-2">
                <button className="btn btn-sm" onClick={() => addField('signature')}>✍️ Signature</button>
                <button className="btn btn-sm" onClick={() => addField('text')}>📝 Text</button>
                <button className="btn btn-sm" onClick={() => addField('date')}>📅 Date</button>
                <button className="btn btn-sm" onClick={() => addField('checkbox')}>☑️ Checkbox</button>
              </div>
            </div>
          </div>
          <button className="btn btn-primary" onClick={async () => {
            try {
              if (!docId) throw new Error('Missing document');
              await api('/api/v1/documents/' + docId, { method: 'PUT', body: JSON.stringify({ message: 'Ready to send' }) });
              window.location.href = '/dashboard';
            } catch (err: any) {
              alert(err?.message || 'Failed to finalize');
            }
          }}>Send</button>
        </div>
        <div className="md:col-span-3">
          <div className="card bg-base-100 shadow min-h-[500px]">
            <div className="card-body">
              <div className="card-title">Document Preview</div>
              <div className="border rounded p-4 min-h-[380px]">
                {fields.length === 0 && <p className="text-sm opacity-70">Add fields to the document…</p>}
                <ul className="list-disc list-inside">
                  {fields.map((f) => (
                    <li key={f.id} className="flex items-center gap-2">
                      <span>{f.type}</span>
                      <label className="label cursor-pointer gap-2">
                        <input type="checkbox" className="checkbox checkbox-xs" checked={!!f.required} onChange={() => toggleRequired(f.id)} />
                        <span className="label-text">Required</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

