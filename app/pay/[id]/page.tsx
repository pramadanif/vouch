'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Check, Lock, Loader2, Clock, ArrowRight, CreditCard, QrCode, Building2, Wallet, Copy, CheckCircle2 } from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';
import { useAccount, useConnect, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { QRCodeSVG } from 'qrcode.react';
import Button from '@/components/Button';
import FadeIn from '@/components/ui/FadeIn';
import { api, EscrowDetails, QRISPaymentResponse, VAPaymentResponse } from '@/lib/api';
import { VOUCH_ESCROW_ADDRESS, MOCK_USDC_ADDRESS, MOCK_IDRX_ADDRESS, VOUCH_ESCROW_ABI, ERC20_ABI } from '@/lib/contracts';

type PaymentMethodType = 'qris' | 'va' | 'ewallet' | 'crypto';

interface Bank {
    code: string;
    name: string;
    logo?: string;
}

const BANKS: Bank[] = [
    { code: 'BCA', name: 'BCA' },
    { code: 'BNI', name: 'BNI' },
    { code: 'BRI', name: 'BRI' },
    { code: 'MANDIRI', name: 'Mandiri' },
    { code: 'PERMATA', name: 'Permata' },
];

export default function PayLinkPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const escrowId = params.id as string;

    // Core state
    const [escrow, setEscrow] = useState<EscrowDetails | null>(null);
    const [status, setStatus] = useState<'loading' | 'pending' | 'paying' | 'secured' | 'completed' | 'error'>('loading');
    const [error, setError] = useState('');
    const [isMounted, setIsMounted] = useState(false);

    // Payment state
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('qris');
    const [selectedBank, setSelectedBank] = useState<string>('BCA');
    const [isCreatingPayment, setIsCreatingPayment] = useState(false);
    const [copied, setCopied] = useState(false);

    // Payment data
    const [qrisPayment, setQrisPayment] = useState<QRISPaymentResponse | null>(null);
    const [vaPayment, setVaPayment] = useState<VAPaymentResponse | null>(null);

    // Confirmation state
    const [isConfirming, setIsConfirming] = useState(false);

    // Crypto state
    const [cryptoStep, setCryptoStep] = useState<'connect' | 'approve' | 'pay' | 'confirming'>('connect');
    const { address, isConnected } = useAccount();
    const { connect, connectors, isPending: isConnecting } = useConnect();
    const { writeContract, data: txHash, isPending: isTxPending } = useWriteContract();
    const { isLoading: isWaitingTx, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({ hash: txHash });

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

    // Fetch escrow details
    const fetchEscrow = useCallback(async () => {
        try {
            const data = await api.getEscrow(escrowId);
            setEscrow(data);
            if (data.status === 'RELEASED') setStatus('completed');
            else if (data.status === 'FUNDED') setStatus('secured');
            else setStatus('pending');
        } catch (err: any) {
            setError(err.message || 'Failed to load');
            setStatus('error');
        }
    }, [escrowId]);

    useEffect(() => { setIsMounted(true); fetchEscrow(); }, [fetchEscrow]);

    // Poll for payment completion
    useEffect(() => {
        if (status !== 'paying' || !qrisPayment) return;

        const poll = setInterval(async () => {
            try {
                const data = await api.getEscrow(escrowId);
                if (data.status === 'FUNDED' || data.status === 'RELEASED') {
                    setEscrow(data);
                    setStatus(data.status === 'RELEASED' ? 'completed' : 'secured');
                    clearInterval(poll);
                }
            } catch { }
        }, 3000);

        return () => clearInterval(poll);
    }, [status, qrisPayment, escrowId]);

    // Handle URL status param
    useEffect(() => {
        if (searchParams.get('status') === 'success') {
            const poll = setInterval(async () => {
                try {
                    const data = await api.getEscrow(escrowId);
                    if (data.status === 'FUNDED' || data.status === 'RELEASED') {
                        setEscrow(data);
                        setStatus(data.status === 'RELEASED' ? 'completed' : 'secured');
                        clearInterval(poll);
                    }
                } catch { }
            }, 2000);
            return () => clearInterval(poll);
        }
    }, [searchParams, escrowId]);

    // ============ Payment Handlers ============

    const handleCreateQRIS = async () => {
        setIsCreatingPayment(true);
        setError('');
        try {
            const result = await api.createQRISPayment(escrowId);
            setQrisPayment(result);
            setStatus('paying');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsCreatingPayment(false);
        }
    };

    const handleCreateVA = async () => {
        setIsCreatingPayment(true);
        setError('');
        try {
            const result = await api.createVAPayment(escrowId, selectedBank);
            setVaPayment(result);
            setStatus('paying');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsCreatingPayment(false);
        }
    };

    const handleSimulatePayment = async () => {
        setIsCreatingPayment(true);
        try {
            await api.simulatePayment(escrowId);
            await fetchEscrow();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsCreatingPayment(false);
        }
    };

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

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Crypto handlers
    useEffect(() => { if (isMounted && isConnected && cryptoStep === 'connect') setCryptoStep('approve'); }, [isMounted, isConnected, cryptoStep]);
    useEffect(() => { if (isTxSuccess && cryptoStep === 'confirming') fetchEscrow(); }, [isTxSuccess, cryptoStep, fetchEscrow]);

    const handleConnectWallet = () => { const inj = connectors.find(c => c.id === 'injected'); if (inj) connect({ connector: inj }); };
    const handleApproveToken = () => { if (!escrow) return; writeContract({ address: token.address as `0x${string}`, abi: ERC20_ABI, functionName: 'approve', args: [VOUCH_ESCROW_ADDRESS as `0x${string}`, parseUnits(token.amount, token.decimals)] }); setCryptoStep('pay'); };
    const handleFundEscrow = () => { if (!escrow?.escrowId) { setError('Escrow ID not found'); return; } writeContract({ address: VOUCH_ESCROW_ADDRESS as `0x${string}`, abi: VOUCH_ESCROW_ABI, functionName: 'fundEscrow', args: [BigInt(escrow.escrowId)] }); setCryptoStep('confirming'); };

    // ============ Helpers ============

    const formatPrice = (amount: string) => `Rp ${parseInt(amount).toLocaleString('id-ID')}`;
    const getTimeRemaining = () => {
        if (!escrow?.releaseTime) return null;
        const rem = escrow.releaseTime - Math.floor(Date.now() / 1000);
        if (rem <= 0) return 'Ready';
        const d = Math.floor(rem / 86400), h = Math.floor((rem % 86400) / 3600);
        return d > 0 ? `${d}d ${h}h` : `${h}h`;
    };

    // ============ Render ============

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-brand-primary via-brand-action to-brand-accent flex items-center justify-center">
                <div className="text-center text-white">
                    <Loader2 className="animate-spin mx-auto mb-4" size={40} />
                    <p className="text-white/70">Loading...</p>
                </div>
            </div>
        );
    }

    if (status === 'error' && !escrow) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-brand-primary via-brand-action to-brand-accent flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl p-10 text-center max-w-md shadow-2xl">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-3xl text-red-500 font-bold">!</span>
                    </div>
                    <h1 className="text-xl font-bold text-brand-primary mb-2">Link Not Found</h1>
                    <p className="text-brand-secondary text-sm">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-brand-surfaceHighlight"></div>
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[1000px] h-[1000px] rounded-full bg-brand-ice/60 blur-3xl -translate-y-1/2 translate-x-1/4 mix-blend-multiply"></div>
                <div className="absolute bottom-0 left-0 w-[800px] h-[800px] rounded-full bg-blue-100/50 blur-3xl translate-y-1/2 -translate-x-1/4 mix-blend-multiply"></div>
            </div>

            {/* Header */}
            <header className="relative z-20 border-b border-brand-border/50 bg-white/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Vouch" className="w-9 h-9 object-contain" />
                        <span className="text-xl font-bold text-brand-primary">Vouch</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-brand-action bg-brand-ice/20 px-3 py-1.5 rounded-full border border-brand-ice/50">
                        <Lock size={14} />
                        <span className="font-semibold">Escrow Protected</span>
                    </div>
                </div>
            </header>

            <main className="relative z-10 max-w-7xl mx-auto px-6 py-16">
                {/* Pending Payment - Show Payment Options OR Payment Details */}
                {(status === 'pending' || status === 'paying') && escrow && (
                    <div className="grid lg:grid-cols-2 gap-12 items-start">
                        {/* Left - Product Info */}
                        <FadeIn className="text-brand-primary lg:sticky lg:top-24">
                            <div className="mb-8">
                                <p className="text-brand-action font-bold text-sm uppercase tracking-wider mb-2">Payment Request</p>
                                <h1 className="text-3xl xl:text-4xl font-bold mb-4 text-brand-primary">{escrow.itemName}</h1>
                                {escrow.itemDescription && (
                                    <p className="text-brand-secondary text-lg leading-relaxed">{escrow.itemDescription}</p>
                                )}
                            </div>

                            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-brand-border/50 shadow-sm mb-6">
                                <p className="text-brand-secondary text-sm mb-2 font-medium">Total Amount</p>
                                <p className="text-4xl font-bold text-brand-primary mb-4">{formatPrice(escrow.amountIdr)}</p>
                            </div>

                            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-brand-border/50 shadow-sm flex items-center gap-4">
                                <div className="w-10 h-10 bg-brand-ice/30 rounded-lg flex items-center justify-center text-brand-action">
                                    <Lock size={18} />
                                </div>
                                <div>
                                    <p className="font-bold text-brand-primary text-sm">Escrow Protected</p>
                                    <p className="text-xs text-brand-secondary">Funds held securely until you confirm receipt</p>
                                </div>
                            </div>
                        </FadeIn>

                        {/* Right - Payment Methods */}
                        <FadeIn>
                            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                                {/* Show Payment Selection OR Payment Details */}
                                {status === 'pending' && !qrisPayment && !vaPayment ? (
                                    <>
                                        <div className="px-8 py-6 border-b border-brand-border/30 bg-brand-surfaceHighlight/50">
                                            <h2 className="text-lg font-bold text-brand-primary">Select Payment Method</h2>
                                        </div>

                                        <div className="p-6 space-y-3">
                                            {/* QRIS */}
                                            <button
                                                onClick={() => setPaymentMethod('qris')}
                                                className={`w-full p-4 rounded-xl text-left transition-all border-2 flex items-center gap-4 ${paymentMethod === 'qris'
                                                    ? 'bg-brand-ice/20 border-brand-action'
                                                    : 'bg-brand-surfaceHighlight border-brand-border hover:border-brand-action/50'
                                                    }`}
                                            >
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${paymentMethod === 'qris' ? 'bg-brand-action text-white' : 'bg-white text-brand-secondary border border-brand-border'}`}>
                                                    <QrCode size={24} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-brand-primary">QRIS</p>
                                                    <p className="text-sm text-brand-secondary">Scan with any e-wallet or mobile banking</p>
                                                </div>
                                                {paymentMethod === 'qris' && <Check size={20} className="text-brand-action" />}
                                            </button>

                                            {/* Virtual Account */}
                                            <button
                                                onClick={() => setPaymentMethod('va')}
                                                className={`w-full p-4 rounded-xl text-left transition-all border-2 flex items-center gap-4 ${paymentMethod === 'va'
                                                    ? 'bg-brand-ice/20 border-brand-action'
                                                    : 'bg-brand-surfaceHighlight border-brand-border hover:border-brand-action/50'
                                                    }`}
                                            >
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${paymentMethod === 'va' ? 'bg-brand-action text-white' : 'bg-white text-brand-secondary border border-brand-border'}`}>
                                                    <Building2 size={24} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-brand-primary">Virtual Account</p>
                                                    <p className="text-sm text-brand-secondary">Transfer via ATM or mobile banking</p>
                                                </div>
                                                {paymentMethod === 'va' && <Check size={20} className="text-brand-action" />}
                                            </button>

                                            {/* Crypto */}
                                            <button
                                                onClick={() => setPaymentMethod('crypto')}
                                                className={`w-full p-4 rounded-xl text-left transition-all border-2 flex items-center gap-4 ${paymentMethod === 'crypto'
                                                    ? 'bg-brand-ice/20 border-brand-accent'
                                                    : 'bg-brand-surfaceHighlight border-brand-border hover:border-brand-accent/50'
                                                    }`}
                                            >
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm ${paymentMethod === 'crypto' ? 'bg-brand-accent text-white' : 'bg-white text-brand-secondary border border-brand-border'}`}>
                                                    <Wallet size={24} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-brand-primary">Crypto ({token.symbol})</p>
                                                    <p className="text-sm text-brand-secondary">Pay with wallet on Lisk</p>
                                                </div>
                                                {paymentMethod === 'crypto' && <Check size={20} className="text-brand-accent" />}
                                            </button>
                                        </div>

                                        <div className="px-6 pb-6">
                                            {error && (
                                                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                                                    {error}
                                                </div>
                                            )}

                                            {/* QRIS Selection */}
                                            {paymentMethod === 'qris' && (
                                                <Button variant="primary" size="lg" className="w-full" onClick={handleCreateQRIS} disabled={isCreatingPayment}>
                                                    {isCreatingPayment ? <><Loader2 className="animate-spin mr-2" size={18} />Creating QR...</> : <>Generate QR Code <ArrowRight size={18} className="ml-2" /></>}
                                                </Button>
                                            )}

                                            {/* VA Selection */}
                                            {paymentMethod === 'va' && (
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {BANKS.map(bank => (
                                                            <button
                                                                key={bank.code}
                                                                onClick={() => setSelectedBank(bank.code)}
                                                                className={`p-3 rounded-lg text-center transition-all border-2 ${selectedBank === bank.code
                                                                    ? 'bg-brand-ice/30 border-brand-action'
                                                                    : 'bg-white border-brand-border hover:border-brand-action/50'
                                                                    }`}
                                                            >
                                                                <span className="font-bold text-sm text-brand-primary">{bank.name}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <Button variant="primary" size="lg" className="w-full" onClick={handleCreateVA} disabled={isCreatingPayment}>
                                                        {isCreatingPayment ? <><Loader2 className="animate-spin mr-2" size={18} />Creating VA...</> : <>Get VA Number <ArrowRight size={18} className="ml-2" /></>}
                                                    </Button>
                                                </div>
                                            )}

                                            {/* Crypto Flow */}
                                            {paymentMethod === 'crypto' && (
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2 mb-4">
                                                        {['Connect', 'Approve', 'Pay'].map((step, i) => (
                                                            <React.Fragment key={step}>
                                                                <div className={`flex items-center gap-2 ${(i === 0 && isMounted && isConnected) || (i === 1 && (cryptoStep === 'pay' || cryptoStep === 'confirming')) || (i === 2 && cryptoStep === 'confirming') ? 'text-brand-action' : 'text-brand-secondary'}`}>
                                                                    <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${(i === 0 && isMounted && isConnected) || (i === 1 && (cryptoStep === 'pay' || cryptoStep === 'confirming')) || (i === 2 && cryptoStep === 'confirming') ? 'bg-brand-action text-white' : 'bg-brand-border text-brand-secondary'}`}>{i + 1}</span>
                                                                    <span className="text-xs font-medium hidden sm:block">{step}</span>
                                                                </div>
                                                                {i < 2 && <div className="flex-1 h-px bg-brand-border"></div>}
                                                            </React.Fragment>
                                                        ))}
                                                    </div>

                                                    {!isConnected && isMounted && (
                                                        <Button variant="primary" size="lg" className="w-full" onClick={handleConnectWallet} disabled={isConnecting}>
                                                            {isConnecting ? <><Loader2 className="animate-spin mr-2" size={18} />Connecting...</> : 'Connect Wallet'}
                                                        </Button>
                                                    )}
                                                    {isConnected && isMounted && cryptoStep === 'approve' && (
                                                        <Button variant="primary" size="lg" className="w-full" onClick={handleApproveToken} disabled={isTxPending || isWaitingTx}>
                                                            {isTxPending || isWaitingTx ? <><Loader2 className="animate-spin mr-2" size={18} />Approving...</> : `Approve ${token.amount} ${token.symbol}`}
                                                        </Button>
                                                    )}
                                                    {isConnected && isMounted && cryptoStep === 'pay' && (
                                                        <Button variant="primary" size="lg" className="w-full" onClick={handleFundEscrow} disabled={isTxPending || isWaitingTx}>
                                                            {isTxPending || isWaitingTx ? <><Loader2 className="animate-spin mr-2" size={18} />Confirming...</> : `Pay ${token.amount} ${token.symbol}`}
                                                        </Button>
                                                    )}
                                                    {cryptoStep === 'confirming' && (
                                                        <div className="text-center py-4">
                                                            <Loader2 className="animate-spin mx-auto mb-2 text-brand-action" size={32} />
                                                            <p className="text-sm text-brand-secondary">Waiting for confirmation...</p>
                                                        </div>
                                                    )}
                                                    {isConnected && isMounted && (
                                                        <p className="text-xs text-center text-brand-secondary">
                                                            Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* QRIS Payment Display */}
                                        {qrisPayment && (
                                            <div className="p-8">
                                                <div className="text-center mb-6">
                                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-ice/30 rounded-full text-brand-action text-sm font-semibold mb-4">
                                                        <QrCode size={16} />
                                                        QRIS Payment
                                                    </div>
                                                    <h2 className="text-xl font-bold text-brand-primary">Scan to Pay</h2>
                                                    <p className="text-brand-secondary text-sm mt-1">Use any e-wallet or mobile banking app</p>
                                                </div>

                                                <div className="bg-white p-6 rounded-2xl border-2 border-brand-border mb-6 flex justify-center">
                                                    <QRCodeSVG
                                                        value={qrisPayment.qrString}
                                                        size={240}
                                                        level="M"
                                                        includeMargin={true}
                                                    />
                                                </div>

                                                <div className="text-center mb-6">
                                                    <p className="text-3xl font-bold text-brand-primary">{formatPrice(escrow.amountIdr)}</p>
                                                    <p className="text-sm text-brand-secondary mt-2">
                                                        Expires: {new Date(qrisPayment.expiresAt).toLocaleString('id-ID')}
                                                    </p>
                                                </div>

                                                <div className="bg-brand-ice/20 rounded-xl p-4 flex items-center gap-3 mb-4">
                                                    <Loader2 className="animate-spin text-brand-action" size={20} />
                                                    <span className="text-sm text-brand-secondary">Waiting for payment...</span>
                                                </div>

                                                <button
                                                    onClick={handleSimulatePayment}
                                                    disabled={isCreatingPayment}
                                                    className="w-full py-3 text-sm text-brand-secondary hover:text-brand-primary transition-colors border border-brand-border rounded-lg"
                                                >
                                                    {isCreatingPayment ? 'Processing...' : 'Demo: Simulate Payment'}
                                                </button>
                                            </div>
                                        )}

                                        {/* VA Payment Display */}
                                        {vaPayment && (
                                            <div className="p-8">
                                                <div className="text-center mb-6">
                                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-ice/30 rounded-full text-brand-action text-sm font-semibold mb-4">
                                                        <Building2 size={16} />
                                                        Virtual Account
                                                    </div>
                                                    <h2 className="text-xl font-bold text-brand-primary">Transfer to Complete</h2>
                                                    <p className="text-brand-secondary text-sm mt-1">Use ATM or mobile banking</p>
                                                </div>

                                                <div className="bg-brand-surfaceHighlight rounded-2xl p-6 mb-6 space-y-4">
                                                    <div>
                                                        <p className="text-xs text-brand-secondary uppercase tracking-wider mb-1">Bank</p>
                                                        <p className="text-lg font-bold text-brand-primary">{vaPayment.bankCode}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-brand-secondary uppercase tracking-wider mb-1">Account Number</p>
                                                        <div className="flex items-center gap-3">
                                                            <p className="text-2xl font-bold text-brand-primary tracking-wider">{vaPayment.accountNumber}</p>
                                                            <button
                                                                onClick={() => copyToClipboard(vaPayment.accountNumber)}
                                                                className="p-2 hover:bg-brand-ice/50 rounded-lg transition-colors"
                                                            >
                                                                {copied ? <CheckCircle2 size={20} className="text-green-500" /> : <Copy size={20} className="text-brand-secondary" />}
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-brand-secondary uppercase tracking-wider mb-1">Account Name</p>
                                                        <p className="text-lg font-bold text-brand-primary">{vaPayment.accountName}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-brand-secondary uppercase tracking-wider mb-1">Amount</p>
                                                        <p className="text-3xl font-bold text-brand-action">{formatPrice(escrow.amountIdr)}</p>
                                                    </div>
                                                </div>

                                                <p className="text-sm text-brand-secondary text-center mb-4">
                                                    Expires: {new Date(vaPayment.expiresAt).toLocaleString('id-ID')}
                                                </p>

                                                <div className="bg-brand-ice/20 rounded-xl p-4 flex items-center gap-3 mb-4">
                                                    <Loader2 className="animate-spin text-brand-action" size={20} />
                                                    <span className="text-sm text-brand-secondary">Waiting for payment...</span>
                                                </div>

                                                <button
                                                    onClick={handleSimulatePayment}
                                                    disabled={isCreatingPayment}
                                                    className="w-full py-3 text-sm text-brand-secondary hover:text-brand-primary transition-colors border border-brand-border rounded-lg"
                                                >
                                                    {isCreatingPayment ? 'Processing...' : 'Demo: Simulate Payment'}
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </FadeIn>
                    </div>
                )}

                {/* Success States */}
                {(status === 'secured' || status === 'completed') && escrow && (
                    <FadeIn className="max-w-lg mx-auto">
                        <div className="bg-white rounded-2xl shadow-2xl p-10 text-center">
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-100">
                                <Check size={40} className="text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-brand-primary mb-3">
                                {status === 'completed' ? 'Transaction Complete!' : 'Payment Secured!'}
                            </h2>
                            <p className="text-brand-secondary mb-8">
                                {status === 'completed'
                                    ? 'Funds have been released to the seller.'
                                    : 'Your payment is safe. Confirm when you receive your item.'}
                            </p>

                            {status === 'secured' && (
                                <>
                                    <Button variant="primary" size="lg" className="w-full mb-4" onClick={handleConfirmReceipt} disabled={isConfirming}>
                                        {isConfirming ? <><Loader2 className="animate-spin mr-2" size={18} />Confirming...</> : 'Confirm Item Received'}
                                    </Button>
                                    <p className="text-xs text-brand-secondary mb-6">This releases {formatPrice(escrow.amountIdr)} to the seller</p>
                                </>
                            )}

                            <div className="bg-brand-surfaceHighlight p-4 rounded-xl flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-brand-secondary">
                                    <Clock size={16} />
                                    Auto-release
                                </div>
                                <span className="font-bold text-brand-action">{getTimeRemaining()}</span>
                            </div>
                        </div>
                    </FadeIn>
                )}
            </main>
        </div>
    );
}
