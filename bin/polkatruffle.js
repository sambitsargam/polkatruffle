#!/usr/bin/env node

/**
 * PolkaTruffle CLI (v1.0.0+)
 *
 * - init <projectName>       → Scaffolds a Truffle project with Passet Hub config, then auto-runs `npm install` inside it.
 * - run <...truffleArgs>     → Proxies to `truffle <args>` using the bundled truffle-config.js.
 * - verify <address> --network <network> [--apiKey <key>]
 *                            → Verifies source on Passet Hub’s Blockscout.
 */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const axios = require("axios");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const chalk = require("chalk");

// —— CONFIGURATION CONSTANTS —— //
// Passet Hub RPC & Blockscout endpoints:
const DEFAULT_RPC = "https://testnet-passet-hub-eth-rpc.polkadot.io/";
const BLOCKSCOUT_API = "https://blockscout-passet-hub.parity-testnet.parity.io/api";

// Location of our template folder (relative to this file):
const TEMPLATE_DIR = path.join(__dirname, "../templates");

// —— HELPER FUNCTIONS —— //

/**
 * Recursively copy everything from src folder into dest folder
 */
function copyFolderSync(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyFolderSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Run a child process synchronously, inheriting stdout/stderr.
 * If it errors or exits nonzero, kill the parent process.
 */
function runCommandSync(command, args, opts = {}) {
  const result = spawnSync(command, args, { stdio: "inherit", ...opts });
  if (result.error) {
    console.error(chalk.red(`Error executing ${command}:`), result.error);
    process.exit(1);
  }
  if (result.status !== 0) {
    process.exit(result.status);
  }
}

// —— MAIN CLI —— //

yargs(hideBin(process.argv))
  .command(
    "init <projectName>",
    "Scaffold a new Truffle project configured for Passet Hub Testnet, then auto-run `npm install`.",
    (y) => {
      y.positional("projectName", {
        describe: "Name of the new project folder to create",
        type: "string",
      });
    },
    (argv) => {
      const projectName = argv.projectName.trim();
      if (!projectName) {
        console.error(chalk.red("Project name cannot be empty."));
        process.exit(1);
      }

      const dest = path.resolve(process.cwd(), projectName);
      if (fs.existsSync(dest)) {
        console.error(
          chalk.red(`❌ Directory "${projectName}" already exists. Aborting.`)
        );
        process.exit(1);
      }

      // 1) Create the new project folder:
      fs.mkdirSync(dest, { recursive: true });

      // 2) Copy the entire `templates/` folder into that new folder:
      copyFolderSync(TEMPLATE_DIR, dest);

      // 3) Inside the newly created folder, run `npm install`:
      console.log(chalk.blue(`\n📦 Installing dependencies in "${projectName}/"...\n`));
      runCommandSync("npm", ["install"], { cwd: dest });

      // 4) All done! Print a styled success message:
      console.log(
        chalk.green.bold("\n✅ Successfully initialized project ") +
          chalk.bold.cyan(`"\"${projectName}\""`) +
          chalk.green.bold("!")
      );
      console.log(`\n   ${chalk.yellow("Next steps:")}`);
      console.log(`     1. ${chalk.whiteBright(`cd ${projectName}`)}`);
      console.log(
        `     2. ${chalk.whiteBright(
          `# Create a .env file with your mnemonic or private key`
        )}`
      );
      console.log(
        `        ${chalk.gray(
          'MNEMONIC="your twelve-word mnemonic"'
        )}`
      );
      console.log(
        `        ${chalk.gray(
          'or PRIVATE_KEY="0xYourPrivateKeyHere"'
        )}`
      );
      console.log(
        `     3. ${chalk.whiteBright(
          `npx truffle compile && npx truffle migrate --network passetHubTestnet`
        )}`
      );
      console.log(
        chalk.green(`
┌─────────────────────────────────────────────────────────────────┐
│  🎉 You're all set. Happy smart‐contracting on Passet Hub! 🎉  │
└─────────────────────────────────────────────────────────────────┘
`)
      );
    }
  )
  .command(
    "run [truffleArgs..]",
    "Proxy to `truffle <...args>` using this project’s truffle-config.js",
    (y) => {
      y.positional("truffleArgs", {
        describe: "Arguments to pass to the Truffle CLI (e.g., compile, migrate)",
        type: "string",
      });
    },
    (argv) => {
      runCommandSync("npx", ["truffle", ...argv.truffleArgs]);
    }
  )
  .command(
    "verify <contractAddress>",
    "Verify a deployed contract on Passet Hub’s Blockscout",
    (y) => {
      y.positional("contractAddress", {
        describe: "Address of the deployed contract (0x…)",
        type: "string",
      });
      y.option("network", {
        alias: "n",
        describe:
          "Network name as defined in truffle-config.js (e.g., passetHubTestnet)",
        type: "string",
        demandOption: true,
      });
      y.option("apiKey", {
        alias: "k",
        describe:
          "Blockscout API key (or set BS_API_KEY in your environment)",
        type: "string",
      });
    },
    async (argv) => {
      const address = argv.contractAddress.trim();
      const network = argv.network.trim();
      const apiKey = argv.apiKey || process.env.BS_API_KEY;
      if (!apiKey) {
        console.error(
          chalk.red(
            "🛑 Blockscout API Key missing. Use --apiKey or set BS_API_KEY."
          )
        );
        process.exit(1);
      }

      let truffleConfig;
      try {
        truffleConfig = require(path.join(process.cwd(), "truffle-config.js"));
      } catch (e) {
        console.error(
          chalk.red(
            '🛑 Cannot load "truffle-config.js". Are you running this from the project root?'
          )
        );
        process.exit(1);
      }

      const networkConfig = truffleConfig.networks[network];
      if (!networkConfig) {
        console.error(
          chalk.red(
            `
Error: Network "${network}" not found in truffle-config.js.
`
          )
        );
        process.exit(1);
      }

      const solcConfig =
        truffleConfig.compilers?.solc || truffleConfig.solc || {};
      const solcVersion = solcConfig.version;
      const solcSettings = solcConfig.settings || {};
      if (!solcVersion) {
        console.error(
          chalk.red(
            "🛑 Cannot detect compiler version in truffle-config.js. Aborting."
          )
        );
        process.exit(1);
      }

      const BUILD_DIR = path.join(process.cwd(), "build", "contracts");
      let artifactFiles = [];
      try {
        artifactFiles = fs.readdirSync(BUILD_DIR);
      } catch (e) {
        console.error(
          chalk.red(
            '🛑 Cannot read "build/contracts" folder. Did you run `truffle compile`?'
          )
        );
        process.exit(1);
      }

      let matchedArtifactPath = null;
      for (const fileName of artifactFiles) {
        if (!fileName.endsWith(".json")) continue;
        const fullPath = path.join(BUILD_DIR, fileName);
        const jsonContent = JSON.parse(fs.readFileSync(fullPath, "utf8"));
        const netObj = jsonContent.networks?.[networkConfig.network_id];
        if (
          netObj &&
          netObj.address.toLowerCase() === address.toLowerCase()
        ) {
          matchedArtifactPath = fullPath;
          break;
        }
      }

      if (!matchedArtifactPath) {
        console.error(
          chalk.red(
            `🛑 Could not find an artifact in build/contracts whose address on network ${network} matches ${address}.`
          )
        );
        console.error(
          `  • Double-check you ran "truffle migrate --network ${network}"
  • Or that the address is correct.`
        );
        process.exit(1);
      }

      const artifact = JSON.parse(
        fs.readFileSync(matchedArtifactPath, "utf8")
      );
      const contractName = artifact.contractName;
      const sourcePath = path.join(
        process.cwd(),
        "contracts",
        `${contractName}.sol`
      );
      let sourceCode;
      try {
        sourceCode = fs.readFileSync(sourcePath, "utf8");
      } catch (e) {
        console.error(
          chalk.red(
            `🛑 Cannot read source file at ${sourcePath}. Make sure contracts/${contractName}.sol exists.`
          )
        );
        process.exit(1);
      }

      const postData = {
        apikey: apiKey,
        module: "contract",
        action: "verifysourcecode",
        contractaddress: address,
        sourceCode: sourceCode,
        codeformat: "solidity-single-file",
        contractname: `${contractName}.sol:${contractName}`,
        compilerversion: `v${solcVersion}`,
        optimizationUsed: solcSettings.optimizer?.enabled ? 1 : 0,
        runs: solcSettings.optimizer?.runs || 200,
        constructorArguements: artifact.constructorArguments || "",
      };

      console.log(
        chalk.blue(
          `\n🔎 Submitting verification for ${contractName} at ${address}...\n`
        )
      );
      try {
        const response = await axios.post(BLOCKSCOUT_API, null, {
          params: postData,
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        const data = response.data;
        if (data.status === "1") {
          console.log(
            chalk.green(`✅ Verification submitted successfully! GUID: ${data.result}`)
          );
          console.log(
            chalk.white(
              `   Check status at:\n   ${BLOCKSCOUT_API}?module=contract&action=checkverifystatus&guid=${data.result}\n`
            )
          );
        } else {
          console.error(chalk.red("❌ Verification submission failed:"));
          console.error(chalk.red(`   ${data.result}\n`));
        }
      } catch (err) {
        console.error(chalk.red("❌ HTTP request to Blockscout failed:"), err.message);
      }
    }
  )
  .demandCommand(1, "You must specify a command: init, run, or verify.")
  .help().argv;
