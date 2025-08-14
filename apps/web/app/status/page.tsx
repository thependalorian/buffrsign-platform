'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../src/lib/supabaseClient';

export default function StatusPage() {
  const [apiOk, setApiOk] = useState<boolean | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkApi = async () => {
      try {
        const res = await fetch('/api/health', { cache: 'no-store' });
        setApiOk(res.ok);
      } catch {
        setApiOk(false);
      }
    };
    const loadPlans = async () => {
      if (!supabase) return;
      const { data, error } = await supabase.from('subscription_plans').select('*').limit(10);
      if (error) setError(error.message);
      else setPlans(data || []);
    };
    checkApi();
    loadPlans();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">System Status</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title">Backend API</h2>
            <p>
              Health: {apiOk === null ? 'checking…' : apiOk ? 'OK' : 'DOWN'}
            </p>
            <a className="btn btn-sm" href="/api/health">Check</a>
          </div>
        </div>
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h2 className="card-title">Supabase</h2>
            {error && <div className="alert alert-warning">{error}</div>}
            <p>Found {plans.length} subscription plan(s).</p>
            <ul className="list-disc list-inside">
              {plans.map((p) => (
                <li key={p.id}>{p.name} — N${(p.price_monthly ?? p.monthly_price)}/mo</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
