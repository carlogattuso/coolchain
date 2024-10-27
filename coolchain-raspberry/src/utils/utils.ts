import { config } from '../config/config';
import { JsonRpcProvider, Wallet } from 'ethers';
import { isAxiosError } from 'axios';
import path from 'node:path';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

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