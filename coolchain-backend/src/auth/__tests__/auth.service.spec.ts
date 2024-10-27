import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { AuditorsService } from '../../auditors/auditors.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MessageDTO } from '../types/dto/MessageDTO';
import { ErrorCodes } from '../../utils/errors';
import { verifyMessage } from 'ethers';
import { AUTH_EXPIRATION_TIMEOUT } from '../../utils/constants';
import { Logger } from '@nestjs/common';
import { Nonce } from '../types/Nonce';
import { PrismaService } from '../../prisma/prisma.service';
import { SignInDTO } from '../types/dto/SignInDTO';
import { JwtDTO } from '../types/dto/JwtDTO';

const mockAuditorAddress = '0x123';

const mockNonce = (): Nonce => ({
  nonce: '0xabc',
  issuedAt: new Date().toISOString(),
});

const mockAuditor = {
  address: mockAuditorAddress,
  ...mockNonce(),
  isOnboardingPending: true,
};

const mockSignInDTO = (): SignInDTO => ({
  auditorAddress: '0x123',
  signature: 'signature',
});

const mockSIWEMessage = (_at: string): string => {
  return (
    `dapp wants you to sign in with your Ethereum account:\n` +
    `0x123\n\n` +
    `I accept the MetaMask Terms of Service: https://community.metamask.io/tos\n\n` +
    `URI: dapp\nVersion: 1\nChain ID: mockChain\nNonce: 0xabc\n` +
    `Issued At: ${_at}`
  );
};

jest.mock('ethers', () => ({
  ...jest.requireActual('ethers'),
  verifyMessage: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let auditorsService: AuditorsService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(jest.fn());
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AuditorsService,
          useValue: {
            refreshAuditor: jest.fn(),
            findOrCreateAuditor: jest.fn(),
          },
        },
        JwtService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'ORIGIN') return 'dapp';
              if (key === 'CHAIN_ID') return 'mockChain';
            }),
          },
        },
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
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    auditorsService = module.get<AuditorsService>(AuditorsService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
    expect(auditorsService).toBeDefined();
    expect(jwtService).toBeDefined();
    expect(configService).toBeDefined();
    expect(prismaService).toBeDefined();
    expect(authService['domain']).toEqual('dapp');
    expect(authService['chainId']).toEqual('mockChain');
  });

  describe('generateMessageToSign', () => {
    it('should return a message if auditor exists or is created', async () => {
      jest
        .spyOn(auditorsService, 'findOrCreateAuditor')
        .mockResolvedValue(mockAuditor);
      jest.spyOn(authService, 'hasNonceExpired').mockReturnValue(false);

      const result: MessageDTO =
        await authService.generateMessageToSign(mockAuditorAddress);

      expect(result.message).toContain(mockSIWEMessage(mockAuditor.issuedAt));
      expect(auditorsService.findOrCreateAuditor).toHaveBeenCalledWith(
        mockAuditor.address,
      );
      expect(authService.hasNonceExpired).toHaveBeenCalledWith(
        mockAuditor.issuedAt,
      );
    });

    it('should refresh nonce if it has expired', async () => {
      const issuedAt = new Date(
        Date.now() - AUTH_EXPIRATION_TIMEOUT - 1000,
      ).toISOString();
      const refreshedAuditor = {
        address: mockAuditorAddress,
        nonce: mockNonce().nonce,
        issuedAt,
        isOnboardingPending: true,
      };

      jest
        .spyOn(auditorsService, 'findOrCreateAuditor')
        .mockResolvedValue(refreshedAuditor);
      jest.spyOn(authService, 'hasNonceExpired').mockReturnValue(true);
      jest
        .spyOn(auditorsService, 'refreshAuditor')
        .mockResolvedValue(refreshedAuditor);

      const result =
        await authService.generateMessageToSign(mockAuditorAddress);

      expect(auditorsService.refreshAuditor).toHaveBeenCalledWith(
        mockAuditorAddress,
      );
      expect(result.message).toContain(
        mockSIWEMessage(refreshedAuditor.issuedAt),
      );
    });

    it('should throw an error if no address is provided', async () => {
      await expect(authService.generateMessageToSign('')).rejects.toThrow(
        ErrorCodes.ADDRESS_REQUIRED.code,
      );
    });
  });

  describe('signIn', () => {
    it('should return a session token on successful signIn', async () => {
      jest
        .spyOn(auditorsService, 'findOrCreateAuditor')
        .mockResolvedValue(mockAuditor);
      jest.spyOn(authService, 'hasNonceExpired').mockReturnValue(false);
      (verifyMessage as jest.Mock).mockReturnValue(
        mockSignInDTO().auditorAddress,
      );
      jwtService.sign = jest.fn().mockReturnValue('jwt-token');

      const result: JwtDTO = await authService.signIn(mockSignInDTO());

      expect(result.accessToken).toBe('jwt-token');
      expect(auditorsService.refreshAuditor).toHaveBeenCalledWith(
        mockSignInDTO().auditorAddress,
      );
    });

    it('should throw an error if address or signature are missing', async () => {
      const signInDto = { auditorAddress: '', signature: '' };

      await expect(authService.signIn(signInDto)).rejects.toThrow(
        ErrorCodes.BAD_SIGN_IN_REQUEST.code,
      );
    });

    it('should throw an error if the recovered address does not match', async () => {
      jest
        .spyOn(auditorsService, 'findOrCreateAuditor')
        .mockResolvedValue(mockAuditor);
      (verifyMessage as jest.Mock).mockReturnValue('wrongAuditorAddress');

      expect(auditorsService.refreshAuditor).not.toHaveBeenCalled();
      await expect(authService.signIn(mockSignInDTO())).rejects.toThrow(
        ErrorCodes.UNAUTHORIZED.code,
      );
    });

    it('should throw an error if the auditor does not exist', async () => {
      jest
        .spyOn(auditorsService, 'findOrCreateAuditor')
        .mockResolvedValue(null);
      (verifyMessage as jest.Mock).mockReturnValue('wrongAuditorAddress');

      expect(auditorsService.refreshAuditor).not.toHaveBeenCalled();
      await expect(authService.signIn(mockSignInDTO())).rejects.toThrow(
        ErrorCodes.UNAUTHORIZED.code,
      );
    });

    it('should throw an error if nonce has expired', async () => {
      const auditor = {
        ...mockAuditor,
        issuedAt: new Date(
          Date.now() - AUTH_EXPIRATION_TIMEOUT - 1000,
        ).toISOString(),
      };

      jest
        .spyOn(auditorsService, 'findOrCreateAuditor')
        .mockResolvedValue(auditor);
      (verifyMessage as jest.Mock).mockReturnValue(auditor.address);
      jest.spyOn(authService, 'hasNonceExpired').mockReturnValue(true);

      await expect(authService.signIn(mockSignInDTO())).rejects.toThrow(
        ErrorCodes.AUTH_EXPIRATION_TIMEOUT.code,
      );
    });
  });

  describe('hasNonceExpired', () => {
    it('should return true if nonce has expired', () => {
      const expiredDate = new Date(
        Date.now() - AUTH_EXPIRATION_TIMEOUT - 1000,
      ).toISOString();
      expect(authService.hasNonceExpired(expiredDate)).toBe(true);
    });

    it('should return false if nonce has not expired', () => {
      const recentDate = new Date(Date.now() - 1000).toISOString();
      expect(authService.hasNonceExpired(recentDate)).toBe(false);
    });
  });
});
