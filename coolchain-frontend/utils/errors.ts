export const ErrorCodes = {
  UNAUTHORIZED: {
    code: 'ERR001',
    message: 'Invalid authentication. Please try again',
  },
  ERROR_GET_SIWE_MESSAGE: {
    code: 'ERR002',
    message: 'Failed to get sign in message. Please check your connection',
  },
  ERROR_TOO_MANY_REQUESTS: {
    code: 'ERR003',
    message: 'Too many sign in requests. Please try again after some time',
  },
  ERROR_AUTH_TIMEOUT_EXPIRED: {
    code: 'ERR004',
    message: 'Sign in timeout. Please try again',
  },
  ERROR_SIGN_IN: {
    code: 'ERR005',
    message: 'Failed to sign in. Please check your connection',
  },
  METAMASK_SIGNATURE_REJECTED: {
    code: '4001',
    message: 'Sign in rejected, a signed message is required',
  },
  METAMASK_EMPTY_ACCOUNT: {
    code: 'ERR006',
    message: 'No account found. Please select one from your wallet',
  },
  METAMASK_EMPTY_SIGNATURE: {
    code: 'ERR007',
    message: 'No message signature found. Please try again',
  },
  METAMASK_MULTIPLE_ACCOUNTS_DISABLED: {
    code: 'ERR008',
    message: 'Sign in with multiple accounts is not possible . Please choose one',
  },
  METAMASK_PROVIDER_NOT_AVAILABLE: {
    code: 'ERR009',
    message: 'Metamask provider not available. Please install metamask',
  },
  METAMASK_WRONG_CHAIN_ID: {
    code: 'ERR010',
    message: 'Please connect to Moonbeam network and try again',
  },
  UNEXPECTED_ERROR: {
    code: 'ERR999',
    message: 'Unexpected error occurred. Please contact us or try again later',
  },
};