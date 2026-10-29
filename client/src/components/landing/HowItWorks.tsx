import React from 'react';
import { Download, ScanLine, CheckCircle2, Share2 } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    icon: Download,
    title: 'Setup in 5 Minutes',
    description:
      'Download the app or open it in your browser. Add your store name, owner name, and you are ready to bill.',
    color: 'emerald',
  },
  {
    step: '02',
    icon: ScanLine,
    title: 'Add Your Products',
    description:
      'Add items with name, price, and unit (kg, packet, liter). Add in Gujarati or Hindi too — for fast search.',
    color: 'violet',
  },
  {
    step: '03',
    icon: CheckCircle2,
    title: 'Bill & Collect',
    description:
      'Create bills at the counter, collect cash or add to Khata. Auto-prints thermal receipt or shares via WhatsApp.',
    color: 'amber',
  },
  {
    step: '04',
    icon: Share2,
    title: 'Get Daily Report',
    description:
      'At day end, see total sales, cash collected, Udhar given, and low stock items — all in one clean summary.',
    color: 'rose',
  },
];

const colorMap: Record<string, { step: string; icon: string; line: string }> = {
  emerald: { step: 'bg-emerald-600 text-white', icon: 'text-emerald-600', line: 'bg-emerald-200' },
  violet:  { step: 'bg-violet-600 text-white',  icon: 'text-violet-600',  line: 'bg-violet-200'  },
  amber:   { step: 'bg-amber-500 text-white',   icon: 'text-amber-500',   line: 'bg-amber-200'   },
  rose:    { step: 'bg-rose-600 text-white',    icon: 'text-rose-600',    line: 'bg-rose-200'    },
};

const HowItWorks: React.FC = () => (
  <section id="how-it-works" className="py-24 bg-white">
    <div className="max-w-6xl mx-auto px-6">
      {/* Header */}
      <div className="text-center mb-16 max-w-xl mx-auto">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Simple Process</span>
        <h2 className="mt-3 text-4xl font-black text-slate-900 tracking-tight leading-tight">
          Up and running{' '}
          <span className="text-emerald-600">in minutes</span>
        </h2>
        <p className="mt-4 text-slate-500 leading-relaxed">
          No training needed. No IT person required. If you can use WhatsApp, you can use Dhandho.
        </p>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
        {/* Connector line (desktop only) */}
        <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-slate-200 -z-0" />

        {STEPS.map(({ step, icon: Icon, title, description, color }) => {
          const c = colorMap[color];
          return (
            <div key={step} className="flex flex-col items-center text-center gap-4 relative z-10">
              {/* Step circle */}
              <div className={`w-16 h-16 rounded-2xl ${c.step} flex items-center justify-center text-2xl font-black shadow-md`}>
                {step}
              </div>

              {/* Icon */}
              <Icon className={`h-6 w-6 ${c.icon}`} strokeWidth={2} />

              <div>
                <h3 className="font-bold text-slate-900 text-base">{title}</h3>
                <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

export default HowItWorks;
