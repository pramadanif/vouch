import React from 'react';
import { FileText, Lock, ClipboardCheck, ArrowRight } from 'lucide-react';

const StepCard = ({
  icon: Icon,
  title,
  description,
  step
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  step: string;
}) => (
  <div className="bg-white rounded-xl p-8 shadow-sm border border-brand-border hover:border-brand-action transition-colors duration-300 z-10">
    <div className="w-12 h-12 rounded-lg bg-brand-ice/30 border border-brand-ice flex items-center justify-center mb-6">
      <Icon size={24} className="text-brand-action" strokeWidth={1.5} />
    </div>

    <div className="flex items-center gap-3 mb-3">
      <span className="text-xs font-bold text-brand-accent uppercase tracking-wider">
        Step {step}
      </span>
    </div>

    <h3 className="text-xl font-bold text-brand-primary mb-3">{title}</h3>
    <p className="text-brand-secondary leading-relaxed text-[15px]">{description}</p>
  </div>
);

const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-24 bg-brand-surfaceHighlight relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-primary mb-6 tracking-tight">
            Built for <span className="text-brand-action">DMs.</span><br />
            Secured by <span className="text-brand-action">escrow.</span>
          </h2>
          <p className="text-lg text-brand-secondary font-light">
            Vouch turns a simple payment link into an on-chain escrow contract on Lisk.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          <StepCard
            step="1"
            icon={FileText}
            title="Create Link"
            description="Seller sets item, price, and timeout. The seller signs escrow creation on Lisk, then shares the link in a DM."
          />
          <StepCard
            step="2"
            icon={Lock}
            title="Buyer Pays"
            description="Buyer pays with USDC/IDRX on Lisk or via QRIS/Virtual Account. Fiat is verified off-chain, escrow rules stay on-chain."
          />
          <StepCard
            step="3"
            icon={ClipboardCheck}
            title="Ship & Release"
            description="Seller ships. Buyer confirms receipt to release funds, or timeout enforcement triggers an automatic release/refund if someone is inactive."
          />
        </div>

        <div className="mt-16 text-center">
          <a href="/deck" className="inline-flex items-center gap-2 text-brand-primary font-semibold hover:text-brand-action transition-colors">
            See the full flow <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;