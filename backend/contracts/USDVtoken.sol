// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import '@openzeppelin/contracts/access/Ownable.sol';

contract USDVtoken is Ownable, ERC20{
    constructor() ERC20("USDVadim","USDV") {
    }

    function freeMint(uint256 _amount, address _to) external onlyOwner{
        _mint(_to, _amount);
    }
}
