const solc = require('solc');
const { readFileSync, writeFileSync } = require('node:fs');
const path = require('node:path');
const { join } = require('node:path');

const filePath = join(__dirname, 'Coolchain.sol');
const source = readFileSync(filePath, 'utf8');

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

const output = JSON.parse(solc.compile(JSON.stringify(input)));
const contract = output.contracts['Coolchain.sol']['Coolchain'];
writeFileSync(path.join(process.cwd(), '.coolchain.json'), JSON.stringify(contract, null, 2));