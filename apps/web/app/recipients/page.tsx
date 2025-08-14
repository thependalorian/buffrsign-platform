// Recipients skeleton per Wireframes step 2. Location: apps/web/app/recipients/page.tsx
'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '../../src/lib/api';

type Recipient = { name: string; email: string; role: 'signer' | 'sender'; order: number; require_id?: boolean };

export default function RecipientsPage() {
  const params = useSearchParams();
  const docId = params.get('doc');
  const [recipients, setRecipients] = useState<Recipient[]>([
    { name: '', email: '', role: 'sender', order: 1 },
  ]);

  const add = () => setRecipients((r) => [...r, { name: '', email: '', role: 'signer', order: r.length + 1 }]);
  const update = (i: number, key: keyof Recipient, value: any) => {
    setRecipients((r) => r.map((rec, idx) => (idx === i ? { ...rec, [key]: value } : rec)));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="steps w-full">
        <div className="step step-primary">Upload</div>
        <div className="step step-primary">Recipients</div>
        <div className="step">Place Fields</div>
        <div className="step">Review & Send</div>
      </div>
      <h1 className="text-2xl font-semibold">Add Recipients</h1>
      <div className="space-y-3">
        {recipients.map((r, i) => (
          <div key={i} className="card bg-base-100 shadow">
            <div className="card-body grid grid-cols-1 md:grid-cols-5 gap-3">
              <input className="input input-bordered" placeholder="Full name" value={r.name} onChange={(e) => update(i, 'name', e.target.value)} />
              <input className="input input-bordered" placeholder="Email" value={r.email} onChange={(e) => update(i, 'email', e.target.value)} />
              <select className="select select-bordered" value={r.role} onChange={(e) => update(i, 'role', e.target.value)}>
                <option value="signer">Signer</option>
                <option value="sender">Sender</option>
              </select>
              <input className="input input-bordered" type="number" min={1} value={r.order} onChange={(e) => update(i, 'order', Number(e.target.value))} />
              <label className="label cursor-pointer justify-start gap-2">
                <input type="checkbox" className="checkbox" checked={!!r.require_id} onChange={(e) => update(i, 'require_id', e.target.checked)} />
                <span className="label-text">Require ID Verification</span>
              </label>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button className="btn" onClick={add}>+ Add recipient</button>
        <button className="btn btn-primary" onClick={async () => {
          try {
            if (!docId) throw new Error('Missing document');
            const res = await api<{ success: boolean; data: { id: string } }>(
              '/api/v1/signatures',
              {
                method: 'POST',
                body: JSON.stringify({
                  document_id: docId,
                  recipients: recipients.map((r) => ({ email: r.email, name: r.name, role: r.role })),
                  expires_in_days: 7,
                }),
              }
            );
            window.location.href = `/editor?doc=${docId}&sig=${res.data.id}`;
          } catch (err: any) {
            alert(err?.message || 'Failed to request signatures');
          }
        }}>Continue</button>
      </div>
    </div>
  );
}

