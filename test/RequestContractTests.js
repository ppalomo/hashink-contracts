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
    let signers;
    let price;
    let responseTime;
    let imageURI;
    let metadataURI;

    beforeEach(async function () {

        // Initializing variables
        price = ethers.utils.parseEther('2');
        responseTime = 2;
        imageURI = "https://ipfs.io/ipfs/QmWNcYhEcggdm1TFt2m6WmGqqQwfFXudr5eFzKPtm1nYwq";
        metadataURI = "https://ipfs.io/ipfs/QmUCxDBKCrx2JXV4ZNYLwhUPXqTvRAu6Zceoh1FNVumoec";

        // Deploying mock token
        HashinkToken = await ethers.getContractFactory("HashinkToken");
        mockToken = await HashinkToken.deploy();
        expect(mockToken.address).to.properAddress;

        // Deploying autograph contract
        AutographContract = await ethers.getContractFactory("AutographContract");
        autographContract = await upgrades.deployProxy(AutographContract, [mockToken.address, ethers.utils.parseEther('1')]), { initializer: 'initialize' };
        expect(autographContract.address).to.properAddress;

        // Deploying requests contract
        RequestContract = await ethers.getContractFactory("RequestContract");
        requestContract = await upgrades.deployProxy(RequestContract, [autographContract.address], { initializer: 'initialize' });
        expect(requestContract.address).to.properAddress;

        // Getting tests accounts
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
        signers = [addrs[0].address, addrs[1].address, addrs[2].address];

        // Minting mock tokens
        await Promise.all ([
            mockToken.mint(addrs[1].address, ethers.utils.parseEther('100')),
            mockToken.mint(addrs[2].address, ethers.utils.parseEther('50'))
        ]);
        expect(await mockToken.balanceOf(addrs[1].address)).to.equal(ethers.utils.parseEther('100'));
        expect(await mockToken.balanceOf(addrs[2].address)).to.equal(ethers.utils.parseEther('50'));
    });

    describe("Upgrade Contract", function () {

        // it("Should deploy contract", async function () {
        //     const ownerBalance0 = await owner.getBalance();

        //     AutographContract = await ethers.getContractFactory("AutographContract");
        //     autographContract = await upgrades.deployProxy(AutographContract);

        //     const ownerBalance1 = await owner.getBalance();
        //     let gasSpent = ownerBalance0 - ownerBalance1;

        //     console.log(gasSpent.toString());
            
            
        //     expect(1).to.equal(1);
        // });

        it("Should upgrade contract", async function () {
            await requestContract.connect(addr2).createRequest(signers, responseTime, {value: ethers.utils.parseEther('1')});
            await requestContract.connect(addr2).createRequest(signers, responseTime, {value: ethers.utils.parseEther('3')});

            expect(await requestContract.getBalance()).to.equal(ethers.utils.parseEther('4'));
            expect(await requestContract.numRequests()).to.equal(2);

            let RequestContractV2;
            RequestContractV2 = await ethers.getContractFactory("RequestContract");
            requestContract = await upgrades.upgradeProxy(requestContract.address, RequestContractV2);

            expect(await requestContract.getBalance()).to.equal(ethers.utils.parseEther('4'));
            expect(await requestContract.numRequests()).to.equal(2);
        });

    });

    describe("Create Request", function() {

        it("Should create a new group request", async function () {
            await expect(
                requestContract.connect(addr1).createRequest(signers, responseTime, {value: price}))
            .to.emit(requestContract, 'RequestCreated');

            expect(await requestContract.getBalance()).to.equal(price);
            expect(await requestContract.numRequests()).to.equal(1);
            expect(await requestContract.numberOfPendingRequests()).to.equal(1);

            const request = await requestContract.connect(addrs[0]).requests(0);
            expect(request[0]).to.equal(addr1.address);
            expect(request[1]).to.equal(price);
            expect(request[2]).to.equal(responseTime);
        });

        it("Should create a new single request", async function () {
            await expect(
                requestContract.connect(addr1).createRequest([addrs[0].address], responseTime, {value: price}))
            .to.emit(requestContract, 'RequestCreated');

            expect(await requestContract.getBalance()).to.equal(price);
            expect(await requestContract.numRequests()).to.equal(1);
            expect(await requestContract.numberOfPendingRequests()).to.equal(1);

            const request = await requestContract.connect(addrs[0]).requests(0);
            expect(request[0]).to.equal(addr1.address);
            expect(request[1]).to.equal(price);
            expect(request[2]).to.equal(responseTime);
        });

        it("Should update balances after creating a request", async function () {
            price = ethers.utils.parseEther('1');

            await requestContract.connect(addr2).createRequest(signers, responseTime, {value: price});
            await requestContract.connect(addrs[0]).createRequest(signers, responseTime, {value: price});
            await requestContract.connect(addrs[0]).createRequest([addrs[1].address], responseTime, {value: price});

            expect(await requestContract.getBalance()).to.equal(ethers.utils.parseEther('3'));
            expect(await requestContract.connect(addr2).getRequesterBalance(addr2.address)).to.equal(ethers.utils.parseEther('1'));
            expect(await requestContract.connect(addrs[0]).getRequesterBalance(addrs[0].address)).to.equal(ethers.utils.parseEther('2'));
        });

        it("Should send a valid amount when creating a request", async function () {
            await expect(
                requestContract.connect(addr1).createRequest(signers, responseTime, {value: 0})
            ).to.be.revertedWith('Sent amount must be greater than 0');
        });
    
    });

    describe("Delete Request", function() {

        it("Should be able to delete a request when locking period expired", async function () {
            responseTime = 0;
            
            await requestContract.connect(addr1).createRequest(signers, responseTime, {value: price});
            await expect(
                requestContract.connect(addr1).deleteRequest(0)
            ).to.emit(requestContract, 'RequestDeleted');

            expect(await requestContract.getBalance()).to.equal(0);
            expect(await requestContract.numberOfPendingRequests()).to.equal(0);
            expect(await requestContract.numRequests()).to.equal(1);
        });

        it("Shouldn't delete a request before locking period expired", async function () {
            await requestContract.connect(addr2).createRequest(signers, responseTime, {value: price});

            await expect(
                requestContract.connect(addr2).deleteRequest(0)
            ).to.be.revertedWith('You must wait the response time to delete this request');
        });

        it("Shouldn't delete a request when sender is not the owner", async function () {
            const responseTime = 0;
            
            await requestContract.connect(addr1).createRequest(signers, responseTime, {value: price});

            await expect(
                requestContract.connect(addr2).deleteRequest(0)
            ).to.be.revertedWith('You are not the owner of the request');
        });

        it("Should return the payment when a request is deleted", async function () {
            const responseTime = 0;
            
            await requestContract.connect(addr2).createRequest(signers, responseTime, {value: price});
            const userBalance = await addr2.getBalance();

            await requestContract.connect(addr2).deleteRequest(0);
            expect(await requestContract.getBalance()).to.equal(0);
            expect(await addr2.getBalance()).to.be.above(userBalance);
        });

        it("Should return if a request is locked or not", async function () {
            await requestContract.connect(addr2).createRequest(signers, 0, {value: price});            
            expect(await requestContract.requestIsLocked(0)).to.equal(false);

            await requestContract.connect(addr2).createRequest(signers, 2,  {value: price});
            expect(await requestContract.requestIsLocked(1)).to.equal(true);
        });

        it("Should update balances when deleting a request", async function () {
            price = ethers.utils.parseEther('1');
            responseTime = 0;
            
            await requestContract.connect(addr2).createRequest(signers, responseTime, {value: price});
            await requestContract.connect(addr1).createRequest(signers, responseTime, {value: price});
            await requestContract.connect(addr1).createRequest([addrs[0].address], responseTime, {value: price});

            expect(await requestContract.getBalance()).to.equal(ethers.utils.parseEther('3'));
            expect(await requestContract.connect(addr2).getRequesterBalance(addr2.address)).to.equal(ethers.utils.parseEther('1'));
            expect(await requestContract.connect(addr1).getRequesterBalance(addr1.address)).to.equal(ethers.utils.parseEther('2'));

            await requestContract.connect(addr2).deleteRequest(0);
            expect(await requestContract.getBalance()).to.equal(ethers.utils.parseEther('2'));
            expect(await requestContract.connect(addr2).getRequesterBalance(addr2.address)).to.equal(0);
            expect(await requestContract.connect(addr1).getRequesterBalance(addr1.address)).to.equal(ethers.utils.parseEther('2'));
        });

    });

    describe("Mint Request", function() {

        it("Should be able to mint a request", async function () {
            await requestContract.connect(addr1).createRequest(signers, responseTime, {value: price});

            await expect(
                requestContract.connect(addrs[0]).mintRequest(0, signers, imageURI, metadataURI)
            ).to.emit(requestContract, 'RequestMinted');

            expect(await requestContract.getBalance()).to.equal(0);
            expect(await requestContract.numberOfPendingRequests()).to.equal(0);
            expect(await requestContract.numRequests()).to.equal(1);
        });

        it("Should be able to mint if is the contract owner", async function () {
            await requestContract.connect(addr1).createRequest(signers, responseTime, {value: price});

            await expect(
                requestContract.connect(owner).mintRequest(0, signers, imageURI, metadataURI)
            ).to.emit(requestContract, 'RequestMinted');
        });

        it("Shouldn't be able to mint if not a signer", async function () {
            await requestContract.connect(addr1).createRequest(signers, responseTime, {value: price});

            await expect(
                requestContract.connect(addr2).mintRequest(0, signers, imageURI, metadataURI)
            ).to.be.revertedWith('You are not an owner of the request');
        });

        it("Should send fees to wallet when minting a request", async function () {
            const feePercent = await requestContract.feePercent();
            const fee = price * feePercent / 100;
            const ownerBalance = await owner.getBalance();

            await requestContract.connect(addr1).createRequest(signers, responseTime, {value: price});
            await requestContract.connect(addrs[0]).mintRequest(0, signers, imageURI, metadataURI);
            
            const expectedOwnerBalance = BigNumber(ownerBalance.toString()).plus(fee);
            const currentOwnerBalance = await owner.getBalance();
            expect(BigNumber(currentOwnerBalance.toString()).toString()).to.equal(expectedOwnerBalance.toString());
        });

        it("Should send the payment to signers when minting a request", async function () {
            const feePercent = await requestContract.feePercent();
            const fee = price * feePercent / 100;
            const payment = (price - fee) / signers.length;

            const signer0Balance = await addrs[0].getBalance();
            const signer1Balance = await addrs[1].getBalance();
            const signer2Balance = await addrs[2].getBalance();

            await requestContract.connect(addr1).createRequest(signers, responseTime, {value: price});
            await requestContract.connect(owner).mintRequest(0, signers, imageURI, metadataURI);
            
            const expectedSigner0Balance = BigNumber(signer0Balance.toString()).plus(payment);
            const currentSigner0Balance = await addrs[0].getBalance();
            expect(BigNumber(currentSigner0Balance.toString()).toString()).to.equal(expectedSigner0Balance.toString());            

            const expectedSigner1Balance = BigNumber(signer1Balance.toString()).plus(payment);
            const currentSigner1Balance = await addrs[1].getBalance();
            expect(BigNumber(currentSigner1Balance.toString()).toString()).to.equal(expectedSigner1Balance.toString());

            const expectedSigner2Balance = BigNumber(signer2Balance.toString()).plus(payment);
            const currentSigner2Balance = await addrs[2].getBalance();
            expect(BigNumber(currentSigner2Balance.toString()).toString()).to.equal(expectedSigner2Balance.toString());
        });

        it("Should update balances when minting a request", async function () {
            price = ethers.utils.parseEther('1');
            
            await requestContract.connect(addr2).createRequest(signers, responseTime, {value: price});
            await requestContract.connect(addr1).createRequest(signers, responseTime, {value: price});
            await requestContract.connect(addr1).createRequest(signers, responseTime, {value: price});

            expect(await requestContract.getBalance()).to.equal(ethers.utils.parseEther('3'));
            expect(await requestContract.connect(addr2).getRequesterBalance(addr2.address)).to.equal(ethers.utils.parseEther('1'));
            expect(await requestContract.connect(addr1).getRequesterBalance(addr1.address)).to.equal(ethers.utils.parseEther('2'));

            await requestContract.connect(addrs[0]).mintRequest(0, signers, imageURI, metadataURI);
            expect(await requestContract.getBalance()).to.equal(ethers.utils.parseEther('2'));
            expect(await requestContract.connect(addr2).getRequesterBalance(addr2.address)).to.equal(ethers.utils.parseEther('0'));
            expect(await requestContract.connect(addr1).getRequesterBalance(addr1.address)).to.equal(ethers.utils.parseEther('2'));
        });

        it("Shouldn't be able to mint a request that doesn't exist", async function () {    
            const responseTime = 0;
            
            await requestContract.connect(addr1).createRequest(signers, responseTime, {value: price});
            await requestContract.connect(addr1).deleteRequest(0);

            await expect(
                requestContract.connect(addrs[0]).mintRequest(0, signers, imageURI, metadataURI)
            ).to.be.reverted;
        });

        it("Shouldn't be able to mint a request if it's already minted", async function () {
            await requestContract.connect(addr1).createRequest(signers, responseTime, {value: price});
            await requestContract.connect(addrs[0]).mintRequest(0, signers, imageURI, metadataURI);

            await expect(
                requestContract.connect(addrs[0]).mintRequest(0, signers, imageURI, metadataURI)
            ).to.be.reverted;
        });

    });

    describe("Fees Management", function() {

        it("Should be able to update fee percent", async function () {   
            expect(await requestContract.feePercent()).to.equal(10);
            await expect(
                await requestContract.connect(owner).setFeePercent(20)
            ).to.emit(requestContract, 'FeePercentChanged');
            expect(await requestContract.feePercent()).to.equal(20);
        });

        it("Shouldn't be able to update fee percent when sender is not the owner", async function () {   
            await expect(
                requestContract.connect(addr1).setFeePercent(20)
            ).to.be.reverted;
        });

        it("Should be able to update the wallet address", async function () {   
            expect(await requestContract.wallet()).to.equal(owner.address);
            await expect(
                requestContract.connect(owner).setWallet(addrs[3].address)
            ).to.emit(requestContract, 'WalletChanged');
            expect(await requestContract.wallet()).to.equal(addrs[3].address);
        });

        it("Shouldn't be able to update the wallet address if not the owner", async function () {   
            expect(await requestContract.wallet()).to.equal(owner.address);            
            await expect(
                requestContract.connect(addr2).setWallet(addrs[3].address)
            ).to.be.reverted;
        });

        it("Should send fees to new wallet when signing a request", async function () {
            const feePercent = await requestContract.feePercent();
            const fee = price * feePercent / 100;
            const newWalletBalance = await addrs[3].getBalance();
            const celebBalance = await addr1.getBalance();

            await requestContract.connect(owner).setWallet(addrs[3].address);
            const ownerBalance = await owner.getBalance();
            await requestContract.connect(addr1).createRequest(signers, responseTime, {value: price});
            await requestContract.connect(addrs[0]).mintRequest(0, signers, imageURI, metadataURI);
            
            const expectedWalletBalance = BigNumber(newWalletBalance.toString()).plus(fee);
            const currentWalletBalance = await addrs[3].getBalance();
            const currentOwnerBalance = await owner.getBalance();
            expect(BigNumber(currentWalletBalance.toString()).toString()).to.equal(expectedWalletBalance.toString());
            expect(BigNumber(currentOwnerBalance.toString()).toString()).to.equal(ownerBalance.toString());
        });

        it("Should be possible to send 100% fees to charity wallet", async function () {
            await requestContract.connect(owner).setFeePercent(100)
            const feePercent = await requestContract.feePercent();
            const fee = price * feePercent / 100;
            const newWalletBalance = await addrs[3].getBalance();
            const celebBalance = await addr1.getBalance();

            await requestContract.connect(owner).setWallet(addrs[3].address);
            await requestContract.connect(addr2).createRequest(signers, responseTime, {value: price});
            await requestContract.connect(owner).mintRequest(0, signers, imageURI, metadataURI);
            
            const expectedWalletBalance = BigNumber(newWalletBalance.toString()).plus(fee);
            const currentWalletBalance = await addrs[3].getBalance();
            const currentCelebBalance = await addr1.getBalance();
            expect(BigNumber(currentWalletBalance.toString()).toString()).to.equal(expectedWalletBalance.toString());
            expect(BigNumber(currentCelebBalance.toString()).toString()).to.equal(celebBalance.toString());
        });

    });

});