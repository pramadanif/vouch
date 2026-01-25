'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Lock, CheckCircle2, ArrowRight, ArrowLeft, Smartphone, Globe, Wallet, Users, Clock, Zap, ChevronRight, Building2 } from 'lucide-react';

// --- Slide Components ---

const SlideWrapper = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`w-full h-full flex flex-col items-center justify-center p-16 ${className}`}>
        {children}
    </div>
);

// SLIDE 1: Title
const Slide1 = () => (
    <SlideWrapper>
        <div className="flex items-center gap-4 mb-8">
            <img src="/logo.png" alt="Vouch" className="w-20 h-20" />
            <span className="text-5xl font-bold text-slate-900">VOUCH</span>
        </div>
        <p className="text-2xl text-slate-600 mb-4">Decentralized Escrow for Social Commerce</p>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-100 mb-12">
            <img src="/lisk.png" alt="Lisk" className="w-6 h-6" />
            <span className="text-sm font-semibold text-blue-700">Built on Lisk</span>
        </div>
        <h1 className="text-6xl font-extrabold text-slate-900 text-center leading-tight mb-8">
            Marketplace-level trust —<br /><span className="text-blue-600">without the marketplace.</span>
        </h1>
        <div className="flex gap-4 text-slate-500 text-lg">
            <span>Instagram</span><span>•</span><span>WhatsApp</span><span>•</span><span>TikTok</span>
        </div>
    </SlideWrapper>
);

// SLIDE 2: Problem
const Slide2 = () => (
    <SlideWrapper>
        <h2 className="text-5xl font-extrabold text-slate-900 text-center mb-4">Social commerce happens in DMs.</h2>
        <h2 className="text-5xl font-extrabold text-blue-600 text-center mb-16">But trust doesn't.</h2>
        <div className="grid grid-cols-2 gap-8 max-w-4xl">
            {[
                "Buyers are afraid to pay first",
                "Sellers are afraid to ship first",
                "Instagram & WhatsApp have no escrow",
                "Marketplaces force fees & lock users in"
            ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 bg-red-50 border border-red-100 rounded-xl p-6">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-xl text-slate-800 font-medium">{item}</span>
                </div>
            ))}
        </div>
        <p className="text-3xl font-bold text-slate-900 mt-16 text-center">There is a <span className="text-red-600">trust vacuum</span> in social commerce.</p>
    </SlideWrapper>
);

// SLIDE 3: Existing Solutions Fail
const Slide3 = () => (
    <SlideWrapper>
        <h2 className="text-5xl font-extrabold text-slate-900 mb-16">Why current solutions don't work</h2>
        <div className="grid grid-cols-2 gap-12 max-w-5xl">
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Marketplaces</h3>
                {["High fees", "Platform lock-in", "Not where conversations happen"].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 mb-4 text-lg text-slate-700">
                        <span className="text-red-500 font-bold">✕</span>{item}
                    </div>
                ))}
            </div>
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Manual Trust</h3>
                {["Screenshots", '"Trust me bro"', "Scams everywhere"].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 mb-4 text-lg text-slate-700">
                        <span className="text-red-500 font-bold">✕</span>{item}
                    </div>
                ))}
            </div>
        </div>
        <p className="text-2xl font-bold text-slate-900 mt-16 text-center">Trust should live <span className="text-blue-600">in the chat</span> — not on another platform.</p>
    </SlideWrapper>
);

// SLIDE 4: The Solution
const Slide4 = () => (
    <SlideWrapper>
        <h2 className="text-5xl font-extrabold text-slate-900 text-center mb-12">
            Vouch turns a payment link into a<br /><span className="text-blue-600">decentralized escrow contract.</span>
        </h2>
        <div className="flex items-center gap-4 bg-blue-50 rounded-2xl p-8 border border-blue-100 max-w-4xl">
            {["Paste link", "Buyer pays", "Seller ships", "Buyer confirms", "Funds released"].map((step, i) => (
                <React.Fragment key={i}>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">{i + 1}</div>
                        <span className="text-sm font-medium text-slate-700 whitespace-nowrap">{step}</span>
                    </div>
                    {i < 4 && <ChevronRight className="text-blue-300" size={24} />}
                </React.Fragment>
            ))}
        </div>
        <div className="flex gap-8 mt-16">
            {["No login", "No registration", "No marketplace"].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-lg font-semibold text-emerald-600">
                    <CheckCircle2 size={24} />{item}
                </div>
            ))}
        </div>
    </SlideWrapper>
);

// SLIDE 5: Why Blockchain
const Slide5 = () => (
    <SlideWrapper>
        <h2 className="text-5xl font-extrabold text-slate-900 mb-16">Why blockchain is essential here</h2>
        <div className="grid grid-cols-2 gap-6 max-w-4xl">
            {[
                { icon: Shield, text: "Escrow rules must be neutral" },
                { icon: Lock, text: "Funds must be non-custodial" },
                { icon: Users, text: "No backend should override outcomes" },
                { icon: CheckCircle2, text: "All actions must be verifiable" }
            ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-center gap-4 bg-emerald-50 border border-emerald-100 rounded-xl p-6">
                    <Icon className="text-emerald-600" size={28} />
                    <span className="text-xl text-slate-800 font-medium">{text}</span>
                </div>
            ))}
        </div>
        <p className="text-3xl font-bold text-slate-900 mt-16 text-center">Smart contracts <span className="text-blue-600">replace trust</span> between strangers.</p>
    </SlideWrapper>
);

// SLIDE 6: Design Philosophy
const Slide6 = () => (
    <SlideWrapper>
        <h2 className="text-5xl font-extrabold text-slate-900 mb-4">Web2 UX. <span className="text-blue-600">Web3 Trust.</span></h2>
        <p className="text-xl text-slate-500 mb-16">The best of both worlds.</p>
        <div className="grid grid-cols-2 gap-12 max-w-5xl">
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
                <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2"><Smartphone size={24} /> UX (Familiar)</h3>
                {["Familiar payment flow", "Mobile-first", "Simple language", "DM-friendly"].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 mb-4 text-lg text-slate-700">
                        <CheckCircle2 className="text-emerald-500" size={20} />{item}
                    </div>
                ))}
            </div>
            <div className="bg-blue-50 rounded-2xl p-8 border border-blue-100">
                <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2"><Shield size={24} /> Trust (On-Chain)</h3>
                {["Wallet = identity", "Smart contract = source of truth", "Backend = coordinator, not custodian"].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 mb-4 text-lg text-slate-700">
                        <CheckCircle2 className="text-blue-500" size={20} />{item}
                    </div>
                ))}
            </div>
        </div>
    </SlideWrapper>
);

// SLIDE 7: Actors
const Slide7 = () => (
    <SlideWrapper>
        <h2 className="text-5xl font-extrabold text-slate-900 mb-16">Who does what</h2>
        <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden max-w-3xl w-full">
            <div className="grid grid-cols-2 bg-slate-100 p-4 font-bold text-slate-700 text-lg">
                <span>Actor</span><span>Role</span>
            </div>
            {[
                ["Seller", "Creates escrow & ships goods"],
                ["Buyer", "Pays via crypto or fiat"],
                ["Smart Contract (Lisk)", "Holds escrow logic & funds"],
                ["Backend", "Verifies fiat payment only"],
                ["Xendit", "Fiat payment confirmation"]
            ].map(([actor, role], i) => (
                <div key={i} className={`grid grid-cols-2 p-4 text-lg ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                    <span className="font-semibold text-slate-900">{actor}</span>
                    <span className="text-slate-600">{role}</span>
                </div>
            ))}
        </div>
        <p className="text-lg text-slate-500 mt-8 italic">Backend cannot release or steal funds.</p>
    </SlideWrapper>
);

// SLIDE 8: Core Flow
const Slide8 = () => (
    <SlideWrapper>
        <h2 className="text-5xl font-extrabold text-slate-900 mb-16">The entire Vouch flow</h2>
        <div className="flex flex-col items-center gap-4">
            {[
                "Seller creates escrow",
                "Buyer pays (Crypto or QRIS)",
                "Funds locked on-chain",
                "Seller ships goods",
                "Buyer confirms receipt",
                "Funds released automatically"
            ].map((step, i) => (
                <React.Fragment key={i}>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl px-8 py-4 text-xl font-semibold text-slate-800">{step}</div>
                    {i < 5 && <ArrowRight className="text-blue-300 rotate-90" size={28} />}
                </React.Fragment>
            ))}
        </div>
        <p className="text-2xl font-bold text-slate-900 mt-12">One flow. One contract. <span className="text-blue-600">One source of truth.</span></p>
    </SlideWrapper>
);

// SLIDE 9: Seller Flow
const Slide9 = () => (
    <SlideWrapper>
        <h2 className="text-5xl font-extrabold text-slate-900 mb-4">Seller creates escrow</h2>
        <p className="text-2xl text-blue-600 font-semibold mb-16">(Decentralized)</p>
        <div className="grid grid-cols-2 gap-12 max-w-5xl">
            <div>
                <h3 className="text-xl font-bold text-slate-700 mb-6">Steps</h3>
                {["Connect Lisk wallet", "Set item, price, escrow time", "Sign transaction"].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 mb-4 text-lg text-slate-700">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">{i + 1}</div>
                        {item}
                    </div>
                ))}
            </div>
            <div className="bg-emerald-50 rounded-2xl p-8 border border-emerald-100">
                <h3 className="text-xl font-bold text-emerald-700 mb-6">On-chain result</h3>
                {["msg.sender = seller", "Escrow created immutably", "Shareable Vouch link generated"].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 mb-4 text-lg text-slate-700">
                        <CheckCircle2 className="text-emerald-500" size={20} />{item}
                    </div>
                ))}
            </div>
        </div>
        <p className="text-xl font-bold text-slate-900 mt-12">No one can <span className="text-blue-600">impersonate the seller.</span></p>
    </SlideWrapper>
);

// SLIDE 10: Buyer Payment Options
const Slide10 = () => (
    <SlideWrapper>
        <h2 className="text-5xl font-extrabold text-slate-900 mb-16">Buyer pays however they want</h2>
        <div className="grid grid-cols-2 gap-12 max-w-5xl">
            <div className="bg-blue-50 rounded-2xl p-8 border border-blue-100">
                <h3 className="text-2xl font-bold text-blue-700 mb-6 flex items-center gap-2"><Wallet size={24} /> Crypto (On-chain)</h3>
                {["USDC on Lisk", "Funds locked directly in escrow"].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 mb-4 text-lg text-slate-700">
                        <CheckCircle2 className="text-blue-500" size={20} />{item}
                    </div>
                ))}
            </div>
            <div className="bg-emerald-50 rounded-2xl p-8 border border-emerald-100">
                <h3 className="text-2xl font-bold text-emerald-700 mb-6 flex items-center gap-2"><Globe size={24} /> Fiat (Hybrid)</h3>
                {["QRIS / VA via Xendit", "Backend verifies payment", "Backend funds escrow on-chain"].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 mb-4 text-lg text-slate-700">
                        <CheckCircle2 className="text-emerald-500" size={20} />{item}
                    </div>
                ))}
            </div>
        </div>
        <p className="text-xl font-medium text-slate-600 mt-12 text-center">Fiat is verified off-chain. <span className="font-bold text-slate-900">Escrow logic stays on-chain.</span></p>
    </SlideWrapper>
);

// SLIDE 11: Escrow Safety
const Slide11 = () => (
    <SlideWrapper>
        <h2 className="text-5xl font-extrabold text-slate-900 mb-16">What if something goes wrong?</h2>
        <div className="grid grid-cols-2 gap-6 max-w-4xl">
            {[
                { icon: CheckCircle2, text: "Buyer confirmation → release" },
                { icon: Clock, text: "Timeout → auto-release" },
                { icon: ArrowLeft, text: "Seller cancel → auto-refund" },
                { icon: Lock, text: "Immutable escrow history" }
            ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl p-6">
                    <Icon className="text-blue-600" size={28} />
                    <span className="text-xl text-slate-800 font-medium">{text}</span>
                </div>
            ))}
        </div>
        <p className="text-2xl font-bold text-slate-900 mt-16">All enforced by <span className="text-blue-600">smart contract.</span></p>
    </SlideWrapper>
);

// SLIDE 12: Smart Contract Role
const Slide12 = () => (
    <SlideWrapper>
        <h2 className="text-5xl font-extrabold text-slate-900 mb-16">What lives on-chain?</h2>
        <div className="grid grid-cols-2 gap-12 max-w-5xl">
            <div className="bg-blue-50 rounded-2xl p-8 border border-blue-100">
                <h3 className="text-2xl font-bold text-blue-700 mb-6">On-chain (Decentralized)</h3>
                {["Escrow creation", "Fund locking", "Release & refund logic", "Timeouts"].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 mb-4 text-lg text-slate-700">
                        <CheckCircle2 className="text-blue-500" size={20} />{item}
                    </div>
                ))}
            </div>
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
                <h3 className="text-2xl font-bold text-slate-700 mb-6">Off-chain (Replaceable)</h3>
                {["Fiat confirmation", "Metadata indexing"].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 mb-4 text-lg text-slate-700">
                        <span className="text-slate-400">○</span>{item}
                    </div>
                ))}
            </div>
        </div>
        <p className="text-2xl font-bold text-slate-900 mt-16">If the backend disappears, <span className="text-blue-600">funds are still safe.</span></p>
    </SlideWrapper>
);

// SLIDE 13: Why Lisk
const Slide13 = () => (
    <SlideWrapper>
        <h2 className="text-5xl font-extrabold text-slate-900 mb-16">Why we built Vouch on Lisk</h2>
        <div className="grid grid-cols-2 gap-6 max-w-4xl">
            {[
                { icon: Zap, text: "Low gas fees → usable for real sellers" },
                { icon: Building2, text: "EVM compatible → fast development" },
                { icon: Smartphone, text: "Ideal for consumer-facing dApps" },
                { icon: Globe, text: "Designed for mass adoption" }
            ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-center gap-4 bg-blue-50 border border-blue-100 rounded-xl p-6">
                    <Icon className="text-blue-600" size={28} />
                    <span className="text-xl text-slate-800 font-medium">{text}</span>
                </div>
            ))}
        </div>
    </SlideWrapper>
);

// SLIDE 14: Why This Wins
const Slide14 = () => (
    <SlideWrapper>
        <h2 className="text-5xl font-extrabold text-slate-900 mb-16">Why Vouch stands out</h2>
        <div className="flex flex-col gap-4 max-w-2xl">
            {[
                "Real-world problem in SEA",
                "Blockchain is necessary, not cosmetic",
                "Simple, explainable flow",
                "No over-engineering",
                "Ready for real usage"
            ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 bg-emerald-50 border border-emerald-100 rounded-xl p-6">
                    <CheckCircle2 className="text-emerald-600" size={28} />
                    <span className="text-xl text-slate-800 font-semibold">{item}</span>
                </div>
            ))}
        </div>
        <p className="text-2xl font-bold text-slate-900 mt-16">Vouch adds trust <span className="text-blue-600">where platforms never did.</span></p>
    </SlideWrapper>
);

// SLIDE 15: Final Statement
const Slide15 = () => (
    <SlideWrapper className="bg-slate-900">
        <h2 className="text-5xl font-extrabold text-white text-center leading-tight mb-8">
            Vouch doesn't replace marketplaces.<br />
            It replaces the <span className="text-blue-400">missing trust layer</span><br />
            in social commerce.
        </h2>
        <div className="flex items-center gap-4 mt-12">
            <img src="/logo.png" alt="Vouch" className="w-16 h-16" />
            <span className="text-4xl font-bold text-white">Trust your DMs.</span>
        </div>
    </SlideWrapper>
);

// --- Main Component ---

const SLIDES = [Slide1, Slide2, Slide3, Slide4, Slide5, Slide6, Slide7, Slide8, Slide9, Slide10, Slide11, Slide12, Slide13, Slide14, Slide15];

export default function DeckPage() {
    const [current, setCurrent] = useState(0);

    const next = useCallback(() => setCurrent(prev => Math.min(prev + 1, SLIDES.length - 1)), []);
    const prev = useCallback(() => setCurrent(prev => Math.max(prev - 1, 0)), []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === ' ') next();
            if (e.key === 'ArrowLeft') prev();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [next, prev]);

    const CurrentSlide = SLIDES[current];

    return (
        <div className="w-screen h-screen bg-white overflow-hidden font-sans">
            {/* Background */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-30 bg-center z-0"></div>

            {/* Slide */}
            <div className="relative z-10 w-full h-full">
                <CurrentSlide />
            </div>

            {/* Navigation */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
                <button onClick={prev} disabled={current === 0} className="p-3 rounded-full bg-slate-100 hover:bg-slate-200 disabled:opacity-30 transition">
                    <ArrowLeft size={24} />
                </button>
                <span className="text-lg font-semibold text-slate-600 min-w-[80px] text-center">{current + 1} / {SLIDES.length}</span>
                <button onClick={next} disabled={current === SLIDES.length - 1} className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-30 transition">
                    <ArrowRight size={24} />
                </button>
            </div>
        </div>
    );
}
