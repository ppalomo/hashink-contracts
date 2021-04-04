// npx hardhat run --network rinkeby scripts/0001_initial_deploy.js

async function main() {

    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account => ", deployer.address);

    console.log("Account balance => ", (await deployer.getBalance()).toString());

    // Deploying celebrities contract
    CelebrityContract = await ethers.getContractFactory("CelebrityContract");
    celebrityContract = await upgrades.deployProxy(CelebrityContract);
    console.log("CelebrityContract address => ", celebrityContract.address);

    // Deploying autograph contract
    AutographContract = await ethers.getContractFactory("AutographContract");
    autographContract = await upgrades.deployProxy(AutographContract);
    console.log("AutographContract address => ", autographContract.address);

    // Deploying requests contract
    AutographRequestContract = await ethers.getContractFactory("AutographRequestContract");
    requestsContract = await upgrades.deployProxy(AutographRequestContract, [celebrityContract.address, autographContract.address], { initializer: 'initialize' });
    console.log("AutographRequestContract address => ", requestsContract.address);

}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });

// https://forum.openzeppelin.com/t/openzeppelin-upgrades-step-by-step-tutorial-for-hardhat/3580

// CelebrityContract address =>  0x74aC1BEA9C6a2E37cfe8a9C68E0988408e846698 -> 0xbd73d539b931af5999185ede89e79d51a6fca009
// AutographContract address =>  0x8A7c9a550A7EEEBd9aD0b07655F479848f812A7B -> 0xf975c465bddbb101d8d01d3c61410eb78aa68828
// AutographRequestContract address =>  0x1b011D9436011f408844E69ee3B9B5469562a747 -> 0x029c7ea5da75d1727a7b00d32302c4e58b902f0d

// Cannot deploy on Goerli