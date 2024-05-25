import { Injectable } from '@nestjs/common';
import { Temperature } from '@prisma/client';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async sendTemperature(userData: {
    sensorId: string;
    value: number;
  }): Promise<Temperature> {
    return await this.prisma.temperature.create({
      data: {
        sensorId: userData.sensorId,
        timestamp: new Date(),
        txHash: '',
        value: userData.value,
      },
    });
  }
}
