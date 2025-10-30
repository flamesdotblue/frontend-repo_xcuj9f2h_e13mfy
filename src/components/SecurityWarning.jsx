import React from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

export default function SecurityWarning({ onBack }) {
  return (
    <div className="min-h-screen w-full bg-[#070b13] text-white flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <ShieldAlert className="text-rose-500" />
          <h1 className="text-2xl font-semibold">Security Warning</h1>
        </div>
        <p className="text-white/80 mb-4">
          Developer tools or inspection mode was detected. For your security, access to the dashboard is temporarily disabled.
        </p>
        <ul className="list-disc pl-5 text-white/70 text-sm space-y-1 mb-6">
          <li>Close developer tools (Inspect, Console, Network, etc.).</li>
          <li>Reload the page to continue.</li>
          <li>Contact the administrator if this persists.</li>
        </ul>
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 text-amber-400">
            <AlertTriangle size={18} />
            <span className="text-sm">Protection is active.</span>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
