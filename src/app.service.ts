import { Injectable, Logger } from '@nestjs/common';
import { Temperature } from '@prisma/client';
import { PrismaService } from './prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async sendTemperature(userData: {
    sensorId: string;
    value: number;
  }): Promise<Temperature> {
    return await this.prisma.createMeasurement(userData);
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async blockchainChronicler() {
    this.logger.verbose('Blockchain Chronicler: Start');

    const nonVerifiedMeasurements: Temperature[] =
      await this.prisma.findUnverifiedMeasurements(1);

    if (nonVerifiedMeasurements) {
      //TODO: send array of transactions to the Moonbase batch precompile
      const txHash: string =
        '0xa293af6faecaef71e542d78646870d20d26bacbbb5657f1231703b4a6d4c03d2';
      await this.prisma.verifyMeasurements(nonVerifiedMeasurements, txHash);
    }

    this.logger.verbose(
      `Blockchain Chronicler: End - ${nonVerifiedMeasurements.length} records verified`,
    );
  }
}
