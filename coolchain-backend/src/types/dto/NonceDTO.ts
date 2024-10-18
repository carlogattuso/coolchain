import { ApiProperty } from '@nestjs/swagger';

export class NonceDTO {
  @ApiProperty({
    description:
      'A nonce used for verifying the identity of the client in API requests',
    example: '0x12345...',
  })
  nonce: string;

  @ApiProperty({
    description: 'The timestamp indicating when the nonce was issued',
    example: '2024-10-18T12:34:56Z',
  })
  issuedAt: Date;
}
