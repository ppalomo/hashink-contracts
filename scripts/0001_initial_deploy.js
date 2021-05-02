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
// AutographContract address =>  0xE1A19Eb074815e4028768182F8971D222416159A -> 0x8217d31388c8bdd813f7c3e492e0fc731879fbe6
// RequestContract address =>  0x02503Db8F44F67ED7ED6C85Acab2ad95A9078493 -> 0x2d2e85627c8a76534510031a633da06d4c34ac2e