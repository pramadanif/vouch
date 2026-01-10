'use client';

import React, { useState } from 'react';
import { Droplets, Loader2, CheckCircle, Wallet, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useAccount, useConnect, useSwitchChain } from 'wagmi';
import { liskSepolia } from 'wagmi/chains';
import Button from '@/components/Button';
import FadeIn from '@/components/ui/FadeIn';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function FaucetPage() {
    const { address, isConnected, chain } = useAccount();
    const { connect, connectors, isPending: isConnecting } = useConnect();
    const { switchChain } = useSwitchChain();

    const [isLoading, setIsLoading] = useState<'eth' | 'usdc' | 'idrx' | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [isMounted, setIsMounted] = useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    const isWrongNetwork = chain?.id !== liskSepolia.id;

    const handleConnect = () => {
        const injected = connectors.find(c => c.id === 'injected');
        if (injected) connect({ connector: injected });
    };

    const handleSwitchNetwork = () => {
        switchChain({ chainId: liskSepolia.id });
    };

    const requestFaucet = async (type: 'eth' | 'usdc' | 'idrx') => {
        if (!address) return;

        setIsLoading(type);
        setError('');
        setSuccess(null);

        try {
            const response = await fetch(`${API_URL}/api/faucet`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address, type }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Faucet request failed');
            }

            setSuccess(`${data.amount} ${type.toUpperCase()} sent! TX: ${data.txHash?.slice(0, 10)}...`);
        } catch (err: any) {
            setError(err.message || 'Failed to request tokens');
        } finally {
            setIsLoading(null);
        }
    };

    const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    if (!isMounted) return null;

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
                        <span className="text-xl font-bold text-brand-primary">Vouch Faucet</span>
                    </Link>
                    {isConnected && address && (
                        <span className="text-sm px-4 py-2 rounded-lg bg-white border border-brand-border/50 text-brand-secondary font-mono">
                            {formatAddress(address)}
                        </span>
                    )}
                </div>
            </header>

            <main className="relative z-10 max-w-lg mx-auto px-6 py-20">
                <FadeIn>
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-brand-surfaceHeart rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Droplets size={32} className="text-brand-action" />
                        </div>
                        <h1 className="text-3xl font-bold text-brand-primary mb-3">Testnet Faucet</h1>
                        <p className="text-brand-secondary">Get test tokens for Lisk Sepolia</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-brand-border/30">
                        {!isConnected ? (
                            <div className="p-10 text-center">
                                <Wallet size={48} className="mx-auto mb-6 text-brand-action" />
                                <h2 className="text-xl font-bold text-brand-primary mb-3">Connect Wallet</h2>
                                <p className="text-brand-secondary mb-8">Connect your wallet to receive test tokens</p>
                                <Button onClick={handleConnect} variant="primary" size="lg" className="w-full" disabled={isConnecting}>
                                    {isConnecting ? <><Loader2 className="animate-spin mr-2" size={18} />Connecting...</> : 'Connect Wallet'}
                                </Button>
                            </div>
                        ) : isWrongNetwork ? (
                            <div className="p-10 text-center">
                                <AlertCircle size={48} className="mx-auto mb-6 text-amber-500" />
                                <h2 className="text-xl font-bold text-brand-primary mb-3">Wrong Network</h2>
                                <p className="text-brand-secondary mb-8">Please switch to Lisk Sepolia</p>
                                <Button onClick={handleSwitchNetwork} variant="primary" size="lg" className="w-full">
                                    Switch to Lisk Sepolia
                                </Button>
                            </div>
                        ) : (
                            <div className="p-8 space-y-4">
                                {error && (
                                    <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm">
                                        {error}
                                    </div>
                                )}
                                {success && (
                                    <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-sm flex items-center gap-2">
                                        <CheckCircle size={16} />
                                        {success}
                                    </div>
                                )}

                                <div className="bg-brand-surfaceHighlight p-4 rounded-xl border border-brand-border/30">
                                    <p className="text-sm text-brand-secondary mb-1">Your Address</p>
                                    <p className="font-mono text-sm text-brand-primary break-all">{address}</p>
                                </div>

                                {/* ETH Faucet */}
                                <button
                                    onClick={() => requestFaucet('eth')}
                                    disabled={isLoading !== null}
                                    className="w-full p-4 rounded-xl border border-brand-border hover:border-brand-action bg-white hover:bg-brand-surfaceHighlight transition-all flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-800 font-bold border border-gray-200">
                                            Ξ
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-bold text-brand-primary text-sm">ETH (Gas)</h3>
                                            <p className="text-xs text-brand-secondary">0.01 ETH</p>
                                        </div>
                                    </div>
                                    {isLoading === 'eth' ? (
                                        <Loader2 className="animate-spin text-brand-action" size={20} />
                                    ) : (
                                        <span className="text-brand-action text-sm font-semibold group-hover:translate-x-1 transition-transform">Request</span>
                                    )}
                                </button>

                                {/* USDC Faucet */}
                                <button
                                    onClick={() => requestFaucet('usdc')}
                                    disabled={isLoading !== null}
                                    className="w-full p-4 rounded-xl border border-brand-border hover:border-brand-action bg-white hover:bg-brand-surfaceHighlight transition-all flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-bold border border-blue-100">
                                            $
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-bold text-brand-primary text-sm">Mock USDC</h3>
                                            <p className="text-xs text-brand-secondary">1,000 USDC</p>
                                        </div>
                                    </div>
                                    {isLoading === 'usdc' ? (
                                        <Loader2 className="animate-spin text-brand-action" size={20} />
                                    ) : (
                                        <span className="text-brand-action text-sm font-semibold group-hover:translate-x-1 transition-transform">Request</span>
                                    )}
                                </button>

                                {/* IDRX Faucet */}
                                <button
                                    onClick={() => requestFaucet('idrx')}
                                    disabled={isLoading !== null}
                                    className="w-full p-4 rounded-xl border border-brand-border hover:border-brand-action bg-white hover:bg-brand-surfaceHighlight transition-all flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-600 font-bold border border-red-100">
                                            Rp
                                        </div>
                                        <div className="text-left">
                                            <h3 className="font-bold text-brand-primary text-sm">Mock IDRX</h3>
                                            <p className="text-xs text-brand-secondary">100,000 IDRX</p>
                                        </div>
                                    </div>
                                    {isLoading === 'idrx' ? (
                                        <Loader2 className="animate-spin text-brand-action" size={20} />
                                    ) : (
                                        <span className="text-brand-action text-sm font-semibold group-hover:translate-x-1 transition-transform">Request</span>
                                    )}
                                </button>

                                <div className="text-center text-xs text-brand-secondary pt-4 border-t border-brand-border/30 mt-2">
                                    <p>Network: Lisk Sepolia (Chain ID: 4202)</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="text-center mt-8">
                        <Link href="/" className="text-brand-secondary hover:text-brand-primary transition-colors text-sm font-medium">
                            ← Back to Home
                        </Link>
                    </div>
                </FadeIn>
            </main>
        </div>
    );
}
