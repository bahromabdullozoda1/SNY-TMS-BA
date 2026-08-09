import { useCallback, useEffect, useMemo, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { LoadDetails } from './components/LoadDetails';
import { DashboardPage } from './pages/DashboardPage';
import { DriversPage } from './pages/DriversPage';
import { LoadsPage } from './pages/LoadsPage';
import { TrucksPage } from './pages/TrucksPage';
import { TrailersPage } from './pages/TrailersPage';
import { FuelPage } from './pages/FuelPage';
import { TollsPage } from './pages/TollsPage';
import { PayrollPage } from './pages/PayrollPage';
import { CustomersPage } from './pages/CustomersPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { ExpensesPage } from './pages/ExpensesPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
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
    truckId: payload.truckId ? Number(payload.truckId) : null,
    trailerId: payload.trailerId ? Number(payload.trailerId) : null,
    rate: Number(payload.rate || 0),
    loadedMiles: Number(payload.loadedMiles || 0),
    deadheadMiles: Number(payload.deadheadMiles || 0),
    driverPayPercent: Number(payload.driverPayPercent || 0)
  };
}

function LoginScreen({ onAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
            <input className="mt-1 w-full border rounded-lg px-3 py-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input className="mt-1 w-full border rounded-lg px-3 py-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
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
  // Core data
  const [drivers, setDrivers] = useState([]);
  const [loads, setLoads] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [trailers, setTrailers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [fuel, setFuel] = useState({ transactions: [], summary: {} });
  const [tolls, setTolls] = useState({ transactions: [], summary: {} });
  const [payroll, setPayroll] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [expenses, setExpenses] = useState({ expenses: [], summary: {} });
  const [documents, setDocuments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [settings, setSettings] = useState(null);
  // UI
  const [dispatchFilters, setDispatchFilters] = useState(initialFilters);
  const [selectedLoadId, setSelectedLoadId] = useState(null);
  const [shouldAutoSelectLoad, setShouldAutoSelectLoad] = useState(true);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const canManage = ['admin', 'manager'].includes(session.user.role);
  const canViewReports = ['admin', 'manager', 'accountant'].includes(session.user.role);
  const canAdmin = session.user.role === 'admin';

  const sections = useMemo(() => {
    const base = [
      { id: 'dispatch', label: 'Dispatch Board' },
      { id: 'loads', label: 'Loads' },
      { id: 'drivers', label: 'Drivers' },
      { id: 'trucks', label: 'Trucks' },
      { id: 'trailers', label: 'Trailers' },
      { id: 'fuel', label: 'Fuel' },
      { id: 'tolls', label: 'Tolls' },
      { id: 'payroll', label: 'Driver Payroll' },
      { id: 'customers', label: 'Customers & Brokers' },
      { id: 'maintenance', label: 'Maintenance' },
      { id: 'expenses', label: 'Expenses' },
      { id: 'documents', label: 'Documents' }
    ];
    if (canViewReports) base.push({ id: 'reports', label: 'Reports' });
    base.push({ id: 'settings', label: 'Settings' });
    return base;
  }, [canViewReports]);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    const results = await Promise.allSettled([
      api.getDrivers(),
      api.getLoads(),
      api.getTrucks(),
      api.getTrailers(),
      api.getCustomers(),
      api.getFuel(),
      api.getTolls(),
      api.getPayroll(),
      api.getMaintenance(),
      api.getExpenses(),
      api.getDocuments(),
      canViewReports ? api.getSummary() : Promise.resolve(null),
      api.getSettings()
    ]);

    const [driversR, loadsR, trucksR, trailersR, customersR, fuelR, tollsR, payrollR, maintR, expensesR, docsR, summaryR, settingsR] = results;

    if (driversR.status === 'fulfilled') setDrivers(driversR.value);
    if (loadsR.status === 'fulfilled') setLoads(loadsR.value);
    if (trucksR.status === 'fulfilled') setTrucks(trucksR.value);
    if (trailersR.status === 'fulfilled') setTrailers(trailersR.value);
    if (customersR.status === 'fulfilled') setCustomers(customersR.value);
    if (fuelR.status === 'fulfilled') setFuel(fuelR.value);
    if (tollsR.status === 'fulfilled') setTolls(tollsR.value);
    if (payrollR.status === 'fulfilled') setPayroll(payrollR.value);
    if (maintR.status === 'fulfilled') setMaintenance(maintR.value);
    if (expensesR.status === 'fulfilled') setExpenses(expensesR.value);
    if (docsR.status === 'fulfilled') setDocuments(docsR.value);
    if (summaryR.status === 'fulfilled') setSummary(summaryR.value);
    if (settingsR.status === 'fulfilled') setSettings(settingsR.value);

    const errs = results.filter((r) => r.status === 'rejected').map((r) => formatError(r.reason));
    setError(errs.length > 0 ? errs[0] : '');
    setIsLoading(false);
  }, [canViewReports]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    let socket;
    let reconnectTimer;
    let isCancelled = false;
    function connect() {
      socket = new WebSocket(import.meta.env.VITE_WS_URL || 'ws://localhost:3000/ws');
      socket.onmessage = () => fetchAll();
      socket.onerror = () => { setInfo('Realtime updates temporarily unavailable.'); socket.close(); };
      socket.onclose = () => {
        if (isCancelled) return;
        setInfo('Realtime connection lost. Reconnecting…');
        reconnectTimer = window.setTimeout(connect, 1500);
      };
    }
    connect();
    return () => {
      isCancelled = true;
      window.clearTimeout(reconnectTimer);
      if (socket) { socket.onerror = null; socket.onclose = null; if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) socket.close(); }
    };
  }, [fetchAll]);

  useEffect(() => {
    if (!loads.length) { setSelectedLoadId(null); return; }
    if (shouldAutoSelectLoad && selectedLoadId === null) { setSelectedLoadId(loads[0].id); setShouldAutoSelectLoad(false); return; }
    if (selectedLoadId !== null && !loads.some((l) => l.id === selectedLoadId)) { setSelectedLoadId(loads[0].id); }
  }, [loads, selectedLoadId, shouldAutoSelectLoad]);

  const selectedLoad = useMemo(() => loads.find((l) => l.id === selectedLoadId) || null, [loads, selectedLoadId]);

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

  function handleRefresh() { setInfo(''); fetchAll(); }
  function handleLogout() { clearToken(); persistSession(null); onLogout(); }

  // Load handlers
  function handleMoveLoad(loadId, driverId, pickupDate) {
    const load = loads.find((item) => item.id === loadId);
    if (!load || !canManage) return;
    if (load.status === 'delivered' || load.status === 'cancelled') { setError('Cannot move delivered/cancelled loads.'); return; }
    const nextStatus = load.status === 'new' ? 'assigned' : load.status;
    runMutation('Dispatch board updated.', () => api.updateLoad(loadId, { ...load, driverId, pickupDate, status: nextStatus }));
  }

  function handleSaveLoad(payload, existingLoadId = null) {
    const normalized = normalizeLoadPayload(payload);
    if (existingLoadId) {
      const current = loads.find((l) => l.id === existingLoadId);
      if (!current) { setError('Load not found.'); return; }
      runMutation('Load updated.', () => api.updateLoad(existingLoadId, { ...current, ...normalized }));
    } else {
      runMutation('Load created.', async () => {
        const created = await api.createLoad(normalized);
        if (created?.id) { setShouldAutoSelectLoad(false); setSelectedLoadId(created.id); }
      });
    }
  }

  function handleDeleteLoad(loadId) {
    runMutation('Load deleted.', async () => {
      await api.deleteLoad(loadId);
      if (selectedLoadId === loadId) { setShouldAutoSelectLoad(true); setSelectedLoadId(null); }
    });
  }

  function handleUpdateLoad(loadId, updates, message = 'Load updated.') {
    const load = loads.find((item) => item.id === loadId);
    if (!load) { setError('Load not found.'); return; }
    runMutation(message, () => api.updateLoad(loadId, { ...load, ...normalizeLoadPayload({ ...load, ...updates }) }));
  }

  function handleSaveNote(loadId, notes) {
    const load = loads.find((item) => item.id === loadId);
    if (!load || notes === load.notes) return;
    handleUpdateLoad(loadId, { notes }, 'Notes saved.');
  }

  function handleUploadFiles(loadId, fileList, category = 'other') {
    const load = loads.find((item) => item.id === loadId);
    if (!load || !fileList?.length) return;
    const nextFiles = Array.from(fileList).map((file) => ({
      id: crypto.randomUUID(), name: file.name, size: file.size,
      type: file.type || 'application/octet-stream', category,
      uploadedAt: new Date().toISOString()
    }));
    handleUpdateLoad(loadId, { files: [...(load.files || []), ...nextFiles] }, 'Documents attached.');
  }

  function handleRemoveFile(loadId, fileToRemove) {
    const load = loads.find((item) => item.id === loadId);
    if (!load) return;
    const files = (load.files || []).filter((file) => file.id !== fileToRemove.id);
    handleUpdateLoad(loadId, { files }, 'Document removed.');
  }

  function handleSelectLoad(loadId) { setShouldAutoSelectLoad(false); setSelectedLoadId(loadId); }
  function handleStartNewLoad() { setShouldAutoSelectLoad(false); setSelectedLoadId(null); }

  // Driver handlers
  function handleSaveDriver(payload, id) {
    if (id) { runMutation('Driver updated.', () => api.updateDriver(id, payload)); }
    else { runMutation('Driver created.', () => api.createDriver(payload)); }
  }
  function handleDeleteDriver(id) { runMutation('Driver deleted.', () => api.deleteDriver(id)); }

  // Truck handlers
  function handleSaveTruck(payload, id) {
    if (id) { runMutation('Truck updated.', () => api.updateTruck(id, payload)); }
    else { runMutation('Truck created.', () => api.createTruck(payload)); }
  }
  function handleDeleteTruck(id) { runMutation('Truck deleted.', () => api.deleteTruck(id)); }

  // Trailer handlers
  function handleSaveTrailer(payload, id) {
    if (id) { runMutation('Trailer updated.', () => api.updateTrailer(id, payload)); }
    else { runMutation('Trailer created.', () => api.createTrailer(payload)); }
  }
  function handleDeleteTrailer(id) { runMutation('Trailer deleted.', () => api.deleteTrailer(id)); }

  // Fuel handlers
  function handleSaveFuel(payload, id) {
    if (id) { runMutation('Fuel updated.', () => api.updateFuel(id, payload)); }
    else { runMutation('Fuel transaction saved.', () => api.createFuel(payload)); }
  }
  function handleDeleteFuel(id) { runMutation('Fuel deleted.', () => api.deleteFuel(id)); }

  // Toll handlers
  function handleSaveToll(payload, id) {
    if (id) { runMutation('Toll updated.', () => api.updateToll(id, payload)); }
    else { runMutation('Toll saved.', () => api.createToll(payload)); }
  }
  function handleDeleteToll(id) { runMutation('Toll deleted.', () => api.deleteToll(id)); }

  // Payroll handlers
  function handleSavePayroll(payload, id) {
    if (id) { runMutation('Statement updated.', () => api.updatePayroll(id, payload)); }
    else { runMutation('Statement created.', () => api.createPayroll(payload)); }
  }
  function handleDeletePayroll(id) { runMutation('Statement deleted.', () => api.deletePayroll(id)); }
  async function handlePreviewPayroll(driverId, periodStart, periodEnd) {
    const params = new URLSearchParams({ driverId, periodStart, periodEnd });
    return api.previewPayroll(params.toString());
  }

  // Customer handlers
  function handleSaveCustomer(payload, id) {
    if (id) { runMutation('Customer updated.', () => api.updateCustomer(id, payload)); }
    else { runMutation('Customer created.', () => api.createCustomer(payload)); }
  }
  function handleDeleteCustomer(id) { runMutation('Customer deleted.', () => api.deleteCustomer(id)); }

  // Maintenance handlers
  function handleSaveMaintenance(payload, id) {
    if (id) { runMutation('Record updated.', () => api.updateMaintenance(id, payload)); }
    else { runMutation('Record created.', () => api.createMaintenance(payload)); }
  }
  function handleDeleteMaintenance(id) { runMutation('Record deleted.', () => api.deleteMaintenance(id)); }

  // Expense handlers
  function handleSaveExpense(payload, id) {
    if (id) { runMutation('Expense updated.', () => api.updateExpense(id, payload)); }
    else { runMutation('Expense saved.', () => api.createExpense(payload)); }
  }
  function handleDeleteExpense(id) { runMutation('Expense deleted.', () => api.deleteExpense(id)); }

  // Document handlers
  function handleSaveDocument(payload) {
    runMutation('Document attached.', () => api.createDocument(payload));
  }
  function handleDeleteDocument(id) { runMutation('Document deleted.', () => api.deleteDocument(id)); }

  // Settings handler
  function handleSaveSettings(payload) {
    runMutation('Settings saved.', () => api.updateSettings(payload));
  }

  const sectionTitle = sections.find((s) => s.id === activeSection)?.label || '';

  const showLoadSidebar = (activeSection === 'dispatch' || activeSection === 'loads');

  return (
    <div className="min-h-screen bg-slate-100 lg:flex">
      <Sidebar sections={sections} activeSection={activeSection} user={session.user} onChange={setActiveSection} onLogout={handleLogout} />
      <main className="flex-1 p-4 lg:p-6 space-y-4 min-w-0">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">{sectionTitle}</h2>
            <p className="text-sm text-slate-500">Signed in as {session.user.name} ({session.user.role})</p>
          </div>
          <div className="flex gap-2">
            <button type="button" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" onClick={handleRefresh}>
              Refresh
            </button>
          </div>
        </div>

        {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {!error && info && <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{info}</p>}
        {isLoading && <p className="text-sm text-slate-500 py-4">Loading workspace…</p>}

        {!isLoading && (
          <>
            {showLoadSidebar ? (
              <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-4">
                {activeSection === 'dispatch' && (
                  <DashboardPage
                    drivers={drivers} loads={loads} summary={summary}
                    filters={dispatchFilters} canManage={canManage}
                    onFiltersChange={setDispatchFilters}
                    onSelectLoad={handleSelectLoad}
                    onMoveLoad={handleMoveLoad}
                    selectedLoadId={selectedLoadId}
                  />
                )}
                {activeSection === 'loads' && (
                  <LoadsPage
                    loads={loads} drivers={drivers} trucks={trucks} trailers={trailers}
                    canManage={canManage} selectedLoadId={selectedLoadId}
                    isSaving={isSaving}
                    onSelectLoad={handleSelectLoad}
                    onStartNewLoad={handleStartNewLoad}
                    onSaveLoad={handleSaveLoad}
                  />
                )}
                <aside className="bg-white border border-slate-200 rounded-xl">
                  <LoadDetails
                    load={selectedLoad} drivers={drivers}
                    canManage={canManage} isSaving={isSaving}
                    onSaveNote={handleSaveNote}
                    onUpdateLoad={handleUpdateLoad}
                    onUploadFiles={handleUploadFiles}
                    onRemoveFile={handleRemoveFile}
                    onDeleteLoad={handleDeleteLoad}
                  />
                </aside>
              </div>
            ) : (
              <>
                {activeSection === 'drivers' && (
                  <DriversPage drivers={drivers} trucks={trucks} trailers={trailers}
                    canManage={canManage} isSaving={isSaving}
                    onSaveDriver={handleSaveDriver} onDeleteDriver={handleDeleteDriver} />
                )}
                {activeSection === 'trucks' && (
                  <TrucksPage trucks={trucks} drivers={drivers} trailers={trailers}
                    canManage={canManage} isSaving={isSaving}
                    onSaveTruck={handleSaveTruck} onDeleteTruck={handleDeleteTruck} />
                )}
                {activeSection === 'trailers' && (
                  <TrailersPage trailers={trailers} trucks={trucks} drivers={drivers}
                    canManage={canManage} isSaving={isSaving}
                    onSaveTrailer={handleSaveTrailer} onDeleteTrailer={handleDeleteTrailer} />
                )}
                {activeSection === 'fuel' && (
                  <FuelPage fuel={fuel} drivers={drivers} trucks={trucks} loads={loads}
                    canManage={canManage} isSaving={isSaving}
                    onSaveFuel={handleSaveFuel} onDeleteFuel={handleDeleteFuel} />
                )}
                {activeSection === 'tolls' && (
                  <TollsPage tolls={tolls} drivers={drivers} trucks={trucks} loads={loads}
                    canManage={canManage} isSaving={isSaving}
                    onSaveToll={handleSaveToll} onDeleteToll={handleDeleteToll} />
                )}
                {activeSection === 'payroll' && (
                  <PayrollPage payroll={payroll} drivers={drivers}
                    canManage={canManage} isSaving={isSaving}
                    onSavePayroll={handleSavePayroll}
                    onDeletePayroll={handleDeletePayroll}
                    onPreviewPayroll={handlePreviewPayroll} />
                )}
                {activeSection === 'customers' && (
                  <CustomersPage customers={customers}
                    canManage={canManage} isSaving={isSaving}
                    onSaveCustomer={handleSaveCustomer} onDeleteCustomer={handleDeleteCustomer} />
                )}
                {activeSection === 'maintenance' && (
                  <MaintenancePage maintenance={maintenance} trucks={trucks} trailers={trailers}
                    canManage={canManage} isSaving={isSaving}
                    onSaveMaintenance={handleSaveMaintenance} onDeleteMaintenance={handleDeleteMaintenance} />
                )}
                {activeSection === 'expenses' && (
                  <ExpensesPage expenses={expenses} drivers={drivers} trucks={trucks}
                    trailers={trailers} loads={loads}
                    canManage={canManage} isSaving={isSaving}
                    onSaveExpense={handleSaveExpense} onDeleteExpense={handleDeleteExpense} />
                )}
                {activeSection === 'documents' && (
                  <DocumentsPage documents={documents} loads={loads} drivers={drivers}
                    trucks={trucks} trailers={trailers} customers={customers}
                    canManage={canManage} isSaving={isSaving}
                    onSaveDocument={handleSaveDocument} onDeleteDocument={handleDeleteDocument} />
                )}
                {activeSection === 'reports' && canViewReports && (
                  <ReportsPage summary={summary} loads={loads} drivers={drivers} />
                )}
                {activeSection === 'settings' && (
                  <SettingsPage settings={settings} canAdmin={canAdmin} isSaving={isSaving} onSaveSettings={handleSaveSettings} />
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function App() {
  const [session, setSession] = useState(() => getStoredSession());

  useEffect(() => {
    if (session?.token) setToken(session.token);
    else clearToken();
  }, [session]);

  if (!session) return <LoginScreen onAuthenticated={setSession} />;
  return <Workspace session={session} onLogout={() => setSession(null)} />;
}

export default App;
