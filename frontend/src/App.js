import "./App.css";
import { useState, useEffect } from "react";
import logo from "./assets/moralisLogo.svg";
import { Select } from "antd";
import { Routes, Route, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import CreateAccount from "./components/CreateAccount";
import RecoverAccount from "./components/RecoverAccount";
import WalletView from "./components/WalletView";
import ConfirmSeedPhrase from "./components/confirmSeedPhrase";
import Login from "./components/Login";
import useSessionTimeout from "./hooks/UseSessionTimeout";

function App() {
  const [wallet, setWallet] = useState(null);
  const [seedPhrase, setSeedPhrase] = useState(null);
  const [selectedChain, setSelectedChain] = useState("0x1");
  const [isLocked, setIsLocked] = useState(false);
  const navigate = useNavigate();

  useSessionTimeout(100000, () => setIsLocked(true)); // 5 minutes timeout



  useEffect(() => {
    if (isLocked) {
      navigate("/login");
    }
  }, [isLocked, navigate]);

  return (
    <div className="App">
      <header>
        <img src={logo} className="headerLogo" alt="logo" />
        <Select
          onChange={(val) => setSelectedChain(val)}
          value={selectedChain}
          options={[
            { label: "Ethereum", value: "0x1" },
            { label: "Polygon", value: "0x89" },
            { label: "Polygon Mumbai", value: "0x13882" },
            { label: "BNB Smart Chain", value: "0x38" },
            { label: "BNB Smart Chain Testnet", value: "0x61" },
          ]}
          className="dropdown"
        />
      </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/recover"
          element={<RecoverAccount setSeedPhrase={setSeedPhrase} setWallet={setWallet} />}
        />
        <Route
          path="/create-account"
          element={<CreateAccount setSeedPhrase={setSeedPhrase} setWallet={setWallet} />}
        />
        <Route
          path="/confirm-seed-phrase"
          element={<ConfirmSeedPhrase setSeedPhrase={setSeedPhrase} setWallet={setWallet} />}
        />
        <Route
          path="/login"
          element={<Login setWallet={setWallet} setSeedPhrase={setSeedPhrase} setIsLocked={setIsLocked} />}
        />
        <Route
          path="/yourwallet"
          element={<WalletView wallet={wallet} setWallet={setWallet} seedPhrase={seedPhrase} setSeedPhrase={setSeedPhrase} selectedChain={selectedChain} />}
        />
      </Routes>
    </div>
  );
}

export default App;
