// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title VouchEscrow
 * @notice Secure escrow contract for Vouch payment links on Lisk
 * @dev Non-custodial escrow with buyer confirmation requirement
 * 
 * SECURITY MODEL:
 * - Funds are ONLY released when buyer confirms OR timeout elapses
 * - Seller CANNOT release funds unilaterally
 * - Protocol wallet can only release after timeout (auto-release protection)
 * - Protocol wallet can refund for dispute resolution
 * 
 * FLOW:
 * 1. Seller creates escrow → CREATED
 * 2. Buyer pays (fiat via backend OR crypto direct) → FUNDED
 * 3. Seller ships item → SHIPPED (starts 14-day timeout)
 * 4. Buyer confirms receipt → DELIVERED → funds released
 * 5. OR 14 days pass → Protocol can auto-release (protects seller)
 * 6. OR Dispute → Protocol can refund (protects buyer)
 * 
 * TIMEOUTS:
 * - releaseTime: Unix timestamp when protocol can auto-release
 * - shippedTime: When seller marked shipped (for timeout calculation)
 * - AUTO_RELEASE_DELAY: 14 days after shipping
 */
contract VouchEscrow is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============ Constants ============
    
    uint256 public constant AUTO_RELEASE_DELAY = 14 days; // Time after shipping before auto-release
    uint256 public constant SHIPPING_DEADLINE = 30 days;  // Time after funding for seller to ship

    // ============ Structs ============

    struct Escrow {
        address seller;
        address buyer;          // Can be zero address for anonymous fiat buyer
        address token;          // Token used for payment (USDC, IDRX, etc)
        uint256 amount;         // Token amount
        uint256 createdTime;    // When escrow was created
        uint256 fundedTime;     // When payment was received (0 if not funded)
        uint256 shippedTime;    // When seller shipped (0 if not shipped)
        uint256 releaseTime;    // Timestamp when auto-release is possible
        bool funded;            // True after payment success
        bool shipped;           // True after seller ships
        bool delivered;         // True after buyer confirms (NEW)
        bool released;          // True after funds sent to seller
        bool refunded;          // True if refunded to buyer (NEW - separate from cancelled)
        bool cancelled;         // True if escrow was cancelled (unfunded only)
    }

    // ============ State ============

    address public protocolWallet;      // Hot wallet that manages escrows
    uint256 public escrowCounter;       // Auto-incrementing escrow ID
    uint256 public feeBasisPoints = 100; // 1% fee (100 bps)
    
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
    event EscrowShipped(uint256 indexed escrowId, uint256 autoReleaseTime);
    event EscrowDeliveryConfirmed(uint256 indexed escrowId, address indexed buyer);
    event EscrowReleased(uint256 indexed escrowId, address indexed seller, uint256 amount, bool isAutoRelease);
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
     * @param releaseTime Unix timestamp for auto-release eligibility (informational, actual uses shippedTime + delay)
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
            createdTime: block.timestamp,
            fundedTime: 0,
            shippedTime: 0,
            releaseTime: releaseTime,
            funded: false,
            shipped: false,
            delivered: false,
            released: false,
            refunded: false,
            cancelled: false
        });

        sellerEscrows[seller].push(escrowId);

        emit EscrowCreated(escrowId, seller, amount, releaseTime);
    }

    /**
     * @notice Mark escrow as funded after Xendit payment success (Fiat)
     * @dev Protocol wallet must have approved Token transfer before calling
     * @param escrowId The escrow to mark as funded
     * @param buyer Optional buyer address (can be zero for anonymous fiat)
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
        escrow.fundedTime = block.timestamp;

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
        escrow.fundedTime = block.timestamp;

        emit EscrowFunded(escrowId, msg.sender, escrow.token, escrow.amount);
    }

    /**
     * @notice Mark escrow as shipped
     * @dev Can be called by Protocol (after backend upload) or Seller directly
     * @dev Starts the auto-release countdown (14 days)
     * @param escrowId The escrow to mark as shipped
     */
    function markShipped(uint256 escrowId) external {
        Escrow storage escrow = escrows[escrowId];
        
        require(escrow.funded, "VouchEscrow: not funded");
        require(!escrow.shipped, "VouchEscrow: already shipped");
        require(!escrow.cancelled, "VouchEscrow: escrow cancelled");
        require(!escrow.refunded, "VouchEscrow: escrow refunded");
        
        // Authorization: Protocol or Seller
        require(
            msg.sender == protocolWallet || msg.sender == escrow.seller,
            "VouchEscrow: unauthorized"
        );

        escrow.shipped = true;
        escrow.shippedTime = block.timestamp;
        
        // Update releaseTime to be shippedTime + AUTO_RELEASE_DELAY
        uint256 autoReleaseTime = block.timestamp + AUTO_RELEASE_DELAY;
        escrow.releaseTime = autoReleaseTime;
        
        emit EscrowShipped(escrowId, autoReleaseTime);
    }

    /**
     * @notice Buyer confirms delivery - this releases funds to seller
     * @dev CRITICAL: This is the SAFE way to release funds
     * @param escrowId The escrow to confirm
     */
    function confirmDelivery(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        
        require(escrow.funded, "VouchEscrow: not funded");
        require(escrow.shipped, "VouchEscrow: not shipped yet");
        require(!escrow.released, "VouchEscrow: already released");
        require(!escrow.refunded, "VouchEscrow: already refunded");
        require(!escrow.cancelled, "VouchEscrow: escrow cancelled");
        
        // CRITICAL: Only buyer can confirm delivery
        require(
            msg.sender == escrow.buyer && escrow.buyer != address(0),
            "VouchEscrow: only buyer can confirm delivery"
        );

        escrow.delivered = true;
        
        emit EscrowDeliveryConfirmed(escrowId, msg.sender);
        
        // Immediately release funds after confirmation
        _releaseFunds(escrowId, false);
    }

    /**
     * @notice Release funds to seller
     * @dev Can be called by:
     *      - Buyer directly (immediate release after confirmation) - use confirmDelivery instead
     *      - Protocol wallet after releaseTime (auto-release protection for seller)
     * @param escrowId The escrow to release
     */
    function releaseFunds(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        
        require(escrow.funded, "VouchEscrow: not funded");
        require(!escrow.released, "VouchEscrow: already released");
        require(!escrow.refunded, "VouchEscrow: already refunded");
        require(!escrow.cancelled, "VouchEscrow: escrow cancelled");

        // SECURITY: Strict authorization
        bool isBuyerConfirmed = escrow.delivered && msg.sender == escrow.buyer;
        bool isProtocolAutoRelease = msg.sender == protocolWallet && 
                                     escrow.shipped && 
                                     block.timestamp >= escrow.releaseTime;
        
        require(
            isBuyerConfirmed || isProtocolAutoRelease, 
            "VouchEscrow: not authorized - buyer must confirm delivery or wait for auto-release"
        );

        _releaseFunds(escrowId, isProtocolAutoRelease);
    }

    /**
     * @notice Internal function to release funds
     */
    function _releaseFunds(uint256 escrowId, bool isAutoRelease) internal {
        Escrow storage escrow = escrows[escrowId];
        
        escrow.released = true;

        // Calculate 1% fee
        uint256 fee = (escrow.amount * feeBasisPoints) / 10000;
        uint256 sellerAmount = escrow.amount - fee;

        // Transfer to seller
        IERC20(escrow.token).safeTransfer(escrow.seller, sellerAmount);
        
        // Transfer fee to protocol wallet
        if (fee > 0) {
            IERC20(escrow.token).safeTransfer(protocolWallet, fee);
        }

        emit EscrowReleased(escrowId, escrow.seller, sellerAmount, isAutoRelease);
    }

    /**
     * @notice Cancel an unfunded escrow
     * @param escrowId The escrow to cancel
     */
    function cancelEscrow(uint256 escrowId) external {
        Escrow storage escrow = escrows[escrowId];
        
        require(!escrow.funded, "VouchEscrow: cannot cancel funded escrow");
        require(!escrow.cancelled, "VouchEscrow: already cancelled");
        require(escrow.seller != address(0), "VouchEscrow: escrow does not exist");
        
        // Can be cancelled by seller or protocol
        require(
            msg.sender == escrow.seller || msg.sender == protocolWallet,
            "VouchEscrow: unauthorized"
        );

        escrow.cancelled = true;

        emit EscrowCancelled(escrowId);
    }

    /**
     * @notice Refund a funded escrow to buyer
     * @dev Can only be called by protocol wallet for dispute resolution or seller cancellation
     * @param escrowId The escrow to refund
     */
    function refundEscrow(uint256 escrowId) external onlyProtocol nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        
        require(escrow.funded, "VouchEscrow: not funded");
        require(!escrow.released, "VouchEscrow: already released");
        require(!escrow.refunded, "VouchEscrow: already refunded");
        require(escrow.buyer != address(0), "VouchEscrow: no buyer address");

        escrow.refunded = true;
        IERC20(escrow.token).safeTransfer(escrow.buyer, escrow.amount);

        emit EscrowRefunded(escrowId, escrow.buyer, escrow.amount);
    }

    // ============ View Functions ============

    /**
     * @notice Get escrow details
     */
    function getEscrow(uint256 escrowId) external view returns (
        address seller,
        address buyer,
        address token,
        uint256 amount,
        uint256 releaseTime,
        bool funded,
        bool shipped,
        bool released,
        bool cancelled
    ) {
        Escrow storage e = escrows[escrowId];
        return (
            e.seller,
            e.buyer,
            e.token,
            e.amount,
            e.releaseTime,
            e.funded,
            e.shipped,
            e.released,
            e.cancelled || e.refunded
        );
    }

    /**
     * @notice Get timestamp details for an escrow
     */
    function getEscrowTimestamps(uint256 escrowId) external view returns (
        uint256 createdTime,
        uint256 fundedTime,
        uint256 shippedTime,
        uint256 releaseTime
    ) {
        Escrow storage e = escrows[escrowId];
        return (e.createdTime, e.fundedTime, e.shippedTime, e.releaseTime);
    }

    /**
     * @notice Get status flags for an escrow
     */
    function getEscrowFlags(uint256 escrowId) external view returns (
        bool funded,
        bool shipped,
        bool delivered,
        bool released,
        bool refunded,
        bool cancelled
    ) {
        Escrow storage e = escrows[escrowId];
        return (e.funded, e.shipped, e.delivered, e.released, e.refunded, e.cancelled);
    }

    /**
     * @notice Check if escrow can be auto-released
     */
    function canAutoRelease(uint256 escrowId) external view returns (bool) {
        Escrow storage escrow = escrows[escrowId];
        return escrow.funded && 
               escrow.shipped && 
               !escrow.released && 
               !escrow.refunded &&
               block.timestamp >= escrow.releaseTime;
    }

    /**
     * @notice Get time remaining until auto-release (0 if ready)
     */
    function timeUntilAutoRelease(uint256 escrowId) external view returns (uint256) {
        Escrow storage escrow = escrows[escrowId];
        if (!escrow.shipped || escrow.released || escrow.refunded) return 0;
        if (block.timestamp >= escrow.releaseTime) return 0;
        return escrow.releaseTime - block.timestamp;
    }

    /**
     * @notice Get all escrow IDs for a seller
     */
    function getSellerEscrows(address seller) external view returns (uint256[] memory) {
        return sellerEscrows[seller];
    }

    /**
     * @notice Get escrow status as a string for frontend display
     */
    function getEscrowStatus(uint256 escrowId) external view returns (string memory status) {
        Escrow storage escrow = escrows[escrowId];
        
        if (escrow.refunded) return "REFUNDED";
        if (escrow.cancelled) return "CANCELLED";
        if (escrow.released) return "RELEASED";
        if (escrow.delivered) return "DELIVERED";
        if (escrow.funded) {
            if (escrow.shipped) {
                if (block.timestamp >= escrow.releaseTime) return "READY_TO_RELEASE";
                return "SHIPPED";
            }
            return "FUNDED";
        }
        if (escrow.seller != address(0)) return "WAITING_PAYMENT";
        return "NOT_FOUND";
    }

    // ============ Admin Functions ============

    /**
     * @notice Update protocol wallet address
     */
    function updateProtocolWallet(address newWallet) external onlyProtocol {
        require(newWallet != address(0), "VouchEscrow: invalid wallet");
        
        address oldWallet = protocolWallet;
        protocolWallet = newWallet;
        
        emit ProtocolWalletUpdated(oldWallet, newWallet);
    }

    /**
     * @notice Update fee (only protocol)
     * @param newFeeBps New fee in basis points (100 = 1%)
     */
    function updateFee(uint256 newFeeBps) external onlyProtocol {
        require(newFeeBps <= 500, "VouchEscrow: fee too high (max 5%)");
        feeBasisPoints = newFeeBps;
    }
}
