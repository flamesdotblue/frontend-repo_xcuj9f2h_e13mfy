import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';

// Currency formatter (Indian Rupee)
const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

// Data keys
const K_MODELS = 'fk_models';
const K_DEALERS = 'fk_dealers';
const K_CUSTOMERS = 'fk_customers';

function read(key, def) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(def)); } catch { return def; }
}
function write(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
function dispatchUpdated() { window.dispatchEvent(new CustomEvent('fk:data-updated')); }
function toast(msg, type = 'success') { window.dispatchEvent(new CustomEvent('fk:toast', { detail: { msg, type } })); }

export default function Dashboard({ activeTab }) {
  const [models, setModels] = useState(() => read(K_MODELS, []));
  const [dealers, setDealers] = useState(() => read(K_DEALERS, []));
  const [customers, setCustomers] = useState(() => read(K_CUSTOMERS, []));

  useEffect(() => {
    function sync() {
      setModels(read(K_MODELS, []));
      setDealers(read(K_DEALERS, []));
      setCustomers(read(K_CUSTOMERS, []));
    }
    window.addEventListener('fk:data-updated', sync);
    return () => window.removeEventListener('fk:data-updated', sync);
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {activeTab === 'models' && (
        <ModelsSection models={models} onChange={(next) => { write(K_MODELS, next); setModels(next); dispatchUpdated(); toast('Model list updated'); }} />
      )}
      {activeTab === 'dealers' && (
        <DealersSection models={models} dealers={dealers} onChange={(next) => { write(K_DEALERS, next); setDealers(next); dispatchUpdated(); toast('Dealer list updated'); }} />
      )}
      {activeTab === 'customers' && (
        <CustomersSection models={models} dealers={dealers} customers={customers} onChange={(next) => { write(K_CUSTOMERS, next); setCustomers(next); dispatchUpdated(); toast('Customer list updated'); }} />
      )}
      {activeTab === 'profile' && (
        <ProfileSection models={models} customers={customers} />
      )}
    </div>
  );
}

// Modal wrapper
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#0b0f1a] border border-white/10 rounded-xl p-6 shadow-2xl animate-[fadeIn_.2s_ease]">
        <div className="text-lg font-semibold mb-4">{title}</div>
        {children}
      </div>
    </div>
  );
}

// Models Section
function ModelsSection({ models, onChange }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', cost: '', dealerPrice: '', directPrice: '' });

  function reset() { setForm({ name: '', cost: '', dealerPrice: '', directPrice: '' }); setEditing(null); }

  function handleSave() {
    const cost = Number(form.cost || 0);
    const dealerPrice = Number(form.dealerPrice || 0);
    const directPrice = Number(form.directPrice || 0);
    if (!form.name || cost <= 0 || dealerPrice <= 0 || directPrice <= 0) return toast('Fill all fields correctly', 'error');

    if (editing != null) {
      const next = models.map((m, i) => i === editing ? { ...m, ...form, cost, dealerPrice, directPrice } : m);
      onChange(next);
    } else {
      const next = [...models, { ...form, cost, dealerPrice, directPrice, id: crypto.randomUUID() }];
      onChange(next);
    }
    setOpen(false); reset();
  }

  function handleEdit(i) { setEditing(i); const m = models[i]; setForm({ name: m.name, cost: m.cost, dealerPrice: m.dealerPrice, directPrice: m.directPrice }); setOpen(true); }
  function handleDelete(i) { const next = models.filter((_, idx) => idx !== i); onChange(next); }

  return (
    <section className="bg-white/5 border border-white/10 rounded-2xl">
      <div className="p-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Models</h2>
        <button onClick={() => { reset(); setOpen(true); }} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gradient-to-r from-indigo-600 to-violet-600 hover:brightness-110">
          <Plus size={16} /> Add Model
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-white/60">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Cost</th>
              <th className="px-4 py-3">Dealer Price</th>
              <th className="px-4 py-3">Direct Customer Price</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {models.map((m, i) => (
              <tr key={m.id || i} className="border-t border-white/10">
                <td className="px-4 py-3">{m.name}</td>
                <td className="px-4 py-3">{inr.format(m.cost)}</td>
                <td className="px-4 py-3">{inr.format(m.dealerPrice)}</td>
                <td className="px-4 py-3">{inr.format(m.directPrice)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEdit(i)} className="px-2 py-1 rounded bg-white/10 hover:bg-white/20"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(i)} className="px-2 py-1 rounded bg-rose-600/20 hover:bg-rose-600/30 text-rose-300"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {models.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-white/50" colSpan={5}>No models yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing != null ? 'Edit Model' : 'Add Model'}>
        <div className="space-y-3">
          <Input label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Input label="Cost" type="number" value={form.cost} onChange={(v) => setForm({ ...form, cost: v })} />
          <Input label="Dealer Price" type="number" value={form.dealerPrice} onChange={(v) => setForm({ ...form, dealerPrice: v })} />
          <Input label="Direct Customer Price" type="number" value={form.directPrice} onChange={(v) => setForm({ ...form, directPrice: v })} />
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setOpen(false)} className="px-3 py-2 rounded bg-white/10 hover:bg-white/20">Cancel</button>
            <button onClick={handleSave} className="px-3 py-2 rounded bg-emerald-600 hover:brightness-110">Save</button>
          </div>
        </div>
      </Modal>
    </section>
  );
}

// Dealers Section
function DealersSection({ models, dealers, onChange }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', mobile: '', address: '', district: '', state: 'Gujarat', prices: {} });

  function reset() { setForm({ name: '', mobile: '', address: '', district: '', state: 'Gujarat', prices: {} }); setEditing(null); }

  function handleSave() {
    if (!form.name || !form.mobile) return toast('Fill required fields', 'error');
    if (editing != null) {
      const next = dealers.map((d, i) => i === editing ? { ...d, ...form } : d);
      onChange(next);
    } else {
      const next = [...dealers, { ...form, id: crypto.randomUUID() }];
      onChange(next);
    }
    setOpen(false); reset();
  }

  function handleEdit(i) { setEditing(i); const d = dealers[i]; setForm({ name: d.name, mobile: d.mobile, address: d.address, district: d.district, state: d.state, prices: d.prices || {} }); setOpen(true); }
  function handleDelete(i) { const next = dealers.filter((_, idx) => idx !== i); onChange(next); }

  return (
    <section className="bg-white/5 border border-white/10 rounded-2xl">
      <div className="p-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Dealers</h2>
        <button onClick={() => { reset(); setOpen(true); }} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gradient-to-r from-indigo-600 to-violet-600 hover:brightness-110">
          <Plus size={16} /> Add Dealer
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-white/60">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Mobile</th>
              <th className="px-4 py-3">District</th>
              <th className="px-4 py-3">State</th>
              <th className="px-4 py-3">Model Prices</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {dealers.map((d, i) => (
              <tr key={d.id || i} className="border-t border-white/10 align-top">
                <td className="px-4 py-3">{d.name}</td>
                <td className="px-4 py-3">{d.mobile}</td>
                <td className="px-4 py-3">{d.district}</td>
                <td className="px-4 py-3">{d.state}</td>
                <td className="px-4 py-3">
                  <div className="space-y-1">
                    {models.length === 0 && <span className="text-white/40">No models</span>}
                    {models.map((m) => (
                      <div key={m.id} className="flex items-center justify-between gap-4">
                        <span className="text-white/70">{m.name}</span>
                        <span className="text-white/90">{inr.format(d.prices?.[m.id] ?? m.dealerPrice)}</span>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEdit(i)} className="px-2 py-1 rounded bg-white/10 hover:bg-white/20"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(i)} className="px-2 py-1 rounded bg-rose-600/20 hover:bg-rose-600/30 text-rose-300"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {dealers.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-white/50" colSpan={6}>No dealers yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing != null ? 'Edit Dealer' : 'Add Dealer'}>
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          <Input label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Input label="Mobile" value={form.mobile} onChange={(v) => setForm({ ...form, mobile: v })} />
          <Input label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="District" value={form.district} onChange={(v) => setForm({ ...form, district: v })} />
            <Input label="State" value={form.state} onChange={(v) => setForm({ ...form, state: v })} />
          </div>
          <div className="pt-2">
            <div className="text-sm text-white/70 mb-2">Custom Prices</div>
            <div className="space-y-2">
              {models.map((m) => (
                <div key={m.id} className="grid grid-cols-2 gap-3 items-center">
                  <div className="text-white/80">{m.name}</div>
                  <input
                    type="number"
                    value={form.prices?.[m.id] ?? ''}
                    onChange={(e) => setForm({ ...form, prices: { ...(form.prices || {}), [m.id]: Number(e.target.value) } })}
                    className="w-full bg-white/10 border border-white/10 rounded-md px-3 py-2 outline-none focus:border-white/30"
                    placeholder={String(m.dealerPrice)}
                  />
                </div>
              ))}
              {models.length === 0 && <div className="text-white/40 text-sm">Add models to configure prices</div>}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setOpen(false)} className="px-3 py-2 rounded bg-white/10 hover:bg-white/20">Cancel</button>
            <button onClick={handleSave} className="px-3 py-2 rounded bg-emerald-600 hover:brightness-110">Save</button>
          </div>
        </div>
      </Modal>
    </section>
  );
}

// Customers Section
function CustomersSection({ models, dealers, customers, onChange }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', mobile: '', city: '', district: '', state: 'Gujarat', modelId: '', dealerId: '' });

  function reset() { setForm({ name: '', mobile: '', city: '', district: '', state: 'Gujarat', modelId: '', dealerId: '' }); setEditing(null); }

  function calcSellingPrice(modelId, dealerId) {
    const model = models.find(m => m.id === modelId);
    if (!model) return 0;
    if (!dealerId) return Number(model.directPrice || 0);
    const dealer = dealers.find(d => d.id === dealerId);
    const custom = dealer?.prices?.[modelId];
    return Number(custom ?? model.dealerPrice ?? 0);
  }

  function handleSave() {
    if (!form.name || !form.modelId) return toast('Fill required fields', 'error');
    const model = models.find(m => m.id === form.modelId);
    const sellingPrice = calcSellingPrice(form.modelId, form.dealerId);
    const profit = Math.max(0, Number(sellingPrice) - Number(model?.cost || 0));
    const payload = { ...form, id: crypto.randomUUID(), sellingPrice, profit, createdAt: Date.now() };

    if (editing != null) {
      const next = customers.map((c, i) => i === editing ? { ...c, ...payload } : c);
      onChange(next);
    } else {
      const next = [...customers, payload];
      onChange(next);
    }
    setOpen(false); reset();
  }

  function handleEdit(i) { setEditing(i); const c = customers[i]; setForm({ name: c.name, mobile: c.mobile, city: c.city, district: c.district, state: c.state, modelId: c.modelId, dealerId: c.dealerId || '' }); setOpen(true); }
  function handleDelete(i) { const next = customers.filter((_, idx) => idx !== i); onChange(next); }

  return (
    <section className="bg-white/5 border border-white/10 rounded-2xl">
      <div className="p-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Customers</h2>
        <button onClick={() => { reset(); setOpen(true); }} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gradient-to-r from-indigo-600 to-violet-600 hover:brightness-110">
          <Plus size={16} /> Add Customer
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-white/60">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Mobile</th>
              <th className="px-4 py-3">Model</th>
              <th className="px-4 py-3">Dealer</th>
              <th className="px-4 py-3">Selling Price</th>
              <th className="px-4 py-3">Profit</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c, i) => {
              const model = models.find(m => m.id === c.modelId);
              const dealer = dealers.find(d => d.id === c.dealerId);
              return (
                <tr key={c.id || i} className="border-t border-white/10">
                  <td className="px-4 py-3">{c.name}</td>
                  <td className="px-4 py-3">{c.mobile}</td>
                  <td className="px-4 py-3">{model?.name || '-'}</td>
                  <td className="px-4 py-3">{dealer?.name || 'Direct'}</td>
                  <td className="px-4 py-3">{inr.format(c.sellingPrice || 0)}</td>
                  <td className="px-4 py-3">{inr.format(c.profit || 0)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(i)} className="px-2 py-1 rounded bg-white/10 hover:bg-white/20"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(i)} className="px-2 py-1 rounded bg-rose-600/20 hover:bg-rose-600/30 text-rose-300"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {customers.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-white/50" colSpan={7}>No customers yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing != null ? 'Edit Customer' : 'Add Customer'}>
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          <Input label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Input label="Mobile" value={form.mobile} onChange={(v) => setForm({ ...form, mobile: v })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
            <Input label="District" value={form.district} onChange={(v) => setForm({ ...form, district: v })} />
          </div>
          <Input label="State" value={form.state} onChange={(v) => setForm({ ...form, state: v })} />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-white/70 block mb-1">Model</label>
              <select
                value={form.modelId}
                onChange={(e) => setForm({ ...form, modelId: e.target.value })}
                className="w-full bg-white/10 border border-white/10 rounded-md px-3 py-2 outline-none focus:border-white/30"
              >
                <option value="">Select</option>
                {models.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-white/70 block mb-1">Dealer (optional)</label>
              <select
                value={form.dealerId}
                onChange={(e) => setForm({ ...form, dealerId: e.target.value })}
                className="w-full bg-white/10 border border-white/10 rounded-md px-3 py-2 outline-none focus:border-white/30"
              >
                <option value="">Direct</option>
                {dealers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>

          <div className="text-sm text-white/70">
            Selling Price Preview: {inr.format(form.modelId ? ((form.dealerId ? (dealers.find(d=>d.id===form.dealerId)?.prices?.[form.modelId] ?? models.find(m=>m.id===form.modelId)?.dealerPrice) : models.find(m=>m.id===form.modelId)?.directPrice) ?? 0) : 0)}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setOpen(false)} className="px-3 py-2 rounded bg-white/10 hover:bg-white/20">Cancel</button>
            <button onClick={handleSave} className="px-3 py-2 rounded bg-emerald-600 hover:brightness-110">Save</button>
          </div>
        </div>
      </Modal>
    </section>
  );
}

// Simple Charts (SVG)
function BarChart({ data }) {
  const max = Math.max(1, ...data.map(d => d.value));
  return (
    <div className="w-full h-40 flex items-end gap-2">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center">
          <div className="w-full bg-emerald-600/30 rounded-t" style={{ height: `${(d.value / max) * 100}%` }} />
          <div className="text-[10px] mt-1 text-white/60 truncate w-full text-center">{d.label}</div>
        </div>
      ))}
    </div>
  );
}

function PieChart({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let acc = 0;
  const colors = ['#22c55e', '#3b82f6', '#a855f7', '#ef4444', '#f59e0b', '#14b8a6'];
  return (
    <svg viewBox="0 0 32 32" className="w-40 h-40">
      {data.map((d, i) => {
        const val = (d.value / total) * 100;
        const strokeDasharray = `${val} ${100 - val}`;
        const circle = (
          <circle
            key={i}
            r="16"
            cx="16"
            cy="16"
            fill="transparent"
            stroke={colors[i % colors.length]}
            strokeWidth="32"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={-acc}
          />
        );
        acc += val;
        return circle;
      })}
    </svg>
  );
}

// Profile & Statistics Section
function ProfileSection({ models, customers }) {
  const totals = useMemo(() => {
    const turnover = customers.reduce((s, c) => s + Number(c.sellingPrice || 0), 0);
    const profit = customers.reduce((s, c) => s + Number(c.profit || 0), 0);
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const monthlyProfit = customers
      .filter(c => { const d = new Date(c.createdAt || 0); return d.getMonth() === month && d.getFullYear() === year; })
      .reduce((s, c) => s + Number(c.profit || 0), 0);
    return { turnover, profit, monthlyProfit };
  }, [customers]);

  const monthly = useMemo(() => {
    const map = new Map();
    customers.forEach(c => {
      const d = new Date(c.createdAt || 0);
      const key = `${d.getFullYear()}-${d.getMonth()+1}`;
      map.set(key, (map.get(key) || 0) + Number(c.profit || 0));
    });
    return Array.from(map.entries()).sort().map(([label, value]) => ({ label, value }));
  }, [customers]);

  const byModel = useMemo(() => {
    const map = new Map();
    customers.forEach(c => {
      const m = models.find(x => x.id === c.modelId);
      const key = m?.name || 'Unknown';
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries()).map(([label, value]) => ({ label, value }));
  }, [customers, models]);

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Turnover" value={inr.format(totals.turnover)} />
        <StatCard title="Total Profit" value={inr.format(totals.profit)} />
        <StatCard title="Monthly Profit" value={inr.format(totals.monthlyProfit)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="text-white/80 mb-2">Monthly Profit Trend</div>
          <BarChart data={monthly} />
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
          <PieChart data={byModel} />
          <div className="space-y-1 text-sm">
            {byModel.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: ['#22c55e','#3b82f6','#a855f7','#ef4444','#f59e0b','#14b8a6'][i % 6] }} />
                <span className="text-white/80">{d.label}</span>
                <span className="text-white/50">({d.value})</span>
              </div>
            ))}
            {byModel.length === 0 && <div className="text-white/40">No data yet.</div>}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
      <div className="text-white/60 text-sm">{title}</div>
      <div className="text-2xl font-semibold mt-2">{value}</div>
    </div>
  );
}

function Input({ label, type = 'text', value, onChange }) {
  return (
    <div>
      <label className="text-sm text-white/70 block mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/10 border border-white/10 rounded-md px-3 py-2 outline-none focus:border-white/30"
      />
    </div>
  );
}
