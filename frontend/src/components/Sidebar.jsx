const NAV_ITEMS = [
  { id: 'dispatch', label: 'Dispatch Board', icon: '🗺' },
  { id: 'loads', label: 'Loads', icon: '📦' },
  { id: 'drivers', label: 'Drivers', icon: '🚗' },
  { id: 'trucks', label: 'Trucks', icon: '🚛' },
  { id: 'trailers', label: 'Trailers', icon: '🔩' },
  { id: 'fuel', label: 'Fuel', icon: '⛽' },
  { id: 'tolls', label: 'Tolls', icon: '🛣' },
  { id: 'payroll', label: 'Driver Payroll', icon: '💵' },
  { id: 'customers', label: 'Customers & Brokers', icon: '🤝' },
  { id: 'maintenance', label: 'Maintenance', icon: '🔧' },
  { id: 'expenses', label: 'Expenses', icon: '🧾' },
  { id: 'documents', label: 'Documents', icon: '📁' },
  { id: 'reports', label: 'Reports', icon: '📊' },
  { id: 'settings', label: 'Settings', icon: '⚙️' }
];

export function Sidebar({ sections, activeSection, user, onChange, onLogout }) {
  const allowedIds = new Set(sections.map((s) => s.id));
  const visibleItems = NAV_ITEMS.filter((item) => allowedIds.has(item.id));

  return (
    <aside className="w-full lg:w-64 bg-slate-900 text-white flex flex-col lg:min-h-screen">
      <div className="px-5 py-5 border-b border-slate-800">
        <h1 className="text-lg font-bold tracking-tight">SNY TMS</h1>
        <p className="mt-1.5 text-sm text-slate-300 font-medium">{user.name}</p>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mt-0.5">{user.role}</p>
      </div>
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {visibleItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={`flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              activeSection === item.id
                ? 'bg-blue-600 text-white font-medium'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="text-base w-5 text-center shrink-0">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="px-3 py-3 border-t border-slate-800">
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <span>🚪</span>
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
