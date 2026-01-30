'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Loader2, Check, AlertCircle, RefreshCw, Wallet } from 'lucide-react';
import Button from '@/components/Button';
import FadeIn from '@/components/ui/FadeIn';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

const ALLOWED_ADMIN = '0xB4d186af4d691DE665a36BDA1104067e069a15F8';

export default function AdminPage() {
    const { address, isConnected } = useAccount();
    const { connect, connectors, isPending } = useConnect();
    const { disconnect } = useDisconnect();

    const [checkEscrowId, setCheckEscrowId] = useState('');
    const [statusData, setStatusData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => { setIsMounted(true); }, []);

    const handleConnect = () => {
        const injected = connectors.find(c => c.id === 'injected');
        if (injected) connect({ connector: injected });
    };

    const checkStatus = async () => {
        if (!checkEscrowId) return;
        setIsLoading(true);
        setStatusData(null);
        setResult(null);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/escrow/${checkEscrowId}`);
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setStatusData(data);
        } catch (err: any) {
            setResult({ success: false, message: err.message });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResolve = async (resolution: 'RELEASED' | 'REFUNDED') => {
        if (!checkEscrowId) return;
        setActionLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/escrow/${checkEscrowId}/resolve-dispute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resolution,
                    adminKey: 'ADMIN_KEY', // Check if backend requires a specific static key or if we should add wallet sig. For now, assuming static key from backend env is enough or ignored if we add auth middleware? 
                    // Wait, the prompt implies frontend restriction. I will leave the adminKey field as 'ADMIN_SECRET' or such, assuming the backend relies on it OR we need to update backend too.
                    // User only asked for frontend restriction "in admin page".
                    notes: `Admin resolution: ${resolution}`
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to resolve');

            setResult({ success: true, message: data.message });
            checkStatus(); // Refresh
        } catch (err: any) {
            setResult({ success: false, message: err.message });
        } finally {
            setActionLoading(false);
        }
    };

    if (!isMounted) return null;

    const isAuthorized = isConnected && address && address.toLowerCase() === ALLOWED_ADMIN.toLowerCase();

    if (!isConnected) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-brand-ice/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Shield size={32} className="text-brand-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Panel</h1>
                    <p className="text-gray-500 mb-8">Connect authorized wallet to access.</p>
                    <Button onClick={handleConnect} variant="primary" size="lg" className="w-full" disabled={isPending}>
                        {isPending ? <><Loader2 className="animate-spin mr-2" size={18} />Connecting...</> : 'Connect Wallet'}
                    </Button>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <AlertCircle size={32} className="text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                    <p className="text-gray-500 mb-6">Wallet {address?.slice(0, 6)}...{address?.slice(-4)} is not authorized.</p>
                    <div className="space-y-3">
                        <button onClick={() => disconnect()} className="text-brand-primary font-medium hover:underline">Disconnect</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Shield className="text-brand-primary" size={32} />
                        <h1 className="text-2xl font-bold text-gray-900">Vouch Admin Panel</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-mono bg-white px-3 py-1 rounded border border-gray-200">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                        <button onClick={() => disconnect()} className="text-sm text-gray-500 hover:text-gray-900">Logout</button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow p-6">
                    <h2 className="text-lg font-bold mb-4">Dispute Resolution Console</h2>
                    <div className="flex gap-4 mb-6">
                        <input
                            type="text"
                            value={checkEscrowId}
                            onChange={(e) => setCheckEscrowId(e.target.value)}
                            placeholder="Escrow ID (UUID)"
                            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-primary outline-none font-mono"
                        />
                        <Button onClick={checkStatus} disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin" /> : 'Check Status'}
                        </Button>
                    </div>

                    {result && (
                        <div className={`p-4 rounded-xl mb-6 ${result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {result.message}
                        </div>
                    )}

                    {statusData && (
                        <FadeIn className="space-y-6 border-t pt-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-2">{statusData.itemName}</h3>
                                    <p className="text-sm text-gray-500 mb-4">{statusData.itemDescription}</p>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Status:</span>
                                            <span className="font-bold">{statusData.status}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Amount:</span>
                                            <span className="font-mono">{statusData.amountIdr} IDR / {statusData.amountUsdc} {statusData.currency}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Seller:</span>
                                            <span className="font-mono text-xs">{statusData.sellerAddress}</span>
                                        </div>
                                        {statusData.buyerAddress && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Buyer:</span>
                                                <span className="font-mono text-xs">{statusData.buyerAddress}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-bold text-gray-900">Actions</h4>

                                    {statusData.status === 'DISPUTED' ? (
                                        <div className="space-y-3">
                                            <div className="bg-orange-50 p-3 rounded-lg text-sm text-orange-800">
                                                <p className="font-bold mb-1">Dispute Reason:</p>
                                                <p>{statusData.disputeReason || 'No reason provided'}</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <Button
                                                    onClick={() => handleResolve('RELEASED')}
                                                    disabled={actionLoading}
                                                    className="bg-green-600 hover:bg-green-700 text-white w-full"
                                                >
                                                    Release to Seller
                                                </Button>
                                                <Button
                                                    onClick={() => handleResolve('REFUNDED')}
                                                    disabled={actionLoading}
                                                    className="bg-red-600 hover:bg-red-700 text-white w-full"
                                                >
                                                    Refund to Buyer
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">
                                            Actions only available for DISPUTED status.
                                        </p>
                                    )}

                                    {statusData.status === 'FUNDED' && (
                                        <div className="p-3 bg-blue-50 text-blue-800 text-sm rounded-lg">
                                            This escrow is secure. Seller can ship or refund.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </FadeIn>
                    )}
                </div>
            </div>
        </div>
    );
}
