// Contract addresses and ABIs for Lisk Sepolia

export const VOUCH_ESCROW_ADDRESS = "0xa686171bdba5a74c9891d2f199edc06aa0616fe0";
export const MOCK_USDC_ADDRESS = "0x894f2f22a6552a52b73a819ca6faf0a09880cc97";
export const MOCK_IDRX_ADDRESS = "0xd0a8edf02cd05074ede370a3c545eebd9bbdb951";

export const VOUCH_ESCROW_ABI = [
    "function createEscrow(address seller, address token, uint256 amount, uint256 releaseTime) external returns (uint256)",
    "function markFunded(uint256 escrowId, address buyer) external",
    "function fundEscrow(uint256 escrowId) external",
    "function releaseFunds(uint256 escrowId) external",
    "function refundEscrow(uint256 escrowId) external",
    "function getEscrow(uint256 escrowId) external view returns (address seller, address buyer, address token, uint256 amount, uint256 releaseTime, bool funded, bool released, bool cancelled)",
    "function getEscrowStatus(uint256 escrowId) external view returns (string)",
    "event EscrowCreated(uint256 indexed escrowId, address indexed seller, uint256 amount, uint256 releaseTime)",
    "event EscrowFunded(uint256 indexed escrowId, address indexed buyer, address token, uint256 amount)",
    "event EscrowReleased(uint256 indexed escrowId, address indexed seller, uint256 amount)",
    "event EscrowRefunded(uint256 indexed escrowId, address indexed buyer, uint256 amount)"
] as const;

export const ERC20_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function balanceOf(address account) external view returns (uint256)",
    "function mint(address to, uint256 amount) external"
] as const;
