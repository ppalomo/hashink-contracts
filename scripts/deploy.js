async function main() {

    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account => ", deployer.address);

    console.log("Account balance => ", (await deployer.getBalance()).toString());

    // Deploying celebrities contract
    CelebrityContract = await ethers.getContractFactory("CelebrityContract");
    celebrityContract = await upgrades.deployProxy(CelebrityContract);
    console.log("CelebrityContract address => ", celebrityContract.address);
    //console.log("CelebrityContract Implemenation address => ", celebrityContract.);

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


// CelebrityContract address =>  0x887e0296bFdB8DB1B5bb4b855CbCc3F17b3Db3A0 -> 0x24e6e6850d018762734365e09bd2a12a4f8512aa
// AutographContract address =>  0x306F9f156cf1CC54C2e5640f68580dC318e22df0 -> 0xeabb9d1245633d4d7c6360100f8cce6075375258
// AutographRequestContract address =>  0x3416FF2aE00439B12d385Bc8240d0a6Ee18A6df1 -> 0x9e537408808e068eac7f4c042dd97ebd0b5c5b29


// CelebrityContract address =>  0x3D113295976bcDD9Bdb3fe75Efe635A6712da7a2 -> 0x32d3b3e11743d27fc5a582766b6e936701e707cf
// AutographContract address =>  0x7ED1436172B4C30aB7e887B1a50c772B7A6a44FB -> 0xeabb9d1245633d4d7c6360100f8cce6075375258 !!!!!
// AutographRequestContract address =>  0xd96936f61a7F6Ee7526881c9B2c8e854223910EB -> 0x9e537408808e068eac7f4c042dd97ebd0b5c5b29 !!!!!


// Cannot deploy on Goerli