const { ethers, upgrades } = require("hardhat");
const { use, expect, assert } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("Autograph Contract", function() {

    let RequestContract, AutographContract, TokenContract;
    let requestContract, autographContract, tokenContract;
    let owner;
    let addr1;
    let addr2;
    let addrs;
    let price;
    let responseTime;
    let imageURI;
    let metadataURI;

    beforeEach(async function () {

        // Initializing variables
        price = 10;
        responseTime = 2;
        imageURI=
        imageURI = "https://ipfs.io/ipfs/QmWNcYhEcggdm1TFt2m6WmGqqQwfFXudr5eFzKPtm1nYwq";
        metadataURI = "https://ipfs.io/ipfs/QmUCxDBKCrx2JXV4ZNYLwhUPXqTvRAu6Zceoh1FNVumoec";

        // Deploying token contract
        TokenContract = await ethers.getContractFactory("TokenContract");
        tokenContract = await TokenContract.deploy();
        expect(tokenContract.address).to.properAddress;

        // Deploying autograph contract
        AutographContract = await ethers.getContractFactory("AutographContract");
        autographContract = await upgrades.deployProxy(AutographContract);
        expect(autographContract.address).to.properAddress;

        // Deploying requests contract
        RequestContract = await ethers.getContractFactory("RequestContract");
        requestContract = await upgrades.deployProxy(RequestContract, [autographContract.address, tokenContract.address], { initializer: 'initialize' });
        expect(requestContract.address).to.properAddress;

        // Getting tests accounts
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

        // Minting tokens
        await tokenContract.connect(owner).mint(addr2.address, 100);
        await tokenContract.connect(owner).mint(addrs[0].address, 100);
    });

    describe("Upgrade Contract", function () {

        it("Should upgrade contract", async function () {   
            await tokenContract.connect(addr2).approve(requestContract.address, price * 4);
            await requestContract.connect(addr2).createRequest(addr1.address, price, responseTime);
            await requestContract.connect(addr2).createRequest(addrs[0].address, price*3, responseTime);

            await requestContract.connect(addr1).signRequest(0, imageURI, metadataURI);
            await requestContract.connect(addrs[0]).signRequest(1, imageURI, metadataURI);

            expect(await autographContract.totalSupply()).to.equal(2);
            expect(await autographContract.ownerOf(0)).to.equal(addr2.address);
            expect(await autographContract.balanceOf(addr2.address)).to.equal(2);
            let token = await autographContract.autographs(0);
            expect(token.creator).to.equal(addr1.address);
            expect(token.imageURI).to.equal(imageURI);

            let AutographContractV2;
            AutographContractV2 = await ethers.getContractFactory("AutographContract");
            autographContract = await upgrades.upgradeProxy(autographContract.address, AutographContractV2);

            expect(await autographContract.totalSupply()).to.equal(2);
            expect(await autographContract.ownerOf(0)).to.equal(addr2.address);
            expect(await autographContract.balanceOf(addr2.address)).to.equal(2);
            token = await autographContract.autographs(0);
            expect(token.creator).to.equal(addr1.address);
            expect(token.imageURI).to.equal(imageURI);
        });

    });

    describe("Mint Autograph", function() {

        it("Should mint a correct NFT after signing a request", async function () {
            const responseTime = 0;

            await tokenContract.connect(addr2).approve(requestContract.address, price);
            await requestContract.connect(addr2).createRequest(addr1.address, price, responseTime);
            
            await expect (
                requestContract.connect(addr1).signRequest(0, imageURI, metadataURI)
            ).to.emit(autographContract, 'AutographMinted');

            expect(await autographContract.totalSupply()).to.equal(1);
            expect(await autographContract.ownerOf(0)).to.equal(addr2.address);
            expect(await autographContract.balanceOf(addr2.address)).to.equal(1);
            
            const token = await autographContract.autographs(0);
            expect(token.creator).to.equal(addr1.address);
            expect(token.imageURI).to.equal(imageURI);
        });

        it("Should return token creator", async function () {
            await tokenContract.connect(addr2).approve(requestContract.address, price);
            await requestContract.connect(addr2).createRequest(addr1.address, price, responseTime);
            await requestContract.connect(addr1).signRequest(0, imageURI, metadataURI);
  
            expect(await autographContract.creatorOf(0)).to.equal(addr1.address);
        });

    });

    describe("Transfer Autograph", function() {

        it("Should transfer a token between accounts", async function () {
            const responseTime = 0;

            await tokenContract.connect(addr2).approve(requestContract.address, price);
            await requestContract.connect(addr2).createRequest(addr1.address, price, responseTime);
            await requestContract.connect(addr1).signRequest(0, imageURI, metadataURI);

            await autographContract.connect(addr2).approve(addrs[0].address, 0);
            await autographContract.connect(addrs[0]).transferFrom(addr2.address, addrs[0].address, 0);

            expect(await autographContract.totalSupply()).to.equal(1);
            expect(await autographContract.ownerOf(0)).not.equal(addr2.address);
            expect(await autographContract.ownerOf(0)).to.equal(addrs[0].address);
            expect(await autographContract.balanceOf(addr2.address)).to.equal(0);
            expect(await autographContract.balanceOf(addrs[0].address)).to.equal(1);
        });

    });

});