'use client';

import React from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import SocialProof from '@/components/SocialProof';
import ProblemSolution from '@/components/ProblemSolution';
import HowItWorks from '@/components/HowItWorks';
import Benefits from '@/components/Benefits';
import Testimonials from '@/components/Testimonials';
import FAQ from '@/components/FAQ';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden bg-brand-surface selection:bg-brand-cream selection:text-brand-primary">
      <Header />
      <main className="flex-grow">
        <Hero />
        <SocialProof />
        <ProblemSolution />
        <HowItWorks />
        <Benefits />
        <Testimonials />
        <FAQ />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
