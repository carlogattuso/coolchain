import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  RequestTimeoutException,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ErrorCodes } from '../utils/errors';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiRequestTimeoutResponse,
  ApiResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtDTO } from './types/dto/JwtDTO';
import { SignInDTO } from './types/dto/SignInDTO';
import { NonceDTO } from './types/dto/NonceDTO';
import { SignUpDTO } from './types/dto/SignUpDTO';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signIn')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Signed in successfully',
    type: JwtDTO,
  })
  @ApiRequestTimeoutResponse({
    description: `Authentication timeout has expired`,
  })
  @ApiUnauthorizedResponse({
    description: `Invalid signature`,
  })
  @ApiBadRequestResponse({
    description: 'Invalid data',
  })
  @ApiTooManyRequestsResponse({
    description: 'Too Many Requests',
  })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async signIn(@Body() _signIn: SignInDTO): Promise<JwtDTO> {
    try {
      return await this.authService.signIn(_signIn);
    } catch (error) {
      if (error.message === ErrorCodes.BAD_LOGIN_REQUEST.code) {
        throw new BadRequestException(ErrorCodes.BAD_LOGIN_REQUEST.message);
      } else if (error.message === ErrorCodes.AUTH_EXPIRATION_TIMEOUT.code) {
        throw new RequestTimeoutException(
          ErrorCodes.AUTH_EXPIRATION_TIMEOUT.message,
        );
      } else if (error.message === ErrorCodes.UNAUTHORIZED.code) {
        throw new UnauthorizedException(ErrorCodes.UNAUTHORIZED.message);
      } else {
        throw new BadRequestException(ErrorCodes.UNEXPECTED_ERROR.message);
      }
    }
  }

  @Get('nonce')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 201,
    description: 'Nonce generated successfully',
    type: NonceDTO,
  })
  @ApiBadRequestResponse({
    description: 'Invalid data',
  })
  @ApiTooManyRequestsResponse({
    description: 'Too Many Requests',
  })
  async getNonce(@Query('address') _address: string): Promise<NonceDTO> {
    try {
      return await this.authService.generateNonce(_address);
    } catch (error) {
      if (error.message === ErrorCodes.ADDRESS_REQUIRED.code) {
        throw new ForbiddenException(ErrorCodes.ADDRESS_REQUIRED.message);
      } else {
        throw new BadRequestException(ErrorCodes.UNEXPECTED_ERROR.message);
      }
    }
  }

  @Post('signUp')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: 201,
    description: 'Signed up successfully',
    type: SignUpDTO,
  })
  @ApiConflictResponse({
    description: `Auditor with this address already exists`,
  })
  @ApiBadRequestResponse({
    description: 'Invalid data',
  })
  @ApiTooManyRequestsResponse({
    description: 'Too Many Requests',
  })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async signUp(@Body() _signUp: SignUpDTO): Promise<SignUpDTO> {
    try {
      return await this.authService.signUp(_signUp);
    } catch (error) {
      if (error.message === ErrorCodes.AUDITOR_ALREADY_EXISTS.code) {
        throw new ConflictException(ErrorCodes.AUDITOR_ALREADY_EXISTS.message);
      } else {
        throw new BadRequestException(ErrorCodes.UNEXPECTED_ERROR.message);
      }
    }
  }
}
