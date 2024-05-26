import { Module } from '@nestjs/common';
import { AppController, ProcessDataController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MoonbeamModule } from './moonBeam/moonbeam.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [AppController, ProcessDataController],
  imports: [PrismaModule, MoonbeamModule, ConfigModule.forRoot({ isGlobal: true,})],
  providers: [AppService],
})
export class AppModule {
}
