import React, { useEffect, useMemo, useState } from 'react';

const LS_KEY = 'fk_customers';

function loadCustomers() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCustomers(data) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

export default function CustomersSection({ models, dealers }) {
  const [customers, setCustomers] = useState(() => loadCustomers());
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    contact: '',
    type: 'direct',
    dealerId: '',
    modelId: '',
    reference: false,
  });

  useEffect(() => {
    saveCustomers(customers);
  }, [customers]);

  const canCreate = useMemo(() => {
    const base = form.name.trim().length > 1 && form.contact.trim().length >= 6 && form.modelId;
    if (form.type === 'dealer') return base && form.dealerId;
    return base;
  }, [form]);

  const handleCreate = () => {
    if (!canCreate) return;
    const item = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      contact: form.contact.trim(),
      type: form.type,
      dealerId: form.type === 'dealer' ? form.dealerId : null,
      modelId: form.modelId,
      reference: !!form.reference,
      createdAt: Date.now(),
    };
    setCustomers((prev) => [item, ...prev]);
    setForm({ name: '', contact: '', type: 'direct', dealerId: '', modelId: '', reference: false });
    setOpen(false);
  };

  const modelMap = useMemo(() => Object.fromEntries(models.map((m) => [m.id, m])), [models]);
  const dealerMap = useMemo(() => Object.fromEntries(dealers.map((d) => [d.id, d])), [dealers]);

  const displayRows = customers.map((c) => {
    const m = modelMap[c.modelId];
    const baseCost = m ? m.cost : 0;
    let selling = 0;
    if (m) {
      selling = c.type === 'dealer' ? m.dealerPrice : m.customerPrice;
      if (c.reference) selling += 20000;
    }
    const profit = selling - baseCost;
    return { ...c, model: m, dealer: dealerMap[c.dealerId || ''], selling, profit };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-100">Customers</h2>
        <button
          onClick={() => setOpen((v) => !v)}
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
        >
          {open ? 'Close' : 'Add Customer'}
        </button>
      </div>

      {open && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 grid md:grid-cols-6 gap-4">
          <input
            placeholder="Customer Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg bg-zinc-900/70 border border-zinc-800 px-3 py-2 text-zinc-100 placeholder-zinc-500"
          />
          <input
            placeholder="Contact Number"
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
            className="w-full rounded-lg bg-zinc-900/70 border border-zinc-800 px-3 py-2 text-zinc-100 placeholder-zinc-500"
          />
          <select
            value={form.modelId}
            onChange={(e) => setForm({ ...form, modelId: e.target.value })}
            className="w-full rounded-lg bg-zinc-900/70 border border-zinc-800 px-3 py-2 text-zinc-100"
          >
            <option value="">Select Model</option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} — Cst: ₹{m.cost.toLocaleString('en-IN')} | Cust: ₹{m.customerPrice.toLocaleString('en-IN')} | Dealer: ₹{m.dealerPrice.toLocaleString('en-IN')}
              </option>
            ))}
          </select>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full rounded-lg bg-zinc-900/70 border border-zinc-800 px-3 py-2 text-zinc-100"
          >
            <option value="direct">Direct Customer</option>
            <option value="dealer">Dealer's Customer</option>
          </select>
          {form.type === 'dealer' ? (
            <select
              value={form.dealerId}
              onChange={(e) => setForm({ ...form, dealerId: e.target.value })}
              className="w-full rounded-lg bg-zinc-900/70 border border-zinc-800 px-3 py-2 text-zinc-100"
            >
              <option value="">Select Dealer</option>
              {dealers.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          ) : (
            <div className="h-0 md:h-auto" />
          )}
          <label className="flex items-center gap-2 text-zinc-300">
            <input
              type="checkbox"
              checked={form.reference}
              onChange={(e) => setForm({ ...form, reference: e.target.checked })}
              className="accent-emerald-600"
            />
            Reference (+₹20,000)
          </label>

          {/* Dynamic summary */}
          <div className="md:col-span-6 rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-sm text-zinc-300">
            {(() => {
              const m = modelMap[form.modelId || ''];
              if (!m) return <span>Select a model to see pricing and profit.</span>;
              const base = form.type === 'dealer' ? m.dealerPrice : m.customerPrice;
              const selling = base + (form.reference ? 20000 : 0);
              const profit = selling - m.cost;
              return (
                <div className="flex flex-wrap gap-4">
                  <span>Base Cost: <span className="text-zinc-100">₹{m.cost.toLocaleString('en-IN')}</span></span>
                  <span>Selling Price: <span className="text-emerald-400">₹{selling.toLocaleString('en-IN')}</span></span>
                  <span>Profit: <span className="text-emerald-300">₹{profit.toLocaleString('en-IN')}</span></span>
                </div>
              );
            })()}
          </div>

          <div className="md:col-span-6 flex justify-end">
            <button
              onClick={handleCreate}
              disabled={!canCreate}
              className={`px-4 py-2 rounded-lg transition-colors ${canCreate ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-zinc-800 text-zinc-400 cursor-not-allowed'}`}
            >
              Create Customer
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-zinc-400">
              <th className="py-2 pr-4">Customer</th>
              <th className="py-2 pr-4">Contact</th>
              <th className="py-2 pr-4">Type</th>
              <th className="py-2 pr-4">Model</th>
              <th className="py-2 pr-4">Selling Price</th>
              <th className="py-2 pr-4">Profit</th>
            </tr>
          </thead>
          <tbody>
            {displayRows.length === 0 ? (
              <tr>
                <td className="py-6 text-zinc-500" colSpan={6}>No customers yet. Add your first customer.</td>
              </tr>
            ) : (
              displayRows.map((c) => (
                <tr key={c.id} className="border-t border-zinc-800 text-zinc-200">
                  <td className="py-3 pr-4 font-medium">{c.name}</td>
                  <td className="py-3 pr-4">{c.contact}</td>
                  <td className="py-3 pr-4">{c.type === 'dealer' ? `Dealer (${c.dealer ? c.dealer.name : '-'})` : 'Direct'}</td>
                  <td className="py-3 pr-4">{c.model ? c.model.name : '-'}</td>
                  <td className="py-3 pr-4 text-emerald-400">₹{c.selling.toLocaleString('en-IN')}</td>
                  <td className="py-3 pr-4 text-emerald-300">₹{c.profit.toLocaleString('en-IN')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
