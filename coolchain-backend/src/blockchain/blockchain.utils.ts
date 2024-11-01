import { join } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { JsonRpcProvider } from 'ethers';

export function createJsonRpcProvider(
  _rpcUrl: string,
  _chainId?: number,
  _chainName?: string,
): JsonRpcProvider {
  if (_chainId && _chainName) {
    return new JsonRpcProvider(_rpcUrl, {
      chainId: _chainId,
      name: _chainName,
    });
  } else {
    return new JsonRpcProvider(_rpcUrl);
  }
}

export function getCoolchainContract(): CompiledContract {
  const contractFilePath = join(process.cwd(), '.coolchain.json');
  if (!existsSync(contractFilePath)) {
    throw new Error(
      "Compiled contract file not found. Please make sure to run 'npm run compile-contract' before starting the application.",
    );
  }
  return JSON.parse(readFileSync(contractFilePath, 'utf8')) as CompiledContract;
}
