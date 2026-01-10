// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title VouchEscrow
 * @notice Escrow contract for Vouch payment links on Lisk
 * @dev True decentralization: Seller creates escrow directly, proving ownership
 * 
 * Flow:
 * 1. Seller creates payment link → Seller wallet calls createEscrow() directly
 * 2. Buyer pays via Xendit → Backend calls markFunded()
 * 3. Buyer pays via Crypto → Buyer wallet calls fundEscrow()
 * 4. Buyer confirms OR time elapses → releaseFunds() sends funds to seller
 */
contract VouchEscrow is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============ Structs ============

    struct Escrow {
        address seller;
        address buyer;          // Can be zero address for anonymous buyer
        address token;          // Token used for payment (USDC, IDRX, etc)
        uint256 amount;         // Token amount
        uint256 releaseTime;    // Timestamp when auto-release is possible
        bool funded;            // True after payment success
        bool released;          // True after funds sent to seller
        bool cancelled;         // True if escrow was cancelled
    }

    // ============ State ============

    address public protocolWallet;      // Hot wallet that manages escrows
    uint256 public escrowCounter;       // Auto-incrementing escrow ID
    
    mapping(uint256 => Escrow) public escrows;
    mapping(address => uint256[]) public sellerEscrows;  // Seller address → escrow IDs

    // ============ Events ============

    event EscrowCreated(
        uint256 indexed escrowId,
        address indexed seller,
        uint256 amount,
        uint256 releaseTime
    );
    
    event EscrowFunded(uint256 indexed escrowId, address indexed buyer, address token, uint256 amount);
    event EscrowReleased(uint256 indexed escrowId, address indexed seller, uint256 amount);
    event EscrowCancelled(uint256 indexed escrowId);
    event EscrowRefunded(uint256 indexed escrowId, address indexed buyer, uint256 amount);
    event ProtocolWalletUpdated(address indexed oldWallet, address indexed newWallet);

    // ============ Modifiers ============

    modifier onlyProtocol() {
        require(msg.sender == protocolWallet, "VouchEscrow: caller is not protocol wallet");
        _;
    }

    // ============ Constructor ============

    /**
     * @param _protocolWallet Protocol hot wallet address
     */
    constructor(address _protocolWallet) {
        require(_protocolWallet != address(0), "VouchEscrow: invalid protocol wallet");
        
        protocolWallet = _protocolWallet;
    }

    // ============ External Functions ============

    /**
     * @notice Create a new escrow - seller calls directly
     * @dev Seller is msg.sender, proving ownership of the address
     * @param token Token to be used for payment
     * @param amount Token amount in smallest units
     * @param releaseTime Unix timestamp for auto-release eligibility
     * @return escrowId The ID of the created escrow
     */
    function createEscrow(
        address token,
        uint256 amount,
        uint256 releaseTime
    ) external returns (uint256 escrowId) {
        address seller = msg.sender;  // Seller is the caller - TRUE DECENTRALIZATION
        
        require(token != address(0), "VouchEscrow: invalid token");
        require(amount > 0, "VouchEscrow: amount must be > 0");
        require(releaseTime > block.timestamp, "VouchEscrow: releaseTime must be future");

        escrowId = escrowCounter++;
        
        escrows[escrowId] = Escrow({
            seller: seller,
            buyer: address(0),
            token: token,
            amount: amount,
            releaseTime: releaseTime,
            funded: false,
            released: false,
            cancelled: false
        });

        sellerEscrows[seller].push(escrowId);

        emit EscrowCreated(escrowId, seller, amount, releaseTime);
    }

    /**
     * @notice Mark escrow as funded after Xendit payment success (Fiat)
     * @dev Protocol wallet must have approved Token transfer before calling
     * @param escrowId The escrow to mark as funded
     * @param buyer Optional buyer address (can be zero)
     */
    function markFunded(uint256 escrowId, address buyer) external onlyProtocol nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        
        require(!escrow.funded, "VouchEscrow: already funded");
        require(!escrow.cancelled, "VouchEscrow: escrow cancelled");
        require(escrow.seller != address(0), "VouchEscrow: escrow does not exist");

        // Transfer Tokens from protocol wallet to this contract
        IERC20(escrow.token).safeTransferFrom(msg.sender, address(this), escrow.amount);

        escrow.buyer = buyer;
        escrow.funded = true;

        emit EscrowFunded(escrowId, buyer, escrow.token, escrow.amount);
    }

    /**
     * @notice Fund escrow directly with Crypto
     * @dev Buyer must have approved Token transfer before calling
     * @param escrowId The escrow to fund
     */
    function fundEscrow(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        
        require(!escrow.funded, "VouchEscrow: already funded");
        require(!escrow.cancelled, "VouchEscrow: escrow cancelled");
        require(escrow.seller != address(0), "VouchEscrow: escrow does not exist");
        require(escrow.releaseTime > block.timestamp, "VouchEscrow: escrow expired");

        // Transfer Tokens from buyer to this contract
        IERC20(escrow.token).safeTransferFrom(msg.sender, address(this), escrow.amount);

        escrow.buyer = msg.sender;
        escrow.funded = true;

        emit EscrowFunded(escrowId, msg.sender, escrow.token, escrow.amount);
    }

    /**
     * @notice Release funds to seller
     * @dev Can be called by buyer (immediate) or protocol after releaseTime
     * @param escrowId The escrow to release
     */
    function releaseFunds(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        
        require(escrow.funded, "VouchEscrow: not funded");
        require(!escrow.released, "VouchEscrow: already released");
        require(!escrow.cancelled, "VouchEscrow: escrow cancelled");

        // Authorization: buyer can release immediately, protocol after time elapsed
        bool isBuyer = msg.sender == escrow.buyer && escrow.buyer != address(0);
        bool isProtocolAfterTime = msg.sender == protocolWallet && block.timestamp >= escrow.releaseTime;
        
        require(isBuyer || isProtocolAfterTime, "VouchEscrow: not authorized to release");

        escrow.released = true;
        IERC20(escrow.token).safeTransfer(escrow.seller, escrow.amount);

        emit EscrowReleased(escrowId, escrow.seller, escrow.amount);
    }

    /**
     * @notice Cancel an unfunded escrow
     * @param escrowId The escrow to cancel
     */
    function cancelEscrow(uint256 escrowId) external onlyProtocol {
        Escrow storage escrow = escrows[escrowId];
        
        require(!escrow.funded, "VouchEscrow: cannot cancel funded escrow");
        require(!escrow.cancelled, "VouchEscrow: already cancelled");
        require(escrow.seller != address(0), "VouchEscrow: escrow does not exist");

        escrow.cancelled = true;

        emit EscrowCancelled(escrowId);
    }

    /**
     * @notice Refund a funded escrow to buyer
     * @dev Can only be called by protocol wallet for dispute resolution
     * @param escrowId The escrow to refund
     */
    function refundEscrow(uint256 escrowId) external onlyProtocol nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        
        require(escrow.funded, "VouchEscrow: not funded");
        require(!escrow.released, "VouchEscrow: already released");
        require(!escrow.cancelled, "VouchEscrow: escrow cancelled");
        require(escrow.buyer != address(0), "VouchEscrow: no buyer address");

        escrow.cancelled = true;
        IERC20(escrow.token).safeTransfer(escrow.buyer, escrow.amount);

        emit EscrowRefunded(escrowId, escrow.buyer, escrow.amount);
    }

    // ============ View Functions ============

    /**
     * @notice Get escrow details
     * @param escrowId The escrow ID
     * @return seller Seller address
     * @return buyer Buyer address (may be zero)
     * @return token Token address
     * @return amount Token amount
     * @return releaseTime Auto-release timestamp
     * @return funded Whether funded
     * @return released Whether released
     * @return cancelled Whether cancelled
     */
    function getEscrow(uint256 escrowId) external view returns (
        address seller,
        address buyer,
        address token,
        uint256 amount,
        uint256 releaseTime,
        bool funded,
        bool released,
        bool cancelled
    ) {
        Escrow storage escrow = escrows[escrowId];
        return (
            escrow.seller,
            escrow.buyer,
            escrow.token,
            escrow.amount,
            escrow.releaseTime,
            escrow.funded,
            escrow.released,
            escrow.cancelled
        );
    }

    /**
     * @notice Get all escrow IDs for a seller
     * @param seller The seller address
     * @return Array of escrow IDs
     */
    function getSellerEscrows(address seller) external view returns (uint256[] memory) {
        return sellerEscrows[seller];
    }

    /**
     * @notice Get escrow status as a string for frontend display
     * @param escrowId The escrow ID
     * @return status String status
     */
    function getEscrowStatus(uint256 escrowId) external view returns (string memory status) {
        Escrow storage escrow = escrows[escrowId];
        
        if (escrow.cancelled) return "CANCELLED";
        if (escrow.released) return "RELEASED";
        if (escrow.funded) {
            if (block.timestamp >= escrow.releaseTime) return "READY_TO_RELEASE";
            return "FUNDED";
        }
        if (escrow.seller != address(0)) return "WAITING_PAYMENT";
        return "NOT_FOUND";
    }

    // ============ Admin Functions ============

    /**
     * @notice Update protocol wallet address
     * @param newWallet New protocol wallet address
     */
    function updateProtocolWallet(address newWallet) external onlyProtocol {
        require(newWallet != address(0), "VouchEscrow: invalid wallet");
        
        address oldWallet = protocolWallet;
        protocolWallet = newWallet;
        
        emit ProtocolWalletUpdated(oldWallet, newWallet);
    }
}
