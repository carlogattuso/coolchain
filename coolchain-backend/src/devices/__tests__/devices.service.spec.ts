import { Test, TestingModule } from '@nestjs/testing';
import { DevicesService } from '../devices.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Logger } from '@nestjs/common';
import { ErrorCodes } from '../../utils/errors';
import { CreateDeviceDTO } from '../types/dto/CreateDeviceDTO';
import { Device } from '../types/Device';

const mockDevice = (): Device => ({
  name: 'Device1',
  address: '0xabc',
  auditorAddress: '0x123',
});

const mockCreateDeviceDTO = (): CreateDeviceDTO => ({
  name: 'Device1',
  address: '0xabc',
});

const mockDatabaseError = (): Error =>
  new Error(ErrorCodes.DATABASE_ERROR.code);

const mockAuditorAddress = (): string => '0x123';

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
              findUnique: jest.fn(),
              create: jest.fn(),
              findMany: jest.fn(),
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
    it('should create a device when no existing device is found', async () => {
      const createDeviceDto = mockCreateDeviceDTO();
      const device = mockDevice();

      jest.spyOn(prismaService.device, 'findUnique').mockResolvedValue(null);
      jest
        .spyOn(prismaService.device, 'create')
        .mockResolvedValue(mockDevice());

      const result = await devicesService.createDevice(
        mockAuditorAddress(),
        createDeviceDto,
      );

      expect(result).toEqual(device);
      expect(prismaService.device.findUnique).toHaveBeenCalledWith({
        where: { address: createDeviceDto.address },
      });
      expect(prismaService.device.create).toHaveBeenCalledWith({
        data: {
          auditorAddress: mockAuditorAddress(),
          address: createDeviceDto.address,
          name: createDeviceDto.name,
        },
        select: {
          address: true,
          name: true,
        },
      });
    });

    it('should throw an error if the device already exists', async () => {
      const existingDevice: Device = mockDevice();
      const createDeviceDto = mockCreateDeviceDTO();

      jest
        .spyOn(prismaService.device, 'findUnique')
        .mockResolvedValue(existingDevice);

      await expect(
        devicesService.createDevice(mockAuditorAddress(), createDeviceDto),
      ).rejects.toThrow(new Error(ErrorCodes.DEVICE_ALREADY_EXISTS.code));
      expect(prismaService.device.findUnique).toHaveBeenCalledWith({
        where: { address: createDeviceDto.address },
      });
      expect(prismaService.device.create).not.toHaveBeenCalled();
    });

    it('should log and throw a database error if there is a database error during findUnique', async () => {
      const createDeviceDto = mockCreateDeviceDTO();

      jest
        .spyOn(prismaService.device, 'findUnique')
        .mockRejectedValue(mockDatabaseError());

      await expect(
        devicesService.createDevice(
          mockAuditorAddress(),
          mockCreateDeviceDTO(),
        ),
      ).rejects.toThrow(mockDatabaseError());

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining(`Error retrieving device:`),
        expect.objectContaining({
          stack: expect.any(String),
          device: createDeviceDto.address,
        }),
      );
    });

    it('should log and throw a database if there is a database error during create', async () => {
      const createDeviceDto = mockCreateDeviceDTO();

      jest.spyOn(prismaService.device, 'findUnique').mockResolvedValue(null);
      jest
        .spyOn(prismaService.device, 'create')
        .mockRejectedValue(mockDatabaseError());

      await expect(
        devicesService.createDevice(mockAuditorAddress(), createDeviceDto),
      ).rejects.toThrow(mockDatabaseError());

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining(`Error creating device:`),
        expect.objectContaining({
          stack: expect.any(String),
          auditor: mockAuditorAddress(),
        }),
      );
    });
  });

  describe('getDevices', () => {
    it('should return a list of devices for the auditor', async () => {
      const devices: Device[] = [mockDevice()];

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
});
