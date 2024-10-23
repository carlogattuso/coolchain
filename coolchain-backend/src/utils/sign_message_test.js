const { ethers } = require('ethers');

// Private key provided
const privateKey =
  '0x99b3c12287537e38c90a9219d4cb074a89a16e9cdb20bf85728ebd97c343e342';
const wallet = new ethers.Wallet(privateKey);
console.log(wallet.address);

const message =
  `http://localhost:8081 wants you to sign in with your Ethereum account:\n0x6Be02d1d3665660d22FF9624b7BE0551ee1Ac91b\n\n` +
  `I accept the MetaMask Terms of Service: https://community.metamask.io/tos\n\n` +
  `URI: http://localhost:8081\n` +
  `Version: 1\n` +
  `Chain ID: 1281\n` +
  `Nonce: 0x941ddd61de47230facafd01b564f74a13f5830fae5274b71b198c9d6e1639bfe\n` +
  `Issued At: 2024-10-23T19:23:44.363Z`;

console.log(message);

// Sign the message
async function signMessage() {
  const signature = await wallet.signMessage(message);
  console.log('Signature:', signature);
}

signMessage();
