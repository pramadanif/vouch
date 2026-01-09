import React, { useState, useEffect, useRef } from 'react';
import { Shield, Lock, CheckCircle2, Send, Signal, PlayCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import FadeIn from './ui/FadeIn';

// --- Chat Components ---

const ChatBubble = ({
  isMe,
  text,
  time,
  isTyping = false
}: {
  isMe: boolean;
  text?: string;
  time: string;
  isTyping?: boolean;
}) => (
  <div className={`flex w-full mb-3 ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}>
    <div className={`max-w-[85%] relative shadow-sm transition-all duration-300 ${isMe
      ? 'bg-brand-action text-white rounded-2xl rounded-tr-sm'
      : 'bg-white text-brand-primary rounded-2xl rounded-tl-sm border border-brand-border'
      }`}>
      <div className="px-4 py-3">
        {isTyping ? (
          <div className="flex gap-1 h-5 items-center">
            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
          </div>
        ) : (
          <>
            {text && <p className={`text-[13px] leading-relaxed font-medium ${isMe ? 'text-white' : 'text-slate-700'}`}>{text}</p>}
            <span className={`text-[9px] mt-1.5 block text-right font-medium opacity-70 ${isMe ? 'text-brand-ice' : 'text-slate-400'}`}>{time}</span>
          </>
        )}
      </div>
    </div>
  </div>
);

const TypingIndicator = () => (
  <div className="flex w-full mb-3 justify-start animate-fade-in">
    <div className="bg-white text-brand-primary rounded-2xl rounded-tl-sm border border-brand-border px-4 py-3 shadow-sm">
      <div className="flex gap-1 h-4 items-center">
        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
      </div>
    </div>
  </div>
);

const VouchCard = () => (
  <div className="flex w-full mb-4 justify-end animate-fade-up origin-bottom-right">
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

// --- Data & Helpers ---

const TAGLINES = [
  {
    title: <>Sell in DMs. <br /><span className="text-brand-action">Get Paid Safely.</span></>,
    subtitle: "Vouch is the decentralized escrow layer for Instagram, WhatsApp, and TikTok. Funds are locked until the buyer confirms delivery."
  },
  {
    title: <>Web2 UX. <br /><span className="text-brand-action">Web3 Trust.</span></>,
    subtitle: "No login. No registration. Your wallet is your identity. Smart contracts enforce the rules."
  },
  {
    title: <>Trust for <br /><span className="text-brand-action">Social Commerce.</span></>,
    subtitle: "Marketplace-level protection for peer-to-peer selling — without becoming a marketplace."
  },
  {
    title: <>One Link. <br /><span className="text-brand-action">Zero Doubt.</span></>,
    subtitle: "Share a link → Buyer pays → Seller ships → Buyer confirms → Funds are released on-chain."
  }
];


type Message =
  | { type: 'bubble'; isMe: boolean; text: string; time: string }
  | { type: 'vouch' };

const INITIAL_MESSAGES: Message[] = [
  { type: 'bubble', isMe: false, text: "Hi! Is the Jordan still available? Looks authentic!", time: "09:30" },
  { type: 'bubble', isMe: true, text: "Yes! Just cleaned it. Comes with the original box too.", time: "09:31" },
];

const Hero: React.FC = () => {
  const [index, setIndex] = useState(0);

  // Chat State
  const [chatMessages, setChatMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [isBuyerTyping, setIsBuyerTyping] = useState(false);
  const [isSellerTyping, setIsSellerTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, isBuyerTyping, isSellerTyping]);

  // Tagline Rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % TAGLINES.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Chat Simulation Sequence
  useEffect(() => {
    let timeouts: NodeJS.Timeout[] = [];

    const schedule = (fn: () => void, delay: number) => {
      const id = setTimeout(fn, delay);
      timeouts.push(id);
    };

    // Reset loop
    const runSimulation = () => {
      setChatMessages(INITIAL_MESSAGES);
      setIsBuyerTyping(false);
      setIsSellerTyping(false);

      // 1. Buyer starts typing after 1s
      schedule(() => setIsBuyerTyping(true), 1000);

      // 2. Buyer sends message
      schedule(() => {
        setIsBuyerTyping(false);
        setChatMessages(prev => [...prev, { type: 'bubble', isMe: false, text: "Great. I'm worried about transferring first though...", time: "09:32" }]);
      }, 3000);

      // 3. Seller starts typing
      schedule(() => setIsSellerTyping(true), 4000);

      // 4. Seller sends message
      schedule(() => {
        setIsSellerTyping(false);
        setChatMessages(prev => [...prev, { type: 'bubble', isMe: true, text: "I totally get it. Let's use Vouch. It protects us both.", time: "09:33" }]);
      }, 6500);

      // 5. Seller sends Vouch Card immediately after
      schedule(() => {
        setChatMessages(prev => [...prev, { type: 'vouch' }]);
      }, 7500);

      // 6. Buyer starts typing
      schedule(() => setIsBuyerTyping(true), 9000);

      // 7. Buyer sends message
      schedule(() => {
        setIsBuyerTyping(false);
        setChatMessages(prev => [...prev, { type: 'bubble', isMe: false, text: "This looks safe. Paying now!", time: "09:35" }]);
      }, 11000);

      // Recurse/Loop after a long pause
      schedule(runSimulation, 16000);
    };

    runSimulation();

    return () => timeouts.forEach(clearTimeout);
  }, []);

  return (
    <section className="relative pt-28 pb-16 lg:pt-40 lg:pb-32 overflow-hidden bg-white">
      {/* Elegant Grid Background */}
      <div className="absolute inset-0 bg-grid z-0 opacity-50">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/80"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* Left: Content */}
          <FadeIn direction="right" className="lg:col-span-7 max-w-2xl mx-auto lg:mx-0 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-ice/30 border border-brand-ice mb-6 lg:mb-8 animate-fade-up">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-action opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-action"></span>
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-brand-primary tracking-wide uppercase">Trusted by 50,000+ Sellers</span>
            </div>

            {/* Amazing Text Transitions */}
            <div className="mb-6 lg:mb-10 min-h-[140px] sm:min-h-[160px] lg:min-h-[220px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-brand-primary tracking-tight leading-[1.05] mb-4 lg:mb-6">
                    {TAGLINES[index].title}
                  </h1>

                  <p className="text-lg sm:text-xl text-brand-secondary max-w-lg mx-auto lg:mx-0 leading-relaxed font-light">
                    {TAGLINES[index].subtitle}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-10 lg:mb-12 animate-fade-up justify-center lg:justify-start" style={{ animationDelay: '0.3s' }}>
              <Button size="lg" className="shadow-lg shadow-brand-action/20 w-full sm:w-auto" onClick={() => window.location.href = '/create'}>
                Create Free Link
              </Button>
              <button className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-lg text-brand-primary font-semibold hover:bg-brand-surfaceHighlight transition-all border border-transparent hover:border-brand-border w-full sm:w-auto">
                <PlayCircle size={20} className="text-brand-action" />
                <span>How it Works</span>
              </button>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-6 sm:gap-8 text-sm font-medium animate-fade-up text-brand-secondary" style={{ animationDelay: '0.4s' }}>
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
          </FadeIn>

          {/* Right: Phone Visual */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end mt-4 lg:mt-0">
            {/* The Phone */}
            <div className="relative w-[300px] sm:w-[340px] h-[600px] sm:h-[680px] bg-brand-primary rounded-[40px] sm:rounded-[50px] shadow-2xl border-[6px] sm:border-[8px] border-brand-primary overflow-hidden ring-1 ring-black/10 z-10 transform transition-transform duration-500 hover:scale-[1.02]">

              {/* Dynamic Island & Status Bar */}
              <div className="absolute top-0 left-0 right-0 h-12 z-30 flex justify-between items-start px-5 sm:px-6 pt-3 sm:pt-3.5">
                {/* Time */}
                <div className="text-[12px] sm:text-[13px] font-semibold text-black tracking-wide pl-1 sm:pl-2 w-16">
                  9:41
                </div>

                {/* Island */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90px] sm:w-[110px] h-[28px] sm:h-[32px] bg-black rounded-b-[14px] sm:rounded-b-[18px] z-40"></div>

                {/* Status Icons */}
                <div className="flex items-center gap-1.5 w-16 justify-end pr-1">
                  <Signal size={12} className="text-black stroke-[2.5]" />
                  <div className="w-[16px] sm:w-[18px] h-[9px] sm:h-[10px] border-2 border-black/30 rounded-[3px] relative ml-0.5">
                    <div className="absolute inset-0 bg-black m-[1.5px] rounded-[1px]"></div>
                  </div>
                </div>
              </div>

              {/* App UI */}
              <div className="absolute inset-0 bg-brand-surfaceHighlight flex flex-col h-full font-sans">

                {/* Chat Header */}
                <div className="bg-white/80 backdrop-blur-md pt-16 pb-3 px-5 border-b border-brand-border sticky top-0 z-20 flex items-center gap-3 shadow-sm">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-brand-ice p-0.5">
                      <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100" className="w-full h-full object-cover rounded-full" alt="Buyer" />
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 leading-none truncate">Rina (Buyer)</p>
                    <p className="text-[10px] text-brand-action mt-1 font-medium">Online</p>
                  </div>
                </div>

                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 pb-20 space-y-4 bg-brand-surfaceHighlight scroll-smooth">
                  <div className="pt-2 flex flex-col">
                    <div className="flex justify-center mb-6">
                      <span className="bg-brand-ice/50 text-brand-primary/60 text-[10px] font-bold px-3 py-1 rounded-full">Today 9:41 AM</span>
                    </div>

                    {chatMessages.map((msg, i) => (
                      msg.type === 'bubble' ? (
                        <ChatBubble key={i} isMe={msg.isMe!} text={msg.text} time={msg.time!} />
                      ) : (
                        <VouchCard key={i} />
                      )
                    ))}

                    {isBuyerTyping && <TypingIndicator />}
                    {isSellerTyping && (
                      <div className="flex w-full mb-3 justify-end animate-fade-in">
                        <div className="bg-brand-action text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
                          <div className="flex gap-1 h-4 items-center">
                            <div className="w-1.5 h-1.5 bg-white/70 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-1.5 h-1.5 bg-white/70 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-1.5 h-1.5 bg-white/70 rounded-full animate-bounce"></div>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                </div>

                {/* Input Area */}
                <div className="bg-white px-4 py-4 pb-8 flex items-center gap-3 z-20 border-t border-brand-border absolute bottom-0 left-0 right-0">
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