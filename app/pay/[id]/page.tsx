'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Shield, CheckCircle, Lock, Wallet, Loader2, AlertCircle, Clock, CreditCard, Coins } from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';
import { useAccount, useConnect, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import Button from '@/components/Button';
import FadeIn from '@/components/ui/FadeIn';
import { api, EscrowDetails } from '@/lib/api';
import { VOUCH_ESCROW_ADDRESS, MOCK_USDC_ADDRESS, MOCK_IDRX_ADDRESS, VOUCH_ESCROW_ABI, ERC20_ABI } from '@/lib/contracts';

export default function PayLinkPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const escrowId = params.id as string;

    const [escrow, setEscrow] = useState<EscrowDetails | null>(null);
    const [status, setStatus] = useState<'loading' | 'pending' | 'paying' | 'secured' | 'completed' | 'error'>('loading');
    const [error, setError] = useState('');
    const [isSimulating, setIsSimulating] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'fiat' | 'crypto'>('fiat');
    const [cryptoStep, setCryptoStep] = useState<'connect' | 'approve' | 'pay' | 'confirming'>('connect');

    // Wagmi hooks for crypto payment
    const { address, isConnected } = useAccount();
    const { connect, connectors, isPending: isConnecting } = useConnect();
    const { writeContract, data: txHash, isPending: isTxPending } = useWriteContract();
    const { isLoading: isWaitingTx, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({ hash: txHash });

    // Helper to get token details based on currency
    const getTokenDetails = useCallback(() => {
        if (!escrow) return { address: '', symbol: '', decimals: 0, amount: '0' };

        const isIdrx = escrow.currency === 'IDRX';
        return {
            address: isIdrx ? MOCK_IDRX_ADDRESS : MOCK_USDC_ADDRESS,
            symbol: isIdrx ? 'IDRX' : 'USDC',
            decimals: isIdrx ? 18 : 6,
            amount: isIdrx ? escrow.amountIdr : escrow.amountUsdc
        };
    }, [escrow]);

    const token = getTokenDetails();

    // Fetch escrow data
    const fetchEscrow = useCallback(async () => {
        try {
            const data = await api.getEscrow(escrowId);
            setEscrow(data);

            // Set status based on escrow status
            if (data.status === 'RELEASED') {
                setStatus('completed');
            } else if (data.status === 'FUNDED') {
                setStatus('secured');
            } else {
                setStatus('pending');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load payment details');
            setStatus('error');
        }
    }, [escrowId]);

    // Initial load
    useEffect(() => {
        fetchEscrow();
    }, [fetchEscrow]);

    // Check for success redirect
    useEffect(() => {
        if (searchParams.get('status') === 'success') {
            // Poll for status update
            const pollInterval = setInterval(async () => {
                try {
                    const data = await api.getEscrow(escrowId);
                    if (data.status === 'FUNDED' || data.status === 'RELEASED') {
                        setEscrow(data);
                        setStatus(data.status === 'RELEASED' ? 'completed' : 'secured');
                        clearInterval(pollInterval);
                    }
                } catch {
                    // Ignore polling errors
                }
            }, 2000);

            return () => clearInterval(pollInterval);
        }
    }, [searchParams, escrowId]);

    // Handle payment
    const handlePay = async () => {
        setStatus('paying');
        try {
            const result = await api.createInvoice(escrowId);

            if (result.mockMode) {
                // In mock mode, redirect to local mock payment page
                window.location.href = result.invoiceUrl;
            } else {
                // In real mode, redirect to Xendit
                window.location.href = result.invoiceUrl;
            }
        } catch (err: any) {
            setError(err.message || 'Failed to initiate payment');
            setStatus('pending');
        }
    };

    // Simulate payment (for demo)
    const handleSimulatePayment = async () => {
        setIsSimulating(true);
        try {
            await api.simulatePayment(escrowId);
            await fetchEscrow();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSimulating(false);
        }
    };

    // Confirm receipt and release funds to seller
    const handleConfirmReceipt = async () => {
        setIsConfirming(true);
        try {
            await api.confirmReceipt(escrowId);
            setStatus('completed');
            await fetchEscrow();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsConfirming(false);
        }
    };

    // Update crypto step when wallet connects
    useEffect(() => {
        if (isConnected && cryptoStep === 'connect') {
            setCryptoStep('approve');
        }
    }, [isConnected, cryptoStep]);

    // Handle successful transaction
    useEffect(() => {
        if (isTxSuccess && cryptoStep === 'confirming') {
            // Refresh escrow data after successful funding
            fetchEscrow();
        }
    }, [isTxSuccess, cryptoStep, fetchEscrow]);

    // Handle wallet connection for crypto payment
    const handleConnectWallet = () => {
        const injected = connectors.find(c => c.id === 'injected');
        if (injected) {
            connect({ connector: injected });
        }
    };

    // Handle Token approval
    const handleApproveToken = () => {
        if (!escrow) return;

        const amountBigInt = parseUnits(token.amount, token.decimals);

        writeContract({
            address: token.address as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [VOUCH_ESCROW_ADDRESS as `0x${string}`, amountBigInt],
        });
        setCryptoStep('pay');
    };

    // Handle fund escrow with crypto
    const handleFundEscrow = () => {
        if (!escrow?.escrowId) {
            setError('On-chain escrow ID not found. This escrow may not be deployed on-chain.');
            return;
        }

        writeContract({
            address: VOUCH_ESCROW_ADDRESS as `0x${string}`,
            abi: VOUCH_ESCROW_ABI,
            functionName: 'fundEscrow',
            args: [BigInt(escrow.escrowId)],
        });
        setCryptoStep('confirming');
    };

    // Format price
    const formatPrice = (amount: string) => {
        return `Rp ${parseInt(amount).toLocaleString('id-ID')}`;
    };

    // Calculate time remaining
    const getTimeRemaining = () => {
        if (!escrow?.releaseTime) return null;
        const now = Math.floor(Date.now() / 1000);
        const remaining = escrow.releaseTime - now;
        if (remaining <= 0) return 'Ready for release';

        const days = Math.floor(remaining / 86400);
        const hours = Math.floor((remaining % 86400) / 3600);
        const minutes = Math.floor((remaining % 3600) / 60);

        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-brand-surface flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="animate-spin mx-auto mb-4 text-brand-action" size={40} />
                    <p className="text-brand-secondary font-medium">Loading details...</p>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-screen bg-brand-surface flex items-center justify-center p-6">
                <div className="text-center max-w-md bg-white p-8 rounded-3xl border border-red-100 shadow-xl">
                    <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
                    <h1 className="text-xl font-bold text-brand-primary mb-2">Payment Link Not Found</h1>
                    <p className="text-brand-secondary text-sm">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-surface flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute inset-0 bg-brand-surfaceHighlight"></div>
            <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-brand-ice/30 to-transparent"></div>

            <div className="mb-8 flex items-center gap-3 relative z-10">
                <div className="relative w-10 h-10">
                    <img src="/logo.png" alt="Vouch" className="w-full h-full object-contain" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-brand-primary">Vouch</span>
            </div>

            <FadeIn className="w-full max-w-lg bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 overflow-hidden relative z-10 ring-1 ring-brand-border/40">
                {/* Header */}
                <div className="bg-gradient-to-br from-brand-primary to-brand-action p-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 mb-4 shadow-sm">
                            <Shield size={14} className="text-emerald-400" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Escrow Secured</span>
                        </div>
                        <h1 className="text-brand-ice font-medium text-sm uppercase tracking-wide mb-1 opacity-90">Payment Request</h1>
                        <h2 className="text-white font-bold text-3xl mb-2 tracking-tight">{escrow?.itemName || 'Product'}</h2>
                        {escrow?.itemDescription && (
                            <p className="text-white/80 text-sm mt-2 max-w-xs mx-auto line-clamp-2 leading-relaxed">
                                {escrow.itemDescription}
                            </p>
                        )}
                    </div>
                </div>

                <div className="p-8">
                    {(status === 'pending' || status === 'paying') && escrow && (
                        <>
                            <div className="flex justify-between items-center mb-8 pb-6 border-b border-brand-border/50">
                                <span className="text-brand-secondary font-medium">Total Amount</span>
                                <span className="text-3xl font-bold text-brand-primary tracking-tight">{formatPrice(escrow.amountIdr)}</span>
                            </div>

                            <div className="space-y-4 mb-8">
                                <h3 className="text-xs font-bold text-brand-secondary uppercase tracking-wider ml-1">Select Payment Method</h3>

                                {/* Fiat Payment Option */}
                                <div
                                    onClick={() => setPaymentMethod('fiat')}
                                    className={`relative p-5 rounded-2xl flex items-center gap-4 cursor-pointer transition-all border ${paymentMethod === 'fiat'
                                        ? 'bg-white border-brand-action ring-1 ring-brand-action shadow-md'
                                        : 'bg-white/50 border-brand-border/60 hover:border-brand-action/50 hover:bg-white'
                                        }`}
                                >
                                    <div className={`p-3 rounded-xl ${paymentMethod === 'fiat' ? 'bg-brand-ice/30 text-brand-action' : 'bg-brand-surfaceHighlight text-brand-secondary'}`}>
                                        <CreditCard size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-brand-primary text-base">QRIS / Bank Transfer</p>
                                        <p className="text-xs text-brand-secondary font-medium mt-0.5">Instant verification via Xendit</p>
                                    </div>
                                    {paymentMethod === 'fiat' && (
                                        <div className="text-brand-action">
                                            <CheckCircle size={20} fill="currentColor" className="text-white" />
                                        </div>
                                    )}
                                </div>

                                {/* Crypto Payment Option */}
                                <div
                                    onClick={() => setPaymentMethod('crypto')}
                                    className={`relative p-5 rounded-2xl flex items-center gap-4 cursor-pointer transition-all border ${paymentMethod === 'crypto'
                                        ? 'bg-white border-purple-500 ring-1 ring-purple-500 shadow-md'
                                        : 'bg-white/50 border-brand-border/60 hover:border-purple-500/50 hover:bg-white'
                                        }`}
                                >
                                    <div className={`p-3 rounded-xl ${paymentMethod === 'crypto' ? 'bg-purple-50 text-purple-600' : 'bg-brand-surfaceHighlight text-brand-secondary'}`}>
                                        <Coins size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-brand-primary text-base">Pay with Crypto</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs font-bold text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded">{token.symbol}</span>
                                            <span className="text-xs text-brand-secondary font-medium">on Lisk Sepolia</span>
                                        </div>
                                    </div>
                                    {paymentMethod === 'crypto' && (
                                        <div className="text-purple-600">
                                            <CheckCircle size={20} fill="currentColor" className="text-white" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Fiat Payment Flow */}
                            {paymentMethod === 'fiat' && (
                                <div className="animate-fade-up">
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        className="w-full shadow-xl shadow-brand-action/20 mb-4 py-4 text-base font-bold"
                                        onClick={handlePay}
                                    >
                                        {status === 'paying' ? (
                                            <>
                                                <Loader2 className="animate-spin mr-2" size={20} />
                                                Processing...
                                            </>
                                        ) : (
                                            'Pay Now'
                                        )}
                                    </Button>

                                    {/* Demo simulate button */}
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="w-full mb-4 border-brand-border/50 text-brand-secondary hover:text-brand-primary hover:bg-white/50"
                                        onClick={handleSimulatePayment}
                                        disabled={isSimulating}
                                    >
                                        {isSimulating ? (
                                            <>
                                                <Loader2 className="animate-spin mr-2" size={20} />
                                                Simulating...
                                            </>
                                        ) : (
                                            '🎭 Simulate Payment (Demo)'
                                        )}
                                    </Button>
                                </div>
                            )}

                            {/* Crypto Payment Flow */}
                            {paymentMethod === 'crypto' && (
                                <div className="space-y-5 animate-fade-up bg-brand-surfaceHighlight/50 p-5 rounded-2xl border border-brand-border/50">
                                    {/* Step indicator */}
                                    <div className="flex items-center justify-between text-xs font-medium text-brand-secondary mb-2 px-2">
                                        <span>Connect</span>
                                        <span>Approve</span>
                                        <span>Pay</span>
                                    </div>
                                    <div className="flex items-center gap-1 h-1.5 bg-brand-border/30 rounded-full overflow-hidden mb-6">
                                        <div className={`h-full transition-all duration-500 ${isConnected ? 'w-full bg-purple-500' : 'w-0 bg-transparent'}`}></div>
                                        <div className={`h-full transition-all duration-500 ${cryptoStep === 'pay' || cryptoStep === 'confirming' ? 'w-full bg-purple-500' : 'w-0 bg-transparent'}`}></div>
                                        <div className={`h-full transition-all duration-500 ${cryptoStep === 'confirming' ? 'w-full bg-purple-500' : 'w-0 bg-transparent'}`}></div>
                                    </div>

                                    {/* Connect Wallet */}
                                    {!isConnected && (
                                        <Button
                                            variant="primary"
                                            size="lg"
                                            className="w-full bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/20"
                                            onClick={handleConnectWallet}
                                            disabled={isConnecting}
                                        >
                                            {isConnecting ? (
                                                <>
                                                    <Loader2 className="animate-spin mr-2" size={20} />
                                                    Connecting...
                                                </>
                                            ) : (
                                                <>
                                                    <Wallet size={20} className="mr-2" />
                                                    Connect Wallet
                                                </>
                                            )}
                                        </Button>
                                    )}

                                    {/* Approve Token */}
                                    {isConnected && cryptoStep === 'approve' && (
                                        <Button
                                            variant="primary"
                                            size="lg"
                                            className="w-full bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/20"
                                            onClick={handleApproveToken}
                                            disabled={isTxPending || isWaitingTx}
                                        >
                                            {isTxPending || isWaitingTx ? (
                                                <>
                                                    <Loader2 className="animate-spin mr-2" size={20} />
                                                    Approving...
                                                </>
                                            ) : (
                                                `Approve ${token.amount} ${token.symbol}`
                                            )}
                                        </Button>
                                    )}

                                    {/* Fund Escrow */}
                                    {isConnected && cryptoStep === 'pay' && (
                                        <Button
                                            variant="primary"
                                            size="lg"
                                            className="w-full bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/20"
                                            onClick={handleFundEscrow}
                                            disabled={isTxPending || isWaitingTx}
                                        >
                                            {isTxPending || isWaitingTx ? (
                                                <>
                                                    <Loader2 className="animate-spin mr-2" size={20} />
                                                    Confirming...
                                                </>
                                            ) : (
                                                `Pay ${token.amount} ${token.symbol}`
                                            )}
                                        </Button>
                                    )}

                                    {/* Transaction pending */}
                                    {cryptoStep === 'confirming' && (
                                        <div className="text-center py-4">
                                            <Loader2 className="animate-spin mx-auto mb-2 text-purple-600" size={32} />
                                            <p className="text-sm text-brand-secondary font-medium">Waiting for confirmation...</p>
                                        </div>
                                    )}

                                    {isConnected && (
                                        <div className="flex items-center justify-center gap-2 text-xs text-brand-secondary">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                            Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                                        </div>
                                    )}
                                </div>
                            )}

                            <p className="text-center text-xs text-brand-secondary/70 flex items-center justify-center gap-1.5 mt-6 font-medium">
                                <Lock size={12} />
                                Funds are held in smart contract until delivery.
                            </p>
                        </>
                    )}

                    {status === 'paying' && (
                        <div className="text-center py-12">
                            <Loader2 className="animate-spin mx-auto mb-6 text-brand-action" size={48} />
                            <h3 className="text-lg font-bold text-brand-primary mb-2">Redirecting to Payment...</h3>
                            <p className="text-brand-secondary text-sm">Please complete the payment on the secure page.</p>
                        </div>
                    )}

                    {(status === 'secured' || status === 'completed') && escrow && (
                        <div className="text-center py-6">
                            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-fade-up border border-green-100 shadow-inner">
                                <div className="bg-green-500 text-white rounded-full p-4 shadow-lg shadow-green-500/30">
                                    <CheckCircle size={40} className="text-white" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-brand-primary mb-3">
                                {status === 'completed' ? 'Transaction Complete!' : 'Payment Secured!'}
                            </h2>
                            <p className="text-brand-secondary text-base mb-8 mx-auto max-w-[280px] leading-relaxed">
                                {status === 'completed'
                                    ? `Funds have been released to the seller. Thank you for using Vouch!`
                                    : `Your funds are securely held. Confirm receipt below once your item arrives.`
                                }
                            </p>

                            {/* Buyer Confirmation Button - Only show when secured (not completed) */}
                            {status === 'secured' && (
                                <div className="bg-brand-surfaceHighlight/50 p-6 rounded-2xl border border-brand-border/60 mb-6">
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        className="w-full mb-4 shadow-xl shadow-green-500/20 bg-emerald-600 hover:bg-emerald-700 border-emerald-500"
                                        onClick={handleConfirmReceipt}
                                        disabled={isConfirming}
                                    >
                                        {isConfirming ? (
                                            <>
                                                <Loader2 className="animate-spin mr-2" size={20} />
                                                Confirming...
                                            </>
                                        ) : (
                                            '✅ Confirm Item Received'
                                        )}
                                    </Button>
                                    <p className="text-xs text-brand-secondary">
                                        Clicking this will release {formatPrice(escrow.amountIdr)} to the seller.
                                    </p>
                                </div>
                            )}

                            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-brand-border/60 mb-6 shadow-sm">
                                <span className="text-xs font-bold text-brand-secondary uppercase">Status</span>
                                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${status === 'completed'
                                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                                    : 'text-brand-action bg-brand-ice/50 border-brand-action/20'
                                    }`}>
                                    {status === 'completed' ? 'RELEASED' : 'SECURED'}
                                </span>
                            </div>

                            {status === 'secured' && (
                                <div className="flex items-center justify-center gap-2 text-xs text-brand-secondary/80 font-medium bg-brand-surfaceHighlight py-2 rounded-lg">
                                    <Clock size={12} />
                                    Auto-release in: <span className="text-brand-action font-bold">{getTimeRemaining()}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Brand */}
                <div className="bg-brand-surfaceHighlight/50 py-4 text-center border-t border-brand-border/50 backdrop-blur-sm">
                    <p className="text-[10px] text-brand-secondary font-medium flex items-center justify-center gap-1">
                        <Shield size={10} /> Secured by <span className="font-bold text-brand-primary">Vouch</span> on Lisk
                    </p>
                </div>
            </FadeIn>
        </div>
    );
}
