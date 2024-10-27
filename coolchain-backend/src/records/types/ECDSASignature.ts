import { ApiProperty } from '@nestjs/swagger';
import { IsHexadecimal, IsNumber, IsString, Length } from 'class-validator';

export class ECDSASignature {
  @ApiProperty({
    description: 'The recovery id',
    example: 27,
  })
  @IsNumber()
  v: number;

  @ApiProperty({
    description: 'The r part of the signature',
    example: '0x6b...',
  })
  @IsString()
  @IsHexadecimal()
  @Length(64, 128)
  r: string;

  @ApiProperty({
    description: 'The s part of the signature',
    example: '0x2b...',
  })
  @IsString()
  @IsHexadecimal()
  @Length(64, 128)
  s: string;
}
