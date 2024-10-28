export const DAY_IN_SECONDS = 24 * 60 * 60;
export const PERMIT_PRECOMPILE_GAS_LIMIT = 100000;
export const PERMIT_PRECOMPILE_ADDRESS =
  '0x000000000000000000000000000000000000080a';
export const PERMIT_PRECOMPILE_GET_NONCE_ABI = [
  'function nonces(address owner) view returns (uint256)',
];
export const PERMIT_PRECOMPILE_NAME = 'Call Permit Precompile';
export const PERMIT_PRECOMPILE_TYPES = {
  CallPermit: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'data', type: 'bytes' },
    { name: 'gaslimit', type: 'uint64' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ],
};