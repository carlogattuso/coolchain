import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsHexadecimal, IsString, Length } from 'class-validator';

export class Nonce {
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
