import { ApiProperty } from '@nestjs/swagger';
import { EventType } from '@prisma/client';

export class Event {
  @ApiProperty({
    description: 'Unique identifier for the event (MongoDB ObjectId)',
    example: '652d6c5f8f1b2c0006c2a3e9',
  })
  id: string;

  @ApiProperty({
    description: 'Unique transaction hash related to this event',
    example:
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  })
  transactionHash: string;

  @ApiProperty({
    description: 'Hash of the block that contains this event',
    example:
      '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  })
  blockHash: string;

  @ApiProperty({
    description: 'Block number where this event was included',
    example: 12345678,
  })
  blockNumber: number;

  @ApiProperty({
    description:
      'Address associated with the event (usually the contract address)',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  address: string;

  @ApiProperty({
    description: 'Data emitted by the event',
    example: '0xdeadbeef',
  })
  data: string;

  @ApiProperty({
    description:
      'Topics associated with the event (event signature and indexed parameters)',
    example: [
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef',
    ],
  })
  topics: string[];

  @ApiProperty({
    description: 'Position of the event within the batch precompile call',
    example: 5,
  })
  index: number;

  @ApiProperty({
    description: 'Position of the transaction within the block',
    example: 2,
  })
  transactionIndex: number;

  @ApiProperty({
    description: 'Type of the event (enum value)',
    enum: EventType,
    example: EventType.SubcallSucceeded,
  })
  eventType: EventType;

  @ApiProperty({
    description: 'ID of the associated record (MongoDB ObjectId)',
    example: '652d6c5f8f1b2c0006c2a3e9',
  })
  recordId: string;
}
