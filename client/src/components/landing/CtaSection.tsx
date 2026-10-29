import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Smartphone } from 'lucide-react';

const CtaSection: React.FC = () => (
  <section className="py-24 bg-white">
    <div className="max-w-6xl mx-auto px-6">
      <div className="relative bg-emerald-600 rounded-3xl overflow-hidden px-8 py-16 lg:px-16 flex flex-col lg:flex-row items-center justify-between gap-10">

        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/30 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
        <div className="absolute bottom-0 left-10 w-48 h-48 bg-emerald-700/30 rounded-full translate-y-1/2 blur-2xl" />

        {/* Text */}
        <div className="relative text-center lg:text-left max-w-xl">
          <span className="text-emerald-200 text-xs font-bold uppercase tracking-widest">Get Started Today</span>
          <h2 className="mt-3 text-4xl font-black text-white leading-tight tracking-tight">
            Your Dukaan Ka Hisaab,{' '}
            <span className="text-emerald-200">Digital Ho Jao</span>
          </h2>
          <p className="mt-4 text-emerald-100 text-base leading-relaxed">
            Join 500+ Kirana store owners who manage their entire business from a single screen. No training needed — start in 5 minutes.
          </p>
        </div>

        {/* Buttons */}
        <div className="relative flex flex-col sm:flex-row gap-3 shrink-0">
          <Link
            to="/signup"
            className="inline-flex items-center justify-center gap-2 bg-white text-emerald-700 font-bold px-6 py-3.5 rounded-xl hover:bg-emerald-50 active:scale-[0.97] transition-all shadow-lg text-sm"
          >
            Start Free Now
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#demo"
            className="inline-flex items-center justify-center gap-2 border-2 border-emerald-400 text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-emerald-500 active:scale-[0.97] transition-all text-sm"
          >
            <Smartphone className="h-4 w-4" />
            Watch Demo
          </a>
        </div>
      </div>
    </div>
  </section>
);

export default CtaSection;
