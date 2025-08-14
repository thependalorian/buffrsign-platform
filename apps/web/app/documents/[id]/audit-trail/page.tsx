// Audit Trail page. Purpose: show ETA evidence log per TRD/Wireframes. Location: apps/web/app/documents/[id]/audit-trail/page.tsx
import { api } from '../../../../src/lib/api';

export default async function AuditTrailPage({ params }: { params: { id: string } }) {
  const data = await api<{ success: boolean; data: { document_id: string; events: { action: string; ts: string }[] } }>(
    `/api/v1/documents/${params.id}/audit-trail`,
    { cache: 'no-store' as any }
  );
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Audit Trail</h1>
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="card-title">Document: {data.data.document_id}</div>
          <ul className="timeline timeline-vertical">
            {data.data.events.map((e, i) => (
              <li key={i}>
                <div className="timeline-middle">•</div>
                <div className="timeline-end timeline-box">
                  <div className="font-medium">{e.action}</div>
                  <div className="text-xs opacity-70">{new Date(e.ts).toLocaleString()}</div>
                </div>
                <hr />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

