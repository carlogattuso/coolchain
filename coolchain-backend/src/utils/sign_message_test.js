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
  `\nNonce: 0x815c45d3b6dacf892a6fa223631d2421e48ea53ab9623f972b46a3dd0acb7464` +
  `\nIssued At: 2024-10-20T17:57:04.753Z`;

console.log(message);

// Sign the message
async function signMessage() {
  const signature = await wallet.signMessage(message);
  console.log('Signature:', signature);
}

signMessage();
