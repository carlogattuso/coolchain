import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ErrorCodes } from '../utils/errors';
import {
  ApiBadRequestResponse,
  ApiRequestTimeoutResponse,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtDTO } from './types/dto/JwtDTO';
import { SignInDTO } from './types/dto/SignInDTO';
import { NonceDTO } from './types/dto/NonceDTO';

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
}
