//SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "hardhat/console.sol";

// AutographContract Interface
interface IAutographContract {
    function mint(address to, address[] memory signers, string memory imageURI, string memory metadataURI) external returns (uint);   
    function ownerOf(uint256 tokenId) external view returns (address);
}

contract RequestContract is OwnableUpgradeable {

    // Structs
    struct Request {
        address from;
        mapping(address => bool) signers;
        uint price;
        uint responseTime;
        uint created;
    }

    // Variables
    IAutographContract private autographContract;
    mapping (uint => Request) public requests;
    mapping(address => uint) private requesterBalance;
    uint public numRequests;
    uint public numberOfPendingRequests;
    uint public feePercent;
    address payable public wallet;

    // Events
    event RequestCreated(uint id, address indexed from, address[] to, uint price, uint responseTime, uint created);
    event RequestDeleted(uint id, address indexed from, uint price, uint responseTime, uint created);
    event RequestMinted(uint id, address indexed from, address indexed to, uint price, uint responseTime, uint created, string imageURI, string metadataURI);
    event FeePercentChanged(uint feePercent);
    event WalletChanged(address indexed addr);

    /**
     @notice Contract initializer.
     @param _autographContract - NFT Token address.
     */
    function initialize(address _autographContract) public initializer {
        __Ownable_init();
        autographContract = IAutographContract(_autographContract);
        wallet = payable(owner());
        feePercent = 10; // %
    }

    /**
     @notice Receives the payment when creating a new request.
     @param signers - VIP addresses or recipients.
     @param responseTime - VIP response time.
     */
    function createRequest(address[] memory signers, uint responseTime) public payable {
        require(msg.value > 0, 'Sent amount must be greater than 0');
        
        // Creating the request
        Request storage newRequest = requests[numRequests];
        newRequest.from = msg.sender;
        newRequest.price = msg.value;
        newRequest.responseTime = responseTime;
        newRequest.created = block.timestamp;

        for (uint i=0; i<signers.length; i++) {
            require(signers[i] != address(0), 'A valid address is required');
            newRequest.signers[signers[i]] = true;
        }

        numRequests += 1;
        numberOfPendingRequests += 1;

        // Updating balances
        requesterBalance[msg.sender] += msg.value;

        emit RequestCreated(numRequests, newRequest.from, signers, newRequest.price, newRequest.responseTime, newRequest.created);
    }

    /**
     @notice Method used to remove a request after the locking period expired.
     @param id - Request index.
     */
    function deleteRequest(uint id) public {
        Request storage request = requests[id];
        
        require(request.from == msg.sender, 'You are not the owner of the request');
        require(block.timestamp >= request.created + (request.responseTime * 1 days), 'You must wait the response time to delete this request');

        // Transfering amount payed to user
        payable(msg.sender).transfer(request.price);

        // Updating balances
        requesterBalance[msg.sender] -= request.price;

        // Deleting request
        delete requests[id];
        numberOfPendingRequests -= 1;

        emit RequestDeleted(id, request.from, request.price, request.responseTime, request.created);
    }

    /**
     @notice Method used to mint a pending request.
     @param id - Request index.
     @param signers - List of request signers.
     @param imageURI - Autograph image URI.
     @param metadataURI - Autograph metadata URI.
     */
    function mintRequest(uint id, address[] memory signers, string memory imageURI, string memory metadataURI) public {
        Request storage request = requests[id];

        require(request.signers[msg.sender] || msg.sender == owner(), 'You are not an owner of the request');
        require(address(this).balance >= request.price, 'Balance should be greater than request price');

        // Minting the NFT
        uint tokenId = autographContract.mint(request.from, signers, imageURI, metadataURI);
        require(autographContract.ownerOf(tokenId) == request.from, 'Token was not created correctly');

        // Calculating and transfering fees
        uint fee = request.price * feePercent / 100;
        wallet.transfer(fee);

        // Transfering payment to signers
        uint payment = (request.price - fee) / signers.length;
        for (uint i=0; i<signers.length; i++) {
            address payable addr = payable(signers[i]);
            addr.transfer(payment);
        }

        // Updating balances
        requesterBalance[request.from] -= request.price;

        // Deleting request
        delete requests[id];
        numberOfPendingRequests -= 1;

        emit RequestMinted(id, request.from, msg.sender, request.price, request.responseTime, request.created, imageURI, metadataURI);
    }

    /**
     @notice Method used to return the contract balance.
     @return Current contract balance.
     */
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    /**
     @notice Method used to return the requester balance. Only requester can call this method.
     @param addr - Requester address.
     @return Current requester balance.
     */
    function getRequesterBalance(address addr) public view returns (uint) {
        require(addr == msg.sender, 'You are not the owner of the request');
        return requesterBalance[msg.sender];
    }

    /**
     @notice Method used know if the locking period has expired.
     @param id - Request index.
     */
    function requestIsLocked(uint id) public view returns (bool) {
        Request storage request = requests[id];
        return block.timestamp < request.created + (request.responseTime * 1 days);
    }

    /**
     @notice Sets fees percent.
     @param _feePercent - New fee percent.
     */
    function setFeePercent(uint _feePercent) public onlyOwner {
        feePercent = _feePercent;
        emit FeePercentChanged(feePercent);
    }

    /**
     @notice Sets the fees wallet where receive the payments.
     @param _addr - New address.
     */
    function setWallet(address payable _addr) public onlyOwner {
        wallet = _addr;
        emit WalletChanged(wallet);
    }

}