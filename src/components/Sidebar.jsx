import React from 'react';
import { Package, Store, Users } from 'lucide-react';

const tabs = [
  { key: 'models', label: 'Model Management', icon: Package },
  { key: 'dealers', label: 'Dealer Management', icon: Store },
  { key: 'customers', label: 'Customer Management', icon: Users },
];

export default function Sidebar({ active, onChange }) {
  return (
    <aside className="h-full w-full md:w-64 bg-gradient-to-b from-zinc-900 to-black text-zinc-100 border-r border-zinc-800">
      <div className="px-5 py-6">
        <div className="text-2xl font-semibold tracking-tight">
          <span className="bg-gradient-to-r from-emerald-400 to-green-600 bg-clip-text text-transparent">Farm@KinG</span>
          <span className="text-zinc-400"> Dashboard</span>
        </div>
        <p className="mt-1 text-xs text-zinc-500">Automation Suite</p>
      </div>
      <nav className="px-2 space-y-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = active === t.key;
          return (
            <button
              key={t.key}
              onClick={() => onChange(t.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left 
                ${isActive ? 'bg-zinc-800/70 ring-1 ring-emerald-500/40 shadow shadow-emerald-500/10' : 'hover:bg-zinc-800/40'}`}
            >
              <Icon size={18} className={isActive ? 'text-emerald-400' : 'text-zinc-400'} />
              <span className={`text-sm ${isActive ? 'text-zinc-100' : 'text-zinc-300'}`}>{t.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="mt-auto p-4 hidden md:block">
        <div className="rounded-xl bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 p-4">
          <p className="text-xs text-zinc-400">Manage models, dealers and customers, with instant profit insights.</p>
        </div>
      </div>
    </aside>
  );
}
