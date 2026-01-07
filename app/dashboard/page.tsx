'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Wallet, Clock, CheckCircle, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
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

    // Fetch escrows when connected
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
        if (isConnected && address) {
            fetchEscrows();
        }
    }, [isConnected, address, fetchEscrows]);

    // Handle wallet connection
    const handleConnect = () => {
        const injected = connectors.find(c => c.id === 'injected');
        if (injected) {
            connect({ connector: injected });
        }
    };

    // Format address
    const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    // Format price
    const formatPrice = (amount: string) => `Rp ${parseInt(amount).toLocaleString('id-ID')}`;

    // Format date
    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    // Get time remaining
    const getTimeRemaining = (releaseTime: number | null) => {
        if (!releaseTime) return null;
        const now = Math.floor(Date.now() / 1000);
        const remaining = releaseTime - now;
        if (remaining <= 0) return 'Ready';

        const days = Math.floor(remaining / 86400);
        const hours = Math.floor((remaining % 86400) / 3600);

        if (days > 0) return `${days}d ${hours}h`;
        return `${hours}h`;
    };

    // Status badge colors
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'FUNDED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'RELEASED': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-amber-100 text-amber-700 border-amber-200';
        }
    };

    // Status labels
    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'CREATED':
            case 'WAITING_PAYMENT': return 'Waiting for payment';
            case 'FUNDED': return 'Payment Secured';
            case 'RELEASED': return 'Completed';
            case 'CANCELLED': return 'Cancelled';
            default: return status;
        }
    };

    // Handle release
    const handleRelease = async (id: string) => {
        try {
            await api.releaseFunds(id);
            fetchEscrows();
        } catch (err: any) {
            alert(err.message);
        }
    };

    // Calculate Stats
    const totalRevenue = escrows
        .filter(e => e.status === 'RELEASED')
        .reduce((acc, curr) => acc + parseInt(curr.amountIdr), 0);

    const activeEscrows = escrows.filter(e => e.status === 'FUNDED' || e.status === 'WAITING_PAYMENT').length;
    const completedEscrows = escrows.filter(e => e.status === 'RELEASED').length;

    if (!isConnected) {
        return (
            <div className="min-h-screen bg-brand-surface flex flex-col items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-brand-surfaceHighlight"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-action/5 rounded-full blur-3xl pointer-events-none"></div>

                <Link href="/" className="mb-8 flex items-center gap-3 z-10 group">
                    <div className="relative w-12 h-12 transition-transform duration-300 group-hover:scale-105">
                        <img
                            src="/logo.png"
                            alt="Vouch Logo"
                            className="w-full h-full object-contain drop-shadow-lg"
                        />
                    </div>
                    <span className="text-3xl font-bold tracking-tight text-brand-primary drop-shadow-sm">Vouch</span>
                </Link>

                <FadeIn className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 p-10 text-center relative z-10 ring-1 ring-brand-border/50">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-inner flex items-center justify-center mx-auto mb-8 border border-white/50">
                        <Wallet size={32} className="text-brand-action" />
                    </div>
                    <h1 className="text-3xl font-bold text-brand-primary mb-3">Seller Dashboard</h1>
                    <p className="text-brand-secondary text-base mb-10 leading-relaxed">
                        Connect your wallet to manage your payment links and track revenue.
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
                </FadeIn>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-surface">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-brand-border/50 sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-8 h-8 transition-transform duration-300 group-hover:scale-105">
                            <img
                                src="/logo.png"
                                alt="Vouch Logo"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-brand-primary">Vouch</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <Link href="/create">
                            <Button variant="primary" size="sm" className="shadow-md shadow-brand-action/10">+ Create Link</Button>
                        </Link>
                        <button
                            onClick={() => disconnect()}
                            className="text-xs bg-brand-ice/50 px-3 py-2 rounded-lg text-brand-secondary font-mono border border-brand-action/10 hover:bg-brand-ice transition-colors font-medium"
                        >
                            {address ? formatAddress(address) : '...'}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-6 py-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-brand-primary mb-1">Overview</h1>
                        <p className="text-brand-secondary">Welcome back, here's what's happening today.</p>
                    </div>
                    <button onClick={fetchEscrows} className="text-sm font-medium text-brand-action hover:text-brand-primary transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-brand-ice/50">
                        <Loader2 size={14} className={isLoading ? 'animate-spin' : ''} />
                        Refresh Data
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white rounded-2xl p-6 border border-brand-border shadow-sm">
                        <p className="text-sm font-medium text-brand-secondary mb-2">Total Revenue (Verified)</p>
                        <h3 className="text-3xl font-bold text-brand-primary">{formatPrice(totalRevenue.toString())}</h3>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-brand-border shadow-sm">
                        <p className="text-sm font-medium text-brand-secondary mb-2">Active Links</p>
                        <h3 className="text-3xl font-bold text-brand-action">{activeEscrows}</h3>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-brand-border shadow-sm">
                        <p className="text-sm font-medium text-brand-secondary mb-2">Completed Transactions</p>
                        <h3 className="text-3xl font-bold text-emerald-600">{completedEscrows}</h3>
                    </div>
                </div>

                <div className="mb-6">
                    <h2 className="text-xl font-bold text-brand-primary">Recent Links</h2>
                </div>

                {isLoading && escrows.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-brand-border/50">
                        <Loader2 className="animate-spin mx-auto mb-4 text-brand-action" size={32} />
                        <p className="text-brand-secondary font-medium">Loading your payment links...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-12 bg-red-50 rounded-3xl border border-red-100">
                        <AlertCircle className="mx-auto mb-4 text-red-500" size={32} />
                        <p className="text-red-700 font-medium">{error}</p>
                    </div>
                ) : escrows.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-3xl border border-brand-border border-dashed">
                        <div className="w-16 h-16 bg-brand-surfaceHighlight rounded-full flex items-center justify-center mx-auto mb-4">
                            <Wallet className="text-brand-secondary/50" size={32} />
                        </div>
                        <h2 className="text-lg font-bold text-brand-primary mb-2">No payment links yet</h2>
                        <p className="text-brand-secondary text-sm mb-8 max-w-sm mx-auto">Create your first payment link to start receiving secure payments from your customers.</p>
                        <Link href="/create">
                            <Button variant="primary" className="shadow-lg shadow-brand-action/20">Create First Link</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {escrows.map((escrow) => (
                            <div key={escrow.id} className="bg-white rounded-2xl border border-brand-border p-6 shadow-sm hover:shadow-md transition-all hover:border-brand-action/30 group">
                                <div className="flex items-start justify-between mb-5 pb-5 border-b border-brand-border/50">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-brand-surfaceHighlight rounded-xl flex items-center justify-center flex-shrink-0">
                                            <span className="text-xl">📦</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-brand-primary text-lg group-hover:text-brand-action transition-colors">{escrow.itemName}</h3>
                                            <p className="text-sm text-brand-secondary font-medium mt-1">{formatDate(escrow.createdAt)}</p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] uppercase font-bold px-3 py-1.5 rounded-full border ${getStatusColor(escrow.status)}`}>
                                        {getStatusLabel(escrow.status)}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <p className="text-xs text-brand-secondary uppercase tracking-wider font-semibold mb-1">Amount</p>
                                        <p className="font-bold text-brand-primary text-lg">{formatPrice(escrow.amountIdr)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-brand-secondary uppercase tracking-wider font-semibold mb-1">Currency</p>
                                        <p className="font-bold text-brand-primary">{escrow.currency || 'USDC'}</p>
                                    </div>
                                    {escrow.releaseTime && escrow.status === 'FUNDED' && (
                                        <div className="col-span-2 bg-brand-surfaceHighlight p-3 rounded-lg flex items-center gap-3">
                                            <div className="p-1.5 bg-white rounded-md shadow-sm text-brand-action">
                                                <Clock size={16} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-brand-secondary font-semibold">Time Remaining</p>
                                                <p className="text-sm font-bold text-brand-action">{getTimeRemaining(escrow.releaseTime)}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(`${window.location.origin}/pay/${escrow.id}`);
                                            // Ideally show toast
                                        }}
                                        className="flex-1 py-2.5 rounded-xl border border-brand-border text-sm font-semibold text-brand-secondary hover:bg-brand-surfaceHighlight hover:text-brand-primary transition-colors flex items-center justify-center gap-2"
                                    >
                                        <ExternalLink size={16} />
                                        Copy Link
                                    </button>

                                    {escrow.status === 'FUNDED' ? (
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => handleRelease(escrow.id)}
                                            className="flex-1 py-2.5 shadow-md shadow-brand-action/10"
                                        >
                                            Release Funds
                                        </Button>
                                    ) : (
                                        <Link href={`/pay/${escrow.id}`} className="flex-1">
                                            <Button variant="outline" size="sm" className="w-full py-2.5 bg-brand-surfaceHighlight border-transparent hover:bg-brand-border/50">
                                                View Details
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
