import React, { useEffect, useMemo, useState } from 'react';
import Hero3D from './components/Hero3D';
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';

export default function App() {
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fk_session')); } catch { return null; }
  });
  const [active, setActive] = useState('profile');

  // Session expiry auto-logout (15m)
  useEffect(() => {
    const t = setInterval(() => {
      const raw = localStorage.getItem('fk_session');
      if (!raw) return;
      try {
        const s = JSON.parse(raw);
        if (s.exp && Date.now() > s.exp) {
          localStorage.removeItem('fk_session');
          setSession(null);
        }
      } catch {}
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const loggedIn = useMemo(() => Boolean(session), [session]);

  function handleLogout() {
    localStorage.removeItem('fk_session');
    setSession(null);
  }

  if (!loggedIn) return <LoginScreen onLogin={setSession} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-slate-200">
      <header className="sticky top-0 z-20 backdrop-blur bg-slate-950/50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30" />
            <div>
              <div className="text-xs text-slate-400 leading-tight">FarmaKing</div>
              <div className="text-white font-semibold leading-tight">Automation Dashboard</div>
            </div>
          </div>
          <div className="text-xs text-slate-400">Secure • Single user</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-[16rem,1fr] gap-6">
        <Sidebar active={active} onChange={setActive} onLogout={handleLogout} />
        <div className="space-y-6">
          <Hero3D />
          <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
            <Dashboard />
          </div>
        </div>
      </main>
    </div>
  );
}
