import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { CreateRecordDTO } from '../types/dto/CreateRecordDTO';
import { RecordDTO } from '../types/dto/RecordDTO';
import { RecordsService } from './records.service';
import { ApiForbiddenResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Record } from '../types/Record';

@ApiTags('Records')
@Controller('records')
export class RecordsController {
  constructor(private readonly _recordsService: RecordsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: 201,
    description: 'Retrieved records by device address',
    type: [CreateRecordDTO],
  })
  @ApiForbiddenResponse({
    description: `The specified device is not registered in the system`,
  })
  async storeRecord(@Body() _record: CreateRecordDTO): Promise<Record> {
    return this._recordsService.storeUnauditedRecord(_record);
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
