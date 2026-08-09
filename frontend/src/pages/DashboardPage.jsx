import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { DispatchBoard } from '../components/DispatchBoard';
import { LoadDetails } from '../components/LoadDetails';

const initialFilters = {
  search: '',
  status: '',
  driverId: '',
  weekStart: new Date().toISOString().slice(0, 10)
};

export function DashboardPage() {
  const [drivers, setDrivers] = useState([]);
  const [loads, setLoads] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [selectedLoadId, setSelectedLoadId] = useState(null);
  const [error, setError] = useState('');

  const fetchAll = useCallback(async () => {
    try {
      setError('');
      const [driversData, loadsData, summaryData] = await Promise.all([
        api.getDrivers(),
        api.getLoads(),
        api.getSummary()
      ]);
      setDrivers(driversData);
      setLoads(loadsData);
      setSummary(summaryData);
      if (!selectedLoadId && loadsData.length) {
        setSelectedLoadId(loadsData[0].id);
      }
    } catch (err) {
      setError(err.message);
    }
  }, [selectedLoadId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    const wsUrl = (import.meta.env.VITE_WS_URL || 'ws://localhost:3000/ws');
    const socket = new WebSocket(wsUrl);
    socket.onmessage = () => fetchAll();
    return () => socket.close();
  }, [fetchAll]);

  const selectedLoad = useMemo(() => loads.find((load) => load.id === selectedLoadId), [loads, selectedLoadId]);

  async function moveLoad(loadId, driverId, pickupDate) {
    const load = loads.find((item) => item.id === loadId);
    if (!load) {
      return;
    }

    await api.updateLoad(loadId, { ...load, driverId, pickupDate, status: 'in_progress' });
    fetchAll();
  }

  async function saveNote(loadId, notes) {
    const load = loads.find((item) => item.id === loadId);
    if (!load || notes === load.notes) {
      return;
    }

    await api.updateLoad(loadId, { ...load, notes });
    fetchAll();
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">Dispatch Board</h2>
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="p-3 bg-white border rounded"><p className="text-xs text-slate-500">Drivers</p><p className="text-lg font-semibold">{drivers.length}</p></div>
            <div className="p-3 bg-white border rounded"><p className="text-xs text-slate-500">New Loads</p><p className="text-lg font-semibold">{summary.statusBreakdown.new || 0}</p></div>
            <div className="p-3 bg-white border rounded"><p className="text-xs text-slate-500">Delivered</p><p className="text-lg font-semibold">{summary.statusBreakdown.delivered || 0}</p></div>
            <div className="p-3 bg-white border rounded"><p className="text-xs text-slate-500">Revenue</p><p className="text-lg font-semibold">${summary.financial.revenue}</p></div>
          </div>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <DispatchBoard
          drivers={drivers}
          loads={loads}
          filters={filters}
          onFiltersChange={setFilters}
          onSelectLoad={setSelectedLoadId}
          onMoveLoad={moveLoad}
        />
      </div>
      <aside className="bg-white border rounded-lg">
        <LoadDetails load={selectedLoad} onSaveNote={saveNote} />
      </aside>
    </div>
  );
}
