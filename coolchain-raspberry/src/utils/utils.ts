import { config } from '../config/config';
import { AddressLike, ethers, JsonRpcProvider, Wallet } from 'ethers';
import { isAxiosError } from 'axios';
import path, { join } from 'node:path';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { PERMIT_PRECOMPILE_ADDRESS, PERMIT_PRECOMPILE_GET_NONCE_ABI } from './constants';

export function getJsonRpcProvider(): JsonRpcProvider {
  return new JsonRpcProvider(config.chainRpcUrl, {
    chainId: +config.chainId,
    name: config.chainName,
  });
}

export function parseAxiosError(error: unknown): string {
  if (isAxiosError(error)) {
    const response = error.response?.data;
    const status = error.response?.status;

    if (error.code === 'ECONNREFUSED') {
      return 'Connection error: Unable to connect to the server. Please check if the server is running.';
    }

    if (status) {
      return `Request error: ${status} - ${response.message ?? error.message}`;
    }

    return `Axios error: ${error.code || 'Unknown error code'}`;
  }

  return `Unknown error: ${error}`;
}

export function getOrCreateWallet(): { privateKey: string } {
  const walletFilePath = path.join(process.cwd(), '.wallet.json');

  if (existsSync(walletFilePath)) {
    return JSON.parse(readFileSync(walletFilePath, 'utf8'));
  } else {
    const wallet = Wallet.createRandom();
    const walletKey = {
      privateKey: wallet.privateKey,
    };
    writeFileSync(walletFilePath, JSON.stringify(walletKey, null, 2));
    return walletKey;
  }
}

export async function getNonce(forAddress: AddressLike): Promise<bigint> {
  const contract = new ethers.Contract(
    PERMIT_PRECOMPILE_ADDRESS,
    PERMIT_PRECOMPILE_GET_NONCE_ABI,
    getJsonRpcProvider(),
  );
  return await contract.nonces(forAddress);
}

export function getCoolchainContract(): CompiledContract {
  const contractFilePath = join(process.cwd(), '.coolchain.json');
  if (!existsSync(contractFilePath)) {
    throw new Error(
      'Compiled contract file not found. Please make sure to run \'npm run compile-contract\' before starting the application.',
    );
  }
  return JSON.parse(readFileSync(contractFilePath, 'utf8')) as CompiledContract;
}