// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Mock is ERC20 {
    constructor(string memory name_, string memory symbol_, uint8 decimals_) public ERC20(name_, symbol_) {
        _setupDecimals(decimals_);
    }

    function mintTo(address account, uint256 amount) public {
        _mint(account, amount);
    }

    function mint(uint256 amount) public {
        _mint(msg.sender, amount);
    }
}
