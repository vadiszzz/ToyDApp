import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import contractSwapper from '../contracts/SwapperEth.json';
import abiErc20 from '../contracts/erc20.abi.json';
  
const contractAddressSwapper = '0x05145f6E9A0Dcf3A76070Fd3Be0e1fFb14ECA441';
const abiSwapper = contractSwapper.abi;

function SwapButton(props) {
    const [balance, setBalance] = useState(0);
    const swapEthButton = () => {
        return (
          <button onClick={swapEthHandler} className='cta-button make-swap-button'>
            Swap ETH!
          </button>
        )
      }
    
    const swapTokenButton = () => {
        return (
          <button onClick={swapTokenHandler} className='cta-button make-swap-button'>
            Swap to ETH!
          </button>
        )
    }

    const approveButton = () => {
        return (
          <button onClick={approveHandler} className='cta-button approve-button'>
            approve token
          </button>
        )
    }  

    const approveHandler = async () => {
      try{
        const {ethereum} = window;
  
        if (ethereum) {
          const web3 = new Web3(window.ethereum);
          await window.ethereum.enable();
          const accounts = await ethereum.request({method: 'eth_requestAccounts'});

          const swapperContract = new web3.eth.Contract(abiSwapper, contractAddressSwapper);

          const tokenInfo = await swapperContract.methods.tokenNameToInfo(props.data.tokenName).call();

          const tokenContract = new web3.eth.Contract(abiErc20, tokenInfo[2]);

          return await tokenContract.methods.approve(tokenInfo[0], props.data.value).send({from: accounts[0]});
        }
      }
      catch(err){
        console.log(err);
      }
    }

    const swapEthHandler = async () => {
      try{
        const {ethereum} = window;
  
        if (ethereum) {
          const web3 = new Web3(window.ethereum);
          await window.ethereum.enable();
          const accounts = await ethereum.request({method: 'eth_requestAccounts'});

          const swapperContract = new web3.eth.Contract(abiSwapper, contractAddressSwapper);

          await swapperContract.methods.exchange(props.data.tokenName, 0).send({from: accounts[0], value: props.data.value});
        }
      }
      catch(err){
        console.log(err);
      }
    }

    const swapTokenHandler = async () => {
      try{
        const {ethereum} = window;
  
        if (ethereum) {
          const web3 = new Web3(window.ethereum);
          await window.ethereum.enable();
          const accounts = await ethereum.request({method: 'eth_requestAccounts'});

          const swapperContract = new web3.eth.Contract(abiSwapper, contractAddressSwapper);
          
          await swapperContract.methods.exchange(props.data.tokenName, props.data.value).send({from: accounts[0]});
          
        }
      }
      catch(err){
        console.log(err);
      }
    }

    const refreshTokenBalance = async () => {
      try{
        const {ethereum} = window;
  
        if (ethereum) {
          const web3 = new Web3(window.ethereum);
          await window.ethereum.enable();
          const accounts = await ethereum.request({method: 'eth_requestAccounts'});

          const swapperContract = new web3.eth.Contract(abiSwapper, contractAddressSwapper);

          const tokenInfo = await swapperContract.methods.tokenNameToInfo(props.data.tokenName).call();

          const tokenContract = new web3.eth.Contract(abiErc20, tokenInfo[2]);
          setBalance(await tokenContract.methods.balanceOf(accounts[0]).call() / 10**(await tokenContract.methods.decimals().call()));
        }
      }
      catch(err){
        console.log(err);
      }
    }

    const refreshEthBalance = async () => {
      try{
        const {ethereum} = window;
  
        if (ethereum) {
          const web3 = new Web3(window.ethereum);
          await window.ethereum.enable();
          const accounts = await ethereum.request({method: 'eth_requestAccounts'});

          setBalance(web3.utils.fromWei(await web3.eth.getBalance(accounts[0]), 'ether'));
        }
      }
      catch(err){
        console.log(err);
      }
    }
  
    
    if (props.data.sellingToken){
      refreshTokenBalance();
      if (props.data.approved){
        if (props.data.possible && balance >= props.data.value.toString()/10**18){
          return(
            <div className='button-swap'>
              Your balance: {balance} {props.data.tokenName}
              <br></br>
              {swapTokenButton()}
            </div>
          )
        }
        return(
        <div className='text-nonpossible'>
          Your balance: {balance} {props.data.tokenName}
              <br></br>
            Exchange is not possible!
        </div>
        )
      }
      return(
        <div className='button-approve'>
          Your balance: {balance} {props.data.tokenName}
              <br></br>
            {approveButton()}
        </div>
    )
    }
    refreshEthBalance();
    if (props.data.possible && balance >= props.data.value.toString()/10**18){
      return(
        <div className='button-swap'>
          Your balance: {balance} ETH
              <br></br>
          {swapEthButton()}
        </div>
      )
    }
    else{
    return(
      <div className='text-nonpossible'>
        Your balance: {balance} ETH
              <br></br>
          Exchange is not possible!
      </div>
    )
    }
}

export default SwapButton;