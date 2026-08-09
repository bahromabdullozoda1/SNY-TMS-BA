import { useState } from 'react';

const USD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const PCT = (v) => `${Number(v || 0).toFixed(1)}%`;

function SummaryCard({ label, value, color = 'text-slate-900' }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">{label}</p>
      <p className={`text-xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2">{title}</h3>
      {children}
    </div>
  );
}

export function ReportsPage({ summary, loads, drivers }) {
  const [dateRange, setDateRange] = useState('month');

  if (!summary) {
    return <div className="text-sm text-slate-500 py-8 text-center">Loading reports…</div>;
  }

  const { financial = {}, loadPerformance = {}, driverPerformance = [], truckPerformance = [], customerPerformance = [], statusBreakdown = {} } = summary;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3 items-center">
        <span className="text-sm font-medium text-slate-700">Date Range:</span>
        {['today','week','month','quarter','year'].map((r) => (
          <button key={r} type="button" onClick={() => setDateRange(r)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${dateRange === r ? 'bg-blue-600 text-white' : 'border border-slate-300 text-slate-600 hover:bg-slate-50'}`}>
            {r.charAt(0).toUpperCase() + r.slice(1)}
          </button>
        ))}
      </div>

      <Section title="Financial Summary">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard label="Gross Revenue" value={USD.format(financial.grossRevenue || 0)} color="text-emerald-700" />
          <SummaryCard label="Driver Pay" value={USD.format(financial.driverPay || 0)} color="text-blue-700" />
          <SummaryCard label="Gross Profit" value={USD.format(financial.grossProfit || 0)} color="text-indigo-700" />
          <SummaryCard label="Net Profit" value={USD.format(financial.netProfit || 0)} color={(financial.netProfit || 0) >= 0 ? 'text-emerald-700' : 'text-red-600'} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard label="Fuel Expense" value={USD.format(financial.fuelExpenses || 0)} />
          <SummaryCard label="Toll Expense" value={USD.format(financial.tollExpenses || 0)} />
          <SummaryCard label="Maintenance" value={USD.format(financial.maintExpenses || 0)} />
          <SummaryCard label="Other Expenses" value={USD.format(financial.otherExpenses || 0)} />
        </div>
      </Section>

      <Section title="Load Performance">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard label="Loads Completed" value={loadPerformance.totalLoads || 0} />
          <SummaryCard label="Avg Rate / Load" value={USD.format(loadPerformance.avgRate || 0)} />
          <SummaryCard label="Revenue per Mile" value={`$${Number(loadPerformance.avgRpm || 0).toFixed(3)}`} />
          <SummaryCard label="Cost per Mile" value={`$${Number(loadPerformance.avgCostPerMile || 0).toFixed(3)}`} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <SummaryCard label="Total Miles" value={Number(loadPerformance.totalMiles || 0).toLocaleString()} />
          <SummaryCard label="Avg Gross Margin" value={PCT(loadPerformance.avgMargin)} />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Loads by Status</p>
          <div className="flex flex-wrap gap-3">
            {Object.entries(statusBreakdown).map(([status, count]) => (
              <div key={status} className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700 capitalize">{status.replace(/_/g, ' ')}</span>
                <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2 py-0.5 rounded-full">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Driver Performance">
        {driverPerformance.length === 0 ? <p className="text-sm text-slate-500">No driver data.</p> : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['Driver','Loads','Revenue','Driver Pay','Loaded Mi','Dead Mi','Total Mi'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {driverPerformance.map((d) => (
                  <tr key={d.driverId} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{d.name}</td>
                    <td className="px-4 py-3 text-slate-700">{d.completedLoads}</td>
                    <td className="px-4 py-3 text-slate-700">{USD.format(d.revenue || 0)}</td>
                    <td className="px-4 py-3 text-slate-700">{USD.format(d.driverPay || 0)}</td>
                    <td className="px-4 py-3 text-slate-600">{(d.loadedMiles || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-600">{(d.deadheadMiles || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-600">{(d.totalMiles || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section title="Truck Performance">
        {truckPerformance.length === 0 ? <p className="text-sm text-slate-500">No truck data.</p> : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['Truck','Loads','Revenue','Miles','Fuel Cost','Maint Cost','Rev/Mile','Cost/Mile'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {truckPerformance.map((t) => (
                  <tr key={t.truckId} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{t.unitNumber}</td>
                    <td className="px-4 py-3 text-slate-700">{t.loads}</td>
                    <td className="px-4 py-3 text-slate-700">{USD.format(t.revenue || 0)}</td>
                    <td className="px-4 py-3 text-slate-600">{(t.miles || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-600">{USD.format(t.fuelCost || 0)}</td>
                    <td className="px-4 py-3 text-slate-600">{USD.format(t.maintCost || 0)}</td>
                    <td className="px-4 py-3 text-slate-700">${t.revenuePerMile}</td>
                    <td className="px-4 py-3 text-slate-600">${t.costPerMile}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section title="Customer & Broker Performance">
        {customerPerformance.length === 0 ? <p className="text-sm text-slate-500">No customer data.</p> : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {['Company','Type','Loads','Revenue','Avg Rate','Avg RPM'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customerPerformance.map((c) => (
                  <tr key={c.customerId} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{c.companyName}</td>
                    <td className="px-4 py-3 text-slate-600 capitalize">{c.type}</td>
                    <td className="px-4 py-3 text-slate-700">{c.loads}</td>
                    <td className="px-4 py-3 text-slate-700">{USD.format(c.revenue || 0)}</td>
                    <td className="px-4 py-3 text-slate-600">{USD.format(c.avgRate || 0)}</td>
                    <td className="px-4 py-3 text-slate-600">${c.avgRpm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </div>
  );
}
