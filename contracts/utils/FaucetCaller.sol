// SPDX-License-Identifier: MIT

pragma solidity ^0.6.12;

import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "../faucet/IFaucet.sol";

contract FaucetCaller is OwnableUpgradeable {
    using AddressUpgradeable for address;

    address public faucet;

    event FaucetChanged(address faucet);

    function __FaucetCaller_init() internal initializer {
        __Context_init_unchained();
        __Ownable_init_unchained();
        __FaucetCaller_init_unchained();
    }

    function __FaucetCaller_init_unchained() internal initializer {
    }

    /**
     * @dev Requests faucet contract to renew `recipient` Ether balance.
     */
    function _faucetRequest(address recipient) internal {
        if(faucet != address(0) && !recipient.isContract()) {
            IFaucet(faucet).withdraw(payable(recipient));
        }
    }

    /**
     * @dev Sets `faucet` address. Can only be called by the contract owner.
     * Emits an {FaucetChanged} event.
     */
    function setFaucet(address newFaucet) public onlyOwner {
        faucet = newFaucet;
        emit FaucetChanged(newFaucet);
    }
}