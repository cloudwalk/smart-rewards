// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <0.8.0;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from  "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import { SafeMath } from  "@openzeppelin/contracts/math/SafeMath.sol";
import { Math } from "@openzeppelin/contracts/math/Math.sol";
import { Blacklistable } from "./utils/Blacklistable.sol";
import { FaucetCaller } from "./utils/FaucetCaller.sol";
import { PausableEx } from "./utils/PausableEx.sol";
import { Rescuable } from "./utils/Rescuable.sol";
import { Randomable } from "./utils/Randomable.sol";
import { ISpinMachine } from "../interfaces/ISpinMachine.sol";

contract SpinMachine is Rescuable, PausableEx, Blacklistable, FaucetCaller, Randomable, ISpinMachine {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    address public token;
    mapping(address => uint256) public lastFreeSpin;
    mapping(address => uint256) public extraSpins;
    uint256 public extraSpinPrice;
    uint256 public freeSpinDelay;
    uint256[] private _prizes;

    event PrizesDistributionChanged(uint256[] prizes);
    event FreeSpinDelayChanged(uint256 newDelay, uint256 oldDelay);
    event ExtraSpinPriceChanged(uint256 newPrice, uint256 oldPrice);
    event ExtraSpinPurchased(address indexed sender, address indexed spinOwner, uint256 count);
    event ExtraSpinGranted(address indexed sender, address indexed spinOwner, uint256 count);
    event Spin(address indexed sender, uint256 winnings, uint256 sent, bool extra);

    constructor(address token_) {
        token = token_;
        freeSpinDelay = 1 days;
        _prizes.push(0);
    }

    /**
     * @dev Sets time delay for the next free spin.
     * Can only be called by the contract owner.
     * Emits an {FreeSpinDelayChanged} event.
     */
    function setFreeSpinDelay(uint256 newDelay) public onlyOwner {
        emit FreeSpinDelayChanged(newDelay, freeSpinDelay);
        freeSpinDelay = newDelay;
    }

    /**
     * @dev Sets price for a single extra spin.
     * Can only be called by the contract owner.
     * Emits an {ExtraSpinPriceChanged} event.
     */
    function setExtraSpinPrice(uint256 newPrice) public onlyOwner {
        emit ExtraSpinPriceChanged(newPrice, extraSpinPrice);
        extraSpinPrice = newPrice;
    }

    /**
     * @dev Buy specified amount (`count`) of extra spins for `spinOwner`.
     * Can only be called when contract is not paused.
     * Emits an {ExtraSpinPurchased} event.
     * Requirements:
     * - `spinOwner` cannot be the zero address
     * - `count` must be gretaer than 0
     * - ERC20 allowance required
     */
    function buyExtraSpin(address spinOwner, uint256 count) public whenNotPaused {
        require(spinOwner != address(0), "SpinMachine: spinOwner is the zero address");
        require(count > 0, "SpinMachine: spins count must be greater than 0");
        IERC20(token).safeTransferFrom(msg.sender, address(this), extraSpinPrice.mul(count));
        extraSpins[spinOwner] = extraSpins[spinOwner].add(count);
        emit ExtraSpinPurchased(msg.sender, spinOwner, count);
    }

    /**
     * @dev Grant specified amount (`count`) of extra spins for `spinOwner`.
     * Can only be called by the contract owner.
     * Emits an {ExtraSpinGranted} event.
     * Requirements:
     * - `spinOwner` cannot be the zero address
     * - `count` must be greater than 0
     */
    function grantExtraSpin(address spinOwner, uint256 count) public onlyOwner {
        require(spinOwner != address(0), "SpinMachine: spinOwner is the zero address");
        require(count > 0, "SpinMachine: spins count must be greater than 0");
        extraSpins[spinOwner] = extraSpins[spinOwner].add(count);
        emit ExtraSpinGranted(msg.sender, spinOwner, count);
    }

    /**
     * @dev Executes spin. Makes faucet request internally.
     * Can only be called when contract is not paused.
     * Can only be called if caller not blacklisted.
     * Emits an {Spin} event.
     */
    function spin() override external whenNotPaused notBlacklisted(msg.sender) returns (bool success, uint256 winnings) {
        _faucetRequest(msg.sender);
        (success, winnings) = _freeSpin(msg.sender);
        if(!success) (success, winnings) = _extraSpin(msg.sender);
    }

    /**
     * @dev Sets prizes distribution array.
     * Can only be called by the contract owner.
     * Emits an {PrizesDistributionChanged} event.
     * Requirements:
     * - `prizes` array cannot be empty
     */
    function setPrizes(uint256[] memory prizes) public onlyOwner {
        require(prizes.length != 0, "SpinMachineV1: prizes array cannot be empty");
        _prizes = prizes;
        emit PrizesDistributionChanged(prizes);
    }

    /**
     * @dev Returns prizes distribution array.
     */
    function getPrizes() public view returns(uint256[] memory) {
        return _prizes;
    }

    /**
     * @dev Returns true if `account` can successfully execute a spin.
     */
    function canSpin(address account) override external view returns (bool) {
        return _hasFreeSpin(account) || _hasExtraSpin(account);
    }

    function _extraSpin(address account) private returns (bool success, uint256 winnings) {
        if(_hasExtraSpin(account)) {
            extraSpins[account] = extraSpins[account].sub(1);
            success = true;
            winnings = _winnings();
            uint256 sent = _send(account, winnings);
            emit Spin(account, winnings, sent, true);
        }
    }

    function _freeSpin(address account) private returns (bool success, uint256 winnings) {
        if(_hasFreeSpin(account)) {
            lastFreeSpin[account] = block.timestamp;
            success = true;
            winnings = _winnings();
            uint256 sent = _send(account, winnings);
            emit Spin(account, winnings, sent, false);
        }
    }

    function _send(address to, uint256 winnings) private returns(uint256) {
        uint256 balance = IERC20(token).balanceOf(address(this));
        uint256 send = Math.min(winnings, balance);
        if(send > 0) {
            IERC20(token).safeTransfer(to, send);
        }
        return send;
    }

    function _hasExtraSpin(address account) private view returns(bool) {
        return extraSpins[account] > 0;
    }

    function _hasFreeSpin(address account) private view returns(bool) {
        return lastFreeSpin[account].add(freeSpinDelay) <= block.timestamp;
    }

    function _randomIndex() private view returns(uint256) {
         return _getRandomness() % _prizes.length;
    }

    function _winnings() private view returns(uint256) {
        return _prizes[_randomIndex()];
    }
}