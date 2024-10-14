import { ApiProperty } from '@nestjs/swagger';

export class ECDSASignature {
  @ApiProperty({
    description: 'The recovery id',
    example: 27,
  })
  v: number;

  @ApiProperty({
    description: 'The r part of the signature',
    example: '0x6b...',
  })
  r: string;

  @ApiProperty({
    description: 'The s part of the signature',
    example: '0x2b...',
  })
  s: string;
}
