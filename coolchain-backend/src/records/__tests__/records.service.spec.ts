import { Test, TestingModule } from '@nestjs/testing';
import { RecordsService } from '../records.service';
import { CreateRecordDTO } from '../types/dto/CreateRecordDTO';
import { PrismaService } from '../../prisma/prisma.service';
import { ErrorCodes } from '../../utils/errors';
import { Device, Record } from '@prisma/client';
import { Logger } from '@nestjs/common';
import { MAX_RECORD_BATCH_SIZE } from '../../utils/constants';
import { DevicesService } from '../../devices/devices.service';

const mockCreateRecordDTO = (): CreateRecordDTO => ({
  deviceAddress: '0xabc',
  timestamp: 1234,
  value: 3,
  permitDeadline: Date.now() + 24 * 60 * 60,
  permitSignature: { v: 27, r: '0x12a', s: '0x4b6' },
});

const mockCreateUnsignedRecordDTO = (): CreateRecordDTO => ({
  deviceAddress: '0xabc',
  timestamp: 1234,
  value: 3,
});

const mockRecord = (): Record => ({
  id: '1',
  deviceAddress: '0xabc',
  timestamp: 1234,
  value: 3,
  permitDeadline: Date.now() + 24 * 60 * 60,
  permitSignature: { v: 27, r: '0x12a', s: '0x4b6' },
});

const mockUnsignedRecord = (): Record => ({
  id: '1',
  deviceAddress: '0xabc',
  timestamp: 1234,
  value: 3,
  permitDeadline: null,
  permitSignature: null,
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
  let devicesService: DevicesService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(jest.fn());
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecordsService,
        {
          provide: DevicesService,
          useValue: {
            findDevice: jest.fn(),
            checkDeviceInContract: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            record: {
              create: jest.fn(),
              findMany: jest.fn(),
              findFirst: jest.fn(),
            },
            event: {
              createMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    recordsService = module.get<RecordsService>(RecordsService);
    devicesService = module.get<DevicesService>(DevicesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(recordsService).toBeDefined();
    expect(devicesService).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  describe('storeUnauditedRecord', () => {
    it('should store a signed record successfully', async () => {
      const createRecordDto = mockCreateRecordDTO();
      const record = mockRecord();

      jest.spyOn(devicesService, 'findDevice').mockResolvedValue(mockDevice());
      jest
        .spyOn(recordsService, 'getAuditStatus')
        .mockResolvedValue({ isAuditPending: false });
      jest.spyOn(prismaService.record, 'create').mockResolvedValue(record);

      const result = await recordsService.storeUnauditedRecord(createRecordDto);

      expect(result).toEqual(record);
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

    it('should store an unsigned record successfully', async () => {
      const createRecordDto = mockCreateUnsignedRecordDTO();
      const record = mockUnsignedRecord();

      jest
        .spyOn(recordsService, 'getAuditStatus')
        .mockResolvedValue({ isAuditPending: false });

      jest.spyOn(prismaService.record, 'create').mockResolvedValue(record);

      const result = await recordsService.storeUnauditedRecord(createRecordDto);

      expect(result).toEqual(record);
      expect(prismaService.record.create).toHaveBeenCalledWith({
        data: {
          deviceAddress: createRecordDto.deviceAddress,
          timestamp: createRecordDto.timestamp,
          value: createRecordDto.value,
        },
      });
    });

    it('should store an unsigned record successfully even if audit is pending', async () => {
      const createRecordDto = mockCreateUnsignedRecordDTO();
      const record = mockUnsignedRecord();

      jest
        .spyOn(recordsService, 'getAuditStatus')
        .mockResolvedValue({ isAuditPending: true });

      jest.spyOn(prismaService.record, 'create').mockResolvedValue(record);

      const result = await recordsService.storeUnauditedRecord(createRecordDto);

      expect(result).toEqual(record);
      expect(prismaService.record.create).toHaveBeenCalledWith({
        data: {
          deviceAddress: createRecordDto.deviceAddress,
          timestamp: createRecordDto.timestamp,
          value: createRecordDto.value,
        },
      });
    });

    it('should throw an error if the device is not registered', async () => {
      const createRecordDto = mockCreateRecordDTO();

      jest.spyOn(devicesService, 'findDevice').mockResolvedValue(null);

      await expect(
        recordsService.storeUnauditedRecord(createRecordDto),
      ).rejects.toThrow(new Error(ErrorCodes.DEVICE_NOT_REGISTERED.code));
    });

    it('should throw an error if the audit is pending for the device', async () => {
      const createRecordDto = mockCreateRecordDTO();

      jest.spyOn(devicesService, 'findDevice').mockResolvedValue(mockDevice());
      jest
        .spyOn(recordsService, 'getAuditStatus')
        .mockResolvedValue({ isAuditPending: true });

      await expect(
        recordsService.storeUnauditedRecord(createRecordDto),
      ).rejects.toThrow(new Error(ErrorCodes.AUDIT_NOT_AVAILABLE.code));
    });

    it('should log and throw a database error if Prisma create throws an error', async () => {
      const createRecordDto = mockCreateRecordDTO();

      jest.spyOn(devicesService, 'findDevice').mockResolvedValue(mockDevice());
      jest
        .spyOn(recordsService, 'getAuditStatus')
        .mockResolvedValue({ isAuditPending: false });
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
        where: {
          permitDeadline: {
            gt: expect.any(Number),
          },
          events: { none: {} },
        },
        distinct: ['deviceAddress'],
        orderBy: { timestamp: 'asc' },
        take: MAX_RECORD_BATCH_SIZE,
      });
    });

    it('should log and throw a database error if Prisma throws an error', async () => {
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
          permitDeadline: true,
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
          permitDeadline: true,
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

  describe('getAuditStatus', () => {
    it('should throw an error if the address is not present', async () => {
      jest.spyOn(devicesService, 'findDevice').mockResolvedValue(null);

      await expect(recordsService.getAuditStatus(null)).rejects.toThrow(
        new Error(ErrorCodes.ADDRESS_REQUIRED.code),
      );
    });

    it('should throw an error if the device is not registered', async () => {
      const mockDeviceAddress = mockDevice().address;

      jest.spyOn(devicesService, 'findDevice').mockResolvedValue(null);

      await expect(
        recordsService.getAuditStatus(mockDeviceAddress),
      ).rejects.toThrow(new Error(ErrorCodes.DEVICE_NOT_REGISTERED.code));
    });

    it('should throw an error if the device is not registered in blockchain', async () => {
      const mockDeviceAddress = mockDevice().address;

      jest.spyOn(devicesService, 'findDevice').mockResolvedValue(mockDevice());
      jest
        .spyOn(devicesService, 'checkDeviceInContract')
        .mockRejectedValue(
          new Error(ErrorCodes.DEVICE_NOT_REGISTERED_IN_COOLCHAIN.code),
        );

      await expect(
        recordsService.getAuditStatus(mockDeviceAddress),
      ).rejects.toThrow(
        new Error(ErrorCodes.DEVICE_NOT_REGISTERED_IN_COOLCHAIN.code),
      );
    });

    it('should return available status if no record is under audit for the device', async () => {
      const mockDeviceAddress = mockRecord().deviceAddress;

      jest.spyOn(devicesService, 'findDevice').mockResolvedValue(mockDevice());
      jest
        .spyOn(devicesService, 'checkDeviceInContract')
        .mockResolvedValue(undefined);
      jest.spyOn(prismaService.record, 'findFirst').mockResolvedValue(null);

      const result = await recordsService.getAuditStatus(mockDeviceAddress);

      expect(result.isAuditPending).toBe(false);
      expect(prismaService.record.findFirst).toHaveBeenCalledWith({
        where: {
          permitDeadline: {
            gt: expect.any(Number),
          },
          events: {
            none: {},
          },
          deviceAddress: mockDeviceAddress,
        },
      });
    });

    it('should return pending status if a record is under audit for the device', async () => {
      const record = mockRecord();

      jest.spyOn(devicesService, 'findDevice').mockResolvedValue(mockDevice());
      jest
        .spyOn(devicesService, 'checkDeviceInContract')
        .mockResolvedValue(undefined);
      jest.spyOn(prismaService.record, 'findFirst').mockResolvedValue(record);

      const result = await recordsService.getAuditStatus(record.deviceAddress);

      expect(result.isAuditPending).toBe(true);
      expect(prismaService.record.findFirst).toHaveBeenCalledWith({
        where: {
          permitDeadline: {
            gt: expect.any(Number),
          },
          events: {
            none: {},
          },
          deviceAddress: record.deviceAddress,
        },
      });
    });

    it('should log error and throw an exception if there is a database error', async () => {
      const mockDeviceAddress = mockRecord().deviceAddress;

      jest.spyOn(devicesService, 'findDevice').mockResolvedValue(mockDevice());
      jest
        .spyOn(devicesService, 'checkDeviceInContract')
        .mockResolvedValue(undefined);

      jest
        .spyOn(prismaService.record, 'findFirst')
        .mockRejectedValue(mockDatabaseError());

      await expect(
        recordsService.getAuditStatus(mockDeviceAddress),
      ).rejects.toThrow(mockDatabaseError());

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining(`Error checking audit status:`),
        expect.objectContaining({
          stack: expect.any(String),
          device: mockDeviceAddress,
        }),
      );
    });
  });
});
