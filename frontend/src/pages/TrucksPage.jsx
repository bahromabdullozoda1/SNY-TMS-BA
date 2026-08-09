import { useState } from 'react';

const STATUS_BADGE = {
  available: 'bg-emerald-100 text-emerald-800',
  dispatched: 'bg-blue-100 text-blue-800',
  maintenance: 'bg-amber-100 text-amber-800',
  out_of_service: 'bg-red-100 text-red-800',
  sold: 'bg-slate-100 text-slate-600'
};

const STATUS_OPTIONS = [
  { value: 'available', label: 'Available' },
  { value: 'dispatched', label: 'Dispatched' },
  { value: 'maintenance', label: 'In Maintenance' },
  { value: 'out_of_service', label: 'Out of Service' },
  { value: 'sold', label: 'Sold' }
];

const OWNERSHIP_OPTIONS = [
  { value: 'company', label: 'Company-Owned' },
  { value: 'owner_operator', label: 'Owner-Operator' },
  { value: 'lease', label: 'Lease' }
];

const emptyTruck = {
  unitNumber: '', vin: '', make: '', model: '', year: '',
  licensePlate: '', plateState: '', registrationExpiration: '',
  insuranceExpiration: '', iftaNumber: '', currentOdometer: '',
  startingOdometer: '', assignedDriverId: '', assignedTrailerId: '',
  ownershipType: 'company', status: 'available', notes: ''
};

const USD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export function TrucksPage({ trucks, drivers, trailers, canManage, isSaving, onSaveTruck, onDeleteTruck }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyTruck);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const filtered = trucks.filter((t) => {
    const q = search.toLowerCase();
    const statusMatch = !statusFilter || t.status === statusFilter;
    const searchMatch = !q || [t.unitNumber, t.make, t.model, t.vin, t.licensePlate].join(' ').toLowerCase().includes(q);
    return statusMatch && searchMatch;
  });

  function startNew() {
    setEditing('new');
    setForm(emptyTruck);
  }

  function startEdit(truck) {
    setEditing(truck.id);
    setForm({
      unitNumber: truck.unitNumber || '',
      vin: truck.vin || '',
      make: truck.make || '',
      model: truck.model || '',
      year: truck.year || '',
      licensePlate: truck.licensePlate || '',
      plateState: truck.plateState || '',
      registrationExpiration: truck.registrationExpiration || '',
      insuranceExpiration: truck.insuranceExpiration || '',
      iftaNumber: truck.iftaNumber || '',
      currentOdometer: truck.currentOdometer || '',
      startingOdometer: truck.startingOdometer || '',
      assignedDriverId: truck.assignedDriverId || '',
      assignedTrailerId: truck.assignedTrailerId || '',
      ownershipType: truck.ownershipType || 'company',
      status: truck.status || 'available',
      notes: truck.notes || ''
    });
  }

  function handleSave(e) {
    e.preventDefault();
    onSaveTruck(form, editing === 'new' ? null : editing);
    setEditing(null);
  }

  function handleDelete(id) {
    onDeleteTruck(id);
    setConfirmDeleteId(null);
  }

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  if (editing !== null) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">{editing === 'new' ? 'Add Truck' : 'Edit Truck'}</h3>
          <button type="button" onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
          <Field label="Unit Number *" value={form.unitNumber} onChange={(v) => set('unitNumber', v)} required />
          <Field label="VIN" value={form.vin} onChange={(v) => set('vin', v)} />
          <Field label="Make" value={form.make} onChange={(v) => set('make', v)} />
          <Field label="Model" value={form.model} onChange={(v) => set('model', v)} />
          <Field label="Year" value={form.year} onChange={(v) => set('year', v)} type="number" />
          <Field label="License Plate" value={form.licensePlate} onChange={(v) => set('licensePlate', v)} />
          <Field label="Plate State" value={form.plateState} onChange={(v) => set('plateState', v)} />
          <Field label="Reg. Expiration" value={form.registrationExpiration} onChange={(v) => set('registrationExpiration', v)} type="date" />
          <Field label="Insurance Expiration" value={form.insuranceExpiration} onChange={(v) => set('insuranceExpiration', v)} type="date" />
          <Field label="IFTA Number" value={form.iftaNumber} onChange={(v) => set('iftaNumber', v)} />
          <Field label="Starting Odometer" value={form.startingOdometer} onChange={(v) => set('startingOdometer', v)} type="number" />
          <Field label="Current Odometer" value={form.currentOdometer} onChange={(v) => set('currentOdometer', v)} type="number" />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Driver</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.assignedDriverId} onChange={(e) => set('assignedDriverId', e.target.value)}>
              <option value="">— None —</option>
              {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Trailer</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.assignedTrailerId} onChange={(e) => set('assignedTrailerId', e.target.value)}>
              <option value="">— None —</option>
              {trailers.map((t) => <option key={t.id} value={t.id}>{t.trailerNumber}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ownership</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.ownershipType} onChange={(e) => set('ownershipType', e.target.value)}>
              {OWNERSHIP_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.status} onChange={(e) => set('status', e.target.value)}>
              {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
          </div>
          <div className="col-span-2 flex gap-3 pt-2">
            <button type="submit" disabled={isSaving} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-60">
              {isSaving ? 'Saving…' : 'Save Truck'}
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
        <input
          className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
          placeholder="Search trucks…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {canManage && (
          <button type="button" onClick={startNew} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap">
            + Add Truck
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
          No trucks found.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Unit</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Make / Model</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Driver</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Odometer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Revenue</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Reg. Exp</th>
                {canManage && <th className="px-4 py-3"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((truck) => (
                <tr key={truck.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">{truck.unitNumber}</td>
                  <td className="px-4 py-3 text-slate-700">{truck.year} {truck.make} {truck.model}</td>
                  <td className="px-4 py-3 text-slate-600">{truck.assignedDriverName || <span className="text-slate-400">Unassigned</span>}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[truck.status] || 'bg-slate-100 text-slate-600'}`}>
                      {STATUS_OPTIONS.find((o) => o.value === truck.status)?.label || truck.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{(truck.currentOdometer || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-700">{USD.format(truck.totalRevenue || 0)}</td>
                  <td className={`px-4 py-3 text-sm ${truck.registrationExpiration && truck.registrationExpiration < new Date().toISOString().slice(0,10) ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
                    {truck.registrationExpiration || '—'}
                  </td>
                  {canManage && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button type="button" onClick={() => startEdit(truck)} className="text-xs text-blue-600 hover:underline">Edit</button>
                        {confirmDeleteId === truck.id ? (
                          <>
                            <button type="button" onClick={() => handleDelete(truck.id)} className="text-xs text-red-600 font-medium hover:underline">Confirm</button>
                            <button type="button" onClick={() => setConfirmDeleteId(null)} className="text-xs text-slate-500 hover:underline">Cancel</button>
                          </>
                        ) : (
                          <button type="button" onClick={() => setConfirmDeleteId(truck.id)} className="text-xs text-red-500 hover:underline">Delete</button>
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
      <input
        type={type}
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </div>
  );
}
