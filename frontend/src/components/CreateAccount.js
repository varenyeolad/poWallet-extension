import React, { useState, useEffect } from "react";
import { Button, Card, Typography, Space, Form, Input, Modal } from "antd";
import { ExclamationCircleOutlined, CopyOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import axios from "axios";


const { Text } = Typography;

function CreateAccount() {
  const [newSeedPhrase, setNewSeedPhrase] = useState(null);
  const [seedPhraseGenerated, setSeedPhraseGenerated] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const mnemonic = ethers.Wallet.createRandom().mnemonic.phrase;
    setNewSeedPhrase(mnemonic);
    setSeedPhraseGenerated(true);
  }, []);

  function handleNext() {
    navigate("/confirm-seed-phrase", { state: { seedPhrase: newSeedPhrase } });
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
  }

async function handlePasswordSubmit() {
  if (password === confirmPassword) {
    try {
      const response = await axios.post("http://localhost:3001/register", {
        password,
        mnemonic: newSeedPhrase,
      });

      console.log("Server response:", response.data);

      // Check if the response contains the encrypted mnemonic
      if (response.data.encryptedMnemonic) {
        // Store encrypted mnemonic in local storage
        localStorage.setItem("encryptedMnemonic", response.data.encryptedMnemonic);
        console.log("Encrypted mnemonic stored in local storage.");

        // Clear local storage after successful registration
  
        console.log("Local storage cleared.");
      } else {
        // Handle error if encrypted mnemonic is not returned
        console.error("Encrypted mnemonic not received from server");
        Modal.error({
          title: "Registration Error",
          content: "An error occurred while registering. Please try again.",
        });
        return;
      }

      console.log(response.data); // Handle success response
      setStep(2);
    } catch (error) {
      console.error("Error registering user:", error);
      Modal.error({
        title: "Registration Error",
        content: "An error occurred while registering. Please try again.",
      });
    }
  } else {
    Modal.error({
      title: "Password mismatch",
      content: "The passwords you entered do not match. Please try again.",
    });
  }
}


  return (
    <>
      {step === 1 && (
        <div className="content">
          <Form onFinish={handlePasswordSubmit}>
            <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please input your password!' }]}>
              <Input.Password value={password} onChange={(e) => setPassword(e.target.value)} />
            </Form.Item>
            <Form.Item label="Confirm Password" name="confirmPassword" rules={[{ required: true, message: 'Please confirm your password!' }]}>
              <Input.Password value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </Form.Item>
            <Button type="primary" htmlType="submit">
              Set Password
            </Button>
          </Form>
        </div>
      )}
      {step === 2 && (
        <div className="content">
          <Card title="Seed Phrase" bordered={false} style={{ width: 400, margin: "auto" }}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <Text>
                <ExclamationCircleOutlined style={{ marginRight: 8 }} />
                Save the seed phrase securely to recover your wallet in the future.
              </Text>
              {newSeedPhrase && (
                <>
                  <Card bordered={true} className="seedPhraseContainer">
                    <pre style={{ whiteSpace: "pre-wrap" }}>{newSeedPhrase}</pre>
                  </Card>
                  <Button
                    icon={<CopyOutlined />}
                    onClick={() => copyToClipboard(newSeedPhrase)}
                    block
                  >
                    Copy Seed Phrase
                  </Button>
                  {seedPhraseGenerated && (
                    <Button type="primary" onClick={handleNext} block>
                      Next
                    </Button>
                  )}
                  <Button onClick={() => navigate(-1)} block>
                    Go Back
                  </Button>
                </>
              )}
            </Space>
          </Card>
        </div>
      )}
    </>
  );
}

export default CreateAccount;
