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
// AutographContract address =>  0x44fFfF0C4E6FBD74332d3977e77b061B88FCb8bc -> 0x327c50123efee7fe15cc27c4d796cac4433f8f79
// RequestContract address =>  0xC317Dcdd36b122b993c971C1BCfB1c822323a5D7 -> 0x6ce77ef56c7e6c6410bd37bdf6598124ee351ddc

// Goerli
// ================================
// AutographContract address =>  0x5bf00e301c468FA372233Df42565f44643A88878 -> 0x0da6da70d9666dcf2b96493af83c4f256fb4e153
// RequestContract address =>  0xAd942fC81269e553184FE96D2e53BEcea2DCc4ba -> 0x05ed27fc2f2de5bf0b2b60db4eeca79ea9a08e0f

// Mumbai
// ================================
// AutographContract address =>  0xcB50cD0c169a0D5605BD7554E6Fd6D795ca34344
// RequestContract address =>  0x05Ed27fc2f2de5bF0B2B60dB4EeCa79ea9A08e0F -> 0x5bf00e301c468fa372233df42565f44643a88878