// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HelloWeb3 {
    event Greeting(address indexed sender, uint256 timestamp);
    
    constructor() {}

    function hello() external {
        emit Greeting(msg.sender, block.timestamp);
    }
}

