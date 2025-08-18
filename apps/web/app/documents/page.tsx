// Documents list per Wireframes 7.1. Location: apps/web/app/documents/page.tsx
'use client';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../../src/lib/api';
import { Skeleton } from '../../../../components/performance/Skeleton';
import { OfflineIndicator } from '../../../../components/network/OfflineIndicator';
import { useOfflineSync } from '../../src/hooks/useOfflineSync';

type Doc = { id: string; title: string; status?: string; recipients?: { email: string; name?: string }[] };

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all'|'pending'|'completed'|'sent'|'expired'>('all');
  const { isOnline } = useOfflineSync();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api<{ success: boolean; data: Doc[] }>(`/api/v1/documents`, { cache: 'no-store' as any });
        setDocs(res.data || []);
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch documents');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    return docs.filter((d) => {
      const matchesQuery = d.title.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === 'all' || d.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [docs, query, status]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <OfflineIndicator isOnline={isOnline} />
        <div className="mb-6">
          <Skeleton shape="text" className="h-8 w-48 mb-4" />
          <Skeleton shape="text" className="h-4 w-64" />
        </div>
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card bg-base-100 shadow">
              <div className="card-body">
                <Skeleton shape="text" className="h-6 w-3/4 mb-2" />
                <Skeleton shape="text" className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <OfflineIndicator isOnline={isOnline} />
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Documents</h1>
        <p className="text-gray-600">Manage your digital documents and signatures</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search documents..."
            className="input input-bordered w-full"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <a className="btn btn-primary" href="/documents/new">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Document
        </a>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Recipients</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={d.id}>
                <td className="font-medium">{d.title}</td>
                <td>
                  <span className={`badge ${
                    d.status === 'completed' ? 'badge-success' :
                    d.status === 'pending' ? 'badge-warning' :
                    'badge-info'
                  }`}>
                    {d.status}
                  </span>
                </td>
                <td>{d.recipients?.length || 0}</td>
                <td>{new Date(d.id).toLocaleDateString()}</td>
                <td>
                  <div className="flex gap-2">
                    <a className="btn btn-sm btn-ghost" href={`/documents/${d.id}`}>View</a>
                    <a className="btn btn-sm btn-ghost" href={`/documents/${d.id}/audit-trail`}>Audit</a>
                    <a className="btn btn-sm btn-ghost" href={`/recipients?doc=${d.id}`}>Add Recipients</a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">No documents found</h3>
          <p className="text-gray-600 mb-4">Create your first document to get started</p>
          <a className="btn btn-primary" href="/documents/new">Create Document</a>
        </div>
      )}
    </div>
  );
}

