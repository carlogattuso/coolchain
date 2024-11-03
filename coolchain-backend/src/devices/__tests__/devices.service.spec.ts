import { Test, TestingModule } from '@nestjs/testing';
import { DevicesService } from '../devices.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Logger } from '@nestjs/common';
import { ErrorCodes } from '../../utils/errors';
import { CreateDeviceInputDTO } from '../types/dto/CreateDeviceInputDTO';
import { DeviceAlreadyExistsError } from '../../utils/types/DeviceAlreadyExistsError';
import { Device } from '../types/Device';

const mockCreateDevicesDTO = (): CreateDeviceInputDTO => ({
  devices: [
    {
      name: 'Device1',
      address: '0x123',
    },
    {
      name: 'Device2',
      address: '0x456',
    },
  ],
});

const mockDatabaseError = (): Error =>
  new Error(ErrorCodes.DATABASE_ERROR.code);

const mockAuditorAddress = (): string => '0x123';

const mockDevice = (): Device => ({
  address: '0xabc',
  name: 'Device 1',
  auditorAddress: '0x1aT',
});

describe('DevicesService', () => {
  let devicesService: DevicesService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(jest.fn());
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DevicesService,
        {
          provide: PrismaService,
          useValue: {
            device: {
              createMany: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
        Logger,
      ],
    }).compile();

    devicesService = module.get<DevicesService>(DevicesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(devicesService).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  describe('createDevice', () => {
    it('should create devices array when no existing device is found', async () => {
      const createDeviceDto = mockCreateDevicesDTO();
      const mockBatchPayload = {
        count: createDeviceDto.devices.length,
      };
      const mockCreationResult = {
        created: createDeviceDto.devices.length,
      };

      jest.spyOn(prismaService.device, 'findMany').mockResolvedValue([]);
      jest
        .spyOn(prismaService.device, 'createMany')
        .mockResolvedValue(mockBatchPayload);

      const result = await devicesService.createDevices(
        mockAuditorAddress(),
        createDeviceDto,
      );

      expect(result).toEqual(mockCreationResult);
      expect(prismaService.device.findMany).toHaveBeenCalledWith({
        where: {
          address: {
            in: createDeviceDto.devices.map((device) => device.address),
          },
        },
        select: {
          address: true,
        },
      });
      expect(prismaService.device.createMany).toHaveBeenCalledWith({
        data: createDeviceDto.devices.map((device) => ({
          auditorAddress: mockAuditorAddress(),
          address: device.address,
          name: device.name,
        })),
      });
    });

    it('should throw an error if the device already exists', async () => {
      const existingDevice = [
        {
          name: 'Device2',
          address: '0x456',
          auditorAddress: mockAuditorAddress(),
        },
      ];
      const mockCreateDevicesDto = mockCreateDevicesDTO();
      const conflictError = new DeviceAlreadyExistsError(
        ErrorCodes.DEVICE_ALREADY_EXISTS.code,
        [mockCreateDevicesDto.devices[1].address],
      );

      jest
        .spyOn(prismaService.device, 'findMany')
        .mockResolvedValue(existingDevice);

      await expect(
        devicesService.createDevices(
          mockAuditorAddress(),
          mockCreateDevicesDto,
        ),
      ).rejects.toThrow(conflictError);
      expect(prismaService.device.findMany).toHaveBeenCalledWith({
        where: {
          address: {
            in: mockCreateDevicesDto.devices.map((device) => device.address),
          },
        },
        select: {
          address: true,
        },
      });
      expect(prismaService.device.createMany).not.toHaveBeenCalled();
    });

    it('should log and throw a database error if there is a database error during findMany', async () => {
      const createDeviceDto = mockCreateDevicesDTO();

      jest
        .spyOn(prismaService.device, 'findMany')
        .mockRejectedValue(mockDatabaseError());

      await expect(
        devicesService.createDevices(mockAuditorAddress(), createDeviceDto),
      ).rejects.toThrow(mockDatabaseError());

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining(`Error retrieving devices:`),
        expect.objectContaining({
          stack: expect.any(String),
          devices: createDeviceDto.devices.map((device) => device.address),
        }),
      );
    });

    it('should log and throw a database if there is a database error during create many', async () => {
      const createDeviceDto = mockCreateDevicesDTO();

      jest.spyOn(prismaService.device, 'findMany').mockResolvedValue([]);
      jest
        .spyOn(prismaService.device, 'createMany')
        .mockRejectedValue(mockDatabaseError());

      await expect(
        devicesService.createDevices(mockAuditorAddress(), createDeviceDto),
      ).rejects.toThrow(mockDatabaseError());

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining(`Error creating devices:`),
        expect.objectContaining({
          stack: expect.any(String),
          auditor: mockAuditorAddress(),
        }),
      );
    });
  });

  describe('getDevices', () => {
    it('should return a list of devices for the auditor', async () => {
      const devices: Device[] = [
        {
          name: 'Device1',
          address: '0x123',
          auditorAddress: mockAuditorAddress(),
        },
        {
          name: 'Device2',
          address: '0x456',
          auditorAddress: mockAuditorAddress(),
        },
      ];

      jest.spyOn(prismaService.device, 'findMany').mockResolvedValue(devices);

      const result = await devicesService.getDevices(mockAuditorAddress());

      expect(result).toEqual(devices);
      expect(prismaService.device.findMany).toHaveBeenCalledWith({
        where: { auditorAddress: mockAuditorAddress() },
        select: {
          address: true,
          name: true,
        },
      });
    });

    it('should log and throw a database error if there is a database error during getDevices', async () => {
      jest
        .spyOn(prismaService.device, 'findMany')
        .mockRejectedValue(mockDatabaseError());

      await expect(
        devicesService.getDevices(mockAuditorAddress()),
      ).rejects.toThrow(mockDatabaseError());

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining(`Error retrieving devices:`),
        expect.objectContaining({
          stack: expect.any(String),
          auditor: mockAuditorAddress(),
        }),
      );
    });
  });

  describe('findDevice', () => {
    it('should return the existing device if found', async () => {
      const mockExistingDevice = mockDevice();
      jest
        .spyOn(prismaService.device, 'findUnique')
        .mockResolvedValue(mockExistingDevice);

      const result = await devicesService.findDevice(
        mockExistingDevice.address,
      );

      expect(result).toEqual(mockExistingDevice);
      expect(prismaService.device.findUnique).toHaveBeenCalledWith({
        where: { address: mockExistingDevice.address },
      });
    });

    it('should return empty device if not found', async () => {
      const mockExistingDevice = mockDevice();
      jest.spyOn(prismaService.device, 'findUnique').mockResolvedValue(null);

      const result = await devicesService.findDevice(
        mockExistingDevice.address,
      );

      expect(result).toEqual(null);
      expect(prismaService.device.findUnique).toHaveBeenCalledWith({
        where: { address: mockExistingDevice.address },
      });
    });

    it('should log an error and throw a database error if find unique fails', async () => {
      const device = mockDevice();
      jest
        .spyOn(prismaService.device, 'findUnique')
        .mockRejectedValue(mockDatabaseError());

      await expect(devicesService.findDevice(device.address)).rejects.toThrow(
        mockDatabaseError(),
      );
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining('Error retrieving device'),
        expect.objectContaining({
          stack: expect.any(String),
          device: device.address,
        }),
      );
    });
  });
});
