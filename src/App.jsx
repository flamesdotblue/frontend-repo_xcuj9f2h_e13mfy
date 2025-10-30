import React, { useEffect, useMemo, useRef, useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import LoginScreen from './components/LoginScreen.jsx';
import SecurityWarning from './components/SecurityWarning.jsx';
import Dashboard from './components/Dashboard.jsx';

// Toast Center
function ToastCenter() {
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    function onToast(e) {
      const id = crypto.randomUUID();
      const t = { id, msg: e.detail?.msg || '', type: e.detail?.type || 'success' };
      setToasts((prev) => [...prev, t]);
      setTimeout(() => setToasts((prev) => prev.filter(x => x.id !== id)), 2500);
    }
    window.addEventListener('fk:toast', onToast);
    return () => window.removeEventListener('fk:toast', onToast);
  }, []);
  return (
    <div className="fixed top-4 right-4 z-[60] space-y-2">
      {toasts.map(t => (
        <div key={t.id} className={`px-4 py-2 rounded-lg shadow text-sm border ${t.type === 'error' ? 'bg-rose-600/20 border-rose-400/30 text-rose-200' : 'bg-emerald-600/20 border-emerald-400/30 text-emerald-200'}`}>{t.msg}</div>
      ))}
    </div>
  );
}

// Basic devtools detection heuristic
function useDevtoolsGuard(onDetected) {
  useEffect(() => {
    let detected = false;
    function check() {
      const threshold = 160;
      const opened = (window.outerWidth - window.innerWidth > threshold) || (window.outerHeight - window.innerHeight > threshold);
      // eslint-disable-next-line no-console
      if (opened && !detected) { detected = true; onDetected?.(); }
    }
    const i = setInterval(check, 800);
    return () => clearInterval(i);
  }, [onDetected]);
}

function disableEval() {
  try {
    Object.defineProperty(window, 'eval', { value: () => { throw new Error('eval is disabled'); }, writable: false });
  } catch {}
}

function readSession() {
  try { return JSON.parse(localStorage.getItem('fk_session') || 'null'); } catch { return null; }
}

export default function App() {
  const [activeTab, setActiveTab] = useState('models');
  const [session, setSession] = useState(() => readSession());
  const [warning, setWarning] = useState(false);

  // Remove hero: Start directly with content layout

  // Security protections
  useDevtoolsGuard(() => {
    setWarning(true);
    // Clear session if any
    localStorage.removeItem('fk_session');
    setSession(null);
  });
  useEffect(() => { disableEval(); }, []);

  // Inactivity auto-logout (15 minutes)
  useEffect(() => {
    function getExp() { return Number(readSession()?.exp || 0); }
    function updateActivity() {
      const s = readSession();
      if (!s) return;
      const exp = Date.now() + 15 * 60 * 1000;
      const next = { ...s, exp };
      localStorage.setItem('fk_session', JSON.stringify(next));
    }
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(ev => window.addEventListener(ev, updateActivity));
    const i = setInterval(() => {
      const exp = getExp();
      if (exp && Date.now() > exp) {
        localStorage.removeItem('fk_session');
        setSession(null);
        window.dispatchEvent(new CustomEvent('fk:toast', { detail: { msg: 'Session timed out', type: 'error' } }));
      }
    }, 1000);
    return () => {
      events.forEach(ev => window.removeEventListener(ev, updateActivity));
      clearInterval(i);
    };
  }, []);

  function handleAuthenticated(next) {
    setSession(next);
  }

  function handleLogout() {
    localStorage.removeItem('fk_session');
    setSession(null);
  }

  if (warning) {
    return <SecurityWarning onBack={() => setWarning(false)} />;
  }

  if (!session) {
    return (
      <>
        <LoginScreen onAuthenticated={handleAuthenticated} />
        <ToastCenter />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b13] text-white">
      <div className="grid grid-cols-1 md:grid-cols-[16rem_1fr] min-h-screen">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} />
        <main className="bg-gradient-to-b from-transparent to-white/[0.03]"> 
          <div className="max-w-7xl mx-auto">
            <Dashboard activeTab={activeTab} />
          </div>
        </main>
      </div>
      <ToastCenter />
    </div>
  );
}
