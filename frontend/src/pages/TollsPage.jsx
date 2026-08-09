import { useState } from 'react';

const USD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

const TRANSPONDERS = ['Bestpass', 'PrePass', 'EZPass', 'SunPass', 'TxTag', 'Cash', 'Other'];

const emptyForm = {
  date: new Date().toISOString().slice(0, 10),
  driverId: '',
  truckId: '',
  loadId: '',
  tollAuthority: '',
  tollRoad: '',
  entryLocation: '',
  exitLocation: '',
  state: '',
  amount: '',
  transponder: 'Bestpass',
  notes: ''
};

export function TollsPage({ tolls, drivers, trucks, loads, canManage, isSaving, onSaveToll, onDeleteToll }) {
  const [search, setSearch] = useState('');
  const [driverFilter, setDriverFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const transactions = tolls?.transactions || [];
  const summary = tolls?.summary || {};

  const filtered = transactions.filter((t) => {
    const q = search.toLowerCase();
    const dMatch = !driverFilter || String(t.driverId) === driverFilter;
    const sMatch = !q || [t.tollRoad, t.tollAuthority, t.state, t.driverName, t.truckNumber].join(' ').toLowerCase().includes(q);
    return dMatch && sMatch;
  });

  function startNew() { setEditing('new'); setForm(emptyForm); }
  function startEdit(item) {
    setEditing(item.id);
    setForm({
      date: item.date || '', driverId: item.driverId || '', truckId: item.truckId || '',
      loadId: item.loadId || '', tollAuthority: item.tollAuthority || '', tollRoad: item.tollRoad || '',
      entryLocation: item.entryLocation || '', exitLocation: item.exitLocation || '',
      state: item.state || '', amount: item.amount || '', transponder: item.transponder || 'Bestpass', notes: item.notes || ''
    });
  }
  function set(field, value) { setForm((prev) => ({ ...prev, [field]: value })); }

  function handleSave(e) {
    e.preventDefault();
    onSaveToll(form, editing === 'new' ? null : editing);
    setEditing(null);
  }

  if (editing !== null) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">{editing === 'new' ? 'Add Toll' : 'Edit Toll'}</h3>
          <button type="button" onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
          <Field label="Date *" value={form.date} onChange={(v) => set('date', v)} type="date" required />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Driver *</label>
            <select required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.driverId} onChange={(e) => set('driverId', e.target.value)}>
              <option value="">Select driver…</option>
              {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Truck *</label>
            <select required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.truckId} onChange={(e) => set('truckId', e.target.value)}>
              <option value="">Select truck…</option>
              {trucks.map((t) => <option key={t.id} value={t.id}>{t.unitNumber}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Load (optional)</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.loadId} onChange={(e) => set('loadId', e.target.value)}>
              <option value="">— None —</option>
              {loads.map((l) => <option key={l.id} value={l.id}>{l.loadNumber}</option>)}
            </select>
          </div>
          <Field label="Toll Authority" value={form.tollAuthority} onChange={(v) => set('tollAuthority', v)} />
          <Field label="Toll Road / Name" value={form.tollRoad} onChange={(v) => set('tollRoad', v)} />
          <Field label="Entry Location" value={form.entryLocation} onChange={(v) => set('entryLocation', v)} />
          <Field label="Exit Location" value={form.exitLocation} onChange={(v) => set('exitLocation', v)} />
          <Field label="State" value={form.state} onChange={(v) => set('state', v)} />
          <Field label="Amount *" value={form.amount} onChange={(v) => set('amount', v)} type="number" required />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Transponder</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.transponder} onChange={(e) => set('transponder', e.target.value)}>
              {TRANSPONDERS.map((t) => <option key={t} value={t}>{t}</option>)}
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
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Total Transactions</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{transactions.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Total Amount</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{USD.format(summary.totalAmount || 0)}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="Search tolls…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm" value={driverFilter} onChange={(e) => setDriverFilter(e.target.value)}>
          <option value="">All Drivers</option>
          {drivers.map((d) => <option key={d.id} value={String(d.id)}>{d.name}</option>)}
        </select>
        {canManage && (
          <button type="button" onClick={startNew} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap">+ Add Toll</button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">No toll transactions found.</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Driver</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Truck</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Toll Road</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">State</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Load</th>
                {canManage && <th className="px-4 py-3"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-700">{item.date}</td>
                  <td className="px-4 py-3 text-slate-700">{item.driverName || '—'}</td>
                  <td className="px-4 py-3 text-slate-700">{item.truckNumber || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{item.tollRoad || item.tollAuthority || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{item.state || '—'}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{USD.format(item.amount || 0)}</td>
                  <td className="px-4 py-3 text-slate-600">{item.loadNumber || '—'}</td>
                  {canManage && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button type="button" onClick={() => startEdit(item)} className="text-xs text-blue-600 hover:underline">Edit</button>
                        {confirmDeleteId === item.id ? (
                          <>
                            <button type="button" onClick={() => { onDeleteToll(item.id); setConfirmDeleteId(null); }} className="text-xs text-red-600 font-medium hover:underline">Confirm</button>
                            <button type="button" onClick={() => setConfirmDeleteId(null)} className="text-xs text-slate-500 hover:underline">Cancel</button>
                          </>
                        ) : (
                          <button type="button" onClick={() => setConfirmDeleteId(item.id)} className="text-xs text-red-500 hover:underline">Delete</button>
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
