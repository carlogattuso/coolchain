import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { RecordsModule } from '../records/records.module';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
  imports: [RecordsModule, BlockchainModule],
  providers: [CronService],
})
export class CronModule {}
