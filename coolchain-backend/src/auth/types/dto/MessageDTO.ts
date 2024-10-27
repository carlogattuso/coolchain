import { ApiProperty } from '@nestjs/swagger';

export class MessageDTO {
  @ApiProperty({
    description:
      'Standard SIWE (Sign-In with Ethereum) message based on ERC-4361. This message is signed by the user to prove ownership of the Ethereum address.',
    example:
      'Example SIWE message: "domain.com wants you to sign in with your Ethereum account: 0x1234567890abcdef1234567890abcdef12345678\n\nURI: https://domain.com\nVersion: 1\nChain ID: 1\nNonce: abc123\nIssued At: 2023-10-23T12:00:00Z"',
  })
  message: string;
}
