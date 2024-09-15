import { Injectable, OnModuleInit } from '@nestjs/common';
import { Measurement, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async storeUnverifiedMeasurement(_userData: {
    sensorId: string;
    value: number;
  }) {
    return this.measurement.create({
      data: {
        sensorId: String(_userData.sensorId),
        timestamp: new Date(),
        txHash: '',
        value: _userData.value,
      },
    });
  }

  async findUnverifiedMeasurements(_recordNum: number): Promise<Measurement[]> {
    return this.measurement.findMany({
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
    _measurements: Measurement[],
    _txHash: string,
  ): Promise<void> {
    await this.measurement.updateMany({
      where: {
        id: {
          in: _measurements.map((t: Measurement) => t.id),
        },
      },
      data: {
        txHash: _txHash,
      },
    });
  }
}
