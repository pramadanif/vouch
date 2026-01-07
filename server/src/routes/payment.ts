import { Router, Request, Response } from 'express';
import { getEscrowById, markEscrowFunded } from '../lib/db';
import { getWalletManager } from '../lib/wallet';
import { getXenditClient } from '../lib/xendit';

const router = Router();

/**
 * POST /api/payment/xendit/callback
 * Handle Xendit payment webhook
 */
router.post('/xendit/callback', async (req: Request, res: Response) => {
    try {
        const callbackToken = req.headers['x-callback-token'] as string;
        const xendit = getXenditClient();

        // Verify callback (skip in mock mode)
        if (!xendit.isMockMode && !xendit.verifyCallback(req.body, callbackToken)) {
            console.warn('Invalid Xendit callback signature');
            return res.status(401).json({ error: 'Invalid signature' });
        }

        const { external_id, status, id: invoiceId } = req.body;

        console.log(`Xendit callback: invoice=${invoiceId}, status=${status}, escrow=${external_id}`);

        // Only process successful payments
        if (status !== 'PAID' && status !== 'SETTLED') {
            return res.json({ received: true, processed: false });
        }

        // Get escrow from database
        const escrow = await getEscrowById(external_id);
        if (!escrow) {
            console.warn(`Escrow not found for external_id: ${external_id}`);
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

                // Get on-chain requirements (token address and amount)
                const details = await wallet.getEscrowDetails(escrow.escrowId);

                // Fund with the required token and amount
                await wallet.markFunded(
                    escrow.escrowId,
                    details.token,
                    details.amount
                );

                console.log(`Escrow ${escrow.id} marked funded on-chain (token: ${details.token})`);
            } catch (err: any) {
                console.warn(`On-chain markFunded failed: ${err.message}`);
                // Continue anyway - db is source of truth for demo
            }
        }

        console.log(`Escrow ${escrow.id} marked as FUNDED`);

        res.json({ received: true, processed: true });
    } catch (error: any) {
        console.error('Xendit callback error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/payment/simulate/:id
 * Simulate payment success (for demo/mock mode only)
 */
router.post('/simulate/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const xendit = getXenditClient();

        if (!xendit.isMockMode) {
            return res.status(400).json({ error: 'Simulation only available in mock mode' });
        }

        const escrow = await getEscrowById(id);
        if (!escrow) {
            return res.status(404).json({ error: 'Escrow not found' });
        }

        // Mark as funded
        await markEscrowFunded(id);

        // Try on-chain
        if (escrow.escrowId !== null) {
            try {
                const wallet = getWalletManager();

                // Get on-chain requirements
                const details = await wallet.getEscrowDetails(escrow.escrowId);

                await wallet.markFunded(
                    escrow.escrowId,
                    details.token,
                    details.amount
                );
            } catch (err: any) {
                console.warn(`On-chain markFunded failed: ${err.message}`);
            }
        }

        console.log(`Payment simulated for escrow ${id}`);

        res.json({
            success: true,
            message: 'Payment simulated successfully',
            escrowId: id
        });
    } catch (error: any) {
        console.error('Simulate payment error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
