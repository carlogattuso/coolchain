// // 1. Import packages
// // eslint-disable-next-line @typescript-eslint/no-var-requires
// const fs = require('fs');
// // eslint-disable-next-line @typescript-eslint/no-var-requires
// const solc = require('solc');

// 2. Get path and load contract
import * as fs from 'fs';
import * as solc from 'solc';
import * as path from 'path';

const filePath = path.join(process.cwd(), './contract/Coolchain.sol');
const source = fs.readFileSync(filePath, 'utf8');

// 3. Create input object
const input = {
  language: 'Solidity',
  sources: {
    'Coolchain.sol': {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['*'],
      },
    },
  },
};

const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
const contractFile = tempFile.contracts['Coolchain.sol']['Coolchain'];

export default contractFile;