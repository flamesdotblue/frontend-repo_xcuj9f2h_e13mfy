import React, { useEffect, useMemo, useState } from 'react';
import { Plus, X, Pencil, Trash2 } from 'lucide-react';

const LS_KEY = 'fk_customers';
const LS_MODELS = 'fk_models';
const LS_DEALERS = 'fk_dealers';
const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const load = (k, fallback) => {
  try {
    const raw = localStorage.getItem(k);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

function saveCustomers(data) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

export default function CustomersSection() {
  const [customers, setCustomers] = useState(() => load(LS_KEY, []));
  const [models, setModels] = useState(() => load(LS_MODELS, []));
  const [dealers, setDealers] = useState(() => load(LS_DEALERS, []));
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    city: '',
    district: '',
    state: 'Gujarat',
    modelId: '',
    dealerId: '', // optional reference dealer
  });

  useEffect(() => {
    saveCustomers(customers);
    window.dispatchEvent(new Event('fk:data-updated'));
  }, [customers]);

  useEffect(() => {
    const handler = () => {
      setModels(load(LS_MODELS, []));
      setDealers(load(LS_DEALERS, []));
    };
    window.addEventListener('fk:data-updated', handler);
    return () => window.removeEventListener('fk:data-updated', handler);
  }, []);

  const modelMap = useMemo(() => Object.fromEntries(models.map((m) => [m.id, m])), [models]);
  const dealerMap = useMemo(() => Object.fromEntries(dealers.map((d) => [d.id, d])), [dealers]);

  const canSave = useMemo(() => {
    return (
      form.name.trim() &&
      form.mobile.trim().length >= 6 &&
      form.city.trim() &&
      form.district.trim() &&
      form.modelId
    );
  }, [form]);

  const computeSelling = (modelId, dealerId) => {
    const m = modelMap[modelId];
    if (!m) return 0;
    if (!dealerId) return Number(m.customerPrice || 0);
    const d = dealerMap[dealerId];
    const custom = d?.priceMap?.[modelId];
    return custom != null && custom !== '' ? Number(custom) : Number(m.dealerPrice || 0);
  };

  const openForCreate = () => {
    setEditingId(null);
    setForm({ name: '', mobile: '', city: '', district: '', state: 'Gujarat', modelId: '', dealerId: '' });
    setModalOpen(true);
  };

  const openForEdit = (c) => {
    setEditingId(c.id);
    setForm({
      name: c.name,
      mobile: c.mobile,
      city: c.city,
      district: c.district,
      state: c.state || 'Gujarat',
      modelId: c.modelId,
      dealerId: c.dealerId || '',
    });
    setModalOpen(true);
  };

  const saveItem = () => {
    if (!canSave) return;
    const sellingPrice = computeSelling(form.modelId, form.dealerId || '');
    const cost = modelMap[form.modelId]?.cost || 0;
    const profit = sellingPrice - cost;

    if (editingId) {
      setCustomers((prev) => prev.map((p) => (p.id === editingId ? { ...p, ...form, sellingPrice, profit, updatedAt: Date.now() } : p)));
      window.dispatchEvent(new CustomEvent('fk:toast', { detail: { msg: 'Customer updated successfully!', type: 'success' } }));
    } else {
      const item = { id: crypto.randomUUID(), ...form, sellingPrice, profit, createdAt: Date.now() };
      setCustomers((prev) => [item, ...prev]);
      window.dispatchEvent(new CustomEvent('fk:toast', { detail: { msg: 'Customer added successfully!', type: 'success' } }));
    }
    setModalOpen(false);
  };

  const confirmDelete = (id) => {
    if (!window.confirm('Delete this customer?')) return;
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    window.dispatchEvent(new CustomEvent('fk:toast', { detail: { msg: 'Customer deleted.', type: 'success' } }));
  };

  const previewSelling = computeSelling(form.modelId, form.dealerId || '');
  const previewProfit = previewSelling - (modelMap[form.modelId]?.cost || 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-100">Customers</h2>
        <button onClick={openForCreate} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition">
          <Plus size={16} />
          <span>Add Customer</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-zinc-400">
              <th className="py-2 pr-4">Customer</th>
              <th className="py-2 pr-4">Contact</th>
              <th className="py-2 pr-4">Location</th>
              <th className="py-2 pr-4">Model</th>
              <th className="py-2 pr-4">Type</th>
              <th className="py-2 pr-4">Selling</th>
              <th className="py-2 pr-4">Profit</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td className="py-6 text-zinc-500" colSpan={8}>No customers yet. Add your first customer.</td>
              </tr>
            ) : (
              customers.map((c) => {
                const m = modelMap[c.modelId];
                const d = dealerMap[c.dealerId || ''];
                const type = c.dealerId ? `Dealer (${d ? d.name : '-'})` : 'Direct';
                return (
                  <tr key={c.id} className="border-t border-zinc-800 text-zinc-200">
                    <td className="py-3 pr-4 font-medium">{c.name}</td>
                    <td className="py-3 pr-4">{c.mobile}</td>
                    <td className="py-3 pr-4">{[c.city, c.district, c.state].filter(Boolean).join(', ')}</td>
                    <td className="py-3 pr-4">{m ? m.name : '-'}</td>
                    <td className="py-3 pr-4">{type}</td>
                    <td className="py-3 pr-4 text-emerald-400">{inr(c.sellingPrice)}</td>
                    <td className="py-3 pr-4 text-emerald-300">{inr(c.profit)}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openForEdit(c)} className="p-2 rounded-md bg-zinc-900/60 border border-zinc-800 hover:bg-zinc-800 transition" title="Edit">
                          <Pencil size={16} className="text-zinc-300" />
                        </button>
                        <button onClick={() => confirmDelete(c.id)} className="p-2 rounded-md bg-red-950/40 border border-red-900 hover:bg-red-900/30 transition" title="Delete">
                          <Trash2 size={16} className="text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-3xl mx-4 rounded-2xl border border-emerald-500/20 bg-zinc-950 shadow-lg shadow-emerald-500/10 p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-zinc-100">{editingId ? 'Edit Customer' : 'Add Customer'}</h3>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-md hover:bg-zinc-900">
                <X size={18} className="text-zinc-400" />
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <input
                placeholder="Customer Name"
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
                placeholder="City"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full rounded-lg bg-zinc-900/70 border border-zinc-800 px-3 py-2 text-zinc-100 placeholder-zinc-500"
              />
              <input
                placeholder="District"
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                className="w-full rounded-lg bg-zinc-900/70 border border-zinc-800 px-3 py-2 text-zinc-100 placeholder-zinc-500"
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
              <select
                value={form.modelId}
                onChange={(e) => setForm({ ...form, modelId: e.target.value })}
                className="w-full rounded-lg bg-zinc-900/70 border border-zinc-800 px-3 py-2 text-zinc-100"
              >
                <option value="">Select Model</option>
                {models.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              <select
                value={form.dealerId}
                onChange={(e) => setForm({ ...form, dealerId: e.target.value })}
                className="w-full rounded-lg bg-zinc-900/70 border border-zinc-800 px-3 py-2 text-zinc-100"
              >
                <option value="">No Dealer (Direct)</option>
                {dealers.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-sm text-zinc-300">
              {form.modelId ? (
                <div className="flex flex-wrap gap-4">
                  <span>Base Cost: <span className="text-zinc-100">{inr(modelMap[form.modelId]?.cost || 0)}</span></span>
                  <span>Selling Price: <span className="text-emerald-400">{inr(previewSelling)}</span></span>
                  <span>Profit: <span className="text-emerald-300">{inr(previewProfit)}</span></span>
                </div>
              ) : (
                <span>Select a model to see pricing and profit.</span>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200">Cancel</button>
              <button onClick={saveItem} disabled={!canSave} className={`px-4 py-2 rounded-lg ${canSave ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-400 cursor-not-allowed'}`}>{editingId ? 'Save Changes' : 'Create Customer'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
