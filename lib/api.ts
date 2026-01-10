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
     * Release funds (seller initiated - legacy)
     */
    async releaseFunds(id: string): Promise<{ success: boolean }> {
        const response = await fetch(`${API_BASE}/api/escrow/${id}/release`, {
            method: 'POST',
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to release funds');
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
};

export default api;
