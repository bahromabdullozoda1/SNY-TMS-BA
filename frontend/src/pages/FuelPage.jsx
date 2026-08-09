import { useState } from 'react';

const USD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

const FUEL_TYPES = ['diesel', 'gasoline', 'def', 'other'];
const FUEL_CARDS = ['EFS', 'Comdata', 'WEX', 'Fuelman', 'Cash', 'Other'];

const emptyForm = {
  date: new Date().toISOString().slice(0, 10),
  time: '',
  driverId: '',
  truckId: '',
  loadId: '',
  location: '',
  city: '',
  state: '',
  gallons: '',
  pricePerGallon: '',
  totalCost: '',
  odometer: '',
  fuelType: 'diesel',
  fuelCard: 'EFS',
  transactionNumber: '',
  notes: ''
};

export function FuelPage({ fuel, drivers, trucks, loads, canManage, isSaving, onSaveFuel, onDeleteFuel }) {
  const [search, setSearch] = useState('');
  const [driverFilter, setDriverFilter] = useState('');
  const [truckFilter, setTruckFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const transactions = fuel?.transactions || [];
  const summary = fuel?.summary || {};

  const filtered = transactions.filter((f) => {
    const q = search.toLowerCase();
    const dMatch = !driverFilter || String(f.driverId) === driverFilter;
    const tMatch = !truckFilter || String(f.truckId) === truckFilter;
    const sMatch = !q || [f.location, f.city, f.state, f.driverName, f.truckNumber, f.transactionNumber].join(' ').toLowerCase().includes(q);
    return dMatch && tMatch && sMatch;
  });

  function startNew() {
    setEditing('new');
    setForm(emptyForm);
  }

  function startEdit(item) {
    setEditing(item.id);
    setForm({
      date: item.date || '',
      time: item.time || '',
      driverId: item.driverId || '',
      truckId: item.truckId || '',
      loadId: item.loadId || '',
      location: item.location || '',
      city: item.city || '',
      state: item.state || '',
      gallons: item.gallons || '',
      pricePerGallon: item.pricePerGallon || '',
      totalCost: item.totalCost || '',
      odometer: item.odometer || '',
      fuelType: item.fuelType || 'diesel',
      fuelCard: item.fuelCard || 'EFS',
      transactionNumber: item.transactionNumber || '',
      notes: item.notes || ''
    });
  }

  function set(field, value) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'gallons' || field === 'pricePerGallon') {
        const g = parseFloat(field === 'gallons' ? value : prev.gallons) || 0;
        const p = parseFloat(field === 'pricePerGallon' ? value : prev.pricePerGallon) || 0;
        next.totalCost = g > 0 && p > 0 ? (g * p).toFixed(2) : next.totalCost;
      }
      return next;
    });
  }

  function handleSave(e) {
    e.preventDefault();
    onSaveFuel(form, editing === 'new' ? null : editing);
    setEditing(null);
  }

  if (editing !== null) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">{editing === 'new' ? 'Add Fuel Transaction' : 'Edit Fuel Transaction'}</h3>
          <button type="button" onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
          <Field label="Date *" value={form.date} onChange={(v) => set('date', v)} type="date" required />
          <Field label="Time" value={form.time} onChange={(v) => set('time', v)} type="time" />
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
              {loads.filter((l) => !['delivered','cancelled'].includes(l.status)).map((l) => <option key={l.id} value={l.id}>{l.loadNumber}</option>)}
            </select>
          </div>
          <Field label="Location Name" value={form.location} onChange={(v) => set('location', v)} />
          <Field label="City" value={form.city} onChange={(v) => set('city', v)} />
          <Field label="State" value={form.state} onChange={(v) => set('state', v)} />
          <Field label="Gallons *" value={form.gallons} onChange={(v) => set('gallons', v)} type="number" required />
          <Field label="Price / Gallon *" value={form.pricePerGallon} onChange={(v) => set('pricePerGallon', v)} type="number" required />
          <Field label="Total Cost" value={form.totalCost} onChange={(v) => set('totalCost', v)} type="number" />
          <Field label="Odometer" value={form.odometer} onChange={(v) => set('odometer', v)} type="number" />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fuel Type</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.fuelType} onChange={(e) => set('fuelType', e.target.value)}>
              {FUEL_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fuel Card</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.fuelCard} onChange={(e) => set('fuelCard', e.target.value)}>
              {FUEL_CARDS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <Field label="Transaction #" value={form.transactionNumber} onChange={(v) => set('transactionNumber', v)} />
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
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <SummaryCard label="Total Gallons" value={Number(summary.totalGallons || 0).toLocaleString()} />
        <SummaryCard label="Total Cost" value={USD.format(summary.totalCost || 0)} />
        <SummaryCard label="Avg Price / Gal" value={`$${Number(summary.avgPricePerGallon || 0).toFixed(3)}`} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm" value={driverFilter} onChange={(e) => setDriverFilter(e.target.value)}>
          <option value="">All Drivers</option>
          {drivers.map((d) => <option key={d.id} value={String(d.id)}>{d.name}</option>)}
        </select>
        <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm" value={truckFilter} onChange={(e) => setTruckFilter(e.target.value)}>
          <option value="">All Trucks</option>
          {trucks.map((t) => <option key={t.id} value={String(t.id)}>{t.unitNumber}</option>)}
        </select>
        {canManage && (
          <button type="button" onClick={startNew} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap">+ Add Fuel</button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">No fuel transactions found.</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Driver</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Truck</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Location</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Gallons</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">$/Gal</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Total</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Card</th>
                {canManage && <th className="px-4 py-3"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-700">{item.date}</td>
                  <td className="px-4 py-3 text-slate-700">{item.driverName || '—'}</td>
                  <td className="px-4 py-3 text-slate-700">{item.truckNumber || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{[item.city, item.state].filter(Boolean).join(', ') || item.location || '—'}</td>
                  <td className="px-4 py-3 text-slate-700">{Number(item.gallons || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-700">${Number(item.pricePerGallon || 0).toFixed(3)}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{USD.format(item.totalCost || 0)}</td>
                  <td className="px-4 py-3 text-slate-600">{item.fuelCard || '—'}</td>
                  {canManage && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button type="button" onClick={() => startEdit(item)} className="text-xs text-blue-600 hover:underline">Edit</button>
                        {confirmDeleteId === item.id ? (
                          <>
                            <button type="button" onClick={() => { onDeleteFuel(item.id); setConfirmDeleteId(null); }} className="text-xs text-red-600 font-medium hover:underline">Confirm</button>
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

function SummaryCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">{label}</p>
      <p className="text-xl font-bold text-slate-900 mt-1">{value}</p>
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
