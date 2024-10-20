import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CreateEventDTO } from '../types/dto/CreateEventDTO';
import { BlockchainService } from '../blockchain/blockchain.service';
import { RecordsService } from '../records/records.service';
import { MAX_RECORD_BATCH_SIZE } from '../utils/constants';
import { Record } from '../types/Record';
import { Event } from '../types/Event';

@Injectable()
export class CronService {
  private readonly logger: Logger = new Logger(CronService.name);

  constructor(
    private _recordsService: RecordsService,
    private _blockchainService: BlockchainService,
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async blockchainChronicler() {
    this.logger.verbose('Blockchain Chronicler: Start');

    const unauditedRecords: Record[] =
      await this._recordsService.getUnauditedRecords(MAX_RECORD_BATCH_SIZE);

    if (unauditedRecords.length > 0) {
      this.logger.verbose(
        `Blockchain Chronicler: Records ${unauditedRecords.map((record: Record) => record.id)} under audit`,
      );

      const auditResult: CreateEventDTO[] =
        await this._blockchainService.auditRecords(unauditedRecords);

      auditResult.forEach((event: Event) => {
        this.logger.verbose(
          `Blockchain Chronicler: Record ${event.recordId} - ${event.eventType} - Tx Hash ${event.transactionHash}`,
        );
      });

      await this._recordsService.auditRecords(auditResult);
    }

    this.logger.verbose(
      `Blockchain Chronicler: End - ${unauditedRecords.length} records audited`,
    );
  }
}
