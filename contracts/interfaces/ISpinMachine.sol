// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.8.0;

interface ISpinMachine {
    function spin() external returns (bool success, uint256 winnings);
    function canSpin(address account) external view returns(bool);
}