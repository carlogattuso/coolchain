import { Test, TestingModule } from '@nestjs/testing';
import { RecordsService } from '../records.service';
import { CreateRecordDTO } from '../types/dto/CreateRecordDTO';
import { PrismaService } from '../../prisma/prisma.service';
import { ErrorCodes } from '../../utils/errors';
import { Device, Record } from '@prisma/client';
import { Logger } from '@nestjs/common';
import { MAX_RECORD_BATCH_SIZE } from '../../utils/constants';

const mockCreateRecordDTO = (): CreateRecordDTO => ({
  deviceAddress: '0xabc',
  timestamp: 1234,
  value: 3,
  permitDeadline: Date.now() + 24 * 60 * 60,
  permitSignature: { v: 27, r: '0x12a', s: '0x4b6' },
});

const mockRecord = (): Record => ({
  id: '1',
  deviceAddress: '0xabc',
  timestamp: 1234,
  value: 3,
  permitDeadline: Date.now() + 24 * 60 * 60,
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

  it('should be defined', () => {
    expect(recordsService).toBeDefined();
    expect(prismaService).toBeDefined();
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
          permitDeadline: createRecordDto.permitDeadline,
          permitSignature: createRecordDto.permitSignature,
        },
      });
    });

    it('should log and throw an error if the device is not registered', async () => {
      const createRecordDto = mockCreateRecordDTO();

      jest.spyOn(prismaService.device, 'findUnique').mockResolvedValue(null);

      await expect(
        recordsService.storeUnauditedRecord(createRecordDto),
      ).rejects.toThrow(new Error(ErrorCodes.DEVICE_NOT_REGISTERED.code));
    });

    it('should log and throw a database error if Prisma throws an error', async () => {
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
        distinct: ['deviceAddress'],
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

    it('should log and throw a database error if Prisma throws an error and device specified', async () => {
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

    it('should log and throw a database error if Prisma throws an error and device not specified', async () => {
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
