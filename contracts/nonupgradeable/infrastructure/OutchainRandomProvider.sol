// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.8.0;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IRandomProvider } from "../../interfaces/IRandomProvider.sol";

contract OutchainRandomProvider is Ownable, IRandomProvider {
    uint256 _randomNumber;

    function setRandomNumber(uint256 randomNumber) external onlyOwner {
        _randomNumber = randomNumber;
    }

    /**
     * @dev Returns (pseudo) random number.
     */
    function getRandomness() override external view returns(uint256) {
        return _randomNumber;
    }
}