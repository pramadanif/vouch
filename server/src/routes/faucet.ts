import { Router } from 'express';
import { ethers } from 'ethers';

const router = Router();

// Token contract ABIs (simplified for mint function)
const ERC20_ABI = [
    "function mint(address to, uint256 amount) external",
    "function balanceOf(address account) external view returns (uint256)"
];

// Rate limiting: track last request timestamp per address-type combo
const lastRequest: Record<string, number> = {};
const COOLDOWN_MS = 60000; // 1 minute cooldown per token type

router.post('/', async (req, res) => {
    try {
        const { address, type } = req.body;

        if (!address || !ethers.isAddress(address)) {
            return res.status(400).json({ error: 'Invalid address' });
        }

        if (!['eth', 'usdc', 'idrx'].includes(type)) {
            return res.status(400).json({ error: 'Invalid token type. Use: eth, usdc, or idrx' });
        }

        // Rate limiting
        const key = `${address.toLowerCase()}-${type}`;
        const now = Date.now();
        if (lastRequest[key] && now - lastRequest[key] < COOLDOWN_MS) {
            const remaining = Math.ceil((COOLDOWN_MS - (now - lastRequest[key])) / 1000);
            return res.status(429).json({ error: `Please wait ${remaining}s before requesting again` });
        }

        // Setup provider and wallet
        const rpcUrl = process.env.LISK_RPC_URL || 'https://rpc.sepolia-api.lisk.com';
        const privateKey = process.env.PRIVATE_KEY;

        if (!privateKey) {
            return res.status(500).json({ error: 'Faucet not configured (no private key)' });
        }

        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers.Wallet(privateKey, provider);

        let txHash: string;
        let amount: string;

        if (type === 'eth') {
            // Send ETH for gas
            amount = '0.01';
            const tx = await wallet.sendTransaction({
                to: address,
                value: ethers.parseEther(amount),
            });
            await tx.wait();
            txHash = tx.hash;
        } else {
            // Send tokens (USDC or IDRX)
            const tokenAddress = type === 'usdc'
                ? process.env.USDC_ADDRESS || '0xdfa2072b41c353f2c345548a19bf830a4c771024'
                : process.env.IDRX_ADDRESS || '0xb6ed9eeaeebc4ac2ac4fc961045ec32b55d77185';

            const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);

            if (type === 'usdc') {
                amount = '1000';
                const tx = await tokenContract.mint(address, ethers.parseUnits(amount, 6)); // USDC 6 decimals
                await tx.wait();
                txHash = tx.hash;
            } else {
                amount = '100000';
                const tx = await tokenContract.mint(address, ethers.parseUnits(amount, 18)); // IDRX 18 decimals
                await tx.wait();
                txHash = tx.hash;
            }
        }

        // Update rate limit
        lastRequest[key] = now;

        console.log(`Faucet: Sent ${amount} ${type.toUpperCase()} to ${address}, tx: ${txHash}`);

        res.json({
            success: true,
            type,
            amount,
            txHash,
            message: `Sent ${amount} ${type.toUpperCase()} to ${address}`
        });

    } catch (error: any) {
        console.error('Faucet error:', error);
        res.status(500).json({ error: error.message || 'Faucet request failed' });
    }
});

export default router;
