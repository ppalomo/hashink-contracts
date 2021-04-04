// scripts/prepare_upgrade.js
async function main() {
    const proxyAddress = '0x3D113295976bcDD9Bdb3fe75Efe635A6712da7a2';

    const CelebrityContract = await ethers.getContractFactory("CelebrityContractV2");
    console.log("Preparing upgrade...");
    const celebrityContractV2Address = await upgrades.prepareUpgrade(proxyAddress, CelebrityContract);
    console.log("BoxV2 at:", celebrityContractV2Address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
});

// async function main() {

//     const [deployer] = await ethers.getSigners();

//     console.log("Deploying contracts with the account => ", deployer.address);

//     console.log("Account balance => ", (await deployer.getBalance()).toString());

//     // Deploying celebrities contract
//     CelebrityContract = await ethers.getContractFactory("CelebrityContract");
//     celebrityContract = await CelebrityContract.deploy();
//     console.log("CelebrityContract address => ", celebrityContract.address);
    
//     //celebrityContract = await upgrades.upgradeProxy(celebrityContract.address, CelebrityContractV2);
// }

// main()
//     .then(() => process.exit(0))
//     .catch(error => {
//         console.error(error);
//         process.exit(1);
//     });


    // proxy: 0x3D113295976bcDD9Bdb3fe75Efe635A6712da7a2
    // 0xFd33CdC7Bd90E94bf0E5266435912D0C6cE048C8