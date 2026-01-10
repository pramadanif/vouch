import React from 'react';
import Button from './Button';

const CTASection: React.FC = () => {
  return (
    <section className="bg-gradient-glow bg-noise relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-accent/10 rounded-full blur-[100px]"></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/50 rounded-full blur-[80px]"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10 text-center">
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight leading-tight drop-shadow-sm">
          Stop wondering if they'll pay. <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-ice to-white">Start selling with certainty.</span>
        </h2>
        <p className="text-xl text-brand-ice/80 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
          Join 2,000+ sellers who closed Rp 5B+ in safe transactions last month. 
          Create your first link in 30 seconds.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-6 items-center">
          <Button variant="white" size="lg" className="text-lg px-10 py-4 shadow-2xl shadow-brand-primary/50 font-bold text-brand-action hover:scale-105 transition-transform">
            Start Selling Safely
          </Button>
          <button className="px-8 py-4 rounded-lg border border-brand-ice/30 text-white font-semibold hover:bg-white/10 transition-all backdrop-blur-sm">
            Contact Sales
          </button>
        </div>
        
        <div className="mt-16 flex flex-col items-center gap-3">
           <div className="flex -space-x-3 mb-2">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=40&h=40" className="w-10 h-10 rounded-full border-2 border-brand-primary" alt="User" />
              <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=40&h=40" className="w-10 h-10 rounded-full border-2 border-brand-primary" alt="User" />
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=40&h=40" className="w-10 h-10 rounded-full border-2 border-brand-primary" alt="User" />
              <div className="w-10 h-10 rounded-full border-2 border-brand-primary bg-brand-ice text-brand-primary flex items-center justify-center text-xs font-bold">+2k</div>
           </div>
           <p className="text-xs text-brand-ice/60 tracking-widest uppercase">No credit card required · Cancel anytime</p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;

//test