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
