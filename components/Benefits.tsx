import React from 'react';
import { Check, X, Shield, Wallet, Scale, Banknote } from 'lucide-react';

const FeatureRow = ({
  icon: Icon,
  title,
  desc
}: {
  icon: React.ElementType;
  title: string;
  desc: string
}) => (
  <div className="flex gap-5 group">
    <div className="flex-shrink-0 mt-1">
      <div className="w-10 h-10 rounded-xl bg-brand-ice/40 border border-brand-ice flex items-center justify-center text-brand-action group-hover:bg-brand-action group-hover:text-white transition-all duration-300">
        <Icon size={20} strokeWidth={2} />
      </div>
    </div>
    <div>
      <h4 className="text-lg font-bold text-brand-primary mb-2">{title}</h4>
      <p className="text-brand-secondary text-[15px] leading-relaxed">{desc}</p>
    </div>
  </div>
);

const Benefits: React.FC = () => {
  return (
    <section id="safety" className="py-24 bg-white overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Left: Visual Comparison */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-full">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-brand-ice/30 rounded-full blur-3xl -z-10" />

            <div className="relative">
              {/* Bad Card (Background) */}
              <div className="absolute top-0 left-0 w-full transform -translate-x-4 -translate-y-4 lg:-translate-x-8 lg:-translate-y-6 scale-95 opacity-60 blur-[1px] select-none pointer-events-none">
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-gray-400">Direct Transfer</h3>
                    <X size={20} className="text-gray-300" />
                  </div>
                  <div className="space-y-4 opacity-50">
                    <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>

              {/* Good Card (Foreground) */}
              <div className="bg-white p-8 rounded-3xl shadow-card border border-brand-ice relative z-10 animate-fade-up">
                <div className="absolute -top-4 -right-4 bg-brand-action text-white p-3 rounded-2xl shadow-lg shadow-brand-action/20 rotate-12">
                  <Shield size={24} strokeWidth={2.5} />
                </div>

                <div className="flex justify-between items-center mb-8 border-b border-gray-50 pb-4">
                  <div>
                    <span className="text-xs font-bold text-brand-action uppercase tracking-wider mb-1 block">The Vouch Way</span>
                    <h3 className="font-bold text-brand-primary text-2xl tracking-tight">Escrow Protection</h3>
                  </div>
                </div>

                <ul className="space-y-5">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-brand-ice flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={12} className="text-brand-action font-bold" strokeWidth={4} />
                    </div>
                    <div>
                      <span className="text-brand-primary font-bold block">Funds Held Securely</span>
                      <span className="text-sm text-brand-secondary">Money stays in the smart contract until delivery.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-brand-ice flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={12} className="text-brand-action font-bold" strokeWidth={4} />
                    </div>
                    <div>
                      <span className="text-brand-primary font-bold block">Identity Verified</span>
                      <span className="text-sm text-brand-secondary">Both parties are verified via phone/socials.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-brand-ice flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={12} className="text-brand-action font-bold" strokeWidth={4} />
                    </div>
                    <div>
                      <span className="text-brand-primary font-bold block">Dispute Support</span>
                      <span className="text-sm text-brand-secondary">Human support team if things go wrong.</span>
                    </div>
                  </li>
                </ul>

                <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-brand-ice flex items-center justify-center border-2 border-white text-[10px] font-bold text-brand-primary">A</div>
                    <div className="w-8 h-8 rounded-full bg-brand-action flex items-center justify-center border-2 border-white text-[10px] font-bold text-white">B</div>
                  </div>
                  <span className="text-xs font-bold text-brand-action">100% Money Back Guarantee</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Text Features */}
          <div>
            <div className="inline-block px-3 py-1 rounded-lg bg-brand-ice/40 border border-brand-ice mb-6">
              <span className="text-xs font-bold text-brand-action uppercase tracking-wider">Features</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-brand-primary mb-6 tracking-tight">
              Why Sellers & Buyers <br />Switch to Vouch
            </h2>
            <p className="text-lg text-brand-secondary mb-10">
              Building trust takes years. Losing it takes seconds. Vouch secures the trust instantly.
            </p>

            <div className="space-y-10">
              <FeatureRow
                icon={Wallet}
                title="Universal Payment Methods"
                desc="Your buyers pay with what they have (BCA, Mandiri, GoPay, OVO). You get paid where you want."
              />
              <FeatureRow
                icon={Banknote}
                title="Instant Settlement"
                desc="Smart contracts execute immediately upon confirmation. No manual reviews, no 3-day holding periods."
              />
              <FeatureRow
                icon={Scale}
                title="Fair Dispute Resolution"
                desc="Our arbitration system protects both sides. Evidence-based resolution ensures fair outcomes."
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Benefits;