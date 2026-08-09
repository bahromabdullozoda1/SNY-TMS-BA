import { useCallback, useEffect, useMemo, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { LoadDetails } from './components/LoadDetails';
import { DashboardPage } from './pages/DashboardPage';
import { DriversPage } from './pages/DriversPage';
import { LoadsPage } from './pages/LoadsPage';
import { ReportsPage } from './pages/ReportsPage';
import { api, clearToken, setToken } from './services/api';

const SESSION_STORAGE_KEY = 'sny-tms-session';
const initialFilters = {
  search: '',
  status: '',
  driverId: '',
  weekStart: new Date().toISOString().slice(0, 10)
};

function getStoredSession() {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistSession(session) {
  if (!session) {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return;
  }

  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

function formatError(error) {
  return error instanceof Error ? error.message : 'Request failed';
}

function normalizeLoadPayload(payload) {
  return {
    ...payload,
    driverId: payload.driverId ? Number(payload.driverId) : null,
    rate: Number(payload.rate || 0)
  };
}

function LoginScreen({ onAuthenticated }) {
  const [email, setEmail] = useState('admin@tms.local');
  const [password, setPassword] = useState('ChangeMe123!');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const result = await api.login({ email, password });
      const session = { token: result.token, user: result.user };
      setToken(result.token);
      persistSession(session);
      onAuthenticated(session);
    } catch (err) {
      setError(formatError(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 w-full max-w-sm space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">SNY TMS</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to manage dispatch, loads, drivers, and reports.</p>
        </div>
        <div className="space-y-3">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input className="mt-1 w-full border rounded-lg px-3 py-2" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input className="mt-1 w-full border rounded-lg px-3 py-2" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="w-full bg-blue-600 text-white rounded-lg py-2.5 font-medium disabled:opacity-60" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Login'}
        </button>
      </form>
    </div>
  );
}

function Workspace({ session, onLogout }) {
  const [activeSection, setActiveSection] = useState('dispatch');
  const [drivers, setDrivers] = useState([]);
  const [loads, setLoads] = useState([]);
  const [summary, setSummary] = useState(null);
  const [dispatchFilters, setDispatchFilters] = useState(initialFilters);
  const [selectedLoadId, setSelectedLoadId] = useState(0);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const canManage = ['admin', 'manager'].includes(session.user.role);
  const canViewReports = ['admin', 'manager', 'accountant'].includes(session.user.role);

  const sections = useMemo(() => {
    const items = [
      { id: 'dispatch', label: 'Dispatch Board' },
      { id: 'loads', label: 'Loads' },
      { id: 'drivers', label: 'Drivers' }
    ];

    if (canViewReports) {
      items.push({ id: 'reports', label: 'Reports' });
    }

    return items;
  }, [canViewReports]);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    const [driversResult, loadsResult, summaryResult] = await Promise.allSettled([
      api.getDrivers(),
      api.getLoads(),
      canViewReports ? api.getSummary() : Promise.resolve(null)
    ]);

    const nextErrors = [];

    if (driversResult.status === 'fulfilled') {
      setDrivers(driversResult.value);
    } else {
      nextErrors.push(formatError(driversResult.reason));
    }

    if (loadsResult.status === 'fulfilled') {
      setLoads(loadsResult.value);
    } else {
      nextErrors.push(formatError(loadsResult.reason));
    }

    if (summaryResult.status === 'fulfilled') {
      setSummary(summaryResult.value);
    } else {
      setSummary(null);
      if (canViewReports) {
        nextErrors.push(formatError(summaryResult.reason));
      }
    }

    setError(nextErrors.join(' '));
    setIsLoading(false);
  }, [canViewReports]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    const socket = new WebSocket(import.meta.env.VITE_WS_URL || 'ws://localhost:3000/ws');
    socket.onmessage = () => fetchAll();
    socket.onerror = () => setInfo('Realtime updates are temporarily unavailable.');
    socket.onclose = () => setInfo('Realtime connection closed. Refresh to reconnect.');

    return () => {
      socket.onerror = null;
      socket.onclose = null;
      socket.close();
    };
  }, [fetchAll]);

  useEffect(() => {
    if (sections.some((section) => section.id === activeSection)) {
      return;
    }

    setActiveSection(sections[0]?.id || 'dispatch');
  }, [activeSection, sections]);

  useEffect(() => {
    if (!loads.length) {
      setSelectedLoadId(null);
      return;
    }

    if (selectedLoadId === 0) {
      setSelectedLoadId(loads[0].id);
      return;
    }

    if (selectedLoadId !== null && !loads.some((load) => load.id === selectedLoadId)) {
      setSelectedLoadId(0);
    }
  }, [loads, selectedLoadId]);

  const selectedLoad = useMemo(
    () => loads.find((load) => load.id === selectedLoadId) || null,
    [loads, selectedLoadId]
  );

  const runMutation = useCallback(async (message, action) => {
    setIsSaving(true);
    setError('');
    setInfo('');

    try {
      await action();
      await fetchAll();
      setInfo(message);
    } catch (err) {
      setError(formatError(err));
    } finally {
      setIsSaving(false);
    }
  }, [fetchAll]);

  function handleRefresh() {
    setInfo('');
    fetchAll();
  }

  function handleLogout() {
    clearToken();
    persistSession(null);
    onLogout();
  }

  function handleMoveLoad(loadId, driverId, pickupDate) {
    const load = loads.find((item) => item.id === loadId);
    if (!load) {
      return;
    }

    if (!canManage) {
      setError('Your role is read-only for load assignments.');
      return;
    }

    if (load.status === 'delivered' || load.status === 'cancelled') {
      setError('Delivered or cancelled loads cannot be moved from the dispatch board.');
      return;
    }

    const nextStatus = load.status === 'new' ? 'in_progress' : load.status;
    runMutation('Dispatch board updated.', () => api.updateLoad(loadId, {
      ...load,
      driverId,
      pickupDate,
      status: nextStatus
    }));
  }

  function handleSaveLoad(payload, existingLoadId = null) {
    const normalizedPayload = normalizeLoadPayload(payload);
    const targetId = existingLoadId || null;

    if (targetId) {
      const currentLoad = loads.find((load) => load.id === targetId);
      if (!currentLoad) {
        setError('Load not found.');
        return;
      }

      runMutation('Load updated.', () => api.updateLoad(targetId, {
        ...currentLoad,
        ...normalizedPayload
      }));
      return;
    }

    runMutation('Load created.', async () => {
      const created = await api.createLoad(normalizedPayload);
      if (created?.id) {
        setSelectedLoadId(created.id);
      }
    });
  }

  function handleDeleteLoad(loadId) {
    runMutation('Load deleted.', async () => {
      await api.deleteLoad(loadId);
      if (selectedLoadId === loadId) {
        setSelectedLoadId(null);
      }
    });
  }

  function handleSaveDriver(payload, existingDriverId = null) {
    if (existingDriverId) {
      runMutation('Driver updated.', () => api.updateDriver(existingDriverId, payload));
      return;
    }

    runMutation('Driver created.', () => api.createDriver(payload));
  }

  function handleDeleteDriver(driverId) {
    runMutation('Driver deleted.', () => api.deleteDriver(driverId));
  }

  function handleUpdateLoad(loadId, updates, message = 'Load updated.') {
    const load = loads.find((item) => item.id === loadId);
    if (!load) {
      setError('Load not found.');
      return;
    }

    runMutation(message, () => api.updateLoad(loadId, {
      ...load,
      ...normalizeLoadPayload({ ...load, ...updates })
    }));
  }

  function handleSaveNote(loadId, notes) {
    const load = loads.find((item) => item.id === loadId);
    if (!load || notes === load.notes) {
      return;
    }

    handleUpdateLoad(loadId, { notes }, 'Notes saved.');
  }

  function handleUploadFiles(loadId, fileList) {
    const load = loads.find((item) => item.id === loadId);
    if (!load || !fileList?.length) {
      return;
    }

    const nextFiles = Array.from(fileList).map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
      uploadedAt: new Date().toISOString()
    }));

    handleUpdateLoad(loadId, { files: [...(load.files || []), ...nextFiles] }, 'Documents attached.');
  }

  function handleRemoveFile(loadId, fileToRemove) {
    const load = loads.find((item) => item.id === loadId);
    if (!load) {
      return;
    }

    const files = (load.files || []).filter((file) => !(
      file.name === fileToRemove.name &&
      file.uploadedAt === fileToRemove.uploadedAt
    ));

    handleUpdateLoad(loadId, { files }, 'Document removed.');
  }

  return (
    <div className="min-h-screen bg-slate-100 lg:flex">
      <Sidebar
        sections={sections}
        activeSection={activeSection}
        user={session.user}
        onChange={setActiveSection}
        onLogout={handleLogout}
      />
      <main className="flex-1 p-4 lg:p-6 space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">{sections.find((section) => section.id === activeSection)?.label}</h2>
            <p className="text-sm text-slate-500">Signed in as {session.user.name} ({session.user.role}).</p>
          </div>
          <div className="flex gap-2">
            <button type="button" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700" onClick={handleRefresh}>
              Refresh
            </button>
            <button type="button" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {!error && info && <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{info}</p>}
        {isLoading && <p className="text-sm text-slate-500">Loading workspace…</p>}

        {!isLoading && activeSection === 'dispatch' && (
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-4">
            <DashboardPage
              drivers={drivers}
              loads={loads}
              summary={summary}
              filters={dispatchFilters}
              canManage={canManage}
              onFiltersChange={setDispatchFilters}
              onSelectLoad={setSelectedLoadId}
              onMoveLoad={handleMoveLoad}
              selectedLoadId={selectedLoadId}
            />
            <aside className="bg-white border border-slate-200 rounded-xl">
              <LoadDetails
                load={selectedLoad}
                drivers={drivers}
                canManage={canManage}
                isSaving={isSaving}
                onSaveNote={handleSaveNote}
                onUpdateLoad={handleUpdateLoad}
                onUploadFiles={handleUploadFiles}
                onRemoveFile={handleRemoveFile}
                onDeleteLoad={handleDeleteLoad}
              />
            </aside>
          </div>
        )}

        {!isLoading && activeSection === 'loads' && (
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-4">
            <LoadsPage
              loads={loads}
              drivers={drivers}
              canManage={canManage}
              selectedLoadId={selectedLoadId}
              isSaving={isSaving}
              onSelectLoad={setSelectedLoadId}
              onSaveLoad={handleSaveLoad}
            />
            <aside className="bg-white border border-slate-200 rounded-xl">
              <LoadDetails
                load={selectedLoad}
                drivers={drivers}
                canManage={canManage}
                isSaving={isSaving}
                onSaveNote={handleSaveNote}
                onUpdateLoad={handleUpdateLoad}
                onUploadFiles={handleUploadFiles}
                onRemoveFile={handleRemoveFile}
                onDeleteLoad={handleDeleteLoad}
              />
            </aside>
          </div>
        )}

        {!isLoading && activeSection === 'drivers' && (
          <DriversPage
            drivers={drivers}
            canManage={canManage}
            isSaving={isSaving}
            onSaveDriver={handleSaveDriver}
            onDeleteDriver={handleDeleteDriver}
          />
        )}

        {!isLoading && activeSection === 'reports' && canViewReports && (
          <ReportsPage
            summary={summary}
            loads={loads}
            drivers={drivers}
          />
        )}
      </main>
    </div>
  );
}

function App() {
  const [session, setSession] = useState(() => getStoredSession());

  useEffect(() => {
    if (session?.token) {
      setToken(session.token);
    } else {
      clearToken();
    }
  }, [session]);

  if (!session) {
    return <LoginScreen onAuthenticated={setSession} />;
  }

  return <Workspace session={session} onLogout={() => setSession(null)} />;
}

export default App;
