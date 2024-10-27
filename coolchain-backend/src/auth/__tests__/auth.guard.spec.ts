import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '../auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { ErrorCodes } from '../../utils/errors';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret'),
          },
        },
      ],
    }).compile();

    authGuard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authGuard).toBeDefined();
    expect(jwtService).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true if token is valid', async () => {
      const mockAuditor = { address: '0x123' };

      const mockRequest = {
        headers: {
          authorization: 'Bearer valid-token',
        },
      } as Request;

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      (jwtService.verifyAsync as jest.Mock).mockResolvedValue(mockAuditor); // Mock del token validado

      const result = await authGuard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(mockRequest['auditor']).toEqual(mockAuditor);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token', {
        secret: 'test-secret',
      });
    });

    it('should throw UnauthorizedException if no token is provided', async () => {
      const mockRequest = {
        headers: {},
      } as Request;

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      await expect(authGuard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if token verification fails', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer invalid-token',
        },
      } as Request;

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      (jwtService.verifyAsync as jest.Mock).mockRejectedValue(
        new Error(ErrorCodes.UNAUTHORIZED.code),
      );

      await expect(authGuard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('invalid-token', {
        secret: 'test-secret',
      });
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should return token if Bearer token is present', () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer valid-token',
        },
      } as Request;

      const token = authGuard['extractTokenFromHeader'](mockRequest);
      expect(token).toBe('valid-token');
    });

    it('should return undefined if authorization header is missing', () => {
      const mockRequest = {
        headers: {},
      } as Request;

      const token = authGuard['extractTokenFromHeader'](mockRequest);
      expect(token).toBeUndefined();
    });

    it('should return undefined if authorization header is not a Bearer token', () => {
      const mockRequest = {
        headers: {
          authorization: 'Basic some-token',
        },
      } as Request;

      const token = authGuard['extractTokenFromHeader'](mockRequest);
      expect(token).toBeUndefined();
    });
  });
});
