const { ethers, upgrades } = require("hardhat");
const { use, expect, assert } = require("chai");
const { solidity } = require("ethereum-waffle");

var BigNumber = require('big-number');

use(solidity);

describe("Requests Contract", function() {

    let RequestContract, AutographContract;
    let requestContract, autographContract;
    let owner;
    let addr1;
    let addr2;
    let addrs;
    let name;
    let price;
    let responseTime;
    let imageURI;
    let metadataURI;

    beforeEach(async function () {

        // Initializing variables
        price = ethers.utils.parseEther('2');
        responseTime = 2;
        imageURI=
        imageURI = "https://ipfs.io/ipfs/QmWNcYhEcggdm1TFt2m6WmGqqQwfFXudr5eFzKPtm1nYwq";
        metadataURI = "https://ipfs.io/ipfs/QmUCxDBKCrx2JXV4ZNYLwhUPXqTvRAu6Zceoh1FNVumoec";

        // Deploying autograph contract
        AutographContract = await ethers.getContractFactory("AutographContract");
        autographContract = await upgrades.deployProxy(AutographContract);
        expect(autographContract.address).to.properAddress;

        // Deploying requests contract
        RequestContract = await ethers.getContractFactory("RequestContract");
        requestContract = await upgrades.deployProxy(RequestContract, [autographContract.address], { initializer: 'initialize' });
        expect(requestContract.address).to.properAddress;

        // Getting tests accounts
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    });

    describe("Upgrade Contract", function () {

        it("Should upgrade contract", async function () {
            await requestContract.connect(addr2).createRequest(addr1.address, responseTime, {value: ethers.utils.parseEther('1')});
            await requestContract.connect(addr2).createRequest(addrs[0].address, responseTime, {value: ethers.utils.parseEther('3')});

            expect(await requestContract.getBalance()).to.equal(ethers.utils.parseEther('4'));
            expect(await requestContract.getTotalSupply()).to.equal(2);

            let RequestContractV2;
            RequestContractV2 = await ethers.getContractFactory("RequestContract");
            requestContract = await upgrades.upgradeProxy(requestContract.address, RequestContractV2);

            expect(await requestContract.getBalance()).to.equal(ethers.utils.parseEther('4'));
            expect(await requestContract.getTotalSupply()).to.equal(2);
        });

    });

    describe("Create Request", function() {

        it("Should create a new request", async function () {
            await expect(
                requestContract.connect(addr2).createRequest(addr1.address, responseTime, {value: price}))
            .to.emit(requestContract, 'RequestCreated');

            expect(await requestContract.getBalance()).to.equal(price);
            expect(await requestContract.getTotalSupply()).to.equal(1);
            expect(await requestContract.numberOfPendingRequests()).to.equal(1);
        });

        it("Should create many requests for a celebrity", async function () {
            await requestContract.connect(addr2).createRequest(addr1.address, responseTime, {value: price});
            await requestContract.connect(addrs[0]).createRequest(addr1.address, responseTime, {value: price});

            expect(await requestContract.getTotalSupply()).to.equal(2);
            expect(await requestContract.numberOfPendingRequests()).to.equal(2);
        });

        it("Should update balances after creating a request", async function () {
            price = ethers.utils.parseEther('1');

            await requestContract.connect(addr2).createRequest(addr1.address, responseTime, {value: price});
            await requestContract.connect(addrs[0]).createRequest(addr1.address, responseTime, {value: price});
            await requestContract.connect(addrs[0]).createRequest(addrs[1].address, responseTime, {value: price});

            expect(await requestContract.getBalance()).to.equal(ethers.utils.parseEther('3'));
            expect(await requestContract.requesterBalance(addr2.address)).to.equal(ethers.utils.parseEther('1'));
            expect(await requestContract.requesterBalance(addrs[0].address)).to.equal(ethers.utils.parseEther('2'));
            expect(await requestContract.vipBalance(addr1.address)).to.equal(ethers.utils.parseEther('2'));
            expect(await requestContract.vipBalance(addrs[1].address)).to.equal(ethers.utils.parseEther('1'));
        });

        it("Should send a valid amount when creating a request", async function () {
            await expect(
                requestContract.connect(addr2).createRequest(addr1.address, responseTime, {value: 0})
            ).to.be.revertedWith('Sent amount must be greater than 0');
        });
    
    });

    describe("Delete Request", function() {

        it("Should be able to delete a request when locking period expired", async function () {
            responseTime = 0;
            
            await requestContract.connect(addr2).createRequest(addr1.address, responseTime, {value: price});
            expect(await requestContract.getBalance()).to.equal(price);
            expect(await requestContract.numberOfPendingRequests()).to.equal(1);

            await expect(
                requestContract.connect(addr2).deleteRequest(0)
            ).to.emit(requestContract, 'RequestDeleted');

            expect(await requestContract.getBalance()).to.equal(0);
            expect(await requestContract.numberOfPendingRequests()).to.equal(0);
            expect(await requestContract.getTotalSupply()).to.equal(1);
        });

        it("Should update balances when deleting a request", async function () {
            price = ethers.utils.parseEther('1');
            responseTime = 0;
            
            await requestContract.connect(addr2).createRequest(addr1.address, responseTime, {value: price});
            await requestContract.connect(addrs[0]).createRequest(addr1.address, responseTime, {value: price});
            await requestContract.connect(addrs[0]).createRequest(addr2.address, responseTime, {value: price});

            expect(await requestContract.getBalance()).to.equal(ethers.utils.parseEther('3'));
            expect(await requestContract.requesterBalance(addr2.address)).to.equal(ethers.utils.parseEther('1'));
            expect(await requestContract.requesterBalance(addrs[0].address)).to.equal(ethers.utils.parseEther('2'));
            expect(await requestContract.vipBalance(addr1.address)).to.equal(ethers.utils.parseEther('2'));
            expect(await requestContract.vipBalance(addr2.address)).to.equal(ethers.utils.parseEther('1'));

            await requestContract.connect(addr2).deleteRequest(0);
            expect(await requestContract.getBalance()).to.equal(ethers.utils.parseEther('2'));
            expect(await requestContract.requesterBalance(addr2.address)).to.equal(ethers.utils.parseEther('0'));
            expect(await requestContract.requesterBalance(addrs[0].address)).to.equal(ethers.utils.parseEther('2'));
            expect(await requestContract.vipBalance(addr1.address)).to.equal(ethers.utils.parseEther('1'));
            expect(await requestContract.vipBalance(addr2.address)).to.equal(ethers.utils.parseEther('1'));
        });

        it("Shouldn't delete a request before locking period expired", async function () {
            await requestContract.connect(addr2).createRequest(addr1.address, responseTime, {value: price});

            await expect(
                requestContract.connect(addr2).deleteRequest(0)
            ).to.be.revertedWith('You must wait the response time to delete this request');
        });

        it("Shouldn't delete a request when sender is not the owner", async function () {
            const responseTime = 0;
            
            await requestContract.connect(addr2).createRequest(addr1.address, responseTime, {value: price});

            await expect(
                requestContract.connect(addrs[0]).deleteRequest(0)
            ).to.be.revertedWith('You are not the owner of the request');
        });

        it("Should return the payment when a request is deleted", async function () {
            const responseTime = 0;
            
            await requestContract.connect(addr2).createRequest(addr1.address, responseTime, {value: price});
            const userBalance = await addr2.getBalance();

            await requestContract.connect(addr2).deleteRequest(0);
            expect(await requestContract.getBalance()).to.equal(0);
            expect(await addr2.getBalance()).to.be.above(userBalance);
        });

        it("Should return if a request is locked or not", async function () {
            await requestContract.connect(addr2).createRequest(addr1.address, 0, {value: price});            
            expect(await requestContract.requestIsLocked(0)).to.equal(false);

            await requestContract.connect(addr2).createRequest(addrs[0].address, 2,  {value: price});
            expect(await requestContract.requestIsLocked(1)).to.equal(true);
        });

    });

    describe("Sign Request", function() {

        it("Should be able to sign a request", async function () { 
            const responseTime = 0;
            const celebBalance = await addr1.getBalance();

            await requestContract.connect(addr2).createRequest(addr1.address, responseTime, {value: price});
            expect(await requestContract.getBalance()).to.equal(price);
            expect(await requestContract.getTotalSupply()).to.equal(1);

            await requestContract.connect(addr1).signRequest(0, imageURI, metadataURI);
            expect(await requestContract.getBalance()).to.equal(0);
            expect(await addr1.getBalance()).to.be.above(celebBalance);
            expect(await requestContract.numberOfPendingRequests()).to.equal(0);
            expect(await requestContract.getTotalSupply()).to.equal(1);
        });

        it("Should update balances when signing a request", async function () {
            price = ethers.utils.parseEther('1');
            responseTime = 0;
            
            await requestContract.connect(addr2).createRequest(addr1.address, responseTime, {value: price});
            await requestContract.connect(addrs[0]).createRequest(addr1.address, responseTime, {value: price});
            await requestContract.connect(addrs[0]).createRequest(addr2.address, responseTime, {value: price});

            expect(await requestContract.getBalance()).to.equal(ethers.utils.parseEther('3'));
            expect(await requestContract.requesterBalance(addr2.address)).to.equal(ethers.utils.parseEther('1'));
            expect(await requestContract.requesterBalance(addrs[0].address)).to.equal(ethers.utils.parseEther('2'));
            expect(await requestContract.vipBalance(addr1.address)).to.equal(ethers.utils.parseEther('2'));
            expect(await requestContract.vipBalance(addr2.address)).to.equal(ethers.utils.parseEther('1'));

            await requestContract.connect(addr1).signRequest(0, imageURI, metadataURI);
            expect(await requestContract.getBalance()).to.equal(ethers.utils.parseEther('2'));
            expect(await requestContract.requesterBalance(addr2.address)).to.equal(ethers.utils.parseEther('0'));
            expect(await requestContract.requesterBalance(addrs[0].address)).to.equal(ethers.utils.parseEther('2'));
            expect(await requestContract.vipBalance(addr1.address)).to.equal(ethers.utils.parseEther('1'));
            expect(await requestContract.vipBalance(addr2.address)).to.equal(ethers.utils.parseEther('1'));
        });

        it("Shouldn't be able to sign a request if sender is not the recipient", async function () {    
            const responseTime = 0;
            
            await requestContract.connect(addr2).createRequest(addr1.address, responseTime, {value: price});

            await expect(
                requestContract.connect(addrs[0]).signRequest(0, imageURI, metadataURI)
            ).to.be.revertedWith('You are not the recipient of the request');
        });

        it("Should send fees to owner when signing a request", async function () {
            const feePercent = await requestContract.feePercent();
            const fee = price * feePercent / 100;
            const ownerBalance = await owner.getBalance();
            const celebBalance = await addr1.getBalance();

            await requestContract.connect(addr2).createRequest(addr1.address, responseTime, {value: price});                
            await requestContract.connect(addr1).signRequest(0, imageURI, metadataURI);
            
            const expectedOwnerBalance = BigNumber(ownerBalance.toString()).plus(fee);
            const currentOwnerBalance = await owner.getBalance();
            expect(BigNumber(currentOwnerBalance.toString()).toString()).to.equal(expectedOwnerBalance.toString());
            expect(await addr1.getBalance()).to.be.above(celebBalance);
        });

        it("Shouldn't be able to sign a request that doesn't exist", async function () {    
            const responseTime = 0;
            
            await requestContract.connect(addr2).createRequest(addr1.address, responseTime, {value: price});
            await requestContract.connect(addr2).deleteRequest(0);

            await expect(
                requestContract.connect(addr1).signRequest(0, imageURI, metadataURI)
            ).to.be.reverted;
        });

    });

    describe("Fees Management", function() {

        it("Should be able to update fee percent", async function () {   
            expect(await requestContract.feePercent()).to.equal(10);
            await requestContract.connect(owner).setFeePercent(20);
            expect(await requestContract.feePercent()).to.equal(20);
        });

        it("Shouldn't be able to update fee percent when sender is not the owner", async function () {   
            await expect(
                requestContract.connect(addr1).setFeePercent(20)
            ).to.be.reverted;
        });

    });

});