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
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateRecordDTO } from './types/dto/CreateRecordDTO';
import { RecordDTO } from './types/dto/RecordDTO';
import { RecordsService } from './records.service';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorCodes } from '../utils/errors';
import { AuthGuard } from '../auth/auth.guard';
import { ThrottlerException } from '@nestjs/throttler';
import { AuditStatusDTO } from './types/dto/AuditStatusDTO';

@ApiTags('Records')
@Controller('records')
export class RecordsController {
  constructor(private readonly _recordsService: RecordsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: 201,
    description: 'Record created successfully',
    type: CreateRecordDTO,
  })
  @ApiForbiddenResponse({
    description: `The specified device is not registered in the system`,
  })
  @ApiTooManyRequestsResponse({
    description: 'Audit not available yet',
  })
  @ApiBadRequestResponse({
    description: 'Invalid data',
  })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async storeRecord(
    @Body() _record: CreateRecordDTO,
  ): Promise<CreateRecordDTO> {
    try {
      return await this._recordsService.storeUnauditedRecord(_record);
    } catch (error) {
      if (error.message === ErrorCodes.DEVICE_NOT_REGISTERED.code) {
        throw new ForbiddenException(ErrorCodes.DEVICE_NOT_REGISTERED.message);
      } else if (error.message === ErrorCodes.AUDIT_NOT_AVAILABLE.code) {
        throw new ThrottlerException(ErrorCodes.AUDIT_NOT_AVAILABLE.message);
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
    description: 'Retrieved records by device address',
    type: [RecordDTO],
  })
  @ApiUnauthorizedResponse({
    description: `Not authenticated`,
  })
  @ApiBadRequestResponse({
    description: 'Invalid data',
  })
  async getRecords(
    @Request() _req: Request,
    @Query('deviceAddress') _deviceAddress?: string,
  ): Promise<RecordDTO[]> {
    const auditorAddress = _req['auditor'].address;
    try {
      return await this._recordsService.getRecordsWithEvents(
        auditorAddress,
        _deviceAddress,
      );
    } catch (error) {
      throw new BadRequestException(ErrorCodes.UNEXPECTED_ERROR.message);
    }
  }

  @Get('status')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Check if audit is available for a device',
    type: [AuditStatusDTO],
  })
  @ApiForbiddenResponse({
    description: `The specified device is not registered in the system`,
  })
  @ApiBadRequestResponse({
    description: 'Invalid data',
  })
  async getAuditStatus(
    @Query('deviceAddress') _deviceAddress?: string,
  ): Promise<AuditStatusDTO> {
    try {
      return await this._recordsService.getAuditStatus(_deviceAddress);
    } catch (error) {
      if (error.message === ErrorCodes.ADDRESS_REQUIRED.code) {
        throw new ForbiddenException(ErrorCodes.ADDRESS_REQUIRED.message);
      } else if (error.message === ErrorCodes.DEVICE_NOT_REGISTERED.code) {
        throw new ForbiddenException(ErrorCodes.DEVICE_NOT_REGISTERED.message);
      } else {
        throw new BadRequestException(ErrorCodes.UNEXPECTED_ERROR.message);
      }
    }
  }
}
