// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.8.0;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";

abstract contract PausableEx is Ownable, Pausable {
    address private _pauser;

    event PauserChanged(address indexed pauser);

    /**
     * @dev Throws if called by any account other than the pauser.
     */
    modifier onlyPauser() {
        require(getPauser() == _msgSender(), "PausableEx: caller is not the pauser");
        _;
    }

    /**
     * @dev Returns `pauser` address.
     */
    function getPauser() public view virtual returns(address) {
        return _pauser;
    }

    /**
     * @dev Sets `pauser` address. Can only be called by the contract owner.
     * Emits an {PauserChanged} event.
     */
    function setPauser(address newPauser) external onlyOwner {
        _pauser = newPauser;
        emit PauserChanged(_pauser);
    }

    /**
     * @dev Triggers paused state. Can only be called by the pauser account.
     * Requirements:
     * - The contract must not be paused.
     */
    function pause() external onlyPauser {
        _pause();
    }

    /**
     * @dev Triggers unpaused state. Can only be called by the pauser account.
     * Requirements:
     * - The contract must be paused.
     */
    function unpause() external onlyPauser {
        _unpause();
    }
}