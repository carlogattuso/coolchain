import { Device, PrismaService } from './prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';

jest.mock('@prisma/client', () => {
  const originalModule = jest.requireActual('@prisma/client');
  return {
    __esModule: true,
    ...originalModule,
    PrismaClient: jest.fn(() => ({
      device: {
        findMany: jest.fn(),
      },
      $connect: jest.fn(),
    })),
  };
});

describe('PrismaService', () => {
  let service: PrismaService;
  let prisma: PrismaClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
    prisma = new PrismaClient();
  });

  it('should get devices successfully', async () => {
    const expectedResult: Device[] = [
      {
        address: '0x1234',
        name: 'test',
        auditorAddress: '0x5678',
      },
    ];
    prisma.device.findMany.mockResolvedValue(expectedResult);
    await expect(service.getDevices()).resolves.toEqual(expectedResult);
  });
});