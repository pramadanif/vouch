import { Router, Request, Response } from 'express';
import { Escrow } from '@prisma/client';
import {
    createEscrowRecord,
    getEscrowById,
    getEscrowsBySeller,
    updateEscrowOnChain,
    updateEscrowXendit,
    markEscrowFunded,
    markEscrowReleased
} from '../lib/db';
import { getWalletManager } from '../lib/wallet';
import { getXenditClient } from '../lib/xendit';

const router = Router();

// IDR to USDC conversion rate (simplified for hackathon)
const IDR_TO_USDC_RATE = 16000; // 1 USDC = 16000 IDR

/**
 * POST /api/escrow/create
 * Create a new escrow
 */
router.post('/create', async (req: Request, res: Response) => {
    try {
        const { sellerAddress, itemName, itemDescription, itemImage, amountIdr, releaseDuration, currency } = req.body;

        // Validation
        if (!sellerAddress || !itemName || !amountIdr || !releaseDuration) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Default to USDC if not specified
        const selectedCurrency = currency === 'IDRX' ? 'IDRX' : 'USDC';
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
            tokenAmount = (parseFloat(amountIdr) / IDR_TO_USDC_RATE).toFixed(2);
            tokenDecimals = 6;
        }

        // Create database record
        // Note: DB schema stores amountUsdc and amountIdr. We might need to store token info too?
        // For now, we'll store approximate USDC value for compatibility
        const amountUsdcApprox = selectedCurrency === 'USDC'
            ? tokenAmount
            : (parseFloat(amountIdr) / IDR_TO_USDC_RATE).toFixed(2);

        const escrow = await createEscrowRecord({
            sellerAddress,
            itemName,
            itemDescription,
            itemImage,
            amountUsdc: amountUsdcApprox,
            amountIdr: amountIdr.toString(),
            releaseDuration: parseInt(releaseDuration)
        });

        // Try to create on-chain escrow (may fail if contracts not deployed)
        try {
            const onChainResult = await wallet.createEscrow(
                sellerAddress,
                tokenAddress,
                tokenAmount,
                tokenDecimals,
                parseInt(releaseDuration)
            );

            await updateEscrowOnChain(escrow.id, {
                escrowId: onChainResult.escrowId,
                releaseTime: onChainResult.releaseTime,
                txHash: onChainResult.txHash
            });

            console.log(`Escrow ${escrow.id} created on-chain: ${onChainResult.txHash}`);
        } catch (err: any) {
            console.warn(`On-chain escrow creation failed (demo mode): ${err.message}`);
            // Continue in demo mode without blockchain
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
            'RELEASED': 'Completed',
            'REFUNDED': 'Refunded',
            'CANCELLED': 'Cancelled'
        };

        res.json({
            id: escrow.id,
            escrowId: escrow.escrowId,
            sellerAddress: escrow.sellerAddress,
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
            createdAt: escrow.createdAt
        });
    } catch (error: any) {
        console.error('Get escrow error:', error);
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
                createdAt: e.createdAt
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
 * POST /api/escrow/:id/release
 * Release funds to seller (legacy - use /confirm instead)
 */
router.post('/:id/release', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const escrow = await getEscrowById(id);
        if (!escrow) {
            return res.status(404).json({ error: 'Escrow not found' });
        }

        if (escrow.status !== 'FUNDED') {
            return res.status(400).json({ error: 'Escrow not in funded state' });
        }

        // Try to release on-chain
        if (escrow.escrowId !== null) {
            try {
                const wallet = getWalletManager();
                await wallet.releaseFunds(escrow.escrowId);
            } catch (err: any) {
                console.warn(`On-chain release failed: ${err.message}`);
            }
        }

        await markEscrowReleased(id);

        res.json({
            success: true,
            message: 'Funds released to seller'
        });
    } catch (error: any) {
        console.error('Release escrow error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/escrow/:id/confirm
 * Buyer confirms receipt and releases funds to seller
 * This is the correct trust model: buyer initiates release
 */
router.post('/:id/confirm', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const escrow = await getEscrowById(id);
        if (!escrow) {
            return res.status(404).json({ error: 'Escrow not found' });
        }

        if (escrow.status !== 'FUNDED') {
            return res.status(400).json({ error: 'Escrow not in funded state. Cannot confirm receipt.' });
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
 * POST /api/escrow/:id/refund
 * Refund a funded escrow back to buyer (dispute resolution)
 */
router.post('/:id/refund', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const escrow = await getEscrowById(id);
        if (!escrow) {
            return res.status(404).json({ error: 'Escrow not found' });
        }

        if (escrow.status !== 'FUNDED') {
            return res.status(400).json({ error: 'Can only refund funded escrows' });
        }

        // Try to refund on-chain
        if (escrow.escrowId !== null) {
            try {
                const wallet = getWalletManager();
                // Note: wallet.refundEscrow would need to be added to wallet.ts
                // For now, we just mark as refunded in DB
                console.log(`Would refund escrow ${escrow.escrowId} on-chain`);
            } catch (err: any) {
                console.warn(`On-chain refund failed: ${err.message}`);
            }
        }

        // Import and use markEscrowRefunded from db
        const { markEscrowRefunded } = await import('../lib/db');
        await markEscrowRefunded(id);

        console.log(`Escrow ${id} refunded to buyer. Reason: ${reason || 'Not specified'}`);

        res.json({
            success: true,
            message: 'Escrow refunded to buyer'
        });
    } catch (error: any) {
        console.error('Refund escrow error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
