const Example = artifacts.require("Example");
const { assert } = require("chai");

contract("Example", (accounts) => {
  let instance;

  before(async () => {
    instance = await Example.deployed();
  });

  it("should initialize with the correct message", async () => {
    const msg = await instance.message();
    assert.equal(msg, "Hello from Passet Hub!");
  });

  it("should update the message when setMessage is called", async () => {
    await instance.setMessage("Updated message");
    const updated = await instance.message();
    assert.equal(updated, "Updated message");
  });
});
