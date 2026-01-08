const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ============ Types ============

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

// Payment method responses
export interface QRISPaymentResponse {
    success: boolean;
    paymentMethod: 'QRIS';
    paymentId: string;
    qrString: string;
    amount: number;
    expiresAt: string;
    mockMode: boolean;
}

export interface VAPaymentResponse {
    success: boolean;
    paymentMethod: 'VIRTUAL_ACCOUNT';
    paymentId: string;
    bankCode: string;
    accountNumber: string;
    accountName: string;
    amount: number;
    expiresAt: string;
    mockMode: boolean;
}

export interface EWalletPaymentResponse {
    success: boolean;
    paymentMethod: 'EWALLET';
    paymentId: string;
    channelCode: string;
    status: string;
    actions: {
        desktop_web_checkout_url?: string;
        mobile_web_checkout_url?: string;
        mobile_deeplink_checkout_url?: string;
        qr_checkout_string?: string;
    };
    mockMode: boolean;
}

export interface PaymentMethodsResponse {
    qris: {
        name: string;
        description: string;
        icon: string;
    };
    virtualAccount: {
        banks: Array<{ code: string; name: string }>;
    };
    ewallet: {
        channels: Array<{ code: string; name: string }>;
    };
}

// Legacy invoice type
export interface CreateInvoiceResponse {
    success: boolean;
    invoiceId: string;
    invoiceUrl: string;
    mockMode: boolean;
}

// ============ API Client ============

export const api = {
    // ============ Escrow ============

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

    async getEscrow(id: string): Promise<EscrowDetails> {
        const response = await fetch(`${API_BASE}/api/escrow/${id}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to get escrow');
        }
        return response.json();
    },

    async getSellerEscrows(address: string): Promise<SellerEscrowsResponse> {
        const response = await fetch(`${API_BASE}/api/escrow/seller/${address}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to get seller escrows');
        }
        return response.json();
    },

    // ============ Payment Methods ============

    async getPaymentMethods(): Promise<PaymentMethodsResponse> {
        const response = await fetch(`${API_BASE}/api/payment/methods`);
        if (!response.ok) {
            throw new Error('Failed to get payment methods');
        }
        return response.json();
    },

    // ============ QRIS Payment ============

    async createQRISPayment(escrowId: string): Promise<QRISPaymentResponse> {
        const response = await fetch(`${API_BASE}/api/payment/qris/create/${escrowId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create QRIS payment');
        }
        return response.json();
    },

    async getQRISStatus(qrId: string): Promise<{ id: string; status: string; amount: number; expiresAt: string }> {
        const response = await fetch(`${API_BASE}/api/payment/qris/status/${qrId}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to get QRIS status');
        }
        return response.json();
    },

    // ============ Virtual Account Payment ============

    async createVAPayment(escrowId: string, bankCode: string): Promise<VAPaymentResponse> {
        const response = await fetch(`${API_BASE}/api/payment/va/create/${escrowId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bankCode }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create VA payment');
        }
        return response.json();
    },

    // ============ E-Wallet Payment ============

    async createEWalletPayment(escrowId: string, channelCode: string, mobileNumber?: string): Promise<EWalletPaymentResponse> {
        const response = await fetch(`${API_BASE}/api/payment/ewallet/create/${escrowId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ channelCode, mobileNumber }),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create E-Wallet payment');
        }
        return response.json();
    },

    // ============ Legacy Invoice (fallback) ============

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

    // ============ Simulation & Confirmation ============

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
