// npx hardhat run --network rinkeby scripts/003_initial_seeds.js
require('dotenv').config();
const hre = require("hardhat");

let AutographRequestContract, AutographContract, CelebrityContract;
let requestsContract, autographContract, celebrityContract;

async function main() {

    // Initializing contracts
    console.log("Initializing contracts...")
    // CelebrityContract = await ethers.getContractFactory("CelebrityContract");    
    // celebrityContract = await CelebrityContract.attach(process.env.CELEBRITY_CONTRACT_ADDRESS);

    RequestContract = await ethers.getContractFactory("RequestContract");
    requestContract = await RequestContract.attach(process.env.REQUESTS_CONTRACT_ADDRESS);

    // Creating requests
    await createRequest(ethers.utils.parseEther('0.1'), process.env.USER_PRIVATEKEY, process.env.CELEB_PRIVATEKEY)

    // Signing request
    let imageURI = "https://ipfs.io/ipfs/QmWNcYhEcggdm1TFt2m6WmGqqQwfFXudr5eFzKPtm1nYwq";
    let metadataURI = "https://ipfs.io/ipfs/QmUCxDBKCrx2JXV4ZNYLwhUPXqTvRAu6Zceoh1FNVumoec";
    await signRequest(0, imageURI, metadataURI, process.env.CELEB_PRIVATEKEY);
    
    // https://testnets.opensea.io/collection/hashink-autograph-token
    // https://ipfs.io/ipfs/QmUCxDBKCrx2JXV4ZNYLwhUPXqTvRAu6Zceoh1FNVumoec
    // https://testnets.opensea.io/assets/0x6c6A48545ED918ec4416Fb062b442225643Aa277/0/?force_update=true
    // https://testnets-api.opensea.io/asset/0x6c6A48545ED918ec4416Fb062b442225643Aa277/0/validate/
}

async function createRequest(price, userPrivateKey, celebPrivateKey) {
    let userWallet = new ethers.Wallet(userPrivateKey, ethers.provider);
    let celebrityWallet = new ethers.Wallet(celebPrivateKey, ethers.provider);

    console.log(`Creating request from ${userWallet.address} to ${celebrityWallet.address}`);

    await requestsContract.connect(userWallet).createRequest(celebrityWallet.address, {value: price, gasLimit: 3000000});

    console.log(`Request created`);
}

async function signRequest(requestId, imageURI, metadataURI, celebPrivateKey) {
    let celebrityWallet = new ethers.Wallet(celebPrivateKey, ethers.provider);

    console.log(`Signing request ${requestId}`);

    await requestsContract.connect(celebrityWallet).signRequest(requestId, imageURI, metadataURI, { gasLimit: 3000000 });

    console.log(`Request signed`);
}
   
main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
});