import { PrismaService } from '../prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

jest.mock('./prisma.service');

describe('PrismaService', () => {
  let prismaService: PrismaService;

  beforeEach(() => {
    prismaService = new PrismaService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRecordsWithEvents', () => {
    it('should return records without a device address', async () => {
      const expectedRecords = [
        {
          id: 1,
          deviceAddress: 'device1',
          timestamp: new Date(),
          value: 'value1',
          events: [],
        },
        {
          id: 2,
          deviceAddress: 'device2',
          timestamp: new Date(),
          value: 'value2',
          events: [],
        },
      ];

      prismaService.record.findMany = jest
        .fn()
        .mockResolvedValue(expectedRecords);

      const result = await prismaService.getRecordsWithEvents('');

      expect(prismaService.record.findMany).toHaveBeenCalledWith({
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
      expect(result).toEqual(expectedRecords);
    });

    it('should return records with a device address', async () => {
      const deviceAddress = 'device1';
      const expectedRecords = [
        {
          id: 1,
          deviceAddress: 'device1',
          timestamp: new Date(),
          value: 'value1',
          events: [],
        },
      ];

      prismaService.record.findMany = jest
        .fn()
        .mockResolvedValue(expectedRecords);

      const result = await prismaService.getRecordsWithEvents(deviceAddress);

      expect(prismaService.record.findMany).toHaveBeenCalledWith({
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
        where: { deviceAddress },
      });
      expect(result).toEqual(expectedRecords);
    });

    it('should handle errors', async () => {
      const errorMessage = 'Could not fetch records with events';
      prismaService.record.findMany = jest.fn().mockRejectedValue(
        new PrismaClientKnownRequestError(errorMessage, {
          code: 'P2002',
          clientVersion: '4.1.0',
        }),
      );

      await expect(prismaService.getRecordsWithEvents('')).rejects.toThrow(
        errorMessage,
      );
    });
  });
});
