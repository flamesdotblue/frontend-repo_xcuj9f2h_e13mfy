import React, { useEffect, useMemo, useState } from 'react';
import { Plus, X, Pencil, Trash2 } from 'lucide-react';

const LS_KEY = 'fk_models';

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

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
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', cost: '', customerPrice: '', dealerPrice: '' });

  useEffect(() => {
    saveModels(models);
    window.dispatchEvent(new Event('fk:data-updated'));
  }, [models]);

  const canSave = useMemo(() => {
    const { name, cost, customerPrice, dealerPrice } = form;
    const ok =
      name.trim().length > 1 &&
      [cost, customerPrice, dealerPrice].every((v) => v !== '' && !Number.isNaN(Number(v)) && Number(v) >= 0);
    return ok;
  }, [form]);

  const openForCreate = () => {
    setEditingId(null);
    setForm({ name: '', cost: '', customerPrice: '', dealerPrice: '' });
    setModalOpen(true);
  };

  const openForEdit = (m) => {
    setEditingId(m.id);
    setForm({ name: m.name, cost: String(m.cost), customerPrice: String(m.customerPrice), dealerPrice: String(m.dealerPrice) });
    setModalOpen(true);
  };

  const saveItem = () => {
    if (!canSave) return;
    if (editingId) {
      setModels((prev) => prev.map((p) => (p.id === editingId ? { ...p, ...{
        name: form.name.trim(),
        cost: Number(form.cost),
        customerPrice: Number(form.customerPrice),
        dealerPrice: Number(form.dealerPrice),
        updatedAt: Date.now(),
      }} : p)));
      window.dispatchEvent(new CustomEvent('fk:toast', { detail: { msg: 'Model updated successfully!', type: 'success' } }));
    } else {
      const item = {
        id: crypto.randomUUID(),
        name: form.name.trim(),
        cost: Number(form.cost),
        customerPrice: Number(form.customerPrice),
        dealerPrice: Number(form.dealerPrice),
        createdAt: Date.now(),
      };
      setModels((prev) => [item, ...prev]);
      window.dispatchEvent(new CustomEvent('fk:toast', { detail: { msg: 'Model added successfully!', type: 'success' } }));
    }
    setModalOpen(false);
  };

  const confirmDelete = (id) => {
    if (!window.confirm('Delete this model? This action cannot be undone.')) return;
    setModels((prev) => prev.filter((m) => m.id !== id));
    window.dispatchEvent(new CustomEvent('fk:toast', { detail: { msg: 'Model deleted.', type: 'success' } }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-100">Models</h2>
        <button onClick={openForCreate} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition">
          <Plus size={16} />
          <span>Add Model</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-zinc-400">
              <th className="py-2 pr-4">Model</th>
              <th className="py-2 pr-4">Cost</th>
              <th className="py-2 pr-4">Direct Price</th>
              <th className="py-2 pr-4">Dealer Price</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {models.length === 0 ? (
              <tr>
                <td className="py-6 text-zinc-500" colSpan={5}>No models yet. Add your first model.</td>
              </tr>
            ) : (
              models.map((m) => (
                <tr key={m.id} className="border-t border-zinc-800 text-zinc-200">
                  <td className="py-3 pr-4 font-medium">{m.name}</td>
                  <td className="py-3 pr-4">{inr(m.cost)}</td>
                  <td className="py-3 pr-4">{inr(m.customerPrice)}</td>
                  <td className="py-3 pr-4">{inr(m.dealerPrice)}</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openForEdit(m)} className="p-2 rounded-md bg-zinc-900/60 border border-zinc-800 hover:bg-zinc-800 transition" title="Edit">
                        <Pencil size={16} className="text-zinc-300" />
                      </button>
                      <button onClick={() => confirmDelete(m.id)} className="p-2 rounded-md bg-red-950/40 border border-red-900 hover:bg-red-900/30 transition" title="Delete">
                        <Trash2 size={16} className="text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-2xl mx-4 rounded-2xl border border-emerald-500/20 bg-zinc-950 shadow-lg shadow-emerald-500/10 p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-zinc-100">{editingId ? 'Edit Model' : 'Add Model'}</h3>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-md hover:bg-zinc-900">
                <X size={18} className="text-zinc-400" />
              </button>
            </div>
            <div className="grid md:grid-cols-4 gap-4">
              <input
                placeholder="Model Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg bg-zinc-900/70 border border-zinc-800 px-3 py-2 text-zinc-100 placeholder-zinc-500"
              />
              <input
                placeholder="Cost Price"
                type="number"
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: e.target.value })}
                className="w-full rounded-lg bg-zinc-900/70 border border-zinc-800 px-3 py-2 text-zinc-100 placeholder-zinc-500"
              />
              <input
                placeholder="Direct Customer Price"
                type="number"
                value={form.customerPrice}
                onChange={(e) => setForm({ ...form, customerPrice: e.target.value })}
                className="w-full rounded-lg bg-zinc-900/70 border border-zinc-800 px-3 py-2 text-zinc-100 placeholder-zinc-500"
              />
              <input
                placeholder="Dealer Price"
                type="number"
                value={form.dealerPrice}
                onChange={(e) => setForm({ ...form, dealerPrice: e.target.value })}
                className="w-full rounded-lg bg-zinc-900/70 border border-zinc-800 px-3 py-2 text-zinc-100 placeholder-zinc-500"
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200">Cancel</button>
              <button onClick={saveItem} disabled={!canSave} className={`px-4 py-2 rounded-lg ${canSave ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-400 cursor-not-allowed'}`}>{editingId ? 'Save Changes' : 'Create Model'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
