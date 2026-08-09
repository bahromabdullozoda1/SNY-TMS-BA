import { useEffect, useMemo, useState } from 'react';

const moneyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'at_pickup', label: 'At Pickup' },
  { value: 'loaded', label: 'Loaded' },
  { value: 'at_delivery', label: 'At Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'invoiced', label: 'Invoiced' },
  { value: 'cancelled', label: 'Cancelled' }
];

const STATUS_BADGE = {
  new: 'bg-amber-100 text-amber-800',
  assigned: 'bg-sky-100 text-sky-800',
  in_transit: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-blue-100 text-blue-800',
  at_pickup: 'bg-violet-100 text-violet-800',
  loaded: 'bg-indigo-100 text-indigo-800',
  at_delivery: 'bg-teal-100 text-teal-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  invoiced: 'bg-green-100 text-green-800',
  cancelled: 'bg-rose-100 text-rose-800'
};

const DOC_CATEGORIES = [
  { id: 'rate_confirmation', label: 'Rate Confirmation' },
  { id: 'bol', label: 'Bill of Lading' },
  { id: 'pod', label: 'Proof of Delivery' },
  { id: 'invoice', label: 'Invoice' },
  { id: 'other', label: 'Other' }
];

function formatDateTime(value) {
  return value ? new Date(value).toLocaleString() : '—';
}

function Stat({ label, value, mono }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">{label}</p>
      <p className={`mt-0.5 text-sm font-semibold text-slate-900 truncate ${mono ? 'font-mono' : ''}`}>{value || '—'}</p>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-3 mb-1.5 border-t border-slate-100 pt-3 first:border-0 first:pt-0 first:mt-0">
      {children}
    </p>
  );
}

export function LoadDetails({ load, drivers, canManage, isSaving, onSaveNote, onUpdateLoad, onUploadFiles, onRemoveFile, onDeleteLoad }) {
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setNotes(load?.notes || '');
  }, [load?.id, load?.notes]);

  const driverName = useMemo(() => {
    if (!load?.driverId) return 'Unassigned';
    return drivers.find((d) => d.id === load.driverId)?.name || 'Unknown';
  }, [drivers, load]);

  const driverPay = useMemo(() => {
    if (!load) return 0;
    return Number(load.rate || 0) * (Number(load.driverPayPercent || 0) / 100);
  }, [load]);

  const originLine = useMemo(() => {
    if (!load) return '—';
    return load.pickupCity ? `${load.pickupCity}, ${load.pickupState}` : load.pickupLocation || '—';
  }, [load]);

  const destLine = useMemo(() => {
    if (!load) return '—';
    return load.deliveryCity ? `${load.deliveryCity}, ${load.deliveryState}` : load.deliveryLocation || '—';
  }, [load]);

  if (!load) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-64 gap-2 p-8 text-center">
        <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-sm text-slate-400">Select a load to view details</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-0 overflow-y-auto max-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-bold text-slate-900 text-base">{load.loadNumber}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{originLine} → {destLine}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_BADGE[load.status] || 'bg-slate-100 text-slate-600'}`}>
          {STATUS_OPTIONS.find((o) => o.value === load.status)?.label || load.status}
        </span>
      </div>

      {/* Load Info */}
      <SectionLabel>Load Info</SectionLabel>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Broker Load #" value={load.brokerLoadNumber} mono />
        <Stat label="Broker" value={load.broker} />
        <Stat label="Customer" value={load.customer} />
        <Stat label="Dispatcher" value={load.dispatcher} />
      </div>

      {/* Pickup */}
      <SectionLabel>Pickup</SectionLabel>
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2">
          <Stat label="Company" value={load.pickupCompany} />
        </div>
        {load.pickupAddress && (
          <div className="col-span-2">
            <Stat label="Address" value={`${load.pickupAddress}, ${load.pickupCity}, ${load.pickupState} ${load.pickupZip}`} />
          </div>
        )}
        <Stat label="Date" value={load.pickupDate} />
        <Stat label="Time" value={load.pickupTime} />
      </div>

      {/* Delivery */}
      <SectionLabel>Delivery</SectionLabel>
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2">
          <Stat label="Company" value={load.deliveryCompany} />
        </div>
        {load.deliveryAddress && (
          <div className="col-span-2">
            <Stat label="Address" value={`${load.deliveryAddress}, ${load.deliveryCity}, ${load.deliveryState} ${load.deliveryZip}`} />
          </div>
        )}
        <Stat label="Date" value={load.deliveryDate} />
        <Stat label="Time" value={load.deliveryTime} />
      </div>

      {/* Assignment */}
      <SectionLabel>Assignment</SectionLabel>
      <div className="grid grid-cols-2 gap-2">
        {canManage ? (
          <div className="col-span-2">
            <label className="block">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Driver</span>
              <select
                className="mt-1 w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={load.driverId || ''}
                onChange={(e) => onUpdateLoad(load.id, { driverId: e.target.value }, 'Driver updated.')}
                disabled={isSaving}
              >
                <option value="">Unassigned</option>
                {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </label>
          </div>
        ) : (
          <div className="col-span-2"><Stat label="Driver" value={driverName} /></div>
        )}
        <Stat label="Truck #" value={load.truckNumber} mono />
        <Stat label="Trailer #" value={load.trailerNumber} mono />
      </div>

      {/* Financials */}
      <SectionLabel>Financials</SectionLabel>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Rate" value={moneyFormatter.format(Number(load.rate || 0))} />
        <Stat label={`Driver Pay (${load.driverPayPercent || 0}%)`} value={driverPay > 0 ? moneyFormatter.format(driverPay) : '—'} />
        <Stat label="Loaded Miles" value={load.loadedMiles ? `${load.loadedMiles} mi` : null} />
        <Stat label="Deadhead Miles" value={load.deadheadMiles ? `${load.deadheadMiles} mi` : null} />
      </div>

      {/* Quick status update */}
      {canManage && (
        <div className="mt-3">
          <SectionLabel>Quick Update</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Status</span>
              <select
                className="mt-1 w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={load.status}
                onChange={(e) => onUpdateLoad(load.id, { status: e.target.value }, 'Status updated.')}
                disabled={isSaving}
              >
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Priority</span>
              <select
                className="mt-1 w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={load.priority}
                onChange={(e) => onUpdateLoad(load.id, { priority: e.target.value }, 'Priority updated.')}
                disabled={isSaving}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </label>
          </div>
        </div>
      )}

      {/* Notes */}
      <SectionLabel>Notes</SectionLabel>
      <textarea
        className="w-full rounded-md border border-slate-300 p-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={3}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        readOnly={!canManage}
        placeholder={canManage ? 'Add internal notes…' : 'No notes.'}
      />
      {canManage && (
        <button
          type="button"
          className="mt-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          onClick={() => onSaveNote(load.id, notes)}
          disabled={isSaving || notes === (load.notes || '')}
        >
          Save Notes
        </button>
      )}

      {/* Documents */}
      <SectionLabel>Documents</SectionLabel>
      <div className="space-y-3">
        {DOC_CATEGORIES.map((cat) => {
          const catFiles = (load.files || []).filter((f) => (f.category || 'other') === cat.id);
          return (
            <div key={cat.id} className="rounded-lg border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-200">
                <span className="text-xs font-semibold text-slate-700">{cat.label}</span>
                {canManage && (
                  <label className={`rounded px-2 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-300 bg-white cursor-pointer hover:bg-slate-50 ${isSaving ? 'pointer-events-none opacity-50' : ''}`}>
                    + Add
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (isSaving || !e.target.files?.length) return;
                        onUploadFiles(load.id, e.target.files, cat.id);
                        e.target.value = '';
                      }}
                      disabled={isSaving}
                    />
                  </label>
                )}
              </div>
              {catFiles.length === 0 ? (
                <p className="px-3 py-2 text-xs text-slate-400 italic">No {cat.label.toLowerCase()} attached.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {catFiles.map((file, idx) => (
                    <li key={`${file.id || idx}`} className="flex items-center justify-between px-3 py-2 gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-800 truncate">{file.name}</p>
                        <p className="text-[10px] text-slate-400">{Math.max(1, Math.round((file.size || 0) / 1024))} KB · {formatDateTime(file.uploadedAt)}</p>
                      </div>
                      {canManage && (
                        <button
                          type="button"
                          className="shrink-0 text-[10px] font-semibold text-rose-600 hover:text-rose-800"
                          onClick={() => onRemoveFile(load.id, file)}
                        >
                          Remove
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {/* History */}
      <SectionLabel>Activity History</SectionLabel>
      <ul className="space-y-1">
        {(load.history || []).slice().reverse().map((entry, idx) => (
          <li key={`${entry.date}-${idx}`} className="flex gap-2 text-xs text-slate-500">
            <span className="shrink-0 text-slate-300">{formatDateTime(entry.date)}</span>
            <span>{entry.action}</span>
            <span className="text-slate-400">({entry.actor})</span>
          </li>
        ))}
      </ul>

      {/* Delete */}
      {canManage && (
        <div className="pt-4">
          <button
            type="button"
            className="w-full rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100 transition-colors disabled:opacity-50"
            onClick={() => {
              if (window.confirm(`Delete load ${load.loadNumber}? This cannot be undone.`)) {
                onDeleteLoad(load.id);
              }
            }}
            disabled={isSaving}
          >
            Delete Load
          </button>
        </div>
      )}
    </div>
  );
}
