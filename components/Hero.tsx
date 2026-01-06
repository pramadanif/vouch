import React from 'react';
import { Shield, Lock, CheckCircle2, Send, Signal, PlayCircle } from 'lucide-react';
import Button from './Button';

const ChatBubble = ({ 
  isMe, 
  text, 
  time 
}: { 
  isMe: boolean; 
  text?: string; 
  time: string; 
}) => (
  <div className={`flex w-full mb-3 ${isMe ? 'justify-end' : 'justify-start'}`}>
    <div className={`max-w-[85%] relative shadow-sm ${
      isMe 
        ? 'bg-brand-action text-white rounded-2xl rounded-tr-sm' 
        : 'bg-white text-brand-primary rounded-2xl rounded-tl-sm border border-brand-border'
    }`}>
      <div className="px-4 py-3">
        {text && <p className={`text-[13px] leading-relaxed font-medium ${isMe ? 'text-white' : 'text-slate-700'}`}>{text}</p>}
        <span className={`text-[9px] mt-1.5 block text-right font-medium opacity-70 ${isMe ? 'text-brand-ice' : 'text-slate-400'}`}>{time}</span>
      </div>
    </div>
  </div>
);

const VouchCard = () => (
  <div className="flex w-full mb-4 justify-end animate-fade-up" style={{ animationDelay: '0.5s' }}>
    <div className="w-[85%] bg-white rounded-xl shadow-card border border-brand-border overflow-hidden group cursor-pointer hover:border-brand-action transition-colors duration-300">
      {/* Vouch Header */}
      <div className="bg-brand-primary px-3 py-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Shield size={14} className="text-white fill-white/20" />
          <span className="text-[11px] font-bold text-white tracking-wide">Vouch Secure</span>
        </div>
        <div className="bg-white/10 px-2 py-0.5 rounded-full text-[9px] text-brand-ice font-medium border border-white/10">Escrow</div>
      </div>
      
      {/* Product Content */}
      <div className="p-3 border-b border-gray-50 bg-brand-surfaceHighlight">
        <div className="flex gap-4">
          <div className="w-14 h-14 bg-white rounded-lg flex-shrink-0 overflow-hidden border border-gray-200">
            <img 
              src="https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=100&h=100" 
              alt="Sneakers" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <h4 className="text-xs font-bold text-brand-primary leading-tight mb-1">Vintage Nike Jordan</h4>
            <p className="text-[10px] text-brand-secondary mb-1.5">Verified Seller</p>
            <p className="text-brand-action font-bold text-sm">Rp 2.500.000</p>
          </div>
        </div>
      </div>
      
      {/* Trust Footer */}
      <div className="bg-white px-3 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
            <Lock size={12} className="text-slate-400" />
            <p className="text-[10px] text-slate-500 font-medium">Funds held safely</p>
        </div>
        <button className="bg-brand-action text-white text-[10px] font-bold px-4 py-1.5 rounded-md hover:bg-brand-primary transition-colors">
            Pay Now
        </button>
      </div>
    </div>
  </div>
);

const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden bg-white">
      {/* Elegant Grid Background */}
      <div className="absolute inset-0 bg-grid z-0 opacity-50">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/80"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-16 lg:gap-8 items-center">
          
          {/* Left: Content */}
          <div className="lg:col-span-7 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-ice/30 border border-brand-ice mb-8 animate-fade-up">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-action opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-action"></span>
              </span>
              <span className="text-xs font-semibold text-brand-primary tracking-wide uppercase">Trusted by 50,000+ Sellers</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-brand-primary tracking-tight leading-[1.05] mb-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              The safe way to <br/>
              <span className="text-brand-action">
                sell socially.
              </span>
            </h1>
            
            <p className="text-xl text-brand-secondary mb-10 max-w-lg leading-relaxed animate-fade-up font-light" style={{ animationDelay: '0.2s' }}>
              Vouch is the escrow payment layer for Instagram, WhatsApp, and TikTok. We hold the funds until the item arrives.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <Button size="lg" className="shadow-lg shadow-brand-action/20">
                Create Free Link
              </Button>
              <button className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-lg text-brand-primary font-semibold hover:bg-brand-surfaceHighlight transition-all border border-transparent hover:border-brand-border">
                 <PlayCircle size={20} className="text-brand-action" />
                 <span>How it Works</span>
              </button>
            </div>
            
            <div className="flex items-center gap-8 text-sm font-medium animate-fade-up text-brand-secondary" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-brand-accent" />
                <span>Bank-Grade Security</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-slate-300"></div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-brand-accent" />
                <span>Instant Payouts</span>
              </div>
            </div>
          </div>

          {/* Right: Phone Visual */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            {/* The Phone */}
            <div className="relative w-[340px] h-[680px] bg-brand-primary rounded-[50px] shadow-2xl border-[8px] border-brand-primary overflow-hidden ring-1 ring-black/10 z-10">
              
              {/* Dynamic Island */}
              <div className="absolute top-0 left-0 right-0 h-8 z-30 flex justify-center">
                 <div className="w-28 h-7 bg-black rounded-b-2xl"></div>
              </div>

              {/* App UI */}
              <div className="absolute inset-0 bg-brand-surfaceHighlight flex flex-col h-full font-sans">
                 
                 {/* Chat Header */}
                 <div className="bg-white pt-14 pb-4 px-5 border-b border-brand-border sticky top-0 z-20 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-brand-ice p-0.5">
                                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100" className="w-full h-full object-cover rounded-full" alt="Buyer"/>
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900 leading-none">Rina (Buyer)</p>
                            <p className="text-[10px] text-brand-action mt-1 font-medium">Online</p>
                        </div>
                    </div>
                    <div className="flex gap-4 text-brand-primary opacity-30">
                        <Signal size={18} />
                    </div>
                 </div>

                 {/* Messages */}
                 <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-brand-surfaceHighlight">
                    <div className="pt-2 flex flex-col">
                        <div className="flex justify-center mb-6">
                            <span className="bg-brand-ice/50 text-brand-primary/60 text-[10px] font-bold px-3 py-1 rounded-full">Today 9:41 AM</span>
                        </div>
                        <ChatBubble isMe={false} text="Hi! Is the Jordan still available? Looks authentic!" time="09:30" />
                        <ChatBubble isMe={true} text="Yes! Just cleaned it. Comes with the original box too. 👟" time="09:31" />
                        <ChatBubble isMe={false} text="Great. I'm worried about transferring first though..." time="09:32" />
                        <ChatBubble isMe={true} text="I totally get it. Let's use Vouch. It protects us both." time="09:33" />
                        <VouchCard />
                        <ChatBubble isMe={false} text="This looks safe. Paying now! 🙏" time="09:35" />
                    </div>
                 </div>

                 {/* Input Area */}
                 <div className="bg-white px-4 py-4 pb-8 flex items-center gap-3 z-20 border-t border-brand-border">
                    <div className="w-9 h-9 rounded-full bg-brand-surfaceHighlight text-brand-secondary flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer border border-brand-border">
                        <span className="text-xl leading-none mb-1 text-slate-400">+</span>
                    </div>
                    <div className="flex-1 bg-brand-surfaceHighlight rounded-full px-5 py-3 border border-brand-border flex items-center">
                        <span className="text-sm text-gray-400">Message...</span>
                    </div>
                    <div className="w-11 h-11 rounded-full bg-brand-action text-white flex items-center justify-center shadow-md hover:bg-brand-primary transition-colors cursor-pointer">
                        <Send size={18} className="ml-0.5" />
                    </div>
                 </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;