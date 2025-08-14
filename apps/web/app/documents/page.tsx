// Documents list per Wireframes 7.1. Location: apps/web/app/documents/page.tsx
'use client';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../../src/lib/api';

type Doc = { id: string; title: string; status?: string; recipients?: { email: string; name?: string }[] };

export default function DocumentsListPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all'|'pending'|'completed'|'sent'|'expired'>('all');

  useEffect(() => {
    (async () => {
      try {
        const res = await api<{ success: boolean; data: Doc[] }>(`/api/v1/documents`, { cache: 'no-store' as any });
        setDocs(res.data || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    return docs.filter((d) => {
      const matchText = !query || d.title.toLowerCase().includes(query.toLowerCase());
      const matchStatus = status === 'all' || (d.status || 'draft').toLowerCase() === status;
      return matchText && matchStatus;
    });
  }, [docs, query, status]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Documents</h1>
        <div className="flex gap-2">
          <a className="btn" href="/documents/new">+ New</a>
        </div>
      </div>
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="flex flex-wrap gap-3">
            <input className="input input-bordered" placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} />
            <select className="select select-bordered" value={status} onChange={(e) => setStatus(e.target.value as any)}>
              <option value="all">All</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <div className="overflow-x-auto mt-4">
            {loading ? (
              <div className="loading loading-dots loading-lg" />
            ) : error ? (
              <div className="alert alert-error">{error}</div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Document Name</th>
                    <th>Recipients</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d) => (
                    <tr key={d.id}>
                      <td>{(d.status || 'draft')}</td>
                      <td>{d.title}</td>
                      <td>{(d.recipients || []).map((r) => r.email).join(', ')}</td>
                      <td className="flex gap-2">
                        <a className="btn btn-xs" href={`/documents/${d.id}`}>View</a>
                        <a className="btn btn-xs" href={`/documents/${d.id}/audit-trail`}>Audit</a>
                        <a className="btn btn-xs" href={`/recipients?doc=${d.id}`}>Add Recipients</a>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={4} className="text-center opacity-70">No documents found</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

