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
import { Reveal } from '@/components/Reveal';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden bg-brand-surface selection:bg-brand-cream selection:text-brand-primary">
      <Header />
      <main className="flex-grow">
        <Reveal width="100%">
          <Hero />
        </Reveal>
        <Reveal width="100%">
          <SocialProof />
        </Reveal>
        <Reveal width="100%">
          <ProblemSolution />
        </Reveal>
        <Reveal width="100%">
          <HowItWorks />
        </Reveal>
        <Reveal width="100%">
          <Benefits />
        </Reveal>
        <Reveal width="100%">
          <Testimonials />
        </Reveal>
        <Reveal width="100%">
          <FAQ />
        </Reveal>
        <Reveal width="100%">
          <CTASection />
        </Reveal>
      </main>
      <Footer />
    </div>
  );
}
