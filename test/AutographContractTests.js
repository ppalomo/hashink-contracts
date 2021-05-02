const { ethers, upgrades } = require("hardhat");
const { use, expect, assert } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("Autograph Contract", function() {

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
        signers = [addrs[0].address, addrs[1].address, addrs[2].address];
    });

    describe("Upgrade Contract", function () {

        it("Should upgrade contract", async function () {   
            await requestContract.connect(addr2).createRequest(signers, responseTime, {value: ethers.utils.parseEther('1')});
            await requestContract.connect(addr2).createRequest(signers, responseTime, {value: ethers.utils.parseEther('3')});

            await requestContract.connect(addrs[0]).mintRequest(0, signers, imageURI, metadataURI);
            await requestContract.connect(addrs[1]).mintRequest(1, signers, imageURI, metadataURI);

            expect(await autographContract.totalSupply()).to.equal(2);
            expect(await autographContract.ownerOf(0)).to.equal(addr2.address);
            expect(await autographContract.balanceOf(addr2.address)).to.equal(2);

            let AutographContractV2;
            AutographContractV2 = await ethers.getContractFactory("AutographContract");
            autographContract = await upgrades.upgradeProxy(autographContract.address, AutographContractV2);

            expect(await autographContract.totalSupply()).to.equal(2);
            expect(await autographContract.ownerOf(0)).to.equal(addr2.address);
            expect(await autographContract.balanceOf(addr2.address)).to.equal(2);
        });

    });

    describe("Mint Autograph", function() {

        it("Should mint a correct NFT after signing a request", async function () {
            await requestContract.connect(addr2).createRequest(signers, responseTime, {value: price});
            
            await expect (
                requestContract.connect(addrs[0]).mintRequest(0, signers, imageURI, metadataURI))
            .to.emit(autographContract, 'AutographMinted')
            .withArgs(0, signers, addr2.address, imageURI, metadataURI);

            expect(await autographContract.totalSupply()).to.equal(1);
            expect(await autographContract.ownerOf(0)).to.equal(addr2.address);
            expect(await autographContract.balanceOf(addr2.address)).to.equal(1);
            expect(await autographContract.tokenURI(0)).to.equal(metadataURI);
            expect(await autographContract.imageURI(0)).to.equal(imageURI);

            const token = await autographContract.autographs(0);
            expect(token).to.equal(imageURI);
        });

        it("Should return token creators", async function () {
            await requestContract.connect(addr2).createRequest(signers, responseTime, {value: price});
            await requestContract.connect(addrs[0]).mintRequest(0, signers, imageURI, metadataURI);
  
            const tokenSigners = await autographContract.creatorOf(0);
            expect(tokenSigners[0]).to.equal(signers[0]);
            expect(tokenSigners[1]).to.equal(signers[1]);
            expect(tokenSigners[2]).to.equal(signers[2]);
        });

    });

    describe("Transfer Autograph", function() {

        it("Should transfer a token between accounts", async function () {
            const responseTime = 0;

            await requestContract.connect(addr2).createRequest(signers, responseTime, {value: price});
            await requestContract.connect(addrs[0]).mintRequest(0, signers, imageURI, metadataURI);

            await autographContract.connect(addr2).approve(addr1.address, 0);
            await autographContract.connect(addr1).transferFrom(addr2.address, addr1.address, 0);

            expect(await autographContract.totalSupply()).to.equal(1);
            expect(await autographContract.ownerOf(0)).not.equal(addr2.address);
            expect(await autographContract.ownerOf(0)).to.equal(addr1.address);
            expect(await autographContract.balanceOf(addr2.address)).to.equal(0);
            expect(await autographContract.balanceOf(addr1.address)).to.equal(1);
        });

    });

});