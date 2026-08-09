import { useEffect, useMemo, useState } from 'react';

const moneyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});

function formatDateTime(value) {
  return value ? new Date(value).toLocaleString() : '—';
}

function formatDate(value) {
  return value || '—';
}

function statusOptions() {
  return ['new', 'in_progress', 'delivered', 'cancelled'].map((status) => (
    <option key={status} value={status}>{status.replace('_', ' ')}</option>
  ));
}

export function LoadDetails({ load, drivers, canManage, isSaving, onSaveNote, onUpdateLoad, onUploadFiles, onRemoveFile, onDeleteLoad }) {
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setNotes(load?.notes || '');
  }, [load?.id, load?.notes]);

  const driverName = useMemo(() => {
    if (!load?.driverId) {
      return 'Unassigned';
    }

    return drivers.find((driver) => driver.id === load.driverId)?.name || 'Unknown driver';
  }, [drivers, load?.driverId]);

  if (!load) {
    return <div className="p-4 text-slate-500">Select load to view details.</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-900">{load.loadNumber}</h3>
            <p className="text-sm text-slate-600">{load.pickupLocation} → {load.deliveryLocation}</p>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-slate-700">
            {load.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Priority</p>
          <p className="font-medium text-slate-900">{load.priority}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Rate</p>
          <p className="font-medium text-slate-900">{moneyFormatter.format(Number(load.rate || 0))}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Pickup date</p>
          <p className="font-medium text-slate-900">{formatDate(load.pickupDate)}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Delivery date</p>
          <p className="font-medium text-slate-900">{formatDate(load.deliveryDate)}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Driver</p>
          <p className="font-medium text-slate-900">{driverName}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Partners</p>
          <p className="font-medium text-slate-900">{load.shipper || '—'} → {load.receiver || '—'}</p>
        </div>
      </div>

      {canManage && (
        <div className="grid grid-cols-1 gap-3">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Assigned driver</span>
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={load.driverId || ''}
              onChange={(event) => onUpdateLoad(load.id, { driverId: event.target.value }, 'Driver assignment updated.')}
              disabled={isSaving}
            >
              <option value="">Unassigned</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>{driver.name}</option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Status</span>
              <select
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm capitalize"
                value={load.status}
                onChange={(event) => onUpdateLoad(load.id, { status: event.target.value }, 'Status updated.')}
                disabled={isSaving}
              >
                {statusOptions()}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Priority</span>
              <select
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={load.priority}
                onChange={(event) => onUpdateLoad(load.id, { priority: event.target.value }, 'Priority updated.')}
                disabled={isSaving}
              >
                <option value="high">high</option>
                <option value="medium">medium</option>
                <option value="low">low</option>
              </select>
            </label>
          </div>
        </div>
      )}

      <div>
        <label htmlFor={`load-notes-${load.id}`} className="text-sm font-medium text-slate-700">Notes</label>
        <textarea
          id={`load-notes-${load.id}`}
          className="w-full mt-1 rounded border border-slate-300 p-2 text-sm"
          rows={4}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          readOnly={!canManage}
        />
        {canManage && (
          <button
            type="button"
            className="mt-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
            onClick={() => onSaveNote(load.id, notes)}
            disabled={isSaving || notes === (load.notes || '')}
          >
            Save notes
          </button>
        )}
      </div>
      <div>
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-medium text-slate-700">Documents</h4>
          {canManage && (
            <label
              aria-disabled={isSaving}
              className={`rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 ${
                isSaving ? 'pointer-events-none opacity-60' : 'cursor-pointer'
              }`}
            >
              Add files
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(event) => {
                  if (isSaving) {
                    return;
                  }
                  onUploadFiles(load.id, event.target.files);
                  event.target.value = '';
                }}
                disabled={isSaving}
              />
            </label>
          )}
        </div>
        <ul className="mt-2 space-y-2">
          {(load.files || []).length === 0 && <li className="text-xs text-slate-500">No documents attached yet.</li>}
          {(load.files || []).map((file, index) => (
            <li key={`${file.name}-${file.uploadedAt}-${index}`} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <div>
                <p className="font-medium text-slate-800">{file.name}</p>
                <p className="text-xs text-slate-500">{Math.max(1, Math.round((file.size || 0) / 1024))} KB • {formatDateTime(file.uploadedAt)}</p>
              </div>
              {canManage && (
                <button
                  type="button"
                  className="text-xs font-medium text-rose-600"
                  onClick={() => onRemoveFile(load.id, file)}
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="text-sm font-medium text-slate-700 mb-1">History</h4>
        <ul className="space-y-1 text-xs text-slate-600">
          {(load.history || []).slice().reverse().map((entry, index) => (
            <li key={`${entry.date}-${index}`}>
              {formatDateTime(entry.date)} — {entry.action} ({entry.actor})
            </li>
          ))}
        </ul>
      </div>
      {canManage && (
        <button
          type="button"
          className="w-full rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700"
          onClick={() => {
            if (window.confirm(`Delete load ${load.loadNumber}?`)) {
              onDeleteLoad(load.id);
            }
          }}
          disabled={isSaving}
        >
          Delete load
        </button>
      )}
    </div>
  );
}
