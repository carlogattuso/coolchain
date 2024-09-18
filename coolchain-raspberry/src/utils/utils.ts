import { ethers } from 'ethers';
import { config } from '../config/config';

export function getJsonRpcProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(config.chainRpcUrl, {
    chainId: config.chainId,
    name: config.chainName,
  });
}
