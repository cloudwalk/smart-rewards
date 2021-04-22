// SPDX-License-Identifier: MIT

pragma solidity ^0.6.12;

interface IFaucet {
    function withdraw(address payable recipient) external returns(uint256);
}