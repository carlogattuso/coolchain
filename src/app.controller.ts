import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { Temperature } from '@prisma/client';


@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {
  }

  @Get() getHello(): string {
    return this.appService.getHello();
  }

  @Post()
  async sendTemperature(
    @Body() userData: { sensorId: string; value: number },
  ): Promise<Temperature> {
    return this.appService.sendTemperature(userData);
  }
}
