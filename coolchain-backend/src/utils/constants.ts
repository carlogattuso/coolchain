export const AUTH_EXPIRATION_TIMEOUT = 120 * 1000;
export const AUTH_THROTTLER_TTL = 60 * 1000;
export const AUTH_THROTTLER_LIMIT = 5;
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

export const PERMIT_PRECOMPILE_ADDRESS =
  '0x000000000000000000000000000000000000080a';

export const PERMIT_PRECOMPILE_ABI = [
  {
    inputs: [],
    name: 'DOMAIN_SEPARATOR',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'from', type: 'address' },
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      { internalType: 'uint256', name: 'value', type: 'uint256' },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
      { internalType: 'uint64', name: 'gaslimit', type: 'uint64' },
      {
        internalType: 'uint256',
        name: 'deadline',
        type: 'uint256',
      },
      { internalType: 'uint8', name: 'v', type: 'uint8' },
      {
        internalType: 'bytes32',
        name: 'r',
        type: 'bytes32',
      },
      { internalType: 'bytes32', name: 's', type: 'bytes32' },
    ],
    name: 'dispatch',
    outputs: [{ internalType: 'bytes', name: 'output', type: 'bytes' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
    name: 'nonces',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];
