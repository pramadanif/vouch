// Contract addresses and ABIs for Lisk Sepolia
// Deployed: 2025-01-29 (Updated with secure escrow flow + confirmDelivery)

export const VOUCH_ESCROW_ADDRESS = "0xf1e136dFa0f339ED6B36cA44d684da5aBC5E1005";
export const MOCK_USDC_ADDRESS = "0xdFa2072b41C353f2C345548A19BF830A4C771024";
export const MOCK_IDRX_ADDRESS = "0xb6Ed9eEAEebc4aC2ac4FC961045EC32B55D77185";

// VouchEscrow ABI - Secure escrow with buyer confirmation
export const VOUCH_ESCROW_ABI = [
    {
        name: "createEscrow",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            { name: "token", type: "address" },
            { name: "amount", type: "uint256" },
            { name: "releaseTime", type: "uint256" }
        ],
        outputs: [{ name: "escrowId", type: "uint256" }]
    },
    {
        name: "markFunded",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            { name: "escrowId", type: "uint256" },
            { name: "buyer", type: "address" }
        ],
        outputs: []
    },
    {
        name: "markShipped",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [{ name: "escrowId", type: "uint256" }],
        outputs: []
    },
    {
        name: "fundEscrow",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [{ name: "escrowId", type: "uint256" }],
        outputs: []
    },
    {
        name: "confirmDelivery",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [{ name: "escrowId", type: "uint256" }],
        outputs: []
    },
    {
        name: "releaseFunds",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [{ name: "escrowId", type: "uint256" }],
        outputs: []
    },
    {
        name: "refundEscrow",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [{ name: "escrowId", type: "uint256" }],
        outputs: []
    },
    {
        name: "getEscrow",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "escrowId", type: "uint256" }],
        outputs: [
            { name: "seller", type: "address" },
            { name: "buyer", type: "address" },
            { name: "token", type: "address" },
            { name: "amount", type: "uint256" },
            { name: "releaseTime", type: "uint256" },
            { name: "funded", type: "bool" },
            { name: "shipped", type: "bool" },
            { name: "released", type: "bool" },
            { name: "cancelled", type: "bool" }
        ]
    },
    {
        name: "getEscrowTimestamps",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "escrowId", type: "uint256" }],
        outputs: [
            { name: "createdTime", type: "uint256" },
            { name: "fundedTime", type: "uint256" },
            { name: "shippedTime", type: "uint256" },
            { name: "releaseTime", type: "uint256" }
        ]
    },
    {
        name: "getEscrowFlags",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "escrowId", type: "uint256" }],
        outputs: [
            { name: "funded", type: "bool" },
            { name: "shipped", type: "bool" },
            { name: "delivered", type: "bool" },
            { name: "released", type: "bool" },
            { name: "refunded", type: "bool" },
            { name: "cancelled", type: "bool" }
        ]
    },
    {
        name: "canAutoRelease",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "escrowId", type: "uint256" }],
        outputs: [{ name: "", type: "bool" }]
    },
    {
        name: "timeUntilAutoRelease",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "escrowId", type: "uint256" }],
        outputs: [{ name: "", type: "uint256" }]
    },
    {
        name: "getEscrowStatus",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "escrowId", type: "uint256" }],
        outputs: [{ name: "status", type: "string" }]
    },
    {
        name: "EscrowCreated",
        type: "event",
        inputs: [
            { name: "escrowId", type: "uint256", indexed: true },
            { name: "seller", type: "address", indexed: true },
            { name: "amount", type: "uint256", indexed: false },
            { name: "releaseTime", type: "uint256", indexed: false }
        ]
    },
    {
        name: "EscrowShipped",
        type: "event",
        inputs: [
            { name: "escrowId", type: "uint256", indexed: true },
            { name: "autoReleaseTime", type: "uint256", indexed: false }
        ]
    },
    {
        name: "EscrowDeliveryConfirmed",
        type: "event",
        inputs: [
            { name: "escrowId", type: "uint256", indexed: true },
            { name: "buyer", type: "address", indexed: true }
        ]
    },
    {
        name: "EscrowReleased",
        type: "event",
        inputs: [
            { name: "escrowId", type: "uint256", indexed: true },
            { name: "seller", type: "address", indexed: true },
            { name: "amount", type: "uint256", indexed: false },
            { name: "isAutoRelease", type: "bool", indexed: false }
        ]
    },
    {
        name: "EscrowRefunded",
        type: "event",
        inputs: [
            { name: "escrowId", type: "uint256", indexed: true },
            { name: "buyer", type: "address", indexed: true },
            { name: "amount", type: "uint256", indexed: false }
        ]
    }
] as const;

// ERC20 ABI for token approvals
export const ERC20_ABI = [
    {
        name: "approve",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
            { name: "spender", type: "address" },
            { name: "amount", type: "uint256" }
        ],
        outputs: [{ name: "", type: "bool" }]
    },
    {
        name: "allowance",
        type: "function",
        stateMutability: "view",
        inputs: [
            { name: "owner", type: "address" },
            { name: "spender", type: "address" }
        ],
        outputs: [{ name: "", type: "uint256" }]
    },
    {
        name: "balanceOf",
        type: "function",
        stateMutability: "view",
        inputs: [{ name: "account", type: "address" }],
        outputs: [{ name: "", type: "uint256" }]
    }
] as const;
