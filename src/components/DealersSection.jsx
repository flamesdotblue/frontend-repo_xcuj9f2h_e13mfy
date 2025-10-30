import React, { useEffect, useMemo, useState } from 'react';
import { Plus, X, Pencil, Trash2 } from 'lucide-react';

const LS_KEY = 'fk_dealers';
const LS_MODELS = 'fk_models';
const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const load = (k, fallback) => {
  try {
    const raw = localStorage.getItem(k);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

function saveDealers(data) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

export default function DealersSection() {
  const [dealers, setDealers] = useState(() => load(LS_KEY, []));
  const [models, setModels] = useState(() => load(LS_MODELS, []));
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    address: '',
    district: '',
    state: 'Gujarat',
    priceMap: {}, // modelId -> price
  });

  useEffect(() => {
    saveDealers(dealers);
    window.dispatchEvent(new Event('fk:data-updated'));
  }, [dealers]);

  useEffect(() => {
    const handler = () => setModels(load(LS_MODELS, []));
    window.addEventListener('fk:data-updated', handler);
    return () => window.removeEventListener('fk:data-updated', handler);
  }, []);

  const canSave = useMemo(() => form.name.trim() && form.mobile.trim().length >= 6 && form.address.trim() && form.district.trim(), [form]);

  const openForCreate = () => {
    setEditingId(null);
    setForm({ name: '', mobile: '', address: '', district: '', state: 'Gujarat', priceMap: {} });
    setModalOpen(true);
  };

  const openForEdit = (d) => {
    setEditingId(d.id);
    setForm({
      name: d.name,
      mobile: d.mobile || '',
      address: d.address || '',
      district: d.district || '',
      state: d.state || 'Gujarat',
      priceMap: d.priceMap || {},
    });
    setModalOpen(true);
  };

  const saveItem = () => {
    if (!canSave) return;
    if (editingId) {
      setDealers((prev) => prev.map((p) => (p.id === editingId ? { ...p, ...form, updatedAt: Date.now() } : p)));
      window.dispatchEvent(new CustomEvent('fk:toast', { detail: { msg: 'Dealer updated successfully!', type: 'success' } }));
    } else {
      const item = { id: crypto.randomUUID(), ...form, createdAt: Date.now() };
      setDealers((prev) => [item, ...prev]);
      window.dispatchEvent(new CustomEvent('fk:toast', { detail: { msg: 'Dealer added successfully!', type: 'success' } }));
    }
    setModalOpen(false);
  };

  const confirmDelete = (id) => {
    if (!window.confirm('Delete this dealer?')) return;
    setDealers((prev) => prev.filter((d) => d.id !== id));
    window.dispatchEvent(new CustomEvent('fk:toast', { detail: { msg: 'Dealer deleted.', type: 'success' } }));
  };

  const getPriceForModel = (dealer, model) => {
    const custom = dealer.priceMap?.[model.id];
    return custom != null && custom !== '' ? Number(custom) : Number(model.dealerPrice || 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-100">Dealers</h2>
        <button onClick={openForCreate} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition">
          <Plus size={16} />
          <span>Add Dealer</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-zinc-400">
              <th className="py-2 pr-4">Dealer</th>
              <th className="py-2 pr-4">Mobile</th>
              <th className="py-2 pr-4">Address</th>
              <th className="py-2 pr-4">District</th>
              <th className="py-2 pr-4">State</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {dealers.length === 0 ? (
              <tr>
                <td className="py-6 text-zinc-500" colSpan={6}>No dealers yet. Add your first dealer.</td>
              </tr>
            ) : (
              dealers.map((d) => (
                <tr key={d.id} className="border-t border-zinc-800 text-zinc-200 align-top">
                  <td className="py-3 pr-4 font-medium">{d.name}
                    {models.length > 0 && (
                      <div className="mt-2 text-xs text-zinc-400">
                        Prices:
                        <ul className="mt-1 space-y-1">
                          {models.map((m) => (
                            <li key={m.id} className="flex justify-between gap-6">
                              <span className="text-zinc-500">{m.name}</span>
                              <span className="text-emerald-400">{inr(getPriceForModel(d, m))}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </td>
                  <td className="py-3 pr-4">{d.mobile || '-'}</td>
                  <td className="py-3 pr-4">{d.address || '-'}</td>
                  <td className="py-3 pr-4">{d.district || '-'}</td>
                  <td className="py-3 pr-4">{d.state || '-'}</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openForEdit(d)} className="p-2 rounded-md bg-zinc-900/60 border border-zinc-800 hover:bg-zinc-800 transition" title="Edit">
                        <Pencil size={16} className="text-zinc-300" />
                      </button>
                      <button onClick={() => confirmDelete(d.id)} className="p-2 rounded-md bg-red-950/40 border border-red-900 hover:bg-red-900/30 transition" title="Delete">
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-3xl mx-4 rounded-2xl border border-emerald-500/20 bg-zinc-950 shadow-lg shadow-emerald-500/10 p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-zinc-100">{editingId ? 'Edit Dealer' : 'Add Dealer'}</h3>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-md hover:bg-zinc-900">
                <X size={18} className="text-zinc-400" />
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <input
                placeholder="Dealer Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg bg-zinc-900/70 border border-zinc-800 px-3 py-2 text-zinc-100 placeholder-zinc-500"
              />
              <input
                placeholder="Mobile Number"
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                className="w-full rounded-lg bg-zinc-900/70 border border-zinc-800 px-3 py-2 text-zinc-100 placeholder-zinc-500"
              />
              <input
                placeholder="District"
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                className="w-full rounded-lg bg-zinc-900/70 border border-zinc-800 px-3 py-2 text-zinc-100 placeholder-zinc-500"
              />
              <input
                placeholder="Address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="md:col-span-2 w-full rounded-lg bg-zinc-900/70 border border-zinc-800 px-3 py-2 text-zinc-100 placeholder-zinc-500"
              />
              <select
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="w-full rounded-lg bg-zinc-900/70 border border-zinc-800 px-3 py-2 text-zinc-100"
              >
                <option value="Gujarat">Gujarat</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-medium text-zinc-300 mb-2">Custom Dealer Prices per Model</h4>
              {models.length === 0 ? (
                <p className="text-xs text-zinc-500">No models available yet. Add models first to set custom prices.</p>
              ) : (
                <div className="grid md:grid-cols-2 gap-3">
                  {models.map((m) => (
                    <div key={m.id} className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
                      <div className="flex-1">
                        <p className="text-sm text-zinc-200 font-medium">{m.name}</p>
                        <p className="text-xs text-zinc-500">Default: {inr(m.dealerPrice)}</p>
                      </div>
                      <input
                        type="number"
                        placeholder={String(m.dealerPrice)}
                        value={form.priceMap?.[m.id] ?? ''}
                        onChange={(e) => setForm((prev) => ({ ...prev, priceMap: { ...prev.priceMap, [m.id]: e.target.value } }))}
                        className="w-40 rounded-lg bg-zinc-900/70 border border-zinc-800 px-3 py-2 text-zinc-100 placeholder-zinc-500"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200">Cancel</button>
              <button onClick={saveItem} disabled={!canSave} className={`px-4 py-2 rounded-lg ${canSave ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-400 cursor-not-allowed'}`}>{editingId ? 'Save Changes' : 'Create Dealer'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
