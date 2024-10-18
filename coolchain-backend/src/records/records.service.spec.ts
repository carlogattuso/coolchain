import { Test, TestingModule } from '@nestjs/testing';
import { RecordsService } from './records.service';
import { CreateRecordDTO } from '../types/dto/CreateRecordDTO';
import { PrismaService } from '../prisma/prisma.service';
import { ErrorCodes } from '../utils/errors';
import { Device, EventType, Record } from '@prisma/client';
import { Logger } from '@nestjs/common';
import { MAX_RECORD_BATCH_SIZE } from '../utils/constants';
import { CreateEventDTO } from '../types/dto/CreateEventDTO';

const mockCreateRecordDTO = (): CreateRecordDTO => ({
  deviceAddress: '0xabc',
  timestamp: 1234,
  value: 3,
  recordSignature: { v: 28, r: '0x123', s: '0x456' },
  permitSignature: { v: 27, r: '0x12a', s: '0x4b6' },
});

const mockRecord = (): Record => ({
  id: '1',
  deviceAddress: '0xabc',
  timestamp: 1234,
  value: 3,
  recordSignature: { v: 28, r: '0x123', s: '0x456' },
  permitSignature: { v: 27, r: '0x12a', s: '0x4b6' },
});

const mockDevice = (): Device => ({
  address: '0xabc',
  name: 'Device 1',
  auditorAddress: '0x1aT',
});

const mockDatabaseError = (): Error =>
  new Error(ErrorCodes.DATABASE_ERROR.code);

describe('RecordsService', () => {
  let recordsService: RecordsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(jest.fn());
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecordsService,
        {
          provide: PrismaService,
          useValue: {
            device: {
              findUnique: jest.fn(),
            },
            record: {
              create: jest.fn(),
              findMany: jest.fn(),
            },
            event: {
              createMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    recordsService = module.get<RecordsService>(RecordsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('storeUnauditedRecord', () => {
    it('should store a record successfully', async () => {
      const createRecordDto = mockCreateRecordDTO();
      const record = mockRecord();

      jest
        .spyOn(prismaService.device, 'findUnique')
        .mockResolvedValue(mockDevice());
      jest.spyOn(prismaService.record, 'create').mockResolvedValue(record);

      const result = await recordsService.storeUnauditedRecord(createRecordDto);

      expect(result).toEqual(record);
      expect(prismaService.device.findUnique).toHaveBeenCalledWith({
        where: { address: createRecordDto.deviceAddress },
      });
      expect(prismaService.record.create).toHaveBeenCalledWith({
        data: {
          deviceAddress: createRecordDto.deviceAddress,
          timestamp: createRecordDto.timestamp,
          value: createRecordDto.value,
          recordSignature: createRecordDto.recordSignature,
          permitSignature: createRecordDto.permitSignature,
        },
      });
    });

    it('should throw an error if the device is not registered', async () => {
      const createRecordDto = mockCreateRecordDTO();

      jest.spyOn(prismaService.device, 'findUnique').mockResolvedValue(null);

      await expect(
        recordsService.storeUnauditedRecord(createRecordDto),
      ).rejects.toThrow(new Error(ErrorCodes.DEVICE_NOT_REGISTERED.code));
    });

    it('should throw a database error if Prisma throws an error', async () => {
      const createRecordDto = mockCreateRecordDTO();
      jest
        .spyOn(prismaService.device, 'findUnique')
        .mockRejectedValue(mockDatabaseError());

      await expect(
        recordsService.storeUnauditedRecord(createRecordDto),
      ).rejects.toThrow(mockDatabaseError());

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining(`Error retrieving device:`),
        expect.objectContaining({
          stack: expect.any(String),
          device: createRecordDto.deviceAddress,
        }),
      );
    });

    it('should log and throw a database error if Prisma create throws an error', async () => {
      const createRecordDto = mockCreateRecordDTO();

      jest
        .spyOn(prismaService.device, 'findUnique')
        .mockResolvedValue(mockDevice());
      jest
        .spyOn(prismaService.record, 'create')
        .mockRejectedValue(mockDatabaseError());

      await expect(
        recordsService.storeUnauditedRecord(createRecordDto),
      ).rejects.toThrow(mockDatabaseError());

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining(`Error creating record:`),
        expect.objectContaining({
          stack: expect.any(String),
          device: createRecordDto.deviceAddress,
        }),
      );
    });
  });

  describe('getUnauditedRecords', () => {
    it('should return a list of unaudited records', async () => {
      const records = [mockRecord()];

      jest.spyOn(prismaService.record, 'findMany').mockResolvedValue(records);

      const result = await recordsService.getUnauditedRecords(
        MAX_RECORD_BATCH_SIZE,
      );

      expect(result).toEqual(records);
      expect(prismaService.record.findMany).toHaveBeenCalledWith({
        where: { events: { none: {} } },
        orderBy: { timestamp: 'asc' },
        take: MAX_RECORD_BATCH_SIZE,
      });
    });

    it('should throw a database error if Prisma throws an error', async () => {
      jest
        .spyOn(prismaService.record, 'findMany')
        .mockRejectedValue(mockDatabaseError());

      await expect(
        recordsService.getUnauditedRecords(MAX_RECORD_BATCH_SIZE),
      ).rejects.toThrow(mockDatabaseError());

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining(`Error retrieving unaudited records:`),
        expect.objectContaining({
          stack: expect.any(String),
        }),
      );
    });
  });

  describe('auditRecords', () => {
    it('should audit records successfully', async () => {
      const events: CreateEventDTO[] = [
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

      jest
        .spyOn(prismaService.event, 'createMany')
        .mockResolvedValue(undefined);

      await expect(recordsService.auditRecords(events)).resolves.not.toThrow();
      expect(prismaService.event.createMany).toHaveBeenCalledWith({
        data: events,
      });
    });

    it('should throw a database error if Prisma throws an error', async () => {
      jest
        .spyOn(prismaService.event, 'createMany')
        .mockRejectedValue(mockDatabaseError());

      await expect(recordsService.auditRecords([])).rejects.toThrow(
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

  describe('getRecordsWithEvents', () => {
    it('should return records with events of an auditor if device not specified', async () => {
      const records = [mockRecord()];

      jest.spyOn(prismaService.record, 'findMany').mockResolvedValue(records);

      const result =
        await recordsService.getRecordsWithEvents('auditorAddress');

      expect(result).toEqual(records);
      expect(prismaService.record.findMany).toHaveBeenCalledWith({
        where: {
          device: { auditorAddress: 'auditorAddress' },
        },
        select: {
          id: true,
          deviceAddress: true,
          timestamp: true,
          value: true,
          events: true,
        },
        orderBy: {
          timestamp: 'desc',
        },
      });
    });

    it('should return records with events of a device if specified', async () => {
      const records = [mockRecord()];

      jest.spyOn(prismaService.record, 'findMany').mockResolvedValue(records);

      const result = await recordsService.getRecordsWithEvents(
        'auditorAddress',
        'deviceAddress',
      );

      expect(result).toEqual(records);
      expect(prismaService.record.findMany).toHaveBeenCalledWith({
        where: {
          device: { auditorAddress: 'auditorAddress' },
          deviceAddress: 'deviceAddress',
        },
        select: {
          id: true,
          deviceAddress: true,
          timestamp: true,
          value: true,
          events: true,
        },
        orderBy: {
          timestamp: 'desc',
        },
      });
    });

    it('should throw a database error if Prisma throws an error and device specified', async () => {
      jest
        .spyOn(prismaService.record, 'findMany')
        .mockRejectedValue(mockDatabaseError());

      await expect(
        recordsService.getRecordsWithEvents('auditorAddress', 'deviceAddress'),
      ).rejects.toThrow(mockDatabaseError());

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining(`Error retrieving records with events:`),
        expect.objectContaining({
          stack: expect.any(String),
          auditor: 'auditorAddress',
          device: 'deviceAddress',
        }),
      );
    });

    it('should throw a database error if Prisma throws an error and device not specified', async () => {
      jest
        .spyOn(prismaService.record, 'findMany')
        .mockRejectedValue(mockDatabaseError());

      await expect(
        recordsService.getRecordsWithEvents('auditorAddress', undefined),
      ).rejects.toThrow(mockDatabaseError());

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining(`Error retrieving records with events:`),
        expect.objectContaining({
          stack: expect.any(String),
          auditor: 'auditorAddress',
          device: null,
        }),
      );
    });
  });
});
