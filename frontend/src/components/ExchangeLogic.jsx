import React, {useState} from 'react';
import Web3 from 'web3';
import SwapButton from './SwapButton';
import contractSwapper from '../contracts/SwapperEth.json';

const contractAddressSwapper = '0x05145f6E9A0Dcf3A76070Fd3Be0e1fFb14ECA441';
const abiSwapper = contractSwapper.abi;

var BN = Web3.utils.BN;

function ExchangeLogic(props) {
  const [possible, setPossible] = useState(true);
  const [approved, setApproved] = useState(true);
  const decimals = 18; //TODO: change to swapperContract.tokenDecimals()

  const factor = 10**(decimals-8).toLocaleString('fullwide', {useGrouping:false});
  const trueValue = new BN(props.data.value*(10**8)).mul(new BN(factor)).toString();
  
    const isExchangePossible = async() =>{
      try{
        const {ethereum} = window;
  
        if (ethereum) {
          const web3 = new Web3(window.ethereum);
          await window.ethereum.enable();
          const accounts = await ethereum.request({method: 'eth_requestAccounts'});
          
          const swapperContract = new web3.eth.Contract(abiSwapper, contractAddressSwapper);
          let isPossible;

          if (props.data.sellingToken){
            isPossible = await swapperContract.methods.isExchangePossible(props.data.tokenName, trueValue, 0, accounts[0]).call();
            setPossible(isPossible);
          }
          else{
            isPossible = await swapperContract.methods.isExchangePossible(props.data.tokenName, 0, trueValue, accounts[0]).call();
            setPossible(isPossible);
          }
          return isPossible;
        }
      }
      catch(err){
        console.log(err);
      }
    }
    
    const isApproved = async() =>{
    try{
      const {ethereum} = window;
  
        if (ethereum) {
          const web3 = new Web3(window.ethereum);
          await window.ethereum.enable();
          const accounts = await ethereum.request({method: 'eth_requestAccounts'});

          const swapperContract = new web3.eth.Contract(abiSwapper, contractAddressSwapper);
          let isApproved = await swapperContract.methods.isApproved(accounts[0], trueValue, 'USDV').call();
          setApproved(isApproved);
          return isApproved;
        }
      }
      catch(err){
        console.log(err);
      }
    }

    const calculateReturn = () => {
        if (props.data.sellingToken) {
          return <h1> You will get {10**(26-decimals) * props.data.value / props.data.price} ETH </h1>
        }
        return <h1> You will get {props.data.value * props.data.price / 10**(26-decimals)} {props.data.tokenName} </h1>
    }

    isApproved();
    isExchangePossible();
    return(
      <div>
        {calculateReturn()}
        <SwapButton data = {{sellingToken: props.data.sellingToken, approved: approved, possible: possible, tokenName: props.data.tokenName, value: trueValue}}/>
      </div>
    )
}

export default ExchangeLogic;