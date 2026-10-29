import React from 'react';
import { Store, TrendingUp, Star, Clock } from 'lucide-react';

const STATS = [
  { icon: Store,     value: '500+',  label: 'Active Kirana Stores' },
  { icon: TrendingUp, value: '₹2Cr+', label: 'Daily Transactions' },
  { icon: Star,      value: '4.9',   label: 'Average Rating' },
  { icon: Clock,     value: '24 / 7', label: 'Customer Support' },
];

const StatsBar: React.FC = () => (
  <section className="border-y border-slate-200 bg-white">
    <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x divide-slate-200">
      {STATS.map(({ icon: Icon, value, label }) => (
        <div key={label} className="flex flex-col items-center lg:items-start gap-1 lg:px-10 first:lg:pl-0 last:lg:pr-0">
          <Icon className="h-6 w-6 text-emerald-600 mb-1" strokeWidth={1.8} />
          <p className="text-2xl font-black text-slate-900 font-mono tabular-nums">{value}</p>
          <p className="text-xs font-medium text-slate-500 text-center lg:text-left">{label}</p>
        </div>
      ))}
    </div>
  </section>
);

export default StatsBar;
