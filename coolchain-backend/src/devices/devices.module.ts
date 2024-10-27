import { Module } from '@nestjs/common';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [DevicesService],
  exports: [DevicesService],
  controllers: [DevicesController],
})
export class DevicesModule {}
