//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import '@openzeppelin/contracts/access/Ownable.sol';
import "hardhat/console.sol";

/**
 * @title Hashink token ERC20.
 */
contract HashinkToken is ERC20, Ownable {

    /**
     @notice Contract constructor.
     */
    constructor() ERC20("Hashink Token", "INKS") {}

    function mint(address _to, uint _amount) external onlyOwner {
        _mint(_to, _amount);
    }

}