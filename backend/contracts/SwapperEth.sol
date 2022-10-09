// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import '@openzeppelin/contracts/access/Ownable.sol';


// interface of tokenStorage contract to make exchanges
interface tokenStorage{
    function tokenStorageBalance() external view returns(uint);
    function ethStorageBalance() external view returns(uint);
    function exchange(address _to, uint256 _tokenAmountToGet, uint256 _amountToReturn) payable external;
    function decimals() external view returns(uint);
    function tokenAddress() external view returns(address);
    function checkApprovalToStorage(address _from, uint _amount) external view returns(bool);
}


contract SwapperEth is Ownable {
    event EtherSale(address indexed _from, string _forToken, uint _ethAmount, uint _tokenAmount);
    event TokenSale(address indexed _from, string _forToken, uint _ethAmount, uint _tokenAmount);
    event TokenAdding(string _tokenName);

    // Stores storage instance and chainlink price feed instance for ETH/erc20_token pair
    struct tokenInfo{
        tokenStorage storageInstance;
        AggregatorV3Interface priceFeedInstance;
        address tokenAddress;
    }
    
    // mapping between "tokenName" and token info
    mapping(string => tokenInfo) public tokenNameToInfo;
    
    constructor() {
    }

    /**
     * Adds token to list of tokens. Also allows to edit existing token
     */
    function addToken(string memory _tokenName, address _storageAddress, address _priceFeedAddress) public onlyOwner{
        tokenNameToInfo[_tokenName].storageInstance = tokenStorage(_storageAddress);
        tokenNameToInfo[_tokenName].priceFeedInstance = AggregatorV3Interface(_priceFeedAddress);
        tokenNameToInfo[_tokenName].tokenAddress = tokenNameToInfo[_tokenName].storageInstance.tokenAddress();
        emit TokenAdding(_tokenName);
    }

    /**
     * Returns token decimals by name
     */
    function tokenDecimals(string memory _tokenName) public view returns(uint){
        return(tokenNameToInfo[_tokenName].storageInstance.decimals());
    }

    /**
     * Checks if "_amount" of ERC20 token "_tokenName" is approved for storage to make exchanges
     */
    function isApproved(address _from, uint _amount, string memory _tokenName) public view returns(bool){
        return(tokenNameToInfo[_tokenName].storageInstance.checkApprovalToStorage(_from, _amount));
    }

    /**
     * Returns the latest price
     */
    function getLatestPrice(string memory _tokenName) public view returns (int) {
        (
            /*uint80 roundID*/,
            int price,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = tokenNameToInfo[_tokenName].priceFeedInstance.latestRoundData();
        return price;
    }

    /**
     * Checks if exchange possible. If user want to swap Token -> Ether, "_tokenAmount" is amount of token to swap, "_ethAmount" = 0
     * Otherwise "_tokenAmount" = 0, "_ethAmount" is amount of ether to swap
     */
    function isExchangePossible(string memory _tokenName, uint _tokenAmount, uint _ethAmount, address _initiator) external view returns(bool){
        tokenStorage storageInstance_ = tokenNameToInfo[_tokenName].storageInstance;

        uint decimals = tokenDecimals(_tokenName);
        uint256 factor = 10**(26-decimals);

        if (_ethAmount > 0){
            uint amountToReturn = _ethAmount * uint(getLatestPrice(_tokenName)) / factor;
            return !((amountToReturn > storageInstance_.tokenStorageBalance()) || (_ethAmount < 0.0001 ether));
        }
        else {
            uint amountToReturn = _tokenAmount * factor / uint(getLatestPrice(_tokenName));
            return !((amountToReturn > storageInstance_.ethStorageBalance()) || (amountToReturn < 0.0001 ether) || (! isApproved(_initiator, _tokenAmount, _tokenName)) );
        }
    }

    /**
     * Implements logic of exchange. "_tokenAmount" is the amount of token that initiator wants to exchange 
     * "_tokenAmount" used only if the contract does not receive ether (this means that user wants to exchange "_tokenName" -> ETH)
     * If the contract receives ether, it means that the user wants to make an exchange ETH -> "tokenName"
     */
    function exchange(string memory _tokenName, uint _tokenAmount) external payable{
        tokenStorage storageInstance_ = tokenNameToInfo[_tokenName].storageInstance;
        
        uint256 _ethAmount = msg.value;
        address _initiator = msg.sender;

        uint decimals = tokenDecimals(_tokenName);
        uint256 factor = 10**(26-decimals);

        require(decimals < 27, "Decimals of token you want to exchange exceeds the allowed value (should be lower than 27)");

        if (_ethAmount > 0){    

            require(_ethAmount > 0.0001 ether,"Exchange amount is less than the minimum");

            uint amountToReturn = _ethAmount * uint(getLatestPrice(_tokenName)) / factor;
            require(amountToReturn < storageInstance_.tokenStorageBalance(), "Insufficient balance of storage to complete exchange");
            
            storageInstance_.exchange{value: _ethAmount}(_initiator, 0, amountToReturn);
            emit EtherSale(_initiator, _tokenName, _ethAmount, amountToReturn);
        }
        else{

            uint amountToReturn = _tokenAmount * factor / uint(getLatestPrice(_tokenName));

            require(amountToReturn > 0.0001 ether, "Exchange amount is less than the minimum");
            require(amountToReturn < storageInstance_.ethStorageBalance(), "Insufficient balance of storage to complete exchange");

            storageInstance_.exchange(_initiator, _tokenAmount, amountToReturn);
            emit TokenSale(_initiator, _tokenName, amountToReturn, _tokenAmount);
        }
    }
}
