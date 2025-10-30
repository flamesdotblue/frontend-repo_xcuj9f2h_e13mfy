import React, { useEffect, useState } from 'react';

const LS_KEY = 'fk_dealers';

function loadDealers() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveDealers(data) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

export default function DealersSection() {
  const [dealers, setDealers] = useState(() => loadDealers());
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', location: '', refId: '' });

  useEffect(() => {
    saveDealers(dealers);
    // notify others
    window.dispatchEvent(new Event('fk:data-updated'));
  }, [dealers]);

  const canCreate = form.name.trim().length > 1 && form.location.trim().length > 1;

  const handleCreate = () => {
    if (!canCreate) return;
    const item = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      location: form.location.trim(),
      refId: form.refId.trim() || undefined,
      createdAt: Date.now(),
    };
    setDealers((prev) => [item, ...prev]);
    setForm({ name: '', location: '', refId: '' });
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-100">Dealers</h2>
        <button
          onClick={() => setOpen((v) => !v)}
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
        >
          {open ? 'Close' : 'Add Dealer'}
        </button>
      </div>

      {open && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 grid md:grid-cols-3 gap-4">
          <input
            placeholder="Dealer Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg bg-zinc-900/70 border border-zinc-800 px-3 py-2 text-zinc-100 placeholder-zinc-500"
          />
          <input
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="w-full rounded-lg bg-zinc-900/70 border border-zinc-800 px-3 py-2 text-zinc-100 placeholder-zinc-500"
          />
          <div className="flex gap-2">
            <input
              placeholder="Reference ID (optional)"
              value={form.refId}
              onChange={(e) => setForm({ ...form, refId: e.target.value })}
              className="w-full rounded-lg bg-zinc-900/70 border border-zinc-800 px-3 py-2 text-zinc-100 placeholder-zinc-500"
            />
            <button
              onClick={handleCreate}
              disabled={!canCreate}
              className={`px-4 py-2 rounded-lg transition-colors ${canCreate ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-zinc-800 text-zinc-400 cursor-not-allowed'}`}
            >
              Create
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-zinc-400">
              <th className="py-2 pr-4">Dealer</th>
              <th className="py-2 pr-4">Location</th>
              <th className="py-2 pr-4">Reference ID</th>
            </tr>
          </thead>
          <tbody>
            {dealers.length === 0 ? (
              <tr>
                <td className="py-6 text-zinc-500" colSpan={3}>No dealers yet. Add your first dealer.</td>
              </tr>
            ) : (
              dealers.map((d) => (
                <tr key={d.id} className="border-t border-zinc-800 text-zinc-200">
                  <td className="py-3 pr-4 font-medium">{d.name}</td>
                  <td className="py-3 pr-4">{d.location}</td>
                  <td className="py-3 pr-4">{d.refId || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
