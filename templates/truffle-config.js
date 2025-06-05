const HDWalletProvider = require("@truffle/hdwallet-provider");
require("dotenv").config();

module.exports = {
  networks: {
    // ---------------------------------------------------------------
    // Passet Hub Testnet
    // ---------------------------------------------------------------
    passetHubTestnet: {
      provider: () => {
        // Use either MNEMONIC or PRIVATE_KEY (prefixed by 0x)
        if (process.env.MNEMONIC && process.env.MNEMONIC.length > 0) {
          return new HDWalletProvider({
            mnemonic: {
              phrase: process.env.MNEMONIC,
            },
            providerOrUrl: "https://testnet-passet-hub-eth-rpc.polkadot.io/",
            numberOfAddresses: 1,
          });
        }
        if (process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.length > 0) {
          return new HDWalletProvider({
            privateKeys: [process.env.PRIVATE_KEY],
            providerOrUrl: "https://testnet-passet-hub-eth-rpc.polkadot.io/",
          });
        }
        throw new Error(
          "🔑 Neither MNEMONIC nor PRIVATE_KEY defined in .env. Set one to deploy."
        );
      },
      network_id: 420420421,
      gas: 8000000,
      gasPrice: 20000000000, // 20 Gwei
    },
    //────────────────────────────────────────────────────────────────
    // (Optional) Local Ganache for quick iteration:
    // ganache: {
    //   host: "127.0.0.1",
    //   port: 8545,
    //   network_id: "*",
    // },
  },


  // Compiler settings (use a fixed, supported version)
  compilers: {
    solc: {
      version: "0.8.28",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  },
};
