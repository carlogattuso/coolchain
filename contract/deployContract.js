// 1. Import the contract file
// eslint-disable-next-line @typescript-eslint/no-var-requires
const contractFile = require('./compileContract');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ethers = require('ethers');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const env = require('./.envWallet');

// 2. Define network configurations
const providerRPC = {
  moonbase: {
    name: 'moonbase-alpha',
    rpc: 'https://rpc.api.moonbase.moonbeam.network',
    chainId: 1287, // 0x507 in hex,
  },
};

// 3. Create ethers provider
const provider = new ethers.JsonRpcProvider(providerRPC.moonbase.rpc, {
  chainId: providerRPC.moonbase.chainId,
  name: providerRPC.moonbase.name,
});

// 3. Create account variables
const accountFrom = {
  privateKey: env.privateKey,
};

// 4. Create wallet
let wallet = new ethers.Wallet(accountFrom.privateKey, provider);

// 5. Load contract information
const bytecode = contractFile.evm.bytecode.object;
const abi = contractFile.abi;

// 6. Create contract instance with signer
const coolchainContract = new ethers.ContractFactory(abi, bytecode, wallet);

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
