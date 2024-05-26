import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MoonbeamModule } from './moonBeam/moonbeam.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [AppController],
  imports: [PrismaModule, MoonbeamModule, ScheduleModule.forRoot(), ConfigModule.forRoot({ isGlobal: true })],
  providers: [AppService],
})
export class AppModule {
}
