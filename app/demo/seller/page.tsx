'use client';

import React from 'react';
import DemoChatPhone, { ChatMessage, DemoScriptItem } from '@/components/demo/DemoChatPhone';
import { ShieldCheck } from 'lucide-react';

export default function SellerDemoPage() {
    // Initial State: Start with empty messages to animate everything
    const INITIAL_MESSAGES: ChatMessage[] = [];

    // Script: Full conversation animation
    const SCRIPT: DemoScriptItem[] = [
        { action: 'wait', duration: 1000 },
        { action: 'type', actor: 'them', duration: 1000 },
        { action: 'send', actor: 'them', text: "Hi! Is the Jordan still available?" },

        { action: 'wait', duration: 1000 },
        { action: 'type', actor: 'me', duration: 1000 },
        { action: 'send', actor: 'me', text: "Yes! Still available." },

        { action: 'wait', duration: 1000 },
        { action: 'type', actor: 'them', duration: 1000 },
        { action: 'send', actor: 'them', text: "Can I transfer directly to your Bank Account?" },

        { action: 'wait', duration: 1000 },
        { action: 'type', actor: 'me', duration: 1500 },
        { action: 'send', actor: 'me', text: "Actually, let's use Vouch. It's safer for both of us." },
    ];

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 overflow-hidden gap-8">
            {/* Vouch Logo */}
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-transparent rounded-xl flex items-center justify-center overflow-hidden">
                    <img src="/logo.png" alt="Vouch" className="w-full h-full object-contain" />
                </div>
                <span className="text-3xl font-bold text-brand-primary tracking-tight">Vouch</span>
            </div>

            <DemoChatPhone
                role="seller"
                contactName="Buyer"
                contactImage="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100"
                initialMessages={INITIAL_MESSAGES}
                script={SCRIPT}
            />
        </div>
    );
}
