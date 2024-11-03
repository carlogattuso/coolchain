import { ApiProperty } from '@nestjs/swagger';

export class AuditStatusDTO {
  @ApiProperty({
    description:
      'Indicates whether the device has completed the last audit in progress',
    example: true,
  })
  isAuditPending: boolean;
}
