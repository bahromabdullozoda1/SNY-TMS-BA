import { getWeekDays } from '../utils/date';

function statusTone(status) {
  return {
    new: 'bg-amber-100 border-amber-300 text-amber-900',
    assigned: 'bg-sky-100 border-sky-300 text-sky-900',
    in_transit: 'bg-blue-100 border-blue-300 text-blue-900',
    in_progress: 'bg-blue-100 border-blue-300 text-blue-900',
    at_pickup: 'bg-violet-100 border-violet-300 text-violet-900',
    loaded: 'bg-indigo-100 border-indigo-300 text-indigo-900',
    at_delivery: 'bg-teal-100 border-teal-300 text-teal-900',
    delivered: 'bg-emerald-100 border-emerald-300 text-emerald-900',
    invoiced: 'bg-green-100 border-green-300 text-green-900',
    cancelled: 'bg-rose-100 border-rose-300 text-rose-900'
  }[status] || 'bg-slate-100 border-slate-300 text-slate-900';
}

export function DispatchBoard({ drivers, loads, filters, canManage, onFiltersChange, onSelectLoad, onMoveLoad, selectedLoadId }) {
  const days = getWeekDays(filters.weekStart ? new Date(filters.weekStart) : new Date());

  const filteredLoads = loads.filter((load) => {
    const statusMatch = !filters.status || load.status === filters.status;
    const driverMatch = !filters.driverId || Number(filters.driverId) === load.driverId;
    const searchText = `${load.loadNumber} ${load.pickupLocation} ${load.deliveryLocation}`.toLowerCase();
    const searchMatch = !filters.search || searchText.includes(filters.search.toLowerCase());
    return statusMatch && driverMatch && searchMatch;
  });

  const byDriverAndDay = (driverId, dayKey) => filteredLoads.filter((load) => load.driverId === driverId && load.pickupDate === dayKey);
  const unassignedLoads = filteredLoads.filter((load) => !load.driverId || !days.some((day) => day.key === load.pickupDate));

  function handleDrop(event, driverId, dayKey) {
    if (!canManage) {
      return;
    }

    const loadId = Number(event.dataTransfer.getData('loadId'));
    if (loadId) {
      onMoveLoad(loadId, driverId, dayKey);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <input
          placeholder="Search loads"
          value={filters.search}
          onChange={(event) => onFiltersChange({ ...filters, search: event.target.value })}
          className="border rounded px-3 py-2 text-sm"
        />
        <select
          className="border rounded px-3 py-2 text-sm"
          value={filters.status}
          onChange={(event) => onFiltersChange({ ...filters, status: event.target.value })}
        >
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="assigned">Assigned</option>
          <option value="in_transit">In Transit</option>
          <option value="at_pickup">At Pickup</option>
          <option value="loaded">Loaded</option>
          <option value="at_delivery">At Delivery</option>
          <option value="delivered">Delivered</option>
          <option value="invoiced">Invoiced</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          className="border rounded px-3 py-2 text-sm"
          value={filters.driverId}
          onChange={(event) => onFiltersChange({ ...filters, driverId: event.target.value })}
        >
          <option value="">All drivers</option>
          {drivers.map((driver) => (
            <option key={driver.id} value={driver.id}>{driver.name}</option>
          ))}
        </select>
        <input
          type="date"
          className="border rounded px-3 py-2 text-sm"
          value={filters.weekStart}
          onChange={(event) => onFiltersChange({ ...filters, weekStart: event.target.value })}
        />
      </div>

      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="font-medium text-slate-900">Unassigned / unscheduled loads</h3>
            <p className="text-xs text-slate-500">Drag these loads onto the board to assign a driver and pickup date.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{unassignedLoads.length}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {unassignedLoads.length === 0 && <p className="text-sm text-slate-500">All visible loads are already scheduled.</p>}
          {unassignedLoads.map((load) => (
            <button
              key={load.id}
              type="button"
              draggable={canManage}
              onDragStart={(event) => event.dataTransfer.setData('loadId', String(load.id))}
              onClick={() => onSelectLoad(load.id)}
              className={`rounded-lg border px-3 py-2 text-left ${
                selectedLoadId === load.id ? 'border-slate-900 bg-slate-100' : statusTone(load.status)
              }`}
            >
              <div className="font-medium">{load.loadNumber}</div>
              <div className="text-xs">{load.pickupLocation} → {load.deliveryLocation}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="text-left p-2 border-r">Drivers</th>
              {days.map((day) => (
                <th key={day.key} className="p-2 border-r min-w-40">
                  <div>{day.shortDay}</div>
                  <div className="text-xs text-slate-500">{day.label}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver) => (
              <tr key={driver.id} className="align-top border-t">
                <td className="p-2 border-r bg-slate-50">
                  <div className="font-medium">{driver.name}</div>
                  <div className="text-xs text-slate-500">{driver.status}</div>
                </td>
                {days.map((day) => (
                  <td
                    key={`${driver.id}-${day.key}`}
                    className="p-2 border-r h-28"
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => handleDrop(event, driver.id, day.key)}
                  >
                    <div className="space-y-1">
                      {byDriverAndDay(driver.id, day.key).map((load) => (
                        <button
                          key={load.id}
                          type="button"
                          draggable={canManage}
                          onDragStart={(event) => event.dataTransfer.setData('loadId', String(load.id))}
                          onClick={() => onSelectLoad(load.id)}
                          className={`w-full text-left p-2 rounded border ${selectedLoadId === load.id ? 'border-slate-900 ring-1 ring-slate-900' : statusTone(load.status)}`}
                        >
                          <div className="font-medium">{load.loadNumber}</div>
                          <div className="text-xs">{load.pickupLocation} → {load.deliveryLocation}</div>
                          <div className="mt-1 text-[11px] uppercase tracking-wide">{load.status.replace('_', ' ')}</div>
                        </button>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
