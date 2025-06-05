[![npm version](https://img.shields.io/npm/v/polkatruffle.svg)](https://www.npmjs.com/package/polkatruffle)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

# 🎩 PolkaTruffle

> A drop-in Truffle suite preconfigured for **Passet Hub Testnet** (Chain ID 420420421) and other Parachain-EVM networks.  
> **No Docker required**—just scaffold, install, compile, migrate, and verify!


## 🚀 Features

- **🔧 One-command Scaffold**  
  Instantly create a brand-new Truffle project (`contracts/`, `migrations/`, `test/`, `truffle-config.js`) configured for Passet Hub Testnet.
- **📦 Automatic Dependency Install**  
  After scaffolding, `polkatruffle init <name>` runs `npm install` for you—no extra steps.
- **⚡ Proxy to Truffle**  
  Use `polkatruffle run <truffle-args>` instead of `npx truffle <...>`. Keeps your local Truffle version consistent.
- **🔍 Blockscout Verification**  
  `polkatruffle verify <address> --network passetHubTestnet` submits source code verification to Passet Hub’s Blockscout (Etherscan API–compatible).
- **🤝 Multi-network Ready**  
  Easily extend `truffle-config.js` to add Moonbeam, Astar, Moonriver, or any EVM-compatible parachain.
- **🎨 Friendly CLI Output**  
  Colorful, easy-to-read messages powered by [Chalk](https://www.npmjs.com/package/chalk).


## 📦 Installation

```bash
npm install -g polkatruffle
````

> If you prefer, you can also install it per‐project (as a dev dependency):
>
> ```bash
> npm install --save-dev polkatruffle
> ```


## 🏁 Quickstart

1. **Scaffold a New Project**

   ```bash
   polkatruffle init my-project
   ```

   * This creates a folder `my-project/` populated with:

     ```
     my-project/
     ├── contracts/
     │   └── Example.sol
     ├── migrations/
     │   └── 1_initial_migration.js
     ├── test/
     │   └── Example.test.js
     ├── truffle-config.js
     ├── .gitignore
     ├── package.json
     └── README.md
     ```
   * **Immediately** runs `npm install` inside `my-project/` for you.

2. **Enter Your Project & Create a `.env`**

   ```bash
   cd my-project
   echo 'MNEMONIC="your twelve-word mnemonic here"' > .env
   # — or — 
   # echo 'PRIVATE_KEY="0xYourPrivateKeyHere"' >> .env
   ```

   > Make sure `.env` is in `.gitignore` (it is by default). Never commit secrets to Git!

3. **Compile & Migrate**

   ```bash
   npx truffle compile
   npx truffle migrate --network passetHubTestnet
   ```

   * **Output**:

     ```
     Compiling your contracts...
     > Compiling ./contracts/Example.sol
     > Artifacts written to /.../my-project/build/contracts

     Starting migrations...
     > Network: passetHubTestnet (ID 420420421)
     > Deploying 'Example'
       • tx hash: 0xabc123...
       • block: 1234567 (confirmed)
       • contract: 0xdef456...
     ```

4. **Run Tests (Local or On-chain)**

   * **Local Ganache**:

     1. Install Ganache CLI: `npm install -g ganache-cli`
     2. Run: `ganache-cli -p 8545 -i 1337`
     3. In another terminal:

        ```bash
        npx truffle test --network ganache
        ```
   * **Passet Hub Testnet** (slower, real chain):

     ```bash
     npx truffle test --network passetHubTestnet
     ```

5. **Verify on Blockscout**

   ```bash
   polkatruffle verify 0xdef456... --network passetHubTestnet --apiKey YOUR_BLOCKSCOUT_API_KEY
   ```

   * Result:

     ```
     🔎 Submitting verification for Example at 0xdef456...

     ✅ Verification submitted successfully! GUID: 0x789abc...
        Check status:
        https://blockscout-passet-hub.parity-testnet.parity.io/api?module=contract&action=checkverifystatus&guid=0x789abc...
     ```

## 📖 Full Command Reference

### `polkatruffle init <projectName>`

* **Description**: Scaffolds a new Truffle project in `<projectName>/` using our `templates/`, then automatically runs `npm install` inside it.
* **Example**:

  ```bash
  polkatruffle init hdh-app
  # → Creates ./hdh-app, copies templates, and runs `npm install` inside "hdh-app/"
  ```
* **After Init**:

  1. `cd <projectName>`
  2. Create your `.env`:

     ```bash
     echo 'MNEMONIC="your mnemonic here"' > .env
     ```
  3. `npx truffle compile && npx truffle migrate --network passetHubTestnet`

---

### `polkatruffle run [truffleArgs...]`

* **Description**: Proxies directly to `npx truffle <truffleArgs...>` using your local Truffle version.
* **When to Use**:

  * `polkatruffle run compile`
  * `polkatruffle run migrate --network passetHubTestnet`
  * `polkatruffle run test --network ganache`
* **Example**:

  ```bash
  polkatruffle run compile
  polkatruffle run migrate --network passetHubTestnet
  polkatruffle run test --network ganache
  ```


### `polkatruffle verify <contractAddress> --network <network> [--apiKey <key>]`

* **Description**: Submits a source-code verification request to Passet Hub’s Blockscout.
* **Required**:

  * `<contractAddress>`: The exact 0x-prefixed address of your deployed contract.
  * `--network <network>`: Must match a network name in your `truffle-config.js` (e.g., `passetHubTestnet`).
* **Optional**:

  * `--apiKey <key>`: Your Blockscout API key. If you set `BS_API_KEY` in your environment, you can omit this flag.
* **Example**:

  ```bash
  polkatruffle verify 0xdef4567890abcdef1234567890abcdef12345678 \
    --network passetHubTestnet \
    --apiKey ABCDEF1234567890
  ```

## 🤝 Contributing

1. Fork the repository:

   ```bash
   git clone https://github.com/sambitsargam/polkatruffle.git
   cd polkatruffle
   ```
2. Install dependencies:

   ```bash
   npm install
   npm link    # so you can test your changes locally
   ```
3. Create a new branch for your feature or bugfix:

   ```bash
   git checkout -b feature/amazing-improvement
   ```
4. Make your changes in `bin/polkatruffle.js` or `templates/`.
5. Write tests (if applicable) and ensure everything still works:

   ```bash
   polkatruffle init test-app
   cd test-app
   npm test        # or run your own test suite
   ```
6. Commit, push to your fork, and open a Pull Request. We’ll review and merge!

---

## 📜 License
MIT License


> Crafted with ❤️ by **Sambit Sargam Ekalabya**
> Happy smart-contracting on Polkadot! 🚀
