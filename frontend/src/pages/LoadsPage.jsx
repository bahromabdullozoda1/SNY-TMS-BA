import { useEffect, useMemo, useState } from 'react';

const moneyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});

const emptyLoad = {
  loadNumber: '',
  shipper: '',
  receiver: '',
  pickupLocation: '',
  deliveryLocation: '',
  pickupDate: '',
  deliveryDate: '',
  status: 'new',
  priority: 'medium',
  rate: 0,
  driverId: '',
  notes: '',
  files: []
};

function toFormState(load) {
  if (!load) {
    return emptyLoad;
  }

  return {
    loadNumber: load.loadNumber || '',
    shipper: load.shipper || '',
    receiver: load.receiver || '',
    pickupLocation: load.pickupLocation || '',
    deliveryLocation: load.deliveryLocation || '',
    pickupDate: load.pickupDate || '',
    deliveryDate: load.deliveryDate || '',
    status: load.status || 'new',
    priority: load.priority || 'medium',
    rate: load.rate || 0,
    driverId: load.driverId || '',
    notes: load.notes || '',
    files: load.files || []
  };
}

export function LoadsPage({ loads, drivers, canManage, selectedLoadId, isSaving, onSelectLoad, onStartNewLoad, onSaveLoad }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [driverFilter, setDriverFilter] = useState('');
  const [form, setForm] = useState(emptyLoad);

  const selectedLoad = useMemo(
    () => loads.find((load) => load.id === selectedLoadId) || null,
    [loads, selectedLoadId]
  );

  useEffect(() => {
    setForm(toFormState(selectedLoad));
  }, [selectedLoad]);

  const filteredLoads = useMemo(() => loads.filter((load) => {
    const searchText = [
      load.loadNumber,
      load.shipper,
      load.receiver,
      load.pickupLocation,
      load.deliveryLocation,
      load.notes
    ].join(' ').toLowerCase();

    return (!search || searchText.includes(search.toLowerCase())) &&
      (!statusFilter || load.status === statusFilter) &&
      (!driverFilter || String(load.driverId ?? '') === driverFilter);
  }), [driverFilter, loads, search, statusFilter]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <div className="space-y-4">
      {canManage && (
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{selectedLoad ? `Edit ${selectedLoad.loadNumber}` : 'Create load'}</h3>
              <p className="text-sm text-slate-500">Manage customer, schedule, pricing, and assignment data.</p>
            </div>
            {selectedLoad && (
              <button type="button" className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700" onClick={onStartNewLoad}>
                New load
              </button>
            )}
          </div>
          <form
            className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              onSaveLoad(form, selectedLoad?.id || null);
            }}
          >
            <input className="rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Load number" value={form.loadNumber} onChange={(event) => updateField('loadNumber', event.target.value)} required />
            <input className="rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Shipper" value={form.shipper} onChange={(event) => updateField('shipper', event.target.value)} />
            <input className="rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Receiver" value={form.receiver} onChange={(event) => updateField('receiver', event.target.value)} />
            <input className="rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Pickup location" value={form.pickupLocation} onChange={(event) => updateField('pickupLocation', event.target.value)} required />
            <input className="rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Delivery location" value={form.deliveryLocation} onChange={(event) => updateField('deliveryLocation', event.target.value)} required />
            <input className="rounded-lg border border-slate-300 px-3 py-2 text-sm" type="date" value={form.pickupDate} onChange={(event) => updateField('pickupDate', event.target.value)} />
            <input className="rounded-lg border border-slate-300 px-3 py-2 text-sm" type="date" value={form.deliveryDate} onChange={(event) => updateField('deliveryDate', event.target.value)} />
            <input className="rounded-lg border border-slate-300 px-3 py-2 text-sm" type="number" min="0" step="100" value={form.rate} onChange={(event) => updateField('rate', event.target.value)} />
            <select className="rounded-lg border border-slate-300 px-3 py-2 text-sm" value={form.status} onChange={(event) => updateField('status', event.target.value)}>
              <option value="new">new</option>
              <option value="in_progress">in_progress</option>
              <option value="delivered">delivered</option>
              <option value="cancelled">cancelled</option>
            </select>
            <select className="rounded-lg border border-slate-300 px-3 py-2 text-sm" value={form.priority} onChange={(event) => updateField('priority', event.target.value)}>
              <option value="high">high</option>
              <option value="medium">medium</option>
              <option value="low">low</option>
            </select>
            <select className="rounded-lg border border-slate-300 px-3 py-2 text-sm md:col-span-2" value={form.driverId} onChange={(event) => updateField('driverId', event.target.value)}>
              <option value="">Unassigned driver</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>{driver.name}</option>
              ))}
            </select>
            <textarea className="rounded-lg border border-slate-300 px-3 py-2 text-sm md:col-span-2" rows={3} placeholder="Notes" value={form.notes} onChange={(event) => updateField('notes', event.target.value)} />
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 md:col-span-2" type="submit" disabled={isSaving}>
              {selectedLoad ? 'Save load changes' : 'Create load'}
            </button>
          </form>
        </section>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input className="rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Search loads" value={search} onChange={(event) => setSearch(event.target.value)} />
          <select className="rounded-lg border border-slate-300 px-3 py-2 text-sm" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">All statuses</option>
            <option value="new">new</option>
            <option value="in_progress">in_progress</option>
            <option value="delivered">delivered</option>
            <option value="cancelled">cancelled</option>
          </select>
          <select className="rounded-lg border border-slate-300 px-3 py-2 text-sm" value={driverFilter} onChange={(event) => setDriverFilter(event.target.value)}>
            <option value="">All drivers</option>
            {drivers.map((driver) => (
              <option key={driver.id} value={driver.id}>{driver.name}</option>
            ))}
          </select>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left">Load</th>
                <th className="px-3 py-2 text-left">Route</th>
                <th className="px-3 py-2 text-left">Driver</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Pickup</th>
                <th className="px-3 py-2 text-left">Rate</th>
              </tr>
            </thead>
            <tbody>
              {filteredLoads.map((load) => (
                <tr
                  key={load.id}
                  className={`cursor-pointer border-t ${selectedLoadId === load.id ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
                  onClick={() => onSelectLoad(load.id)}
                >
                  <td className="px-3 py-2">
                    <div className="font-medium text-slate-900">{load.loadNumber}</div>
                    <div className="text-xs text-slate-500">{load.priority}</div>
                  </td>
                  <td className="px-3 py-2">{load.pickupLocation} → {load.deliveryLocation}</td>
                  <td className="px-3 py-2">{drivers.find((driver) => driver.id === load.driverId)?.name || 'Unassigned'}</td>
                  <td className="px-3 py-2 uppercase text-xs tracking-wide text-slate-600">{load.status.replace('_', ' ')}</td>
                  <td className="px-3 py-2">{load.pickupDate || '—'}</td>
                  <td className="px-3 py-2">{moneyFormatter.format(Number(load.rate || 0))}</td>
                </tr>
              ))}
              {filteredLoads.length === 0 && (
                <tr>
                  <td className="px-3 py-6 text-center text-slate-500" colSpan="6">No loads match the current filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
