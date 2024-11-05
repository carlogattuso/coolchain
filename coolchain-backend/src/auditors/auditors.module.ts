import { Module } from '@nestjs/common';
import { AuditorsService } from './auditors.service';
import { PrismaModule } from '../prisma/prisma.module';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { BullModule } from '@nestjs/bullmq';
import { AuditorsProcessor } from './auditors.processor';

@Module({
  imports: [
    PrismaModule,
    BlockchainModule,
    BullModule.registerQueue({
      name: 'auditor-queue',
    }),
  ],
  providers: [AuditorsService, AuditorsProcessor],
  exports: [AuditorsService],
})
export class AuditorsModule {}
