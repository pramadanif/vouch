// Contract addresses and ABIs for Lisk Sepolia
// Deployed: 2026-01-10

export const VOUCH_ESCROW_ADDRESS = "0xb015d8Eb15B5E82E10aCF1606c60cFD64C4c7cB2";
export const MOCK_USDC_ADDRESS = "0xB7c78ceCB25a1c40b3fa3382bAf3F34c9b5bdD66";
export const MOCK_IDRX_ADDRESS = "0xDfef62cf7516508B865440E5819e5435e69adceb";

// VouchEscrow ABI - Seller creates escrow directly (TRUE DECENTRALIZATION)
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
        name: "fundEscrow",
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
            { name: "released", type: "bool" },
            { name: "cancelled", type: "bool" }
        ]
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
