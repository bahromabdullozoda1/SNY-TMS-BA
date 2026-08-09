import { useState } from 'react';

const USD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const TYPE_OPTIONS = [
  { value: 'broker', label: 'Broker' },
  { value: 'customer', label: 'Customer' },
  { value: 'shipper', label: 'Shipper' },
  { value: 'receiver', label: 'Receiver' }
];

const TYPE_BADGE = {
  broker: 'bg-violet-100 text-violet-800',
  customer: 'bg-blue-100 text-blue-800',
  shipper: 'bg-amber-100 text-amber-800',
  receiver: 'bg-emerald-100 text-emerald-800'
};

const emptyForm = {
  companyName: '', type: 'broker', mcNumber: '', dotNumber: '', phone: '', email: '',
  address: '', city: '', state: '', zip: '', contactPerson: '', paymentTerms: 'Net 30',
  creditLimit: '', factoringStatus: 'none', notes: ''
};

export function CustomersPage({ customers, canManage, isSaving, onSaveCustomer, onDeleteCustomer }) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    const tMatch = !typeFilter || c.type === typeFilter;
    const sMatch = !q || [c.companyName, c.contactPerson, c.email, c.mcNumber, c.city, c.state].join(' ').toLowerCase().includes(q);
    return tMatch && sMatch;
  });

  function startNew() { setEditing('new'); setForm(emptyForm); }

  function startEdit(c) {
    setEditing(c.id);
    setForm({
      companyName: c.companyName || '', type: c.type || 'broker', mcNumber: c.mcNumber || '',
      dotNumber: c.dotNumber || '', phone: c.phone || '', email: c.email || '',
      address: c.address || '', city: c.city || '', state: c.state || '', zip: c.zip || '',
      contactPerson: c.contactPerson || '', paymentTerms: c.paymentTerms || 'Net 30',
      creditLimit: c.creditLimit || '', factoringStatus: c.factoringStatus || 'none', notes: c.notes || ''
    });
  }

  function set(field, value) { setForm((prev) => ({ ...prev, [field]: value })); }

  function handleSave(e) {
    e.preventDefault();
    onSaveCustomer(form, editing === 'new' ? null : editing);
    setEditing(null);
  }

  if (editing !== null) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">{editing === 'new' ? 'Add Customer / Broker' : 'Edit Customer / Broker'}</h3>
          <button type="button" onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
          <Field label="Company Name *" value={form.companyName} onChange={(v) => set('companyName', v)} required />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.type} onChange={(e) => set('type', e.target.value)}>
              {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <Field label="MC Number" value={form.mcNumber} onChange={(v) => set('mcNumber', v)} />
          <Field label="DOT Number" value={form.dotNumber} onChange={(v) => set('dotNumber', v)} />
          <Field label="Phone" value={form.phone} onChange={(v) => set('phone', v)} type="tel" />
          <Field label="Email" value={form.email} onChange={(v) => set('email', v)} type="email" />
          <Field label="Contact Person" value={form.contactPerson} onChange={(v) => set('contactPerson', v)} />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Payment Terms</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.paymentTerms} onChange={(e) => set('paymentTerms', e.target.value)}>
              {['Net 15','Net 21','Net 30','Net 45','Net 60','Quick Pay','Factored'].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <Field label="Credit Limit" value={form.creditLimit} onChange={(v) => set('creditLimit', v)} type="number" />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Factoring Status</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.factoringStatus} onChange={(e) => set('factoringStatus', e.target.value)}>
              <option value="none">None</option>
              <option value="factored">Factored</option>
              <option value="quick_pay">Quick Pay</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
            <input className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.address} onChange={(e) => set('address', e.target.value)} />
          </div>
          <Field label="City" value={form.city} onChange={(v) => set('city', v)} />
          <Field label="State" value={form.state} onChange={(v) => set('state', v)} />
          <Field label="ZIP" value={form.zip} onChange={(v) => set('zip', v)} />
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
      <div className="flex flex-col sm:flex-row gap-3">
        <input className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="Search customers & brokers…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        {canManage && (
          <button type="button" onClick={startNew} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap">+ Add</button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">No customers or brokers found.</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Company</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Contact</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">MC#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Location</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Loads</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Revenue</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Avg RPM</th>
                {canManage && <th className="px-4 py-3"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">{c.companyName}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_BADGE[c.type] || 'bg-slate-100 text-slate-600'}`}>
                      {TYPE_OPTIONS.find((o) => o.value === c.type)?.label || c.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{c.contactPerson || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{c.mcNumber || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{[c.city, c.state].filter(Boolean).join(', ') || '—'}</td>
                  <td className="px-4 py-3 text-slate-700">{c.totalLoads || 0}</td>
                  <td className="px-4 py-3 text-slate-700">{USD.format(c.totalRevenue || 0)}</td>
                  <td className="px-4 py-3 text-slate-600">${c.avgRpm || '0.000'}</td>
                  {canManage && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button type="button" onClick={() => startEdit(c)} className="text-xs text-blue-600 hover:underline">Edit</button>
                        {confirmDeleteId === c.id ? (
                          <>
                            <button type="button" onClick={() => { onDeleteCustomer(c.id); setConfirmDeleteId(null); }} className="text-xs text-red-600 font-medium hover:underline">Confirm</button>
                            <button type="button" onClick={() => setConfirmDeleteId(null)} className="text-xs text-slate-500 hover:underline">Cancel</button>
                          </>
                        ) : (
                          <button type="button" onClick={() => setConfirmDeleteId(c.id)} className="text-xs text-red-500 hover:underline">Delete</button>
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
