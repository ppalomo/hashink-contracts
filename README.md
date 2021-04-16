This is a [HardHat](https://hardhat.org/) project.

# Getting Started

First run this command to install dependencies:

```
npm install
```
Then you can execute the tests:

```
npx hardhat test
```

## RequestContract.sol

### createRequest
Function used to request a new NFT (autograph) to a celeb.
```solidity
/**
 @notice Receives the payment when creating a new request.
 @param to - VIP address or recipient.
 @param responseTime - VIP response time.
 */
function createRequest(address to, uint responseTime) external payable;

// Launches event RequestCreated
event RequestCreated(uint id, address indexed from, address indexed to, uint price, uint responseTime, uint created);
```

### deleteRequest
Method used to remove a request after the locking period expired.
```solidity
/**
 @notice Method used to remove a request after the locking period expired.
 @param id - Request index.
 */
function deleteRequest(uint id) external;

// Launches event RequestDeleted
event RequestDeleted(uint id, address indexed from, address indexed to, uint price, uint responseTime, uint created);
```

### signRequest
Method used to sign a pending request.
```solidity
/**
 @notice Method used to sign a pending request.
 @param id - Request index.
 @param imageURI - Autograph image URI.
 @param metadataURI - Autograph metadata URI.
 */
function signRequest(uint id, string memory imageURI, string memory metadataURI) external;

// Launches event RequestSigned
event RequestSigned(uint id, address indexed from, address indexed to, uint price, uint responseTime, uint created, string imageURI, string metadataURI);
```

## AutographContract.sol (ERC-721)

### mint
Function used to mint a new NFT.
```solidity
/** 
 @notice Function used to mint a new NFT.
 @param to - Person's wallet address who will receive the NFT.
 @param from - Person who's minting the NFT (creator).
 @param imageURI - Link to an image referencing the asset.
 @param metadataURI - Link to metadata.
 */
function mint(address to, address from, string memory imageURI, string memory metadataURI) external returns (uint);

// Launches event Minted
event AutographMinted(uint id, address indexed creator, address indexed owner, string imageURI, string metadataURI);
```

### balanceOf
Count all NFTs assigned to an owner.
```solidity
function balanceOf(address owner) public view virtual override returns (uint256)
```

### ownerOf
Find the owner of an NFT.
```solidity
function ownerOf(uint256 tokenId) public view virtual override returns (address)
```

### name
A descriptive name for a collection of NFTs in this contract.
```solidity
function name() public view virtual override returns (string memory)
```

### symbol
An abbreviated name for NFTs in this contract.
```solidity
function symbol() public view virtual override returns (string memory)
```

### tokenURI
A distinct Uniform Resource Identifier (URI) for a given asset.
```solidity
function tokenURI(uint256 tokenId) public view virtual override returns (string memory)
```

### baseURI
Returns the base URI set via {_setBaseURI}. This will be automatically added as a prefix in {tokenURI} to each token's URI, or to the token ID if no specific URI is set for that token ID.
```solidity
function baseURI() public view virtual returns (string memory)
```

### tokenOfOwnerByIndex
Enumerate NFTs assigned to an owner.
```solidity
function tokenOfOwnerByIndex(address owner, uint256 index) public view virtual override returns (uint256)
```

### totalSupply
See {IERC721Enumerable-totalSupply}.
```solidity
function totalSupply() public view virtual override returns (uint256)
```

### tokenByIndex
See {IERC721Enumerable-tokenByIndex}.
```solidity
function tokenByIndex(uint256 index) public view virtual override returns (uint256)
```

### approve
Change or reaffirm the approved address for an NFT.
```solidity
function approve(address to, uint256 tokenId) public virtual override
```

### transferFrom
Transfer ownership of an NFT.
```solidity
function transferFrom(address from, address to, uint256 tokenId) public virtual override
```
