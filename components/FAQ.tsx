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
    <section className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-brand-primary mb-4">Frequently Asked Questions</h2>
          <p className="text-brand-secondary">Everything you need to know about selling safely.</p>
        </div>

        <div className="bg-brand-surface/30 rounded-3xl p-8 border border-brand-surface">
            <FAQItem 
                question="Is Vouch really free to use?"
                answer="Yes! It is completely free to create links. We charge a small 1% fee only when a transaction is successfully completed."
            />
            <FAQItem 
                question="How do I get my money?"
                answer="Once the buyer confirms receipt of the item, the funds are instantly released to your Vouch balance. You can withdraw to any local bank account instantly."
            />
            <FAQItem 
                question="What if the buyer claims they didn't receive it?"
                answer="We use delivery tracking integration. If the courier marks it as delivered, you are protected. In complex cases, our support team reviews chat logs and evidence."
            />
            <FAQItem 
                question="Does the buyer need to download an app?"
                answer="No. This is crucial for conversion. The buyer just clicks your link, sees the details, and pays via a mobile-optimized web page."
            />
        </div>
      </div>
    </section>
  );
};

export default FAQ;