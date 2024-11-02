import { DeviceDTO } from './DeviceDTO';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDeviceInputDTO {
  @ApiProperty({
    description: 'List of devices to be created, each with an address and name',
    type: [DeviceDTO],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeviceDTO)
  devices: DeviceDTO[];
}
