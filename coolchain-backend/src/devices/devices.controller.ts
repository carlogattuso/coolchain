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
import { CreateDeviceDTO } from './types/dto/CreateDeviceDTO';
import { DevicesService } from './devices.service';
import { DeviceDTO } from './types/dto/DeviceDTO';

@ApiTags('Devices')
@Controller('devices')
export class DevicesController {
  constructor(private readonly _devicesService: DevicesService) {}

  @Post()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: 201,
    description: 'Device created successfully',
    type: CreateDeviceDTO,
  })
  @ApiUnauthorizedResponse({
    description: `Not authenticated`,
  })
  @ApiConflictResponse({
    description: `Device with this address already exists`,
  })
  @ApiBadRequestResponse({
    description: 'Invalid data',
  })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async registerDevice(
    @Request() _req: Request,
    @Body() _device: CreateDeviceDTO,
  ): Promise<CreateDeviceDTO> {
    const auditorAddress = _req['auditor'].address;
    try {
      return await this._devicesService.createDevice(auditorAddress, _device);
    } catch (error) {
      if (error.message === ErrorCodes.DEVICE_ALREADY_EXISTS.code) {
        throw new ConflictException(ErrorCodes.DEVICE_ALREADY_EXISTS.message);
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
