const moneyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});

export function ReportsPage({ summary, loads, drivers }) {
  if (!summary) {
    return <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">Reports are unavailable for this account or failed to load.</p>;
  }

  const netRevenue = Number(summary.financial.revenue || 0) - Number(summary.financial.expenses || 0);
  const topDriver = [...summary.driverPerformance].sort((left, right) => right.completedLoads - left.completedLoads)[0];
  const recentLoads = [...loads]
    .sort((left, right) => new Date(right.updatedAt || right.createdAt || 0) - new Date(left.updatedAt || left.createdAt || 0))
    .slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Revenue</p><p className="mt-2 text-2xl font-semibold text-slate-900">{moneyFormatter.format(summary.financial.revenue || 0)}</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Expenses</p><p className="mt-2 text-2xl font-semibold text-slate-900">{moneyFormatter.format(summary.financial.expenses || 0)}</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Net revenue</p><p className="mt-2 text-2xl font-semibold text-slate-900">{moneyFormatter.format(netRevenue)}</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Top driver</p><p className="mt-2 text-lg font-semibold text-slate-900">{topDriver?.name || '—'}</p><p className="text-sm text-slate-500">{topDriver?.completedLoads || 0} delivered loads</p></div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-lg font-semibold text-slate-900">Status breakdown</h3>
          <div className="mt-4 space-y-3">
            {Object.entries(summary.statusBreakdown).map(([status, count]) => (
              <div key={status}>
                <div className="mb-1 flex items-center justify-between text-sm text-slate-700">
                  <span className="capitalize">{status.replace('_', ' ')}</span>
                  <span>{count}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-blue-600"
                    style={{ width: `${Math.max(10, (count / Math.max(loads.length, 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="text-lg font-semibold text-slate-900">Driver performance</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left">Driver</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Delivered loads</th>
                </tr>
              </thead>
              <tbody>
                {summary.driverPerformance.map((driver) => (
                  <tr key={driver.driverId} className="border-t">
                    <td className="px-3 py-2 font-medium text-slate-900">{driver.name}</td>
                    <td className="px-3 py-2 uppercase text-xs tracking-wide text-slate-600">{driver.status.replace('_', ' ')}</td>
                    <td className="px-3 py-2">{driver.completedLoads}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-slate-500">{drivers.length} drivers currently tracked in the system.</p>
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-lg font-semibold text-slate-900">Recently updated loads</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left">Load</th>
                <th className="px-3 py-2 text-left">Driver</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Updated</th>
              </tr>
            </thead>
            <tbody>
              {recentLoads.map((load) => (
                <tr key={load.id} className="border-t">
                  <td className="px-3 py-2 font-medium text-slate-900">{load.loadNumber}</td>
                  <td className="px-3 py-2">{drivers.find((driver) => driver.id === load.driverId)?.name || 'Unassigned'}</td>
                  <td className="px-3 py-2 uppercase text-xs tracking-wide text-slate-600">{load.status.replace('_', ' ')}</td>
                  <td className="px-3 py-2">{new Date(load.updatedAt || load.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {recentLoads.length === 0 && (
                <tr>
                  <td className="px-3 py-6 text-center text-slate-500" colSpan="4">No loads available yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
