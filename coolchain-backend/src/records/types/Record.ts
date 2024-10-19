import { ApiProperty } from '@nestjs/swagger';
import { Event } from '../../events/types/Event';
import { ECDSASignature } from './ECDSASignature';

export class Record {
  @ApiProperty({
    description: 'Unique identifier for the record (MongoDB ObjectId)',
    example: '652d6c5f8f1b2c0006c2a3e9',
  })
  id: string;

  @ApiProperty({
    description: 'Ethereum address of the device that generated the record',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  deviceAddress: string;

  @ApiProperty({
    description: 'Unix timestamp indicating when the record was created',
    example: 1672525800,
  })
  timestamp: number;

  @ApiProperty({
    description: 'Value recorded from the device',
    example: 23.5,
  })
  value: number;

  @ApiProperty({
    description: 'Digital signature proving the integrity of the record data',
    required: false,
    type: () => ECDSASignature,
  })
  recordSignature?: ECDSASignature;

  @ApiProperty({
    description: 'Digital signature for permit verification',
    required: false,
    type: () => ECDSASignature,
  })
  permitSignature?: ECDSASignature;

  @ApiProperty({
    description: 'List of events associated with this record',
    required: false,
    type: () => [Event],
  })
  events?: Event[];
}
