export const ErrorCodes = {
  DEVICE_NOT_REGISTERED: {
    code: 'ERR001',
    message: 'The specified device is not registered',
  },
  BAD_SIGN_IN_REQUEST: {
    code: 'ERR002',
    message: 'Valid address, signature, and nonce are required',
  },
  DATABASE_ERROR: {
    code: 'ERR003',
    message: 'Database error occurred',
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
  DEVICE_ALREADY_EXISTS: {
    code: 'ERR007',
    message: 'Device with this address already exists',
  },
  AUDITOR_ALREADY_EXISTS: {
    code: 'ERR007',
    message: 'Auditor with this address already exists',
  },
  AUDIT_NOT_AVAILABLE: {
    code: 'ERR008',
    message: 'Audit is not available for this device. Please try again later',
  },
  AUDITOR_REGISTRATION_ERROR: {
    code: 'ERR009',
    message:
      'An error occurred during the auditor registration in the contract. Please try again later',
  },
  DEVICE_REGISTRATION_ERROR: {
    code: 'ERR010',
    message:
      'An error occurred during the device registration in the contract. Please try again later',
  },
  DEVICE_NOT_REGISTERED_IN_COOLCHAIN: {
    code: 'ERR011',
    message: 'The specified device is not registered in Coolchain contract.',
  },
  UNEXPECTED_ERROR: {
    code: 'ERR999',
    message: 'Unexpected error occurred',
  },
};
