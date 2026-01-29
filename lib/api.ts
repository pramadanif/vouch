const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Types
export interface CreateEscrowRequest {
    sellerAddress: string;
    itemName: string;
    itemDescription?: string;
    itemImage?: string;
    amountIdr: string;
    releaseDuration: number;
    currency?: string;
    fiatCurrency?: 'IDR' | 'SGD' | 'MYR' | 'THB' | 'PHP' | 'VND';
    txHash?: string;  // On-chain tx hash for linking
    onChainEscrowId?: string; // On-chain escrow ID from event logs
}

export interface CreateEscrowResponse {
    success: boolean;
    escrowId: string;
    paymentLink: string;
    escrow: {
        id: string;
        itemName: string;
        amountUsdc: string;
        amountIdr: string;
        status: string;
        currency: string;
    };
}

export interface EscrowDetails {
    id: string;
    escrowId: number | null;
    sellerAddress: string;
    buyerAddress: string | null;  // Buyer wallet address (set after funding)
    itemName: string;
    itemDescription: string | null;
    itemImage: string | null;
    amountUsdc: string;
    amountIdr: string;
    releaseDuration: number;
    releaseTime: number | null;
    status: string;
    statusLabel: string;
    xenditInvoiceUrl: string | null;
    createdAt: number;
    currency: string;
    fiatCurrency: 'IDR' | 'SGD' | 'MYR' | 'THB' | 'PHP' | 'VND';
    shipmentProof?: string | null;
}

export interface SellerEscrowsResponse {
    seller: string;
    escrows: Array<{
        id: string;
        itemName: string;
        amountUsdc: string;
        amountIdr: string;
        status: string;
        releaseTime: number | null;
        createdAt: number;
        currency: string;
        fiatCurrency?: string;
    }>;
}

export interface CreateInvoiceResponse {
    success: boolean;
    invoiceId: string;
    invoiceUrl: string;
    mockMode: boolean;
}

// API Client
export const api = {
    /**
     * Create a new escrow
     */
    async createEscrow(data: CreateEscrowRequest): Promise<CreateEscrowResponse> {
        const response = await fetch(`${API_BASE}/api/escrow/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create escrow');
        }
        return response.json();
    },

    /**
     * Get escrow details
     */
    async getEscrow(id: string): Promise<EscrowDetails> {
        const response = await fetch(`${API_BASE}/api/escrow/${id}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to get escrow');
        }
        return response.json();
    },

    /**
     * Get all escrows for a seller
     */
    async getSellerEscrows(address: string): Promise<SellerEscrowsResponse> {
        const response = await fetch(`${API_BASE}/api/escrow/seller/${address}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to get seller escrows');
        }
        return response.json();
    },

    /**
     * Create payment invoice
     */
    async createInvoice(id: string, payerEmail?: string): Promise<CreateInvoiceResponse> {
        const response = await fetch(`${API_BASE}/api/escrow/${id}/create-invoice`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payerEmail }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create invoice');
        }
        return response.json();
    },

    /**
     * Simulate payment (demo mode only)
     */
    async simulatePayment(id: string): Promise<{ success: boolean; buyerToken?: string }> {
        const response = await fetch(`${API_BASE}/api/payment/simulate/${id}`, {
            method: 'POST',
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to simulate payment');
        }
        return response.json();
    },

    /**
     * Check payment status (fallback for webhooks)
     */
    async checkPaymentStatus(id: string): Promise<{ success: boolean; status: string; buyerToken?: string }> {
        const response = await fetch(`${API_BASE}/api/payment/check-status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ escrowId: id }),
        });
        if (!response.ok) {
            // Non-critical, just return false
            return { success: false, status: 'UNKNOWN' };
        }
        return response.json();
    },

    /**
     * @deprecated Use confirmReceipt or confirmReceiptCrypto instead
     * This endpoint has been removed for security reasons.
     * Funds can only be released via buyer confirmation or auto-release timeout.
     */
    async releaseFunds(id: string): Promise<{ success: boolean }> {
        console.warn('releaseFunds is deprecated. Use confirmReceipt instead.');
        throw new Error('Direct release is no longer supported. Buyer must confirm receipt.');
    },

    /**
     * Mark escrow as shipped (seller uploads proof)
     */
    async shipEscrow(id: string, proof: string): Promise<{ success: boolean; message: string; autoReleaseAt?: string }> {
        const response = await fetch(`${API_BASE}/api/escrow/${id}/ship`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ proof }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to submit shipment proof');
        }
        return response.json();
    },

    /**
     * Confirm receipt and release funds (buyer initiated - correct trust model)
     * Requires buyerToken that was generated during payment
     */
    async confirmReceipt(id: string, buyerToken: string): Promise<{ success: boolean; message: string }> {
        const response = await fetch(`${API_BASE}/api/escrow/${id}/confirm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ buyerToken }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to confirm receipt');
        }
        return response.json();
    },

    /**
     * Confirm receipt for crypto buyers (using wallet address as auth)
     */
    async confirmReceiptCrypto(id: string, buyerAddress: string): Promise<{ success: boolean; message: string }> {
        const response = await fetch(`${API_BASE}/api/escrow/${id}/confirm-crypto`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ buyerAddress }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to confirm receipt');
        }
        return response.json();
    },

    /**
     * Raise a dispute (buyer only - after shipping)
     */
    async raiseDispute(id: string, reason: string, buyerToken?: string, buyerAddress?: string): Promise<{ success: boolean; message: string }> {
        const response = await fetch(`${API_BASE}/api/escrow/${id}/dispute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason, buyerToken, buyerAddress }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to raise dispute');
        }
        return response.json();
    },

    /**
     * Seller initiates refund (before shipping only)
     */
    async refundEscrow(id: string, sellerAddress: string, reason?: string): Promise<{ success: boolean; message: string }> {
        const response = await fetch(`${API_BASE}/api/escrow/${id}/refund`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sellerAddress, reason }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to refund escrow');
        }
        return response.json();
    },

    /**
     * Get detailed escrow status with timeout information
     */
    async getEscrowStatus(id: string): Promise<{
        id: string;
        status: string;
        timestamps: {
            created: string;
            funded: string | null;
            shipped: string | null;
            delivered: string | null;
            released: string | null;
            disputed: string | null;
        };
        timeout: {
            type: string;
            autoReleaseAt?: string;
            deadline?: string;
            daysRemaining: number;
            message: string;
        } | null;
        shipmentProof: string | null;
        disputeReason: string | null;
        disputeResolution: string | null;
    }> {
        const response = await fetch(`${API_BASE}/api/escrow/${id}/status`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to get escrow status');
        }
        return response.json();
    },
};

export default api;
