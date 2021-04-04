//SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

contract AutographContract is ERC721Upgradeable {

    // Variables
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    uint public version;

    // Events
    event ReceivedRoyalties(address indexed _royaltyRecipient, address indexed _buyer, uint256 indexed _tokenId, address _tokenPaid, uint256 _amount);

    /**
     @notice Contract initializer.
     */
    function initialize() initializer public {
        __ERC721_init("Hashink Autograph Token", "SIGN");
        version = 1;
    }

    /** 
     @notice Function used to mint a new NFT.
     @param to - Person's wallet address who will receive the NFT.
     @param tokenURI - Link to an image referencing the asset. Might include the asset name, a link to an image referencing the asset, or anything you want.
     */
    function mint(address to, string memory tokenURI) public returns (uint) {
        _tokenIds.increment();
        
        uint256 newItemId = _tokenIds.current();
        _mint(to, newItemId);
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }

}