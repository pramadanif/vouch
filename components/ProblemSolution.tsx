import React from 'react';
import { AlertTriangle, ShieldAlert, BadgeCheck, Users, ArrowDown, Clock, ShieldX } from 'lucide-react';
import { Reveal } from './Reveal';

const ProblemCard = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="bg-white/10 border border-white/10 p-8 rounded-2xl hover:bg-white/15 transition-all duration-300 backdrop-blur-sm group hover:-translate-y-1 h-full flex flex-col">
    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-action to-brand-primary text-brand-ice flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-black/20 shrink-0">
      <Icon size={24} />
    </div>
    <h3 className="text-white font-bold text-xl mb-3 tracking-tight shrink-0">{title}</h3>
    <p className="text-brand-ice/80 text-base leading-relaxed font-light flex-1">{desc}</p>
  </div>
);

const SolutionCard = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="bg-white p-8 rounded-2xl shadow-sm border border-brand-border hover:shadow-xl hover:border-brand-action/30 transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden">
    <div className="absolute top-0 right-0 w-24 h-24 bg-brand-ice/20 rounded-bl-full -mr-4 -mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    <div className="w-12 h-12 rounded-xl bg-brand-ice text-brand-action flex items-center justify-center mb-6 group-hover:bg-brand-action group-hover:text-white transition-colors duration-200 shadow-sm">
      <Icon size={24} />
    </div>
    <h3 className="text-brand-primary font-bold text-xl mb-3 tracking-tight">{title}</h3>
    <p className="text-brand-secondary text-base leading-relaxed">{desc}</p>
  </div>
);

const ProblemSolution: React.FC = () => {
  return (
    <section className="relative">
      {/* The Problem (Gradient Corporate) */}
      <div className="bg-gradient-corporate bg-noise pt-32 pb-48 px-4 sm:px-6 lg:px-8 relative z-10 rounded-b-[60px] lg:rounded-b-[80px] overflow-hidden shadow-2xl">

        {/* Decorative Glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-accent/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-action/30 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto text-center mb-20 relative z-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-md text-brand-ice text-xs font-bold uppercase tracking-[0.2em] mb-6">
            The Current State
          </span>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">
            Social Commerce is <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-ice to-white italic font-serif">Broken & Risky</span>.
          </h2>
          <p className="text-brand-ice/90 max-w-2xl mx-auto text-xl font-light leading-relaxed">
            Buying from strangers on Instagram or WhatsApp is essentially gambling.
            73% of transactions fail due to lack of trust.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6 relative z-10">
          <Reveal delay={0.1} width="100%" className="h-full">
            <ProblemCard
              icon={ShieldX}
              title="Buyer Anxiety"
              desc="Sending money to a stranger's bank account feels unsafe. Most buyers ghost because they fear losing their cash."
            />
          </Reveal>
          <Reveal delay={0.2} width="100%" className="h-full">
            <ProblemCard
              icon={AlertTriangle}
              title="Seller Risk"
              desc="COD (Cash on Delivery) is unreliable. Buyers refuse packages, leaving you paying for return shipping."
            />
          </Reveal>
          <Reveal delay={0.3} width="100%" className="h-full">
            <ProblemCard
              icon={Clock}
              title="Wasted Time"
              desc="Endless negotiation, promises to pay, and silence. Managing DMs without a system kills your productivity."
            />
          </Reveal>
        </div>
      </div>

      {/* Connector */}
      <div className="absolute left-1/2 top-[54%] md:top-[52%] -translate-x-1/2 z-20 w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl border-[6px] border-brand-surfaceHighlight text-brand-action animate-bounce">
        <ArrowDown size={32} />
      </div>

      {/* The Solution (Light Mode Clean) */}
      <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 bg-brand-surfaceHighlight">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-brand-action text-xs font-bold uppercase tracking-[0.2em] mb-4 block">The Solution</span>
            <h2 className="text-4xl md:text-5xl font-bold text-brand-primary tracking-tight">Enter <span className="italic font-serif text-brand-action">Vouch</span>.</h2>
          </div>

          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
            <Reveal delay={0.1} width="100%">
              <SolutionCard
                icon={BadgeCheck}
                title="Smart Contract Escrow"
                desc="We lock the funds in a secure digital vault. The seller sees proof of funds, the buyer knows their money is safe."
              />
            </Reveal>
            <Reveal delay={0.2} width="100%">
              <SolutionCard
                icon={Users}
                title="Mutual Protection"
                desc="Transactions only complete when both parties are satisfied. It's the fair way to do business online."
              />
            </Reveal>
            <Reveal delay={0.3} width="100%">
              <SolutionCard
                icon={BadgeCheck}
                title="Verified Reputation"
                desc="Build a public profile of successful deals. Your trust score becomes your biggest marketing asset."
              />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolution;