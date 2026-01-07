import { ethers } from 'ethers';

// VouchEscrow ABI (minimal interface)
const ESCROW_ABI = [
    "function createEscrow(address seller, address token, uint256 amount, uint256 releaseTime) external returns (uint256 escrowId)",
    "function markFunded(uint256 escrowId, address buyer) external",
    "function releaseFunds(uint256 escrowId) external",
    "function getEscrow(uint256 escrowId) external view returns (address seller, address buyer, address token, uint256 amount, uint256 releaseTime, bool funded, bool released, bool cancelled)",
    "function getEscrowStatus(uint256 escrowId) external view returns (string memory status)",
    "function escrowCounter() external view returns (uint256)",
    "event EscrowCreated(uint256 indexed escrowId, address indexed seller, uint256 amount, uint256 releaseTime)",
    "event EscrowFunded(uint256 indexed escrowId, address indexed buyer, address token, uint256 amount)",
    "event EscrowReleased(uint256 indexed escrowId, address indexed seller, uint256 amount)"
];

// ERC20 ABI (for USDC approval)
const ERC20_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function balanceOf(address account) external view returns (uint256)"
];

class WalletManager {
    private provider: ethers.JsonRpcProvider;
    private wallet: ethers.Wallet;
    private escrowContract: ethers.Contract;
    private usdcContract: ethers.Contract;
    private idrxContract: ethers.Contract;

    constructor() {
        const rpcUrl = process.env.LISK_RPC_URL || 'https://rpc.sepolia-api.lisk.com';
        const privateKey = process.env.PRIVATE_KEY;
        const escrowAddress = process.env.VOUCH_ESCROW_ADDRESS; // Updated env var name
        const usdcAddress = process.env.USDC_ADDRESS; // Updated env var name
        const idrxAddress = process.env.IDRX_ADDRESS; // New env var

        if (!privateKey) {
            throw new Error('PRIVATE_KEY not set');
        }

        this.provider = new ethers.JsonRpcProvider(rpcUrl);
        this.wallet = new ethers.Wallet(privateKey, this.provider);

        if (escrowAddress) {
            this.escrowContract = new ethers.Contract(escrowAddress, ESCROW_ABI, this.wallet);
        } else {
            console.warn('VOUCH_ESCROW_ADDRESS not set - contract calls will fail');
            this.escrowContract = null as any;
        }

        if (usdcAddress) {
            this.usdcContract = new ethers.Contract(usdcAddress, ERC20_ABI, this.wallet);
        } else {
            console.warn('USDC_ADDRESS not set - USDC calls will fail');
            this.usdcContract = null as any;
        }

        if (idrxAddress) {
            this.idrxContract = new ethers.Contract(idrxAddress, ERC20_ABI, this.wallet);
        } else {
            console.warn('IDRX_ADDRESS not set - IDRX calls will fail');
            this.idrxContract = null as any;
        }

        console.log(`Wallet initialized: ${this.wallet.address}`);
    }

    get address(): string {
        return this.wallet.address;
    }

    get usdcAddress(): string {
        return this.usdcContract?.target as string;
    }

    get idrxAddress(): string {
        return this.idrxContract?.target as string;
    }

    /**
     * Create an escrow on-chain
     */
    async createEscrow(
        seller: string,
        tokenAddress: string,
        amount: string,
        decimals: number,
        releaseDuration: number
    ): Promise<{
        escrowId: number;
        releaseTime: number;
        txHash: string;
    }> {
        // Calculate release time
        const releaseTime = Math.floor(Date.now() / 1000) + releaseDuration;

        // Amount in smallest units
        const amountWei = ethers.parseUnits(amount, decimals);

        console.log(`Creating escrow: seller=${seller}, token=${tokenAddress}, amount=${amount}, releaseTime=${releaseTime}`);

        // Call createEscrow on contract
        const tx = await this.escrowContract.createEscrow(seller, tokenAddress, amountWei, releaseTime);
        const receipt = await tx.wait();

        // Parse event to get escrowId
        const event = receipt.logs
            .map((log: any) => {
                try {
                    return this.escrowContract.interface.parseLog(log);
                } catch {
                    return null;
                }
            })
            .find((e: any) => e?.name === 'EscrowCreated');

        const escrowId = Number(event?.args?.escrowId || 0);

        console.log(`Escrow created: id=${escrowId}, tx=${receipt.hash}`);

        return {
            escrowId,
            releaseTime,
            txHash: receipt.hash
        };
    }

    /**
     * Mark escrow as funded (called after Xendit payment success)
     * Protocol wallet pays in the specified token (must approve first)
     */
    async markFunded(escrowId: number, tokenAddress: string, amountWei: string, buyerAddress?: string): Promise<string> {
        const buyer = buyerAddress || ethers.ZeroAddress;

        console.log(`Marking escrow ${escrowId} as funded, buyer=${buyer}`);

        // Approve token transfer if needed (simplified: assume max approval done manually or adding auto-approve here)
        // Ideally checking allowance:
        const tokenContract = tokenAddress === this.usdcAddress ? this.usdcContract : this.idrxContract;
        if (tokenContract) {
            const allowance = await tokenContract.allowance(this.wallet.address, this.escrowContract.target);
            if (allowance < BigInt(amountWei)) {
                console.log(`Approving token ${tokenAddress}...`);
                const txApprove = await tokenContract.approve(this.escrowContract.target, ethers.MaxUint256);
                await txApprove.wait();
            }
        }

        const tx = await this.escrowContract.markFunded(escrowId, buyer);
        const receipt = await tx.wait();

        console.log(`Escrow ${escrowId} marked funded, tx=${receipt.hash}`);

        return receipt.hash;
    }

    /**
     * Release funds to seller
     */
    async releaseFunds(escrowId: number): Promise<string> {
        console.log(`Releasing funds for escrow ${escrowId}`);

        const tx = await this.escrowContract.releaseFunds(escrowId);
        const receipt = await tx.wait();

        console.log(`Escrow ${escrowId} released, tx=${receipt.hash}`);

        return receipt.hash;
    }

    /**
     * Get escrow status from chain
     */
    async getEscrowStatus(escrowId: number): Promise<string> {
        return await this.escrowContract.getEscrowStatus(escrowId);
    }

    /**
     * Get escrow details from chain
     */
    async getEscrowDetails(escrowId: number): Promise<{
        seller: string;
        buyer: string;
        token: string;
        amount: string; // Returns raw wei string, caller handles decimals
        releaseTime: number;
        funded: boolean;
        released: boolean;
        cancelled: boolean;
    }> {
        const result = await this.escrowContract.getEscrow(escrowId);
        return {
            seller: result[0],
            buyer: result[1],
            token: result[2],
            amount: result[3].toString(),
            releaseTime: Number(result[4]),
            funded: result[5],
            released: result[6],
            cancelled: result[7]
        };
    }

    /**
     * Check wallet balance
     */
    async getBalance(): Promise<string> {
        const balance = await this.provider.getBalance(this.wallet.address);
        return ethers.formatEther(balance);
    }

    /**
     * Check USDC balance
     */
    async getUsdcBalance(): Promise<string> {
        if (!this.usdcContract) return '0';
        const balance = await this.usdcContract.balanceOf(this.wallet.address);
        return ethers.formatUnits(balance, 6);
    }
}

// Singleton instance
let walletManager: WalletManager | null = null;

export function getWalletManager(): WalletManager {
    if (!walletManager) {
        walletManager = new WalletManager();
    }
    return walletManager;
}

export default WalletManager;
