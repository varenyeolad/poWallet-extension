import React, { useEffect, useState, useCallback } from "react";
import { Divider, Tooltip, Spin, Tabs, Modal, Button } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CHAINS_CONFIG } from "../utils/chains";
import TokenList from "./TokenList";
import NFTList from "./NftList";
import Transfer from "./Transfer";
import TransactionHistory from "./TransactionHistory";
import { ethers } from "ethers";


const WalletView = ({
  wallet,
  setWallet,
  seedPhrase,
  setSeedPhrase,
  selectedChain,
}) => {
  const navigate = useNavigate();
  const [tokens, setTokens] = useState(null);
  const [nfts, setNfts] = useState(null);
  const [balance, setBalance] = useState(0);
  const [fetching, setFetching] = useState(true);
  const [amountToSend, setAmountToSend] = useState(null);
  const [sendToAddress, setSendToAddress] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [hash, setHash] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [fetchingTransactions, setFetchingTransactions] = useState(true);
  const [blacklistedMessage, setBlacklistedMessage] = useState(null);
  const [confirmedBlacklisted, setConfirmedBlacklisted] = useState(false);

  const items = [
    {
      key: "3",
      label: `Tokens`,
      children: tokens ? <TokenList tokens={tokens} /> : (
        <>
          <span>You seem to not have any tokens yet</span>
        </>
      ),
    },
    {
      key: "2",
      label: `NFTs`,
      children: nfts ? <NFTList nfts={nfts} /> : <span>You seem to not have any NFTs yet</span>,
    },
    {
      key: "1",
      label: `Transfer`,
      children: (
        <Transfer
          balance={balance}
          selectedChain={selectedChain}
          sendToAddress={sendToAddress}
          amountToSend={amountToSend}
          onAddressChange={(e) => setSendToAddress(e.target.value)}
          onAmountChange={(e) => setAmountToSend(e.target.value)}
          onSendTokens={() => checkAddressAndSendTransaction(sendToAddress, amountToSend)}
        />
      ),
    },
  ];

  const transactionHistoryTab = {
    key: "4",
    label: "Transaction History",
    children: fetchingTransactions ? <Spin /> : <TransactionHistory transactions={transactions} selectedChain={selectedChain} />,
  };

  const updatedItems = [...items, transactionHistoryTab];

  const getTransactionHistory = useCallback(async () => {
    setFetchingTransactions(true);
    try {
      const response = await axios.get(`http://localhost:3001/getWalletTransactions`, {
        params: {
          userAddress: wallet,
          chain: selectedChain,
        },
      });
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error("Error fetching transaction history:", error);
    }
    setFetchingTransactions(false);
  }, [wallet, selectedChain]);

  const checkAddressAndSendTransaction = async (to, amount) => {
    try {
      const response = await axios.post(`http://localhost:3001/checkAddress`, { address: to });
      const message = response.data.message;

      console.log(`Address check response: ${message}`);
      if (message.includes("blacklisted")) {
        if (!confirmedBlacklisted) {
          setBlacklistedMessage(message);
          return;
        }
      }

      sendTransaction(to, amount);
    } catch (error) {
      console.error("Error checking address:", error);
    }
  };

  const sendTransaction = async (to, amount) => {
    const chain = CHAINS_CONFIG[selectedChain];
    const provider = new ethers.JsonRpcProvider(chain.rpcUrl);
    const privateKey = ethers.Wallet.fromPhrase(seedPhrase).privateKey;
    const walletInstance = new ethers.Wallet(privateKey, provider);

    const tx = {
      to: to,
      value: ethers.parseEther(amount.toString()),
    };

    setProcessing(true);
    try {
      const transaction = await walletInstance.sendTransaction(tx);

      setHash(transaction.hash);
      await transaction.wait();

      setProcessing(false);
      setAmountToSend(null);
      setSendToAddress(null);
      setConfirmedBlacklisted(false); // Reset confirmation state after sending
    } catch (err) {
      console.error("Error sending transaction:", err);
      setHash(null);
      setProcessing(false);
      setAmountToSend(null);
      setSendToAddress(null);
      setConfirmedBlacklisted(false); // Reset confirmation state on error
    }
  };

  const getAccountTokens = useCallback(async () => {
    setFetching(true);

    const res = await axios.get(`http://localhost:3001/getTokens`, {
      params: {
        userAddress: wallet,
        chain: selectedChain,
      },
    });

    const response = res.data;

    if (response.tokens.length > 0) {
      setTokens(response.tokens);
    }

    if (response.nfts.length > 0) {
      setNfts(response.nfts);
    }

    setBalance(response.balance);
    setFetching(false);
  }, [wallet, selectedChain]);

  const logout = () => {
    setSeedPhrase(null);
    setWallet(null);
    setNfts(null);
    setTokens(null);
    setBalance(0);
    navigate("/");
  
      localStorage.removeItem("encryptedMnemonic");
      setWallet(null);
      setSeedPhrase(null);
      navigate("/");
  
  };

  useEffect(() => {
    if (!wallet || !selectedChain) return;
    setNfts(null);
    setTokens(null);
    setBalance(0);
    getAccountTokens();
  }, [wallet, selectedChain, getAccountTokens]);

  useEffect(() => {
    if (wallet && selectedChain) {
      getTransactionHistory();
    }
  }, [wallet, selectedChain, getTransactionHistory]);

  return (
    <>
      <div className="content">
        <div className="logoutButton" onClick={logout}>
          <LogoutOutlined />
        </div>
        <div className="walletName">Wallet</div>
        {wallet ? (
          <Tooltip title={wallet}>
            <div>
              {wallet.slice(0, 4)}...{wallet.slice(-4)}
            </div>
          </Tooltip>
        ) : (
          <div>Loading...</div>
        )}
        <Divider />
        {blacklistedMessage && (
          <Modal
            title="Address Blacklisted"
            visible={true}
            onCancel={() => setBlacklistedMessage(null)}
            footer={[
              <Button
                key="ok"
                onClick={() => {
                  setConfirmedBlacklisted(true);
                  setBlacklistedMessage(null);
                  sendTransaction(sendToAddress, amountToSend); // Continue with the transaction
                }}
              >
                OK
              </Button>,
            ]}
          >
            <p>{blacklistedMessage}</p>
          </Modal>
        )}
        {fetching ? (
          <Spin />
        ) : (
          <Tabs defaultActiveKey="1" items={updatedItems} className="walletView" />
        )}
      </div>
    </>
  );
};

export default WalletView;
