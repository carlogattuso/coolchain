export const MAX_RECORD_BATCH_SIZE = 5;
export const BATCH_PRECOMPILE_ADDRESS =
  '0x0000000000000000000000000000000000000808';
export const BATCH_PRECOMPILE_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'index',
        type: 'uint256',
      },
    ],
    name: 'SubcallFailed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'index',
        type: 'uint256',
      },
    ],
    name: 'SubcallSucceeded',
    type: 'event',
  },
  {
    inputs: [
      { internalType: 'address[]', name: 'to', type: 'address[]' },
      { internalType: 'uint256[]', name: 'value', type: 'uint256[]' },
      { internalType: 'bytes[]', name: 'call_data', type: 'bytes[]' },
      { internalType: 'uint64[]', name: 'gas_limit', type: 'uint64[]' },
    ],
    name: 'batchAll',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address[]', name: 'to', type: 'address[]' },
      { internalType: 'uint256[]', name: 'value', type: 'uint256[]' },
      { internalType: 'bytes[]', name: 'call_data', type: 'bytes[]' },
      { internalType: 'uint64[]', name: 'gas_limit', type: 'uint64[]' },
    ],
    name: 'batchSome',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address[]', name: 'to', type: 'address[]' },
      { internalType: 'uint256[]', name: 'value', type: 'uint256[]' },
      { internalType: 'bytes[]', name: 'call_data', type: 'bytes[]' },
      { internalType: 'uint64[]', name: 'gas_limit', type: 'uint64[]' },
    ],
    name: 'batchSomeUntilFailure',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
