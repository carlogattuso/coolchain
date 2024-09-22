import dotenv from 'dotenv';

const envFile = process.env.NODE_ENV ? '.env.dev' : '.env';

dotenv.config({ path: envFile });

export const config = {
  privateKey: process.env.WALLET_PRIVATE_KEY as string,
  contractAddress: process.env.CONTRACT_ADDRESS as string,
  chainName: process.env.CHAIN_NAME as string,
  chainRpcUrl: process.env.CHAIN_RPC_URL as string,
  chainId: parseInt(process.env.CHAIN_ID || '1', 10),
  salt: process.env.SALT as string,
};