import { useState } from 'react';

const STATUS_BADGE = {
  available: 'bg-emerald-100 text-emerald-800',
  assigned: 'bg-blue-100 text-blue-800',
  maintenance: 'bg-amber-100 text-amber-800',
  out_of_service: 'bg-red-100 text-red-800'
};

const STATUS_OPTIONS = [
  { value: 'available', label: 'Available' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'maintenance', label: 'In Maintenance' },
  { value: 'out_of_service', label: 'Out of Service' }
];

const TRAILER_TYPES = [
  { value: 'dry_van', label: 'Dry Van' },
  { value: 'reefer', label: 'Reefer' },
  { value: 'flatbed', label: 'Flatbed' },
  { value: 'step_deck', label: 'Step Deck' },
  { value: 'power_only', label: 'Power Only' },
  { value: 'other', label: 'Other' }
];

const emptyTrailer = {
  trailerNumber: '', vin: '', trailerType: 'dry_van', make: '', model: '', year: '',
  plate: '', plateState: '', registrationExpiration: '',
  assignedTruckId: '', assignedDriverId: '', status: 'available', notes: ''
};

export function TrailersPage({ trailers, trucks, drivers, canManage, isSaving, onSaveTrailer, onDeleteTrailer }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyTrailer);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const filtered = trailers.filter((t) => {
    const q = search.toLowerCase();
    const statusMatch = !statusFilter || t.status === statusFilter;
    const searchMatch = !q || [t.trailerNumber, t.make, t.model, t.vin, t.plate].join(' ').toLowerCase().includes(q);
    return statusMatch && searchMatch;
  });

  function startNew() {
    setEditing('new');
    setForm(emptyTrailer);
  }

  function startEdit(trailer) {
    setEditing(trailer.id);
    setForm({
      trailerNumber: trailer.trailerNumber || '',
      vin: trailer.vin || '',
      trailerType: trailer.trailerType || 'dry_van',
      make: trailer.make || '',
      model: trailer.model || '',
      year: trailer.year || '',
      plate: trailer.plate || '',
      plateState: trailer.plateState || '',
      registrationExpiration: trailer.registrationExpiration || '',
      assignedTruckId: trailer.assignedTruckId || '',
      assignedDriverId: trailer.assignedDriverId || '',
      status: trailer.status || 'available',
      notes: trailer.notes || ''
    });
  }

  function handleSave(e) {
    e.preventDefault();
    onSaveTrailer(form, editing === 'new' ? null : editing);
    setEditing(null);
  }

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  if (editing !== null) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">{editing === 'new' ? 'Add Trailer' : 'Edit Trailer'}</h3>
          <button type="button" onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
          <Field label="Trailer Number *" value={form.trailerNumber} onChange={(v) => set('trailerNumber', v)} required />
          <Field label="VIN" value={form.vin} onChange={(v) => set('vin', v)} />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Trailer Type</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.trailerType} onChange={(e) => set('trailerType', e.target.value)}>
              {TRAILER_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <Field label="Make" value={form.make} onChange={(v) => set('make', v)} />
          <Field label="Model" value={form.model} onChange={(v) => set('model', v)} />
          <Field label="Year" value={form.year} onChange={(v) => set('year', v)} type="number" />
          <Field label="Plate Number" value={form.plate} onChange={(v) => set('plate', v)} />
          <Field label="Plate State" value={form.plateState} onChange={(v) => set('plateState', v)} />
          <Field label="Reg. Expiration" value={form.registrationExpiration} onChange={(v) => set('registrationExpiration', v)} type="date" />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Truck</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.assignedTruckId} onChange={(e) => set('assignedTruckId', e.target.value)}>
              <option value="">— None —</option>
              {trucks.map((t) => <option key={t.id} value={t.id}>{t.unitNumber}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Driver</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.assignedDriverId} onChange={(e) => set('assignedDriverId', e.target.value)}>
              <option value="">— None —</option>
              {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
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
              {isSaving ? 'Saving…' : 'Save Trailer'}
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
        <input className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="Search trailers…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {canManage && (
          <button type="button" onClick={startNew} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap">+ Add Trailer</button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">No trailers found.</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Trailer #</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Make / Model</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Truck</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Driver</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Reg. Exp</th>
                {canManage && <th className="px-4 py-3"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((trailer) => (
                <tr key={trailer.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">{trailer.trailerNumber}</td>
                  <td className="px-4 py-3 text-slate-600">{TRAILER_TYPES.find((t) => t.value === trailer.trailerType)?.label || trailer.trailerType}</td>
                  <td className="px-4 py-3 text-slate-700">{trailer.year} {trailer.make} {trailer.model}</td>
                  <td className="px-4 py-3 text-slate-600">{trailer.assignedTruckNumber || <span className="text-slate-400">—</span>}</td>
                  <td className="px-4 py-3 text-slate-600">{trailer.assignedDriverName || <span className="text-slate-400">—</span>}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[trailer.status] || 'bg-slate-100 text-slate-600'}`}>
                      {STATUS_OPTIONS.find((o) => o.value === trailer.status)?.label || trailer.status}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-sm ${trailer.registrationExpiration && trailer.registrationExpiration < new Date().toISOString().slice(0,10) ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
                    {trailer.registrationExpiration || '—'}
                  </td>
                  {canManage && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button type="button" onClick={() => startEdit(trailer)} className="text-xs text-blue-600 hover:underline">Edit</button>
                        {confirmDeleteId === trailer.id ? (
                          <>
                            <button type="button" onClick={() => { onDeleteTrailer(trailer.id); setConfirmDeleteId(null); }} className="text-xs text-red-600 font-medium hover:underline">Confirm</button>
                            <button type="button" onClick={() => setConfirmDeleteId(null)} className="text-xs text-slate-500 hover:underline">Cancel</button>
                          </>
                        ) : (
                          <button type="button" onClick={() => setConfirmDeleteId(trailer.id)} className="text-xs text-red-500 hover:underline">Delete</button>
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
