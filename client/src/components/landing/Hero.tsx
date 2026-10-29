import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import heroBg from '../../assets/hero_bg.jpg';
import heroMobileImg from '../../assets/hero_mobile_shopkeeper.png';
import avatar1 from '../../assets/avatars/avatar1.jpg';
import avatar2 from '../../assets/avatars/avatar2.jpg';
import avatar3 from '../../assets/avatars/avatar3.jpg';
import avatar4 from '../../assets/avatars/avatar4.jpg';

const Hero: React.FC = () => {
  return (
    <section className="relative w-full min-h-screen bg-[#fcfdfc] pt-20 lg:pt-24 flex flex-col justify-between overflow-hidden">
      
      {/* ── Desktop Background Layer (Visible on desktop lg+) ── */}
      <div className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none select-none z-0">
        <img
          src={heroBg}
          alt="Dhandho Kirana Dukaan"
          className="w-full h-full object-cover object-right"
        />
        {/* Soft wash on far left */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#fcfdfc] via-[#fcfdfc]/20 to-transparent w-1/3" />
      </div>

      {/* ── Playful Green Radiating Lines next to shopkeeper (Desktop) ── */}
      <div className="hidden lg:block absolute top-[36%] right-[32%] xl:right-[34%] pointer-events-none z-10 animate-pulse">
        <svg width="44" height="32" viewBox="0 0 44 32" fill="none">
          <line x1="8" y1="28" x2="2" y2="10" stroke="#00a86b" strokeWidth="3" strokeLinecap="round" />
          <line x1="22" y1="26" x2="22" y2="4" stroke="#00a86b" strokeWidth="3" strokeLinecap="round" />
          <line x1="36" y1="28" x2="42" y2="10" stroke="#00a86b" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>

      {/* ── Main Content Container ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full flex-1 flex flex-col justify-center py-6 sm:py-8 lg:py-12">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          
          {/* ── Left Content (Shared across Desktop & Mobile) ── */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col gap-4 sm:gap-5 py-2">
            
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 self-start bg-[#eefaf2] border border-[#a7f3d0] text-[#047857] text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#00a86b]" />
              Built for India's Kirana Stores
            </div>

            {/* Headline */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-[62px] xl:text-[68px] font-black text-[#0f172a] leading-[1.08] tracking-[-0.035em]">
                Your <br />
                <span className="text-[#00a86b]">Kirana Store,</span> <br />
                Now Smarter.
              </h1>
              {/* Hand-drawn green underline stroke */}
              <div className="w-52 sm:w-64 -mt-1.5 sm:-mt-2">
                <svg viewBox="0 0 240 14" fill="none" className="w-full h-auto text-[#00a86b]">
                  <path
                    d="M3 10 C 70 3, 170 3, 237 9"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* Subtitle */}
            <p className="text-slate-600 text-sm sm:text-base lg:text-[17px] leading-relaxed max-w-md font-normal">
              Easy billing, stock management, udhaar tracking and business reports — all in one simple app.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2.5 bg-[#00a86b] hover:bg-[#059669] text-white font-bold px-7 py-3.5 rounded-full shadow-md shadow-emerald-600/20 active:scale-95 transition-all text-sm lg:text-[15px] cursor-pointer"
              >
                Start Free — No CC Required
                <ArrowRight className="h-4 w-4 stroke-[2.5]" />
              </Link>

              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('how-it-works');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2.5 text-slate-800 hover:text-[#00a86b] font-bold px-4 py-3 rounded-full hover:bg-emerald-50/60 transition-all text-sm lg:text-[15px] group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full border-2 border-[#00a86b] flex items-center justify-center text-[#00a86b] group-hover:bg-[#00a86b] group-hover:text-white transition-colors">
                  <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                </div>
                Watch 1 Min Video
              </button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-3 pt-2">
              <div className="flex -space-x-2">
                <img
                  src={avatar1}
                  alt="Kirana Store Owner"
                  className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-xs"
                />
                <img
                  src={avatar2}
                  alt="Kirana Store Owner"
                  className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-xs"
                />
                <img
                  src={avatar3}
                  alt="Kirana Store Owner"
                  className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-xs"
                />
                <img
                  src={avatar4}
                  alt="Kirana Store Owner"
                  className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-xs"
                />
              </div>
              <div className="bg-[#d1fae5] text-[#065f46] text-xs font-black px-2.5 py-0.5 rounded-full">
                500+
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Kirana stores trust Dhandho
              </p>
            </div>

          </div>

          {/* Empty right column on desktop so background shopkeeper photo shines through cleanly */}
          <div className="hidden lg:block lg:col-span-6 xl:col-span-7 min-h-[460px] pointer-events-none" />

        </div>
      </div>

      {/* ── Mobile Shopkeeper Image (Rendered at bottom on mobile screens < lg) ── */}
      <div className="lg:hidden relative w-full mt-4 overflow-hidden">
        {/* Playful radiating lines on mobile */}
        <div className="absolute top-6 left-1/2 -translate-x-12 pointer-events-none z-10">
          <svg width="40" height="28" viewBox="0 0 40 28" fill="none">
            <line x1="8" y1="24" x2="2" y2="8" stroke="#00a86b" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="20" y1="22" x2="20" y2="4" stroke="#00a86b" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="32" y1="24" x2="38" y2="8" stroke="#00a86b" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
        
        <img
          src={heroMobileImg}
          alt="Indian Kirana Store Owner with Dhandho"
          className="w-full h-auto object-cover object-top"
        />
      </div>

    </section>
  );
};

export default Hero;
