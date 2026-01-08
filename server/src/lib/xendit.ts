/**
 * Xendit Payment Integration
 * 
 * Supports embedded payment methods:
 * - QRIS: Returns QR code string
 * - Virtual Account: Returns VA number
 * - E-Wallet: Returns checkout URL/QR
 */

const XENDIT_API_BASE = 'https://api.xendit.co';

// ============ Types ============

interface CreateQRISParams {
    externalId: string;
    amount: number;
    callbackUrl: string;
    currency?: 'IDR' | 'PHP' | 'THB' | 'VND' | 'MYR' | 'SGD'; // SEA currencies
}

interface QRISPayment {
    id: string;
    external_id: string;
    qr_string: string;
    amount: number;
    status: string;
    expires_at: string;
}

// Xendit API response types
interface QRISApiResponse {
    id: string;
    reference_id: string;
    qr_string: string;
    amount: number;
    status: string;
    expires_at: string;
}

interface CreateVAParams {
    externalId: string;
    bankCode: string;
    name: string;
    expectedAmount: number;
}

interface VirtualAccount {
    id: string;
    external_id: string;
    bank_code: string;
    account_number: string;
    name: string;
    expected_amount: number;
    status: string;
    expiration_date: string;
}

interface CreateEWalletParams {
    externalId: string;
    amount: number;
    channelCode: 'OVO' | 'DANA' | 'LINKAJA' | 'SHOPEEPAY' | 'ASTRAPAY';
    channelProperties: {
        mobileNumber?: string;
        successRedirectUrl?: string;
        failureRedirectUrl?: string;
    };
}

interface EWalletCharge {
    id: string;
    reference_id: string;
    channel_code: string;
    status: string;
    actions: {
        desktop_web_checkout_url?: string;
        mobile_web_checkout_url?: string;
        mobile_deeplink_checkout_url?: string;
        qr_checkout_string?: string;
    };
}

// Legacy Invoice types (for fallback and multi-currency support)
interface CreateInvoiceParams {
    externalId: string;
    amount: number;
    payerEmail?: string;
    description: string;
    successRedirectUrl: string;
    failureRedirectUrl: string;
    currency?: 'IDR' | 'PHP' | 'THB' | 'VND' | 'MYR' | 'SGD'; // SEA currencies
}

interface XenditInvoice {
    id: string;
    external_id: string;
    invoice_url: string;
    status: string;
    amount: number;
}

// ============ Client ============

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

    private getAuthHeader(): string {
        return `Basic ${Buffer.from(this.secretKey + ':').toString('base64')}`;
    }

    // Get payment methods based on currency/region
    private getPaymentMethodsForCurrency(currency: string): string[] {
        switch (currency) {
            case 'IDR':
                return ['QRIS', 'OVO', 'DANA', 'LINKAJA', 'SHOPEEPAY', 'BCA', 'BNI', 'BRI', 'MANDIRI', 'PERMATA'];
            case 'PHP':
                return ['GCASH', 'PAYMAYA', 'GRABPAY', 'DRAGONPAY', 'BPI', 'UNIONBANK'];
            case 'THB':
                return ['PROMPTPAY', 'TRUEMONEY', 'LINEPAY', 'SHOPEEPAY'];
            case 'VND':
                return ['VNPAY', 'MOMO', 'ZALOPAY', 'VIETTELPAY'];
            case 'MYR':
                return ['FPX', 'DUITNOW', 'TOUCHNGO', 'BOOST', 'GRABPAY', 'SHOPEEPAY'];
            case 'SGD':
                return ['PAYNOW', 'GRABPAY', 'SHOPEEPAY'];
            default:
                return ['QRIS', 'OVO', 'DANA', 'LINKAJA'];
        }
    }

    // ============ QRIS ============

    async createQRIS(params: CreateQRISParams): Promise<QRISPayment> {
        if (this.mockMode) {
            return this.createMockQRIS(params);
        }

        // Validate QRIS amount limits (Xendit requirements)
        const MIN_QRIS_AMOUNT = 1500; // Minimum 1,500 IDR
        const MAX_QRIS_AMOUNT = 10000000; // Maximum 10,000,000 IDR

        if (params.amount < MIN_QRIS_AMOUNT) {
            throw new Error(`QRIS minimum amount is Rp ${MIN_QRIS_AMOUNT.toLocaleString('id-ID')}`);
        }
        if (params.amount > MAX_QRIS_AMOUNT) {
            throw new Error(`QRIS maximum amount is Rp ${MAX_QRIS_AMOUNT.toLocaleString('id-ID')}`);
        }

        // Use currency from params or default to IDR
        const currency = params.currency || 'IDR';

        const response = await fetch(`${XENDIT_API_BASE}/qr_codes`, {
            method: 'POST',
            headers: {
                'Authorization': this.getAuthHeader(),
                'Content-Type': 'application/json',
                'api-version': '2022-07-31'
            },
            body: JSON.stringify({
                reference_id: params.externalId,
                type: 'DYNAMIC',
                currency: currency,
                amount: Math.round(params.amount), // Ensure integer amount
                // Note: Not setting channel_code to generate universal QRIS compatible with all e-wallets/mobile banking
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
            })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Xendit QRIS error:', error);
            throw new Error(`Xendit QRIS error: ${error}`);
        }

        const data = await response.json() as QRISApiResponse;
        return {
            id: data.id,
            external_id: data.reference_id,
            qr_string: data.qr_string,
            amount: data.amount,
            status: data.status,
            expires_at: data.expires_at
        };
    }

    // ============ Virtual Account ============

    async createVirtualAccount(params: CreateVAParams): Promise<VirtualAccount> {
        if (this.mockMode) {
            return this.createMockVA(params);
        }

        const response = await fetch(`${XENDIT_API_BASE}/callback_virtual_accounts`, {
            method: 'POST',
            headers: {
                'Authorization': this.getAuthHeader(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                external_id: params.externalId,
                bank_code: params.bankCode,
                name: params.name,
                expected_amount: params.expectedAmount,
                is_closed: true, // Fixed amount
                expiration_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Xendit VA error:', error);
            throw new Error(`Xendit VA error: ${error}`);
        }

        return response.json() as Promise<VirtualAccount>;
    }

    // ============ E-Wallet ============

    async createEWalletCharge(params: CreateEWalletParams): Promise<EWalletCharge> {
        if (this.mockMode) {
            return this.createMockEWallet(params);
        }

        const response = await fetch(`${XENDIT_API_BASE}/ewallets/charges`, {
            method: 'POST',
            headers: {
                'Authorization': this.getAuthHeader(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                reference_id: params.externalId,
                currency: 'IDR',
                amount: params.amount,
                checkout_method: 'ONE_TIME_PAYMENT',
                channel_code: `ID_${params.channelCode}`,
                channel_properties: params.channelProperties
            })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Xendit E-Wallet error:', error);
            throw new Error(`Xendit E-Wallet error: ${error}`);
        }

        return response.json() as Promise<EWalletCharge>;
    }

    // ============ Legacy Invoice (fallback) ============

    async createInvoice(params: CreateInvoiceParams): Promise<XenditInvoice> {
        if (this.mockMode) {
            return this.createMockInvoice(params);
        }

        const response = await fetch(`${XENDIT_API_BASE}/v2/invoices`, {
            method: 'POST',
            headers: {
                'Authorization': this.getAuthHeader(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                external_id: params.externalId,
                amount: params.amount,
                payer_email: params.payerEmail,
                description: params.description,
                success_redirect_url: params.successRedirectUrl,
                failure_redirect_url: params.failureRedirectUrl,
                currency: params.currency || 'IDR',
                // Payment methods vary by currency/region
                payment_methods: this.getPaymentMethodsForCurrency(params.currency || 'IDR')
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Xendit API error: ${error}`);
        }

        return response.json() as Promise<XenditInvoice>;
    }

    // ============ Get Payment Status ============

    async getQRISStatus(qrId: string): Promise<QRISPayment> {
        if (this.mockMode) {
            return this.getMockQRIS(qrId);
        }

        const response = await fetch(`${XENDIT_API_BASE}/qr_codes/${qrId}`, {
            headers: {
                'Authorization': this.getAuthHeader(),
                'api-version': '2022-07-31'
            }
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Xendit API error: ${error}`);
        }

        const data = await response.json() as QRISApiResponse;
        return {
            id: data.id,
            external_id: data.reference_id,
            qr_string: data.qr_string,
            amount: data.amount,
            status: data.status,
            expires_at: data.expires_at
        };
    }

    // ============ Verify Callback ============

    verifyCallback(payload: any, signature: string): boolean {
        if (this.mockMode) return true;

        const callbackToken = process.env.XENDIT_CALLBACK_TOKEN;
        if (!callbackToken) {
            console.warn('XENDIT_CALLBACK_TOKEN not set - skipping verification');
            return true;
        }

        return signature === callbackToken;
    }

    // ============ Mock Mode Methods ============

    private mockPayments: Map<string, any> = new Map();

    private createMockQRIS(params: CreateQRISParams): QRISPayment {
        const id = `qr_mock_${Date.now()}`;
        // Generate a realistic-looking QR string (this is what would be encoded in a QR code)
        const qrString = `00020101021226670016COM.XENDIT.WWW01189360091804${id}5204839953033605802ID5913VOUCH ESCROW6007JAKARTA61051234062070703A016304`;

        const payment: QRISPayment = {
            id,
            external_id: params.externalId,
            qr_string: qrString,
            amount: params.amount,
            status: 'ACTIVE',
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        };
        this.mockPayments.set(id, payment);
        return payment;
    }

    private getMockQRIS(qrId: string): QRISPayment {
        const payment = this.mockPayments.get(qrId);
        if (!payment) {
            throw new Error('QR payment not found');
        }
        return payment;
    }

    private createMockVA(params: CreateVAParams): VirtualAccount {
        const id = `va_mock_${Date.now()}`;
        const va: VirtualAccount = {
            id,
            external_id: params.externalId,
            bank_code: params.bankCode,
            account_number: `${params.bankCode === 'BCA' ? '1234' : '8888'}${Math.random().toString().slice(2, 12)}`,
            name: params.name,
            expected_amount: params.expectedAmount,
            status: 'PENDING',
            expiration_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        };
        this.mockPayments.set(id, va);
        return va;
    }

    private createMockEWallet(params: CreateEWalletParams): EWalletCharge {
        const id = `ewc_mock_${Date.now()}`;
        const charge: EWalletCharge = {
            id,
            reference_id: params.externalId,
            channel_code: params.channelCode,
            status: 'PENDING',
            actions: {
                desktop_web_checkout_url: `http://localhost:3000/mock-ewallet/${id}`,
                mobile_deeplink_checkout_url: `${params.channelCode.toLowerCase()}://payment/${id}`,
                qr_checkout_string: `00020101021226670016COM.${params.channelCode}.WWW01189360091804${id}`
            }
        };
        this.mockPayments.set(id, charge);
        return charge;
    }

    private createMockInvoice(params: CreateInvoiceParams): XenditInvoice {
        const id = `inv_mock_${Date.now()}`;
        const invoice: XenditInvoice = {
            id,
            external_id: params.externalId,
            invoice_url: `http://localhost:3001/mock-payment/${id}`,
            status: 'PENDING',
            amount: params.amount
        };
        this.mockPayments.set(id, invoice);
        return invoice;
    }

    simulatePaymentSuccess(paymentId: string): any {
        const payment = this.mockPayments.get(paymentId);
        if (payment) {
            payment.status = 'COMPLETED';
            return payment;
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

export type { QRISPayment, VirtualAccount, EWalletCharge, XenditInvoice };
export default XenditClient;
