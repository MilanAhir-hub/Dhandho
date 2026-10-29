import React from 'react';
import { Receipt, BookOpen, Package, BarChart3 } from 'lucide-react';

const FEATURES = [
  {
    icon: Receipt,
    color: 'emerald',
    tag: 'For Counter',
    title: 'Fast POS Billing',
    description:
      'Create bills in seconds. Search items in English, Gujarati, or Hindi. One-tap Cash or Add to Khata.',
    detail: 'Supports thermal printer & WhatsApp bill sharing',
  },
  {
    icon: BookOpen,
    color: 'rose',
    tag: 'For Udhar',
    title: 'Khata & Udhar Book',
    description:
      'Maintain every customer\'s Lena-Dena digitally. Send WhatsApp payment reminders with a single tap.',
    detail: 'Auto-calculates pending dues per customer',
  },
  {
    icon: Package,
    color: 'amber',
    tag: 'For Stock',
    title: 'Live Inventory',
    description:
      'Know which items are running low before they run out. Set reorder alerts and track purchase costs vs. sale price.',
    detail: 'Low stock alerts via SMS / WhatsApp',
  },
  {
    icon: BarChart3,
    color: 'violet',
    tag: 'For Owner',
    title: 'Daily Business Report',
    description:
      'Aaj ki bikri, total cash in drawer, top-selling items — all in one clean dashboard. No CA needed.',
    detail: 'Export to Google Sheets or PDF',
  },
];

const colorMap: Record<string, { bg: string; icon: string; tag: string; border: string }> = {
  emerald: {
    bg: 'bg-emerald-50',
    icon: 'text-emerald-600',
    tag: 'bg-emerald-100 text-emerald-800',
    border: 'hover:border-emerald-300',
  },
  rose: {
    bg: 'bg-rose-50',
    icon: 'text-rose-600',
    tag: 'bg-rose-100 text-rose-800',
    border: 'hover:border-rose-300',
  },
  amber: {
    bg: 'bg-amber-50',
    icon: 'text-amber-600',
    tag: 'bg-amber-100 text-amber-800',
    border: 'hover:border-amber-300',
  },
  violet: {
    bg: 'bg-violet-50',
    icon: 'text-violet-600',
    tag: 'bg-violet-100 text-violet-800',
    border: 'hover:border-violet-300',
  },
};

const FeaturesSection: React.FC = () => (
  <section id="features" className="py-24 bg-slate-50">
    <div className="max-w-6xl mx-auto px-6">
      {/* Section header */}
      <div className="text-center mb-14 max-w-2xl mx-auto">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">What You Get</span>
        <h2 className="mt-3 text-4xl font-black text-slate-900 tracking-tight leading-tight">
          One app.{' '}
          <span className="text-emerald-600">Every job done.</span>
        </h2>
        <p className="mt-4 text-slate-500 leading-relaxed">
          Dhandho gives every Kirana store owner exactly what they need — without complexity, without expensive hardware.
        </p>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {FEATURES.map(({ icon: Icon, color, tag, title, description, detail }) => {
          const c = colorMap[color];
          return (
            <div
              key={title}
              className={`group bg-white rounded-2xl border border-slate-200 ${c.border} p-6 flex flex-col gap-4 transition-all duration-200 hover:shadow-lg cursor-pointer`}
            >
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center ${c.icon} group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6" strokeWidth={2} />
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${c.tag}`}>
                  {tag}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{description}</p>
              </div>

              <p className={`text-xs font-semibold ${c.icon} border-t border-slate-100 pt-3`}>
                → {detail}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
