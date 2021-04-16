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
// AutographContract address =>  0xA2879ac731dAAB8B08865759870e9c33c951B7a3 -> 0x327c50123efee7fe15cc27c4d796cac4433f8f79
// RequestContract address =>  0xfe0E8977dD57aCfb1B4444E28A27e2B1F587C3a1 -> 0xd2f088f53fb81b57c0898b1720bb399714041ef2

// Mumbai
// ================================
// AutographContract address =>  0xAd942fC81269e553184FE96D2e53BEcea2DCc4ba -> 0xab4ea7f74f7eaeb739282497ec448fdbc93d2883
// RequestContract address =>  0x1DAA3e62324B43B71A207353e20F44B4A87C89Ce