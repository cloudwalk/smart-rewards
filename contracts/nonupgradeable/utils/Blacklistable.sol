// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.8.0;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Blacklistable Token
 * @dev Allows accounts to be blacklisted by a "blacklister" role
 */
abstract contract Blacklistable is Ownable {
    address private _blacklister;
    mapping(address => bool) private _blacklisted;

    event Blacklisted(address indexed account);
    event UnBlacklisted(address indexed account);
    event SelfBlacklisted(address indexed account);
    event BlacklisterChanged(address indexed newBlacklister);

    /**
     * @dev Throws if called by any account other than the blacklister
     */
    modifier onlyBlacklister() {
        require(
            getBlacklister() == _msgSender(),
            "Blacklistable: caller is not the blacklister"
        );
        _;
    }

    /**
     * @dev Throws if argument account is blacklisted
     * @param account The address to check
     */
    modifier notBlacklisted(address account) {
        require(
            !_blacklisted[account],
            "Blacklistable: account is blacklisted"
        );
        _;
    }

    function getBlacklister() public view virtual returns (address) {
        return _blacklister;
    }

    /**
     * @dev Checks if account is blacklisted
     * @param account The address to check
     */
    function isBlacklisted(address account) public view returns (bool) {
        return _blacklisted[account];
    }

    /**
     * @dev Adds account to blacklist
     * @param account The address to blacklist
     */
    function blacklist(address account) external onlyBlacklister {
        _blacklisted[account] = true;
        emit Blacklisted(account);
    }

    /**
     * @dev Removes account from blacklist
     * @param account The address to remove from the blacklist
     */
    function unBlacklist(address account) external onlyBlacklister {
        _blacklisted[account] = false;
        emit UnBlacklisted(account);
    }

    function setBlacklister(address newBlacklister) external onlyOwner {
        require(
            newBlacklister != address(0),
            "Blacklistable: new blacklister is the zero address"
        );
        _blacklister = newBlacklister;
        emit BlacklisterChanged(_blacklister);
    }

    /**
     * @dev Adds _msgSender() to blacklist (self-blacklist)
     */
    function selfBlacklist() external {
        _blacklisted[_msgSender()] = true;
        emit SelfBlacklisted(_msgSender());
        emit Blacklisted(_msgSender());
    }
}