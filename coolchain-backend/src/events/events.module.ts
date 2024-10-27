import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  providers: [EventsService],
  exports: [EventsService],
  imports: [PrismaModule],
})
export class EventsModule {}
