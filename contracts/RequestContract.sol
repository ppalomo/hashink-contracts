//SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "./AutographContract.sol";

contract RequestContract is OwnableUpgradeable {

    // Structs
    struct Request {
        address from;
        address to;
        uint price;
        uint responseTime;
        uint created;
    }

    // Variables
    AutographContract private autographContract;
    Request[] public requests;
    mapping(address => uint) private requesterBalance;
    mapping(address => uint) private vipBalance;
    uint public numberOfPendingRequests;
    uint public feePercent;

    IERC20Upgradeable public token;

    // Events
    event RequestCreated(uint id, address indexed from, address indexed to, uint price, uint responseTime, uint created);
    event RequestDeleted(uint id, address indexed from, address indexed to, uint price, uint responseTime, uint created);
    event RequestSigned(uint id, address indexed from, address indexed to, uint price, uint responseTime, uint created, string imageURI, string metadataURI);
    event FeePercentChanged(uint feePercent);

    /**
     @notice Contract initializer.
     @param _autographContract - NFT Token address.
     */
    function initialize(address _autographContract, address _tokenContract) public initializer {
        __Ownable_init();

        // Initializing autograph's contract
        autographContract = AutographContract(_autographContract);
        
        // Default fee percent
        feePercent = 10; // %

        // Token initialization
        token = IERC20Upgradeable(_tokenContract);
    }

    /**
     @notice Receives the payment when creating a new request.
     @param to - VIP address or recipient.
     @param responseTime - VIP response time.
     */
    function createRequest(address to, uint price, uint responseTime) public {

        bool sent = token.transferFrom(msg.sender, address(this), price);
        require(sent, "Token transfer failed");

        // require(to != address(0), 'A valid address is required');
        // require(msg.value > 0, 'Sent amount must be greater than 0');

        // // Creating request
        // Request memory newRequest = Request(msg.sender, to, msg.value, responseTime, block.timestamp);
        // requests.push(newRequest);
        // uint id = requests.length - 1;
        // numberOfPendingRequests += 1;

        // // Updating balances
        // requesterBalance[msg.sender] += msg.value;
        // vipBalance[to] += msg.value;

        // emit RequestCreated(id, newRequest.from, newRequest.to, newRequest.price, newRequest.responseTime, newRequest.created);
    }

    /**
     @notice Method used to remove a request after the locking period expired.
     @param id - Request index.
     */
    function deleteRequest(uint id) public {
        Request memory request = requests[id];
        require(request.from == msg.sender, 'You are not the owner of the request');
        require(block.timestamp >= request.created + (request.responseTime * 1 days), 'You must wait the response time to delete this request');

        // Transfering amount payed to user
        payable(msg.sender).transfer(request.price);
        delete requests[id];
        numberOfPendingRequests -= 1;

        // Updating balances
        requesterBalance[msg.sender] -= request.price;
        vipBalance[request.to] -= request.price;

        emit RequestDeleted(id, request.from, request.to, request.price, request.responseTime, request.created);
    }

    /**
     @notice Method used to sign a pending request.
     @param id - Request index.
     @param imageURI - Autograph image URI.
     @param metadataURI - Autograph metadata URI.
     */
    function signRequest(uint id, string memory imageURI, string memory metadataURI) public {
        Request memory request = requests[id];

        require(request.to == msg.sender, 'You are not the recipient of the request');
        require(address(this).balance >= request.price, 'Balance should be greater than request price');

        // Minting the NFT
        uint tokenId = autographContract.mint(request.from, msg.sender, imageURI, metadataURI);
        require(autographContract.ownerOf(tokenId) == request.from, 'Token was not created correctly');

        // Adding request price to VIP balance
        address payable addr = payable(request.to);
        address payable ownerAddr = payable(owner());

        // Calculating and transfering fees
        uint fee = request.price * feePercent / 100;
        ownerAddr.transfer(fee);

        // Transfering payment to VIP
        addr.transfer(request.price - fee);

        // Deleting request
        delete requests[id];
        numberOfPendingRequests -= 1;

        // Updating balances
        requesterBalance[request.from] -= request.price;
        vipBalance[msg.sender] -= request.price;

        emit RequestSigned(id, request.from, request.to, request.price, request.responseTime, request.created, imageURI, metadataURI);
    }

    /**
     @notice Method used to return the contract balance.
     @return Current contract balance.
     */
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    /**
     @notice Method used to return the requester balance.
     @param addr - Requester address.
     @return Current requester balance.
     */
    function getRequesterBalance(address addr) public view returns (uint) {
        require(addr == msg.sender, 'You are not the owner of the request');
        return requesterBalance[msg.sender];
    }

    /**
     @notice Method used to return the VIP balance.
     @param addr - VIP address.
     @return Current VIP balance.
     */
    function getVIPBalance(address addr) public view returns (uint) {
        require(addr == msg.sender, 'You are not the owner of the request');
        return vipBalance[msg.sender];
    }

    /**
     @notice Gets total number of requests.
     @return Total number of requests being created.
     */
    function getTotalSupply() public view returns (uint) {
        return requests.length;
    }

    /**
     @notice Method used know if the locking period has expired.
     @param id - Request index.
     */
    function requestIsLocked(uint id) public view returns (bool) {
        Request memory request = requests[id];
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

}