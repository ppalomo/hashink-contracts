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