import { DispatchBoard } from '../components/DispatchBoard';
export function DashboardPage({ drivers, loads, summary, filters, canManage, onFiltersChange, onSelectLoad, onMoveLoad, selectedLoadId }) {
  return (
    <div className="space-y-4">
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="p-3 bg-white border rounded-lg"><p className="text-xs text-slate-500">Drivers</p><p className="text-lg font-semibold">{drivers.length}</p></div>
          <div className="p-3 bg-white border rounded-lg"><p className="text-xs text-slate-500">New Loads</p><p className="text-lg font-semibold">{summary.statusBreakdown.new || 0}</p></div>
          <div className="p-3 bg-white border rounded-lg"><p className="text-xs text-slate-500">Delivered</p><p className="text-lg font-semibold">{summary.statusBreakdown.delivered || 0}</p></div>
          <div className="p-3 bg-white border rounded-lg"><p className="text-xs text-slate-500">Revenue</p><p className="text-lg font-semibold">${summary.financial.revenue}</p></div>
        </div>
      )}
      <DispatchBoard
        drivers={drivers}
        loads={loads}
        filters={filters}
        canManage={canManage}
        onFiltersChange={onFiltersChange}
        onSelectLoad={onSelectLoad}
        onMoveLoad={onMoveLoad}
        selectedLoadId={selectedLoadId}
      />
      {!canManage && (
        <p className="text-sm text-slate-500">Your role has read-only access to the dispatch board.</p>
      )}
    </div>
  );
}
