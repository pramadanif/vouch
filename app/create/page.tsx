'use client';

import React, { useState, useEffect } from 'react';
import { Copy, Loader2, Check, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useAccount, useConnect, useDisconnect, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi';
import { liskSepolia } from 'wagmi/chains';
import { parseUnits } from 'viem';
import Button from '@/components/Button';
import FadeIn from '@/components/ui/FadeIn';
import { api } from '@/lib/api';
import { VOUCH_ESCROW_ADDRESS, VOUCH_ESCROW_ABI, MOCK_USDC_ADDRESS, MOCK_IDRX_ADDRESS } from '@/lib/contracts';

export default function CreateLinkPage() {
    const [step, setStep] = useState<'connect' | 'create' | 'share'>('connect');
    const [generatedLink, setGeneratedLink] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');
    const [isMounted, setIsMounted] = useState(false);

    const [itemName, setItemName] = useState('');
    const [itemDescription, setItemDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [fiatCurrency, setFiatCurrency] = useState<'IDR' | 'SGD' | 'MYR' | 'THB' | 'PHP' | 'VND'>('IDR');
    const [releaseDuration, setReleaseDuration] = useState(86400);

    // SEA currency configurations with flags (USDC rates as of Jan 2026)
    const currencyConfig: Record<string, { symbol: string; name: string; usdcRate: number; flag: string }> = {
        IDR: { symbol: 'Rp', name: 'Indonesian Rupiah', usdcRate: 16800, flag: '🇮🇩' },
        SGD: { symbol: 'S$', name: 'Singapore Dollar', usdcRate: 1.29, flag: '🇸🇬' },
        MYR: { symbol: 'RM', name: 'Malaysian Ringgit', usdcRate: 4.07, flag: '🇲🇾' },
        THB: { symbol: '฿', name: 'Thai Baht', usdcRate: 31.4, flag: '🇹🇭' },
        PHP: { symbol: '₱', name: 'Philippine Peso', usdcRate: 59.2, flag: '🇵🇭' },
        VND: { symbol: '₫', name: 'Vietnamese Dong', usdcRate: 26200, flag: '🇻🇳' },
    };

    const { address, isConnected, chain } = useAccount();
    const { connect, connectors, isPending } = useConnect();
    const { disconnect } = useDisconnect();
    const { switchChain } = useSwitchChain();
    const { writeContract, data: txHash, isPending: isTxPending, error: writeError } = useWriteContract();
    const { isLoading: isWaitingTx, isSuccess: isTxSuccess, data: txReceipt } = useWaitForTransactionReceipt({ hash: txHash });

    const isWrongNetwork = isConnected && chain?.id !== liskSepolia.id;

    // State for on-chain escrow creation
    const [pendingEscrowData, setPendingEscrowData] = useState<{
        itemName: string;
        itemDescription: string;
        amountIdr: string;
        fiatCurrency: string;
        releaseDuration: number;
        currency: string;
    } | null>(null);

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
            // For non-IDR currencies, always use USDC. For IDR, use IDRX
            const cryptoCurrency = fiatCurrency === 'IDR' ? 'IDRX' : 'USDC';
            const tokenAddress = cryptoCurrency === 'IDRX' ? MOCK_IDRX_ADDRESS : MOCK_USDC_ADDRESS;
            const tokenDecimals = cryptoCurrency === 'IDRX' ? 18 : 6;

            // Store raw amount in the selected fiat currency (field name is amountIdr for legacy but stores the fiat amount)
            const rawAmount = amount.replace(/[^0-9.]/g, '');
            const amountFiat = rawAmount;

            // Calculate token amount based on currency
            let tokenAmount: string;
            if (cryptoCurrency === 'IDRX') {
                // IDR uses IDRX: 1 IDR = 1 IDRX
                tokenAmount = rawAmount;
            } else {
                // Other currencies use USDC: convert using the currency's USD rate
                const usdcAmount = parseFloat(rawAmount) / currencyConfig[fiatCurrency].usdcRate;
                tokenAmount = usdcAmount.toFixed(2);
            }

            // Calculate release time
            const releaseTime = BigInt(Math.floor(Date.now() / 1000) + releaseDuration);

            // Store pending data for after tx success
            setPendingEscrowData({
                itemName,
                itemDescription,
                amountIdr: amountFiat, // This stores the fiat amount (name is legacy)
                fiatCurrency,
                releaseDuration,
                currency: cryptoCurrency,
            });

            console.log('Creating escrow on-chain:', {
                tokenAddress,
                tokenAmount,
                tokenDecimals,
                releaseTime: releaseTime.toString()
            });

            // Call contract directly - SELLER IS msg.sender (TRUE DECENTRALIZATION!)
            writeContract({
                address: VOUCH_ESCROW_ADDRESS as `0x${string}`,
                abi: VOUCH_ESCROW_ABI,
                functionName: 'createEscrow',
                args: [
                    tokenAddress as `0x${string}`,
                    parseUnits(tokenAmount, tokenDecimals),
                    releaseTime
                ]
            });
        } catch (err: any) {
            console.error('Create escrow error:', err);
            setError(err.message || 'Failed to create escrow');
            setIsLoading(false);
        }
    };

    // Handle transaction success - link escrow to backend
    useEffect(() => {
        const linkEscrowToBackend = async () => {
            // Debug logging
            console.log('TX Success effect:', { isTxSuccess, txHash, txReceipt, hasPendingData: !!pendingEscrowData });

            // Proceed if we have txHash (tx submitted) - don't wait for receipt
            if (!txHash || !pendingEscrowData || !address) return;

            // Small delay to ensure tx is mined
            await new Promise(resolve => setTimeout(resolve, 5000));

            try {
                console.log('Transaction mined, fetching receipt:', txHash);

                // Fetch the transaction receipt to get the escrowId from logs
                const response = await fetch(`https://rpc.sepolia-api.lisk.com`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        method: 'eth_getTransactionReceipt',
                        params: [txHash],
                        id: 1
                    })
                });
                const receiptData = await response.json();
                const receipt = receiptData.result;

                // Parse EscrowCreated event: topic0 = keccak256("EscrowCreated(uint256,address,uint256,uint256)")
                // escrowId is the first indexed parameter (topic1)
                let onChainEscrowId: string | undefined;
                if (receipt?.logs) {
                    for (const log of receipt.logs) {
                        // Check if this is from our escrow contract
                        if (log.address.toLowerCase() === VOUCH_ESCROW_ADDRESS.toLowerCase()) {
                            // First topic after event signature is indexed escrowId
                            if (log.topics && log.topics.length > 1) {
                                onChainEscrowId = parseInt(log.topics[1], 16).toString();
                                console.log('Found on-chain escrowId:', onChainEscrowId);
                                break;
                            }
                        }
                    }
                }

                console.log('Linking to backend with escrowId:', onChainEscrowId);

                // Call backend to create metadata record and get payment link
                const result = await api.createEscrow({
                    sellerAddress: address,
                    itemName: pendingEscrowData.itemName,
                    itemDescription: pendingEscrowData.itemDescription,
                    amountIdr: pendingEscrowData.amountIdr,
                    releaseDuration: pendingEscrowData.releaseDuration,
                    currency: pendingEscrowData.currency,
                    fiatCurrency: pendingEscrowData.fiatCurrency as any,
                    txHash: txHash,
                    onChainEscrowId: onChainEscrowId, // Include on-chain ID
                });

                setGeneratedLink(result.paymentLink);
                setStep('share');
                setPendingEscrowData(null);
            } catch (err: any) {
                console.error('Failed to link escrow to backend:', err);
                setError('Escrow created on-chain but failed to save metadata. TX: ' + txHash);
            } finally {
                setIsLoading(false);
            }
        };

        linkEscrowToBackend();
    }, [txHash, pendingEscrowData, address]);

    // Handle write errors
    useEffect(() => {
        if (writeError) {
            console.error('Write error:', writeError);
            setError(writeError.message || 'Transaction failed');
            setIsLoading(false);
        }
    }, [writeError]);

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
                                    {isWrongNetwork && (
                                        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl">
                                            <p className="font-medium text-sm">Wrong Network Detected</p>
                                            <p className="text-xs mt-1 text-amber-700">Please switch to Lisk Sepolia to create escrow</p>
                                            <button
                                                type="button"
                                                onClick={() => switchChain({ chainId: liskSepolia.id })}
                                                className="mt-3 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors"
                                            >
                                                Switch to Lisk Sepolia
                                            </button>
                                        </div>
                                    )}
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
                                            <label className="block text-sm font-semibold text-brand-primary mb-2">Price</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary font-semibold">{currencyConfig[fiatCurrency].symbol}</span>
                                                <input
                                                    type="text"
                                                    placeholder="0"
                                                    value={formatCurrency(amount)}
                                                    onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
                                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-brand-surfaceHighlight border border-brand-border focus:border-brand-action focus:ring-2 focus:ring-brand-action/10 outline-none transition-all font-semibold text-lg"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-brand-primary mb-2">Currency</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">
                                                    {currencyConfig[fiatCurrency].flag}
                                                </span>
                                                <select
                                                    value={fiatCurrency}
                                                    onChange={(e) => setFiatCurrency(e.target.value as any)}
                                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-brand-surfaceHighlight border border-brand-border focus:border-brand-action focus:ring-2 focus:ring-brand-action/10 outline-none transition-all font-semibold appearance-none cursor-pointer"
                                                >
                                                    <option value="IDR">IDR - Indonesian Rupiah</option>
                                                    <option value="SGD">SGD - Singapore Dollar</option>
                                                    <option value="MYR">MYR - Malaysian Ringgit</option>
                                                    <option value="THB">THB - Thai Baht</option>
                                                    <option value="PHP">PHP - Philippine Peso</option>
                                                    <option value="VND">VND - Vietnamese Dong</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Info about crypto token based on currency selection */}
                                    {/* Info about crypto token based on currency selection */}
                                    <div className="bg-brand-surfaceHighlight rounded-xl p-4 border border-brand-border/50">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-semibold uppercase tracking-wider text-brand-secondary">Payment Config</span>
                                            {fiatCurrency !== 'IDR' && (
                                                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">CRYPTO ONLY</span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shadow-sm ${fiatCurrency === 'IDR' ? 'bg-red-500' : 'bg-blue-500'}`}>
                                                {fiatCurrency === 'IDR' ? 'Rp' : '$'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-brand-primary text-sm">
                                                    {fiatCurrency === 'IDR' ? 'IDRX Stablecoin' : 'USDC Stablecoin'}
                                                </p>
                                                {fiatCurrency === 'IDR' ? (
                                                    <p className="text-xs text-brand-secondary">1 IDR ≈ 1 IDRX (Xendit/Crypto)</p>
                                                ) : (
                                                    <p className="text-xs text-brand-secondary">
                                                        {currencyConfig[fiatCurrency].flag} 1 USDC ≈ {currencyConfig[fiatCurrency].usdcRate} {fiatCurrency}
                                                    </p>
                                                )}
                                            </div>
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



                                    <Button variant="primary" size="lg" className="w-full mt-4" disabled={isLoading || isTxPending || isWaitingTx || isWrongNetwork}>
                                        {isTxPending ? (
                                            <><Loader2 className="animate-spin mr-2" size={18} />Sign Transaction in Wallet...</>
                                        ) : isWaitingTx ? (
                                            <><Loader2 className="animate-spin mr-2" size={18} />Waiting for Confirmation...</>
                                        ) : isLoading ? (
                                            <><Loader2 className="animate-spin mr-2" size={18} />Creating Payment Link...</>
                                        ) : (
                                            'Create Payment Link'
                                        )}
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
                                    onClick={() => { setStep('create'); setItemName(''); setAmount(''); setGeneratedLink(''); }}
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
