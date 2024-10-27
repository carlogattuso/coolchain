import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { RecordsModule } from '../records/records.module';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [RecordsModule, BlockchainModule, EventsModule],
  providers: [CronService],
})
export class CronModule {}
