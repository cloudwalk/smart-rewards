// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.8.0;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IRandomProvider } from "../../interfaces/IRandomProvider.sol";

abstract contract Randomable is Ownable {
    address private _randomProvider;

    event RandomProviderChanged(address indexed randomProvider);

    /**
     * @dev Requests and returns random number form random provider.
     */
    function _getRandomness() internal view returns(uint256) {
        return IRandomProvider(_randomProvider).getRandomness();
    }

    /**
     * @dev Sets `randomProvider` address. Can only be called by the contract owner.
     * Emits an {RandomProviderChanged} event.
     */
    function setRandomProvider(address newRandomProvider) external onlyOwner {
        _randomProvider = newRandomProvider;
        emit RandomProviderChanged(_randomProvider);
    }

    /**
     * @dev Returns `randomProvider` address.
     */
    function getRandomProvider() external view returns(address) {
        return _randomProvider;
    }
}