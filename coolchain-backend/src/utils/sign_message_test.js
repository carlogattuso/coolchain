const { ethers } = require('ethers');

// Private key provided
const privateKey =
  '0x5fb92d6e98884f76de468fa3f6278f8807c48bebc13595d45af5bdc4da702133';
const wallet = new ethers.Wallet(privateKey);
console.log(wallet.address);

const message =
  `coolchain wants you to sign with your Ethereum account: 0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac\n` +
  `\nPlease sign this message to verify your identity.\n` +
  `\nURI: http://localhost:3000\nVersion: 1\nChain ID: 1281` +
  `\nNonce: 0xb86ff2bbc25a52e0a48dd062639b38ea8f4bf2d8e26b43bf184a335ad739988e` +
  `\nIssued At: 2024-10-18T19:25:37.737Z`;

console.log(message);

// Sign the message
async function signMessage() {
  const signature = await wallet.signMessage(message);
  console.log('Signature:', signature);
}

signMessage();
