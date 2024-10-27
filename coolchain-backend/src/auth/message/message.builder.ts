export function createSIWEMessage(
  domain: string,
  chainId: number,
  address: string,
  nonce: string,
  issuedAt: string,
): string {
  return (
    `${domain} wants you to sign in with your Ethereum account:\n${address}\n\n` +
    `I accept the MetaMask Terms of Service: https://community.metamask.io/tos\n\n` +
    `URI: ${domain}\n` +
    `Version: 1\n` +
    `Chain ID: ${chainId}\n` +
    `Nonce: ${nonce}\n` +
    `Issued At: ${issuedAt}`
  );
}
