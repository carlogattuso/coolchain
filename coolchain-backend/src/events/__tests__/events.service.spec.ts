import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from '../events.service';
import { CreateEventDTO } from '../types/dto/CreateEventDTO';
import { EventType } from '@prisma/client';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ErrorCodes } from '../../utils/errors';

const mockDatabaseError = (): Error =>
  new Error(ErrorCodes.DATABASE_ERROR.code);

const mockCreateEventDTO = (): CreateEventDTO[] => [
  {
    transactionHash: '0x1234',
    transactionIndex: 0,
    blockHash: '0xacbd',
    blockNumber: 234,
    address: '0xa1b2',
    data: 'anoenfe',
    topics: ['0x123', '0x456'],
    index: 0,
    eventType: EventType.SubcallFailed,
    recordId: '1',
  },
  {
    transactionHash: '0x1234',
    transactionIndex: 0,
    blockHash: '0xacbd',
    blockNumber: 234,
    address: '0xa1b2',
    data: 'anoenfe',
    topics: ['0x123', '0x456'],
    index: 1,
    eventType: EventType.SubcallSucceeded,
    recordId: '1',
  },
];

describe('EventsService', () => {
  let eventsService: EventsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(jest.fn());
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: PrismaService,
          useValue: {
            event: {
              createMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    eventsService = module.get<EventsService>(EventsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(eventsService).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  describe('storeEvents', () => {
    it('should store events successfully', async () => {
      const batchPayloadPromise = Promise.resolve({
        count: 2,
      });
      jest
        .spyOn(prismaService.event, 'createMany')
        .mockResolvedValue(await batchPayloadPromise);

      await expect(
        eventsService.storeEvents(mockCreateEventDTO()),
      ).resolves.not.toThrow();
      expect(prismaService.event.createMany).toHaveBeenCalledWith({
        data: mockCreateEventDTO(),
      });
    });

    it('should log and throw a database error if Prisma throws an error', async () => {
      jest
        .spyOn(prismaService.event, 'createMany')
        .mockRejectedValue(mockDatabaseError());

      await expect(eventsService.storeEvents([])).rejects.toThrow(
        mockDatabaseError(),
      );

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining(`Error creating events:`),
        expect.objectContaining({
          stack: expect.any(String),
        }),
      );
    });
  });
});
