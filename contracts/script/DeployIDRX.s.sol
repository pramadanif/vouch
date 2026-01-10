// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/MockIDRX.sol";

contract DeployIDRX is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);

        MockIDRX idrx = new MockIDRX();
        console.log("MockIDRX deployed to:", address(idrx));

        vm.stopBroadcast();
    }
}
