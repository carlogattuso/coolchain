const { readFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');
const { JsonRpcProvider, Wallet, ContractFactory } = require('ethers');

// 1. Read wallet and compiled contract
const contractFile = JSON.parse(readFileSync(join(__dirname, '.coolchain.json'), 'utf-8'));
const env = JSON.parse(readFileSync(join(__dirname, '.wallet.json'), 'utf-8'));

// 2. Create ethers provider
const isDev = process.argv.includes('--dev');
let provider;
if (isDev) {
  provider = new JsonRpcProvider('http://localhost:9944');
  console.log(`Dev RPC provider: ${provider._getConnection().url}`);
} else {
  provider = new JsonRpcProvider(
    'https://rpc.api.moonbase.moonbeam.network',
    {
      chainId: 1287,
      name: 'moonbase-alpha',
    },
  );
  console.log(`TestNet RPC provider: ${provider._getConnection().url}`);
}

// 3. Create account variables
const accountFrom = {
  privateKey: env.privateKey,
};

// 4. Create wallet
let wallet = new Wallet(accountFrom.privateKey, provider);

// 5. Load contract information
const bytecode = contractFile.evm.bytecode.object;
const abi = contractFile.abi;

// 6. Create contract instance with signer
const coolchainContract = new ContractFactory(abi, bytecode, wallet);

// 7. Create deploy function
const deploy = async () => {
  console.log(`Attempting to deploy from account: ${wallet.address}`);

  // 8. Send tx (initial value set to 5) and wait for receipt
  try {
    const contract = await coolchainContract.deploy();
    const txReceipt = await contract.deploymentTransaction().wait();
    console.log(`Contract deployed at address: ${txReceipt.contractAddress}`);
  } catch (error) {
    console.error('Error on contract deployment');
    console.error(error);
  }
};

// 9. Call the deploy function
deploy();
