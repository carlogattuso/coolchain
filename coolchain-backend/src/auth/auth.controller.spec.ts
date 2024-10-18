import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtDTO } from '../types/dto/JwtDTO';
import { SignInDTO } from '../types/dto/SignInDTO';
import { NonceDTO } from '../types/dto/NonceDTO';
import {
  BadRequestException,
  ForbiddenException,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { ErrorCodes } from '../utils/errors';

const mockSignInDTO = (): SignInDTO => ({
  address: 'auditorAddress',
  signature: 'signature',
  nonce: 'nonce',
});

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signIn: jest.fn(),
            generateNonce: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
    expect(authService).toBeDefined();
  });

  describe('signIn', () => {
    it('should return a JwtDTO when signIn is successful', async () => {
      const signInDto: SignInDTO = mockSignInDTO();
      const jwtDto: JwtDTO = { accessToken: 'jwt-token' };

      jest.spyOn(authService, 'signIn').mockResolvedValue(jwtDto);

      const result = await authController.signIn(signInDto);
      expect(result).toEqual(jwtDto);
      expect(authService.signIn).toHaveBeenCalledWith(signInDto);
    });

    it('should throw BadRequestException if bad login request', async () => {
      const signInDto: SignInDTO = mockSignInDTO();

      jest
        .spyOn(authService, 'signIn')
        .mockRejectedValue(new Error(ErrorCodes.BAD_LOGIN_REQUEST.code));

      await expect(authController.signIn(signInDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw RequestTimeoutException if authentication timeout occurs', async () => {
      const signInDto: SignInDTO = mockSignInDTO();

      jest
        .spyOn(authService, 'signIn')
        .mockRejectedValue(new Error(ErrorCodes.AUTH_EXPIRATION_TIMEOUT.code));

      await expect(authController.signIn(signInDto)).rejects.toThrow(
        RequestTimeoutException,
      );
    });

    it('should throw UnauthorizedException if unauthorized', async () => {
      const signInDto: SignInDTO = mockSignInDTO();

      jest
        .spyOn(authService, 'signIn')
        .mockRejectedValue(new Error(ErrorCodes.UNAUTHORIZED.code));

      await expect(authController.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw BadRequestException for unexpected errors', async () => {
      const signInDto: SignInDTO = mockSignInDTO();

      jest
        .spyOn(authService, 'signIn')
        .mockRejectedValue(new Error('Unexpected error'));

      await expect(authController.signIn(signInDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getNonce', () => {
    it('should return a NonceDTO when getNonce is successful', async () => {
      const address = '0x123456789';
      const nonceDto: NonceDTO = { nonce: '123456', issuedAt: new Date() };

      jest.spyOn(authService, 'generateNonce').mockResolvedValue(nonceDto);

      const result = await authController.getNonce(address);
      expect(result).toEqual(nonceDto);
      expect(authService.generateNonce).toHaveBeenCalledWith(address);
    });

    it('should throw ForbiddenException if address is required', async () => {
      const address = '0x123456789';

      jest
        .spyOn(authService, 'generateNonce')
        .mockRejectedValue(new Error(ErrorCodes.ADDRESS_REQUIRED.code));

      await expect(authController.getNonce(address)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw BadRequestException for unexpected errors', async () => {
      const address = '0x123456789';

      jest
        .spyOn(authService, 'generateNonce')
        .mockRejectedValue(new Error('Unexpected error'));

      await expect(authController.getNonce(address)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
