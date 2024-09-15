import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { Measurement } from '@prisma/client';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get() getHello(): string {
    return this.appService.getHello();
  }

  @Post()
  async storeMeasurement(
    @Body() userData: { sensorId: string; value: number },
  ): Promise<Measurement> {
    return this.appService.storeUnverifiedMeasurement(userData);
  }
}
