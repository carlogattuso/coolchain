import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEthereumAddress,
  IsHexadecimal,
  IsString,
  Length,
} from 'class-validator';

export class SignInDTO {
  @ApiProperty({
    description: 'Ethereum address of the user trying to sign in',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @IsEthereumAddress()
  address: string;

  @ApiProperty({
    description: 'Signature generated by the user to authenticate the request',
    example:
      '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  })
  @IsString()
  @IsHexadecimal()
  @Length(128, 256)
  signature: string;

  @ApiProperty({
    description:
      'Nonce used to ensure the request is unique and to prevent replay attacks',
    example: 'a3f1c9e2',
  })
  @IsString()
  @IsHexadecimal()
  @Length(64, 128)
  nonce: string;

  @ApiProperty({
    description:
      'The timestamp indicating when the nonce was issued, in ISO string format',
    example: '2024-10-18T12:34:56Z',
  })
  @IsString()
  @IsDateString()
  issuedAt: string;
}
