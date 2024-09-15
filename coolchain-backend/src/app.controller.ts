import { Body, Controller, Get, Post } from '@nestjs/common';
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
    @Body() _userData: { sensorId: string; value: number },
  ): Promise<Record> {
    return this._appService.storeUnauditedRecord(_userData);
  }
}
