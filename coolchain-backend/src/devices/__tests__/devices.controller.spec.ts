import { Test, TestingModule } from '@nestjs/testing';
import { DevicesController } from '../devices.controller';
import { DevicesService } from '../devices.service';
import { CreateDeviceInputDTO } from '../types/dto/CreateDeviceInputDTO';
import { DeviceDTO } from '../types/dto/DeviceDTO';
import {
  BadRequestException,
  ConflictException,
  ValidationPipe,
} from '@nestjs/common';
import { ErrorCodes } from '../../utils/errors';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '../../auth/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { CreateDeviceOutputDTO } from '../types/dto/CreateDeviceOutputDTO';
import { DeviceAlreadyExistsError } from '../../utils/types/DeviceAlreadyExistsError';

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

const mockAuditorAddress = (): string => '0xabc';
const mockRequest = (_auditorAddress: string) =>
  ({
    auditor: { address: _auditorAddress },
  }) as any;

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
            createDevices: jest.fn(),
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

  describe('registerDevices', () => {
    it('should return the created device when successful', async () => {
      const mockInput = mockCreateDevicesDTO();
      const mockCreationResult: CreateDeviceOutputDTO = {
        created: mockInput.devices.length,
      };

      jest
        .spyOn(devicesService, 'createDevices')
        .mockResolvedValue(mockCreationResult);

      const result = await devicesController.registerDevices(
        mockRequest(mockAuditorAddress()),
        mockInput,
      );

      expect(result).toEqual(mockCreationResult);
      expect(devicesService.createDevices).toHaveBeenCalledWith(
        mockAuditorAddress(),
        mockCreateDevicesDTO(),
      );
    });

    it('should throw ConflictException if device already exists', async () => {
      const mockInput = mockCreateDevicesDTO();
      const conflictError = new DeviceAlreadyExistsError(
        ErrorCodes.DEVICE_ALREADY_EXISTS.code,
        mockInput.devices.map((device) => device.address),
      );
      jest
        .spyOn(devicesService, 'createDevices')
        .mockRejectedValue(conflictError);

      await expect(
        devicesController.registerDevices(
          mockRequest(mockAuditorAddress()),
          mockInput,
        ),
      ).rejects.toThrow(ConflictException);
      expect(devicesService.createDevices).toHaveBeenCalledWith(
        mockAuditorAddress(),
        mockInput,
      );
    });

    it('should return BadRequestException when validation fails', async () => {
      const invalidDto = {
        address: new Date(),
        name: 1234,
      };

      const validationPipe = new ValidationPipe();

      try {
        await validationPipe.transform(invalidDto, {
          type: 'body',
          metatype: CreateDeviceInputDTO,
        });
      } catch (error) {
        expect(error.status).toBe(400);
        expect(error.getResponse().message).toEqual([
          'devices must be an array',
        ]);
      }
    });

    it('should return BadRequestException when nested validation fails', async () => {
      const invalidDto = {
        devices: [
          {
            address: new Date(),
            name: 1234,
          },
        ],
      };

      const validationPipe = new ValidationPipe();

      try {
        await validationPipe.transform(invalidDto, {
          type: 'body',
          metatype: CreateDeviceInputDTO,
        });
      } catch (error) {
        expect(error.status).toBe(400);
        expect(error.getResponse().message).toEqual([
          'devices.0.address must be an Ethereum address',
          'devices.0.name must be a string',
        ]);
      }
    });

    it('should throw BadRequestException for any other error', async () => {
      const mockInput = mockCreateDevicesDTO();
      jest
        .spyOn(devicesService, 'createDevices')
        .mockRejectedValue(new Error('Unexpected error'));

      await expect(
        devicesController.registerDevices(
          mockRequest(mockAuditorAddress()),
          mockInput,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(devicesService.createDevices).toHaveBeenCalledWith(
        mockAuditorAddress(),
        mockInput,
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
