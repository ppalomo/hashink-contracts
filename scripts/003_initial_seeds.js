// npx hardhat run --network rinkeby scripts/003_initial_seeds.js
require('dotenv').config();
const hre = require("hardhat");

let AutographRequestContract, AutographContract, CelebrityContract;
let requestsContract, autographContract, celebrityContract;

async function main() {

    // Initializing contracts
    console.log("Initializing contracts...")
    CelebrityContract = await ethers.getContractFactory("CelebrityContract");    
    celebrityContract = await CelebrityContract.attach(process.env.CELEBRITY_CONTRACT_ADDRESS);

    AutographRequestContract = await ethers.getContractFactory("AutographRequestContract");
    requestsContract = await AutographRequestContract.attach(process.env.REQUESTS_CONTRACT_ADDRESS);

    // Creating celebrities
    await createCelebrity("Justin Shenkarow", ethers.utils.parseEther('0.1'), 2, process.env.CELEB_PRIVATEKEY);

    // Creating requests
    await createRequest(ethers.utils.parseEther('0.1'), process.env.USER_PRIVATEKEY, process.env.CELEB_PRIVATEKEY)

    // Signing request
    let metadata = "https://ipfs.io/ipfs/QmUCxDBKCrx2JXV4ZNYLwhUPXqTvRAu6Zceoh1FNVumoec";
    await signRequest(0, metadata, process.env.CELEB_PRIVATEKEY);
    
    // https://testnets.opensea.io/collection/hashink-autograph-token
    // https://ipfs.io/ipfs/QmUCxDBKCrx2JXV4ZNYLwhUPXqTvRAu6Zceoh1FNVumoec
    // https://testnets.opensea.io/assets/0x6c6A48545ED918ec4416Fb062b442225643Aa277/0/?force_update=true
    // https://testnets-api.opensea.io/asset/0x6c6A48545ED918ec4416Fb062b442225643Aa277/0/validate/
}

async function createCelebrity(name, price, responseTime, celebPrivateKey) {
    console.log(`Creating celebrity: ${name}`);
    
    let celebrityWallet = new ethers.Wallet(celebPrivateKey, ethers.provider);

    await celebrityContract.connect(celebrityWallet).createCelebrity(name, price, responseTime);
    console.log(`Celebrity created with address ${celebrityWallet.address}`);
}

async function createRequest(price, userPrivateKey, celebPrivateKey) {
    let userWallet = new ethers.Wallet(userPrivateKey, ethers.provider);
    let celebrityWallet = new ethers.Wallet(celebPrivateKey, ethers.provider);

    console.log(`Creating request from ${userWallet.address} to ${celebrityWallet.address}`);

    await requestsContract.connect(userWallet).createRequest(celebrityWallet.address, {value: price, gasLimit: 3000000});

    console.log(`Request created`);
}

async function signRequest(requestId, metadata, celebPrivateKey) {
    let celebrityWallet = new ethers.Wallet(celebPrivateKey, ethers.provider);

    console.log(`Signing request ${requestId}`);

    await requestsContract.connect(celebrityWallet).signRequest(requestId, metadata, { gasLimit: 3000000 });

    console.log(`Request signed`);
}
   
main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
});