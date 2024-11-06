import { Module } from '@nestjs/common';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { PrismaModule } from '../prisma/prisma.module';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { BullModule } from '@nestjs/bullmq';
import { DevicesProcessor } from './devices.processor';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';

@Module({
  imports: [
    PrismaModule,
    BlockchainModule,
    BullModule.registerQueue({
      name: 'devices-queue',
    }),
    BullBoardModule.forFeature({
      name: 'devices-queue',
      adapter: BullMQAdapter,
    }),
  ],
  providers: [DevicesService, DevicesProcessor],
  exports: [DevicesService],
  controllers: [DevicesController],
})
export class DevicesModule {}
