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
 @param signers - VIP addresses or recipients.
 @param responseTime - VIP response time.
 */
function createRequest(address[] memory signers, uint responseTime) external payable;

// Launches event RequestCreated
event RequestCreated(uint id, address indexed from, address[] to, uint price, uint responseTime, uint created);
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
event RequestDeleted(uint id, address indexed from, uint price, uint responseTime, uint created);
```

### mintRequest

Method used to mint a pending request.

```solidity
/**
 @notice Method used to mint a pending request.
 @param id - Request index.
 @param signers - List of request signers.
 @param imageURI - Autograph image URI.
 @param metadataURI - Autograph metadata URI.
*/
function mintRequest(uint id, address[] memory signers, string memory imageURI, string memory metadataURI) external;

// Launches event RequestMinted
event RequestMinted(uint id, address indexed from, address indexed to, uint price, uint responseTime, uint created, string imageURI, string metadataURI);
```

### getBalance

Method used to return the contract balance.

```solidity
/**
 @notice Method used to return the contract balance.
 @return Current contract balance.
 */
function getBalance() external view returns (uint);
```

### getRequesterBalance

Method used to return the requester balance. Only requester can call this method.

```solidity
/**
 @notice Method used to return the requester balance.
 @param addr - Requester address.
 @return Current requester balance.
 */
function getRequesterBalance(address addr) external view returns (uint);
```

### requestIsLocked

Method used know if the locking period has expired.

```solidity
/**
 @notice Method used know if the locking period has expired.
 @param id - Request index.
 */
function requestIsLocked(uint id) external view returns (bool);
```

## AutographContract.sol (ERC-721)

### mint

Function used to mint a new NFT.

```solidity
/**
 @notice Function used to mint a new NFT.
 @param to - Person's wallet address who will receive the NFT.
 @param signers - Signer list / creators.
 @param imgURI - Link to an image referencing the asset.
 @param metadataURI - Link to metadata.
 */
function mint(address to, address[] memory signers, string memory imgURI, string memory metadataURI) external returns (uint);

// Launches event Minted
event AutographMinted(uint id, address[] creators, address indexed owner, string imageURI, string metadataURI);
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

Returns the base URI set via {\_setBaseURI}. This will be automatically added as a prefix in {tokenURI} to each token's URI, or to the token ID if no specific URI is set for that token ID.

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
