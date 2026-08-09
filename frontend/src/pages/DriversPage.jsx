import { useEffect, useMemo, useState } from 'react';

const emptyDriver = {
  name: '',
  phone: '',
  email: '',
  status: 'active'
};

export function DriversPage({ drivers, canManage, isSaving, onSaveDriver, onDeleteDriver }) {
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const selectedDriver = useMemo(
    () => drivers.find((driver) => driver.id === selectedDriverId) || null,
    [drivers, selectedDriverId]
  );

  const [form, setForm] = useState(emptyDriver);

  useEffect(() => {
    if (selectedDriver) {
      setForm({
        name: selectedDriver.name || '',
        phone: selectedDriver.phone || '',
        email: selectedDriver.email || '',
        status: selectedDriver.status || 'active'
      });
      return;
    }

    setForm(emptyDriver);
  }, [selectedDriver]);

  const filteredDrivers = drivers.filter((driver) => {
    const searchText = [driver.name, driver.phone, driver.email].join(' ').toLowerCase();
    return (!search || searchText.includes(search.toLowerCase())) && (!statusFilter || driver.status === statusFilter);
  });

  function resetForm() {
    setSelectedDriverId(null);
    setForm(emptyDriver);
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[380px_minmax(0,1fr)] gap-4">
      {canManage && (
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{selectedDriver ? `Edit ${selectedDriver.name}` : 'Create driver'}</h3>
              <p className="text-sm text-slate-500">Track contact information, status, and assignments.</p>
            </div>
            {selectedDriver && (
              <button type="button" className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700" onClick={resetForm}>
                New driver
              </button>
            )}
          </div>
          <form
            className="mt-4 space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              onSaveDriver(form, selectedDriver?.id || null);
              resetForm();
            }}
          >
            <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Driver name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
            <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Phone" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
            <input className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Email" type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
            <select className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}>
              <option value="active">active</option>
              <option value="inactive">inactive</option>
              <option value="on_leave">on_leave</option>
            </select>
            <button className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60" type="submit" disabled={isSaving}>
              {selectedDriver ? 'Save driver changes' : 'Create driver'}
            </button>
          </form>
        </section>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <input className="rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Search drivers" value={search} onChange={(event) => setSearch(event.target.value)} />
          <select className="rounded-lg border border-slate-300 px-3 py-2 text-sm" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">All statuses</option>
            <option value="active">active</option>
            <option value="inactive">inactive</option>
            <option value="on_leave">on_leave</option>
          </select>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left">Driver</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Phone</th>
                <th className="px-3 py-2 text-left">Email</th>
                <th className="px-3 py-2 text-left">Assigned loads</th>
                {canManage && <th className="px-3 py-2 text-left">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredDrivers.map((driver) => (
                <tr key={driver.id} className="border-t hover:bg-slate-50">
                  <td className="px-3 py-2">
                    <div className="font-medium text-slate-900">{driver.name}</div>
                    <div className="text-xs text-slate-500">Rating {driver.rating || 0}</div>
                  </td>
                  <td className="px-3 py-2 uppercase text-xs tracking-wide text-slate-600">{driver.status.replace('_', ' ')}</td>
                  <td className="px-3 py-2">{driver.phone || '—'}</td>
                  <td className="px-3 py-2">{driver.email || '—'}</td>
                  <td className="px-3 py-2">{driver.loadsCount || 0}</td>
                  {canManage && (
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700"
                          onClick={() => {
                            setSelectedDriverId(driver.id);
                            setForm({
                              name: driver.name || '',
                              phone: driver.phone || '',
                              email: driver.email || '',
                              status: driver.status || 'active'
                            });
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700"
                          onClick={() => {
                            if (window.confirm(`Delete driver ${driver.name}?`)) {
                              onDeleteDriver(driver.id);
                              if (selectedDriverId === driver.id) {
                                resetForm();
                              }
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filteredDrivers.length === 0 && (
                <tr>
                  <td className="px-3 py-6 text-center text-slate-500" colSpan={canManage ? 6 : 5}>No drivers match the current filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
