'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-brand-secondary/10 last:border-0">
      <button 
        className="w-full py-6 flex items-center justify-between text-left focus:outline-none group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-medium text-brand-primary group-hover:text-brand-secondary transition-colors">{question}</span>
        {isOpen ? (
            <ChevronUp className="text-brand-primary flex-shrink-0 ml-4" size={20} />
        ) : (
            <ChevronDown className="text-brand-secondary/50 flex-shrink-0 ml-4 group-hover:text-brand-primary" size={20} />
        )}
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 pb-6' : 'max-h-0 opacity-0'}`}
      >
        <p className="text-brand-secondary leading-relaxed pr-8">{answer}</p>
      </div>
    </div>
  );
};

const FAQ: React.FC = () => {
  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-brand-primary mb-4">Frequently Asked Questions</h2>
          <p className="text-brand-secondary">Everything you need to know about using Vouch in DMs.</p>
        </div>

        <div className="bg-brand-surface/30 rounded-3xl p-8 border border-brand-surface">
            <FAQItem 
                question="Do I need blockchain knowledge to use Vouch?"
                answer="No. There’s no account registration and no confusing crypto UX. If you can send a link in DM, you can use Vouch."
            />
            <FAQItem 
                question="Is Vouch a marketplace?"
                answer="No. Vouch is escrow infrastructure. You keep selling on Instagram, WhatsApp, TikTok, or Facebook — Vouch just adds a neutral trust layer to your payment link."
            />
            <FAQItem 
                question="What if one party disappears or goes inactive?"
                answer="Escrow contracts include timeout enforcement. Depending on the rules, funds can auto-release or auto-refund when a party is inactive. The smart contract is the final authority."
            />
            <FAQItem 
                question="How can buyers pay?"
                answer="Vouch supports crypto payments (USDC or IDRX on Lisk) and fiat payments (QRIS / Virtual Account via Xendit). Regardless of payment method, escrow logic stays on-chain."
            />
        </div>
      </div>
    </section>
  );
};

export default FAQ;