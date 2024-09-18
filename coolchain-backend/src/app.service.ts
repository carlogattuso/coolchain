import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { MoonbeamService } from './moonBeam/moonbeam.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Event, Record } from '@prisma/client';
import { CreateEventDTO } from './types/dto/CreateEventDTO';
import { CreateRecordDTO } from './types/dto/CreateRecordDTO';

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

  async storeUnauditedRecord(_record: CreateRecordDTO): Promise<Record> {
    return await this._prismaService.storeUnauditedRecord(_record);
  }

  async getRecordsByDevice(_deviceId: string): Promise<Record[]> {
    return await this._prismaService.getRecordsWithEvents(_deviceId);
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

      const auditResult: CreateEventDTO[] =
        await this._moonbeamService.auditRecords(unauditedRecords);

      auditResult.forEach((event: Event) => {
        this.logger.verbose(
          `Blockchain Chronicler: Record ${event.recordId} - ${event.eventType} - Tx Hash ${event.transactionHash}`,
        );
      });

      await this._prismaService.auditRecords(auditResult);
    }

    this.logger.verbose(
      `Blockchain Chronicler: End - ${unauditedRecords.length} records audited`,
    );
  }
}
