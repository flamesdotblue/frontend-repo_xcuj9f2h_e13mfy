import React from 'react';
import { LayoutGrid, Package, Users, User, LogOut } from 'lucide-react';

export default function Sidebar({ active, onChange, onLogout }) {
  const items = [
    { key: 'profile', label: 'Profile', icon: LayoutGrid },
    { key: 'models', label: 'Models', icon: Package },
    { key: 'dealers', label: 'Dealers', icon: Users },
    { key: 'customers', label: 'Customers', icon: User },
  ];

  return (
    <aside className="h-full w-64 hidden md:flex flex-col border-r border-white/10 bg-slate-950/60">
      <div className="p-4 border-b border-white/10">
        <div className="text-sm text-slate-400">FarmaKing</div>
        <div className="text-lg font-semibold text-white">Automation</div>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {items.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition text-left border ${
              active === key
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-transparent border-transparent text-slate-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </nav>
      <div className="p-3 border-t border-white/10">
        <button
          onClick={onLogout}
          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 transition"
        >
          <LogOut className="h-5 w-5" /> Logout
        </button>
      </div>
    </aside>
  );
}
