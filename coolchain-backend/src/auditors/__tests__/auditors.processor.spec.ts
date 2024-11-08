import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { AuditorsProcessor } from '../auditors.processor';
import { PrismaService } from '../../prisma/prisma.service';
import { BlockchainService } from '../../blockchain/blockchain.service';
import { Job } from 'bullmq';
import { ErrorCodes } from '../../utils/errors';
import { Auditor } from '@prisma/client';
import { ContractTransactionReceipt } from 'ethers';

const mockAuditorAddress = '0x123';
const mockAuditorInDB: Auditor = {
  address: mockAuditorAddress,
  nonce: '0xabc',
  issuedAt: new Date().toISOString(),
  isOnboardingPending: true,
};

const mockTransactionReceipt = {
  to: mockAuditorAddress,
  from: '0xabc',
  status: 1,
} as unknown as ContractTransactionReceipt;

describe('AuditorsProcessor', () => {
  let auditorsProcessor: AuditorsProcessor;
  let prismaService: PrismaService;
  let blockchainService: BlockchainService;

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(jest.fn());
    jest.spyOn(Logger.prototype, 'log').mockImplementation(jest.fn());

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditorsProcessor,
        {
          provide: PrismaService,
          useValue: {
            auditor: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: BlockchainService,
          useValue: {
            registerAuditor: jest.fn(),
          },
        },
      ],
    }).compile();

    auditorsProcessor = module.get<AuditorsProcessor>(AuditorsProcessor);
    prismaService = module.get<PrismaService>(PrismaService);
    blockchainService = module.get<BlockchainService>(BlockchainService);
  });

  describe('process', () => {
    it('should call registerAuditor when job name is processRegisterAuditor', async () => {
      const job = {
        name: 'processRegisterAuditor',
        data: { auditorAddress: mockAuditorAddress },
      } as Job;

      const registerAuditorSpy = jest
        .spyOn(auditorsProcessor, 'registerAuditor')
        .mockResolvedValue(mockTransactionReceipt);

      await auditorsProcessor.process(job);

      expect(registerAuditorSpy).toHaveBeenCalledWith(mockAuditorAddress);
    });
  });

  describe('registerAuditor', () => {
    it('should find the auditor and register in blockchain if onboarding is pending', async () => {
      jest
        .spyOn(prismaService.auditor, 'findUnique')
        .mockResolvedValue(mockAuditorInDB);
      jest
        .spyOn(blockchainService, 'registerAuditor')
        .mockResolvedValue(mockTransactionReceipt);
      const updateSpy = jest
        .spyOn(prismaService.auditor, 'update')
        .mockResolvedValue({
          ...mockAuditorInDB,
          isOnboardingPending: false,
        });

      const result =
        await auditorsProcessor.registerAuditor(mockAuditorAddress);

      expect(result).toEqual(mockTransactionReceipt);
      expect(prismaService.auditor.findUnique).toHaveBeenCalledWith({
        where: { address: mockAuditorAddress, isOnboardingPending: true },
      });
      expect(blockchainService.registerAuditor).toHaveBeenCalledWith({
        address: mockAuditorAddress,
      });
      expect(updateSpy).toHaveBeenCalledWith({
        where: { address: mockAuditorAddress },
        data: { isOnboardingPending: false },
      });
      expect(Logger.prototype.log).toHaveBeenCalledWith(
        'Successfully registered auditor ',
        mockAuditorAddress,
      );
    });

    it('should log an error and throw a database error if findUnique fails', async () => {
      jest
        .spyOn(prismaService.auditor, 'findUnique')
        .mockRejectedValue(new Error(ErrorCodes.DATABASE_ERROR.code));

      await expect(
        auditorsProcessor.registerAuditor(mockAuditorAddress),
      ).rejects.toThrow(ErrorCodes.DATABASE_ERROR.code);

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining('Error finding auditor'),
        expect.objectContaining({
          stack: expect.any(String),
          auditor: mockAuditorAddress,
        }),
      );
    });

    it('should log an error and throw a registration error if blockchain registration fails', async () => {
      jest
        .spyOn(prismaService.auditor, 'findUnique')
        .mockResolvedValue(mockAuditorInDB);
      jest
        .spyOn(blockchainService, 'registerAuditor')
        .mockRejectedValue(
          new Error(ErrorCodes.AUDITOR_REGISTRATION_ERROR.code),
        );

      await expect(
        auditorsProcessor.registerAuditor(mockAuditorAddress),
      ).rejects.toThrow(ErrorCodes.AUDITOR_REGISTRATION_ERROR.code);

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining('Error registering auditor'),
      );
    });

    it('should log an error if no auditor is found with pending onboarding', async () => {
      jest.spyOn(prismaService.auditor, 'findUnique').mockResolvedValue(null);

      await auditorsProcessor.registerAuditor(mockAuditorAddress);

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining(`Error finding auditor: ${mockAuditorAddress}`),
      );
    });
  });
});
