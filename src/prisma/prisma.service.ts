import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient, Temperature } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async createMeasurement(_userData: { sensorId: string; value: number }) {
    return this.temperature.create({
      data: {
        sensorId: String(_userData.sensorId),
        timestamp: new Date(),
        txHash: '',
        value: _userData.value,
      },
    });
  }

  async findUnverifiedMeasurements(_recordNum: number): Promise<Temperature[]> {
    return this.temperature.findMany({
      where: {
        txHash: {
          equals: '',
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
      take: _recordNum,
    });
  }

  async verifyMeasurements(
    _measurements: Temperature[],
    _txHash: string,
  ): Promise<void> {
    await this.temperature.updateMany({
      where: {
        id: {
          in: _measurements.map((t: Temperature) => t.id),
        },
      },
      data: {
        txHash: _txHash,
      },
    });
  }
}
