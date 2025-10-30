import React, { useEffect, useState } from 'react';
import { Lock, User, LogIn } from 'lucide-react';

const USERNAME = 'Farm@KinGAut0mat1on';
const PASSWORD = 'Farma@2007#$';

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [tries, setTries] = useState(() => Number(localStorage.getItem('fk_failed_tries') || 0));
  const [lockedUntil, setLockedUntil] = useState(() => Number(localStorage.getItem('fk_locked_until') || 0));
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const locked = lockedUntil && now < lockedUntil;
  const secondsLeft = locked ? Math.ceil((lockedUntil - now) / 1000) : 0;

  function handleSubmit(e) {
    e.preventDefault();
    if (locked) return;

    if (username === USERNAME && password === PASSWORD) {
      const session = {
        token: btoa(`${username}:${Date.now()}`),
        exp: Date.now() + 15 * 60 * 1000,
        user: 'FarmaKing Admin',
      };
      localStorage.setItem('fk_session', JSON.stringify(session));
      localStorage.setItem('fk_failed_tries', '0');
      localStorage.removeItem('fk_locked_until');
      onLogin(session);
    } else {
      const newTries = tries + 1;
      setTries(newTries);
      localStorage.setItem('fk_failed_tries', String(newTries));
      setError('Invalid credentials.');
      if (newTries >= 3) {
        const until = Date.now() + 60 * 1000;
        setLockedUntil(until);
        localStorage.setItem('fk_locked_until', String(until));
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-400/30">
              <Lock className="h-6 w-6 text-emerald-400" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-semibold text-white">FarmaKing Automation Dashboard</h1>
              <p className="text-sm text-slate-400">Secure access only</p>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="bg-slate-900/60 backdrop-blur rounded-xl border border-white/10 p-6 space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Username</label>
            <div className="relative">
              <User className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoComplete="off"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950/70 border border-white/10 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                placeholder="Enter username"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950/70 border border-white/10 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
                placeholder="Enter password"
              />
            </div>
          </div>

          {error && <div className="text-sm text-rose-400">{error}</div>}
          {locked && (
            <div className="text-sm text-amber-400">Locked due to multiple failed attempts. Try again in {secondsLeft}s.</div>
          )}

          <button
            type="submit"
            disabled={locked}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-500 text-black font-medium hover:bg-emerald-400 transition disabled:opacity-50"
          >
            <LogIn className="h-5 w-5" /> Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
