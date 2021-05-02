//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";

import "hardhat/console.sol";

contract AutographContract is ERC721Upgradeable, ERC721URIStorageUpgradeable {

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
     @param imgURI - Link to an image referencing the asset.
     @param metadataURI - Link to metadata.
     */
    function mint(address to, address[] memory signers, string memory imgURI, string memory metadataURI) public returns (uint) {
        uint newId = autographs.length;

        autographs.push(
            Autograph(signers, imgURI)
        );

        _safeMint(to, newId);
        _setTokenURI(newId, metadataURI);

        emit AutographMinted(newId, signers, to, imgURI, metadataURI);
        return newId;
    }

    /**
     @notice Returns autograph creator.
     @param tokenId - Token identifier.
     */
    function creatorOf(uint tokenId) public view returns (address[] memory) {
        return autographs[tokenId].creators;
    }

    /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 tokenId) public view override(ERC721Upgradeable, ERC721URIStorageUpgradeable) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    /**
    @notice Returns image URI.
    @param tokenId - Token identifier.
     */
    function imageURI(uint tokenId) public view returns (string memory) {
        return autographs[tokenId].imageURI;
    }

    /**
     * @dev See {IERC721Enumerable-totalSupply}.
     */
    function totalSupply() public view returns (uint256) {
        return autographs.length;
    }

    /**
    @notice Burning function.
     */
    function _burn(uint256 tokenId) internal override(ERC721Upgradeable, ERC721URIStorageUpgradeable) {
        super._burn(tokenId);
    }

}