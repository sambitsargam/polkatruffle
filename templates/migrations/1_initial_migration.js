// 1_initial_migration.js
const Example = artifacts.require("Example");

module.exports = function (deployer) {
  // Pass an initial message
  deployer.deploy(Example, "Hello from Passet Hub!");
};
