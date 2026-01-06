import React from 'react';
import { Landmark, CreditCard, Wallet } from 'lucide-react';

const SocialProof: React.FC = () => {
  return (
    <section className="bg-brand-surface border-y border-brand-cream/30 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
            <p className="text-xs font-bold text-brand-muted uppercase tracking-widest whitespace-nowrap">
            Trusted by sellers on
            </p>
            
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            
            <div className="flex items-center gap-2 text-brand-primary">
                <span className="font-bold text-lg">Instagram</span>
            </div>

            <div className="flex items-center gap-2 text-brand-primary">
                <span className="font-bold text-lg">WhatsApp</span>
            </div>

            <div className="flex items-center gap-2 text-brand-primary">
                <span className="font-bold text-lg">TikTok Shop</span>
            </div>

            <div className="w-px h-8 bg-brand-muted/20 hidden md:block"></div>

            <div className="flex items-center gap-2 text-brand-primary">
                <span className="font-bold text-lg">Lisk</span>
            </div>
            
            </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;