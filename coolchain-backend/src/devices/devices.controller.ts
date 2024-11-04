import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorCodes } from '../utils/errors';
import { AuthGuard } from '../auth/auth.guard';
import { CreateDeviceInputDTO } from './types/dto/CreateDeviceInputDTO';
import { DevicesService } from './devices.service';
import { DeviceDTO } from './types/dto/DeviceDTO';
import { CreateDeviceOutputDTO } from './types/dto/CreateDeviceOutputDTO';

@ApiTags('Devices')
@Controller('devices')
export class DevicesController {
  constructor(private readonly _devicesService: DevicesService) {}

  @Post()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: 201,
    description: 'Devices created successfully',
    type: CreateDeviceOutputDTO,
  })
  @ApiUnauthorizedResponse({
    description: `Not authenticated`,
  })
  @ApiConflictResponse({
    description: `Any of the new devices already exists`,
  })
  @ApiBadRequestResponse({
    description: 'Invalid data',
  })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async registerDevices(
    @Request() _req: Request,
    @Body() _devices: CreateDeviceInputDTO,
  ): Promise<CreateDeviceOutputDTO> {
    const auditorAddress = _req['auditor'].address;
    try {
      return await this._devicesService.createDevices(auditorAddress, _devices);
    } catch (error) {
      if (error.code === ErrorCodes.DEVICE_ALREADY_EXISTS.code) {
        throw new ConflictException(error.message);
      } else {
        throw new BadRequestException(ErrorCodes.UNEXPECTED_ERROR.message);
      }
    }
  }

  @Get()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Retrieved devices',
    type: [DeviceDTO],
  })
  @ApiUnauthorizedResponse({
    description: `Not authenticated`,
  })
  @ApiBadRequestResponse({
    description: 'Invalid data',
  })
  async getDevices(@Request() _req: Request): Promise<DeviceDTO[]> {
    const auditorAddress = _req['auditor'].address;
    try {
      return await this._devicesService.getDevices(auditorAddress);
    } catch (error) {
      throw new BadRequestException(ErrorCodes.UNEXPECTED_ERROR.message);
    }
  }
}
