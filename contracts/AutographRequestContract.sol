//SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./CelebrityContract.sol";
import "./AutographContract.sol";

contract AutographRequestContract is OwnableUpgradeable {

    // Structs
    struct Request {
        address from;
        address to;
        uint price;
        uint responseTime;
        uint created;
    }

    // Variables
    CelebrityContract private celebrityContract;
    AutographContract private autographContract;
    Request[] public requests;
    uint numberOfPendingRequests;
    uint private feePercent;

    // Events
    event RequestCreated(uint id, address indexed from, address indexed to, uint price, uint responseTime, uint created);
    event RequestDeleted(uint id, address indexed from, address indexed to, uint price, uint responseTime, uint created);
    event RequestSigned(uint id, address indexed from, address indexed to, uint price, uint responseTime, uint created, string metadata);
    event FeePercentChanged(uint feePercent);

    /**
     @notice Contract initializer.
     @param _celebrityContract - Celebrity contract address.
     @param _autographContract - NFT Token address.
     */
    function initialize(address _celebrityContract, address _autographContract) public initializer {
        __Ownable_init();
        celebrityContract = CelebrityContract(_celebrityContract);
        autographContract = AutographContract(_autographContract);
        feePercent = 10; // %
    }

    /**
     @notice Function used to request a new NFT (autograph) to a celeb.
     @param to - Celeb address or recipient.
     */
    function createRequest(address to) public payable {     
        (,uint price, uint responseTime,) = celebrityContract.celebrities(to);
        require(msg.value == price, 'The amount paid is not equal to the sale price');

        // Adding paid price to contract balance
        Request memory newRequest = Request(msg.sender, to, price, responseTime, block.timestamp);
        requests.push(newRequest);
        uint id = requests.length - 1;
        numberOfPendingRequests += 1;

        emit RequestCreated(id, newRequest.from, newRequest.to, newRequest.price, newRequest.responseTime, newRequest.created);
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

        emit RequestDeleted(id, request.from, request.to, request.price, request.responseTime, request.created);
    }

    /**
     @notice Method used to sign a pending request.
     @param id - Request index.
     @param metadata - Autograph metadata.
     */
    function signRequest(uint id, string memory metadata) public {
        Request memory request = requests[id];

        require(request.to == msg.sender, 'You are not the recipient of the request');
        require(address(this).balance >= request.price, 'Balance should be greater than request price');

        // Minting the NFT
        uint tokenId = autographContract.mint(request.from, metadata);
        require(autographContract.ownerOf(tokenId) == request.from, 'Token was not created correctly');

        // Adding request price to celeb balance
        address payable addr = payable(request.to);
        address payable ownerAddr = payable(owner());

        // Calculating and transfering fees
        uint fee = request.price * feePercent / 100;
        ownerAddr.transfer(fee);

        // Transfering payment to celebrity
        addr.transfer(request.price - fee);

        // Deleting request
        delete requests[id];
        numberOfPendingRequests -= 1;

        emit RequestSigned(id, request.from, request.to, request.price, request.responseTime, request.created, metadata);
    }

    /**
     @notice Method used to return the contract balance.
     @return Current contract balance.
     */
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    /**
     @notice Gets total number of requests.
     @return Total number of requests being created.
     */
    function getTotalSupply() public view returns (uint) {
        return requests.length;
    }

    /**
     @notice Gets number of pending requests.
     @return Current number of pending requests.
     */
    function getNumberOfPendingRequests() public view returns (uint) {
        return numberOfPendingRequests;
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
     @notice Returns contract fee percent.
     @return Current fee percent.
     */
    function getFeePercent() public view returns (uint) {
        return feePercent;
    }

}