// Document detail per Wireframes 7.3. Location: apps/web/app/documents/[id]/page.tsx
import { api } from '../../../src/lib/api';

export default async function DocumentDetailPage({ params }: { params: { id: string } }) {
  const res = await api<{ success: boolean; data: { id: string; title: string; status?: string; recipients?: { email: string }[] } }>(
    `/api/v1/documents/${params.id}`,
    { cache: 'no-store' as any }
  );
  const doc = res.data;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{doc.title}</h1>
        <div className="flex gap-2">
          <a className="btn" href={`/documents/${doc.id}/audit-trail`}>Audit Trail</a>
          <a className="btn" href={`/recipients?doc=${doc.id}`}>Send Reminder</a>
        </div>
      </div>
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="font-medium">Status</div>
              <div className="opacity-70">{doc.status || 'draft'}</div>
            </div>
            <div className="md:col-span-2">
              <div className="font-medium">Recipients</div>
              <div className="opacity-70">{(doc.recipients || []).map((r) => r.email).join(', ') || '—'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

