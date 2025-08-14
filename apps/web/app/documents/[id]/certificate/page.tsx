// Compliance certificate view per Wireframes 8.2. Location: apps/web/app/documents/[id]/certificate/page.tsx
import { api } from '../../../../src/lib/api';

export default async function CertificatePage({ params }: { params: { id: string } }) {
  const res = await api<{ success: boolean; data: any }>(`/api/v1/documents/${params.id}/certificate`, { cache: 'no-store' as any });
  const cert = res.data;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Compliance Certificate</h1>
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="font-medium">Document</div>
              <div className="opacity-70">{cert.title}</div>
              <div className="font-medium mt-3">Generated</div>
              <div className="opacity-70">{cert.generated_at}</div>
            </div>
            <div>
              <div className="font-medium">ETA Compliance</div>
              <ul className="list-disc list-inside opacity-70">
                <li>Section 17: {cert.eta_compliance.section_17 ? '✅' : '❌'}</li>
                <li>Section 20: {cert.eta_compliance.section_20 ? '✅' : '❌'}</li>
                <li>Section 21: {cert.eta_compliance.section_21 ? '✅' : '❌'}</li>
                <li>Section 25: {cert.eta_compliance.section_25 ? '✅' : '❌'}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

