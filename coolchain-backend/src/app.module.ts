import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { BlockchainModule } from './blockchain/blockchain.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { RecordsModule } from './records/records.module';
import { CronModule } from './cron/cron.module';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { DevicesModule } from './devices/devices.module';
import { EventsModule } from './events/events.module';
import { AuditorsModule } from './auditors/auditors.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { AUTH_THROTTLER_LIMIT, AUTH_THROTTLER_TTL } from './utils/constants';
import { BullModule } from '@nestjs/bullmq';

@Module({
  controllers: [AppController],
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: process.env.NODE_ENV ? '.env.dev' : '.env',
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: AUTH_THROTTLER_TTL,
        limit: AUTH_THROTTLER_LIMIT,
      },
    ]),
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
    AuthModule,
    BlockchainModule,
    RecordsModule,
    CronModule,
    PrismaModule,
    DevicesModule,
    EventsModule,
    AuditorsModule,
  ],
  providers: [AppService],
})
export class AppModule {}
