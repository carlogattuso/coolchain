import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { Int32 } from 'mongodb';
import { Temperature } from '@prisma/client';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post()
  async setTemperature(
    @Body() userData: Temperature
      //sensorId:number, timestamp:bigint, txHash:string, value:number
      
    ): Promise<Temperature>{
    return this.appService.setTemperature(userData);
  }
}