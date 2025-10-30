import React, { useEffect, useMemo, useState } from 'react';
import { Lock, User } from 'lucide-react';

const USERNAME = 'Farm@KinGAut0mat1on';
const PASSWORD = 'Farma@2007#$';

// Small crypto helpers (HMAC-SHA-256 via Web Crypto)
async function hmacSHA256(secret, message) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

async function createSessionToken(payload, secret) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  const signature = await hmacSHA256(secret, `${header}.${body}`);
  return `${header}.${body}.${signature}`;
}

function now() { return Date.now(); }

export default function LoginScreen({ onAuthenticated }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [lockedUntil, setLockedUntil] = useState(() => Number(localStorage.getItem('fk_locked_until') || 0));
  const [tries, setTries] = useState(() => Number(localStorage.getItem('fk_failed_tries') || 0));

  const remaining = Math.max(0, Math.floor((lockedUntil - now()) / 1000));

  useEffect(() => {
    const t = setInterval(() => {
      const lu = Number(localStorage.getItem('fk_locked_until') || 0);
      setLockedUntil(lu);
    }, 500);
    return () => clearInterval(t);
  }, []);

  const disabled = remaining > 0;

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    if (disabled) return;

    const ok = username === USERNAME && password === PASSWORD;
    if (!ok) {
      const nt = tries + 1;
      setTries(nt);
      localStorage.setItem('fk_failed_tries', String(nt));
      if (nt >= 3) {
        const until = now() + 60_000; // 60s
        localStorage.setItem('fk_locked_until', String(until));
        setLockedUntil(until);
      }
      setError('Invalid credentials.');
      return;
    }

    // Reset counters
    localStorage.removeItem('fk_failed_tries');
    localStorage.removeItem('fk_locked_until');

    // Create secure session (15 minutes expiry)
    const exp = now() + 15 * 60 * 1000;
    const payload = { sub: 'admin', exp };
    const secret = USERNAME + ':' + PASSWORD; // client-side only; for demo purposes
    const token = await createSessionToken(payload, secret);

    localStorage.setItem('fk_session', JSON.stringify({ token, exp }));
    onAuthenticated({ token, exp });
  }

  return (
    <div className="min-h-screen w-full bg-[#070b13] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-2xl font-semibold">Farm@KinG</div>
          <div className="text-white/60 text-sm">Secure Access</div>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm text-white/70 block mb-1">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={16} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/10 border border-white/10 rounded-md pl-9 pr-3 py-2 outline-none focus:border-white/30 placeholder:text-white/30"
                autoComplete="off"
                spellCheck={false}
                autoCapitalize="none"
                autoCorrect="off"
                required
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-white/70 block mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={16} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/10 border border-white/10 rounded-md pl-9 pr-3 py-2 outline-none focus:border-white/30"
                autoComplete="off"
                spellCheck={false}
                autoCapitalize="none"
                autoCorrect="off"
                required
              />
            </div>
          </div>

          {error && (
            <div className="text-rose-400 text-sm">{error}</div>
          )}

          {disabled ? (
            <div className="text-amber-400 text-sm">Too many attempts. Try again in {remaining}s.</div>
          ) : null}

          <button
            type="submit"
            disabled={disabled}
            className={`w-full px-4 py-2 rounded-md font-medium transition shadow ${
              disabled
                ? 'bg-white/10 text-white/40 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110'
            }`}
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
