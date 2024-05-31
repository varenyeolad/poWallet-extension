import React from "react";
import { List, Typography } from "antd";
import { ethers } from "ethers";
import { CHAINS_CONFIG } from "../utils/chains";

const { Text } = Typography;

const TransactionHistory = ({ transactions, selectedChain }) => (
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
            <Text strong>{`${transaction.hash.slice(0, 4)}...${transaction.hash.slice(-4)}`}</Text>
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
              <Text>{`From: ${transaction.from.slice(0, 4)}...${transaction.from.slice(-4)}`}</Text>
            </div>
            <div>
              <Text>{`To: ${transaction.to.slice(0, 4)}...${transaction.to.slice(-4)}`}</Text>
            </div>
          </div>
          <div>
            <Text>{`Amount: ${parseFloat(ethers.formatEther(transaction.value)).toFixed(4)} ETH`}</Text>
            <br />
            <Text type="secondary">{`Status: ${
              transaction.receiptStatus === 1 ? "Confirmed" : "Failed"
            }`}</Text>
            <br />
            <Text type="secondary">{`Date: ${new Date(
              transaction.blockTimestamp
            ).toLocaleString()}`}</Text>
            <br />
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
);

export default TransactionHistory;
