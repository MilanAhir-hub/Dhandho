import React from 'react';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import StatsBar from '../components/landing/StatsBar';
import FeaturesSection from '../components/landing/FeaturesSection';
import HowItWorks from '../components/landing/HowItWorks';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import CtaSection from '../components/landing/CtaSection';
import Footer from '../components/landing/Footer';

const LandingPage: React.FC = () => (
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
  </div>
);

export default LandingPage;
