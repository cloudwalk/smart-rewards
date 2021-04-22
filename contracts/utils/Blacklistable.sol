// SPDX-License-Identifier: MIT

pragma solidity ^0.6.12;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";

/**
 * @title Blacklistable Token
 * @dev Allows accounts to be blacklisted by a "blacklister" role
 */
contract Blacklistable is OwnableUpgradeable {
    address public blacklister;
    mapping(address => bool) internal blacklisted;

    event Blacklisted(address indexed _account);
    event UnBlacklisted(address indexed _account);
    event SelfBlacklisted(address indexed _account);
    event BlacklisterChanged(address indexed newBlacklister);

    function __Blacklistable_init() internal initializer {
        __Context_init_unchained();
        __Ownable_init_unchained();
        __Blacklistable_init_unchained();
    }

    function __Blacklistable_init_unchained() internal initializer {
    }

    /**
     * @dev Throws if called by any account other than the blacklister
     */
    modifier onlyBlacklister() {
        require(
            msg.sender == blacklister,
            "Blacklistable: caller is not the blacklister"
        );
        _;
    }

    /**
     * @dev Throws if argument account is blacklisted
     * @param _account The address to check
     */
    modifier notBlacklisted(address _account) {
        require(
            !blacklisted[_account],
            "Blacklistable: account is blacklisted"
        );
        _;
    }

    /**
     * @dev Checks if account is blacklisted
     * @param _account The address to check
     */
    function isBlacklisted(address _account) external view returns (bool) {
        return blacklisted[_account];
    }

    /**
     * @dev Adds account to blacklist
     * @param _account The address to blacklist
     */
    function blacklist(address _account) external onlyBlacklister {
        blacklisted[_account] = true;
        emit Blacklisted(_account);
    }

    /**
     * @dev Removes account from blacklist
     * @param _account The address to remove from the blacklist
     */
    function unBlacklist(address _account) external onlyBlacklister {
        blacklisted[_account] = false;
        emit UnBlacklisted(_account);
    }

    function updateBlacklister(address _newBlacklister) external onlyOwner {
        require(
            _newBlacklister != address(0),
            "Blacklistable: new blacklister is the zero address"
        );
        blacklister = _newBlacklister;
        emit BlacklisterChanged(blacklister);
    }

    /**
     * @dev Adds msg.sender to blacklist (self-blacklist)
     */
    function selfBlacklist() external {
        blacklisted[msg.sender] = true;
        emit Blacklisted(msg.sender);
        emit SelfBlacklisted(msg.sender);
    }
}