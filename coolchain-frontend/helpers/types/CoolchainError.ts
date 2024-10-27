export interface CoolchainError {
  message: string;
}

export function isCoolchainError(error: any): error is CoolchainError {
  return typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string';
}