// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import '@openzeppelin/contracts/access/Ownable.sol';

//Storage of Ether and USDV used for exchanges
contract StorageETHUSDV is Ownable{

    address public swapperAddress;
    ERC20 public TokenInstance;

    constructor() {
        swapperAddress = 0x05145f6E9A0Dcf3A76070Fd3Be0e1fFb14ECA441;
        TokenInstance = ERC20(0xd5A862C4a356df8dC8085832A7881Eb5547c3026);
    }

    // Modifier that checks if address initator is "swapperAddress"
    modifier onlySwapper(address initiator){
        require(initiator == swapperAddress);
        _;
    }

    // Returns decimals of Token
    function decimals() external view returns(uint){
        return TokenInstance.decimals();
    }

    // Returns address of Token contract
    function tokenAddress() external view returns(address){
        return address(TokenInstance);
    }

    // Checks if "_amount" of Token is approved by the "_from" 
    function checkApprovalToStorage(address _from, uint _amount) public view returns(bool){
        return(TokenInstance.allowance(_from, address(this)) >= _amount);
    }

    // Internal function for transfering Token
    function transferToken(address _to, uint _amount) internal{
        TokenInstance.transfer(_to, _amount);
    }

    // Function for owner only to withdraw all balance of ether and Token to "withdrawTo"
    function withdrawAll() external onlyOwner{
        payable(msg.sender).transfer(address(this).balance);
        uint tokenAmount = tokenStorageBalance();
        transferToken(msg.sender, tokenAmount);
    }

    // Returns storage balance of Token
    function tokenStorageBalance() public view returns(uint){
        return(TokenInstance.balanceOf(address(this)));
    }
    
    // Returns storage balance of ether
    function ethStorageBalance() public view returns(uint){
        return(address(this).balance);
    }

    /**
     * Exchanger that send ether to initiator in case msg.value==0
     * and send Token to initiator else
     * for more info please check contract "exchange" at "swapperAddress"
     */
    function exchange(address _initiator, uint256 _tokenAmountToGet, uint256 _amountToReturn) payable external onlySwapper(msg.sender){
        if (msg.value > 0){
            transferToken(_initiator, _amountToReturn);
        }
        else {
            TokenInstance.transferFrom(_initiator, address(this), _tokenAmountToGet);
            payable(_initiator).transfer(_amountToReturn);
        }
    }

    receive() external payable{}
    } 