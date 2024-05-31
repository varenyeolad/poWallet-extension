import React from "react";
import logo from "../assets/moralisLogo.svg";
import { Select } from "antd";
import { Routes, Route, Navigate } from "react-router-dom";
import WalletView from "./WalletView";
function AuthenticatedApp({ wallet, seedPhrase, selectedChain, setSeedPhrase, setWallet, setSelectedChain }) {
  return (
    <>
      <header>
        <img src={logo} className="headerLogo" alt="logo" />
        <Select
          onChange={(val) => setSelectedChain(val)}
          value={selectedChain}
          options={[
            { label: "Ethereum", value: "0x1" },
            { label: "Polygon", value: "0x89" },
            { label: "Polygon Amoy", value: "0x13882" },
            { label: "BNB Smart Chain", value: "0x38" },
            { label: "BNB Smart Chain Testnet", value: "0x61" },
          ]}
          className="dropdown"
        />
      </header>
      <Routes>
        <Route path="/yourwallet" element={<WalletView wallet={wallet} setWallet={setWallet} seedPhrase={seedPhrase} setSeedPhrase={setSeedPhrase} selectedChain={selectedChain} />} />
        <Route path="/" element={<Navigate to="/yourwallet" />} />
      </Routes>
    </>
  );
}

export default AuthenticatedApp;
