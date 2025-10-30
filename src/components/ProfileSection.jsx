import React, { useEffect, useMemo, useState } from 'react';
import { IndianRupee, TrendingUp, Calendar } from 'lucide-react';

const LS_CUSTOMERS = 'fk_customers';

const load = (k, fallback) => {
  try {
    const raw = localStorage.getItem(k);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export default function ProfileSection() {
  const [customers, setCustomers] = useState(() => load(LS_CUSTOMERS, []));

  useEffect(() => {
    const handler = () => setCustomers(load(LS_CUSTOMERS, []));
    window.addEventListener('fk:data-updated', handler);
    return () => window.removeEventListener('fk:data-updated', handler);
  }, []);

  const totals = useMemo(() => {
    const now = new Date();
    const curMonth = now.getMonth();
    const curYear = now.getFullYear();
    let turnover = 0;
    let profit = 0;
    let monthProfit = 0;
    for (const c of customers) {
      const sp = Number(c.sellingPrice || 0);
      const pf = Number(c.profit || 0);
      turnover += sp;
      profit += pf;
      const dt = new Date(c.createdAt || Date.now());
      if (dt.getMonth() === curMonth && dt.getFullYear() === curYear) monthProfit += pf;
    }
    return { turnover, profit, monthProfit };
  }, [customers]);

  const Card = ({ title, icon: Icon, value, accent }) => (
    <div className={`rounded-2xl p-5 border ${accent} bg-zinc-950/60 backdrop-blur shadow-lg`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-zinc-400">{title}</p>
        <Icon size={18} className="text-zinc-400" />
      </div>
      <div className="text-2xl font-semibold bg-gradient-to-r from-emerald-400 to-green-600 bg-clip-text text-transparent">{value}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-zinc-100">Profile & Statistics</h2>
      <div className="grid md:grid-cols-3 gap-4">
        <Card title="Total Turnover" icon={IndianRupee} value={inr(totals.turnover)} accent="border-emerald-500/20 shadow-emerald-500/10" />
        <Card title="Total Profit" icon={TrendingUp} value={inr(totals.profit)} accent="border-green-500/20 shadow-green-500/10" />
        <Card title="Monthly Profit" icon={Calendar} value={inr(totals.monthProfit)} accent="border-teal-500/20 shadow-teal-500/10" />
      </div>

      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-zinc-300">
        Metrics update automatically as you add, edit, or delete customers.
      </div>
    </div>
  );
}
