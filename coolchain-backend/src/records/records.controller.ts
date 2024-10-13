import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
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
import { Record } from '../types/Record';
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
  async storeRecord(@Body() _record: CreateRecordDTO): Promise<Record> {
    try {
      return await this._recordsService.storeUnauditedRecord(_record);
    } catch (error) {
      if (error.message === ErrorCodes.DEVICE_NOT_REGISTERED.code) {
        throw new ForbiddenException(ErrorCodes.DEVICE_NOT_REGISTERED.message);
      } else {
        throw new BadRequestException(ErrorCodes.UNEXPECTED_ERROR.message);
      }
    }
  }

  @Get('/:deviceAddress')
  @ApiResponse({
    status: 200,
    description: 'Retrieved records by device address',
    type: [RecordDTO],
  })
  async getRecordsByDevice(
    @Param('deviceAddress') _deviceAddress: string,
  ): Promise<RecordDTO[]> {
    return this._recordsService.getRecordsByDevice(_deviceAddress);
  }
}
