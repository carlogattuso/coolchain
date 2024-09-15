import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { MoonbeamService } from './moonBeam/moonbeam.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Record } from '@prisma/client';
import { ContractTransactionResponse } from 'ethers';

@Injectable()
export class AppService {
  private readonly logger: Logger = new Logger(AppService.name);

  constructor(
    private _prismaService: PrismaService,
    private _moonbeamService: MoonbeamService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async storeUnauditedRecord(_userData: {
    sensorId: string;
    value: number;
  }): Promise<Record> {
    return await this._prismaService.storeUnauditedRecord(_userData);
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async blockchainChronicler() {
    this.logger.verbose('Blockchain Chronicler: Start');

    const unauditedRecords: Record[] =
      await this._prismaService.getUnauditedRecords(3);

    if (unauditedRecords.length > 0) {
      this.logger.verbose(
        `Blockchain Chronicler: Records ${unauditedRecords.map((record: Record) => record.id)} under audit`,
      );

      const transaction: ContractTransactionResponse =
        await this._moonbeamService.auditRecords(unauditedRecords);

      const txHash: string = transaction.hash;
      this.logger.verbose(
        `Blockchain Chronicler: Tx successful - hash ${txHash}`,
      );

      await this._prismaService.auditRecords(unauditedRecords, txHash);
    }

    this.logger.verbose(
      `Blockchain Chronicler: End - ${unauditedRecords.length} records audited`,
    );
  }
}
