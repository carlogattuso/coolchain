import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SignInDTO } from '../types/dto/SignInDTO';
import { JwtDTO } from '../types/dto/JwtDTO';
import { Nonce } from '../types/Nonce';
import { ErrorCodes } from '../../utils/errors';
import { randomBytes, verifyMessage } from 'ethers';
import { AUTH_EXPIRATION_TIMEOUT } from '../../utils/constants';
import { Logger } from '@nestjs/common';
import { Auditor } from '../../auditors/types/Auditor';
import { SignUpDTO } from '../types/dto/SignUpDTO';

jest.mock('ethers', () => ({
  ...jest.requireActual('ethers'),
  randomBytes: jest.fn(),
  verifyMessage: jest.fn(),
}));

const mockSignInDTO = (): SignInDTO => ({
  auditorAddress: 'auditorAddress',
  signature: 'signature',
  nonce: 'nonce',
  issuedAt: new Date().toISOString(),
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
              create: jest.fn(),
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
        issuedAt: new Date(signInDto.issuedAt),
      };

      prismaService.auditor.findUnique = jest.fn().mockResolvedValue(auditor);
      jest.spyOn(global.Date, 'now').mockReturnValue(new Date().getTime());
      (verifyMessage as jest.Mock).mockReturnValue(signInDto.auditorAddress);
      jwtService.sign = jest.fn().mockReturnValue('jwt-token');

      const result: JwtDTO = await authService.signIn(signInDto);

      expect(result).toEqual({ accessToken: 'jwt-token' });
      expect(prismaService.auditor.findUnique).toHaveBeenCalledWith({
        where: { address: signInDto.auditorAddress },
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        address: signInDto.auditorAddress,
      });
    });

    it('should throw BadRequestException if address, signature, nonce or issuedAt is missing', async () => {
      const signInDto: SignInDTO = {
        auditorAddress: '',
        signature: '',
        nonce: '',
        issuedAt: '',
      };

      await expect(authService.signIn(signInDto)).rejects.toThrow(
        ErrorCodes.BAD_SIGN_IN_REQUEST.code,
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
      const mockDate = new Date();

      (randomBytes as unknown as jest.Mock).mockReturnValue(
        Buffer.from('test', 'utf8'),
      );
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

      prismaService.auditor.upsert = jest.fn().mockResolvedValue({
        address,
        nonce: mockNonce,
        issuedAt: mockDate,
      });

      const result: Nonce = await authService.generateNonce(address);

      expect(result).toEqual({
        nonce: mockNonce,
        issuedAt: mockDate.toISOString(),
      });
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

  describe('signUp', () => {
    it('should sign up a new auditor and return SignUpDTO on success', async () => {
      const signUpDto: SignUpDTO = { address: 'newAuditorAddress' };
      const createdAuditor = { address: 'newAuditorAddress' };

      prismaService.auditor.findUnique = jest.fn().mockResolvedValue(null);
      prismaService.auditor.create = jest
        .fn()
        .mockResolvedValue(createdAuditor);

      const result = await authService.signUp(signUpDto);

      expect(result).toEqual(createdAuditor);
      expect(prismaService.auditor.findUnique).toHaveBeenCalledWith({
        where: { address: signUpDto.address },
      });
      expect(prismaService.auditor.create).toHaveBeenCalledWith({
        data: signUpDto,
        select: { address: true },
      });
    });

    it('should throw AUDITOR_ALREADY_EXISTS error if auditor exists', async () => {
      const signUpDto: SignUpDTO = { address: 'existingAuditorAddress' };
      const existingAuditor = { address: 'existingAuditorAddress' };

      prismaService.auditor.findUnique = jest
        .fn()
        .mockResolvedValue(existingAuditor);

      await expect(authService.signUp(signUpDto)).rejects.toThrow(
        ErrorCodes.AUDITOR_ALREADY_EXISTS.code,
      );
      expect(prismaService.auditor.findUnique).toHaveBeenCalledWith({
        where: { address: signUpDto.address },
      });
      expect(prismaService.auditor.create).not.toHaveBeenCalled();
    });

    it('should log and throw DATABASE_ERROR if there is an error retrieving the auditor', async () => {
      const signUpDto: SignUpDTO = { address: 'newAuditorAddress' };

      prismaService.auditor.findUnique = jest
        .fn()
        .mockRejectedValue(mockDatabaseError());

      await expect(authService.signUp(signUpDto)).rejects.toThrow(
        mockDatabaseError(),
      );

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining('Error retrieving auditor:'),
        expect.objectContaining({
          stack: expect.any(String),
          auditor: signUpDto.address,
        }),
      );
    });

    it('should log and throw DATABASE_ERROR if there is an error creating the auditor', async () => {
      const signUpDto: SignUpDTO = { address: 'newAuditorAddress' };

      prismaService.auditor.findUnique = jest.fn().mockResolvedValue(null);
      prismaService.auditor.create = jest
        .fn()
        .mockRejectedValue(mockDatabaseError());

      await expect(authService.signUp(signUpDto)).rejects.toThrow(
        mockDatabaseError(),
      );

      expect(Logger.prototype.error).toHaveBeenCalledWith(
        expect.stringContaining('Error creating auditor:'),
        expect.objectContaining({
          stack: expect.any(String),
          auditor: signUpDto.address,
        }),
      );
    });
  });
});
