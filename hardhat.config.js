require('dotenv').config();
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("@openzeppelin/hardhat-upgrades");
require("hardhat-gas-reporter");

module.exports = {
  solidity: "0.8.0",
  networks: {
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [`0x${process.env.MAINNET_PRIVATE_KEY}`]
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [`0x${process.env.GOERLI_PRIVATE_KEY}`]
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [`0x${process.env.RINKEBY_PRIVATE_KEY}`]
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [`0x${process.env.ROPSTEN_PRIVATE_KEY}`],
      gasPrice: 0
    },
    mumbai: { //80001
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: [`0x${process.env.MUMBAI_PRIVATE_KEY}`]
    },
    // matic: { //137
    //   url: "https://rpc-mainnet.maticvigil.com",
    //   accounts: [`0x${process.env.MATIC_PRIVATE_KEY}`]
    // },
    // xdai: { //100
    //   url: "https://rpc-mumbai.maticvigil.com",
    //   accounts: [`0x${process.env.MATIC_PRIVATE_KEY}`]
    // }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  // https://github.com/cgewecke/eth-gas-reporter
  gasReporter: {
    currency: 'USD',
    enabled: true,
    coinmarketcap: `${process.env.COINMARKETCAP_KEY}`
  }
};

