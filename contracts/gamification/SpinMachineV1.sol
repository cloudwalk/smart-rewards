// SPDX-License-Identifier: MIT

pragma solidity ^0.6.12;

import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/math/MathUpgradeable.sol";
import "../utils/Blacklistable.sol";
import "../utils/FaucetCaller.sol";
import "../utils/Rescuable.sol";
import "./ISpinMachine.sol";

contract SpinMachineV1 is Initializable, Blacklistable, Rescuable, PausableUpgradeable, FaucetCaller, ISpinMachine {
    using SafeERC20Upgradeable for IERC20Upgradeable;
    using SafeMathUpgradeable for uint256;

    address constant public token = 0x6275c7A100A6d16035DEa9930E18890bE42185A7;
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

    function initialize() public initializer {
        __SpinMachineV1_init();
    }

    function __SpinMachineV1_init() internal initializer {
        __Context_init_unchained();
        __Ownable_init_unchained();
        __Pausable_init_unchained();
        __Rescuable_init_unchained();
        __FaucetCaller_init_unchained();
        __Blacklistable_init_unchained();
        __SpinMachineV1_init_unchained();
    }

    function __SpinMachineV1_init_unchained() internal initializer {
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
        IERC20Upgradeable(token).safeTransferFrom(msg.sender, address(this), extraSpinPrice.mul(count));
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
     * @dev Returns true if `addr` can successfully execute a spin.
     */
    function canSpinFor(address addr)  override external view returns (bool) {
        return _hasFreeSpin(addr) || _hasExtraSpin(addr);
    }

    /**
     * @dev Returns true if `msg.sender` can successfully execute a spin.
     */
    function canSpin() override external view returns (bool) {
        return _hasFreeSpin(msg.sender) || _hasExtraSpin(msg.sender);
    }

    function _extraSpin(address addr) private returns (bool success, uint256 winnings) {
        if(_hasExtraSpin(addr)) {
            extraSpins[addr] = extraSpins[addr].sub(1);
            success = true;
            winnings = _winnings();
            uint256 sent = _send(addr, winnings);
            emit Spin(addr, winnings, sent, true);
        }
    }

    function _freeSpin(address addr) private returns (bool success, uint256 winnings) {
        if(_hasFreeSpin(addr)) {
            lastFreeSpin[addr] = now;
            success = true;
            winnings = _winnings();
            uint256 sent = _send(addr, winnings);
            emit Spin(addr, winnings, sent, false);
        }
    }

    function _send(address to, uint256 winnings) private returns(uint256) {
        uint256 balance = IERC20Upgradeable(token).balanceOf(address(this));
        uint256 send = MathUpgradeable.min(winnings, balance);
        if(send > 0) {
            IERC20Upgradeable(token).safeTransfer(to, send);
        }
        return send;
    }

    function _hasExtraSpin(address addr) private view returns(bool) {
        return extraSpins[addr] > 0;
    }

    function _hasFreeSpin(address addr) private view returns(bool) {
        return lastFreeSpin[addr].add(freeSpinDelay) <= now;
    }

    function _randomIndex() private view returns(uint256) {
         return uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty, msg.sender))) % _prizes.length;
    }

    function _winnings() private view returns(uint256) {
        return _prizes[_randomIndex()];
    }
}