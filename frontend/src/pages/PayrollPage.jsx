import { useState } from 'react';

const USD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

const STATUS_BADGE = {
  draft: 'bg-slate-100 text-slate-700',
  pending: 'bg-amber-100 text-amber-800',
  paid: 'bg-emerald-100 text-emerald-800',
  void: 'bg-red-100 text-red-700'
};

const today = new Date().toISOString().slice(0, 10);
const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString().slice(0, 10);

const emptyForm = {
  driverId: '',
  periodStart: twoWeeksAgo,
  periodEnd: today,
  loadIds: [],
  loadsCompleted: 0,
  grossLoadRevenue: '',
  payType: 'percentage',
  payRate: '',
  driverGrossPay: '',
  advances: '',
  fuelDeductions: '',
  tollDeductions: '',
  otherDeductions: '',
  reimbursements: '',
  bonuses: '',
  adjustments: '',
  netDriverPay: '',
  paymentStatus: 'draft',
  paidDate: '',
  notes: ''
};

export function PayrollPage({ payroll, drivers, canManage, isSaving, onSavePayroll, onDeletePayroll, onPreviewPayroll }) {
  const [driverFilter, setDriverFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [previewing, setPreviewing] = useState(false);

  const filtered = payroll.filter((s) => {
    const dMatch = !driverFilter || String(s.driverId) === driverFilter;
    const sMatch = !statusFilter || s.paymentStatus === statusFilter;
    return dMatch && sMatch;
  });

  function set(field, value) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // Auto-calculate net pay
      const gross = parseFloat(next.driverGrossPay) || 0;
      const deductions = (parseFloat(next.fuelDeductions) || 0) + (parseFloat(next.tollDeductions) || 0) +
        (parseFloat(next.advances) || 0) + (parseFloat(next.otherDeductions) || 0);
      const additions = (parseFloat(next.reimbursements) || 0) + (parseFloat(next.bonuses) || 0) + (parseFloat(next.adjustments) || 0);
      next.netDriverPay = (gross - deductions + additions).toFixed(2);
      return next;
    });
  }

  function startNew() { setEditing('new'); setForm(emptyForm); }

  function startEdit(s) {
    setEditing(s.id);
    setForm({
      driverId: s.driverId || '', periodStart: s.periodStart || '', periodEnd: s.periodEnd || '',
      loadIds: s.loadIds || [], loadsCompleted: s.loadsCompleted || 0,
      grossLoadRevenue: s.grossLoadRevenue || '', payType: s.payType || 'percentage',
      payRate: s.payRate || '', driverGrossPay: s.driverGrossPay || '',
      advances: s.advances || '', fuelDeductions: s.fuelDeductions || '',
      tollDeductions: s.tollDeductions || '', otherDeductions: s.otherDeductions || '',
      reimbursements: s.reimbursements || '', bonuses: s.bonuses || '',
      adjustments: s.adjustments || '', netDriverPay: s.netDriverPay || '',
      paymentStatus: s.paymentStatus || 'draft', paidDate: s.paidDate || '', notes: s.notes || ''
    });
  }

  async function handlePreview() {
    if (!form.driverId || !form.periodStart || !form.periodEnd) return;
    setPreviewing(true);
    try {
      const preview = await onPreviewPayroll(form.driverId, form.periodStart, form.periodEnd);
      if (preview) {
        setForm((prev) => ({
          ...prev,
          loadsCompleted: preview.loadsCompleted || 0,
          grossLoadRevenue: preview.grossLoadRevenue || '',
          payType: preview.payType || prev.payType,
          payRate: preview.payRate || prev.payRate,
          driverGrossPay: preview.driverGrossPay?.toFixed(2) || '',
          fuelDeductions: preview.fuelDeductions?.toFixed(2) || '',
          tollDeductions: preview.tollDeductions?.toFixed(2) || '',
          netDriverPay: preview.netDriverPay?.toFixed(2) || '',
          loadIds: preview.loadIds || []
        }));
      }
    } finally {
      setPreviewing(false);
    }
  }

  function handleSave(e) {
    e.preventDefault();
    onSavePayroll(form, editing === 'new' ? null : editing);
    setEditing(null);
  }

  if (editing !== null) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">{editing === 'new' ? 'Create Pay Statement' : 'Edit Pay Statement'}</h3>
          <button type="button" onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Driver *</label>
              <select required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.driverId} onChange={(e) => set('driverId', e.target.value)}>
                <option value="">Select driver…</option>
                {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <Field label="Period Start *" value={form.periodStart} onChange={(v) => set('periodStart', v)} type="date" required />
            <Field label="Period End *" value={form.periodEnd} onChange={(v) => set('periodEnd', v)} type="date" required />
          </div>
          <div>
            <button type="button" onClick={handlePreview} disabled={previewing || !form.driverId}
              className="text-sm border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 disabled:opacity-50">
              {previewing ? 'Loading…' : '⚡ Auto-fill from loads'}
            </button>
            {form.loadsCompleted > 0 && (
              <span className="ml-3 text-sm text-slate-500">{form.loadsCompleted} loads found for this period</span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Gross Load Revenue" value={form.grossLoadRevenue} onChange={(v) => set('grossLoadRevenue', v)} type="number" />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pay Type</label>
              <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.payType} onChange={(e) => set('payType', e.target.value)}>
                <option value="percentage">Percentage</option>
                <option value="per_mile">Per Mile</option>
                <option value="flat">Flat Rate</option>
                <option value="salary">Salary</option>
              </select>
            </div>
            <Field label="Pay Rate / %" value={form.payRate} onChange={(v) => set('payRate', v)} type="number" />
            <Field label="Driver Gross Pay" value={form.driverGrossPay} onChange={(v) => set('driverGrossPay', v)} type="number" />
            <Field label="Advances" value={form.advances} onChange={(v) => set('advances', v)} type="number" />
            <Field label="Fuel Deductions" value={form.fuelDeductions} onChange={(v) => set('fuelDeductions', v)} type="number" />
            <Field label="Toll Deductions" value={form.tollDeductions} onChange={(v) => set('tollDeductions', v)} type="number" />
            <Field label="Other Deductions" value={form.otherDeductions} onChange={(v) => set('otherDeductions', v)} type="number" />
            <Field label="Reimbursements" value={form.reimbursements} onChange={(v) => set('reimbursements', v)} type="number" />
            <Field label="Bonuses" value={form.bonuses} onChange={(v) => set('bonuses', v)} type="number" />
            <Field label="Adjustments" value={form.adjustments} onChange={(v) => set('adjustments', v)} type="number" />
            <div className="bg-slate-50 rounded-lg p-3 flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Net Driver Pay</span>
              <span className="text-xl font-bold text-slate-900">{USD.format(form.netDriverPay || 0)}</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Payment Status</label>
              <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.paymentStatus} onChange={(e) => set('paymentStatus', e.target.value)}>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="void">Void</option>
              </select>
            </div>
            <Field label="Paid Date" value={form.paidDate} onChange={(v) => set('paidDate', v)} type="date" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isSaving} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-60">
              {isSaving ? 'Saving…' : 'Save Statement'}
            </button>
            <button type="button" onClick={() => setEditing(null)} className="border border-slate-300 px-5 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm" value={driverFilter} onChange={(e) => setDriverFilter(e.target.value)}>
          <option value="">All Drivers</option>
          {drivers.map((d) => <option key={d.id} value={String(d.id)}>{d.name}</option>)}
        </select>
        <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="void">Void</option>
        </select>
        {canManage && (
          <button type="button" onClick={startNew} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap">+ Create Statement</button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">No payroll statements found.</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Driver</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Period</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Loads</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Gross Revenue</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Gross Pay</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Net Pay</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Status</th>
                {canManage && <th className="px-4 py-3"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{s.driverName || `Driver #${s.driverId}`}</td>
                  <td className="px-4 py-3 text-slate-600">{s.periodStart} → {s.periodEnd}</td>
                  <td className="px-4 py-3 text-slate-700">{s.loadsCompleted}</td>
                  <td className="px-4 py-3 text-slate-700">{USD.format(s.grossLoadRevenue || 0)}</td>
                  <td className="px-4 py-3 text-slate-700">{USD.format(s.driverGrossPay || 0)}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{USD.format(s.netDriverPay || 0)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[s.paymentStatus] || 'bg-slate-100 text-slate-600'}`}>
                      {s.paymentStatus}
                    </span>
                  </td>
                  {canManage && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button type="button" onClick={() => startEdit(s)} className="text-xs text-blue-600 hover:underline">Edit</button>
                        {confirmDeleteId === s.id ? (
                          <>
                            <button type="button" onClick={() => { onDeletePayroll(s.id); setConfirmDeleteId(null); }} className="text-xs text-red-600 font-medium hover:underline">Confirm</button>
                            <button type="button" onClick={() => setConfirmDeleteId(null)} className="text-xs text-slate-500 hover:underline">Cancel</button>
                          </>
                        ) : (
                          <button type="button" onClick={() => setConfirmDeleteId(s.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', required = false }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input type={type} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={value} onChange={(e) => onChange(e.target.value)} required={required} />
    </div>
  );
}
