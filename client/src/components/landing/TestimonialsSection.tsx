import React from 'react';
import { Quote, Star } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Rameshbhai Patel',
    store: 'Patel Kirana, Ahmedabad',
    initials: 'RP',
    color: '#059669',
    rating: 5,
    quote:
      'Pehle roz sham ko hisaab karna padta tha — ab Dhandho khud sab dikhata hai. Udhar list bhi WhatsApp pe bhej deta hai!',
    translated: '"Earlier I had to tally accounts every evening — now Dhandho shows everything automatically."',
  },
  {
    name: 'Jayaben Shah',
    store: 'Shah General Stores, Surat',
    initials: 'JS',
    color: '#7c3aed',
    rating: 5,
    quote:
      'Stock khatam hone se pehle alert aata hai. Isse pehle kabhi nahi tha. Bahut kaam ka app hai.',
    translated: '"I get an alert before stock runs out. This never happened before. Very useful app."',
  },
  {
    name: 'Dineshbhai Mer',
    store: 'Mer Kariyana, Rajkot',
    initials: 'DM',
    color: '#d97706',
    rating: 5,
    quote:
      'Bill banana itna fast ho gaya hai. Customer ek minute bhi wait nahi karta. WhatsApp pe bill bhi ja ta hai, customer khush!',
    translated: '"Billing has become so fast. Customers don\'t wait even a minute. Bill goes on WhatsApp too!"',
  },
];

const TestimonialsSection: React.FC = () => (
  <section className="py-24 bg-slate-900">
    <div className="max-w-6xl mx-auto px-6">
      {/* Header */}
      <div className="text-center mb-14">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Real Store Owners</span>
        <h2 className="mt-3 text-4xl font-black text-white tracking-tight leading-tight">
          Dukaan waale bolte hain{' '}
          <span className="text-emerald-400">(Store owners say)</span>
        </h2>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TESTIMONIALS.map(({ name, store, initials, color, rating, quote, translated }) => (
          <div
            key={name}
            className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 flex flex-col gap-4 hover:bg-slate-800 hover:border-slate-600 transition-all duration-200"
          >
            {/* Quote icon */}
            <Quote className="h-6 w-6 text-emerald-500 shrink-0" strokeWidth={1.5} />

            {/* Stars */}
            <div className="flex gap-0.5">
              {Array.from({ length: rating }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>

            {/* Quote */}
            <p className="text-slate-200 text-sm leading-relaxed font-medium italic">
              &ldquo;{quote}&rdquo;
            </p>
            <p className="text-slate-500 text-xs leading-relaxed">{translated}</p>

            {/* Author */}
            <div className="flex items-center gap-3 mt-auto pt-3 border-t border-slate-700/60">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ backgroundColor: color }}
              >
                {initials}
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{name}</p>
                <p className="text-xs text-slate-400">{store}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;
