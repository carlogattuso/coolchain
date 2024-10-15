const { ethers } = require('ethers');

// Private key provided
const privateKey =
  '0x99b3c12287537e38c90a9219d4cb074a89a16e9cdb20bf85728ebd97c343e342';
const wallet = new ethers.Wallet(privateKey);
console.log(wallet.address);

const message =
  `coolchain wants you to sign with your Ethereum account: 0x6Be02d1d3665660d22FF9624b7BE0551ee1Ac91b\n` +
  `\nPlease sign this message to verify your identity.\n` +
  `\nURI: http://localhost:3000\nVersion: 1\nChain ID: 1281` +
  `\nNonce: 0x968789014c21e530701a73fb43e91a9bed90ad96ea2812390201ff09ea9aa765` +
  `\nIssued At: 2024-10-16T18:28:17.360Z`;

console.log(message);

// Sign the message
async function signMessage() {
  const signature = await wallet.signMessage(message);
  console.log('Signature:', signature);
}

signMessage();
