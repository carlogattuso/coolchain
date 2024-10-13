import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { Record } from '@prisma/client';
import { CreateRecordDTO } from './types/dto/CreateRecordDTO';
import { RecordDTO } from './types/dto/RecordDTO';
import { Device } from './types/Device';
import { Auditor } from './types/Auditor';

@Controller()
export class AppController {
  constructor(private readonly _appService: AppService) {}

  @Get() getHello(): string {
    return this._appService.getHello();
  }

  @Post()
  async storeRecord(@Body() _userData: CreateRecordDTO): Promise<Record> {
    return this._appService.storeUnauditedRecord(_userData);
  }

  @Get('/records/:deviceAddress')
  async getRecordsByDevice(
    @Param('deviceAddress') _deviceAddress: string,
  ): Promise<RecordDTO[]> {
    return this._appService.getRecordsByDevice(_deviceAddress);
  }

  @Get('/records/')
  async getRecords(): Promise<RecordDTO[]> {
    return this._appService.getRecordsByDevice(null);
  }

  @Get('/devices/')
  async getDevices(): Promise<Device[]> {
    return this._appService.getDevices();
  }

  @Get('/auditors/')
  async getAuditors(): Promise<Auditor[]> {
    return this._appService.getAuditors();
  }
}
