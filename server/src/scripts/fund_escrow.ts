import { getWalletManager } from '../lib/wallet';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load env explicitly to ensure we get the latest
config({ path: resolve(__dirname, '../../.env') });

async function main() {
    const escrowId = 2; // Target the problematic ID
    const wallet = getWalletManager();
    console.log(`Using Wallet: ${wallet.address}`);
    console.log(`Using Escrow Contract: ${process.env.ESCROW_CONTRACT_ADDRESS || process.env.VOUCH_ESCROW_ADDRESS}`);

    console.log(`Checking Escrow ID: ${escrowId}...`);
    try {
        const details = await wallet.getEscrowDetails(escrowId);
        console.log('Escrow Details:', {
            token: details.token,
            amount: details.amount,
            funded: details.funded
        });

        if (details.funded) {
            console.log('Escrow already funded on-chain.');
            return;
        }

        console.log('Marking funded...');
        // markFunded(escrowId, token, amount, buyer?)
        // amount is needed for allowance check
        const tx = await wallet.markFunded(escrowId, details.token, details.amount);
        console.log(`Marked funded! Tx: ${tx}`);
    } catch (err: any) {
        console.error('Error:', err);
    }
}

main().catch(console.error);
