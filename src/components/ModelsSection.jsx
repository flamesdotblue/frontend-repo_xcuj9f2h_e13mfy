import React, { useEffect, useMemo, useState } from 'react';

const LS_KEY = 'fk_models';

function loadModels() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveModels(data) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

export default function ModelsSection() {
  const [models, setModels] = useState(() => loadModels());
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', cost: '', customerPrice: '', dealerPrice: '' });

  useEffect(() => {
    saveModels(models);
    // notify others (like CustomersSection via App) to refresh derived views
    window.dispatchEvent(new Event('fk:data-updated'));
  }, [models]);

  const canCreate = useMemo(() => {
    const { name, cost, customerPrice, dealerPrice } = form;
    return (
      name.trim().length > 1 &&
      !Number.isNaN(Number(cost)) &&
      !Number.isNaN(Number(customerPrice)) &&
      !Number.isNaN(Number(dealerPrice)) &&
      Number(cost) >= 0 &&
      Number(customerPrice) >= 0 &&
      Number(dealerPrice) >= 0
    );
  }, [form]);

  const handleCreate = () => {
    if (!canCreate) return;
    const item = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      cost: Number(form.cost),
      customerPrice: Number(form.customerPrice),
      dealerPrice: Number(form.dealerPrice),
      createdAt: Date.now(),
    };
    setModels((prev) => [item, ...prev]);
    setForm({ name: '', cost: '', customerPrice: '', dealerPrice: '' });
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-100">Models</h2>
        <button
          onClick={() => setOpen((v) => !v)}
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
        >
          {open ? 'Close' : 'Add Model'}
        </button>
      </div>

      {open && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 grid md:grid-cols-4 gap-4">
          <input
            placeholder="Model Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg bg-zinc-900/70 border border-zinc-800 px-3 py-2 text-zinc-100 placeholder-zinc-500"
          />
          <input
            placeholder="Model Cost (to company)"
            type="number"
            value={form.cost}
            onChange={(e) => setForm({ ...form, cost: e.target.value })}
            className="w-full rounded-lg bg-zinc-900/70 border border-zinc-800 px-3 py-2 text-zinc-100 placeholder-zinc-500"
          />
          <input
            placeholder="Customer Price"
            type="number"
            value={form.customerPrice}
            onChange={(e) => setForm({ ...form, customerPrice: e.target.value })}
            className="w-full rounded-lg bg-zinc-900/70 border border-zinc-800 px-3 py-2 text-zinc-100 placeholder-zinc-500"
          />
          <div className="flex gap-2">
            <input
              placeholder="Dealer Price"
              type="number"
              value={form.dealerPrice}
              onChange={(e) => setForm({ ...form, dealerPrice: e.target.value })}
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
              <th className="py-2 pr-4">Model</th>
              <th className="py-2 pr-4">Cost</th>
              <th className="py-2 pr-4">Customer Price</th>
              <th className="py-2 pr-4">Dealer Price</th>
            </tr>
          </thead>
          <tbody>
            {models.length === 0 ? (
              <tr>
                <td className="py-6 text-zinc-500" colSpan={4}>No models yet. Add your first model.</td>
              </tr>
            ) : (
              models.map((m) => (
                <tr key={m.id} className="border-t border-zinc-800 text-zinc-200">
                  <td className="py-3 pr-4 font-medium">{m.name}</td>
                  <td className="py-3 pr-4">₹{m.cost.toLocaleString('en-IN')}</td>
                  <td className="py-3 pr-4">₹{m.customerPrice.toLocaleString('en-IN')}</td>
                  <td className="py-3 pr-4">₹{m.dealerPrice.toLocaleString('en-IN')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
