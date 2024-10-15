export function createSignInMessage(
  domain: string,
  uri: string,
  chainId: number,
  address: string,
  nonce: string,
  issuedAt: string,
): string {
  return (
    `${domain} wants you to sign with your Ethereum account: ${address}\n` +
    `\nPlease sign this message to verify your identity.\n` +
    `\nURI: ${uri}\nVersion: 1\nChain ID: ${chainId}\nNonce: ${nonce}\nIssued At: ${issuedAt}`
  );
}
