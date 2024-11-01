import { join } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';

export function getCoolchainContract(): CompiledContract {
  const contractFilePath = join(process.cwd(), '.coolchain.json');
  if (!existsSync(contractFilePath)) {
    throw new Error(
      "Compiled contract file not found. Please make sure to run 'npm run compile-contract' before starting the application.",
    );
  }
  return JSON.parse(readFileSync(contractFilePath, 'utf8')) as CompiledContract;
}
