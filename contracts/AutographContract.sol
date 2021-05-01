//SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "hardhat/console.sol";

contract AutographContract is ERC721Upgradeable {

    // Structs
    struct Autograph {
        address[] creators;
        string imageURI;
    }

    // Variables
    Autograph[] public autographs;

    // Events
    event AutographMinted(uint id, address[] creators, address indexed owner, string imageURI, string metadataURI);

    /**
     @notice Contract initializer.
     */
    function initialize() initializer public {
        __ERC721_init("Hashink Autograph Token", "GRF");
    }

/** 
     @notice Function used to mint a new NFT.
     @param to - Person's wallet address who will receive the NFT.
     @param signers - Signer list / creators.
     @param imageURI - Link to an image referencing the asset.
     @param metadataURI - Link to metadata.
     */
    function mint(address to, address[] memory signers, string memory imageURI, string memory metadataURI) public returns (uint) {
        uint newId = autographs.length;

        autographs.push(
            Autograph(signers, imageURI)
        );

        _safeMint(to, newId);
        _setTokenURI(newId, metadataURI);

        emit AutographMinted(newId, signers, to, imageURI, metadataURI);
        return newId;
    }

    /**
     @notice Returns autograph creator.
     @param tokenId - Token identifier.
     */
    function creatorOf(uint tokenId) public view returns (address[] memory) {
        return autographs[tokenId].creators;
    }

}