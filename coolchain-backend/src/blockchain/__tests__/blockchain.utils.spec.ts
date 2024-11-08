// utils.test.ts
import {
  createJsonRpcProvider,
  getCoolchainContract,
  getUnixTimeInSeconds,
} from '../blockchain.utils';
import { JsonRpcProvider } from 'ethers';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

jest.mock('node:fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
}));

describe('BlockchainUtils', () => {
  describe('createJsonRpcProvider', () => {
    it('should create a JsonRpcProvider with only rpcUrl', () => {
      const provider = createJsonRpcProvider('http://localhost:8545');
      expect(provider).toBeInstanceOf(JsonRpcProvider);
      expect(provider._getConnection().url).toBe('http://localhost:8545');
    });

    it('should create a JsonRpcProvider with rpcUrl, chainId, and chainName', () => {
      const provider = createJsonRpcProvider(
        'http://localhost:8545',
        1,
        'mainnet',
      );
      expect(provider).toBeInstanceOf(JsonRpcProvider);
    });
  });

  describe('getUnixTimeInSeconds', () => {
    it('should return the current time in seconds', () => {
      const nowInSeconds = Math.floor(Date.now() / 1000);
      const result = getUnixTimeInSeconds();
      expect(result).toBeCloseTo(nowInSeconds, -1);
    });
  });

  describe('getCoolchainContract', () => {
    const mockFilePath = join(process.cwd(), '.coolchain.json');
    const mockContractData = JSON.stringify({
      abi: [],
      bytecode: '0x123',
    });

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return the contract data if file exists', () => {
      (existsSync as jest.Mock).mockReturnValue(true);
      (readFileSync as jest.Mock).mockReturnValue(mockContractData);

      const result = getCoolchainContract();
      expect(result).toEqual(JSON.parse(mockContractData));
      expect(existsSync).toHaveBeenCalledWith(mockFilePath);
      expect(readFileSync).toHaveBeenCalledWith(mockFilePath, 'utf8');
    });

    it('should throw an error if the contract file does not exist', () => {
      (existsSync as jest.Mock).mockReturnValue(false);

      expect(() => getCoolchainContract()).toThrow(
        new Error(
          "Compiled contract file not found. Please make sure to run 'npm run compile-contract' before starting the application.",
        ),
      );
      expect(existsSync).toHaveBeenCalledWith(mockFilePath);
      expect(readFileSync).not.toHaveBeenCalled();
    });
  });
});
