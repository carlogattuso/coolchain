import { Module } from '@nestjs/common';
import { AuditorsService } from './auditors.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AuditorsService],
  exports: [AuditorsService],
})
export class AuditorsModule {}
