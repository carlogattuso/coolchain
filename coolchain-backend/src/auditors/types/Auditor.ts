import { Device } from '../../devices/types/Device';
import { ApiProperty } from '@nestjs/swagger';
import { IsEthereumAddress } from 'class-validator';

export class Auditor {
  @ApiProperty({
    description: 'Ethereum address associated with the auditor',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @IsEthereumAddress()
  address: string;

  @ApiProperty({
    description: 'List of devices associated with the auditor',
    required: false,
    type: () => [Device],
  })
  devices?: Device[];

  @ApiProperty({
    description: 'Optional nonce used for authentication or security purposes',
    example: 'a3f1c9e2',
    required: false,
  })
  nonce?: string;

  @ApiProperty({
    description:
      'Timestamp when the nonce was issued (ISO String), used for authentication',
    example: '2024-10-20T17:57:04.753Z',
    required: false,
  })
  issuedAt?: string;

  @ApiProperty({
    description:
      'Indicates whether the user has completed the onboarding process',
    example: true,
    required: false,
  })
  onBoardingPending?: boolean;
}
