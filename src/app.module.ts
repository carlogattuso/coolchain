import { Module } from '@nestjs/common';
import { AppController, ProcessDataController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  controllers: [AppController, ProcessDataController],
  imports: [PrismaModule, ScheduleModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}
