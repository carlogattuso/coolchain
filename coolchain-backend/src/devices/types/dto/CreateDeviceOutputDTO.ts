import { ApiProperty } from '@nestjs/swagger';

export class CreateDeviceOutputDTO {
  @ApiProperty({
    description: 'Number of created devices',
    example: 2,
  })
  created: number;
}
