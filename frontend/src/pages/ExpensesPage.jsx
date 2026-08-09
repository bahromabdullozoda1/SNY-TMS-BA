import { useState } from 'react';

const USD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

const EXPENSE_CATEGORIES = [
  { value: 'fuel', label: 'Fuel' },
  { value: 'tolls', label: 'Tolls' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'truck_payment', label: 'Truck Payment' },
  { value: 'trailer_payment', label: 'Trailer Payment' },
  { value: 'permits', label: 'Permits' },
  { value: 'parking', label: 'Parking' },
  { value: 'scale', label: 'Scale' },
  { value: 'lumper', label: 'Lumper' },
  { value: 'office', label: 'Office' },
  { value: 'driver_advance', label: 'Driver Advance' },
  { value: 'other', label: 'Other' }
];

const PAYMENT_METHODS = ['fuel_card', 'check', 'cash', 'ach', 'wire', 'credit_card', 'other'];

const emptyForm = {
  date: new Date().toISOString().slice(0, 10),
  category: 'fuel',
  driverId: '',
  truckId: '',
  trailerId: '',
  loadId: '',
  vendor: '',
  amount: '',
  paymentMethod: 'fuel_card',
  notes: ''
};

export function ExpensesPage({ expenses, drivers, trucks, trailers, loads, canManage, isSaving, onSaveExpense, onDeleteExpense }) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const expenseList = expenses?.expenses || [];
  const summary = expenses?.summary || {};

  const filtered = expenseList.filter((e) => {
    const q = search.toLowerCase();
    const cMatch = !categoryFilter || e.category === categoryFilter;
    const sMatch = !q || [e.vendor, e.category, e.driverName, e.truckNumber, e.loadNumber].join(' ').toLowerCase().includes(q);
    return cMatch && sMatch;
  });

  function startNew() { setEditing('new'); setForm(emptyForm); }

  function startEdit(e) {
    setEditing(e.id);
    setForm({
      date: e.date || '', category: e.category || 'fuel',
      driverId: e.driverId || '', truckId: e.truckId || '',
      trailerId: e.trailerId || '', loadId: e.loadId || '',
      vendor: e.vendor || '', amount: e.amount || '',
      paymentMethod: e.paymentMethod || 'cash', notes: e.notes || ''
    });
  }

  function set(field, value) { setForm((prev) => ({ ...prev, [field]: value })); }

  function handleSave(e) {
    e.preventDefault();
    onSaveExpense(form, editing === 'new' ? null : editing);
    setEditing(null);
  }

  if (editing !== null) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">{editing === 'new' ? 'Add Expense' : 'Edit Expense'}</h3>
          <button type="button" onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
          <Field label="Date *" value={form.date} onChange={(v) => set('date', v)} type="date" required />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.category} onChange={(e) => set('category', e.target.value)}>
              {EXPENSE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Driver</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.driverId} onChange={(e) => set('driverId', e.target.value)}>
              <option value="">— None —</option>
              {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Truck</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.truckId} onChange={(e) => set('truckId', e.target.value)}>
              <option value="">— None —</option>
              {trucks.map((t) => <option key={t.id} value={t.id}>{t.unitNumber}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Trailer</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.trailerId} onChange={(e) => set('trailerId', e.target.value)}>
              <option value="">— None —</option>
              {trailers.map((t) => <option key={t.id} value={t.id}>{t.trailerNumber}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Load</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.loadId} onChange={(e) => set('loadId', e.target.value)}>
              <option value="">— None —</option>
              {loads.map((l) => <option key={l.id} value={l.id}>{l.loadNumber}</option>)}
            </select>
          </div>
          <Field label="Vendor" value={form.vendor} onChange={(v) => set('vendor', v)} />
          <Field label="Amount *" value={form.amount} onChange={(v) => set('amount', v)} type="number" required />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.paymentMethod} onChange={(e) => set('paymentMethod', e.target.value)}>
              {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
          </div>
          <div className="col-span-2 flex gap-3 pt-2">
            <button type="submit" disabled={isSaving} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-60">
              {isSaving ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={() => setEditing(null)} className="border border-slate-300 px-5 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Total Expenses</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{USD.format(summary.totalAmount || 0)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Transactions</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{expenseList.length}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="Search expenses…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          {EXPENSE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        {canManage && (
          <button type="button" onClick={startNew} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap">+ Add Expense</button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">No expenses found.</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Vendor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Driver</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Truck</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Load</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Amount</th>
                {canManage && <th className="px-4 py-3"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-700">{e.date}</td>
                  <td className="px-4 py-3 text-slate-700 capitalize">{EXPENSE_CATEGORIES.find((c) => c.value === e.category)?.label || e.category}</td>
                  <td className="px-4 py-3 text-slate-600">{e.vendor || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{e.driverName || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{e.truckNumber || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{e.loadNumber || '—'}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{USD.format(e.amount || 0)}</td>
                  {canManage && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button type="button" onClick={() => startEdit(e)} className="text-xs text-blue-600 hover:underline">Edit</button>
                        {confirmDeleteId === e.id ? (
                          <>
                            <button type="button" onClick={() => { onDeleteExpense(e.id); setConfirmDeleteId(null); }} className="text-xs text-red-600 font-medium hover:underline">Confirm</button>
                            <button type="button" onClick={() => setConfirmDeleteId(null)} className="text-xs text-slate-500 hover:underline">Cancel</button>
                          </>
                        ) : (
                          <button type="button" onClick={() => setConfirmDeleteId(e.id)} className="text-xs text-red-500 hover:underline">Delete</button>
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
