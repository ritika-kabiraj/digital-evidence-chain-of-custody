import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import api from '../services/api';

const Web3Context = createContext(null);

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [contractStatus, setContractStatus] = useState({
    connected: false,
    address: '',
    blockNumber: null
  });

  const checkBlockchainStatus = async () => {
    try {
      const res = await api.get('/blockchain/status');
      setContractStatus({
        connected: res.data.connected,
        address: res.data.contract_address || '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        blockNumber: res.data.current_block_number
      });
    } catch (err) {
      console.warn("Could not check blockchain status:", err);
    }
  };

  useEffect(() => {
    checkBlockchainStatus();
    const interval = setInterval(checkBlockchainStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          return accounts[0];
        }
      } catch (err) {
        console.error("Wallet connection failed:", err);
      }
    } else {
      // Fallback simulated local hardhat account
      const defaultAccount = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
      setAccount(defaultAccount);
      return defaultAccount;
    }
  };

  return (
    <Web3Context.Provider value={{ account, contractStatus, connectWallet, checkBlockchainStatus }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
