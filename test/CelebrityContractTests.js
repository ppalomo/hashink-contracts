const { ethers, upgrades } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("Celebrity Contract", function () {

    let CelebrityContract;
    let celebrityContract;
    let owner;
    let addr1;
    let addr2;
    let addrs;
    let name;
    let price;
    let responseTime;

    beforeEach(async function () {

        // Initializing variables
        name = "Justin Shenkarow";
        price = ethers.utils.parseEther('2');
        responseTime = 2;

        // Deploying celebrities contract
        CelebrityContract = await ethers.getContractFactory("CelebrityContract");
        celebrityContract = await upgrades.deployProxy(CelebrityContract);
        expect(celebrityContract.address).to.properAddress;

        // Getting tests accounts
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    });

    describe("Upgrade Contract", function () {

        it("Should upgrade contract", async function () {
            await celebrityContract.connect(addr1).createCelebrity(name, price, responseTime);
            await celebrityContract.connect(addr2).createCelebrity("Vitalik Buterin", ethers.utils.parseEther('4'), 0);
            
            expect(await celebrityContract.getTotalSupply()).to.equal(2);

            let CelebrityContractV2;
            CelebrityContractV2 = await ethers.getContractFactory("CelebrityContractV2");
            celebrityContract = await upgrades.upgradeProxy(celebrityContract.address, CelebrityContractV2);

            expect(await celebrityContract.getTotalSupply()).to.equal(2);
        });

    });

    describe("Create Celebrity", function() {

        it("Should create a new celebrity", async function () {
            await expect(
                celebrityContract.connect(addr1).createCelebrity(name, price, responseTime)
            ).to.emit(celebrityContract, 'CelebrityCreated');
            
            const celeb = await celebrityContract.celebrities(addr1.address);
            
            expect(celeb[0]).to.equal(name);
            expect(celeb[1]).to.equal(price);
            expect(celeb[2]).to.equal(responseTime);
            expect(celeb[3]).to.equal(true);
            expect(await celebrityContract.getTotalSupply()).to.equal(1);
        });

        it("Should create a bunch of celebrities", async function () {
            await expect(
                celebrityContract.connect(addr1).createCelebrity(name, price, responseTime)
            ).to.emit(celebrityContract, 'CelebrityCreated');

            await expect(
                celebrityContract.connect(addr2).createCelebrity("Homer Simpson", price, 0)
            ).to.emit(celebrityContract, 'CelebrityCreated');
            
            const celeb = await celebrityContract.celebrities(addr1.address);            
            expect(celeb[0]).to.equal(name);
            expect(celeb[1]).to.equal(price);
            expect(celeb[2]).to.equal(responseTime);
            expect(celeb[3]).to.equal(true);

            expect(await celebrityContract.getTotalSupply()).to.equal(2);
        });

        it("Shouldn't create two celebrities with same address", async function () {
            await celebrityContract.connect(addr1).createCelebrity("Vitalik Buterin", ethers.utils.parseEther('1'), 4);
            await expect(
                celebrityContract.connect(addr1).createCelebrity(name, price, responseTime)
            ).to.be.revertedWith('This address already exists');
        });

        it("Should create a celebrity after being deleted", async function () {
            await celebrityContract.connect(addr1).createCelebrity(name, price, responseTime);
            expect(await celebrityContract.getTotalSupply()).to.equal(1);
    
            await celebrityContract.connect(addr1).deleteCelebrity(addr1.address);
            expect(await celebrityContract.getTotalSupply()).to.equal(0)
                
            await celebrityContract.connect(addr1).createCelebrity(name, price, responseTime);
            expect(await celebrityContract.getTotalSupply()).to.equal(1);
        });

    });

    describe("Delete Celebrity", function() {

        it("Should delete a celebrity", async function () {
            await celebrityContract.connect(addr1).createCelebrity(name, price, responseTime);
            expect(await celebrityContract.getTotalSupply()).to.equal(1);

            await expect(
                celebrityContract.connect(addr1).deleteCelebrity(addr1.address)
            ).to.emit(celebrityContract, 'CelebrityDeleted');
            const celeb = await celebrityContract.celebrities(addr1.address);

            expect(celeb[0]).to.equal('');
            expect(celeb[1]).to.equal(0);
            expect(celeb[2]).to.equal(0);
            expect(celeb[3]).to.equal(false);
            expect(await celebrityContract.getTotalSupply()).to.equal(0);
        });

        it("Shouldn't delete a celebrity if caller isn't the owner", async function () {
            await celebrityContract.connect(addr1).createCelebrity(name, price, responseTime);
            
            await expect (
                celebrityContract.connect(addrs[0]).deleteCelebrity(addr1.address)
            ).to.be.revertedWith('You are not the owner');
        });

        it("Shouldn't delete a celebrity if doesn't exist", async function () {
            await celebrityContract.connect(addr1).createCelebrity(name, price, responseTime);
            
            await expect (
                celebrityContract.connect(addrs[0]).deleteCelebrity(addrs[0].address)
            ).to.be.revertedWith('This address does not exist');
        });

    });

    describe("Update Celebrity", function() {

        it("Should update celebrity information", async function () {
            await celebrityContract.connect(addr1).createCelebrity("Vitalik Buterin", ethers.utils.parseEther('1'), 4);
            await expect (
                celebrityContract.connect(addr1).updateCelebrity(name, price, responseTime)
            ).to.emit(celebrityContract, 'CelebrityUpdated');
            
            const celeb = await celebrityContract.celebrities(addr1.address);
            expect(celeb[0]).to.equal(name);
            expect(celeb[1]).to.equal(price);
            expect(celeb[2]).to.equal(responseTime);
            expect(celeb[3]).to.equal(true);
        });

    });

});