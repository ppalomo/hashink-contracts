//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "hardhat/console.sol";

contract AutographContract is ERC721Upgradeable, ERC721URIStorageUpgradeable {

    // Structs
    struct Autograph {
        address[] creators;
        string imageURI;
    }

    // Variables
    address public royaltiesToken;
    uint public royaltiesAmount;
    Autograph[] public autographs;
    // mapping(uint => mapping(address => bool)) public excludedList;

    // Events
    event AutographMinted(uint id, address[] creators, address indexed owner, string imageURI, string metadataURI);

    /**
     * @notice Contract initializer.
     * @param _royaltiesToken - Token used to pay royalties.
     * @param _royaltiesAmount - Amount to be payed as royalties.
     */
    function initialize(address _royaltiesToken, uint _royaltiesAmount) initializer public {
        __ERC721_init("Hashink Autograph Token", "GRF");

        royaltiesToken = _royaltiesToken;
        royaltiesAmount = _royaltiesAmount;
    }

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
        ) public returns (uint) {

        uint newId = autographs.length;

        autographs.push(
            Autograph(signers, imgURI)
        );

        _safeMint(to, newId);
        _setTokenURI(newId, metadataURI);

        // // Excluding signers to pay royalties
        // for (uint i=0; i<signers.length; i++) {
        //     excludedList[i][signers[i]] = true;
        // }

        emit AutographMinted(newId, signers, to, imgURI, metadataURI);
        return newId;
    }

    /**
     * @notice Returns autograph creator.
     * @param tokenId - Token identifier.
     */
    function creatorOf(uint tokenId) public view returns (address[] memory) {
        return autographs[tokenId].creators;
    }

    /**
     * @notice Returns image URI.
     * @param tokenId - Token identifier.
     */
    function imageURI(uint tokenId) public view returns (string memory) {
        return autographs[tokenId].imageURI;
    }


    /**
     * @notice See {IERC721Metadata-tokenURI}
     * @param tokenId - Token identifier.
     */
    function tokenURI(uint256 tokenId) public view override(ERC721Upgradeable, ERC721URIStorageUpgradeable) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    /**
     * @notice See {IERC721Enumerable-totalSupply}
     */
    function totalSupply() public view returns (uint256) {
        return autographs.length;
    }

    /**
     * @notice ERC20 trasnfer function override to add royalties.
     * @param from - Address that wants to transfer the token.
     * @param to - Address to receive the token.
     * @param tokenId - Token identifier.
     */
    function transferFrom(address from, address to, uint256 tokenId) public override {
        require(_isApprovedOrOwner(_msgSender(), tokenId), 'ERC721: transfer caller is not owner nor approved');
     
        // Paying royalties to token creator
        // if(excludedList[from] == false) {
        _payRoyalties(from, tokenId);
        // }

        // Transfering the token
        _transfer(from, to, tokenId);
    }

    /**
     * @notice ERC20 trasnfer function override to add royalties.
     * @param from - Address that wants to transfer the token.
     * @param to - Address to receive the token.
     * @param tokenId - Token identifier.
     */
    function safeTransferFrom(address from, address to, uint256 tokenId) public override {
        // if(excludedList[from] == false) {
            _payRoyalties(from, tokenId);
        // }
        safeTransferFrom(from, to, tokenId, '');
    }

    /**
     * @notice ERC20 trasnfer function override to add royalties.
     * @param from - Address that wants to transfer the token.
     * @param to - Address to receive the token.
     * @param tokenId - Token identifier.
     * @param _data - Additional data.
     */
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory _data) public override {
        require(_isApprovedOrOwner(_msgSender(), tokenId), 'ERC721: transfer caller is not owner nor approved');

        // if(excludedList[from] == false) {
            _payRoyalties(from, tokenId);
        // }

        _safeTransfer(from, to, tokenId, _data);
    }

    // function setExcluded(uint tokenId, address excluded, bool status) external {
    //     require(msg.sender == artist, 'artist only');
    //     excludedList[excluded] = status;
    // }

    // Private methods

    /**
     * @notice Method used to pay royalties to token creators.
     * @param from - Address that wants to transfer the token.
     * @param tokenId - Token identifier.
     */
    function _payRoyalties(address from, uint256 tokenId) internal {
        IERC20 token = IERC20(royaltiesToken);

        // Paying royalties amount to NFT creators
        Autograph memory agrph = autographs[tokenId];
        uint numCreators = agrph.creators.length;
        for (uint i=0; i<numCreators; i++) {
            token.transferFrom(from, agrph.creators[i], royaltiesAmount / numCreators);
        }        
    }

    /**
     * @notice Burning function.
     * @param tokenId - Token identifier.
     */
    function _burn(uint256 tokenId) internal override(ERC721Upgradeable, ERC721URIStorageUpgradeable) {
        super._burn(tokenId);
    }

}