import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import ModelsSection from './components/ModelsSection.jsx';
import DealersSection from './components/DealersSection.jsx';
import CustomersSection from './components/CustomersSection.jsx';
import Spline from '@splinetool/react-spline';

const USERNAME = 'Farm@KinGAut0mat1on';
const PASSWORD = 'Farma@2007#$';

const LS_MODELS = 'fk_models';
const LS_DEALERS = 'fk_dealers';
const LS_AUTH = 'fk_auth';

function useLocalArray(key) {
  const [data, setData] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const refresh = () => {
    try {
      const raw = localStorage.getItem(key);
      setData(raw ? JSON.parse(raw) : []);
    } catch {
      setData([]);
    }
  };

  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener('fk:data-updated', handler);
    return () => window.removeEventListener('fk:data-updated', handler);
  }, []);

  return [data, refresh];
}

export default function App() {
  const [authed, setAuthed] = useState(() => localStorage.getItem(LS_AUTH) === 'true');
  const [tab, setTab] = useState('models');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [models] = useLocalArray(LS_MODELS);
  const [dealers] = useLocalArray(LS_DEALERS);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === USERNAME && password === PASSWORD) {
      localStorage.setItem(LS_AUTH, 'true');
      setAuthed(true);
      setError('');
    } else {
      setError('Invalid credentials.');
    }
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <Spline scene="https://prod.spline.design/LU2mWMPbF3Qi1Qxh/scene.splinecode" style={{ width: '100%', height: '100%' }} />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/70 via-black/70 to-black" />
        </div>
        <div className="relative z-10 w-full max-w-md p-8 rounded-2xl border border-emerald-500/20 bg-zinc-900/70 backdrop-blur">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold text-zinc-100">Farm@KinG Automation</h1>
            <p className="text-zinc-400 text-sm">Secure Access</p>
          </div>
          <form className="space-y-4" onSubmit={handleLogin}>
            <input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-zinc-100 placeholder-zinc-500"
            />
            <input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-zinc-100 placeholder-zinc-500"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button type="submit" className="w-full py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition">Login</button>
            <p className="text-xs text-zinc-500 text-center">
              Hint: {USERNAME} / {PASSWORD}
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-black text-zinc-100">
      {/* Hero cover with Spline */}
      <div className="relative h-64 w-full">
        <Spline scene="https://prod.spline.design/LU2mWMPbF3Qi1Qxh/scene.splinecode" style={{ width: '100%', height: '100%' }} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black" />
        <div className="absolute inset-0 flex items-end">
          <div className="px-6 md:px-10 pb-6">
            <h1 className="text-2xl md:text-3xl font-semibold">
              <span className="bg-gradient-to-r from-emerald-400 to-green-600 bg-clip-text text-transparent">Farm@KinG</span>
              <span className="text-zinc-300"> Automation Dashboard</span>
            </h1>
            <p className="text-zinc-400 text-sm">Manage models, dealers and customers with instant profit insights.</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-[16rem_1fr] gap-0 min-h-[calc(100vh-16rem)]">
        <Sidebar active={tab} onChange={setTab} />
        <main className="p-6 md:p-8 space-y-8">
          {tab === 'models' && <ModelsSection />}
          {tab === 'dealers' && <DealersSection />}
          {tab === 'customers' && (
            <CustomersSection models={models} dealers={dealers} />
          )}
        </main>
      </div>
    </div>
  );
}
