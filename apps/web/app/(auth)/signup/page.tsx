// Signup page. Purpose: basic registration per Wireframes. Location: apps/web/app/(auth)/signup/page.tsx
'use client';
import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [accountType, setAccountType] = useState<'individual'|'business'|'enterprise'|'government'>('individual');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClientComponentClient();
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName, account_type: accountType } } });
      if (error) throw error;
      window.location.href = '/login';
    } catch (err: any) {
      setError(err?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto card bg-base-100 shadow">
      <div className="card-body">
        <h1 className="card-title">Create Account</h1>
        {error && <div className="alert alert-error">{error}</div>}
        <form className="space-y-4" onSubmit={onSubmit}>
          <label className="form-control">
            <span className="label-text">Full Name</span>
            <input className="input input-bordered" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </label>
          <label className="form-control">
            <span className="label-text">Account Type</span>
            <select className="select select-bordered" value={accountType} onChange={(e) => setAccountType(e.target.value as any)}>
              <option value="individual">Individual</option>
              <option value="business">Business</option>
              <option value="enterprise">Enterprise</option>
              <option value="government">Government</option>
            </select>
          </label>
          <label className="form-control">
            <span className="label-text">Email</span>
            <input className="input input-bordered" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="form-control">
            <span className="label-text">Password</span>
            <input className="input input-bordered" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          <button className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Creating…' : 'Create account'}
          </button>
          <a className="link" href="/login">Have an account? Sign in</a>
        </form>
      </div>
    </div>
  );
}

