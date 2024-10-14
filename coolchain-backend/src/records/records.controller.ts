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
} from '@nestjs/common';
import { CreateRecordDTO } from '../types/dto/CreateRecordDTO';
import { RecordDTO } from '../types/dto/RecordDTO';
import { RecordsService } from './records.service';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorCodes } from '../utils/errors';

@ApiTags('Records')
@Controller('records')
export class RecordsController {
  constructor(private readonly _recordsService: RecordsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: 201,
    description: 'Record created successfully',
    type: [CreateRecordDTO],
  })
  @ApiForbiddenResponse({
    description: `The specified device is not registered in the system`,
  })
  @ApiBadRequestResponse({
    description: 'Invalid data',
  })
  async storeRecord(
    @Body() _record: CreateRecordDTO,
  ): Promise<CreateRecordDTO> {
    try {
      return this._recordsService.storeUnauditedRecord(_record);
    } catch (error) {
      if (error.message === ErrorCodes.DEVICE_NOT_REGISTERED.code) {
        throw new ForbiddenException(ErrorCodes.DEVICE_NOT_REGISTERED.message);
      } else {
        throw new BadRequestException(ErrorCodes.UNEXPECTED_ERROR.message);
      }
    }
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Retrieved records by device address',
    type: [RecordDTO],
  })
  async getRecords(
    @Query('deviceAddress') _deviceAddress?: string,
  ): Promise<RecordDTO[]> {
    try {
      return this._recordsService.getRecordsWithEvents(_deviceAddress);
    } catch (error) {
      if (error.message === ErrorCodes.DEVICE_NOT_REGISTERED.code) {
        throw new ForbiddenException(ErrorCodes.DEVICE_NOT_REGISTERED.message);
      } else {
        throw new BadRequestException(ErrorCodes.UNEXPECTED_ERROR.message);
      }
    }
  }
}
