import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RecordsService } from './records.service';
import { RecordsController } from './records.controller';
import { DevicesModule } from '../devices/devices.module';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
  imports: [PrismaModule, DevicesModule],
  providers: [RecordsService],
  exports: [RecordsService],
  controllers: [RecordsController],
})
export class RecordsModule {}
