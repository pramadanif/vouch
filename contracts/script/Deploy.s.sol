// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/VouchEscrow.sol";
import "../src/MockUSDC.sol";

contract DeployVouch is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying contracts with account:", deployer);
        
        vm.startBroadcast(deployerPrivateKey);

        // Use existing MockUSDC (USDC)
        MockUSDC usdc = MockUSDC(0xdFa2072b41C353f2C345548A19BF830A4C771024);
        console.log("Using existing MockUSDC at:", address(usdc));

        // Use existing MockUSDC (IDRX)  
        MockUSDC idrx = MockUSDC(0xb6Ed9eEAEebc4aC2ac4FC961045EC32B55D77185);
        console.log("Using existing MockIDRX at:", address(idrx));

        // Deploy VouchEscrow with deployer as protocol wallet
        // NOTE: createEscrow is now called by SELLER directly, not protocol
        VouchEscrow escrow = new VouchEscrow(deployer);
        console.log("VouchEscrow deployed to:", address(escrow));

        // Mint tokens to protocol wallet for testing fiat payments
        usdc.mint(deployer, 100_000 * 10**6);
        idrx.mint(deployer, 100_000_000 * 10**18);  // 100M IDRX
        console.log("Minted tokens to protocol wallet");

        // Approve escrow contract to spend tokens (for markFunded fiat flow)
        usdc.approve(address(escrow), type(uint256).max);
        idrx.approve(address(escrow), type(uint256).max);
        console.log("Approved VouchEscrow for token spending");

        vm.stopBroadcast();

        console.log("");
        console.log("========================================");
        console.log("DEPLOYMENT COMPLETE!");
        console.log("========================================");
        console.log("MockUSDC:       ", address(usdc));
        console.log("MockIDRX:       ", address(idrx));
        console.log("VouchEscrow:    ", address(escrow));
        console.log("Protocol Wallet:", deployer);
        console.log("");
        console.log("Update lib/contracts.ts with:");
        console.log("MOCK_USDC_ADDRESS =", address(usdc));
        console.log("MOCK_IDRX_ADDRESS =", address(idrx));
        console.log("VOUCH_ESCROW_ADDRESS =", address(escrow));
        console.log("========================================");
    }
}
