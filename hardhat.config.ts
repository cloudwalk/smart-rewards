import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "@openzeppelin/hardhat-upgrades";
//import "@eth-optimism/hardhat-ovm";
import "@nomiclabs/hardhat-etherscan";

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.7.6",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000
      }
    }
  },
  ovm: {
    solcVersion: '0.7.6'
  },
  networks: {
    hardhat: {
      accounts: {
        mnemonic: 'test test test test test test test test test test test junk'
      }
    },
    l1: {
      //url: 'https://eth-kovan.alchemyapi.io/v2/eZuRpvq9obP1Yhf89IbH7tuDu_4Vscvj',
      url: 'https://eth-kovan.alchemyapi.io/v2/eZuRpvq9obP1Yhf89IbH7tuDu_4Vscvj',
      accounts: {
        mnemonic: 'dry earth salute forum trouble proof tail smooth hammer spring cliff alcohol'
      },
      timeout: 200000
    },
    optimism: {

      url: 'https://kovan.optimism.io',
      //url: 'http://127.0.0.1:8545',
      accounts: {
        mnemonic: 'dry earth salute forum trouble proof tail smooth hammer spring cliff alcohol'
      },
      gasPrice: 15000000,
      gas: 210000000,
      ovm: true
    }
  },
  etherscan: {
    // API key for Etherscan
    apiKey: "CQJDYCZNIHKPSFSN8X69QK51GVFWSG39BW"
  }
};
