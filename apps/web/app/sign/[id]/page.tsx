// Sign page per Wireframes 4.x. Location: apps/web/app/sign/[id]/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { api } from '../../../src/lib/api';

export default function SignPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [method, setMethod] = useState<'typed'|'drawn'|'upload'>('typed');
  const [typed, setTyped] = useState('');

  const submit = async () => {
    try {
      setLoading(true);
      setError(null);
      await api(`/api/v1/signatures/${params.id}/complete`, {
        method: 'POST',
        body: JSON.stringify({ method, data: method === 'typed' ? typed : undefined }),
      });
      window.location.href = '/dashboard';
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto card bg-base-100 shadow">
      <div className="card-body space-y-4">
        <h1 className="card-title">Sign Document</h1>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="form-control">
          <span className="label-text">Choose your signature method</span>
          <select className="select select-bordered" value={method} onChange={(e) => setMethod(e.target.value as any)}>
            <option value="typed">Type your signature</option>
            <option value="drawn">Draw your signature</option>
            <option value="upload">Upload signature image</option>
          </select>
        </div>
        {method === 'typed' && (
          <label className="form-control">
            <span className="label-text">Typed signature</span>
            <input className="input input-bordered" value={typed} onChange={(e) => setTyped(e.target.value)} />
          </label>
        )}
        <button className="btn btn-primary" onClick={submit} disabled={loading || (method === 'typed' && !typed)}>
          {loading ? 'Submitting…' : 'Sign'}
        </button>
      </div>
    </div>
  );
}

