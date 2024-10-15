import { Device } from './Device';
import { ApiProperty } from '@nestjs/swagger';

export class Auditor {
  @ApiProperty({
    description: 'Ethereum address associated with the auditor',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  address: string;

  @ApiProperty({
    description: 'List of devices associated with the auditor',
    type: () => [Device],
  })
  devices: Device[];

  @ApiProperty({
    description: 'Optional nonce used for authentication or security purposes',
    example: 'a3f1c9e2',
    required: false,
  })
  nonce?: string;

  @ApiProperty({
    description: 'Timestamp when the nonce was issued, used for authentication',
    example: '2024-10-15T13:45:30.000Z',
    required: false,
  })
  issuedAt?: string;
}
