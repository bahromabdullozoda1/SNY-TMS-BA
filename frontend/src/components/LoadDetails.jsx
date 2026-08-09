export function LoadDetails({ load, onSaveNote }) {
  if (!load) {
    return <div className="p-4 text-slate-500">Select load to view details.</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="font-semibold text-slate-900">{load.loadNumber}</h3>
        <p className="text-sm text-slate-600">{load.pickupLocation} → {load.deliveryLocation}</p>
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">Notes</label>
        <textarea
          className="w-full mt-1 rounded border border-slate-300 p-2 text-sm"
          rows={4}
          defaultValue={load.notes || ''}
          onBlur={(event) => onSaveNote(load.id, event.target.value)}
        />
      </div>
      <div>
        <h4 className="text-sm font-medium text-slate-700">Files</h4>
        <p className="text-xs text-slate-500">Document upload placeholder (POD, BOL, invoices).</p>
      </div>
      <div>
        <h4 className="text-sm font-medium text-slate-700 mb-1">History</h4>
        <ul className="space-y-1 text-xs text-slate-600">
          {(load.history || []).slice().reverse().map((entry, index) => (
            <li key={`${entry.date}-${index}`}>
              {new Date(entry.date).toLocaleString()} — {entry.action} ({entry.actor})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
