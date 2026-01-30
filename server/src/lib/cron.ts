/**
 * Cron Job Service for Vouch Escrow
 * 
 * Handles automatic state transitions for escrow security:
 * 1. Auto-release: Release funds to seller 14 days after shipping (if buyer doesn't confirm)
 * 2. Auto-refund: Refund to buyer if seller doesn't ship within 30 days
 * 3. Expire unfunded: Cancel escrows that are never funded after 7 days
 * 
 * These timeouts ensure neither party can grief the other and funds are never stuck.
 */

import cron from 'node-cron';
import {
    getEscrowsForAutoRelease,
    getEscrowsForAutoRefund,
    getExpiredUnfundedEscrows,
    markEscrowReleased,
    markEscrowRefunded,
    markEscrowExpired,
    ESCROW_TIMEOUTS
} from './db';
import { getWalletManager } from './wallet';

// Track if cron is running to prevent overlapping executions
let isAutoReleaseRunning = false;
let isAutoRefundRunning = false;
let isExpireRunning = false;

/**
 * Process auto-release for shipped escrows where buyer didn't confirm
 * 
 * This protects sellers from buyer griefing (refusing to confirm receipt).
 * After 14 days from shipping, funds are automatically released to seller.
 */
async function processAutoRelease(): Promise<void> {
    if (isAutoReleaseRunning) {
        console.log('[CRON] Auto-release already running, skipping...');
        return;
    }

    isAutoReleaseRunning = true;
    console.log('[CRON] Starting auto-release check...');

    try {
        const escrows = await getEscrowsForAutoRelease();
        console.log(`[CRON] Found ${escrows.length} escrows ready for auto-release`);

        for (const escrow of escrows) {
            try {
                console.log(`[CRON] Auto-releasing escrow ${escrow.id} (on-chain ID: ${escrow.escrowId})`);

                // Release on-chain if escrow has on-chain ID
                if (escrow.escrowId !== null) {
                    try {
                        const wallet = getWalletManager();
                        await wallet.releaseFunds(escrow.escrowId);
                        console.log(`[CRON] On-chain release successful for escrow ${escrow.id}`);
                    } catch (err: any) {
                        // If already released on-chain, just update DB
                        if (err.message.includes('already released')) {
                            console.log(`[CRON] Escrow ${escrow.id} already released on-chain, syncing DB...`);
                        } else {
                            console.error(`[CRON] On-chain release failed for escrow ${escrow.id}:`, err.message);
                            // Continue to update DB anyway - on-chain state may be out of sync
                        }
                    }
                }

                // Update database
                await markEscrowReleased(escrow.id);
                console.log(`[CRON] ✅ Auto-released escrow ${escrow.id} - funds sent to seller`);

            } catch (err: any) {
                console.error(`[CRON] ❌ Failed to auto-release escrow ${escrow.id}:`, err.message);
            }
        }

    } catch (err: any) {
        console.error('[CRON] Auto-release check failed:', err.message);
    } finally {
        isAutoReleaseRunning = false;
    }
}

/**
 * Process auto-refund for funded escrows where seller didn't ship
 * 
 * This protects buyers from seller ghosting.
 * After 30 days from funding, funds are automatically refunded to buyer.
 */
async function processAutoRefund(): Promise<void> {
    if (isAutoRefundRunning) {
        console.log('[CRON] Auto-refund already running, skipping...');
        return;
    }

    isAutoRefundRunning = true;
    console.log('[CRON] Starting auto-refund check...');

    try {
        const escrows = await getEscrowsForAutoRefund();
        console.log(`[CRON] Found ${escrows.length} escrows ready for auto-refund`);

        for (const escrow of escrows) {
            try {
                console.log(`[CRON] Auto-refunding escrow ${escrow.id} - seller never shipped`);

                // Refund on-chain if escrow has on-chain ID
                if (escrow.escrowId !== null) {
                    try {
                        const wallet = getWalletManager();
                        await wallet.refundEscrow(escrow.escrowId);
                        console.log(`[CRON] On-chain refund successful for escrow ${escrow.id}`);
                    } catch (err: any) {
                        if (err.message.includes('already')) {
                            console.log(`[CRON] Escrow ${escrow.id} already refunded on-chain, syncing DB...`);
                        } else {
                            console.error(`[CRON] On-chain refund failed for escrow ${escrow.id}:`, err.message);
                        }
                    }
                }

                // Update database
                await markEscrowRefunded(escrow.id);
                console.log(`[CRON] ✅ Auto-refunded escrow ${escrow.id} - funds returned to buyer`);

            } catch (err: any) {
                console.error(`[CRON] ❌ Failed to auto-refund escrow ${escrow.id}:`, err.message);
            }
        }

    } catch (err: any) {
        console.error('[CRON] Auto-refund check failed:', err.message);
    } finally {
        isAutoRefundRunning = false;
    }
}

/**
 * Expire unfunded escrows after 7 days
 * 
 * This cleans up abandoned payment links that were never used.
 */
async function processExpiredEscrows(): Promise<void> {
    if (isExpireRunning) {
        console.log('[CRON] Expire check already running, skipping...');
        return;
    }

    isExpireRunning = true;
    console.log('[CRON] Starting expire check for unfunded escrows...');

    try {
        const escrows = await getExpiredUnfundedEscrows();
        console.log(`[CRON] Found ${escrows.length} unfunded escrows to expire`);

        for (const escrow of escrows) {
            try {
                await markEscrowExpired(escrow.id);
                console.log(`[CRON] ✅ Expired unfunded escrow ${escrow.id}`);
            } catch (err: any) {
                console.error(`[CRON] ❌ Failed to expire escrow ${escrow.id}:`, err.message);
            }
        }

    } catch (err: any) {
        console.error('[CRON] Expire check failed:', err.message);
    } finally {
        isExpireRunning = false;
    }
}

/**
 * Start all cron jobs
 * 
 * Schedule:
 * - Auto-release: Every hour (checks for 14-day timeout after shipping)
 * - Auto-refund: Every 6 hours (checks for 30-day timeout after funding)
 * - Expire unfunded: Every day at midnight (cleans up 7-day old unfunded escrows)
 */
export function startCronJobs(): void {
    console.log('[CRON] Initializing cron jobs...');
    console.log(`[CRON] Timeouts configured:`);
    console.log(`  - Creation expiry: ${ESCROW_TIMEOUTS.CREATION_EXPIRY_DAYS} days`);
    console.log(`  - Shipping deadline: ${ESCROW_TIMEOUTS.SHIPPING_DEADLINE_DAYS} days`);
    console.log(`  - Auto-release: ${ESCROW_TIMEOUTS.AUTO_RELEASE_DAYS} days after shipping`);

    // Auto-release check: Every hour at minute 0
    // Pattern: second minute hour day-of-month month day-of-week
    cron.schedule('0 * * * *', async () => {
        console.log(`[CRON] ${new Date().toISOString()} - Running hourly auto-release check`);
        await processAutoRelease();
    });

    // Auto-refund check: Every 6 hours (00:00, 06:00, 12:00, 18:00)
    cron.schedule('0 */6 * * *', async () => {
        console.log(`[CRON] ${new Date().toISOString()} - Running 6-hourly auto-refund check`);
        await processAutoRefund();
    });

    // Expire unfunded: Daily at 00:30 UTC
    cron.schedule('30 0 * * *', async () => {
        console.log(`[CRON] ${new Date().toISOString()} - Running daily expire check`);
        await processExpiredEscrows();
    });

    console.log('[CRON] ✅ Cron jobs scheduled successfully');
    console.log('[CRON] Schedules:');
    console.log('  - Auto-release: Every hour at :00');
    console.log('  - Auto-refund: Every 6 hours at :00');
    console.log('  - Expire unfunded: Daily at 00:30 UTC');
}

/**
 * Run all checks immediately (useful for testing or manual trigger)
 */
export async function runAllChecksNow(): Promise<void> {
    console.log('[CRON] Running all checks immediately...');
    await processAutoRelease();
    await processAutoRefund();
    await processExpiredEscrows();
    console.log('[CRON] All checks completed');
}

export default { startCronJobs, runAllChecksNow };
