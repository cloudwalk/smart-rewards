// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Mock is ERC20 {

    uint8 private immutable _decimals;

    constructor(string memory name, string memory symbol, uint8 __decimals) public ERC20(name, symbol) {
        _decimals = __decimals;
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    function mintTo(address account, uint256 amount) public {
        _mint(account, amount);
    }

    function mint(uint256 amount) public {
        _mint(msg.sender, amount);
    }
}
