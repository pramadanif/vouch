'use client';

import React from 'react';
import DemoChatPhone from '@/components/demo/DemoChatPhone';

export default function ThumbnailPage() {
    const THUMBNAIL_MESSAGES = [
        { type: 'bubble' as const, isMe: false, text: "Is the Jordan still available?", time: "09:41" },
        { type: 'bubble' as const, isMe: true, text: "Yes! Use Vouch for safety.", time: "09:42" },
        { type: 'vouch' as const, isMe: true, vouchStatus: 'secured' as const, time: "09:43" },
        { type: 'bubble' as const, isMe: false, text: "Money sent! Please ship.", time: "09:45" },
    ];

    return (
        <div className="w-screen h-screen bg-brand-surface overflow-hidden font-sans relative">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-noise opacity-30 z-[1] pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-mesh opacity-20 z-0"></div>

            {/* Accents */}
            <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-brand-accent/20 rounded-full blur-[120px] animate-pulse-soft"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-[40vw] h-[40vw] bg-brand-action/20 rounded-full blur-[120px] animate-pulse-soft" style={{ animationDelay: '1s' }}></div>

            {/* Content Container */}
            <div className="relative z-10 w-full h-full flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24 px-8 md:px-16 max-w-[1600px] mx-auto">

                {/* Left: Text Content */}
                <div className="flex-1 flex flex-col items-start gap-8 max-w-2xl animate-fade-up">
                    <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md px-6 py-3 rounded-full border border-brand-border/50 shadow-soft">
                        <img src="/logo.png" alt="Vouch" className="w-10 h-10 object-contain drop-shadow-sm" />
                        <span className="text-2xl font-bold text-brand-primary tracking-tight">Vouch</span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-extrabold text-brand-primary leading-[1.05] tracking-tight drop-shadow-sm">
                        Sell in DMs. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-corporate">
                            Get Paid Safely.
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-brand-secondary max-w-xl leading-relaxed font-medium">
                        The decentralized escrow layer for <span className="text-brand-primary font-semibold">Instagram</span>, <span className="text-brand-primary font-semibold">WhatsApp</span>, and <span className="text-brand-primary font-semibold">TikTok</span>.
                    </p>

                    <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center space-x-[-12px]">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-12 h-12 rounded-full border-4 border-white shadow-md bg-brand-ice overflow-hidden relative">
                                    <img
                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`}
                                        alt="User"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="text-sm font-semibold text-brand-primary">
                            <span className="text-brand-action">10,000+</span> secured deals
                        </div>
                    </div>
                </div>

                {/* Right: Phone Demo */}
                <div className="relative scale-[0.9] md:scale-100 origin-center animate-fade-up" style={{ animationDelay: '0.2s' }}>
                    {/* Glowing Backdrop for Phone */}
                    <div className="absolute inset-0 bg-gradient-glow opacity-30 blur-[60px] rounded-[3rem] -z-10 animate-pulse-soft"></div>
                    <div className="absolute -inset-4 bg-brand-primary/5 blur-[40px] rounded-[4rem] -z-20"></div>

                    {/* Phone Container with Float Animation */}
                    <div className="animate-float">
                        <DemoChatPhone
                            role="seller"
                            contactName="Buyer"
                            contactImage="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150"
                            initialMessages={THUMBNAIL_MESSAGES}
                            script={[]}
                        />
                    </div>

                    {/* Floating Badge */}
                    <div className="absolute -right-8 top-20 bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-card border border-white/50 animate-bounce-gentle">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                                <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs text-brand-secondary font-semibold uppercase tracking-wider">Status</p>
                                <p className="text-sm font-bold text-brand-primary">Payment Secured</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
