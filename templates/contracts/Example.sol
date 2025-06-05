// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Example {
  string public message;

  constructor(string memory _msg) {
    message = _msg;
  }

  function setMessage(string calldata _newMsg) external {
    message = _newMsg;
  }
}
