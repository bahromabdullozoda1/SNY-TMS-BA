import { useState } from 'react';

export function SettingsPage({ settings, canAdmin, isSaving, onSaveSettings }) {
  const [form, setForm] = useState(settings || {});
  const [saved, setSaved] = useState(false);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  function handleSave(e) {
    e.preventDefault();
    onSaveSettings(form);
    setSaved(true);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <form onSubmit={handleSave} className="space-y-6">
        {/* Company */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h3 className="text-base font-semibold text-slate-800">Company Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Company Name" value={form.companyName || ''} onChange={(v) => set('companyName', v)} required disabled={!canAdmin} />
            <Field label="DOT Number" value={form.dotNumber || ''} onChange={(v) => set('dotNumber', v)} disabled={!canAdmin} />
            <Field label="MC Number" value={form.mcNumber || ''} onChange={(v) => set('mcNumber', v)} disabled={!canAdmin} />
            <Field label="Phone" value={form.phone || ''} onChange={(v) => set('phone', v)} type="tel" disabled={!canAdmin} />
            <Field label="Email" value={form.email || ''} onChange={(v) => set('email', v)} type="email" disabled={!canAdmin} />
            <div className="col-span-2">
              <Field label="Address" value={form.address || ''} onChange={(v) => set('address', v)} disabled={!canAdmin} />
            </div>
            <Field label="City" value={form.city || ''} onChange={(v) => set('city', v)} disabled={!canAdmin} />
            <Field label="State" value={form.state || ''} onChange={(v) => set('state', v)} disabled={!canAdmin} />
            <Field label="ZIP" value={form.zip || ''} onChange={(v) => set('zip', v)} disabled={!canAdmin} />
          </div>
        </div>

        {/* General */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h3 className="text-base font-semibold text-slate-800">General Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Default Driver Pay Type</label>
              <select
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50"
                value={form.defaultDriverPayType || 'percentage'}
                onChange={(e) => set('defaultDriverPayType', e.target.value)}
                disabled={!canAdmin}
              >
                <option value="percentage">Percentage</option>
                <option value="per_mile">Per Mile</option>
                <option value="flat">Flat Rate</option>
                <option value="salary">Salary</option>
              </select>
            </div>
            <Field label="Default Pay %" value={form.defaultDriverPayPercent || ''} onChange={(v) => set('defaultDriverPayPercent', v)} type="number" disabled={!canAdmin} />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
              <select
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50"
                value={form.currency || 'USD'}
                onChange={(e) => set('currency', e.target.value)}
                disabled={!canAdmin}
              >
                <option value="USD">USD — US Dollar</option>
                <option value="CAD">CAD — Canadian Dollar</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Time Zone</label>
              <select
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50"
                value={form.timezone || 'America/Chicago'}
                onChange={(e) => set('timezone', e.target.value)}
                disabled={!canAdmin}
              >
                {['America/New_York','America/Chicago','America/Denver','America/Los_Angeles','America/Phoenix','America/Anchorage','Pacific/Honolulu'].map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date Format</label>
              <select
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50"
                value={form.dateFormat || 'MM/DD/YYYY'}
                onChange={(e) => set('dateFormat', e.target.value)}
                disabled={!canAdmin}
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users / Roles info */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
          <h3 className="text-base font-semibold text-slate-800">User Roles</h3>
          <div className="space-y-2 text-sm text-slate-600">
            {[
              { role: 'admin', desc: 'Full access — all modules, settings, delete operations' },
              { role: 'manager', desc: 'Create, edit, assign loads/drivers/trucks/trailers; view reports' },
              { role: 'accountant', desc: 'View and manage fuel, tolls, payroll, expenses, reports' },
              { role: 'driver', desc: 'View own loads and schedule (read-only)' }
            ].map((r) => (
              <div key={r.role} className="flex gap-3">
                <span className="font-semibold capitalize w-24 shrink-0">{r.role}</span>
                <span>{r.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {canAdmin && (
          <div className="flex items-center gap-4">
            <button type="submit" disabled={isSaving} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium disabled:opacity-60">
              {isSaving ? 'Saving…' : 'Save Settings'}
            </button>
            {saved && <span className="text-sm text-emerald-600 font-medium">✓ Settings saved</span>}
          </div>
        )}
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', required = false, disabled = false }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <input
        type={type}
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
      />
    </div>
  );
}
