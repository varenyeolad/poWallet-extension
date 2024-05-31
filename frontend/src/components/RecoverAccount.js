import React from "react";
import { BulbOutlined } from "@ant-design/icons";
import { Button, Input, Modal, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ethers } from "ethers";
import axios from "axios";


const { TextArea } = Input;
const { Title, Paragraph } = Typography;

function RecoverAccount({ setWallet, setSeedPhrase }) {
  const navigate = useNavigate();
  const [typedSeed, setTypedSeed] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nonValid, setNonValid] = useState(false);

  function seedAdjust(e) {
    setNonValid(false);
    setTypedSeed(e.target.value);
  }

  function handlePasswordChange(e) {
    setPassword(e.target.value);
  }

  function handleConfirmPasswordChange(e) {
    setConfirmPassword(e.target.value);
  }

  async function recoverWallet() {
    if (password !== confirmPassword) {
      Modal.error({
        title: "Password Mismatch",
        content: "The passwords you entered do not match. Please try again.",
      });
      return;
    }

    let recoveredWallet;
    try {
      recoveredWallet = ethers.Wallet.fromPhrase(typedSeed).address;
    } catch (err) {
      setNonValid(true);
      return;
    }

    try {
      const response = await axios.post("http://localhost:3001/recover", {
        mnemonic: typedSeed,
        password: password,
      });

      if (response.data.success) {
        setSeedPhrase(typedSeed);
        setWallet(recoveredWallet);
        navigate("/yourwallet");
      } else {
        Modal.error({
          title: "Recovery Error",
          content: response.data.error || "Failed to recover account. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error recovering account:", error);
      Modal.error({
        title: "Recovery Error",
        content: "An error occurred while recovering the account. Please try again.",
      });
    }
  }

  return (
    <div className="content">
      <Title level={2} className="recover-title">Recover Your Wallet</Title>
      <Paragraph className="recover-description">
        <BulbOutlined style={{ fontSize: "20px", marginRight: "8px" }} />
        Type your seed phrase below to recover your wallet (it should include 12 words separated by spaces).
      </Paragraph>
      <TextArea
        value={typedSeed}
        onChange={seedAdjust}
        rows={4}
        className="seedPhraseContainer"
        placeholder="Type your seed phrase here..."
      />
      <Input.Password
        value={password}
        onChange={handlePasswordChange}
        placeholder="Enter new password"
        className="passwordInput"
      />
      <Input.Password
        value={confirmPassword}
        onChange={handleConfirmPasswordChange}
        placeholder="Confirm new password"
        className="passwordInput"
      />
      <Button
        disabled={
          typedSeed.split(" ").length !== 12 || typedSeed.slice(-1) === " "
        }
        className="frontPageButton"
        type="primary"
        onClick={recoverWallet}
      >
        Recover Wallet
      </Button>
      {nonValid && <p className="error-message">Invalid Seed Phrase</p>}
      <p className="frontPageBottom" onClick={() => navigate("/")}>
        <span>Back Home</span>
      </p>
    </div>
  );
}

export default RecoverAccount;
