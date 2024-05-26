import { Injectable, Logger } from '@nestjs/common';
import { Temperature } from '@prisma/client';
import { PrismaService } from './prisma/prisma.service';
import { MoonbeamService } from './moonBeam/moonbeam.service';
import { Cron, CronExpression } from '@nestjs/schedule';
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

  async sendTemperature(userData: {
    sensorId: number;
    value: number;
  }): Promise<Temperature> {
    return await this.prisma.createMeasurement(userData);
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async blockchainChronicler() {
    this.logger.verbose('Blockchain Chronicler: Start');

    const nonVerifiedMeasurements: Temperature[] =
      await this.prisma.findUnverifiedMeasurements(1);

    if (nonVerifiedMeasurements) {
      const measurement: Temperature = nonVerifiedMeasurements[0];

      this.logger.verbose(
        `Blockchain Chronicler: Sensor ${measurement.sensorId} under verification`,
      );

      //TODO: Add proper values for v, r, s

      const receipt: ContractTransactionResponse =
        await this.moonBeam.sendMeasurement(
          measurement.sensorId,
          measurement.timestamp,
          measurement.value,
        );

      // TODO: send multiple transactions with batch [OPTIONAL, it is an optimization]
      // TODO: set transaction hash properly

      const txHash: string = receipt.hash;
      this.logger.verbose(
        `Blockchain Chronicler: Tx successful - hash ${txHash}`,
      );

      await this.prisma.verifyMeasurements(nonVerifiedMeasurements, txHash);
    }

    this.logger.verbose(
      `Blockchain Chronicler: End - ${nonVerifiedMeasurements.length} records verified`,
    );
  }
}
