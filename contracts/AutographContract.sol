//SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "hardhat/console.sol";

contract AutographContract is ERC721Upgradeable {

    // Structs
    struct Autograph {
        address creator;
    }

    // Variables
    Autograph[] public autographs;
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
     @param from - Person who's minting the NFT (creator).
     @param tokenURI - Link to an image referencing the asset. Might include the asset name, a link to an image referencing the asset, or anything you want.
     */
    function mint(address to, address from, string memory tokenURI) public returns (uint) {
        uint newId = autographs.length;

        autographs.push(
            Autograph(from)
        );

        _safeMint(to, newId);
        _setTokenURI(newId, tokenURI);

        return newId;
    }

    /**
     @notice Returns autograph creator.
     @param tokenId - Token identifier.
     */
    function creatorOf(uint tokenId) public view returns (address) {
        return autographs[tokenId].creator;
    }

}