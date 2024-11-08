import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { DevicesProcessor } from '../devices.processor';
import { PrismaService } from '../../prisma/prisma.service';
import { BlockchainService } from '../../blockchain/blockchain.service';
import { Job } from 'bullmq';
import { ErrorCodes } from '../../utils/errors';
import { ContractTransactionReceipt } from 'ethers';
import { Device } from '../types/Device';

const mockAuditorAddress = '0xabc';
const mockDeviceAddress = '0x123';
const mockDeviceInDB: Device = {
  address: mockDeviceAddress,
  name: 'Device 01',
  auditorAddress: mockAuditorAddress,
};

const mockTransactionReceipt = {
  to: mockDeviceAddress,
  from: '0x456',
  status: 1,
} as unknown as ContractTransactionReceipt;

describe('DevicesProcessor', () => {
  let devicesProcessor: DevicesProcessor;
  let prismaService: PrismaService;
  let blockchainService: BlockchainService;

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(jest.fn());
    jest.spyOn(Logger.prototype, 'log').mockImplementation(jest.fn());

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DevicesProcessor,
        {
          provide: PrismaService,
          useValue: {
            device: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: BlockchainService,
          useValue: {
            registerDevice: jest.fn(),
          },
        },
      ],
    }).compile();

    devicesProcessor = module.get<DevicesProcessor>(DevicesProcessor);
    prismaService = module.get<PrismaService>(PrismaService);
    blockchainService = module.get<BlockchainService>(BlockchainService);
  });

  describe('process', () => {
    it('should call registerDevice when job name is processRegisterDevice', async () => {
      const job = {
        name: 'processRegisterDevice',
        data: {
          auditorAddress: mockAuditorAddress,
          deviceAddress: mockDeviceAddress,
        },
      } as Job;

      const registerDeviceSpy = jest
        .spyOn(devicesProcessor, 'registerDevice')
        .mockResolvedValue(mockTransactionReceipt);

      await devicesProcessor.process(job);

      expect(registerDeviceSpy).toHaveBeenCalledWith(
        mockAuditorAddress,
        mockDeviceAddress,
      );
    });
  });

  describe('registerDevice', () => {
    it('should find the device and register in blockchain if onboarding is pending', async () => {
      jest
        .spyOn(prismaService.device, 'findUnique')
        .mockResolvedValue(mockDeviceInDB);
      jest
        .spyOn(blockchainService, 'registerDevice')
        .mockResolvedValue(mockTransactionReceipt);

      const result = await devicesProcessor.registerDevice(
        mockAuditorAddress,
        mockDeviceAddress,
      );

      expect(result).toEqual(mockTransactionReceipt);
      expect(prismaService.device.findUnique).toHaveBeenCalledWith({
        where: {
          address: mockDeviceAddress,
          auditorAddress: mockAuditorAddress,
        },
      });
      expect(blockchainService.registerDevice).toHaveBeenCalledWith(
        mockAuditorAddress,
        mockDeviceAddress,
      );
      expect(Logger.prototype.log).toHaveBeenCalledWith(
        'Successfully registered device ',
        mockDeviceAddress,
      );
    });

    it('should log an error and throw a database error if findUnique fails', async () => {
      jest
        .spyOn(prismaService.device, 'findUnique')
        .mockRejectedValue(new Error(ErrorCodes.DATABASE_ERROR.code));

      await expect(
        devicesProcessor.registerDevice(mockAuditorAddress, mockDeviceAddress),
      ).rejects.toThrow(ErrorCodes.DATABASE_ERROR.code);

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining('Error finding device'),
        expect.objectContaining({
          stack: expect.any(String),
          device: mockDeviceAddress,
        }),
      );
    });

    it('should log an error and throw a registration error if blockchain registration fails', async () => {
      jest
        .spyOn(prismaService.device, 'findUnique')
        .mockResolvedValue(mockDeviceInDB);
      jest
        .spyOn(blockchainService, 'registerDevice')
        .mockRejectedValue(
          new Error(ErrorCodes.DEVICE_REGISTRATION_ERROR.code),
        );

      await expect(
        devicesProcessor.registerDevice(mockAuditorAddress, mockDeviceAddress),
      ).rejects.toThrow(ErrorCodes.DEVICE_REGISTRATION_ERROR.code);

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining('Error registering device'),
      );
    });

    it('should log an error if no device is found with pending onboarding', async () => {
      jest.spyOn(prismaService.device, 'findUnique').mockResolvedValue(null);

      await devicesProcessor.registerDevice(
        mockAuditorAddress,
        mockDeviceAddress,
      );

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining(`Error finding device: ${mockDeviceAddress}`),
      );
    });
  });
});
