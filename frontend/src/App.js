import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import Exchanger from './components/Exchanger';
import contractSwapper from './contracts/SwapperEth.json';

const contractAddressSwapper = '0x05145f6E9A0Dcf3A76070Fd3Be0e1fFb14ECA441';
const abiSwapper = contractSwapper.abi;

function App() {  
  const [currentAccount, setCurrentAccount] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(0);

  const checkWalletIsConnected = async () => {
    const {ethereum} = window;
    if (!ethereum){
      console.log("Make sure you have Metamask installed!");
      return;
    }
    else {
      console.log("Wallet exists! We're ready to go!");
    }

    const accounts = await ethereum.request({method: 'eth_requestAccounts'});

    if (accounts.length !== 0){
      const account = accounts[0];
      console.log("Found an account: ", account);
      setCurrentAccount(account);
    }
    else {
      console.log("Account not found");
    }
   }

  const connectWalletHandler = async () => {
    const {ethereum} = window;
    if (!ethereum){
      alert("Please install Metamask!")
    }
    try {
      const accounts = await ethereum.request({method: 'eth_requestAccounts'});
      console.log("Found an account: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    }
    catch (err) {
      console.log(err)
    }
   }
    

  const refreshPriceHandler = async (tokenName) => {
    try{
      const {ethereum} = window;

      if (ethereum) {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.enable();

        
        const swapperContract = new web3.eth.Contract(abiSwapper , contractAddressSwapper);
        const priceToShow = await swapperContract.methods.getLatestPrice(tokenName).call();
        console.log(priceToShow);
        setCurrentPrice(priceToShow);
      }
    }
    catch(err){
      console.log(err);
    }
   }

  const connectWalletButton = () => {
    return (
      <button onClick={connectWalletHandler} className='cta-button connect-wallet-button'>
        Connect Wallet
      </button>
    )
  }

  const refreshPriceButton = (tokenName) => {
    return (
      <button onClick={() => refreshPriceHandler(tokenName)} className='cta-button refresh-price-button'>
        refresh ETH price
      </button>
    )
  }

  useEffect(() => {
    checkWalletIsConnected();
    refreshPriceHandler('USDV');
  }, [])

  return (
    <div className='main-app'>
      <h1>Swapping ETH/USDV</h1>
      <div>
        {currentAccount ? refreshPriceButton('USDV') : connectWalletButton()}
        {currentAccount ? <Exchanger data ={{id: 1, buy: 'ETH', sell: 'USDV', price: currentPrice, tokenName: 'USDV'}} /> : connectWalletButton()}
        {currentAccount ? <Exchanger data ={{id: 2, buy: 'USDV', sell: 'ETH', price: currentPrice, tokenName: 'USDV'}} /> : connectWalletButton()}
      </div>
    </div>
  )
}

export default App;