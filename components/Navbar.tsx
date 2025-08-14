// Navbar component for BuffrSign web app. Purpose: Provide top navigation consistent with Wireframes and TRD. Location: components/Navbar.tsx
import { getServerSupabase } from '../apps/web/src/lib/supabaseServer';

export default async function Navbar() {
  const supabase = getServerSupabase();
  const {
    data: { user }
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } } as any;

  return (
    <header className="navbar bg-base-100 border-b">
      <div className="flex-1 px-2 text-xl font-bold">
        <a href="/">BuffrSign</a>
      </div>
      <div className="flex-none gap-2">
        <a className="btn btn-ghost" href="/status">Status</a>
        <a className="btn btn-ghost" href="/documents">Documents</a>
        <a className="btn btn-ghost" href="/templates">Templates</a>
        <a className="btn btn-ghost" href="/templates/generate-smart">AI Templates</a>
        <a className="btn btn-ghost" href="/documents/new">New Document</a>
        {user ? (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost">
              {user.email}
            </div>
            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
              <li><a href="/dashboard">Dashboard</a></li>
              <li><a href="/account">Account</a></li>
              <li><a href="/documents/new">New Document</a></li>
              <li><a href="/documents">Documents</a></li>
              <li><a href="/templates">Templates</a></li>
              <li><a href="/logout">Sign out</a></li>
            </ul>
          </div>
        ) : (
          <a className="btn" href="/login">Sign in</a>
        )}
      </div>
    </header>
  );
}

