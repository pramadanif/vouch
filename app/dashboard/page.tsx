'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Wallet, Clock, CheckCircle, AlertCircle, Loader2, ExternalLink, Copy, Plus } from 'lucide-react';
import Link from 'next/link';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import Button from '@/components/Button';
import FadeIn from '@/components/ui/FadeIn';
import { api, SellerEscrowsResponse } from '@/lib/api';

export default function DashboardPage() {
    const { address, isConnected } = useAccount();
    const { connect, connectors, isPending } = useConnect();
    const { disconnect } = useDisconnect();

    const [escrows, setEscrows] = useState<SellerEscrowsResponse['escrows']>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [revenueCurrency, setRevenueCurrency] = useState('IDR');

    const fetchEscrows = useCallback(async () => {
        if (!address) return;
        setIsLoading(true);
        try {
            const data = await api.getSellerEscrows(address);
            setEscrows(data.escrows);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [address]);

    useEffect(() => {
        setIsMounted(true);
        if (isConnected && address) fetchEscrows();
    }, [isConnected, address, fetchEscrows]);

    const handleConnect = () => {
        const injected = connectors.find(c => c.id === 'injected');
        if (injected) connect({ connector: injected });
    };

    const currencyConfig: Record<string, { symbol: string; name: string; usdcRate: number; flag: string }> = {
        IDR: { symbol: 'Rp', name: 'Indonesian Rupiah', usdcRate: 16800, flag: '🇮🇩' },
        SGD: { symbol: 'S$', name: 'Singapore Dollar', usdcRate: 1.29, flag: '🇸🇬' },
        MYR: { symbol: 'RM', name: 'Malaysian Ringgit', usdcRate: 4.07, flag: '🇲🇾' },
        THB: { symbol: '฿', name: 'Thai Baht', usdcRate: 31.4, flag: '🇹🇭' },
        PHP: { symbol: '₱', name: 'Philippine Peso', usdcRate: 59.2, flag: '🇵🇭' },
        VND: { symbol: '₫', name: 'Vietnamese Dong', usdcRate: 26200, flag: '🇻🇳' },
    };

    const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    const formatPrice = (amount: string | number, currency: string = 'IDR') => {
        const symbol = currencyConfig[currency]?.symbol || 'Rp';
        const num = typeof amount === 'string' ? parseFloat(amount) : amount;
        return `${symbol} ${num.toLocaleString('id-ID', { maximumFractionDigits: 2 })}`;
    };

    // Safe date formatting - handles both seconds and milliseconds timestamps
    const formatDate = (timestamp: number | null | undefined) => {
        if (!timestamp) return '-';
        // If timestamp is in seconds (< 100 billion, roughly year 5138), multiply by 1000
        const ms = timestamp < 100000000000 ? timestamp * 1000 : timestamp;
        const date = new Date(ms);
        if (isNaN(date.getTime())) return '-';
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    };

    // Enhanced countdown with more detail
    const getTimeRemaining = (releaseTime: number | null) => {
        if (!releaseTime) return null;
        const now = Math.floor(Date.now() / 1000);
        const remaining = releaseTime - now;

        if (remaining <= 0) return { text: 'Ready to release', isReady: true };

        const days = Math.floor(remaining / 86400);
        const hours = Math.floor((remaining % 86400) / 3600);
        const minutes = Math.floor((remaining % 3600) / 60);

        let text = '';
        if (days > 0) text = `${days}d ${hours}h remaining`;
        else if (hours > 0) text = `${hours}h ${minutes}m remaining`;
        else text = `${minutes}m remaining`;

        return { text, isReady: false };
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'FUNDED': return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Secured' };
            case 'RELEASED': return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Complete' };
            case 'CANCELLED': return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Cancelled' };
            default: return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Pending' };
        }
    };

    const handleRelease = async (id: string) => {
        try { await api.releaseFunds(id); fetchEscrows(); }
        catch (err: any) { alert(err.message); }
    };

    const handleCopyLink = (id: string) => {
        navigator.clipboard.writeText(`${window.location.origin}/pay/${id}`);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Stats
    // Stats
    const totalRevenue = useMemo(() => {
        return escrows
            .filter(e => e.status === 'RELEASED')
            .reduce((total, escrow) => {
                const amount = parseFloat(escrow.amountIdr);
                const currency = escrow.fiatCurrency || 'IDR';

                // If same currency, just add
                if (currency === revenueCurrency) return total + amount;

                // Convert to USDC first (Rate: 1 USDC = X Currency)
                // So Amount (USD) = Amount (Currency) / Rate
                // Safety check: avoid division by zero
                const rateToUsdc = currencyConfig[currency]?.usdcRate || 16800;
                const amountInUsdc = amount / (rateToUsdc || 1);

                // Convert to Target
                const rateFromUsdc = currencyConfig[revenueCurrency]?.usdcRate || 16800;
                return total + (amountInUsdc * rateFromUsdc);
            }, 0);
    }, [escrows, revenueCurrency]);
    const activeEscrows = escrows.filter(e => e.status === 'FUNDED' || e.status === 'WAITING_PAYMENT').length;
    const completedEscrows = escrows.filter(e => e.status === 'RELEASED').length;

    if (!isMounted) return null;

    if (!isConnected) {
        return (
            <div className="min-h-screen relative overflow-hidden">
                {/* Rich Background like MyBCA */}
                <div className="absolute inset-0 bg-brand-surfaceHighlight"></div>

                {/* Abstract Blue Shapes */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-[1000px] h-[1000px] rounded-full bg-brand-ice/60 blur-3xl -translate-y-1/2 translate-x-1/4 mix-blend-multiply"></div>
                    <div className="absolute bottom-0 left-0 w-[800px] h-[800px] rounded-full bg-blue-100/50 blur-3xl translate-y-1/2 -translate-x-1/4 mix-blend-multiply"></div>
                </div>

                <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
                    <Link href="/" className="mb-8 flex items-center gap-3">
                        <img src="/logo.png" alt="Vouch" className="w-12 h-12 object-contain" />
                        <span className="text-3xl font-bold text-brand-primary">Vouch</span>
                    </Link>

                    <FadeIn className="w-full max-w-md">
                        <div className="bg-white rounded-2xl shadow-2xl p-10 text-center">
                            <div className="w-16 h-16 bg-brand-ice/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Wallet size={32} className="text-brand-action" />
                            </div>
                            <h1 className="text-2xl font-bold text-brand-primary mb-3">Seller Dashboard</h1>
                            <p className="text-brand-secondary mb-8">Connect your wallet to manage payment links and track your revenue.</p>
                            <Button onClick={handleConnect} variant="primary" size="lg" className="w-full" disabled={isPending}>
                                {isPending ? <><Loader2 className="animate-spin mr-2" size={18} />Connecting...</> : 'Connect Wallet'}
                            </Button>
                        </div>
                    </FadeIn>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Rich Background */}
            <div className="absolute inset-0 bg-brand-surfaceHighlight"></div>
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[1000px] h-[1000px] rounded-full bg-brand-ice/60 blur-3xl -translate-y-1/2 translate-x-1/4 mix-blend-multiply"></div>
                <div className="absolute bottom-0 left-0 w-[800px] h-[800px] rounded-full bg-blue-100/50 blur-3xl translate-y-1/2 -translate-x-1/4 mix-blend-multiply"></div>
            </div>

            {/* Header */}
            <header className="relative z-20 border-b border-brand-border/50 bg-white/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <img src="/logo.png" alt="Vouch" className="w-9 h-9 object-contain" />
                        <span className="text-xl font-bold text-brand-primary">Vouch</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <Link href="/create">
                            <Button variant="outline" size="sm"><Plus size={16} className="mr-1" />New Link</Button>
                        </Link>
                        <button
                            onClick={() => disconnect()}
                            className="text-sm px-4 py-2 rounded-lg bg-white border border-brand-border/50 text-brand-secondary font-mono hover:bg-brand-surfaceHighlight transition-colors shadow-sm"
                        >
                            {address ? formatAddress(address) : '...'}
                        </button>
                    </div>
                </div>
            </header>

            <main className="relative z-10 max-w-7xl mx-auto px-6 py-10">
                {/* Welcome & Stats */}
                <div className="mb-10">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold mb-2 text-brand-primary">Dashboard</h1>
                            <p className="text-brand-secondary">Welcome back! Here's your business at a glance.</p>
                        </div>
                        <button onClick={fetchEscrows} className="text-sm font-medium text-brand-secondary hover:text-brand-primary transition-colors flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-brand-surfaceHighlight border border-brand-border/50 shadow-sm">
                            <Loader2 size={14} className={isLoading ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
                        <div className="bg-white rounded-2xl p-6 shadow-lg">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-brand-secondary">Total Revenue</p>
                                <select
                                    value={revenueCurrency}
                                    onChange={(e) => setRevenueCurrency(e.target.value)}
                                    className="text-xs bg-brand-surfaceHighlight border border-brand-border/50 rounded-lg px-2 py-1 outline-none focus:border-brand-action cursor-pointer font-medium text-brand-primary"
                                >
                                    {Object.keys(currencyConfig).map(curr => (
                                        <option key={curr} value={curr}>{curr}</option>
                                    ))}
                                </select>
                            </div>
                            <h3 className="text-3xl font-bold text-brand-primary">{formatPrice(totalRevenue, revenueCurrency)}</h3>
                            <p className="text-xs text-brand-secondary mt-2">From completed transactions</p>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-lg">
                            <p className="text-sm font-medium text-brand-secondary mb-2">Active Links</p>
                            <h3 className="text-3xl font-bold text-brand-action">{activeEscrows}</h3>
                            <p className="text-xs text-brand-secondary mt-2">Awaiting payment or confirmation</p>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-lg">
                            <p className="text-sm font-medium text-brand-secondary mb-2">Completed</p>
                            <h3 className="text-3xl font-bold text-emerald-600">{completedEscrows}</h3>
                            <p className="text-xs text-brand-secondary mt-2">Successfully released</p>
                        </div>
                    </div>
                </div>

                {/* Links List */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="px-8 py-6 border-b border-brand-border/30 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-brand-primary">Your Payment Links</h2>
                        <span className="text-sm text-brand-secondary">{escrows.length} total</span>
                    </div>

                    {isLoading && escrows.length === 0 ? (
                        <div className="text-center py-20">
                            <Loader2 className="animate-spin mx-auto mb-4 text-brand-action" size={36} />
                            <p className="text-brand-secondary font-medium">Loading your payment links...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <AlertCircle className="mx-auto mb-4 text-red-500" size={36} />
                            <p className="text-red-700 font-medium">{error}</p>
                        </div>
                    ) : escrows.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-20 h-20 bg-brand-surfaceHighlight rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Wallet className="text-brand-secondary/40" size={40} />
                            </div>
                            <h2 className="text-xl font-bold text-brand-primary mb-3">No payment links yet</h2>
                            <p className="text-brand-secondary mb-8 max-w-sm mx-auto">Create your first link to start receiving secure payments.</p>
                            <Link href="/create">
                                <Button variant="primary" size="lg"><Plus size={18} className="mr-2" />Create First Link</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-brand-border/30">
                            {escrows.map((escrow) => {
                                const statusConfig = getStatusConfig(escrow.status);
                                return (
                                    <div key={escrow.id} className="px-8 py-6 hover:bg-brand-surfaceHighlight/50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-brand-surfaceHighlight rounded-xl flex items-center justify-center text-brand-action font-bold">
                                                    {escrow.itemName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-brand-primary">{escrow.itemName}</h3>
                                                    <p className="text-sm text-brand-secondary">{formatDate(escrow.createdAt)} · {escrow.fiatCurrency || 'IDR'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <p className="font-bold text-brand-primary">{formatPrice(escrow.amountIdr, escrow.fiatCurrency)}</p>
                                                    {escrow.releaseTime && escrow.status === 'FUNDED' && (() => {
                                                        const timer = getTimeRemaining(escrow.releaseTime);
                                                        if (!timer) return null;
                                                        return (
                                                            <p className={`text-xs flex items-center gap-1 justify-end ${timer.isReady ? 'text-emerald-600 font-semibold' : 'text-brand-secondary'}`}>
                                                                <Clock size={12} />
                                                                {timer.text}
                                                            </p>
                                                        );
                                                    })()}
                                                </div>
                                                <span className={`text-xs uppercase font-bold px-3 py-1.5 rounded-full ${statusConfig.bg} ${statusConfig.text}`}>
                                                    {statusConfig.label}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleCopyLink(escrow.id)}
                                                        className={`p-2 rounded-lg transition-colors ${copiedId === escrow.id ? 'bg-emerald-50 text-emerald-700' : 'bg-brand-surfaceHighlight text-brand-secondary hover:text-brand-primary'}`}
                                                    >
                                                        {copiedId === escrow.id ? <CheckCircle size={18} /> : <Copy size={18} />}
                                                    </button>
                                                    <Link href={`/pay/${escrow.id}`}>
                                                        <button className="p-2 rounded-lg bg-brand-surfaceHighlight text-brand-secondary hover:text-brand-primary transition-colors">
                                                            <ExternalLink size={18} />
                                                        </button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
