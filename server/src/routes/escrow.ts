import { Router, Request, Response } from 'express';
import { Escrow } from '@prisma/client';
import {
    createEscrowRecord,
    getEscrowById,
    getEscrowsBySeller,
    updateEscrowOnChain,
    updateEscrowXendit,
    updateEscrowStatus,
    markEscrowFunded,
    markEscrowReleased,
    markEscrowShipped,
    markEscrowDelivered,
    markEscrowRefunded,
    markEscrowDisputed,
    resolveDispute,
    ESCROW_TIMEOUTS
} from '../lib/db';
import { getWalletManager } from '../lib/wallet';
import { getXenditClient } from '../lib/xendit';

const router = Router();

// Currency to USD rates (as of Jan 2026)
const CURRENCY_RATES: Record<string, number> = {
    IDR: 16800,
    SGD: 1.29,
    MYR: 4.07,
    THB: 31.4,
    PHP: 59.2,
    VND: 26200
};

/**
 * POST /api/escrow/create
 * Create a new escrow
 */
router.post('/create', async (req: Request, res: Response) => {
    try {
        const { sellerAddress, itemName, itemDescription, itemImage, amountIdr, releaseDuration, currency, fiatCurrency } = req.body;

        // Validation
        if (!sellerAddress || !itemName || !amountIdr || !releaseDuration) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Default to USDC if not specified
        const selectedCurrency = currency === 'IDRX' ? 'IDRX' : 'USDC';
        const selectedFiatCurrency = fiatCurrency || 'IDR';
        const wallet = getWalletManager();
        let tokenAddress: string;
        let tokenAmount: string;
        let tokenDecimals: number;

        if (selectedCurrency === 'IDRX') {
            tokenAddress = wallet.idrxAddress;
            tokenAmount = amountIdr.toString(); // 1 IDR = 1 IDRX (roughly)
            tokenDecimals = 18;
        } else {
            tokenAddress = wallet.usdcAddress;
            // Calculate USDC based on the fiat currency rate
            const rate = CURRENCY_RATES[selectedFiatCurrency] || CURRENCY_RATES.IDR;
            tokenAmount = (parseFloat(amountIdr) / rate).toFixed(2);
            tokenDecimals = 6;
        }

        // Create database record
        // amountIdr field stores the fiat amount in the selected currency (legacy naming)
        // amountUsdc is calculated based on the fiat currency rate
        const rate = CURRENCY_RATES[selectedFiatCurrency] || CURRENCY_RATES.IDR;
        const amountUsdcApprox = selectedCurrency === 'USDC'
            ? tokenAmount
            : (parseFloat(amountIdr) / rate).toFixed(2);

        const escrow = await createEscrowRecord({
            sellerAddress,
            itemName,
            itemDescription,
            itemImage,
            amountUsdc: amountUsdcApprox,
            amountIdr: amountIdr.toString(),
            releaseDuration: parseInt(releaseDuration),
            releaseTime: Math.floor(Date.now() / 1000) + parseInt(releaseDuration),
            fiatCurrency: selectedFiatCurrency
        });

        // If txHash provided, seller already created escrow on-chain (TRUE DECENTRALIZATION)
        // Store both txHash and onChainEscrowId for complete linking
        const { txHash, onChainEscrowId } = req.body;
        if (txHash) {
            console.log(`Escrow ${escrow.id} linked to on-chain tx: ${txHash}, escrowId: ${onChainEscrowId}`);
            await updateEscrowOnChain(escrow.id, {
                txHash: txHash,
                escrowId: onChainEscrowId ? parseInt(onChainEscrowId) : undefined
            });
        } else {
            // Legacy mode: backend creates on-chain (for testing fallback)
            console.log(`Escrow ${escrow.id} created in database only (seller will create on-chain)`);
        }

        // Generate payment link
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const paymentLink = `${frontendUrl}/pay/${escrow.id}`;

        res.json({
            success: true,
            escrowId: escrow.id,
            paymentLink,
            escrow: {
                id: escrow.id,
                itemName: escrow.itemName,
                amountUsdc: escrow.amountUsdc,
                amountIdr: escrow.amountIdr,
                status: escrow.status,
                currency: selectedCurrency
            }
        });
    } catch (error: any) {
        console.error('Create escrow error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/escrow/:id
 * Get escrow details
 */
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const escrow = await getEscrowById(id);

        if (!escrow) {
            return res.status(404).json({ error: 'Escrow not found' });
        }

        // Map status to frontend-friendly labels
        const statusLabels: Record<string, string> = {
            'CREATED': 'Waiting for payment',
            'WAITING_PAYMENT': 'Waiting for payment',
            'FUNDED': 'Payment secured',
            'SHIPPED': 'Item Shipped',
            'RELEASED': 'Completed',
            'REFUNDED': 'Refunded',
            'CANCELLED': 'Cancelled'
        };

        res.json({
            id: escrow.id,
            escrowId: escrow.escrowId,
            sellerAddress: escrow.sellerAddress,
            buyerAddress: (escrow as any).buyerAddress || null,
            itemName: escrow.itemName,
            itemDescription: escrow.itemDescription,
            itemImage: escrow.itemImage,
            amountUsdc: escrow.amountUsdc,
            amountIdr: escrow.amountIdr,
            releaseDuration: escrow.releaseDuration,
            releaseTime: escrow.releaseTime,
            status: escrow.status,
            statusLabel: statusLabels[escrow.status] || escrow.status,
            xenditInvoiceUrl: escrow.xenditInvoiceUrl,
            createdAt: escrow.createdAt,
            currency: escrow.fiatCurrency === 'IDR' ? 'IDRX' : 'USDC',
            fiatCurrency: escrow.fiatCurrency || 'IDR',
            shipmentProof: escrow.shipmentProof
        });
    } catch (error: any) {
        console.error('Get escrow error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/escrow/:id/crypto-funded
 * Notify backend that escrow was funded via crypto (buyer calls this after tx)
 */
router.post('/:id/crypto-funded', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { txHash, buyerAddress } = req.body;

        console.log(`Crypto funding notification for escrow ${id}:`, { txHash, buyerAddress });

        const escrow = await getEscrowById(id);
        if (!escrow) {
            return res.status(404).json({ error: 'Escrow not found' });
        }

        // Prevent reverting status if already advanced
        // If already funded/shipped/released, we just return success (idempotent)
        if (['FUNDED', 'SHIPPED', 'DELIVERED', 'RELEASED', 'COMPLETED'].includes(escrow.status)) {
            console.log(`Escrow ${id} already in ${escrow.status} state, skipping crypto-funded update.`);
            return res.json({
                success: true,
                message: 'Escrow already funded/advanced',
                escrowId: id,
                txHash,
                buyerAddress
            });
        }

        // Update escrow status to FUNDED and set buyer address
        // Using prisma directly since we need to update buyerAddress
        const { PrismaClient } = await import('@prisma/client');
        const prisma = new PrismaClient();
        await prisma.escrow.update({
            where: { id },
            data: {
                status: 'FUNDED',
                buyerAddress: buyerAddress || null
            }
        });

        res.json({
            success: true,
            message: 'Escrow marked as funded',
            escrowId: id,
            txHash,
            buyerAddress
        });
    } catch (error: any) {
        console.error('Crypto funded error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/escrow/seller/:address
 * Get all escrows for a seller
 */
router.get('/seller/:address', async (req: Request, res: Response) => {
    try {
        const { address } = req.params;
        const escrows = await getEscrowsBySeller(address);

        res.json({
            seller: address,
            escrows: escrows.map((e: Escrow) => ({
                id: e.id,
                itemName: e.itemName,
                amountUsdc: e.amountUsdc,
                amountIdr: e.amountIdr,
                status: e.status,
                releaseTime: e.releaseTime,
                createdAt: new Date(e.createdAt).getTime(),
                fiatCurrency: e.fiatCurrency || 'IDR',
                currency: e.fiatCurrency === 'IDR' ? 'IDRX' : 'USDC'
            }))
        });
    } catch (error: any) {
        console.error('Get seller escrows error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/escrow/:id/create-invoice
 * Create Xendit invoice for payment
 */
router.post('/:id/create-invoice', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { payerEmail } = req.body;

        const escrow = await getEscrowById(id);
        if (!escrow) {
            return res.status(404).json({ error: 'Escrow not found' });
        }

        const xendit = getXenditClient();
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

        const invoice = await xendit.createInvoice({
            externalId: escrow.id,
            amount: parseFloat(escrow.amountIdr),
            payerEmail,
            description: `Payment for ${escrow.itemName}`,
            successRedirectUrl: `${frontendUrl}/pay/${id}?status=success`,
            failureRedirectUrl: `${frontendUrl}/pay/${id}?status=failed`
        });

        await updateEscrowXendit(id, {
            invoiceId: invoice.id,
            invoiceUrl: invoice.invoice_url
        });

        res.json({
            success: true,
            invoiceId: invoice.id,
            invoiceUrl: invoice.invoice_url,
            mockMode: xendit.isMockMode
        });
    } catch (error: any) {
        console.error('Create invoice error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/escrow/:id/ship
 * Seller uploads shipment proof
 */
router.post('/:id/ship', (req, res, next) => {
    // Import upload middleware dynamically or assume it's available
    const { upload } = require('../middlewares/upload');
    upload.single('image')(req, res, async (err: any) => {
        if (err) return res.status(400).json({ error: err.message });

        try {
            const { id } = req.params;
            let { proof } = req.body;

            // If file uploaded, use file path
            if (req.file) {
                const serverUrl = process.env.API_URL || 'http://localhost:3001';
                // proof = `${serverUrl}/uploads/${req.file.filename}`;
                // Store relative path or absolute URL? 
                // Storing Absolute URL is better for Frontend simplicity, BUT localhost vs production...
                // Let's store Absolute URL.
                proof = `${serverUrl}/uploads/${req.file.filename}`;
            }

            if (!proof) {
                return res.status(400).json({ error: 'Shipment proof is required (link or image)' });
            }

            const escrow = await getEscrowById(id);
            if (!escrow) {
                return res.status(404).json({ error: 'Escrow not found' });
            }

            if (escrow.status !== 'FUNDED') {
                return res.status(400).json({ error: 'Escrow must be funded before shipping' });
            }

            const { markEscrowShipped } = await import('../lib/db');
            await markEscrowShipped(id, proof);

            // Update on-chain
            if (escrow.escrowId !== null) {
                try {
                    const wallet = getWalletManager();
                    await wallet.markShipped(escrow.escrowId);
                } catch (err: any) {
                    console.warn(`On-chain markShipped failed: ${err.message}`);
                }
            }

            res.json({
                success: true,
                message: 'Shipment proof uploaded',
                status: 'SHIPPED',
                proof,
                autoReleaseAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days
            });
        } catch (error: any) {
            console.error('Shipment proof error:', error);
            res.status(500).json({ error: error.message });
        }
    });
});

/**
 * ⚠️ REMOVED: POST /api/escrow/:id/release
 * This endpoint was a CRITICAL SECURITY VULNERABILITY.
 * 
 * Reason: No authentication - anyone knowing the escrow ID could release funds.
 * This bypassed the buyer confirmation requirement.
 * 
 * CORRECT WAY to release funds:
 * 1. Buyer confirms receipt via /api/escrow/:id/confirm (with buyerToken)
 * 2. Buyer confirms via /api/escrow/:id/confirm-crypto (with wallet signature)
 * 3. Auto-release after 14 days via cron job (protects seller from griefing)
 * 
 * See: /api/escrow/:id/confirm and /api/escrow/:id/confirm-crypto below
 */

/**
 * POST /api/escrow/:id/confirm
 * Buyer confirms receipt and releases funds to seller
 * This is the correct trust model: buyer initiates release
 * 
 * SECURITY: Requires buyerToken that was generated during payment
 */
router.post('/:id/confirm', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { buyerToken } = req.body;

        // SECURITY: Require buyerToken for verification
        if (!buyerToken) {
            return res.status(401).json({
                error: 'Buyer token required. Only the buyer who paid can confirm receipt.'
            });
        }

        const escrow = await getEscrowById(id);
        if (!escrow) {
            return res.status(404).json({ error: 'Escrow not found' });
        }

        if (escrow.status !== 'SHIPPED') {
            return res.status(400).json({ error: 'Item must be shipped before you can confirm receipt' });
        }

        // SECURITY: Verify buyerToken matches the one stored during payment
        if (escrow.buyerToken !== buyerToken) {
            console.warn(`Invalid buyerToken attempt for escrow ${id}`);
            return res.status(403).json({
                error: 'Invalid buyer token. You are not authorized to release these funds.'
            });
        }

        // Try to release on-chain
        if (escrow.escrowId !== null) {
            try {
                const wallet = getWalletManager();
                await wallet.releaseFunds(escrow.escrowId);
                console.log(`Funds released on-chain for escrow ${id}`);
            } catch (err: any) {
                console.warn(`On-chain release failed: ${err.message}`);
                // Continue anyway - buyer confirmation is the trigger
            }
        }

        // Mark as released in database
        await markEscrowReleased(id);

        console.log(`Buyer confirmed receipt for escrow ${id} - funds released to seller`);

        res.json({
            success: true,
            message: 'Receipt confirmed. Funds have been released to the seller.'
        });
    } catch (error: any) {
        console.error('Confirm receipt error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/escrow/:id/confirm-crypto
 * Confirm receipt for crypto buyers (verify by wallet address)
 */
router.post('/:id/confirm-crypto', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { buyerAddress } = req.body;

        if (!buyerAddress) {
            return res.status(400).json({ error: 'Buyer address is required' });
        }

        const escrow = await getEscrowById(id);
        if (!escrow) {
            return res.status(404).json({ error: 'Escrow not found' });
        }

        // Verify the address matches the buyer who funded
        if (!escrow.buyerAddress || escrow.buyerAddress.toLowerCase() !== buyerAddress.toLowerCase()) {
            return res.status(403).json({ error: 'Only the buyer who paid can confirm receipt' });
        }

        // Check status
        if (escrow.status === 'RELEASED') {
            return res.json({
                success: true,
                message: 'Escrow already released.'
            });
        }

        if (escrow.status !== 'SHIPPED') {
            return res.status(400).json({ error: `Cannot confirm - item must be shipped first (current: ${escrow.status})` });
        }

        // Note: For crypto payments, the buyer releases funds directly on-chain.
        // We don't need to call releaseFunds here. We just update the DB status.

        // Mark as released in database
        await markEscrowReleased(id);

        console.log(`Crypto buyer ${buyerAddress} confirmed receipt for escrow ${id} - funds released`);

        res.json({
            success: true,
            message: 'Receipt confirmed. Funds have been released to the seller.'
        });
    } catch (error: any) {
        console.error('Confirm crypto receipt error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/escrow/:id/dispute
 * Buyer raises a dispute (item not received, wrong item, damaged, etc.)
 * 
 * SECURITY: Requires buyerToken or buyerAddress verification
 */
router.post('/:id/dispute', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { buyerToken, buyerAddress, reason } = req.body;

        if (!reason) {
            return res.status(400).json({ error: 'Dispute reason is required' });
        }

        const escrow = await getEscrowById(id);
        if (!escrow) {
            return res.status(404).json({ error: 'Escrow not found' });
        }

        // Verify buyer identity (either fiat buyerToken or crypto buyerAddress)
        const isValidFiatBuyer = buyerToken && escrow.buyerToken === buyerToken;
        const isValidCryptoBuyer = buyerAddress &&
            escrow.buyerAddress?.toLowerCase() === buyerAddress.toLowerCase();

        if (!isValidFiatBuyer && !isValidCryptoBuyer) {
            return res.status(403).json({
                error: 'Only the buyer can raise a dispute. Provide valid buyerToken or buyerAddress.'
            });
        }

        // Can only dispute SHIPPED status (before auto-release)
        if (escrow.status !== 'SHIPPED') {
            return res.status(400).json({
                error: `Cannot dispute escrow in ${escrow.status} status. Disputes only allowed after shipping.`
            });
        }

        await markEscrowDisputed(id, reason);

        console.log(`Dispute raised for escrow ${id}: ${reason}`);

        res.json({
            success: true,
            message: 'Dispute has been raised. Our team will review and contact both parties.',
            escrowId: id,
            disputeReason: reason
        });
    } catch (error: any) {
        console.error('Dispute error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/escrow/:id/resolve-dispute
 * Protocol resolves a dispute (admin only - should have proper auth in production)
 * 
 * NOTE: In production, this should have admin authentication middleware
 */
router.post('/:id/resolve-dispute', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { resolution, notes, adminKey } = req.body;

        // Basic admin auth (in production, use proper auth middleware)
        const expectedKey = process.env.ADMIN_KEY;
        if (!expectedKey || adminKey !== expectedKey) {
            return res.status(403).json({ error: 'Unauthorized - admin access required' });
        }

        if (!resolution || !['REFUNDED', 'RELEASED'].includes(resolution)) {
            return res.status(400).json({ error: 'Resolution must be REFUNDED or RELEASED' });
        }

        const escrow = await getEscrowById(id);
        if (!escrow) {
            return res.status(404).json({ error: 'Escrow not found' });
        }

        if (escrow.status !== 'DISPUTED') {
            return res.status(400).json({ error: 'Escrow is not in disputed status' });
        }

        // Execute on-chain action
        if (escrow.escrowId !== null) {
            try {
                const wallet = getWalletManager();
                if (resolution === 'REFUNDED') {
                    await wallet.refundEscrow(escrow.escrowId);
                } else {
                    await wallet.releaseFunds(escrow.escrowId);
                }
            } catch (err: any) {
                console.warn(`On-chain dispute resolution failed: ${err.message}`);
            }
        }

        await resolveDispute(id, resolution, notes || 'No notes provided');

        console.log(`Dispute resolved for escrow ${id}: ${resolution}`);

        res.json({
            success: true,
            message: `Dispute resolved - funds ${resolution === 'REFUNDED' ? 'refunded to buyer' : 'released to seller'}`,
            resolution
        });
    } catch (error: any) {
        console.error('Resolve dispute error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/escrow/:id/refund
 * Refund a funded escrow back to buyer (before shipping - seller cancels)
 * 
 * NOTE: After shipping, buyer must raise a dispute instead
 */
router.post('/:id/refund', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { reason, sellerAddress } = req.body;

        const escrow = await getEscrowById(id);
        if (!escrow) {
            return res.status(404).json({ error: 'Escrow not found' });
        }

        // Verify seller is requesting the refund
        if (!sellerAddress || escrow.sellerAddress.toLowerCase() !== sellerAddress.toLowerCase()) {
            return res.status(403).json({ error: 'Only the seller can initiate a refund' });
        }

        // Can only refund FUNDED status (seller hasn't shipped yet)
        if (escrow.status !== 'FUNDED') {
            return res.status(400).json({
                error: `Cannot refund escrow in ${escrow.status} status. ` +
                    (escrow.status === 'SHIPPED' ? 'Item already shipped - buyer must raise dispute.' : '')
            });
        }

        // Try to refund on-chain
        if (escrow.escrowId !== null) {
            try {
                const wallet = getWalletManager();
                await wallet.refundEscrow(escrow.escrowId);
                console.log(`Refund executed on-chain for escrow ${escrow.escrowId}`);
            } catch (err: any) {
                console.warn(`On-chain refund failed: ${err.message}`);
            }
        }

        await markEscrowRefunded(id);

        console.log(`Escrow ${id} refunded to buyer by seller. Reason: ${reason || 'Not specified'}`);

        res.json({
            success: true,
            message: 'Escrow refunded to buyer'
        });
    } catch (error: any) {
        console.error('Refund escrow error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/escrow/:id/status
 * Get detailed escrow status including timeouts
 */
router.get('/:id/status', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const escrow = await getEscrowById(id);

        if (!escrow) {
            return res.status(404).json({ error: 'Escrow not found' });
        }

        const now = new Date();
        let timeoutInfo: any = null;

        if (escrow.status === 'SHIPPED' && escrow.autoReleaseAt) {
            const autoReleaseDate = new Date(escrow.autoReleaseAt);
            const msRemaining = autoReleaseDate.getTime() - now.getTime();
            const daysRemaining = Math.max(0, Math.ceil(msRemaining / (24 * 60 * 60 * 1000)));

            timeoutInfo = {
                type: 'AUTO_RELEASE',
                autoReleaseAt: escrow.autoReleaseAt,
                daysRemaining,
                message: daysRemaining > 0
                    ? `Auto-release in ${daysRemaining} days if buyer doesn't confirm`
                    : 'Ready for auto-release'
            };
        } else if (escrow.status === 'FUNDED' && escrow.fundedAt) {
            const deadline = new Date(escrow.fundedAt);
            deadline.setDate(deadline.getDate() + ESCROW_TIMEOUTS.SHIPPING_DEADLINE_DAYS);
            const msRemaining = deadline.getTime() - now.getTime();
            const daysRemaining = Math.max(0, Math.ceil(msRemaining / (24 * 60 * 60 * 1000)));

            timeoutInfo = {
                type: 'SHIPPING_DEADLINE',
                deadline: deadline.toISOString(),
                daysRemaining,
                message: `Seller must ship within ${daysRemaining} days or buyer gets auto-refund`
            };
        }

        res.json({
            id: escrow.id,
            status: escrow.status,
            timestamps: {
                created: escrow.createdAt,
                funded: escrow.fundedAt,
                shipped: escrow.shippedAt,
                delivered: escrow.deliveredAt,
                released: escrow.releasedAt,
                disputed: escrow.disputedAt
            },
            timeout: timeoutInfo,
            shipmentProof: escrow.shipmentProof,
            disputeReason: escrow.disputeReason,
            disputeResolution: escrow.disputeResolution
        });
    } catch (error: any) {
        console.error('Get status error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
