// Templates library per Wireframes 6.1. Location: apps/web/app/templates/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { api } from '../../src/lib/api';

type Template = { id: string; name: string; description?: string | null; category?: string | null };

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api<{ success: boolean; data: Template[] }>(`/api/v1/templates`, { cache: 'no-store' as any });
        setTemplates(res.data || []);
      } catch (e: any) {
        setError(e.message);
      }
    })();
  }, []);

  const create = async () => {
    try {
      setCreating(true);
      setError(null);
      const res = await api<{ success: boolean; data: Template }>(`/api/v1/templates`, {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
      setTemplates((t) => [res.data, ...t]);
      setName('');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Templates</h1>
        <div className="join">
          <input className="input input-bordered join-item" placeholder="New template name" value={name} onChange={(e) => setName(e.target.value)} />
          <button className="btn btn-primary join-item" onClick={create} disabled={!name || creating}>{creating ? 'Creating…' : '+ Create'}</button>
        </div>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {templates.map((tpl) => (
          <div key={tpl.id} className="card bg-base-100 shadow">
            <div className="card-body">
              <div className="card-title">{tpl.name}</div>
              <p className="opacity-70 text-sm">{tpl.description || '—'}</p>
              <div className="flex gap-2">
                <a className="btn btn-sm" href={`/documents/new?tpl=${tpl.id}`}>Use Template</a>
                <a className="btn btn-sm btn-ghost">Preview</a>
              </div>
            </div>
          </div>
        ))}
        {templates.length === 0 && (
          <div className="col-span-full text-center opacity-70">No templates yet</div>
        )}
      </div>
    </div>
  );
}

