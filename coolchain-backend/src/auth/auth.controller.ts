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
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ErrorCodes } from '../utils/errors';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiRequestTimeoutResponse,
  ApiResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtDTO } from './types/dto/JwtDTO';
import { SignInDTO } from './types/dto/SignInDTO';
import { MessageDTO } from './types/dto/MessageDTO';
import { ThrottlerGuard } from '@nestjs/throttler';

@ApiTags('Auth')
@Controller('auth')
@UseGuards(ThrottlerGuard)
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
      if (error.message === ErrorCodes.BAD_SIGN_IN_REQUEST.code) {
        throw new BadRequestException(ErrorCodes.BAD_SIGN_IN_REQUEST.message);
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

  @Get('message')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 201,
    description: 'Message generated successfully',
    type: MessageDTO,
  })
  @ApiBadRequestResponse({
    description: 'Invalid data',
  })
  @ApiForbiddenResponse({
    description: 'Auditor address is required',
  })
  @ApiTooManyRequestsResponse({
    description: 'Too Many Requests',
  })
  async getMessage(
    @Query('address') _auditorAddress: string,
  ): Promise<MessageDTO> {
    try {
      return await this.authService.generateMessageToSign(_auditorAddress);
    } catch (error) {
      if (error.message === ErrorCodes.ADDRESS_REQUIRED.code) {
        throw new ForbiddenException(ErrorCodes.ADDRESS_REQUIRED.message);
      } else {
        throw new BadRequestException(ErrorCodes.UNEXPECTED_ERROR.message);
      }
    }
  }
}
