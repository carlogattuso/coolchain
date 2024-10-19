import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SignInDTO } from '../types/dto/SignInDTO';
import { JwtDTO } from '../types/dto/JwtDTO';
import { NonceDTO } from '../types/dto/NonceDTO';
import { ErrorCodes } from '../../utils/errors';
import { randomBytes, verifyMessage } from 'ethers';
import { AUTH_EXPIRATION_TIMEOUT } from '../../utils/constants';
import { Logger } from '@nestjs/common';
import { Auditor } from '../types/Auditor';

jest.mock('ethers', () => ({
  ...jest.requireActual('ethers'),
  randomBytes: jest.fn(),
  verifyMessage: jest.fn(),
}));

const mockSignInDTO = (): SignInDTO => ({
  address: 'auditorAddress',
  signature: 'signature',
  nonce: 'nonce',
});

const mockDatabaseError = (): Error =>
  new Error(ErrorCodes.DATABASE_ERROR.code);

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(jest.fn());
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            auditor: {
              findUnique: jest.fn(),
              upsert: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'APP_DOMAIN') return 'example.com';
              if (key === 'APP_URI') return 'https://example.com';
              if (key === 'CHAIN_ID') return 1;
            }),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
    expect(prismaService).toBeDefined();
    expect(jwtService).toBeDefined();
  });

  describe('signIn', () => {
    it('should return a JwtDTO on successful signIn', async () => {
      const signInDto: SignInDTO = mockSignInDTO();
      const auditor = {
        address: 'auditorAddress',
        nonce: 'nonce',
        issuedAt: new Date(),
      };

      prismaService.auditor.findUnique = jest.fn().mockResolvedValue(auditor);
      jest.spyOn(global.Date, 'now').mockReturnValue(new Date().getTime());
      (verifyMessage as jest.Mock).mockReturnValue(signInDto.address);
      jwtService.sign = jest.fn().mockReturnValue('jwt-token');

      const result: JwtDTO = await authService.signIn(signInDto);

      expect(result).toEqual({ accessToken: 'jwt-token' });
      expect(prismaService.auditor.findUnique).toHaveBeenCalledWith({
        where: { address: signInDto.address },
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        address: signInDto.address,
      });
    });

    it('should throw BadRequestException if address, signature, or nonce is missing', async () => {
      const signInDto: SignInDTO = { address: '', signature: '', nonce: '' };

      await expect(authService.signIn(signInDto)).rejects.toThrow(
        ErrorCodes.BAD_LOGIN_REQUEST.code,
      );
    });

    it('should log and throw a database error if Prisma throws an error', async () => {
      const signInDto: SignInDTO = mockSignInDTO();

      jest
        .spyOn(prismaService.auditor, 'findUnique')
        .mockRejectedValue(mockDatabaseError());

      await expect(authService.signIn(signInDto)).rejects.toThrow(
        mockDatabaseError(),
      );

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining(`Error retrieving auditor:`),
        expect.objectContaining({
          stack: expect.any(String),
          auditor: 'auditorAddress',
        }),
      );
    });

    it('should throw RequestTimeoutException if the nonce has expired', async () => {
      const signInDto: SignInDTO = mockSignInDTO();
      const auditor = {
        address: 'auditorAddress',
        nonce: 'nonce',
        issuedAt: new Date(Date.now() - AUTH_EXPIRATION_TIMEOUT - 1000),
      };

      prismaService.auditor.findUnique = jest.fn().mockResolvedValue(auditor);

      await expect(authService.signIn(signInDto)).rejects.toThrow(
        ErrorCodes.AUTH_EXPIRATION_TIMEOUT.code,
      );
    });

    it('should throw UnauthorizedException if auditor nonce does not match', async () => {
      const signInDto: SignInDTO = mockSignInDTO();
      const mockWrongAddress: Auditor = {
        address: 'differentAuditor',
        nonce: 'wrongNonce',
        issuedAt: new Date(),
      };

      prismaService.auditor.findUnique = jest
        .fn()
        .mockResolvedValue(mockWrongAddress);
      (verifyMessage as jest.Mock).mockReturnValue('auditorAddress');

      await expect(authService.signIn(signInDto)).rejects.toThrow(
        ErrorCodes.UNAUTHORIZED.code,
      );
    });

    it('should throw UnauthorizedException if recovered address does not match', async () => {
      const signInDto: SignInDTO = mockSignInDTO();
      const auditor: Auditor = {
        address: 'auditorAddress',
        nonce: 'nonce',
        issuedAt: new Date(),
      };

      prismaService.auditor.findUnique = jest.fn().mockResolvedValue(auditor);
      (verifyMessage as jest.Mock).mockReturnValue('0xDifferentAddress');

      await expect(authService.signIn(signInDto)).rejects.toThrow(
        ErrorCodes.UNAUTHORIZED.code,
      );
    });
  });

  describe('generateNonce', () => {
    it('should return a NonceDTO on successful generation', async () => {
      const address = '0x123';
      const mockNonce = '0x74657374';
      const mockDate = new Date('2024-01-01T00:00:00Z');

      (randomBytes as unknown as jest.Mock).mockReturnValue(
        Buffer.from('test', 'utf8'),
      );
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      prismaService.auditor.upsert = jest.fn().mockResolvedValue({
        address,
        nonce: mockNonce,
        issuedAt: mockDate,
      });

      const result: NonceDTO = await authService.generateNonce(address);

      expect(result).toEqual({ nonce: mockNonce, issuedAt: mockDate });
      expect(prismaService.auditor.upsert).toHaveBeenCalledWith({
        where: { address },
        update: { nonce: mockNonce, issuedAt: mockDate },
        create: { address: address, nonce: mockNonce, issuedAt: mockDate },
      });
    });

    it('should throw ADDRESS_REQUIRED if no address is provided', async () => {
      const address = '';

      await expect(authService.generateNonce(address)).rejects.toThrow(
        ErrorCodes.ADDRESS_REQUIRED.code,
      );
    });
  });
});
