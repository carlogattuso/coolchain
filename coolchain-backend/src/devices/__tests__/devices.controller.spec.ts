import { Test, TestingModule } from '@nestjs/testing';
import { DevicesController } from '../devices.controller';
import { DevicesService } from '../devices.service';
import { CreateDeviceDTO } from '../types/dto/CreateDeviceDTO';
import { DeviceDTO } from '../types/dto/DeviceDTO';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { ErrorCodes } from '../../utils/errors';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '../../auth/auth.guard';
import { JwtService } from '@nestjs/jwt';

describe('DevicesController', () => {
  let devicesController: DevicesController;
  let devicesService: DevicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DevicesController],
      providers: [
        {
          provide: DevicesService,
          useValue: {
            createDevice: jest.fn(),
            getDevices: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mockedJwtToken'),
            verify: jest.fn().mockReturnValue({}),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'JWT_SECRET') {
                return 'mockedSecret';
              }
            }),
          },
        },
        {
          provide: AuthGuard,
          useValue: {
            canActivate: jest.fn().mockReturnValue(true),
          },
        },
      ],
    }).compile();

    devicesController = module.get<DevicesController>(DevicesController);
    devicesService = module.get<DevicesService>(DevicesService);
  });

  it('should be defined', () => {
    expect(devicesController).toBeDefined();
    expect(devicesService).toBeDefined();
  });

  describe('createDevice', () => {
    it('should return the created device when successful', async () => {
      const auditorAddress = '0x123';
      const createDeviceDTO: CreateDeviceDTO = {
        name: 'Device1',
        address: '0xabc',
      };

      const mockRequest = {
        auditor: { address: auditorAddress },
      } as any;

      const createdDevice = { ...createDeviceDTO };
      jest
        .spyOn(devicesService, 'createDevice')
        .mockResolvedValue(createdDevice);

      const result = await devicesController.createDevice(
        mockRequest,
        createDeviceDTO,
      );

      expect(result).toEqual(createdDevice);
      expect(devicesService.createDevice).toHaveBeenCalledWith(
        auditorAddress,
        createDeviceDTO,
      );
    });

    it('should throw ConflictException if device already exists', async () => {
      const auditorAddress = '0x123';
      const createDeviceDTO: CreateDeviceDTO = {
        name: 'Device1',
        address: '0xabc',
      };

      const mockRequest = {
        auditor: { address: auditorAddress },
      } as any;

      jest
        .spyOn(devicesService, 'createDevice')
        .mockRejectedValue(new Error(ErrorCodes.DEVICE_ALREADY_EXISTS.code));

      await expect(
        devicesController.createDevice(mockRequest, createDeviceDTO),
      ).rejects.toThrow(ConflictException);
      expect(devicesService.createDevice).toHaveBeenCalledWith(
        auditorAddress,
        createDeviceDTO,
      );
    });

    it('should throw BadRequestException for any other error', async () => {
      const auditorAddress = '0x123';
      const createDeviceDTO: CreateDeviceDTO = {
        name: 'Device1',
        address: '0xabc',
      };

      const mockRequest = {
        auditor: { address: auditorAddress },
      } as any;

      jest
        .spyOn(devicesService, 'createDevice')
        .mockRejectedValue(new Error('Unexpected error'));

      await expect(
        devicesController.createDevice(mockRequest, createDeviceDTO),
      ).rejects.toThrow(BadRequestException);
      expect(devicesService.createDevice).toHaveBeenCalledWith(
        auditorAddress,
        createDeviceDTO,
      );
    });
  });

  describe('getDevices', () => {
    it('should return the list of devices for the auditor', async () => {
      const auditorAddress = '0x123';
      const mockRequest = {
        auditor: { address: auditorAddress },
      } as any;

      const devices: DeviceDTO[] = [
        { address: '0x123', name: 'Device1' },
        { address: '0x456', name: 'Device2' },
      ];

      jest.spyOn(devicesService, 'getDevices').mockResolvedValue(devices);

      const result = await devicesController.getDevices(mockRequest);

      expect(result).toEqual(devices);
      expect(devicesService.getDevices).toHaveBeenCalledWith(auditorAddress);
    });

    it('should throw BadRequestException if there is an error', async () => {
      const auditorAddress = '0x123';
      const mockRequest = {
        auditor: { address: auditorAddress },
      } as any;

      jest
        .spyOn(devicesService, 'getDevices')
        .mockRejectedValue(new Error('Unexpected error'));

      await expect(devicesController.getDevices(mockRequest)).rejects.toThrow(
        BadRequestException,
      );
      expect(devicesService.getDevices).toHaveBeenCalledWith(auditorAddress);
    });
  });
});
