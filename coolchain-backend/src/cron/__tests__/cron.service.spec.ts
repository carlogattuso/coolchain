import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { CronService } from '../cron.service';
import { RecordsService } from '../../records/records.service';
import { EventsService } from '../../events/events.service';
import { BlockchainService } from '../../blockchain/blockchain.service';
import { Record } from '@prisma/client';
import { CreateEventDTO } from '../../events/types/dto/CreateEventDTO';
import {
  BATCH_PRECOMPILE_ADDRESS,
  MAX_RECORD_BATCH_SIZE,
} from '../../utils/constants';

const mockRecords = (): Record[] => [
  {
    id: '1',
    deviceAddress: '0xabc',
    timestamp: 1234,
    value: 3,
    permitDeadline: 24 * 60 * 60,
    permitSignature: { v: 27, r: '0x12a', s: '0x4b6' },
  },
  {
    id: '2',
    deviceAddress: '0xabc',
    timestamp: 1234,
    value: 5,
    permitDeadline: 24 * 60 * 60,
    permitSignature: { v: 27, r: '0x12b', s: '0x4c6' },
  },
];

const mockEvents = (): CreateEventDTO[] => [
  {
    recordId: '1',
    eventType: 'SubcallSucceeded',
    transactionHash: '0xabc',
    index: 0,
    blockNumber: 10,
    blockHash: '0x123',
    address: BATCH_PRECOMPILE_ADDRESS,
    data: '0xjkl',
    topics: [],
    transactionIndex: 0,
  },
  {
    recordId: '2',
    eventType: 'SubcallFailed',
    transactionHash: '0xdef',
    index: 1,
    blockNumber: 10,
    blockHash: '0x123',
    address: BATCH_PRECOMPILE_ADDRESS,
    data: '0xghi',
    topics: [],
    transactionIndex: 1,
  },
];

describe('CronService', () => {
  let cronService: CronService;
  let recordsService: RecordsService;
  let eventsService: EventsService;
  let blockchainService: BlockchainService;

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(jest.fn());
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CronService,
        {
          provide: RecordsService,
          useValue: {
            getUnauditedRecords: jest.fn(),
          },
        },
        {
          provide: BlockchainService,
          useValue: {
            auditRecords: jest.fn(),
          },
        },
        {
          provide: EventsService,
          useValue: {
            storeEvents: jest.fn(),
          },
        },
        Logger,
      ],
    }).compile();

    cronService = module.get<CronService>(CronService);
    recordsService = module.get<RecordsService>(RecordsService);
    blockchainService = module.get<BlockchainService>(BlockchainService);
    eventsService = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(cronService).toBeDefined();
    expect(recordsService).toBeDefined();
    expect(blockchainService).toBeDefined();
    expect(eventsService).toBeDefined();
  });

  it('should call auditRecords and storeEvents when unaudited records are found', async () => {
    jest
      .spyOn(recordsService, 'getUnauditedRecords')
      .mockResolvedValue(mockRecords());
    jest
      .spyOn(blockchainService, 'auditRecords')
      .mockResolvedValue(mockEvents());
    jest.spyOn(eventsService, 'storeEvents').mockResolvedValue(undefined);

    await cronService.blockchainChronicler();

    expect(recordsService.getUnauditedRecords).toHaveBeenCalledWith(
      MAX_RECORD_BATCH_SIZE,
    );
    expect(blockchainService.auditRecords).toHaveBeenCalledWith(mockRecords());
    expect(eventsService.storeEvents).toHaveBeenCalledWith(mockEvents());
  });

  it('should not call auditRecords or storeEvents when no unaudited records are found', async () => {
    jest.spyOn(recordsService, 'getUnauditedRecords').mockResolvedValue([]);

    await cronService.blockchainChronicler();

    expect(recordsService.getUnauditedRecords).toHaveBeenCalledWith(
      MAX_RECORD_BATCH_SIZE,
    );
    expect(blockchainService.auditRecords).not.toHaveBeenCalled();
    expect(eventsService.storeEvents).not.toHaveBeenCalled();
  });
});
