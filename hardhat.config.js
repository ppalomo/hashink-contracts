require('dotenv').config();
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("@openzeppelin/hardhat-upgrades");
require("hardhat-gas-reporter");

module.exports = {
  // defaultNetwork: "rinkeby",
  solidity: {
    version: "0.8.0",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {    
    artifacts: './artifacts',
  },
  networks: {
    localhost: {
      chainId: 1337,
      allowUnlimitedContractSize: false,
      gasPrice: "auto",
      timeout: 10000000,
      gas: "auto",
    },
    hardhat: {
      chainId: 31337,
      allowUnlimitedContractSize: false,
      gasPrice: 300000000000,
      timeout: 30000000
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [`0x${process.env.REACT_APP_DEPLOYER_PRIVATE_KEY}`]
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [`0x${process.env.REACT_APP_DEPLOYER_PRIVATE_KEY}`]
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.REACT_APP_INFURA_API_KEY}`,
      accounts: [`0x${process.env.REACT_APP_DEPLOYER_PRIVATE_KEY}`]
    },
    kovan: {
      url: `https://kovan.infura.io/v3/${process.env.REACT_APP_INFURA_API_KEY}`,
      accounts: [`0x${process.env.REACT_APP_DEPLOYER_PRIVATE_KEY}`]
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [`0x${process.env.REACT_APP_DEPLOYER_PRIVATE_KEY}`],
      gasPrice: 0
    },
    mumbai: { //80001
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: [`0x${process.env.REACT_APP_DEPLOYER_PRIVATE_KEY}`]
    },
    matic: { //137
      url: "https://rpc-mainnet.maticvigil.com",
      accounts: [`0x${process.env.REACT_APP_DEPLOYER_PRIVATE_KEY}`]
    },
    optimistic_kovan: { //69
      url: "https://kovan.optimism.io",
      accounts: [`0x${process.env.REACT_APP_DEPLOYER_PRIVATE_KEY}`]
    },
    optimistic: { //10
      url: "https://mainnet.optimism.io",
      accounts: [`0x${process.env.REACT_APP_DEPLOYER_PRIVATE_KEY}`]
    }
  },
  etherscan: {
    apiKey: process.env.REACT_APP_ETHERSCAN_API_KEY
  },
  // https://github.com/cgewecke/eth-gas-reporter
  gasReporter: {
    currency: 'USD',
    enabled: false,
    coinmarketcap: `${process.env.REACT_APP_COINMARKETCAP_KEY}`
  },
  mocha: {
    timeout: 10000000
  }
};