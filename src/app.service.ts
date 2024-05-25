import { Injectable } from '@nestjs/common';
import { Temperature } from '@prisma/client';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService){}
  getHello(): string {
    return 'Hello World!';
  }

  async setTemperature(userData): Promise<Temperature> {
    const result = await this.prisma.temperature.create({
      data: {
        sensorId: userData.sensorId,
        timestamp: new Date(),
        txHash: "",
        value: userData.value,
      }})
      
      
    return result;
  }
}