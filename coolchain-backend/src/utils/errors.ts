export const ErrorCodes = {
  DEVICE_NOT_REGISTERED: {
    code: 'ERR001',
    message: 'The specified device is not registered.',
  },
  BAD_LOGIN_REQUEST: {
    code: 'ERR002',
    message: 'Valid address, signature, and nonce are required',
  },
  DATABASE_ERROR: {
    code: 'ERR003',
    message: 'Database error occurred.',
  },
  ADDRESS_REQUIRED: {
    code: 'ERR004',
    message: 'Address is required',
  },
  UNAUTHORIZED: {
    code: 'ERR005',
    message: 'Invalid authentication',
  },
  AUTH_EXPIRATION_TIMEOUT: {
    code: 'ERR006',
    message: 'Authentication timeout has expired',
  },
  UNEXPECTED_ERROR: {
    code: 'ERR999',
    message: 'Unexpected error occurred.',
  },
};
