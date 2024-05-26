import { Module } from '@nestjs/common';
import { AppController, ProcessDataController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  controllers: [AppController, ProcessDataController],
  imports: [PrismaModule],
  providers: [AppService],
})
export class AppModule {
}
