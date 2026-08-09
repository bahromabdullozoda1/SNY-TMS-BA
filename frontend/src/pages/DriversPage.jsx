import { useState } from 'react';

const STATUS_BADGE = {
  available: 'bg-emerald-100 text-emerald-800',
  on_load: 'bg-blue-100 text-blue-800',
  off_duty: 'bg-slate-100 text-slate-700',
  vacation: 'bg-amber-100 text-amber-800',
  suspended: 'bg-red-100 text-red-800'
};

const DRIVER_STATUS_OPTIONS = [
  { value: 'available', label: 'Available' },
  { value: 'on_load', label: 'On Load' },
  { value: 'off_duty', label: 'Off Duty' },
  { value: 'vacation', label: 'Vacation' },
  { value: 'suspended', label: 'Suspended' }
];

const EMPLOYMENT_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' }
];

const CDL_CLASSES = ['A','B','C'];

const PAY_TYPES = [
  { value: 'percentage', label: 'Percentage' },
  { value: 'per_mile', label: 'Per Mile' },
  { value: 'flat', label: 'Flat Rate / Load' },
  { value: 'salary', label: 'Salary' }
];

const emptyDriver = {
  firstName: '', lastName: '', phone: '', email: '',
  address: '', city: '', state: '', zip: '',
  emergencyContactName: '', emergencyContactPhone: '',
  hireDate: '', terminationDate: '', employmentStatus: 'active', status: 'available',
  cdlNumber: '', cdlState: '', cdlClass: 'A', cdlExpiration: '',
  medicalCardExpiration: '', mvrExpiration: '', drugTestDate: '', clearinghouseStatus: 'clear',
  assignedTruckId: '', assignedTrailerId: '', dispatcher: '', homeTerminal: '',
  payType: 'percentage', payRate: '',
  notes: ''
};

const USD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function Field({ label, value, onChange, type = 'text', disabled = false, required = false }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input
        type={type}
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
      />
    </div>
  );
}

function SectionHeader({ label }) {
  return <p className="col-span-2 text-xs font-semibold text-slate-500 uppercase tracking-widest mt-2 border-b border-slate-100 pb-1">{label}</p>;
}

export function DriversPage({ drivers, trucks = [], trailers = [], canManage, isSaving, onSaveDriver, onDeleteDriver }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyDriver);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const filtered = drivers.filter((d) => {
    const q = search.toLowerCase();
    const sMatch = !statusFilter || d.status === statusFilter;
    const qMatch = !q || [d.name, d.firstName, d.lastName, d.phone, d.email, d.cdlNumber].join(' ').toLowerCase().includes(q);
    return sMatch && qMatch;
  });

  function startNew() { setEditing('new'); setForm(emptyDriver); }

  function startEdit(driver) {
    setEditing(driver.id);
    setForm({
      firstName: driver.firstName || driver.name?.split(' ')[0] || '',
      lastName: driver.lastName || driver.name?.split(' ').slice(1).join(' ') || '',
      phone: driver.phone || '', email: driver.email || '',
      address: driver.address || '', city: driver.city || '',
      state: driver.state || '', zip: driver.zip || '',
      emergencyContactName: driver.emergencyContactName || '',
      emergencyContactPhone: driver.emergencyContactPhone || '',
      hireDate: driver.hireDate || '', terminationDate: driver.terminationDate || '',
      employmentStatus: driver.employmentStatus || 'active', status: driver.status || 'available',
      cdlNumber: driver.cdlNumber || '', cdlState: driver.cdlState || '',
      cdlClass: driver.cdlClass || 'A', cdlExpiration: driver.cdlExpiration || '',
      medicalCardExpiration: driver.medicalCardExpiration || '',
      mvrExpiration: driver.mvrExpiration || '', drugTestDate: driver.drugTestDate || '',
      clearinghouseStatus: driver.clearinghouseStatus || 'clear',
      assignedTruckId: driver.assignedTruckId || '',
      assignedTrailerId: driver.assignedTrailerId || '',
      dispatcher: driver.dispatcher || '', homeTerminal: driver.homeTerminal || '',
      payType: driver.payType || 'percentage', payRate: driver.payRate || '',
      notes: driver.notes || ''
    });
  }

  function set(field, value) { setForm((prev) => ({ ...prev, [field]: value })); }

  function handleSave(e) {
    e.preventDefault();
    onSaveDriver(form, editing === 'new' ? null : editing);
    setEditing(null);
  }

  if (editing !== null) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">{editing === 'new' ? 'Add Driver' : 'Edit Driver'}</h3>
          <button type="button" onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        <form onSubmit={handleSave} className="grid grid-cols-2 gap-x-6 gap-y-4">
          <SectionHeader label="Personal Information" />
          <Field label="First Name *" value={form.firstName} onChange={(v) => set('firstName', v)} required />
          <Field label="Last Name *" value={form.lastName} onChange={(v) => set('lastName', v)} required />
          <Field label="Phone" value={form.phone} onChange={(v) => set('phone', v)} type="tel" />
          <Field label="Email" value={form.email} onChange={(v) => set('email', v)} type="email" />
          <div className="col-span-2">
            <Field label="Street Address" value={form.address} onChange={(v) => set('address', v)} />
          </div>
          <Field label="City" value={form.city} onChange={(v) => set('city', v)} />
          <Field label="State" value={form.state} onChange={(v) => set('state', v)} />
          <Field label="ZIP" value={form.zip} onChange={(v) => set('zip', v)} />
          <Field label="Emergency Contact Name" value={form.emergencyContactName} onChange={(v) => set('emergencyContactName', v)} />
          <Field label="Emergency Contact Phone" value={form.emergencyContactPhone} onChange={(v) => set('emergencyContactPhone', v)} type="tel" />

          <SectionHeader label="Employment" />
          <Field label="Hire Date" value={form.hireDate} onChange={(v) => set('hireDate', v)} type="date" />
          <Field label="Termination Date" value={form.terminationDate} onChange={(v) => set('terminationDate', v)} type="date" />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Employment Status</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.employmentStatus} onChange={(e) => set('employmentStatus', e.target.value)}>
              {EMPLOYMENT_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Driver Status</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.status} onChange={(e) => set('status', e.target.value)}>
              {DRIVER_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <SectionHeader label="License & Compliance" />
          <Field label="CDL Number" value={form.cdlNumber} onChange={(v) => set('cdlNumber', v)} />
          <Field label="CDL State" value={form.cdlState} onChange={(v) => set('cdlState', v)} />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">CDL Class</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.cdlClass} onChange={(e) => set('cdlClass', e.target.value)}>
              {CDL_CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <Field label="CDL Expiration" value={form.cdlExpiration} onChange={(v) => set('cdlExpiration', v)} type="date" />
          <Field label="Medical Card Expiration" value={form.medicalCardExpiration} onChange={(v) => set('medicalCardExpiration', v)} type="date" />
          <Field label="MVR Expiration" value={form.mvrExpiration} onChange={(v) => set('mvrExpiration', v)} type="date" />
          <Field label="Drug Test Date" value={form.drugTestDate} onChange={(v) => set('drugTestDate', v)} type="date" />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Clearinghouse Status</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.clearinghouseStatus} onChange={(e) => set('clearinghouseStatus', e.target.value)}>
              <option value="clear">Clear</option>
              <option value="prohibited">Prohibited</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <SectionHeader label="Assignment" />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Truck</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.assignedTruckId} onChange={(e) => set('assignedTruckId', e.target.value)}>
              <option value="">— None —</option>
              {trucks.map((t) => <option key={t.id} value={t.id}>{t.unitNumber}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Trailer</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.assignedTrailerId} onChange={(e) => set('assignedTrailerId', e.target.value)}>
              <option value="">— None —</option>
              {trailers.map((t) => <option key={t.id} value={t.id}>{t.trailerNumber}</option>)}
            </select>
          </div>
          <Field label="Dispatcher" value={form.dispatcher} onChange={(v) => set('dispatcher', v)} />
          <Field label="Home Terminal" value={form.homeTerminal} onChange={(v) => set('homeTerminal', v)} />

          <SectionHeader label="Pay" />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Pay Type</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.payType} onChange={(e) => set('payType', e.target.value)}>
              {PAY_TYPES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          <Field label="Pay Rate / %" value={form.payRate} onChange={(v) => set('payRate', v)} type="number" />

          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
          </div>
          <div className="col-span-2 flex gap-3 pt-2">
            <button type="submit" disabled={isSaving} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-60">
              {isSaving ? 'Saving…' : 'Save Driver'}
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
        <input className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="Search drivers…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {DRIVER_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {canManage && (
          <button type="button" onClick={startNew} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap">+ Add Driver</button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">No drivers found.</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Driver</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Truck</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">CDL Exp</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Med Exp</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Pay Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Revenue</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Loads</th>
                {canManage && <th className="px-4 py-3"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((driver) => {
                const today = new Date().toISOString().slice(0, 10);
                const cdlExpired = driver.cdlExpiration && driver.cdlExpiration < today;
                const medExpired = driver.medicalCardExpiration && driver.medicalCardExpiration < today;
                return (
                  <tr key={driver.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{driver.name}</div>
                      <div className="text-xs text-slate-500">{driver.phone || driver.email || ''}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[driver.status] || 'bg-slate-100 text-slate-600'}`}>
                        {DRIVER_STATUS_OPTIONS.find((o) => o.value === driver.status)?.label || driver.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{driver.assignedTruckNumber || <span className="text-slate-400">—</span>}</td>
                    <td className={`px-4 py-3 text-sm ${cdlExpired ? 'text-red-600 font-medium' : 'text-slate-600'}`}>{driver.cdlExpiration || '—'}</td>
                    <td className={`px-4 py-3 text-sm ${medExpired ? 'text-red-600 font-medium' : 'text-slate-600'}`}>{driver.medicalCardExpiration || '—'}</td>
                    <td className="px-4 py-3 text-slate-600 capitalize">{driver.payType ? driver.payType.replace('_',' ') : '—'} {driver.payRate ? `(${driver.payRate}${driver.payType === 'percentage' ? '%' : ''})` : ''}</td>
                    <td className="px-4 py-3 text-slate-700">{USD.format(driver.revenueGenerated || 0)}</td>
                    <td className="px-4 py-3 text-slate-600">{driver.loadsCount || 0}</td>
                    {canManage && (
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button type="button" onClick={() => startEdit(driver)} className="text-xs text-blue-600 hover:underline">Edit</button>
                          {confirmDeleteId === driver.id ? (
                            <>
                              <button type="button" onClick={() => { onDeleteDriver(driver.id); setConfirmDeleteId(null); }} className="text-xs text-red-600 font-medium hover:underline">Confirm</button>
                              <button type="button" onClick={() => setConfirmDeleteId(null)} className="text-xs text-slate-500 hover:underline">Cancel</button>
                            </>
                          ) : (
                            <button type="button" onClick={() => setConfirmDeleteId(driver.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
