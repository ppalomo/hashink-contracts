const { ethers, upgrades } = require("hardhat");
const { use, expect, assert } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("Autograph Contract", function() {

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

    describe("Mint Autograph", function() {

        it("Should mint a correct NFT after signing a request", async function () {
            const responseTime = 0;

            await celebrityContract.connect(addr1).createCelebrity(name, price, responseTime);
            await requestsContract.connect(addr2).createRequest(addr1.address, {value: price});
            await requestsContract.connect(addr1).signRequest(0, metadata);

            expect(await autographContract.totalSupply()).to.equal(1);
            expect(await autographContract.ownerOf(1)).to.equal(addr2.address);
            expect(await autographContract.balanceOf(addr2.address)).to.equal(1);
        });

    });

    describe("Transfer Autograph", function() {

        it("Should transfer a token between accounts", async function () {
            const responseTime = 0;

            await celebrityContract.connect(addr1).createCelebrity(name, price, responseTime);
            await requestsContract.connect(addr2).createRequest(addr1.address, {value: price});
            await requestsContract.connect(addr1).signRequest(0, metadata);

            await autographContract.connect(addr2).approve(addrs[0].address, 1);
            await autographContract.connect(addrs[0]).transferFrom(addr2.address, addrs[0].address, 1);

            expect(await autographContract.totalSupply()).to.equal(1);
            expect(await autographContract.ownerOf(1)).not.equal(addr2.address);
            expect(await autographContract.ownerOf(1)).to.equal(addrs[0].address);
            expect(await autographContract.balanceOf(addr2.address)).to.equal(0);
            expect(await autographContract.balanceOf(addrs[0].address)).to.equal(1);
        });

    });

});