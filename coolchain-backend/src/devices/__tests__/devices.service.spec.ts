import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ErrorCodes } from '../../utils/errors';
import { CreateDeviceInputDTO } from '../types/dto/CreateDeviceInputDTO';
import { DevicesService } from '../devices.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BlockchainService } from '../../blockchain/blockchain.service';
import { Queue } from 'bullmq';
import { getQueueToken } from '@nestjs/bullmq';
import { DeviceAlreadyExistsError } from '../../utils/types/DeviceAlreadyExistsError';

const mockAuditorAddress = '0x123';
const mockDeviceAddress = '0x456';
const mockDeviceName = 'Test Device';

const mockDatabaseError = (): Error =>
  new Error(ErrorCodes.DATABASE_ERROR.code);

const mockCreateDeviceInput: CreateDeviceInputDTO = {
  devices: [
    {
      address: mockDeviceAddress,
      name: mockDeviceName,
    },
  ],
};

const mockDevice = {
  address: mockDeviceAddress,
  name: mockDeviceName,
  auditorAddress: mockAuditorAddress,
};

describe('DevicesService', () => {
  let devicesService: DevicesService;
  let prismaService: PrismaService;
  let blockchainService: BlockchainService;
  let devicesQueueMock: jest.Mocked<Queue>;

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(jest.fn());
    devicesQueueMock = {
      add: jest.fn(),
    } as unknown as jest.Mocked<Queue>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DevicesService,
        {
          provide: PrismaService,
          useValue: {
            device: {
              findMany: jest.fn(),
              createMany: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: BlockchainService,
          useValue: {
            checkDevice: jest.fn(),
          },
        },
        {
          provide: getQueueToken('devices-queue'),
          useValue: devicesQueueMock,
        },
      ],
    }).compile();

    devicesService = module.get<DevicesService>(DevicesService);
    prismaService = module.get<PrismaService>(PrismaService);
    blockchainService = module.get<BlockchainService>(BlockchainService);
  });

  it('should be defined', () => {
    expect(devicesService).toBeDefined();
    expect(prismaService).toBeDefined();
    expect(blockchainService).toBeDefined();
  });

  describe('createDevices', () => {
    it('should create new devices successfully', async () => {
      jest.spyOn(prismaService.device, 'findMany').mockResolvedValue([]);
      jest
        .spyOn(prismaService.device, 'createMany')
        .mockResolvedValue({ count: 1 });
      jest.spyOn(devicesService, 'registerDevice').mockResolvedValue();

      const result = await devicesService.createDevices(
        mockAuditorAddress,
        mockCreateDeviceInput,
      );

      expect(result).toEqual({ created: 1 });
      expect(prismaService.device.findMany).toHaveBeenCalledWith({
        where: {
          address: {
            in: [mockDeviceAddress],
          },
        },
        select: {
          address: true,
        },
      });
      expect(prismaService.device.createMany).toHaveBeenCalledWith({
        data: [
          {
            auditorAddress: mockAuditorAddress,
            address: mockDeviceAddress,
            name: mockDeviceName,
          },
        ],
      });
    });

    it('should throw DeviceAlreadyExistsError if device exists', async () => {
      jest
        .spyOn(prismaService.device, 'findMany')
        .mockResolvedValue([mockDevice]);

      await expect(
        devicesService.createDevices(mockAuditorAddress, mockCreateDeviceInput),
      ).rejects.toThrow(DeviceAlreadyExistsError);
    });

    it('should log and throw database error if findMany fails', async () => {
      jest
        .spyOn(prismaService.device, 'findMany')
        .mockRejectedValue(mockDatabaseError());

      await expect(
        devicesService.createDevices(mockAuditorAddress, mockCreateDeviceInput),
      ).rejects.toThrow(ErrorCodes.DATABASE_ERROR.code);
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining('Error retrieving devices'),
        expect.objectContaining({
          stack: expect.any(String),
          devices: mockCreateDeviceInput.devices.map(
            (device) => device.address,
          ),
        }),
      );
    });

    it('should log and throw database error if creation fails', async () => {
      jest.spyOn(prismaService.device, 'findMany').mockResolvedValue([]);
      jest
        .spyOn(prismaService.device, 'createMany')
        .mockRejectedValue(mockDatabaseError());

      await expect(
        devicesService.createDevices(mockAuditorAddress, mockCreateDeviceInput),
      ).rejects.toThrow(ErrorCodes.DATABASE_ERROR.code);

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining('Error creating devices'),
        expect.objectContaining({
          stack: expect.any(String),
          auditor: mockAuditorAddress,
        }),
      );
    });
  });

  describe('getDevices', () => {
    it('should return devices for auditor', async () => {
      const mockDevices = [mockDevice];
      jest
        .spyOn(prismaService.device, 'findMany')
        .mockResolvedValue(mockDevices);

      const result = await devicesService.getDevices(mockAuditorAddress);

      expect(result).toEqual(mockDevices);
      expect(prismaService.device.findMany).toHaveBeenCalledWith({
        where: {
          auditorAddress: mockAuditorAddress,
        },
        select: {
          address: true,
          name: true,
        },
      });
    });

    it('should throw database error if query fails', async () => {
      jest
        .spyOn(prismaService.device, 'findMany')
        .mockRejectedValue(mockDatabaseError());

      await expect(
        devicesService.getDevices(mockAuditorAddress),
      ).rejects.toThrow(ErrorCodes.DATABASE_ERROR.code);
    });
  });

  describe('findDevice', () => {
    it('should return device if found', async () => {
      jest
        .spyOn(prismaService.device, 'findUnique')
        .mockResolvedValue(mockDevice);

      const result = await devicesService.findDevice(mockDeviceAddress);

      expect(result).toEqual(mockDevice);
      expect(prismaService.device.findUnique).toHaveBeenCalledWith({
        where: { address: mockDeviceAddress },
      });
    });

    it('should throw database error if query fails', async () => {
      jest
        .spyOn(prismaService.device, 'findUnique')
        .mockRejectedValue(mockDatabaseError());

      await expect(
        devicesService.findDevice(mockDeviceAddress),
      ).rejects.toThrow(ErrorCodes.DATABASE_ERROR.code);

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining('Error retrieving device'),
        expect.objectContaining({
          stack: expect.any(String),
          device: mockDeviceAddress,
        }),
      );
    });
  });

  describe('registerDevice', () => {
    it('should add a job to the queue with correct parameters', async () => {
      await devicesService.registerDevice(
        mockAuditorAddress,
        mockDeviceAddress,
      );

      expect(devicesQueueMock.add).toHaveBeenCalledWith(
        'processRegisterDevice',
        {
          auditorAddress: mockAuditorAddress,
          deviceAddress: mockDeviceAddress,
        },
      );
    });

    it('should handle errors when add fails', async () => {
      devicesQueueMock.add.mockRejectedValue(new Error('Queue error'));

      await expect(
        devicesService.registerDevice(mockAuditorAddress, mockDeviceAddress),
      ).rejects.toThrow(new Error('Queue error'));

      expect(devicesQueueMock.add).toHaveBeenCalledWith(
        'processRegisterDevice',
        {
          auditorAddress: mockAuditorAddress,
          deviceAddress: mockDeviceAddress,
        },
      );
    });
  });

  describe('checkDeviceInContract', () => {
    it('should check device in contract successfully', async () => {
      jest.spyOn(blockchainService, 'checkDevice').mockResolvedValue(true);

      await devicesService.checkDeviceInContract(mockDeviceAddress);

      expect(blockchainService.checkDevice).toHaveBeenCalledWith(
        mockDeviceAddress,
      );
    });

    it('should throw error if device check fails', async () => {
      jest
        .spyOn(blockchainService, 'checkDevice')
        .mockRejectedValue(new Error());

      await expect(
        devicesService.checkDeviceInContract(mockDeviceAddress),
      ).rejects.toThrow(ErrorCodes.DEVICE_NOT_REGISTERED_IN_COOLCHAIN.code);
    });
  });
});
