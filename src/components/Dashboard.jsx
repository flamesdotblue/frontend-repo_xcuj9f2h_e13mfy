import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Edit, Trash2, BarChart3 } from 'lucide-react';

function useStorage(key, initial = []) {
  const [data, setData] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) ?? initial; } catch { return initial; }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(data));
    // Notify other tabs/components
    window.dispatchEvent(new CustomEvent('fk:data-updated', { detail: { key } }));
  }, [key, data]);
  useEffect(() => {
    const handler = (e) => {
      if (e.type === 'storage' && e.key === key) {
        try { setData(JSON.parse(e.newValue) ?? initial); } catch {}
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [key]);
  return [data, setData];
}

function SectionHeader({ title, onAdd }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {onAdd && (
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 transition"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      )}
    </div>
  );
}

function Modal({ open, onClose, children, title }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-white font-semibold">{title}</h4>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function Dashboard({ active: activeProp, onChange }) {
  const [internalActive, setInternalActive] = useState('profile');
  const active = activeProp ?? internalActive;
  const setActive = onChange ?? setInternalActive;

  const [models, setModels] = useStorage('fk_models');
  const [dealers, setDealers] = useStorage('fk_dealers');
  const [customers, setCustomers] = useStorage('fk_customers');

  // Profile stats
  const stats = useMemo(() => {
    return {
      models: models.length,
      dealers: dealers.length,
      customers: customers.length,
    };
  }, [models, dealers, customers]);

  // Growth by month (customers)
  const growth = useMemo(() => {
    const map = new Map();
    customers.forEach((c) => {
      const d = c.createdAt ? new Date(c.createdAt) : new Date();
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      map.set(key, (map.get(key) || 0) + 1);
    });
    const months = [...map.keys()].sort();
    return months.map((m) => ({ month: m, value: map.get(m) }));
  }, [customers]);

  // Forms state
  const [modal, setModal] = useState(null); // { type: 'models'|'dealers'|'customers', item, index }

  function handleSave(type, payload, index) {
    const withMeta = { ...payload, createdAt: payload.createdAt || Date.now() };
    if (type === 'models') {
      if (index != null) {
        const next = [...models];
        next[index] = withMeta;
        setModels(next);
      } else {
        setModels([withMeta, ...models]);
      }
    }
    if (type === 'dealers') {
      if (index != null) {
        const next = [...dealers];
        next[index] = withMeta;
        setDealers(next);
      } else {
        setDealers([withMeta, ...dealers]);
      }
    }
    if (type === 'customers') {
      if (index != null) {
        const next = [...customers];
        next[index] = withMeta;
        setCustomers(next);
      } else {
        setCustomers([withMeta, ...customers]);
      }
    }
    setModal(null);
  }

  function handleDelete(type, index) {
    if (type === 'models') setModels(models.filter((_, i) => i !== index));
    if (type === 'dealers') setDealers(dealers.filter((_, i) => i !== index));
    if (type === 'customers') setCustomers(customers.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      {active === 'profile' && (
        <section className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
              <div className="text-slate-400 text-sm">Total Models</div>
              <div className="text-3xl font-semibold text-white">{stats.models}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
              <div className="text-slate-400 text-sm">Total Dealers</div>
              <div className="text-3xl font-semibold text-white">{stats.dealers}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
              <div className="text-slate-400 text-sm">Total Customers</div>
              <div className="text-3xl font-semibold text-white">{stats.customers}</div>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
            <div className="flex items-center gap-2 mb-3 text-slate-200">
              <BarChart3 className="h-5 w-5" /> Monthly Customer Growth
            </div>
            <div className="h-40">
              <svg viewBox="0 0 300 100" className="w-full h-full">
                <defs>
                  <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#34d399" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
                {growth.length > 0 ? (
                  <>
                    {growth.map((d, i) => {
                      const x = (i / Math.max(1, growth.length - 1)) * 280 + 10;
                      const y = 90 - (d.value / Math.max(1, ...growth.map((g) => g.value))) * 80;
                      return <circle key={d.month} cx={x} cy={y} r="3" fill="#34d399" />;
                    })}
                  </>
                ) : (
                  <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#94a3b8">No data</text>
                )}
              </svg>
            </div>
          </div>
        </section>
      )}

      {/* Models Section */}
      {active === 'models' && (
        <section>
          <SectionHeader title="Model Management" onAdd={() => setModal({ type: 'models' })} />
          <div className="rounded-xl overflow-hidden border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-slate-300">
                <tr>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">SKU</th>
                  <th className="text-left p-3">Dealer Price (₹)</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {models.map((m, i) => (
                  <tr key={i} className="hover:bg-white/5">
                    <td className="p-3 text-slate-200">{m.name}</td>
                    <td className="p-3 text-slate-300">{m.sku}</td>
                    <td className="p-3 text-slate-300">{Number(m.dealerPrice || 0).toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right">
                      <button className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-200 mr-2" onClick={() => setModal({ type: 'models', item: m, index: i })}>
                        <Edit className="h-4 w-4" /> Edit
                      </button>
                      <button className="inline-flex items-center gap-1 px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300" onClick={() => handleDelete('models', i)}>
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {models.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-slate-400">No models yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Dealers Section */}
      {active === 'dealers' && (
        <section>
          <SectionHeader title="Dealer Management" onAdd={() => setModal({ type: 'dealers' })} />
          <div className="rounded-xl overflow-hidden border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-slate-300">
                <tr>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Phone</th>
                  <th className="text-left p-3">City</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {dealers.map((d, i) => (
                  <tr key={i} className="hover:bg-white/5">
                    <td className="p-3 text-slate-200">{d.name}</td>
                    <td className="p-3 text-slate-300">{d.phone}</td>
                    <td className="p-3 text-slate-300">{d.city}</td>
                    <td className="p-3 text-right">
                      <button className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-200 mr-2" onClick={() => setModal({ type: 'dealers', item: d, index: i })}>
                        <Edit className="h-4 w-4" /> Edit
                      </button>
                      <button className="inline-flex items-center gap-1 px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300" onClick={() => handleDelete('dealers', i)}>
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {dealers.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-slate-400">No dealers yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Customers Section */}
      {active === 'customers' && (
        <section>
          <SectionHeader title="Customer Management" onAdd={() => setModal({ type: 'customers' })} />
          <div className="rounded-xl overflow-hidden border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-white/5 text-slate-300">
                <tr>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Model</th>
                  <th className="text-left p-3">Selling Price (₹)</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {customers.map((c, i) => (
                  <tr key={i} className="hover:bg-white/5">
                    <td className="p-3 text-slate-200">{c.name}</td>
                    <td className="p-3 text-slate-300">{c.model}</td>
                    <td className="p-3 text-slate-300">{Number((c.sellingPrice ?? c.price) || 0).toLocaleString('en-IN')}</td>
                    <td className="p-3 text-right">
                      <button className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-200 mr-2" onClick={() => setModal({ type: 'customers', item: c, index: i })}>
                        <Edit className="h-4 w-4" /> Edit
                      </button>
                      <button className="inline-flex items-center gap-1 px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300" onClick={() => handleDelete('customers', i)}>
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-slate-400">No customers yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal ? `Add / Edit ${modal.type.slice(0, 1).toUpperCase() + modal.type.slice(1)}` : ''}
      >
        {modal && (
          <Form
            type={modal.type}
            item={modal.item}
            onSubmit={(payload) => handleSave(modal.type, payload, modal.index)}
          />
        )}
      </Modal>

      {/* Tab controls for small screens */}
      <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur border border-white/10 rounded-full px-2 py-1 flex items-center gap-1">
        {[
          ['profile', 'Profile'],
          ['models', 'Models'],
          ['dealers', 'Dealers'],
          ['customers', 'Customers'],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={`px-3 py-1 rounded-full text-sm ${active === key ? 'bg-emerald-500 text-black' : 'text-slate-300'}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Form({ type, item, onSubmit }) {
  const [form, setForm] = useState(() => ({ ...(item || {}) }));

  function update(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  function submit(e) {
    e.preventDefault();
    onSubmit(form);
  }

  const inputCls = 'w-full px-3 py-2 rounded-lg bg-slate-950/70 border border-white/10 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/60';

  if (type === 'models') {
    return (
      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Model Name">
            <input value={form.name || ''} onChange={(e) => update('name', e.target.value)} className={inputCls} placeholder="e.g. FK-200" />
          </Field>
          <Field label="SKU">
            <input value={form.sku || ''} onChange={(e) => update('sku', e.target.value)} className={inputCls} placeholder="e.g. SKU-200" />
          </Field>
          <Field label="Dealer Price (₹)">
            <input type="number" value={form.dealerPrice || ''} onChange={(e) => update('dealerPrice', Number(e.target.value))} className={inputCls} placeholder="0" />
          </Field>
        </div>
        <Footer />
      </form>
    );
  }

  if (type === 'dealers') {
    return (
      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Dealer Name">
            <input value={form.name || ''} onChange={(e) => update('name', e.target.value)} className={inputCls} placeholder="Dealer name" />
          </Field>
          <Field label="Phone">
            <input value={form.phone || ''} onChange={(e) => update('phone', e.target.value)} className={inputCls} placeholder="Phone number" />
          </Field>
          <Field label="City">
            <input value={form.city || ''} onChange={(e) => update('city', e.target.value)} className={inputCls} placeholder="City" />
          </Field>
        </div>
        <Footer />
      </form>
    );
  }

  // customers
  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Customer Name">
          <input value={form.name || ''} onChange={(e) => update('name', e.target.value)} className={inputCls} placeholder="Customer name" />
        </Field>
        <Field label="Model">
          <input value={form.model || ''} onChange={(e) => update('model', e.target.value)} className={inputCls} placeholder="Model name" />
        </Field>
        <Field label="Selling Price (₹)">
          <input type="number" value={form.sellingPrice || ''} onChange={(e) => update('sellingPrice', Number(e.target.value))} className={inputCls} placeholder="0" />
        </Field>
      </div>
      <Footer />
    </form>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-sm text-slate-300 mb-1">{label}</span>
      {children}
    </label>
  );
}

function Footer() {
  return (
    <div className="pt-2 flex items-center justify-end gap-2">
      <button type="submit" className="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400">Save</button>
    </div>
  );
}
