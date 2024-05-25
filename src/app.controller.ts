import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { MoonbeamService } from './moonbeam.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}

@Controller('process-data')
export class ProcessDataController {
  constructor(private readonly moonbeamService: MoonbeamService) {}

  @Get()
  async getHello(): Promise<string> {
    return await this.moonbeamService.balances();
  }
}
