export default function Home() {
  return (
    <div className="space-y-8">
      <div className="hero bg-base-100 rounded-xl border">
        <div className="hero-content text-center">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold">BuffrSign</h1>
            <p className="py-6 text-lg">ETA 2019 compliant digital signature platform for Namibia and Southern Africa. CRAN-ready, enterprise-grade, and e-government friendly.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a className="btn btn-primary" href="/documents/new">📄 New Document</a>
              <a className="btn" href="/dashboard">📊 Dashboard</a>
              <a className="btn" href="/templates">📋 Templates</a>
              <a className="btn btn-ghost" href="/status">System Status</a>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat bg-base-100 shadow">
          <div className="stat-title">ETA 2019</div>
          <div className="stat-value text-primary">100%</div>
          <div className="stat-desc">Compliance ready</div>
        </div>
        <div className="stat bg-base-100 shadow">
          <div className="stat-title">CRAN</div>
          <div className="stat-value">Accred.</div>
          <div className="stat-desc">Security services</div>
        </div>
        <div className="stat bg-base-100 shadow">
          <div className="stat-title">Documents</div>
          <div className="stat-value">Fast</div>
          <div className="stat-desc">Drag, place, send</div>
        </div>
        <div className="stat bg-base-100 shadow">
          <div className="stat-title">Regions</div>
          <div className="stat-value">SADC</div>
          <div className="stat-desc">Namibia-first</div>
        </div>
      </div>
    </div>
  );
}
