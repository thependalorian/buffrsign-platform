// Account/Profile page. Purpose: view and update profile stored in public.profiles. Location: apps/web/app/account/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '../../../../supabase/database.types';

export default function AccountPage() {
  const supabase = createClientComponentClient<Database>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Database['public']['Tables']['users']['Row'] | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          window.location.href = '/login';
          return;
        }
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        if (error) throw error;
        setProfile(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    if (!profile) return;
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          company_name: profile.company_name,
          namibian_id: profile.namibian_id,
          account_type: profile.account_type,
        })
        .eq('id', profile.id);
      if (error) throw error;
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading loading-dots loading-lg" />;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!profile) return <div>No profile</div>;

  return (
    <div className="max-w-2xl mx-auto card bg-base-100 shadow">
      <div className="card-body space-y-3">
        <h1 className="card-title">Account</h1>
        <label className="form-control">
          <span className="label-text">Full Name</span>
          <input className="input input-bordered" value={profile.full_name ?? ''} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
        </label>
        <label className="form-control">
          <span className="label-text">Phone</span>
          <input className="input input-bordered" value={profile.phone ?? ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
        </label>
        <label className="form-control">
          <span className="label-text">Company</span>
          <input className="input input-bordered" value={profile.company_name ?? ''} onChange={(e) => setProfile({ ...profile, company_name: e.target.value })} />
        </label>
        <label className="form-control">
          <span className="label-text">Namibian ID</span>
          <input className="input input-bordered" value={profile.namibian_id ?? ''} onChange={(e) => setProfile({ ...profile, namibian_id: e.target.value })} />
        </label>
        <label className="form-control">
          <span className="label-text">Account Type</span>
          <select className="select select-bordered" value={profile.account_type ?? 'individual'} onChange={(e) => setProfile({ ...profile, account_type: e.target.value })}>
            <option value="individual">Individual</option>
            <option value="business">Business</option>
            <option value="enterprise">Enterprise</option>
            <option value="government">Government</option>
          </select>
        </label>
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={save} disabled={loading}>{loading ? 'Saving…' : 'Save'}</button>
          <a className="btn" href="/dashboard">Back</a>
        </div>
      </div>
    </div>
  );
}

