import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { MoonbeamService } from './moonBeam/moonbeam.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Measurement } from '@prisma/client';
import { ContractTransactionResponse } from 'ethers';

@Injectable()
export class AppService {
  private readonly logger: Logger = new Logger(AppService.name);

  constructor(
    private prisma: PrismaService,
    private moonBeam: MoonbeamService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async storeUnverifiedMeasurement(userData: {
    sensorId: string;
    value: number;
  }): Promise<Measurement> {
    return await this.prisma.storeUnverifiedMeasurement(userData);
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async blockchainChronicler() {
    this.logger.verbose('Blockchain Chronicler: Start');

    const unverifiedMeasurements: Measurement[] =
      await this.prisma.findUnverifiedMeasurements(3);

    const sensorIds = Array.from(
      new Set(
        unverifiedMeasurements.map((measurement) => measurement.sensorId),
      ),
    ).sort();

    if (unverifiedMeasurements.length > 0) {
      this.logger.verbose(
        `Blockchain Chronicler: Sensors ${sensorIds} under verification`,
      );

      const transaction: ContractTransactionResponse =
        await this.moonBeam.verifyMeasurements(unverifiedMeasurements);

      const txHash: string = transaction.hash;
      this.logger.verbose(
        `Blockchain Chronicler: Tx successful - hash ${txHash}`,
      );

      await this.prisma.verifyMeasurements(unverifiedMeasurements, txHash);
    }

    this.logger.verbose(
      `Blockchain Chronicler: End - ${unverifiedMeasurements.length} records verified`,
    );
  }
}
