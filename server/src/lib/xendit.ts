/**
 * Xendit Payment Integration
 * 
 * For hackathon demo, this includes both real Xendit API calls
 * and a mock mode when XENDIT_SECRET_KEY is not set.
 */

const XENDIT_API_BASE = 'https://api.xendit.co';

interface CreateInvoiceParams {
    externalId: string;
    amount: number;
    payerEmail?: string;
    description: string;
    successRedirectUrl: string;
    failureRedirectUrl: string;
}

interface XenditInvoice {
    id: string;
    external_id: string;
    invoice_url: string;
    status: string;
    amount: number;
}

class XenditClient {
    private secretKey: string | null;
    private mockMode: boolean;

    constructor() {
        this.secretKey = process.env.XENDIT_SECRET_KEY || null;
        this.mockMode = !this.secretKey;

        if (this.mockMode) {
            console.log('⚠️  Xendit running in MOCK mode - no real payments');
        } else {
            console.log('✓ Xendit initialized with API key');
        }
    }

    /**
     * Create a payment invoice
     */
    async createInvoice(params: CreateInvoiceParams): Promise<XenditInvoice> {
        if (this.mockMode) {
            return this.createMockInvoice(params);
        }

        const response = await fetch(`${XENDIT_API_BASE}/v2/invoices`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${Buffer.from(this.secretKey + ':').toString('base64')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                external_id: params.externalId,
                amount: params.amount,
                payer_email: params.payerEmail,
                description: params.description,
                success_redirect_url: params.successRedirectUrl,
                failure_redirect_url: params.failureRedirectUrl,
                currency: 'IDR',
                payment_methods: ['QRIS', 'OVO', 'DANA', 'LINKAJA', 'BCA', 'BNI', 'BRI', 'MANDIRI']
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Xendit API error: ${error}`);
        }

        return response.json() as Promise<XenditInvoice>;
    }

    /**
     * Get invoice status
     */
    async getInvoice(invoiceId: string): Promise<XenditInvoice> {
        if (this.mockMode) {
            return this.getMockInvoice(invoiceId);
        }

        const response = await fetch(`${XENDIT_API_BASE}/v2/invoices/${invoiceId}`, {
            headers: {
                'Authorization': `Basic ${Buffer.from(this.secretKey + ':').toString('base64')}`
            }
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Xendit API error: ${error}`);
        }

        return response.json() as Promise<XenditInvoice>;
    }

    /**
     * Verify callback signature
     */
    verifyCallback(payload: any, signature: string): boolean {
        if (this.mockMode) return true;

        const callbackToken = process.env.XENDIT_CALLBACK_TOKEN;
        if (!callbackToken) {
            console.warn('XENDIT_CALLBACK_TOKEN not set - skipping verification');
            return true;
        }

        // Xendit uses the callback token as the signature
        return signature === callbackToken;
    }

    // ============ Mock Mode Methods ============

    private mockInvoices: Map<string, XenditInvoice> = new Map();

    private createMockInvoice(params: CreateInvoiceParams): XenditInvoice {
        const id = `mock_inv_${Date.now()}`;
        const invoice: XenditInvoice = {
            id,
            external_id: params.externalId,
            invoice_url: `http://localhost:3001/mock-payment/${id}`,
            status: 'PENDING',
            amount: params.amount
        };
        this.mockInvoices.set(id, invoice);
        return invoice;
    }

    private getMockInvoice(invoiceId: string): XenditInvoice {
        const invoice = this.mockInvoices.get(invoiceId);
        if (!invoice) {
            throw new Error('Invoice not found');
        }
        return invoice;
    }

    /**
     * Simulate payment success (for mock mode)
     */
    simulatePaymentSuccess(invoiceId: string): XenditInvoice | null {
        const invoice = this.mockInvoices.get(invoiceId);
        if (invoice) {
            invoice.status = 'PAID';
            return invoice;
        }
        return null;
    }

    get isMockMode(): boolean {
        return this.mockMode;
    }
}

// Singleton
let xenditClient: XenditClient | null = null;

export function getXenditClient(): XenditClient {
    if (!xenditClient) {
        xenditClient = new XenditClient();
    }
    return xenditClient;
}

export default XenditClient;
