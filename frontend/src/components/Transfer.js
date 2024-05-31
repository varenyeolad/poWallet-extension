import React from "react";
import { Input, Button } from "antd";
import { CHAINS_CONFIG } from "../utils/chains";

const Transfer = ({
  balance,
  selectedChain,
  sendToAddress,
  amountToSend,
  onAddressChange,
  onAmountChange,
  onSendTokens,
}) => (
  <>
    <h3>Native Balance</h3>
    <h1>
      {balance.toFixed(4)} {CHAINS_CONFIG[selectedChain].ticker}
    </h1>
    <div className="sendRow">
      <p style={{ width: "90px", textAlign: "left" }}>To:</p>
      <Input
        value={sendToAddress}
        onChange={onAddressChange}
        placeholder="0x..."
      />
    </div>
    <div className="sendRow">
      <p style={{ width: "90px", textAlign: "left" }}>Amount:</p>
      <Input
        value={amountToSend}
        onChange={onAmountChange}
        placeholder="Native tokens you wish to send..."
      />
    </div>
    <Button
      style={{ width: "100%", marginTop: "20px", marginBottom: "20px" }}
      type="primary"
      onClick={onSendTokens}
    >
      Send Tokens
    </Button>
  </>
);

export default Transfer;
