// SPDX-License-Identifier: MIT

pragma solidity ^0.6.12;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./IFaucet.sol";

contract FaucetV1 is IFaucet, Ownable {
    using SafeMath for uint256;

    uint256 public recipientMinBalance;
    uint256 public recipientDesiredBalance;
    mapping (address => bool) public whitelist;

    event Withdraw(address indexed caller, address indexed to, uint256 amount);
    event Configure(uint256 recipientMinBalance, uint256 recipientDesiredBalance);
    event Whitelist(address indexed account, bool whitelisted);
    event Deposit(address indexed caller, uint256 amount);

    /**
     * @dev Deposit
     */
    function deposit() public payable {
        emit Deposit(msg.sender, msg.value);
    }

    /**
     * @dev Withdraw
     */
    function withdraw(address payable to) override external returns(uint256) {
        if(whitelist[msg.sender] && to.balance < recipientMinBalance) {
            uint256 amount = recipientDesiredBalance.sub(to.balance);
            if(amount > address(this).balance) {
                amount = address(this).balance;
            }
            to.transfer(amount);
            Withdraw(msg.sender, to, amount);
            return amount;
        }
    }

    /**
     * @dev Configure recipient min and desired balances.
     * Can only be called by the contract owner.
     * Emits an {Configure} event.
     */
    function configure(uint256 minBalance, uint256 desiredBalance) public onlyOwner {
        require(minBalance <= desiredBalance, "FaucetV1: minBalance <= desiredBalance");
        recipientMinBalance = minBalance;
        recipientDesiredBalance = desiredBalance;
        emit Configure(minBalance, desiredBalance);
    }

    /**
     * @dev Allows to withdraw contract entire balance.
     * Can only be called by the contract owner.
     */
    function withdrawAll(address payable to, uint256 amount) public onlyOwner {
        uint256 finalAmount = amount == 0 || amount > address(this).balance
            ? address(this).balance
            : amount;
        to.transfer(finalAmount);
    }

    /**
     * @dev Sets `account` as whitelisted or not.
     * Can only be called by the contract owner.
     * Emits an {Whitelist} event.
     */
    function setWhitelist(address account, bool whitelisted) public onlyOwner {
        whitelist[account] = whitelisted;
        emit Whitelist(account, whitelisted);
    }

    /**
     * @dev Payable fallback
     */
    receive() external payable
    {
    }
}