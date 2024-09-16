import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { Record } from '@prisma/client';

@Controller()
export class AppController {
  constructor(private readonly _appService: AppService) {}

  @Get() getHello(): string {
    return this._appService.getHello();
  }

  @Post()
  async storeRecord(
    @Body() _userData: { deviceId: string; value: number },
  ): Promise<Record> {
    return this._appService.storeUnauditedRecord(_userData);
  }

  @Get('/records/:deviceId')
  async getRecordsByDevice(
    @Param('deviceId') _deviceId: string,
  ): Promise<Record[]> {
    return this._appService.getRecordsByDevice(_deviceId);
  }
}
