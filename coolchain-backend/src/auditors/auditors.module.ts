import { Module } from '@nestjs/common';
import { AuditorsService } from './auditors.service';
import { PrismaModule } from '../prisma/prisma.module';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
  imports: [PrismaModule, BlockchainModule],
  providers: [AuditorsService],
  exports: [AuditorsService],
})
export class AuditorsModule {}
