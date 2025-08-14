// Dashboard page skeleton per Wireframes. Location: apps/web/app/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex gap-2">
          <a className="btn btn-primary" href="/documents/new">New Document</a>
          <a className="btn" href="/templates">Templates</a>
          <a className="btn" href="/account">Settings</a>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat bg-base-100 shadow">
          <div className="stat-title">Pending</div>
          <div className="stat-value">3</div>
        </div>
        <div className="stat bg-base-100 shadow">
          <div className="stat-title">Completed</div>
          <div className="stat-value">15</div>
        </div>
        <div className="stat bg-base-100 shadow">
          <div className="stat-title">This Month</div>
          <div className="stat-value">8</div>
        </div>
        <div className="stat bg-base-100 shadow">
          <div className="stat-title">Templates</div>
          <div className="stat-value">5</div>
        </div>
      </div>
      <div className="card bg-base-100 shadow">
        <div className="card-body">
          <div className="card-title">Recent Documents</div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Document Name</th>
                  <th>Recipients</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>🟡 Pending</td>
                  <td>Employment Contract - John Doe</td>
                  <td>John Doe</td>
                  <td>Dec 10</td>
                  <td><a className="btn btn-xs">View</a></td>
                </tr>
                <tr>
                  <td>✅ Complete</td>
                  <td>NDA Agreement - ABC Corp</td>
                  <td>ABC Corp</td>
                  <td>Dec 8</td>
                  <td><a className="btn btn-xs">Download</a></td>
                </tr>
                <tr>
                  <td>🟡 Pending</td>
                  <td>Service Agreement - XYZ Ltd</td>
                  <td>XYZ Ltd</td>
                  <td>Dec 5</td>
                  <td><a className="btn btn-xs">View</a></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

