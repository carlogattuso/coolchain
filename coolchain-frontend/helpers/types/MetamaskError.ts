export interface MetamaskError {
  code: number;
  message: string;
}

export function isMetamaskError(error: any): error is MetamaskError {
  return typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'number' &&
    'message' in error &&
    typeof error.message === 'string';
}