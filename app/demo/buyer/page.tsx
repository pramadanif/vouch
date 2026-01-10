'use client';

import React from 'react';
import DemoChatPhone, { ChatMessage, DemoScriptItem } from '@/components/demo/DemoChatPhone';
import { BadgeCheck } from 'lucide-react';

export default function BuyerDemoPage() {
    // Initial State: Start empty
    const INITIAL_MESSAGES: ChatMessage[] = [];

    // Script: Full conversation animation
    const SCRIPT: DemoScriptItem[] = [
        { action: 'wait', duration: 1000 },
        { action: 'type', actor: 'me', duration: 1000 },
        { action: 'send', actor: 'me', text: "Is the condition really 10/10 like new?" },

        { action: 'wait', duration: 1000 },
        { action: 'type', actor: 'them', duration: 1000 },
        { action: 'send', actor: 'them', text: "Yes! Worn once for a photoshoot only." },

        { action: 'wait', duration: 1000 },
        { action: 'type', actor: 'them', duration: 1500 },
        { action: 'send', actor: 'them', text: "Here is the payment link to secure the funds." },

        { action: 'wait', duration: 500 },
        { action: 'send', actor: 'them' }, // Vouch Card (Pending)

        { action: 'wait', duration: 1500 },
        { action: 'type', actor: 'me', duration: 1500 },
        { action: 'send', actor: 'me', text: "Okay, this looks safe. Wait I'll make payment." },
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
                role="buyer"
                contactName="Seller"
                contactImage="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&h=100"
                initialMessages={INITIAL_MESSAGES}
                script={SCRIPT}
            />
        </div>
    );
}
