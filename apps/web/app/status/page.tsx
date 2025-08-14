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
      const { data, error } = await supabase.from('subscription_plans').select('*').limit(10);
      if (error) setError(error.message);
      else setPlans(data || []);
    };
    checkApi();
    loadPlans();
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>BuffrSign Status</h1>
      <section>
        <h2>Backend API</h2>
        <p>Health: {apiOk === null ? 'checking…' : apiOk ? 'OK' : 'DOWN'}</p>
      </section>
      <section>
        <h2>Supabase</h2>
        {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}
        <p>Found {plans.length} subscription plan(s).</p>
        <ul>
          {plans.map((p) => (
            <li key={p.id}>{p.name} — N${p.monthly_price}/mo</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
