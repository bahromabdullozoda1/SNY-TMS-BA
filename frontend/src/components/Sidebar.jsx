export function Sidebar({ sections, activeSection, user, onChange, onLogout }) {
  return (
    <aside className="w-full lg:w-72 bg-slate-900 text-white p-4 lg:min-h-screen">
      <div className="mb-6">
        <h1 className="text-xl font-bold">SNY TMS</h1>
        <p className="mt-2 text-sm text-slate-300">{user.name}</p>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{user.role}</p>
      </div>
      <nav className="space-y-2">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => onChange(section.id)}
            className={`block w-full text-left px-3 py-2 rounded-md transition ${
              activeSection === section.id ? 'bg-blue-600 text-white' : 'text-slate-200 hover:bg-slate-800'
            }`}
          >
            {section.label}
          </button>
        ))}
      </nav>
      <button
        type="button"
        onClick={onLogout}
        className="mt-6 w-full rounded-md border border-slate-700 px-3 py-2 text-left text-slate-200 hover:bg-slate-800"
      >
        Sign out
      </button>
    </aside>
  );
}
