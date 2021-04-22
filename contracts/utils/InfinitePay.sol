// SPDX-License-Identifier: MIT

pragma solidity ^0.6.12;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

contract InfinitePay {
    using SafeERC20 for IERC20;

    address constant public token = 0x6275c7A100A6d16035DEa9930E18890bE42185A7;

    event Transfer(address indexed from, address indexed to, uint256 amount, string guid);

    function transfer(address to, uint256 amount, string memory guid) public {
        IERC20(token).safeTransferFrom(msg.sender, to, amount);
        emit Transfer(msg.sender, to, amount, guid);
    }
}