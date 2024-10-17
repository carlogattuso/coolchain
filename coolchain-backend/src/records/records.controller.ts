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
} from '@nestjs/common';
import { CreateRecordDTO } from '../types/dto/CreateRecordDTO';
import { RecordDTO } from '../types/dto/RecordDTO';
import { RecordsService } from './records.service';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorCodes } from '../utils/errors';
import { AuthGuard } from '../auth/auth.guard';

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
  @ApiBadRequestResponse({
    description: 'Invalid data',
  })
  async storeRecord(
    @Body() _record: CreateRecordDTO,
  ): Promise<CreateRecordDTO> {
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
}
