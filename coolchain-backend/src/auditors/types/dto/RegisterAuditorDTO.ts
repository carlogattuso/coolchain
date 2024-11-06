import { ApiProperty } from '@nestjs/swagger';
import { IsEthereumAddress } from 'class-validator';

export class RegisterAuditorDTO {
  @ApiProperty({
    description: 'Ethereum address associated with the auditor',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @IsEthereumAddress()
  address: string;
}
