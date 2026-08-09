import { getWeekDays } from '../utils/date';

export function DispatchBoard({ drivers, loads, filters, onFiltersChange, onSelectLoad, onMoveLoad }) {
  const days = getWeekDays(filters.weekStart ? new Date(filters.weekStart) : new Date());

  const filteredLoads = loads.filter((load) => {
    const statusMatch = !filters.status || load.status === filters.status;
    const driverMatch = !filters.driverId || Number(filters.driverId) === load.driverId;
    const searchText = `${load.loadNumber} ${load.pickupLocation} ${load.deliveryLocation}`.toLowerCase();
    const searchMatch = !filters.search || searchText.includes(filters.search.toLowerCase());
    return statusMatch && driverMatch && searchMatch;
  });

  const byDriverAndDay = (driverId, dayKey) => filteredLoads.filter((load) => load.driverId === driverId && load.pickupDate === dayKey);

  function handleDrop(event, driverId, dayKey) {
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
          <option value="new">New Load</option>
          <option value="in_progress">In Progress</option>
          <option value="delivered">Delivered</option>
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
                          draggable
                          onDragStart={(event) => event.dataTransfer.setData('loadId', String(load.id))}
                          onClick={() => onSelectLoad(load.id)}
                          className="w-full text-left p-2 rounded bg-blue-100 hover:bg-blue-200 border border-blue-300"
                        >
                          <div className="font-medium">{load.loadNumber}</div>
                          <div className="text-xs">{load.pickupLocation} → {load.deliveryLocation}</div>
                          <div className="text-[11px] uppercase tracking-wide text-slate-600">{load.status}</div>
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
