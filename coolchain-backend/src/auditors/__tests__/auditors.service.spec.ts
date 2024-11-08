import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ErrorCodes } from '../../utils/errors';
import { AuditorsService } from '../auditors.service';
import { Nonce } from '../../auth/types/Nonce';
import { getQueueToken } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

const mockDatabaseError = (): Error =>
  new Error(ErrorCodes.DATABASE_ERROR.code);

const mockAuditorAddress = '0x123';

const mockNonce = (): Nonce => ({
  nonce: '0xabc',
  issuedAt: new Date().toISOString(),
});

const mockUpdatedAuditor = {
  address: mockAuditorAddress,
  ...mockNonce(),
  isOnboardingPending: true,
};

describe('AuditorsService', () => {
  let auditorsService: AuditorsService;
  let prismaService: PrismaService;
  let auditorQueueMock: jest.Mocked<Queue>;

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(jest.fn());
    auditorQueueMock = {
      add: jest.fn(),
    } as unknown as jest.Mocked<Queue>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditorsService,
        {
          provide: PrismaService,
          useValue: {
            auditor: {
              update: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
        {
          provide: getQueueToken('auditor-queue'),
          useValue: auditorQueueMock,
        },
      ],
    }).compile();

    auditorsService = module.get<AuditorsService>(AuditorsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(auditorsService).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  describe('refreshAuditor', () => {
    it('should update the auditor with a new nonce', async () => {
      const nonce: Nonce = mockNonce();
      jest.spyOn(auditorsService, 'generateNonce').mockResolvedValue(nonce);
      jest
        .spyOn(prismaService.auditor, 'update')
        .mockResolvedValue(mockUpdatedAuditor);

      const result = await auditorsService.refreshAuditor(mockAuditorAddress);
      expect(result).toEqual(mockUpdatedAuditor);
      expect(prismaService.auditor.update).toHaveBeenCalledWith({
        where: { address: mockAuditorAddress },
        data: nonce,
      });
    });

    it('should log an error and throw a database error if update fails', async () => {
      jest.spyOn(auditorsService, 'generateNonce').mockResolvedValue({
        nonce: '0xabc',
        issuedAt: new Date().toISOString(),
      });
      jest
        .spyOn(prismaService.auditor, 'update')
        .mockRejectedValue(mockDatabaseError());

      await expect(
        auditorsService.refreshAuditor(mockAuditorAddress),
      ).rejects.toThrow(mockDatabaseError());
      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining('Error updating nonce'),
        expect.objectContaining({
          stack: expect.any(String),
          auditor: mockAuditorAddress,
        }),
      );
    });
  });

  describe('generateNonce', () => {
    it('should return a valid nonce with issuedAt date in ISO format', async () => {
      const nonce = await auditorsService.generateNonce();
      expect(nonce).toHaveProperty('nonce');
      expect(nonce).toHaveProperty('issuedAt');
      expect(typeof nonce.nonce).toBe('string');
      expect(new Date(nonce.issuedAt).toISOString()).toBe(nonce.issuedAt);
    });
  });

  describe('findOrCreateAuditor', () => {
    const mockNewAuditor = {
      address: mockAuditorAddress,
      ...mockNonce(),
      isOnboardingPending: true,
    };

    it('should return the existing auditor if found', async () => {
      jest
        .spyOn(prismaService.auditor, 'findUnique')
        .mockResolvedValue(mockUpdatedAuditor);

      const result =
        await auditorsService.findOrCreateAuditor(mockAuditorAddress);
      expect(result).toEqual(mockUpdatedAuditor);
      expect(prismaService.auditor.findUnique).toHaveBeenCalledWith({
        where: { address: mockAuditorAddress },
      });
      expect(prismaService.auditor.create).not.toHaveBeenCalled();
    });

    it('should create a new auditor if not found', async () => {
      jest.spyOn(prismaService.auditor, 'findUnique').mockResolvedValue(null);
      jest.spyOn(auditorsService, 'generateNonce').mockResolvedValue({
        nonce: mockNewAuditor.nonce,
        issuedAt: mockNewAuditor.issuedAt,
      });
      jest
        .spyOn(prismaService.auditor, 'create')
        .mockResolvedValue(mockNewAuditor);

      const result =
        await auditorsService.findOrCreateAuditor(mockAuditorAddress);
      expect(result).toEqual(mockNewAuditor);
      expect(prismaService.auditor.create).toHaveBeenCalledWith({
        data: {
          address: mockAuditorAddress,
          nonce: mockNewAuditor.nonce,
          issuedAt: mockNewAuditor.issuedAt,
          isOnboardingPending: mockNewAuditor.isOnboardingPending,
        },
      });
    });

    it('should log an error and throw a database error if creation fails', async () => {
      jest.spyOn(prismaService.auditor, 'findUnique').mockResolvedValue(null);
      jest
        .spyOn(auditorsService, 'generateNonce')
        .mockResolvedValue(mockNonce());
      jest
        .spyOn(prismaService.auditor, 'create')
        .mockRejectedValue(mockDatabaseError());

      await expect(
        auditorsService.findOrCreateAuditor(mockAuditorAddress),
      ).rejects.toThrow(mockDatabaseError());

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining('Error finding or creating auditor'),
        expect.objectContaining({
          stack: expect.any(String),
          auditor: mockAuditorAddress,
        }),
      );
    });
  });

  describe('registerAuditor', () => {
    it('should add a job to the queue with the correct parameters', async () => {
      await auditorsService.registerAuditor(mockAuditorAddress);

      expect(auditorQueueMock.add).toHaveBeenCalledWith(
        'processRegisterAuditor',
        {
          auditorAddress: mockAuditorAddress,
        },
      );
    });

    it('should handle errors when add fails', async () => {
      auditorQueueMock.add.mockRejectedValue(new Error('Queue error'));

      await expect(
        auditorsService.registerAuditor(mockAuditorAddress),
      ).rejects.toThrow(new Error('Queue error'));

      expect(auditorQueueMock.add).toHaveBeenCalledWith(
        'processRegisterAuditor',
        {
          auditorAddress: mockAuditorAddress,
        },
      );
    });
  });
});
