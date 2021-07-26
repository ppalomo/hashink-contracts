//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

/** 
 * @title Autograph ERC721 contract interface.
 */
interface IAutographContract {

    /**
     * @notice Function used to mint a new NFT.
     * @param to - Person's wallet address who will receive the NFT.
     * @param signers - Signer list / creators.
     * @param imgURI - Link to an image referencing the asset.
     * @param metadataURI - Link to metadata.
     */
    function mint(
        address to, 
        address[] memory signers, 
        string memory imgURI, 
        string memory metadataURI
        ) external returns (uint);   
    
    function ownerOf(uint256 tokenId) external view returns (address);

}