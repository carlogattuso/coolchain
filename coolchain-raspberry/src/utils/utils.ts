import { ethers } from 'ethers';
import { config } from '../config/config';
import axios from 'axios';

export function getJsonRpcProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(config.chainRpcUrl, {
    chainId: config.chainId,
    name: config.chainName,
  });
}

export function parseAxiosError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.message;
    const status = error.response?.status;

    if (error.code === 'ECONNREFUSED') {
      return 'Connection error: Unable to connect to the server. Please check if the server is running.';
    }

    if (status) {
      return `Request error: ${status} - ${message}`;
    }

    return `Axios error: ${error.code || 'Unknown error code'}`;
  }

  return `Unknown error: ${error}`;
}
