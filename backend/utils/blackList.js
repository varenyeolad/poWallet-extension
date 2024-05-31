const axios = require("axios");

let addressBlacklist = [];
let domainBlacklist = [];

// Fetch blacklist data from GitHub
const fetchBlacklistData = async () => {
  try {
    const response = await axios.get('https://raw.githubusercontent.com/scamsniffer/scam-database/main/blacklist/all.json');
    const blacklistData = response.data;

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

const isAddressBlacklisted = (address) => {
  return addressBlacklist.includes(address.toLowerCase());
};

const isDomainBlacklisted = (domain) => {
  return domainBlacklist.includes(domain.toLowerCase());
};

module.exports = { fetchBlacklistData, isAddressBlacklisted, isDomainBlacklisted };
