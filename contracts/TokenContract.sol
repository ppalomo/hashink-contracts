//SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract TokenContract is ERC20, Ownable {

    /**
     @notice Contract constructor.
     */
    constructor() ERC20("Hashink Token", "INKS") {}

    function mint(address account, uint256 amount) public onlyOwner {
        _mint(account, amount);
    }

}
