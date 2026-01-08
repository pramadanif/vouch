import { Router, Request, Response } from 'express';
import { getEscrowById, markEscrowFunded, updateEscrowXendit } from '../lib/db';
import { getWalletManager } from '../lib/wallet';
import { getXenditClient } from '../lib/xendit';

const router = Router();

// ============ QRIS Payment ============

/**
 * POST /api/payment/qris/create/:escrowId
 * Create QRIS payment for an escrow
 */
router.post('/qris/create/:escrowId', async (req: Request, res: Response) => {
    try {
        const { escrowId } = req.params;

        const escrow = await getEscrowById(escrowId);
        if (!escrow) {
            return res.status(404).json({ error: 'Escrow not found' });
        }

        const xendit = getXenditClient();
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';

        const qris = await xendit.createQRIS({
            externalId: escrow.id,
            amount: parseFloat(escrow.amountIdr),
            callbackUrl: `${backendUrl}/api/payment/xendit/callback`
        });

        // Store payment reference
        await updateEscrowXendit(escrow.id, {
            invoiceId: qris.id,
            invoiceUrl: 'QRIS'
        });

        res.json({
            success: true,
            paymentMethod: 'QRIS',
            paymentId: qris.id,
            qrString: qris.qr_string,
            amount: qris.amount,
            expiresAt: qris.expires_at,
            mockMode: xendit.isMockMode
        });
    } catch (error: any) {
        console.error('Create QRIS error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/payment/qris/status/:qrId
 * Check QRIS payment status
 */
router.get('/qris/status/:qrId', async (req: Request, res: Response) => {
    try {
        const { qrId } = req.params;
        const xendit = getXenditClient();

        const qris = await xendit.getQRISStatus(qrId);

        res.json({
            id: qris.id,
            status: qris.status,
            amount: qris.amount,
            expiresAt: qris.expires_at
        });
    } catch (error: any) {
        console.error('Get QRIS status error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============ Virtual Account Payment ============

/**
 * POST /api/payment/va/create/:escrowId
 * Create Virtual Account payment
 */
router.post('/va/create/:escrowId', async (req: Request, res: Response) => {
    try {
        const { escrowId } = req.params;
        const { bankCode } = req.body; // BCA, BNI, BRI, MANDIRI, PERMATA, etc.

        if (!bankCode) {
            return res.status(400).json({ error: 'Bank code is required' });
        }

        const escrow = await getEscrowById(escrowId);
        if (!escrow) {
            return res.status(404).json({ error: 'Escrow not found' });
        }

        const xendit = getXenditClient();

        const va = await xendit.createVirtualAccount({
            externalId: escrow.id,
            bankCode: bankCode,
            name: 'VOUCH ESCROW',
            expectedAmount: parseFloat(escrow.amountIdr)
        });

        // Store payment reference
        await updateEscrowXendit(escrow.id, {
            invoiceId: va.id,
            invoiceUrl: 'VA'
        });

        res.json({
            success: true,
            paymentMethod: 'VIRTUAL_ACCOUNT',
            paymentId: va.id,
            bankCode: va.bank_code,
            accountNumber: va.account_number,
            accountName: va.name,
            amount: va.expected_amount,
            expiresAt: va.expiration_date,
            mockMode: xendit.isMockMode
        });
    } catch (error: any) {
        console.error('Create VA error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============ E-Wallet Payment ============

/**
 * POST /api/payment/ewallet/create/:escrowId
 * Create E-Wallet payment
 */
router.post('/ewallet/create/:escrowId', async (req: Request, res: Response) => {
    try {
        const { escrowId } = req.params;
        const { channelCode, mobileNumber } = req.body; // OVO, DANA, LINKAJA, SHOPEEPAY

        if (!channelCode) {
            return res.status(400).json({ error: 'Channel code is required' });
        }

        const escrow = await getEscrowById(escrowId);
        if (!escrow) {
            return res.status(404).json({ error: 'Escrow not found' });
        }

        const xendit = getXenditClient();
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

        const charge = await xendit.createEWalletCharge({
            externalId: escrow.id,
            amount: parseFloat(escrow.amountIdr),
            channelCode: channelCode,
            channelProperties: {
                mobileNumber: mobileNumber,
                successRedirectUrl: `${frontendUrl}/pay/${escrowId}?status=success`,
                failureRedirectUrl: `${frontendUrl}/pay/${escrowId}?status=failed`
            }
        });

        // Store payment reference
        await updateEscrowXendit(escrow.id, {
            invoiceId: charge.id,
            invoiceUrl: 'EWALLET'
        });

        res.json({
            success: true,
            paymentMethod: 'EWALLET',
            paymentId: charge.id,
            channelCode: charge.channel_code,
            status: charge.status,
            actions: charge.actions,
            mockMode: xendit.isMockMode
        });
    } catch (error: any) {
        console.error('Create E-Wallet error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============ Xendit Callback ============

/**
 * POST /api/payment/xendit/callback
 * Unified callback handler for all payment methods
 */
router.post('/xendit/callback', async (req: Request, res: Response) => {
    try {
        const callbackToken = req.headers['x-callback-token'] as string;
        const xendit = getXenditClient();

        // Verify callback
        if (!xendit.isMockMode && !xendit.verifyCallback(req.body, callbackToken)) {
            console.warn('Invalid Xendit callback signature');
            return res.status(401).json({ error: 'Invalid signature' });
        }

        // Determine payment type and extract relevant data
        const {
            // QRIS callback fields
            qr_code,
            // VA callback fields
            callback_virtual_account_id,
            // E-Wallet callback fields
            data,
            // Common fields
            external_id,
            status,
            id
        } = req.body;

        // Get escrow ID from various sources
        const escrowId = external_id || data?.reference_id || (qr_code && qr_code.reference_id);

        console.log(`Xendit callback: type=${qr_code ? 'QRIS' : callback_virtual_account_id ? 'VA' : 'EWALLET'}, escrow=${escrowId}, status=${status}`);

        // Only process successful payments
        const successStatuses = ['PAID', 'SETTLED', 'COMPLETED', 'SUCCEEDED'];
        const isSuccess = successStatuses.includes(status?.toUpperCase());

        if (!isSuccess) {
            return res.json({ received: true, processed: false, reason: 'not_success' });
        }

        // Get escrow from database
        const escrow = await getEscrowById(escrowId);
        if (!escrow) {
            console.warn(`Escrow not found for: ${escrowId}`);
            return res.status(404).json({ error: 'Escrow not found' });
        }

        // Already processed?
        if (escrow.status === 'FUNDED' || escrow.status === 'RELEASED') {
            return res.json({ received: true, processed: false, reason: 'already_processed' });
        }

        // Mark funded in database
        await markEscrowFunded(escrow.id);

        // Try to mark funded on-chain
        if (escrow.escrowId !== null) {
            try {
                const wallet = getWalletManager();
                const details = await wallet.getEscrowDetails(escrow.escrowId);
                await wallet.markFunded(escrow.escrowId, details.token, details.amount);
                console.log(`Escrow ${escrow.id} marked funded on-chain`);
            } catch (err: any) {
                console.warn(`On-chain markFunded failed: ${err.message}`);
            }
        }

        console.log(`Escrow ${escrow.id} marked as FUNDED`);
        res.json({ received: true, processed: true });
    } catch (error: any) {
        console.error('Xendit callback error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============ Simulate Payment (Demo) ============

/**
 * POST /api/payment/simulate/:escrowId
 * Simulate payment success (for demo/mock mode only)
 */
router.post('/simulate/:escrowId', async (req: Request, res: Response) => {
    try {
        const { escrowId } = req.params;
        const xendit = getXenditClient();

        if (!xendit.isMockMode) {
            return res.status(400).json({ error: 'Simulation only available in mock mode' });
        }

        const escrow = await getEscrowById(escrowId);
        if (!escrow) {
            return res.status(404).json({ error: 'Escrow not found' });
        }

        // Mark as funded
        await markEscrowFunded(escrowId);

        // Try on-chain
        if (escrow.escrowId !== null) {
            try {
                const wallet = getWalletManager();
                const details = await wallet.getEscrowDetails(escrow.escrowId);
                await wallet.markFunded(escrow.escrowId, details.token, details.amount);
            } catch (err: any) {
                console.warn(`On-chain markFunded failed: ${err.message}`);
            }
        }

        console.log(`Payment simulated for escrow ${escrowId}`);

        res.json({
            success: true,
            message: 'Payment simulated successfully',
            escrowId: escrowId
        });
    } catch (error: any) {
        console.error('Simulate payment error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============ Get Available Payment Methods ============

/**
 * GET /api/payment/methods
 * Get list of available payment methods
 */
router.get('/methods', async (_req: Request, res: Response) => {
    res.json({
        qris: {
            name: 'QRIS',
            description: 'Scan QR code with any e-wallet or mobile banking app',
            icon: 'qr_code'
        },
        virtualAccount: {
            banks: [
                { code: 'BCA', name: 'Bank Central Asia' },
                { code: 'BNI', name: 'Bank Negara Indonesia' },
                { code: 'BRI', name: 'Bank Rakyat Indonesia' },
                { code: 'MANDIRI', name: 'Bank Mandiri' },
                { code: 'PERMATA', name: 'Bank Permata' },
                { code: 'CIMB', name: 'CIMB Niaga' }
            ]
        },
        ewallet: {
            channels: [
                { code: 'OVO', name: 'OVO' },
                { code: 'DANA', name: 'DANA' },
                { code: 'LINKAJA', name: 'LinkAja' },
                { code: 'SHOPEEPAY', name: 'ShopeePay' }
            ]
        }
    });
});

export default router;
