//SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import "hardhat/console.sol";

/**
 * This contract manages celebrities information on-chain.
 */
contract CelebrityContract is Initializable{

    // Structs
    struct Celebrity {
        string name;
        uint price;
        uint responseTime;
        bool exists;
    }

    // Variables
    mapping(address => Celebrity) public celebrities;
    uint private totalSupply;
    uint public version;

    // Events
    event CelebrityCreated(address indexed owner, string name, uint price, uint responseTime);
    event CelebrityDeleted(address indexed owner);
    event CelebrityUpdated(address indexed owner, string name, uint price, uint responseTime);

    /**
     @notice Contract initializer.
     */
    function initialize() public initializer {
        version = 1;
    }

    /**
    @notice Creates a new celebrity.
    @param name - Celebrity name.
    @param price - Celebrity current autograph price.
    @param responseTime - Celebrity response time.
     */
    function createCelebrity(string memory name, uint price, uint responseTime) public {
        require(!celebrities[msg.sender].exists, 'This address already exists');

        Celebrity memory newCelebrity = Celebrity(name, price, responseTime, true);  
        celebrities[msg.sender] = newCelebrity;
        totalSupply += 1;

        emit CelebrityCreated(msg.sender, newCelebrity.name, newCelebrity.price, newCelebrity.responseTime);
    }

    /**
    @notice Delete a celebrity.
    @param addr - Celebrity address.
     */
    function deleteCelebrity(address addr) public {
        require(addr == msg.sender, 'You are not the owner');
        require(celebrities[msg.sender].exists, 'This address does not exist');
        
        delete celebrities[addr];
        totalSupply -= 1;
        
        emit CelebrityDeleted(addr);
    }

    /**
     @notice Update celebrity information.
     @param name - Celebrity name.
     @param price - Celebrity current autograph price.
     @param responseTime - Celebrity response time.
     */
    function updateCelebrity(string memory name, uint price, uint responseTime) public {
        celebrities[msg.sender].name = name;
        celebrities[msg.sender].price = price;
        celebrities[msg.sender].responseTime = responseTime;

        emit CelebrityUpdated(msg.sender, name, price, responseTime);
    }

    /**
     @notice Gets number of celebrities.
     @return Total number of celebrities.
     */
    function getTotalSupply() public view returns (uint) {
        return totalSupply;
    }

}