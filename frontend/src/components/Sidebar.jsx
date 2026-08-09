const items = [
  'Dispatch Board',
  'Loads',
  'Drivers',
  'Partners',
  'Equipment',
  'Driver Payroll',
  'Accounting',
  'Reports'
];

export function Sidebar() {
  return (
    <aside className="w-full lg:w-64 bg-slate-900 text-white p-4 lg:min-h-screen">
      <h1 className="text-xl font-bold mb-6">SNY TMS</h1>
      <nav className="space-y-2">
        {items.map((item, index) => (
          <button
            key={item}
            type="button"
            className={`block w-full text-left px-3 py-2 rounded-md transition ${index === 0 ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
          >
            {item}
          </button>
        ))}
      </nav>
    </aside>
  );
}
