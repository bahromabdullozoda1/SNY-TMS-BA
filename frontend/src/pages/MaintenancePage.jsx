import { useState } from 'react';

const USD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

const SERVICE_CATEGORIES = [
  { value: 'oil_change', label: 'Oil Change' },
  { value: 'tires', label: 'Tires' },
  { value: 'brakes', label: 'Brakes' },
  { value: 'engine', label: 'Engine' },
  { value: 'transmission', label: 'Transmission' },
  { value: 'dpf', label: 'DPF' },
  { value: 'def', label: 'DEF System' },
  { value: 'pm_service', label: 'PM Service' },
  { value: 'dot_inspection', label: 'DOT Inspection' },
  { value: 'trailer_repair', label: 'Trailer Repair' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'cooling', label: 'Cooling System' },
  { value: 'other', label: 'Other' }
];

const STATUS_BADGE = {
  completed: 'bg-emerald-100 text-emerald-800',
  pending: 'bg-amber-100 text-amber-800',
  in_progress: 'bg-blue-100 text-blue-800',
  scheduled: 'bg-slate-100 text-slate-700'
};

const emptyForm = {
  vehicleType: 'truck', vehicleId: '', serviceDate: new Date().toISOString().slice(0, 10),
  serviceCategory: 'oil_change', description: '', vendor: '', odometer: '',
  laborCost: '', partsCost: '', totalCost: '', nextServiceMileage: '',
  nextServiceDate: '', status: 'completed', notes: ''
};

export function MaintenancePage({ maintenance, trucks, trailers, canManage, isSaving, onSaveMaintenance, onDeleteMaintenance }) {
  const [search, setSearch] = useState('');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const filtered = maintenance.filter((m) => {
    const q = search.toLowerCase();
    const vtMatch = !vehicleTypeFilter || m.vehicleType === vehicleTypeFilter;
    const cMatch = !categoryFilter || m.serviceCategory === categoryFilter;
    const sMatch = !q || [m.vehicleLabel, m.description, m.vendor, m.serviceCategory].join(' ').toLowerCase().includes(q);
    return vtMatch && cMatch && sMatch;
  });

  function getVehicles() {
    return form.vehicleType === 'truck' ? trucks : trailers;
  }

  function startNew() { setEditing('new'); setForm(emptyForm); }

  function startEdit(m) {
    setEditing(m.id);
    setForm({
      vehicleType: m.vehicleType || 'truck', vehicleId: m.vehicleId || '',
      serviceDate: m.serviceDate || '', serviceCategory: m.serviceCategory || 'oil_change',
      description: m.description || '', vendor: m.vendor || '', odometer: m.odometer || '',
      laborCost: m.laborCost || '', partsCost: m.partsCost || '', totalCost: m.totalCost || '',
      nextServiceMileage: m.nextServiceMileage || '', nextServiceDate: m.nextServiceDate || '',
      status: m.status || 'completed', notes: m.notes || ''
    });
  }

  function set(field, value) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'laborCost' || field === 'partsCost') {
        const l = parseFloat(field === 'laborCost' ? value : prev.laborCost) || 0;
        const p = parseFloat(field === 'partsCost' ? value : prev.partsCost) || 0;
        next.totalCost = (l + p).toFixed(2);
      }
      if (field === 'vehicleType') next.vehicleId = '';
      return next;
    });
  }

  function handleSave(e) {
    e.preventDefault();
    onSaveMaintenance(form, editing === 'new' ? null : editing);
    setEditing(null);
  }

  if (editing !== null) {
    const vehicles = getVehicles();
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">{editing === 'new' ? 'Add Maintenance Record' : 'Edit Maintenance Record'}</h3>
          <button type="button" onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle Type *</label>
            <select required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.vehicleType} onChange={(e) => set('vehicleType', e.target.value)}>
              <option value="truck">Truck</option>
              <option value="trailer">Trailer</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle *</label>
            <select required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.vehicleId} onChange={(e) => set('vehicleId', e.target.value)}>
              <option value="">Select vehicle…</option>
              {vehicles.map((v) => <option key={v.id} value={v.id}>{form.vehicleType === 'truck' ? v.unitNumber : v.trailerNumber}</option>)}
            </select>
          </div>
          <Field label="Service Date *" value={form.serviceDate} onChange={(v) => set('serviceDate', v)} type="date" required />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Service Category</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.serviceCategory} onChange={(e) => set('serviceCategory', e.target.value)}>
              {SERVICE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <Field label="Description" value={form.description} onChange={(v) => set('description', v)} />
          </div>
          <Field label="Vendor / Shop" value={form.vendor} onChange={(v) => set('vendor', v)} />
          <Field label="Odometer" value={form.odometer} onChange={(v) => set('odometer', v)} type="number" />
          <Field label="Labor Cost" value={form.laborCost} onChange={(v) => set('laborCost', v)} type="number" />
          <Field label="Parts Cost" value={form.partsCost} onChange={(v) => set('partsCost', v)} type="number" />
          <div className="bg-slate-50 rounded-lg p-3 flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Cost</span>
            <span className="text-xl font-bold text-slate-900">{USD.format(form.totalCost || 0)}</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.status} onChange={(e) => set('status', e.target.value)}>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <Field label="Next Service Mileage" value={form.nextServiceMileage} onChange={(v) => set('nextServiceMileage', v)} type="number" />
          <Field label="Next Service Date" value={form.nextServiceDate} onChange={(v) => set('nextServiceDate', v)} type="date" />
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
          </div>
          <div className="col-span-2 flex gap-3 pt-2">
            <button type="submit" disabled={isSaving} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-60">
              {isSaving ? 'Saving…' : 'Save Record'}
            </button>
            <button type="button" onClick={() => setEditing(null)} className="border border-slate-300 px-5 py-2 rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      </div>
    );
  }

  const totalCost = filtered.reduce((s, m) => s + (m.totalCost || 0), 0);
  const upcoming = maintenance.filter((m) => m.nextServiceDate && m.nextServiceDate >= new Date().toISOString().slice(0,10));

  return (
    <div className="space-y-4">
      {upcoming.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm font-medium text-amber-800">⚠ {upcoming.length} upcoming service{upcoming.length > 1 ? 's' : ''} within 30 days</p>
          <ul className="mt-2 space-y-1">
            {upcoming.slice(0, 5).map((m) => (
              <li key={m.id} className="text-xs text-amber-700">{m.vehicleLabel} — {SERVICE_CATEGORIES.find((c) => c.value === m.serviceCategory)?.label} due {m.nextServiceDate}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <input className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="Search maintenance…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm" value={vehicleTypeFilter} onChange={(e) => setVehicleTypeFilter(e.target.value)}>
          <option value="">Trucks & Trailers</option>
          <option value="truck">Trucks Only</option>
          <option value="trailer">Trailers Only</option>
        </select>
        <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          {SERVICE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        {canManage && (
          <button type="button" onClick={startNew} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap">+ Add Record</button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-3 flex gap-6">
        <div><p className="text-xs text-slate-500 uppercase">Records</p><p className="text-lg font-bold text-slate-900">{filtered.length}</p></div>
        <div><p className="text-xs text-slate-500 uppercase">Total Cost</p><p className="text-lg font-bold text-slate-900">{USD.format(totalCost)}</p></div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">No maintenance records found.</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Vehicle</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Vendor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Cost</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Next Due</th>
                {canManage && <th className="px-4 py-3"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">{m.vehicleLabel} <span className="text-xs text-slate-400">({m.vehicleType})</span></td>
                  <td className="px-4 py-3 text-slate-700">{m.serviceDate}</td>
                  <td className="px-4 py-3 text-slate-600">{SERVICE_CATEGORIES.find((c) => c.value === m.serviceCategory)?.label || m.serviceCategory}</td>
                  <td className="px-4 py-3 text-slate-600">{m.vendor || '—'}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{USD.format(m.totalCost || 0)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[m.status] || 'bg-slate-100 text-slate-600'}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-sm ${m.nextServiceDate && m.nextServiceDate <= new Date().toISOString().slice(0,10) ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
                    {m.nextServiceDate || '—'}
                  </td>
                  {canManage && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button type="button" onClick={() => startEdit(m)} className="text-xs text-blue-600 hover:underline">Edit</button>
                        {confirmDeleteId === m.id ? (
                          <>
                            <button type="button" onClick={() => { onDeleteMaintenance(m.id); setConfirmDeleteId(null); }} className="text-xs text-red-600 font-medium hover:underline">Confirm</button>
                            <button type="button" onClick={() => setConfirmDeleteId(null)} className="text-xs text-slate-500 hover:underline">Cancel</button>
                          </>
                        ) : (
                          <button type="button" onClick={() => setConfirmDeleteId(m.id)} className="text-xs text-red-500 hover:underline">Delete</button>
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
