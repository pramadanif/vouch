'use client';

import React, { useState } from 'react';
import { Copy, Loader2, Check, Clock } from 'lucide-react';
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
    const [isMounted, setIsMounted] = useState(false);

    const [itemName, setItemName] = useState('');
    const [itemDescription, setItemDescription] = useState('');
    const [amountIdr, setAmountIdr] = useState('');
    const [currency, setCurrency] = useState('USDC');
    const [releaseDuration, setReleaseDuration] = useState(86400);

    const { address, isConnected } = useAccount();
    const { connect, connectors, isPending } = useConnect();
    const { disconnect } = useDisconnect();

    const handleConnect = async () => {
        const injected = connectors.find(c => c.id === 'injected');
        if (injected) connect({ connector: injected });
    };

    React.useEffect(() => {
        setIsMounted(true);
        if (isConnected && address) setStep('create');
        else setStep('connect');
    }, [isConnected, address]);

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

    const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    const formatCurrency = (value: string) => value.replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Rich Background like MyBCA */}
            {/* Rich Background like MyBCA */}
            <div className="absolute inset-0 bg-brand-surfaceHighlight"></div>

            {/* Abstract Blue Shapes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[1000px] h-[1000px] rounded-full bg-brand-ice/60 blur-3xl -translate-y-1/2 translate-x-1/4 mix-blend-multiply"></div>
                <div className="absolute bottom-0 left-0 w-[800px] h-[800px] rounded-full bg-blue-100/50 blur-3xl translate-y-1/2 -translate-x-1/4 mix-blend-multiply"></div>
                <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] rounded-full bg-brand-ice/30 blur-3xl -translate-x-1/2 -translate-y-1/2 mix-blend-multiply"></div>
            </div>

            {/* Header */}
            <header className="relative z-20 border-b border-brand-border/50 bg-white/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <img src="/logo.png" alt="Vouch" className="w-9 h-9 object-contain" />
                        <span className="text-xl font-bold text-brand-primary">Vouch</span>
                    </Link>
                    {isMounted && isConnected && (
                        <button
                            onClick={() => disconnect()}
                            className="text-sm px-4 py-2 rounded-lg bg-white border border-brand-border/50 text-brand-secondary font-mono hover:bg-brand-surfaceHighlight transition-colors shadow-sm"
                        >
                            {address ? formatAddress(address) : '...'}
                        </button>
                    )}
                </div>
            </header>

            <main className="relative z-10 max-w-7xl mx-auto px-6 py-16">
                {step === 'connect' ? (
                    <FadeIn className="max-w-md mx-auto">
                        <div className="bg-white rounded-2xl shadow-2xl p-10 text-center">
                            <div className="w-16 h-16 bg-brand-ice/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <img src="/logo.png" alt="" className="w-10 h-10" />
                            </div>
                            <h1 className="text-2xl font-bold text-brand-primary mb-3">Connect Wallet</h1>
                            <p className="text-brand-secondary mb-8 leading-relaxed">
                                Connect your wallet to receive payments directly to your address.
                            </p>
                            <Button onClick={handleConnect} variant="primary" size="lg" className="w-full" disabled={isPending}>
                                {isPending ? <><Loader2 className="animate-spin mr-2" size={18} />Connecting...</> : 'Connect Wallet'}
                            </Button>
                            <p className="text-xs text-brand-secondary mt-6">MetaMask & WalletConnect supported</p>
                        </div>
                    </FadeIn>
                ) : step === 'create' ? (
                    <div className="grid lg:grid-cols-2 gap-12 items-start">
                        {/* Left - Info Panel */}
                        <FadeIn className="hidden lg:block text-brand-primary">
                            <div className="sticky top-24">
                                <h1 className="text-4xl xl:text-5xl font-bold mb-6 leading-tight text-brand-primary">
                                    Create Secure<br />Payment Link
                                </h1>
                                <p className="text-xl text-brand-secondary mb-10 leading-relaxed">
                                    Generate a payment link for your buyer. Funds are held securely in escrow until delivery confirmation.
                                </p>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-4 p-5 bg-white/60 backdrop-blur-sm rounded-xl border border-brand-border/50 shadow-sm">
                                        <div className="w-10 h-10 bg-brand-ice/30 rounded-lg flex items-center justify-center flex-shrink-0 text-brand-action font-bold">1</div>
                                        <div>
                                            <h3 className="font-semibold text-brand-primary">Create Link</h3>
                                            <p className="text-sm text-brand-secondary">Fill in product details and price</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 p-5 bg-white/60 backdrop-blur-sm rounded-xl border border-brand-border/50 shadow-sm">
                                        <div className="w-10 h-10 bg-brand-ice/30 rounded-lg flex items-center justify-center flex-shrink-0 text-brand-action font-bold">2</div>
                                        <div>
                                            <h3 className="font-semibold text-brand-primary">Share with Buyer</h3>
                                            <p className="text-sm text-brand-secondary">Send the link via chat or social media</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 p-5 bg-white/60 backdrop-blur-sm rounded-xl border border-brand-border/50 shadow-sm">
                                        <div className="w-10 h-10 bg-brand-ice/30 rounded-lg flex items-center justify-center flex-shrink-0 text-brand-action font-bold">3</div>
                                        <div>
                                            <h3 className="font-semibold text-brand-primary">Get Paid</h3>
                                            <p className="text-sm text-brand-secondary">Funds released after buyer confirms</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </FadeIn>

                        {/* Right - Form */}
                        <FadeIn>
                            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                                <div className="px-8 py-6 border-b border-brand-border/30 bg-brand-surfaceHighlight/50">
                                    <h2 className="text-lg font-bold text-brand-primary">Payment Details</h2>
                                    <p className="text-sm text-brand-secondary">Enter the product information</p>
                                </div>

                                <form onSubmit={handleCreate} className="p-8 space-y-6">
                                    {error && (
                                        <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm">
                                            {error}
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-semibold text-brand-primary mb-2">Product Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. iPhone 15 Pro Max"
                                            value={itemName}
                                            onChange={(e) => setItemName(e.target.value)}
                                            className="w-full px-4 py-3.5 rounded-xl bg-brand-surfaceHighlight border border-brand-border focus:border-brand-action focus:ring-2 focus:ring-brand-action/10 outline-none transition-all"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-brand-primary mb-2">
                                            Description <span className="text-brand-secondary font-normal">(optional)</span>
                                        </label>
                                        <textarea
                                            placeholder="e.g. 256GB, Blue Titanium, Fullset"
                                            value={itemDescription}
                                            onChange={(e) => setItemDescription(e.target.value)}
                                            rows={2}
                                            className="w-full px-4 py-3.5 rounded-xl bg-brand-surfaceHighlight border border-brand-border focus:border-brand-action focus:ring-2 focus:ring-brand-action/10 outline-none transition-all resize-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="col-span-2">
                                            <label className="block text-sm font-semibold text-brand-primary mb-2">Price (IDR)</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary font-semibold">Rp</span>
                                                <input
                                                    type="text"
                                                    placeholder="0"
                                                    value={formatCurrency(amountIdr)}
                                                    onChange={(e) => setAmountIdr(e.target.value.replace(/[^0-9]/g, ''))}
                                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-brand-surfaceHighlight border border-brand-border focus:border-brand-action focus:ring-2 focus:ring-brand-action/10 outline-none transition-all font-semibold text-lg"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-brand-primary mb-2">Token</label>
                                            <select
                                                value={currency}
                                                onChange={(e) => setCurrency(e.target.value)}
                                                className="w-full px-4 py-3.5 rounded-xl bg-brand-surfaceHighlight border border-brand-border focus:border-brand-action focus:ring-2 focus:ring-brand-action/10 outline-none transition-all font-semibold appearance-none cursor-pointer"
                                            >
                                                <option value="USDC">USDC</option>
                                                <option value="IDRX">IDRX</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-brand-primary mb-2">
                                            <Clock size={14} className="inline mr-1.5 text-brand-secondary" />
                                            Protection Period
                                        </label>
                                        <select
                                            value={releaseDuration}
                                            onChange={(e) => setReleaseDuration(parseInt(e.target.value))}
                                            className="w-full px-4 py-3.5 rounded-xl bg-brand-surfaceHighlight border border-brand-border focus:border-brand-action focus:ring-2 focus:ring-brand-action/10 outline-none transition-all appearance-none cursor-pointer"
                                        >
                                            <option value={3600}>1 hour (testing)</option>
                                            <option value={86400}>24 hours (recommended)</option>
                                            <option value={259200}>3 days</option>
                                            <option value={604800}>7 days</option>
                                        </select>
                                        <p className="text-xs text-brand-secondary mt-2">Funds auto-release if no dispute raised</p>
                                    </div>

                                    <Button variant="primary" size="lg" className="w-full mt-4" disabled={isLoading}>
                                        {isLoading ? <><Loader2 className="animate-spin mr-2" size={18} />Creating...</> : 'Create Payment Link'}
                                    </Button>
                                </form>
                            </div>
                        </FadeIn>
                    </div>
                ) : (
                    <FadeIn className="max-w-lg mx-auto">
                        <div className="bg-white rounded-2xl shadow-2xl p-10 text-center">
                            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-100">
                                <Check size={32} className="text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-brand-primary mb-3">Link Created!</h2>
                            <p className="text-brand-secondary mb-8">Share this link with your buyer to receive payment.</p>

                            <div className="bg-brand-surfaceHighlight p-4 rounded-xl flex items-center gap-3 mb-6 border border-brand-border/50">
                                <code className="flex-1 text-sm text-brand-action font-medium truncate bg-white px-3 py-2 rounded-lg">{generatedLink}</code>
                                <button
                                    onClick={handleCopy}
                                    className={`p-3 rounded-lg transition-colors ${copied ? 'bg-green-100 text-green-700' : 'bg-white text-brand-secondary hover:text-brand-primary border border-brand-border/50'}`}
                                >
                                    {copied ? <Check size={18} /> : <Copy size={18} />}
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={() => { setStep('create'); setItemName(''); setAmountIdr(''); setGeneratedLink(''); }}
                                >
                                    Create Another
                                </Button>
                                <Link href="/dashboard">
                                    <Button variant="primary" size="lg" className="w-full">Dashboard</Button>
                                </Link>
                            </div>
                        </div>
                    </FadeIn>
                )}
            </main>
        </div>
    );
}
