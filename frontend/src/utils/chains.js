const Ethereum = {
    hex: '0x1',
    name: 'Ethereum',
    rpcUrl: 'https://mainnet.infura.io/v3/b37459b155664b76a8366518a43baeaf',
    blockExplorerUrl: 'https://etherscan.io',
    ticker: "ETH"
};
const Polygon = {
    hex: '0x89',
    name: 'Poygon',
    blockExplorerUrl: 'https://polygonscan.com/',
    rpcUrl: 'https://polygon-mainnet.infura.io/v3/b37459b155664b76a8366518a43baeaf',
    ticker: "MATIC"
};

const MumbaiTestnet = {
    hex: '0x13882',
    name: 'Poygon Amoy',
    blockExplorerUrl: 'https://amoy.polygonscan.com/',
    rpcUrl: 'https://polygon-amoy.infura.io/v3/b37459b155664b76a8366518a43baeaf',
    ticker: "MATIC"
};

const BNBSmartChain = {
    hex: '0x38',
    name: 'BNB Smart Chain',
    rpcUrl: '',
    blockExplorerUrl: 'https://bscscan.com/',
    ticker: "BNB"
}

const BNBSmartChainTestnet = {
    hex: '0x61',
    name: 'BNB Smart Chain Testnet',
    rpcUrl: 'wss://bsc-testnet-rpc.publicnode.com',
    ticker: "tBNB"
}


export const CHAINS_CONFIG = {
    "0x1": Ethereum,
    "0x89": Polygon,
    "0x13882": MumbaiTestnet,
    "0x38":BNBSmartChain,
    "0x61":BNBSmartChainTestnet,
};