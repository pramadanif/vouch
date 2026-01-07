'use client';

import React, { useState } from 'react';
import { ShieldCheck, Copy, ArrowRight, Upload, Loader2, Check } from 'lucide-react';
import Link from 'next/link';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import Button from '@/components/Button';
import FadeIn from '@/components/ui/FadeIn';
import { api } from '@/lib/api';

export default function CreateLinkPage() {
    const [step, setStep] = useState<'connect' | 'create' | 'share'>('connect');
    const [generatedLink, setGeneratedLink] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const [itemName, setItemName] = useState('');
    const [itemDescription, setItemDescription] = useState('');
    const [amountIdr, setAmountIdr] = useState('');
    const [currency, setCurrency] = useState('USDC');
    const [releaseDuration, setReleaseDuration] = useState(86400); // 24 hours default

    // Wagmi hooks
    const { address, isConnected } = useAccount();
    const { connect, connectors, isPending } = useConnect();
    const { disconnect } = useDisconnect();

    // Handle wallet connection
    const handleConnect = async () => {
        const injected = connectors.find(c => c.id === 'injected');
        if (injected) {
            connect({ connector: injected });
        }
    };

    // Effect to move to create step when connected
    React.useEffect(() => {
        if (isConnected && address) {
            setStep('create');
        } else {
            setStep('connect');
        }
    }, [isConnected, address]);

    // Handle form submission
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const result = await api.createEscrow({
                sellerAddress: address!,
                itemName,
                itemDescription,
                amountIdr: amountIdr.replace(/[^0-9]/g, ''),
                releaseDuration,
                currency,
            });

            setGeneratedLink(result.paymentLink);
            setStep('share');
        } catch (err: any) {
            setError(err.message || 'Failed to create payment link');
        } finally {
            setIsLoading(false);
        }
    };

    // Format address for display
    const formatAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    // Format currency
    const formatCurrency = (value: string) => {
        const num = value.replace(/[^0-9]/g, '');
        return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    // Copy link
    const handleCopy = () => {
        navigator.clipboard.writeText(generatedLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-brand-surface flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute inset-0 bg-brand-surfaceHighlight"></div>
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-brand-ice/50 to-transparent opacity-60 pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-action/5 rounded-full blur-[100px] pointer-events-none"></div>

            <Link href="/" className="mb-10 flex items-center gap-3 z-10 group">
                <div className="relative w-12 h-12 transition-transform duration-300 group-hover:scale-105">
                    {/* Using img tag directly since we updated imports in step 730 but this replaces whole file content anyway */}
                    {/* Wait, I should import Image properly at the top. */}
                    <img
                        src="/logo.png"
                        alt="Vouch Logo"
                        className="w-full h-full object-contain drop-shadow-lg"
                    />
                </div>
                <span className="text-3xl font-bold tracking-tight text-brand-primary drop-shadow-sm">Vouch</span>
            </Link>

            <FadeIn className="w-full max-w-lg bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 overflow-hidden relative z-10 ring-1 ring-brand-border/50">
                {step === 'connect' ? (
                    <div className="p-10 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-brand-ice to-white rounded-2xl shadow-inner flex items-center justify-center mx-auto mb-8 border border-white/50">
                            <ShieldCheck size={40} className="text-brand-action" />
                        </div>
                        <h1 className="text-3xl font-bold text-brand-primary mb-3">Secure Payout Account</h1>
                        <p className="text-brand-secondary text-base mb-10 leading-relaxed max-w-[80%] mx-auto">
                            Connect your wallet to receive payments securely. Funds are released directly to your address.
                        </p>

                        <Button
                            onClick={handleConnect}
                            variant="primary"
                            size="lg"
                            className="w-full shadow-lg shadow-brand-action/25 hover:shadow-brand-action/40 transition-all transform hover:-translate-y-0.5"
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="animate-spin mr-2" size={20} />
                                    Connecting...
                                </>
                            ) : (
                                'Connect Wallet'
                            )}
                        </Button>
                        <p className="text-xs text-brand-secondary mt-6 font-medium">
                            Supports MetaMask, Coinbase, and WalletConnect.
                        </p>
                    </div>
                ) : step === 'create' ? (
                    <div className="p-8">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-brand-border/30">
                            <h1 className="text-xl font-bold text-brand-primary">Create Payment Link</h1>
                            <button
                                onClick={() => disconnect()}
                                className="text-xs bg-brand-ice/50 px-3 py-1.5 rounded-full text-brand-action font-mono border border-brand-action/10 hover:bg-brand-ice transition-colors font-medium"
                            >
                                {address ? formatAddress(address) : '...'}
                            </button>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50/80 border border-red-100 text-red-600 rounded-xl text-sm flex items-start gap-2">
                                <span className="mt-0.5">⚠️</span>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleCreate} className="space-y-6">
                            <div className="group">
                                <label className="block text-sm font-semibold text-brand-primary mb-2 ml-1">Product Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Nike Jordan 1 High OG"
                                    value={itemName}
                                    onChange={(e) => setItemName(e.target.value)}
                                    className="w-full px-4 py-3.5 rounded-xl bg-white/50 border border-brand-border/60 focus:bg-white focus:border-brand-action focus:ring-4 focus:ring-brand-action/10 outline-none transition-all placeholder:text-brand-secondary/40 font-medium shadow-sm group-hover:border-brand-border"
                                    required
                                />
                            </div>

                            <div className="group">
                                <label className="block text-sm font-semibold text-brand-primary mb-2 ml-1">Description <span className="text-brand-secondary/60 font-normal">(optional)</span></label>
                                <textarea
                                    placeholder="e.g. Size 42, Original, BNIB"
                                    value={itemDescription}
                                    onChange={(e) => setItemDescription(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3.5 rounded-xl bg-white/50 border border-brand-border/60 focus:bg-white focus:border-brand-action focus:ring-4 focus:ring-brand-action/10 outline-none transition-all placeholder:text-brand-secondary/40 font-medium shadow-sm resize-none group-hover:border-brand-border"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-brand-primary mb-2 ml-1">Price (IDR)</label>
                                <div className="flex gap-3">
                                    <div className="relative flex-1 group">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary font-bold text-lg">Rp</span>
                                        <input
                                            type="text"
                                            placeholder="0"
                                            value={formatCurrency(amountIdr)}
                                            onChange={(e) => setAmountIdr(e.target.value.replace(/[^0-9]/g, ''))}
                                            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/50 border border-brand-border/60 focus:bg-white focus:border-brand-action focus:ring-4 focus:ring-brand-action/10 outline-none transition-all placeholder:text-brand-secondary/40 font-bold text-lg shadow-sm group-hover:border-brand-border"
                                            required
                                        />
                                    </div>
                                    <div className="relative">
                                        <select
                                            value={currency}
                                            onChange={(e) => setCurrency(e.target.value)}
                                            className="appearance-none h-full w-28 px-4 py-3.5 rounded-xl bg-white/50 border border-brand-border/60 focus:bg-white focus:border-brand-action focus:ring-4 focus:ring-brand-action/10 outline-none transition-all font-bold text-brand-primary shadow-sm cursor-pointer hover:bg-white"
                                        >
                                            <option value="USDC">USDC</option>
                                            <option value="IDRX">IDRX</option>
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-brand-secondary">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-brand-secondary mt-2 ml-1 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-action/50"></span>
                                    {currency === 'USDC'
                                        ? 'Buyer pays in USDC (auto-converted)'
                                        : 'Buyer pays in IDRX (1:1 with IDR)'}
                                </p>
                            </div>

                            <div className="group">
                                <label className="block text-sm font-semibold text-brand-primary mb-2 ml-1">Protection Period</label>
                                <div className="relative">
                                    <select
                                        value={releaseDuration}
                                        onChange={(e) => setReleaseDuration(parseInt(e.target.value))}
                                        className="appearance-none w-full px-4 py-3.5 rounded-xl bg-white/50 border border-brand-border/60 focus:bg-white focus:border-brand-action focus:ring-4 focus:ring-brand-action/10 outline-none transition-all font-medium text-brand-primary shadow-sm cursor-pointer hover:bg-white"
                                    >
                                        <option value={3600}>1 hour (testing)</option>
                                        <option value={86400}>24 hours (Recommend)</option>
                                        <option value={259200}>3 days</option>
                                        <option value={604800}>7 days</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-brand-secondary">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                    </div>
                                </div>
                                <p className="text-xs text-brand-secondary mt-2 ml-1 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                    Funds released automatically if no dispute.
                                </p>
                            </div>

                            <Button
                                variant="primary"
                                size="lg"
                                className="w-full mt-4 shadow-xl shadow-brand-action/20 hover:shadow-brand-action/30 transition-all py-4 text-base tracking-wide font-bold"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2" size={20} />
                                        Creating...
                                    </>
                                ) : (
                                    'Create Payment Link'
                                )}
                            </Button>
                        </form>
                    </div>
                ) : (
                    <div className="p-10 text-center bg-white">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-fade-up border border-green-100">
                            <ShieldCheck size={40} className="text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-brand-primary mb-3">Link Created Successfully!</h2>
                        <p className="text-brand-secondary text-base mb-8 max-w-[80%] mx-auto leading-relaxed">
                            Share this link with your buyer. Funds will be held safely until delivery confirmation.
                        </p>

                        <div className="bg-brand-surfaceHighlight p-5 rounded-2xl flex items-center justify-between border border-brand-border/60 mb-8 shadow-inner">
                            <code className="text-brand-action font-semibold text-sm truncate mr-4 bg-white/50 px-2 py-1 rounded">{generatedLink}</code>
                            <button
                                className="p-2.5 hover:bg-white rounded-xl transition-all text-brand-secondary hover:text-brand-primary flex-shrink-0 shadow-sm border border-transparent hover:border-brand-border hover:shadow"
                                onClick={handleCopy}
                            >
                                {copied ? <Check size={20} className="text-green-600" /> : <Copy size={20} />}
                            </button>
                        </div>

                        <Button
                            variant="outline"
                            size="lg"
                            className="w-full mb-4 py-3.5 border-brand-border/60 hover:bg-brand-surfaceHighlight font-semibold"
                            onClick={() => {
                                setStep('create');
                                setItemName('');
                                setAmountIdr('');
                                setGeneratedLink('');
                                setError('');
                            }}
                        >
                            Create Another
                        </Button>
                        <div className="flex gap-4 mt-6 pt-6 border-t border-brand-border/30">
                            <Link href="/dashboard" className="flex-1 text-sm font-semibold text-brand-action hover:text-brand-primary transition-colors py-2 rounded-lg hover:bg-brand-action/5">
                                View Dashboard
                            </Link>
                            <Link href="/" className="flex-1 text-sm font-semibold text-brand-secondary hover:text-brand-primary transition-colors py-2 rounded-lg hover:bg-brand-ice/50">
                                Back to Home
                            </Link>
                        </div>
                    </div>
                )}
            </FadeIn>
        </div>
    );
}
