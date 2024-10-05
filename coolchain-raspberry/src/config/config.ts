import dotenv from 'dotenv';
import { getOrCreateWallet } from '../utils/utils';

const envFile = process.env.NODE_ENV ? '.env.dev' : '.env';
dotenv.config({ path: envFile });

export const config = {
  privateKey: getOrCreateWallet().privateKey as string,
  contractAddress: process.env.CONTRACT_ADDRESS as string,
  chainName: process.env.CHAIN_NAME as string,
  chainRpcUrl: process.env.CHAIN_RPC_URL as string,
  chainId: parseInt(process.env.CHAIN_ID || '1', 10),
  salt: process.env.SALT as string,
  sampleInterval: parseInt(process.env.SAMPLE_INTERVAL || '10000', 10),
  recordsDir: process.env.RECORDS_DIR as string,
};