const { ethers, upgrades } = require("hardhat");
const { use, expect, assert } = require("chai");
const { solidity } = require("ethereum-waffle");

var BigNumber = require('big-number');

use(solidity);

describe("Request Contract", function() {

    let AutographRequestContract, AutographContract, CelebrityContract;
    let requestsContract, autographContract, celebrityContract;
    let owner;
    let addr1;
    let addr2;
    let addrs;
    let name;
    let price;
    let responseTime;
    let metadata;

    beforeEach(async function () {

        // Initializing variables
        name = "Justin Shenkarow";
        price = ethers.utils.parseEther('2');
        responseTime = 2;
        metadata="QmTgqnhFBMkfT9s8PHKcdXBn1f5bG3Q5hmBaR4U6hoTvb1";
    
        // Deploying celebrities contract
        CelebrityContract = await ethers.getContractFactory("CelebrityContract");
        celebrityContract = await upgrades.deployProxy(CelebrityContract);
        expect(celebrityContract.address).to.properAddress;

        // Deploying autograph contract
        AutographContract = await ethers.getContractFactory("AutographContract");
        autographContract = await upgrades.deployProxy(AutographContract);
        expect(autographContract.address).to.properAddress;

        // Deploying requests contract
        AutographRequestContract = await ethers.getContractFactory("AutographRequestContract");
        requestsContract = await upgrades.deployProxy(AutographRequestContract, [celebrityContract.address, autographContract.address], { initializer: 'initialize' });
        expect(requestsContract.address).to.properAddress;

        // Getting tests accounts
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    });

    describe("Upgrade Contract", function () {

        it("Should upgrade contract", async function () {
            await celebrityContract.connect(addr1).createCelebrity(name, ethers.utils.parseEther('1'), responseTime);
            await celebrityContract.connect(addrs[0]).createCelebrity("Vitalik Buterin", ethers.utils.parseEther('3'), 0);
            
            await requestsContract.connect(addr2).createRequest(addr1.address, {value: ethers.utils.parseEther('1')});
            await requestsContract.connect(addr2).createRequest(addrs[0].address, {value: ethers.utils.parseEther('3')});

            expect(await requestsContract.getBalance()).to.equal(ethers.utils.parseEther('4'));
            expect(await requestsContract.getTotalSupply()).to.equal(2);

            let AutographRequestContractV2;
            AutographRequestContractV2 = await ethers.getContractFactory("AutographRequestContract");
            requestsContract = await upgrades.upgradeProxy(requestsContract.address, AutographRequestContractV2);

            expect(await requestsContract.getBalance()).to.equal(ethers.utils.parseEther('4'));
            expect(await requestsContract.getTotalSupply()).to.equal(2);
        });

    });

    describe("Create Request", function() {

        it("Should create a new autograph request", async function () {
            await celebrityContract.connect(addr1).createCelebrity(name, price, responseTime);
            await expect(
                requestsContract.connect(addr2).createRequest(addr1.address, {value: price}))
            .to.emit(requestsContract, 'RequestCreated');

            expect(await requestsContract.getBalance()).to.equal(price);
            expect(await requestsContract.getTotalSupply()).to.equal(1);
        });

        it("Should retrieve request info after create a new request", async function () {
            await celebrityContract.connect(addr1).createCelebrity(name, price, responseTime);
            await requestsContract.connect(addr2).createRequest(addr1.address, {value: price});

            const request = await requestsContract.requests(0);
            expect(request[0]).to.equal(addr2.address);
            expect(request[1]).to.equal(addr1.address);
            expect(request[2]).to.equal(price);
            expect(request[3]).to.equal(responseTime);
        });

        it("Should create many requests for a celebrity", async function () {
            price = ethers.utils.parseEther('2');
            await celebrityContract.connect(addr1).createCelebrity(name, price, responseTime);
            
            await requestsContract.connect(addr2).createRequest(addr1.address, {value: price});
            await requestsContract.connect(addrs[0]).createRequest(addr1.address, {value: price});
            await requestsContract.connect(addrs[1]).createRequest(addr1.address, {value: price});

            expect(await requestsContract.getBalance()).to.equal(ethers.utils.parseEther('6'));
            expect(await requestsContract.getTotalSupply()).to.equal(3);
        });
    
    });

    describe("Delete Request", function() {

        it("Should be able to delete a request when locking period expired", async function () {
            responseTime = 0;
            
            await celebrityContract.connect(addr1).createCelebrity(name, price, responseTime);
            await requestsContract.connect(addr2).createRequest(addr1.address, {value: price});
            expect(await requestsContract.getBalance()).to.equal(price);
            expect(await requestsContract.getNumberOfPendingRequests()).to.equal(1);

            await requestsContract.connect(addr2).deleteRequest(0);
            expect(await requestsContract.getBalance()).to.equal(0);
            expect(await requestsContract.getNumberOfPendingRequests()).to.equal(0);
            expect(await requestsContract.getTotalSupply()).to.equal(1);
        });

        it("Shouldn't delete a request before locking period expired", async function () {
            await celebrityContract.connect(addr1).createCelebrity(name, price, responseTime);
            await requestsContract.connect(addr2).createRequest(addr1.address, {value: price});

            await expect(
                requestsContract.connect(addr2).deleteRequest(0)
            ).to.be.revertedWith('You must wait the response time to delete this request');
        });

        it("Shouldn't delete a request when sender is not the owner", async function () {
            const responseTime = 0;
            
            await celebrityContract.connect(addr1).createCelebrity(name, price, responseTime);
            await requestsContract.connect(addr2).createRequest(addr1.address, {value: price});

            await expect(
                requestsContract.connect(addrs[0]).deleteRequest(0)
            ).to.be.revertedWith('You are not the owner of the request');
        });

        it("Should return the payment when a request is deleted", async function () {
            const responseTime = 0;
            
            await celebrityContract.connect(addr1).createCelebrity(name, price, responseTime);
            await requestsContract.connect(addr2).createRequest(addr1.address, {value: price});
            const userBalance = await addr2.getBalance();

            await requestsContract.connect(addr2).deleteRequest(0);
            expect(await requestsContract.getBalance()).to.equal(0);
            expect(await addr2.getBalance()).to.be.above(userBalance);
        });

    });

    describe("Sign Request", function() {

        it("Should be able to sign a request", async function () { 
            const responseTime = 0;
            const celebBalance = await addr1.getBalance();

            await celebrityContract.connect(addr1).createCelebrity(name, price, responseTime);
            await requestsContract.connect(addr2).createRequest(addr1.address, {value: price});
            expect(await requestsContract.getBalance()).to.equal(price);
            expect(await requestsContract.getTotalSupply()).to.equal(1);

            await requestsContract.connect(addr1).signRequest(0, metadata);
            expect(await requestsContract.getBalance()).to.equal(0);
            expect(await addr1.getBalance()).to.be.above(celebBalance);
            expect(await requestsContract.getNumberOfPendingRequests()).to.equal(0);
            expect(await requestsContract.getTotalSupply()).to.equal(1);
        });

        it("Shouldn't be able to sign a request if sender is not the recipient", async function () {    
            const responseTime = 0;
            
            await celebrityContract.connect(addr1).createCelebrity(name, price, responseTime);
            await requestsContract.connect(addr2).createRequest(addr1.address, {value: price});

            await expect(
                requestsContract.connect(addrs[0]).signRequest(0, metadata)
            ).to.be.revertedWith('You are not the recipient of the request');
        });

        it("Should send fees to owner when signing a request", async function () {
            const feePercent = await requestsContract.getFeePercent();
            const fee = price * feePercent / 100;
            const ownerBalance = await owner.getBalance();
            const celebBalance = await addr1.getBalance();

            await celebrityContract.connect(addr1).createCelebrity(name, price, responseTime);
            await requestsContract.connect(addr2).createRequest(addr1.address, {value: price});                
            await requestsContract.connect(addr1).signRequest(0, metadata);
            
            const expectedOwnerBalance = BigNumber(ownerBalance.toString()).plus(fee);
            const currentOwnerBalance = await owner.getBalance();
            expect(BigNumber(currentOwnerBalance.toString()).toString()).to.equal(expectedOwnerBalance.toString());
            expect(await addr1.getBalance()).to.be.above(celebBalance);
        });

        it("Shouldn't be able to sign a request that doesn't exist", async function () {    
            const responseTime = 0;
            
            await celebrityContract.connect(addr1).createCelebrity(name, price, responseTime);
            await requestsContract.connect(addr2).createRequest(addr1.address, {value: price});
            await requestsContract.connect(addr2).deleteRequest(0);

            await expect(
                requestsContract.connect(addr1).signRequest(0, metadata)
            ).to.be.reverted;
        });

    });

    describe("Fees Management", function() {

        it("Should be able to update fee percent", async function () {   
            expect(await requestsContract.getFeePercent()).to.equal(10);
            await requestsContract.connect(owner).setFeePercent(20);
            expect(await requestsContract.getFeePercent()).to.equal(20);
        });

        it("Shouldn't be able to update fee percent when sender is not the owner", async function () {   
            await expect(
                requestsContract.connect(addr1).setFeePercent(20)
            ).to.be.reverted;
        });

    });

});