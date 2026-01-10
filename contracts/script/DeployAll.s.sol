// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/MockUSDC.sol";
import "../src/MockIDRX.sol";
import "../src/VouchEscrow.sol";

contract DeployAll is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);

        MockUSDC usdc = new MockUSDC();
        console.log("MockUSDC deployed to:", address(usdc));

        MockIDRX idrx = new MockIDRX();
        console.log("MockIDRX deployed to:", address(idrx));

        VouchEscrow escrow = new VouchEscrow(vm.addr(deployerPrivateKey));
        console.log("VouchEscrow deployed to:", address(escrow));

        vm.stopBroadcast();
    }
}
