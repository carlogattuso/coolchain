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
    sensorId: bigint;
    value: number;
  }): Promise<Temperature> {
    return await this.prisma.createMeasurement(userData);
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async blockchainChronicler() {
    this.logger.verbose('Blockchain Chronicler: Start');

    const nonVerifiedMeasurements: Temperature[] =
      await this.prisma.findUnverifiedMeasurements(3);

    if (nonVerifiedMeasurements.length > 0) {
      this.logger.verbose(
        `Blockchain Chronicler: Sensors ${nonVerifiedMeasurements.map((t) => t.sensorId)} under verification`,
      );

      const receipt: ContractTransactionResponse =
        await this.moonBeam.sendMeasurement(
          nonVerifiedMeasurements.map((temperature) => {
            return {
              sensorId: temperature.sensorId,
              value: temperature.value,
              timestamp: temperature.timestamp.getTime(),
            };
          }),
        );

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
