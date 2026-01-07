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
    async simulatePayment(id: string): Promise<{ success: boolean }> {
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
     */
    async confirmReceipt(id: string): Promise<{ success: boolean; message: string }> {
        const response = await fetch(`${API_BASE}/api/escrow/${id}/confirm`, {
            method: 'POST',
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to confirm receipt');
        }
        return response.json();
    },
};

export default api;
