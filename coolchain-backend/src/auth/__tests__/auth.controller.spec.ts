import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { JwtDTO } from '../types/dto/JwtDTO';
import { SignInDTO } from '../types/dto/SignInDTO';
import {
  BadRequestException,
  ForbiddenException,
  RequestTimeoutException,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { ErrorCodes } from '../../utils/errors';
import { MessageDTO } from '../types/dto/MessageDTO';

const mockSignInDTO = (): SignInDTO => ({
  auditorAddress: 'auditorAddress',
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

const mockMessageDTO = (_at: string): MessageDTO => ({
  message: mockSIWEMessage(_at),
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
            generateMessageToSign: jest.fn(),
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
    it('should return a session token when signIn is successful', async () => {
      const signInDto: SignInDTO = mockSignInDTO();
      const jwtDto: JwtDTO = { accessToken: 'jwt-token', isNew: true };

      jest.spyOn(authService, 'signIn').mockResolvedValue(jwtDto);

      const result = await authController.signIn(signInDto);
      expect(result).toEqual(jwtDto);
      expect(authService.signIn).toHaveBeenCalledWith(signInDto);
    });

    it('should throw BadRequestException if bad signIn request', async () => {
      const signInDto: SignInDTO = mockSignInDTO();

      jest
        .spyOn(authService, 'signIn')
        .mockRejectedValue(new Error(ErrorCodes.BAD_SIGN_IN_REQUEST.code));

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
          'auditorAddress must be an Ethereum address',
          'signature must be longer than or equal to 128 and shorter than or equal to 256 characters',
          'signature must be a hexadecimal number',
          'signature must be a string',
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

  describe('getMessage', () => {
    it('should return a SIWE message when getMessage is successful', async () => {
      const address = '0x123456789';
      const at = new Date().toISOString();
      jest
        .spyOn(authService, 'generateMessageToSign')
        .mockResolvedValue(mockMessageDTO(at));

      const result = await authController.getMessage(address);
      expect(result).toEqual(mockMessageDTO(at));
      expect(authService.generateMessageToSign).toHaveBeenCalledWith(address);
    });

    it('should throw ForbiddenException if address is required', async () => {
      jest
        .spyOn(authService, 'generateMessageToSign')
        .mockRejectedValue(new Error(ErrorCodes.ADDRESS_REQUIRED.code));

      await expect(authController.getMessage(null)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw BadRequestException for unexpected errors', async () => {
      const address = '0x123456789';

      jest
        .spyOn(authService, 'generateMessageToSign')
        .mockRejectedValue(new Error('Unexpected error'));

      await expect(authController.getMessage(address)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
