import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { Temperature } from '@prisma/client';
import { MoonbeamService } from './moonBeam/moonbeam.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly moonBeamService: MoonbeamService,
  ) {}

  @Get() getHello(): string {
    return this.appService.getHello();
  }

  @Get('test-batch')
  async testBatch() {
    const batchData = [
      {
        sensorId: '12',
        timeStamp: new Date().getTime(),
        value: 11,
        v: 0,
        r: '0x7465737400000000000000000000000000000000000000000000000000000000',
        s: '0x7465737400000000000000000000000000000000000000000000000000000000',
      },
      {
        sensorId: '13',
        timeStamp: new Date().getTime(),
        value: 22,
        v: 0,
        r: '0x7465737400000000000000000000000000000000000000000000000000000000',
        s: '0x7465737400000000000000000000000000000000000000000000000000000000',
      },
      {
        sensorId: '16',
        timeStamp: new Date().getTime(),
        value: 44,
        v: 0,
        r: '0x7465737400000000000000000000000000000000000000000000000000000000',
        s: '0x7465737400000000000000000000000000000000000000000000000000000000',
      },
    ];

    return this.moonBeamService.callBatchPrecompileContract(batchData);
  }

  @Post()
  async sendTemperature(
    @Body() userData: { sensorId: string; value: number },
  ): Promise<Temperature> {
    return this.appService.sendTemperature(userData);
  }
}
