// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.8.0;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IFaucet } from "../../interfaces/IFaucet.sol";

abstract contract FaucetCaller is Ownable {
    address private _faucet;

    event FaucetChanged(address faucet);

    /**
     * @dev Requests faucet contract to renew `recipient` Ether balance.
     */
    function _faucetRequest(address recipient) internal {
        if(_faucet != address(0)) {
            IFaucet(_faucet).withdraw(payable(recipient));
        }
    }

    /**
     * @dev Returns `faucet` address.
     */
    function getFaucet() external view returns (address) {
        return _faucet;
    }

    /**
     * @dev Sets `faucet` address. Can only be called by the contract owner.
     * Emits an {FaucetChanged} event.
     */
    function setFaucet(address newFaucet) external onlyOwner {
        if(newFaucet != address(0)) {
            require(
                IFaucet(newFaucet).isFaucet(),
                "FaucetCaller: address isn't faucet");
        }
        _faucet = newFaucet;
        emit FaucetChanged(_faucet);
    }
}