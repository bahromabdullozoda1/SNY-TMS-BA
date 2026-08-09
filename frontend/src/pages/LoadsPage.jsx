import { useEffect, useMemo, useState } from 'react';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
];

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

const PRIORITY_BADGE = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-slate-100 text-slate-600'
};

const moneyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});

const emptyLoad = {
  loadNumber: '',
  brokerLoadNumber: '',
  broker: '',
  customer: '',
  dispatcher: '',
  // Pickup
  pickupCompany: '',
  pickupAddress: '',
  pickupCity: '',
  pickupState: '',
  pickupZip: '',
  pickupDate: '',
  pickupTime: '',
  // Delivery
  deliveryCompany: '',
  deliveryAddress: '',
  deliveryCity: '',
  deliveryState: '',
  deliveryZip: '',
  deliveryDate: '',
  deliveryTime: '',
  // Assignment
  driverId: '',
  truckNumber: '',
  trailerNumber: '',
  // Financials
  loadedMiles: '',
  deadheadMiles: '',
  rate: '',
  driverPayPercent: '',
  // Meta
  status: 'new',
  priority: 'medium',
  notes: ''
};

function toFormState(load) {
  if (!load) return emptyLoad;
  return {
    loadNumber: load.loadNumber || '',
    brokerLoadNumber: load.brokerLoadNumber || '',
    broker: load.broker || '',
    customer: load.customer || '',
    dispatcher: load.dispatcher || '',
    pickupCompany: load.pickupCompany || '',
    pickupAddress: load.pickupAddress || '',
    pickupCity: load.pickupCity || '',
    pickupState: load.pickupState || '',
    pickupZip: load.pickupZip || '',
    pickupDate: load.pickupDate || '',
    pickupTime: load.pickupTime || '',
    deliveryCompany: load.deliveryCompany || '',
    deliveryAddress: load.deliveryAddress || '',
    deliveryCity: load.deliveryCity || '',
    deliveryState: load.deliveryState || '',
    deliveryZip: load.deliveryZip || '',
    deliveryDate: load.deliveryDate || '',
    deliveryTime: load.deliveryTime || '',
    driverId: load.driverId || '',
    truckNumber: load.truckNumber || '',
    trailerNumber: load.trailerNumber || '',
    loadedMiles: load.loadedMiles || '',
    deadheadMiles: load.deadheadMiles || '',
    rate: load.rate || '',
    driverPayPercent: load.driverPayPercent || '',
    status: load.status || 'new',
    priority: load.priority || 'medium',
    notes: load.notes || ''
  };
}

function SectionHeader({ label }) {
  return (
    <div className="col-span-full mt-2">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-1">{label}</h4>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-slate-600 mb-1">{label}</span>
      {children}
    </label>
  );
}

const inputCls = 'w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';
const selectCls = 'w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

function statusLabel(status) {
  return STATUS_OPTIONS.find((o) => o.value === status)?.label || status;
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
    const text = [
      load.loadNumber, load.brokerLoadNumber, load.broker, load.customer,
      load.pickupCity, load.pickupState, load.deliveryCity, load.deliveryState,
      load.pickupLocation, load.deliveryLocation, load.truckNumber, load.notes
    ].join(' ').toLowerCase();

    return (!search || text.includes(search.toLowerCase())) &&
      (!statusFilter || load.status === statusFilter) &&
      (!driverFilter || String(load.driverId ?? '') === driverFilter);
  }), [driverFilter, loads, search, statusFilter]);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const driverPay = useMemo(() => {
    const rate = Number(form.rate || 0);
    const pct = Number(form.driverPayPercent || 0);
    return rate && pct ? rate * (pct / 100) : 0;
  }, [form.rate, form.driverPayPercent]);

  return (
    <div className="space-y-4">
      {canManage && (
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                {selectedLoad ? `Editing: ${selectedLoad.loadNumber}` : 'New Load'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Fill all required fields and save.</p>
            </div>
            <div className="flex gap-2">
              {selectedLoad && (
                <button type="button" className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50" onClick={onStartNewLoad}>
                  + New Load
                </button>
              )}
            </div>
          </div>

          <form
            className="px-5 py-4 grid grid-cols-2 md:grid-cols-4 gap-x-3 gap-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              onSaveLoad(form, selectedLoad?.id || null);
            }}
          >
            {/* Load Info */}
            <SectionHeader label="Load Information" />
            <Field label="Internal Load #*">
              <input className={inputCls} placeholder="LD-1001" value={form.loadNumber} onChange={(e) => updateField('loadNumber', e.target.value)} required />
            </Field>
            <Field label="Broker Load #">
              <input className={inputCls} placeholder="BRK-12345" value={form.brokerLoadNumber} onChange={(e) => updateField('brokerLoadNumber', e.target.value)} />
            </Field>
            <Field label="Broker">
              <input className={inputCls} placeholder="Broker name" value={form.broker} onChange={(e) => updateField('broker', e.target.value)} />
            </Field>
            <Field label="Customer">
              <input className={inputCls} placeholder="Customer / Shipper" value={form.customer} onChange={(e) => updateField('customer', e.target.value)} />
            </Field>
            <Field label="Dispatcher">
              <input className={inputCls} placeholder="Dispatcher name" value={form.dispatcher} onChange={(e) => updateField('dispatcher', e.target.value)} />
            </Field>
            <Field label="Status">
              <select className={selectCls} value={form.status} onChange={(e) => updateField('status', e.target.value)}>
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
            <Field label="Priority">
              <select className={selectCls} value={form.priority} onChange={(e) => updateField('priority', e.target.value)}>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </Field>

            {/* Pickup */}
            <SectionHeader label="Pickup" />
            <Field label="Pickup Company">
              <input className={inputCls} placeholder="Shipper company" value={form.pickupCompany} onChange={(e) => updateField('pickupCompany', e.target.value)} />
            </Field>
            <div className="col-span-2 md:col-span-3">
              <Field label="Pickup Address">
                <input className={inputCls} placeholder="Street address" value={form.pickupAddress} onChange={(e) => updateField('pickupAddress', e.target.value)} />
              </Field>
            </div>
            <Field label="City">
              <input className={inputCls} placeholder="City" value={form.pickupCity} onChange={(e) => updateField('pickupCity', e.target.value)} />
            </Field>
            <Field label="State">
              <select className={selectCls} value={form.pickupState} onChange={(e) => updateField('pickupState', e.target.value)}>
                <option value="">—</option>
                {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="ZIP">
              <input className={inputCls} placeholder="00000" value={form.pickupZip} onChange={(e) => updateField('pickupZip', e.target.value)} maxLength={10} />
            </Field>
            <Field label="Pickup Date">
              <input className={inputCls} type="date" value={form.pickupDate} onChange={(e) => updateField('pickupDate', e.target.value)} />
            </Field>
            <Field label="Pickup Time">
              <input className={inputCls} type="time" value={form.pickupTime} onChange={(e) => updateField('pickupTime', e.target.value)} />
            </Field>

            {/* Delivery */}
            <SectionHeader label="Delivery" />
            <Field label="Delivery Company">
              <input className={inputCls} placeholder="Consignee company" value={form.deliveryCompany} onChange={(e) => updateField('deliveryCompany', e.target.value)} />
            </Field>
            <div className="col-span-2 md:col-span-3">
              <Field label="Delivery Address">
                <input className={inputCls} placeholder="Street address" value={form.deliveryAddress} onChange={(e) => updateField('deliveryAddress', e.target.value)} />
              </Field>
            </div>
            <Field label="City">
              <input className={inputCls} placeholder="City" value={form.deliveryCity} onChange={(e) => updateField('deliveryCity', e.target.value)} />
            </Field>
            <Field label="State">
              <select className={selectCls} value={form.deliveryState} onChange={(e) => updateField('deliveryState', e.target.value)}>
                <option value="">—</option>
                {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="ZIP">
              <input className={inputCls} placeholder="00000" value={form.deliveryZip} onChange={(e) => updateField('deliveryZip', e.target.value)} maxLength={10} />
            </Field>
            <Field label="Delivery Date">
              <input className={inputCls} type="date" value={form.deliveryDate} onChange={(e) => updateField('deliveryDate', e.target.value)} />
            </Field>
            <Field label="Delivery Time">
              <input className={inputCls} type="time" value={form.deliveryTime} onChange={(e) => updateField('deliveryTime', e.target.value)} />
            </Field>

            {/* Assignment */}
            <SectionHeader label="Assignment" />
            <div className="col-span-2">
              <Field label="Driver">
                <select className={selectCls} value={form.driverId} onChange={(e) => updateField('driverId', e.target.value)}>
                  <option value="">Unassigned</option>
                  {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Truck #">
              <input className={inputCls} placeholder="T-101" value={form.truckNumber} onChange={(e) => updateField('truckNumber', e.target.value)} />
            </Field>
            <Field label="Trailer #">
              <input className={inputCls} placeholder="TR-201" value={form.trailerNumber} onChange={(e) => updateField('trailerNumber', e.target.value)} />
            </Field>

            {/* Financials */}
            <SectionHeader label="Financials" />
            <Field label="Rate ($)">
              <input className={inputCls} type="number" min="0" step="50" placeholder="0" value={form.rate} onChange={(e) => updateField('rate', e.target.value)} />
            </Field>
            <Field label="Loaded Miles">
              <input className={inputCls} type="number" min="0" step="1" placeholder="0" value={form.loadedMiles} onChange={(e) => updateField('loadedMiles', e.target.value)} />
            </Field>
            <Field label="Deadhead Miles">
              <input className={inputCls} type="number" min="0" step="1" placeholder="0" value={form.deadheadMiles} onChange={(e) => updateField('deadheadMiles', e.target.value)} />
            </Field>
            <Field label={`Driver Pay % ${driverPay > 0 ? `(≈ ${moneyFormatter.format(driverPay)})` : ''}`}>
              <input className={inputCls} type="number" min="0" max="100" step="0.5" placeholder="0" value={form.driverPayPercent} onChange={(e) => updateField('driverPayPercent', e.target.value)} />
            </Field>

            {/* Notes */}
            <SectionHeader label="Notes" />
            <div className="col-span-full">
              <textarea className={`${inputCls} resize-none`} rows={3} placeholder="Internal notes…" value={form.notes} onChange={(e) => updateField('notes', e.target.value)} />
            </div>

            <div className="col-span-full pt-1">
              <button
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
                type="submit"
                disabled={isSaving}
              >
                {isSaving ? 'Saving…' : selectedLoad ? 'Save Changes' : 'Create Load'}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Loads Table */}
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="px-5 py-3 border-b border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search loads, broker, city…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={driverFilter}
              onChange={(e) => setDriverFilter(e.target.value)}
            >
              <option value="">All Drivers</option>
              {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <p className="text-xs text-slate-400 mt-2">{filteredLoads.length} load{filteredLoads.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left">
                <th className="px-4 py-2.5 font-semibold text-slate-600 text-xs uppercase tracking-wide whitespace-nowrap">Load #</th>
                <th className="px-4 py-2.5 font-semibold text-slate-600 text-xs uppercase tracking-wide whitespace-nowrap">Broker Load #</th>
                <th className="px-4 py-2.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Broker</th>
                <th className="px-4 py-2.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Route</th>
                <th className="px-4 py-2.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Driver</th>
                <th className="px-4 py-2.5 font-semibold text-slate-600 text-xs uppercase tracking-wide">Status</th>
                <th className="px-4 py-2.5 font-semibold text-slate-600 text-xs uppercase tracking-wide whitespace-nowrap">Pickup</th>
                <th className="px-4 py-2.5 font-semibold text-slate-600 text-xs uppercase tracking-wide text-right whitespace-nowrap">Rate</th>
                <th className="px-4 py-2.5 font-semibold text-slate-600 text-xs uppercase tracking-wide text-right whitespace-nowrap">Driver Pay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLoads.map((load) => {
                const driver = drivers.find((d) => d.id === load.driverId);
                const driverPay = Number(load.rate || 0) * (Number(load.driverPayPercent || 0) / 100);
                const originCity = load.pickupCity ? `${load.pickupCity}, ${load.pickupState}` : load.pickupLocation || '—';
                const destCity = load.deliveryCity ? `${load.deliveryCity}, ${load.deliveryState}` : load.deliveryLocation || '—';
                const isSelected = selectedLoadId === load.id;

                return (
                  <tr
                    key={load.id}
                    className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                    onClick={() => onSelectLoad(load.id)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{load.loadNumber}</div>
                      <span className={`inline-block mt-0.5 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${PRIORITY_BADGE[load.priority] || 'bg-slate-100 text-slate-600'}`}>
                        {load.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{load.brokerLoadNumber || '—'}</td>
                    <td className="px-4 py-3 text-slate-700 max-w-[140px] truncate">{load.broker || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-slate-900">{originCity}</span>
                      <span className="text-slate-400 mx-1">→</span>
                      <span className="text-slate-900">{destCity}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{driver?.name || <span className="text-slate-400 italic">Unassigned</span>}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[load.status] || 'bg-slate-100 text-slate-600'}`}>
                        {statusLabel(load.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{load.pickupDate || '—'}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900 whitespace-nowrap">{moneyFormatter.format(Number(load.rate || 0))}</td>
                    <td className="px-4 py-3 text-right text-slate-600 whitespace-nowrap">
                      {driverPay > 0 ? moneyFormatter.format(driverPay) : '—'}
                    </td>
                  </tr>
                );
              })}
              {filteredLoads.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-400 text-sm" colSpan="9">
                    No loads match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
