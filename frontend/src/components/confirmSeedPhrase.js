 import React, { useState, useEffect } from "react";
import { Button, Card, Input, Form, Typography, Space, Row, Col, Modal } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { ethers } from "ethers";
import axios from "axios";
const { Text } = Typography;

function ConfirmSeedPhrase({ setWallet, setSeedPhrase }) {
  const location = useLocation();
  const { seedPhrase } = location.state || {};
  const [seedPhraseInputs, setSeedPhraseInputs] = useState(Array(12).fill(""));
  const navigate = useNavigate();

  useEffect(() => {
    const handlePaste = (event) => {
      const clipboardData = event.clipboardData || window.clipboardData;
      const pastedData = clipboardData.getData("Text");
      const seedWords = pastedData.trim().split(/\s+/);
      if (seedWords.length === 12) {
        setSeedPhraseInputs(seedWords);
        event.preventDefault();
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, []);

  if (!seedPhrase) {
    navigate("/");
    return null;
  }

  async function setWalletAndMnemonic() {
    try {
      const response = await axios.post("http://localhost:3001/register", {
        seedPhrase: seedPhraseInputs.join(" "), // Sending only the seed phrase
      });
      console.log(response.data); // Handle success response
      setSeedPhrase(seedPhrase);
      setWallet(ethers.Wallet.fromPhrase(seedPhrase).address);
      navigate("/yourwallet");
    } catch (error) {
      console.error("Error confirming seed phrase:", error);
      // Handle error
      Modal.error({
        title: "Seed phrase mismatch",
        content: "The seed phrase you entered does not match. Please try again.",
      });
    }
  }
  

  function handleSeedPhraseChange(index, value) {
    const newSeedPhraseInputs = [...seedPhraseInputs];
    newSeedPhraseInputs[index] = value;
    setSeedPhraseInputs(newSeedPhraseInputs);
  }

  return (
    <div className="content">
      <Card title="Confirm Seed Phrase" bordered={false} style={{ width: 400, margin: "auto" }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Text>
            <ExclamationCircleOutlined style={{ marginRight: 8 }} />
            Enter the seed phrase in the correct order to confirm.
          </Text>
          <Form>
            <Row gutter={[16, 16]}>
              {seedPhraseInputs.map((word, index) => (
                <Col span={8} key={index}>
                  <Form.Item>
                    <Input
                      value={word}
                      onChange={(e) => handleSeedPhraseChange(index, e.target.value)}
                      placeholder={`${index + 1}`}
                    />
                  </Form.Item>
                </Col>
              ))}
            </Row>
          </Form>
          <Button type="primary" onClick={setWalletAndMnemonic} block>
            Confirm Seed Phrase
          </Button>
          <Button onClick={() => navigate(-1)} block>
            Go Back
          </Button>
        </Space>
      </Card>
    </div>
  );
}

export default ConfirmSeedPhrase;