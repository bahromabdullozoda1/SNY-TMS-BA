import { useState } from 'react';

const DOC_TYPES = [
  { value: 'rate_confirmation', label: 'Rate Confirmation' },
  { value: 'bol', label: 'BOL' },
  { value: 'pod', label: 'POD' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'cdl', label: 'CDL' },
  { value: 'medical_card', label: 'Medical Card' },
  { value: 'registration', label: 'Registration' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'ifta', label: 'IFTA' },
  { value: 'maintenance_invoice', label: 'Maintenance Invoice' },
  { value: 'fuel_receipt', label: 'Fuel Receipt' },
  { value: 'toll_receipt', label: 'Toll Receipt' },
  { value: 'other', label: 'Other' }
];

const LINKED_TYPES = [
  { value: 'load', label: 'Load' },
  { value: 'driver', label: 'Driver' },
  { value: 'truck', label: 'Truck' },
  { value: 'trailer', label: 'Trailer' },
  { value: 'customer', label: 'Customer / Broker' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'expense', label: 'Expense' }
];

const emptyForm = {
  name: '',
  type: 'other',
  linkedType: 'load',
  linkedId: '',
  notes: ''
};

export function DocumentsPage({ documents, loads, drivers, trucks, trailers, customers, canManage, isSaving, onSaveDocument, onDeleteDocument }) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [linkedTypeFilter, setLinkedTypeFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const filtered = documents.filter((d) => {
    const q = search.toLowerCase();
    const tMatch = !typeFilter || d.type === typeFilter;
    const ltMatch = !linkedTypeFilter || d.linkedType === linkedTypeFilter;
    const sMatch = !q || [d.name, d.notes, d.type, d.linkedType].join(' ').toLowerCase().includes(q);
    return tMatch && ltMatch && sMatch;
  });

  function getLinkedOptions() {
    switch (form.linkedType) {
      case 'load': return loads.map((l) => ({ id: l.id, label: l.loadNumber }));
      case 'driver': return drivers.map((d) => ({ id: d.id, label: d.name }));
      case 'truck': return trucks.map((t) => ({ id: t.id, label: t.unitNumber }));
      case 'trailer': return trailers.map((t) => ({ id: t.id, label: t.trailerNumber }));
      case 'customer': return customers.map((c) => ({ id: c.id, label: c.companyName }));
      default: return [];
    }
  }

  function getLinkedLabel(doc) {
    const lists = { load: loads, driver: drivers, truck: trucks, trailer: trailers, customer: customers };
    const list = lists[doc.linkedType];
    if (!list) return `#${doc.linkedId}`;
    const item = list.find((i) => i.id === doc.linkedId);
    if (!item) return `#${doc.linkedId}`;
    return item.loadNumber || item.name || item.unitNumber || item.trailerNumber || item.companyName || `#${doc.linkedId}`;
  }

  function set(field, value) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'linkedType') next.linkedId = '';
      return next;
    });
  }

  function handleSave(e) {
    e.preventDefault();
    onSaveDocument(form, editing === 'new' ? null : editing);
    setEditing(null);
  }

  if (editing !== null) {
    const linkedOptions = getLinkedOptions();
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Attach Document</h3>
          <button type="button" onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Document Name *</label>
            <input required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.name} onChange={(e) => set('name', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Document Type</label>
              <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.type} onChange={(e) => set('type', e.target.value)}>
                {DOC_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Linked To</label>
              <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.linkedType} onChange={(e) => set('linkedType', e.target.value)}>
                {LINKED_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
          {linkedOptions.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Select Record</label>
              <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" value={form.linkedId} onChange={(e) => set('linkedId', e.target.value)}>
                <option value="">— Select —</option>
                {linkedOptions.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isSaving} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-60">
              {isSaving ? 'Saving…' : 'Save Document'}
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
        <input className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="Search documents…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          {DOC_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select className="border border-slate-300 rounded-lg px-3 py-2 text-sm" value={linkedTypeFilter} onChange={(e) => setLinkedTypeFilter(e.target.value)}>
          <option value="">All Records</option>
          {LINKED_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        {canManage && (
          <button type="button" onClick={() => { setEditing('new'); setForm(emptyForm); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap">+ Attach Document</button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">No documents found.</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Document Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Linked To</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Record</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Uploaded</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Notes</th>
                {canManage && <th className="px-4 py-3"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{doc.name}</td>
                  <td className="px-4 py-3 text-slate-600">{DOC_TYPES.find((t) => t.value === doc.type)?.label || doc.type}</td>
                  <td className="px-4 py-3 text-slate-600 capitalize">{doc.linkedType || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{getLinkedLabel(doc)}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs truncate max-w-xs">{doc.notes || '—'}</td>
                  {canManage && (
                    <td className="px-4 py-3">
                      {confirmDeleteId === doc.id ? (
                        <div className="flex gap-2">
                          <button type="button" onClick={() => { onDeleteDocument(doc.id); setConfirmDeleteId(null); }} className="text-xs text-red-600 font-medium hover:underline">Confirm</button>
                          <button type="button" onClick={() => setConfirmDeleteId(null)} className="text-xs text-slate-500 hover:underline">Cancel</button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => setConfirmDeleteId(doc.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                      )}
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
