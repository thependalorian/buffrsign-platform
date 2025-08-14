// Login page. Purpose: basic login UI per Wireframes. Location: apps/web/app/(auth)/login/page.tsx
'use client';
import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClientComponentClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      document.cookie = 'bs_authed=1; path=/;';
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto card bg-base-100 shadow">
      <div className="card-body">
        <h1 className="card-title">Sign in</h1>
        {error && <div className="alert alert-error">{error}</div>}
        <form className="space-y-4" onSubmit={onSubmit}>
          <label className="form-control">
            <span className="label-text">Email</span>
            <input className="input input-bordered" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="form-control">
            <span className="label-text">Password</span>
            <input className="input input-bordered" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          <button className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          <a className="link" href="/signup">Create an account</a>
        </form>
      </div>
    </div>
  );
}

