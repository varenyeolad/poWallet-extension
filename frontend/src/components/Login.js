import React, { useState } from "react";
import { Button, Form, Input, Modal } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";
import { ethers } from "ethers";

function Login({ setWallet, setSeedPhrase, setIsLocked }) {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://localhost:3001/login", { password });

      if (response.data.encryptedMnemonic) {
        // Decrypt the encrypted mnemonic stored in local storage
        const encryptedMnemonic = localStorage.getItem("encryptedMnemonic");
        const decryptedMnemonic = CryptoJS.AES.decrypt(encryptedMnemonic, password).toString(CryptoJS.enc.Utf8);

        // Use mnemonic to set wallet and seed phrase
        const wallet = ethers.Wallet.fromPhrase(decryptedMnemonic).address;
        setWallet(wallet);
        setSeedPhrase(decryptedMnemonic);
        setIsLocked(false);
        navigate("/yourwallet");
      } else {
        console.error("Encrypted mnemonic not received from server");
        Modal.error({
          title: "Login Error",
          content: "An error occurred while logging in. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error logging in user:", error);
      Modal.error({
        title: "Login Error",
        content: "Invalid credentials. Please try again.",
      });
    }
  };

  return (
    <div className="content">
      <Form onFinish={handleLogin}>
        <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please input your password!' }]}>
          <Input.Password value={password} onChange={(e) => setPassword(e.target.value)} />
        </Form.Item>
        <Button type="primary" htmlType="submit">
          Login
        </Button>
      </Form>
    </div>
  );
}

export default Login;
