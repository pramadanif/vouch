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
        <div className="w-screen h-screen bg-white flex items-center justify-center overflow-hidden font-sans">
            {/* Background */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-40 bg-center z-0"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white/50 z-0"></div>
            <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-blue-100/50 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[30vw] h-[30vw] bg-emerald-100/50 rounded-full blur-[100px]"></div>

            {/* Content */}
            <div className="relative z-10 flex items-center gap-16 max-w-7xl px-16">
                {/* Left: Text */}
                <div className="flex-1 flex flex-col items-start gap-6">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Vouch" className="w-14 h-14 object-contain" />
                        <span className="text-3xl font-bold text-slate-900">Vouch</span>
                    </div>
                    <h1 className="text-6xl font-extrabold text-slate-900 leading-[1.1]">
                        Sell in DMs. <br />
                        <span className="text-blue-600">Get Paid Safely.</span>
                    </h1>
                    <p className="text-xl text-slate-600 max-w-lg">
                        Vouch is the decentralized escrow layer for Instagram, WhatsApp, and TikTok.
                    </p>
                </div>

                {/* Right: Phone (Smaller like Hero) */}
                <div className="relative scale-[0.85] origin-center">
                    <div className="absolute inset-0 bg-blue-500/15 blur-[60px] rounded-full -z-10"></div>
                    <DemoChatPhone
                        role="seller"
                        contactName="Buyer"
                        contactImage="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100"
                        initialMessages={THUMBNAIL_MESSAGES}
                        script={[]}
                    />
                </div>
            </div>
        </div>
    );
}
