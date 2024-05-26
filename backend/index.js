const express = require("express");
const Moralis = require("moralis").default;
const axios = require("axios");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const User = require('./models/User'); // Import User model
const port = 3001;

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

let addressBlacklist = [];
let domainBlacklist = [];

// Fetch blacklist data from GitHub
const fetchBlacklistData = async () => {
  try {
    const response = await axios.get('https://raw.githubusercontent.com/scamsniffer/scam-database/main/blacklist/all.json');
    const blacklistData = response.data;
    console.log('Fetched blacklist data:', blacklistData);

    if (blacklistData && blacklistData.address && blacklistData.domains) {
      addressBlacklist = blacklistData.address.map(address => address.toLowerCase());
      domainBlacklist = blacklistData.domains;
      console.log('Blacklist data parsed successfully:', addressBlacklist, domainBlacklist);
    } else {
      console.error('Blacklist data is not in the expected format.');
    }
  } catch (error) {
    console.error('Error fetching blacklist data:', error);
  }
};

// Fetch initial blacklist data and set an interval to update it regularly
fetchBlacklistData();
setInterval(fetchBlacklistData, 60 * 60 * 1000); // Update every hour

const isAddressBlacklisted = (address) => {
  console.log(`Checking if address ${address.toLowerCase()} is blacklisted.`);
  return addressBlacklist.includes(address.toLowerCase());
};

const isDomainBlacklisted = (domain) => {
  console.log(`Checking if domain ${domain.toLowerCase()} is blacklisted.`);
  return domainBlacklist.includes(domain.toLowerCase());
};

app.get("/getTokens", async (req, res) => {
  const { userAddress, chain } = req.query;
  const tokens = await Moralis.EvmApi.token.getWalletTokenBalances({
    chain: chain,
    address: userAddress,
  });
  const nfts = await Moralis.EvmApi.nft.getWalletNFTs({
    chain: chain,
    address: userAddress,
    mediaItems: true,
  });
  const myNfts = nfts.raw.result.map((e) => {
    if (e?.media?.media_collection?.high?.url && !e.possible_spam && (e?.media?.category !== "video")) {
      return e["media"]["media_collection"]["high"]["url"];
    }
  });
  const balance = await Moralis.EvmApi.balance.getNativeBalance({
    chain: chain,
    address: userAddress
  });
  const jsonResponse = {
    tokens: tokens.raw,
    nfts: myNfts,
    balance: balance.raw.balance / (10 ** 18)
  };
  return res.status(200).json(jsonResponse);
});

app.get("/getWalletTransactions", async (req, res) => {
  const { userAddress, chain } = req.query;
  try {
    const transactions = await Moralis.EvmApi.transaction.getWalletTransactions({
      chain: chain,
      address: userAddress,
    });
    return res.status(200).json({ transactions: transactions.result });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/checkAddress", (req, res) => {
  const { address } = req.body;
  if (isAddressBlacklisted(address)) {
    return res.status(200).json({ message: 'This address is blacklisted. Are you sure you want to send funds?' });
  }
  return res.status(200).json({ message: 'This address is not in the blacklist.' });
});

app.post("/checkDomain", (req, res) => {
  const { domain } = req.body;
  if (isDomainBlacklisted(domain)) {
    return res.status(200).json({ message: 'This domain is blacklisted. Navigation is blocked.' });
  }
  return res.status(200).json({ message: 'This domain is not in the blacklist.' });
});

// Endpoint to handle user registration
app.post("/register", async (req, res) => {
  const { password, mnemonic } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ password: hashedPassword, mnemonic });
    await newUser.save();
    return res.status(200).json({ message: 'User registered successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Error registering user' });
  }
});

Moralis.start({
  apiKey: process.env.MORALIS_KEY,
}).then(() => {
  app.listen(port, () => {
    console.log(`Listening for API Calls`);
  });
});
