// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockIDRX
 * @notice Mock IDR Stablecoin for Vouch Hackathon
 * @dev Mints tokens to deployer. Has public faucet for testing.
 */
contract MockIDRX is ERC20, Ownable {
    constructor() ERC20("Rupiah Token", "IDRX") Ownable(msg.sender) {
        // Mint 1 billion IDRX to deployer
        _mint(msg.sender, 1_000_000_000 * 10**decimals());
    }

    /**
     * @notice Free faucet for testing
     * @param to Address to send tokens to
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function decimals() public view virtual override returns (uint8) {
        return 18; // Standard 18 decimals for IDRX
    }
}
