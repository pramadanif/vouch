import React from 'react';
import { Link2, LockKeyhole, PackageCheck, ArrowRight } from 'lucide-react';

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
            Simple enough for <span className="text-brand-action">everyone.</span><br/>
            Secure enough for <span className="text-brand-action">banks.</span>
          </h2>
          <p className="text-lg text-brand-secondary font-light">
            We stripped away the crypto jargon. It's just a secure link.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative">
            <StepCard 
              step="1"
              icon={Link2}
              title="Create Link"
              description="Enter item name and price. Vouch generates a secure payment link in seconds."
            />
            <StepCard 
              step="2"
              icon={LockKeyhole}
              title="Buyer Pays"
              description="Buyer pays via bank transfer or e-wallet. Funds are locked in the smart contract."
            />
            <StepCard 
              step="3"
              icon={PackageCheck}
              title="Ship & Earn"
              description="Ship the item. Once received, the money is instantly released to your account."
            />
        </div>

        <div className="mt-16 text-center">
            <a href="#" className="inline-flex items-center gap-2 text-brand-primary font-semibold hover:text-brand-action transition-colors">
                Read the full guide <ArrowRight size={16} />
            </a>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;