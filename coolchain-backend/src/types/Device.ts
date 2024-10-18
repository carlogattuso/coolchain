import { ApiProperty } from '@nestjs/swagger';

export class Device {
  @ApiProperty({
    description: 'Ethereum address of the device',
    example: '0xabcdef1234567890abcdef1234567890abcdef12',
  })
  address: string;

  @ApiProperty({
    description: 'Friendly name or identifier for the device',
    example: 'Temperature Sensor 01',
  })
  name: string;

  @ApiProperty({
    description:
      'Ethereum address of the auditor that owns or manages the device',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  auditorAddress: string;
}
