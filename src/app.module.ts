import { Module } from '@nestjs/common';
import { AppController, ProcessDataController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [],
  controllers: [AppController, ProcessDataController],
  imports: [PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}
