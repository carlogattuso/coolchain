import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { JwtDTO } from '../types/dto/JwtDTO';
import { SignInDTO } from '../types/dto/SignInDTO';
import { NonceDTO } from '../types/dto/NonceDTO';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  RequestTimeoutException,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { ErrorCodes } from '../../utils/errors';
import { SignUpDTO } from '../types/dto/SignUpDTO';

const mockSignInDTO = (): SignInDTO => ({
  address: 'auditorAddress',
  signature: 'signature',
  nonce: 'nonce',
  issuedAt: 'issuedAt',
});

const mockSignUpDTO = (): SignUpDTO => ({
  address: 'auditorAddress',
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
            signUp: jest.fn(),
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

    it('should throw BadRequestException for validation errors', async () => {
      const invalidDto = {
        auditorAddress: new Date(),
        signature: new Date(),
        nonce: 1234,
        test: 'hi!',
        issuedAt: 1234,
      };

      const validationPipe = new ValidationPipe();

      try {
        await validationPipe.transform(invalidDto, {
          type: 'body',
          metatype: SignInDTO,
        });
      } catch (error) {
        expect(error.status).toBe(400);
        expect(error.getResponse().message).toEqual([
          'address must be an Ethereum address',
          'signature must be longer than or equal to 128 and shorter than or equal to 256 characters',
          'signature must be a hexadecimal number',
          'signature must be a string',
          'nonce must be longer than or equal to 64 and shorter than or equal to 128 characters',
          'nonce must be a hexadecimal number',
          'nonce must be a string',
          'issuedAt must be a valid ISO 8601 date string',
          'issuedAt must be a string',
        ]);
      }
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
      const nonceDto: NonceDTO = {
        nonce: '123456',
        issuedAt: new Date().toISOString(),
      };

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

  describe('signUp', () => {
    it('should return a SignUpDTO when signUp is successful', async () => {
      const signUpData: SignUpDTO = mockSignUpDTO();

      jest.spyOn(authService, 'signUp').mockResolvedValue(signUpData);

      const result = await authController.signUp(signUpData);
      expect(result).toEqual(signUpData);
      expect(authService.signUp).toHaveBeenCalledWith(signUpData);
    });

    it('should throw ConflictException if auditor already exists', async () => {
      const signUpData: SignUpDTO = mockSignUpDTO();

      jest
        .spyOn(authService, 'signUp')
        .mockRejectedValue(new Error(ErrorCodes.AUDITOR_ALREADY_EXISTS.code));

      await expect(authController.signUp(signUpData)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw BadRequestException for unexpected errors', async () => {
      const signUpData: SignUpDTO = mockSignUpDTO();

      jest
        .spyOn(authService, 'signUp')
        .mockRejectedValue(new Error('Unexpected error'));

      await expect(authController.signUp(signUpData)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
