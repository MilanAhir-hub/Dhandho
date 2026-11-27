import React, { useState } from 'react';
import { Bot } from 'lucide-react';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import StatsBar from '../components/landing/StatsBar';
import FeaturesSection from '../components/landing/FeaturesSection';
import HowItWorks from '../components/landing/HowItWorks';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import CtaSection from '../components/landing/CtaSection';
import Footer from '../components/landing/Footer';
import AiAssistantDrawer from '../components/dashboard/AiAssistantDrawer';

const LandingPage: React.FC = () => {
  const [isAiOpen, setIsAiOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fdfdfd] flex flex-col selection:bg-[#e8f7ee] selection:text-[#00a86b]">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <StatsBar />
        <FeaturesSection />
        <HowItWorks />
        <TestimonialsSection />
        <CtaSection />
      </main>
      <Footer />

      {/* ── Floating Agent Button (Bottom Right) ── */}
      <button
        onClick={() => setIsAiOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-[#00a86b] hover:bg-[#059669] text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-lg shadow-emerald-700/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 group"
        title="Open AI Assistant"
      >
        <div className="relative">
          <Bot className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
        </div>
        <span className="text-xs font-bold tracking-wide">AI Assistant</span>
      </button>

      {/* ── AI Assistant Drawer ── */}
      <AiAssistantDrawer
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
      />
    </div>
  );
};

export default LandingPage;
