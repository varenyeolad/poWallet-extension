import React, { useEffect, useState, useCallback } from "react";
import {
  Divider,
  Tooltip,
  List,
  Avatar,
  Spin,
  Tabs,
  Input,
  Button,
  Typography,
  Modal,
} from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import logo from "../noImg.png";
import axios from "axios";
import { CHAINS_CONFIG } from "../chains";
import { ethers } from "ethers";

const { Text } = Typography;

function WalletView({
  wallet,
  setWallet,
  seedPhrase,
  setSeedPhrase,
  selectedChain,
}) {
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
      children: tokens ? (
        <List
          bordered
          itemLayout="horizontal"
          dataSource={tokens}
          renderItem={(item, index) => (
            <List.Item style={{ textAlign: "left" }}>
              <List.Item.Meta
                avatar={<Avatar src={item.logo || logo} />}
                title={item.symbol}
                description={item.name}
              />
              <div>
                {(
                  Number(item.balance) / 10 ** Number(item.decimals)
                ).toFixed(5)}{" "}
                Tokens
              </div>
            </List.Item>
          )}
        />
      ) : (
        <>
          <span>You seem to not have any tokens yet</span>
          <p className="frontPageBottom">
            Find Alt Coin Gems:{" "}
            <a
              href="https://moralismoney.com/"
              target="_blank"
              rel="noreferrer"
            >
              money.moralis.io
            </a>
          </p>
        </>
      ),
    },
    {
      key: "2",
      label: `NFTs`,
      children: nfts ? (
        <>
          {nfts.map((e, i) => e && <img key={i} className="nftImage" alt="nftImage" src={e} />)}
        </>
      ) : (
        <span>You seem to not have any NFTs yet</span>
      ),
    },
    {
      key: "1",
      label: `Transfer`,
      children: (
        <>
          <h3>Native Balance</h3>
          <h1>
            {balance.toFixed(4)} {CHAINS_CONFIG[selectedChain].ticker}
          </h1>
          <div className="sendRow">
            <p style={{ width: "90px", textAlign: "left" }}>To:</p>
            <Input
              value={sendToAddress}
              onChange={(e) => setSendToAddress(e.target.value)}
              placeholder="0x..."
            />
          </div>
          <div className="sendRow">
            <p style={{ width: "90px", textAlign: "left" }}>Amount:</p>
            <Input
              value={amountToSend}
              onChange={(e) => setAmountToSend(e.target.value)}
              placeholder="Native tokens you wish to send..."
            />
          </div>
          <Button
            style={{ width: "100%", marginTop: "20px", marginBottom: "20px" }}
            type="primary"
            onClick={() => checkAddressAndSendTransaction(sendToAddress, amountToSend)}
          >
            Send Tokens
          </Button>
          {processing && (
            <>
              <Spin />
              {hash && (
                <Tooltip title={hash}>
                  <a
                    href={`${CHAINS_CONFIG[selectedChain].blockExplorerUrl}/tx/${hash}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View transaction
                  </a>
                </Tooltip>
              )}
            </>
          )}
        </>
      ),
    },
  ];

  const transactionHistoryTab = {
    key: "4",
    label: "Transaction History",
    children: fetchingTransactions ? (
      <Spin />
    ) : (
      <List
        dataSource={transactions}
        renderItem={(transaction) => (
          <List.Item key={transaction.hash}>
            <div
              style={{
                width: "600px",
                margin: "0 auto",
                padding: "16px",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
              }}
            >
              <div style={{ marginBottom: "12px" }}>
                <Tooltip title={`Transaction Hash: ${transaction.hash}`}>
                  <Text strong>{`${transaction.hash.slice(0, 4)}...${transaction.hash.slice(-4)}`}</Text>
                </Tooltip>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gridGap: "8px",
                  marginBottom: "12px",
                }}
              >
                <div>
                  <Tooltip title={`Address: ${transaction.from}`}>
                    <Text>{`From: ${transaction.from.slice(0, 4)}...${transaction.from.slice(-4)}`}</Text>
                  </Tooltip>
                </div>
                <div>
                  <Tooltip title={`Address: ${transaction.to}`}>
                    <Text>{`To: ${transaction.to.slice(0, 4)}...${transaction.to.slice(-4)}`}</Text>
                  </Tooltip>
                </div>
              </div>
              <div>
                <Text>{`Amount: ${parseFloat(ethers.formatEther(transaction.value)).toFixed(4)} ETH`}</Text>
                <br></br>
                <Text type="secondary">{`Status: ${
                  transaction.receiptStatus === 1 ? "Confirmed" : "Failed"
                }`}</Text>
                <br></br>
                <Text type="secondary">{`Date: ${new Date(
                  transaction.blockTimestamp
                ).toLocaleString()}`}</Text>
                <br></br>
              </div>
              <div style={{ marginTop: "12px" }}>
                <a
                  href={`${CHAINS_CONFIG[selectedChain].blockExplorerUrl}/tx/${transaction.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Block Explorer
                </a>
              </div>
            </div>
          </List.Item>
        )}
      />
    ),
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
        <Tooltip title={wallet}>
          <div>
            {wallet.slice(0, 4)}...{wallet.slice(-4)}
          </div>
        </Tooltip>
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
}

export default WalletView;
