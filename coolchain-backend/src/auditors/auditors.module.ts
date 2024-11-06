import { Module } from '@nestjs/common';
import { AuditorsService } from './auditors.service';
import { PrismaModule } from '../prisma/prisma.module';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { BullModule } from '@nestjs/bullmq';
import { AuditorsProcessor } from './auditors.processor';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';

@Module({
  imports: [
    PrismaModule,
    BlockchainModule,
    BullModule.registerQueue({
      name: 'auditor-queue',
    }),
    BullBoardModule.forFeature({
      name: 'auditor-queue',
      adapter: BullMQAdapter,
    }),
  ],
  providers: [AuditorsService, AuditorsProcessor],
  exports: [AuditorsService],
})
export class AuditorsModule {}
