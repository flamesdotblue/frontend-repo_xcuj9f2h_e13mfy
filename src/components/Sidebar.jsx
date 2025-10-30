import React from 'react';
import { Home, User, Settings, BarChart3, Boxes } from 'lucide-react';

export default function Sidebar({ activeTab, onTabChange, onLogout }) {
  const tabs = [
    { key: 'models', label: 'Model Management', icon: Boxes },
    { key: 'dealers', label: 'Dealer Management', icon: User },
    { key: 'customers', label: 'Customer Management', icon: Home },
    { key: 'profile', label: 'Profile & Statistics', icon: BarChart3 },
  ];

  return (
    <aside className="h-full w-full md:w-64 bg-[#0b0f1a]/90 backdrop-blur border-r border-white/10 text-white flex flex-col">
      <div className="px-5 py-4 border-b border-white/10">
        <div className="text-xl font-semibold tracking-wide">Farm@KinG</div>
        <div className="text-xs text-white/60">Automation Dashboard</div>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition rounded-md mx-3 my-1 ${
              activeTab === key
                ? 'bg-white/10 text-white shadow-inner'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon size={18} />
            <span className="text-sm">{label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={onLogout}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-gradient-to-r from-rose-600 to-pink-600 text-white font-medium shadow hover:shadow-lg hover:brightness-110 transition"
        >
          <Settings size={16} /> Logout
        </button>
      </div>
    </aside>
  );
}
