import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { Temperature } from '@prisma/client';
import { MoonbeamService } from './moonBeam/moonbeam.service';


@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly moonBeamService: MoonbeamService) {
  }

  @Get() getHello(): string {
    return this.appService.getHello();
  }
  @Get('test-batch') async testBach() {
    // return this.appService.getHello();
    return this.moonBeamService.callBatchPrecompileContract();
  }

  @Post()
  async sendTemperature(
    @Body() userData: { sensorId: string; value: number },
  ): Promise<Temperature> {
    return this.appService.sendTemperature(userData);
  }
}
