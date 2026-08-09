import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { api, setToken } from './services/api';

function LoginScreen({ onAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      const result = await api.login({ email, password });
      setToken(result.token);
      onAuthenticated();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border p-6 w-full max-w-sm space-y-3">
        <h1 className="text-xl font-semibold">Sign in to TMS</h1>
        <input className="w-full border rounded px-3 py-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="w-full bg-blue-600 text-white rounded py-2" type="submit">Login</button>
      </form>
    </div>
  );
}

function App() {
  const [authenticated, setAuthenticated] = useState(false);

  if (!authenticated) {
    return <LoginScreen onAuthenticated={() => setAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 lg:flex">
      <Sidebar />
      <main className="flex-1 p-4 lg:p-6">
        <DashboardPage />
      </main>
    </div>
  );
}

export default App;
