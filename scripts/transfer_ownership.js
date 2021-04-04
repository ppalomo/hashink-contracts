// scripts/transfer_ownership.js
async function main() {
    //const newAdmin = '0xDaf3E0F6639776617b8fb1BE07b614aB93Bf19a8';
    const gnosisSafe = '0x063FE124FA0cbd4c33224C120351B2Fe304c48cc';
   
    console.log("Transferring ownership of ProxyAdmin...");
    // The owner of the ProxyAdmin can upgrade our contracts
    await upgrades.admin.transferProxyAdminOwnership(gnosisSafe);
    console.log("Transferred ownership of ProxyAdmin to:", gnosisSafe);
  }
   
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });

// npx hardhat run --network rinkeby scripts/transfer_ownership.js