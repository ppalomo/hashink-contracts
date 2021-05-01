// npx hardhat run --network rinkeby scripts/0001_initial_deploy.js

async function main() {

    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account => ", deployer.address);
    console.log("Account balance => ", (await deployer.getBalance()).toString());

    // Deploying autograph contract
    AutographContract = await ethers.getContractFactory("AutographContract");
    autographContract = await upgrades.deployProxy(AutographContract);
    console.log("AutographContract address => ", autographContract.address);

    // Deploying requests contract
    RequestContract = await ethers.getContractFactory("RequestContract");
    requestContract = await upgrades.deployProxy(RequestContract, [autographContract.address], { initializer: 'initialize' });
    console.log("RequestContract address => ", requestContract.address);

}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });

// Rinkeby
// ================================
// AutographContract address =>  0xFbd8c6e8b5ff34bd149884158D53a0b8E58861aC -> 0xec6143d5d4beaac6252626a2a0f73d320aaf2292
// RequestContract address =>  0x284129b07b7c9035a90d7F263F81A753B4b7cbc2 -> 0x2d2e85627c8a76534510031a633da06d4c34ac2e